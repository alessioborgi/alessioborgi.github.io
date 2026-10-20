---
layout: "single"
title: "Ridge Regression: Shrinkage, Singular Directions and Stable Prediction"
date: "2026-10-20 10:02:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "supervised"
tags: ["machine-learning", "regression", "regularisation", "ridge"]
excerpt: "Derive the regularised least-squares solution, inspect shrinkage in the SVD basis, and connect scaling, intercept handling and validation to the meaning of the penalty."
author_profile: true
read_time: true
is_overview: false
icon: "📐"
read_mins: 5
permalink: "/blog/basics/ridge-regression/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Ridge adds an L2 penalty to least squares, shrinking unstable coefficient directions instead of discarding them. It can improve prediction under collinearity by accepting bias to reduce variance. The penalty’s meaning depends on feature scaling, loss normalisation and whether the intercept is penalised.
</div>

## Why least squares can be unstable

Two features may carry nearly the same information. If house size in square metres and an almost duplicate measurement both enter a model, many coefficient combinations make nearly identical predictions on the training data. Small perturbations can cause large individual coefficient changes.

[Ordinary least squares](/blog/basics/linear-regression/) chooses a minimum-residual fit. Ridge also discourages large coefficients. The goal is stable prediction under limited information, not proving that every feature has a small causal effect.

## Derive the objective and solution

For centred X and y, use the explicit convention

<div class="formula-box">
\[
J(\beta)=\|y-X\beta\|_2^2+\lambda\|\beta\|_2^2,
\qquad\lambda\gt 0.
\]\n</div>

Differentiating gives $$-2X^\top(y-X\beta)+2\lambda\beta=0$$, so

<div class="formula-box">
\[
(X^\top X+\lambda I)\hat\beta=X^\top y.
\]\n</div>

The matrix is positive definite for positive lambda, even if X is rank deficient. This states a linear system to solve, not an instruction to form an explicit inverse. Stable decompositions or iterative solvers are usually preferable.

Without centring, include an intercept and ordinarily exclude it from the penalty. Shrinking the intercept toward zero introduces a dependence on the arbitrary origin of the response. Training-only means let you fit the centred problem and reconstruct the intercept afterward.

## A one-feature calculation

Let $$X^\top X=4$$ and $$X^\top y=8$$. Least squares gives coefficient 2. With lambda=4, ridge gives $$8/(4+4)=1$$. The fitted relationship is deliberately shrunk, so training error generally increases relative to unconstrained least squares.

That does not guarantee test improvement. If the true coefficient is large and data is abundant, the bias may hurt more than variance reduction helps. Select the penalty using an appropriate held-out procedure rather than declaring regularisation universally beneficial.

## The SVD shows which directions shrink

Write $$X=USV^\top$$. Along a nonzero singular direction with singular value $$s_j$$, ridge uses

<div class="formula-box">
\[
\hat\beta_\lambda=V\operatorname{diag}\!\left(\frac{s_j}{s_j^2+\lambda}\right)U^\top y.
\]\n</div>

Compared with least squares, the coefficient contribution is multiplied by $$s_j^2/(s_j^2+\lambda)$$. Small singular values receive stronger relative shrinkage because the data provides less information in those directions.

For singular values 10 and 0.1 with lambda=1, the factors are approximately 0.9901 and 0.009901. The well-supported direction is nearly retained, while the unstable direction is heavily suppressed. The shrinkage occurs in rotated singular directions, not independently according to the apparent importance of each raw feature.

This connects ridge to [PCA](/blog/basics/pca-and-dimensionality-reduction/). Principal-component regression discards selected directions; ridge attenuates them continuously. Neither criterion alone guarantees preserving every low-variance direction useful for predicting y.

## Scaling changes the prior preference

Multiplying one feature by 1,000 divides the coefficient needed for the same prediction by 1,000. Its squared penalty then becomes a million times smaller. Standardising predictors is therefore part of specifying an equal-coefficient penalty, not merely improving numerical convenience.

For features with meaningful unequal scales or prior knowledge, a weighted penalty can be more appropriate. Fit all scaling statistics within each validation fold. The same numeric lambda in two libraries can also mean different regularisation if one averages the squared loss and another sums it.

A Gaussian-prior interpretation is available under a Gaussian noise model: an isotropic zero-mean prior on coefficients leads to an L2-penalised posterior mode, with lambda determined by a noise-to-prior variance ratio under the chosen convention. This interpretation does not make the model’s residual assumptions automatically true.

## Effective complexity changes smoothly

The ridge fitted values are $$\hat y=H_\lambda y$$ with $$H_\lambda=X(X^\top X+\lambda I)^{-1}X^\top$$. In the centred penalised subspace, a useful effective degrees-of-freedom measure is

<div class="formula-box">
\[
\operatorname{tr}(H_\lambda)=\sum_j\frac{s_j^2}{s_j^2+\lambda}.
\]\n</div>

It decreases continuously as lambda grows. An unpenalised intercept contributes separately. This is one way to describe model flexibility without counting every nonzero coefficient equally.

## What ridge does not solve

Ridge usually leaves coefficients nonzero. If sparse selection is the objective, [lasso](/blog/basics/lasso-regression/) changes the penalty geometry. Ridge is also not robust to large target outliers under squared loss, does not repair omitted nonlinear structure, and does not turn associations into causal effects.

Inspect residuals, performance by subgroup and sensitivity to feature definitions. Correlated features may share effects in ways that make individual coefficients difficult to interpret even when predictions are stable.

Tune lambda on a declared grid, compare with least squares and a simple baseline, and report the complete preprocessing-plus-estimator procedure. Save coefficient units and intercept handling so the resulting model can be interpreted consistently at deployment.

<div class="insight-box">
  <strong>Key Insight:</strong> Ridge shrinks directions where the design matrix provides weak information. The SVD makes that behaviour more precise than saying the method merely makes every coefficient smaller.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> The same lambda does not represent the same model after arbitrary rescaling or a change from summed to averaged loss. State the objective convention.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Derive ridge as a positive-definite least-squares system.</li>
    <li>Interpret shrinkage through singular values.</li>
    <li>Handle scaling and the intercept explicitly.</li>
    <li>Validate prediction and distinguish shrinkage from sparse feature selection.</li>
  </ul>
</div>

## References

1. scikit-learn. [Linear models user guide](https://scikit-learn.org/stable/modules/linear_model.html).
2. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
