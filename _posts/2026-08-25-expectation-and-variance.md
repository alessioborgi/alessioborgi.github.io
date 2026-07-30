---
layout: single
title: "Expectation and Variance: Linearity Is Free, Additivity Is Not"
date: 2026-08-25
categories: [prob-basics]
book: prob-basics
subsection: distributions
tags: [expectation, variance, covariance, correlation]
excerpt: "Expectation adds up no matter how tangled the dependence. Variance does not — and the correction term, covariance, is where most of the interesting behaviour of ensembles, portfolios and minibatch gradients lives."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 5
permalink: /blog/prob-basics/expectation-and-variance/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> \(\mathbb{E}[X+Y]=\mathbb{E}X+\mathbb{E}Y\) always, with no independence assumption — which makes indicator decompositions absurdly effective. Variance only adds when the covariance vanishes: \(\operatorname{Var}(X+Y)=\operatorname{Var}X+\operatorname{Var}Y+2\operatorname{Cov}(X,Y)\). Correlation is normalised covariance and detects <em>linear</em> association only, so zero correlation does not mean independence. The laws of total expectation and total variance let you compute either by conditioning.
</div>

## Expectation

For a discrete variable $$\mathbb{E}[X]=\sum_x x\,p(x)$$; for a continuous one $$\mathbb{E}[X]=\int x\,p(x)\,dx$$. Both are the same object — an integral against the distribution — and both can fail to exist when the tails are heavy enough, as for the Cauchy.

The property that matters is **linearity**:

<div class="formula-box">
\[
\mathbb{E}[aX + bY] = a\,\mathbb{E}[X] + b\,\mathbb{E}[Y]
\]
</div>

for any $$a,b$$ and *any* joint distribution of $$X$$ and $$Y$$. Dependence is irrelevant because the identity is a statement about the integral, which is linear before any probabilistic structure is imposed.

That freedom is what makes indicator decompositions so effective. Take a uniformly random permutation of $$n$$ items and count fixed points — elements left in their own position. Let $$I_i = 1$$ if item $$i$$ is fixed. The $$I_i$$ are heavily dependent, but $$\mathbb{E}[I_i] = P(\text{item } i \text{ fixed}) = 1/n$$, so

<div class="formula-box">
\[
\mathbb{E}\left[\textstyle\sum_{i=1}^{n} I_i\right] = n \cdot \frac{1}{n} = 1
\]
</div>

for every $$n$$. No inclusion–exclusion, no derangement formula. Whenever a quantity is a count, write it as a sum of indicators before doing anything else.

<div class="warning-box">
  <strong>Interview trap — assuming linearity needs independence:</strong> it does not. The common follow-up, "what about \(\mathbb{E}[XY]\)?", <em>does</em>: \(\mathbb{E}[XY]=\mathbb{E}[X]\mathbb{E}[Y]\) requires uncorrelatedness (which independence implies). Keep the two straight — sums are always free, products are not.
</div>

## Variance and the covariance term

Variance is the expected squared deviation, $$\operatorname{Var}(X)=\mathbb{E}[(X-\mathbb{E}X)^2] = \mathbb{E}[X^2]-(\mathbb{E}X)^2$$. It is not linear: $$\operatorname{Var}(aX)=a^2\operatorname{Var}(X)$$, and constants shift the mean without moving the spread.

Expanding the square of a sum leaves a cross term:

<div class="formula-box">
\[
\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X,Y),
\qquad \operatorname{Cov}(X,Y) = \mathbb{E}[XY]-\mathbb{E}[X]\mathbb{E}[Y].
\]
</div>

The cross term is why averaging $$n$$ model predictions reduces variance by a factor of $$n$$ only when their errors are uncorrelated. For an equally weighted ensemble with common variance $$\sigma^2$$ and pairwise correlation $$\rho$$, the variance of the average is $$\sigma^2\!\left[\rho + (1-\rho)/n\right]$$, which floors at $$\rho\sigma^2$$ however many members you add. Ensembling buys nothing beyond that floor, which is why diversity, not count, is the design objective.

**Correlation** normalises covariance onto $$[-1,1]$$:

<div class="formula-box">
\[
\rho(X,Y) = \frac{\operatorname{Cov}(X,Y)}{\sqrt{\operatorname{Var}(X)\operatorname{Var}(Y)}} .
\]
</div>

The bound is Cauchy–Schwarz, and $$\lvert \rho\rvert=1$$ exactly when $$Y$$ is an affine function of $$X$$. Correlation is a measure of *linear* association, nothing more.

## Uncorrelated does not mean independent

Let $$X$$ be uniform on $$\{-1,0,1\}$$ and set $$Y = X^2$$. Then $$\mathbb{E}[X]=0$$ and $$\mathbb{E}[XY]=\mathbb{E}[X^3] = \tfrac13(-1+0+1) = 0$$, so

<div class="formula-box">
\[
\operatorname{Cov}(X,Y) = 0 - 0 \cdot \mathbb{E}[Y] = 0, \qquad \rho = 0 .
\]
</div>

Yet $$Y$$ is a deterministic function of $$X$$. Concretely, $$P(Y=0)=\tfrac13$$ while $$P(Y=0\mid X=1)=0$$, so the two are as dependent as it is possible to be. The same works for $$X\sim\mathcal{N}(0,1)$$, $$Y=X^2$$, since $$\mathbb{E}[X^3]=0$$ by symmetry.

