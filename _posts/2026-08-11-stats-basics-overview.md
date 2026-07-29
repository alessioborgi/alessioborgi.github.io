---
layout: single
title: "Statistics Basics: Reasoning Backwards From Data to Model"
date: 2026-08-11
categories: [stats-basics]
book: stats-basics
subsection: foundations
tags: [statistics, estimation, inference, overview]
excerpt: "Probability runs forwards: pick a model, predict the data. Statistics runs backwards, and backwards is harder — many models could have produced what you saw. Everything else in this book is machinery for handling that ambiguity honestly."
author_profile: true
read_time: true
is_overview: true
icon: "📊"
read_mins: 6
permalink: /blog/stats-basics/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Probability is the forward map — given a model, what data should we expect? Statistics is the inverse map — given data, which model? The inverse is ill-posed: infinitely many parameter values are compatible with any finite sample, so the answer is never a single number but a number plus a statement about how wrong it could be. That second part is the whole subject, and it is the part machine learning practitioners most often skip.
</div>

## The direction of the arrow

Almost every confusion in introductory statistics dissolves once you notice which way the arrow points.

In probability you are handed a model — a coin with bias \\(\theta = 0.6\\), a Gaussian with mean \\(\mu\\) and variance \\(\sigma^2\\) — and asked what data it produces. The reasoning is deductive, and given enough calculus you can write the answer down.

In statistics you are handed the data and asked about the model. That reasoning is inductive in a specific, painful way: the map from parameters to data destroys information. Seven heads in ten tosses is perfectly consistent with \\(\theta = 0.7\\), quite consistent with \\(\theta = 0.5\\), and not impossible under \\(\theta = 0.9\\). No amount of cleverness recovers a unique answer, because there is no unique answer to recover.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="sbo-title sbo-desc" viewBox="0 0 640 200" style="max-width:640px;width:100%;height:auto">
  <title id="sbo-title">Probability as the forward map and statistics as the inverse map</title>
  <desc id="sbo-desc">Two boxes side by side. The left box is labelled "Model p(x given theta)" and the right box "Data x1 to xn". An arrow along the top runs left to right, labelled "probability: theta produces data, deductive, one answer". A second arrow along the bottom runs right to left, labelled "statistics: data constrains theta, inductive, many answers". A caption beneath notes that because many parameter values fit the same sample, the output of the inverse map is an estimate plus an uncertainty.</desc>
  <rect x="1" y="1" width="638" height="198" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="52" y="66" width="180" height="62" rx="6" fill="#ffffff" stroke="#0e7490" stroke-width="1.8"/>
  <rect x="408" y="66" width="180" height="62" rx="6" fill="#ffffff" stroke="#c2410c" stroke-width="1.8"/>
  <text x="142" y="92" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0c4a6e">Model</text>
  <text x="142" y="112" text-anchor="middle" font-size="11.5" fill="#334155">p(x | θ)</text>
  <text x="498" y="92" text-anchor="middle" font-size="12.5" font-weight="700" fill="#c2410c">Data</text>
  <text x="498" y="112" text-anchor="middle" font-size="11.5" fill="#334155">x₁, x₂, …, xₙ</text>
  <line x1="236" y1="80" x2="402" y2="80" stroke="#0e7490" stroke-width="1.8" marker-end="url(#sboA)"/>
  <line x1="402" y1="116" x2="236" y2="116" stroke="#c2410c" stroke-width="1.8" marker-end="url(#sboB)"/>
  <defs>
    <marker id="sboA" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#0e7490"/></marker>
    <marker id="sboB" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#c2410c"/></marker>
  </defs>
  <text x="319" y="44" text-anchor="middle" font-size="12" font-weight="700" fill="#0e7490">PROBABILITY — forward, deductive</text>
  <text x="319" y="62" text-anchor="middle" font-size="10" fill="#475569">one model ⟶ one distribution over datasets</text>
  <text x="319" y="146" text-anchor="middle" font-size="12" font-weight="700" fill="#c2410c">STATISTICS — inverse, inductive</text>
  <text x="319" y="164" text-anchor="middle" font-size="10" fill="#475569">one dataset ⟵ many compatible models</text>
  <text x="319" y="186" text-anchor="middle" font-size="10.5" font-weight="700" fill="#334155">so the output is an estimate <tspan font-style="italic">and</tspan> a measure of how wrong it might be</text>
</svg>
<figcaption>Notice the asymmetry in the two labels. The forward map is a function; the inverse is a one-to-many relation. Every technique in this book — estimators, likelihood, intervals, tests, resampling — exists to say something useful despite that.</figcaption>
</figure>
</div>

## What the other seven posts do

The book splits into three groups, matching the three things you actually have to do with a sample.

