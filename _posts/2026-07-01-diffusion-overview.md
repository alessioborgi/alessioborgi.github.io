---
layout: single
title: "Diffusion Models: Learning to Undo Noise"
date: 2026-07-01
categories: [diffusion]
book: diffusion
subsection: foundations
tags: [diffusion, generative-models, ddpm, overview]
excerpt: "Destroying an image is easy and needs no learning at all. Diffusion models exploit that asymmetry: they define a trivial forward corruption, then train a network to walk it backwards one small step at a time."
author_profile: true
read_time: true
is_overview: true
icon: "🌫️"
read_mins: 5
permalink: /blog/diffusion/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Adding Gaussian noise to an image requires no learning. Diffusion models turn that free, known corruption into a training signal: run it forward until the image is pure noise, then train a network to reverse one step at a time. Sampling starts from noise and walks back. The whole method rests on one fact — for small enough steps, the reverse of a Gaussian corruption is itself approximately Gaussian, so the network only ever has to predict a mean.
</div>

## The asymmetry the method exploits

Generative modelling is hard because a good image is a vanishingly small target in a space of millions of pixels. Diffusion sidesteps the difficulty with a trick: instead of learning to *build* an image in one leap, learn to *undo* a corruption you designed yourself.

Destroying structure is easy. Add a little Gaussian noise, repeat a thousand times, and any image becomes indistinguishable from static. Nothing is learned in that direction — the corruption is a fixed, known process. All the learning goes into the reverse.

## The forward process

Fix a variance schedule \\(\beta_1, \dots, \beta_T\\) with small positive values. Each step slightly shrinks the image and adds noise:

<div class="formula-box">
\[
q(\mathbf{x}_t \mid \mathbf{x}_{t-1}) = \mathcal{N}\!\left(\mathbf{x}_t;\ \sqrt{1-\beta_t}\,\mathbf{x}_{t-1},\ \beta_t \mathbf{I}\right)
\]
</div>

The shrink factor \\(\sqrt{1-\beta_t}\\) matters: without it the variance would grow without bound. With it, the process converges to a standard Gaussian regardless of where it started.

Because Gaussians compose, you never have to simulate the chain. Writing $$\alpha_t = 1-\beta_t$$ and $$\bar{\alpha}_t = \prod_{s \le t}\alpha_s$$, any step is reachable in closed form:

<div class="formula-box">
\[
\mathbf{x}_t = \sqrt{\bar{\alpha}_t}\,\mathbf{x}_0 + \sqrt{1-\bar{\alpha}_t}\,\boldsymbol{\epsilon},
\qquad \boldsymbol{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I})
\]
</div>

This is what makes training cheap. To get a batch at timestep \\(t\\), sample \\(t\\) at random, sample one noise vector, and apply the line above — no thousand-step simulation required.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="fwd-title fwd-desc" viewBox="0 0 640 150" style="max-width:640px;width:100%;height:auto">
  <title id="fwd-title">The forward and reverse diffusion processes</title>
  <desc id="fwd-desc">A row of five panels running from a clean image at the left to pure noise at the right. Arrows along the top, labelled q, point rightwards and are marked "fixed, no learning". Arrows along the bottom, labelled p-theta, point leftwards and are marked "learned". The signal-to-noise ratio falls from left to right.</desc>
  <rect x="1" y="1" width="638" height="148" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g>
    <rect x="30"  y="52" width="72" height="52" rx="4" fill="#0e7490"/>
    <rect x="160" y="52" width="72" height="52" rx="4" fill="#3d8ba6"/>
    <rect x="290" y="52" width="72" height="52" rx="4" fill="#7aa8b8"/>
    <rect x="420" y="52" width="72" height="52" rx="4" fill="#adbcc4"/>
    <rect x="550" y="52" width="72" height="52" rx="4" fill="#cbd5e1"/>
  </g>
  <g font-size="11" fill="#334155" text-anchor="middle">
    <text x="66"  y="120">x₀ (data)</text>
    <text x="196" y="120">x₁</text>
    <text x="326" y="120">x_t</text>
    <text x="456" y="120">x_{T-1}</text>
    <text x="586" y="120">x_T (noise)</text>
  </g>
  <g stroke="#c2410c" stroke-width="1.6" fill="none" marker-end="url(#arrF)">
    <line x1="106" y1="42" x2="156" y2="42"/><line x1="236" y1="42" x2="286" y2="42"/>
    <line x1="366" y1="42" x2="416" y2="42"/><line x1="496" y1="42" x2="546" y2="42"/>
  </g>
  <g stroke="#0e7490" stroke-width="1.6" fill="none" marker-end="url(#arrR)">
    <line x1="156" y1="116" x2="106" y2="116"/><line x1="286" y1="116" x2="236" y2="116"/>
    <line x1="416" y1="116" x2="366" y2="116"/><line x1="546" y1="116" x2="496" y2="116"/>
  </g>
  <defs>
    <marker id="arrF" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#c2410c"/></marker>
    <marker id="arrR" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#0e7490"/></marker>
  </defs>
  <text x="320" y="26" text-anchor="middle" font-size="11.5" font-weight="700" fill="#c2410c">q(xₜ | xₜ₋₁) — fixed, nothing learned</text>
  <text x="320" y="142" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0e7490">p_θ(xₜ₋₁ | xₜ) — learned</text>
