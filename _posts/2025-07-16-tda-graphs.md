---
layout: single
title: "TDA for Graphs: Persistent Homology Meets GNNs"
categories: [persistent-homology]
book: persistent-homology
subsection: ml-integration
tags: [graph-TDA, Weisfeiler-Lehman-filtration, graph-homology, PHom-GNN, extended-persistence]
published: false
excerpt: "Persistent homology can be applied directly to graphs by defining filtrations on nodes or edges (e.g., by WL colours, degree, or learned scalars). The resulting persistence diagrams encode global graph topology — connectivity, cycles, cliques — beyond what standard 1-WL GNNs can detect. This post covers WL-filtrations, extended persistence on graphs, and hybrid GNN+PH architectures."
author_profile: true
read_time: true
is_overview: false
icon: "🕸️"
read_mins: 5
permalink: /blog/persistent-homology/tda-graphs/
---
{% include figure image_path="/images/blog/tdl/hensel2021_topology_ml.png" alt="TDA applied to graphs" caption="Topological methods for graph analysis (Hensel et al., 2021)" %}

## Intuition First

Message-passing GNNs (like GCN, GraphSAGE, GIN) are provably limited by the 1-Weisfeiler-Lehman (1-WL) graph isomorphism test. Two graphs that 1-WL cannot distinguish will produce identical node embeddings — no matter how many layers you stack. A classic example: a cycle graph and a different regular graph of the same size are often 1-WL equivalent.

Persistent homology sees past this barrier. A cycle of length 6 has a prominent $H_1$ bar (one loop), whereas a tree with 6 nodes has no $H_1$ bars. PH directly encodes global structural properties — loops, cliques, connectivity patterns — that local message-passing cannot detect.

Combining PH with GNNs therefore gives you **local + global** topology: the GNN captures neighbourhood patterns, while PH captures large-scale cycles and connectivity structure.

---

## Defining a Filtration on a Graph

A graph $G = (V, E)$ has no intrinsic geometry, so we need to assign filtration values to its simplices (vertices and edges) from some meaningful function.

**Option 1 — Degree filtration.** Assign $f(v) = \deg(v)$ to each vertex, $f(e_{uv}) = \max(\deg(u), \deg(v))$ to each edge. Persistence tracks how the graph's connectivity evolves as we include increasingly high-degree nodes.

**Option 2 — WL (Weisfeiler-Lehman) filtration** (Rieck et al., 2019). Run $k$ rounds of WL colour refinement on the graph. Assign to each vertex the first round at which its colour stabilises (or changes). This encodes the graph's local structure at multiple scales simultaneously.

**Option 3 — Learned filtration** (Carriere et al., 2020; Zhao et al., 2020). Let a GNN assign a scalar $f_\theta(v)$ to each vertex and $f_\theta(e)$ to each edge. The filtration — and hence the persistence diagram — is then differentiable with respect to the GNN weights.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The choice of filtration determines what topology you are measuring. A degree filtration reveals hub-and-spoke structure. A WL filtration reveals structural equivalence classes. A learned filtration lets the network discover which topological features are most predictive for the downstream task. There is no single "right" filtration — it is a design choice analogous to choosing a kernel in kernel methods.</div>

---

## Extended Persistence on Graphs

Standard PH on a graph (with a vertex-valued filtration) only captures $H_0$ features (connectivity). Loops ($H_1$) require edge filtration values.

**Extended persistence** (Cohen-Steiner et al., 2009) augments ordinary PH by adding a "descending" phase after the full complex is built: you then remove simplices in reverse order, and track how homology classes die in this destruction phase. This captures features that are born and die in the "descending" phase, giving four diagram types:

| Diagram type | Meaning |
|-------------|---------|
| Ordinary | Born in ascending, dies in ascending |
| Relative | Born in descending, dies in descending |
| Extended+ | Born in ascending, dies in descending |
| Extended− | Born in descending, dies in ascending |

For graphs, extended persistence detects $H_1$ features (cycles) even with only a vertex-valued filtration — bypassing the need to define edge values separately.

---

## Animated: WL Filtration on a Small Graph

