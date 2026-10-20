---
layout: "single"
title: "Random Projections: Johnson–Lindenstrauss Geometry and Fast Compression"
date: "2026-10-20 10:26:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "dimensionality-reduction"
tags: ["machine-learning", "dimensionality-reduction", "random-projection", "geometry"]
excerpt: "Derive expected squared-distance preservation, interpret finite-set concentration bounds, and compare random embeddings with PCA and neighbourhood-based methods."
author_profile: true
read_time: true
is_overview: false
icon: "🎲"
read_mins: 5
permalink: "/blog/basics/random-projections/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Random projection compresses vectors with a suitably scaled random linear map. For a finite set of observations, enough output dimensions can preserve all pairwise squared distances approximately with high probability. It provides geometric compression without fitting principal axes, but does not guarantee interpretability or exact reconstruction.
</div>

## Compress without estimating a covariance

PCA learns directions from a dataset. A random projection instead samples a linear map independently of the observations and applies it consistently. This can be useful for high-dimensional sparse features or streams where estimating and storing a full data-adaptive basis is costly.

The objective is approximate distance preservation on a finite collection, not maximal retained variance. A random direction has no special semantic meaning, and the representation is not ordered from most to least informative coordinate.

## Define a scaled random map

For $$x\in\mathbb R^d$$, use $$z=Rx\in\mathbb R^k$$ with independent entries $$R_{ab}\sim\mathcal N(0,1/k)$$. For a fixed difference vector v, each projected coordinate has variance $$\|v\|^2/k$$. Summing k coordinates gives

<div class="formula-box">
\[
\mathbb E\|Rv\|^2=\|v\|^2.
\]\n</div>

This expectation is over random matrices. It does not say that every matrix preserves every vector or that one projected distance is always exact. Concentration results are what turn the expectation into a useful finite-data guarantee.

Sparse random maps use different entry distributions with appropriate scaling. They can reduce multiplication cost, but the exact guarantee and density setting depend on the construction.

## The finite-set statement

A Johnson–Lindenstrauss-style guarantee seeks

<div class="formula-box">
\[
(1-\varepsilon)\|x_i-x_j\|^2\le\|R(x_i-x_j)\|^2
\le(1+\varepsilon)\|x_i-x_j\|^2
\]\n</div>

for all pairs in a specified finite set, with high probability. A sufficient target dimension scales on the order of $$\varepsilon^{-2}\log(n/\delta)$$ for n observations and a specified failure probability delta, with constants depending on the theorem and construction.

The logarithmic dependence on n is striking, but the bound can be conservative. If a sufficient k exceeds the original dimension, that particular bound offers no dimensional reduction. It is not a guarantee that every arbitrary dataset can be faithfully shown in two dimensions.

## A random direction can still lose information

Project two-dimensional vectors onto the unit direction $$(1,1)/\sqrt2$$. The vector $$(1,-1)$$ maps to zero even though its original norm is $$\sqrt2$$. A low-rank map necessarily has a nullspace, so exact preservation of every vector in the entire original space is impossible when k is smaller than d.

The finite-set guarantee avoids that contradiction: it concerns a fixed collection of vectors and probability over the sampled map. Adversarially choosing a new vector from the map’s nullspace afterward is outside that fixed-set statement.

This distinction matters for deployment. A theorem about one dataset is not an unconditional guarantee for every future observation under arbitrary distribution shift.

## What approximate distances imply—and do not

If two candidate neighbours have very similar original distances, small allowed distortions can reverse their order. Pairwise distance preservation therefore does not imply exact nearest-neighbour identities. Large-margin neighbour relationships are more robust than near ties.

Likewise, approximate geometry does not guarantee unchanged clustering or classification when decisions sit near boundaries. Evaluate the downstream task and inspect distortion on important slices. A stable average distance error can hide damage to rare groups.

For squared-distance clustering, preserving geometry can support useful objective approximations under appropriate conditions, but the precise claim depends on the algorithm and theorem. Do not extend a basic finite-set bound into a blanket statement that every fitted model is unchanged.

## Compare with PCA

PCA minimises squared reconstruction error among rank-k linear subspaces of the centred training data. Random projection preserves distances probabilistically without learning those axes. PCA can exploit strong low-rank structure efficiently, while a random map avoids fitting a covariance or singular basis.

Random projected coordinates need not be orthogonal principal coordinates, and a simple transpose is not generally an exact inverse. Reconstructing original vectors requires another estimation step and may be impossible without additional structure.

Both methods depend on feature representation. A large-unit irrelevant feature contributes to original Euclidean distances and can be faithfully preserved by a random map. Preserving a bad metric is not an improvement in meaning.

## Implement and evaluate consistently

Save the sampled map or a reproducible construction together with feature ordering and scaling. Re-sampling a new matrix independently for each batch destroys coordinate comparability. Sparse inputs benefit from a compatible map and multiplication implementation, but the result may still become dense.

Measure relative squared-distance errors on a representative set of pairs, neighbour recall, downstream validation performance, storage and runtime. Compare several seeds when approximation variation matters. Decide whether the acceptable distortion comes from a theoretical bound, empirical validation or both.

Random projections are valuable when fast geometric compression is the goal. Use [PCA](/blog/basics/pca-and-dimensionality-reduction/) when data-adaptive low-rank reconstruction matters, and interpret [t-SNE](/blog/basics/t-sne/) and [UMAP](/blog/basics/umap/) as different neighbourhood-oriented objectives rather than interchangeable projection tricks.

<div class="insight-box">
  <strong>Key Insight:</strong> Expected norm preservation is only the starting point. Concentration and a finite-set argument explain why one sampled map can preserve many distances, while a nullspace explains why it cannot preserve every possible vector.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A two-dimensional plot does not inherit an arbitrary Johnson–Lindenstrauss guarantee. Check the required dimension, distortion definition and population covered by the claim.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Use a correctly scaled random-map distribution.</li>
    <li>Distinguish expectation, high-probability finite-set bounds and future data.</li>
    <li>Measure downstream consequences of neighbour-order changes.</li>
    <li>Save one consistent map and account for sparse-versus-dense computation.</li>
  </ul>
</div>

## References

1. scikit-learn. [Random Projection](https://scikit-learn.org/stable/modules/random_projection.html).
2. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
