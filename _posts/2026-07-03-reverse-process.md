---
layout: single
title: "The Reverse Process: Why a Gaussian Is Enough, and What the Network Should Predict"
date: 2026-07-03
categories: [diffusion]
book: diffusion
subsection: foundations
tags: [diffusion, reverse-process, posterior, v-prediction]
excerpt: "Reversing a corruption is generally intractable. Diffusion escapes by taking steps small enough that the reverse conditional is itself Gaussian — so the network only has to output a mean. Which mean it outputs, though, turns out to matter a great deal."
author_profile: true
read_time: true
is_overview: false
icon: "🌫️"
read_mins: 5
permalink: /blog/diffusion/reverse-process/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> For small \(\beta_t\), \(q(\mathbf{x}_{t-1}\mid\mathbf{x}_t)\) is Gaussian to first order in \(\beta_t\), so a network that emits a mean is expressive enough. Conditioning additionally on \(\mathbf{x}_0\) makes the posterior exactly Gaussian and available in closed form, which tells us precisely what the network should be regressing onto. Rewriting that target three different ways gives the \(\boldsymbol{\epsilon}\), \(\mathbf{x}_0\) and \(v\) parameterisations — mathematically equivalent, numerically very different at the ends of the schedule.
</div>

## The approximation that carries the method

Sampling requires $$q(\mathbf{x}_{t-1}\mid\mathbf{x}_t)$$, and by Bayes' rule that is

<div class="formula-box">
\[
q(\mathbf{x}_{t-1}\mid\mathbf{x}_t) = \frac{q(\mathbf{x}_t\mid\mathbf{x}_{t-1})\,q(\mathbf{x}_{t-1})}{q(\mathbf{x}_t)}
\]
</div>

The marginal $$q(\mathbf{x}_{t-1})$$ is the data distribution pushed through $$t-1$$ noising steps: intractable, multimodal, the very thing we are trying to model. So the ratio is not Gaussian in general.

The escape is a scale argument. Take logarithms:

<div class="formula-box">
\[
\log q(\mathbf{x}_{t-1}\mid\mathbf{x}_t) = -\frac{\lVert \mathbf{x}_t - \sqrt{1-\beta_t}\,\mathbf{x}_{t-1}\rVert^2}{2\beta_t} + \log q(\mathbf{x}_{t-1}) + \text{const}(\mathbf{x}_t)
\]
</div>

The first term is a sharp quadratic of width $$\sqrt{\beta_t}$$ in $$\mathbf{x}_{t-1}$$. The second is the awkward one, but it is only evaluated inside that narrow window. Expanding $$\log q$$ to first order about $$\mathbf{x}_t/\sqrt{1-\beta_t}$$ leaves a quadratic in $$\mathbf{x}_{t-1}$$ — a Gaussian — with the neglected curvature term of order $$\beta_t$$. This is Feller's observation, and it is why $$T$$ has to be large: the step size is the approximation error. Take steps too big and the true reverse conditional becomes multimodal, and no single-mean Gaussian can represent it.

Note what the expansion produces: the linear coefficient is $$\nabla \log q(\mathbf{x}_{t-1})$$, the [score](/blog/diffusion/score-based-sde/). The reverse step is a Gaussian whose mean has been nudged along the score.

## The exact posterior, once you condition on the endpoint

Training does not need $$q(\mathbf{x}_{t-1}\mid\mathbf{x}_t)$$; it needs a target. And if we also condition on the clean image $$\mathbf{x}_0$$, the posterior is Gaussian *exactly*, with no small-$$\beta$$ assumption, because both $$q(\mathbf{x}_t\mid\mathbf{x}_{t-1})$$ and $$q(\mathbf{x}_{t-1}\mid\mathbf{x}_0)$$ are Gaussian in $$\mathbf{x}_{t-1}$$:

