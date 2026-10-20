---
layout: "single"
title: "Lasso Regression: Soft Thresholding, Sparse Solutions and Correlated Features"
date: "2026-10-20 10:03:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "supervised"
tags: ["machine-learning", "regression", "regularisation", "sparsity"]
excerpt: "Derive the coordinate update from the L1 subgradient, calculate exact zeros, and explain when sparse selection becomes unstable or elastic net is preferable."
author_profile: true
read_time: true
is_overview: false
icon: "✂️"
read_mins: 5
permalink: "/blog/basics/lasso-regression/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Lasso adds an L1 penalty to squared error, allowing some coefficients to become exactly zero. Soft thresholding explains how this happens. Sparsity can aid compression and interpretation, but correlated predictors and limited data can make the selected feature set unstable.
</div>

## A penalty that can remove coefficients

Ridge discourages large coefficient magnitude smoothly. Lasso has a corner at zero, which allows the optimum to remain exactly zero over a range of data correlations. That is the mathematical source of sparsity, not a separate pruning threshold applied after fitting.

Sparse prediction and discovering the true causal variables are different tasks. A selected feature may proxy for an omitted measurement, and one of several nearly identical predictors may be chosen almost arbitrarily. Interpret the selection in the context of available variables and sampling.

## Fix the normalisation

For centred data, define

<div class="formula-box">
\[
J(\beta)=\frac{1}{2n}\|y-X\beta\|^2+\alpha\sum_j|\beta_j|,
\qquad\alpha\ge0.
\]\n</div>

The factor $$1/(2n)$$ determines the numeric scale of alpha. Other conventions rescale the penalty. As with ridge, the intercept is ordinarily unpenalised and feature scaling affects which coefficients are cheap to use.

The objective is convex, but coefficient uniqueness is not guaranteed for every rank-deficient design. Different coefficient vectors can give the same fitted values. Convexity prevents bad local minima of the objective; it does not guarantee a unique scientific explanation.

## Derive a coordinate update

Hold all coefficients except j fixed and define the partial residual $$r_j=y-\sum_{l\ne j}x_l\beta_l$$. Let $$a_j=x_j^\top x_j/n$$ and $$c_j=x_j^\top r_j/n$$. Ignoring constants, the one-coordinate problem is

<div class="formula-box">
\[
\min_b\ \frac12a_jb^2-c_jb+\alpha|b|.
\]\n</div>

For nonzero b, differentiation introduces $$\alpha\operatorname{sign}(b)$$. At zero, the subgradient of absolute value is the interval [−1,1]. Combining these cases gives

<div class="formula-box">
\[
\beta_j\leftarrow\frac{S(c_j,\alpha)}{a_j},
\qquad S(c,\alpha)=\operatorname{sign}(c)\max(|c|-\alpha,0).
\]\n</div>

A zero-variance feature requires separate handling because $$a_j=0$$. Iterating these coordinate minimisations is a common optimisation strategy.

## A thresholding calculation

Assume a standardised coordinate with $$a_j=1$$. If $$c_j=0.6$$ and alpha=0.2, the update is 0.4. If $$c_j=0.1$$, it is exactly zero. If $$c_j=-0.6$$, it is −0.4.

```python
def soft_threshold(value, penalty):
    if value > penalty:
        return value-penalty
    if value < -penalty:
        return value+penalty
    return 0.0
assert abs(soft_threshold(0.6, 0.2)-0.4) < 1e-12
assert soft_threshold(0.1, 0.2) == 0.0
assert abs(soft_threshold(-0.6, 0.2)+0.4) < 1e-12
```

The threshold applies to correlation with the current partial residual, not simply the feature’s marginal correlation with y. As other coefficients change, a variable can enter or leave the active set. A one-time univariate screening step is not equivalent to fitting lasso.

## Why correlated features create ambiguity

If two columns are identical, prediction depends on their coefficient sum. For same-sign coefficients with a fixed sum, the total L1 penalty can also be identical. The optimiser can allocate weight across them without a clear statistical reason to prefer one measurement.

With near-duplicates, tiny perturbations can switch which feature receives a nonzero coefficient. Prediction may remain stable while the selected set changes. Evaluate both outcomes separately: held-out error answers one question, selection frequency under resampling answers another.

A coefficient being zero does not establish that the underlying variable is irrelevant in every population or under every feature representation. Interactions, transformations and omitted confounders can change that conclusion.

## Elastic net combines the penalties

Elastic net adds an L2 term to an L1 term. Under a common convention,

<div class="formula-box">
\[
J(\beta)=\frac{\|y-X\beta\|^2}{2n}
+\alpha\rho\|\beta\|_1+\frac{\alpha(1-\rho)}2\|\beta\|_2^2.
\]\n</div>

The L2 part stabilises correlated directions while the L1 part retains the possibility of zeros. It can encourage related predictors to remain together more readily than pure lasso, but it introduces a second tuning dimension. Report both alpha and the mixing parameter rho.

## Follow a path without overinterpreting it

A regularisation path shows coefficients as the penalty varies. At a sufficiently large penalty all penalised coefficients can be zero; decreasing the penalty permits a more flexible fit. Entry order depends on scaling and correlation, so it is not a universal ranking of causal importance.

Choose the penalty with [validation](/blog/basics/ml-cross-validation/), fitting scaling and selection inside every training fold. Selecting features once on the full dataset before cross-validation leaks information and makes the score too optimistic.

## Interpret and deploy the result

Report predictive performance, coefficient units, selected variables and their stability. If a selected model is refitted without the penalty, the final estimator has changed and must be evaluated as part of that procedure. Ordinary least-squares confidence intervals after data-driven selection are not automatically valid.

Lasso is useful when a sparse predictive representation is desirable and enough information exists to identify it. Compare ridge when many correlated predictors share weak signal, and compare simpler domain-driven feature sets when interpretability requires stable scientific meaning rather than a short coefficient list.

<div class="insight-box">
  <strong>Key Insight:</strong> Exact zeros follow from a subgradient interval at zero. The same derivation shows that selection depends on partial residuals and feature scale, not a universal variable-importance ordering.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Stable predictions can coexist with unstable selected features. Resample the data before claiming that one sparse fit has identified the uniquely important variables.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>State the loss normalisation and scaling convention.</li>
    <li>Derive soft thresholding rather than treating zeros as postprocessing.</li>
    <li>Inspect correlated-feature and selection instability.</li>
    <li>Validate the entire selection procedure, including any unpenalised refit.</li>
  </ul>
</div>

## References

1. scikit-learn. [Linear models user guide](https://scikit-learn.org/stable/modules/linear_model.html).
2. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
