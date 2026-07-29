---
layout: single
title: "DDPM Training: From a Variational Bound to Four Lines of PyTorch"
date: 2026-07-04
categories: [diffusion]
book: diffusion
subsection: foundations
tags: [diffusion, ddpm, elbo, training]
excerpt: "The DDPM objective starts as a variational bound with T+1 KL terms and ends as a plain mean-squared error on noise. Following the collapse shows why the discarded weighting term is not an approximation you tolerate but a reweighting that improves samples."
author_profile: true
read_time: true
is_overview: false
icon: "🌫️"
read_mins: 5
permalink: /blog/diffusion/ddpm-training/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The ELBO for a diffusion model decomposes into one constant, one reconstruction term, and \(T-1\) KL divergences between Gaussians — each of which reduces to a squared distance between two means. Substituting the \(\boldsymbol{\epsilon}\)-parameterisation turns each into \(w_t\lVert\boldsymbol{\epsilon}-\boldsymbol{\epsilon}_\theta\rVert^2\) with a known weight. Setting every \(w_t = 1\) gives \(\mathcal{L}_{\text{simple}}\), which is no longer a bound on likelihood but produces better samples, because the original weights concentrate almost all mass on the easiest timesteps.
</div>

## The bound and what it decomposes into

The marginal likelihood $$p_\theta(\mathbf{x}_0)$$ integrates over every trajectory, so we bound it in the usual variational way, using the fixed [forward process](/blog/diffusion/forward-process/) $$q$$ as the proposal:

<div class="formula-box">
\[
-\log p_\theta(\mathbf{x}_0) \le \mathbb{E}_q\!\left[-\log\frac{p_\theta(\mathbf{x}_{0:T})}{q(\mathbf{x}_{1:T}\mid\mathbf{x}_0)}\right] = \mathcal{L}
\]
</div>

Written naively this is a single expectation over a thousand-step trajectory, which would have hopeless variance. The move that saves it is to rewrite $$q(\mathbf{x}_t\mid\mathbf{x}_{t-1}) = q(\mathbf{x}_{t-1}\mid\mathbf{x}_t,\mathbf{x}_0)\,q(\mathbf{x}_t\mid\mathbf{x}_0)/q(\mathbf{x}_{t-1}\mid\mathbf{x}_0)$$, so that the product telescopes and $$\mathcal{L}$$ becomes a sum of per-step KL divergences:

<div class="formula-box">
\[
\mathcal{L} = \underbrace{D_{\mathrm{KL}}\!\big(q(\mathbf{x}_T\mid\mathbf{x}_0)\,\|\,p(\mathbf{x}_T)\big)}_{\mathcal{L}_T}
+ \sum_{t=2}^{T}\underbrace{D_{\mathrm{KL}}\!\big(q(\mathbf{x}_{t-1}\mid\mathbf{x}_t,\mathbf{x}_0)\,\|\,p_\theta(\mathbf{x}_{t-1}\mid\mathbf{x}_t)\big)}_{\mathcal{L}_{t-1}}
\underbrace{-\log p_\theta(\mathbf{x}_0\mid\mathbf{x}_1)}_{\mathcal{L}_0}
\]
</div>

$$\mathcal{L}_T$$ contains no parameters at all — the forward process is fixed and the prior is fixed — so it is a constant, small if the schedule ends near $$\bar{\alpha}_T \approx 0$$. $$\mathcal{L}_0$$ is a discretised likelihood on the final step. Everything trainable sits in the middle sum, and every term there is a KL between two Gaussians with the same fixed covariance $$\sigma_t^2\mathbf{I}$$, which is just a scaled squared distance between means:

<div class="formula-box">
\[
\mathcal{L}_{t-1} = \mathbb{E}_q\left[\frac{1}{2\sigma_t^2}\big\lVert \tilde{\boldsymbol{\mu}}_t(\mathbf{x}_t,\mathbf{x}_0) - \boldsymbol{\mu}_\theta(\mathbf{x}_t,t)\big\rVert^2\right] + \text{const}
\]
</div>

There is no Monte Carlo over trajectories left: the [closed-form posterior](/blog/diffusion/reverse-process/) supplies the target directly.

## The substitution that collapses it

Both means share the same functional form. Using $$\tilde{\boldsymbol{\mu}}_t = \frac{1}{\sqrt{\alpha_t}}\big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}}\boldsymbol{\epsilon}\big)$$ and parameterising the model identically with $$\boldsymbol{\epsilon}_\theta$$ in place of $$\boldsymbol{\epsilon}$$, the $$\mathbf{x}_t$$ terms cancel exactly and only the noise difference survives:

<div class="formula-box">
\[
\tilde{\boldsymbol{\mu}}_t - \boldsymbol{\mu}_\theta = \frac{1}{\sqrt{\alpha_t}}\cdot\frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}}\big(\boldsymbol{\epsilon}_\theta - \boldsymbol{\epsilon}\big)
\qquad\Longrightarrow\qquad
\mathcal{L}_{t-1} = \mathbb{E}\left[\frac{\beta_t^2}{2\sigma_t^2\,\alpha_t\,(1-\bar{\alpha}_t)}\big\lVert\boldsymbol{\epsilon}-\boldsymbol{\epsilon}_\theta(\mathbf{x}_t,t)\big\rVert^2\right]
\]
</div>

