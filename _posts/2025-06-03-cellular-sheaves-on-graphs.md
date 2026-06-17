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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A cellular sheaf F on a graph assigns a vector space (stalk) to each node and edge, plus a linear map (restriction map) per incidence pair. 0-cochains are node-level signals; the coboundary δ₀ measures edge-level disagreement. The Sheaf Laplacian Δ_F = δ₀ᵀδ₀ is an (Nd)×(Nd) positive semidefinite block matrix generalising the standard graph Laplacian. Its null space = space of global sections = signals with zero disagreement everywhere.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_sheaf.png" alt="Sheaf Laplacian construction" caption="Cellular sheaf structure and Sheaf Laplacian construction (Bodnar et al., 2022)" %}

## Intuition First: What Is a Cellular Sheaf?

Imagine you have a social network where each person (node) holds a 2D opinion vector — one dimension for economics, one for social policy. When two people talk (an edge), they don't necessarily agree: their opinions are "compared" through a linear map that translates one person's coordinate frame into the other's. A **cellular sheaf** formalises this: each node gets a local vector space (its *stalk*), each edge gets a stalk too, and *restriction maps* say how a node's data projects onto an adjacent edge's perspective.

A **global section** is an assignment of vectors to every node such that *all* adjacent pairs are already in agreement after applying their restriction maps — nobody is "wrong" relative to their neighbours. The space of global sections is the oversmoothing attractor of sheaf diffusion.

<style>
@keyframes restrictPulse {
  0%,100% { stroke-dashoffset: 0; }
  50% { stroke-dashoffset: 8; }
}
</style>
<div class="blog-figure"><figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 210" style="width:100%;max-width:520px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- three nodes -->
  <circle cx="80"  cy="105" r="30" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="240" cy="105" r="30" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <circle cx="400" cy="105" r="30" fill="#fce7f3" stroke="#db2777" stroke-width="2"/>
  <!-- node labels -->
  <text x="80"  y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">v₁</text>
  <text x="80"  y="115" text-anchor="middle" font-size="9"  fill="#3b82f6">stalk ℝ²</text>
  <text x="240" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#15803d">v₂</text>
  <text x="240" y="115" text-anchor="middle" font-size="9"  fill="#16a34a">stalk ℝ²</text>
  <text x="400" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#be185d">v₃</text>
  <text x="400" y="115" text-anchor="middle" font-size="9"  fill="#db2777">stalk ℝ²</text>
  <!-- edge stalks as diamonds -->
  <polygon points="160,95 175,105 160,115 145,105" fill="#fef3c7" stroke="#d97706" stroke-width="1.8"/>
  <text x="160" y="109" text-anchor="middle" font-size="8" fill="#92400e">e₁₂</text>
  <polygon points="320,95 335,105 320,115 305,105" fill="#fef3c7" stroke="#d97706" stroke-width="1.8"/>
  <text x="320" y="109" text-anchor="middle" font-size="8" fill="#92400e">e₂₃</text>
  <!-- restriction map arrows with animated dash -->
  <line x1="110" y1="100" x2="143" y2="103" stroke="#7c3aed" stroke-width="2"
        stroke-dasharray="4,2" style="animation:restrictPulse 2s ease-in-out infinite;"/>
  <text x="120" y="92" font-size="8" fill="#7c3aed">F_{1▷e₁₂}</text>
  <line x1="213" y1="103" x2="177" y2="103" stroke="#7c3aed" stroke-width="2"
        stroke-dasharray="4,2" style="animation:restrictPulse 2s ease-in-out infinite 0.3s;"/>
  <text x="192" y="92" font-size="8" fill="#7c3aed">F_{2▷e₁₂}</text>
  <line x1="270" y1="103" x2="303" y2="103" stroke="#7c3aed" stroke-width="2"
        stroke-dasharray="4,2" style="animation:restrictPulse 2s ease-in-out infinite 0.6s;"/>
  <text x="283" y="92" font-size="8" fill="#7c3aed">F_{2▷e₂₃}</text>
  <line x1="370" y1="103" x2="337" y2="103" stroke="#7c3aed" stroke-width="2"
        stroke-dasharray="4,2" style="animation:restrictPulse 2s ease-in-out infinite 0.9s;"/>
  <text x="350" y="92" font-size="8" fill="#7c3aed">F_{3▷e₂₃}</text>
  <!-- stalk arrows indicating local data -->
  <line x1="80"  y1="75" x2="95"  y2="57" stroke="#3b82f6" stroke-width="2" marker-end="url(#blueArr)"/>
  <line x1="240" y1="75" x2="255" y2="57" stroke="#16a34a" stroke-width="2" marker-end="url(#greenArr)"/>
  <line x1="400" y1="75" x2="415" y2="57" stroke="#db2777" stroke-width="2" marker-end="url(#pinkArr)"/>
  <!-- x vector annotations -->
  <text x="100" y="50" font-size="9" fill="#3b82f6">x₁</text>
  <text x="260" y="50" font-size="9" fill="#16a34a">x₂</text>
  <text x="420" y="50" font-size="9" fill="#db2777">x₃</text>
  <!-- consistency label -->
  <text x="240" y="185" text-anchor="middle" font-size="10" fill="#374151">Global section: F_{1▷e₁₂}x₁ = F_{2▷e₁₂}x₂  <tspan font-weight="bold" fill="#15803d">and</tspan>  F_{2▷e₂₃}x₂ = F_{3▷e₂₃}x₃</text>
  <defs>
    <marker id="blueArr"  markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#3b82f6"/></marker>
    <marker id="greenArr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#16a34a"/></marker>
    <marker id="pinkArr"  markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#db2777"/></marker>
  </defs>
