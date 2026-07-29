---
layout: single
title: "The Forward Process: A Corruption Engineered to Be Jumped Into"
date: 2026-07-02
categories: [diffusion]
book: diffusion
subsection: foundations
tags: [diffusion, forward-process, noise-schedule, cosine-schedule]
excerpt: "The forward process looks like the trivial half of diffusion, but every term in it is load-bearing. Drop the shrink factor and the variance diverges; pick the wrong schedule and a third of your timesteps are spent denoising static."
author_profile: true
read_time: true
is_overview: false
icon: "🌫️"
read_mins: 6
permalink: /blog/diffusion/forward-process/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The forward process is a Markov chain that shrinks the image by \(\sqrt{1-\beta_t}\) and adds variance \(\beta_t\). The shrink factor is not cosmetic — without it the variance grows without bound instead of converging to \(\mathcal{N}(\mathbf{0},\mathbf{I})\). Because Gaussians compose, the whole chain collapses to a single closed-form jump governed by \(\bar{\alpha}_t\), which is what makes training cheap. The choice of schedule then decides how the signal-to-noise ratio decays, and the standard linear schedule wastes about a third of its steps on inputs that are already indistinguishable from noise.
</div>

## Two things the corruption has to do

The [forward process](/blog/diffusion/overview/) has no free parameters to learn, so it is tempting to treat it as boilerplate. It is not. It has to satisfy two constraints simultaneously, and they pull in different directions.

First, it must **converge to a fixed, samplable distribution**. At sampling time we start from $$\mathbf{x}_T$$ drawn from a prior, so $$q(\mathbf{x}_T)$$ had better actually be that prior, regardless of which image we started from.

Second, it must be **jumpable**. Training draws a random timestep and needs $$\mathbf{x}_t$$ immediately. Simulating 400 sequential steps per training example would make the method unusable.

## Why the shrink factor is there

One step of the chain is

<div class="formula-box">
\[
q(\mathbf{x}_t \mid \mathbf{x}_{t-1}) = \mathcal{N}\!\left(\mathbf{x}_t;\ \sqrt{1-\beta_t}\,\mathbf{x}_{t-1},\ \beta_t \mathbf{I}\right)
\]
</div>

where $$\beta_t \in (0,1)$$ is the *variance schedule*: a fixed, increasing sequence of small positive numbers. Track the per-coordinate variance $$v_t = \operatorname{Var}[\mathbf{x}_t]$$. Scaling by $$\sqrt{1-\beta_t}$$ multiplies variance by $$1-\beta_t$$, and the injected noise adds $$\beta_t$$:

<div class="formula-box">
\[
v_t = (1-\beta_t)\,v_{t-1} + \beta_t
\]
</div>

This recursion has a fixed point at $$v = 1$$, and it is attracting: $$v_t - 1 = (1-\beta_t)(v_{t-1}-1)$$, so the gap to unit variance shrinks by a factor $$1-\beta_t$$ every step. Data normalised to unit variance stays there; data that is not gets pulled in.

Now delete the shrink factor, so that $$\mathbf{x}_t = \mathbf{x}_{t-1} + \sqrt{\beta_t}\,\mathbf{z}$$. The recursion becomes $$v_t = v_{t-1} + \beta_t$$, and the variance is just an accumulating sum. With the standard linear schedule — $$T = 1000$$, $$\beta$$ rising linearly from $$10^{-4}$$ to $$0.02$$ — that sum is $$\sum_t \beta_t = 10.05$$, so unit-variance data would end at variance $$11.05$$, a standard deviation of $$3.32$$. The terminal distribution then depends on $$T$$ and on the schedule, and no fixed prior matches it. Variance-exploding formulations do exist and work, but they have to rescale explicitly at sampling time; see the [score-SDE view](/blog/diffusion/score-based-sde/).

## The closed-form jump

Write $$\alpha_t = 1-\beta_t$$ and $$\bar{\alpha}_t = \prod_{s=1}^{t}\alpha_s$$. Composing $$t$$ Gaussian steps gives another Gaussian, and the means and variances telescope:

<div class="formula-box">
\[
q(\mathbf{x}_t \mid \mathbf{x}_0) = \mathcal{N}\!\left(\mathbf{x}_t;\ \sqrt{\bar{\alpha}_t}\,\mathbf{x}_0,\ (1-\bar{\alpha}_t)\mathbf{I}\right)
\qquad\Longleftrightarrow\qquad
\mathbf{x}_t = \sqrt{\bar{\alpha}_t}\,\mathbf{x}_0 + \sqrt{1-\bar{\alpha}_t}\,\boldsymbol{\epsilon}
\]
</div>

