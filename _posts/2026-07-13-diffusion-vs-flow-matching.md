---
layout: single
title: "Diffusion vs Flow Matching: Two Names for One Family"
date: 2026-07-13
categories: [diffusion]
book: diffusion
subsection: flow-matching
tags: [diffusion, flow-matching, rectified-flow, probability-paths]
excerpt: "Flow matching is often presented as the successor to diffusion. It is more accurate — and more useful — to say that diffusion is one particular probability path inside the flow-matching framework, and not the straightest one available."
author_profile: true
read_time: true
is_overview: false
icon: "🧭"
read_mins: 6
permalink: /blog/diffusion/diffusion-vs-flow-matching/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Both methods learn a time-dependent vector field that transports a Gaussian into the data distribution, and both train it by regressing on a target that is available in closed form for a single data point. They differ in which path is chosen and what the network is asked to output. Diffusion's variance-preserving path traces a quarter circle in schedule space; flow matching's linear path is the chord. Diffusion is a valid flow-matching path with a particular scheduler, so the two are not competing paradigms — the practical differences are curvature, and therefore step count.
</div>

## The shared skeleton

Pick a distribution you can sample (a standard Gaussian) and a distribution you want (data). Define a family of intermediate distributions \\(p_t\\) interpolating between them, and learn a vector field whose ODE transports mass along that family. Sampling means solving the ODE.

Everything both methods do fits that description. What varies is the interpolation, the regression target, and whether noise is injected during sampling.

## Flow matching, in one construction

Lipman et al. define a **conditional** path per data point $$\mathbf{x}_1$$, because the marginal path is intractable. With $$\mathbf{x}_0\sim\mathcal{N}(\mathbf{0},\mathbf{I})$$ and the linear interpolation

<div class="formula-box">
\[
\mathbf{x}_t = (1-t)\,\mathbf{x}_0 + t\,\mathbf{x}_1, \qquad t\in[0,1],
\]
</div>

the velocity that generates it is constant along each pair: $$\mathbf{u}_t(\mathbf{x}_t\mid \mathbf{x}_0,\mathbf{x}_1) = \mathbf{x}_1 - \mathbf{x}_0$$. The training loss is then a plain regression,

<div class="formula-box">
\[
\mathcal{L}_{\text{CFM}} = \mathbb{E}_{t,\ \mathbf{x}_0,\ \mathbf{x}_1}\left[\bigl\lVert \mathbf{v}_\theta(\mathbf{x}_t, t) - (\mathbf{x}_1 - \mathbf{x}_0)\bigr\rVert^2\right],
\]
</div>

and their key result is that this conditional objective has the same gradient as regressing on the intractable marginal field. The same trick — regress on a per-example target, recover the marginal in expectation — is exactly what makes the diffusion loss work.

## The schedule as a curve

Write both methods in a common form: $$\mathbf{x}_t = \alpha_t\,\mathbf{x}_1 + \sigma_t\,\boldsymbol{\epsilon}$$, with \\(\alpha_t\\) the signal coefficient, \\(\sigma_t\\) the noise coefficient, $$\mathbf{x}_1$$ the data point and \\(\boldsymbol{\epsilon}\\) standard Gaussian noise. A schedule is then a curve in the \\((\sigma,\alpha)\\) plane from \\((1,0)\\) — pure noise — to \\((0,1)\\) — clean data.

