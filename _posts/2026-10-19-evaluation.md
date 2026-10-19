---
layout: single
title: "Evaluating NLP: Metrics, Leakage and Language Errors"
date: 2026-10-19 09:34:00 +0100
categories: [nlp]
book: nlp
subsection: evaluation
tags: ["nlp", "evaluation", "error-analysis"]
excerpt: "Choose metrics that match the task, protect the test split, and turn aggregate scores into an explanation of linguistic failures."
author_profile: true
read_time: true
is_overview: false
icon: "🔍"
read_mins: 6
permalink: /blog/nlp/evaluation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> An NLP score is meaningful only with a defined unit, split and matching rule. Evaluate the output your application uses, inspect errors by linguistic category, and keep model selection separate from the final test.
</div>

## Define what counts as correct

A ticket classifier predicts a document label. An entity recogniser predicts spans and types. A parser predicts structure. These outputs need different matching rules. For an entity, decide whether correctness requires the exact span and type or allows partial overlap; the resulting scores answer different questions.

For extracted items,

<div class="formula-box">
\[
P=\frac{TP}{TP+FP},\qquad R=\frac{TP}{TP+FN},\qquad F_1=\frac{2PR}{P+R}.
\]
</div>

Suppose there are ten gold organisation mentions. A system proposes eight, six of which match exactly. Then $$TP=6$$, $$FP=2$$ and $$FN=4$$. Precision is $$0.75$$, recall is $$0.60$$ and F1 is approximately $$0.667$$. State how undefined cases, such as no predictions, are handled.

## Averaging changes the question

**Micro** averaging pools counts before computing a metric. **Macro** averaging computes the metric for each class and averages those values. Macro F1 is the average of class F1 scores, which generally differs from the harmonic mean of macro precision and macro recall.

Imagine 95 routine tickets and five urgent ones. Predicting “routine” every time yields 95% accuracy and zero urgent recall. That could be a poor system for prioritising urgent work despite its high headline score. Report class-level results when the cost of errors differs by label.

## Protect the evaluation boundary

Decide what should generalise: new messages, new conversations, new authors, a new domain or a future time period. Choose splits that reflect that target. Keep duplicates and related records together where they would otherwise leak information.

Fit learned preprocessing on training data, including vocabulary selection and IDF. Use validation data for feature choices, thresholds and hyperparameters. Once the test results influence those choices, the test set is serving as validation and no longer provides the same independent estimate.

## Turn errors into an experiment

Sample mistakes and label their causes: token boundary, spelling, negation, entity boundary, ambiguous reference, domain shift or inconsistent annotation. Record counts and examples rather than just impressions.

Suppose adding bigrams improves negation cases but harms rare product names. Compare those slices directly and inspect their size. A change supported by two examples is less convincing than one repeated across many independent documents. Resampling uncertainty estimates should use the independent unit, such as the conversation, when messages within it are correlated.

For generated text, inspect whether the output preserves facts, participants and negation. Lexical overlap alone cannot distinguish a faithful paraphrase from a nearly identical sentence with the opposite claim.

## Work through macro and micro F1

Consider two labels. For A, let TP=80, FP=10 and FN=10. Its F1 is $$160/(160+10+10)\approx0.889$$. For B, let TP=2, FP=8 and FN=8, giving F1 $$4/(4+8+8)=0.2$$. Macro F1 is approximately 0.544, while pooled micro F1 is $$164/(164+18+18)=0.82$$.

The two scores are both correct. Micro weights the many A decisions heavily; macro gives the weak B label an equal vote. This example could represent multilabel decisions or item extraction counts; do not assume these particular counts describe a single-label two-class confusion matrix.

For single-label multiclass classification with all classes included, micro precision, recall and F1 equal accuracy. That identity does not hold for every multilabel or subset-of-classes evaluation.

## Calibration is separate from classification

A classifier can rank examples well while assigning unreliable probabilities. Among predictions near 0.8, roughly 80% should be correct for the corresponding event if those probabilities are calibrated in the evaluated population.

A binary Brier score is the mean squared probability error:

<div class="formula-box">
\[
\operatorname{Brier}=\frac{1}{N}\sum_i(p_i-y_i)^2.
\]
</div>

For predictions 0.9 and 0.6 with labels one and zero, the score is $$(0.01+0.36)/2=0.185$$. Accuracy at threshold 0.5 is one-half. Changing the second probability from 0.6 to 0.99 leaves accuracy unchanged but worsens the Brier score because the wrong prediction becomes more confident.

Calibration can change under domain or prevalence shift. A validation set that matches yesterday's traffic may not justify probabilities for a new language or product category. Inspect reliability by relevant slices, and avoid reading a softmax maximum as verified confidence merely because it lies between zero and one.

## Selective prediction has a coverage tradeoff

A system can abstain when confidence is low. Report both accuracy or risk on answered cases and the fraction of cases answered. A model that answers only one easy example can achieve perfect answered-case accuracy while being useless for most inputs.

Compare systems at matched coverage or through a risk–coverage curve. Tune abstention rules on validation data and test them on the difficult examples the system is expected to encounter, including unanswerable questions and out-of-domain text.

## Error costs belong to the task

Missing an urgent support request may cost more than flagging a routine request for review. Exact-span entity errors may have different effects depending on whether the output is used for search or automated record linkage. Define costs and review procedures before selecting an operating point.

A benchmark metric is a summary of a measurement protocol, not a complete statement of product value. Keep the raw predictions and source examples so changes in metrics can be audited.

## Quantify uncertainty on shared examples

When comparing systems on the same data, preserve the pairing. Bootstrap the independent units and recompute the full metric for each sample rather than pretending every token is independent. Training randomness requires a separate analysis across runs. The [experimental-design chapter](/blog/nlp/experimental-design/) derives these comparisons and explains ablations and behavioural checks.

For multilingual systems, inspect [per-language evaluation](/blog/nlp/multilingual-nlp/) alongside aggregate scores. A weighted average can hide a regression in the language with the fewest examples.

<div class="insight-box">
  <strong>Key Insight:</strong> Metric choice defines which errors receive weight. Calibration, coverage, cost and linguistic behaviour add information that a single accuracy or F1 number cannot contain.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A confidence threshold can improve answered-case accuracy simply by rejecting more cases. Always report coverage and evaluate the resulting tradeoff at a comparable operating point.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Specify the scoring unit and matching rule before comparing systems.</li>
    <li>Class imbalance can hide important failures behind accuracy.</li>
    <li>A good error analysis leads to a specific, testable next change.</li>
  </ul>
</div>

## References

1. Bird, Klein and Loper, [Learning to Classify Text](https://www.nltk.org/book/ch06.html), discusses held-out evaluation, precision, recall and confusion matrices.
2. Dror et al. [The Hitchhiker’s Guide to Testing Statistical Significance in Natural Language Processing](https://aclanthology.org/P18-1128/). ACL, 2018.
3. Ribeiro et al. [Beyond Accuracy: Behavioral Testing of NLP Models with CheckList](https://aclanthology.org/2020.acl-main.442/). ACL, 2020.
