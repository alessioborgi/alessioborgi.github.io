---
layout: single
title: "Residual Reinforcement Learning: Teaching a Controller Its Missing Correction"
date: 2026-10-15
categories: [robotics]
book: robotics
subsection: learning
tags: [residual-RL, feedback-control, manipulation, continuous-control]
published: true
excerpt: "A useful controller need not be discarded when contact and friction defeat its model. Residual RL learns a correction around that controller, with a clearly defined action interface."
author_profile: true
read_time: true
is_overview: false
icon: "🔧"
read_mins: 4
permalink: /blog/robotics/residual-reinforcement-learning/
toc: true
toc_label: "Contents"
---

<div class="tldr-box"><strong>TL;DR:</strong> Residual reinforcement learning adds a learned action correction to an existing feedback controller. The baseline supplies useful behaviour; learning handles errors that are difficult to model. The sum must have consistent units, coordinates, and timing. A stable baseline does not automatically make the combined controller stable.</div>

{% include paper-preview.html paper="arxiv-1812-03201" %}

## Start from something that already works

**Intuition first.** A robot can move a peg close to a hole using a conventional position controller. The last few millimetres are harder: alignment errors, friction, and contact can prevent insertion. Asking a neural policy to relearn the entire approach wastes an available solution.

Residual RL decomposes the command into a baseline and a learned correction. [Johannink et al.](https://arxiv.org/abs/1812.03201) studied this combination for robot control, including physical assembly with contact. The decomposition is an architectural choice; a suitable continuous-action RL algorithm supplies the learning updates.

## Define exactly what gets added

A bounded implementation can use

<div class="formula-box">
\[
u_t=\operatorname{clip}\!\left(
u_{\mathrm{base}}(o_t)+\alpha\,\Delta u_\theta(o_t),
u_{\min},u_{\max}\right).
\]
</div>

Here $$o_t$$ is the observation, $$u_{\mathrm{base}}$$ the baseline command, $$\Delta u_\theta$$ the learned residual, and $$\alpha$$ its scale. The clipping and scaling shown here are design choices, not a stability theorem.

A torque residual adds torque to torque. A Cartesian displacement residual modifies a pose target before an inner tracking controller acts. A normalised policy output needs conversion into the command's physical units. These interfaces create different learning problems, even if they use the same neural network.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="res-title res-desc" viewBox="0 0 640 190" style="width:100%;max-width:640px;height:auto">
<title id="res-title">A baseline and residual combine before the robot acts</title>
<desc id="res-desc">Observations feed a baseline controller and a learned residual. Their commands are added, limited, and passed to the robot.</desc>
<rect width="640" height="190" rx="10" fill="#f8fafc"/>
<path d="M110 95 L160 45 M110 95 L160 145 M325 45 L385 95 M325 145 L385 95 M425 95 H460" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="70" width="100" height="50" rx="8" fill="#e2e8f0"/>
<rect x="160" y="20" width="165" height="50" rx="8" fill="#dbeafe"/><rect x="160" y="120" width="165" height="50" rx="8" fill="#ede9fe"/>
<circle cx="405" cy="95" r="20" fill="#ccfbf1"/><rect x="460" y="70" width="165" height="50" rx="8" fill="#dbeafe"/>
<g font-family="sans-serif" font-size="15" text-anchor="middle" fill="#1e293b"><text x="60" y="100">observe</text><text x="242" y="50">baseline</text><text x="242" y="150">scaled residual</text><text x="405" y="101">+</text><text x="542" y="100">limit → robot</text></g>
</svg>
<figcaption>Both branches act through a shared command interface. The robot receives the combined command, so training must account for that combination.</figcaption>
</figure></div>

## Worked example: a correction measured in newtons

Consider an illustrative one-dimensional force command. The baseline requests $$8$$ N, the residual policy outputs $$-0.3$$, and the scale is $$\alpha=5$$ N per policy unit. Before limiting,

<div class="formula-box">
\[
u=8+5(-0.3)=6.5\;\mathrm N.
\]
</div>

For command bounds $$[-10,10]$$ N, this remains $$6.5$$ N. If the policy instead outputs $$+0.8$$, the requested $$12$$ N is limited to $$10$$ N. Increasing the residual further then produces no additional force command. Saturation changes the action-to-outcome relationship seen by the learner.

These are arithmetic examples, not operating settings for a particular robot. A real force interface also requires its reference frame, control rate, and measured feedback to be specified.

## Which action belongs in replay?

Suppose the RL action is the residual $$a_t=\Delta u_t$$. Then the environment presented to the learner includes the baseline controller and command limiter. Replay should store that residual action and the resulting transition; the critic estimates the return for residual choices.

If instead replay stores the executed total command, the actor and critic must consistently use that total-command interpretation. Mixing residual actions during optimisation with total commands in replay silently changes the meaning of $$Q(s,a)$$.

Keep the baseline fixed during a comparison. If it contains an integrator or another internal state that affects future commands, include sufficient information in the learning observation or acknowledge the resulting partial observability.

## How to tell whether the correction helps

Compare the baseline alone, the baseline plus learned residual, and a policy trained without the baseline under the same interaction budget. Record completion rate, peak contact forces, saturation frequency, and residual magnitude. A successful trial that constantly hits actuator limits reveals a different controller from one that uses small corrections.

Zero residual should recover the baseline, provided its commands already satisfy the same limits. That gives a simple interface check before any learning is involved.

<div class="insight-box"><strong>Key Insight:</strong> A residual reduces what must be learned only when the baseline makes the remaining problem easier. A baseline that repeatedly drives away from useful states can make exploration harder instead.</div>

For the underlying actor-critic machinery, see [TD3](/blog/rl/td3/). For a different way to reuse existing structure, [learned model predictive control](/blog/robotics/learned-model-predictive-control/) learns dynamics and keeps an explicit planning loop.

## References

1. Johannink, T., Bahl, S., Nair, A., et al. [Residual Reinforcement Learning for Robot Control](https://arxiv.org/abs/1812.03201). *ICRA 2019*.
