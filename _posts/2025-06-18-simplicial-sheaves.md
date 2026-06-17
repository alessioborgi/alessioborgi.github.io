---
layout: single
title: "Sheaves on Simplicial Complexes: Topological Deep Learning"
categories: [sheaf]
book: sheaf
subsection: topological-dl
tags: [simplicial-complex, topological-deep-learning, MPSN, CW-complex, higher-order, Bodnar]
published: false
excerpt: "Graphs are 1-dimensional CW complexes. The sheaf framework extends naturally to higher-dimensional simplicial complexes — adding triangles, tetrahedra, and higher cells — enabling message passing across cells of different dimensions. This is the foundation of Topological Deep Learning: a unifying framework for GNNs, simplicial networks, and sheaf networks."
author_profile: true
read_time: true
is_overview: false
icon: "🔺"
read_mins: 7
permalink: /blog/sheaf/simplicial-sheaves/
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
<strong>TL;DR:</strong> Sheaves can be defined on simplicial complexes K by assigning stalks to every simplex (node, edge, triangle, ...) and restriction maps between incident simplices. This gives a sheaf cochain complex 0 → C⁰ → C¹ → C² → ... with Hodge Laplacians at each level. Message Passing Simplicial Networks (MPSN) are a special case; full sheaf networks on simplicial complexes learn restriction maps across all dimensions simultaneously.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2021_cwnetworks.png" alt="CW complex sheaf" caption="CW Networks: message passing on CW complexes with sheaf structure (Bodnar et al., 2021)" %}


## Intuition First: Going Beyond Pairwise Relationships

A graph only captures *pairwise* relationships — every edge connects exactly two nodes. But many real phenomena involve *three-way* or higher-order interactions that cannot be decomposed into pairs. A research triangle where three collaborators all directly influence each other is not the same as three separate pairs — the triangle has its own coherent meaning.

A **simplicial complex** adds cells for these interactions: triangles for 3-way, tetrahedra for 4-way, and so on. A **sheaf on a simplicial complex** puts a local vector space and restriction map on every cell at every dimension, so data can live on nodes, edges, triangles, and tetrahedra simultaneously — all connected by restriction maps that say how lower-dimensional data relates to higher-dimensional data.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> A standard GNN on a graph is a sheaf on a 1-dimensional CW complex (only nodes and edges). Moving to a 2-dimensional simplicial complex (adding triangles) is not just an architectural detail — it adds a new cohomology group H² that measures "how many independent 3-way interactions exist that cannot be explained by pairwise ones." Each new dimension adds expressive power that is provably beyond what graph-level message passing can capture.</div>

<style>
@keyframes triPulse {
  0%,100% { fill-opacity: 0.15; }
  50% { fill-opacity: 0.4; }
}
</style>
<div class="blog-figure"><figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 185" style="width:100%;max-width:500px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- LEFT: plain graph (no triangle fill) -->
  <text x="100" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">Graph (1-D)</text>
  <line x1="50"  y1="130" x2="100" y2="60"  stroke="#94a3b8" stroke-width="2"/>
  <line x1="100" y1="60"  x2="155" y2="130" stroke="#94a3b8" stroke-width="2"/>
  <line x1="50"  y1="130" x2="155" y2="130" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="50"  cy="130" r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="100" cy="60"  r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="155" cy="130" r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="50"  y="134" text-anchor="middle" font-size="10" fill="#1e40af">v₁</text>
  <text x="100" y="64"  text-anchor="middle" font-size="10" fill="#1e40af">v₂</text>
  <text x="155" y="134" text-anchor="middle" font-size="10" fill="#1e40af">v₃</text>
  <text x="100" y="162" text-anchor="middle" font-size="9" fill="#6b7280">only nodes + edges</text>
  <text x="100" y="175" text-anchor="middle" font-size="9" fill="#6b7280">C⁰ → C¹  (2 levels)</text>

  <!-- divider -->
  <line x1="215" y1="25" x2="215" y2="180" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="4,3"/>

  <!-- RIGHT: simplicial complex (triangle filled) -->
  <text x="340" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">Simplicial Complex (2-D)</text>
  <polygon points="275,130 325,60 385,130" fill="#ede9fe" stroke="none">
    <animate attributeName="fill-opacity" values="0.15;0.45;0.15" dur="3s" repeatCount="indefinite"/>
  </polygon>
  <line x1="275" y1="130" x2="325" y2="60"  stroke="#7c3aed" stroke-width="2"/>
  <line x1="325" y1="60"  x2="385" y2="130" stroke="#7c3aed" stroke-width="2"/>
  <line x1="275" y1="130" x2="385" y2="130" stroke="#7c3aed" stroke-width="2"/>
  <circle cx="275" cy="130" r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="325" cy="60"  r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="385" cy="130" r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="275" y="134" text-anchor="middle" font-size="10" fill="#1e40af">v₁</text>
  <text x="325" y="64"  text-anchor="middle" font-size="10" fill="#1e40af">v₂</text>
  <text x="385" y="134" text-anchor="middle" font-size="10" fill="#1e40af">v₃</text>
  <!-- triangle stalk label -->
  <text x="328" y="110" text-anchor="middle" font-size="9" fill="#5b21b6">σ₁₂₃</text>
  <text x="328" y="122" text-anchor="middle" font-size="8" fill="#5b21b6">triangle stalk</text>
  <text x="330" y="162" text-anchor="middle" font-size="9" fill="#374151">nodes + edges + triangle</text>
  <text x="330" y="175" text-anchor="middle" font-size="9" fill="#374151">C⁰ → C¹ → C²  (3 levels)</text>