with $$\boldsymbol{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I})$$. The two coefficients square to one, so $$\bar{\alpha}_t$$ is exactly the fraction of the variance still carried by signal. That gives a clean scalar summary of the whole schedule, the **signal-to-noise ratio**:

<div class="formula-box">
\[
\mathrm{SNR}(t) = \frac{\bar{\alpha}_t}{1-\bar{\alpha}_t}
\]
</div>

Every design question about schedules is really a question about the shape of this curve.

## What the linear schedule actually does

Values for $$T=1000$$, $$\beta$$ linear from $$10^{-4}$$ to $$0.02$$:

| $$t$$ | $$\bar{\alpha}_t$$ | $$\sqrt{\bar{\alpha}_t}$$ | $$\sqrt{1-\bar{\alpha}_t}$$ | $$\mathrm{SNR}(t)$$ |
|---|---|---|---|---|
| 50  | 0.9710 | 0.985 | 0.170 | 33.5 |
| 100 | 0.8970 | 0.947 | 0.321 | 8.71 |
| 200 | 0.6590 | 0.812 | 0.584 | 1.93 |
| 400 | 0.1951 | 0.442 | 0.897 | 0.243 |
| 600 | 0.0259 | 0.161 | 0.987 | 0.0266 |
| 800 | 0.00153 | 0.039 | 0.999 | 0.00153 |
| 1000 | 0.00004 | 0.006 | 1.000 | 0.00004 |

Read the last three rows. By $$t=600$$ the signal amplitude is 16% of the noise amplitude; by $$t=800$$ it is 4%. Taking $$\mathrm{SNR} = 0.01$$ as a generous threshold for "there is nothing recoverable here", the linear schedule crosses it at $$t = 675$$ — so **325 of the 1000 steps operate on inputs that are effectively pure noise**. Those steps still cost a network evaluation at sampling time and still consume gradient updates during training.

## The cosine schedule

Nichol & Dhariwal define the schedule through $$\bar{\alpha}_t$$ directly rather than through $$\beta_t$$:

<div class="formula-box">
\[
\bar{\alpha}_t = \frac{f(t)}{f(0)},\qquad
f(t) = \cos^2\!\left(\frac{t/T + s}{1+s}\cdot\frac{\pi}{2}\right)
\]
</div>

with a small offset $$s = 0.008$$ that keeps $$\beta_1$$ from collapsing to zero. The implied $$\beta_t = 1 - \bar{\alpha}_t/\bar{\alpha}_{t-1}$$ is clipped at $$0.999$$ to keep the final step finite. The shape is close to linear in the middle and nearly flat at both ends, so destruction is spread evenly instead of front-loaded. On the same threshold, the cosine schedule does not cross $$\mathrm{SNR}=0.01$$ until $$t = 937$$: 63 wasted steps instead of 325.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="fwdp-title fwdp-desc" viewBox="0 0 640 190" style="max-width:640px;width:100%;height:auto">
  <title id="fwdp-title">Log signal-to-noise ratio against timestep for the linear and cosine schedules</title>
  <desc id="fwdp-desc">Two decreasing curves on axes running from timestep 0 to 1000 horizontally and log signal-to-noise ratio from plus 6 down to minus 10 vertically. The linear schedule (orange) falls steeply and crosses log SNR of minus 4.6 at timestep 675. The cosine schedule (teal) falls almost as a straight line and does not cross minus 4.6 until timestep 937. A dashed grey line marks log SNR equal to minus 4.6, labelled "signal-to-noise ratio 0.01 — effectively pure noise".</desc>
  <rect x="1" y="1" width="638" height="188" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="60" y1="30" x2="60" y2="152" stroke="#475569" stroke-width="1"/>
  <line x1="60" y1="152" x2="606" y2="152" stroke="#475569" stroke-width="1"/>
  <g font-size="9.5" fill="#475569" text-anchor="end">
    <text x="55" y="33">+6</text>
    <text x="55" y="78">0</text>
    <text x="55" y="123">−6</text>
    <text x="55" y="153">−10</text>
  </g>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="60"  y="166">0</text>
    <text x="222" y="166">300</text>
    <text x="384" y="166">600</text>
    <text x="546" y="166">900</text>
  </g>
  <text x="333" y="180" text-anchor="middle" font-size="10" fill="#334155">timestep t</text>
  <text x="18" y="95" text-anchor="middle" font-size="10" fill="#334155" transform="rotate(-90 18 95)">log SNR</text>
  <line x1="60" y1="109.5" x2="606" y2="109.5" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="602" y="106" text-anchor="end" font-size="9.5" fill="#475569">SNR = 0.01 — effectively pure noise</text>
  <polyline fill="none" stroke="#c2410c" stroke-width="2"
    points="87,48.7 114,58.8 168,70.1 222,78.2 276,85.7 330,93.5 384,102.2 438,112.2 492,123.6 546,136.5 600,150"/>
  <polyline fill="none" stroke="#0e7490" stroke-width="2"
    points="87,38.9 114,48.4 168,58.7 222,65.2 276,70.4 330,75.2 384,80.0 438,85.3 492,92.0 546,102.8 557,106.1 568,110.5 578,116.6 589,127.1 597,147.8"/>
  <circle cx="424" cy="109.5" r="3" fill="#c2410c"/>
  <circle cx="565" cy="109.5" r="3" fill="#0e7490"/>
  <text x="424" y="124" text-anchor="middle" font-size="9.5" fill="#c2410c">t=675</text>
  <text x="567" y="124" text-anchor="middle" font-size="9.5" fill="#0e7490">t=937</text>
  <text x="200" y="44" font-size="10.5" font-weight="700" fill="#c2410c">linear</text>
  <text x="300" y="52" font-size="10.5" font-weight="700" fill="#0e7490">cosine</text>
