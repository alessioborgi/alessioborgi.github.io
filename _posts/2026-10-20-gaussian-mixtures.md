---
layout: "single"
title: "Gaussian Mixture Models: Responsibilities, EM and Covariance Geometry"
date: "2026-10-20 10:17:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "clustering"
tags: ["machine-learning", "clustering", "probability", "em"]
excerpt: "Derive expectation–maximisation updates, calculate a soft assignment, and diagnose likelihood singularities, covariance assumptions and model-selection errors."
author_profile: true
read_time: true
is_overview: false
icon: "🔔"
read_mins: 5
permalink: "/blog/basics/gaussian-mixtures/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A Gaussian mixture models a density as a weighted sum of Gaussian components. EM alternates posterior component responsibilities with weighted parameter estimates. Soft assignments express uncertainty under that density model, while covariance choices determine the shapes it can represent.
</div>

## A probability model before a clustering

Suppose two overlapping populations produce measurements. A hard assignment hides uncertainty for observations between them. A mixture model introduces an unobserved component indicator z and describes how each component generates data.

For k components,

<div class="formula-box">
\[
p(x)=\sum_{j=1}^k\pi_j\mathcal N(x\mid\mu_j,\Sigma_j),
\qquad \pi_j\ge0,\quad\sum_j\pi_j=1.
\]\n</div>

The components define a density. Calling each component a meaningful cluster is an additional interpretation: one curved population may require several Gaussian components to approximate it. Density estimation and discovery of semantic groups are related but different goals.

## Why direct optimisation is awkward

The observed-data log-likelihood contains a log of a sum:

<div class="formula-box">
\[
\ell(\theta)=\sum_i\log\sum_j\pi_j\mathcal N(x_i\mid\mu_j,\Sigma_j).
\]\n</div>

If the component labels were known, estimating each Gaussian would be straightforward. EM alternates estimating the missing labels probabilistically and solving the resulting weighted estimation problem. It improves the objective under exact steps and regularity assumptions, but can settle at a poor stationary solution.

## The E-step is Bayes’ rule

For observation i, the responsibility of component j is

<div class="formula-box">
\[
r_{ij}=\frac{\pi_j\mathcal N(x_i\mid\mu_j,\Sigma_j)}
{\sum_l\pi_l\mathcal N(x_i\mid\mu_l,\Sigma_l)}.
\]\n</div>

Consider equal mixing weights, one-dimensional means 0 and 2, and both variances equal to 1. At x=0, the density ratio of the second component to the first is $$e^{-2}$$. Responsibilities are therefore $$1/(1+e^{-2})\approx0.881$$ and 0.119. At x=1 the responsibilities are exactly one half by symmetry.

The calculation includes mixing weights and normalised Gaussian densities, not just distance to the means. A broad component spreads its density over more space, and a small mixing weight changes the posterior even when the point is nearby.

## The M-step uses weighted sufficient statistics

Let $$N_j=\sum_i r_{ij}$$. The unconstrained updates are

<div class="formula-box">
\[
\pi_j=\frac{N_j}{n},\qquad
\mu_j=\frac{\sum_i r_{ij}x_i}{N_j},\qquad
\Sigma_j=\frac{\sum_i r_{ij}(x_i-\mu_j)(x_i-\mu_j)^\top}{N_j}.
\]\n</div>

These are maximum-likelihood covariance estimates, with denominator $$N_j$$ rather than an unbiased sample-covariance correction. Each observation contributes fractionally to every component. For points 0 and 2 with responsibilities 0.75 and 0.25 for one component, its effective count is 1 and its updated mean is 0.5.

Use log-domain Gaussian scores and log-sum-exp for responsibilities. Multiplying tiny densities directly can underflow, turning a valid mixture calculation into zeros and undefined ratios. Numerical stability is part of reproducing the mathematics faithfully.

## Covariance is a structural assumption

| Covariance model | Component geometry | Main tradeoff |
|---|---|---|
| Spherical | Equal variance in all directions within a component | Few parameters, restrictive shapes |
| Diagonal | Axis-aligned ellipsoids | No within-component feature correlation |
| Tied full | Shared covariance across components | Shared shape with fewer parameters |
| Full | Independently oriented ellipsoids | Many parameters and more estimation variance |

A full covariance uses $$d(d+1)/2$$ parameters per component. With little data, apparent flexibility can produce unstable estimates. Standardisation does not remove correlations automatically; diagonal covariance remains an assumption about the transformed coordinates.

## Likelihood singularities and regularisation

For an unconstrained mixture with at least two suitable components, one Gaussian can collapse onto an observation while its covariance approaches zero. Its density at that point diverges, so likelihood can grow without a useful solution. A high likelihood alone is not enough to identify healthy training.

Covariance floors, constrained covariance structures, priors and minimum effective counts address different aspects of this problem. Adding a small diagonal value is common, but it changes the estimation procedure. Report it along with initialisation, restarts and convergence tolerance.

## Relation to k-means

With equal fixed mixing weights and shared spherical covariance, the most probable component is the nearest mean. As that variance tends to zero, responsibilities harden and the weighted-mean update approaches Lloyd’s update, away from ties. This explains a connection to [k-means](/blog/basics/k-means/) without treating every mixture model as soft k-means.

Unequal weights, full covariances and finite uncertainty produce different boundaries. A mixture may divide the same space very differently from a nearest-centroid rule.

## Choose complexity and validate interpretation

Compare held-out log-likelihood, restarts and covariance condition. AIC or BIC can be useful heuristics, while finite mixtures have nonregular features that complicate simplistic interpretations of asymptotic criteria. AIC/BIC selection of component count is not proof of the number of real populations.

Inspect responsibilities, representative observations, overlapping components and stability under resampling. Use labelled external criteria only if those labels represent the intended grouping. Keep the fitted density and its uncertainties available instead of saving only argmax cluster labels.

<div class="insight-box">
  <strong>Key Insight:</strong> EM turns unknown component labels into fractional counts. The same weighted-estimation mechanism explains the parameter updates, effective sample sizes and the danger of nearly empty components.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> An unrestricted mixture likelihood can diverge as a covariance collapses. More iterations and higher likelihood do not necessarily mean a better model.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Calculate responsibilities with mixing weights and full Gaussian normalisation.</li>
    <li>Use weighted maximum-likelihood estimates and stable log arithmetic.</li>
    <li>Choose covariance complexity relative to available data.</li>
    <li>Separate density components, hard labels and semantic populations.</li>
  </ul>
</div>

## References

1. Dempster, Laird and Rubin. [Maximum Likelihood from Incomplete Data Via the EM Algorithm](https://academic.oup.com/jrsssb/article/39/1/1/7027539). JRSS B, 1977.
2. scikit-learn. [Gaussian mixture models](https://scikit-learn.org/stable/modules/mixture.html).
