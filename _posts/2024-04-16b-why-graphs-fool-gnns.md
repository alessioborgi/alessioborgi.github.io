---
layout: single
title: "Why Some Graphs Fool GNNs: The Structural Indistinguishability Problem"
categories: [gnn]
book: gnn
subsection: expressivity
tags: [expressivity, WL-test, regular-graphs, indistinguishability, GNN-limits]
published: true
excerpt: "Certain graph structures are invisible to message-passing GNNs — not because of bad training, but because of fundamental mathematical limits. Two structurally distinct graphs can produce identical embeddings in any MPNN."
author_profile: true
read_time: true
is_overview: false
icon: "🎭"
read_mins: 4
permalink: /blog/gnn/why-graphs-fool-gnns/
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
<strong>TL;DR:</strong> Two non-isomorphic graphs can fool every MPNN into assigning identical graph-level embeddings. This is not a training failure — it is a mathematical limit. The canonical examples are regular graphs, cycle vs. path pairs, and specific small non-isomorphic graphs. Understanding which structures fool GNNs motivates beyond-1-WL architectures.
</div>
{% include figure image_path="/images/blog/gnn/xu2019_gin.png" alt="Non-isomorphic graphs that fool GNNs" caption="Non-isomorphic graphs indistinguishable by 1-WL / standard MPNNs (Xu et al., 2019)" %}


## Intuition First

The 1-WL test works by giving every node a "colour" based on its neighbourhood multiset, then iteratively refining colours. Two nodes get the same final colour if and only if their entire computational trees — the tree of all neighbours' neighbours' neighbours... — look identical.

The catch: a tree cannot see cycles. A node in a triangle and a node with the same three neighbours but no triangle between them have identical computational trees at depth 1. And since GNNs are equivalent to 1-WL, **GNNs are cycle-blind**.

