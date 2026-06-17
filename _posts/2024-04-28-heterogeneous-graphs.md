---
layout: single
title: "Heterogeneous Graphs: When Nodes and Edges Have Types"
categories: [gnn]
book: gnn
subsection: heterogeneous
tags: [heterogeneous-graph, relational, knowledge-graph, meta-path, HAN]
published: true
excerpt: "Most real-world graphs are heterogeneous — they contain multiple node types (users, items, tags) and edge types (clicks, rates, authors). Standard GNNs treat all nodes and edges identically, making them blind to this type structure."
author_profile: true
read_time: true
is_overview: false
icon: "🎨"
read_mins: 4
permalink: /blog/gnn/heterogeneous-graphs/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A heterogeneous graph has multiple node types and edge types. Standard GNNs use a single message function and aggregation — they cannot differentiate a "cites" edge from an "is-authored-by" edge. Handling heterogeneity requires type-specific message functions, meta-path decomposition, or relation-aware aggregation.
</div>
{% include figure image_path="/images/blog/gnn/wang2019_han.png" alt="Heterogeneous attention network" caption="Heterogeneous graph with multiple node and edge types (Wang et al., 2019)" %}


<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> A standard GNN is like a phone directory that treats every contact the same — it cannot tell your doctor from your friend. A heterogeneous GNN reads the type tag on every node and edge, applying different transformations to "doctor" and "friend" relationships. The type structure often carries as much information as the topology itself.</div>

## What Is a Heterogeneous Graph?

A **heterogeneous graph** (or heterogeneous information network, HIN) is defined as:

<div class="math-box">
G = (V, E, τ, φ)
</div>

where τ: V → A maps each node to a node type (|A| > 1) and φ: E → R maps each edge to an edge type (|R| > 1).

**Examples:**

Academic network:
- Node types: Paper, Author, Venue
- Edge types: cites, written-by, published-in, reviews

Recommender system:
- Node types: User, Item, Category, Brand
- Edge types: clicks, purchases, belongs-to, manufactured-by

Biomedical knowledge graph:
- Node types: Gene, Disease, Drug, Protein
- Edge types: associated-with, treats, inhibits, encodes

## Why Standard GNNs Fail on Heterogeneous Graphs

Standard message passing:

<div class="math-box">
h^{(k)}_v = UPDATE( h^{(k-1)}_v, AGG({ h^{(k-1)}_u : u ∈ N(v) }) )
</div>

applies the same message function to all neighbours, regardless of the edge type connecting them. This conflates semantically very different relationships:
- "User A clicked Item B" and "Item B belongs-to Category C" are both aggregated identically
- The model cannot learn that "cites" edges carry different information than "co-authored-by" edges
- Node type differences are ignored — a Gene node and a Drug node are processed identically

## Solutions Overview

**1. Type-specific message functions:** learn a separate weight matrix W_r for each relation type r. Messages of type r are W_r h_u. Used in R-GCN.

**2. Meta-path decomposition:** define semantically meaningful paths through the graph (e.g., Author → Paper → Author = co-authorship). Run separate GNNs along each meta-path. Used in HAN.

**3. Relation-aware attention:** attend differentially to different relation types when aggregating. Used in HAN, HGT.

**4. Type-specific projections:** project all node types into a common embedding space with type-specific linear transforms before message passing. Used in HGT (Heterogeneous Graph Transformer).

## Visualising a Bipartite Heterogeneous Graph

