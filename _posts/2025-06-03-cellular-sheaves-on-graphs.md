---
layout: single
title: "Cellular Sheaves on Graphs: A Rigorous Construction"
categories: [sheaf]
book: sheaf
subsection: foundations
tags: [cellular-sheaf, coboundary, cochain, section, sheaf-Laplacian]
published: false
excerpt: "Cellular sheaves give a precise algebraic structure to the idea of 'consistent data on a graph'. This post builds the full construction from scratch — stalks, cochains, coboundary operators, the Sheaf Laplacian — with worked examples at each step."
author_profile: true
read_time: true
is_overview: false
icon: "🧱"
read_mins: 7
permalink: /blog/sheaf/cellular-sheaves-on-graphs/
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
<strong>TL;DR:</strong> A cellular sheaf F on a graph assigns a vector space (stalk) to each node and edge, plus a linear map (restriction map) per incidence pair. 0-cochains are node-level signals; the coboundary δ₀ measures edge-level disagreement. The Sheaf Laplacian Δ_F = δ₀ᵀδ₀ is an (Nd)×(Nd) positive semidefinite block matrix generalising the standard graph Laplacian. Its null space = space of global sections = signals with zero disagreement everywhere.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_sheaf.png" alt="Sheaf Laplacian construction" caption="Cellular sheaf structure and Sheaf Laplacian construction (Bodnar et al., 2022)" %}


## Setup: A Worked Example

Let G be the path graph: nodes {1, 2, 3}, edges {e₁₂, e₂₃}.

A cellular sheaf assigns:
- F(1) = F(2) = F(3) = ℝ² (node stalks)
- F(e₁₂) = F(e₂₃) = ℝ² (edge stalks)
- Restriction maps: F_{1→e₁₂}, F_{2→e₁₂}, F_{2→e₂₃}, F_{3→e₂₃} ∈ ℝ^{2×2}

A 0-cochain is x = (x₁, x₂, x₃) ∈ ℝ² × ℝ² × ℝ² = ℝ⁶.

The coboundary is:

<div class="math-box">
δ₀ x = ( F_{2→e₁₂} x₂ − F_{1→e₁₂} x₁ , F_{3→e₂₃} x₃ − F_{2→e₂₃} x₂ ) ∈ ℝ² × ℝ² = ℝ⁴
</div>

x is a global section if and only if δ₀ x = 0, i.e., F_{2→e₁₂} x₂ = F_{1→e₁₂} x₁ and F_{3→e₂₃} x₃ = F_{2→e₂₃} x₂.

## Formal Definition

**Definition (Cellular Sheaf).** A cellular sheaf F on a graph G = (V, E) consists of:
1. A vector space F(v) ∈ ℝ^{d_v} for each node v ∈ V
2. A vector space F(e) ∈ ℝ^{d_e} for each edge e ∈ E
3. A linear map F_{v▷e} : F(v) → F(e) for each incident pair (v, e) where v is an endpoint of e

No compatibility axioms beyond this are required for a 1-dimensional complex.

In the uniform-stalk case (all stalks ℝ^d), the restriction maps are d×d real matrices.

## The Cochain Complex

**0-cochains** C⁰(G, F) = ∏_{v∈V} F(v) ≅ ℝ^{Nd} — all possible node assignments.

**1-cochains** C¹(G, F) = ∏_{e∈E} F(e) ≅ ℝ^{Ed} — all possible edge assignments.

The **coboundary operator** δ₀ : C⁰ → C¹ is the matrix:

<div class="math-box">
[δ₀]_{e,v} = F_{v▷e} · (orientation sign of v in e)
</div>

Concretely, for a chosen orientation of each edge e = (u→v):

<div class="math-box">
[δ₀]_{e,u} = −F_{u▷e}  ,  [δ₀]_{e,v} = +F_{v▷e}
</div>

This makes δ₀ an (Ed) × (Nd) matrix. The choice of orientation is arbitrary — the Sheaf Laplacian Δ_F = δ₀ᵀδ₀ is orientation-independent.

## The Sheaf Laplacian: Block Structure

<div class="math-box">
Δ_F = δ₀ᵀ δ₀ ∈ ℝ^{Nd × Nd}
</div>

The (u, v)-block of Δ_F for u ≠ v (adjacent via edge e):

<div class="math-box">
[Δ_F]_{uv} = −F_{u▷e}ᵀ F_{v▷e}  ∈ ℝ^{d×d}
</div>

The (v, v)-diagonal block:

<div class="math-box">
[Δ_F]_{vv} = Σ_{e incident to v} F_{v▷e}ᵀ F_{v▷e}  ∈ ℝ^{d×d}
</div>

