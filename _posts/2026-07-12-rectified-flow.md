---
layout: single
title: "Rectified Flow: Straightening Trajectories to Buy Few-Step Sampling"
date: 2026-07-12
categories: [diffusion]
book: diffusion
subsection: flow-matching
tags: [rectified-flow, flow-matching, few-step-sampling, reflow]
excerpt: "A perfectly straight generative trajectory is exactly solvable in a single Euler step. Every extra sampling step you pay for is buying back curvature — so rectified flow attacks the curvature itself rather than the solver."
author_profile: true
read_time: true
is_overview: false
icon: "📏"
read_mins: 7
permalink: /blog/diffusion/rectified-flow/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Rectified flow is flow matching with the simplest possible probability path — a straight line between noise and data, travelled at constant speed. That makes each <em>conditional</em> trajectory exactly integrable in one Euler step, but the <em>marginal</em> field the network actually learns is still curved, because paths from different examples cross. Reflow fixes this by retraining on the model's own (noise, sample) pairs, which removes the crossings and straightens the marginal field. The price is that each reflow round learns from synthetic data and drifts a little further from the real distribution.
</div>

## The simplest path you can write down

[Flow matching](/blog/diffusion/flow-matching/) leaves the probability path as a design choice. Rectified flow makes the least imaginative choice available: draw noise \\(x_0 \sim \mathcal{N}(\mathbf{0},\mathbf{I})\\), draw data \\(x_1 \sim q\\), and interpolate linearly.

<div class="formula-box">
\[
x_t = (1-t)\,x_0 + t\,x_1,
\qquad
u_t = \frac{dx_t}{dt} = x_1 - x_0
\]
</div>

The velocity target does not depend on \\(t\\) at all. Training is one line — sample a pair, sample a time, sample the point on the segment between them, and regress:

<div class="formula-box">
\[
\mathcal{L} = \mathbb{E}_{t \sim \mathcal{U}[0,1],\ x_0,\ x_1}
\left[\ \left\lVert v_\theta\!\left((1-t)x_0 + t x_1,\ t\right) - (x_1 - x_0) \right\rVert^2\ \right]
\]
</div>

No noise schedule, no $$\bar{\alpha}_t$$, no signal-to-noise weighting to tune. Compare the [score-based SDE](/blog/diffusion/score-based-sde/) view, where the drift and diffusion coefficients carry all that machinery.

## Why straightness is the whole game

Any ODE sampler approximates $$x_1 = x_0 + \int_0^1 v_\theta(x_t,t)\,dt$$. Euler with \\(N\\) steps freezes the velocity across each interval of length \\(1/N\\). If the velocity along the trajectory is genuinely constant, freezing it costs nothing — one step of size 1 is *exact*, not approximate. All discretisation error comes from the velocity changing as you move, which is the definition of curvature.

Take the one-dimensional pair \\(x_0 = -1\\), \\(x_1 = 2\\). Under the straight path the velocity is \\(3\\) everywhere, so a single Euler step gives \\(-1 + 3 = 2\\): exact. Under a variance-preserving path \\(x_t = \cos(\tfrac{\pi t}{2})x_0 + \sin(\tfrac{\pi t}{2})x_1\\), the initial velocity is \\(\tfrac{\pi}{2}x_1 = \pi\\), and one Euler step gives \\(-1 + \pi \approx 2.1416\\) — an error of \\(0.1416\\), about 4.7% of the total displacement of \\(3\\), from a single well-behaved curve. Stack that error across dimensions and across a bent trajectory and you get the familiar need for tens of steps.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="rf-traj-title rf-traj-desc" viewBox="0 0 640 290" style="max-width:640px;width:100%;height:auto">
  <title id="rf-traj-title">A curved diffusion trajectory and a straight rectified-flow trajectory between the same endpoints</title>
  <desc id="rf-traj-desc">Both trajectories start at the same noise point on the lower left and end at the same data point on the upper right. The curved diffusion trajectory bows downward before sweeping up. A four-segment Euler polyline drawn along it cuts to the outside of every bend and its final node stops short of the data point, leaving a visible gap. The straight rectified-flow trajectory is a single line segment: because its velocity is constant, one Euler step of size one covers the whole segment and lands exactly on the data point. The figure contrasts four inexact steps with one exact step.</desc>
  <rect x="1" y="1" width="638" height="288" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <path d="M90,200 C200,240 380,215 550,80" fill="none" stroke="#0e7490" stroke-width="2.2"/>
  <polyline points="90,200 172.5,230 277.5,233.5 397.5,206.3 525,144.2" fill="none" stroke="#475569" stroke-width="1.6" stroke-dasharray="6 4"/>
  <g fill="#475569">
    <circle cx="172.5" cy="230" r="3.4"/><circle cx="277.5" cy="233.5" r="3.4"/>
    <circle cx="397.5" cy="206.3" r="3.4"/><circle cx="525" cy="144.2" r="3.4"/>
  </g>
  <line x1="525" y1="144.2" x2="550" y2="80" stroke="#c2410c" stroke-width="1.3" stroke-dasharray="2 3"/>
  <text x="536" y="118" font-size="9.5" fill="#c2410c" transform="rotate(-68 536 118)">error</text>

  <line x1="90" y1="200" x2="546" y2="81" stroke="#c2410c" stroke-width="2.6" marker-end="url(#rfArr)"/>
  <defs>
    <marker id="rfArr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#c2410c"/></marker>
  </defs>

  <circle cx="90" cy="200" r="5.5" fill="#0c4a6e"/>
  <circle cx="550" cy="80" r="5.5" fill="#0c4a6e"/>
  <g font-size="10.5" fill="#0c4a6e">
    <text x="62" y="222">x₀</text>
    <text x="558" y="72">x₁</text>
  </g>

  <g font-size="10.5">
    <text x="250" y="262" fill="#0e7490" font-weight="700">curved path: 4 Euler steps, still short</text>
    <text x="196" y="122" fill="#c2410c" font-weight="700">straight path: 1 Euler step, exact</text>
  </g>
  <text x="320" y="26" text-anchor="middle" font-size="11.5" font-weight="700" fill="#334155">Same endpoints, different step budgets</text>
  <text x="320" y="44" text-anchor="middle" font-size="10" fill="#475569">step count is set by curvature, not by how far apart the endpoints are</text>
