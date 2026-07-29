---
layout: single
title: "The Bootstrap: Uncertainty When the Algebra Runs Out"
date: 2026-08-17
categories: [stats-basics]
book: stats-basics
subsection: inference
tags: [bootstrap, permutation-test, cross-validation, resampling]
excerpt: "If you cannot resample from the population, resample from your sample instead. That one substitution gives standard errors and intervals for statistics whose sampling distributions nobody can write down — and it fails in ways worth memorising."
author_profile: true
read_time: true
is_overview: false
icon: "🔁"
read_mins: 7
permalink: /blog/stats-basics/bootstrap-and-resampling/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The bootstrap treats the empirical distribution as a stand-in for the population: draw \(n\) points with replacement from your \(n\) observations, recompute the statistic, repeat thousands of times, and read the spread of the results as the sampling distribution. It needs no formula for the statistic, which is its whole appeal. It breaks for extremes, for infinite-variance tails, and for dependent data. Permutation tests and cross-validation are the same substitution applied to testing and to model assessment.
</div>

## The substitution

The quantity you want is the sampling distribution of \\(\hat\theta\\) under the true \\(F\\) — and you cannot have it, because you have one sample, not many, and you do not know \\(F\\). The bootstrap replaces \\(F\\) with \\(\hat F_n\\), the empirical distribution putting mass \\(1/n\\) on each observed point, and samples from *that*. Sampling from \\(\hat F_n\\) is exactly drawing \\(n\\) points with replacement.

<div class="formula-box">
\[
\hat\theta^{*(b)} = \hat\theta\big(x_1^{*(b)},\dots,x_n^{*(b)}\big),
\qquad b = 1,\dots,B,
\qquad x_i^{*} \sim \hat F_n
\]
</div>

The spread of $$\{\hat\theta^{*(b)}\}$$ estimates the spread of \\(\hat\theta\\). The justification is asymptotic: \\(\hat F_n \to F\\) uniformly by Glivenko–Cantelli, and for smooth enough statistics the bootstrap distribution converges to the true sampling distribution. Note that a bootstrap resample omits any given observation with probability \\((1-1/n)^n \to e^{-1} = 0.368\\), so each resample uses about 63% of the distinct data points — the fact behind out-of-bag error in random forests.

## A worked interval

Twelve request latencies in milliseconds: 12, 13, 14, 15, 15, 16, 18, 19, 22, 27, 41, 88. The mean is 25.0 and \\(s = 21.40\\), so the normal-theory interval is \\(25 \pm 2.201 \times 6.178 = [11.40,\ 38.60]\\), using $$t^\star_{11} = 2.201$$.

