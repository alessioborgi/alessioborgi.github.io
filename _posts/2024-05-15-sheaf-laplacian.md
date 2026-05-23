---
layout: single
title: "The Sheaf Laplacian: Spectral Theory for Sheaves"
date: 2024-05-15
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf-laplacian, spectral, coboundary, Dirichlet-energy, diffusion]
excerpt: "The Sheaf Laplacian generalises the graph Laplacian by incorporating per-edge restriction maps. Its spectrum reveals how consistent data is under the sheaf. Sheaf diffusion with this Laplacian generalises GCN to handle heterophilic graphs."
author_profile: true
read_time: true
is_overview: false
icon: "📐"
read_mins: 4
permalink: /blog/gnn/sheaf-laplacian/
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
<strong>TL;DR:</strong> The Sheaf Laplacian Δ_F = δ₀^T δ₀ is a block matrix built from the restriction maps of a sheaf. Each (u,v) off-diagonal block is -F_{u→e}^T F_{v→e}. It is positive semi-definite, its null space is the global sections, and sheaf diffusion H ← (I - Δ_F) H generalises GCN to accommodate feature transformations at edges.
</div>

## Constructing the Sheaf Laplacian

Given a cellular sheaf F on graph G with coboundary map δ₀, the **Sheaf Laplacian** is:

<div class="math-box">
Δ_F = δ₀^T δ₀
</div>

This is a positive semi-definite matrix (since x^T Δ_F x = ||δ₀ x||² ≥ 0 for all x).

**Block structure:** Δ_F is a block matrix indexed by nodes. For a graph with N nodes each having stalk ℝ^d, Δ_F ∈ ℝ^{Nd × Nd}. The blocks are:

**Diagonal block** for node v:
<div class="math-box">
(Δ_F)_{vv} = Σ_{e ∋ v} F_{v→e}^T F_{v→e}
</div>

**Off-diagonal block** for edge e = (u,v):
<div class="math-box">
(Δ_F)_{uv} = -F_{u→e}^T F_{v→e}
(Δ_F)_{vu} = -F_{v→e}^T F_{u→e}
</div>

## Connection to the Standard Graph Laplacian

For the trivial sheaf (all F_{v→e} = I_d):

- Diagonal block: (Δ_F)_{vv} = deg(v) · I_d
- Off-diagonal block: (Δ_F)_{uv} = -I_d

This is exactly L ⊗ I_d = the Kronecker product of the standard graph Laplacian L with the identity — the multi-feature graph Laplacian. So the trivial sheaf recovers standard GCN.

Non-trivial restriction maps "twist" the off-diagonal blocks, changing how features from different nodes interact.

## The Sheaf Dirichlet Energy

The quadratic form:

<div class="math-box">
E_F(x) = x^T Δ_F x = ||δ₀ x||² = Σ_{e=(u,v)} ||F_{v→e} x_v - F_{u→e} x_u||²
</div>

measures the total **sheaf disagreement** over the graph — how much the restriction maps disagree across all edges when applied to signal x.

- E_F(x) = 0 ↔ x is a global section (perfect consistency)
- E_F(x) is large ↔ x has large disagreement at many edges

**Spectral view:** eigenvectors of Δ_F with small eigenvalues correspond to signals with low sheaf Dirichlet energy — near-consistent signals. Diffusion with Δ_F drives signals toward global sections (null space of Δ_F).

<div class="insight-box">
<strong>The key difference from standard Laplacian:</strong> Standard graph Laplacian minimises Σ ||x_u - x_v||² — it pushes adjacent nodes to have equal features. Sheaf Laplacian minimises Σ ||F_{v→e} x_v - F_{u→e} x_u||² — it pushes adjacent nodes to have features that agree after transformation. With identity maps, this reduces to equality. With learned maps, this allows adjacent nodes to remain different while satisfying a structural relationship — exactly what heterophilic graphs need.
</div>

## Sheaf Diffusion

The heat equation on the sheaf:

<div class="math-box">
dX/dt = -Δ_F X
</div>

Discretising with Euler step:

<div class="math-box">
X^{(k+1)} = (I - Δ_F) X^{(k)}
</div>

This is **sheaf diffusion** — the generalisation of GCN to sheaves. At each step, each node's features are updated using the sheaf-weighted contributions of its neighbours.

For the normalised version, define the normalised Sheaf Laplacian:

<div class="math-box">
Δ_F^{norm} = D^{-1/2} Δ_F D^{-1/2}
</div>

Where D is the block-diagonal of Δ_F. The normalised diffusion H ← (I - Δ_F^{norm}) H is analogous to normalised GCN (Â = D^{-1/2} A D^{-1/2}).

## Spectral Properties

**Null space:** Δ_F x = 0 ↔ δ₀ x = 0 ↔ x is a global section. The dimension of the null space (= number of zero eigenvalues) equals the number of linearly independent global sections.

For the trivial sheaf on a connected graph: null space has dimension d (one d-dimensional constant vector per component) — same as the standard graph Laplacian.

For a non-trivial sheaf: the null space can be larger or smaller. If the sheaf is "inconsistent" (no global sections beyond zero), the null space is trivial.

**Spectral gap:** the smallest non-zero eigenvalue of Δ_F determines how fast sheaf diffusion converges. Larger spectral gap → faster convergence → more aggressive feature mixing.

## Normalised Sheaf Laplacian Spectrum

The eigenvalues of the normalised Sheaf Laplacian lie in [0, 2]:
- 0: global sections (consistent signals)
- Close to 0: nearly consistent signals
- Close to 2: maximally inconsistent signals

This is the same range as the standard normalised Laplacian. The difference: with non-trivial restriction maps, "consistency" is defined relative to the sheaf structure, not raw feature equality.

## Summary

| Quantity | Formula | Interpretation |
|----------|---------|---------------|
| Coboundary δ₀ | (δ₀ x)_e = F_{v→e} x_v - F_{u→e} x_u | Sheaf disagreement at edge e |
| Sheaf Laplacian | Δ_F = δ₀^T δ₀ | Total disagreement operator |
| Dirichlet energy | x^T Δ_F x | Total inconsistency of signal x |
| Null space | ker(Δ_F) | Global sections (consistent signals) |
| Diffusion step | X ← (I - Δ_F) X | Reduces inconsistency, GCN generalisation |

The Sheaf Laplacian is the central object for sheaf-based graph learning. It generalises the standard graph Laplacian by incorporating edge-level structure — making it possible to define diffusion that respects per-edge feature transformations rather than forcing raw feature equality.
