---
layout: single
title: "What Is a Graph? Nodes, Edges, Features, and Labels"
categories: [gnn]
book: gnn
subsection: fundamentals
tags: [graph-theory, nodes, edges, features, labels]
published: true
excerpt: "A graph is a set of nodes connected by edges — but the power of GNNs comes from the features attached to nodes and edges, and the labels we want to predict."
author_profile: true
read_time: true
is_overview: false
icon: "🔵"
read_mins: 5
permalink: /blog/gnn/what-is-a-graph/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A graph \(G = (V, E)\) has nodes (entities) and edges (relationships). Node features are stacked into a matrix \(X\); edges can carry their own feature vectors. Labels may be attached at the node, edge, or graph level. A GNN learns a map \((G, X) \mapsto Y\).
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

A graph $$G = (V, E)$$ consists of:

- $$V$$ — a set of **nodes** (also called vertices), with $$N = \lvert V \rvert$$ the number of nodes.
- $$E \subseteq V \times V$$ — a set of **edges**. An edge $$(u, v) \in E$$ records a relationship between nodes $$u$$ and $$v$$.

<div class="formula-box">
\[
G = (V, E), \qquad N = \lvert V \rvert, \qquad M = \lvert E \rvert.
\]
</div>

### Node Features

Nodes are rarely bare identifiers. Each node $$v \in V$$ carries a feature vector $$x_v \in \mathbb{R}^{d}$$. Stacking these row-wise gives the node feature matrix:

<div class="formula-box">
\[
X \in \mathbb{R}^{N \times d}, \qquad X_{v,:} = x_v^{\top}.
\]
</div>

Examples:
- In a citation network: $$x_v$$ = bag-of-words representation of the paper
- In a molecule: $$x_v$$ = atom type, charge, hybridisation state
- In a social network: $$x_v$$ = age, location, activity features

### Edge Features

Edges can also carry features $$e_{uv} \in \mathbb{R}^{k}$$, stacked into an edge feature matrix $$X_E \in \mathbb{R}^{M \times k}$$:
- In a molecule: bond type (single/double/aromatic), bond length
- In a knowledge graph: relation type (one-hot)
- In a road network: distance, speed limit, traffic volume

### Labels

What you want to predict determines the **task level**:

| Task level | Label | Example |
|-----------|-------|---------|
| Node | $$y_v$$ per node | Paper topic (node classification) |
| Edge | $$y_{uv}$$ per edge | Will users $$u$$ and $$v$$ become friends? (link prediction) |
| Graph | $$y_G$$ per graph | Is this molecule toxic? (graph classification) |

## Concrete Example: A Molecule as a Graph

Consider water (H₂O), using the feature template (atomic number, valence electrons, electronegativity × 10):
- **Nodes:** O (oxygen, node 0), H (hydrogen, node 1), H (hydrogen, node 2)
- **Node features:** $$x_0 = [8,\, 6,\, 34]$$ for oxygen, and $$x_1 = x_2 = [1,\, 1,\, 22]$$ for the two hydrogens
- **Edges:** $$(0,1)$$ and $$(0,2)$$ — two O–H bonds
- **Edge features:** $$e_{01} = e_{02} = [1,\, 0.96]$$ (bond order 1, bond length 0.96 Å)
- **Graph label:** $$y_G = 1$$ (polar molecule, for a binary classification task)

This small example shows every component: node features capturing chemistry, edge features capturing bond properties, and a graph-level label for the prediction task.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The same GNN architecture can process both H₂O (3 nodes) and a drug molecule (50 nodes) because the message-passing computation is defined per-node, not per-position. There is no "slot 1" or "slot 2" — only nodes and their connections. This is what makes GNNs fundamentally different from fixed-input-size networks like MLPs.</div>

## The Adjacency Matrix

A graph's structure is encoded in an **adjacency matrix** $$A \in \{0,1\}^{N \times N}$$:

<div class="formula-box">
\[
A_{uv} =
\begin{cases}
1 & \text{if } (u,v) \in E,\\[2pt]
0 & \text{otherwise.}
\end{cases}
\]
</div>

For an undirected graph $$A$$ is symmetric, i.e. $$A = A^{\top}$$. For a weighted graph, $$A_{uv}$$ holds the weight of edge $$(u,v)$$ instead of a 0/1 indicator.

The adjacency matrix is rarely stored explicitly for large graphs (too sparse) — instead, edge lists or sparse formats are used.

## Neighbourhood

The **neighbourhood** of node $$v$$ is the set of nodes directly connected to it:

<div class="formula-box">
\[
\mathcal{N}(v) = \{\, u \in V : (u,v) \in E \,\}.
\]
</div>

The **degree** of node $$v$$ is $$\deg(v) = \lvert \mathcal{N}(v) \rvert$$ — the number of neighbours. Degree is one of the most fundamental structural properties of a node.

## What GNNs Learn

A GNN takes as input:
- The graph structure (adjacency matrix or edge list)
- Node features $$X$$
- (Optionally) edge features

And produces as output:
- **Node embeddings** $$h_v \in \mathbb{R}^{d'}$$ for each node (used for node classification)
- **Edge embeddings** $$h_{uv}$$ for each edge (used for link prediction)
- **Graph embedding** $$h_G \in \mathbb{R}^{d'}$$ (used for graph classification)

The core operation: each node aggregates information from its neighbours, combines it with its own features, and updates its representation — iterating this over multiple rounds.

<div class="insight-box">
<strong>Key difference from grids and sequences:</strong> In a sequence, an interior position has two neighbours in a fixed order — left and right. In an image, an interior pixel has eight neighbours under 8-connectivity, again in a fixed spatial arrangement. In a graph, a node may have anywhere from zero to many thousands of neighbours, and those neighbours come with no canonical ordering. This irregularity is the central challenge that GNN architectures must handle.
</div>

## Summary

| Concept | Notation | Example |
|---------|---------|---------|
| Node set | $$V$$, with $$N = \lvert V \rvert$$ | Papers, atoms, users |
| Edge set | $$E$$, with $$M = \lvert E \rvert$$ | Citations, bonds, friendships |
| Node features | $$X \in \mathbb{R}^{N \times d}$$ | Bag-of-words, atom type |
| Edge features | $$X_E \in \mathbb{R}^{M \times k}$$ | Bond type, relation type |
| Adjacency matrix | $$A \in \{0,1\}^{N \times N}$$ | Who is connected to whom |
| Neighbourhood | $$\mathcal{N}(v)$$ | Direct neighbours of $$v$$ |
| Node label | $$y_v$$ | Paper topic |
| Graph label | $$y_G$$ | Molecule toxicity |

Graphs are the natural language of relational data. GNNs are the deep learning architectures that speak it.

## References

- Bondy, J. A., & Murty, U. S. R. (2008). *Graph Theory*. Springer. — Standard reference for graph theory fundamentals.
- Hamilton, W. L. (2020). [Graph Representation Learning](https://www.cs.mcgill.ca/~wlh/grl_book/). *Synthesis Lectures on Artificial Intelligence and Machine Learning*.
- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv preprint*.
