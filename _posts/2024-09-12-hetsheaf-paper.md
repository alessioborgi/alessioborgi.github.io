---
layout: single
title: "HetSheaf: Heterogeneous Graphs Meet Cellular Sheaves"
date: 2026-05-26
categories: [research]
book: sheaf
subsection: extensions
tags: [sheaf-neural-networks, heterogeneous-graphs, graph-neural-networks]
published: true
excerpt: "HetSheaf encodes graph heterogeneity directly in the sheaf data structure — type-aware stalks and restriction maps conditioned on node and edge types — instead of specialised architectural components, achieving +2pp on HGB with 10× fewer parameters."
author_profile: true
read_time: true
icon: "🌿"
read_mins: 7
permalink: /blog/sheaf/hetsheaf-paper/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 780px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .6rem; font-style: italic; }
.blog-figure--stacked figure { display: block !important; max-width: 900px; margin: 0 auto; }
.paper-preview img { width: min(100%, 620px); }
.tldr-box {
  background: linear-gradient(145deg,#e8fbfb,#dbeafe);
  border-left: 4px solid #0d9488;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
}
.tldr-box strong { color: #0f2a36; }
.paper-meta {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
  font-size: 0.93rem;
}
.paper-meta strong { color: #003E74; }
.key-takeaways {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-top: 1.5rem;
}
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Standard heterogeneous GNNs add type-specific layers. HetSheaf instead encodes node and edge types directly in the sheaf, so one unified model can handle heterogeneous graphs with far fewer parameters.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Heterogeneous Sheaf Neural Networks" &nbsp;·&nbsp; arXiv:2409.08036<br>
  <strong>Authors:</strong> L. Braithwaite, <em>A. Borgi</em>, G. Onorato, K. Tarantelli, F. Restuccia, F. Silvestri, P. Liò<br>
  <strong>Venue:</strong> arXiv preprint, 2024 &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2409.08036" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/hetsheaf-paper.png" alt="First page of the Heterogeneous Sheaf Neural Networks paper" caption="Paper preview — Heterogeneous Sheaf Neural Networks (Braithwaite et al., 2024)." %}
</div>

## The Problem: Heterogeneity is Expensive

Real-world graphs are rarely uniform. In a knowledge graph, nodes can be *people*, *organisations*, or *concepts*; edges can be *authored*, *affiliated with*, or *cited*. This is **heterogeneity**: multiple node types and edge types, each with its own feature space.

Existing heterogeneous GNNs — R-GCN, HAN, HGT — handle this by adding type-specific modules: one transformation matrix per relation type, one attention head per meta-path, or separate encoders per node type. The result is parameter bloat and architectural complexity that grows with the number of types.

**HetSheaf** asks: can we encode heterogeneity in the *structure* rather than the *architecture*?

## The Intuition in One Sentence

HetSheaf treats node type and edge type not as a reason to build a different neural layer for every relation, but as a reason to build a richer local geometry: typed stalk semantics, type-conditioned restriction maps, same global propagation rule.

## The Core Idea: Type-Aware Sheaves

A **cellular sheaf** assigns a vector space (a *stalk*) to each node and edge, plus a *restriction map* for each endpoint of each edge that says "how does the signal on this node relate to the signal on this edge?" In standard Sheaf Neural Networks, all stalks are the same size and restriction maps are unconstrained.

HetSheaf makes two changes:

1. **Type-aware stalks**: Each node and edge keeps the same stalk dimension, but the stalk content is made type-aware through the learned sheaf construction. In other words, HetSheaf does not yet assign different stalk sizes to different types; instead, it uses a shared-dimensional local space whose semantics depend on node and edge type. Allowing genuinely different stalk dimensions across types is a natural future direction, but it is not part of the current method.

2. **Conditioned restriction maps**: The restriction map for each edge endpoint is conditioned on the node features, node type, and edge type. This lets the model learn type-specific relational structure automatically, without separate architectural components per relation.

<div class="blog-figure blog-figure--stacked">
<figure>
<img src="/images/blog/papers/hetsheaf-overview.png" alt="HetSheaf framework overview comparing architecture-level heterogeneity with sheaf-level heterogeneity">
<figcaption>Figure 1 — HetSheaf’s main overview contrasts the standard approach of baking heterogeneity into the architecture with the sheaf-based alternative: node and edge types are absorbed directly into local stalk spaces and restriction maps, so the propagation rule itself stays unified and geometry-aware.</figcaption>
</figure>
</div>

<style>
@keyframes hetsheaf-pulse-person {
  0%, 100% { r: 28; opacity: 1; }
  50% { r: 33; opacity: 0.75; }
}
@keyframes hetsheaf-pulse-org {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}
@keyframes hetsheaf-pulse-concept {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
@keyframes hetsheaf-edge-flow {
  0% { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
}
@keyframes hetsheaf-label-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;display:block;margin:0 auto;">
  <defs>
    <marker id="arrow-het" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#64748b"/>
    </marker>
  </defs>
  <!-- Background -->
  <rect width="480" height="260" fill="#f8fafc" rx="12"/>
  <!-- Edges with animated dashes -->
  <!-- A--B -->
  <line x1="120" y1="130" x2="240" y2="130" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#arrow-het)">
    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.4s" repeatCount="indefinite"/>
  </line>
  <!-- B--C -->
  <line x1="260" y1="130" x2="360" y2="130" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#arrow-het)">
    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.4s" begin="0.4s" repeatCount="indefinite"/>
  </line>
  <!-- Node A: Person — circle (blue) -->
  <circle cx="100" cy="130" r="28" fill="#3b82f6" fill-opacity="0.18" stroke="#3b82f6" stroke-width="2.5">
    <animate attributeName="r" values="28;33;28" dur="2.4s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.18;0.08;0.18" dur="2.4s" repeatCount="indefinite"/>
  </circle>
  <text x="100" y="125" text-anchor="middle" fill="#1d4ed8" font-size="11" font-weight="700">Person</text>
  <text x="100" y="139" text-anchor="middle" fill="#1d4ed8" font-size="10">A</text>
  <!-- Stalk box A -->
  <rect x="60" y="165" width="80" height="22" rx="4" fill="#dbeafe" stroke="#93c5fd" stroke-width="1"/>
  <text x="100" y="180" text-anchor="middle" fill="#1e40af" font-size="9" font-family="monospace">x_A∈ℝ²</text>
  <!-- Node B: Org — rectangle (green) -->
  <rect x="218" y="107" width="52" height="46" rx="7" fill="#22c55e" fill-opacity="0.15" stroke="#22c55e" stroke-width="2.5">
    <animate attributeName="fill-opacity" values="0.15;0.05;0.15" dur="2.4s" begin="0.8s" repeatCount="indefinite"/>
    <animate attributeName="stroke-width" values="2.5;4;2.5" dur="2.4s" begin="0.8s" repeatCount="indefinite"/>
  </rect>
  <text x="244" y="125" text-anchor="middle" fill="#15803d" font-size="11" font-weight="700">Org</text>
  <text x="244" y="139" text-anchor="middle" fill="#15803d" font-size="10">B</text>
  <!-- Stalk box B -->
  <rect x="204" y="165" width="80" height="22" rx="4" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
  <text x="244" y="180" text-anchor="middle" fill="#166534" font-size="9" font-family="monospace">x_B∈ℝ²</text>
  <!-- Node C: Concept — diamond (orange) -->
  <polygon points="388,102 416,130 388,158 360,130" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-width="2.5">
    <animate attributeName="fill-opacity" values="0.15;0.05;0.15" dur="2.4s" begin="1.6s" repeatCount="indefinite"/>
    <animate attributeName="stroke-width" values="2.5;4;2.5" dur="2.4s" begin="1.6s" repeatCount="indefinite"/>
  </polygon>
  <text x="388" y="125" text-anchor="middle" fill="#c2410c" font-size="11" font-weight="700">Concept</text>
  <text x="388" y="139" text-anchor="middle" fill="#c2410c" font-size="10">C</text>
  <!-- Stalk box C -->
  <rect x="348" y="165" width="80" height="22" rx="4" fill="#ffedd5" stroke="#fdba74" stroke-width="1"/>
  <text x="388" y="180" text-anchor="middle" fill="#9a3412" font-size="9" font-family="monospace">x_C∈ℝ²</text>
  <!-- Edge labels (restriction map types) -->
  <rect x="140" y="110" width="80" height="16" rx="4" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="1"/>
  <text x="180" y="121" text-anchor="middle" fill="#0369a1" font-size="9">F^{P→O}_{v→e}</text>
  <rect x="279" y="110" width="76" height="16" rx="4" fill="#fef3c7" stroke="#fcd34d" stroke-width="1"/>
  <text x="317" y="121" text-anchor="middle" fill="#92400e" font-size="9">F^{O→C}_{v→e}</text>
  <!-- Title -->
  <text x="240" y="22" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="700">HetSheaf: Type-Conditioned Restriction Maps</text>
  <text x="240" y="38" text-anchor="middle" fill="#64748b" font-size="10">Each edge type gets a different learned linear map — no separate modules needed</text>
  <!-- Legend -->
  <circle cx="72" cy="240" r="6" fill="#3b82f6" fill-opacity="0.4" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="82" y="244" fill="#374151" font-size="9">Person node</text>
  <rect x="130" y="234" width="12" height="12" rx="2" fill="#22c55e" fill-opacity="0.4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="147" y="244" fill="#374151" font-size="9">Org node</text>
  <polygon points="204,240 210,234 216,240 210,246" fill="#f97316" fill-opacity="0.4" stroke="#f97316" stroke-width="1.5"/>
  <text x="222" y="244" fill="#374151" font-size="9">Concept node</text>
</svg>
<figcaption>HetSheaf assigns a different restriction map per edge type. Three node types (person, org, concept) with different local geometries share one propagation rule — heterogeneity lives in the maps, not the architecture.</figcaption>
</figure>
</div>

### Mini-Example: 3-Node Heterogeneous Graph

Consider a small graph with nodes A (person), B (org), C (concept), two edges e_AB and e_BC.

**Standard SNN** (type-blind): both edges use the same learned matrix W ∈ ℝ^{2×2}.

<div class="math-box" style="background:linear-gradient(145deg,#f8fafc,#f0f4f8);border:1px solid #e2e8f0;border-radius:8px;padding:1rem 1.4rem;margin:1.25rem 0;font-family:monospace;text-align:left;">
F_{A→e_AB} = W,   F_{B→e_AB} = W<br>
F_{B→e_BC} = W,   F_{C→e_BC} = W
</div>

**HetSheaf** (type-conditioned): each edge type gets its own restriction map, conditioned on the node's type embedding τ and features h_v.

<div class="math-box" style="background:linear-gradient(145deg,#f8fafc,#f0f4f8);border:1px solid #e2e8f0;border-radius:8px;padding:1rem 1.4rem;margin:1.25rem 0;font-family:monospace;text-align:left;">
F_{A→e_AB} = MLP(h_A, τ_person, τ_{P→O})  ∈ ℝ^{2×2}<br>
F_{B→e_AB} = MLP(h_B, τ_org,    τ_{P→O})  ∈ ℝ^{2×2}<br>
F_{B→e_BC} = MLP(h_B, τ_org,    τ_{O→C})  ∈ ℝ^{2×2}<br>
F_{C→e_BC} = MLP(h_C, τ_concept, τ_{O→C}) ∈ ℝ^{2×2}
</div>

The disagreement at e_AB that the Sheaf Laplacian penalises is then:

<div class="math-box" style="background:linear-gradient(145deg,#f8fafc,#f0f4f8);border:1px solid #e2e8f0;border-radius:8px;padding:1rem 1.4rem;margin:1.25rem 0;font-family:monospace;text-align:center;">
(δ₀ x)_{e_AB} = F_{A→e_AB} x_A − F_{B→e_AB} x_B
</div>

With type-conditioned maps, this disagreement is measured **in the coordinate frame appropriate to the A–B relation**, not in a generic frame shared by all edge types. A person-to-org relationship and an org-to-concept relationship are penalised on their own terms.

## Sheaf Predictors

The restriction maps can be instantiated in different ways, giving a family of **Heterogeneous Sheaf Predictors (HSPs)**. The paper explores several variants ranging from linear maps to nonlinear maps conditioned on concatenated node/edge features.

<div class="blog-figure blog-figure--stacked">
<figure>
<img src="/images/blog/papers/hetsheaf-predictors.png" alt="Heterogeneous Sheaf Predictor variants including Sheaf-NSD, ensemble, NE, EE, TE, NT, ET, and types">
<figcaption>Figure 2 — The Heterogeneous Sheaf Predictor family shows how expressive power increases as restriction maps are conditioned on richer typed context. The variants progressively inject node-type functions, edge-type functions, or both, making it clear that HetSheaf is a framework for typed local geometry rather than one fixed predictor.</figcaption>
</figure>
</div>

## SheafPool: Graph-Level Readout

The graph-classification problem is simple to state:

- ordinary GNNs can sum or average node embeddings directly;
- sheaf GNNs cannot, because each node lives in its own **local coordinate frame**.

So naive pooling is not just weak, but wrong. Two stalk vectors can represent the same geometric content in different bases, and direct averaging would treat them as different. The final graph embedding would then depend on arbitrary local frame choices instead of only on the graph.

SheafPool fixes this by making the readout **basis-invariant**.

In practice, it does four things:

1. **Normalise** each stalk locally.
2. **Align** stalks to a shared anchor frame.
3. **Score** nodes with invariant attention weights.
4. **Pool** the aligned stalks into one graph representation.

The key idea is: **align first, pool later**. That is what makes graph-level prediction well-defined in sheaf space, especially on heterogeneous graphs where local geometry is already more complex.

<div class="blog-figure blog-figure--stacked">
<figure>
<img src="/images/blog/papers/hetsheaf-sheafpool.png" alt="SheafPool architecture with whitening, anchor-guided alignment, invariant attention weights, stalk pooling, and invariant graph feature extraction">
<figcaption>Figure 3 — SheafPool solves the core graph-level readout problem step by step: whiten each stalk, align residual orientations with a shared anchor frame, compute invariant attention weights, pool aligned stalks into a receive-only token, and finally extract graph features through channel-wise invariant energies. This is what makes graph classification well-defined under local basis changes.</figcaption>
</figure>
</div>

## Results

On the **Heterogeneous Graph Benchmark (HGB)** — covering node classification, link prediction, and graph classification across multiple heterogeneous datasets — HetSheaf achieves:

- Up to **+2 percentage points** higher Macro F1 on node classification vs. both homogeneous (GCN, GAT, GIN, GraphSAGE) and heterogeneous (R-GCN, HAT, HGT) baselines.
- Up to **99.62% F1** on link prediction benchmarks.
- **10× parameter reduction** vs. type-specialised baselines while maintaining competitive performance.
- SheafPool delivers **+42pp** over mean pooling on graph classification tasks.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Type-specific neural modules scale as O(T²) in the number of relation types T — every pair of node types may need its own transformation. Type-aware restriction maps in HetSheaf scale as O(T): each type gets a conditioning signal, but the propagation rule stays the same. Encoding heterogeneity in geometry rather than architecture is the key to parameter-efficient relational learning.</div>

## Why This Matters

The important shift is conceptual. Most heterogeneous GNNs ask: "what new neural block do I need for this new graph type?" HetSheaf asks: "what local compatibility structure does this graph already have?" Once that structure is encoded in the sheaf, the downstream model becomes simpler, more principled, and easier to scale as the number of types grows.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>HetSheaf moves heterogeneity from the architecture into the data structure via type-aware sheaves.</li>
  <li>Restriction maps conditioned on node/edge types encode relational structure without type-specific modules.</li>
  <li>SheafPool provides a basis-change-invariant graph-level readout — essential for correct graph classification with sheaves.</li>
  <li>State-of-the-art on HGB with up to 10× fewer parameters than specialised baselines.</li>
</ul>
</div>
