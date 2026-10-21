---
layout: "single"
title: "Decision Trees: Split Criteria, Leaf Predictions and Cost-Complexity Pruning"
date: "2026-10-20 10:06:00 +0100"
categories: ["basics"]
book: "basics"
subsection: trees-ensembles
tags: ["machine-learning", "classification", "regression", "decision-trees"]
excerpt: "Calculate Gini and regression split improvements, understand greedy axis-aligned partitions, and connect leaf size and pruning to prediction stability."
author_profile: true
read_time: true
is_overview: false
icon: "🌳"
read_mins: 5
permalink: "/blog/basics/decision-trees/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A decision tree recursively partitions feature space and predicts within each leaf. Split criteria measure the improvement from a candidate partition, while depth, leaf size and pruning control complexity. The resulting rules are easy to inspect, but small changes in data can change the tree substantially.
</div>

## A tree is a partitioning procedure

A numerical split asks whether a feature is below a threshold. Following several splits defines a region, and a leaf predicts a constant: a mean for squared-error regression or class proportions for classification. Interactions appear because a later rule can depend on which earlier branch was taken.

The standard axis-aligned tree used here is not every possible decision tree. Oblique trees split on combinations of features, and specialised trees can fit models in leaves. State the variant before transferring conclusions about geometry or extrapolation.

## Score the improvement, not just the children

For a parent set S with children L and R, a classification impurity reduction is

<div class="formula-box">
\[
\Delta I=I(S)-\frac{|L|}{|S|}I(L)-\frac{|R|}{|S|}I(R).
\]
</div>

Gini impurity is $$1-\sum_c p_c^2$$. Entropy is $$-\sum_c p_c\log p_c$$ with a specified log base. Both reward purity, but they are not identical criteria and can rank candidate splits differently.

Weighting children by size prevents a tiny pure leaf from receiving the same influence as a large child. An implementation also restricts eligible thresholds using minimum leaf sizes, missing-value handling and numerical conventions.

## Calculate a classification split

Suppose a parent contains four positive and four negative observations, so Gini is 0.5. A candidate creates a pure child with three positives and a second child with one positive and four negatives.

The second child’s impurity is $$1-(1/5)^2-(4/5)^2=0.32$$. Weighted child impurity is $$3/8\cdot0+5/8\cdot0.32=0.2$$, so the gain is 0.3. A split yielding two equally mixed children has zero gain even if the threshold looks meaningful in the raw feature distribution.

Class weights change the proportions and objective. They can reflect unequal costs or sampling choices, but the resulting leaf frequencies should not automatically be interpreted as deployment probabilities without checking their construction and calibration.

## Regression splits minimise residual variation

For a leaf with targets $$y_i$$, the squared-error minimiser is their mean. The split reduction can therefore be written as parent SSE minus child SSEs.

For targets 1, 2, 8 and 9, the parent mean is 5 and SSE is $$16+9+9+16=50$$. Splitting into {1,2} and {8,9} gives child means 1.5 and 8.5, with total SSE 1. The improvement is 49.

```python
def sse(values):
    mean = sum(values)/len(values)
    return sum((value-mean)**2 for value in values)
assert sse([1, 2, 8, 9]) == 50
assert sse([1, 2])+sse([8, 9]) == 1
```

Absolute-error leaves would use medians and a different objective. The split and prediction rules should be derived from the same loss rather than mixed casually.

## Greedy growth has consequences

Choosing the best immediate split does not guarantee the best complete tree. A weak-looking early split can enable valuable later interactions, while a large immediate gain can lead to an inferior overall partition. Exhaustively searching trees is much harder than greedy recursive partitioning.

A deep tree can isolate individual observations, fitting noise or rare coincidences. Small changes in the training sample may alter an early split and therefore much of the later tree. This high variance motivates [random forests](/blog/basics/random-forests/) and careful complexity control.

## Pre-pruning and post-pruning

Maximum depth limits the number of sequential decisions. Minimum leaf size ensures each prediction has a minimum amount of supporting data. Minimum impurity improvement prevents splits with negligible immediate gain. These controls have different effects and should be tuned with the task in mind.

Cost-complexity pruning considers a fitted tree T and an objective such as

<div class="formula-box">
\[
R_\alpha(T)=R(T)+\alpha|\mathcal L(T)|,
\]
</div>

where R is the chosen training risk and $$\mathcal L(T)$$ its leaves. Increasing alpha trades fit for fewer leaves. A pruning path supplies candidate subtrees; validation chooses among them. Training risk alone would favour the larger tree.

## Geometry, scaling and extrapolation

Positive monotone transformations preserve the ordering of a numerical feature, so exact threshold-based trees usually need no standardisation. Histogram approximations, finite precision and handling of unseen values can modify that practical invariance. Category encoding remains important: arbitrary integer codes restrict which category sets a threshold can separate.

A diagonal boundary requires several axis-aligned steps. A regression tree with constant leaves predicts existing leaf means outside the training range, so it does not extrapolate a rising trend the way a linear model can. More depth adds regions inside observed structure but does not remove this constant-leaf property.

## Interpret with supporting data

Display leaf sample counts, class distributions or target spread alongside the rules. A concise path based on two observations is less reliable than one supported by hundreds. Impurity-based feature importance can favour features with many candidate splits and can split credit unpredictably among correlated features.

Use held-out permutation diagnostics with appropriate caveats about feature dependence, and inspect several plausible trees. Evaluate on grouped or temporal splits when required. A readable tree is valuable, but readability alone does not establish stability, causality or generalisation.

<div class="insight-box">
  <strong>Key Insight:</strong> The tree’s simplicity comes from constant predictions within recursively selected regions. That same structure explains its interactions, discontinuities, sensitivity to early splits and weak extrapolation.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A pure leaf supported by very few observations can look certain while generalising poorly. Read the rule together with its sample count and validation evidence.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Calculate size-weighted impurity or SSE reductions.</li>
    <li>Distinguish greedy growth from globally optimal tree search.</li>
    <li>Tune leaf size, depth and pruning with validation.</li>
    <li>Inspect stability, probability quality and extrapolation limits.</li>
  </ul>
</div>

## References

1. scikit-learn. [Decision Trees](https://scikit-learn.org/stable/modules/tree.html).
2. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
