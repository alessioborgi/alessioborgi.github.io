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
read_mins: 10
permalink: /blog/gnn/why-graphs-fool-gnns/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Two non-isomorphic graphs can fool every MPNN into assigning identical graph-level embeddings. This is not a training failure — it is a mathematical limit inherited from 1-WL. The canonical examples are \(k\)-regular graphs (a 6-cycle vs. two disjoint triangles, two different 3-regular graphs on 10 nodes) and engineered families such as CSL. The caveat throughout: these are worst cases for <em>uniform</em> node features; informative features break many of the ties. Understanding which structures fool GNNs is what motivates beyond-1-WL architectures.
</div>
{% include figure image_path="/images/blog/gnn/xu2019_gin.png" alt="Non-isomorphic graphs that fool GNNs" caption="Non-isomorphic graphs indistinguishable by 1-WL / standard MPNNs (Xu et al., 2019)" %}


## Intuition First

The 1-WL test gives every node a "colour" based on the multiset of its neighbours' colours, then iteratively refines. Two nodes carry the same colour after $$K$$ rounds precisely when their **unrolled computation trees** to depth $$K$$ — the tree of neighbours, then their neighbours, and so on — are identical.

The catch: a tree records no cycles. Unrolling revisits the same node along different branches without ever noticing it is the same node, so a triangle and a path of the same local degrees produce the same tree. Since a message-passing GNN can only distinguish what 1-WL distinguishes, **MPNNs cannot count cycles as a node-level feature**.

One qualification, since "GNNs are cycle-blind" is often stated too strongly: 1-WL *can* separate many graphs that happen to differ in cycle structure, because differing cycles usually also perturb the degree sequence and hence the colours. What it cannot do is compute a node's triangle or cycle count as a function it could rely on — and on regular graphs, where the degrees give nothing away, it fails completely.

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
<figcaption>A 6-cycle and two disjoint 3-cycles both have 6 nodes, 6 edges, and every node of degree 2, so 1-WL (and hence any MPNN) cannot tell them apart. Yet the 6-cycle is connected and triangle-free, while the pair of triangles is disconnected and contains two triangles — differences no amount of message passing can surface.</figcaption>
</figure></div>

## The Expressivity Ceiling

The Weisfeiler-Lehman (1-WL) test is the exact expressivity ceiling for message-passing GNNs. Two graphs that 1-WL cannot distinguish cannot be distinguished by any MPNN — including GCN, GAT and GIN.

This is not a theorem about bad architectures. Even the most expressive MPNN (GIN, given injective aggregation) is bounded by 1-WL. The question becomes: what does 1-WL fail to distinguish?

Throughout this section assume **uniform initial node features**. Informative features (atom types, bag-of-words attributes) can break many of these ties, so the failures below are worst cases for the *structure* of a graph, not blanket statements about every dataset.

## Case 1: Regular Graphs

A **\(k\)-regular graph** is one in which every node has degree \(k\). With uniform initial features, all nodes start with the same colour; after one iteration every node sees the multiset of \(k\) identical colours, so every node again receives the same colour. By induction the colouring never refines.

**Consequence:** any two \(k\)-regular graphs on the same number of nodes \(N\) (which forces the same edge count \(Nk/2\)) produce identical 1-WL histograms — and hence identical graph-level embeddings in any MPNN.

```
Graph A: Triangle (3 nodes, 3 edges, 2-regular)
Graph B: Three disjoint edges (6 nodes, 3 edges, 1-regular)
  → distinguished: different degrees give different colours

Graph C: Petersen graph (10 nodes, 15 edges, 3-regular)
Graph D: a non-isomorphic 3-regular graph on 10 nodes, 15 edges
  → SAME 1-WL histogram; any MPNN predicts identically on graph-level tasks
```

For molecular graphs, where degree tracks atom valence, this means two chemically distinct molecules with the same degree sequence can be indistinguishable from the skeleton alone.

