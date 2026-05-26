---
layout: single
title: "Graph Neural Networks: Learning on Graphs"
date: 2024-02-01
categories: [gnn]
book: gnn
tags: [graph, neural-network, overview]
excerpt: "Graphs are everywhere — molecules, social networks, road maps, knowledge bases. Graph Neural Networks learn from this relational structure by propagating information between connected nodes. Here's the complete picture."
author_profile: true
read_time: true
is_overview: true
icon: "🕸️"
read_mins: 5
permalink: /blog/gnn/overview/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.next-posts { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.2rem; }
.next-posts h3 { margin-top: 0; font-size: 1rem; color: #374151; }
.next-posts ul { margin: 0; padding-left: 1.2rem; }
.next-posts li { margin-bottom: .3rem; font-size: .92rem; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> GNNs learn vector representations for nodes (and graphs) by iteratively aggregating information from neighbourhoods. They outperform flat neural networks on any data that is naturally relational — molecules, social graphs, knowledge graphs, road networks, and more.
</div>

## Graphs Are Everywhere

A **graph** G = (V, E) consists of:
- **Nodes** (V): entities — atoms, people, papers, intersections.
- **Edges** (E): relationships — bonds, friendships, citations, roads.
- **Features** on nodes and/or edges: atom type, age, year, speed limit.

Real-world data that's naturally a graph:
- **Molecules:** atoms = nodes, bonds = edges. Predicting drug toxicity or binding affinity.
- **Social networks:** users = nodes, follows/friends = edges. Recommendation, fraud detection.
- **Knowledge graphs:** entities = nodes, relations = edges. Question answering, link prediction.
- **Citation networks:** papers = nodes, citations = edges. Classifying papers by topic.
- **Road networks:** intersections = nodes, roads = edges. Route planning, traffic prediction.

## Why Not Just Use Standard Neural Networks?

A standard MLP takes a fixed-size vector as input. Graphs have:
- **Variable size** — different graphs have different numbers of nodes and edges.
- **No canonical ordering** — there's no "first" node; permuting nodes shouldn't change predictions.
- **Relational structure** — the patterns live in the connections, not just the individual features.

GNNs are designed to respect all three of these properties.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 260" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="ag1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Graph with nodes and features -->
  <text x="140" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">A Simple Graph</text>
  <!-- Nodes -->
  <circle cx="80"  cy="80"  r="22" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="80"   y="76"  text-anchor="middle" font-size="11" fill="#134e4a" font-weight="700">A</text>
  <text x="80"   y="90"  text-anchor="middle" font-size="8"  fill="#134e4a">C: atom</text>
  <circle cx="200" cy="60"  r="22" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="200"  y="56"  text-anchor="middle" font-size="11" fill="#1e3a5f" font-weight="700">B</text>
  <text x="200"  y="70"  text-anchor="middle" font-size="8"  fill="#1e3a5f">N: atom</text>
  <circle cx="200" cy="160" r="22" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="200"  y="156" text-anchor="middle" font-size="11" fill="#4c1d95" font-weight="700">C</text>
  <text x="200"  y="170" text-anchor="middle" font-size="8"  fill="#4c1d95">O: atom</text>
  <circle cx="80"  cy="180" r="22" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
  <text x="80"   y="176" text-anchor="middle" font-size="11" fill="#78350f" font-weight="700">D</text>
  <text x="80"   y="190" text-anchor="middle" font-size="8"  fill="#78350f">H: atom</text>
  <!-- Edges -->
  <line x1="99"  y1="91"  x2="179" y2="74"  stroke="#94a3b8" stroke-width="2"/>
  <line x1="179" y1="74"  x2="179" y2="141" stroke="#94a3b8" stroke-width="2"/>
  <line x1="99"  y1="168" x2="178" y2="148" stroke="#94a3b8" stroke-width="2"/>
  <line x1="80"  y1="102" x2="80"  y2="158" stroke="#94a3b8" stroke-width="2"/>
  <!-- Edge labels -->
  <text x="138" y="76" text-anchor="middle" font-size="9" fill="#6b7280">single</text>
  <text x="188" y="110" text-anchor="middle" font-size="9" fill="#6b7280">double</text>

  <!-- Arrow -->
  <line x1="250" y1="120" x2="280" y2="120" stroke="#6b7280" stroke-width="1.5" marker-end="url(#ag1)"/>
  <text x="265" y="112" text-anchor="middle" font-size="9" fill="#6b7280">GNN</text>

  <!-- Output: node embeddings -->
  <text x="390" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Node Embeddings</text>
  <circle cx="310" cy="80"  r="22" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="310"  y="77"  text-anchor="middle" font-size="11" fill="#134e4a" font-weight="700">A</text>
  <text x="350"  y="84"  text-anchor="start"  font-size="8"  fill="#374151">[0.2, 0.8, ...]</text>
  <circle cx="310" cy="130" r="22" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="310"  y="127" text-anchor="middle" font-size="11" fill="#1e3a5f" font-weight="700">B</text>
  <text x="350"  y="134" text-anchor="start"  font-size="8"  fill="#374151">[0.5, 0.3, ...]</text>
  <circle cx="310" cy="180" r="22" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="310"  y="177" text-anchor="middle" font-size="11" fill="#4c1d95" font-weight="700">C</text>
  <text x="350"  y="184" text-anchor="start"  font-size="8"  fill="#374151">[0.1, 0.9, ...]</text>

  <!-- Task labels -->
  <rect x="290" y="218" width="215" height="36" rx="6" fill="#fef3c7" stroke="#d97706"/>
  <text x="398" y="233" text-anchor="middle" font-size="9" font-weight="700" fill="#78350f">Downstream tasks:</text>
  <text x="398" y="247" text-anchor="middle" font-size="9" fill="#374151">Node classification · Link prediction · Graph classification</text>
</svg>
<figcaption>Figure 1: A GNN takes a graph with node features (atom types) and produces rich node embeddings that capture local and global structure. These embeddings support downstream tasks.</figcaption>
</figure>
</div>

## The Core Idea: Aggregate from Neighbours

Every GNN follows the same fundamental principle, called **message passing**:

> Each node's new representation = function(its current representation, representations of its neighbours)

After k iterations, node v's embedding captures information from all nodes up to k hops away (its k-hop neighbourhood).

This is beautiful because:
- Nearby nodes influence each other (just like in the real world).
- The same aggregation function works on graphs of any size.
- The function is learned from data, so it adapts to the task.

## Three Task Levels

GNNs can produce predictions at three granularities:

| Level | What you predict | Example |
|---|---|---|
| **Node** | Label for each node | Is this user a bot? |
| **Edge** | Label or score for each edge | Will A befriend B? |
| **Graph** | Label for the whole graph | Is this molecule toxic? |

For node tasks: use the node embeddings directly. For graph tasks: **readout** (pooling) the node embeddings into a single graph vector.

## The Landscape of GNN Architectures

| Model | Year | Key idea |
|---|---|---|
| GCN | 2016 | Spectral convolution → normalised averaging |
| GAT | 2018 | Attention weights on edges |
| GraphSAGE | 2017 | Inductive learning via neighbourhood sampling |
| GIN | 2019 | Most expressive aggregator (sum + MLP) |
| Sheaf NN | 2022+ | Section-space diffusion, generalises GCN |

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Graphs model relational data: atoms, users, papers, intersections — any entities with relationships.</li>
  <li>GNNs learn by <strong>iterative neighbourhood aggregation</strong>: after k layers, each node knows about its k-hop neighbourhood.</li>
  <li>The same model works on graphs of any size and any node ordering — it's permutation invariant/equivariant.</li>
  <li>Supports node-, edge-, and graph-level predictions via readout pooling.</li>
</ul>
</div>

<div class="next-posts">
<h3>📚 Read Next</h3>
<ul>
  <li><a href="/blog/gnn/adjacency-matrix/">Graph Adjacency Matrix: The Foundation</a></li>
  <li><a href="/blog/gnn/graph-laplacian/">The Graph Laplacian: Spectral Graph Theory</a></li>
  <li><a href="/blog/gnn/message-passing/">Message Passing: The Universal GNN Framework</a></li>
</ul>
</div>
