---
layout: single
title: "Physics for Machine Learning: Why the Same Equations Keep Coming Back"
date: 2026-09-11
categories: [physics-basics]
book: physics-basics
subsection: foundations
tags: [physics, statistical-mechanics, thermodynamics, overview]
excerpt: "Diffusion models, energy-based models and Hamiltonian Monte Carlo were not inspired by physics — they are physics, rewritten with a neural network in place of an analytic potential. Knowing which physics saves you from re-deriving it badly."
author_profile: true
read_time: true
is_overview: true
icon: "⚛️"
read_mins: 5
permalink: /blog/physics-basics/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Three of the most-used tools in modern generative modelling are physics with the labels changed. Diffusion models are a discretised non-equilibrium process; energy-based models are the Boltzmann distribution with a learned energy; Hamiltonian Monte Carlo is literally Hamilton's equations, and it works because of volume preservation. Symmetry arguments from Noether's theorem explain why equivariant architectures generalise. This book covers the six pieces of physics that keep reappearing, at the depth an interview actually probes.
</div>

## The pattern worth noticing

An interviewer rarely asks "what is the second law of thermodynamics". They ask why diffusion models need many small steps, or why Hamiltonian Monte Carlo uses a leapfrog integrator, or what temperature does in a softmax. Each of those has a one-line answer if you know the physics and a confused one if you do not.

The reason is historical and not accidental. Sampling from a complicated high-dimensional distribution is the central computational problem of statistical mechanics, and it has been for a century. Machine learning inherited the problem — and, with it, the solutions.

## Four lines of descent

**Diffusion models come from non-equilibrium thermodynamics.** The founding paper, Sohl-Dickstein et al. (2015), is explicit about it: take a data distribution, drive it towards a simple equilibrium with a slow stochastic process, and learn to reverse the drive. The mathematics of "slowly destroy structure, then undo it" is the mathematics of annealed importance sampling and of the Jarzynski equality. [Entropy and thermodynamics](/blog/physics-basics/entropy-and-thermodynamics/) covers that ancestry; [diffusion and Brownian motion](/blog/physics-basics/diffusion-and-brownian-motion/) covers the stochastic process itself.

**Energy-based models come from statistical mechanics.** Write any positive density as

<div class="formula-box">
\[
p_\theta(x) = \frac{e^{-E_\theta(x)}}{Z(\theta)}, \qquad Z(\theta) = \int e^{-E_\theta(x)}\,dx
\]
</div>

where $$E_\theta$$ is a learned energy and $$Z(\theta)$$ the partition function. This is the Boltzmann distribution at unit temperature. Every difficulty in training such a model — the intractable normaliser, the need for MCMC in the gradient, the role of temperature — is a difficulty statistical physics met first.

**Hamiltonian Monte Carlo comes from mechanics.** HMC invents a fictitious momentum, writes down a Hamiltonian, and integrates the resulting dynamics. It works because Hamiltonian flow preserves phase-space volume and is reversible, which is exactly what makes the Metropolis–Hastings acceptance ratio collapse to an energy difference. Neal's review (2011) is the standard reference.

**Symmetry arguments come from Noether.** Every continuous symmetry of the action gives a conserved quantity. The modern echo is equivariant networks: build the symmetry into the architecture and the model no longer has to learn it from data.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="pbmap-title pbmap-desc" viewBox="0 0 640 210" style="max-width:640px;width:100%;height:auto">
  <title id="pbmap-title">Map from physics topics to machine learning methods</title>
  <desc id="pbmap-desc">Four arrows run from a left column of physics topics to a right column of machine learning methods. Hamiltonian mechanics maps to Hamiltonian Monte Carlo. Statistical mechanics maps to energy-based models and softmax temperature. Non-equilibrium thermodynamics and Langevin dynamics map to diffusion and score-based models. Noether symmetry maps to equivariant neural networks.</desc>
  <rect x="1" y="1" width="638" height="208" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="140" y="24" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0c4a6e">Physics</text>
  <text x="500" y="24" text-anchor="middle" font-size="11.5" font-weight="700" fill="#c2410c">Machine learning</text>
  <g font-size="10.5" fill="#334155" text-anchor="middle">
    <rect x="20" y="36" width="240" height="30" rx="5" fill="#e0f2fe" stroke="#0e7490"/><text x="140" y="55">Hamiltonian mechanics, Liouville</text>
    <rect x="20" y="78" width="240" height="30" rx="5" fill="#e0f2fe" stroke="#0e7490"/><text x="140" y="97">Boltzmann distribution, partition fn</text>
    <rect x="20" y="120" width="240" height="30" rx="5" fill="#e0f2fe" stroke="#0e7490"/><text x="140" y="139">Langevin / non-equilibrium</text>
    <rect x="20" y="162" width="240" height="30" rx="5" fill="#e0f2fe" stroke="#0e7490"/><text x="140" y="181">Noether: symmetry → conservation</text>
  </g>
  <g font-size="10.5" fill="#334155" text-anchor="middle">
    <rect x="380" y="36" width="240" height="30" rx="5" fill="#ffedd5" stroke="#c2410c"/><text x="500" y="55">Hamiltonian Monte Carlo</text>
    <rect x="380" y="78" width="240" height="30" rx="5" fill="#ffedd5" stroke="#c2410c"/><text x="500" y="97">Energy-based models, softmax T</text>
    <rect x="380" y="120" width="240" height="30" rx="5" fill="#ffedd5" stroke="#c2410c"/><text x="500" y="139">Diffusion &amp; score-based models</text>
    <rect x="380" y="162" width="240" height="30" rx="5" fill="#ffedd5" stroke="#c2410c"/><text x="500" y="181">Equivariant architectures</text>
  </g>
  <g stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#pbarr)">
    <line x1="264" y1="51" x2="374" y2="51"/><line x1="264" y1="93" x2="374" y2="93"/>
    <line x1="264" y1="135" x2="374" y2="135"/><line x1="264" y1="177" x2="374" y2="177"/>
  </g>
  <defs><marker id="pbarr" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#475569"/></marker></defs>
