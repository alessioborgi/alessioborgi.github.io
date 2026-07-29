---
layout: single
title: "Estimators, Bias and Variance: Why Unbiased Is Not the Same as Good"
date: 2026-08-13
categories: [stats-basics]
book: stats-basics
subsection: estimation
tags: [estimators, bias-variance, shrinkage, ridge]
excerpt: "An estimator is a random variable, so it has a mean and a spread. Squared error splits exactly into those two pieces — and once you see the split, it becomes obvious that deliberately biasing an estimator can make it strictly better."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 7
permalink: /blog/stats-basics/estimators-bias-variance/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> An estimator \(\hat{\theta}\) is a function of the sample, so it is itself random and has a distribution. Mean squared error decomposes exactly as \(\mathrm{MSE} = \mathrm{Var}(\hat\theta) + \mathrm{Bias}(\hat\theta)^2\), with no remainder. Unbiasedness only kills the second term, and it often does so by inflating the first — which is why shrinking an estimate towards zero, as ridge regression does, can lower total error even though it guarantees you are wrong on average.
</div>

## An estimator is a random variable

An **estimator** is any function of the sample, \\(\hat{\theta} = g(x_1,\dots,x_n)\\), used to guess an unknown parameter \\(\theta\\). The sample mean is one; so is the sample median, the sample maximum, and the constant function that always returns 7. Nothing about the definition requires the estimator to be sensible.

The important consequence is that because the sample is random, \\(\hat{\theta}\\) is random. It has a distribution — the **sampling distribution** — and every property below is a property of that distribution, not of the single number you computed from your one dataset.

## Four properties

**Bias** is the systematic offset, \\(\mathrm{Bias}(\hat\theta) = \mathbb{E}[\hat\theta] - \theta\\). The sample mean is unbiased for \\(\mu\\). The maximum-likelihood variance \\(\frac{1}{n}\sum_i(x_i-\bar{x})^2\\) is biased downwards by a factor \\((n-1)/n\\), as [descriptive statistics](/blog/stats-basics/descriptive-statistics/) derives.

**Variance** is the scatter, \\(\mathrm{Var}(\hat\theta) = \mathbb{E}\big[(\hat\theta - \mathbb{E}[\hat\theta])^2\big]\\) — how much the answer would move if you collected a different sample of the same size.

**Consistency** is an asymptotic guarantee: \\(\hat\theta_n \to \theta\\) in probability as \\(n \to \infty\\). Consistency and unbiasedness are independent. The MLE of variance is biased at every finite \\(n\\) yet consistent, since the factor \\((n-1)/n \to 1\\). Conversely, "use \\(x_1\\) and ignore the rest" is unbiased for \\(\mu\\) and never consistent.

**Efficiency** compares variances among unbiased estimators. The Cramér–Rao bound says no unbiased estimator can beat the inverse Fisher information:

<div class="formula-box">
\[
\mathrm{Var}(\hat\theta) \;\ge\; \frac{1}{n \, I(\theta)},
\qquad
I(\theta) = -\,\mathbb{E}\!\left[\frac{\partial^2}{\partial\theta^2}\log p(x \mid \theta)\right]
\]
</div>

Here \\(I(\theta)\\) is the information a single observation carries about \\(\theta\\): the expected curvature of the log-density. Sharp curvature means the likelihood changes fast as \\(\theta\\) moves, so \\(\theta\\) is easy to pin down. An estimator attaining the bound is called efficient — the sample mean is efficient for a Gaussian mean.

## The decomposition

Write \\(\bar\theta = \mathbb{E}[\hat\theta]\\) and add and subtract it inside the square:

<div class="formula-box">
\[
\begin{aligned}
\mathrm{MSE}(\hat\theta)
&= \mathbb{E}\big[(\hat\theta - \theta)^2\big]
 = \mathbb{E}\big[\big((\hat\theta - \bar\theta) + (\bar\theta - \theta)\big)^2\big] \\[2pt]
&= \underbrace{\mathbb{E}\big[(\hat\theta-\bar\theta)^2\big]}_{\text{variance}}
 + 2(\bar\theta - \theta)\,\underbrace{\mathbb{E}\big[\hat\theta - \bar\theta\big]}_{=\,0}
 + \underbrace{(\bar\theta - \theta)^2}_{\text{bias}^2}
\end{aligned}
\]
</div>

The cross term dies because \\(\bar\theta-\theta\\) is a constant and \\(\hat\theta - \bar\theta\\) has mean zero by definition. So

<div class="formula-box">
\[
\mathrm{MSE}(\hat\theta) = \mathrm{Var}(\hat\theta) + \mathrm{Bias}(\hat\theta)^2
\]
</div>

