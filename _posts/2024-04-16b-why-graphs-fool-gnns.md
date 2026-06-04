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
