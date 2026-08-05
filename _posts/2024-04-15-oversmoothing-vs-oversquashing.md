---
layout: single
title: "Over-smoothing vs Over-squashing: The Difference"
categories: [gnn]
book: gnn
subsection: expressivity
tags: [oversmoothing, oversquashing, GNN, depth, comparison]
published: true
excerpt: "Oversmoothing and oversquashing are both problems with deep GNNs, but they affect different nodes, have different causes, and require different fixes. Confusing them leads to applying the wrong solution."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 8
permalink: /blog/gnn/oversmoothing-vs-oversquashing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Oversmoothing = forward-pass feature collapse from too much averaging: \(\hat{A}^{K} \to u_1u_1^{\top}\), so nearby nodes become indistinguishable. Oversquashing = information and gradient collapse at bottleneck edges: \(\lVert \partial h_v^{(K)}/\partial x_u \rVert\) is throttled by \((\hat{A}^{K})_{vu}\) for distant \(u\). Both worsen with depth, but in different ways, on different nodes, and they need different fixes.
</div>
{% include figure image_path="/images/blog/gnn/topping2022_oversquashing.png" alt="Oversmoothing vs oversquashing" caption="Over-smoothing vs over-squashing — two distinct failure modes in deep GNNs (Topping et al., 2022)" %}


## Intuition First

Imagine you are in a room full of people whispering a message from person to person. **Oversmoothing** is what happens when everyone repeats the average of all messages they heard — after enough rounds, everyone says the same thing. The content has been diluted to nothing.

**Oversquashing** is different: imagine two distant groups connected by a single corridor (one "bridge" person). All information between the groups must squeeze through that one person. No matter how many rounds of whispering, the bridge person cannot faithfully relay an exponentially growing flood of messages.

Same symptom (performance collapse), completely different causes.