## Case 2: Cycle Counting Blindness

1-WL cannot count cycles. Be careful with the examples, though — degree differences often rescue the test, and only the truly regular cases are genuinely hard.

Consider first a pair that is *not* a counterexample:

```
4-cycle:   A-B-C-D-A   (2-regular)
Two edges: A-B, C-D    (1-regular)
```

These are easily distinguished, because the degrees differ. Now the real counterexample:

```
6-cycle:      A-B-C-D-E-F-A            (2-regular, 6 nodes, 6 edges)
Two 3-cycles: {A-B-C-A} and {D-E-F-D}  (2-regular, 6 nodes, 6 edges)
```

Both are 2-regular on 6 nodes with 6 edges, so 1-WL assigns identical histograms and no MPNN can separate them. Yet they differ in every way that matters structurally: the 6-cycle is **connected and triangle-free**, while two 3-cycles form a **disconnected** graph containing two triangles. An MPNN cannot detect whether a node lies on a triangle unless it is given structural encodings or moves to a higher-order method.

<div class="insight-box">
<strong>Triangle detection:</strong> 1-WL cannot count triangles as a node feature. If node \(u\) lies on a triangle and node \(x\) has the same degree but does not, the two receive the same colour whenever their depth-\(K\) unrolled neighbourhoods agree. On regular graphs they agree at <em>every</em> depth, so the distinction is invisible no matter how many layers you stack.
</div>

## Case 3: The CSL Graph Family

The **Circular Skip Link (CSL) graphs** $$\mathrm{CSL}(N, k)$$ have $$N$$ nodes arranged in a cycle plus an extra "skip" edge from each node to the one $$k$$ positions away. Every node has degree 4, so each such graph is 4-regular and 1-WL sees nothing but "$$N$$ nodes, all degree 4". The version used as a benchmark fixes $$N = 41$$ and varies the skip length $$k$$ to produce a family of non-isomorphic graphs.

Because the graphs differ only in their skip pattern — invisible to a 4-regular colouring — a classification task over this family is solved at chance level by any MPNN. CSL is consequently a standard probe for beyond-1-WL expressiveness.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The 1-WL bound is tight — GIN achieves it. So if you need to go beyond 1-WL, no amount of tuning GIN will help. You need a fundamentally different architecture: subgraph GNNs, higher-order WL, or structural encodings (RWPE, LapPE) that break the symmetry 1-WL cannot break.</div>

## Concrete Failure: Molecule Classification

Take the carbon skeletons of two structures, each with 6 carbons and each carbon bonded to exactly 2 others. One is benzene, a single 6-ring and aromatic. The other is two separate cyclopropane rings, two disjoint 3-rings and not aromatic. Both skeletons are 2-regular on 6 nodes, so both have the same 1-WL colour histogram.

A GNN given only this connectivity will assign the two the same graph-level embedding — and therefore the same prediction — even though only benzene is aromatic. This is not a data issue; it is an architectural limit. (In practice, real molecular GNNs also receive atom and bond features, which is precisely why they are not this helpless; the point is that the *topology alone* is not enough.)

The fix: add ring-membership or structural features, or use subgraph GNNs that explicitly detect cycles. Random-walk positional encodings (RWPE) are the standard cheap option. With \(P = D^{-1}A\) the random-walk transition matrix, give each node its vector of return probabilities:

<div class="formula-box">
\[
\mathrm{RWPE}(v) \;=\; \Bigl( (P)_{vv},\ (P^{2})_{vv},\ \ldots,\ (P^{m})_{vv} \Bigr) \in \mathbb{R}^{m}.
\]
</div>

