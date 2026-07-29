---
layout: single
title: "Score Matching and the SDE View: DDPM as One Discretisation Among Many"
date: 2026-07-05
categories: [diffusion]
book: diffusion
subsection: formulations
tags: [diffusion, score-matching, sde, probability-flow-ode]
excerpt: "Noise prediction and score estimation are the same network in different units. Taking the step size to zero turns the whole method into a stochastic differential equation — and reveals a deterministic ODE with identical marginals hiding inside it."
author_profile: true
read_time: true
is_overview: false
icon: "🌫️"
read_mins: 5
permalink: /blog/diffusion/score-based-sde/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The score \(\nabla_{\mathbf{x}}\log p(\mathbf{x})\) can be estimated without ever touching the normalising constant, and for a Gaussian perturbation kernel the optimal estimator is exactly \(-\boldsymbol{\epsilon}_\theta/\sqrt{1-\bar{\alpha}_t}\) — so a DDPM already <em>is</em> a score model. Letting the step size go to zero makes the forward chain a stochastic differential equation, of which DDPM is the variance-preserving discretisation. Every SDE has an associated probability-flow ODE with the same marginals at every time, which buys deterministic sampling and exact likelihoods.
</div>

## Why the score, and not the density

Fitting a density means dealing with $$p_\theta(\mathbf{x}) = \tilde{p}_\theta(\mathbf{x})/Z_\theta$$, and the partition function $$Z_\theta = \int \tilde{p}_\theta$$ is an intractable integral over pixel space. The score sidesteps it entirely, because $$Z_\theta$$ does not depend on $$\mathbf{x}$$:

<div class="formula-box">
\[
\nabla_{\mathbf{x}}\log p_\theta(\mathbf{x}) = \nabla_{\mathbf{x}}\log\tilde{p}_\theta(\mathbf{x}) - \underbrace{\nabla_{\mathbf{x}}\log Z_\theta}_{=\,0}
\]
</div>

The score is a vector field pointing towards higher density — locally, the direction in which the image becomes more plausible. Knowing it everywhere is enough to sample, via **Langevin dynamics**:

<div class="formula-box">
\[
\mathbf{x}_{k+1} = \mathbf{x}_k + \tfrac{\delta}{2}\nabla_{\mathbf{x}}\log p(\mathbf{x}_k) + \sqrt{\delta}\,\mathbf{z}_k,
\qquad \mathbf{z}_k\sim\mathcal{N}(\mathbf{0},\mathbf{I})
\]
</div>

Gradient ascent on log-density, with injected noise that stops the chain from collapsing onto a mode; as $$\delta\to0$$ and $$k\to\infty$$ the iterates are distributed according to $$p$$.

Run naively this fails badly. Real data sits near a low-dimensional manifold, so $$\nabla\log p$$ is undefined off it and the estimate is unreliable anywhere the training data was sparse — which is almost everywhere the chain starts. Song & Ermon's fix was to estimate the score of *noised* versions of the data at many noise levels, and anneal from high noise to low. That is the same annealing structure as diffusion, arrived at from the other direction.

## The identity that connects the two views

Score matching in its plain form needs $$\nabla\log p$$ of the data, which we do not have. Denoising score matching replaces it with the score of a known perturbation kernel. For the diffusion kernel $$q(\mathbf{x}_t\mid\mathbf{x}_0) = \mathcal{N}(\sqrt{\bar{\alpha}_t}\mathbf{x}_0,\,(1-\bar{\alpha}_t)\mathbf{I})$$, that score is available in closed form:

<div class="formula-box">
\[
\nabla_{\mathbf{x}_t}\log q(\mathbf{x}_t\mid\mathbf{x}_0)
= -\frac{\mathbf{x}_t - \sqrt{\bar{\alpha}_t}\,\mathbf{x}_0}{1-\bar{\alpha}_t}
= -\frac{\sqrt{1-\bar{\alpha}_t}\,\boldsymbol{\epsilon}}{1-\bar{\alpha}_t}
= -\frac{\boldsymbol{\epsilon}}{\sqrt{1-\bar{\alpha}_t}}
\]
</div>

