---
layout: single
title: "Text Classification: A Baseline You Can Explain"
date: 2026-10-19 09:14:00 +0100
categories: [nlp]
book: nlp
subsection: classification
tags: ["nlp", "classification", "naive-bayes"]
excerpt: "Turn documents into labels with a transparent baseline, then diagnose negation, class imbalance and information leakage."
author_profile: true
read_time: true
is_overview: false
icon: "🏷️"
read_mins: 5
permalink: /blog/nlp/text-classification/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Define labels, split documents, fit features on training data, and establish a simple classifier. Inspect its errors to learn whether the next improvement belongs in annotation, representation or modelling.
</div>

## Define the prediction

For support tickets, “battery issue” and “delivery issue” might be exclusive labels, or a ticket may receive both. Decide this first. Multiclass classification chooses one class; multilabel classification allows several. A ticket saying “the replacement arrived late and will not charge” exposes the difference immediately.

Write annotation rules for ambiguous cases and keep examples of disagreements. A model cannot consistently reproduce a distinction that annotators interpret differently.

## Multinomial naive Bayes

For a document with counts $$x_w$$ and class $$c$$, the multinomial naive Bayes decision rule is

<div class="formula-box">
\[
\hat c=\arg\max_c\left[\log P(c)+\sum_w x_w\log P(w\mid c)\right].
\]
</div>

The class prior captures label frequency. The token distributions capture how each class uses words. Smoothing keeps unseen class–word pairs from forcing a zero likelihood. The model treats token draws as conditionally independent given the class, a strong simplification of actual language.

Consider two equally likely classes. Suppose a toy vocabulary has only `battery` and `parcel`, with

| Class | P(battery given class) | P(parcel given class) |
|---|---|---|
| Hardware | 0.8 | 0.2 |
| Shipping | 0.2 | 0.8 |

For “battery battery parcel”, the likelihoods are $$0.8^2\times0.2=0.128$$ and $$0.2^2\times0.8=0.032$$. With equal priors, the posterior probability of Hardware is $$0.8$$ in this toy model. Reordering the three tokens changes nothing.

## Follow the mistakes

A unigram classifier may struggle with “no battery problem”, because the problem words remain present. Bigrams can expose the phrase “no battery”; character features can share evidence between spelling variants. Neither automatically resolves sarcasm or a complaint quoted and then denied.

Compare errors by category: negation, multiple issues, rare labels, long tickets and unfamiliar vocabulary. Use the same held-out examples for comparisons, and tune choices on a validation set rather than repeatedly selecting against the test set.

## Split at the right level

If a conversation contains six related messages, randomly assigning messages to train and test can put nearly identical language on both sides. Group by conversation when the intended deployment involves new conversations. If deployment predicts future tickets, also consider whether a time-based split better represents the task.

## A discriminative alternative: logistic regression

For binary labels and feature vector $$x$$, logistic regression models

<div class="formula-box">
\[
P(y=1\mid x)=\sigma(w^\top x+b),\qquad
\mathcal L=-y\log p-(1-y)\log(1-p).
\]
</div>

Unlike naive Bayes, this directly estimates the conditional label probability rather than modelling class-specific word generation. The gradient with respect to $$w$$ for one example is $$(p-y)x$$. If the model predicts 0.8 for a negative example, it receives a gradient proportional to $$0.8x$$, pushing the active positive evidence downward under gradient descent.

For a three-feature vector `[battery, late, not]`, let $$x=(1,0,1)$$ and $$w=(1.2,-0.7,-0.9)$$ with zero bias. The logit is 0.3 and the predicted probability about 0.574. This shows how word-level contributions can be inspected, but it also exposes an additive model's limitation: a single weight for `not` cannot express every scope-dependent interaction. Bigrams or other interaction features change the function class.

Regularisation penalises large weights and can stabilise estimates on rare features. Select its strength on validation data; a coefficient is not a causal effect of the corresponding word, especially when correlated features share predictive evidence.

## The decision threshold is a policy

A calibrated probability of 0.4 does not itself prescribe a label. If a false positive costs $$C_{FP}$$ and a false negative costs $$C_{FN}$$, and correct decisions have zero cost, predicting positive minimises expected cost when

<div class="formula-box">
\[
p\gt \frac{C_{FP}}{C_{FP}+C_{FN}}.
\]
</div>

With costs one and four, the threshold is 0.2. This derivation depends on the probabilities being meaningful for the deployment population and the costs being appropriate. Class weighting during training, threshold selection and probability calibration are different interventions.

For multilabel tasks, each label can have a different threshold. Independent decisions may still violate relationships among labels, so decide whether the taxonomy requires constraints such as a child label implying its parent.

## Build a confusion-driven improvement

Suppose most errors confuse delivery damage with hardware faults. Inspect examples where the same word appears under both labels: “battery arrived damaged” may describe transport damage, while “battery failed after six months” points elsewhere. Adding more occurrences of `battery` alone will not establish that distinction.

An ablation can compare unigram features against unigrams plus time and delivery phrases under the same split and classifier. If the gain occurs on the intended error slice, the result supports the proposed mechanism. If it occurs only on duplicates or author-specific wording, revisit the split.

For mixed opinions and target-specific labels, continue with [sentiment and aspect analysis](/blog/nlp/sentiment-and-aspect-analysis/). For unlabelled document structure, [topic models](/blog/nlp/topic-models/) solve a different problem and should not be interpreted as a classifier with hidden gold labels.

<div class="insight-box">
  <strong>Key Insight:</strong> Training estimates a score or probability; a decision rule turns it into an action. Keeping those stages explicit makes class costs, calibration and threshold changes understandable.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A large positive feature weight is conditional on the other features and training distribution. It is not proof that the word causes the label or will remain predictive after domain shift.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Label definitions are part of the model specification.</li>
    <li>A simple probabilistic baseline makes lexical evidence inspectable.</li>
    <li>Use error categories to choose the next change.</li>
  </ul>
</div>

## References

1. Bird, Klein and Loper, [Learning to Classify Text](https://www.nltk.org/book/ch06.html), introduces classification, naive Bayes and evaluation.
2. Manning, Raghavan and Schütze. *Introduction to Information Retrieval*, chapters on text classification. Cambridge University Press, 2008.
