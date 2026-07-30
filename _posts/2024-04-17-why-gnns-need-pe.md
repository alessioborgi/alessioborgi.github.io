---
layout: single
title: "Why GNNs Need Positional Encodings"
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [positional-encoding, structural-encoding, symmetry, GNN]
published: true
excerpt: "Message-passing GNNs are permutation-equivariant by design — they cannot assign unique positions to nodes. Without positional encodings, symmetric nodes are indistinguishable. Here is why that matters and how to fix it."
author_profile: true
read_time: true
is_overview: false
icon: "📍"
read_mins: 7
permalink: /blog/gnn/why-gnns-need-pe/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> Message-passing GNNs are permutation-equivariant, and their node representations are refinements of the 1-WL colouring. Two nodes that 1-WL cannot separate get the same embedding, however far apart they sit in the graph. Positional encodings add node-specific structural information computed from the graph — Laplacian eigenvectors, random-walk return profiles, distances to anchors — that message passing alone cannot derive.
</div>
{% include figure image_path="/images/blog/gnn/dwivedi2022_laplacian_pe.png" alt="Why GNNs need positional encodings" caption="Positional encodings as graph structure signals (Dwivedi et al., 2022)" %}


## Intuition First

Imagine reading a sentence where all words are presented as an unordered bag — you lose the crucial information about what comes first, second, last. Transformers solve this with sinusoidal positional encodings that inject a unique "address" for each position.

Graphs face the same problem, but harder: there is no canonical position 1, 2, 3 — the graph has no start or end. Two nodes can have the same local neighborhood structure yet be in fundamentally different global positions. Without positional encodings, a GNN is forced to treat them identically.

