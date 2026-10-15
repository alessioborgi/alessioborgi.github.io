---
layout: single
title: "Learned Model Predictive Control: Plan with a Model, Correct with Reality"
date: 2026-10-15
categories: [robotics]
book: robotics
subsection: planning
tags: [MPC, PETS, model-based-RL, uncertainty]
published: true
excerpt: "A learned dynamics model can score possible robot futures. Receding-horizon control executes the first action, observes what really happened, and plans again; ensembles expose some of the model's uncertainty."
author_profile: true
read_time: true
is_overview: false
icon: "🔭"
read_mins: 5
permalink: /blog/robotics/learned-model-predictive-control/
toc: true
toc_label: "Contents"
---

<div class="tldr-box"><strong>TL;DR:</strong> Learned model predictive control (MPC) fits dynamics from transitions, searches for a good action sequence, executes its first action, then replans from the next observation. PETS combines probabilistic dynamics ensembles with sampled trajectory rollouts. Replanning limits commitment to an inaccurate prediction, but it cannot undo a bad action already executed.</div>

{% include paper-preview.html paper="arxiv-1805-12114" %}

## Learning what happens next

**Intuition first.** To push a block onto a target, a robot can predict where several candidate pushes would move it, choose a promising one, and check the actual result. It does not have to learn a direct mapping from every possible scene to the best command.

Assume an observed state $$s_t$$ sufficient for prediction. A learned dynamics model might predict a state increment,

<div class="formula-box">
\[
\hat s_{t+1}=\hat s_t+f_\theta(\hat s_t,a_t).
\]
</div>

For a horizon $$H$$, stage cost $$c$$, and terminal cost $$c_H$$, planning chooses

<div class="formula-box">
\[
(a_0^*,\ldots,a_{H-1}^*)=
\arg\min_{a_{0:H-1}}\;
\mathbb E_{\hat p_\theta}\left[
\sum_{k=0}^{H-1}c(\hat s_k,a_k)+c_H(\hat s_H)
\right],\qquad \hat s_0=s_t.
\]
</div>

Execute only $$a_0^*$$. At the next step replace the predicted state with the observation and solve again. The horizon moves forward with the robot.

## Worked example: replanning corrects a wrong gain

Take a one-dimensional system $$x_{t+1}=x_t+b a_t$$, start at $$x_0=0$$, and target $$x=1$$. Suppose the model assumes $$b=1$$, whereas the real gain is $$0.8$$. Bound each action to $$[-0.6,0.6]$$.

A candidate two-step plan $$[0.5,0.5]$$ predicts arrival at the target. Executing it open-loop actually gives

<div class="formula-box">
\[
x_2=0.8(0.5)+0.8(0.5)=0.8.
\]
</div>

Instead, execute the first $$0.5$$ and observe $$x_1=0.4$$. Even without updating the incorrect model, a new candidate command $$0.6$$ now predicts reaching the target in one step. Reality gives $$x_2=0.4+0.8(0.6)=0.88$$.

This particular correction reduces the error from $$0.20$$ to $$0.12$$. It does not eliminate it. The example compares illustrative candidate sequences, not solutions to an unspecified cost function.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="mpc-title mpc-desc" viewBox="0 0 640 210" style="width:100%;max-width:640px;height:auto">
<title id="mpc-title">The receding-horizon control loop</title>
<desc id="mpc-desc">Observe the state, predict candidate futures, choose a sequence, execute its first action, then return to a fresh observation.</desc>
<rect width="640" height="210" rx="10" fill="#f8fafc"/>
<g fill="#dbeafe"><rect x="20" y="60" width="130" height="60" rx="8"/><rect x="175" y="60" width="130" height="60" rx="8"/><rect x="330" y="60" width="130" height="60" rx="8"/></g>
<rect x="485" y="60" width="135" height="60" rx="8" fill="#ccfbf1"/>
<g stroke="#64748b" stroke-width="2" fill="none"><path d="M150 90 H175 M305 90 H330 M460 90 H485"/><path d="M552 120 V165 H85 V120"/></g>
<g font-family="sans-serif" font-size="14" text-anchor="middle" fill="#1e293b"><text x="85" y="95">observe</text><text x="240" y="95">predict futures</text><text x="395" y="85">choose</text><text x="395" y="105">sequence</text><text x="552" y="85">execute</text><text x="552" y="105">first action</text><text x="320" y="192">Replan from the measured state.</text></g>
</svg>
<figcaption>Only the first command is committed. Later commands are proposals that can change after the next observation.</figcaption>
</figure></div>

## What PETS adds

PETS trains an ensemble of probabilistic neural dynamics models. Within-model predictive variation represents transition noise; disagreement across models provides an approximation to uncertainty from limited data. Candidate action sequences are evaluated with sampled particles propagated through these models. A sampling optimiser, such as the cross-entropy method, searches the sequence space. [Chua et al.](https://arxiv.org/abs/1805.12114)

In cross-entropy optimisation, sample sequences, score them, keep an elite subset, and refit the sampling distribution. Repeat within the computation budget. This searches over future actions; it does not require fitting an actor network.

| Uncertainty | Example | What additional data can do |
|---|---|---|
| Aleatoric | Similar pushes produce variable displacement | Characterise the variability |
| Epistemic | The dataset contains few pushes at this speed | Reduce uncertainty in the fitted model |

These labels describe an intended decomposition. An ensemble is an approximation, and shared modelling assumptions can make all members confidently wrong.

## Expected cost is not a safety guarantee

Imagine a candidate with a 95% chance of cost zero and a 5% chance of cost 100. Its expected cost is five. A second candidate always costs six. An expected-cost planner prefers the first, even if its rare outcome represents an unacceptable collision.

If that distinction matters, the optimisation problem needs suitable constraints or a risk-sensitive objective. Neither an ensemble nor frequent replanning automatically supplies one. This follows directly from what the objective averages.

## Match prediction tests to the planner

Inspect multi-step rollouts under candidate actions, not only one-step prediction error on logged data. The optimiser may discover sequences where model errors compound. Measure planning latency too: a mathematically better plan that misses the control deadline uses stale information.

<div class="insight-box"><strong>Key Insight:</strong> Feedback buys repeated opportunities to correct a prediction. Its value depends on observing soon enough, planning fast enough, and avoiding actions whose consequences cannot be corrected.</div>

[ACT](/blog/robotics/action-chunking-transformers/) also predicts action sequences, but learns them directly from demonstrations rather than scoring them through a dynamics model. [Rapid motor adaptation](/blog/robotics/rapid-motor-adaptation/) instead uses recent interaction to condition a learned control policy.

## References

1. Chua, K., Calandra, R., McAllister, R., & Levine, S. [Deep Reinforcement Learning in a Handful of Trials using Probabilistic Dynamics Models](https://arxiv.org/abs/1805.12114). *NeurIPS 2018*.
