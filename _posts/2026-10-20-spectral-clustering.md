---
layout: "single"
title: "Spectral Clustering: Affinity Graphs, Laplacians and Relaxed Cuts"
date: "2026-10-20 10:18:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "clustering"
tags: ["machine-learning", "clustering", "spectral", "graphs"]
excerpt: "Derive the graph-smoothness objective, connect eigenvectors to disconnected components, and explain why affinity construction often matters more than the final k-means step."
author_profile: true
read_time: true
is_overview: false
icon: "🕸️"
read_mins: 5
permalink: "/blog/basics/spectral-clustering/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Spectral clustering first represents similarity as a graph, then embeds observations using Laplacian eigenvectors and clusters that embedding. It can recover groups that ordinary Euclidean k-means cannot, but its result depends strongly on the graph and on the chosen normalisation.
</div>

## Change the space in which groups are simple

Two curved groups may be interleaved in ordinary coordinates while remaining well separated by local connectivity. A graph can connect nearby observations along each curve without connecting across the gap. Spectral clustering uses that graph to construct coordinates in which connected groups become easier to separate.

The method therefore has two models: a similarity graph and a partitioning objective. Applying an eigensolver to arbitrary similarities does not remove assumptions; it moves the assumptions into edge construction and normalisation.

## Build an affinity matrix

Let W be a symmetric, nonnegative affinity matrix. A common Gaussian affinity is

<div class="formula-box">
\[
W_{ij}=\exp\!\left(-\frac{\|x_i-x_j\|^2}{2\sigma^2}\right)
\]\n</div>

for selected pairs, with a stated diagonal convention. A k-nearest-neighbour graph keeps local edges, while a radius graph connects pairs within a fixed distance. A directed neighbour graph needs a symmetrisation rule, such as a union or mutual-neighbour intersection.

A small bandwidth can fragment one population; a large bandwidth can connect everything nearly uniformly. An irrelevant high-variance feature can destroy local relationships before the spectral step starts. Examine connected components and degree distribution rather than accepting the graph as an invisible preprocessing detail.

## The Laplacian measures disagreement across edges

Define $$D_{ii}=\sum_jW_{ij}$$ and $$L=D-W$$. For any real vector f,

<div class="formula-box">
\[
f^\top Lf=\frac12\sum_{i,j}W_{ij}(f_i-f_j)^2.
\]\n</div>

A low value means strongly connected observations receive similar coordinates. The constant vector gives zero and contains no partition information. Further low-eigenvalue directions vary slowly within strongly connected regions while changing across weak connections.

This identity is also a direct check on an implementation. If W is symmetric and nonnegative, the quadratic form cannot be negative except for numerical error. Negative weights require a different formulation and invalidate this elementary interpretation.

## A graph with two exact components

Take four observations with edges of weight 1 between 1–2 and 3–4, and no other edges. The unnormalised Laplacian has two zero eigenvalues. Indicator vectors of the two components span its nullspace: no edge crosses either indicator’s boundary, so its smoothness cost is zero.

Add an edge of weight 0.05 between 2 and 3. The graph becomes connected, leaving only one exact zero eigenvalue. A second low-eigenvalue direction still tends to distinguish the two strongly connected pairs. It is the weak bridge relative to within-pair connectivity that matters, not the observations’ absolute Euclidean positions.

With repeated eigenvalues, individual eigenvectors are not unique: any orthonormal basis of the eigenspace is valid. Compare the subspace and resulting partition, not the signs or exact coordinates of one eigensolver’s output.

## Normalised cuts and a relaxation

For a partition A, B, let cut(A,B) sum crossing affinities and vol(A) sum degrees in A. Normalised cut uses

<div class="formula-box">
\[
\operatorname{Ncut}(A,B)=\frac{\operatorname{cut}(A,B)}{\operatorname{vol}(A)}+
\frac{\operatorname{cut}(A,B)}{\operatorname{vol}(B)}.
\]\n</div>

The volume terms discourage isolating a tiny set merely because it has few crossing edges. Relaxing discrete assignments leads to Laplacian eigenproblems. Common variants use $$L_{\mathrm{sym}}=I-D^{-1/2}WD^{-1/2}$$ or the random-walk Laplacian; zero-degree vertices need explicit handling.

In a widely used symmetric-normalised algorithm, compute k eigenvectors for the smallest eigenvalues, assemble them as columns, normalise nonzero rows and run [k-means](/blog/basics/k-means/) on the row embeddings. Other spectral formulations use different normalisation and rounding rules. Preserve the variant when reproducing a result.

## Choosing k and checking the graph

An eigengap can suggest a number of groups, particularly when the graph nearly decomposes into components. The gap is a property of the constructed graph, not a universal oracle for natural cluster count. Changing neighbour count or bandwidth can change both eigenvalues and the apparent gap.

Compare several plausible graphs, inspect within-group and cross-group edges, and test partition stability. If a group appears only for one narrow bandwidth, report that sensitivity. Domain constraints can be encoded in affinities, but then the output partly reflects those supplied constraints.

## Computational and deployment limits

A dense affinity matrix requires quadratic storage and a full dense eigendecomposition is expensive. Sparse neighbour graphs and partial eigensolvers can reduce cost, but graph construction and numerical convergence still matter. Approximation can change weak connections that decide the partition.

The fitted eigenvectors describe the training graph. Assigning new observations requires an extension such as a Nyström-style mapping or a separately learned predictor; it is not automatically the same as rebuilding the graph with the new observations included.

Use spectral clustering when graph connectivity is a defensible definition of similarity. Prefer [density methods](/blog/basics/hdbscan/) when explicit noise handling is central, and ordinary k-means when the original geometry already supports compact groups at large scale.

<div class="insight-box">
  <strong>Key Insight:</strong> The eigenvectors simplify the relationships encoded by the affinity graph. They cannot recover a neighbourhood structure that was destroyed by the representation or graph construction.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A visually plausible partition can be an artefact of neighbour count, bandwidth or graph disconnection. Inspect those choices before interpreting an eigengap.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Construct symmetric nonnegative affinities deliberately.</li>
    <li>Use the Laplacian quadratic form to understand smooth eigenvectors.</li>
    <li>Distinguish normalisation, relaxation and final label assignment.</li>
    <li>Check graph sensitivity, sparse computation and new-point handling.</li>
  </ul>
</div>

## References

1. von Luxburg. [A Tutorial on Spectral Clustering](https://arxiv.org/abs/0711.0189). Statistics and Computing, 2007.
2. scikit-learn. [Clustering user guide](https://scikit-learn.org/stable/modules/clustering.html).