<div class="blog-figure"><figure>
<svg viewBox="0 0 460 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:auto">
  <style>
    .pe-node { fill:#6366f1; stroke:#fff; stroke-width:2; }
    .pe-node-hi { fill:#f97316; stroke:#fff; stroke-width:2; }
    .pe-edge { stroke:#94a3b8; stroke-width:1.8; }
    .pe-label { font-size:10px; fill:#1e293b; font-family:sans-serif; text-anchor:middle; }
    .pe-title { font-size:11px; fill:#1e293b; font-family:sans-serif; font-weight:bold; text-anchor:middle; }
  </style>
  <text x="115" y="14" class="pe-title">Without PE: B = D (same embedding)</text>
  <circle cx="40"  cy="70" r="12" class="pe-node"/><text x="40"  y="70" dy="4" class="pe-label" fill="white">A</text>
  <circle cx="90"  cy="70" r="12" class="pe-node-hi"/><text x="90"  y="70" dy="4" class="pe-label" fill="white">B</text>
  <circle cx="140" cy="70" r="12" class="pe-node"/><text x="140" y="70" dy="4" class="pe-label" fill="white">C</text>
  <circle cx="190" cy="70" r="12" class="pe-node-hi"/><text x="190" y="70" dy="4" class="pe-label" fill="white">D</text>
  <circle cx="240" cy="70" r="12" class="pe-node"/><text x="240" y="70" dy="4" class="pe-label" fill="white">E</text>
  <line x1="52" y1="70" x2="78" y2="70" class="pe-edge"/>
  <line x1="102" y1="70" x2="128" y2="70" class="pe-edge"/>
  <line x1="152" y1="70" x2="178" y2="70" class="pe-edge"/>
  <line x1="202" y1="70" x2="228" y2="70" class="pe-edge"/>
  <text x="115" y="105" class="pe-label">B and D: same 1-WL colour at every round → same GNN output</text>
  <text x="115" y="118" class="pe-label">but B is 2nd node from A; D is 4th — different global positions</text>
  <!-- divider -->
  <line x1="270" y1="10" x2="270" y2="125" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="370" y="14" class="pe-title">With PE: B ≠ D (unique identity)</text>
  <circle cx="290" cy="70" r="12" class="pe-node"/><text x="290" y="70" dy="4" class="pe-label" fill="white">A</text>
  <circle cx="335" cy="70" r="12" class="pe-node-hi"/><text x="335" y="70" dy="4" class="pe-label" fill="white">B</text>
  <circle cx="380" cy="70" r="12" class="pe-node"/><text x="380" y="70" dy="4" class="pe-label" fill="white">C</text>
  <circle cx="425" cy="70" r="12" class="pe-node-hi" style="opacity:0.5"/><text x="425" y="70" dy="4" class="pe-label" fill="white">D</text>
  <line x1="302" y1="70" x2="323" y2="70" class="pe-edge"/>
  <line x1="347" y1="70" x2="368" y2="70" class="pe-edge"/>
  <line x1="392" y1="70" x2="413" y2="70" class="pe-edge"/>
  <text x="370" y="105" class="pe-label">Fiedler vector on P₅: B gets +0.37, D gets −0.37</text>
  <text x="370" y="118" class="pe-label">Now the model can separate them</text>
</svg>
<figcaption>Path graph A–B–C–D–E. Message passing gives B and D the same 1-WL colour at every round, so a GNN assigns them the same embedding. The Fiedler vector of \(P_5\) is \(u_2 \approx [0.602,\, 0.372,\, 0,\, -0.372,\, -0.602]\), which separates them — but note it does so only through the <em>sign</em>: \(\lvert u_2(B)\rvert = \lvert u_2(D)\rvert\). B and D are exchanged by the path-reversal automorphism, so any sign-invariant treatment of the eigenvector puts them back together. See the post on sign ambiguity.</figcaption>
</figure></div>

## Permutation Equivariance: A Double-Edged Sword

GNNs are designed to be permutation equivariant: the result of processing a graph should not depend on the arbitrary labelling of nodes. If you permute the node indices, the output node embeddings permute accordingly.

This is a desirable property — the graph has no canonical ordering, so the model should not depend on one.

But it has a sharp consequence. A message-passing GNN's node representations are always a *refinement of the 1-WL colouring*: if 1-WL assigns two nodes the same colour after $$k$$ rounds, no $$k$$-layer MPNN can give them different embeddings. Whatever 1-WL cannot see, message passing cannot see either.

Two distinct things get conflated here, and it is worth separating them:
- **Automorphic nodes.** If some automorphism of the graph maps $$v$$ to $$w$$, then *every* permutation-equivariant function — GNN, Laplacian eigenvector, random-walk profile, anything computed from the graph alone — must assign them the same value. This is not a limitation of message passing; it is a theorem about equivariance, and no positional encoding escapes it.
- **1-WL-equivalent but non-automorphic nodes.** These are merely invisible *to message passing*. A positional encoding computed by other means can separate them, and this is the gap that graph PEs actually fill.

## The Symmetric Node Problem

Consider a path graph: A — B — C — D — E

1-WL colours B and D identically at every round — from either node's perspective the graph looks the same — so no MPNN of any depth separates them. And in this example they are genuinely automorphic (reverse the path), so this is the hard case: nothing equivariant will give them different values, and LapPE separates them only up to the eigenvector's sign.

But B and D may still need different predictions. If A carries a feature that makes "the second node from A" meaningful, the model needs some way to break the tie — which in practice means either a task-specific anchor (distance from A, which is not permutation-invariant by design) or accepting sign information from the eigenvectors.

More extreme: in a regular graph with uniform initial node features, 1-WL never refines past a single colour, so all nodes get the *same* embedding for any depth. (With distinct input features, message passing can of course still tell nodes apart — the collapse is about what structure alone provides.)

## Why Sequences Don't Have This Problem

In a Transformer processing a sentence, position 3 is always "position 3" regardless of the token's content. Positional encodings inject this absolute location.

In graphs, there is no canonical position 3. The graph has no start, no end, no linear order. This is why graph PEs must be derived from the graph structure itself.

## What Positional Encodings Can Provide

A good graph PE $$p_v$$ should:
1. **Separate as much as possible** — ideally distinct values for nodes that are not automorphic (full uniqueness is unattainable, since automorphic nodes must tie)
2. **Vary continuously with structure** — structurally similar nodes get similar encodings, so small perturbations of the graph do not scramble the representation
3. **Be computationally affordable** — no dense $$O(N^3)$$ eigendecomposition
4. **Be well defined** — free of arbitrary choices (sign, basis, anchor selection) that differ between two runs on the same graph
5. **Be transferable** — a PE computed on training graphs should carry the same meaning on test graphs

Points 1 and 2 pull against each other, and point 4 is exactly where Laplacian eigenvectors get into trouble.

## Types of Graph Positional Information

| Type | What it encodes | Example |
|------|----------------|---------|
| **Positional** | Where the node is in the global graph | Laplacian eigenvectors |
| **Structural** | What role the node plays locally | Degree, clustering coefficient, cycle membership |
| **Distance-based** | Distances to other nodes | Random walk landing probabilities |

Positional and structural encodings are complementary — some tasks need absolute position, others need local role information.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Positional and structural encodings answer different questions. "Where is this node in the graph?" (positional — Laplacian eigenvectors) vs "What structural role does this node play?" (structural — RWPE, degree). For molecule property prediction, you usually want structural (is this atom in a ring?). For tracking specific atoms across a simulation, you want positional (which atom is this?). Use both when in doubt — GPS does exactly this.</div>

## Impact on Graph Transformers

For Graph Transformers (which lack the inductive structural bias of message passing), positional encodings are essential. Without them, the Transformer has no information about which nodes are connected — it processes a set of feature vectors with no graph structure at all.

With Laplacian eigenvector PEs: the model can compute attention scores that reflect graph distance. With random walk PEs: the model can identify structurally similar nodes. Graph PEs are to Graph Transformers what sinusoidal encodings are to sequence Transformers.

## Summary

| Without PEs | With PEs |
|------------|---------|
| 1-WL-equivalent nodes are indistinguishable | Nodes get a structural fingerprint that message passing cannot derive |
| Regular graph + uniform features: all nodes identical | Eigenvector and random-walk PEs separate many such nodes |
| Graph Transformer ignores structure entirely | Structure enters via node PEs and pairwise attention biases |
| Bounded by 1-WL | Can exceed 1-WL — though automorphic nodes still tie, for any equivariant encoding |

The next posts cover specific PE methods: Laplacian eigenvectors, random walk PEs, shortest-path encodings, and the challenges they introduce.

## References

- Dwivedi, V. P., Lim, A. T., Beaini, D., & Lió, P. (2021). [Graph Neural Networks with Learnable Structural and Positional Representations](https://arxiv.org/abs/2110.07875). *ICLR 2022*.
- Srinivasan, B., & Ribeiro, B. (2020). [On the Equivalence between Positional Node Embeddings and Structural Graph Representations](https://arxiv.org/abs/1910.00452). *ICLR 2020*.
