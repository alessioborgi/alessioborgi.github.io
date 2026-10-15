---
layout: single
categories:
- robotics
book: robotics
subsection: foundations
author_profile: true
read_time: true
is_overview: false
permalink: /blog/robotics/robot-learning-basics/
toc: true
toc_label: Contents
title: 'Robot Learning Basics: Demonstrations, Rewards, and Models'
excerpt: Compare behaviour cloning, reinforcement learning, and learned dynamics using the same robot task. Understand data coverage and closed-loop evaluation before the paper chapters.
published: true
read_mins: 4
last_modified_at: '2026-10-15'
tags:
- robot-learning
- imitation-learning
- reinforcement-learning
- foundations
icon: 🎓
---

<div class="tldr-box"><strong>TL;DR:</strong> Demonstrations provide examples of actions, rewards judge outcomes, and dynamics data teaches a model what follows an action. These are different learning signals. A robot policy must ultimately work on the observations it encounters during its own execution.</div>

## Start with what the dataset actually contains

**Intuition first.** For a cup-picking task, a demonstrator might supply camera images paired with gripper commands. Another dataset might contain trial trajectories labelled by task success. A third records state transitions and actions for learning a predictor. Each supports a different immediate training objective.

A demonstration's action is an example of what someone did. A reward is an assessment of an outcome. A next-state observation describes what happened. They are not interchangeable labels.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="robot-learning-title robot-learning-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="robot-learning-title">Training signals connect to different predictions</title>
<desc id="robot-learning-desc">Demonstrations train action prediction, rewards guide return optimisation, and transitions train dynamics. Evaluate the resulting behaviour in a closed loop.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Data and objective</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Learned component</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Robot execution</text></g>
</svg>
<figcaption>Demonstrations train action prediction, rewards guide return optimisation, and transitions train dynamics. Evaluate the resulting behaviour in a closed loop.</figcaption>
</figure></div>

## Behaviour cloning: predict the demonstrated action

For observation-action pairs $$(o_i,a_i)$$ and a deterministic continuous-action policy, a simple objective is

<div class="formula-box">
\[
\mathcal L_{\mathrm{BC}}(\theta)=\frac{1}{N}\sum_i
\|\pi_\theta(o_i)-a_i\|_2^2.
\]
</div>

This is supervised learning applied to action prediction. Stochastic policies can instead maximise demonstration likelihood. The choice matters when several actions are valid for the same observation. [Imitation-learning notes](https://underactuated.mit.edu/imitation.html).

## Worked example: a reasonable average can be a bad command

Suppose two demonstrations contain effectively identical observations but choose lateral displacement commands of $$-0.1$$ and $$+0.1$$ metres. A scalar prediction $$u$$ has loss

<div class="formula-box">
\[
\begin{aligned}
\mathcal L(u)&=\tfrac12[(u+0.1)^2+(u-0.1)^2]\\
&=u^2+0.01.
\end{aligned}
\]
</div>

The minimum is $$u=0$$. If the demonstrations steer around opposite sides of an obstacle, their average may head into it. This example explains why a small regression error alone does not establish a useful policy, and why history, task conditioning, or a multimodal action distribution may matter.

## Reinforcement learning: improve expected return

RL trains using a reward objective and interaction data, either collected during learning or supplied in a fixed dataset. Its basic goal is to choose a policy with high expected accumulated reward. A reward may be sparse, so identifying which earlier actions helped can be difficult.

Read the [RL introduction](/blog/rl/rl-overview/) before interpreting an algorithm's success rate as a statement about its objective. For example, rewarding motion towards a cup can encourage approach without establishing a secure grasp.

## Model learning: predict consequences before choosing

A dynamics model learns a relationship such as $$\hat x_{t+1}=f_\phi(x_t,a_t)$$. A planner can then compare proposed action sequences. Predicting next state and selecting actions are separate computations; good one-step predictions do not guarantee accurate long rollouts or useful planning costs.

The categories can be combined. Demonstrations can initialise a policy, rewards can refine it, and a learned model can support planning or data generation.

## Evaluate complete executions

A cloned policy's small mistake changes its next observation. Repeated mistakes can lead to situations missing from the demonstrations. This distribution shift is central to imitation learning. Split data by complete trajectories rather than neighbouring frames, then test closed-loop execution from varied starts.

Also preserve action semantics. A displacement in the gripper frame, a position in the base frame, and a joint torque require different labels and interfaces even if each is stored as a vector of numbers.

<div class="insight-box"><strong>Key Insight:</strong> The learning signal determines what training can directly improve. The robot's task outcome must still be measured through complete executions with the intended observations and action interface.</div>

Next read [learned MPC](/blog/robotics/learned-model-predictive-control/) for model-based action selection, [ACT](/blog/robotics/action-chunking-transformers/) for demonstration-based sequences, and [residual RL](/blog/robotics/residual-reinforcement-learning/) for reward-based corrections.

## References

1. Tedrake, R. [Underactuated Robotics: Imitation Learning](https://underactuated.mit.edu/imitation.html).
2. OpenAI. [Spinning Up: Key Concepts in RL](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html).
