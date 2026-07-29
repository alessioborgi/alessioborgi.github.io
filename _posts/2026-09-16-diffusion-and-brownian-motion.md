---
layout: single
title: "Brownian Motion, Langevin and Fokker–Planck: The Physics of a Sampler"
date: 2026-09-16
categories: [physics-basics]
book: physics-basics
subsection: stochastic
tags: [brownian-motion, langevin, fokker-planck, score-based-models]
excerpt: "A Langevin step is a gradient step plus noise. Change the potential to the negative log-density and it samples from that density instead of minimising it — which is the entire sampler behind score-based generative models."
author_profile: true
read_time: true
is_overview: false
icon: "💧"
read_mins: 6
permalink: /blog/physics-basics/diffusion-and-brownian-motion/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Brownian motion spreads as \(\sqrt{t}\), not \(t\). Fick's law plus conservation gives the diffusion equation; adding a drift gives the Langevin equation \(dx = -\nabla U\,dt + \sqrt{2D}\,dW\), whose density obeys the Fokker–Planck equation and settles to \(p_\infty \propto e^{-U/D}\). Choose \(U = -\log p_{\text{data}}\) and the stationary distribution is the data distribution — the drift term is then the score, and you have the sampler used by score-based generative models.
</div>

## The Wiener process

Einstein's 1905 account of Brownian motion explained the jitter of pollen grains as the accumulated effect of molecular collisions. Its mathematical idealisation is the Wiener process $W_t$: $W_0 = 0$, independent increments, $W_t - W_s \sim \mathcal N(0, t-s)$ for $t>s$, and continuous sample paths.

The defining scaling is $\mathbb E[W_t^2] = t$, so typical displacement grows like $\sqrt t$. Over an interval $\Delta t$ the increment has size $\sqrt{\Delta t}$, which dwarfs $\Delta t$ as $\Delta t\to 0$ — this is why Wiener paths are nowhere differentiable and why stochastic calculus needs its own rules rather than the ordinary chain rule.

Concretely, a 1 µm-diameter bead in water at 20 °C has $D = kT/(6\pi\eta a) \approx 0.43\ \mathrm{µm^2\,s^{-1}}$. Its root-mean-square displacement along one axis is $\sqrt{2Dt}$:

| elapsed time | RMS displacement (one axis) |
|---|---|
| 1 s | 0.93 µm |
| 10 s | 2.93 µm |
| 100 s | 9.27 µm |

A hundredfold increase in time buys only a tenfold increase in distance. Diffusion is a poor way to travel and an excellent way to explore.

## Fick's law and the diffusion equation

Particles flow from crowded regions to empty ones, at a rate proportional to the concentration gradient — Fick's first law, $\mathbf J = -D\nabla\rho$, with $\mathbf J$ the flux and $\rho$ the density. Combine it with conservation, $\partial_t\rho + \nabla\cdot\mathbf J = 0$, and the diffusion equation follows:

<div class="formula-box">
\[
\frac{\partial \rho}{\partial t} \;=\; D\,\nabla^2\rho .
\]
</div>