<style>
@keyframes edge-pulse {
  0%, 100% { stroke-opacity: 0.4; }
  50% { stroke-opacity: 1; }
}
@keyframes node-glow {
  0%, 100% { filter: drop-shadow(0 0 0px transparent); }
  50% { filter: drop-shadow(0 0 4px #6366f1); }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;">
  <!-- User nodes (left) -->
  <rect x="18" y="55" width="60" height="24" rx="12" fill="#6366f1" style="animation:node-glow 2.4s ease-in-out infinite;"/>
  <text x="48" y="71" font-size="10" fill="white" text-anchor="middle">User A</text>
  <rect x="18" y="95" width="60" height="24" rx="12" fill="#6366f1" style="animation:node-glow 2.4s ease-in-out 0.8s infinite;"/>
  <text x="48" y="111" font-size="10" fill="white" text-anchor="middle">User B</text>
  <rect x="18" y="135" width="60" height="24" rx="12" fill="#6366f1" style="animation:node-glow 2.4s ease-in-out 1.6s infinite;"/>
  <text x="48" y="151" font-size="10" fill="white" text-anchor="middle">User C</text>
  <text x="48" y="30" font-size="11" fill="#4338ca" text-anchor="middle" font-weight="bold">Users</text>
  <!-- Item nodes (middle) -->
  <rect x="190" y="35" width="60" height="24" rx="4" fill="#f97316"/>
  <text x="220" y="51" font-size="10" fill="white" text-anchor="middle">Item 1</text>
  <rect x="190" y="75" width="60" height="24" rx="4" fill="#f97316"/>
  <text x="220" y="91" font-size="10" fill="white" text-anchor="middle">Item 2</text>
  <rect x="190" y="115" width="60" height="24" rx="4" fill="#f97316"/>
  <text x="220" y="131" font-size="10" fill="white" text-anchor="middle">Item 3</text>
  <rect x="190" y="155" width="60" height="24" rx="4" fill="#f97316"/>
  <text x="220" y="171" font-size="10" fill="white" text-anchor="middle">Item 4</text>
  <text x="220" y="20" font-size="11" fill="#c2410c" text-anchor="middle" font-weight="bold">Items</text>
  <!-- Category nodes (right) -->
  <rect x="370" y="55" width="72" height="24" rx="8" fill="#10b981"/>
  <text x="406" y="71" font-size="10" fill="white" text-anchor="middle">Electronics</text>
  <rect x="370" y="105" width="72" height="24" rx="8" fill="#10b981"/>
  <text x="406" y="121" font-size="10" fill="white" text-anchor="middle">Books</text>
  <text x="406" y="30" font-size="11" fill="#065f46" text-anchor="middle" font-weight="bold">Categories</text>
  <!-- clicks edges (dashed orange) -->
  <line x1="78" y1="67" x2="190" y2="47" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,2" style="animation:edge-pulse 2s ease-in-out infinite;"/>
  <line x1="78" y1="67" x2="190" y2="87" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,2" style="animation:edge-pulse 2s ease-in-out 0.4s infinite;"/>
  <line x1="78" y1="107" x2="190" y2="87" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,2" style="animation:edge-pulse 2s ease-in-out 0.8s infinite;"/>
  <line x1="78" y1="107" x2="190" y2="127" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,2" style="animation:edge-pulse 2s ease-in-out 1.2s infinite;"/>
  <line x1="78" y1="147" x2="190" y2="167" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,2" style="animation:edge-pulse 2s ease-in-out 1.6s infinite;"/>
  <!-- belongs-to edges (solid green) -->
  <line x1="250" y1="47" x2="370" y2="67" stroke="#10b981" stroke-width="1.5"/>
  <line x1="250" y1="87" x2="370" y2="67" stroke="#10b981" stroke-width="1.5"/>
  <line x1="250" y1="127" x2="370" y2="117" stroke="#10b981" stroke-width="1.5"/>
  <line x1="250" y1="167" x2="370" y2="117" stroke="#10b981" stroke-width="1.5"/>
  <!-- legend -->
  <line x1="18" y1="185" x2="38" y2="185" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="42" y="189" font-size="9" fill="#64748b">clicks</text>
  <line x1="90" y1="185" x2="110" y2="185" stroke="#10b981" stroke-width="1.5"/>
  <text x="114" y="189" font-size="9" fill="#64748b">belongs-to</text>
</svg>
<figcaption>A heterogeneous bipartite graph: three node types (Users, Items, Categories) and two edge types (clicks, belongs-to). A standard GNN would process all edges identically — losing the semantic distinction between "User clicks Item" and "Item belongs-to Category".</figcaption>
</figure></div>

## Meta-Paths: Semantic Bridges

A **meta-path** is a sequence of node and edge types defining a composite relationship:

```
Author -[writes]→ Paper -[written-by]→ Author
= APA (Author-Paper-Author) = co-authorship

Paper -[cites]→ Paper -[published-in]→ Venue -[publishes]→ Paper
= PCPC (complex multi-hop semantic relation)
```

Meta-paths allow encoding domain knowledge into the graph structure. A model operating on the APA meta-path captures co-authorship patterns; one on the APVPA meta-path (Author → Paper → Venue → Paper → Author) captures researchers working in the same venue.

<div class="insight-box">
<strong>Meta-paths as graph views:</strong> Each meta-path defines a new homogeneous graph (all nodes same type, all edges same type) where two nodes are connected if there exists a path of the given type between them. Running a standard GNN on each of these views, then combining, is one approach to heterogeneous GNN design.
</div>

## Node Projection to Common Space

When node types have different feature dimensions (e.g., Papers have text embeddings, Authors have profile embeddings), we must first project all types to a common dimension d:

<div class="math-box">
h^{(0)}_v = W_{τ(v)} x_v + b_{τ(v)}
</div>

A separate linear projection W_{τ(v)} per node type ensures all nodes live in the same embedding space before message passing begins.

## Heterogeneous Graph Benchmarks

- **OGB-MAG** (Open Graph Benchmark: Microsoft Academic Graph): 736,389 papers, 59,965 authors, citation + authorship edges
- **IMDB (heterogeneous):** Movies, Actors, Directors — classify movie genre
- **ACM:** Papers, Authors, Subjects — classify research area
- **DBLP:** Authors, Papers, Venues, Terms — author classification

## Summary

| Approach | How it handles heterogeneity | Example |
|----------|----------------------------|---------|
| Type-specific weights | Separate W_r per relation | R-GCN |
| Meta-path aggregation | Run GNNs on meta-path subgraphs | HAN |
| Relation-aware attention | Attention over relation types | HAN, HGT |
| Type projection | Map all types to common space | HGT |

Heterogeneous GNNs extend the MPNN framework to handle the multi-relational, multi-typed structure of real knowledge graphs, recommendation systems, and biomedical networks — domains where the type structure is often as important as the graph topology.

## References

- Sun, Y., Han, J., Yan, X., Yu, P. S., & Wu, T. (2011). PathSim: Meta Path-Based Top-K Similarity Search in Heterogeneous Information Networks. *VLDB 2011*.
- Schlichtkrull, M., Kipf, T. N., Bloem, P., van den Berg, R., Titov, I., & Welling, M. (2018). [Modeling Relational Data with Graph Convolutional Networks](https://arxiv.org/abs/1703.06103). *ESWC 2018* (R-GCN).
- Wang, X., Ji, H., Shi, C., Wang, B., Ye, Y., Cui, P., & Yu, P. S. (2019). [Heterogeneous Graph Attention Network](https://arxiv.org/abs/1903.07293). *WWW 2019* (HAN).
- Hu, Z., Dong, Y., Wang, K., & Sun, Y. (2020). [Heterogeneous Graph Transformer](https://arxiv.org/abs/2003.01332). *WWW 2020* (HGT).