**Properties:**
- Δ_F is symmetric: [Δ_F]_{uv} = [Δ_F]_{vv}ᵀ ✓ (since F_{u▷e}ᵀF_{v▷e} and F_{v▷e}ᵀF_{u▷e} are transposes)
- Δ_F is positive semidefinite: xᵀΔ_F x = ||δ₀ x||² ≥ 0 ✓
- Δ_F ≽ 0 with null space = ker(δ₀) = space of global sections ✓
- When F_{v▷e} = I for all (v, e): Δ_F = L ⊗ I_d (graph Laplacian ⊗ identity) ✓

## Worked Block Computation: Path Graph

For the path 1–2–3 with stalk dimension d=2 and maps:
- F_{1▷e₁₂} = A₁, F_{2▷e₁₂} = A₂, F_{2▷e₂₃} = B₂, F_{3▷e₂₃} = B₃ (all 2×2)

The 6×6 Sheaf Laplacian is:

```
       node1     node2             node3
Δ_F = [ A₁ᵀA₁  | −A₁ᵀA₂         |  0    ]   (node 1 row)
      [−A₂ᵀA₁  |  A₂ᵀA₂+B₂ᵀB₂  | −B₂ᵀB₃]   (node 2 row)
      [  0      | −B₃ᵀB₂         |  B₃ᵀB₃]   (node 3 row)
```

With identity maps (A₁=A₂=B₂=B₃=I):

```
Δ_F = L ⊗ I₂ = [ 1  -1   0 ] ⊗ I₂
                [-1   2  -1 ]
                [ 0  -1   1 ]
```

## Global Sections: The Null Space

The null space ker(Δ_F) = ker(δ₀) consists of all x = (x_v) such that:

<div class="math-box">
F_{u▷e}ᵀ F_{v▷e} = F_{v▷e}ᵀ F_{u▷e}  ∀(u,v,e)
and
F_{u▷e} x_u = F_{v▷e} x_v  ∀(u,v,e)
</div>

**Standard case (identity maps):** global sections = constant functions (all x_v equal). Dimension = d.

**Orthogonal maps (F_{v▷e} ∈ O(d)):** global sections = "parallel transported" signals. These can vary nontrivially — a node's value is the result of composing rotations along a path from a reference node. Dimension of ker = d for connected graphs with consistent holonomy; can be higher when holonomy has non-trivial kernel.

**Learned maps (NSD):** global sections depend on the learned maps and can have any structure. The dimension of ker(Δ_F) is data-dependent.

<div class="insight-box">
<strong>Why the null space matters for oversmoothing:</strong> In standard GCN, iterating the diffusion h ← (I − αL)h converges to the d-dimensional space of constants. Any information orthogonal to constants is destroyed. In sheaf diffusion, the attractor is the space of global sections — which can be d·c-dimensional for a c-component sheaf, carrying much richer information. This is why sheaf diffusion avoids oversmoothing even at large depth.
</div>

## The Sheaf Dirichlet Energy

The **Sheaf Dirichlet energy** of a signal x is:

<div class="math-box">
E_F(x) = xᵀ Δ_F x = ||δ₀ x||² = Σ_{e=(u,v)} ||F_{v▷e} x_v − F_{u▷e} x_u||²
</div>

This measures total inconsistency: how far the signal x deviates from the space of global sections. Sheaf diffusion minimises this energy:

<div class="math-box">
dX/dt = −Δ_F X   →   X(t) = exp(−Δ_F t) X(0)
</div>

as t → ∞, X(t) projects onto ker(Δ_F). The equilibrium is not a constant but a global section — a signal that satisfies all pairwise restrictions.

## Normalisation

The raw Δ_F is not normalised. In NSD, the normalised Sheaf Laplacian is used:

<div class="math-box">
Δ_F^{norm} = D_F^{-1/2} Δ_F D_F^{-1/2}
</div>

where D_F is the block-diagonal matrix of diagonal blocks of Δ_F: [D_F]_{vv} = [Δ_F]_{vv}. The eigenvalues of Δ_F^{norm} lie in [0, 2] — analogous to the normalised graph Laplacian L^{norm} = D^{-1/2}LD^{1/2}.

## Summary

| Object | Formula | Dimension |
|---|---|---|
| 0-cochain | x ∈ C⁰ = ∏_v F(v) | Nd |
| 1-cochain | y ∈ C¹ = ∏_e F(e) | Ed |
| Coboundary δ₀ | (δ₀ x)_e = F_{v▷e}x_v − F_{u▷e}x_u | Ed × Nd |
| Sheaf Laplacian | Δ_F = δ₀ᵀδ₀ | Nd × Nd |
| Dirichlet energy | E_F(x) = xᵀΔ_Fx | scalar |
| Global sections | ker(Δ_F) | ≥ d (for connected G) |

## References

- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (introduces the cellular sheaf construction for graph learning).
- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (derives the block Sheaf Laplacian and its normalisation for GNN training).
- Friedman, J. (2015). [Sheaves on Graphs, Their Homological Invariants, and a Proof of the Hanna Neumann Conjecture](https://arxiv.org/abs/1102.4184). *AMS Memoirs* (rigorous treatment of cellular sheaves on graphs including Laplacian spectral theory).