The **percentile bootstrap** takes the 2.5th and 97.5th percentiles of the resampled means directly. One run of \\(B = 10{,}000\\) resamples gives \\([16.08,\ 38.25]\\), with a bootstrap standard error of 5.89 against the formula's 6.18.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="bs-title bs-desc" viewBox="0 0 640 190" style="max-width:640px;width:100%;height:auto">
  <title id="bs-title">Bootstrap distribution of the sample mean against the normal-theory interval</title>
  <desc id="bs-desc">A histogram of ten thousand bootstrap resample means for the twelve latency observations. It peaks near 22 and has a long right tail, clearly right-skewed rather than symmetric. The percentile bootstrap interval runs from 16.08 to 38.25 and sits under the mass of the histogram. The normal-theory t interval, drawn beneath it, runs from 11.40 to 38.60 and extends far to the left into a region where the bootstrap distribution has essentially no mass.</desc>
  <rect x="1" y="1" width="638" height="188" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g fill="#bae6fd" stroke="#0e7490" stroke-width="0.5"><rect x="105.0" y="135.7" width="14.3" height="0.3"/><rect x="120.0" y="131.2" width="14.3" height="4.8"/><rect x="135.0" y="115.2" width="14.3" height="20.8"/><rect x="150.0" y="84.7" width="14.3" height="51.3"/><rect x="165.0" y="66.0" width="14.3" height="70.0"/><rect x="180.0" y="63.2" width="14.3" height="72.8"/><rect x="195.0" y="64.2" width="14.3" height="71.8"/><rect x="210.0" y="69.4" width="14.3" height="66.6"/><rect x="225.0" y="61.3" width="14.3" height="74.7"/><rect x="240.0" y="48.7" width="14.3" height="87.3"/><rect x="255.0" y="42.6" width="14.3" height="93.4"/><rect x="270.0" y="32.0" width="14.3" height="104.0"/><rect x="285.0" y="53.3" width="14.3" height="82.7"/><rect x="300.0" y="62.6" width="14.3" height="73.4"/><rect x="315.0" y="78.9" width="14.3" height="57.1"/><rect x="330.0" y="76.4" width="14.3" height="59.6"/><rect x="345.0" y="82.0" width="14.3" height="54.0"/><rect x="360.0" y="80.3" width="14.3" height="55.7"/><rect x="375.0" y="95.0" width="14.3" height="41.0"/><rect x="390.0" y="106.0" width="14.3" height="30.0"/><rect x="405.0" y="109.5" width="14.3" height="26.5"/><rect x="420.0" y="112.5" width="14.3" height="23.5"/><rect x="435.0" y="120.5" width="14.3" height="15.5"/><rect x="450.0" y="120.4" width="14.3" height="15.6"/><rect x="465.0" y="125.1" width="14.3" height="10.9"/><rect x="480.0" y="128.2" width="14.3" height="7.8"/><rect x="495.0" y="129.0" width="14.3" height="7.0"/><rect x="510.0" y="131.5" width="14.3" height="4.5"/><rect x="525.0" y="131.5" width="14.3" height="4.5"/><rect x="540.0" y="131.5" width="14.3" height="4.5"/><rect x="555.0" y="133.9" width="14.3" height="2.1"/><rect x="570.0" y="134.1" width="14.3" height="1.9"/><rect x="585.0" y="135.9" width="14.3" height="0.1"/></g>
  <line x1="60" y1="136" x2="600" y2="136" stroke="#cbd5e1"/>
  <line x1="285" y1="30" x2="285" y2="136" stroke="#334155" stroke-width="1.2" stroke-dasharray="4 3"/>
  <text x="285" y="26" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">x̄ = 25.0</text>
  <line x1="151" y1="150" x2="484" y2="150" stroke="#0e7490" stroke-width="3"/>
  <text x="600" y="153" text-anchor="end" font-size="9.5" font-weight="700" fill="#0e7490">percentile bootstrap [16.08, 38.25]</text>
  <line x1="81" y1="164" x2="489" y2="164" stroke="#c2410c" stroke-width="3"/>
  <text x="600" y="167" text-anchor="end" font-size="9.5" font-weight="700" fill="#c2410c">normal-theory t [11.40, 38.60]</text>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="60" y="147">10</text><text x="135" y="147">15</text><text x="210" y="147">20</text><text x="285" y="147">25</text><text x="360" y="147">30</text><text x="435" y="147">35</text><text x="510" y="147">40</text><text x="585" y="147">45</text>
  </g>
</svg>
<figcaption>Notice that the bootstrap distribution is skewed right, so the interval it produces is not centred on 25.0. The symmetric t interval buys its left-hand coverage in a region the data never visit, and is 23% wider as a result (27.2 against 22.2).</figcaption>
</figure>
</div>

The bootstrap interval is asymmetric because the bootstrap distribution is — the right answer for skewed data, and one the \\(t\\) interval cannot give since it is symmetric by construction.

## Where it fails

The failure cases are the interview question.

**Extremes.** For \\(\hat\theta = \max_i x_i\\), every resample maximum is one of the observed values and equals the sample maximum with probability \\(1 - (1-1/n)^n \approx 0.632\\). The bootstrap distribution has an atom of mass there and cannot represent the smooth true one. Bickel and Freedman (1981) give the condition: the statistic must depend smoothly on the underlying distribution, and extreme order statistics do not.

**Heavy tails.** With infinite variance — a Cauchy, or a Pareto with tail index below 2 — the sample mean has no limiting normal distribution and the bootstrap is inconsistent for it.

