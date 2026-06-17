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
read_mins: 4
permalink: /blog/gnn/oversmoothing-vs-oversquashing/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Oversmoothing = forward-pass feature collapse from too much averaging (nearby nodes become identical). Oversquashing = gradient/information collapse at bottleneck edges for long-range communication. Both increase with depth but in different ways, on different nodes, and need different fixes.
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
| **Root cause** | Iterated averaging → all embeddings converge | Exponential neighbourhood growth → info bottleneck |
| **Direction** | Forward pass (computation) | Both forward (dilution) and backward (gradient) |
| **Which nodes affected** | All nodes, especially nearby ones | Nodes that are far apart (long paths) |
| **Graph structure** | Worse on dense, well-connected graphs | Worse on tree-like, sparse graphs with bridge edges |
| **With more layers** | Provably gets worse (converges to constant) | Could get better (reach distant nodes) but squashing increases |
| **Measure** | Dirichlet energy → 0; MAD → 0 | Jacobian ||∂h_v/∂x_u|| → 0 |
| **Spectral view** | Low-pass filter removes high frequencies | Not spectral: it's about topology/curvature |
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

Consider a 4-layer GCN on a path graph: A — B — C — D — E — F — G — H — I — J (10 nodes).

**Oversmoothing check:** Compute Mean Average Distance (MAD) between node embeddings at each layer.
- Layer 1: MAD = 0.82 (distinct features)
- Layer 2: MAD = 0.51
- Layer 4: MAD = 0.09 (nearly uniform)

The embeddings have collapsed — all nodes look alike. If you need to classify node A differently from node J, the model cannot.

**Oversquashing check:** Compute the Jacobian ∂h_A / ∂x_J (how much does node J's input affect node A's output?).
- With 4 layers, A has a 4-hop receptive field, which includes J (distance 9). So ∂h_A / ∂x_J = 0 — A literally cannot see J.
- Even with 9 layers (reaching J), the path A→...→J has exponentially many competing paths that dilute the signal to near-zero.

Both problems can coexist: you need 9 layers to reach J (depth demand), but 9 layers cause oversmoothing. The fix is not "just add more layers."

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Oversmoothing is measured in the <em>forward pass</em> (do node embeddings converge?). Oversquashing is measured via <em>Jacobians</em> (does a distant node's input influence this node's output?). You can have one without the other: a 2-layer GCN on a bottleneck graph has oversquashing but not oversmoothing.</div>

## A Unified View

Li et al. and Alon & Yahak propose viewing both as failures of information flow, but in different regimes:

```
Short range:  Oversmoothing dominates (too many hops → convergence)
Long range:   Oversquashing dominates (too few paths → bottlenecks)
```

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
