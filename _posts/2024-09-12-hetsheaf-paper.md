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
  <strong>TL;DR:</strong> Standard heterogeneous GNNs handle node/edge types via specialised architectural modules. HetSheaf moves heterogeneity into the <em>data structure</em> itself — the cellular sheaf — so a single unified architecture handles all types through type-aware restriction maps, achieving state-of-the-art on HGB benchmarks with up to 10× fewer parameters.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Heterogeneous Sheaf Neural Networks" &nbsp;·&nbsp; arXiv:2409.08036<br>
  <strong>Authors:</strong> L. Braithwaite, <em>A. Borgi</em>, G. Onorato, K. Tarantelli, F. Restuccia, F. Silvestri, P. Liò<br>
  <strong>Venue:</strong> arXiv preprint, 2024 &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2409.08036" target="_blank" rel="noopener">📄 Read the paper</a>
  &nbsp;·&nbsp;
  <a href="/publications/2024-09-12-heterogeneous-sheaf-neural-networks/">🔗 Publication page</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/hetsheaf-paper.png" alt="First page of the Heterogeneous Sheaf Neural Networks paper" caption="Paper preview — Heterogeneous Sheaf Neural Networks (Braithwaite et al., 2024)." %}
</div>

## The Problem: Heterogeneity is Expensive

Real-world graphs are rarely uniform. In a knowledge graph, nodes can be *people*, *organisations*, or *concepts*; edges can be *authored*, *affiliated with*, or *cited*. This is **heterogeneity**: multiple node types and edge types, each with its own feature space.

Existing heterogeneous GNNs — R-GCN, HAN, HGT — handle this by adding type-specific modules: one transformation matrix per relation type, one attention head per meta-path, or separate encoders per node type. The result is parameter bloat and architectural complexity that grows with the number of types.

**HetSheaf** asks: can we encode heterogeneity in the *structure* rather than the *architecture*?

## The Intuition in One Sentence

HetSheaf treats node type and edge type not as a reason to build a different neural layer for every relation, but as a reason to build a richer local geometry: different stalk sizes, different restriction maps, same global propagation rule.

## The Core Idea: Type-Aware Sheaves

A **cellular sheaf** assigns a vector space (a *stalk*) to each node and edge, plus a *restriction map* for each endpoint of each edge that says "how does the signal on this node relate to the signal on this edge?" In standard Sheaf Neural Networks, all stalks are the same size and restriction maps are unconstrained.

HetSheaf makes two changes:

1. **Type-aware stalks**: Each node and edge gets a stalk whose dimension depends on its type. A *person* node might have a 64-dimensional stalk; an *institution* node gets 32 dimensions.

2. **Conditioned restriction maps**: The restriction map for each edge endpoint is conditioned on the node features, node type, and edge type. This lets the model learn type-specific relational structure automatically, without separate architectural components per relation.

<div class="blog-figure">
<figure>
<img src="https://arxiv.org/html/2409.08036/2409.08036v3/x1.png" alt="HetSheaf framework overview: conventional HGNNs vs HetSheaf">
<figcaption>Figure 1 — Conventional HGNNs encode heterogeneity in the architecture (separate modules per type). HetSheaf encodes it in the sheaf data structure through type-aware stalks and restriction maps, enabling a single unified propagation rule.</figcaption>
</figure>
</div>

## Sheaf Predictors

The restriction maps can be instantiated in different ways, giving a family of **Heterogeneous Sheaf Predictors (HSPs)**. The paper explores several variants ranging from linear maps to nonlinear maps conditioned on concatenated node/edge features.

<div class="blog-figure">
<figure>
<img src="https://arxiv.org/html/2409.08036/2409.08036v3/x2.png" alt="Heterogeneous Sheaf Predictor variants">
<figcaption>Figure 2 — The family of Heterogeneous Sheaf Predictors. More expressive variants condition restriction maps on richer combinations of node features, node types, and edge types.</figcaption>
</figure>
</div>

## SheafPool: Graph-Level Readout

For graph classification, standard pooling (mean/sum) over sheaf node representations is problematic: the stalk bases are local and not globally aligned, so averaging across different basis choices is geometrically ill-defined.

**SheafPool** solves this by projecting each node's stalk representation into a shared *canonical space* before aggregating. The result is a readout that is **invariant to local basis changes** — a fundamental requirement for making sheaf-based graph classification well-defined.

<div class="blog-figure">
<figure>
<img src="https://arxiv.org/html/2409.08036/2409.08036v3/x3.png" alt="SheafPool architecture">
<figcaption>Figure 3 — SheafPool maps node stalk representations to a canonical space before aggregation, making graph-level readout invariant to local basis transformations. This enables up to 42pp higher F1 on graph classification compared to naive mean pooling.</figcaption>
</figure>
</div>

## Results

On the **Heterogeneous Graph Benchmark (HGB)** — covering node classification, link prediction, and graph classification across multiple heterogeneous datasets — HetSheaf achieves:

- Up to **+2 percentage points** higher Macro F1 on node classification vs. both homogeneous (GCN, GAT, GIN, GraphSAGE) and heterogeneous (R-GCN, HAT, HGT) baselines.
- Up to **99.62% F1** on link prediction benchmarks.
- **10× parameter reduction** vs. type-specialised baselines while maintaining competitive performance.
- SheafPool delivers **+42pp** over mean pooling on graph classification tasks.

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
