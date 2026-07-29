---
layout: single
title: "Statistical Mechanics: The Boltzmann Distribution and the Cost of Z"
date: 2026-09-14
categories: [physics-basics]
book: physics-basics
subsection: thermodynamics
tags: [statistical-mechanics, boltzmann, energy-based-models, temperature]
excerpt: "Counting microstates gives you the Boltzmann distribution, and the Boltzmann distribution gives you softmax, simulated annealing and energy-based models. The partition function is not a bookkeeping constant — it is the object that contains every thermodynamic quantity, and it is intractable for exactly that reason."
author_profile: true
read_time: true
is_overview: false
icon: "🔥"
read_mins: 6
permalink: /blog/physics-basics/statistical-mechanics/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Maximise entropy subject to a fixed mean energy and you get \(p(x) \propto e^{-E(x)/kT}\). The normaliser \(Z = \sum_x e^{-E(x)/kT}\) is a sum over exponentially many states, and it is not a mere constant: derivatives of \(\log Z\) with respect to inverse temperature give the mean energy, the energy variance, and everything else. Temperature is a sharpness dial — the same dial as softmax temperature and the cooling schedule of simulated annealing. Energy-based models in ML are this distribution with \(E\) replaced by a network.
</div>

## Microstates and macrostates

A microstate is a complete specification of the system: every position, every momentum, every spin. A macrostate is what you can actually measure — energy, pressure, magnetisation. Enormously many microstates map to the same macrostate, and the whole subject is built on that many-to-one map.

The founding assumption is the one that sounds like it says nothing: for an isolated system at fixed energy, every accessible microstate is equally likely. Macroscopic regularity then comes from counting, not from dynamics. A macrostate realised by $10^{20}$ microstates dominates one realised by $10^{10}$ so overwhelmingly that fluctuations are unobservable.

## Deriving the Boltzmann distribution

Suppose the system exchanges energy with a large reservoir, so its energy is not fixed but its *mean* energy is. Which distribution over microstates should we use? Maximise the Gibbs entropy $S = -k\sum_x p(x)\log p(x)$ subject to $\sum_x p(x) = 1$ and $\sum_x p(x)E(x) = \bar E$. With Lagrange multipliers $\alpha$ and $\beta$, stationarity of

$$-k\sum_x p\log p - \alpha\Big(\sum_x p - 1\Big) - \beta\Big(\sum_x pE - \bar E\Big)$$

with respect to each $p(x)$ gives $-k(\log p(x) + 1) - \alpha - \beta E(x) = 0$, hence

<div class="formula-box">
\[
p(x) \;=\; \frac{e^{-\beta E(x)}}{Z}, \qquad Z \;=\; \sum_x e^{-\beta E(x)}, \qquad \beta = \frac{1}{kT}.
\]
</div>

The multiplier $\beta$ enforcing the energy constraint *is* inverse temperature. That identification is not a definition pulled from nowhere; it is forced by matching to the thermodynamic relation $1/T = \partial S/\partial \bar E$.

## The partition function is the whole theory

$Z$ looks like a normaliser. It is in fact the cumulant generating function of the energy. Differentiating $\log Z$ with respect to $\beta$:

<div class="formula-box">
\[
\frac{\partial \log Z}{\partial \beta} = -\langle E\rangle, \qquad
\frac{\partial^2 \log Z}{\partial \beta^2} = \langle E^2\rangle - \langle E\rangle^2 = \operatorname{Var}(E),
\]
</div>

and the Helmholtz free energy is $F = -kT\log Z = \langle E\rangle - TS$. Heat capacity, susceptibilities, phase transitions — all are derivatives of $\log Z$. Knowing $Z$ as a function of temperature and the external parameters means knowing the thermodynamics completely.

That is also why it is hard. $Z$ is a sum over every configuration: $2^N$ terms for $N$ binary spins, an integral over $\mathbb R^d$ for continuous states. For $N = 100$ spins that is $2^{100} \approx 1.3\times10^{30}$ terms.

<div class="warning-box">
  <strong>Interview trap:</strong> calling \(Z\) "just a normalising constant" is the most common slip here. It is a constant in \(x\) but a rich function of \(\beta\) and of the model parameters, and every thermodynamic observable is one of its log-derivatives. The practical corollary in ML: the <em>score</em> \(\nabla_x \log p(x) = -\nabla_x E(x)\) is free of \(Z\), which is why score-based samplers never need it — but any likelihood comparison, model selection, or evidence estimate does need it, and no amount of clever sampling makes that go away.
</div>

## Temperature as a sharpness control

