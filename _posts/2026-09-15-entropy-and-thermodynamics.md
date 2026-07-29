---
layout: single
title: "Entropy and Free Energy: From the Second Law to the ELBO"
date: 2026-09-15
categories: [physics-basics]
book: physics-basics
subsection: thermodynamics
tags: [entropy, free-energy, elbo, thermodynamics]
excerpt: "Thermodynamic entropy and Shannon entropy differ by a constant with units. Once you accept that, the ELBO stops being an inference trick and becomes a free energy — and diffusion models stop being a clever architecture and become a driven non-equilibrium process."
author_profile: true
read_time: true
is_overview: false
icon: "🌡️"
read_mins: 6
permalink: /blog/physics-basics/entropy-and-thermodynamics/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Gibbs entropy \(S = -k\sum p\log p\) is Shannon entropy in nats multiplied by Boltzmann's constant — same functional, different units. The second law says the entropy of an isolated system does not decrease, which is a statement about counting rather than about dynamics. Free energy \(F = U - TS\) is the trade-off between low energy and high entropy, and the ELBO of variational inference is exactly a negative free energy at temperature 1. Jarzynski's non-equilibrium work relation is the ancestor of diffusion models.
</div>

## Two entropies that turn out to be one

Boltzmann counts. For a macrostate realised by $$W$$ equally likely microstates,

$$S = k\ln W, \qquad k = 1.380649\times10^{-23}\ \mathrm{J\,K^{-1}}.$$

Gibbs generalises to unequal probabilities: $$S = -k\sum_i p_i \ln p_i$$, which reduces to $$k\ln W$$ when $$p_i = 1/W$$. Shannon, arriving from a completely different direction, defines $$H = -\sum_i p_i\log_2 p_i$$ bits. The relationship is exact and dull:

<div class="formula-box">
\[
S_{\text{thermo}} \;=\; k\ln 2 \cdot H_{\text{bits}} \;=\; k\,H_{\text{nats}} .
\]
</div>

Everything conceptual is in that "dull". The two quantities are the same functional; only the base of the logarithm and a unit conversion differ. Landauer's principle makes the identification physical: erasing one bit at temperature $$T$$ must dissipate at least $$kT\ln 2$$ of heat, which at 300 K is $$2.87\times10^{-21}$$ J. Information has a thermodynamic price.

<div class="warning-box">
  <strong>Interview trap:</strong> "entropy is disorder" will not survive a follow-up. Entropy counts the microstates consistent with the macrostate you chose to describe. It depends on the coarse-graining — on which variables you decided to track — and a state that looks disordered to one description can be low-entropy under another. The second law is also statistical, not absolute: entropy decreases are not forbidden, merely overwhelmingly improbable at macroscopic scale.
</div>

## The second law and the arrow of time

