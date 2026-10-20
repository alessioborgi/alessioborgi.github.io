---
layout: "single"
title: "Naive Bayes: Conditional Independence, Smoothing and Log-Space Prediction"
date: "2026-10-20 10:05:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "supervised"
tags: ["machine-learning", "classification", "probability", "naive-bayes"]
excerpt: "Derive the class score, calculate a smoothed text example, and distinguish Gaussian, multinomial and Bernoulli likelihoods and their failure modes."
author_profile: true
read_time: true
is_overview: false
icon: "🎲"
read_mins: 5
permalink: "/blog/basics/naive-bayes/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Naive Bayes combines a class prior with feature likelihoods assumed independent conditional on the class. This strong factorisation produces cheap estimation and useful baselines. Its predicted class can be good even when its probability estimates are overconfident because correlated evidence was counted repeatedly.
</div>

## Separate a useful simplification from a literal belief

Bayes’ rule gives $$p(y\mid x)\propto p(y)p(x\mid y)$$. Estimating the full joint feature distribution within each class can be expensive. Naive Bayes replaces it with a product:

<div class="formula-box">
\[
p(x\mid y=c)\approx\prod_{j=1}^d p(x_j\mid y=c).
\]\n</div>

The assumption is conditional independence given the class, not unconditional independence of the features. Words can be correlated across the population because they share a topic, while the model makes the stronger simplifying claim that remaining dependence within each class can be ignored.

This often works as a baseline because deciding which score is largest can tolerate errors in the full probability model. It does not follow that the resulting probabilities are reliable enough for every cost-sensitive decision.

## Predict in log space

For a class c, compute

<div class="formula-box">
\[
s_c=\log p(c)+\sum_j\log p(x_j\mid c).
\]\n</div>

Choose the class with the largest score. To obtain normalised probabilities, subtract a log-sum-exp over class scores before exponentiating. Directly multiplying hundreds of small likelihoods can underflow even when their ratio is informative.

Missing features require a model or an explicit marginalisation convention. Treating missing numerical values as zeros silently changes the likelihood. Likewise, a document vocabulary must be learned from training data and consistently applied to future observations.

## Choose the likelihood for the data

| Variant | Feature model | Typical interpretation |
|---|---|---|
| Gaussian | Independent class-specific normal densities | Continuous measurements |
| Multinomial | Counts over a fixed vocabulary | Repeated token occurrences |
| Bernoulli | Independent binary feature presence | Whether a feature occurs at all |

These are different statistical models. A multinomial model uses token counts; a Bernoulli model includes contributions from both presence and absence. Arbitrarily switching the estimator while keeping the same features can change the meaning of evidence.

Gaussian naive Bayes estimates a mean and variance for each class-feature pair. A variance floor or smoothing policy prevents numerical problems for nearly constant features, but the normality and independence assumptions still need scrutiny.

## A smoothed document calculation

Consider vocabulary {offer, meeting, project}. Training token counts in spam are (3,1,0), and in work mail they are (0,2,2). With additive smoothing alpha=1, each class has denominator $$4+3=7$$. The spam probabilities are (4/7,2/7,1/7), and work probabilities are (1/7,3/7,3/7).

For a document containing one “offer” and one “project”, with equal class priors, the unnormalised scores are $$\tfrac12\cdot\tfrac47\cdot\tfrac17=2/49$$ and $$\tfrac12\cdot\tfrac17\cdot\tfrac37=1.5/49$$. Normalising gives spam probability $$4/7\approx0.571$$.

The multinomial combinatorial coefficient is the same across classes for this document, so it cancels when comparing or normalising class scores. Leaving it out here is justified; leaving out class-dependent normalisation terms would not be.

Without smoothing, the zero training count for “project” in spam would make its entire document likelihood zero. Smoothing shares probability mass with unseen events rather than declaring them impossible.

## What additive smoothing assumes

For class c with total token count $$N_c$$ and vocabulary size V,

<div class="formula-box">
\[
\hat\theta_{cj}=\frac{N_{cj}+\alpha}{N_c+\alpha V}.
\]\n</div>

Larger alpha pulls the distribution more strongly toward a uniform vocabulary baseline. A symmetric Dirichlet prior supplies one interpretation, with care about posterior-mean versus posterior-mode conventions. Tune the predictive effect rather than treating alpha=1 as universally correct.

Class priors are separate from token probabilities. A balanced training sample may not reflect deployment prevalence. Adjusting priors can be appropriate under a defensible prior-shift assumption, but does not automatically fix changes in the class-conditional feature distributions.

## Correlated evidence and confidence

Suppose two duplicated features both strongly favour spam. The product model counts their likelihood ratios twice, increasing confidence despite receiving no new information. With perfect duplication, the class ranking might stay unchanged while the posterior becomes more extreme.

Negation and word order provide another limitation for count features. “Not a good offer” and a positive sentence with the same words can be represented too similarly. More training examples cannot recover distinctions removed by the representation.

Inspect calibration, log loss and decision thresholds in addition to classification accuracy. A model with acceptable ranking may require separately validated calibration before its probabilities are used as risk estimates.

## A defensible baseline

Fit vocabulary and likelihood parameters within the training split, use stable log arithmetic and test several smoothing strengths. Compare against a class-prior baseline and [logistic regression](/blog/basics/logistic-regression/) on the same features.

Inspect per-class errors, document length effects, unseen tokens and shifted topics. Naive Bayes is attractive when data or compute is limited and the feature likelihood is reasonably meaningful. Its transparency is useful precisely because the assumptions and individual score contributions can be examined directly.

<div class="insight-box">
  <strong>Key Insight:</strong> The factorisation reduces a difficult joint-density problem to many small estimates. Its success at choosing a class does not imply that the product gives calibrated probabilities.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Duplicated or correlated features can count the same evidence repeatedly. Check confidence as well as accuracy, and distinguish token counts from binary presence.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Factorise conditional likelihoods, not unconditional feature distributions.</li>
    <li>Choose Gaussian, multinomial or Bernoulli assumptions deliberately.</li>
    <li>Use smoothing and log-sum-exp to avoid impossible events and underflow.</li>
    <li>Validate class decisions, probability calibration and distribution shift separately.</li>
  </ul>
</div>

## References

1. scikit-learn. [Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html).
2. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