<style>
@keyframes colorNode {
  from { fill: #e2e8f0; }
  to   { fill: var(--target); }
}
@keyframes showBar {
  from { width: 0; opacity: 0; }
  to   { opacity: 1; }
}
.node-color { animation: colorNode 0.6s ease forwards; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 230" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:540px;display:block;margin:auto;">

  <!-- Left: Graph -->
  <rect x="5" y="10" width="210" height="210" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="110" y="26" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">Graph G</text>

  <!-- Edges -->
  <line x1="75"  y1="80"  x2="145" y2="80"  stroke="#94a3b8" stroke-width="2"/>
  <line x1="75"  y1="80"  x2="75"  y2="150" stroke="#94a3b8" stroke-width="2"/>
  <line x1="145" y1="80"  x2="145" y2="150" stroke="#94a3b8" stroke-width="2"/>
  <line x1="75"  y1="150" x2="145" y2="150" stroke="#94a3b8" stroke-width="2"/>
  <line x1="145" y1="80"  x2="185" y2="115" stroke="#94a3b8" stroke-width="2"/>
  <line x1="145" y1="150" x2="185" y2="115" stroke="#94a3b8" stroke-width="2"/>

  <!-- Nodes -->
  <!-- v0: degree 2 -->
  <circle cx="75"  cy="80"  r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="75"  y="84"  text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">v₀</text>
  <text x="75"  y="62"  text-anchor="middle" font-size="8"  fill="#64748b">deg=2</text>

  <!-- v1: degree 3 -->
  <circle cx="145" cy="80"  r="14" fill="#fde68a" stroke="#f59e0b" stroke-width="2"/>
  <text x="145" y="84"  text-anchor="middle" font-size="10" fill="#92400e" font-weight="bold">v₁</text>
  <text x="145" y="62"  text-anchor="middle" font-size="8"  fill="#64748b">deg=4</text>

  <!-- v2: degree 2 -->
  <circle cx="75"  cy="150" r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="75"  y="154" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">v₂</text>
  <text x="45"  y="154" text-anchor="middle" font-size="8"  fill="#64748b">deg=2</text>

  <!-- v3: degree 3 -->
  <circle cx="145" cy="150" r="14" fill="#fde68a" stroke="#f59e0b" stroke-width="2"/>
  <text x="145" y="154" text-anchor="middle" font-size="10" fill="#92400e" font-weight="bold">v₃</text>
  <text x="145" y="170" text-anchor="middle" font-size="8"  fill="#64748b">deg=4</text>

  <!-- v4: degree 2 (pendant) -->
  <circle cx="185" cy="115" r="14" fill="#bbf7d0" stroke="#16a34a" stroke-width="2"/>
  <text x="185" y="119" text-anchor="middle" font-size="10" fill="#14532d" font-weight="bold">v₄</text>
  <text x="205" y="115" text-anchor="middle" font-size="8"  fill="#64748b">deg=2</text>

  <!-- Right: Barcode from degree filtration -->
  <rect x="225" y="10" width="250" height="210" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="350" y="26" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">Barcode (degree filtration)</text>

  <!-- t axis -->
  <line x1="240" y1="200" x2="460" y2="200" stroke="#94a3b8" stroke-width="1"/>
  <text x="238" y="200" font-size="9" fill="#94a3b8">f=</text>
  <text x="268" y="212" text-anchor="middle" font-size="9" fill="#64748b">2</text>
  <text x="350" y="212" text-anchor="middle" font-size="9" fill="#64748b">3</text>
  <text x="432" y="212" text-anchor="middle" font-size="9" fill="#64748b">4</text>

  <!-- H0 bars: components merge as we add vertices by degree -->
  <!-- v0,v2,v4 born at deg=2; v1,v3 born at deg=4 -->
  <!-- But we add vertices in order of degree: 2,2,2,4,4 -->
  <!-- H0 bar 1: born 2, infinite (the component that survives) -->
  <rect x="268" y="50" width="182" height="10" rx="2" fill="#3b82f6" opacity="0.8"/>
  <text x="264" y="58" text-anchor="end" font-size="9" fill="#1e40af">H₀</text>
  <text x="452" y="58" font-size="9" fill="#64748b">∞</text>

  <!-- H0 bar 2: born 2, dies 2 (merge immediately — same degree batch) -->
  <rect x="268" y="68" width="3"   height="10" rx="2" fill="#93c5fd" opacity="0.8"/>
  <text x="264" y="76" text-anchor="end" font-size="9" fill="#1e40af">H₀</text>

  <!-- H0 bar 3: born 2, dies 4 (v4's component merges when v1 added) -->
  <rect x="268" y="86" width="164" height="10" rx="2" fill="#93c5fd" opacity="0.8"/>
  <text x="264" y="94" text-anchor="end" font-size="9" fill="#1e40af">H₀</text>

  <!-- H0 bar 4: born 4, dies 4 (v3 immediately merges with existing) -->
  <rect x="350" y="104" width="3" height="10" rx="2" fill="#fde68a" opacity="0.9"/>
  <text x="264" y="112" text-anchor="end" font-size="9" fill="#92400e">H₀</text>

  <!-- H1 bar: the square loop v0-v1-v3-v2 creates a cycle -->
  <!-- Born when last edge of square added (at edge max-degree=4), dies when filled? -->
  <!-- For simple graph PH, H1 born when cycle closes -->
  <rect x="350" y="130" width="82" height="10" rx="2" fill="#f97316" opacity="0.85"/>
  <text x="264" y="138" text-anchor="end" font-size="9" fill="#c2410c">H₁</text>
  <text x="434" y="138" font-size="9" fill="#64748b">∞</text>

  <!-- Labels -->
  <text x="350" y="165" text-anchor="middle" font-size="9" fill="#64748b">One persistent H₁ bar:</text>
  <text x="350" y="178" text-anchor="middle" font-size="9" fill="#64748b">the square cycle v₀-v₁-v₃-v₂</text>
</svg>
<figcaption>Degree filtration on a 5-node graph. Vertices added in order of degree (2,2,2,4,4). H₀ bars track component merges; one persistent H₁ bar captures the square cycle. The pendant node v₄ appears as a short H₀ bar.</figcaption>
</figure>
</div>

---

## Worked Example: Distinguishing Two Graphs

Consider two graphs that are **1-WL equivalent** (same degree sequence, same neighbourhood structure):

- $G_1$: a 6-cycle (hexagon)
- $G_2$: two disjoint triangles

Both have 6 vertices of degree 2. A GNN using only local message passing for 2 rounds cannot distinguish them.

**PH with edge-weight filtration (edge added at filtration value 1):**

- $G_1$ (hexagon): $H_0 = \{(0, \infty)\}$, $H_1 = \{(1, \infty)\}$ — one connected component, one 6-cycle loop.
- $G_2$ (two triangles): $H_0 = \{(0, 1), (0, \infty)\}$, $H_1 = \{(1, \infty), (1, \infty)\}$ — two components at filtration 0, then merging; two triangle loops.

The persistence diagrams are **different**: $G_1$ has one $H_1$ bar and one $H_0$ bar; $G_2$ has two $H_1$ bars and two $H_0$ bars. Persistent homology successfully distinguishes the two graphs.

---

## GNN + PH Hybrid Architectures

| Architecture | PH role | Key idea |
|-------------|---------|---------|
| **GFL (Gabrielsson et al., 2020)** | Differentiable PH loss | GNN learns filtration values; PH regularises topology |
| **PH-GNN (Zhao et al., 2020)** | PH features as extra input | Concatenate PH vectors with GNN node embeddings |
| **Togl (Bouritsas et al., 2022)** | Topological features in WL updates | Replace WL colour with PH-based structural descriptor |
| **CGMM (Bacciu et al., 2020)** | Cycle count from PH | Add $H_1$ Betti number as graph-level feature |

The general recipe: use GNN to produce node/edge scalar values → run differentiable PH on the resulting filtration → combine PH features with GNN embeddings for graph classification.

---

## References

- Rieck, B. et al. (2019). *Persistent homology for graph classification.* NeurIPS Workshop.
- Carriere, M. et al. (2020). *Perslay: A neural network layer for persistence diagrams.* AISTATS.
- Zhao, T. et al. (2020). *Persistence-enhanced graph neural network.* ECML-PKDD.
- Gabrielsson, R. B. et al. (2020). *A topology layer for machine learning.* AISTATS.
- Hensel, F. et al. (2021). *A survey of topological machine learning methods.* Frontiers in AI.
