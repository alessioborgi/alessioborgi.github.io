---
layout: single
title: "Temporal Difference Learning: Bootstrapping from Experience"
date: 2025-08-05
categories: [rl]
book: rl
subsection: foundations
tags: [temporal-difference, td-learning, bootstrapping, eligibility-traces, td-lambda]
excerpt: "Temporal Difference learning bridges dynamic programming and Monte Carlo methods by updating value estimates from incomplete experience using bootstrapped targets — enabling sample-efficient online learning."
author_profile: true
read_time: true
is_overview: false
icon: "⏱️"
read_mins: 6
permalink: /blog/rl/temporal-difference/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> TD learning updates value estimates after each step using a bootstrapped target — combining the model-free nature of Monte Carlo with the online efficiency of dynamic programming. The TD error δ = r + γV(s') - V(s) is the fundamental learning signal in Q-learning, actor-critic, and most deep RL algorithms.</div>
{% include figure image_path="/images/blog/rl/mnih2016_a3c.png" alt="Temporal difference learning" caption="Temporal difference in asynchronous learning (Mnih et al., 2016)" %}


## The DP–MC–TD Triangle

Three approaches to policy evaluation form a triangle of trade-offs:

| Method | Requires model? | Waits for episode? | Bias | Variance |
|---|---|---|---|---|
| Dynamic Programming | Yes | No | Low | Zero |
| Monte Carlo | No | Yes | Zero | High |
| Temporal Difference | No | No | Low | Low |

**Monte Carlo** (MC) methods wait for the episode to end, then update using the actual return $$G_t = r_t + \gamma r_{t+1} + \cdots + \gamma^{T-t} r_T$$. This is unbiased but has high variance because $$G_t$$ is a long sum of random variables.

**Temporal Difference** methods update after each step using an estimated return — the **TD target**: $$r_t + \gamma V(s_{t+1})$$. This introduces some bias ($$V$$ is not yet converged) but dramatically reduces variance.

## TD(0): The Fundamental Update

The simplest TD algorithm, **TD(0)**, updates the value function after each transition:

<div class="math-box">
$$V(s_t) \leftarrow V(s_t) + \alpha \underbrace{\left[r_t + \gamma V(s_{t+1}) - V(s_t)\right]}_{\delta_t \;=\; \text{TD error}}$$
</div>

The **TD error** $$\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$$ is the central object: it measures how much better (or worse) the outcome was compared to the current prediction. When $$\delta_t > 0$$, the agent was pleasantly surprised; when $$\delta_t < 0$$, the outcome was worse than expected.

The TD(0) algorithm:

```
Initialise V(s) = 0 for all s
for each episode:
    s ← initial state
    while s is not terminal:
        a ← π(s)
        s', r ← step(s, a)
        δ ← r + γ V(s') - V(s)
        V(s) ← V(s) + α δ
        s ← s'
```

**Convergence**: for tabular representations and a policy $$\pi$$, TD(0) converges to $$V^\pi$$ almost surely as long as the step-size $$\alpha$$ satisfies the Robbins-Monro conditions: $$\sum_t \alpha_t = \infty$$ and $$\sum_t \alpha_t^2 < \infty$$.

<div class="insight-box"><strong>Key Insight:</strong> The TD error δ_t is the RL analogue of the *prediction error* in neuroscience — dopamine neurons in the brain appear to encode something very similar to δ_t. This connection, noted by Montague, Dayan, and Sejnowski (1996), suggests that temporal difference learning may be biologically implemented in the basal ganglia.</div>

## n-Step Returns

TD(0) uses a 1-step return. MC uses an $$\infty$$-step return. **n-step TD** interpolates between them:

<div class="math-box">
$$G_t^{(n)} = r_t + \gamma r_{t+1} + \cdots + \gamma^{n-1} r_{t+n-1} + \gamma^n V(s_{t+n})$$
</div>

The update is: $$V(s_t) \leftarrow V(s_t) + \alpha [G_t^{(n)} - V(s_t)]$$.

For $$n=1$$: TD(0). For $$n=\infty$$: MC. The optimal $$n$$ is task-dependent, and in practice $$n \in [3, 20]$$ often outperforms both extremes.

## TD(λ) and Eligibility Traces

**TD(λ)** combines n-step returns for all $$n$$ simultaneously, weighted by $$\lambda^{n-1}$$:

$$G_t^\lambda = (1-\lambda) \sum_{n=1}^\infty \lambda^{n-1} G_t^{(n)}$$

This is implemented online via **eligibility traces** — a memory variable $$z(s)$$ that decays exponentially:

```
z(s) ← 0 for all s
for each step:
    z(s_t) ← z(s_t) + 1     # accumulating trace
    δ ← r + γ V(s') - V(s)
    for all s: V(s) ← V(s) + α δ z(s)
               z(s) ← γ λ z(s)  # decay
```

When $$\lambda = 0$$: reduces to TD(0). When $$\lambda = 1$$: equivalent to MC (in the offline case). The trace $$z(s)$$ records which states were recently visited, so a surprising reward propagates backward through the trajectory.

## Why TD is More Efficient than MC

Consider estimating the value at a state visited 1000 times. MC updates $$V(s)$$ 1000 times — once per visit, with the episode return. TD(0) also updates 1000 times, but **every other state on the trajectory is also updated after each step**. This means TD learning propagates information much faster through the state space.

Additionally, TD can learn online during an episode without waiting for termination — critical for long or continuing tasks where waiting for episode end would make learning prohibitively slow.

## References

1. Sutton, R. S. (1988). Learning to predict by the methods of temporal differences. *Machine Learning*, 3(1), 9–44.
2. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.), Chapter 6. MIT Press.
3. Montague, P. R., Dayan, P., & Sejnowski, T. J. (1996). A framework for mesencephalic dopamine systems based on predictive Hebbian learning. *Journal of Neuroscience*, 16(5), 1936–1947.
