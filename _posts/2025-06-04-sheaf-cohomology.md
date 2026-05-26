---
layout: single
title: "Sheaf Cohomology: Sections, Cochains, and What H⁰ and H¹ Mean"
date: 2025-06-04
categories: [sheaf]
book: sheaf
subsection: foundations
tags: [sheaf-cohomology, H0, H1, global-section, obstruction, cochain]
excerpt: "Sheaf cohomology measures how much a sheaf 'fails to be globally consistent'. H⁰ counts global sections (consistent assignments), H¹ measures the obstruction to consistency. Both carry direct interpretations for graph learning — as attractors of diffusion and as topological features of the relational structure."
author_profile: true
read_time: true
is_overview: false
icon: "🔺"
read_mins: 6
permalink: /blog/sheaf/sheaf-cohomology/
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
<strong>TL;DR:</strong> The sheaf cochain complex 0 → C⁰ →^{δ₀} C¹ → 0 gives two cohomology groups: H⁰ = ker(δ₀) (global sections — consistent signals) and H¹ = C¹/im(δ₀) (obstruction — edge disagreements that cannot be explained by any node assignment). For graph learning: H⁰ is the attractor of sheaf diffusion; dim(H⁰) controls the long-range information retained; H¹ captures topological obstructions to global consistency.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_sheaf.png" alt="Sheaf cohomology H0 H1" caption="Sheaf cohomology: global sections H⁰ and obstructions H¹ (Bodnar et al., 2022)" %}


## The Cochain Complex

Given a cellular sheaf F on a graph G, the **cochain complex** is:

<div class="math-box">
0 → C⁰(G, F) →^{δ₀} C¹(G, F) → 0
</div>

where:
- C⁰ = ∏_{v∈V} F(v) ≅ ℝ^{Nd} — node-level data
- C¹ = ∏_{e∈E} F(e) ≅ ℝ^{Ed} — edge-level data
- δ₀ : C⁰ → C¹ is the coboundary operator: (δ₀x)_e = F_{v▷e}x_v − F_{u▷e}x_u

For a graph, this is a 2-term complex (there are no 2-cells). The cohomology groups are:

<div class="math-box">
H⁰(G, F) = ker(δ₀)              (zeroth cohomology = global sections)
H¹(G, F) = C¹(G, F) / im(δ₀)   (first cohomology = obstruction to consistency)
</div>

## H⁰: Global Sections

H⁰(G, F) = ker(δ₀) is the vector space of **global sections** — node assignments x = (x_v) such that for every edge e = (u,v):

<div class="math-box">
F_{u▷e} x_u = F_{v▷e} x_v
</div>

**Dimension of H⁰:** For a connected graph with trivial (identity) sheaf, dim(H⁰) = d — one d-dimensional constant function per component. For a sheaf with orthogonal maps and trivial holonomy, dim(H⁰) = d. For a sheaf with maps that have non-trivial kernel interactions, dim(H⁰) can be larger.

**Euler characteristic:** For a connected graph G:
<div class="math-box">
χ(G, F) = dim H⁰ − dim H¹ = d(|V| − |E|) = d · (1 − |E| + |V| − 1) = d · χ(G)
</div>

where χ(G) = |V| − |E| is the graph Euler characteristic (= 1 for trees, = 1−g for graphs with g independent cycles).

## H¹: Obstruction to Global Consistency

H¹(G, F) = C¹(G, F)/im(δ₀) measures **how far C¹ is from being "explained" by C⁰**.

An element of C¹ is an assignment y = (y_e) of vectors to edges. y is in im(δ₀) if and only if there exists a node assignment x such that y_e = F_{v▷e}x_v − F_{u▷e}x_u — i.e., y is a "disagreement signal" that can be attributed to a global node assignment.

y ∈ H¹ means: y is an edge-level signal that **cannot** be explained by any node assignment. This is a topological obstruction — it exists because of cycles in the graph where the holonomy of the restriction maps is non-trivial.

**Dimension of H¹:**
<div class="math-box">
dim H¹ = Ed − (Nd − dim H⁰)   using rank-nullity on δ₀
       = Ed − Nd + dim H⁰
</div>

For a connected graph: dim H¹ = d·|E| − d·|V| + dim H⁰ = d·(|E|−|V|+1) + (dim H⁰ − d).

For trees: |E| = |V|−1, so dim H¹ = dim H⁰ − d. If the sheaf has no "extra" global sections (dim H⁰ = d), then dim H¹ = 0 — trees always have trivial H¹.

For graphs with cycles: dim H¹ ≥ d·(number of independent cycles).

<div class="insight-box">
<strong>Graph learning interpretation of H¹:</strong> A non-zero H¹ means the sheaf has "frustrated cycles" — closed paths where the composition of restriction maps is not the identity. In physics language, this is <em>holonomy</em> (the gauge field has non-zero curvature around loops). In practice, large H¹ means the graph has richer structure that cannot be encoded in node assignments alone — this is information that sheaf diffusion processes differently than GCN.
</div>

