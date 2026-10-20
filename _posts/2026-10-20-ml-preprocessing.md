---
layout: "single"
title: "ML Preprocessing: Scaling, Missing Values and Leakage-Safe Pipelines"
date: "2026-10-20 10:00:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "foundations"
tags: ["machine-learning", "preprocessing", "data-leakage", "pipelines"]
excerpt: "Work through training-only scaling, distinguish missingness strategies, and build preprocessing decisions around the distance, loss and deployment information available."
author_profile: true
read_time: true
is_overview: false
icon: "🧹"
read_mins: 5
permalink: "/blog/basics/ml-preprocessing/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Preprocessing is part of the fitted model. Means, scales, imputers, encoders and feature selection must be learned from the training portion of each split. Their choices change the geometry and information available to the estimator, so they need the same validation discipline as the estimator itself.
</div>

## A transformation can determine the model’s answer

Suppose a dataset contains income in pounds and age in years. Euclidean distance will often be dominated by income’s numerical scale. Converting income to thousands of pounds changes nearest neighbours and k-means assignments even though the underlying observations are unchanged.

Scaling makes a chosen geometry explicit. It does not reveal an objectively correct weighting. Equal variance, equal physical range and domain-specific costs describe different relationships. Document why the transformation fits the task rather than applying a scaler as a ritual.

## Fit on training data, transform future data

A standardised numerical feature is

<div class="formula-box">
\[
z=\frac{x-\mu_{\mathrm{train}}}{s_{\mathrm{train}}}.
\]\n</div>

For training observations 1, 2 and 3, the mean is 2. Using population variance for this transformer gives $$s=\sqrt{2/3}$$. A future value 4 transforms to $$2/\sqrt{2/3}\approx2.449$$. It can lie outside the range of transformed training values; that is normal.

If the future value is included when calculating the mean and scale, the model’s representation changes using information unavailable during training. The leak can be subtle even though no target labels were used. In cross-validation, refit the scaler inside each training fold.

```python
train = [1.0, 2.0, 3.0]
mean = sum(train)/len(train)
scale = (sum((x-mean)**2 for x in train)/len(train))**0.5
future = (4.0-mean)/scale
assert abs(future-2.449489742783178) < 1e-12
```

Constant features require a policy because their standard deviation is zero. A library may leave them unchanged after centring or set a safe scale internally. Inspect rather than dividing blindly.

## Choose scaling to match the estimator

Standardisation is useful for many distance-based, penalised linear and gradient-based models. Min–max scaling fixes the training range but does not guarantee future values stay inside it. Robust centring and interquartile-range scaling reduce sensitivity of the scaling statistics to extreme values without removing outliers from the later loss.

Ordinary axis-aligned trees depend mainly on feature order, so positive rescaling is usually unnecessary. Their invariance has practical limits with histogram binning, numerical precision and missing-value rules. One preprocessing recipe is not automatically appropriate for both trees and nearest neighbours.

Sparse features deserve care: subtracting a nonzero mean can densify a sparse matrix and overwhelm memory. Use transformations that preserve sparsity when appropriate, and understand what centring-dependent methods such as PCA require.

## Missing values carry assumptions

Mean or median imputation supplies a simple baseline, but it shrinks variance and can distort correlations. A missingness indicator can retain whether a value was absent. Its usefulness depends on whether the observation process at deployment resembles training.

Distinguish missing completely at random, missing conditional on observed variables, and missingness depending on unobserved values. No simple imputer makes all these mechanisms equivalent. Predictive adequacy and unbiased scientific estimation are also different objectives.

Fit imputation statistics inside each training split. Filling missing values using a full-dataset mean before splitting exposes the held-out distribution. More elaborate iterative imputers and learned encoders need the same boundary, often with greater scope for leakage.

## Categorical variables and unseen values

Integer-coding categories as 0, 1 and 2 introduces an order and distance that may not exist. One-hot encoding represents nominal distinctions without that artificial scalar spacing, while native categorical estimators use their own documented treatment.

Choose a policy for categories absent during training. Ignoring them, reserving an unknown category and grouping rare categories produce different predictions. Store the fitted vocabulary so deployment uses the same mapping.

Target encoding is especially sensitive: a category statistic calculated with an observation’s own label leaks the target into its features. Training representations need an out-of-fold or otherwise properly regularised construction, and evaluation folds must remain excluded from every fitted statistic.

## The split comes before learning transformations

Separate the test population before fitting preprocessing. During model selection, fit a complete pipeline on each training fold and evaluate its transformation and prediction together on the corresponding validation fold.

This applies to PCA, feature selection, outlier filtering, vocabulary construction and hyperparameter tuning, not just scalers. If several records belong to one patient or device, a correct pipeline still leaks identity if the split puts related records on both sides. [Validation design](/blog/basics/ml-cross-validation/) supplies the other half of the boundary.

## Audit the deployed contract

Save feature names and order, units, accepted categories, missingness policy and fitted statistics alongside the estimator. Verify a few observations by hand from raw input to prediction. A model can be statistically sound and fail because deployment swaps two columns or uses a different unit.

Compare a simple baseline, then add transformations one at a time under the same validation protocol. Inspect how they change neighbour relationships, coefficient scales, calibration and performance on important subgroups. The useful question is what information the transformation preserves or removes for the chosen task.

<div class="insight-box">
  <strong>Key Insight:</strong> The fitted transformation and estimator form one model. A validation score is trustworthy only when both were learned without access to the evaluated observations.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Unsupervised transformations can leak held-out distribution information too. Fitting PCA or scaling on all observations before cross-validation changes the experiment.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Fit statistics and vocabularies inside each training split.</li>
    <li>Choose transformations for the estimator’s geometry and loss.</li>
    <li>Treat missingness and unseen categories as explicit model assumptions.</li>
    <li>Save and verify the complete raw-input-to-prediction contract.</li>
  </ul>
</div>

## References

1. scikit-learn. [Preprocessing data](https://scikit-learn.org/stable/modules/preprocessing.html).
2. scikit-learn. [Common pitfalls and recommended practices](https://scikit-learn.org/stable/common_pitfalls.html).
3. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