using $$\mathbf{x}_t = \sqrt{\bar{\alpha}_t}\mathbf{x}_0+\sqrt{1-\bar{\alpha}_t}\boldsymbol{\epsilon}$$ from the [forward process](/blog/diffusion/forward-process/). Vincent's theorem says that minimising $$\mathbb{E}\lVert s_\theta(\mathbf{x}_t) - \nabla_{\mathbf{x}_t}\log q(\mathbf{x}_t\mid\mathbf{x}_0)\rVert^2$$ over $$\mathbf{x}_0$$ as well as $$\mathbf{x}_t$$ yields the score of the *marginal*, because a squared-error minimiser is a conditional expectation: $$s_\theta^\star(\mathbf{x}_t) = \mathbb{E}\big[\nabla\log q(\mathbf{x}_t\mid\mathbf{x}_0)\ \big\vert\ \mathbf{x}_t\big] = \nabla_{\mathbf{x}_t}\log p_t(\mathbf{x}_t)$$.

The [DDPM objective](/blog/diffusion/ddpm-training/) is exactly this minimisation, in different units: $$\boldsymbol{\epsilon}_\theta^\star(\mathbf{x}_t,t) = \mathbb{E}[\boldsymbol{\epsilon}\mid\mathbf{x}_t]$$. Dividing by the constant $$-\sqrt{1-\bar{\alpha}_t}$$ gives

<div class="formula-box">
\[
\nabla_{\mathbf{x}_t}\log p_t(\mathbf{x}_t) = -\frac{\boldsymbol{\epsilon}_\theta(\mathbf{x}_t,t)}{\sqrt{1-\bar{\alpha}_t}}
\]
</div>

Not an analogy, an equality: a trained DDPM is a score network with a per-timestep rescaling folded into the loss weighting.

## Taking the step size to zero

Write $$\beta_i = \beta(t)\Delta t$$ with $$\Delta t = 1/N$$ and expand $$\sqrt{1-\beta_i}\approx 1-\beta_i/2$$. The forward update $$\mathbf{x}_i = \sqrt{1-\beta_i}\mathbf{x}_{i-1}+\sqrt{\beta_i}\mathbf{z}$$ becomes $$\mathbf{x}_i - \mathbf{x}_{i-1} \approx -\tfrac12\beta(t)\Delta t\,\mathbf{x}_{i-1} + \sqrt{\beta(t)\Delta t}\,\mathbf{z}$$, which is the Euler–Maruyama discretisation of

<div class="formula-box">
\[
\text{VP-SDE:}\quad d\mathbf{x} = -\tfrac12\beta(t)\,\mathbf{x}\,dt + \sqrt{\beta(t)}\,d\mathbf{w}
\qquad\qquad
\text{VE-SDE:}\quad d\mathbf{x} = \sqrt{\tfrac{d[\sigma^2(t)]}{dt}}\,d\mathbf{w}
\]
</div>

*Variance preserving* because the drift's contraction exactly cancels the injected noise, holding the marginal variance at 1 — the continuous statement of [why the shrink factor is needed](/blog/diffusion/forward-process/). DDPM's linear schedule with $$T=1000$$ corresponds to $$\beta(t) = 0.1 + t(20-0.1)$$ for $$t\in[0,1]$$, since $$1000\times10^{-4}=0.1$$ and $$1000\times0.02=20$$.

The VE-SDE has no drift at all: $$\mathbf{x}_t = \mathbf{x}_0 + \sigma(t)\mathbf{z}$$, with $$\sigma$$ growing geometrically over several orders of magnitude. This is the continuous limit of Song & Ermon's noise-conditional score networks, and it is where the two lineages meet — the same reverse-time machinery covers both.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="sde-title sde-desc" viewBox="0 0 640 180" style="max-width:640px;width:100%;height:auto">
  <title id="sde-title">Marginal variance against time for the variance-preserving and variance-exploding SDEs</title>
  <desc id="sde-desc">A log-scale plot of marginal variance from time 0 to 1. The variance-preserving curve (teal) is a flat horizontal line at variance 1 for the whole interval. The variance-exploding curve (orange) rises as a straight line on the log axis from 0.0001 at time 0 to about 2500 at time 1, corresponding to sigma growing geometrically from 0.01 to 50.</desc>
  <rect x="1" y="1" width="638" height="178" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="70" y1="26" x2="70" y2="150" stroke="#475569" stroke-width="1"/>
  <line x1="70" y1="150" x2="606" y2="150" stroke="#475569" stroke-width="1"/>
  <g font-size="9.5" fill="#475569" text-anchor="end">
    <text x="64" y="33">10⁴</text>
    <text x="64" y="63">10²</text>
    <text x="64" y="93">1</text>
    <text x="64" y="123">10⁻²</text>
    <text x="64" y="153">10⁻⁴</text>
  </g>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="70"  y="164">t = 0</text>
    <text x="338" y="164">0.5</text>
    <text x="600" y="164">t = 1</text>
  </g>
  <text x="22" y="88" text-anchor="middle" font-size="10" fill="#334155" transform="rotate(-90 22 88)">marginal variance</text>
  <line x1="70" y1="90" x2="600" y2="90" stroke="#0e7490" stroke-width="2.2"/>
  <line x1="70" y1="150" x2="600" y2="39" stroke="#c2410c" stroke-width="2.2"/>
  <text x="300" y="84" font-size="10.5" font-weight="700" fill="#0e7490">VP-SDE — variance pinned at 1</text>
  <text x="330" y="112" font-size="10.5" font-weight="700" fill="#c2410c">VE-SDE — σ: 0.01 → 50</text>
