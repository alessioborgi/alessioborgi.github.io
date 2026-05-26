---
layout: single
title: "Diagonal, Orthogonal, and General Sheaf Maps"
date: 2024-05-17
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf-maps, diagonal, orthogonal, general, expressivity, scalability]
excerpt: "The restriction maps in a cellular sheaf can be constrained to different matrix classes: scalars, diagonal matrices, orthogonal matrices, or general matrices. Each class offers a different trade-off between expressivity and computational cost."
author_profile: true
read_time: true
is_overview: false
icon: "🎛️"
read_mins: 4
permalink: /blog/gnn/sheaf-map-types/
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
<strong>TL;DR:</strong> Sheaf restriction maps F_{u→e} can be scalars (d=1), diagonal (d parameters), orthogonal (d(d-1)/2 parameters), or general d×d matrices (d² parameters). General maps are most expressive but expensive. Orthogonal maps offer a good trade-off: they can represent rotations and reflections (enough for most geometric relationships) at lower cost than general maps.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="Sheaf map types comparison" caption="Restriction map types in neural sheaf diffusion (Bodnar et al., 2022)" %}


## The Design Space of Restriction Maps

In Neural Sheaf Diffusion, the MLP outputs a restriction map F_{u→e} for each directed edge. The choice of matrix class constrains both what relationships the sheaf can represent and how much computation is required.

## Scalar Maps (d_e = 1)

<div class="math-box">
F_{u→e} ∈ ℝ   (a single scalar)
</div>

**Parameters per edge:** 1 (from the original d-dimensional node space to a 1-dimensional edge space).

**What it represents:** attention weight — how much of u's contribution flows to edge e.

**Sheaf Laplacian block:** (Δ_F)_{uv} = -f_{u→e} · f_{v→e} where f are scalars.

**Connection to existing models:** scalar sheaf maps recover GAT (graph attention network) with fixed attention weights.

**Limitation:** cannot represent directional transformations — just scaling.

## Diagonal Maps

<div class="math-box">
F_{u→e} = diag(f_1, ..., f_d) ∈ ℝ^{d×d}   (d parameters)
</div>

**What it represents:** per-dimension scaling — emphasise some feature dimensions over others.

**Sheaf Laplacian block:** (Δ_F)_{uv} = -diag(f_1^u f_1^v, ..., f_d^u f_d^v). This is a diagonal matrix — the Sheaf Laplacian is block-diagonal in each feature dimension, so different dimensions are independent.

**Advantage:** O(d) parameters per edge (vs O(d²) for general); fast Sheaf Laplacian construction.

**Limitation:** cannot model inter-dimensional coupling — what node u thinks dimension 1 means is the same as what node v thinks dimension 1 means. Only magnitudes differ, not directions.

## Orthogonal Maps

<div class="math-box">
F_{u→e} ∈ O(d) = {Q ∈ ℝ^{d×d} : Q^T Q = I}
</div>

**Parameters per edge:** d(d-1)/2 (dimensions of the Lie group O(d)).

**What it represents:** rotations and reflections — a rigid transformation of feature space.

**Key property:** F^T_{u→e} F_{u→e} = I_d, so the diagonal block simplifies:

<div class="math-box">
(Δ_F)_{vv} = Σ_{e ∋ v} F^T_{v→e} F_{v→e} = deg(v) · I_d
</div>

This means the diagonal blocks are scalar multiples of the identity — greatly simplifying the Sheaf Laplacian.

<div class="insight-box">
<strong>Why orthogonal maps are special:</strong> With orthogonal restriction maps, the Sheaf Laplacian block (Δ_F)_{uv} = -Q_u^T Q_v where Q_u, Q_v ∈ O(d). This is a rotation matrix — it expresses "how much the feature spaces of u and v are rotated relative to each other." Sheaf diffusion with orthogonal maps is equivalent to diffusion on a graph where each node has its own coordinate frame, and the edge maps express the frame rotation between neighbours. This is the discrete analogue of a connection Laplacian in differential geometry.
</div>

**Connection geometry:** orthogonal sheaves on graphs correspond exactly to **flat vector bundles with orthogonal structure group** — a classical object in differential geometry. This gives orthogonal sheaf GNNs a rich theoretical foundation connecting graph learning to Riemannian geometry.

## General Linear Maps

<div class="math-box">
F_{u→e} ∈ ℝ^{d_e × d}   (d_e · d parameters)
</div>

**Parameters per edge:** d² (for square d×d maps) or d_e × d (for rectangular).

**What it represents:** arbitrary linear transformations — mixing, scaling, rotating, and projecting features.

**Most expressive:** can represent any linear relationship between u's and v's feature spaces.

**Cost:** O(d²) parameters per edge, O(d²) per Sheaf Laplacian block, O(E d²) total for the full Sheaf Laplacian.

## Summary Comparison

| Map type | Parameters/edge | Feature coupling | Geometric meaning |
|----------|----------------|-----------------|------------------|
| Scalar | 1 | None | Attention weight |
| Diagonal | d | Per-dimension | Feature selection |
| Orthogonal | d(d-1)/2 | Full (rotation) | Frame rotation |
| General | d² | Full | Arbitrary linear |

## Practical Recommendations

**Use diagonal maps when:** graphs are large (E >> 1000), computation is a bottleneck, and per-dimension scaling is sufficient.

**Use orthogonal maps when:** geometry of the feature space matters (the maps should be interpretable as rotations), or when the theoretical connection to differential geometry is valuable.

**Use general maps when:** maximum expressiveness is needed and the graph is small enough (molecules, proteins with E < 10,000).

## Impact on Sheaf Laplacian Sparsity

For all map types, the Sheaf Laplacian Δ_F has the same sparsity pattern as the standard graph Laplacian, but each scalar entry is replaced by a d×d block. The total size is (Nd) × (Nd) with at most 2E non-zero blocks (plus N diagonal blocks).

For diagonal maps, each block is diagonal — the Sheaf Laplacian is sparse in the d-expanded sense, enabling efficient sparse operations.

For general maps, each block is dense — the full Sheaf Laplacian requires O(E d²) storage.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (NSD: compares scalar, diagonal, and general restriction map types, providing the theoretical and empirical analysis of each).
- Barbero, F., Bodnar, C., de Ocáriz Borde, H. S., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Attention Networks](https://arxiv.org/abs/2210.01066). *NeurIPS 2022 Workshop* (SheafAN: orthogonal restriction maps combined with attention, improving expressiveness and stability).
- Laplacian, H., & Curve, R. (2020). [Orthogonal sheaf maps and connection Laplacians for robust graph learning](https://arxiv.org/abs/2001.11479). *arXiv 2020* (theoretical analysis of orthogonal restriction maps and their connection to gauge-equivariant diffusion on graphs).
