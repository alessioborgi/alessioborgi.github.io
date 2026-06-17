---
layout: single
title: "Cosheaves: The Dual Perspective on Graph Data"
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [cosheaf, pushforward, dual, corestriction, homology, distribution]
published: false
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
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_sheaf.png" alt="Cosheaf vs sheaf duality" caption="Sheaf and cosheaf duality: restriction vs corestriction maps (Bodnar et al., 2022)" %}


## Intuition First: Measuring vs Observing

A **sheaf** is like a weather sensor network: each station (node) observes local temperature and the restriction maps say how to compare readings at adjacent stations — data *restricts* from nodes down to edges (you can always look at a subset).

A **cosheaf** is like a water-flow network: the flow on each pipe (edge) *pushes up* to the junction (node) by accumulating — water from multiple pipes merges at an intersection. Data *extends* from edges up to nodes, and the question is whether the accumulated flows are consistent.

The key difference in a machine learning context: sheaves model **fields** (temperature, node features, opinions), while cosheaves model **distributions or flows** (traffic, probability mass, gradients accumulating at nodes).

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> For standard node-feature GNNs, the sheaf is the right object — node features project onto edges via restriction maps. For edge-flow GNNs (traffic, transactions, electrical current), the cosheaf is more natural — edge signals accumulate at nodes via corestriction maps. Most sheaf GNN papers use the sheaf setting because node features are more common, but cosheaf GNNs are the correct choice whenever edge data is the primary modality.</div>

<style>
@keyframes sheafDown { 0%,100%{stroke-dashoffset:16} 50%{stroke-dashoffset:0} }
@keyframes cosheafUp { 0%,100%{stroke-dashoffset:16} 50%{stroke-dashoffset:0} }
</style>
<div class="blog-figure"><figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 170" style="width:100%;max-width:500px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- LEFT: Sheaf (node → edge) -->
  <text x="100" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#3b82f6">Sheaf: node → edge</text>
  <circle cx="60"  cy="70" r="22" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="140" cy="70" r="22" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <rect   cx="83"  cy="65" x="83" y="65" width="34" height="20" rx="5" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="60"  y="74" text-anchor="middle" font-size="10" fill="#1e40af">F(v)</text>
  <text x="140" y="74" text-anchor="middle" font-size="10" fill="#1e40af">F(u)</text>
  <text x="100" y="78" text-anchor="middle" font-size="9"  fill="#92400e">F(e)</text>
  <!-- arrows down to edge -->
  <line x1="72"  y1="78" x2="87"  y2="78" stroke="#3b82f6" stroke-width="2"
        stroke-dasharray="5,2" marker-end="url(#dArr)"
        style="animation:sheafDown 2s linear infinite;"/>
  <line x1="128" y1="78" x2="119" y2="78" stroke="#3b82f6" stroke-width="2"
        stroke-dasharray="5,2" marker-end="url(#dArr2)"
        style="animation:sheafDown 2s linear infinite 0.5s;"/>
  <text x="72"  y="65" font-size="8" fill="#3b82f6">F_{v▷e}</text>
  <text x="106" y="65" font-size="8" fill="#3b82f6">F_{u▷e}</text>
  <text x="100" y="125" text-anchor="middle" font-size="9" fill="#6b7280">restriction: data flows down</text>
  <text x="100" y="140" text-anchor="middle" font-size="9" fill="#6b7280">H⁰ = consistent node assignments</text>

  <!-- divider -->
  <line x1="220" y1="20" x2="220" y2="160" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="4,3"/>

  <!-- RIGHT: Cosheaf (edge → node) -->
  <text x="350" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#16a34a">Cosheaf: edge → node</text>
  <circle cx="310" cy="70" r="22" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <circle cx="390" cy="70" r="22" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <rect   x="333" y="65" width="34" height="20" rx="5" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="310" y="74" text-anchor="middle" font-size="10" fill="#166534">G(v)</text>
  <text x="390" y="74" text-anchor="middle" font-size="10" fill="#166534">G(u)</text>
  <text x="350" y="78" text-anchor="middle" font-size="9"  fill="#92400e">G(e)</text>
  <!-- arrows up from edge -->
  <line x1="337" y1="78" x2="330" y2="78" stroke="#16a34a" stroke-width="2"
        stroke-dasharray="5,2" marker-end="url(#uArr)"
        style="animation:cosheafUp 2s linear infinite;"/>
  <line x1="367" y1="78" x2="374" y2="78" stroke="#16a34a" stroke-width="2"
        stroke-dasharray="5,2" marker-end="url(#uArr2)"
        style="animation:cosheafUp 2s linear infinite 0.5s;"/>
  <text x="318" y="65" font-size="8" fill="#16a34a">G_{e▷v}</text>
  <text x="357" y="65" font-size="8" fill="#16a34a">G_{e▷u}</text>
  <text x="350" y="125" text-anchor="middle" font-size="9" fill="#6b7280">corestriction: data flows up</text>
  <text x="350" y="140" text-anchor="middle" font-size="9" fill="#6b7280">H₀ = cokernel of ∂₀</text>

  <defs>
    <marker id="dArr"  markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#3b82f6"/></marker>
    <marker id="dArr2" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="270"><path d="M0,0 L7,3.5 L0,7 Z" fill="#3b82f6"/></marker>
    <marker id="uArr"  markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="180"><path d="M0,0 L7,3.5 L0,7 Z" fill="#16a34a"/></marker>
    <marker id="uArr2" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#16a34a"/></marker>
  </defs>
</svg>
<figcaption style="text-align:center;font-size:.85rem;color:#6b7280;margin-top:.4rem;">Sheaf (left, blue): restriction maps send node data down to edge stalks — asking "do adjacent nodes agree?" Cosheaf (right, green): corestriction maps push edge data up to node stalks — asking "do edges consistently contribute to their nodes?" The arrows reverse direction; the cohomology groups swap roles.</figcaption>
</figure></div>

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