</svg>
<figcaption style="text-align:center;font-size:.85rem;color:#6b7280;margin-top:.4rem;">Left: a graph has only node and edge stalks (two cochain levels). Right: a simplicial complex adds a triangle stalk (pulsing purple fill) and a second coboundary δ₁ connecting C¹ to C². This enables H² — a new cohomology group measuring triangle-level topological structure.</figcaption>
</figure></div>

## From Graphs to Simplicial Complexes

A **simplicial complex** K consists of:
- **0-simplices (nodes):** the vertices V
- **1-simplices (edges):** pairs {u,v} ∈ E
- **2-simplices (triangles):** triples {u,v,w} ∈ T (when all three pairwise edges exist)
- **k-simplices:** k+1-cliques, including all faces

A simplicial complex is **closed under faces**: if σ ∈ K, then all faces of σ are in K.

**Why higher-order structure matters:**
- Triangles encode three-way interactions (not captured by pairwise edges)
- Triangle structure carries topological information (cycles vs filled regions)
- Many real-world datasets have natural higher-order structure: molecular bonds and angles, protein interaction triangles, social group membership

## Cellular Sheaves on Simplicial Complexes

A cellular sheaf F on a simplicial complex K assigns:
- A stalk F(σ) ≅ ℝ^{d_σ} to each simplex σ ∈ K
- A restriction map F_{σ▷τ} : F(σ) → F(τ) for each face inclusion τ ≺ σ (τ is a face of σ)

The **sheaf cochain complex** is:

<div class="math-box">
0 → C⁰(K, F) →^{δ₀} C¹(K, F) →^{δ₁} C²(K, F) →^{δ₂} ...
</div>

where:
- C^k(K, F) = ∏_{σ ∈ K, dim σ = k} F(σ) — k-cochains (signals on k-simplices)
- δ_k : C^k → C^{k+1} — coboundary, encoding disagreement between k-simplex data and (k+1)-simplex structure

The coboundary maps must satisfy δ_{k+1} ∘ δ_k = 0 — the chain complex condition.

## The Sheaf Hodge Laplacians

At each level k, the **sheaf Hodge Laplacian** is:

<div class="math-box">
Δ^k_F = δ_{k-1} δ_{k-1}ᵀ + δ_k^ᵀ δ_k
</div>

(setting δ_{-1} = 0 and δ_{dim K + 1} = 0 at the boundaries).

For k=0: Δ⁰_F = δ₀ᵀ δ₀ = Δ_F (the Sheaf Laplacian on nodes — the same as before)

For k=1: Δ¹_F = δ₀ δ₀ᵀ + δ₁ᵀ δ₁ (combines node-adjacency and triangle contributions for edges)

For k=2: Δ²_F = δ₁ δ₁ᵀ + δ₂ᵀ δ₂ (combines edge-adjacency and tetrahedra contributions for triangles)

**The k-th cohomology:**
<div class="math-box">
H^k(K, F) = ker(δ_k) / im(δ_{k-1})
</div>

This generalises H⁰ (global sections) to all dimensions — measuring topological "holes" at every level.

## Message Passing Simplicial Networks (MPSN)

Bodnar et al. (2021) introduced MPSN — message passing on simplicial complexes. At each level k, messages pass:
- **Down:** from k-simplices to their (k-1)-simplex faces
- **Up:** from k-simplices to their (k+1)-simplex cofaces

The message at simplex σ at level k:

<div class="math-box">
m_σ = AGG({ MSG(h_τ, h_σ) : τ ≺ σ or τ ≻ σ })
</div>

where τ ≺ σ means τ is a face of σ and τ ≻ σ means τ is a coface of σ.

