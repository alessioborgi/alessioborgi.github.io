---
layout: single
title: "Hodge Decomposition for Graph Signals: Curl, Gradient, and Harmonic Flows"
categories: [sheaf]
book: sheaf
subsection: theory
tags: [Hodge-decomposition, curl, gradient, harmonic, flow, simplicial-complex, edge-flow]
published: false
excerpt: "The Hodge decomposition splits any graph signal into three orthogonal components: gradient (from node potentials), curl (circulating around triangles), and harmonic (topologically non-trivial). This decomposition, extended to sheaves via the Sheaf Laplacian, provides a principled way to analyse, filter, and learn from edge-level and higher-order signals on graphs."
author_profile: true
read_time: true
is_overview: false
icon: "🌀"
read_mins: 7
permalink: /blog/sheaf/hodge-decomposition/
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
<strong>TL;DR:</strong> Any flow y on the edges of a simplicial complex decomposes as y = δ₀x + δ₁ᵀz + h where x is a node potential (gradient flow), z is a face potential (curl/rotational flow), and h is harmonic (non-exact, non-co-exact — topologically non-trivial). For graph sheaves, the decomposition uses the sheaf coboundary δ₀ and gives: node signals → sheaf gradient flows on edges; edge signals → sheaf-harmonic components; these components separate topological from geometric structure in graph data.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2021_mpsn.png" alt="Hodge Laplacians on simplicial complex" caption="Hodge Laplacians on a simplicial complex: gradient, curl, harmonic (Bodnar et al., 2021)" %}


## Intuition First: Decomposing a Flow on a City Map

Imagine traffic flows on the roads of a city. Any traffic pattern can be split into three independent parts:

1. **Gradient flow** — traffic driven by a pressure difference between intersections: cars flow from high-pressure areas to low-pressure areas along roads. This is like water running downhill. Remove the pressure gradient and this component vanishes.
2. **Curl/rotational flow** — traffic circulating around city blocks in closed loops (e.g., a one-way roundabout). This component never builds up or dissipates — it just rotates.
3. **Harmonic flow** — traffic that circulates around large-scale topological holes (e.g., the road network has a park in the middle that cars must drive around). This is neither a gradient (no pressure source) nor a small local curl — it is a global topological feature.

The **Hodge decomposition** is precisely this split, applied to any graph signal. In sheaf diffusion: the gradient component of the input decays toward zero (diffusion resolves local disagreements); the harmonic component (H⁰ = ker Δ_F) is preserved; there is no "curl" component for a graph without triangles.

<style>
@keyframes gradientFlow {
  0%,100% { stroke-dashoffset: 24; }
  50% { stroke-dashoffset: 0; }
}
@keyframes curlFlow {
  0%,100% { stroke-dashoffset: 30; }
  50% { stroke-dashoffset: 0; }
}
@keyframes harmonicGlow {
  0%,100% { stroke-opacity: 0.4; }
  50% { stroke-opacity: 1; }
}
</style>
<div class="blog-figure"><figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 190" style="width:100%;max-width:520px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- title -->
  <text x="240" y="15" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">y = δ₀x (gradient) + h (harmonic)</text>
  <!-- GRADIENT panel -->
  <text x="95" y="35" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">Gradient δ₀x</text>
  <!-- two nodes with potential -->
  <circle cx="40"  cy="95" r="22" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="150" cy="95" r="22" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2"/>
  <text x="40"  cy="99" text-anchor="middle" font-size="10" fill="#1e40af">x=2</text>
  <text x="150" cy="99" text-anchor="middle" font-size="10" fill="#1e40af">x=0</text>
  <text x="40"  y="99" text-anchor="middle" font-size="10" fill="#1e40af">2</text>
  <text x="150" y="99" text-anchor="middle" font-size="10" fill="#1e40af">0</text>
  <!-- animated gradient arrow -->
  <line x1="62" y1="95" x2="128" y2="95" stroke="#3b82f6" stroke-width="3"
        stroke-dasharray="8,4" marker-end="url(#gArr)"
        style="animation:gradientFlow 1.8s linear infinite;"/>
  <text x="95" y="80" text-anchor="middle" font-size="9" fill="#3b82f6">δ₀x = x₂−x₁ = −2</text>
  <text x="95" y="145" text-anchor="middle" font-size="9" fill="#6b7280">driven by node potential</text>
  <text x="95" y="158" text-anchor="middle" font-size="9" fill="#6b7280">→ decays under diffusion</text>

  <!-- divider -->
  <line x1="195" y1="30" x2="195" y2="175" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="4,3"/>

  <!-- HARMONIC panel (cycle with non-trivial holonomy) -->
  <text x="350" y="35" text-anchor="middle" font-size="11" fill="#7c3aed" font-weight="bold">Harmonic h ∈ ker(δ₀ᵀ)</text>
  <!-- triangle -->
  <circle cx="270" cy="130" r="18" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <circle cx="340" cy="60"  r="18" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <circle cx="410" cy="130" r="18" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="270" y="134" text-anchor="middle" font-size="10" fill="#5b21b6">1</text>
  <text x="340" y="64"  text-anchor="middle" font-size="10" fill="#5b21b6">2</text>
  <text x="410" y="134" text-anchor="middle" font-size="10" fill="#5b21b6">3</text>
  <!-- harmonic circulation arrows -->
  <path d="M 285 120 Q 305 75 328 68" stroke="#7c3aed" stroke-width="2.5" fill="none"
        stroke-dasharray="6,3" marker-end="url(#hArr)"
        style="animation:harmonicGlow 2s ease-in-out infinite;"/>
  <path d="M 355 68 Q 390 70 400 118" stroke="#7c3aed" stroke-width="2.5" fill="none"
        stroke-dasharray="6,3" marker-end="url(#hArr)"
        style="animation:harmonicGlow 2s ease-in-out infinite 0.7s;"/>
  <path d="M 395 143 Q 345 165 288 142" stroke="#7c3aed" stroke-width="2.5" fill="none"
        stroke-dasharray="6,3" marker-end="url(#hArr)"
        style="animation:harmonicGlow 2s ease-in-out infinite 1.4s;"/>
  <text x="350" y="158" text-anchor="middle" font-size="9" fill="#6b7280">no pressure source; </text>
  <text x="350" y="170" text-anchor="middle" font-size="9" fill="#6b7280">→ preserved by diffusion</text>
  <defs>
    <marker id="gArr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#3b82f6"/></marker>
    <marker id="hArr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#7c3aed"/></marker>
  </defs>
