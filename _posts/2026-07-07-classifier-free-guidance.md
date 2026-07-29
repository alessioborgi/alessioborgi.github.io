---
layout: single
title: "Classifier-Free Guidance: Buying Prompt Adherence with a Second Forward Pass"
date: 2026-07-07
categories: [diffusion]
book: diffusion
subsection: control
tags: [diffusion, guidance, conditioning, sampling]
excerpt: "Conditioning a diffusion model on a prompt is easy; making it actually obey the prompt is not. Classifier-free guidance fixes that by training one network to do two jobs and then extrapolating between its own answers."
author_profile: true
read_time: true
is_overview: false
icon: "🎚️"
read_mins: 6
permalink: /blog/diffusion/classifier-free-guidance/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A conditional diffusion model trained the obvious way treats the prompt as a weak hint. Classifier guidance sharpened it, but needed a separate classifier trained on noisy images. Classifier-free guidance removes that classifier by training a single network on both the conditional and unconditional task — drop the condition on roughly 10% of examples — and then extrapolating past the conditional prediction at sampling time. The guidance weight \(w\) is a dial from "diverse and vague" to "on-prompt and samey", and turning it up means you are no longer sampling from the true conditional distribution.
</div>

## Conditioning is not control

Feeding a text embedding into the denoiser gives you $$\epsilon_\theta(\mathbf{x}_t, t, c)$$, a model of \\(p(\mathbf{x}\mid c)\\). Trained this way it works, but weakly: the prompt nudges the sample rather than governing it. The reason is that the training loss rewards covering the data, and the conditional and unconditional distributions of natural images overlap heavily. A model can score well while largely ignoring \\(c\\).

What users want is not a sample from \\(p(\mathbf{x}\mid c)\\). They want a sample from the part of \\(p(\mathbf{x}\mid c)\\) where the prompt is *unambiguously* satisfied — a sharpened, mode-seeking version of it.

## Classifier guidance, and why it was awkward

Dhariwal and Nichol's answer was to attach an explicit classifier $$p_\phi(c \mid \mathbf{x}_t)$$ and push the sample uphill on it. Because $$\boldsymbol{\epsilon}_\theta = -\sqrt{1-\bar{\alpha}_t}\,\nabla_{\mathbf{x}_t}\log p_t(\mathbf{x}_t)$$, Bayes' rule in score space becomes a simple additive correction on the predicted noise:

<div class="formula-box">
\[
\hat{\boldsymbol{\epsilon}} = \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t) \;-\; s\,\sqrt{1-\bar{\alpha}_t}\;\nabla_{\mathbf{x}_t}\log p_\phi(c \mid \mathbf{x}_t)
\]
</div>

Here \\(s\\) is the guidance scale and $$\bar{\alpha}_t$$ the cumulative signal coefficient of the forward process. The correction says: move in the direction that increases the classifier's confidence in \\(c\\).

The awkwardness is the classifier itself. It has to accept $$\mathbf{x}_t$$, not a clean image, so an off-the-shelf ImageNet classifier is useless — you must train a bespoke one on noisy inputs across all timesteps. That is a second model, a second training pipeline and a second failure mode. Worse, gradients of a classifier on near-pure noise are exactly the adversarial-example regime: the classifier can be made confident by perturbations that do not correspond to real image structure. And for free-form text there is no classifier to train in the first place.

## The trick: be your own classifier

Ho and Salimans noticed the correction never needed a classifier explicitly. Applying Bayes' rule the other way,

<div class="formula-box">
\[
\nabla_{\mathbf{x}_t}\log p(c \mid \mathbf{x}_t) = \nabla_{\mathbf{x}_t}\log p(\mathbf{x}_t \mid c) - \nabla_{\mathbf{x}_t}\log p(\mathbf{x}_t)
\]
</div>

so the classifier gradient is the *difference between two scores the diffusion model can already produce*, provided it can also run unconditionally. Getting that for free costs one line in the data loader: during training, replace \\(c\\) with a null token \\(\varnothing\\) with probability around 10%. One network, one loss, two behaviours.

At sampling time, substitute and rearrange, and the guided noise prediction is a straight-line extrapolation:

<div class="formula-box">
\[
\tilde{\boldsymbol{\epsilon}} = \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, \varnothing) \;+\; w\,\bigl(\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, c) - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, \varnothing)\bigr)
\]
</div>

