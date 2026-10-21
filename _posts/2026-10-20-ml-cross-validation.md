---
layout: "single"
title: "Cross-Validation: Splits, Nested Selection and Honest Generalisation Estimates"
date: "2026-10-20 10:01:00 +0100"
categories: ["basics"]
book: "basics"
subsection: foundations
tags: ["machine-learning", "evaluation", "cross-validation", "generalisation"]
excerpt: "Design random, grouped and temporal splits, compute an out-of-fold error correctly, and separate model selection from evaluation of the selection procedure."
author_profile: true
read_time: true
is_overview: false
icon: "📏"
read_mins: 6
permalink: "/blog/basics/ml-cross-validation/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A validation split should mimic the independence and timing of deployment. Cross-validation estimates performance by repeatedly fitting on one subset and evaluating on another. Hyperparameter search, preprocessing and threshold selection belong inside that fitting procedure; a final untouched test set or outer loop evaluates the selected procedure.
</div>

## Ask what will be new at deployment

Predicting a new record from an existing customer differs from predicting a new customer. Forecasting next month differs from interpolating among shuffled historical rows. A random split can be appropriate for independent identically distributed observations and misleading when records share entities or time-dependent information.

Define the unit of independence and the information cutoff first. Patients, devices, households, documents and conversations can each produce many correlated rows. Keeping related rows together is often more important than selecting an elaborate score.

## Training, validation and test have different jobs

Training data fits model parameters. Validation data guides hyperparameters, features, thresholds and model families. Test data estimates performance after those decisions are fixed. Repeatedly examining a test score and adjusting the model turns that test set into another validation set.

A small dataset can use cross-validation for selection while retaining a final test set, or nested cross-validation to estimate a selection procedure. Neither manufactures independence where the underlying observations lack it. The split must still reflect the intended deployment population.

## Compute out-of-fold loss consistently

For K folds, each observation receives a prediction from a model that did not train on its fold. A sample-weighted loss is

<div class="formula-box">
\[
\widehat R_{\mathrm{OOF}}=\frac{1}{n}\sum_{i=1}^n L(y_i,\hat f_{-\mathrm{fold}(i)}(x_i)).
\]
</div>

If one validation fold contains two observations with mean loss 1 and another contains eight with mean loss 3, pooled loss is $$(2\cdot1+8\cdot3)/10=2.6$$. The unweighted mean of fold means is 2, which answers a different question. With equal fold sizes these coincide.

For nonlinear metrics such as AUC or F1, averaging fold metrics and computing one metric from pooled predictions can also differ. Scores from separately fitted models may have different scales. State the aggregation and interpret it in relation to deployment.

## Choose a splitter deliberately

| Split design | Intended separation | Typical risk if ignored |
|---|---|---|
| Random or stratified | Independent observations | Class imbalance or accidental dependence |
| Grouped | Entire entities held out | Memorising patient, user or device identity |
| Temporal | Earlier information predicts later outcomes | Training with future information |
| Spatial or blocked | Regions or correlated blocks held out | Near-duplicate local conditions crossing the split |

Stratification preserves class proportions approximately; it does not make correlated observations independent. A temporal split may need a gap if features or labels use overlapping windows. Group and time constraints can coexist and may require a custom design.

## Put the entire pipeline inside the fold

Fit imputation, scaling, vocabulary, PCA and feature selection using only the training fold. Oversampling and synthetic examples must also be generated within that training portion. Otherwise held-out information can influence the fitted representation or even create close relatives of validation observations.

Use the [preprocessing chapter](/blog/basics/ml-preprocessing/) to trace the boundary. A convenient pipeline abstraction helps enforce it, but code structure is not proof: any transformation performed before entering the pipeline must be audited separately.

Early stopping uses validation feedback to choose training duration. Its stopping data is therefore part of selection, not an untouched estimate of final generalisation. The same applies to choosing a classification threshold or probability calibrator.

## Nested selection evaluates a procedure

In nested cross-validation, an inner loop selects hyperparameters within each outer training subset. The outer held-out fold evaluates the resulting selected model. Repeating this estimates the performance of the selection procedure, including its opportunity to overfit inner validation noise.

After evaluation, a final deployment model can be selected and fitted using the available development data under the chosen protocol. Outer scores do not correspond to one identical fitted model; they correspond to several instances of the procedure.

Nested evaluation is costly. Use it when model selection is substantial relative to the dataset and the estimate matters. A carefully protected test set can also provide an honest final assessment. Reusing one validation set for hundreds of decisions without accounting for selection is the problem to avoid.

## Uncertainty and comparisons

Fold scores are dependent because their training sets overlap. Their standard deviation describes variation across those particular folds; dividing it by the square root of K does not automatically give a valid independent-sample standard error.

Compare models on the same held-out observations or splits. For a fixed test set, paired resampling at the independent unit can estimate variation in a score difference under suitable assumptions. Repeated training seeds capture another source of variation and should not be confused with resampling the population.

Report the score distribution, sample count, split rule, search space and selection budget. Small differences should be interpreted relative to variability and practical effect, not only the ordering of mean scores.

## Keep a reproducible experimental record

Store fold assignments or the exact splitter and seed, feature definitions, model settings, fitted preprocessing and prediction outputs. Include a simple baseline and relevant failure slices. This allows a later reviewer to distinguish a model improvement from a changed dataset or evaluation rule.

The goal is a believable estimate for a specified deployment situation. More folds, more decimals and a more complex model cannot compensate for a split that answers the wrong question.

<div class="insight-box">
  <strong>Key Insight:</strong> Validation evaluates an entire learning procedure under a specified notion of new data. The split and selection boundaries are part of that procedure, not administrative details.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Cross-validation fold scores are not independent replicates. Report their variation honestly and avoid treating a naive standard error as a universal confidence interval.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Match independence, grouping and time to deployment.</li>
    <li>Fit every learned preprocessing step inside the fold.</li>
    <li>Separate hyperparameter selection from final assessment.</li>
    <li>Use paired comparisons and record split assignments and search budgets.</li>
  </ul>
</div>

## References

1. scikit-learn. [Cross-validation: evaluating estimator performance](https://scikit-learn.org/stable/modules/cross_validation.html).
2. scikit-learn. [Nested versus non-nested cross-validation](https://scikit-learn.org/stable/auto_examples/model_selection/plot_nested_cross_validation_iris.html).
3. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