**Describe it.** [Descriptive statistics](/blog/stats-basics/descriptive-statistics/) covers means against medians, variance, the reason sample variance divides by \\(n-1\\), skewness and kurtosis, quantiles — and Anscombe's quartet, the standing reminder that four wildly different datasets can share every summary you compute.

**Estimate from it.** [Estimators, bias and variance](/blog/stats-basics/estimators-bias-variance/) defines what makes an estimator good, derives the bias–variance decomposition of mean squared error, and shows why a deliberately biased estimator can beat an unbiased one. [Maximum likelihood](/blog/stats-basics/maximum-likelihood/) then gives the default recipe for constructing estimators, works it through for a Gaussian, and connects it to KL divergence, to MAP estimation, and to L2 regularisation.

**Quantify how sure you are.** [Confidence intervals](/blog/stats-basics/confidence-intervals/) builds the interval and, more importantly, states precisely what it claims. [Hypothesis testing](/blog/stats-basics/hypothesis-testing/) covers p-values, error types, power, and multiple comparisons. [The bootstrap](/blog/stats-basics/bootstrap-and-resampling/) gets uncertainty when the algebra runs out, and explains cross-validation as the same idea. [Bayesian versus frequentist](/blog/stats-basics/bayesian-vs-frequentist/) closes by showing what the two schools each actually claim, and when the numbers agree anyway.

Probability itself — random variables, expectation, the distributions, the limit theorems — is assumed. If any of that is rusty, start from the [probability basics overview](/blog/prob-basics/overview/) and come back.

<div class="insight-box">
  <strong>Key Insight — statistics is applied probability run in reverse:</strong> every method here works by imagining the forward process. To build a confidence interval you ask "if \(\theta\) really were this value, how would my estimator scatter across repeated samples?" To compute a p-value you ask "if nothing were going on, how often would I see a gap this large?" You never escape the forward map. You just condition on data and reason about what the forward map would have done.
</div>

## Why estimation and uncertainty matter most in ML

Machine learning is estimation. A trained network is a point estimate of a parameter vector chosen to fit a sample, and every pathology of estimation appears in it. Overfitting is estimator variance. Regularisation is deliberate bias traded for a variance reduction. A validation score is a statistic with its own sampling distribution, which is why a 0.3-point gap on a 2,000-example test set means almost nothing.

Uncertainty is the part that gets dropped, and dropping it is expensive: leaderboards that do not replicate, A/B tests that ship noise, and reported metrics whose third digit is not even stable.

<div class="warning-box">
  <strong>Interview trap:</strong> the two most-missed questions in this whole area are both about interpretation, not computation. A 95% confidence interval does <em>not</em> mean there is a 95% probability that the parameter lies inside it, and a p-value of 0.03 does <em>not</em> mean there is a 3% probability that the null hypothesis is true. Both errors come from the same slip — treating a fixed unknown parameter as if it were random. Frequentist probability lives in the sampling procedure, never in the parameter.
</div>

## How to use this book

Read it in order; each post assumes the previous ones. If you are revising against the clock, the load-bearing derivations are Bessel's correction, the bias–variance decomposition, and the Gaussian MLE — those three are asked about far more than anything else, and all three are short enough to reproduce on a whiteboard.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Probability maps model to data and is deductive; statistics maps data to model and is inductive and one-to-many.</li>
    <li>Because the inverse is ambiguous, every honest answer has two parts: an estimate and a quantified uncertainty.</li>
    <li>Every frequentist method reasons about the sampling distribution — what the estimator would do across repeated samples from a hypothesised model.</li>
    <li>ML <em>is</em> estimation: overfitting is variance, regularisation is bias bought on purpose, and validation scores are noisy statistics.</li>
    <li>The classic interview failures are interpretive: confidence intervals and p-values both make statements about the procedure, not about the parameter.</li>
  </ul>
</div>

## References

1. Wasserman, L. [*All of Statistics: A Concise Course in Statistical Inference*](https://doi.org/10.1007/978-0-387-21736-9). *Springer*, 2004.
2. Efron, B., & Hastie, T. [*Computer Age Statistical Inference*](https://hastie.su.domains/CASI/). *Cambridge University Press*, 2016.
3. Hastie, T., Tibshirani, R., & Friedman, J. [*The Elements of Statistical Learning*](https://hastie.su.domains/ElemStatLearn/), 2nd ed. *Springer*, 2009.
4. Greenland, S., Senn, S. J., Rothman, K. J., Carlin, J. B., Poole, C., Goodman, S. N., & Altman, D. G. [Statistical tests, P values, confidence intervals, and power: a guide to misinterpretations](https://doi.org/10.1007/s10654-016-0149-3). *European Journal of Epidemiology*, 31, 337–350, 2016.