- **Variance-preserving diffusion:** $$\alpha_t = \sqrt{\bar{\alpha}_t}$$, $$\sigma_t = \sqrt{1-\bar{\alpha}_t}$$, so \\(\alpha_t^2 + \sigma_t^2 = 1\\). The schedule is a **quarter circle**.
- **Rectified flow / linear flow matching:** \\(\alpha_t = t\\), \\(\sigma_t = 1-t\\), so \\(\alpha_t + \sigma_t = 1\\). The schedule is the **chord**.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="fmvd-title fmvd-desc" viewBox="0 0 640 200" style="max-width:640px;width:100%;height:auto">
  <title id="fmvd-title">Diffusion and flow-matching schedules in the signal–noise plane</title>
  <desc id="fmvd-desc">Axes with noise coefficient sigma on the horizontal axis and signal coefficient alpha on the vertical axis, both from zero to one. Two curves join the point sigma equals one, alpha equals zero, labelled pure noise, to the point sigma equals zero, alpha equals one, labelled data. An orange quarter circle bulging outwards is the variance-preserving diffusion schedule, satisfying alpha squared plus sigma squared equals one. A teal straight chord is the linear flow-matching schedule, satisfying alpha plus sigma equals one. The arc is about eleven per cent longer than the chord.</desc>
  <rect x="1" y="1" width="638" height="198" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="120" y1="170" x2="120" y2="42" stroke="#334155" stroke-width="1.3"/>
  <line x1="120" y1="170" x2="270" y2="170" stroke="#334155" stroke-width="1.3"/>
  <path d="M120,60 A110,110 0 0 1 230,170" fill="none" stroke="#c2410c" stroke-width="2.2"/>
  <line x1="120" y1="60" x2="230" y2="170" stroke="#0e7490" stroke-width="2.2"/>
  <circle cx="120" cy="60" r="5" fill="#0c4a6e"/>
  <circle cx="230" cy="170" r="5" fill="#0c4a6e"/>
  <g font-size="9.5" fill="#334155">
    <text x="103" y="186">0</text>
    <text x="225" y="186">1</text>
    <text x="106" y="56">1</text>
    <text x="186" y="190">σ (noise)</text>
    <text x="100" y="36" text-anchor="middle">α</text>
  </g>
  <g font-size="10" fill="#0c4a6e">
    <text x="132" y="54">data (α=1, σ=0)</text>
    <text x="240" y="176">pure noise (α=0, σ=1)</text>
  </g>
  <g font-size="10.5">
    <text x="300" y="80" fill="#c2410c">■ variance-preserving diffusion: α² + σ² = 1</text>
    <text x="300" y="100" fill="#0e7490">■ linear flow matching: α + σ = 1</text>
    <text x="300" y="124" fill="#475569">The arc has length π/2 ≈ 1.571;</text>
    <text x="300" y="140" fill="#475569">the chord has length √2 ≈ 1.414 — the arc is ~11% longer.</text>
  </g>
  <text x="320" y="26" text-anchor="middle" font-size="11.5" font-weight="700" fill="#334155">Both schedules join the same two endpoints</text>
</svg>
<figcaption>Notice that the two schedules differ only in <em>how</em> they get between identical endpoints. The diffusion arc is curved, so a straight-line integrator leaves it after a large step; the chord is what a one-step Euler solve would follow exactly.</figcaption>
</figure>
</div>

## The targets are affine reparameterisations of each other

Given the shared form, differentiating $$\mathbf{x}_t = \alpha_t\mathbf{x}_1 + \sigma_t\boldsymbol{\epsilon}$$ gives $$\mathbf{u}_t = \dot{\alpha}_t\mathbf{x}_1 + \dot{\sigma}_t\boldsymbol{\epsilon}$$, and substituting $$\mathbf{x}_1 = (\mathbf{x}_t - \sigma_t\boldsymbol{\epsilon})/\alpha_t$$ yields

<div class="formula-box">
\[
\mathbf{u}_t \;=\; \frac{\dot{\alpha}_t}{\alpha_t}\,\mathbf{x}_t \;+\; \left(\dot{\sigma}_t - \frac{\dot{\alpha}_t\,\sigma_t}{\alpha_t}\right)\boldsymbol{\epsilon}.
\]
</div>

So a velocity prediction and a noise prediction determine each other exactly, given $$\mathbf{x}_t$$ and the schedule. A flow-matching model can be read as a noise predictor and vice versa. The choice is a conditioning and loss-weighting decision, not a change of hypothesis class — though it is a consequential one, because it changes which noise levels the squared error effectively emphasises.

