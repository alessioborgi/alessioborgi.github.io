---
layout: single
title: "Laplacian Eigenvectors as Graph Positional Encodings"
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [Laplacian, eigenvectors, positional-encoding, LapPE, graph-transformer]
published: false
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