Started from a point source in one dimension, the solution is a Gaussian $$\rho(x,t) = (4\pi D t)^{-1/2}\exp\!\left(-x^2/4Dt\right)$$ of variance $2Dt$ — the same $\sqrt t$ spreading, now as a statement about the whole density rather than one path.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="bmspread-title bmspread-desc" viewBox="0 0 640 190" style="max-width:640px;width:100%;height:auto">
  <title id="bmspread-title">Gaussian spreading of a diffusing density at three times</title>
  <desc id="bmspread-desc">Three nested Gaussian curves from a point source under the diffusion equation, at times t equals 1, 4 and 9. Their standard deviations are 1, 2 and 3 units respectively, so the width grows as the square root of time while the peak height falls as one over the square root of time.</desc>
  <rect x="1" y="1" width="638" height="188" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="40" y1="155" x2="600" y2="155" stroke="#94a3b8" stroke-width="1"/>
  <line x1="320" y1="30" x2="320" y2="155" stroke="#cbd5e1" stroke-width="1"/>
  <polyline points="224.0,154.3 230.4,153.6 236.8,152.3 243.2,150.3 249.6,147.0 256.0,142.2 262.4,135.2 268.8,125.9 275.2,114.0 281.6,99.9 288.0,84.2 294.4,68.1 300.8,53.1 307.2,40.9 313.6,32.8 320.0,30.0 326.4,32.8 332.8,40.9 339.2,53.1 345.6,68.1 352.0,84.2 358.4,99.9 364.8,114.0 371.2,125.9 377.6,135.2 384.0,142.2 390.4,147.0 396.8,150.3 403.2,152.3 409.6,153.6 416.0,154.3" fill="none" stroke="#0e7490" stroke-width="2"/>
  <polyline points="128.0,154.6 140.8,154.3 153.6,153.7 166.4,152.6 179.2,151.0 192.0,148.6 204.8,145.1 217.6,140.4 230.4,134.5 243.2,127.5 256.0,119.6 268.8,111.6 281.6,104.1 294.4,97.9 307.2,93.9 320.0,92.5 332.8,93.9 345.6,97.9 358.4,104.1 371.2,111.6 384.0,119.6 396.8,127.5 409.6,134.5 422.4,140.4 435.2,145.1 448.0,148.6 460.8,151.0 473.6,152.6 486.4,153.7 499.2,154.3 512.0,154.6" fill="none" stroke="#0c4a6e" stroke-width="2"/>
  <polyline points="41.6,154.7 60.8,154.3 80.0,153.8 99.2,152.9 118.4,151.6 137.6,149.7 156.8,147.0 176.0,143.4 195.2,139.1 214.4,134.1 233.6,128.7 252.8,123.5 272.0,118.9 291.2,115.4 310.4,113.6 320.0,113.3 329.6,113.6 348.8,115.4 368.0,118.9 387.2,123.5 406.4,128.7 425.6,134.1 444.8,139.1 464.0,143.4 483.2,147.0 502.4,149.7 521.6,151.6 540.8,152.9 560.0,153.8 579.2,154.3 598.4,154.7" fill="none" stroke="#c2410c" stroke-width="2"/>
  <g font-size="10.5" fill="#334155">
    <text x="326" y="26">t = 1, σ = 1</text>
    <text x="398" y="88">t = 4, σ = 2</text>
    <text x="466" y="109">t = 9, σ = 3</text>
  </g>
  <text x="320" y="176" text-anchor="middle" font-size="10.5" fill="#475569">position x — width σ = √(2Dt), peak height ∝ 1/√t</text>
</svg>
<figcaption>Notice that quadrupling the time only doubles the width. The area under each curve is the same; the density does not vanish, it flattens.</figcaption>
</figure>
</div>

## The Langevin equation

Add a force. A heavy particle in a potential $V$, in a medium with friction coefficient $\gamma$, in the overdamped limit where inertia is negligible, obeys

<div class="formula-box">
\[
dx \;=\; -\frac{1}{\gamma}\nabla V(x)\,dt \;+\; \sqrt{\tfrac{2kT}{\gamma}}\;dW .
\]
</div>

Two terms, two roles: the **drift** $-\nabla V/\gamma$ pulls downhill, the **noise** kicks in random directions with a strength set by temperature. Their ratio is fixed by the fluctuation–dissipation relation, not free to choose — the same collisions that cause friction cause the kicks. The **Einstein relation** $D = \mu kT$, with mobility $\mu = 1/\gamma$, is exactly that statement.

## Fokker–Planck: what the density does

Track the density instead of the path. For $dx = f(x)\,dt + \sqrt{2D}\,dW$ the density evolves as

<div class="formula-box">
\[
\frac{\partial p}{\partial t} \;=\; -\nabla\!\cdot\!\big(f(x)\,p\big) \;+\; D\,\nabla^2 p
\;=\; -\nabla\!\cdot\! J, \qquad J = f p - D\nabla p .
\]
</div>

