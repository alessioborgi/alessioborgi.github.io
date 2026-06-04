---
layout: single
title: "Directed, Undirected, Weighted, and Heterogeneous Graphs"
categories: [gnn]
book: gnn
subsection: fundamentals
tags: [graph-types, directed, heterogeneous, weighted, multigraph]
published: true
excerpt: "Not all graphs are equal. Directed edges, edge weights, multiple node/edge types — each variant requires different GNN design choices."
author_profile: true
read_time: true
is_overview: false
icon: "↔️"
read_mins: 4
permalink: /blog/gnn/graph-types/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Undirected graphs have symmetric relationships; directed graphs have asymmetric ones (A ≠ Aᵀ). Weighted graphs encode relationship strength. Heterogeneous graphs have multiple node/edge types. Each variant arises naturally in real data and requires adapted GNN designs.
</div>

## Undirected Graphs

In an **undirected graph**, edges have no direction — (u,v) ∈ E implies (v,u) ∈ E. The adjacency matrix is symmetric: A = Aᵀ.

**Real examples:** molecular bonds (a bond between C and O is mutual), social friendships (Facebook), co-authorship networks.

**GNN implication:** each node aggregates from its neighbours symmetrically. The message from u to v is the same as from v to u.

## Directed Graphs

In a **directed graph** (digraph), edges have a direction. Edge (u→v) ∈ E does not imply (v→u). The adjacency matrix is generally asymmetric: A ≠ Aᵀ.

**Real examples:** citation networks (A cites B, but B doesn't cite A), Twitter follows, web links, dependency graphs.

**GNN implication:** a node can receive messages from in-neighbours (who point to it) and send messages to out-neighbours (who it points to). Many GNNs handle this by treating in-edges and out-edges separately, or by symmetrising A at the cost of losing directionality.

## Weighted Graphs

In a **weighted graph**, each edge has a scalar (or vector) weight w_{uv} ∈ ℝ. The adjacency matrix becomes A[u,v] = w_{uv}.

**Real examples:** road networks (road distance), correlation networks (feature correlation), similarity graphs (cosine similarity between embeddings).

**GNN implication:** edge weights naturally modulate message strength. Messages from strongly-connected neighbours contribute more than messages from weakly-connected ones.

## Bipartite Graphs

A **bipartite graph** has two disjoint node sets U and V, with edges only between U and V (never within U or within V).

**Real examples:** user-item graphs (recommendation), author-paper graphs (authorship), drug-protein interaction graphs.

**GNN implication:** message passing alternates between the two node sets. Specialised bipartite GNNs propagate information from items to users and back.

## Multiplex and Multi-relational Graphs

A **multi-relational graph** has multiple edge types — the same pair of nodes can be connected by edges of different types.

**Real examples:** knowledge graphs (TransE, DistMult) where entity pairs are connected by typed relations (was_born_in, works_at, married_to); social networks with typed interactions (friend, colleague, family).

**GNN implication:** R-GCN and similar architectures learn separate weight matrices per relation type, aggregating typed messages separately before combining.

## Heterogeneous Graphs

A **heterogeneous graph** has multiple **node types** and multiple **edge types**:

```
Node types: {Paper, Author, Venue}
Edge types: {Author→Paper: wrote, Paper→Venue: published_at, Paper→Paper: cites}
```

**Real examples:** academic networks (DBLP, OAG), biomedical knowledge graphs (drug→protein→disease), e-commerce graphs (user→item→category).

**GNN implication:** nodes of different types have different feature spaces and semantics. You cannot apply the same weight matrix to messages from a Paper and a Venue. Heterogeneous GNNs (HAN, HGT, RGCN) maintain type-specific transformations.

<div class="insight-box">
<strong>Homogeneous vs Heterogeneous:</strong> Most classical GNN papers (GCN, GAT, GIN, GraphSAGE) assume homogeneous graphs — one node type, one edge type. Real-world graphs are almost never homogeneous. Understanding the type structure of your data is the first step in choosing an appropriate GNN.
</div>

## Hypergraphs

A **hypergraph** generalises graphs: hyperedges can connect any number of nodes (not just pairs).

**Real examples:** group memberships (a paper can have 5 authors — one hyperedge connecting all 5), co-purchase events, multi-agent interactions.

**GNN implication:** hypergraph neural networks convert hyperedges to bipartite graphs (node–hyperedge–node) and propagate through both.

## Dynamic Graphs

A **dynamic graph** evolves over time: nodes and edges appear and disappear.

**Real examples:** communication networks (who emails whom at time t), social networks (friendships change), financial transaction networks.

**GNN implication:** snapshot-based models process sequences of graph snapshots; event-based models (Temporal Graph Networks) process continuous-time events.

## Summary

| Graph type | Key property | Example | GNN challenge |
|-----------|-------------|---------|--------------|
| Undirected | A = Aᵀ | Molecules, friendships | Symmetric aggregation |
| Directed | A ≠ Aᵀ | Citations, follows | Direction-aware aggregation |
| Weighted | A[u,v] = w | Roads, correlations | Weight-modulated messages |
| Bipartite | Two node sets | User-item, author-paper | Alternating propagation |
| Multi-relational | Multiple edge types | Knowledge graphs | Type-specific weights |
| Heterogeneous | Multiple node+edge types | Academic networks | Type-aware architectures |
| Hypergraph | Edges connect >2 nodes | Group memberships | Hyperedge aggregation |
| Dynamic | Graph changes over time | Communication networks | Temporal modeling |

Recognising which graph type your data is determines which GNN variant to use. Starting with a homogeneous GNN on a heterogeneous graph is a common and costly mistake.

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv preprint*.
- Hamilton, W. L. (2020). [Graph Representation Learning](https://www.cs.mcgill.ca/~wlh/grl_book/). *Synthesis Lectures on Artificial Intelligence and Machine Learning*.