</svg>
<figcaption>Notice where each curve crosses the dashed line. The linear schedule spends its last third below any useful signal level; the cosine schedule keeps signal alive almost to the end, so nearly every timestep poses a non-trivial denoising problem.</figcaption>
</figure>
</div>

<div class="insight-box">
  <strong>Key Insight — the schedule is a budget allocation:</strong> \(T\) is a budget of network evaluations, and the schedule decides how that budget is spread across noise levels. A schedule that drives \(\bar{\alpha}_t\) to zero early is not "more thorough" — it has simply spent a large block of its budget mapping noise to noise, at both training and sampling time. Reading the schedule as a log-SNR curve rather than as a \(\beta\) sequence makes the misallocation obvious, and it is why later work parameterises schedules by SNR directly.
</div>

## When it matters and when it does not

The gap is largest at low resolution. Nichol & Dhariwal report that the linear schedule is noticeably sub-optimal at $$32\times32$$ and $$64\times64$$, and that under it a substantial prefix of the reverse process can be skipped with little effect on sample quality — a direct symptom of the wasted region. At $$256\times256$$ the difference narrows, because a high-resolution image carries far more information and survives longer under the same relative noise.

The other consequence surfaces in [DDIM](/blog/diffusion/ddim/) and other fast samplers. When you drop from 1000 steps to 30, you subsample the schedule, and steps drawn from a dead region contribute nothing. A schedule with a well-spread log-SNR curve is a precondition for short sampling, not an independent refinement.

One residual issue: neither schedule reaches $$\bar{\alpha}_T = 0$$ exactly, so $$q(\mathbf{x}_T)$$ is not quite the prior we sample from. With the linear schedule $$\sqrt{\bar{\alpha}_{1000}} \approx 0.006$$, a small but non-zero leak of the mean image into the terminal distribution. Zero-terminal-SNR schedules fix this by forcing $$\bar{\alpha}_T = 0$$, which matters most for models expected to produce very dark or very bright outputs.

## References

1. Sohl-Dickstein, J., Weiss, E., Maheswaranathan, N., & Ganguli, S. [Deep Unsupervised Learning using Nonequilibrium Thermodynamics](https://arxiv.org/abs/1503.03585). *ICML 2015*.
2. Ho, J., Jain, A., & Abbeel, P. [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239). *NeurIPS 2020*.
3. Nichol, A., & Dhariwal, P. [Improved Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2102.09672). *ICML 2021*.
4. Lin, S., Liu, B., Li, J., & Yang, X. [Common Diffusion Noise Schedules and Sample Steps are Flawed](https://arxiv.org/abs/2305.08891). *WACV 2024*.
