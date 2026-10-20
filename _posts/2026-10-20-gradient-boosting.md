---
layout: "single"
title: "Gradient Boosting: Functional Gradients, Leaf Updates and Regularisation"
date: "2026-10-20 10:09:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "trees-ensembles"
tags: ["machine-learning", "ensembles", "gradient-boosting", "optimisation"]
excerpt: "Derive residual fitting from the loss gradient, work through a regression update, and extend the mechanism to logistic and second-order tree boosting."
author_profile: true
read_time: true
is_overview: false
icon: "🚀"
read_mins: 5
permalink: "/blog/basics/gradient-boosting/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Gradient boosting builds an additive predictor by fitting new learners to directions that reduce the current loss. Residual fitting is the squared-error special case. Learning rate, learner complexity, sampling and stopping jointly control how the sequence generalises.
</div>

## Optimise a function one increment at a time

Let $$F(x)$$ be the current predictor and $$L(y,F(x))$$ the loss. Gradient boosting adds a small function from a restricted learner family, often shallow trees. The learner approximates a descent direction on the training observations.

Unlike [random forests](/blog/basics/random-forests/), later learners depend on the current ensemble. Unlike a generic neural network update, a boosting step adds a new fitted function rather than updating all existing tree structures through backpropagation.

## Derive pseudo-residuals

At iteration t, compute

<div class="formula-box">
\[
r_{it}=-\left.\frac{\partial L(y_i,F)}{\partial F}\right|_{F=F_{t-1}(x_i)}.
\]\n</div>

Fit a base learner $$h_t(x)$$ to approximate these values, then update

<div class="formula-box">
\[
F_t(x)=F_{t-1}(x)+\nu\gamma_t h_t(x),
\]\n</div>

where nu is a shrinkage factor and gamma may be selected by a line search. Tree implementations often estimate separate leaf values instead of one global multiplier. The details depend on the loss and boosting variant.

For $$L=\tfrac12(y-F)^2$$, the negative gradient is y−F: the ordinary residual. For other losses, fitting raw response residuals is generally not the correct procedure.

## A squared-error step by hand

Take targets 1, 2, 8 and 9. The best constant initial predictor is their mean, 5. Pseudo-residuals are −4, −3, 3 and 4. Suppose a stump partitions the observations into the first two and last two, giving leaf predictions −3.5 and 3.5.

With learning rate 0.2 and unit multiplier, predictions become 4.3, 4.3, 5.7 and 5.7. SSE decreases from 50 to $$3.3^2+2.3^2+2.3^2+3.3^2=32.36$$. The small step deliberately leaves error for later corrections.

```python
y = [1.0, 2.0, 8.0, 9.0]
step = [-3.5, -3.5, 3.5, 3.5]
pred = [5.0+0.2*value for value in step]
sse = sum((a-b)**2 for a, b in zip(y, pred))
assert abs(sse-32.36) < 1e-10
```

This example assumes the stump’s feature split creates those groups. Targets alone cannot define a valid prediction-time split; the tree must find the partition using input features.

## Logistic loss fits a different correction

For binary y in {0,1}, let F be a logit and $$p=\sigma(F)$$. The Bernoulli negative log-likelihood has derivative p−y, so the pseudo-residual is y−p.

A positive example predicted at probability 0.1 receives residual 0.9, while one predicted at 0.9 receives 0.1. These are gradients in logit space. Adding a tree directly to probabilities and then clipping is a different procedure.

Initialise with a suitable constant, often the training log-odds with safeguards for degenerate class counts. Class weights and alternative losses change the gradient and the target being optimised.

## Second-order updates use curvature

Some boosting methods approximate each observation’s loss with its first derivative $$g_i$$ and second derivative $$h_i$$. For a leaf with constant output w and an L2 leaf penalty lambda, a quadratic approximation gives

<div class="formula-box">
\[
\sum_{i\in\mathrm{leaf}}g_iw+
\frac12\left(\sum_{i\in\mathrm{leaf}}h_i+\lambda\right)w^2,
\qquad
w^*=-\frac{\sum_i g_i}{\sum_i h_i+\lambda}.
\]\n</div>

This is a local approximation with explicit regularisation, not the definition of every gradient-boosting algorithm. Numerical safeguards matter when curvature is small. Split penalties, leaf constraints and histogram construction add further implementation choices.

## Regularisation is a system of choices

A smaller learning rate usually needs more rounds. Shallower trees restrict interaction complexity. Minimum leaf size limits fitting to tiny groups. Row and feature subsampling introduce randomness and can improve generalisation in some settings. These controls interact, so tune them as a procedure rather than one at a time without context.

Early stopping selects the number of rounds based on validation performance. The stopping set is used for model selection and should not also be presented as an untouched final test. Grouped and temporal tasks need appropriately constructed stopping data.

## What the model can and cannot express

An ensemble of axis-aligned trees can approximate complicated nonlinear relationships through many regions. Constant-leaf trees still do not give ordinary linear extrapolation outside observed feature ranges. More rounds can refine the observed partition without learning a trend beyond it.

Boosting can be sensitive to label errors because repeated corrections keep focusing on difficult observations. Robust losses alter which residual patterns receive attention. Compare the chosen loss with the application’s error costs rather than treating squared error or log loss as universally sufficient.

## Evaluate performance and cost together

Compare a constant baseline, a single tree and a random forest under the same preprocessing and validation rules. Record learning rate, rounds, depth or leaf constraints, sampling, loss and any second-order penalties. Training time and prediction latency both grow with ensemble size and implementation details.

Inspect residuals or calibration, performance on rare regimes and stability across seeds. A small gain obtained after a much larger search budget should be described honestly. The mechanism is powerful because each step targets current errors, but credible evaluation determines whether that flexibility was used productively.

<div class="insight-box">
  <strong>Key Insight:</strong> Residual fitting is a consequence of squared-error loss. Starting from the derivative makes it possible to change the loss correctly instead of reusing the same residual recipe everywhere.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Early stopping and hyperparameter tuning consume validation information. Keep final evaluation outside those decisions, and avoid adding logit-space updates directly to probabilities.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Derive pseudo-residuals from the selected loss.</li>
    <li>Work through a shrinkage step and distinguish global from leaf-specific updates.</li>
    <li>Treat second-order formulas as a specified variant.</li>
    <li>Tune complexity and stopping with deployment-aware validation.</li>
  </ul>
</div>

## References

1. Friedman. [Greedy Function Approximation: A Gradient Boosting Machine](https://doi.org/10.1214/aos/1013203451). Annals of Statistics, 2001.
2. scikit-learn. [Ensemble methods user guide](https://scikit-learn.org/stable/modules/ensemble.html).