Hold the energies fixed and vary $T$. As $T \to 0$, $p$ concentrates on the lowest-energy state; as $T \to \infty$, $p$ becomes uniform. A softmax over logits $z_i$ with temperature $T$,

<div class="formula-box">
\[
p_i \;=\; \frac{e^{z_i/T}}{\sum_j e^{z_j/T}},
\]
</div>

is precisely the Boltzmann distribution with energies $E_i = -z_i$ and $k = 1$. Take logits $(2.0,\,1.0,\,0.5)$:

| $T$ | $p_1$ | $p_2$ | $p_3$ |
|---|---|---|---|
| 0.5 | 0.844 | 0.114 | 0.042 |
| 1.0 | 0.629 | 0.231 | 0.140 |
| 2.0 | 0.481 | 0.292 | 0.227 |

Halving the temperature does not shift probability mass a little; it squares the odds ratio. Between states 1 and 2 the ratio is $e^{1.0}\approx 2.72$ at $T=1$ and $e^{2.0}\approx 7.39$ at $T=0.5$.

Simulated annealing exploits exactly this. Sample at high $T$, where the distribution is nearly flat and the chain can cross energy barriers; lower $T$ slowly so the chain settles into deep minima instead of the first one it meets (Kirkpatrick et al., 1983). The same logic drives the noise schedule in annealed Langevin sampling for [score-based models](/blog/diffusion/score-based-sde/), where high noise plays the role of high temperature.

<div class="insight-box">
  <strong>Key Insight — why the exponential and nothing else:</strong> the form \(e^{-\beta E}\) is not a modelling choice. It is the unique distribution that maximises entropy given a fixed mean energy, so it is the least-committed distribution consistent with what you know. Any other functional form smuggles in information you do not have. This is Jaynes's maximum-entropy argument, and it is why the same exponential family appears in logistic regression, CRFs, softmax policies and Gibbs sampling — all of them are "assume as little as possible subject to matching some expectations".
</div>

## Energy-based models

An EBM sets $$p_\theta(x) = e^{-E_\theta(x)}/Z(\theta)$$ with $$E_\theta$$ a network. The likelihood gradient splits into two terms:

<div class="formula-box">
\[
\nabla_\theta \log p_\theta(x) \;=\; -\nabla_\theta E_\theta(x) \;+\; \mathbb{E}_{x'\sim p_\theta}\!\left[\nabla_\theta E_\theta(x')\right].
\]
</div>

The first term pushes the energy of observed data down; the second pushes the energy of the model's own samples up. Because that expectation is over $$p_\theta$$, training requires sampling from the model at every step — which is why contrastive divergence, persistent chains and Langevin samplers exist. The intractability of $Z$ has simply moved from the objective into the gradient. Getting those samples is what [Langevin dynamics](/blog/physics-basics/diffusion-and-brownian-motion/) and [HMC](/blog/physics-basics/hamiltonian-dynamics/) are for.

<div class="key-takeaways">
<h3>Recap</h3>
<ul>
  <li>Maximum entropy at fixed mean energy forces \(p(x) = e^{-\beta E(x)}/Z\), with \(\beta = 1/kT\) the multiplier on the energy constraint.</li>
  <li>\(Z\) is not a bookkeeping constant: \(-\partial_\beta \log Z = \langle E\rangle\), \(\partial_\beta^2 \log Z = \operatorname{Var}(E)\), and \(F = -kT\log Z\).</li>
  <li>\(Z\) is intractable because it sums over all configurations — \(2^{100}\approx 1.3\times10^{30}\) terms for 100 binary spins.</li>
  <li>Softmax with temperature is the Boltzmann distribution with \(E_i = -z_i\); low \(T\) sharpens, high \(T\) flattens, and annealing walks from one to the other.</li>
  <li>EBM training needs samples from the model itself, because \(\nabla_\theta \log Z = -\mathbb{E}_{p_\theta}[\nabla_\theta E_\theta]\).</li>
</ul>
</div>

## References

1. Jaynes, E. T. Information Theory and Statistical Mechanics. *Physical Review*, 106(4):620–630, 1957.
2. Kirkpatrick, S., Gelatt, C. D., & Vecchi, M. P. Optimization by Simulated Annealing. *Science*, 220(4598):671–680, 1983.
3. LeCun, Y., Chopra, S., Hadsell, R., Ranzato, M., & Huang, F. [A Tutorial on Energy-Based Learning](https://www.cs.nyu.edu/~yann/research/ebm/). *Predicting Structured Data*, MIT Press, 2006.
4. Hinton, G. E. Training Products of Experts by Minimizing Contrastive Divergence. *Neural Computation*, 14(8):1771–1800, 2002.