The converse direction does hold: independence implies $$\mathbb{E}[XY]=\mathbb{E}X\,\mathbb{E}Y$$, hence zero covariance. The one place the implication reverses is the jointly Gaussian case — for a multivariate normal, zero covariance really does mean independence, which is why the trap is so easy to fall into after a term of working with Gaussians.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="ev-title ev-desc" viewBox="0 0 560 210" style="max-width:560px;width:100%;height:auto">
  <title id="ev-title">Zero correlation with total dependence</title>
  <desc id="ev-desc">A scatter of points lying exactly on the parabola y equals x squared, symmetric about the vertical axis, for x from minus one to one. A dashed horizontal best-fit line has slope zero, indicating a correlation of zero, even though every point lies exactly on the curve so y is a deterministic function of x.</desc>
  <rect x="1" y="1" width="558" height="208" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g stroke="#94a3b8" stroke-width="1"><line x1="280" y1="175" x2="280" y2="30"/><line x1="90" y1="175" x2="470" y2="175"/></g>
  <path d="M110,42 Q280,250 450,42" fill="none" stroke="#0e7490" stroke-width="2"/>
  <g fill="#0e7490">
    <circle cx="110" cy="42" r="3.6"/><circle cx="152" cy="76" r="3.6"/><circle cx="195" cy="115" r="3.6"/>
    <circle cx="238" cy="155" r="3.6"/><circle cx="280" cy="169" r="3.6"/><circle cx="322" cy="155" r="3.6"/>
    <circle cx="365" cy="115" r="3.6"/><circle cx="408" cy="76" r="3.6"/><circle cx="450" cy="42" r="3.6"/>
  </g>
  <line x1="100" y1="107" x2="460" y2="107" stroke="#c2410c" stroke-width="1.8" stroke-dasharray="6 4"/>
  <g font-size="10.5" fill="#334155">
    <text x="466" y="112" fill="#c2410c" font-weight="700">best linear fit: slope 0</text>
    <text x="286" y="188">x</text><text x="256" y="36">y</text>
    <text x="96" y="196" fill="#475569">ρ = 0, yet y = x² exactly</text>
  </g>
</svg>
<figcaption>Notice that the fitted line is flat: the symmetric parabola has no linear component at all. Correlation measures the slope of the best straight line, so it reports zero while the relationship is deterministic.</figcaption>
</figure>
</div>

## Conditioning: total expectation and total variance

Conditioning gives two decompositions that are used constantly. The **law of total expectation**:

<div class="formula-box">
\[
\mathbb{E}[Y] = \mathbb{E}\bigl[\,\mathbb{E}[Y \mid X]\,\bigr]
\]
</div>

— average within groups, then average the group averages, weighted by group size. The **law of total variance** splits spread the same way:

<div class="formula-box">
\[
\operatorname{Var}(Y) = \underbrace{\mathbb{E}\bigl[\operatorname{Var}(Y\mid X)\bigr]}_{\text{within-group}} + \underbrace{\operatorname{Var}\bigl(\mathbb{E}[Y\mid X]\bigr)}_{\text{between-group}} .
\]
</div>

A worked case: a value comes from one of two groups with equal probability; group 0 has mean 0 and variance 1, group 1 has mean 4 and variance 1. Within-group term: $$\mathbb{E}[\operatorname{Var}(Y\mid X)] = 1$$. Between-group term: the conditional means are 0 and 4 with probability $$\tfrac12$$ each, so their variance is $$8 - 2^2 = 4$$. Total: $$\operatorname{Var}(Y) = 1 + 4 = 5$$. Checking directly, $$\mathbb{E}[Y]=2$$ and $$\mathbb{E}[Y^2] = \tfrac12(1+0)+\tfrac12(1+16) = 9$$, giving $$9-4=5$$.

<div class="insight-box">
  <strong>Key Insight — total variance is the uncertainty decomposition:</strong> read \(X\) as "which model" in a deep ensemble and \(Y\) as the prediction. The within-group term \(\mathbb{E}[\operatorname{Var}(Y\mid X)]\) is <em>aleatoric</em> uncertainty — noise no model can remove — and the between-group term \(\operatorname{Var}(\mathbb{E}[Y\mid X])\) is <em>epistemic</em>, the disagreement between models, which more data can shrink. The split reported by Bayesian deep learning methods is precisely this identity.
</div>

## Where this goes next

Means and variances for the standard families are tabulated in [common distributions](/blog/prob-basics/common-distributions/); what happens to a sample mean as $$n$$ grows is [limit theorems](/blog/prob-basics/limit-theorems/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Linearity of expectation holds for any dependence; \(\mathbb{E}[XY]=\mathbb{E}X\,\mathbb{E}Y\) does not.</li>
    <li>\(\operatorname{Var}(X+Y)=\operatorname{Var}X+\operatorname{Var}Y+2\operatorname{Cov}(X,Y)\); ensemble averaging floors at \(\rho\sigma^2\).</li>
    <li>Correlation captures linear association only: \(X\) uniform on \(\{-1,0,1\}\) with \(Y=X^2\) has \(\rho=0\) and total dependence.</li>
    <li>Independence \(\Rightarrow\) uncorrelated, never the reverse — except for jointly Gaussian variables.</li>
    <li>Total variance splits into within-group (aleatoric) and between-group (epistemic) parts.</li>
  </ul>
</div>

## References

1. Ross, S. M. *A First Course in Probability*, 10th ed. Pearson, 2018.
2. Wasserman, L. *All of Statistics: A Concise Course in Statistical Inference*. Springer, 2004.
3. Lakshminarayanan, B., Pritzel, A. & Blundell, C. [Simple and Scalable Predictive Uncertainty Estimation using Deep Ensembles](https://arxiv.org/abs/1612.01474). *NeurIPS 2017*.
4. Kendall, A. & Gal, Y. [What Uncertainties Do We Need in Bayesian Deep Learning for Computer Vision?](https://arxiv.org/abs/1703.04977) *NeurIPS 2017*.