**MPSN as a special sheaf:** MPSN is a cellular sheaf on the simplicial complex where:
- Each simplex has a stalk F(σ) ≅ ℝ^d
- Restriction maps are identity or learned linear maps
- The message is the coboundary applied to the stalk assignment

<div class="insight-box">
<strong>Why simplicial structure matters for node classification:</strong> Two graphs with the same edges but different triangle structure can have different MPSN representations — even if they are 1-WL equivalent. The triangle-level information (which edges form triangles) provides additional expressiveness that graph-only GNNs miss. Sheaves on simplicial complexes carry all this structure plus per-simplex relational geometry.
</div>

## CW Networks: Going Beyond Simplicial Complexes

Bodnar et al. (2021b) introduced CW Networks — message passing on CW complexes (a more general class than simplicial complexes, where cells need not be simplices):

**CW complex cells:** 0-cells (nodes), 1-cells (edges, possibly with loops), 2-cells (faces, not necessarily triangular — could be hexagons, arbitrary polygons), k-cells (k-dimensional cells).

**Why CW complexes?** Many natural domains have non-triangular higher-order structure:
- Molecular rings: 6-cycles (benzene) are 2-cells that are not triangulable
- Grid graphs: 4-cycles (squares) as 2-cells
- Graph coarsening: merged nodes/edges form higher-dimensional cells

CW Networks with sheaves on CW complexes can represent any regular cell complex, making them the most general form of topological sheaf learning.

## Topological Deep Learning: The Unifying Framework

Giusti, Battiloro, Testa, Di Lorenzo, Sardellitti, & Barbarossa (2023) formalise **Topological Deep Learning (TDL)** as:
- Data lives on cells of a CW complex
- Models are sheaf networks on the complex
- Message passing follows the coboundary structure of the complex
- Learning is end-to-end over restriction maps and readout

This unifies:
| Model | Complex | Signal levels |
|---|---|---|
| GCN, GIN, GAT | Graph (1D CW) | Level 0 (nodes) |
| Line graph GNN | Graph | Level 1 (edges) |
| MPSN | Simplicial complex | Level 0, 1, 2, ... |
| CW-Net | CW complex | Level 0, 1, 2, ... |
| Sheaf GNN (NSD) | Graph (1D CW) + sheaf | Level 0 with stalks |
| Simplicial Sheaf GNN | Simplicial complex + sheaf | All levels with stalks |

Full TDL = sheaf GNN on CW complex — the most general setting.

## Practical Implementation

Computing Δ^k_F for k > 0 requires:
1. **Constructing the complex:** finding triangles (k=2) requires triangle enumeration — O(E·d_max) for sparse graphs
2. **Assembling coboundary maps:** δ₁ has size |T| × |E| (triangles × edges) — sparse, computable in O(T·d²)
3. **Message passing:** using Δ^k_F is analogous to using Δ_F but for edge/triangle signals

**Current limitation:** Constructing simplicial complexes from real-world graphs (clique complexes, Rips complexes, Vietoris-Rips) can be expensive for dense graphs. For sparse graphs (social networks, citation graphs), clique complex construction is manageable.

## Datasets and Benchmarks

- **QM9 (molecular):** Molecules have natural triangle structure (ring bonds); MPSN shows improvement over GNN
- **Synthetic WL-test benchmarks:** MPSN distinguishes graphs that fool 1-WL and 2-WL, using triangle topology
- **Traffic networks:** Roads form natural simplicial complexes (intersections → edges → triangular regions)
- **Social networks:** Friend triangles are natural 2-simplices

## References

- Bodnar, C., Frasca, F., Wang, Y. G., Otter, N., Montufar, G. F., Liò, P., & Bronstein, M. M. (2021). [Weisfeiler and Lehman Go Topological: Message Passing Simplicial Networks](https://arxiv.org/abs/2103.03212). *ICML 2021* (MPSN: the foundational work on message passing on simplicial complexes — precursor to sheaves on complexes).
- Bodnar, C., Frasca, F., Otter, N., Wang, Y. G., Liò, P., Montufar, G. F., & Bronstein, M. M. (2021). [Weisfeiler and Lehman Go Cellular: CW Networks](https://arxiv.org/abs/2106.12575). *NeurIPS 2021* (CW-Net: message passing on general CW complexes, subsuming simplicial complexes and graphs).
- Giusti, G., Battiloro, C., Testa, L., Di Lorenzo, P., Sardellitti, S., & Barbarossa, S. (2023). [Cell Attention Networks](https://arxiv.org/abs/2209.08179). *arXiv 2023* (CAN: attention on cellular complexes — sheaf attention extended to higher-order cells).
