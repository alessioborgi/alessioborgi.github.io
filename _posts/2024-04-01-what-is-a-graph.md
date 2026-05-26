---
layout: single
title: "What Is a Graph? Nodes, Edges, Features, and Labels"
date: 2024-04-01
categories: [gnn]
book: gnn
subsection: fundamentals
tags: [graph-theory, nodes, edges, features, labels]
excerpt: "A graph is a set of nodes connected by edges — but the power of GNNs comes from the features attached to nodes and edges, and the labels we want to predict."
author_profile: true
read_time: true
is_overview: false
icon: "🔵"
read_mins: 4
permalink: /blog/gnn/what-is-a-graph/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A graph G = (V, E) has nodes (entities) and edges (relationships). Nodes carry feature vectors X; edges can carry feature vectors E. Labels Y can be at the node level, edge level, or graph level. GNNs learn to map (G, X) → Y.
</div>

## Graphs Are Everywhere

Most structured data is relational — entities connected by relationships:

- **Social networks:** users (nodes) connected by friendships (edges)
- **Molecules:** atoms (nodes) connected by bonds (edges)
- **Citation networks:** papers (nodes) connected by citations (edges)
- **Road networks:** intersections (nodes) connected by roads (edges)
- **Knowledge graphs:** entities (nodes) connected by relations (typed edges)

Standard deep learning assumes inputs are grids (images), sequences (text), or fixed-size vectors. Graphs have variable size, irregular structure, and no canonical ordering — making them fundamentally different.

## Graph Anatomy

A graph **G = (V, E)** consists of:

- **V** — a set of **nodes** (also called vertices). |V| = N is the number of nodes.
- **E ⊆ V × V** — a set of **edges**. Each edge (u, v) ∈ E indicates a relationship between nodes u and v.

<div class="math-box">
G = (V, E) &nbsp;&nbsp; |V| = N &nbsp;&nbsp; |E| = M
</div>

### Node Features

Nodes are rarely bare identifiers. Each node v ∈ V has a feature vector **x_v ∈ ℝ^d**. Stacked into a matrix:

<div class="math-box">
X ∈ ℝ^{N × d}   where X[v] = x_v
</div>

Examples:
- In a citation network: x_v = bag-of-words representation of the paper
- In a molecule: x_v = atom type, charge, hybridisation state
- In a social network: x_v = age, location, activity features

### Edge Features

Edges can also carry features **e_{uv} ∈ ℝ^k**:
- In a molecule: bond type (single/double/aromatic), bond length
- In a knowledge graph: relation type (one-hot)
- In a road network: distance, speed limit, traffic volume

### Labels

What you want to predict determines the **task level**:

| Task level | Label | Example |
|-----------|-------|---------|
| Node | y_v per node | Paper topic (node classification) |
| Edge | y_{uv} per edge | Will users u and v become friends? (link prediction) |
| Graph | y_G per graph | Is this molecule toxic? (graph classification) |

## The Adjacency Matrix

A graph's structure is encoded in an **adjacency matrix A ∈ {0,1}^{N×N}**:

<div class="math-box">
A[u,v] = 1 if (u,v) ∈ E, else 0
</div>

For an undirected graph, A is symmetric. For a weighted graph, A[u,v] = weight of edge (u,v).

The adjacency matrix is rarely stored explicitly for large graphs (too sparse) — instead, edge lists or sparse formats are used.

## Neighbourhood

The **neighbourhood** of node v is the set of nodes directly connected to it:

<div class="math-box">
N(v) = { u ∈ V : (u,v) ∈ E }
</div>

The **degree** of node v is |N(v)| — the number of neighbours. Degree is one of the most fundamental structural properties of a node.

## What GNNs Learn

A GNN takes as input:
- The graph structure (adjacency matrix or edge list)
- Node features X
- (Optionally) Edge features

And produces as output:
- **Node embeddings** h_v ∈ ℝ^d' for each node (used for node classification)
- **Edge embeddings** h_{uv} for each edge (used for link prediction)
- **Graph embedding** h_G ∈ ℝ^d' (used for graph classification)

The core operation: each node aggregates information from its neighbours, combines it with its own features, and updates its representation — iterating this over multiple rounds.

<div class="insight-box">
<strong>Key difference from grids and sequences:</strong> In a sequence, every position has exactly 2 neighbours (left and right). In an image, every pixel has exactly 8. In a graph, nodes can have 0 to thousands of neighbours, and there is no canonical ordering of those neighbours. This irregularity is the central challenge that GNN architectures must handle.
</div>

## Summary

| Concept | Notation | Example |
|---------|---------|---------|
| Node set | V, |V|=N | Papers, atoms, users |
| Edge set | E, |E|=M | Citations, bonds, friendships |
| Node features | X ∈ ℝ^{N×d} | Bag-of-words, atom type |
| Edge features | E ∈ ℝ^{M×k} | Bond type, relation type |
| Adjacency matrix | A ∈ {0,1}^{N×N} | Who is connected to whom |
| Node label | y_v | Paper topic |
| Graph label | y_G | Molecule toxicity |

Graphs are the natural language of relational data. GNNs are the deep learning architectures that speak it.

## References

- Bondy, J. A., & Murty, U. S. R. (2008). *Graph Theory*. Springer. — Standard reference for graph theory fundamentals.
- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv preprint*.
