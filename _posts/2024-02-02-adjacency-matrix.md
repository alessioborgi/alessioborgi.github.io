---
layout: single
title: "The Graph Adjacency Matrix: A Graph in Matrix Form"
categories: [gnn]
book: gnn
tags: [graph, adjacency-matrix, fundamentals]
published: false
excerpt: "Before understanding GNNs, you need to understand how graphs are represented mathematically. The adjacency matrix is the foundation — a simple grid that tells you which nodes are connected."
author_profile: true
read_time: true
is_overview: false
subsection: fundamentals
icon: "📋"
read_mins: 3
permalink: /blog/gnn/adjacency-matrix/
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
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> The adjacency matrix A of a graph with N nodes is an N×N matrix where A[i][j] = 1 if nodes i and j are connected, and 0 otherwise. It's the primary mathematical representation used inside GNNs.
</div>

## What Is the Adjacency Matrix?

Take a graph with N nodes. The adjacency matrix A is an N×N grid where:

```
A[i][j] = 1    if there is an edge between node i and node j
A[i][j] = 0    otherwise
```

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 230" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <!-- Graph on the left -->
  <text x="110" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Graph G</text>
  <circle cx="60"  cy="80"  r="20" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="60"   y="85" text-anchor="middle" font-size="12" fill="#134e4a" font-weight="700">1</text>
  <circle cx="160" cy="55"  r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="160"  y="60" text-anchor="middle" font-size="12" fill="#1e3a5f" font-weight="700">2</text>
  <circle cx="160" cy="140" r="20" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="160"  y="145" text-anchor="middle" font-size="12" fill="#4c1d95" font-weight="700">3</text>
  <circle cx="60"  cy="165" r="20" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
  <text x="60"   y="170" text-anchor="middle" font-size="12" fill="#78350f" font-weight="700">4</text>
  <!-- Edges -->
  <line x1="79"  y1="72"  x2="140" y2="62"  stroke="#94a3b8" stroke-width="2"/><!-- 1-2 -->
  <line x1="140" y1="68"  x2="140" y2="123" stroke="#94a3b8" stroke-width="2"/><!-- 2-3 -->
  <line x1="79"  y1="157" x2="140" y2="148" stroke="#94a3b8" stroke-width="2"/><!-- 4-3 -->
  <line x1="60"  y1="100" x2="60"  y2="144" stroke="#94a3b8" stroke-width="2"/><!-- 1-4 -->
  <line x1="79"  y1="85"  x2="140" y2="133" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/><!-- 1-3 diagonal -->

  <!-- Adjacency matrix on the right -->
  <text x="370" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Adjacency Matrix A</text>
  <!-- Header row -->
  <text x="268" y="36" text-anchor="middle" font-size="9" fill="#6b7280">–</text>
  <text x="308" y="36" text-anchor="middle" font-size="10" fill="#0d9488" font-weight="700">1</text>
  <text x="348" y="36" text-anchor="middle" font-size="10" fill="#3b82f6" font-weight="700">2</text>
  <text x="388" y="36" text-anchor="middle" font-size="10" fill="#7c3aed" font-weight="700">3</text>
  <text x="428" y="36" text-anchor="middle" font-size="10" fill="#d97706" font-weight="700">4</text>
  <!-- Row labels -->
  <text x="268" y="70"  text-anchor="middle" font-size="10" fill="#0d9488" font-weight="700">1</text>
  <text x="268" y="104" text-anchor="middle" font-size="10" fill="#3b82f6" font-weight="700">2</text>
  <text x="268" y="138" text-anchor="middle" font-size="10" fill="#7c3aed" font-weight="700">3</text>
  <text x="268" y="172" text-anchor="middle" font-size="10" fill="#d97706" font-weight="700">4</text>
  <!-- Row 1 (node 1 connects to 2, 3, 4) -->
  <rect x="285" y="52" width="35" height="30" rx="3" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="303" y="71" text-anchor="middle" font-size="11" fill="#374151">0</text>
  <rect x="325" y="52" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="343" y="71" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <rect x="365" y="52" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="383" y="71" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <rect x="405" y="52" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="423" y="71" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <!-- Row 2 (connects to 1, 3) -->
  <rect x="285" y="86" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="303" y="105" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <rect x="325" y="86" width="35" height="30" rx="3" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="343" y="105" text-anchor="middle" font-size="11" fill="#374151">0</text>
  <rect x="365" y="86" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="383" y="105" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <rect x="405" y="86" width="35" height="30" rx="3" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="423" y="105" text-anchor="middle" font-size="11" fill="#374151">0</text>
  <!-- Row 3 (connects to 1, 2, 4) -->
  <rect x="285" y="120" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="303" y="139" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <rect x="325" y="120" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="343" y="139" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <rect x="365" y="120" width="35" height="30" rx="3" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="383" y="139" text-anchor="middle" font-size="11" fill="#374151">0</text>
  <rect x="405" y="120" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="423" y="139" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <!-- Row 4 (connects to 1, 3) -->
  <rect x="285" y="154" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="303" y="173" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <rect x="325" y="154" width="35" height="30" rx="3" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="343" y="173" text-anchor="middle" font-size="11" fill="#374151">0</text>
  <rect x="365" y="154" width="35" height="30" rx="3" fill="#d1fae5" stroke="#059669"/>
  <text x="383" y="173" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">1</text>
  <rect x="405" y="154" width="35" height="30" rx="3" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="423" y="173" text-anchor="middle" font-size="11" fill="#374151">0</text>

  <!-- Symmetric note -->
  <rect x="255" y="198" width="210" height="28" rx="6" fill="#fef3c7" stroke="#d97706"/>
  <text x="360" y="214" text-anchor="middle" font-size="9" fill="#78350f" font-weight="600">A is symmetric (undirected graph): A = Aᵀ</text>
