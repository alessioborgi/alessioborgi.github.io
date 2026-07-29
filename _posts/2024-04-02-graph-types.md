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
read_mins: 7
permalink: /blog/gnn/graph-types/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Undirected graphs have symmetric relationships; directed graphs have asymmetric ones (\(A \neq A^{\top}\)). Weighted graphs encode relationship strength. Bipartite, multigraph, multi-relational, heterogeneous, and hypergraph structures each relax a different assumption. Every variant arises naturally in real data and requires an adapted GNN design.
</div>

## Undirected Graphs

In an **undirected graph**, edges have no direction — $$(u,v) \in E$$ implies $$(v,u) \in E$$. The adjacency matrix is symmetric: $$A = A^{\top}$$.

**Real examples:** molecular bonds (a bond between C and O is mutual), social friendships (Facebook), co-authorship networks.

**GNN implication:** each node aggregates from its neighbours symmetrically. The message from u to v is the same as from v to u.

## Directed Graphs

In a **directed graph** (digraph), edges are ordered pairs. An edge $$(u,v) \in E$$ points from $$u$$ to $$v$$ and does not imply $$(v,u) \in E$$, so the adjacency matrix is generally asymmetric: $$A \neq A^{\top}$$, with $$A_{uv} = 1$$ recording the edge $$u \to v$$.

**Real examples:** citation networks (A cites B, but B doesn't cite A), Twitter follows, web links, dependency graphs.

**GNN implication:** a node can receive messages from in-neighbours (who point to it) and send messages to out-neighbours (who it points to). Many GNNs handle this by treating in-edges and out-edges separately, or by symmetrising A at the cost of losing directionality.

## Weighted Graphs

In a **weighted graph**, each edge carries a scalar weight $$w_{uv} \in \mathbb{R}$$, and the adjacency matrix stores that weight rather than a 0/1 indicator: $$A_{uv} = w_{uv}$$ when $$(u,v) \in E$$, and $$0$$ otherwise.

**Real examples:** road networks (road distance), correlation networks (feature correlation), similarity graphs (cosine similarity between embeddings).

**GNN implication:** edge weights naturally modulate message strength. Messages from strongly-connected neighbours contribute more than messages from weakly-connected ones.

## Bipartite Graphs

A **bipartite graph** partitions the node set into two disjoint parts, $$V = U \sqcup W$$, with every edge joining a node in $$U$$ to a node in $$W$$ — never two nodes within the same part. Equivalently, a graph is bipartite exactly when it contains no odd-length cycle.

**Real examples:** user-item graphs (recommendation), author-paper graphs (authorship), drug-protein interaction graphs.

**GNN implication:** message passing alternates between the two node sets. Specialised bipartite GNNs propagate information from items to users and back.

## Multigraphs

A **multigraph** allows more than one edge between the same ordered pair of nodes (**parallel edges**), and often self-loops $$(v,v)$$ as well. The edge set is therefore a multiset rather than a subset of $$V \times V$$, and a single 0/1 adjacency matrix can no longer represent the graph — you either store integer edge counts in $$A$$ or keep an explicit edge list.

**Real examples:** flight networks (several distinct flights between the same two airports), transaction networks (repeated payments between the same two accounts), road networks with parallel carriageways.

**GNN implication:** parallel edges each send their own message, so a node can receive several distinct messages from the same neighbour. Frameworks that index messages by edge (rather than by neighbour) handle this without modification.

**Careful:** a multigraph is about *how many* edges may join a pair of nodes; a multi-relational graph, next, is about *what type* those edges are. The two are independent, and a graph can be both.

## Multi-relational Graphs

A **multi-relational graph** attaches a type $$r \in \mathcal{R}$$ to every edge, so edges are triples $$(u, r, v)$$. The same pair of nodes may be connected by edges of several different types, and there is one adjacency matrix $$A_r$$ per relation.

**Real examples:** knowledge graphs such as Freebase and Wikidata, where entity pairs are connected by typed relations (`born_in`, `works_at`, `married_to`); social networks with typed interactions (friend, colleague, family). TransE and DistMult are *embedding models* for such graphs, not graph types themselves.

**GNN implication:** R-GCN and similar architectures learn a separate weight matrix per relation type, aggregating typed messages separately before combining them.

## Heterogeneous Graphs

A **heterogeneous graph** comes with a type map on *both* nodes and edges: $$\tau : V \to \mathcal{T}_V$$ and $$\phi : E \to \mathcal{T}_E$$, where $$\lvert \mathcal{T}_V \rvert > 1$$. A multi-relational graph is the special case with many edge types but a single node type; a heterogeneous graph relaxes the node side too.

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

A **hypergraph** $$H = (V, \mathcal{E})$$ generalises graphs by letting each hyperedge be an arbitrary subset of nodes, $$e \subseteq V$$, rather than a pair. An ordinary graph is the special case where every hyperedge has $$\lvert e \rvert = 2$$. Structure is stored as an incidence matrix $$B \in \{0,1\}^{N \times \lvert \mathcal{E} \rvert}$$ with $$B_{ve} = 1$$ when $$v \in e$$.

**Real examples:** group memberships (a paper with five authors is one hyperedge over all five), co-purchase baskets, multi-agent interactions.

**GNN implication:** hypergraph neural networks typically expand each hyperedge into a bipartite node–hyperedge incidence structure and propagate node → hyperedge → node, so a message reaches all co-members of a group in one round rather than only pairwise partners.

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
| Undirected | $$A = A^{\top}$$ | Molecules, friendships | Symmetric aggregation |
| Directed | $$A \neq A^{\top}$$ | Citations, follows | Direction-aware aggregation |
| Weighted | $$A_{uv} = w_{uv}$$ | Roads, correlations | Weight-modulated messages |
| Bipartite | $$V = U \sqcup W$$, edges only across | User-item, author-paper | Alternating propagation |
| Multigraph | Parallel edges, self-loops allowed | Flights, transactions | Per-edge (not per-neighbour) messages |
| Multi-relational | Typed edges $$(u, r, v)$$ | Knowledge graphs | Type-specific weights |
| Heterogeneous | Multiple node *and* edge types | Academic networks | Type-aware architectures |
| Hypergraph | Hyperedge is any subset of $$V$$ | Group memberships | Hyperedge aggregation |
| Dynamic | Graph changes over time | Communication networks | Temporal modelling |

Recognising which graph type your data is determines which GNN variant to use. Starting with a homogeneous GNN on a heterogeneous graph is a common and costly mistake.

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv preprint*.
- Hamilton, W. L. (2020). [Graph Representation Learning](https://www.cs.mcgill.ca/~wlh/grl_book/). *Synthesis Lectures on Artificial Intelligence and Machine Learning*.