The first term transports probability along the drift; the second smooths it. Setting $f = -\nabla U$ and trying $$p_\infty \propto e^{-U/D}$$ gives $$D\nabla p_\infty = -\nabla U\,p_\infty = f p_\infty$$, so the current $J$ vanishes identically. The stationary state is not merely stationary but has zero flux — detailed balance. With $U = V$ and $D = kT/\gamma$ this reproduces the [Boltzmann distribution](/blog/physics-basics/statistical-mechanics/) $$p_\infty \propto e^{-V/kT}$$: equilibrium statistical mechanics falls out of a stochastic differential equation.

## The line to score-based generative models

Now run the argument backwards. You want to sample from $$p_{\text{data}}$$. Pick $$U = -\log p_{\text{data}}$$ and $D = \tfrac12$:

<div class="formula-box">
\[
dx \;=\; \tfrac12 \nabla_x \log p_{\text{data}}(x)\,dt \;+\; dW
\quad\Longrightarrow\quad
p_\infty = p_{\text{data}} .
\]
</div>

Discretised with step $\eta$, this is $$x_{k+1} = x_k + \tfrac{\eta}{2}\nabla_x\log p(x_k) + \sqrt{\eta}\,z_k$$ with $z_k\sim\mathcal N(0,I)$ — unadjusted Langevin. The only thing needed is the score $\nabla_x\log p$, which is free of the intractable normaliser, and that is precisely what a score network is trained to estimate. Song & Ermon (2019) run this at a ladder of noise levels, annealing from large to small; the continuous-time generalisation and its reverse-time SDE are covered in [score-based SDEs](/blog/diffusion/score-based-sde/).

<div class="warning-box">
  <strong>Interview trap:</strong> the noise is not an implementation detail or a regulariser. Delete it and the update is plain gradient ascent on \(\log p\), which converges to a single mode — a point mass, not a sample. The noise term is what makes the stationary distribution \(p\) itself, and the fluctuation–dissipation ratio between drift and noise is what fixes <em>which</em> distribution you get. A second frequent slip: plain Langevin also struggles because the score is badly estimated where the data density is tiny, which is the motivation for annealing over noise scales rather than any property of the sampler itself.
</div>

<div class="insight-box">
  <strong>Key Insight — optimisation and sampling are one algorithm:</strong> \(x \leftarrow x + \tfrac{\eta}{2}\nabla\log p(x)\) is gradient ascent; add \(\sqrt{\eta}\,z\) and it is a sampler. Cooling the noise to zero interpolates continuously between them, which is why simulated annealing, stochastic gradient Langevin dynamics and annealed score-based sampling are the same object at different noise schedules.
</div>

<div class="key-takeaways">
<h3>Recap</h3>
<ul>
  <li>Wiener process: independent Gaussian increments with \(\mathbb{E}[W_t^2]=t\), so displacement scales as \(\sqrt{t}\) and paths are nowhere differentiable.</li>
  <li>Fick's law \(J=-D\nabla\rho\) plus conservation gives \(\partial_t\rho = D\nabla^2\rho\), with point-source variance \(2Dt\).</li>
  <li>Langevin combines drift and noise, tied together by fluctuation–dissipation; the Einstein relation is \(D=\mu kT\).</li>
  <li>Fokker–Planck governs the density; for \(f=-\nabla U\) the zero-current stationary state is \(p_\infty\propto e^{-U/D}\).</li>
  <li>Setting \(U=-\log p_{\text{data}}\) makes Langevin a sampler for the data distribution driven only by the score — the basis of score-based generative models.</li>
</ul>
</div>

## References

1. Einstein, A. Über die von der molekularkinetischen Theorie der Wärme geforderte Bewegung von in ruhenden Flüssigkeiten suspendierten Teilchen. *Annalen der Physik*, 322(8):549–560, 1905.
2. Risken, H. *The Fokker–Planck Equation: Methods of Solution and Applications*, 2nd ed. Springer, 1989.
3. Welling, M., & Teh, Y. W. Bayesian Learning via Stochastic Gradient Langevin Dynamics. *ICML 2011*.
4. Song, Y., & Ermon, S. [Generative Modeling by Estimating Gradients of the Data Distribution](https://arxiv.org/abs/1907.05600). *NeurIPS 2019*.
5. Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., & Poole, B. [Score-Based Generative Modeling through Stochastic Differential Equations](https://arxiv.org/abs/2011.13456). *ICLR 2021*.
