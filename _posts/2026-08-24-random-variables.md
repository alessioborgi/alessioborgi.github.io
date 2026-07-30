---
layout: single
title: "Random Variables: A Density Is Not a Probability"
date: 2026-08-24
categories: [prob-basics]
book: prob-basics
subsection: distributions
tags: [random-variables, pdf, cdf, change-of-variables]
excerpt: "A probability density can be 2, or 200, and nothing is wrong. Getting clear on what a PDF actually is fixes half the confusion about continuous distributions — and explains the Jacobian term that makes normalising flows work."
author_profile: true
read_time: true
is_overview: false
icon: "📈"
read_mins: 5
permalink: /blog/prob-basics/random-variables/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A random variable is a function from outcomes to numbers. Discrete ones carry a PMF, which gives probabilities directly; continuous ones carry a PDF, which does not — \(p(x)\) is a density per unit \(x\), can exceed 1, and only becomes a probability after integration. The CDF works for both. Transforming a variable multiplies its density by a Jacobian determinant, and inverting the CDF turns uniform noise into samples from anything.
</div>

## From outcomes to numbers

A random variable $$X$$ is a measurable function $$X:\Omega\to\mathbb{R}$$ — it labels each outcome with a number. Rolling two dice, $$\Omega$$ has 36 elements, and $$X = $$ "sum" collapses them onto $$\{2,\dots,12\}$$. Probability then transfers: $$P(X = 7) = P(\{\omega : X(\omega)=7\}) = 6/36$$. This pushforward is why we can stop mentioning $$\Omega$$ almost immediately; all the information lives in the induced distribution on $$\mathbb{R}$$.

**Discrete** variables take countably many values and are described by a **PMF** $$p(x) = P(X=x)$$, with $$p(x)\in[0,1]$$ and $$\sum_x p(x)=1$$. Each value is a genuine probability.

**Continuous** variables take uncountably many values, and each single value has probability zero. What exists instead is a **PDF** $$p(x)\ge 0$$ with $$\int p(x)\,dx = 1$$, defined so that

<div class="formula-box">
\[
P(a \le X \le b) = \int_a^b p(x)\,dx .
\]
</div>

<div class="warning-box">
  <strong>Interview trap — "\(p(x)\) is the probability of \(x\)":</strong> it is not, and it is not even bounded by 1. A uniform distribution on \([0, 0.5]\) has density \(p(x) = 2\) everywhere on that interval, because \(2 \times 0.5 = 1\). A narrow Gaussian with \(\sigma = 0.01\) peaks at \(1/(\sigma\sqrt{2\pi}) \approx 39.9\). The density has units of probability <em>per unit \(x\)</em>; only \(p(x)\,dx\) is dimensionless. This is also why log-likelihoods of continuous models can be positive, and why comparing them across different data scalings is meaningless.
</div>

The object that unifies both cases is the **CDF**

<div class="formula-box">
\[
F(x) = P(X \le x),
\]
</div>

which is non-decreasing, right-continuous, and runs from 0 to 1. It jumps at atoms of a discrete variable and is continuous with $$F'(x) = p(x)$$ for a continuous one. Because $$F$$ always exists, statements phrased through CDFs — convergence in distribution, quantiles, stochastic dominance — apply uniformly to both kinds.

## Change of variables

Push $$X$$ through a differentiable, strictly monotone map $$Y = g(X)$$. Probability mass is conserved, but it gets stretched or compressed, so the density must be rescaled by how much $$g$$ stretches the axis:

<div class="formula-box">
\[
p_Y(y) = p_X\!\left(g^{-1}(y)\right)\left|\frac{d}{dy}g^{-1}(y)\right| .
\]
</div>

In $$d$$ dimensions the derivative becomes the Jacobian matrix and the stretch factor becomes the absolute determinant, $$p_Y(\mathbf{y}) = p_X(g^{-1}(\mathbf{y}))\,\bigl\lvert \det J_{g^{-1}}(\mathbf{y})\bigr\rvert$$, because the determinant is exactly the local volume-scaling factor of a linear map.

A concrete case: let $$X\sim\mathrm{Uniform}(0,1)$$ and $$Y = -\log X$$. Then $$g^{-1}(y) = e^{-y}$$ with derivative $$-e^{-y}$$, and $$p_X = 1$$ on the unit interval, so

<div class="formula-box">
\[
p_Y(y) = 1 \cdot \left| -e^{-y}\right| = e^{-y}, \qquad y > 0,
\]
</div>

the standard exponential. Uniform noise became an exponential purely through the Jacobian.

This identity is the whole content of **normalising flows**: compose invertible maps, track $$\sum \log\lvert \det J\rvert$$, and you have an exact log-likelihood for the transformed density. Architectures like coupling layers exist precisely because a general $$\det J$$ costs $$\mathcal{O}(d^3)$$, whereas a triangular Jacobian costs $$\mathcal{O}(d)$$.

## Quantiles and inverse-transform sampling

The **quantile function** is the generalised inverse of the CDF, $$F^{-1}(u) = \inf\{x : F(x)\ge u\}$$ for $$u\in(0,1)$$. The infimum handles flat regions and jumps, so $$F^{-1}$$ is defined even when $$F$$ is not strictly increasing. $$F^{-1}(0.5)$$ is the median.