</svg>
<figcaption>Both processes end at a distribution that has forgotten the data, but by opposite routes. Notice that the VP prior is the fixed \(\mathcal{N}(\mathbf{0},\mathbf{I})\) regardless of the schedule, whereas the VE prior depends on \(\sigma_{\max}\) and must be large enough to swamp the data scale.</figcaption>
</figure>
</div>

## Reversing time, and the ODE hiding inside

Anderson's 1982 result gives the reverse-time process of any diffusion in closed form, and the only unknown in it is the score:

<div class="formula-box">
\[
d\mathbf{x} = \big[f(\mathbf{x},t) - g(t)^2\nabla_{\mathbf{x}}\log p_t(\mathbf{x})\big]dt + g(t)\,d\bar{\mathbf{w}}
\]
</div>

Substituting our estimator makes this simulable, and the DDPM sampler is one particular discretisation of it. But there is a second object with the same marginals — the **probability-flow ODE**, obtained by halving the score coefficient and deleting the noise:

<div class="formula-box">
\[
\frac{d\mathbf{x}}{dt} = f(\mathbf{x},t) - \tfrac12 g(t)^2\nabla_{\mathbf{x}}\log p_t(\mathbf{x})
\qquad\Longrightarrow\qquad
\frac{d\mathbf{x}}{dt} = -\tfrac12\beta(t)\left[\mathbf{x} - \frac{\boldsymbol{\epsilon}_\theta(\mathbf{x},t)}{\sqrt{1-\bar{\alpha}_t}}\right] \ \text{(VP)}
\]
</div>

The distributions $$p_t$$ match those of the SDE at every $$t$$; only the individual trajectories differ. Three things follow. Sampling becomes deterministic, so a latent $$\mathbf{x}_T$$ names one image and the map is invertible — the property [DDIM](/blog/diffusion/ddim/) exploits. Any black-box ODE solver applies, so adaptive higher-order methods can cut the step count. And because it is a continuous normalising flow, the instantaneous change-of-variables formula gives the *exact* likelihood, up to the divergence estimate:

<div class="formula-box">
\[
\log p_0(\mathbf{x}_0) = \log p_T(\mathbf{x}_T) + \int_0^T \nabla\!\cdot\!\left[f - \tfrac12 g^2 \nabla_{\mathbf{x}}\log p_t\right] dt
\]
</div>

with the divergence estimated by Hutchinson's trace trick. Unlike the ELBO this is not a bound.

<div class="insight-box">
  <strong>Key Insight — the model is the vector field, not the sampler:</strong> training gives a single object, the time-indexed score field. DDPM, DDIM, ancestral sampling, Heun and Runge–Kutta solvers, and likelihood evaluation are all read-outs of that one field. Nothing about the training objective privileges the stochastic reverse chain — it was simply the first discretisation anyone wrote down, and it is not the efficient one.
</div>

## References

1. Hyvärinen, A. [Estimation of Non-Normalized Statistical Models by Score Matching](https://jmlr.org/papers/v6/hyvarinen05a.html). *JMLR 2005*.
2. Vincent, P. A Connection Between Score Matching and Denoising Autoencoders. *Neural Computation*, 23(7), 2011.
3. Song, Y., & Ermon, S. [Generative Modeling by Estimating Gradients of the Data Distribution](https://arxiv.org/abs/1907.05600). *NeurIPS 2019*.
4. Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., & Poole, B. [Score-Based Generative Modeling through Stochastic Differential Equations](https://arxiv.org/abs/2011.13456). *ICLR 2021*.
5. Anderson, B. D. O. Reverse-Time Diffusion Equation Models. *Stochastic Processes and their Applications*, 12(3), 1982.