The entry $$(P^{k})_{vv}$$ is the probability that a walk started at $$v$$ is back at $$v$$ after $$k$$ steps, which is positive exactly when $$v$$ lies on a closed walk of length $$k$$. In particular $$(P^{3})_{vv} > 0$$ if and only if $$v$$ lies on a triangle. RWPE therefore hands the network precisely the cycle information that colour refinement can never derive for itself — and it separates the two carbon skeletons above, since the cyclopropane rings have $$(P^{3})_{vv} > 0$$ while benzene has $$(P^{3})_{vv} = 0$$.

## Why This Matters in Practice

For **graph classification** (e.g., is this molecule toxic?):
- Two molecules with different structures but same 1-WL signature → same MPNN prediction
- If the toxicity mechanism involves a structural feature 1-WL cannot detect → systematic failure

For **node classification** on a regular graph with uniform features:
- All nodes receive the same embedding → the GNN cannot distinguish any node from any other
- If labels differ between nodes, the best the model can do is predict the majority class

For **link prediction** on a regular graph with uniform features:
- All node pairs receive the same score → link prediction is no better than chance

## What Structural Features Are Invisible?

With uniform initial features, 1-WL cannot compute:

- **Cycle lengths** — is $$v$$ on a 4-cycle or a 6-cycle?
- **Triangle counts** — how many triangles contain $$v$$?
- **Clique membership** — is $$v$$ inside a clique?
- **Global structural roles** — is $$v$$ a cut vertex? is it peripheral?
- **Non-local symmetries** — two nodes with identical local neighbourhoods but different global positions

## Solutions

| Problem | Solution |
|---------|----------|
| Regular-graph indistinguishability | Structural encodings (RWPE, LapPE) — break the symmetry |
| Cycle blindness | Subgraph GNNs — explicitly count substructures |
| Triangle detection | $$k$$-WL, or explicit triangle-count features |
| Global structural roles | Distance encodings, shortest-path features |
| Graph-level indistinguishability | Higher-order WL, Graph Transformers |

**Structural and positional encodings** — random-walk PE built from the diagonal of $$P^{k}$$ with $$P = D^{-1}A$$, or Laplacian PE built from the eigenvectors $$u_i$$ of $$L_{\mathrm{sym}}$$ — inject node-level structural identity that 1-WL cannot derive on its own. They come with their own difficulty: eigenvectors are defined only up to sign, and up to an arbitrary basis within any eigenspace of repeated $$\lambda_i$$, so the encoding is not unique and must be made sign- or basis-invariant.

**Subgraph GNNs** run a GNN on a collection of subgraphs (typically one per node) and pool the results. They are strictly more expressive than 1-WL and bounded above by 3-WL, at a cost of roughly $$N$$ times a plain MPNN pass.

## Summary

| Graph class | Why it fools 1-WL | Practical impact |
|-------------|------------------|-----------------|
| $$k$$-regular graphs | Colouring never refines; all nodes stay identical | Graph classification degenerates to a constant |
| Same degree sequence, uniform features | Same colours at every iteration | Node-level indistinguishability |
| Graphs differing only in cycle structure | 1-WL cannot count cycles | Molecular property prediction |
| CSL graphs | 4-regular by construction; differ only in skip length | Benchmark for beyond-1-WL expressivity |

Knowing which graphs fool GNNs is not just academic — it directly predicts where standard GNNs will fail on real tasks, and which architectural upgrades are needed.

## References

- Xu, K., Hu, W., Leskovec, J., & Jegelka, S. (2019). [How Powerful are Graph Neural Networks?](https://arxiv.org/abs/1810.00826). *ICLR 2019*.
- Murphy, R. L., Srinivasan, B., Rao, V., & Ribeiro, B. (2019). [Relational Pooling for Graph Representations](https://arxiv.org/abs/1903.02541). *ICML 2019* (on k-WL and beyond-1-WL methods).
- Maron, H., Ben-Hamu, H., Serviansky, H., & Lipman, Y. (2019). [Provably Powerful Graph Networks](https://arxiv.org/abs/1905.11136). *NeurIPS 2019*.