</svg>
<figcaption style="text-align:center;font-size:.85rem;color:#6b7280;margin-top:.4rem;">Hodge decomposition of a graph signal: the gradient component (left) is driven by a node-level potential and decays under sheaf diffusion. The harmonic component (right) circulates without a source and is preserved — it lives in ker(δ₀ᵀ), the co-closed subspace.</figcaption>
</figure></div>

## The Classical Hodge Decomposition

Let G be a simplicial complex (graph + triangles + higher cells). The **Hodge decomposition** states that for any edge flow y ∈ C¹(G) = ℝ^E:

<div class="math-box">
y = δ₀ x + δ₁ᵀ z + h
</div>

where:
- δ₀ x ∈ im(δ₀): the **gradient** component — y is the "gradient" of some node potential x ∈ ℝ^N
- δ₁ᵀ z ∈ im(δ₁ᵀ): the **curl** component — y circulates around triangles (faces) with "face potential" z ∈ ℝ^T
- h ∈ ker(δ₀ᵀ) ∩ ker(δ₁): the **harmonic** component — neither a gradient nor a curl

The three components are orthogonal and their sum is unique. This is the graph version of the classical Helmholtz decomposition for vector fields.

## The Three Operators

For a graph G = (V, E, T) (with optional triangles T):

**Node-edge coboundary** δ₀ : C⁰ → C¹:
<div class="math-box">
(δ₀ x)_e = x_v − x_u   (for oriented edge e = (u→v))
</div>

**Edge-triangle coboundary** δ₁ : C¹ → C²:
<div class="math-box">
(δ₁ y)_t = y_{ab} + y_{bc} − y_{ac}   (for triangle t = (a,b,c) with given orientation)
</div>

**Hodge Laplacians:**
<div class="math-box">
L₀ = δ₀ᵀ δ₀   (node Laplacian = standard graph Laplacian)
L₁ = δ₀ δ₀ᵀ + δ₁ᵀ δ₁   (edge Hodge Laplacian)
L₂ = δ₁ δ₁ᵀ   (face Laplacian)
</div>

The harmonic space for edges is ker(L₁) = ker(δ₀ᵀ) ∩ ker(δ₁) — the null space of the **edge Hodge Laplacian** L₁.

## Hodge Decomposition for Sheaves

For a cellular sheaf F on a graph (no triangles, so δ₁ = 0):

<div class="math-box">
C¹ = im(δ₀) ⊕ ker(δ₀ᵀ)
y = δ₀ x + h
</div>

where:
- δ₀ x: gradient component (edge disagreements attributable to node assignments)
- h ∈ ker(δ₀ᵀ): harmonic component (not attributable to any node assignment)

This is the **sheaf Hodge decomposition** for 0-1 cochain complexes.

The harmonic space ker(δ₀ᵀ) = ker(Δ₁_F) where Δ₁_F = δ₀ δ₀ᵀ is the **down-Laplacian** on sheaf 1-cochains.

## What the Decomposition Reveals

For a flow y on the edges (e.g., traffic flow, communication, energy transfer):

**Gradient component** δ₀ x: the flow is driven by a "pressure gradient" x at the nodes — like water flowing from high to low pressure. This is conservative (no cycles, follows the gradient of a scalar field). In the sheaf setting, x is a 0-cochain (node stalk assignment) and δ₀ x measures the disagreement induced by x.