## The Hodge Decomposition

For a cellular sheaf, the space of 1-cochains C¹ decomposes as:

<div class="math-box">
C¹ = im(δ₀) ⊕ ker(δ₀ᵀ) ⊕ H¹(G, F)
</div>

Wait — for a 2-term complex there is no further differential. The Hodge decomposition is:

<div class="math-box">
C¹ = im(δ₀) ⊕ ker(δ₀ᵀ)
</div>

where:
- im(δ₀): exact 1-cochains — edge disagreements attributable to node assignments
- ker(δ₀ᵀ): co-closed 1-cochains — edge signals that "don't accumulate" at nodes

H¹ = ker(δ₀ᵀ) / (im(δ₀) ∩ ker(δ₀ᵀ)) = ker(δ₀ᵀ) when the complex has trivial overlap. In the Hodge sense, harmonic 1-cochains (in ker(δ₀ᵀ) and "orthogonal to" im(δ₀)) represent H¹.

For sheaves, the harmonic space is ker(Δ₁) where Δ₁ = δ₀δ₀ᵀ is the **down-Laplacian** on edges. A 1-cochain y is harmonic if δ₀ᵀ y = 0 and δ₀ is not defined here since C² = 0. So harmonic 1-cochains = ker(δ₀ᵀ).

## Betti Numbers and Graph Topology

The **Betti numbers** of the sheaf are:
- β₀ = dim H⁰ — number of "independent global sections"
- β₁ = dim H¹ — dimension of the obstruction space

For the constant sheaf (all maps = identity, d=1):
- β₀ = number of connected components of G
- β₁ = number of independent cycles of G (first Betti number)

Sheaf cohomology generalises ordinary graph cohomology: the constant sheaf recovers the classical topological invariants.

## Computing H⁰ in Practice

In a sheaf GNN, the space of global sections ker(δ₀) is the long-time attractor of the sheaf diffusion equation. Computing it exactly requires computing the null space of Δ_F — an (Nd)×(Nd) matrix — which is too expensive at scale.

In practice, sheaf GNNs approximate the projection onto ker(Δ_F) by:
1. Running K steps of diffusion X ← (I − αΔ_F^{norm})X
2. Adding skip connections to preserve information outside ker(Δ_F)
3. Using the output of each layer (not just the final step) as features

The skip connections are the crucial ingredient: without them, only ker(Δ_F) information survives at large K.

## Example: Triangle Graph with Signed Sheaf

Consider a triangle graph G: nodes {1,2,3}, edges {e₁₂, e₂₃, e₁₃}, stalk dimension d=1.

Signed sheaf: all restriction maps are ±1 scalars. Assign +1 to all except F_{3▷e₁₃} = −1.

The coboundary:
- (δ₀x)_{e₁₂} = x₂ − x₁
- (δ₀x)_{e₂₃} = x₃ − x₂
- (δ₀x)_{e₁₃} = −x₃ − x₁

Global sections: x₂=x₁, x₃=x₂, −x₃=x₁ → x₁=x₂=x₃=−x₁ → x₁=0. So H⁰ = {0} — no nontrivial global sections. The sheaf is frustrated: there is no consistent assignment.

dim H¹ = |E|·d − |V|·d + dim H⁰ = 3−3+0 = 0. But wait — using χ: χ(G) = 3−3 = 0, so dim H⁰ − dim H¹ = 0 → dim H¹ = dim H⁰ = 0. The sheaf is cohomologically trivial, even though it has no global sections.

This example shows the subtlety: a sheaf can be frustrated (no global sections) while still having trivial H¹. The frustration doesn't create H¹; rather, it is captured by H⁰ vanishing.

## Why Cohomology Matters for GNNs

The dimension of H⁰ directly controls what information sheaf diffusion retains at large depth:
- Large dim(H⁰): the model retains a rich subspace, enabling complex long-range representations
- Small dim(H⁰) (e.g., 0): diffusion is contractive and discards most information

Learning restriction maps (as in NSD) means **learning the dimension of H⁰** implicitly — the model adapts the global section space to the task. This is a fundamentally different approach from choosing a fixed aggregation kernel.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (uses the H⁰ null space structure to explain why sheaf diffusion avoids oversmoothing).
- Ghrist, R. (2014). [Elementary Applied Topology](https://www2.math.upenn.edu/~ghrist/EAT/EATchapter5.pdf). *Createspace* (ch. 5–6 cover sheaf cohomology with graph examples and the Euler characteristic formula).
- Robinson, M. (2014). [Topological Signal Processing](https://link.springer.com/book/10.1007/978-3-642-36104-3). *Springer 2014* (ch. 3–4 develop the cochain complex and Hodge decomposition for cellular sheaves, with signal processing applications).