<style>
@keyframes smooth-pulse {
  0%,100% { opacity:1; }
  50%      { opacity:0.4; }
}
@keyframes squash-flow {
  0%   { stroke-dashoffset: 60; }
  100% { stroke-dashoffset: 0; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 560 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:560px;display:block;margin:auto">
  <style>
    .os-node { fill:#6366f1; }
    .os-node-faded { fill:#a5b4fc; animation: smooth-pulse 1.8s ease-in-out infinite; }
    .sq-node { fill:#f97316; }
    .sq-bridge { fill:#ef4444; }
    .edge { stroke:#94a3b8; stroke-width:1.5; fill:none; }
    .label-text { font-size:11px; fill:#334155; font-family:sans-serif; text-anchor:middle; }
    .title-text { font-size:12px; fill:#1e293b; font-family:sans-serif; font-weight:bold; text-anchor:middle; }
    .sq-edge { stroke:#f97316; stroke-width:2; fill:none; stroke-dasharray:8; animation: squash-flow 1.2s linear infinite; }
  </style>
  <!-- OVERSMOOTHING section -->
  <text x="140" y="18" class="title-text">Oversmoothing: features converge</text>
  <circle cx="50"  cy="80" r="14" class="os-node"/>
  <circle cx="100" cy="55" r="14" class="os-node-faded"/>
  <circle cx="140" cy="90" r="14" class="os-node-faded"/>
  <circle cx="185" cy="60" r="14" class="os-node-faded"/>
  <circle cx="225" cy="85" r="14" class="os-node-faded"/>
  <line x1="50" y1="80" x2="100" y2="55" class="edge"/>
  <line x1="100" y1="55" x2="140" y2="90" class="edge"/>
  <line x1="140" y1="90" x2="185" y2="60" class="edge"/>
  <line x1="185" y1="60" x2="225" y2="85" class="edge"/>
  <line x1="50"  y1="80" x2="140" y2="90" class="edge"/>
  <text x="140" y="125" class="label-text">Layer 1 → rich</text>
  <text x="140" y="140" class="label-text">Layer 8 → all identical (faded)</text>
  <!-- divider -->
  <line x1="280" y1="20" x2="280" y2="150" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4"/>
  <!-- OVERSQUASHING section -->
  <text x="420" y="18" class="title-text">Oversquashing: bottleneck edge</text>
  <circle cx="310" cy="75" r="12" class="sq-node"/>
  <circle cx="340" cy="50" r="12" class="sq-node"/>
  <circle cx="340" cy="100" r="12" class="sq-node"/>
  <!-- bridge node -->
  <circle cx="390" cy="75" r="12" class="sq-bridge"/>
  <!-- right cluster -->
  <circle cx="440" cy="50" r="12" class="sq-node"/>
  <circle cx="440" cy="100" r="12" class="sq-node"/>
  <circle cx="470" cy="75" r="12" class="sq-node"/>
  <line x1="310" y1="75" x2="340" y2="50" class="edge"/>
  <line x1="310" y1="75" x2="340" y2="100" class="edge"/>
  <line x1="340" y1="50" x2="340" y2="100" class="edge"/>
  <!-- bridge edge animated -->
  <path d="M 352 75 L 378 75" class="sq-edge"/>
  <line x1="390" y1="75" x2="440" y2="50" class="edge"/>
  <line x1="390" y1="75" x2="440" y2="100" class="edge"/>
  <line x1="440" y1="50" x2="470" y2="75" class="edge"/>
  <line x1="440" y1="100" x2="470" y2="75" class="edge"/>
  <text x="390" y="125" class="label-text">🔴 Bridge = bottleneck</text>
  <text x="390" y="140" class="label-text">Exponential info squashed through 1 edge</text>
</svg>
<figcaption>Left: oversmoothing — node features fade toward a uniform value. Right: oversquashing — all cross-cluster information must traverse the single red bridge node.</figcaption>
</figure></div>

## The Confusion

Both oversmoothing and oversquashing:
- Occur with deep GNNs
- Cause performance degradation
- Involve information loss

They are often mentioned together or confused. But they are fundamentally different phenomena.

## Head-to-Head Comparison

| Property | Oversmoothing | Oversquashing |
|----------|---------------|---------------|
| **Root cause** | Iterated averaging → all embeddings become collinear | Receptive-field growth + bottleneck topology → info bottleneck |
| **Formal statement** | $$\hat{A}^{K} \to u_1u_1^{\top}$$, with $$u_1 \propto \tilde{D}^{1/2}\mathbf{1}$$ | $$\lVert \partial h_v^{(K)}/\partial x_u \rVert \le (cw)^{K}(\hat{A}^{K})_{vu}$$ |
| **Governed by** | Spectral gap $$1 - \mu$$, $$\mu = \max_{i\ge2}\lvert\lambda_i\rvert$$ | Entries of $$\hat{A}^{K}$$; effective resistance $$R(u,v)$$ |
| **Direction** | Forward pass (computation) | Both forward (dilution) and backward (gradient) |
| **Which nodes affected** | All nodes, especially nearby ones | Nodes that are far apart (long paths) |
| **Graph structure** | Worse on dense, well-connected graphs | Worse on tree-like, sparse graphs with bridge edges |
| **With more layers** | Provably gets worse (converges to a rank-one limit) | Could get better (reach distant nodes) but squashing increases |
| **Measure** | Dirichlet energy $$\to 0$$; MAD $$\to 0$$ | Jacobian norm $$\to 0$$ |
| **Spectral view** | Low-pass filter removes high frequencies | Mostly topological (curvature, resistance), though $$\hat{A}^{K}$$ ties the two together |
| **Fix** | Residual connections, jump knowledge, APPNP | Graph rewiring, global attention, virtual nodes |

## When You Have Oversmoothing

You add layers hoping to capture longer-range patterns, but performance peaks at 2-3 layers then drops. Node embeddings in the last layer have near-zero pairwise distances. The model assigns nearly the same embedding to all nodes.

**Symptom:** accuracy peaks at 2-3 layers, then monotonically decreases. MAD scores drop toward zero with depth.

**Fix:** residual connections (GCNII), APPNP, JK-Net (jumping knowledge). Do NOT add more layers — that makes it worse.

## When You Have Oversquashing

You have a task requiring long-range reasoning (e.g., predicting whether two distant atoms in a molecule will react). The model performs well on local structure tasks but fails on long-range ones. Adding more layers doesn't help.

**Symptom:** performance on long-range tasks (e.g., LRGB benchmarks) is poor regardless of depth. Jacobian norms near zero for distant node pairs.

**Fix:** graph rewiring (SDRF, add virtual nodes), global attention (Graph Transformers, GPS). Adding residual connections does NOT fix oversquashing — information still can't reach distant nodes.

## Worked Diagnostic Example

Consider a 4-layer GCN on a path graph: A — B — C — D — E — F — G — H — I — J (10 nodes, so the distance from A to J is 9).

**Oversmoothing check:** track the Mean Average Distance (MAD) between node embeddings at each layer. As depth grows, MAD falls monotonically toward zero — the embeddings collapse onto $$\mathrm{span}(u_1)$$ and all nodes start to look alike. If you need to classify node A differently from node J, the model progressively loses the ability to do so.

**Oversquashing check:** look at the Jacobian $$\partial h_A^{(K)} / \partial x_J$$ — how much does node J's input affect node A's output?

- With $$K = 4$$, node A's receptive field reaches only 4 hops, and $$\mathrm{dist}(A,J) = 9 > 4$$. So $$(\hat{A}^{4})_{AJ} = 0$$ and hence $$\partial h_A^{(4)}/\partial x_J = 0$$ exactly — A literally cannot see J. No training fixes this; it is a statement about the computation graph.
- With $$K = 9$$ the receptive field does reach J, but $$(\hat{A}^{9})_{AJ}$$ is minuscule, so the bound $$\lVert \partial h_A^{(9)}/\partial x_J \rVert \le (cw)^{9}(\hat{A}^{9})_{AJ}$$ is near zero anyway.

A caveat on the second point, because it is a common overstatement: on a *path* the receptive field grows only linearly, not exponentially, and there is exactly one path from A to J. The decay here is not "exponentially many competing paths" — it comes from the random-walk mass spreading out over the whole 9-hop neighbourhood at every step, so that the share arriving from J alone is exponentially small in the distance. The exponential-fan-in story applies to tree-like or expander graphs; the effective-resistance story covers the path case too, and both are instances of the same $$(\hat{A}^{K})_{vu}$$ bound.

Both problems can coexist: you need 9 layers to reach J (depth demand), but 9 layers cause oversmoothing. The fix is not "just add more layers."

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Oversmoothing is measured in the <em>forward pass</em> (do node embeddings converge?). Oversquashing is measured via <em>Jacobians</em> (does a distant node's input influence this node's output?). You can have one without the other: a 2-layer GCN on a bottleneck graph has oversquashing but not oversmoothing.</div>

## A Unified View

Both Li et al. (oversmoothing) and Alon & Yahav (oversquashing) can be read as diagnosing failures of information flow, in different regimes:

```
Short range:  Oversmoothing dominates (too many hops → convergence)
Long range:   Oversquashing dominates (too little mass reaches distant nodes)
```

What makes them genuinely two sides of one coin is that both are statements about the *same* matrix, $$\hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}$$, read in two different ways. Oversmoothing is about the **limit** of its powers,

<div class="formula-box">
\[
\hat{A}^{K} \;\xrightarrow[K \to \infty]{}\; u_1 u_1^{\top}, \qquad u_1 = \frac{\tilde{D}^{1/2}\mathbf{1}}{\lVert \tilde{D}^{1/2}\mathbf{1}\rVert},
\]
</div>

a rank-one collapse controlled by the spectral gap. Oversquashing is about an **individual entry** of the same power, which upper-bounds how much one node can influence another:

<div class="formula-box">
\[
\left\lVert \frac{\partial h_v^{(K)}}{\partial x_u} \right\rVert \;\le\; (cw)^{K} \bigl(\hat{A}^{K}\bigr)_{vu}.
\]
</div>

So one pathology says the powers of $$\hat{A}$$ converge to something uninformative, while the other says specific entries of those powers are too small. Depth pushes on both at once — which is exactly why it cannot resolve either.

They create opposing pressures on depth:
- Oversmoothing says: use FEWER layers
- Task requirements say: use MORE layers (to reach distant nodes)
- Oversquashing says: more layers don't help anyway for bottlenecks

The resolution: **decouple propagation from transformation** (APPNP, SGC) and/or **add global attention** (Graph Transformers, GPS).

<div class="insight-box">
<strong>The practical diagnostic:</strong> Run your GNN on the same task with increasing layers (1, 2, 4, 8, 16). If performance peaks early and then drops: oversmoothing. If performance never improves beyond a ceiling regardless of depth, and tasks require long-range reasoning: oversquashing. If both: you need both architectural and rewiring fixes.
</div>

## Fixes Summary

**Oversmoothing fixes (forward collapse):**
- GCNII: residual connections to initial representation
- JK-Net: concatenate all layer outputs
- APPNP: teleport back to initial features during propagation
- DropEdge: randomly drop edges to reduce averaging
- PairNorm: explicit normalisation to maintain diversity

**Oversquashing fixes (bottleneck communication):**
- SDRF: Ricci flow-based graph rewiring
- Virtual node: global communication node
- Graph Transformers: bypass message passing for long-range
- GPS: combine local MPNN + global attention

**Fixes for both:**
- GPS (General, Powerful, Scalable): local MPNN avoids oversmoothing; global attention bypasses oversquashing

## Summary

| Question | Oversmoothing | Oversquashing |
|----------|---------------|---------------|
| Where does info die? | Nearby (convergence) | At bottleneck edges (long range) |
| When does it hurt? | Dense graphs, many layers | Sparse graphs with bridges, long-range tasks |
| Can more layers help? | Never (makes it worse) | Should, but squashing increases too |
| Key fix | Residuals, less aggregation | Rewiring, global attention |

These two pathologies define the fundamental challenges of deep GNNs. Understanding both — and distinguishing them — is essential for diagnosing GNN failures and choosing appropriate solutions.

## References

- Li, Q., Han, Z., & Wu, X.-M. (2018). [Deeper Insights Into Graph Convolutional Networks for Semi-Supervised Classification](https://arxiv.org/abs/1801.07606). *AAAI 2018* (oversmoothing).
- Alon, U., & Yahav, E. (2021). [On the Bottleneck of Graph Neural Networks and Its Practical Implications](https://arxiv.org/abs/2006.05205). *ICLR 2021* (oversquashing).
- Topping, J., Di Giovanni, F., Chamberlain, B. P., Dong, X., & Bronstein, M. M. (2022). [Understanding over-squashing and Bottlenecks on Graphs via Curvature](https://arxiv.org/abs/2111.14522). *ICLR 2022*.