This is an identity, not an approximation and not a trade-off law. It says squared error has exactly two sources, and any estimator that reduces one by more than it inflates the other is an improvement.

The same algebra applied to prediction gives the familiar three-term version. For a target \\(y = f(x) + \varepsilon\\) with \\(\mathrm{Var}(\varepsilon)=\sigma^2\\) and a model \\(\hat{f}\\) trained on a random dataset, the expected squared error at a fixed \\(x\\) is \\(\sigma^2 + \mathrm{Bias}(\hat f(x))^2 + \mathrm{Var}(\hat f(x))\\). The extra \\(\sigma^2\\) is irreducible noise — no model removes it. Underfitting is the bias term dominating; overfitting is the variance term dominating, the model chasing sampling noise that a different training set would not have contained.

## Buying a lower error with bias

Suppose \\(\bar{x} \sim \mathcal{N}(\mu, \sigma^2/n)\\) and consider the shrunk estimator \\(\hat\mu_c = c\,\bar{x}\\) for a constant \\(c \in [0,1]\\). Its bias is \\((c-1)\mu\\) and its variance is \\(c^2\sigma^2/n\\), so

<div class="formula-box">
\[
\mathrm{MSE}(c) = c^2\frac{\sigma^2}{n} + (c-1)^2\mu^2,
\qquad
c^\star = \frac{\mu^2}{\mu^2 + \sigma^2/n}
\]
</div>

Take \\(\mu = 1\\), \\(\sigma^2 = 1\\), \\(n = 4\\), so \\(\sigma^2/n = 0.25\\) and \\(c^\star = 1/1.25 = 0.8\\).

| \\(c\\) | Variance | Bias² | MSE |
|---|---|---|---|
| 1.0 (unbiased) | 0.2500 | 0.0000 | **0.2500** |
| 0.9 | 0.2025 | 0.0100 | 0.2125 |
| 0.8 (optimal) | 0.1600 | 0.0400 | **0.2000** |
| 0.7 | 0.1225 | 0.0900 | 0.2125 |
| 0.5 | 0.0625 | 0.2500 | 0.3125 |

Shrinking by 20% cuts MSE from 0.2500 to 0.2000 — a 20% reduction — while guaranteeing the estimate is too small on average. The unbiased estimator is not even a local optimum: the derivative of MSE at \\(c=1\\) is \\(2\sigma^2/n > 0\\), so *some* shrinkage always helps.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="bvd-title bvd-desc" viewBox="0 0 640 200" style="max-width:640px;width:100%;height:auto">
  <title id="bvd-title">Variance, squared bias and total MSE for the shrinkage estimator</title>
  <desc id="bvd-desc">Three curves plotted against the shrinkage factor c from 0.4 to 1.2, for the case mu equals 1, sigma squared equals 1 and n equals 4. Variance rises as c squared times 0.25, from 0.04 at c equals 0.4 to 0.36 at c equals 1.2. Squared bias falls to zero at c equals 1 and rises again. Their sum, the MSE curve, is a parabola with its minimum of 0.20 at c equals 0.8, which is lower than the value 0.25 attained by the unbiased estimator at c equals 1.</desc>
  <rect x="1" y="1" width="638" height="198" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="64" y1="154" x2="600" y2="154" stroke="#cbd5e1"/>
  <line x1="64" y1="30" x2="64" y2="154" stroke="#cbd5e1"/>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="64" y="168">0.4</text><text x="196" y="168">0.6</text><text x="329" y="168">0.8</text><text x="462" y="168">1.0</text><text x="594" y="168">1.2</text>
  </g>
  <g font-size="9.5" fill="#475569" text-anchor="end">
    <text x="58" y="157">0</text><text x="58" y="104">0.2</text><text x="58" y="51">0.4</text>
  </g>
  <text x="332" y="184" text-anchor="middle" font-size="10.5" fill="#334155">shrinkage factor c  (c = 1 is the ordinary unbiased sample mean)</text>
  <polyline fill="none" stroke="#0e7490" stroke-width="1.8" points="64,143.3 97,140.5 130,137.3 163,133.8 197,130.0 230,125.8 263,121.3 296,116.5 329,111.3 362,105.8 395,100.0 428,93.8 462,87.3 495,80.5 528,73.3 561,65.8 594,58.0"/>
  <polyline fill="none" stroke="#c2410c" stroke-width="1.8" points="64,58.0 97,73.3 130,87.3 163,100.0 197,111.3 230,121.3 263,130.0 296,137.3 329,143.3 362,148.0 395,151.3 428,153.3 462,154.0 495,153.3 528,151.3 561,148.0 594,143.3"/>
  <polyline fill="none" stroke="#0c4a6e" stroke-width="2.4" points="64,47.3 97,59.8 130,70.7 163,79.8 197,87.3 230,93.2 263,97.3 296,99.8 329,100.7 362,99.8 395,97.3 428,93.2 462,87.3 495,79.8 528,70.7 561,59.8 594,47.3"/>
  <circle cx="329" cy="100.7" r="4" fill="#0c4a6e"/>
  <circle cx="462" cy="87.3" r="4" fill="none" stroke="#0c4a6e" stroke-width="1.8"/>
  <text x="329" y="93" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0c4a6e">MSE 0.200</text>
  <text x="478" y="80" font-size="9.5" font-weight="700" fill="#0c4a6e">0.250</text>
  <g font-size="10" font-weight="700">
    <text x="600" y="58" fill="#0e7490">variance</text>
    <text x="600" y="140" fill="#c2410c">bias²</text>
    <text x="72" y="44" fill="#0c4a6e">MSE</text>
  </g>