</svg>
<figcaption style="text-align:center;font-size:.85rem;color:#6b7280;margin-top:.4rem;">Path graph with three node stalks (coloured circles), two edge stalks (amber diamonds), and four restriction maps (animated dashed purple arrows). A global section requires both pairs of restrictions to agree.</figcaption>
</figure></div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The restriction map is not a constraint imposed on the data — it is a <em>lens</em> through which node v sees its own data as it would look from the edge's perspective. Two nodes that look the same under their respective lenses are in agreement. The sheaf Laplacian measures the total disagreement across all edges simultaneously.</div>

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

## Concrete Numerical Example: 3-Node Path with Explicit Matrices

Let's make the abstract completely concrete. Take the path graph 1–2–3 with stalk dimension d=2 and these specific restriction maps:

<div class="math-box">
A₁ = F_{1▷e₁₂} = [[1, 0],[0, 1]]  (identity)
A₂ = F_{2▷e₁₂} = [[1, 0],[0,-1]]  (flip second component)
B₂ = F_{2▷e₂₃} = [[0, 1],[1, 0]]  (swap components)
B₃ = F_{3▷e₂₃} = [[1, 0],[0, 1]]  (identity)
</div>

**Global sections** must satisfy:
- A₁ x₁ = A₂ x₂  →  [x₁₁, x₁₂] = [x₂₁, -x₂₂]  →  x₁₁=x₂₁, x₁₂=-x₂₂
- B₂ x₂ = B₃ x₃  →  [x₂₂, x₂₁] = [x₃₁, x₃₂]   →  x₃₁=x₂₂, x₃₂=x₂₁

Setting x₂ = (a, b): x₁ = (a, -b), x₃ = (b, a). The null space is span{[(a,-b), (a,b), (b,a)] : a,b∈ℝ} — a 2-dimensional family. Even though the maps are non-identity, we still have dim ker(Δ_F) = 2 = d for this connected path graph, confirming the theory. The global section with a=1,b=0 gives x₁=(1,0), x₂=(1,0), x₃=(0,1) — nodes 1 and 2 carry the same first component while node 3 carries a rotated version.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The restriction maps encode a <em>translation dictionary</em> between adjacent stalks. When A₁x₁ = A₂x₂ is satisfied, we say x₁ and x₂ are "in agreement as seen from edge e₁₂." This is different from x₁ = x₂ (which is what a standard GCN requires). Sheaf diffusion converges to this structured agreement, not to a boring constant.</div>

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
