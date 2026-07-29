---
layout: single
title: "Noether's Theorem: Symmetry, Conservation, and Equivariant Networks"
date: 2026-09-17
categories: [physics-basics]
book: physics-basics
subsection: symmetry
tags: [noether, symmetry, equivariance, conservation-laws]
excerpt: "Energy is conserved because the laws of physics do not care what time it is. That single sentence is Noether's theorem, and its machine learning descendant is the reason an equivariant network needs less data than one that must learn the symmetry from examples."
author_profile: true
read_time: true
is_overview: false
icon: "♾️"
read_mins: 6
permalink: /blog/physics-basics/symmetry-and-conservation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> If the action is unchanged by a continuous transformation, a specific quantity is constant along every solution. Time-translation invariance gives energy, space-translation gives momentum, rotation gives angular momentum — each is two lines of algebra from the Euler–Lagrange equation. Gauge symmetry is a different animal: a local redundancy of description whose enforcement generates the interaction. In machine learning the analogue is equivariance, which removes the symmetry directions from the hypothesis space rather than asking the model to learn them.
</div>

## The statement, and why it is not obvious

Conservation laws look like separate empirical facts: energy is conserved, momentum is conserved, angular momentum is conserved. Noether (1918) showed they are the same fact three times, each attached to a symmetry of the action.

Take the [Lagrangian](/blog/physics-basics/lagrangian-mechanics/) formulation and suppose the transformation $$q \to q + \varepsilon K(q)$$ leaves $$L$$ unchanged to first order in $$\varepsilon$$. Expanding,

<div class="formula-box">
\[
0 \;=\; \frac{\delta L}{\varepsilon} \;=\; \frac{\partial L}{\partial q}K \;+\; \frac{\partial L}{\partial \dot q}\dot K .
\]
</div>

Along a solution, Euler–Lagrange lets us substitute $$\partial L/\partial q = \frac{d}{dt}\big(\partial L/\partial\dot q\big)$$, and the two terms assemble into a single derivative:

<div class="formula-box">
\[
0 \;=\; \frac{d}{dt}\!\left(\frac{\partial L}{\partial \dot q}\right)\!K \;+\; \frac{\partial L}{\partial \dot q}\dot K
\;=\; \frac{d}{dt}\!\left(\frac{\partial L}{\partial \dot q}\,K\right).
\]
</div>

So $$Q = \dfrac{\partial L}{\partial \dot q}K(q) = p\,K(q)$$ is conserved. That is the whole theorem for the simplest case: an invariance of $$L$$ plus the equation of motion equals a constant of the motion.

## The three canonical cases

**Space translation $$\to$$ momentum.** Suppose $$L$$ does not depend on $$x$$ (free space looks the same everywhere). Then $$K = 1$$ for the shift $$x \to x + \varepsilon$$, and $$Q = \partial L/\partial\dot x = p$$. Linear momentum is conserved. Equivalently, $$\partial L/\partial x = 0$$ makes $$\dot p = 0$$ directly.

**Rotation $$\to$$ angular momentum.** An infinitesimal rotation about the axis $$\hat n$$ acts as $$\delta\mathbf r = \varepsilon\,\hat n\times\mathbf r$$, so $$K = \hat n\times\mathbf r$$. Then

$$Q = \mathbf p\cdot(\hat n\times\mathbf r) = \hat n\cdot(\mathbf r\times\mathbf p) = \hat n\cdot\mathbf L,$$

using the cyclic property of the scalar triple product. The component of angular momentum along the symmetry axis is conserved — only that component, which is why a system symmetric about one axis conserves one component and not the vector.

**Time translation $$\to$$ energy.** This case needs its own argument because the transformation shifts $$t$$ rather than $$q$$. If $$\partial L/\partial t = 0$$ then

$$\frac{dL}{dt} = \frac{\partial L}{\partial q}\dot q + \frac{\partial L}{\partial \dot q}\ddot q
= \frac{d}{dt}\!\left(\frac{\partial L}{\partial \dot q}\right)\dot q + \frac{\partial L}{\partial \dot q}\ddot q
= \frac{d}{dt}\!\left(\frac{\partial L}{\partial \dot q}\dot q\right),$$

again using Euler–Lagrange in the middle step. Rearranging, $$\frac{d}{dt}\big(p\dot q - L\big) = 0$$. The conserved quantity is the [Hamiltonian](/blog/physics-basics/hamiltonian-dynamics/) $$H = p\dot q - L$$ — the energy.

| symmetry of the action | conserved quantity |
|---|---|
| $$t \to t + \varepsilon$$ | energy $$H = p\dot q - L$$ |
| $$x \to x + \varepsilon$$ | linear momentum $$p = \partial L/\partial\dot x$$ |
| rotation about $$\hat n$$ | angular momentum $$\hat n\cdot(\mathbf r\times\mathbf p)$$ |