**Harmonic component** h: the flow has no pressure source — it circulates "around topological holes" in the graph. For a graph with g independent cycles, the harmonic space has dimension g (one harmonic mode per cycle).

<div class="insight-box">
<strong>For graph learning:</strong> The gradient component of an edge signal contains no topological information — it can be "explained" by node potentials. The harmonic component captures the genuinely topological structure of the flow, which cannot be recovered from nodes alone. Sheaf GNNs that process edge stalks can learn from harmonic components that node-only models miss.
</div>

## Application: Learning on Edge Flows

Many real-world datasets have natural **edge signals** rather than node signals:
- Traffic networks: flow on roads (edges), not at intersections (nodes)
- Financial networks: transaction amounts on edges
- Communication networks: bandwidth on links
- Electrical circuits: current on wires

For edge-signal datasets, the appropriate model uses L₁ = δ₀ δ₀ᵀ (down-Laplacian) rather than L₀ = δ₀ᵀ δ₀ (node Laplacian).

**Edge-level sheaf diffusion:**

<div class="math-box">
dY/dt = −Δ₁_F Y   where Δ₁_F = δ₀ δ₀ᵀ  ∈ ℝ^{Ed × Ed}
</div>

This diffuses edge-stalk signals using the down-Laplacian — the sheaf generalisation of the edge Hodge Laplacian.

## Simplicial Sheaf Complexes

On a simplicial complex K (graph + triangles + tetrahedra + ...), one can define cellular sheaves on **all cells**, giving a full sheaf cochain complex:

<div class="math-box">
0 → C⁰(K,F) →^{δ₀} C¹(K,F) →^{δ₁} C²(K,F) → ...
</div>

The Hodge Laplacians at each level become **sheaf Hodge Laplacians**:
<div class="math-box">
Δ^k_F = δ_{k-1} δ_{k-1}ᵀ + δ_k^ᵀ δ_k
</div>

The k-th cohomology H^k(K, F) measures the k-dimensional "holes" in the sheaf — generalising both H⁰ (global sections) and H¹ (edge-level obstructions).

## Connection to Topological Deep Learning

Bodnar et al. (2021) introduced **CW Networks** and **Cellular Isomorphism Networks** — GNNs that operate on CW complexes (which subsume simplicial complexes). These use message passing across cells of different dimensions, analogous to sheaf diffusion across different cochain levels.

The connection: a sheaf on a CW complex provides the restriction maps between cells of adjacent dimension. CW-Net message passing is sheaf diffusion on the CW complex sheaf.

**Giusti et al. (2023)** formalise this connection as **Topological Deep Learning** — a unified framework where:
- Node signals → C⁰ sheaf cochains
- Edge signals → C¹ sheaf cochains
- Triangle signals → C² sheaf cochains
- Hodge Laplacians at each level govern diffusion

## Sheaf Hodge Decomposition for Node Classification

For node signals (which is what standard sheaf GNNs process), the Hodge decomposition decomposes the input X₀ ∈ ℝ^{Nd} as:

<div class="math-box">
X₀ = X₀^{harm} + X₀^{grad}
</div>

where X₀^{harm} ∈ ker(Δ_F) = H⁰ and X₀^{grad} ∈ im(Δ_F).

Sheaf diffusion acts as:
- X₀^{harm} preserved (in null space)
- X₀^{grad} attenuated (gradient component decays)

The **harmonic component X₀^{harm}** is the "globally consistent" part of the input — already a global section. The **gradient component X₀^{grad}** is the "inconsistent" part — diffusion tries to resolve it toward consistency.

For heterophily: the optimal node features for classification may be in X₀^{grad} for some graphs and X₀^{harm} for others. NSD with general maps can adapt the null space to make the task-optimal features harmonic.

## References

- Jiang, X., Lim, L.-H., Yao, Y., & Ye, Y. (2011). [Statistical Ranking and Combinatorial Hodge Theory](https://arxiv.org/abs/0811.1067). *Mathematical Programming 2011* (the graph Hodge decomposition applied to ranking and preference data — foundational for edge-flow analysis on graphs).
- Bodnar, C., Frasca, F., Wang, Y. G., Otter, N., Montufar, G. F., Liò, P., & Bronstein, M. M. (2021). [Weisfeiler and Lehman Go Topological: Message Passing Simplicial Networks](https://arxiv.org/abs/2103.03212). *ICML 2021* (MPSN: message passing on simplicial complexes — the precursor to sheaf-on-simplicial-complexes models).
- Giusti, G., Battiloro, C., Testa, L., Di Lorenzo, P., Sardellitti, S., & Barbarossa, S. (2023). [Cell Attention Networks](https://arxiv.org/abs/2209.08179). *arXiv 2023* (CAN: attention on cellular complexes, related to sheaf attention on higher-order structures).
