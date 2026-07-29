---
layout: single
title: "Samplers and Schedulers: Diffusion Sampling Is Numerical Integration"
date: 2026-07-09
categories: [diffusion]
book: diffusion
subsection: efficiency
tags: [diffusion, samplers, ode-solvers, dpm-solver]
excerpt: "Once you see the reverse process as an ODE, the thousand-step sampling loop stops being a fact of life and becomes what it really is — a first-order solver with a terrible step size. Everything after that is numerical analysis."
author_profile: true
read_time: true
is_overview: false
icon: "⏱️"
read_mins: 6
permalink: /blog/diffusion/samplers-schedulers/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Sampling from a diffusion model means integrating a differential equation whose right-hand side is the trained network. DDPM's ancestral loop is a first-order stochastic solver; DDIM is first-order deterministic. Higher-order solvers (Heun) and exponential integrators that solve the equation's linear part exactly (DPM-Solver) cut the step count by roughly an order of magnitude with no retraining. The remaining lever is <em>where</em> you place those steps along the noise schedule, which at low step counts matters as much as the solver itself.
</div>

## The reverse process is an ODE

Song et al. showed the forward corruption is a stochastic differential equation \\(d\mathbf{x} = f(\mathbf{x},t)\,dt + g(t)\,d\mathbf{w}\\), and that it can be reversed in two ways. Either as an SDE,

<div class="formula-box">
\[
d\mathbf{x} = \bigl[f(\mathbf{x},t) - g(t)^2\,\nabla_{\mathbf{x}}\log p_t(\mathbf{x})\bigr]dt + g(t)\,d\bar{\mathbf{w}},
\]
</div>

or as a deterministic *probability-flow ODE* with the same marginals at every \\(t\\):

<div class="formula-box">
\[
\frac{d\mathbf{x}}{dt} = f(\mathbf{x},t) - \tfrac{1}{2}g(t)^2\,\nabla_{\mathbf{x}}\log p_t(\mathbf{x}).
\]
</div>

The score $$\nabla_{\mathbf{x}}\log p_t$$ is what the network supplies, up to the fixed rescaling $$\boldsymbol{\epsilon}_\theta = -\sqrt{1-\bar{\alpha}_t}\,\nabla_{\mathbf{x}}\log p_t$$. So a sampler is a choice of integrator, and the number of function evaluations (NFE) is the number of times the U-Net runs. The "1000 steps" of vanilla DDPM is not a property of the model; it is Euler's method with a very small step.

In Karras et al.'s cleaner variance-exploding coordinates, where $$\mathbf{x}_\sigma = \mathbf{x}_0 + \sigma\boldsymbol{\epsilon}$$ and $$D_\theta(\mathbf{x};\sigma)$$ is the denoiser's estimate of the clean image, the whole ODE collapses to

<div class="formula-box">
\[
\frac{d\mathbf{x}}{d\sigma} = \frac{\mathbf{x} - D_\theta(\mathbf{x};\sigma)}{\sigma}.
\]
</div>

Read it literally: at every noise level, move away from the current point in the direction of the denoised estimate, scaled by how noisy you currently are.

## Euler, Heun, and why order helps

Euler takes one derivative evaluation and steps along the tangent: $$\mathbf{x}_{i+1} = \mathbf{x}_i + (\sigma_{i+1}-\sigma_i)\,\mathbf{d}_i$$. Because the true trajectory curves, the tangent leaves it, and the error per step is \\(O(h^2)\\).

Heun's method corrects this. Take the Euler step to a provisional point, evaluate the derivative *there*, and re-step using the average of the two slopes. Two network calls per step, local error \\(O(h^3)\\). That trade is usually worth it: at a fixed NFE budget, halving the number of steps to double their accuracy wins once the steps are large.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="samp-title samp-desc" viewBox="0 0 640 210" style="max-width:640px;width:100%;height:auto">
  <title id="samp-title">Euler versus Heun on one large step of a curving trajectory</title>
  <desc id="samp-desc">A curving grey trajectory runs from a start point at the upper left down to a true endpoint at the lower right. A straight orange line from the start point follows the initial tangent and ends well above the true endpoint, labelled "Euler, one evaluation, overshoots". A teal line follows the average of the initial slope and the slope measured at the Euler point, and ends close to the true endpoint, labelled "Heun, two evaluations". A dashed grey line marks the remaining Euler error.</desc>
  <rect x="1" y="1" width="638" height="208" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <path d="M90,55 C 240,60 360,110 520,168" fill="none" stroke="#475569" stroke-width="2.4"/>
  <line x1="90" y1="55" x2="520" y2="100" stroke="#c2410c" stroke-width="1.8"/>
  <line x1="90" y1="55" x2="520" y2="158" stroke="#0e7490" stroke-width="1.8"/>
  <line x1="520" y1="100" x2="520" y2="168" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4 3"/>
  <circle cx="90" cy="55" r="5.5" fill="#334155"/>
  <circle cx="520" cy="168" r="5.5" fill="#334155"/>
  <circle cx="520" cy="100" r="5" fill="#c2410c"/>
  <circle cx="520" cy="158" r="5" fill="#0e7490"/>
  <g font-size="10" fill="#334155">
    <text x="82" y="42">σ = σᵢ (start)</text>
    <text x="440" y="192">σ = σᵢ₊₁ (target)</text>
  </g>
  <g font-size="10">
    <text x="300" y="72" fill="#c2410c">Euler: 1 evaluation, follows the initial tangent</text>
    <text x="250" y="136" fill="#0e7490">Heun: 2 evaluations, averages both slopes</text>
    <text x="300" y="120" fill="#475569">true trajectory</text>
    <text x="532" y="136" fill="#475569">error</text>
  </g>
  <text x="320" y="26" text-anchor="middle" font-size="11.5" font-weight="700" fill="#334155">One step of the probability-flow ODE</text>