<div class="warning-box">
  <strong>Interview trap:</strong> Noether requires a <em>continuous</em> symmetry <em>of the action</em>. Discrete symmetries — parity, time reversal, a reflection — give no conserved current; they give selection rules and quantum numbers instead. It is also not enough for the equations of motion to be invariant: a symmetry of the equations that is not a symmetry of the action need not produce a conserved charge (scale invariance is the standard example).
</div>

## Gauge symmetry, briefly

A gauge symmetry is not a symmetry relating distinct physical states; it is a redundancy in how states are labelled. The electromagnetic potential can be shifted by $$A_\mu \to A_\mu + \partial_\mu\lambda(x)$$ with an arbitrary function $$\lambda$$ that varies from point to point, and the observable fields $$\mathbf E$$ and $$\mathbf B$$ do not change at all. Two configurations related by a gauge transformation are the same physical situation described twice.

The productive move is to *demand* such a local invariance and see what it forces. Requiring invariance under a position-dependent phase rotation of a charged field forces the introduction of a connection field to compensate the derivative — and that field is the electromagnetic potential. Interactions are generated by insisting on a local redundancy. The group-theoretic scaffolding behind all of this is developed in [symmetry and groups](/blog/geometry-basics/symmetry-and-groups/).

## Equivariance in neural networks

A map $$f$$ is equivariant to a group $$G$$ acting on inputs and outputs if

<div class="formula-box">
\[
f(\rho_{\text{in}}(g)\,x) \;=\; \rho_{\text{out}}(g)\,f(x) \qquad \text{for all } g\in G,
\]
</div>

with $$\rho$$ the relevant representations. Invariance is the special case where $$\rho_{\text{out}}$$ is trivial. Convolution is equivariant to translation; graph networks to node permutation; E(3)-equivariant networks for molecules to rotation, translation and reflection.

The benefit is structural. An unconstrained model must spend capacity and data learning that a rotated molecule has the same energy; an equivariant model cannot represent a function that violates this, so it effectively learns on the quotient of the input space by the group. Elesedy & Zaidi (2021) prove a strict generalisation gain for equivariant models in a linear setting, quantifying the intuition that the symmetry directions have been removed from the hypothesis space rather than merely discouraged.

<div class="insight-box">
  <strong>Key Insight — hard constraint versus soft penalty:</strong> data augmentation and equivariance are not the same tool. Augmentation adds examples and asks the optimiser to infer the invariance, which it satisfies only approximately and only on the data manifold it saw. An equivariant architecture makes the symmetry a property of the function class, exact everywhere including far off-distribution. The physics analogue is exact: Noether's conserved charge is exact along every solution, not an approximate regularity that holds where you happened to look.
</div>

The same logic gives energy-conserving dynamics models. Hamiltonian Neural Networks (Greydanus et al., 2019) parameterise $$H$$ with a network and obtain the vector field from $$\dot q = \partial H/\partial p$$, $$\dot p = -\partial H/\partial q$$; energy conservation is then a consequence of the parameterisation rather than a loss term that competes with fitting accuracy.

<div class="key-takeaways">
<h3>Recap</h3>
<ul>
  <li>Noether: a continuous symmetry of the action gives a conserved \(Q = \frac{\partial L}{\partial \dot q}K\), derived by substituting Euler–Lagrange into \(\delta L = 0\).</li>
  <li>Time translation gives energy, space translation gives momentum, rotation about \(\hat n\) gives \(\hat n\cdot(\mathbf r\times\mathbf p)\) — one component, not the whole vector.</li>
  <li>Discrete symmetries are outside the theorem; so are symmetries of the equations that are not symmetries of the action.</li>
  <li>Gauge symmetry is a local labelling redundancy; demanding local invariance generates the interaction field.</li>
  <li>Equivariance, \(f(\rho_{\text{in}}(g)x)=\rho_{\text{out}}(g)f(x)\), is a hard constraint on the function class — exact everywhere, unlike augmentation.</li>
</ul>
</div>

## References

1. Noether, E. Invariante Variationsprobleme. *Nachrichten von der Gesellschaft der Wissenschaften zu Göttingen*, 235–257, 1918. English translation: [arXiv:physics/0503066](https://arxiv.org/abs/physics/0503066).
2. Cohen, T., & Welling, M. [Group Equivariant Convolutional Networks](https://arxiv.org/abs/1602.07576). *ICML 2016*.
3. Elesedy, B., & Zaidi, S. [Provably Strict Generalisation Benefit for Equivariant Models](https://arxiv.org/abs/2102.10333). *ICML 2021*.
4. Greydanus, S., Dzamba, M., & Yosinski, J. [Hamiltonian Neural Networks](https://arxiv.org/abs/1906.01563). *NeurIPS 2019*.
5. Satorras, V. G., Hoogeboom, E., & Welling, M. [E(n) Equivariant Graph Neural Networks](https://arxiv.org/abs/2102.09844). *ICML 2021*.
