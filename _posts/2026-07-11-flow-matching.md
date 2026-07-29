---
layout: single
title: "Flow Matching: Training a Velocity Field Without Ever Solving an ODE"
date: 2026-07-11
categories: [diffusion]
book: diffusion
subsection: flow-matching
tags: [flow-matching, continuous-normalising-flows, generative-models, odes]
excerpt: "Continuous normalising flows were elegant and nearly untrainable — every gradient step needed an ODE solve and a divergence estimate. Flow matching removes both by regressing a velocity field against a target you can write down in closed form, one example at a time."
author_profile: true
read_time: true
is_overview: false
icon: "🌊"
read_mins: 7
permalink: /blog/diffusion/flow-matching/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A continuous normalising flow turns noise into data by integrating a learned velocity field, but training one by maximum likelihood costs an ODE solve plus a divergence estimate per gradient step. Flow matching replaces that with plain regression: pick a probability path, write down the velocity field that generates it <em>for a single data point</em>, and regress against it. A short argument shows the conditional and the intractable marginal objectives have identical gradients. Diffusion turns out to be one particular — and curved — choice of path.
</div>

## Flows you can sample from but cannot afford to train

A continuous normalising flow (CNF) defines a sample as the endpoint of an ODE. Start from noise \\(x_0 \sim p_0 = \mathcal{N}(\mathbf{0}, \mathbf{I})\\) and push it along a learned velocity field $$v_\theta$$:

<div class="formula-box">
\[
\frac{d}{dt}\psi_t(x_0) = v_\theta\!\left(\psi_t(x_0),\, t\right),
\qquad \psi_0(x_0) = x_0
\]
</div>

Here \\(\psi_t\\) is the *flow map* — where a starting point has moved to by time \\(t\\) — and the model distribution is the law of \\(\psi_1(x_0)\\). The appeal is that $$v_\theta$$ is unconstrained: any network defines a valid invertible map, with none of the triangular-Jacobian gymnastics of discrete normalising flows.

The problem is training it. Fitting by maximum likelihood needs the density, which follows the instantaneous change-of-variables formula

<div class="formula-box">
\[
\frac{d}{dt}\log p_t\!\left(\psi_t(x_0)\right) = -\nabla \cdot v_\theta\!\left(\psi_t(x_0),\, t\right)
\]
</div>

where $$\nabla \cdot v_\theta = \operatorname{tr}(\partial v_\theta / \partial x)$$ is the divergence. One log-likelihood therefore costs a full ODE solve plus a divergence estimate at every solver step — an exact trace needs \\(D\\) backward passes in \\(D\\) dimensions, and the usual Hutchinson estimator is cheaper but noisier. The solver sits *inside* the training loop.

## Regress the velocity instead

Suppose someone handed you a *probability path* \\(p_t\\) interpolating from noise at \\(t=0\\) to the data distribution \\(q\\) at \\(t=1\\), together with a vector field \\(u_t\\) that generates it. Then training would be a regression problem:

<div class="formula-box">
\[
\mathcal{L}_{\text{FM}} = \mathbb{E}_{t \sim \mathcal{U}[0,1],\ x \sim p_t}
\left[\ \left\lVert v_\theta(x, t) - u_t(x) \right\rVert^2\ \right]
\]
</div>

No solver, no divergence — one forward pass per sample. The catch is that neither \\(p_t\\) nor \\(u_t\\) is available: both are defined by the unknown data distribution.

## Conditioning makes the target computable

The move that rescues this is to define the path *per training example*. Choose a conditional path \\(p_t(x \mid x_1)\\) that starts at \\(\mathcal{N}(\mathbf{0}, \mathbf{I})\\) at \\(t=0\\) and concentrates on the data point \\(x_1\\) at \\(t=1\\). Marginalising over the dataset recovers a path with the right endpoints:

