---
layout: single
title: "Cosheaves: The Dual Perspective on Graph Data"
date: 2025-06-19
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [cosheaf, pushforward, dual, corestriction, homology, distribution]
excerpt: "A cosheaf is the categorical dual of a sheaf: instead of restriction maps (pulling data from larger to smaller), cosheaves have extension maps (pushing data from smaller to larger). This dual perspective leads to different consistency conditions, different homology groups, and different neural network architectures — better suited for data that 'integrates' over regions rather than restricts to them."
author_profile: true
read_time: true
is_overview: false
icon: "🔄"
read_mins: 6
permalink: /blog/sheaf/cosheaves/
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
<strong>TL;DR:</strong> A cosheaf assigns vector spaces to parts of a space but with <em>extension maps</em> (corestriction maps) going from smaller to larger: G_{e→v} : G(e) → G(v). Instead of asking "can we consistently restrict data from nodes to edges?", cosheaves ask "can we consistently extend data from edges to nodes?" The dual boundary operator ∂₀ = δ₀ᵀ gives rise to cosheaf homology H₀, H₁, ... — different from sheaf cohomology. Cosheaves are natural for data that aggregates (distributions, measures, flows) rather than restricts (sections, fields).
</div>

## Sheaves vs Cosheaves: The Duality

**Sheaf F:** data flows from larger to smaller via restriction maps F_{v▷e} : F(v) → F(e). The question is whether global data on nodes is consistent when restricted to edges.

**Cosheaf G:** data flows from smaller to larger via corestriction maps G_{e▷v} : G(e) → G(v). The question is whether local data on edges can be consistently extended to nodes.

Formally, a cosheaf on a graph G assigns:
- A vector space G(v) ≅ ℝ^d to each node v
- A vector space G(e) ≅ ℝ^d to each edge e
- A **corestriction map** G_{e▷v} : G(e) → G(v) for each incident pair (v, e)

The coboundary operator becomes a **boundary operator**:

<div class="math-box">
∂₀ : C₁(G, G) → C₀(G, G)
(∂₀ y)_v = Σ_{e incident to v} G_{e▷v} y_e · (orientation sign)
</div>

This is the transpose/dual of δ₀ — it maps edge-level data to node-level data by "extending" along corestriction maps.

## Cosheaf Homology vs Sheaf Cohomology

**Sheaf cohomology:**
<div class="math-box">
H⁰(G, F) = ker(δ₀)    (global sections — consistent node assignments)
H¹(G, F) = C¹ / im(δ₀)    (obstruction to consistency)
</div>

**Cosheaf homology:**
<div class="math-box">
H₀(G, G) = C₀ / im(∂₀) = C₀(G, G) / (node data attributable to edge data)
H₁(G, G) = ker(∂₀)          (edge cycles that map to zero at nodes)
</div>

The roles are reversed: H₀ of a cosheaf measures the "cokernel" (how much node space is NOT reachable from edge data), while H₁ measures consistent edge cycles.

For the constant cosheaf (G_{e▷v} = I): H₀ = ℝ^d (one component per connected component), H₁ = ℝ^{d · (|E|−|V|+1)} (one d-dimensional cycle per independent cycle of G).

## The Cosheaf Laplacian

The **cosheaf Laplacian** is:

<div class="math-box">
L_G = ∂₀ ∂₀ᵀ   (acting on C₁ = edge space)
</div>

Note: this is the **down-Laplacian** Δ₁ = δ₀ δ₀ᵀ acting on edges, when the cosheaf maps are the transposes of the sheaf maps.

The node-level operator ∂₀ᵀ ∂₀ is the **up-Laplacian** on nodes — the adjoint of the cosheaf Laplacian.

## The Sheaf-Cosheaf Duality

For any sheaf F on a graph G, the dual cosheaf F* is defined by:
- F*(v) = F(v)*, F*(e) = F(e)* (dual vector spaces)
- G_{e▷v} = (F_{v▷e})ᵀ (transpose of restriction maps)

Under this duality:
- Sheaf cohomology H*(G, F) ↔ Cosheaf homology H*(G, F*)
- The sheaf Laplacian Δ_F ↔ The cosheaf Laplacian of F*

For finite-dimensional vector spaces over ℝ, F ≅ F* (via the standard inner product), so sheaves and cosheaves are "the same" in the vector space setting — the distinction is in how the maps are oriented.

## When Cosheaves Are Natural

**Sheaves are natural when:** data is a **field** or **section** — something you observe at each point and which restricts consistently to smaller regions. Examples: temperature readings (restrict to subset of sensors), functions on a manifold (restrict to submanifold).

**Cosheaves are natural when:** data is a **distribution** or **measure** — something you aggregate from smaller regions to larger ones. Examples: flow on roads (aggregate from roads to intersections), probability distributions (extend from local regions to global), signals that integrate over regions.

<div class="insight-box">
<strong>Graph learning implication:</strong> For traffic flow prediction, the natural object is a cosheaf (flows on edges extend to intersections), not a sheaf. For node feature propagation, the natural object is a sheaf (node features restrict to edges). Most sheaf GNN papers focus on the sheaf setting (node features), but cosheaf GNNs may be more appropriate for edge-flow datasets.
</div>

## Sheaf-Cosheaf Pairs in Neural Networks

A more expressive framework uses both sheaves and cosheaves simultaneously:
- A sheaf F (restriction maps) to encode node-to-edge relationships
- A cosheaf G (corestriction maps) to encode edge-to-node relationships
- Combined diffusion using both Δ_F and L_G

This gives a **bipartite message-passing scheme** where information flows down (node → edge via F) and up (edge → node via G) independently, with different maps for each direction.

**Relation to HetGNN:** Heterogeneous GNNs with separate message functions for each edge direction (in vs out) are a special case of sheaf-cosheaf pairs.

## Computing Cosheaf Homology for Graph Learning

The key quantity for cosheaf-based GNNs is the null space of the cosheaf Laplacian ker(∂₀ᵀ ∂₀) = ker(∂₀ᵀ) — the "cosection" space of nodes whose data is orthogonal to all edge extensions.

For the constant cosheaf: ker(∂₀ᵀ) = ker(δ₀) = span{1_N} — constant node assignments. This is the same as the standard GCN null space.

For non-trivial cosheaf maps: ker(∂₀ᵀ) can be larger or smaller — analogous to the sheaf null space. Cosheaf GNNs can avoid oversmoothing via the same null space argument as sheaf GNNs.

## References

- Curry, J. (2014). [Sheaves, Cosheaves and Applications](https://arxiv.org/abs/1303.3255). *PhD Thesis, Penn 2014* (rigorous treatment of cosheaves, their homology, and duality with sheaves — chapters 2 and 4 are the key references).
- Ghrist, R., & Robinson, M. (2011). [Euler Characteristic Gauss-Bonnet Formula and Applications to Sheaves on Graphs](https://www2.math.upenn.edu/~ghrist/preprints/eulerchar.pdf). *Preprint* (Euler characteristic and duality for sheaves and cosheaves on graphs).
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (briefly discusses the cosheaf dual perspective; focuses on the sheaf side for the neural network architecture).