</svg>
<figcaption>Figure 1: A graph with 4 nodes and 5 edges (left) and its 4×4 adjacency matrix (right). Green cells indicate edges; 0 cells indicate no edge. The diagonal is 0 (no self-loops by default).</figcaption>
</figure>
</div>

## Key Properties

**Symmetry:** For undirected graphs, A[i][j] = A[j][i] always — the matrix is symmetric. Directed graphs have asymmetric adjacency matrices.

**Degree:** The **degree** of node i is the number of edges it has. It equals the sum of row i in A: `deg(i) = Σⱼ A[i][j]`. The degree matrix D is a diagonal matrix where `D[i][i] = deg(i)`.

**Sparsity:** Real-world graphs are sparse — most node pairs have no edge. A social network with 1M users has O(10M) edges, not O(10¹²). Sparse matrix representations (edge lists, COO format) are crucial for efficiency.

**Powers of A:** `A²[i][j]` counts the number of paths of length 2 from i to j. More generally, `Aᵏ[i][j]` counts paths of length k. This is the mathematical basis for why GNN layers with k layers capture k-hop neighbourhoods.

## Weighted Graphs

In a weighted graph, `A[i][j] = w_{ij}` — the weight of the edge between i and j (0 if no edge). For molecules, this could be bond strength; for road networks, road capacity; for social networks, interaction frequency.

## Self-Loops

Some GNN formulations add self-loops by modifying the adjacency matrix: `Ã = A + I` (where I is the identity matrix). This ensures each node "sees itself" during aggregation — without this, a node's own features might be ignored.

This is exactly what GCN does (see the GCN post).

## In GNNs: Matrix Multiplication = Neighbourhood Aggregation

The most important use of A in GNNs: multiplying A by the feature matrix H performs one round of neighbourhood aggregation:

```
H_new = A · H
```

Row i of `A·H` is a sum of feature vectors of all neighbours of node i. This is precisely message passing: aggregate all neighbour features.

Normalising by degree: `D⁻¹ · A · H` gives the **mean** of neighbour features — the basis for many GNN designs.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>The adjacency matrix A encodes the graph's connectivity: A[i][j] = 1 if (i,j) is an edge.</li>
  <li>For undirected graphs, A is <strong>symmetric</strong>. The degree matrix D has degrees on the diagonal.</li>
  <li>Matrix-vector multiplication <strong>A·H aggregates neighbour features</strong> — the mathematical core of GNNs.</li>
  <li>Adding the identity (Ã = A+I) creates self-loops so each node includes its own features during aggregation.</li>
</ul>
</div>