**Dependence.** The resampling step assumes exchangeability. Applied naively to a time series it destroys autocorrelation, so it will underestimate the variance of a mean by a factor that grows with the dependence. The fix is to resample contiguous blocks — the moving-block or stationary bootstrap (Politis and Romano, 1994) — with block length long enough to preserve the correlation structure.

## Permutation tests

To test whether two groups differ, apply the same trick to the null. Under \\(H_0\\) the group labels are meaningless, so any reassignment is as likely as the one observed: enumerate the relabellings, compute the statistic for each, and see where the observed value lands.

Group A: 12, 15, 15, 18. Group B: 22, 27, 41, 88. The observed difference of means is \\(44.5 - 15.0 = 29.5\\). There are \\(\binom{8}{4} = 70\\) ways to split eight numbers into two groups of four, and exactly 2 of them — the observed split and its mirror image — give a difference of 29.5 or more in absolute value. So the exact two-sided p-value is \\(2/70 = 0.029\\).

<div class="warning-box">
  <strong>Interview trap — resolution is bounded by the design:</strong> that 0.029 is the <em>smallest p-value obtainable</em> with four observations per group, because the most extreme split already sits at \(2/70\). No effect size, however enormous, can push a 4-versus-4 permutation test below 0.01. The same logic applies to the bootstrap: with \(B\) resamples a percentile interval can only resolve tail probabilities to about \(1/B\), so \(B = 1{,}000\) is not enough for a 99% interval. Use \(B \ge 10{,}000\) when you care about the tails.
</div>

## Cross-validation is resampling too

\\(k\\)-fold CV is a resampling estimate of generalisation error, and it inherits a resampling problem: the folds are *not* independent. Any two training sets in 5-fold CV share three of the five parts — 75% of each training set — so the models are correlated, and so are their errors.

The naive standard error \\(s/\sqrt{k}\\) across folds therefore understates the true variability, often badly. Bengio and Grandvalet (2004) proved something stronger: there is *no* unbiased estimator of the variance of \\(k\\)-fold cross-validation. Fold spread is a rough signal, not a confidence interval.

<div class="insight-box">
  <strong>Key Insight — what the bootstrap actually assumes:</strong> not normality, and not a formula for \(\hat\theta\), but that \(\hat F_n\) is a good enough stand-in for \(F\) <em>for the functional you are computing</em>. That is why it works beautifully for means, medians and correlations, all of which depend on \(F\) smoothly, and fails for maxima, which depend on the sharp edge of \(F\) that a finite sample never observes. Ask "does my statistic depend on a part of the distribution my sample can see?" and the failure cases stop needing memorisation.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Resample \(n\) points with replacement, recompute, repeat. Each resample misses about 36.8% of the distinct points, since \((1-1/n)^n \to e^{-1}\).</li>
    <li>Percentile CI = the 2.5th and 97.5th percentiles of the resampled statistics; it inherits the skew of the data, unlike a symmetric \(t\) interval.</li>
    <li>Fails for extremes, infinite-variance tails and dependent data; use a block bootstrap for time series.</li>
    <li>Permutation tests give exact p-values, but resolution is limited by the number of relabellings: 4 versus 4 bottoms out at \(2/70 = 0.029\).</li>
    <li>k-fold CV is resampling with correlated folds — no unbiased variance estimator exists, so do not read fold spread as a confidence interval.</li>
  </ul>
</div>

## References

1. Efron, B. [Bootstrap Methods: Another Look at the Jackknife](https://doi.org/10.1214/aos/1176344552). *The Annals of Statistics*, 7(1), 1–26, 1979.
2. Bickel, P. J., & Freedman, D. A. [Some Asymptotic Theory for the Bootstrap](https://doi.org/10.1214/aos/1176345637). *The Annals of Statistics*, 9(6), 1196–1217, 1981.
3. Politis, D. N., & Romano, J. P. [The Stationary Bootstrap](https://doi.org/10.1080/01621459.1994.10476870). *Journal of the American Statistical Association*, 89(428), 1303–1313, 1994.
4. Bengio, Y., & Grandvalet, Y. [No Unbiased Estimator of the Variance of K-Fold Cross-Validation](https://jmlr.org/papers/v5/grandvalet04a.html). *Journal of Machine Learning Research*, 5, 1089–1105, 2004.