</svg>
<figcaption>Notice that the filled dot (best MSE) is not at c = 1. The MSE curve is flat-bottomed and its minimum sits to the left of the unbiased point, so a little shrinkage is almost free and never harmful near the optimum.</figcaption>
</figure>
</div>

<div class="insight-box">
  <strong>Key Insight — why shrinkage keeps working:</strong> the gain comes from the asymmetry of the two terms near \(c=1\). Variance falls <em>linearly</em> in the amount of shrinkage (derivative \(2c\sigma^2/n\), non-zero at \(c=1\)) while squared bias grows only <em>quadratically</em> from zero (derivative \(2(c-1)\mu^2 = 0\) at \(c=1\)). First-order gain against second-order loss means the trade always starts in your favour. Stein's result that the sample mean is inadmissible in three or more dimensions is this observation, made uniform over \(\mu\).
</div>

## Ridge, and the ML reading

Ridge regression is exactly this move for linear models: $$\hat\beta_{\text{ridge}} = (X^\top X + \lambda I)^{-1}X^\top y$$ shrinks every coefficient towards zero, which biases the fit and lowers its variance. When predictors are correlated, \\(X^\top X\\) is near-singular, the ordinary least-squares variance explodes, and even a large \\(\lambda\\) pays for itself. Weight decay, early stopping and dropout all sit in the same family. [Maximum likelihood](/blog/stats-basics/maximum-likelihood/) shows that the ridge penalty is what a Gaussian prior looks like from the optimisation side.

<div class="warning-box">
  <strong>Interview trap:</strong> "bias–variance trade-off" invites two errors. First, the decomposition is an <em>identity</em>, not a constraint — more training data reduces variance without touching bias, so both can fall at once and nothing is being traded. Second, it is specific to squared loss; 0–1 loss and cross-entropy do not decompose this cleanly. And the classic U-shaped test-error curve is not universal: Belkin et al. (2019) documented double descent, where error falls again past the interpolation threshold.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>An estimator is a random variable; bias, variance, consistency and efficiency are properties of its sampling distribution.</li>
    <li>\(\mathrm{MSE} = \mathrm{Var} + \mathrm{Bias}^2\) exactly, and for prediction there is an extra irreducible \(\sigma^2\).</li>
    <li>Unbiased and consistent are independent properties — the MLE variance is biased but consistent.</li>
    <li>Shrinking by 20% in the worked example cut MSE by 20%; some shrinkage always helps because variance falls first-order while bias² grows second-order.</li>
    <li>Ridge, weight decay and early stopping are the same trade in a model with many parameters.</li>
  </ul>
</div>

## References

1. Hoerl, A. E., & Kennard, R. W. [Ridge Regression: Biased Estimation for Nonorthogonal Problems](https://doi.org/10.1080/00401706.1970.10488634). *Technometrics*, 12(1), 55–67, 1970.
2. Efron, B., & Morris, C. [Data Analysis Using Stein's Estimator and its Generalizations](https://doi.org/10.1080/01621459.1975.10479864). *Journal of the American Statistical Association*, 70(350), 311–319, 1975.
3. Belkin, M., Hsu, D., Ma, S., & Mandal, S. [Reconciling modern machine-learning practice and the classical bias–variance trade-off](https://doi.org/10.1073/pnas.1903070116). *PNAS*, 116(32), 15849–15854, 2019.
4. Hastie, T., Tibshirani, R., & Friedman, J. [*The Elements of Statistical Learning*](https://hastie.su.domains/ElemStatLearn/), 2nd ed. *Springer*, 2009.
