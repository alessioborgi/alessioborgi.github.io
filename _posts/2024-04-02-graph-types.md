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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight: Choosing the Wrong Graph Type Is Costly.</strong> Treating a directed citation graph as undirected loses the "A cites B but B doesn't cite A" signal — which matters when predicting paper influence. Treating a heterogeneous academic graph (papers, authors, venues) as homogeneous forces the same weight matrix on fundamentally incompatible node types. Always identify your graph type before designing the GNN.</div>

## Hypergraphs

A **hypergraph** generalises graphs: hyperedges can connect any number of nodes (not just pairs).

**Real examples:** group memberships (a paper can have 5 authors — one hyperedge connecting all 5), co-purchase events, multi-agent interactions.

**GNN implication:** hypergraph neural networks convert hyperedges to bipartite graphs (node–hyperedge–node) and propagate through both.

<style>
@keyframes directed-flow {
  0%   { stroke-dashoffset: 24; opacity: 0.4; }
  100% { stroke-dashoffset: 0;  opacity: 1; }
}
.directed-edge { stroke-dasharray: 8 4; animation: directed-flow 1.2s linear infinite; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="gt-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#0d9488"/></marker>
    <marker id="gt-arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#7c3aed"/></marker>
  </defs>
  <!-- Undirected panel -->
  <text x="80"  y="14" text-anchor="middle" font-size="10" font-weight="700" fill="#374151">Undirected (A = Aᵀ)</text>
  <circle cx="40"  cy="80" r="18" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="40" y="84" text-anchor="middle" font-size="11" fill="#134e4a" font-weight="700">P</text>
  <circle cx="120" cy="80" r="18" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="120" y="84" text-anchor="middle" font-size="11" fill="#134e4a" font-weight="700">Q</text>
  <line x1="58" y1="80" x2="102" y2="80" stroke="#0d9488" stroke-width="2.5"/>
  <text x="80" y="108" text-anchor="middle" font-size="9" fill="#0d9488">mutual bond</text>

  <!-- Directed panel -->
  <text x="260" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="#374151">Directed (A ≠ Aᵀ)</text>
  <circle cx="210" cy="80" r="18" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="210" y="84" text-anchor="middle" font-size="11" fill="#4c1d95" font-weight="700">A</text>
  <circle cx="310" cy="80" r="18" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
  <text x="310" y="84" text-anchor="middle" font-size="11" fill="#78350f" font-weight="700">B</text>
  <!-- A cites B (one direction) -->
  <line x1="228" y1="74" x2="292" y2="74" stroke="#7c3aed" stroke-width="2.5" marker-end="url(#gt-arr2)" class="directed-edge"/>
  <text x="260" y="62" text-anchor="middle" font-size="8" fill="#7c3aed">A cites B</text>
  <text x="260" y="108" text-anchor="middle" font-size="9" fill="#d97706">B does NOT cite A</text>

  <!-- Weighted panel -->
  <text x="420" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="#374151">Weighted</text>
  <circle cx="380" cy="80" r="18" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="380" y="84" text-anchor="middle" font-size="11" fill="#1e3a5f" font-weight="700">X</text>
  <circle cx="460" cy="80" r="18" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
  <text x="460" y="84" text-anchor="middle" font-size="11" fill="#7f1d1d" font-weight="700">Y</text>
  <line x1="398" y1="80" x2="442" y2="80" stroke="#3b82f6" stroke-width="5" opacity="0.7"/>
  <text x="420" y="68" text-anchor="middle" font-size="9" fill="#1e40af" font-weight="700">w=0.9</text>
  <text x="420" y="108" text-anchor="middle" font-size="9" fill="#3b82f6">thick = high weight</text>
</svg>
<figcaption>Figure 1: Undirected (symmetric, mutual), directed (asymmetric, citation flows one way), and weighted (edge thickness encodes strength). Each type requires different GNN design choices.</figcaption>
</figure>
</div>

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
