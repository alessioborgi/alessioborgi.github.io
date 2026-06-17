---
layout: single
title: "Laplacian Eigenvectors as Graph Positional Encodings"
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [Laplacian, eigenvectors, positional-encoding, LapPE, graph-transformer]
published: true
excerpt: "The k smallest eigenvectors of the graph Laplacian form a natural positional embedding space — the graph's own coordinate system. They capture global structure, symmetry, and community membership."
author_profile: true
read_time: true
is_overview: false
icon: "🧮"
read_mins: 5
permalink: /blog/gnn/laplacian-pe/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> The k smallest eigenvectors of the graph Laplacian form a k-dimensional coordinate system where distance in embedding space approximates graph distance. Nodes with similar structural positions get similar Laplacian PE vectors. This is the most theoretically grounded graph PE — but sign ambiguity requires careful handling.
</div>
{% include figure image_path="/images/blog/gnn/dwivedi2022_laplacian_pe.png" alt="Laplacian eigenvector PE" caption="Laplacian eigenvector positional encodings (Dwivedi et al., 2022)" %}


## Intuition First

Imagine stretching a rubber graph flat on a table so that connected nodes end up close together and disconnected nodes end up far apart. The optimal 1D layout (minimising edge lengths) is exactly the Fiedler vector u₂. The optimal 2D layout is (u₂, u₃). These eigenvectors give the graph its natural coordinate system.