</svg>
<figcaption>Notice that every dashed Euler chord lies outside the bend it is meant to follow — a straight-line step cannot track a turning trajectory, so the error accumulates and the last node lands short of \(x_1\). On the orange segment the velocity never changes, so the size of the step is irrelevant: one step and a hundred steps give the same answer.</figcaption>
</figure>
</div>

## The catch: straight conditionals, curved marginals

Here is the part that is easy to miss. The linear interpolation makes each *conditional* path straight, but the network learns the *marginal* field, and that field is an average over every data point that could have produced the current position. Two training segments that intersect in space demand different velocities at the crossing point, and the regression returns their average. The resulting integral curves bend.

So a freshly trained rectified flow is not actually straight. It is trained on straight targets, which is a different claim.

<div class="insight-box">
  <strong>Key Insight — reflow removes the crossings, not the curvature:</strong> the curvature exists because the training coupling pairs each \(x_1\) with an <em>independent</em> \(x_0\), so segments cross. Reflow replaces that independent coupling with the deterministic one the model itself induces: run the ODE from \(x_0\) and record where it lands. Trajectories of an ODE cannot cross — the field assigns one velocity per point — so the new coupling is crossing-free by construction, and its straight-line interpolations are consistent with a single field. Straightening is a consequence of fixing the coupling, not something optimised directly.
</div>

## Reflow

Concretely, with a trained field \\(v^{k}\\):

1. Sample \\(x_0 \sim \mathcal{N}(\mathbf{0},\mathbf{I})\\).
2. Integrate \\(dx/dt = v^{k}(x,t)\\) accurately from \\(t=0\\) to \\(t=1\\) to get \\(z_1\\).
3. Train \\(v^{k+1}\\) with the same objective, but on the coupled pairs \\((x_0, z_1)\\) instead of independently drawn \\((x_0, x_1)\\).

Liu et al. prove two things about this operation. The marginal at \\(t=1\\) is preserved — reflow rewires which noise maps to which sample without changing the distribution of samples — and no convex transport cost increases, so the new coupling is at least as cheap as the old one. Iterating, the straightness of the best of the first \\(K\\) rectified flows decays as \\(O(1/K)\\).

## What reflow costs

Step 2 is the problem. From the second round onwards the model is trained on its own outputs, so anything the ODE solver got wrong, and anything the previous model got wrong, is baked into the targets as ground truth. Two error sources compound:

| Round | Trained on | Straightness | Distribution |
|---|---|---|---|
| 1-rectified | real data, independent pairs | poor | matches data as well as the fit allows |
| 2-rectified | model samples, coupled pairs | much better | inherits round-1 error |
| 3-rectified | round-2 samples | better still | inherits rounds 1 and 2 |

In practice two rounds is the usual stopping point: the first reflow buys most of the straightening, and later rounds trade visible sample quality for diminishing gains. The theoretical guarantee that marginals are preserved holds for an *exact* ODE solve and an *exact* regression fit; neither is available, and the gap is exactly where the drift enters.

## Where it landed

Reflow alone moves sampling into the few-step regime. Reaching a single step still needs distillation — train a network to map \\(x_0\\) straight to \\(z_1\\) — but after reflow the map it must imitate is close to linear, which is why distilling a 2-rectified flow is so much easier than distilling a raw diffusion model. The formulation also scaled: Stable Diffusion 3 (Esser et al., 2024) uses the rectified-flow interpolant as its forward process and samples \\(t\\) from a logit-normal distribution, concentrating training on the intermediate times where prediction is hardest.

The broader lesson is that sampling cost was never really about the number of denoising steps. It was about how bent the path from noise to data is — something you choose when you design the probability path, not something you discover afterwards and patch with a better solver. [DDIM](/blog/diffusion/ddim/) attacked the same cost from the solver side and reached tens of steps; changing the path reaches single digits. For the two formulations side by side, see [diffusion vs flow matching](/blog/diffusion/diffusion-vs-flow-matching/), and for the corruption-based starting point, the [diffusion overview](/blog/diffusion/overview/).

## References

1. Liu, X., Gong, C., & Liu, Q. [Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow](https://arxiv.org/abs/2209.03003). *ICLR 2023*.
2. Lipman, Y., Chen, R. T. Q., Ben-Hamu, H., Nickel, M., & Le, M. [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747). *ICLR 2023*.
3. Albergo, M. S., & Vanden-Eijnden, E. [Building Normalizing Flows with Stochastic Interpolants](https://arxiv.org/abs/2209.15571). *ICLR 2023*.
4. Esser, P., Kulal, S., Blattmann, A., Entezari, R., Müller, J., Saini, H., et al. [Scaling Rectified Flow Transformers for High-Resolution Image Synthesis](https://arxiv.org/abs/2403.03206). *ICML 2024*.
5. Song, J., Meng, C., & Ermon, S. [Denoising Diffusion Implicit Models](https://arxiv.org/abs/2010.02502). *ICLR 2021*.