</svg>
<figcaption>Each arrow is a derivation, not an analogy. Notice that the two columns are not related methods — the right column is the left column applied to a learned energy or a learned score.</figcaption>
</figure>
</div>

## Temperature, in one example

The clearest single case is temperature. The Boltzmann distribution over states with energies $$E_i$$ at temperature $$T$$ is $$p_i \propto e^{-E_i/T}$$. A softmax over logits $$z_i$$ is $$p_i \propto e^{z_i/T}$$. These are the same expression with $$E_i = -z_i$$. Take logits $$(2.0,\,1.0,\,0.5)$$:

| $$T$$ | resulting probabilities |
|---|---|
| 0.5 | 0.844, 0.114, 0.042 |
| 1.0 | 0.629, 0.231, 0.140 |
| 2.0 | 0.481, 0.292, 0.227 |

Low temperature concentrates on the lowest-energy state; high temperature flattens towards uniform. Simulated annealing, nucleus sampling and the noise schedule of a diffusion model are all versions of the same lever.

<div class="insight-box">
  <strong>Key Insight — why physics keeps winning:</strong> physics spent a century on one problem machine learning cannot avoid: given an unnormalised density \(e^{-E(x)}\) over a space with \(10^6\) dimensions, produce samples and estimate expectations without ever computing the normaliser. Every technique that survived — Metropolis, annealing, Langevin dynamics, Hamiltonian flow — transfers unchanged when \(E\) becomes a neural network, because none of them ever needed \(E\) to have a closed form.
</div>

## What the rest of the book covers

- **[Lagrangian mechanics](/blog/physics-basics/lagrangian-mechanics/)** — stationary action, $$L = T - V$$, the Euler–Lagrange equation, and why a variational formulation travels better than force balance.
- **[Hamiltonian dynamics](/blog/physics-basics/hamiltonian-dynamics/)** — phase space, Liouville's theorem, and why HMC needs a symplectic integrator.
- **[Statistical mechanics](/blog/physics-basics/statistical-mechanics/)** — microstates, the Boltzmann distribution, and what the partition function really is.
- **[Entropy and thermodynamics](/blog/physics-basics/entropy-and-thermodynamics/)** — Gibbs versus Shannon entropy, free energy as the ELBO, and the non-equilibrium origin of diffusion.
- **[Diffusion and Brownian motion](/blog/physics-basics/diffusion-and-brownian-motion/)** — Wiener processes, Langevin and Fokker–Planck, and the sampler behind [score-based models](/blog/diffusion/score-based-sde/).
- **[Symmetry and conservation](/blog/physics-basics/symmetry-and-conservation/)** — Noether's theorem and equivariant architectures.

<div class="warning-box">
  <strong>Interview trap:</strong> saying diffusion models are "inspired by" thermodynamics understates the connection and invites a follow-up you will not enjoy. The forward process <em>is</em> a discretised Ornstein–Uhlenbeck process, its stationary distribution <em>is</em> the equilibrium Gaussian, and the reverse-time SDE is a standard result from stochastic process theory. Claim the derivation, not the metaphor.
</div>

<div class="key-takeaways">
<h3>Recap</h3>
<ul>
  <li>Sampling from an unnormalised high-dimensional density is a physics problem first and a machine learning problem second; the algorithms transferred wholesale.</li>
  <li>Softmax temperature and the Boltzmann distribution are the same formula with \(E = -z\).</li>
  <li>HMC works because of volume preservation and reversibility, not because Hamiltonian dynamics is a good heuristic.</li>
  <li>Diffusion models descend directly from non-equilibrium thermodynamics (Sohl-Dickstein et al., 2015), not by analogy.</li>
  <li>Noether's theorem is the reason symmetry constraints buy generalisation: a symmetry of the objective is a structural fact, not a regulariser.</li>
</ul>
</div>

## References

1. Sohl-Dickstein, J., Weiss, E., Maheswaranathan, N., & Ganguli, S. [Deep Unsupervised Learning using Nonequilibrium Thermodynamics](https://arxiv.org/abs/1503.03585). *ICML 2015*.
2. Neal, R. M. [MCMC using Hamiltonian dynamics](https://arxiv.org/abs/1206.1901). *Handbook of Markov Chain Monte Carlo*, 2011.
3. Song, Y., & Ermon, S. [Generative Modeling by Estimating Gradients of the Data Distribution](https://arxiv.org/abs/1907.05600). *NeurIPS 2019*.
4. LeCun, Y., Chopra, S., Hadsell, R., Ranzato, M., & Huang, F. [A Tutorial on Energy-Based Learning](https://www.cs.nyu.edu/~yann/research/ebm/). *Predicting Structured Data*, MIT Press, 2006.
