---
layout: single
title: "Bellman Equations: Recursive Structure of Optimal Value"
date: 2025-08-03
categories: [rl]
book: rl
subsection: foundations
tags: [bellman, dynamic-programming, optimal-value, contraction-mapping, policy-iteration]
excerpt: "The Bellman optimality equations characterise the unique optimal value functions V* and Q*, and the contraction mapping theorem guarantees that dynamic programming algorithms converge to them."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 6
permalink: /blog/rl/bellman-equations/
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

<div class="tldr-box"><strong>TL;DR:</strong> The Bellman optimality equations define V* and Q* as the unique fixed points of the optimal Bellman operator — proven via the contraction mapping theorem. Dynamic programming algorithms (policy evaluation, policy improvement, value iteration) exploit this recursive structure to compute optimal policies exactly when the MDP model is known.</div>
{% include figure image_path="/images/blog/rl/mnih2016_a3c.png" alt="Bellman equations and value functions" caption="Value function architecture (Mnih et al., 2016)" %}


## Bellman Expectation vs. Bellman Optimality

The previous post introduced the **Bellman expectation equations**, which characterise the value of a *given* policy $$\pi$$. Now we ask: what is the *best possible* value at each state?

The **optimal state-value function** $$V^*(s)$$ is:

$$V^*(s) = \max_\pi V^\pi(s) \qquad \forall s \in \mathcal{S}$$

There always exists a deterministic optimal policy $$\pi^*$$ that simultaneously achieves $$V^*$$ in all states (a key theorem of MDPs). The Bellman **optimality** equation for $$V^*$$ is:

<div class="math-box">
$$V^*(s) = \max_a \sum_{s'} P(s' \mid s, a)\!\left[R(s,a,s') + \gamma V^*(s')\right]$$
</div>

For the optimal Q-function:

<div class="math-box">
$$Q^*(s, a) = \sum_{s'} P(s' \mid s, a)\!\left[R(s,a,s') + \gamma \max_{a'} Q^*(s', a')\right]$$
</div>

The optimal policy is then simply greedy with respect to $$Q^*$$:

<div class="math-box">
$$\pi^*(s) = \arg\max_a Q^*(s, a)$$
</div>

Note the crucial difference: in the expectation equation, the action is averaged over $$\pi$$; in the optimality equation, it is maximised. The max operator makes the optimality equations **nonlinear**, which is why they cannot be solved by simple matrix inversion (unlike policy evaluation).

## Contraction Mapping and Convergence

The Bellman optimality operator $$\mathcal{T}^*$$ maps a value function $$V$$ to a new one:

$$(\mathcal{T}^* V)(s) = \max_a \sum_{s'} P(s' \mid s, a)\!\left[R(s,a,s') + \gamma V(s')\right]$$

**Theorem (Contraction Mapping):** $$\mathcal{T}^*$$ is a $$\gamma$$-contraction under the sup-norm:

$$\|\mathcal{T}^* V - \mathcal{T}^* U\|_\infty \leq \gamma \|V - U\|_\infty$$

By the Banach fixed-point theorem, repeated application of $$\mathcal{T}^*$$ from any initial $$V^{(0)}$$ converges geometrically to the unique fixed point $$V^*$$ at rate $$\gamma^k$$ after $$k$$ iterations:

$$\|V^{(k)} - V^*\|_\infty \leq \gamma^k \|V^{(0)} - V^*\|_\infty$$

<div class="insight-box"><strong>Key Insight:</strong> The contraction property holds because discounting (γ < 1) shrinks errors. Each application of T* brings value estimates strictly closer to V*. This is the mathematical foundation that guarantees convergence of value iteration, and by extension, Q-learning and TD methods.</div>

## Dynamic Programming Algorithms

When the MDP model $$(P, R)$$ is known, dynamic programming (DP) provides exact solutions.

**Policy Evaluation** — compute $$V^\pi$$ for a fixed policy by iterating the Bellman expectation operator until convergence:

```
V ← 0 (arbitrary initialisation)
repeat:
    for each s in S:
        V(s) ← Σ_a π(a|s) Σ_{s'} P(s'|s,a) [R(s,a,s') + γ V(s')]
until max_s |ΔV(s)| < ε
```

**Policy Improvement** — given $$V^\pi$$, construct a strictly better policy by acting greedily:

$$\pi'(s) = \arg\max_a \sum_{s'} P(s' \mid s, a)\!\left[R(s,a,s') + \gamma V^\pi(s')\right]$$

The **Policy Improvement Theorem** guarantees $$V^{\pi'} \geq V^\pi$$ everywhere. Alternating evaluation and improvement until the policy is stable gives **policy iteration**, which converges to $$\pi^*$$ in a finite number of steps (for finite MDPs).

**Value Iteration** — merges evaluation and improvement into a single sweep by applying $$\mathcal{T}^*$$ directly, avoiding the inner loop of policy evaluation. It converges to $$V^*$$ asymptotically, with the optimal policy recovered by taking the greedy action with respect to the converged $$V^*$$.

## Limitations of DP

DP requires:
1. **Full knowledge** of the model $$P$$ and $$R$$.
2. **Tabular representation** — infeasible when $$|\mathcal{S}|$$ is astronomical (e.g., Go has ~$$10^{170}$$ states).

RL algorithms (Q-learning, DQN, TD) can be understood as *sample-based*, *model-free* approximations to DP: they estimate the Bellman operator from experience rather than computing it exactly from the model.

## References

1. Bellman, R. (1957). *Dynamic Programming*. Princeton University Press.
2. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.), Chapter 4. MIT Press.
3. Bertsekas, D. P. (2019). *Reinforcement Learning and Optimal Control*. Athena Scientific.