<div class="formula-box">
\[
p_t(x) = \int p_t(x \mid x_1)\, q(x_1)\, dx_1
\qquad \Longrightarrow \qquad p_1 \approx q
\]
</div>

The field generating this marginal path is, by the continuity equation, a posterior-weighted average of the conditional fields:

<div class="formula-box">
\[
u_t(x) = \int u_t(x \mid x_1)\ \frac{p_t(x \mid x_1)\, q(x_1)}{p_t(x)}\ dx_1
\]
</div>

That integral runs over the whole data distribution, so it is hopeless to evaluate. But we never need to. The **conditional flow matching** objective drops the marginal entirely:

<div class="formula-box">
\[
\mathcal{L}_{\text{CFM}} = \mathbb{E}_{t,\ x_1,\ x_t}
\left[\ \left\lVert v_\theta(x_t, t) - u_t(x_t \mid x_1) \right\rVert^2\ \right]
\]
</div>

Read the expectation as a recipe: draw \\(t \sim \mathcal{U}[0,1]\\) and a data point \\(x_1 \sim q\\), draw \\(x_t \sim p_t(\cdot \mid x_1)\\), and regress $$v_\theta(x_t,t)$$ onto the closed-form conditional velocity \\(u_t(x_t \mid x_1)\\). Every term comes from one example.

## Why the swap is legal

Expand both squared norms. The quadratic term is the same in each, because averaging \\(p_t(x\mid x_1)q(x_1)\\) over \\(x_1\\) is exactly \\(p_t(x)\\):

<div class="formula-box">
\[
\mathbb{E}_{x \sim p_t}\left\lVert v_\theta(x,t)\right\rVert^2
= \mathbb{E}_{x_1 \sim q,\ x \sim p_t(\cdot \mid x_1)}\left\lVert v_\theta(x,t)\right\rVert^2
\]
</div>

The cross term is where the definition of \\(u_t\\) earns its keep. Substituting it, the awkward \\(p_t(x)\\) in the denominator cancels against the \\(p_t(x)\\) from the outer expectation:

<div class="formula-box">
\[
\mathbb{E}_{x \sim p_t}\big\langle v_\theta(x,t),\, u_t(x)\big\rangle
= \iint \big\langle v_\theta(x,t),\, u_t(x \mid x_1)\big\rangle\, p_t(x \mid x_1)\, q(x_1)\, dx_1\, dx
\]
</div>

which is precisely the cross term of $$\mathcal{L}_{\text{CFM}}$$. The only surviving difference is \\(\lVert u_t(x)\rVert^2\\) against \\(\lVert u_t(x\mid x_1)\rVert^2\\), and neither depends on \\(\theta\\). So $$\nabla_\theta \mathcal{L}_{\text{FM}} = \nabla_\theta \mathcal{L}_{\text{CFM}}$$: the two objectives differ by a constant and have the same minimiser.

<div class="insight-box">
  <strong>Key Insight — the network averages for you:</strong> the conditional targets are wildly inconsistent. The same point \(x_t\) can be produced from many different data points, each demanding a different velocity, so no network can fit them all. Squared error resolves the conflict in exactly the right way: the minimiser of an MSE is the conditional expectation, so the trained field converges to \(\mathbb{E}\!\left[u_t(x_t \mid x_1) \mid x_t = x\right]\) — which is the definition of the marginal field \(u_t(x)\). The averaging that looked intractable is done implicitly by the regression, not by you.
</div>

## The Gaussian probability path

The standard family takes each conditional path Gaussian, $$p_t(x \mid x_1) = \mathcal{N}\!\left(x;\, \mu_t(x_1),\, \sigma_t(x_1)^2 \mathbf{I}\right)$$, with \\(\mu_0 = \mathbf{0}, \sigma_0 = 1\\) at the noise end and $$\mu_1 = x_1, \sigma_1 = \sigma_{\min}$$ at the data end. The flow map is then an affine rescaling of the noise, \\(x_t = \sigma_t x_0 + \mu_t\\). Differentiating gives $$\dot{x}_t = \sigma'_t x_0 + \mu'_t$$, and substituting \\(x_0 = (x_t - \mu_t)/\sigma_t\\) puts it in terms of the current position:

<div class="formula-box">
\[
u_t(x \mid x_1) = \frac{\sigma'_t}{\sigma_t}\left(x - \mu_t\right) + \mu'_t
\]
</div>

Two lines of calculus, and the target is closed-form for any schedule.

## Diffusion is one path among many

Now the payoff. The conditional trajectory \\(x_t = \sigma_t x_0 + \mu_t\\) is a straight line in \\(t\\) exactly when both \\(\mu_t\\) and \\(\sigma_t\\) are affine in \\(t\\). Variance-preserving diffusion is *not*: read in this notation its schedule gives \\(\mu_t = \alpha_t x_1\\) and \\(\sigma_t = \sqrt{1 - \alpha_t^2}\\), and neither is affine, so the trajectory bends. Choosing \\(\mu_t = t\,x_1\\) and $$\sigma_t = 1 - (1-\sigma_{\min})t$$ instead yields

<div class="formula-box">
\[
u_t(x \mid x_1) = \frac{x_1 - (1-\sigma_{\min})\,x}{1 - (1-\sigma_{\min})\,t}
\ \xrightarrow{\ \sigma_{\min} \to 0\ }\ x_1 - x_0
\]
</div>

a *constant* velocity along each conditional path — the [rectified flow](/blog/diffusion/rectified-flow/) target. Here is the contrast in one dimension, with \\(x_0 = -1\\) and \\(x_1 = 2\\), against a variance-preserving path \\(x_t = \cos(\tfrac{\pi t}{2})x_0 + \sin(\tfrac{\pi t}{2})x_1\\):

| \\(t\\) | linear \\(x_t\\) | linear \\(u_t\\) | VP \\(x_t\\) | VP \\(u_t\\) |
|---|---|---|---|---|
| 0.00 | −1.000 | 3.000 | −1.000 | 3.142 |
| 0.25 | −0.250 | 3.000 | −0.159 | 3.504 |
| 0.50 | 0.500 | 3.000 | 0.707 | 3.332 |
| 0.75 | 1.250 | 3.000 | 1.465 | 2.654 |
| 1.00 | 2.000 | 3.000 | 2.000 | 1.571 |

Same endpoints, same framework, different geometry. The variance-preserving speed swings from 3.14 up to 3.50 and down to 1.57 — that variation is curvature, and curvature is what an ODE solver has to resolve with extra steps.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="fm-cond-title fm-cond-desc" viewBox="0 0 620 230" style="max-width:620px;width:100%;height:auto">
  <title id="fm-cond-title">Conditional velocity fields averaging into the marginal field</title>
  <desc id="fm-cond-desc">Three conditional paths leave a single noise point on the left and end at three separate data points on the right, labelled x-one-a, x-one-b and x-one-c. At an intermediate time t, three arrows of different directions emerge from the same location, one per destination. A fourth, shorter arrow drawn between them represents the marginal velocity, which is the posterior-weighted average of the three conditional velocities. The caption states that the network trained by regression outputs this average without computing it.</desc>
  <rect x="1" y="1" width="618" height="228" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3">
    <line x1="60" y1="30" x2="60" y2="200"/>
    <line x1="270" y1="30" x2="270" y2="200"/>
    <line x1="540" y1="30" x2="540" y2="200"/>
  </g>
  <g font-size="10" fill="#475569" text-anchor="middle">
    <text x="60" y="216">t = 0 (noise)</text>
    <text x="270" y="216">t</text>
    <text x="540" y="216">t = 1 (data)</text>
  </g>
  <g stroke="#0e7490" stroke-width="1.5" fill="none" opacity="0.75">
    <path d="M60,115 C160,100 210,80 270,70 C350,58 460,50 540,48"/>
    <path d="M60,115 C160,116 210,118 270,118 C350,119 460,120 540,120"/>
    <path d="M60,115 C160,132 210,152 270,166 C350,180 460,190 540,194"/>
  </g>
  <g fill="#0c4a6e">
    <circle cx="60" cy="115" r="4.5"/>
    <circle cx="540" cy="48" r="4.5"/><circle cx="540" cy="120" r="4.5"/><circle cx="540" cy="194" r="4.5"/>
  </g>
  <g font-size="10" fill="#0c4a6e">
    <text x="24" y="107">x₀</text>
    <text x="552" y="45">x₁ᵃ</text><text x="552" y="117">x₁ᵇ</text><text x="552" y="191">x₁ᶜ</text>
  </g>
  <circle cx="270" cy="118" r="4" fill="#334155"/>
  <text x="252" y="136" font-size="10" fill="#334155">xₜ</text>
  <g stroke="#0e7490" stroke-width="1.8" fill="none" marker-end="url(#fmArrC)">
    <line x1="274" y1="116" x2="352" y2="86"/>
    <line x1="276" y1="118" x2="356" y2="118"/>
    <line x1="274" y1="121" x2="352" y2="152"/>
  </g>
  <line x1="276" y1="118" x2="336" y2="118" stroke="#c2410c" stroke-width="3.4" fill="none" marker-end="url(#fmArrM)"/>
  <defs>
    <marker id="fmArrC" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#0e7490"/></marker>
    <marker id="fmArrM" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#c2410c"/></marker>
  </defs>
  <g font-size="10.5">
    <text x="366" y="84" fill="#0e7490">uₜ(xₜ | x₁) — three conflicting targets</text>
    <text x="366" y="140" fill="#c2410c" font-weight="700">uₜ(xₜ) — the average the network learns</text>
  </g>
  <text x="310" y="22" text-anchor="middle" font-size="11.5" font-weight="700" fill="#334155">One point, many destinations</text>
</svg>
<figcaption>Notice that the conditional targets (teal) disagree at the same \(x_t\), and that the marginal velocity (orange) is shorter than any of them — averaging directions that point apart shrinks the result. The shrinkage measures how undecided the model still is about the destination, and it fades as \(t \to 1\) and the posterior over \(x_1\) concentrates on one point.</figcaption>
</figure>
</div>

## Sampling

Training never touched a solver. Sampling is where one finally appears. Draw \\(x_0 \sim \mathcal{N}(\mathbf{0},\mathbf{I})\\) and integrate

<div class="formula-box">
\[
\frac{dx}{dt} = v_\theta(x, t), \qquad t: 0 \to 1
\]
</div>

with any solver — Euler, midpoint, adaptive Runge–Kutta. The step count is now a *deployment* choice, decoupled from training, as it is for [DDIM](/blog/diffusion/ddim/), whose deterministic sampler is the same idea reached from the [score-based SDE](/blog/diffusion/score-based-sde/) direction. What flow matching adds is the freedom to design the path so that fewer steps suffice, which [rectified flow](/blog/diffusion/rectified-flow/) takes to its conclusion. For how the two formulations line up term by term, see [diffusion vs flow matching](/blog/diffusion/diffusion-vs-flow-matching/); for the corruption-based view they generalise, the [diffusion overview](/blog/diffusion/overview/).

## References

1. Lipman, Y., Chen, R. T. Q., Ben-Hamu, H., Nickel, M., & Le, M. [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747). *ICLR 2023*.
2. Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. [Neural Ordinary Differential Equations](https://arxiv.org/abs/1806.07366). *NeurIPS 2018*.
3. Albergo, M. S., & Vanden-Eijnden, E. [Building Normalizing Flows with Stochastic Interpolants](https://arxiv.org/abs/2209.15571). *ICLR 2023*.
4. Liu, X., Gong, C., & Liu, Q. [Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow](https://arxiv.org/abs/2209.03003). *ICLR 2023*.
