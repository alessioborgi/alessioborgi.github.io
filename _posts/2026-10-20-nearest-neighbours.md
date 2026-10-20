---
layout: "single"
title: "K-Nearest Neighbours: Local Prediction, Distance Weighting and Dimensionality"
date: "2026-10-20 10:04:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "supervised"
tags: ["machine-learning", "classification", "regression", "nearest-neighbours"]
excerpt: "Compute classification and regression predictions, analyse the neighbourhood-size tradeoff, and understand why representation and search strategy dominate this simple estimator."
author_profile: true
read_time: true
is_overview: false
icon: "👥"
read_mins: 5
permalink: "/blog/basics/nearest-neighbours/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> K-nearest neighbours predicts from the labels or targets of nearby training observations. Its fitted representation and distance determine what nearby means. Small neighbourhoods adapt locally but are noisy; large neighbourhoods smooth more strongly and can erase useful boundaries.
</div>

## A model stored in the training examples

KNN does little parameter fitting beyond storing the transformed training data and possibly building a search index. At prediction time, it retrieves neighbours and aggregates their outcomes. This shifts much of the computational and statistical work into representation, distance and query-time search.

The assumption is local regularity: similar feature vectors tend to have similar responses. That can be reasonable for meaningful physical measurements and poor for arbitrary category codes. A simple prediction rule can still rest on a complicated feature pipeline.

## Classification and regression use different aggregations

Let $$N_k(x)$$ be the selected k training neighbours. Unweighted regression predicts

<div class="formula-box">
\[
\hat f(x)=\frac1k\sum_{i\in N_k(x)}y_i.
\]\n</div>

Classification estimates local class frequencies and chooses a class according to those frequencies or an explicit decision cost. A weighted form uses nonnegative weights $$w_i(x)$$:

<div class="formula-box">
\[
\hat p(c\mid x)=\frac{\sum_{i\in N_k(x)}w_i(x)\mathbf1[y_i=c]}{\sum_{i\in N_k(x)}w_i(x)}.
\]\n</div>

These local frequencies are not automatically well-calibrated probabilities, particularly with small k, imbalanced sampling or shifted deployment data. Check calibration if decisions depend on numeric probabilities.

## Work through a prediction

Suppose the three neighbours have targets 10, 20 and 40 at distances 1, 2 and 4. Unweighted regression predicts $$70/3\approx23.33$$. Inverse-distance weights are 1, 0.5 and 0.25, giving

<div class="formula-box">
\[
\hat f(x)=\frac{10+10+10}{1+0.5+0.25}=\frac{120}{7}\approx17.14.
\]\n</div>

The nearest observation now has greater influence. For classification with labels A, B, B at those same distances, unweighted voting chooses B, but inverse-distance voting gives A total weight 1 and B total 0.75, so it chooses A.

Weighting changes the estimator, not just the implementation speed. Zero-distance matches need a deliberate rule: one common choice uses only exact matches rather than dividing by zero. Conflicting labels among duplicate feature vectors expose uncertainty that no distance metric can resolve without extra information.

## Neighbourhood size controls smoothing

With k=1, predictions can change abruptly near individual observations. Increasing k reduces local sampling noise but reaches farther into feature space. A broad neighbourhood can cross a genuine decision boundary or average away a rare local response pattern.

As dataset size grows, a fixed k and a growing k describe different asymptotic procedures. Classical consistency results require conditions such as k growing while k/n tends to zero, together with assumptions on the problem. They do not guarantee that a convenient finite-data setting is best.

Choose k and distance weighting through [validation](/blog/basics/ml-cross-validation/). An odd k reduces some binary-vote ties but does not eliminate multiclass ties or distance ties. Store the tie-breaking policy for reproducibility.

## Distance is the main modelling decision

Euclidean distance gives scale and rotation their usual geometric meaning. Manhattan distance changes neighbourhood shape. Cosine dissimilarity emphasises direction and ignores overall magnitude after normalisation. Mixed numerical and categorical data may need a more specialised representation or dissimilarity.

Fit scaling only on training data. Adding irrelevant features can make genuinely similar observations far apart, while duplicate or highly correlated features can effectively count one property several times. Feature selection or dimensionality reduction can help, but must be fitted inside the same validation boundary.

A learned embedding may make local prediction effective, yet its training data and objective are then part of the KNN system. Reporting “no training required” would omit the work that created the geometry.

## Why high dimensions are difficult

As dimension increases, a local neighbourhood can occupy a large fraction of the feature range before containing enough observations. Distances may become less discriminative, and the sample requirement for local estimation can grow sharply.

For an idealised uniform unit cube, a side-length fraction r occupies volume $$r^d$$. Capturing one percent of the volume requires $$r=0.01^{1/d}$$: approximately 0.1 in two dimensions and 0.794 in twenty. This simplified geometry illustrates why “local” can become surprisingly broad; it is not a universal quantitative law for structured real datasets.

## Search cost and approximation

Brute-force Euclidean prediction costs roughly $$O(nd)$$ per query before selecting neighbours. KD-trees and ball trees can help in favourable dimensions and data distributions, while approximate indexes trade exact neighbour recovery for speed and memory choices.

Evaluate approximation through final predictive quality as well as neighbour recall. Missing the nearest observation may be harmless when nearby labels agree and harmful near a rare boundary. Include index construction, stored vectors and query latency in the resource report.

## A practical evaluation checklist

Use a constant or class-prior baseline, compare several neighbourhood sizes, inspect exact matches and evaluate rare classes. Exclude the query’s own training row when measuring leave-one-out behaviour; evaluating training points with themselves as neighbours makes k=1 look deceptively perfect.

KNN cannot extrapolate ordinary regression targets beyond the convex range of the neighbours under nonnegative averaging. Its usefulness comes from local examples, so inspect which examples actually drive important predictions. That makes failure analysis concrete rather than attributing every error to an opaque model.

<div class="insight-box">
  <strong>Key Insight:</strong> KNN delegates modelling to the geometry and the local sample. The aggregation is simple, but every preprocessing choice changes which evidence is available to that aggregation.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Training-set accuracy with self-neighbours can be perfect while generalisation is poor. Evaluate with the query excluded and with deployment-appropriate splits.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Calculate unweighted and weighted predictions explicitly.</li>
    <li>Tune neighbourhood size as a smoothing parameter.</li>
    <li>Audit feature scales, irrelevant dimensions and duplicate observations.</li>
    <li>Compare search cost and approximation using held-out predictive performance.</li>
  </ul>
</div>

## References

1. scikit-learn. [Nearest Neighbors](https://scikit-learn.org/stable/modules/neighbors.html).
2. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