For an isolated system, $$\Delta S \ge 0$$. The awkward part is that the microscopic laws have no such asymmetry — [Hamilton's equations](/blog/physics-basics/hamiltonian-dynamics/) run backwards perfectly well, and Liouville's theorem says phase-space volume is exactly conserved, so the fine-grained Gibbs entropy of an isolated system never changes at all.

The arrow comes from coarse-graining plus initial conditions. The flow stretches and folds an initial blob into a filament that threads through the accessible region; its volume is unchanged, but any macroscopic description that cannot resolve the filaments sees it as having spread out to fill the space. Entropy increases because the system started in an atypical, small-volume macrostate and typical macrostates are vastly larger. There is no dynamical asymmetry to find — only a counting one.

## Free energy: the energy–entropy trade-off

At fixed temperature the quantity minimised is not energy but the Helmholtz free energy

<div class="formula-box">
\[
F \;=\; U - TS,
\]
</div>

with $$U = \langle E\rangle$$ the mean energy. Low $$T$$ makes the energy term dominate and the system orders; high $$T$$ makes the entropy term dominate and it disorders. Phase transitions are where the balance tips. The equilibrium distribution — the [Boltzmann distribution](/blog/physics-basics/statistical-mechanics/) — is precisely the minimiser of $$F$$ over all distributions, and its minimum value is $$F = -kT\log Z$$.

## The ELBO is a free energy

Now take a latent-variable model $$p(x,z)$$ and define an energy $$E(x,z) = -\log p(x,z)$$. For any distribution $$q(z)$$ over latents,

<div class="formula-box">
\[
\log p(x) \;=\; \underbrace{\mathbb{E}_q[\log p(x,z)] + H[q]}_{\text{ELBO } \mathcal{L}(q)} \;+\; \mathrm{KL}\big(q(z)\,\|\,p(z\mid x)\big).
\]
</div>

Rewrite the ELBO with the energy: $$-\mathcal L(q) = \mathbb E_q[E(x,z)] - H[q]$$. That is $$U - TS$$ with $$T = 1$$. Maximising the ELBO is minimising a variational free energy; the two terms are the familiar reconstruction/energy pull and the entropy pull that stops $$q$$ collapsing to a point. Because $$\mathrm{KL}\ge 0$$, the ELBO lower-bounds $$\log p(x)$$, and the gap is exactly the KL — in thermodynamic language, the excess free energy of a non-equilibrium $$q$$ over the equilibrium posterior. The equality case $$q = p(z\mid x)$$ is the statement that equilibrium minimises free energy.

<div class="insight-box">
  <strong>Key Insight — what the entropy term is doing:</strong> drop \(H[q]\) from the ELBO and the optimum is a delta function at the mode of \(p(x,z)\) — posterior collapse in its purest form. The entropy term is the only thing preventing it. This is the same role noise plays in Langevin sampling and the same role temperature plays in annealing: without an entropy contribution, every energy-minimising procedure collapses to a single point.
</div>

## Non-equilibrium work and where diffusion came from

Drive a system from one equilibrium to another by changing a parameter at finite speed. The work $$W$$ done is random — it depends on the trajectory. The second law gives only an inequality, $$\langle W\rangle \ge \Delta F$$, with equality for an infinitely slow (quasi-static) protocol. Jarzynski (1997) sharpened this to an *equality* valid at any speed:

<div class="formula-box">
\[
\big\langle e^{-\beta W}\big\rangle \;=\; e^{-\beta \Delta F}.
\]
</div>

Jensen's inequality applied to the convex exponential recovers $$\langle W\rangle \ge \Delta F$$, so the second law is a corollary. The practical content is the reverse: an equilibrium free-energy difference can be estimated from an ensemble of fast, irreversible runs, by exponentially reweighting the work.

That is the mechanism Sohl-Dickstein et al. (2015) built on. Their forward process drives the data distribution towards a simple equilibrium Gaussian through a sequence of small stochastic steps; the reverse process is learned, and the variational bound they optimise is the same exponential-work reweighting used in annealed importance sampling (Neal, 2001). Read the DDPM objective this way and the "variational bound" is a free-energy difference between the data distribution and the noise distribution. See [the diffusion overview](/blog/diffusion/overview/) for the modern form and [Brownian motion](/blog/physics-basics/diffusion-and-brownian-motion/) for the underlying process.

<div class="key-takeaways">
<h3>Recap</h3>
<ul>
  <li>Gibbs and Shannon entropy are the same functional: \(S = k\,H_{\text{nats}}\); Landauer puts a real cost of \(kT\ln 2 \approx 2.87\times10^{-21}\) J on erasing a bit at 300 K.</li>
  <li>The second law is statistical and comes from coarse-graining plus an atypical initial condition, not from any time-asymmetry in the microscopic laws.</li>
  <li>\(F = U - TS\); equilibrium minimises \(F\), and \(F_{\min} = -kT\log Z\).</li>
  <li>The negative ELBO is a variational free energy at \(T=1\) with \(E = -\log p(x,z)\); the bound gap is the KL to the true posterior.</li>
  <li>Jarzynski's equality \(\langle e^{-\beta W}\rangle = e^{-\beta\Delta F}\) implies the second law by Jensen and is the non-equilibrium idea behind diffusion models.</li>
</ul>
</div>

## References

1. Landauer, R. Irreversibility and Heat Generation in the Computing Process. *IBM Journal of Research and Development*, 5(3):183–191, 1961.
2. Jarzynski, C. [Nonequilibrium Equality for Free Energy Differences](https://arxiv.org/abs/cond-mat/9610209). *Physical Review Letters*, 78:2690, 1997.
3. Neal, R. M. [Annealed Importance Sampling](https://arxiv.org/abs/physics/9803008). *Statistics and Computing*, 11:125–139, 2001.
4. Sohl-Dickstein, J., Weiss, E., Maheswaranathan, N., & Ganguli, S. [Deep Unsupervised Learning using Nonequilibrium Thermodynamics](https://arxiv.org/abs/1503.03585). *ICML 2015*.
5. Jordan, M. I., Ghahramani, Z., Jaakkola, T. S., & Saul, L. K. An Introduction to Variational Methods for Graphical Models. *Machine Learning*, 37:183–233, 1999.
