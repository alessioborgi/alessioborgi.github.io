---
layout: "single"
title: "Random Forests: Bootstrap Trees, Feature Randomness and Out-of-Bag Evaluation"
date: "2026-10-20 10:07:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "trees-ensembles"
tags: ["machine-learning", "ensembles", "random-forests", "bagging"]
excerpt: "Derive the variance of correlated averages, calculate the out-of-bag fraction, and explain why random feature subsets and diagnostic choices matter."
author_profile: true
read_time: true
is_overview: false
icon: "🌲"
read_mins: 5
permalink: "/blog/basics/random-forests/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Random forests average trees trained with randomness in observations and candidate features. Averaging reduces variation most effectively when trees are individually useful but not too correlated. Out-of-bag predictions provide a convenient internal estimate, while deployment-aware validation and careful feature interpretation remain necessary.
</div>

## Why average unstable trees?

A single deep [decision tree](/blog/basics/decision-trees/) can change substantially after a small training perturbation. Fit several trees on perturbed datasets and average their predictions, and some of that instability can cancel.

For regression, average predicted values. For classification, a common implementation averages per-tree class probabilities before choosing a label; majority voting is another rule and need not be identical. State the aggregation when reproducing a result.

## Correlation limits variance reduction

Suppose B scalar tree predictions have equal variance $$\sigma^2$$ and equal pairwise correlation rho. Expanding the variance of their mean gives

<div class="formula-box">
\[
\operatorname{Var}(\bar T)=\rho\sigma^2+\frac{1-\rho}{B}\sigma^2.
\]\n</div>

If $$\sigma^2=4$$, rho=0.25 and B=100, the variance is $$1+0.03=1.03$$. With independent predictions it would be 0.04. More trees reduce the finite-ensemble term but cannot remove the shared component in this simplified model.

This equal-correlation calculation is an intuition, not an exact measurement for every fitted forest. It explains why merely copying the same tree many times does nothing and why forest design seeks diverse useful trees.

## Bootstrap observations and randomise features

A bootstrap sample draws n observations with replacement from n training observations. Some records appear multiple times and some are absent. Each tree grows using its sample.

At each split, the forest considers a random subset of candidate features. If one very strong feature otherwise dominates every tree’s first split, feature subsampling gives alternative useful features a chance and can reduce correlation. Too few candidates can weaken trees excessively, so diversity and individual quality must be balanced.

Feature randomness is usually renewed at every split, not selected once for the whole forest. Other ensembles, including extremely randomised trees, introduce different threshold and sampling randomness. They share ideas but are not identical procedures.

## Calculate the out-of-bag opportunity

The probability that a particular observation is absent from one size-n bootstrap sample is

<div class="formula-box">
\[
\left(1-\frac1n\right)^n\longrightarrow e^{-1}\approx0.368.
\]\n</div>

Thus each training observation is excluded from roughly 36.8% of sufficiently large bootstrap samples on average. Its out-of-bag prediction aggregates only trees that did not train on it.

With many trees, these predictions give a convenient internal evaluation. With few trees, some observations may have too little out-of-bag support. Sample weighting, alternative bootstrap sizes and implementation details affect the precise interpretation.

## What out-of-bag evaluation does not guarantee

If preprocessing was fitted on all data before the forest, out-of-bag trees may still receive representations influenced by the evaluated observations. If repeated records from one patient occur in different bootstrap samples, excluding one row does not exclude the patient’s information.

Out-of-bag evaluation also becomes part of model selection when it is repeatedly used to tune configurations. A final test or outer evaluation remains valuable for assessing the selected procedure. Use [grouped or temporal validation](/blog/basics/ml-cross-validation/) when that matches deployment, regardless of the convenience of the internal score.

## Hyperparameters have distinct roles

The number of trees controls Monte Carlo stability and compute. Minimum leaf size controls how local each tree’s estimates can become. Maximum features influences strength and correlation. Bootstrap size and class weighting change the distribution each tree sees.

Increasing the number of trees is not the same regularisation path as making one tree deeper. Once predictions and validation metrics stabilise, extra trees mainly cost memory and latency. Depth and leaf size can still change bias, variance and calibration materially.

For imbalanced data, examine minority-class recall and probability quality rather than only accuracy. A forest can predict the majority class well while providing little value for the rare event that matters.

## Feature importance requires care

Impurity importance totals split improvements credited to a feature. Features with many possible thresholds can receive an advantage, and correlated predictors can share or substitute for each other’s credit.

Permutation importance measures a held-out score drop after disrupting a feature. It is tied to the chosen score and data distribution; independent permutation can create implausible combinations when features are dependent. Grouped or conditional investigations can help answer a more specific question.

Neither importance measure estimates a causal effect. Inspect prediction changes, correlated feature groups and stability across refits before attaching scientific meaning to a ranked list.

## Practical limits and reporting

A forest of constant-leaf regression trees still lacks ordinary linear extrapolation outside the observed range. It can handle many nonlinear interactions without scaling, but storing and evaluating many trees can be expensive. Raw images or text generally require an appropriate representation rather than expecting tree splits to learn every useful structure from scratch.

Report tree count, candidate-feature rule, leaf constraints, bootstrap policy, validation design and relevant uncertainty. Compare with one tree, a linear baseline and [gradient boosting](/blog/basics/gradient-boosting/) under a fair tuning budget. A strong forest baseline is especially informative when a more complex method claims improvement.

<div class="insight-box">
  <strong>Key Insight:</strong> Averaging helps most when errors are not shared. Random feature subsets target correlation, while leaf size and candidate quality control how useful each individual tree remains.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Out-of-bag rows are not automatically independent of the trees’ other rows. Entity leakage, preprocessing leakage and repeated tuning can still make an internal score optimistic.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Derive the correlation floor in the variance of an average.</li>
    <li>Understand bootstrap exclusion and out-of-bag prediction.</li>
    <li>Tune tree strength and diversity separately from ensemble size.</li>
    <li>Interpret feature importance as predictive evidence, not causality.</li>
  </ul>
</div>

## References

1. Breiman. [Random Forests](https://doi.org/10.1023/A:1010933404324). Machine Learning, 2001.
2. scikit-learn. [Ensemble methods user guide](https://scikit-learn.org/stable/modules/ensemble.html).
