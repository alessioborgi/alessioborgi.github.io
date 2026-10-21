---
layout: "single"
title: "Agglomerative Clustering: Linkages, Ward’s Criterion and Dendrograms"
date: "2026-10-20 10:13:00 +0100"
categories: ["basics"]
book: "basics"
subsection: clustering
tags: ["machine-learning", "clustering", "hierarchical", "ward"]
excerpt: "Compute competing linkage decisions, derive Ward’s merge cost, and read a dendrogram without confusing a greedy hierarchy with a unique natural taxonomy."
author_profile: true
read_time: true
is_overview: false
icon: "🌿"
read_mins: 5
permalink: "/blog/basics/agglomerative-clustering/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Agglomerative clustering starts with single observations and repeatedly merges clusters. The linkage rule defines the meaning of closeness between sets. The result is a nested hierarchy, and choosing a cut is a separate decision from constructing the tree.
</div>

## The output is a hierarchy

If observations might have meaningful groupings at several resolutions, one flat partition can hide the structure. Agglomerative clustering builds a sequence of nested partitions: n singleton clusters, then n−1 groups, down to one. A dendrogram records which groups merge and the dissimilarity or criterion value associated with that merge.

Every merge is greedy and irreversible. A dendrogram therefore represents the history of a chosen algorithm, metric and linkage. It does not prove that the observations belong to a unique underlying taxonomy. Ties, noisy distances and scaling can change early merges and their descendants.

## Four linkage rules, four questions

For clusters A and B, common definitions are:

| Linkage | Merge criterion | Main tendency |
|---|---|---|
| Single | Minimum pairwise distance | Connect through short bridges |
| Complete | Maximum pairwise distance | Keep worst-case separation small |
| Average | Mean of all cross-cluster distances | Balance all pairwise relationships |
| Ward | Increase in within-cluster squared error | Prefer low-variance Euclidean merges |

Average linkage here means averaging all observation pairs across A and B, often called UPGMA. Equal weighting of cluster-level distances gives a different method when cluster sizes differ. Specify the variant rather than assuming “average” has only one implementation.

Single linkage can recover elongated connected sets, but a chain of intermediate observations may join two otherwise separate regions. Complete linkage resists that chaining but is sensitive to a single faraway member. These are consequences of the minimum and maximum operators, not accidental implementation defects.

## One merge decision, computed three ways

Suppose a current partition contains $$A=\{0,2\}$$, $$B=\{3\}$$ and $$C=\{6\}$$ on the number line. The distances between A and B are 3 and 1; between B and C the distance is 3.

Single linkage scores A–B as 1 and B–C as 3, so it favours A–B. Complete linkage gives both 3, producing a tie that needs an explicit rule. Average linkage gives A–B a score of 2 and B–C a score of 3.

The same observations therefore present different evidence under different cluster definitions. A plotting library that draws the resulting trees attractively does not resolve that modelling choice.

## Derive Ward’s increase in error

Let $$n_A,n_B$$ and $$\mu_A,\mu_B$$ be sizes and means. Decomposing squared deviations around the merged mean gives

<div class="formula-box">
\[
\Delta(A,B)=\mathrm{SSE}(A\cup B)-\mathrm{SSE}(A)-\mathrm{SSE}(B)
=\frac{n_A n_B}{n_A+n_B}\|\mu_A-\mu_B\|^2.
\]
</div>

For the example, A has size 2 and mean 1, while B has size 1 and mean 3. Their merge costs $$\tfrac23(1-3)^2=8/3$$. Merging B and C costs $$\tfrac12(3-6)^2=4.5$$, so Ward favours A–B.

Ward’s derivation uses squared Euclidean geometry. Substituting an arbitrary cosine or edit-distance matrix into software labelled “Ward” does not preserve this interpretation. Also check dendrogram height conventions: some libraries plot a square-root rescaling of the SSE increment rather than the increment itself.

## Cutting and interpreting the tree

A horizontal cut at a chosen height gives the groups whose merges occur below that threshold. Requesting a fixed number of clusters instead selects a point in the merge sequence. These procedures need not correspond to a single unambiguous height when many merges tie.

Large vertical gaps can suggest a useful scale, but they depend on the metric and linkage. Show several cuts, compare stability under resampling, and examine representative observations. A leaf’s horizontal position is usually arbitrary within allowed subtree rotations; distance along the x-axis does not measure similarity.

## Complexity and implementation

Naively recomputing all cluster distances at every step can take cubic time. Specialised algorithms improve this substantially: several standard linkages admit quadratic-time implementations, and single linkage can exploit a minimum spanning tree. Dense pairwise storage is often still quadratic.

Connectivity-constrained agglomeration permits merges only along a supplied neighbourhood graph. That can reduce work and encode meaningful adjacency, such as nearby image regions. It also changes which partitions are reachable. Report the graph construction and isolated-component handling, not just the linkage name.

There is no universal prediction rule for unseen observations. Assigning a new point to the nearest existing cluster representative is an added rule, not a rerun of the original hierarchy. If deployment requires assignments for new data, specify and validate that extension.

## When a hierarchy helps

Use agglomeration for moderate datasets, exploratory multi-resolution structure and applications where a nested grouping is meaningful. Compare [density methods](/blog/basics/dbscan/) when noise should remain unassigned, and [k-means](/blog/basics/k-means/) when a large flat Euclidean partition is enough.

Keep the original metric, linkage, tie handling, tree and cut rule together. A flat label vector alone discards the main product of the algorithm and makes it difficult to investigate why two groups were joined.

<div class="insight-box">
  <strong>Key Insight:</strong> A linkage is a definition of cluster similarity. Changing it changes the scientific question, even when the distance between individual observations stays fixed.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Ward’s criterion is a Euclidean squared-error calculation. Arbitrary dissimilarities and library-specific dendrogram heights require separate interpretation.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Distinguish construction of the hierarchy from selection of a flat cut.</li>
    <li>Compare minimum, maximum, pairwise-average and Ward merge costs.</li>
    <li>Audit chaining, ties, early merges and feature scaling.</li>
    <li>Record computational assumptions and any rule for unseen observations.</li>
  </ul>
</div>

## References

1. Müllner. [Modern hierarchical, agglomerative clustering algorithms](https://arxiv.org/abs/1109.2378). 2011.
2. scikit-learn. [Clustering user guide](https://scikit-learn.org/stable/modules/clustering.html).
