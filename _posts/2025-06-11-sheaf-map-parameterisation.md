---
layout: single
title: "Learning Sheaf Maps: Parameterisation Strategies Compared"
date: 2025-06-11
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [restriction-map, parameterisation, scalar, diagonal, orthogonal, general, expressiveness]
excerpt: "The choice of restriction map type — scalar, diagonal, orthogonal, or general — is the most consequential hyperparameter in a sheaf GNN. Each type trades off expressiveness, parameter count, computational cost, and geometric interpretation. This post gives a complete comparison to guide practical architecture decisions."
author_profile: true
read_time: true
is_overview: false
icon: "🔧"
read_mins: 6
permalink: /blog/sheaf/sheaf-map-parameterisation/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Four main restriction map types: (1) scalar (1 param/map — recovers signed attention), (2) diagonal (d params/map — feature-wise scaling, best cost-accuracy tradeoff), (3) orthogonal (d(d-1)/2 params/map — gauge-equivariant, no scaling), (4) general (d² params/map — most expressive, prone to overfitting). The Sheaf Laplacian's block structure changes qualitatively with each choice, affecting null space dimension, spectral gap, and what relational patterns the model can represent.
</div>

## The Core Choice

Every sheaf GNN requires a decision: what is the allowed form of the restriction maps F_{v▷e} : ℝ^d → ℝ^d?

This single choice determines:
- The number of parameters per edge
- The expressiveness of the relational geometry
- Whether the model has gauge symmetry
- The structure of the Sheaf Laplacian's null space
- Computational cost of map learning and Laplacian construction

## Type 1: Scalar Maps (d=1 effective)

**Form:** F_{v▷e} = s_{v▷e} · I where s_{v▷e} ∈ ℝ is a scalar.

**Parameters per edge:** 2 scalars (one per endpoint).

**Sheaf Laplacian blocks:**
<div class="math-box">
[Δ_F]_{uv} = −s_{u▷e} · s_{v▷e} · I ∈ ℝ^{d×d}
</div>

(scalar multiple of identity — the Sheaf Laplacian is a scalar-weighted graph Laplacian tensor-product with I_d).

**Null space:** Same dimension as standard graph Laplacian null space × d. Global sections = constant-per-component functions, same as GCN.

**Expressive power:** Equivalent to a signed graph Laplacian — can represent positive (same-class, homophily) or negative (different-class, heterophily) edges, but with identity relational geometry.

**Relation to prior work:** Scalar sheaves are exactly the **signed graph Laplacians** used in SSGC (Zhu et al., 2021). FAGCN's signed attention (a_{uv} ∈ [−1, +1]) is a soft scalar sheaf.

**When to use:** When computational cost is paramount, or as a baseline to test whether sheaf structure (beyond signs) is needed.

## Type 2: Diagonal Maps

**Form:** F_{v▷e} = diag(f₁_{v▷e}, ..., f_d_{v▷e}) where f_k ∈ ℝ.

**Parameters per edge:** 2d scalars.

**Sheaf Laplacian blocks:**
<div class="math-box">
[Δ_F]_{uv} = −diag(f₁_{u▷e}f₁_{v▷e}, ..., f_d_{u▷e}f_d_{v▷e})
</div>

A diagonal matrix — each feature dimension has its own independent signed weight.

**Null space:** Can be larger than standard Laplacian null space. Each feature dimension has its own scalar sheaf; the overall null space is the intersection of d independent scalar sheaf null spaces.

**Expressive power:** Can represent d independent signed weights per edge — different channels can be treated as homophilic (positive weight) or heterophilic (negative weight). This decouples the heterophily handling per feature dimension.

**When to use:** The recommended default for most tasks. Provides the best accuracy-vs-cost tradeoff in NSD experiments.