<div class="formula-box">
\[
q(\mathbf{x}_{t-1}\mid\mathbf{x}_t,\mathbf{x}_0) = \mathcal{N}\!\left(\mathbf{x}_{t-1};\ \tilde{\boldsymbol{\mu}}_t(\mathbf{x}_t,\mathbf{x}_0),\ \tilde{\beta}_t\mathbf{I}\right)
\]
\[
\tilde{\boldsymbol{\mu}}_t = \frac{\sqrt{\bar{\alpha}_{t-1}}\,\beta_t}{1-\bar{\alpha}_t}\,\mathbf{x}_0
+ \frac{\sqrt{\alpha_t}\,(1-\bar{\alpha}_{t-1})}{1-\bar{\alpha}_t}\,\mathbf{x}_t,
\qquad
\tilde{\beta}_t = \frac{1-\bar{\alpha}_{t-1}}{1-\bar{\alpha}_t}\,\beta_t
\]
</div>

with $$\alpha_t = 1-\beta_t$$ and $$\bar{\alpha}_t = \prod_{s\le t}\alpha_s$$ as in the [forward process](/blog/diffusion/forward-process/). The mean is a blend of where you are and where you came from. The two coefficients sum to at most one — exactly one only at $$t=1$$, and strictly less otherwise — and they collapse neatly once $$\mathbf{x}_0$$ is eliminated.

Substituting $$\mathbf{x}_0 = (\mathbf{x}_t - \sqrt{1-\bar{\alpha}_t}\,\boldsymbol{\epsilon})/\sqrt{\bar{\alpha}_t}$$ and using $$\sqrt{\bar{\alpha}_{t-1}}/\sqrt{\bar{\alpha}_t} = 1/\sqrt{\alpha_t}$$, the $$\mathbf{x}_t$$ coefficients combine as $$\big[\beta_t + \alpha_t(1-\bar{\alpha}_{t-1})\big]/\big[(1-\bar{\alpha}_t)\sqrt{\alpha_t}\big] = 1/\sqrt{\alpha_t}$$, leaving

<div class="formula-box">
\[
\tilde{\boldsymbol{\mu}}_t = \frac{1}{\sqrt{\alpha_t}}\left(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}}\,\boldsymbol{\epsilon}\right)
\]
</div>

This is the sampler. Knowing the noise that produced $$\mathbf{x}_t$$ is equivalent to knowing the exact posterior mean, so predicting $$\boldsymbol{\epsilon}$$ is a sufficient parameterisation — the result that turns the whole [ELBO into an MSE](/blog/diffusion/ddpm-training/).

## Three targets, one quantity

Any one of $$\boldsymbol{\epsilon}$$, $$\mathbf{x}_0$$ and $$\mathbf{x}_t$$ determines the third. Writing $$a = \sqrt{\bar{\alpha}_t}$$ and $$b = \sqrt{1-\bar{\alpha}_t}$$ with $$a^2+b^2=1$$, so that $$\mathbf{x}_t = a\mathbf{x}_0 + b\boldsymbol{\epsilon}$$:

<div class="formula-grid">
<div class="formula-card">
<strong>\(\boldsymbol{\epsilon}\)-prediction</strong><br>
\(\hat{\mathbf{x}}_0 = (\mathbf{x}_t - b\,\boldsymbol{\epsilon}_\theta)/a\).
An error \(\delta\) in \(\boldsymbol{\epsilon}_\theta\) becomes \((b/a)\delta\) in \(\hat{\mathbf{x}}_0\). At \(t\to T\), \(a\to 0\) and the amplification diverges.
</div>
<div class="formula-card">
<strong>\(\mathbf{x}_0\)-prediction</strong><br>
\(\hat{\boldsymbol{\epsilon}} = (\mathbf{x}_t - a\,\hat{\mathbf{x}}_0)/b\).
An error \(\delta\) in \(\hat{\mathbf{x}}_0\) becomes \((a/b)\delta\) in \(\hat{\boldsymbol{\epsilon}}\). At \(t\to 0\), \(b\to 0\) and this diverges instead.
</div>
<div class="formula-card">
<strong>\(v\)-prediction</strong><br>
\(v = a\boldsymbol{\epsilon} - b\mathbf{x}_0\). Then \(\mathbf{x}_0 = a\mathbf{x}_t - b v\) and \(\boldsymbol{\epsilon} = b\mathbf{x}_t + a v\), both with coefficients bounded by 1 — no amplification anywhere.
</div>
</div>

