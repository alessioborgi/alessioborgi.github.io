---
layout: single
title: "Rapid Motor Adaptation: Inferring the Ground from the Way You Move"
date: 2026-10-15
categories: [robotics]
book: robotics
subsection: learning
tags: [RMA, locomotion, sim-to-real, adaptation]
published: true
excerpt: "A legged robot cannot directly read ground friction or payload mass. RMA learns a compact context from recent motion and actions, then conditions its control policy on that estimate."
author_profile: true
read_time: true
is_overview: false
icon: "🐾"
read_mins: 4
permalink: /blog/robotics/rapid-motor-adaptation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box"><strong>TL;DR:</strong> Rapid Motor Adaptation (RMA) trains a policy with privileged simulator information, then replaces that information with a latent estimate inferred from recent robot states and actions. At deployment the context changes through inference, while the network weights remain fixed. This is adaptation of behaviour without an online gradient-training loop.</div>

{% include paper-preview.html paper="arxiv-2107-04034" %}

## The same command can reveal a different world

**Intuition first.** A quadruped commands a step. On firm ground its body advances; on a slippery surface the foot moves but the body hardly follows. That mismatch contains information about the environment, even if the robot has no sensor that directly measures friction.

One instantaneous joint configuration may fit both situations. Recent motion together with the commands that caused it is more informative. The question becomes: what part of that history matters for choosing the next action?

## Privileged training, observable deployment

Let $$e_t$$ contain simulator-only environmental factors. An encoder $$\mu$$ maps them to a compact latent $$z_t$$. During initial training, a base policy uses this context. An adaptation network $$\phi$$ then learns to predict it from observable history:

<div class="formula-box">
\[
\begin{aligned}
z_t &= \mu(e_t),\\
\hat z_t &= \phi(x_{t-k:t-1},a_{t-k:t-1}),\\
\mathcal L_{\mathrm{adapt}} &= \mathbb E\|\hat z_t-z_t\|_2^2,\\
a_t &= \pi(x_t,a_{t-1},\hat z_t).
\end{aligned}
\]
</div>

Here $$x_t$$ is the observable robot state and $$a_t$$ the policy action. Adaptation training includes trajectories generated using the predicted context, exposing the estimator to its own errors. This two-stage procedure is described in [Kumar et al.](https://arxiv.org/abs/2107.04034).

The latent need not equal friction, mass, or another interpretable physical parameter. Its purpose is to carry information useful to the policy.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="rma-title rma-desc" viewBox="0 0 640 220" style="width:100%;max-width:640px;height:auto">
<title id="rma-title">Training context and deployment context enter the same policy</title>
<desc id="rma-desc">During training, simulator factors pass through an encoder to provide a latent target. At deployment, recent states and actions pass through an adaptation module to estimate that latent for the policy.</desc>
<rect width="640" height="220" rx="10" fill="#f8fafc"/>
<rect x="20" y="35" width="190" height="50" rx="8" fill="#ede9fe"/><rect x="260" y="35" width="150" height="50" rx="8" fill="#ede9fe"/>
<rect x="20" y="135" width="190" height="50" rx="8" fill="#dbeafe"/><rect x="260" y="135" width="150" height="50" rx="8" fill="#ccfbf1"/><rect x="475" y="135" width="145" height="50" rx="8" fill="#dbeafe"/>
<path d="M210 60 H260 M210 160 H260 M410 160 H475" stroke="#64748b" stroke-width="2"/>
<path d="M335 85 V135" stroke="#7c3aed" stroke-width="2" stroke-dasharray="5 4"/>
<g font-family="sans-serif" font-size="14" text-anchor="middle" fill="#1e293b"><text x="115" y="65">simulator factors</text><text x="335" y="65">encoder → z</text><text x="115" y="165">state/action history</text><text x="335" y="165">adaptation → ẑ</text><text x="548" y="165">base policy</text><text x="460" y="112">training target</text><text x="320" y="207">Deployment uses the lower path.</text></g>
</svg>
<figcaption>The privileged encoder supplies a supervised target in simulation. It is not an extra physical sensor available to the deployed robot.</figcaption>
</figure></div>

## Worked example: why action history matters

Consider a toy scalar system where commanded input $$u_t$$ produces displacement $$\Delta x_t=b u_t$$. The unknown gain $$b$$ summarises how effectively the command moves the system. This is an illustration of identification, not RMA's physical model.

Given commands $$[1,2]$$ and measured displacements $$[0.4,0.8]$$, least squares estimates

<div class="formula-box">
\[
\hat b=\frac{\sum_t u_t\Delta x_t}{\sum_t u_t^2}
=\frac{1(0.4)+2(0.8)}{1^2+2^2}=0.4.
\]
</div>

But the same displacements under commands $$[0.5,1]$$ imply $$\hat b=0.8$$. Observed motion alone does not distinguish these gains. The input–response relationship does.

Now set both commands to zero. The denominator vanishes: the history contains no information about how strongly the system would respond. A learned estimator cannot reliably recover distinctions that the observations never reveal.

## Adaptation is not necessarily retraining

At deployment, a new history changes $$\hat z_t$$, and the same policy weights produce a different action. No gradient step is needed for that change. Calling this online adaptation is appropriate, but calling it online policy optimisation would describe a different mechanism.

A deployment can also update the context less often than the motor policy. The control loop then uses the most recent estimate. This saves computation but introduces a delay between a physical change and the context used for control; the original RMA system uses this asynchronous arrangement. [Kumar et al.](https://arxiv.org/html/2107.04034v1)

## Evaluate the transition, not just the final gait

An informative experiment changes a payload or surface during a rollout and measures both immediate degradation and recovery. A good final gait can hide a long period of poor control after the change.

Compare an oracle-context policy, the inferred-context policy, and a fixed-context baseline. Keep command sequences and initial conditions comparable. Log failures as well as recovery times, and specify which perturbations were represented during training.

<div class="insight-box"><strong>Key Insight:</strong> The adaptation module estimates what the recent interaction reveals. It cannot identify a new surface before the robot has received informative evidence about it.</div>

For another way to incorporate experience into future control, see [learned MPC](/blog/robotics/learned-model-predictive-control/). For learning a direct correction around a controller, see [residual RL](/blog/robotics/residual-reinforcement-learning/).

## References

1. Kumar, A., Fu, Z., Pathak, D., & Malik, J. [RMA: Rapid Motor Adaptation for Legged Robots](https://arxiv.org/abs/2107.04034). *RSS 2021*.