**MLP output:** The sheaf predictor MLP outputs a 2d-dimensional vector per edge (d values for each endpoint's diagonal entries).

## Type 3: Orthogonal Maps

**Form:** F_{v▷e} = O_{v▷e} ∈ O(d) (orthogonal matrix, OO^T = I, det O = ±1).

**Parameters per edge:** 2·d(d−1)/2 = d(d−1) angles (each O_{v▷e} parameterised by d(d−1)/2 Cayley/Givens parameters).

**Sheaf Laplacian blocks:**
<div class="math-box">
[Δ_F]_{uv} = −O_{u▷e}ᵀ O_{v▷e} ∈ O(d)
</div>

The off-diagonal block is an orthogonal matrix — this is the Connection Laplacian.

**Null space:** Global sections are parallel-transported signals — signals consistent with the connection. For a flat connection (trivial holonomy), dim ker = d. For non-flat connections, dim ker can be lower.

**Expressive power:** Can represent arbitrary rotations between adjacent nodes (but no scaling). This is the natural choice for geometric data where relative orientations matter.

**Gauge equivariance:** Yes — the Connection Laplacian is O(d)-gauge-equivariant by construction. Equivariant sheaf GNNs require orthogonal maps.

**When to use:** Geometric data (molecules, point clouds), synchronisation tasks, when gauge equivariance is required.

**Key limitation:** Cannot scale features — ||O_{v▷e} x|| = ||x||. If feature magnitude carries task-relevant information, orthogonal maps discard it.

## Type 4: General Linear Maps

**Form:** F_{v▷e} ∈ ℝ^{d×d} (no constraint).

**Parameters per edge:** 2d² scalars.

**Sheaf Laplacian blocks:**
<div class="math-box">
[Δ_F]_{uv} = −F_{u▷e}ᵀ F_{v▷e} ∈ ℝ^{d×d}  (general matrix)
</div>

**Null space:** The null space is the intersection of d² linear constraints — highly task-dependent. Can be very large (if many maps share common null vectors) or trivial.

**Expressive power:** Maximum — can represent any linear relational structure between adjacent nodes. Subsumes scalar, diagonal, and orthogonal maps as special cases.

**Risk:** With d² parameters per map, general maps have high capacity and can overfit on small graphs. The Sheaf Laplacian may become nearly rank-deficient if the maps degenerate.

**Regularisation:** L2 regularisation on map norms, or constraining the maps to be near-orthogonal, helps prevent degeneracy.

**When to use:** Large graphs with abundant training data; tasks with complex relational structure that cannot be captured by simpler map types.

## Symmetric Maps: A Useful Intermediate

**Form:** F_{v▷e} = Fᵀ_{v▷e} ∈ S(d) (symmetric matrix).

**Parameters per edge:** 2·d(d+1)/2 = d(d+1) per edge.

**Property:** The Sheaf Laplacian blocks [Δ_F]_{uv} = −F_{u▷e}ᵀ F_{v▷e} are symmetric (since F is symmetric and the product of symmetric matrices is symmetric iff they commute — but this is approximately true if maps are near-diagonal).

**When to use:** When the relational geometry is undirected (the map from u to e is "the same" as from e to u in some sense). Fewer parameters than general, more expressive than diagonal.

## Comparison Table

| Map type | Params/edge | Laplacian block | Gauge equiv | Scaling | Heterophily |
|---|---|---|---|---|---|
| Scalar | 2 | Scalar × I | No | Yes | Via sign |
| Diagonal | 2d | Diagonal matrix | No | Yes | Per-channel sign |
| Orthogonal | d(d−1) | Orthogonal matrix | Yes | No | Via rotation |
| Symmetric | d(d+1) | Symmetric matrix | No | Yes | Via eigenvalue |
| General | 2d² | Arbitrary matrix | No | Yes | Maximum |

## Impact on Null Space Dimension

The null space dimension dim(H⁰) = dim ker(Δ_F) determines the long-time attractor of sheaf diffusion — what information is preserved at large depth.

| Map type | dim H⁰ (connected graph, generic maps) |
|---|---|
| Identity (GCN) | d (constant functions) |
| Scalar | d (scalar sheaf → same as identity) |
| Diagonal | ≥ d (depends on sign pattern) |
| Orthogonal (flat) | d (parallel-transported sections) |
| Orthogonal (non-flat) | < d |
| General | ≥ 0 (depends on learned maps) |

The key insight: NSD with general or diagonal maps can learn maps that increase dim(H⁰) beyond d — the model adapts its oversmoothing attractor to the task.

## Practical Recommendations

1. **Start with diagonal maps** — they work well empirically, have few parameters, and are interpretable.
2. **Use orthogonal maps** when gauge equivariance is needed or the data has a natural geometric interpretation.
3. **Use general maps** only with sufficient training data (>1k nodes per class) and appropriate regularisation.
4. **Never use scalar maps** unless the goal is to test whether sheaf structure beyond signs is beneficial.
5. **Stalk dimension d=2 or d=3** usually suffices — increasing d beyond 5 rarely helps and increases cost.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (ablation over map types: general, diagonal, orthogonal, symmetric).
- Barbero, F., Bodnar, C., de Ocáriz Borde, H. S., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Attention Networks](https://arxiv.org/abs/2210.01066). *NeurIPS 2022 Workshop* (orthogonal maps with attention — gauge-equivariant architecture).
- Singer, A. (2011). [Angular Synchronisation by Eigenvectors and Semidefinite Programming](https://arxiv.org/abs/0911.3448). *Applied and Computational Harmonic Analysis* (orthogonal maps as connection Laplacian — motivates the orthogonal parameterisation).
