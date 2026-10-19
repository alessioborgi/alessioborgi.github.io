---
layout: single
title: "Smoothing Language Models: Backoff, Interpolation and Kneser–Ney"
date: 2026-10-19 09:11:00 +0100
categories: [nlp]
book: nlp
subsection: language-models
tags: ["nlp", "smoothing", "kneser-ney", "language-models"]
excerpt: "Derive probability-mass redistribution and explain why a good fallback model counts distinct contexts rather than just frequent words."
author_profile: true
read_time: true
is_overview: false
icon: "💧"
read_mins: 4
permalink: /blog/nlp/smoothing-and-kneser-ney/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Smoothing allocates probability to events missing from the training sample. Discounting frees mass from observed events; interpolation redistributes it through a lower-order model. Kneser–Ney changes that fallback distribution to reflect how broadly a word appears across contexts.
</div>

## Missing observations are not impossible events

A count model trained on a finite corpus assigns zero probability to many reasonable sequences. One zero makes an entire sentence probability zero and its negative log likelihood infinite. Additive smoothing fixes the arithmetic but can allocate too much probability to the enormous set of unobserved events.

The central problem is therefore a budget: how much mass should be removed from observed counts, and where should that mass go? The [n-gram chapter](/blog/nlp/ngram-language-models/) introduces the count model; here we make redistribution explicit.

## Interpolation and backoff

Interpolation combines distributions at several context lengths:

<div class="formula-box">
\[
P(w\mid u,v)=\lambda_3P_3(w\mid u,v)+\lambda_2P_2(w\mid v)+\lambda_1P_1(w),
\]
</div>

with nonnegative weights summing to one. If every component is normalised, their mixture is normalised. Weights may depend on the history and can be selected using held-out data.

Backoff instead uses a higher-order estimate for some events and falls back for others, typically unseen ones. Its scaling factor must preserve the remaining probability budget. Dropping to an unscaled unigram whenever a bigram count is zero generally does not produce a normalised distribution.

## Absolute discounting conserves mass

For a seen history $$h$$ and discount $$0<D<1$$,

<div class="formula-box">
\[
P(w\mid h)=\frac{\max(C(h,w)-D,0)}{C(h)}+\lambda(h)P_{\mathrm{lower}}(w),
\qquad
\lambda(h)=\frac{D\,N_{1+}(h,*)}{C(h)}.
\]
</div>

Here $$C(h)=\sum_wC(h,w)$$ and $$N_{1+}(h,*)$$ is the number of distinct continuations with positive counts. Each observed type loses $$D$$ count units. The total removed mass is exactly $$\lambda(h)$$, which the lower-order distribution receives.

Suppose a history has counts three for `works` and one for `fails`. With $$D=0.5$$ and total four, the direct contributions are 0.625 and 0.125. Their sum is 0.75, leaving 0.25 for the fallback. If the fallback gives probabilities 0.2, 0.3 and 0.5 to `works`, `fails` and `charges`, the final distribution is 0.675, 0.200 and 0.125. It sums to one, and interpolation also adds fallback mass to seen events.

## Why unigram frequency can be a poor fallback

Imagine a corpus containing `San Francisco` 100 times and the word `repairs` once after each of ten different preceding words. Raw unigram frequency favours `Francisco`. But after a completely unfamiliar history, the broader contextual distribution of `repairs` may make it the better fallback candidate.

In bigram Kneser–Ney, the continuation probability is

<div class="formula-box">
\[
P_{\mathrm{cont}}(w)=\frac{N_{1+}(*,w)}{N_{1+}(*,*)},
\]
</div>

where the numerator counts distinct predecessor types and the denominator counts all distinct bigram types. In the simplified corpus just described, `Francisco` has one predecessor and `repairs` ten. Their continuation probabilities are $$1/11$$ and $$10/11$$ if these are the only bigram types.

This is not a claim that `Francisco` is rare. It is a distinction between appearing many times and appearing in many different contexts. Higher-order Kneser–Ney extends this reasoning with continuation counts at lower orders. Modified variants use count-dependent discounts rather than one fixed $$D$$.

## Boundary and vocabulary conventions still matter

An unseen history has $$C(h)=0$$, so use the lower-order model directly instead of dividing by zero. Unknown words and sentence-boundary markers need a fixed policy. Otherwise a mathematically correct smoother can still evaluate incompatible vocabularies.

Tune discount choices on validation data and inspect normalisation numerically on tiny examples. Compare held-out log loss under identical tokenisation. A reduction in zero counts is necessary, but the actual objective is better probability allocation over all held-out events.

<div class="insight-box">
  <strong>Key Insight:</strong> Kneser–Ney asks a different fallback question: how many distinct contexts license this word? Repeated occurrence inside one fixed phrase is weaker evidence of broad continuation behaviour.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Discounting without redistributing exactly the removed mass breaks normalisation. Verify that each conditional distribution sums to one, including histories absent from training.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Smoothing is a probability-budget problem.</li>
    <li>Interpolation mixes normalised distributions; backoff needs explicit scaling.</li>
    <li>Absolute discounting frees mass in proportion to the number of observed continuation types.</li>
    <li>Kneser–Ney lower orders use continuation evidence rather than raw frequency alone.</li>
  </ul>
</div>

## References

1. Kneser and Ney. *Improved Backing-Off for M-Gram Language Modeling*. ICASSP, 1995.
2. Chen and Goodman. [An Empirical Study of Smoothing Techniques for Language Modeling](https://aclanthology.org/P96-1041/). ACL, 1996.
3. Jurafsky and Martin. [N-gram Language Models](https://web.stanford.edu/~jurafsky/slp3/3.pdf).