Nodes with similar graph positions get similar Laplacian PE vectors — not because we designed it that way, but because the eigenvectors mathematically encode the graph's geometry.

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto">
  <style>
    .lpe-node { stroke:#fff; stroke-width:2; }
    .lpe-edge { stroke:#94a3b8; stroke-width:1.5; }
    .lpe-text { font-size:9px; font-family:sans-serif; text-anchor:middle; fill:#1e293b; }
    .lpe-title { font-size:11px; font-family:sans-serif; font-weight:bold; text-anchor:middle; fill:#1e293b; }
    .lpe-bar { height:8px; rx:2; }
  </style>
  <!-- Graph: two communities connected by bridge -->
  <text x="130" y="13" class="lpe-title">Graph with two communities</text>
  <circle cx="50"  cy="60" r="11" class="lpe-node" fill="#6366f1"/>
  <circle cx="90"  cy="40" r="11" class="lpe-node" fill="#6366f1"/>
  <circle cx="130" cy="60" r="11" class="lpe-node" fill="#818cf8"/>
  <circle cx="90"  cy="80" r="11" class="lpe-node" fill="#6366f1"/>
  <line x1="50" y1="60" x2="90" y2="40" class="lpe-edge"/>
  <line x1="90" y1="40" x2="130" y2="60" class="lpe-edge"/>
  <line x1="130" y1="60" x2="90" y2="80" class="lpe-edge"/>
  <line x1="90"  y1="80" x2="50" y2="60" class="lpe-edge"/>
  <line x1="50"  y1="60" x2="90" y2="40" class="lpe-edge"/>
  <line x1="130" y1="60" x2="170" y2="60" class="lpe-edge" stroke-dasharray="3"/>
  <circle cx="170" cy="60" r="11" class="lpe-node" fill="#f97316"/>
  <circle cx="210" cy="40" r="11" class="lpe-node" fill="#ea580c"/>
  <circle cx="250" cy="60" r="11" class="lpe-node" fill="#ea580c"/>
  <circle cx="210" cy="80" r="11" class="lpe-node" fill="#ea580c"/>
  <line x1="170" y1="60" x2="210" y2="40" class="lpe-edge"/>
  <line x1="210" y1="40" x2="250" y2="60" class="lpe-edge"/>
  <line x1="250" y1="60" x2="210" y2="80" class="lpe-edge"/>
  <line x1="210" y1="80" x2="170" y2="60" class="lpe-edge"/>
  <text x="50"  y="100" class="lpe-text">u₂ ≈ −0.4</text>
  <text x="90"  y="100" class="lpe-text">u₂ ≈ −0.4</text>
  <text x="130" y="100" class="lpe-text">u₂ ≈ −0.1</text>
  <text x="170" y="100" class="lpe-text">u₂ ≈ +0.1</text>
  <text x="210" y="100" class="lpe-text">u₂ ≈ +0.4</text>
  <text x="250" y="100" class="lpe-text">u₂ ≈ +0.4</text>
  <!-- divider -->
  <line x1="280" y1="10" x2="280" y2="125" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3"/>
  <!-- 1D layout -->
  <text x="390" y="13" class="lpe-title">Fiedler vector = 1D graph layout</text>
  <line x1="300" y1="70" x2="490" y2="70" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="308" cy="70" r="9" class="lpe-node" fill="#6366f1"/>
  <circle cx="323" cy="70" r="9" class="lpe-node" fill="#6366f1"/>
  <circle cx="348" cy="70" r="9" class="lpe-node" fill="#818cf8"/>
  <circle cx="393" cy="70" r="9" class="lpe-node" fill="#f97316"/>
  <circle cx="448" cy="70" r="9" class="lpe-node" fill="#ea580c"/>
  <circle cx="463" cy="70" r="9" class="lpe-node" fill="#ea580c"/>
  <text x="310" y="92" class="lpe-text">−0.4</text>
  <text x="348" y="92" class="lpe-text">−0.1</text>
  <text x="393" y="92" class="lpe-text">+0.1</text>
  <text x="455" y="92" class="lpe-text">+0.4</text>
  <text x="390" y="115" class="lpe-text">Community 1 (purple) ←→ Community 2 (orange)</text>
</svg>
<figcaption>The Fiedler vector u₂ splits the graph at its biggest structural gap. Purple community gets negative values; orange community gets positive values. The bridge node (light purple/orange) sits near zero — it truly is "in between."</figcaption>
</figure></div>

## The Graph Laplacian Eigen-Embedding

The graph Laplacian L = D − A (or its normalised form) has eigendecomposition:

<div class="math-box">
L = U Λ Uᵀ,   λ₁ ≤ λ₂ ≤ ... ≤ λₙ
</div>

The **Laplacian Positional Encoding (LapPE)** for node v is its row in the matrix U restricted to the first k eigenvectors:

<div class="math-box">
pe_v = [u₂(v), u₃(v), ..., u_{k+1}(v)] ∈ ℝᵏ
</div>

(We skip u₁ = 1/√N, the constant eigenvector, as it carries no positional information.)

## Why Eigenvectors Encode Position

The key property: **eigenvectors minimise the Laplacian quadratic form subject to orthogonality**. The first non-trivial eigenvector u₂ (the Fiedler vector) is the smoothest non-constant signal on the graph — it varies as slowly as possible across edges.

Concretely:
- u₂ splits the graph at the largest "gap" — values are negative on one side, positive on the other. It approximates a 1D embedding of the graph along its longest axis.
- u₃ gives the second most orthogonal smooth direction
- Together, u₂ and u₃ embed the graph in 2D, capturing its global shape

Nodes close in the graph (short geodesic distance) tend to have similar eigenvector values. The k-dimensional LapPE approximates the metric structure of the graph.

## Algebraic and Spectral Graph Theory Connection

The commute time distance between nodes i and j (expected random walk steps to travel from i to j and back) is:

<div class="math-box">
CT(i,j) = Vol(G) · ||e_i − e_j||²_L⁺   ≈ Σₖ (uₖ(i) − uₖ(j))² / λₖ
</div>

Where L⁺ is the pseudoinverse of L. This is essentially the squared distance in the space spanned by eigenvectors weighted by 1/λₖ.

LapPE (without the 1/λₖ weighting) approximates this — nearby nodes in the graph get similar PE vectors.

## Sign Ambiguity

A critical problem: if u is an eigenvector of L, so is -u. Eigenvectors are only defined up to sign (and up to rotation within eigenspaces of multiplicity > 1).

This means: if you run the eigenvector computation on the same graph twice, you may get u₂ one time and -u₂ the next. For nodes in two different graphs, the sign convention is arbitrary — you cannot compare PEs across graphs.

**Solutions:**
- **Random sign flipping during training:** at each training step, randomly flip the sign of each eigenvector. This teaches the model to be sign-invariant.
- **SignNet (Lim et al., 2022):** use a sign-invariant function (e.g., f(u) + f(-u)) to process eigenvectors before using them as PEs.
- **BasisNet:** handles rotation ambiguity in higher-dimensional eigenspaces.

## LapPE in Graph Transformers

LapPE is used in:
- **SAN (2021):** full Laplacian spectrum as PE
- **Graphormer:** adds degree centrality (not LapPE, but related)
- **GPS (2022):** LapPE or RWPE as PE, fed into Transformer attention

Typical usage: concatenate pe_v to node features x_v, or add them as a separate encoding:

<div class="math-box">
h_v = Linear(x_v) + Linear(pe_v)
</div>

## Computational Cost

Computing k eigenvectors of an N×N Laplacian:
- **Dense:** O(N³) — infeasible for large graphs
- **Sparse Lanczos/LOBPCG:** O(k · |E|) per iteration, O(k · |E| · T) total — feasible for moderate N

For large graphs (N > 100,000), LapPE becomes expensive. Random walk PEs (next post) are a cheaper alternative.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The Fiedler vector u₂ is the graph's "principal axis" — it places nodes along the dimension of maximum structural variation. Think of it like PCA for the graph's topology: the first component captures the biggest split (communities), the second captures the next biggest, etc. This is why LapPE works so well for community-structured graphs and poorly for graphs where global position is meaningless (random Erdos-Renyi graphs).</div>

## Worked Numerical Example

Consider the path graph P₄: nodes {1, 2, 3, 4} with edges {1–2, 2–3, 3–4}.

The graph Laplacian is:
```
L = D - A =
[ 1  -1   0   0 ]
[-1   2  -1   0 ]
[ 0  -1   2  -1 ]
[ 0   0  -1   1 ]
```

Eigenvalues: λ₁=0, λ₂≈0.586, λ₃=2, λ₄≈3.414

Fiedler vector (u₂): approximately [−0.600, −0.371, +0.371, +0.600]

This assigns node 1 a negative value (one end), node 4 a positive value (other end), and nodes 2 and 3 intermediate values — perfectly encoding the linear order of the path. A 2-layer GCN with these PE values can now distinguish nodes 1 from 4, and 2 from 3.

## What LapPE Can Distinguish

LapPE can distinguish nodes that 1-WL cannot: two nodes in the same regular graph (all same neighbourhood multisets) will have different eigenvector values if their global positions differ.

LapPE makes GNNs strictly more expressive than 1-WL — at the cost of a precomputation step and sign ambiguity handling.

## Summary

| Property | LapPE |
|----------|-------|
| Basis | k smallest non-trivial Laplacian eigenvectors |
| Captures | Global position, community structure, graph geometry |
| Metric | Approximates commute time distance |
| Sign issue | ±1 ambiguity per eigenvector; requires SignNet or random flipping |
| Cost | O(k·|E|·T) with sparse solver |
| Expressiveness | Strictly beyond 1-WL |
| Used by | SAN, GPS, many Graph Transformer papers |

LapPE is the gold standard for graph positional encodings when global structural position matters and computational cost is manageable.

## References

- Belkin, M., & Niyogi, P. (2003). [Laplacian Eigenmaps for Dimensionality Reduction and Data Representation](https://www2.imm.dtu.dk/projects/manifold/Papers/Laplacian.pdf). *Neural Computation*.
- Dwivedi, V. P., Lim, A. T., Beaini, D., & Lió, P. (2021). [Graph Neural Networks with Learnable Structural and Positional Representations](https://arxiv.org/abs/2110.07875). *ICLR 2022*.
- Kreuzer, D., Beaini, D., Hamilton, W. L., Létourneau, V., & Tossou, P. (2021). [Rethinking Graph Transformers with Spectral Attention](https://arxiv.org/abs/2106.03893). *NeurIPS 2021* (SAN).