<div class="blog-figure"><figure>
<svg viewBox="0 0 480 155" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:auto">
  <style>
    .wl-node { fill:#6366f1; stroke:#fff; stroke-width:2; }
    .wl-node-q { fill:#f97316; stroke:#fff; stroke-width:2; }
    .wl-edge { stroke:#94a3b8; stroke-width:1.8; }
    .wl-label { font-size:10px; fill:#1e293b; font-family:sans-serif; text-anchor:middle; }
    .wl-title { font-size:11px; fill:#1e293b; font-family:sans-serif; font-weight:bold; text-anchor:middle; }
    .wl-same  { font-size:10px; fill:#dc2626; font-family:sans-serif; text-anchor:middle; font-weight:bold; }
  </style>
  <!-- Graph 1: 6-cycle -->
  <text x="110" y="14" class="wl-title">6-cycle (connected, no triangles)</text>
  <circle cx="110" cy="55"  r="11" class="wl-node"/>
  <circle cx="145" cy="35"  r="11" class="wl-node"/>
  <circle cx="180" cy="55"  r="11" class="wl-node"/>
  <circle cx="180" cy="90"  r="11" class="wl-node"/>
  <circle cx="145" cy="110" r="11" class="wl-node"/>
  <circle cx="110" cy="90"  r="11" class="wl-node"/>
  <line x1="110" y1="55"  x2="145" y2="35"  class="wl-edge"/>
  <line x1="145" y1="35"  x2="180" y2="55"  class="wl-edge"/>
  <line x1="180" y1="55"  x2="180" y2="90"  class="wl-edge"/>
  <line x1="180" y1="90"  x2="145" y2="110" class="wl-edge"/>
  <line x1="145" y1="110" x2="110" y2="90"  class="wl-edge"/>
  <line x1="110" y1="90"  x2="110" y2="55"  class="wl-edge"/>
  <text x="145" y="75" class="wl-label">all deg-2</text>

  <!-- divider -->
  <line x1="240" y1="20" x2="240" y2="135" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4"/>

  <!-- Graph 2: two triangles -->
  <text x="365" y="14" class="wl-title">Two 3-cycles (disconnected triangles)</text>
  <circle cx="295" cy="55"  r="11" class="wl-node"/>
  <circle cx="325" cy="100" r="11" class="wl-node"/>
  <circle cx="265" cy="100" r="11" class="wl-node"/>
  <line x1="295" y1="55"  x2="325" y2="100" class="wl-edge"/>
  <line x1="325" y1="100" x2="265" y2="100" class="wl-edge"/>
  <line x1="265" y1="100" x2="295" y2="55"  class="wl-edge"/>
  <circle cx="415" cy="55"  r="11" class="wl-node"/>
  <circle cx="445" cy="100" r="11" class="wl-node"/>
  <circle cx="385" cy="100" r="11" class="wl-node"/>
  <line x1="415" y1="55"  x2="445" y2="100" class="wl-edge"/>
  <line x1="445" y1="100" x2="385" y2="100" class="wl-edge"/>
  <line x1="385" y1="100" x2="415" y2="55"  class="wl-edge"/>
  <text x="365" y="125" class="wl-label">all deg-2</text>
  <!-- same label -->
  <text x="240" y="148" class="wl-same">1-WL gives both the same histogram → any MPNN predicts identically</text>
</svg>
<figcaption>A 6-cycle and two disconnected 3-cycles both have 6 nodes, 6 edges, and every node with degree 2. 1-WL (and any MPNN) cannot tell them apart — yet one is connected and the other has two triangles.</figcaption>
</figure></div>

## The Expressivity Ceiling

The Weisfeiler-Lehman (1-WL) test is the exact expressivity ceiling for message-passing GNNs. Two graphs that 1-WL cannot distinguish cannot be distinguished by any MPNN — including GCN, GAT, GIN.

This is not a theorem about bad architectures. Even the most expressive MPNN (GIN) is bounded by 1-WL. The question becomes: what does 1-WL fail to distinguish?

## Case 1: Regular Graphs

A **k-regular graph** is a graph where every node has degree k. When all nodes have the same degree, they start with identical initial colours in 1-WL. After one iteration, every node sees k neighbours, all with the same colour → same colour update. After any number of iterations: all nodes still have the same colour.

**Consequence:** Any two k-regular graphs with the same number of nodes and edges get the same 1-WL histogram — and thus the same graph-level embedding in any MPNN.

```
Graph A: Triangle (3 nodes, 3 edges, 2-regular)
Graph B: Three disjoint edges (6 nodes, 3 edges, 1-regular)
→ Different (1-WL can distinguish these: different degree)

Graph C: Petersen graph (10 nodes, 15 edges, 3-regular)
Graph D: Different 3-regular graph on 10 nodes, 15 edges
→ SAME 1-WL signature — any MPNN predicts identically for graph-level tasks
```

For molecular graphs (where degree encodes atom valence), this means two chemically distinct molecules with the same degree sequence can be indistinguishable.

## Case 2: Cycle Counting Blindness

1-WL cannot count cycles. Specifically:

**A 4-cycle and two disconnected edges** look identical to 1-WL if node features are uniform:

```
4-cycle: A-B-C-D-A  (all degree-2)
Two edges: A-B, C-D  (all degree-1)
```

These ARE distinguishable (different degrees). But:

```
6-cycle: A-B-C-D-E-F-A  (2-regular)
Two 3-cycles: {A-B-C-A} ∪ {D-E-F-D}  (2-regular)
```

Both are 2-regular with 6 nodes and 6 edges. 1-WL assigns identical histograms. No MPNN can distinguish them — but they are structurally very different (one is connected, one is not... wait, both are).

Actually for the connected case: a 6-cycle has no triangles; two 3-cycles has two triangles. An MPNN cannot detect whether nodes are in triangles unless it uses structural encodings or higher-order methods.

<div class="insight-box">
<strong>Triangle detection:</strong> 1-WL cannot count triangles. If node u is in a triangle with v and w, and node x has the same degree but is not in a triangle, they will have the same 1-WL colour — unless their K-hop neighbourhood multisets differ. For certain regular graphs, they never differ at any depth K.
</div>

## Case 3: The CSL Graph Family

The **Circular Skip Link (CSL) graphs** are a family of 4-regular graphs on 41 nodes. They all look identical to 1-WL — every node has degree 4, the neighbourhood multisets match at every depth.

Yet the graphs are non-isomorphic (they have different skip patterns). Tasks that require distinguishing them (e.g., graph classification) will be solved at chance level by any MPNN.

CSL is a standard benchmark for testing beyond-1-WL expressiveness.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The 1-WL bound is tight — GIN achieves it. So if you need to go beyond 1-WL, no amount of tuning GIN will help. You need a fundamentally different architecture: subgraph GNNs, higher-order WL, or structural encodings (RWPE, LapPE) that break the symmetry 1-WL cannot break.</div>

## Concrete Failure: Molecule Classification

Suppose two molecules both have 6 carbon atoms, each with exactly 2 bonds (degree-2). One is benzene (a 6-cycle, aromatic), the other is two propene fragments (two 3-cycles). Both have the same 1-WL colour histogram.

A GNN trained to predict aromaticity will assign these the same graph-level embedding — and therefore the same prediction — even though only benzene is aromatic. This is not a data issue; it is a fundamental architectural limit.

The fix: add ring-membership features (e.g., RWPE captures P³[v,v] > 0 for nodes in triangles) or use subgraph GNNs that explicitly detect cycles.

## Why This Matters in Practice

For **graph classification** (e.g., is this molecule toxic?):
- Two molecules with different structures but same 1-WL signature → same MPNN prediction
- If the toxicity mechanism involves a structural feature 1-WL cannot detect → systematic failure

For **node classification** in a regular graph:
- All nodes have the same embedding → the GNN cannot distinguish any nodes at all
- If labels differ between nodes, accuracy collapses to the majority class

For **link prediction** in a regular graph:
- All node pairs have the same score → random link prediction

## What Structural Features Are Invisible?

1-WL cannot detect:
- **Cycle lengths** (is a node in a 4-cycle vs 6-cycle?)
- **Triangle counts** (how many triangles contain node v?)
- **Clique membership** (is v in a clique?)
- **Global structural roles** (is v a bridge node? is it on the periphery?)
- **Non-local symmetries** (two nodes with identical local neighbourhoods but different global positions)

## Solutions

| Problem | Solution |
|---------|----------|
| Regular graph indistinguishability | Structural encodings (RWPE, LapPE) — break symmetry |
| Cycle blindness | Subgraph GNNs — explicitly count subgraphs |
| Triangle detection | k-WL or triangle-counting features |
| Global structural roles | Distance encodings, shortest-path features |
| Graph-level indistinguishability | Higher-order WL, Graph Transformers |

**Structural positional encodings** (random walk PE, Laplacian PE) inject node-level structural identity that breaks the symmetry 1-WL cannot break — at the cost of sign/basis ambiguity issues.

**Subgraph GNNs** run a GNN on each induced subgraph and pool results — provably more expressive than 1-WL but O(N²) or O(N³) in complexity.

## Summary

| Graph Class | Why It Fools 1-WL | Practical Impact |
|-------------|------------------|-----------------|
| k-regular graphs | All nodes identical after any aggregation | Graph classification fails |
| Graphs with same degree sequence | Same initial colours | Node-level indistinguishability |
| Graphs differing only in cycle structure | 1-WL cannot count cycles | Molecular property prediction |
| CSL graphs | Engineered to fool 1-WL | Benchmark for expressivity |

Knowing which graphs fool GNNs is not just academic — it directly predicts where standard GNNs will fail on real tasks, and which architectural upgrades are needed.

## References

- Xu, K., Hu, W., Leskovec, J., & Jegelka, S. (2019). [How Powerful are Graph Neural Networks?](https://arxiv.org/abs/1810.00826). *ICLR 2019*.
- Murphy, R. L., Srinivasan, B., Rao, V., & Ribeiro, B. (2019). [Relational Pooling for Graph Representations](https://arxiv.org/abs/1903.02541). *ICML 2019* (on k-WL and beyond-1-WL methods).
- Maron, H., Ben-Hamu, H., Serviansky, H., & Lipman, Y. (2019). [Provably Powerful Graph Networks](https://arxiv.org/abs/1905.11136). *NeurIPS 2019*.
