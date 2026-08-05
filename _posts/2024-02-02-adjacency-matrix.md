---
layout: single
title: "The Graph Adjacency Matrix: A Graph in Matrix Form"
categories: [gnn]
book: gnn
tags: [graph, adjacency-matrix, fundamentals]
published: true
excerpt: "Before understanding GNNs, you need to understand how graphs are represented mathematically. The adjacency matrix is the foundation — a simple grid that tells you which nodes are connected."
author_profile: true
read_time: true
is_overview: false
subsection: fundamentals
icon: "📋"
read_mins: 4
permalink: /blog/gnn/adjacency-matrix/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The adjacency matrix \(A\) of a graph with \(N\) nodes is an \(N \times N\) matrix where \(A_{ij} = 1\) if nodes \(i\) and \(j\) are connected, and \(0\) otherwise. It's the primary mathematical representation used inside GNNs.
</div>

## What Is the Adjacency Matrix?

Take a graph $$G = (V, E)$$ with $$N = \lvert V \rvert$$ nodes. The adjacency matrix $$A \in \{0,1\}^{N\times N}$$ is defined by

<div class="formula-box">
\[
A_{ij} =
\begin{cases}
1 & \text{if } (i,j) \in E,\\[2pt]
0 & \text{otherwise.}
\end{cases}
\]
</div>

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Intuition First:</strong> Think of the adjacency matrix as a truth table for "are these two nodes friends?" Row i, column j answers: did node i and node j shake hands? For undirected graphs the handshake is mutual, so the table is mirrored across the diagonal.</div>

**Symmetry:** For undirected graphs, $$A_{ij} = A_{ji}$$ always — that is, $$A = A^{\top}$$. Directed graphs have asymmetric adjacency matrices.

**Degree:** The **degree** $$d_i$$ of node $$i$$ is the number of edges incident to it. It equals the sum of row $$i$$ of $$A$$:

<div class="formula-box">
\[
d_i = \sum_{j=1}^{N} A_{ij} = \lvert \mathcal{N}(i) \rvert,
\]
</div>

where $$\mathcal{N}(i)$$ denotes the neighbourhood of node $$i$$. The degree matrix $$D = \mathrm{diag}(d_1,\ldots,d_N)$$ carries these degrees on its diagonal and zeros elsewhere.

**Sparsity:** Real-world graphs are sparse — most node pairs have no edge. A social network with $$10^6$$ users typically has on the order of $$10^7$$ edges, not the $$10^{12}$$ entries of the dense matrix. Sparse representations (edge lists, COO format) are crucial for efficiency.

**Powers of $$A$$:** the entry $$(A^2)_{ij}$$ counts the number of **walks** of length 2 from $$i$$ to $$j$$, and more generally $$(A^k)_{ij}$$ counts walks of length $$k$$. (A walk may repeat nodes and edges; a *path* may not, and there is no simple matrix formula for counting paths.) This is the mathematical basis for why a $$k$$-layer GNN captures the $$k$$-hop neighbourhood: $$(A^k)_{ij} > 0$$ exactly when $$j$$ is reachable from $$i$$ in $$k$$ steps.

## Weighted Graphs

In a weighted graph, $$A_{ij} = w_{ij}$$ — the weight of the edge between $$i$$ and $$j$$, and $$0$$ if there is no edge. For molecules this could be bond strength; for road networks, road capacity; for social networks, interaction frequency. The degree generalises to the *weighted degree* $$d_i = \sum_j w_{ij}$$.

## Self-Loops

Some GNN formulations add self-loops by modifying the adjacency matrix:

<div class="formula-box">
\[
\tilde{A} = A + I,
\]
</div>

where $$I$$ is the $$N \times N$$ identity matrix. This ensures each node "sees itself" during aggregation — without it, a node's own features would be dropped from the sum. The corresponding degree matrix is $$\tilde{D} = D + I$$.

This is exactly what GCN does, which then symmetrically normalises to form the propagation matrix $$\hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}$$ (see the GCN post).

## In GNNs: Matrix Multiplication = Neighbourhood Aggregation

The most important use of $$A$$ in GNNs: multiplying $$A$$ by the feature matrix $$H \in \mathbb{R}^{N \times d}$$ (row $$v$$ holds node $$v$$'s feature vector $$h_v$$) performs one round of neighbourhood aggregation:

<div class="formula-box">
\[
H_{\text{new}} = A H, \qquad \text{so} \qquad (H_{\text{new}})_v = \sum_{u \in \mathcal{N}(v)} h_u .
\]
</div>

Row $$v$$ of $$AH$$ is the sum of the feature vectors of all neighbours of node $$v$$. This is precisely message passing: aggregate all neighbour features.

Normalising by degree gives the **mean** of neighbour features — the basis for many GNN designs:

<div class="formula-box">
\[
D^{-1} A H, \qquad \text{row } v = \frac{1}{d_v}\sum_{u \in \mathcal{N}(v)} h_u .
\]
</div>

**Step-by-step worked example.** Consider a 3-node path graph: 1—2—3.

```
Adjacency matrix A:        Feature matrix H (each node has 1 feature):
  1  2  3                    node 1: [2]
1[0  1  0]                   node 2: [4]
2[1  0  1]                   node 3: [6]
3[0  1  0]

A · H:
  row 1 = 0·[2] + 1·[4] + 0·[6] = [4]   ← node 1 collects from node 2
  row 2 = 1·[2] + 0·[4] + 1·[6] = [8]   ← node 2 collects from nodes 1 and 3
  row 3 = 0·[2] + 1·[4] + 0·[6] = [4]   ← node 3 collects from node 2
```

With $$\tilde{A} = A + I$$ (self-loops added), node 2 would collect $$2+4+6 = 12$$ — including its own feature.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Matrix multiplication with A is <em>simultaneously</em> performing neighbourhood aggregation for every node in one shot. This is why GNNs can be implemented so efficiently — the entire graph is processed with a single sparse matrix multiply.</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>The adjacency matrix \(A\) encodes the graph's connectivity: \(A_{ij} = 1\) if \((i,j)\) is an edge.</li>
  <li>For undirected graphs \(A\) is <strong>symmetric</strong>, \(A = A^{\top}\). The degree matrix \(D = \mathrm{diag}(d_1,\ldots,d_N)\) has the degrees on its diagonal.</li>
  <li>Matrix multiplication <strong>\(AH\) aggregates neighbour features</strong> — the mathematical core of GNNs — and \(D^{-1}AH\) averages them.</li>
  <li>\((A^k)_{ij}\) counts <em>walks</em> (not paths) of length \(k\) from \(i\) to \(j\).</li>
  <li>Adding the identity, \(\tilde{A} = A + I\), creates self-loops so each node includes its own features during aggregation.</li>
</ul>
</div>

## References

- Hamilton, W. L. (2020). [Graph Representation Learning](https://www.cs.mcgill.ca/~wlh/grl_book/). *Synthesis Lectures on Artificial Intelligence and Machine Learning*.
- Bondy, J. A., & Murty, U. S. R. (2008). *Graph Theory*. Springer.