A variational bound over a thousand-step latent-variable chain has become a weighted regression on noise. The weight $$w_t = \beta_t^2/\big(2\sigma_t^2\alpha_t(1-\bar{\alpha}_t)\big)$$ is a known scalar; nothing about it involves the network.

## Why throwing the weight away helps

Ho et al. train instead on

<div class="formula-box">
\[
\mathcal{L}_{\text{simple}} = \mathbb{E}_{t\sim\mathcal{U}\{1,T\},\ \mathbf{x}_0,\ \boldsymbol{\epsilon}}
\left[\big\lVert\boldsymbol{\epsilon}-\boldsymbol{\epsilon}_\theta(\sqrt{\bar{\alpha}_t}\mathbf{x}_0+\sqrt{1-\bar{\alpha}_t}\boldsymbol{\epsilon},\ t)\big\rVert^2\right]
\]
</div>

This is not a bound on the likelihood any more, and it is not an approximation made for convenience — the samples are better. The reason is visible in $$w_t$$. Take $$\sigma_t^2 = \beta_t$$, so $$w_t = \beta_t/\big(2\alpha_t(1-\bar{\alpha}_t)\big)$$. On the linear schedule at $$t=1$$, $$\beta_1 = 10^{-4}$$ and $$1-\bar{\alpha}_1 = 10^{-4}$$, giving $$w_1 \approx 0.5$$. At $$t = 500$$, $$\beta_t \approx 0.01$$ and $$1-\bar{\alpha}_t \approx 0.921$$, giving $$w_{500}\approx 0.0055$$ — roughly ninety times smaller. At $$t=1000$$, $$w_t \approx 0.0102$$.

So the ELBO weighting pours most of its gradient into the smallest timesteps, where the input is almost clean and the task is imperceptible high-frequency denoising. Those terms matter enormously for log-likelihood — they are where the last fractions of a bit live — and barely at all for whether the image looks right. Uniform weighting redirects capacity to moderate and large $$t$$, where global structure is decided.

<div class="insight-box">
  <strong>Key Insight — likelihood and perceptual quality want opposite weightings:</strong> \(\mathcal{L}_{\text{simple}}\) is an implicit reweighting of the ELBO towards high-noise timesteps. This is the same trade-off that later work makes explicit: Nichol &amp; Dhariwal recover likelihood by optimising the true bound on a learned variance while keeping \(\mathcal{L}_{\text{simple}}\) for the mean, and Karras et al. treat the weighting and the timestep sampling density as separate design knobs to be tuned rather than derived. There is no single weighting that is best for both objectives.
</div>

## The loop

Because $$\mathbf{x}_t$$ is available in one shot, training never simulates the chain:

```python
for x0 in loader:                                  # x0: (B, C, H, W), roughly in [-1, 1]
    t   = torch.randint(0, T, (x0.size(0),), device=x0.device)
    eps = torch.randn_like(x0)
    a   = alpha_bar[t].view(-1, 1, 1, 1)           # precomputed cumulative product
    xt  = a.sqrt() * x0 + (1 - a).sqrt() * eps     # the closed-form jump
    loss = F.mse_loss(model(xt, t), eps)           # that is the whole objective
    loss.backward(); opt.step(); opt.zero_grad()
```

Four substantive lines. There is no discriminator, no sampling inside the loop, no adversarial balance to maintain — the reason diffusion training is famously hard to destabilise.

## One network, a thousand noise levels

The `t` argument is doing real work. The denoising problem at $$t=50$$ ($$\bar{\alpha}\approx 0.97$$, fine texture) and at $$t=900$$ ($$\bar{\alpha}\approx 0.0003$$, global layout only) are different tasks that happen to share a distribution over images. Training $$T$$ separate networks is infeasible; conditioning one network on $$t$$ lets neighbouring noise levels share almost everything, and the schedule is smooth so that sharing is warranted.

The standard mechanism borrows sinusoidal positional encoding: map the integer $$t$$ to $$\big[\sin(t\omega_k),\cos(t\omega_k)\big]_k$$ with geometrically spaced frequencies, push it through a two-layer MLP, and inject the result into every residual block as a per-channel additive shift (often a scale as well, FiLM-style). Frequency features matter here — a scalar input would force the network to learn a fine partition of a one-dimensional range from scratch, and the highest-frequency components are what let it distinguish $$t=500$$ from $$t=505$$.

An empirical detail: at sampling time the network is evaluated at timesteps drawn from a subsampled schedule, which may include values never seen in training. Sinusoidal embeddings interpolate smoothly, which is part of why [DDIM](/blog/diffusion/ddim/) can subsample an existing model's schedule without retraining.

## References

1. Ho, J., Jain, A., & Abbeel, P. [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239). *NeurIPS 2020*.
2. Nichol, A., & Dhariwal, P. [Improved Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2102.09672). *ICML 2021*.
3. Kingma, D. P., Salimans, T., Poole, B., & Ho, J. [Variational Diffusion Models](https://arxiv.org/abs/2107.00630). *NeurIPS 2021*.
4. Karras, T., Aittala, M., Aila, T., & Laine, S. [Elucidating the Design Space of Diffusion-Based Generative Models](https://arxiv.org/abs/2206.00364). *NeurIPS 2022*.