Read it as a lever. At \\(w = 0\\) you get the unconditional model and the prompt is ignored. At \\(w = 1\\) the two terms cancel to $$\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, c)$$ — ordinary conditional sampling. At \\(w > 1\\) you overshoot *past* the conditional prediction, along the direction that distinguishes "with prompt" from "without prompt". Typical text-to-image settings sit between 5 and 10. (Some papers write $$\tilde{\boldsymbol{\epsilon}} = (1+s)\boldsymbol{\epsilon}_c - s\,\boldsymbol{\epsilon}_\varnothing$$; that is the same equation with \\(w = 1+s\\).)

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="cfg-title cfg-desc" viewBox="0 0 640 190" style="max-width:640px;width:100%;height:auto">
  <title id="cfg-title">Guidance as extrapolation along the conditional–unconditional difference</title>
  <desc id="cfg-desc">A horizontal axis in noise-prediction space. A point at the left is labelled epsilon with the null condition, at guidance weight 0. A point in the middle is labelled epsilon conditioned on c, at guidance weight 1. The arrow continues past it to a third point labelled guided epsilon at weight 7.5, which lies six and a half difference-lengths beyond the conditional point. A bracket under the first two points is labelled "the difference the prompt makes", and a bracket under the extrapolated region is labelled "extrapolation: off-distribution".</desc>
  <rect x="1" y="1" width="638" height="188" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="60" y1="80" x2="600" y2="80" stroke="#334155" stroke-width="1.4" marker-end="url(#cfgArr)"/>
  <defs>
    <marker id="cfgArr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#334155"/></marker>
  </defs>
  <circle cx="90" cy="80" r="6" fill="#475569"/>
  <circle cx="200" cy="80" r="6" fill="#0e7490"/>
  <circle cx="530" cy="80" r="7" fill="#c2410c"/>
  <g font-size="10.5" fill="#334155" text-anchor="middle">
    <text x="90"  y="66">w = 0</text>
    <text x="200" y="66">w = 1</text>
    <text x="530" y="62">w = 7.5</text>
  </g>
  <g font-size="10.5" text-anchor="middle">
    <text x="90"  y="106" fill="#475569">ε(x, ∅)</text>
    <text x="200" y="106" fill="#0e7490">ε(x, c)</text>
    <text x="530" y="106" fill="#c2410c">guided ε</text>
  </g>
  <path d="M90,124 L90,132 L200,132 L200,124" fill="none" stroke="#0e7490" stroke-width="1.3"/>
  <text x="145" y="148" text-anchor="middle" font-size="10" fill="#0e7490">the difference the prompt makes</text>
  <path d="M200,124 L200,160 L530,160 L530,124" fill="none" stroke="#c2410c" stroke-width="1.3"/>
  <text x="365" y="176" text-anchor="middle" font-size="10" fill="#c2410c">extrapolation — no data ever lived here</text>
  <text x="320" y="26" text-anchor="middle" font-size="11.5" font-weight="700" fill="#334155">Noise-prediction space at a fixed timestep</text>
</svg>
<figcaption>Notice that the useful setting is not between the two model outputs but far beyond one of them. Guidance is extrapolation, not interpolation, which is exactly why it degrades sample statistics as \(w\) grows.</figcaption>
</figure>
</div>

<div class="insight-box">
  <strong>Key Insight — what distribution you are actually sampling:</strong> converting the guided prediction back into a score gives \(\tilde{s} = \nabla\log p(\mathbf{x}) + w\,\nabla\log p(c\mid\mathbf{x})\), which is the score of \(p(\mathbf{x})\,p(c\mid\mathbf{x})^{w}\), not of \(p(\mathbf{x}\mid c)\). For \(w>1\) the likelihood term is raised to a power greater than one, so the density is sharpened around whatever the model finds most prompt-like. Guidance is deliberate, controlled bias. It is also not exact even as a sampler for that tilted density, because the sequence of tilted marginals is not the forward diffusion of any single distribution.
</div>

## The trade-off, stated honestly

| Guidance weight | Prompt adherence | Diversity | Typical artefacts |
|---|---|---|---|
| \\(w = 1\\) | loose; prompt often partially ignored | highest | washed-out, generic compositions |
| \\(w \approx 3\\) | reliable on the main subject | good | mild |
| \\(w \approx 7\\) | strong, including attributes | noticeably reduced | rising saturation and contrast |
| \\(w \ge 15\\) | over-literal | collapses towards one composition | blown-out colours, cartoon edges, clipping |

Two costs are unavoidable. The first is compute: every sampling step needs both a conditional and an unconditional forward pass, so sampling is about twice as expensive per step (batching the two halves together hides the latency, not the FLOPs). The second is the saturation blow-up. Extrapolating in \\(\boldsymbol{\epsilon}\\)-space pushes the implied clean image $$\hat{\mathbf{x}}_0$$ outside the valid pixel range, and the errors compound over steps. Imagen's dynamic thresholding — rescaling $$\hat{\mathbf{x}}_0$$ by a per-step percentile rather than hard-clipping it — is the standard patch, and it is what makes very high guidance weights usable at all.

<div class="warning-box">
  <strong>Where it breaks:</strong> guidance interacts with the sampler. At low step counts the extrapolated field is stiffer, so a weight that looks fine at 50 steps can produce burnt-out images at 10. And because guidance narrows the distribution, evaluating a guided model on diversity-sensitive metrics measures the guidance weight almost as much as it measures the model.
</div>

Guidance is why text-to-image diffusion works at all in practice, and it composes with everything else: it is orthogonal to where the diffusion happens ([latent diffusion](/blog/diffusion/latent-diffusion/)), to how the trajectory is integrated ([samplers](/blog/diffusion/samplers-schedulers/)), and to whether the path is stochastic or straight ([flow matching](/blog/diffusion/flow-matching/)).

## References

1. Dhariwal, P., & Nichol, A. [Diffusion Models Beat GANs on Image Synthesis](https://arxiv.org/abs/2105.05233). *NeurIPS 2021*.
2. Ho, J., & Salimans, T. [Classifier-Free Diffusion Guidance](https://arxiv.org/abs/2207.12598). *NeurIPS 2021 Workshop on Deep Generative Models*.
3. Nichol, A., Dhariwal, P., Ramesh, A., Shyam, P., Mishkin, P., McGrew, B., Sutskever, I., & Chen, M. [GLIDE: Towards Photorealistic Image Generation and Editing with Text-Guided Diffusion Models](https://arxiv.org/abs/2112.10741). *ICML 2022*.
4. Saharia, C., Chan, W., Saxena, S., et al. [Photorealistic Text-to-Image Diffusion Models with Deep Language Understanding](https://arxiv.org/abs/2205.11487). *NeurIPS 2022*.
