---
layout: single
title: "Lagrangian Mechanics: Why Nature Optimises a Functional"
date: 2026-09-12
categories: [physics-basics]
book: physics-basics
subsection: mechanics
tags: [mechanics, variational-principles, euler-lagrange, physics]
excerpt: "Newton says a particle moves because a force pushes it. Lagrange says it moves along the path that makes the action stationary. The second statement is harder to believe and far easier to use — and it is the one machine learning inherited."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 6
permalink: /blog/physics-basics/lagrangian-mechanics/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Define the Lagrangian \(L = T - V\) (kinetic minus potential energy) and the action \(S = \int L\,dt\). The true trajectory is the one for which \(S\) is <em>stationary</em> under small variations. Imposing that condition gives the Euler–Lagrange equation, which reduces to \(F = ma\) for a free particle in a potential but survives unchanged in any coordinate system you like. That coordinate-independence, not elegance, is why the formulation won.
</div>

## The tension Newton leaves unresolved

Force balance works beautifully in Cartesian coordinates and becomes miserable anywhere else. A bead on a wire, a double pendulum, a rigid body — each needs constraint forces you do not care about and would rather never write down. Change coordinates and $$\mathbf{F} = m\mathbf{a}$$ changes form; new terms appear that look like forces but are artefacts of the chart.

The variational formulation removes that. You write one scalar function, pick whatever coordinates describe your system with the fewest numbers, and turn a crank.

## Action and the stationarity condition

Let $$q(t)$$ be a trajectory. Define the kinetic energy $$T$$, the potential energy $$V$$, the Lagrangian $$L(q,\dot q,t) = T - V$$, and the action

<div class="formula-box">
\[
S[q] \;=\; \int_{t_1}^{t_2} L\big(q(t),\dot q(t),t\big)\,dt .
\]
</div>

$$S$$ is a functional: it eats a whole path and returns a number. The claim is that among all paths with the same endpoints $$q(t_1)$$ and $$q(t_2)$$, the physical one makes $$S$$ stationary — its first variation vanishes.

## Deriving Euler–Lagrange

Perturb the path: $$q(t) \to q(t) + \varepsilon\,\eta(t)$$, where $$\eta$$ is arbitrary except that it vanishes at both endpoints, $$\eta(t_1)=\eta(t_2)=0$$, so the endpoints stay fixed. Expanding to first order in $$\varepsilon$$,

<div class="formula-box">
\[
\delta S \;=\; \varepsilon \int_{t_1}^{t_2}\!\left(\frac{\partial L}{\partial q}\,\eta \;+\; \frac{\partial L}{\partial \dot q}\,\dot\eta\right) dt .
\]
</div>

Integrate the second term by parts. The boundary term $$\left[\frac{\partial L}{\partial \dot q}\eta\right]_{t_1}^{t_2}$$ vanishes because $$\eta$$ does, leaving

<div class="formula-box">
\[
\delta S \;=\; \varepsilon\int_{t_1}^{t_2}\left(\frac{\partial L}{\partial q} - \frac{d}{dt}\frac{\partial L}{\partial \dot q}\right)\eta(t)\,dt .
\]
</div>

This must vanish for *every* admissible $$\eta$$, which forces the bracket to vanish pointwise — the fundamental lemma of the calculus of variations. Hence the **Euler–Lagrange equation**:

<div class="formula-box">
\[
\frac{d}{dt}\frac{\partial L}{\partial \dot q} \;-\; \frac{\partial L}{\partial q} \;=\; 0 .
\]
</div>

Note the sign and the order: the time derivative acts on the velocity partial, and the position partial is subtracted.

## Checking it reproduces $$F = ma$$

Take a particle of mass $$m$$ in one dimension moving in a potential $$V(x)$$, so $$L = \tfrac12 m\dot x^2 - V(x)$$. Then

$$\frac{\partial L}{\partial \dot x} = m\dot x, \qquad \frac{d}{dt}\frac{\partial L}{\partial \dot x} = m\ddot x, \qquad \frac{\partial L}{\partial x} = -\frac{dV}{dx}.$$

Substituting gives $$m\ddot x + \frac{dV}{dx} = 0$$, i.e. $$m\ddot x = -V'(x) = F$$. Newton's second law falls out, and the minus sign in $$L = T - V$$ is precisely what turns the potential gradient into a force with the correct direction. Had you written $$T+V$$, the force would point uphill.

## Generalised coordinates: the actual payoff

