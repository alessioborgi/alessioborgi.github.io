---
layout: single
title: 'Bellman Equations: Value as Reward Plus What Comes Next'
categories:
- rl
book: rl
subsection: foundations
tags:
- Bellman
- value-functions
- dynamic-programming
- foundations
published: true
excerpt: Build the Bellman equations from the return, then calculate a small value-iteration example by hand. Separate evaluating a policy from improving it.
author_profile: true
read_time: true
is_overview: false
icon: ⚖️
read_mins: 4
permalink: /blog/rl/bellman-equations/
toc: true
toc_label: Contents
last_modified_at: '2026-10-15'
---

<div class="tldr-box"><strong>TL;DR:</strong> The Bellman equation decomposes value into immediate reward and discounted continuation value. Evaluating a policy averages over its actions; finding the optimal value selects the best action. Dynamic programming uses a transition model to perform these backups.</div>

## Break a long journey into one step and the remainder

**Intuition first.** To estimate the cost of a journey, combine the next segment with the estimated cost from its endpoint. RL uses the same recursive structure for expected reward.

With the reward convention from the [MDP chapter](/blog/rl/mdp/), return satisfies $$G_t=R_{t+1}+\gamma G_{t+1}$$. Taking the expectation under a policy gives the Bellman expectation equation:

<div class="formula-box">
\[
V^\pi(s)=\sum_a\pi(a\mid s)\sum_{s'}P(s'\mid s,a)
\left[r(s,a,s')+\gamma V^\pi(s')\right].
\]
</div>

Here $$V^\pi(s)$$ means expected return starting in state $$s$$ and then following $$\pi$$. The equation averages both the policy's action choices and the environment's outcomes.

## Evaluation and optimisation answer different questions

Policy evaluation asks how a specified policy performs. Optimal control instead asks which action gives the highest expected continuation:

<div class="formula-box">
\[
V^*(s)=\max_a\sum_{s'}P(s'\mid s,a)
\left[r(s,a,s')+\gamma V^*(s')\right].
\]
</div>

The maximum is outside the expectation over next states: the agent chooses an action before learning which stochastic outcome occurs. Moving it inside would give the agent information it does not have. [Dynamic programming lecture](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-3-planning-by-dynamic-programming-.pdf).

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="bellman-backup-title bellman-backup-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="bellman-backup-title">One-step value decomposition</title>
<desc id="bellman-backup-desc">A backup combines immediate reward with discounted next-state value. Average over possible outcomes before comparing actions.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Immediate reward</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Next-state value</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Current value</text></g>
</svg>
<figcaption>A backup combines immediate reward with discounted next-state value. Average over possible outcomes before comparing actions.</figcaption>
</figure></div>

## Worked example: propagate the goal reward backwards

Use the chain A to B to Goal, rewards 0 then 1, and $$\gamma=0.9$$. Start with all values zero and update each state from the values in the previous iteration. Terminal Goal always has value zero.

| Synchronous iteration | A | B | Goal |
|---|---:|---:|---:|
| Initial | 0 | 0 | 0 |
| First backup | 0 | 1 | 0 |
| Second backup | 0.9 | 1 | 0 |

The first backup finds B's immediate reward. The second transfers that information to A. Updating A before or after B *in place* can change intermediate numbers, so specify the update convention when comparing traces.

Now add an action at A that terminates with reward 0.5. Optimal control chooses the route through B because $$0.9>0.5$$. A policy that selects each action half the time has value $$0.5(0.9)+0.5(0.5)=0.7$$ at A. Evaluating that policy does not turn it into the optimal one.

## Why repeated backups can converge

For a finite discounted MDP with bounded rewards and $$\gamma<1$$, the exact Bellman operators contract differences in the maximum norm by at most $$\gamma$$. This gives unique fixed points and convergence of repeated exact backups under the standard assumptions.

That statement does not guarantee convergence for every neural-network training procedure. Function approximation, sampled data, and changing policies introduce additional issues. Keep the exact dynamic-programming result separate from the optimisation behaviour of a deep RL implementation.

## The model is doing work here

Computing the full sum requires transition probabilities and expected rewards. If those are unknown, an agent can learn from sampled transitions instead. That is the bridge to [temporal-difference learning](/blog/rl/temporal-difference/).

<div class="insight-box"><strong>Key Insight:</strong> A Bellman backup makes a current estimate consistent with one-step consequences. Choosing which policy or maximum appears in that backup determines the value function being learned.</div>

## References

1. Silver, D. [Reinforcement Learning course: Planning by Dynamic Programming](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-3-planning-by-dynamic-programming-.pdf).