<div class="insight-box">
  <strong>Key Insight — "straight" refers to the conditional path, not the sampling trajectory:</strong> the linear interpolant makes each individual noise-to-data pair a straight line, but the learned marginal field averages over all pairs that pass through a point, and the resulting trajectories still bend. This is precisely the gap that <em>reflow</em> closes: re-train on pairs generated by the model's own ODE, so the coupling between noise and data stops crossing, and the marginal trajectories straighten. Flow matching alone buys reduced curvature; straightness is a second procedure.
</div>

## Side by side

| | Diffusion (DDPM / VP-SDE) | Flow matching (linear path) |
|---|---|---|
| Interpolation | \\(\alpha_t^2+\sigma_t^2=1\\), quarter circle | \\(\alpha_t+\sigma_t=1\\), chord |
| Network output | noise $$\boldsymbol{\epsilon}_\theta$$ (or $$\mathbf{x}_0$$, or \\(\mathbf{v}\\)) | velocity $$\mathbf{v}_\theta$$ |
| Regression target | the noise actually drawn | $$\mathbf{x}_1-\mathbf{x}_0$$, constant per pair |
| Default sampling | ancestral SDE; PF-ODE also available | ODE |
| Noise endpoint | $$\bar{\alpha}_T$$ is small but nonzero — the noise end is not exactly Gaussian | exactly Gaussian by construction |
| Path curvature | higher | lower, and reducible further by reflow |
| Typical steps, no distillation | ~20–50 | ~10–30 |
| Relationship | a Gaussian probability path with a specific scheduler | the general framework containing it |

The row worth dwelling on is the endpoint. In discrete-time diffusion $$\sqrt{\bar{\alpha}_T}$$ is small but not zero, so the terminal distribution is not quite the Gaussian you sample from — the well-documented signal-leakage problem that forces schedule fixes such as zero terminal SNR. The linear interpolant has no such mismatch: at \\(t=0\\) the state is the noise sample exactly.

<div class="warning-box">
  <strong>The trap:</strong> treating "flow matching beats diffusion" as an architectural claim. The U-Net or DiT, the conditioning, the data and the guidance are unchanged; what changes is the interpolant and the loss weighting. Reported gains are real but come from those choices, and a diffusion model re-weighted onto a comparable schedule closes much of the gap.
</div>

Practically, the field has converged rather than split: Stable Diffusion 3 trains a transformer with a rectified-flow objective and samples with an ODE solver, which is a diffusion architecture on a flow-matching path. For the details of the straight-path construction, see [rectified flow](/blog/diffusion/rectified-flow/); for the stochastic view that both inherit, see [score-based SDEs](/blog/diffusion/score-based-sde/).

## References

1. Lipman, Y., Chen, R. T. Q., Ben-Hamu, H., Nickel, M., & Le, M. [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747). *ICLR 2023*.
2. Liu, X., Gong, C., & Liu, Q. [Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow](https://arxiv.org/abs/2209.03003). *ICLR 2023*.
3. Albergo, M. S., & Vanden-Eijnden, E. [Building Normalizing Flows with Stochastic Interpolants](https://arxiv.org/abs/2209.15571). *ICLR 2023*.
4. Kingma, D. P., & Gao, R. [Understanding Diffusion Objectives as the ELBO with Simple Data Augmentation](https://arxiv.org/abs/2303.00848). *NeurIPS 2023*.
5. Esser, P., Kulal, S., Blattmann, A., et al. [Scaling Rectified Flow Transformers for High-Resolution Image Synthesis](https://arxiv.org/abs/2403.03206). *ICML 2024*.
6. Lin, S., Liu, B., Li, J., & Yang, X. [Common Diffusion Noise Schedules and Sample Steps are Flawed](https://arxiv.org/abs/2305.08891). *WACV 2024*.
