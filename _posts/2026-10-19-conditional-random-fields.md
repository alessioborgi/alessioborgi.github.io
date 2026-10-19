---
layout: single
title: "Conditional Random Fields: Global Normalisation for Sequence Labels"
date: 2026-10-19 09:19:00 +0100
categories: [nlp]
book: nlp
subsection: sequence-models
tags: ["nlp", "crf", "structured-prediction", "sequence-labelling"]
excerpt: "Derive a linear-chain CRF, its partition function and training gradient, then connect constrained decoding to entity boundaries."
author_profile: true
read_time: true
is_overview: false
icon: "🔗"
read_mins: 4
permalink: /blog/nlp/conditional-random-fields/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A linear-chain CRF scores an entire label sequence given the input and normalises over legal sequences. Dynamic programming computes the partition function and best path. Input features can use broad context while label interactions remain local enough for exact inference.
</div>

## Score the whole output

Let $$e_t(j,x)$$ score label $$j$$ at position $$t$$ and $$A_{ij}$$ score a transition from label $$i$$ to label $$j$$. Include start and end scores explicitly in an implementation. Ignoring those boundary terms in the notation,

<div class="formula-box">
\[
s(x,y)=\sum_t e_t(y_t,x)+\sum_{t=2}^{T}A_{y_{t-1},y_t},\qquad
P(y\mid x)=\frac{e^{s(x,y)}}{Z(x)},
\]
</div>

where $$Z(x)=\sum_{y'\in\mathcal Y(x)}e^{s(x,y')}$$ sums over the allowed sequences. Unlike an [HMM](/blog/nlp/hidden-markov-models/), the CRF does not need a generative probability distribution for the input words. The emission scores may come from hand-built features or a neural encoder.

Local interactions among labels do not require local input features. An encoder can inspect the full sentence before emitting each position's scores. Keep those two kinds of dependency separate.

## A partition function is a weighted path sum

In log space, define the forward value

<div class="formula-box">
\[
\alpha_t(j)=e_t(j,x)+\operatorname{LSE}_i\left(\alpha_{t-1}(i)+A_{ij}\right),
\]
</div>

where $$\operatorname{LSE}(z)=\log\sum_i e^{z_i}$$. After adding any end scores, a final log-sum-exp gives $$\log Z(x)$$. The same chain with maximum in place of log-sum-exp gives Viterbi decoding and needs backpointers to reconstruct labels.

Log-sum-exp can be evaluated as $$m+\log\sum_i e^{z_i-m}$$ with $$m=\max_i z_i$$. This retains the exact sum algebra while avoiding unnecessarily large exponentials.

## A tiny globally normalised example

For two positions and labels A/B, suppose the complete path scores are AA=2, AB=1, BA=0 and BB=1. Then

<div class="formula-box">
\[
Z=e^2+2e^1+e^0\approx13.826,
\qquad P(AA\mid x)\approx0.534.
\]
</div>

AA wins, but it does not have probability one. If AB is the gold path, its negative log likelihood is $$\log Z-1\approx1.627$$. Training must raise AB relative to all competing paths, not merely increase an isolated token's score.

## The gradient compares observed and expected features

For a feature-linear score $$s_\theta(x,y)=\theta^\top f(x,y)$$, the negative log-likelihood gradient is

<div class="formula-box">
\[
\nabla_\theta\mathcal L
=\mathbb E_{P_\theta(y\mid x)}[f(x,y)]-f(x,y_{\mathrm{gold}}).
\]
</div>

The partition function supplies the model expectation. Forward–backward computes the necessary position and transition marginals efficiently. A feature appearing in the gold sequence more often than the model expects receives pressure to increase its weight.

This formula also explains why dropping the partition term is not a harmless shortcut: it removes the competition against alternative outputs and changes the learning problem.

## Encode legal entity transitions

In a specified BIO convention, an `I-ORG` label cannot freely start a sequence or follow an incompatible entity type. Set illegal transition scores to negative infinity or otherwise exclude those paths consistently. The same allowed set should define both training normalisation and decoding if the intended model is a constrained CRF.

Padding introduces a second boundary problem. A masked position should not contribute emissions, transitions or the wrong final-state score. Test sequences of length one, empty masked tails and different batch lengths on a tiny enumerated example before trusting a vectorised implementation.

## When structured decoding helps

A CRF can fix locally inconsistent label combinations, but it cannot recover a missing entity boundary from arbitrary features by guarantee. Compare a token classifier and a structured head using the same encoder and span-level evaluation. This isolates the contribution of sequence structure from the representation underneath it.

Global normalisation also avoids the particular local-normalisation behaviour associated with label bias in locally normalised sequence models. It does not mean that every CRF is automatically calibrated or robust outside its training domain.

<div class="insight-box">
  <strong>Key Insight:</strong> The partition function is the mechanism that makes all complete outputs compete. Efficient inference comes from the structure of the score, not from ignoring that competition.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Viterbi scores are not log probabilities until the log partition function is subtracted. Use normalised sequence or marginal probabilities when the downstream decision requires probabilistic interpretation.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>A CRF models labels conditional on the input.</li>
    <li>Log-sum-exp computes the partition function; max computes the best path.</li>
    <li>Training balances gold features against model-expected features.</li>
    <li>Constraints, padding and boundary scores must agree across training and decoding.</li>
  </ul>
</div>

## References

1. Lafferty, McCallum and Pereira. [Conditional Random Fields: Probabilistic Models for Segmenting and Labeling Sequence Data](https://home.cs.colorado.edu/~mozer/Teaching/syllabi/6622/papers/LaffertyMcCallumPereira2001.pdf). ICML, 2001.
2. Sutton and McCallum. [An Introduction to Conditional Random Fields](https://arxiv.org/abs/1011.4088). 2012.