The $$v$$ identities are worth checking rather than trusting: $$a\mathbf{x}_t - bv = a(a\mathbf{x}_0+b\boldsymbol{\epsilon}) - b(a\boldsymbol{\epsilon}-b\mathbf{x}_0) = (a^2+b^2)\mathbf{x}_0 = \mathbf{x}_0$$, and symmetrically for $$\boldsymbol{\epsilon}$$. Geometrically $$(\mathbf{x}_t, v)$$ is $$(\mathbf{x}_0,\boldsymbol{\epsilon})$$ rotated by the angle $$\phi_t = \arctan(b/a)$$, which is why the transformation is norm-preserving in both directions.

<div class="insight-box">
  <strong>Key Insight — the parameterisations differ only in conditioning:</strong> all three carry identical information, and with an exact network they give identical samples. What differs is how a <em>bounded</em> network error maps onto the sampler's mean. \(\boldsymbol{\epsilon}\)-prediction is ill-conditioned where there is almost no signal left; \(\mathbf{x}_0\)-prediction is ill-conditioned where there is almost no noise left; \(v\) is a rotation, so it is well-conditioned throughout. That is exactly why \(v\) is standard for distillation and for schedules pushed to zero terminal SNR, where the \(t\to T\) endpoint is visited in earnest.
</div>

## Fixed or learned variance

The posterior variance $$\tilde{\beta}_t$$ is known, so a natural choice is $$\sigma_t^2 = \tilde{\beta}_t$$. Ho et al. show this is optimal when $$\mathbf{x}_0$$ is deterministic, while $$\sigma_t^2 = \beta_t$$ is optimal when the data is $$\mathcal{N}(\mathbf{0},\mathbf{I})$$; the two bracket the truth. In practice they behave almost identically, and for the linear schedule they are numerically close away from $$t=1$$: at $$t=500$$, $$\sqrt{\beta_t} = 0.10020$$ against $$\sqrt{\tilde{\beta}_t} = 0.10016$$; at $$t=100$$, $$0.04552$$ against $$0.04511$$. The ratio $$\tilde{\beta}_t/\beta_t = (1-\bar{\alpha}_{t-1})/(1-\bar{\alpha}_t)$$ is below one but approaches it once $$\bar{\alpha}_t$$ is small.

They diverge exactly where it matters for likelihood. As $$t\to1$$, $$\bar{\alpha}_0 = 1$$ forces $$\tilde{\beta}_1 = 0$$ while $$\beta_1 = 10^{-4}$$ — an infinite relative gap on the term that dominates the negative log-likelihood. Nichol & Dhariwal therefore learn an interpolation in log space,

<div class="formula-box">
\[
\boldsymbol{\Sigma}_\theta(\mathbf{x}_t,t) = \exp\!\big(v_\theta \log\beta_t + (1-v_\theta)\log\tilde{\beta}_t\big)
\]
</div>

with $$v_\theta \in [0,1]$$ an extra network output. This improves log-likelihood noticeably and, because it sharpens the variance at small $$t$$, also permits far shorter sampling schedules. It does not improve FID much: sample quality was already dominated by the mean, which is where all the earlier discussion lives.

## References

1. Feller, W. On the Theory of Stochastic Processes, with Particular Reference to Applications. *Proceedings of the First Berkeley Symposium on Mathematical Statistics and Probability*, 1949. (The small-step Gaussian-reversal argument that [Sohl-Dickstein et al.](https://arxiv.org/abs/1503.03585) build on.)
2. Ho, J., Jain, A., & Abbeel, P. [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239). *NeurIPS 2020*.
3. Nichol, A., & Dhariwal, P. [Improved Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2102.09672). *ICML 2021*.
4. Salimans, T., & Ho, J. [Progressive Distillation for Fast Sampling of Diffusion Models](https://arxiv.org/abs/2202.00512). *ICLR 2022*.