</svg>
<figcaption>The forward chain (top, orange) is a fixed Gaussian corruption that needs no training. All model capacity goes into the reverse chain (bottom, teal). Notice the asymmetry: the hard direction is the one that has to be learned.</figcaption>
</figure>
</div>

## Why the reverse is tractable

Reversing an arbitrary corruption would be hopeless. The saving fact is that when \\(\beta_t\\) is small, the true reverse conditional $$q(\mathbf{x}_{t-1}\mid\mathbf{x}_t)$$ is itself approximately Gaussian. So the model only has to predict its mean:

<div class="formula-box">
\[
p_\theta(\mathbf{x}_{t-1} \mid \mathbf{x}_t) = \mathcal{N}\!\left(\mathbf{x}_{t-1};\ \boldsymbol{\mu}_\theta(\mathbf{x}_t, t),\ \sigma_t^2 \mathbf{I}\right)
\]
</div>

This is the whole reason the step size has to be small and \\(T\\) large. Take steps that are too big and the reverse conditional stops being Gaussian, and a network that predicts a single mean can no longer represent it.

## The objective collapses to noise prediction

Ho et al. (2020) showed that the variational bound on the likelihood, after reparameterisation and dropping weighting terms, reduces to something strikingly plain — predict the noise that was added:

<div class="formula-box">
\[
\mathcal{L}_{\text{simple}} = \mathbb{E}_{t,\ \mathbf{x}_0,\ \boldsymbol{\epsilon}}
\left[\ \left\lVert \boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta\!\left(\sqrt{\bar{\alpha}_t}\mathbf{x}_0 + \sqrt{1-\bar{\alpha}_t}\boldsymbol{\epsilon},\ t\right) \right\rVert^2\ \right]
\]
</div>

It is a mean-squared error. The network sees a noisy image and a timestep, and guesses which noise vector produced it. That is the entire training loop.

<div class="insight-box">
  <strong>Key Insight — why noise prediction is enough:</strong> predicting \(\boldsymbol{\epsilon}\) is equivalent, up to a fixed rescaling, to predicting the <em>score</em> \(\nabla_{\mathbf{x}}\log p_t(\mathbf{x})\) — the direction in which the data density increases fastest. Concretely, \(\nabla_{\mathbf{x}_t}\log p_t(\mathbf{x}_t) = -\boldsymbol{\epsilon}_\theta(\mathbf{x}_t,t)/\sqrt{1-\bar{\alpha}_t}\). Sampling is then gradient ascent on log-density with noise injected, which is why the score-based and denoising views of diffusion are the same method in different coordinates.
</div>

## A concrete pass

Take a single \\(64\times64\\) image and \\(T = 1000\\) with a linear \\(\beta\\) schedule from \\(10^{-4}\\) to \\(0.02\\).

| Step | What happens |
|---|---|
| Sample \\(t = 400\\) | $$\bar{\alpha}_{400} \approx 0.195$$ |
| Build the input | $$\mathbf{x}_{400} = 0.44\,\mathbf{x}_0 + 0.90\,\boldsymbol{\epsilon}$$ — mostly noise, coarse shapes survive |
| Network predicts | $$\boldsymbol{\epsilon}_\theta(\mathbf{x}_{400}, 400)$$ |
| Loss | squared error against the \\(\boldsymbol{\epsilon}\\) actually drawn |

At \\(t = 50\\), \\(\bar{\alpha}\approx 0.97\\) and the image is nearly clean, so the network is learning fine texture. At \\(t = 900\\) it is nearly pure noise and the network can only recover global layout. One network handles the whole range, conditioned on \\(t\\) — which is why the timestep embedding matters as much as the architecture.

## What this buys, and what it costs

Diffusion trains stably — it is a regression problem, with none of the adversarial balance that makes GANs fragile — and it covers modes well, because the objective is likelihood-based rather than a minimax game. The cost is sampling: a thousand sequential network evaluations to produce one image.

Almost everything that followed attacks that cost or that control problem: [DDIM](/blog/diffusion/ddim/) makes sampling deterministic and short, [latent diffusion](/blog/diffusion/latent-diffusion/) moves the process into a compressed space, [classifier-free guidance](/blog/diffusion/classifier-free-guidance/) buys controllability, and [flow matching](/blog/diffusion/flow-matching/) rebuilds the whole thing around straight paths instead of stochastic ones.

## References

1. Sohl-Dickstein, J., Weiss, E., Maheswaranathan, N., & Ganguli, S. [Deep Unsupervised Learning using Nonequilibrium Thermodynamics](https://arxiv.org/abs/1503.03585). *ICML 2015*.
2. Ho, J., Jain, A., & Abbeel, P. [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239). *NeurIPS 2020*.
3. Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., & Poole, B. [Score-Based Generative Modeling through Stochastic Differential Equations](https://arxiv.org/abs/2011.13456). *ICLR 2021*.
