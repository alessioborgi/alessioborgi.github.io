---
layout: single
title: "Geometry for Machine Learning: Why Shape Keeps Coming Back"
date: 2026-09-01
categories: [geometry-basics]
book: geometry-basics
subsection: foundations
tags: [geometry, manifolds, symmetry, overview]
excerpt: "Every embedding you have ever trained lives in a metric space, every dataset you have ever fitted sits near a surface far thinner than its ambient dimension, and every architecture you trust encodes a symmetry. Geometry is not decoration on top of ML — it is what makes the problems tractable."
author_profile: true
read_time: true
is_overview: true
icon: "📐"
read_mins: 5
permalink: /blog/geometry-basics/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Three geometric facts do most of the work in modern machine learning. Embeddings are only meaningful because the space they live in carries a distance and an angle. High-dimensional data concentrates near a low-dimensional surface, which is why fitting it is possible at all. And symmetry — the transformations under which a task's answer should not change — is a constraint you can build into an architecture rather than pay for in data. This book is a six-post recap of the geometry behind those three claims, aimed at someone who once knew it and is about to be asked about it.
</div>

## Why an ML engineer keeps meeting geometry

Ask what a word embedding *is* and the honest answer is: a point whose only meaning comes from its relationships to other points. Cosine similarity, nearest-neighbour retrieval, contrastive losses, margins — none of these are statements about coordinates. They are statements about inner products, norms and distances. Change the metric and every one of them changes meaning, which is why the choice of metric is a modelling decision and not a formality.

The second fact is about dimension. A $224 \times 224$ RGB image lives in $\mathbb{R}^{150528}$. If natural images filled that space, no finite dataset could ever pin down a decision boundary in it. They do not. Photographs of cats vary along a comparatively small number of directions — pose, lighting, breed, background — and the set of realistic images forms a thin, curved subset of the ambient cube. That is the *manifold hypothesis*, and it is the reason generalisation is possible rather than miraculous.

The third is symmetry. A molecule's energy does not change when you rotate the molecule. A graph's predicted property does not change when you relabel its nodes. An object stays a cat when it moves ten pixels right. Each of these is a group acting on the input, and each tells you something about the function you are trying to learn — before you have seen a single training example.

<div class="insight-box">
  <strong>Key Insight — geometry is a prior, not an ornament:</strong> every geometric structure in this book buys you the same thing, a restriction on the space of functions you are searching. A metric says which points must get similar predictions. A manifold says which directions in input space are real and which are noise. A group says which pairs of inputs must get <em>identical</em> or <em>correspondingly transformed</em> predictions. Restricting the hypothesis class is exactly what makes learning from finite data work.
</div>

## The map

The book splits into three parts, going from flat to curved to symmetric.

**Foundations — flat space.** [Euclidean spaces](/blog/geometry-basics/euclidean-spaces/) is the machinery you use daily without naming it: inner products and the norms they induce, angles and orthogonality, the projection formula, orthonormal bases, and the point-to-hyperplane distance $\lvert \mathbf{w}^\top\mathbf{x} + b\rvert / \lVert \mathbf{w}\rVert$ that turns out to be the SVM margin. The [linear transformations](/blog/geometry-basics/linear-transformations/) post reads matrices as geometry: rotations, reflections, shears, the determinant as signed volume change, and the SVD as the statement that *every* linear map is a rotation, then a scaling, then another rotation.

**Differential — curved space.** [Curvature](/blog/geometry-basics/curvature/) starts with curves and arc length and ends with Gauss's Theorema Egregium — the reason a flat map of the Earth must lie about distances. [Manifolds and tangent spaces](/blog/geometry-basics/manifolds-and-tangent-spaces/) makes "the data lies on a manifold" precise, explains why charts are unavoidable, and reviews what evidence actually supports the manifold hypothesis. [Riemannian geometry](/blog/geometry-basics/riemannian-geometry/) adds a smoothly varying inner product, which gives geodesics, the exponential and logarithmic maps, SLERP as a special case, and the volume-growth argument for why hyperbolic space embeds trees so much better than $\mathbb{R}^d$ does.

**Symmetry.** [Symmetry and groups](/blog/geometry-basics/symmetry-and-groups/) states invariance and equivariance as formulas rather than slogans, and works through the three cases that appear in interviews: translation in CNNs, permutation in GNNs and set models, and $SE(3)$ in molecular models.

<div class="warning-box">
  <strong>Interview trap:</strong> "invariant" and "equivariant" are not synonyms and not interchangeable. A function is invariant when \(f(g \cdot x) = f(x)\) and equivariant when \(f(g \cdot x) = \rho(g)\, f(x)\) for a representation \(\rho\) of the group on the output space. Invariance is the special case \(\rho(g) = \mathrm{id}\). Getting this backwards — or claiming a convolution layer is translation <em>invariant</em> — is the single most common stumble on this material.
</div>

## How to use this book

These are revision notes, not a textbook. Each post is self-contained, states the formulas you would be asked to reproduce, and flags the trap. The linear-algebra prerequisites live in the math basics book — [vectors and matrices](/blog/math-basics/vectors-and-matrices/) and [eigenvalues and the SVD](/blog/math-basics/eigen-and-svd/) — and this one assumes them, asking instead what they *mean* geometrically.

If you are short on time: read [Euclidean spaces](/blog/geometry-basics/euclidean-spaces/) and [Symmetry and groups](/blog/geometry-basics/symmetry-and-groups/). Those two carry the highest density of things you will actually be asked.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Embeddings mean nothing without a metric — cosine similarity, margins and nearest neighbours are all statements about inner products.</li>
    <li>The manifold hypothesis says data concentrates near a low-dimensional surface in a high-dimensional ambient space; it is why fitting high-dimensional data is possible.</li>
    <li>Symmetry is a prior you can build into an architecture instead of paying for with data.</li>
    <li>Invariance is \(f(g\cdot x) = f(x)\); equivariance is \(f(g\cdot x) = \rho(g) f(x)\). Invariance is the trivial-representation case of equivariance.</li>
  </ul>
</div>

## References

1. Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv:2104.13478*, 2021.
2. Fefferman, C., Mitter, S., & Narayanan, H. [Testing the Manifold Hypothesis](https://arxiv.org/abs/1310.0425). *Journal of the American Mathematical Society*, 29(4), 2016.
3. Pope, P., Zhu, C., Abdelkader, A., Goldblum, M., & Goldstein, T. [The Intrinsic Dimension of Images and Its Impact on Learning](https://arxiv.org/abs/2104.08894). *ICLR 2021*.