Its consequence is one of the most useful facts in simulation: if $$U\sim\mathrm{Uniform}(0,1)$$ then $$F^{-1}(U)$$ has CDF $$F$$. The proof is one line, $$P(F^{-1}(U)\le x) = P(U \le F(x)) = F(x)$$, using only that $$U$$ is uniform. Every sampler for a univariate distribution can therefore be built from a uniform random number generator, provided you can invert $$F$$.

For the exponential with rate $$\lambda$$, $$F(x) = 1-e^{-\lambda x}$$, so $$F^{-1}(u) = -\log(1-u)/\lambda$$. With $$\lambda = 2$$ and a draw $$u = 0.7$$: $$x = -\log(0.3)/2 = 1.20397/2 = 0.60199$$. Since $$1-U$$ is also uniform, implementations usually write $$-\log(U)/\lambda$$.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="rv-title rv-desc" viewBox="0 0 600 230" style="max-width:600px;width:100%;height:auto">
  <title id="rv-title">Inverse-transform sampling from an exponential CDF</title>
  <desc id="rv-desc">A plot of the exponential CDF with rate 2, rising from 0 towards 1. A uniform draw of 0.7 on the vertical axis is carried horizontally to the curve and then dropped vertically to the horizontal axis, landing at x equals 0.602. A second draw of 0.3 lands at x equals 0.178. The flat upper part of the curve maps a broad span of u values into a narrow span of large x values, and vice versa.</desc>
  <rect x="1" y="1" width="598" height="228" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g stroke="#94a3b8" stroke-width="1"><line x1="70" y1="190" x2="540" y2="190"/><line x1="70" y1="190" x2="70" y2="30"/></g>
  <path d="M70,190 C130,110 190,70 260,55 C340,40 440,35 540,34" fill="none" stroke="#0e7490" stroke-width="2.2"/>
  <g stroke="#c2410c" stroke-width="1.5" stroke-dasharray="5 4" fill="none">
    <line x1="70" y1="78" x2="205" y2="78"/><line x1="205" y1="78" x2="205" y2="190"/>
    <line x1="70" y1="143" x2="110" y2="143"/><line x1="110" y1="143" x2="110" y2="190"/>
  </g>
  <g fill="#c2410c"><circle cx="205" cy="78" r="3.4"/><circle cx="110" cy="143" r="3.4"/></g>
  <g font-size="10.5" fill="#334155">
    <text x="36" y="82">u=0.7</text><text x="36" y="147">u=0.3</text>
    <text x="46" y="38">1.0</text><text x="52" y="194">0</text>
    <text x="182" y="206" fill="#c2410c">0.602</text><text x="88" y="206" fill="#c2410c">0.178</text>
    <text x="300" y="215" text-anchor="middle" font-size="11">x</text>
    <text x="452" y="66" fill="#0e7490" font-weight="700">F(x) = 1 − e^(−2x)</text>
  </g>
  <text x="22" y="112" font-size="11" fill="#475569" transform="rotate(-90 22 112)">F(x)</text>
</svg>
<figcaption>Notice that where the CDF is steep, a small slice of \(u\) maps to a small slice of \(x\) — that is where the density is high. Steepness of \(F\) <em>is</em> the density, which is why inverting it lands samples in the right places automatically.</figcaption>
</figure>
</div>

<div class="insight-box">
  <strong>Key Insight — the density is a bookkeeping device, the CDF is the real object:</strong> the CDF exists for every random variable, discrete, continuous or mixed, and determines the distribution completely. The PDF exists only when \(F\) is differentiable, and its value at a point is meaningless in isolation. When a claim about densities looks paradoxical — a density above 1, a likelihood that changes when you switch from metres to centimetres — restate it in terms of \(F\) and the paradox disappears.
</div>

## Where this goes next

Summarising a distribution by a few numbers rather than a whole function is [expectation and variance](/blog/prob-basics/expectation-and-variance/); the standard families and their densities are catalogued in [common distributions](/blog/prob-basics/common-distributions/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>A random variable is a measurable map \(\Omega\to\mathbb{R}\); the distribution is the pushforward of \(P\).</li>
    <li>A PMF gives probabilities; a PDF gives density per unit \(x\) and may exceed 1. Only \(\int p\,dx\) is a probability.</li>
    <li>The CDF \(F(x)=P(X\le x)\) exists always and characterises the distribution.</li>
    <li>Under \(Y=g(X)\), densities pick up \(|\det J|\) — the identity behind normalising flows.</li>
    <li>\(F^{-1}(U)\) with \(U\sim\mathrm{Uniform}(0,1)\) samples from \(F\); for \(\mathrm{Exp}(\lambda)\) that is \(-\log(U)/\lambda\).</li>
  </ul>
</div>

## References

1. Devroye, L. [Non-Uniform Random Variate Generation](http://www.nrbook.com/devroye/). *Springer, 1986*.
2. Papamakarios, G., Nalisnick, E., Rezende, D. J., Mohamed, S. & Lakshminarayanan, B. [Normalizing Flows for Probabilistic Modeling and Inference](https://arxiv.org/abs/1912.02762). *JMLR 22(57), 2021*.
3. Rezende, D. J. & Mohamed, S. [Variational Inference with Normalizing Flows](https://arxiv.org/abs/1505.05770). *ICML 2015*.
4. Casella, G. & Berger, R. L. *Statistical Inference*, 2nd ed. Duxbury, 2002.