</svg>
<figcaption>Notice that the extra cost of Heun buys accuracy only because the trajectory is curved. On a nearly straight path — the goal of rectified flow — the two coincide and the second evaluation is wasted.</figcaption>
</figure>
</div>

## DPM-Solver: solve the easy part exactly

The diffusion ODE is not a generic black box. Written in terms of \\(\alpha_t\\) and \\(\sigma_t\\), it is *semi-linear*: a linear term in \\(\mathbf{x}\\) plus a nonlinear term that is entirely the network. Variation of constants handles the linear part in closed form, leaving one integral to approximate. With the half-log-SNR variable \\(\lambda_t = \log(\alpha_t/\sigma_t)\\),

<div class="formula-box">
\[
\mathbf{x}_t = \frac{\alpha_t}{\alpha_s}\,\mathbf{x}_s \;-\; \alpha_t\!\int_{\lambda_s}^{\lambda_t} e^{-\lambda}\,\hat{\boldsymbol{\epsilon}}_\theta(\hat{\mathbf{x}}_\lambda,\lambda)\,d\lambda .
\]
</div>

<div class="insight-box">
  <strong>Key Insight — where the speed-up comes from:</strong> a general-purpose solver like Euler discretises the whole right-hand side, so it accumulates error from the stiff linear term as well as from the network. The exponential-integrator view moves that term out of the discretisation entirely — it is integrated exactly — so the only approximation left is a low-order Taylor expansion of \(\hat{\boldsymbol{\epsilon}}_\theta\) in \(\lambda\), which is a smooth, slowly varying function. Truncating it at first order recovers DDIM exactly; at second and third order you get DPM-Solver-2 and -3.
</div>

## Ancestral or deterministic

Integrating the SDE means adding fresh noise at every step; integrating the ODE means not. The stochastic variants (DDPM ancestral, "Euler a", DPM++ SDE) have a genuine benefit Karras et al. identified: injected noise acts as error correction, dragging the sample back towards the correct marginal after solver drift. The cost is that the seed no longer determines the image — change the step count and you get a different picture — and at high step counts the churn can erase fine detail.

Deterministic samplers give a fixed, invertible-ish map from noise to image, which is what makes latent interpolation, inversion and reproducible seeds work at all.

| Sampler | Order | NFE per step | Noise injected | Typical step count |
|---|---|---|---|---|
| DDPM (ancestral) | 1 | 1 | yes | several hundred |
| DDIM | 1 | 1 | no | 20–50 |
| Euler | 1 | 1 | no | 20–50 |
| Euler ancestral | 1 | 1 | yes | 20–40 |
| Heun (EDM) | 2 | 2 | optional | 15–30 steps |
| DPM-Solver-2 | 2 | 2 | no | 15–25 |
| DPM-Solver++ (2M, multistep) | 2 | 1 | no | 15–25 |
| UniPC | 2–3 | 1 | no | 10–20 |

Step counts here are the ranges people reach for in practice, not measured equal-quality points; the honest comparison is always at matched NFE on your own model.

## The schedule is half the sampler

A sampler needs a list of noise levels, and spacing them uniformly in \\(t\\) is a poor choice: it wastes evaluations at high \\(\sigma\\), where the trajectory is nearly straight, and starves the low-\\(\sigma\\) region where detail is decided. Karras et al. propose

<div class="formula-box">
\[
\sigma_i = \left(\sigma_{\max}^{1/\rho} + \frac{i}{N-1}\left(\sigma_{\min}^{1/\rho} - \sigma_{\max}^{1/\rho}\right)\right)^{\rho}, \qquad \rho = 7,
\]
</div>

which concentrates steps at low noise. At 50 steps the choice barely registers; at 10 it can dominate the choice of solver.

<div class="warning-box">
  <strong>Where it breaks:</strong> solver order assumes a smooth right-hand side, and high <a href="/blog/diffusion/classifier-free-guidance/">classifier-free guidance</a> makes the effective field stiff — a second-order solver at 10 steps and guidance 12 can be worse than first order. Also, a model trained on 1000 discrete timesteps has only been asked about those inputs; a continuous-\(\sigma\) solver silently interpolates, which is fine near the training grid and not guaranteed away from it.
</div>

Solvers get you to roughly 10–20 evaluations. Below that, no integrator helps, because the trajectory genuinely is curved — you have to change the model, which is what [distillation and consistency models](/blog/diffusion/distillation-consistency/) do.

## References

1. Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., & Poole, B. [Score-Based Generative Modeling through Stochastic Differential Equations](https://arxiv.org/abs/2011.13456). *ICLR 2021*.
2. Song, J., Meng, C., & Ermon, S. [Denoising Diffusion Implicit Models](https://arxiv.org/abs/2010.02502). *ICLR 2021*.
3. Lu, C., Zhou, Y., Bao, F., Chen, J., Li, C., & Zhu, J. [DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps](https://arxiv.org/abs/2206.00927). *NeurIPS 2022*.
4. Karras, T., Aittala, M., Aila, T., & Laine, S. [Elucidating the Design Space of Diffusion-Based Generative Models](https://arxiv.org/abs/2206.00364). *NeurIPS 2022*.
5. Zhao, W., Bai, L., Rao, Y., Zhou, J., & Lu, J. [UniPC: A Unified Predictor-Corrector Framework for Fast Sampling of Diffusion Models](https://arxiv.org/abs/2302.04867). *NeurIPS 2023*.