Now the case where Newton is annoying. A pendulum of mass $$m$$ and length $$\ell$$, with $$\theta$$ measured from the downward vertical. The constraint (fixed length) is absorbed by *choosing* $$\theta$$ as the only coordinate — no tension force ever appears.

| quantity | expression |
|---|---|
| kinetic | $$T = \tfrac12 m\ell^2\dot\theta^2$$ |
| potential | $$V = -mg\ell\cos\theta$$ |
| Lagrangian | $$L = \tfrac12 m\ell^2\dot\theta^2 + mg\ell\cos\theta$$ |
| $$\partial L/\partial\dot\theta$$ | $$m\ell^2\dot\theta$$ |
| $$\partial L/\partial\theta$$ | $$-mg\ell\sin\theta$$ |

Euler–Lagrange gives $$m\ell^2\ddot\theta + mg\ell\sin\theta = 0$$, so $$\ddot\theta = -(g/\ell)\sin\theta$$. Three lines, no free-body diagram, no constraint force. A quantity like $$m\ell^2\dot\theta$$ — the momentum *conjugate* to $$\theta$$ — is angular momentum here; in general $$p = \partial L/\partial\dot q$$ is whatever the coordinate makes it, which is the starting point of [Hamiltonian dynamics](/blog/physics-basics/hamiltonian-dynamics/).

<div class="insight-box">
  <strong>Key Insight — why the variational form is portable:</strong> \(L\) is a scalar, and the stationarity of \(S\) is a statement about a path, not about components in a basis. Change coordinates \(q \to Q(q)\) and the Euler–Lagrange equations in \(Q\) are obtained by simply rewriting \(L\) — the form of the equation is unchanged. Force balance has no such property, because a vector equation must be re-expressed component by component and picks up connection terms. This is the same reason machine learning objectives are written as scalar losses over whole trajectories or distributions rather than as update rules: a scalar functional transfers to a new parameterisation for free.
</div>

## Where this shows up in machine learning

The pattern "define a scalar functional, then take its variation" is everywhere. The ELBO is a functional of a distribution $$q$$, and setting its variation to zero recovers the optimal $$q$$ — see [entropy and thermodynamics](/blog/physics-basics/entropy-and-thermodynamics/). Gradient descent with vanishing step size is a gradient flow, the steepest-descent path of a functional. Optimal-control views of deep networks treat the layers as a time axis and the loss as a terminal cost, with the adjoint equations of the neural-ODE backward pass playing the role of Euler–Lagrange conditions. And Lagrangian Neural Networks (Cranmer et al., 2020) parameterise $$L$$ itself with a network, then integrate the Euler–Lagrange equation, so the learned dynamics conserve energy by construction rather than by penalty.

<div class="warning-box">
  <strong>Interview trap:</strong> it is the principle of <em>stationary</em> action, not least action. The action is a minimum only for sufficiently short time intervals; beyond a conjugate point it is a saddle. Two other reliable slips: \(L = T - V\), not \(T + V\) (that is the energy, and it is the Hamiltonian); and the Euler–Lagrange equation is second-order in \(q\), so it needs two initial conditions or two boundary conditions — the variational statement supplies the latter.
</div>

<div class="key-takeaways">
<h3>Recap</h3>
<ul>
  <li>Action \(S[q]=\int L\,dt\) with \(L = T - V\); the physical path makes \(\delta S = 0\).</li>
  <li>Euler–Lagrange: \(\frac{d}{dt}\frac{\partial L}{\partial \dot q} - \frac{\partial L}{\partial q} = 0\), derived by integration by parts with fixed endpoints.</li>
  <li>For \(L=\tfrac12 m\dot x^2 - V(x)\) it collapses to \(m\ddot x = -V'(x)\), which is \(F = ma\).</li>
  <li>Generalised coordinates absorb constraints, so constraint forces never appear; the pendulum takes three lines.</li>
  <li>The formulation is portable because \(L\) is a scalar — the same reason ML states objectives as functionals rather than update rules.</li>
</ul>
</div>

## References

1. Landau, L. D., & Lifshitz, E. M. *Mechanics* (Course of Theoretical Physics, Vol. 1), 3rd ed. Butterworth-Heinemann, 1976.
2. Cranmer, M., Greydanus, S., Hoyer, S., Battaglia, P., Spergel, D., & Ho, S. [Lagrangian Neural Networks](https://arxiv.org/abs/2003.04630). *ICLR 2020 Workshop on Deep Differential Equations*.
3. Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. [Neural Ordinary Differential Equations](https://arxiv.org/abs/1806.07366). *NeurIPS 2018*.
