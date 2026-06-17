---
layout: single
title: "Q-Learning: Off-Policy TD Control"
categories: [rl]
book: rl
subsection: value-based
tags: [q-learning, off-policy, td-control, sarsa, tabular-rl]
published: false
excerpt: "Q-learning is a model-free, off-policy TD algorithm that directly learns the optimal action-value function Q* without requiring a model of the environment — the algorithm underlying DQN and much of modern RL."
author_profile: true
read_time: true
is_overview: false
icon: "📊"
read_mins: 6
permalink: /blog/rl/q-learning/
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

<div class="tldr-box"><strong>TL;DR:</strong> Q-learning updates action-value estimates using the max over next-state Q-values as a bootstrap target, making it off-policy — it converges to Q* regardless of the exploration strategy used to collect data. Combined with neural networks, Q-learning becomes DQN, which achieved human-level performance on Atari games.</div>
{% include figure image_path="/images/blog/rl/mnih2015_dqn.png" alt="Q-learning and DQN architecture" caption="Q-network architecture for Atari (Mnih et al., 2015)" %}


## The Q-Learning Update

Q-learning was introduced by Christopher Watkins in his 1989 PhD thesis. The core update rule is:

<div class="math-box">
$$Q(s_t, a_t) \leftarrow Q(s_t, a_t) + \alpha \underbrace{\left[r_t + \gamma \max_{a'} Q(s_{t+1}, a') - Q(s_t, a_t)\right]}_{\text{Q-learning TD error}}$$
</div>

The crucial difference from TD(0) (which evaluates a fixed policy) is the $$\max_{a'}$$ operator. By always bootstrapping from the best possible next action, Q-learning targets the optimal Q-function $$Q^*$$ directly, without requiring the agent's behaviour to match the optimal policy.

**Full tabular Q-learning algorithm:**

```
Initialise Q(s, a) = 0 for all s, a
for each episode:
    s ← initial state
    while s is not terminal:
        a ← ε-greedy(Q, s)        # behaviour policy
        s', r ← step(s, a)
        Q(s,a) ← Q(s,a) + α[r + γ max_{a'} Q(s',a') - Q(s,a)]
        s ← s'
```

## Off-Policy Nature of Q-Learning

Q-learning is **off-policy**: the policy used to select actions (the **behaviour policy** $$\mu$$, typically ε-greedy) is different from the policy being learned (the **target policy**, which is greedy with respect to Q).

This is a major practical advantage: Q-learning can learn from any data — replayed experience, data from a different policy, or even expert demonstrations — as long as every state-action pair is visited sufficiently often.

Compare with **SARSA** (on-policy TD control):

<div class="math-box">
$$Q(s_t, a_t) \leftarrow Q(s_t, a_t) + \alpha \left[r_t + \gamma Q(s_{t+1}, a_{t+1}) - Q(s_t, a_t)\right]$$
</div>

SARSA uses the actual next action $$a_{t+1}$$ (sampled from the behaviour policy) rather than the max. As a result, SARSA learns the Q-function of the behaviour policy — which is safer in settings where exploration is risky (cliffs, dangerous states), because SARSA accounts for the exploration noise in its value estimates.

<div class="insight-box"><strong>Key Insight:</strong> The off-policy property of Q-learning is why experience replay works: past transitions, even from an old policy, can still teach the agent about Q*. SARSA cannot safely use experience replay because old transitions reflect an outdated behaviour policy.</div>

## Convergence Theorem

**Theorem (Watkins & Dayan, 1992):** In the tabular case, Q-learning converges to $$Q^*$$ almost surely, provided:
1. All state-action pairs are visited infinitely often.
2. Step-sizes satisfy $$\sum_t \alpha_t(s,a) = \infty$$ and $$\sum_t \alpha_t^2(s,a) < \infty$$.
3. Rewards are bounded.

The proof uses the theory of stochastic approximation (Robbins-Monro). The key step shows that the Q-learning update is an instance of a contraction applied in expectation, guaranteeing convergence to the unique fixed point $$Q^*$$.

Note that convergence is **not guaranteed** with function approximation (neural networks). The combination of off-policy learning, bootstrapping, and function approximation is called the **deadly triad** — addressed by DQN's experience replay and target networks.

## Intuition First: Why Max Instead of Average?

SARSA updates Q(s,a) toward what the agent *actually* did next. Q-learning updates toward what the agent *could* do best next — ignoring the exploration noise. Think of it this way: SARSA is like rating a restaurant based on what you ordered (including bad choices), while Q-learning always rates it as if you ordered the best dish. Q-learning therefore learns the optimal Q-function regardless of how erratically it explores.

## Manual Q-Table Update Walkthrough

A 3×3 gridworld: start at (0,0), goal at (2,2) with reward +1, wall at (1,1). $$\gamma=0.9$$, $$\alpha=0.1$$. Initial Q-table = all zeros.

**Transition**: from state (0,0) take action RIGHT → land in (0,1), receive r=0.

$$Q((0,0), \text{RIGHT}) \leftarrow 0 + 0.1 \times [0 + 0.9 \times \max_{a'} Q((0,1), a') - 0]$$
$$= 0 + 0.1 \times [0 + 0.9 \times 0 - 0] = \mathbf{0.000}$$

*(No signal yet — reward is only at goal.)*

**Later**: from (1,2) take action RIGHT → land at (2,2)=Goal, receive r=+1.

$$Q((1,2), \text{RIGHT}) \leftarrow 0 + 0.1 \times [1 + 0.9 \times 0 - 0] = \mathbf{0.100}$$

**Next episode** from (0,2) → RIGHT → (1,2):

$$Q((0,2), \text{RIGHT}) \leftarrow 0 + 0.1 \times [0 + 0.9 \times 0.1 - 0] = \mathbf{0.009}$$

The +1 reward ripples back one cell per episode, tracing the optimal path.

<style>
@keyframes heat-cell { 0%,100%{opacity:0.3;} 50%{opacity:1;} }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" style="max-width:260px;width:100%;display:block;margin:auto;">
  <text x="130" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">Q-Value Heatmap (converged)</text>
  <!-- Grid 3x3 -->
  <!-- Row 0 -->
  <rect x="20"  y="25" width="65" height="65" rx="4" fill="#bfdbfe" opacity="0.7"/>
  <text x="52"  y="56" text-anchor="middle" font-size="11" fill="#1e40af">0.73</text>
  <rect x="90"  y="25" width="65" height="65" rx="4" fill="#93c5fd" opacity="0.7"/>
  <text x="122" y="56" text-anchor="middle" font-size="11" fill="#1e40af">0.81</text>
  <rect x="160" y="25" width="65" height="65" rx="4" fill="#60a5fa" opacity="0.85"/>
  <text x="192" y="56" text-anchor="middle" font-size="11" fill="#1e3a8a">0.90</text>
  <!-- Row 1 -->
  <rect x="20"  y="95" width="65" height="65" rx="4" fill="#bfdbfe" opacity="0.7"/>
  <text x="52"  y="126" text-anchor="middle" font-size="11" fill="#1e40af">0.66</text>
  <rect x="90"  y="95" width="65" height="65" rx="4" fill="#e2e8f0"/>
  <text x="122" y="126" text-anchor="middle" font-size="13" fill="#94a3b8">■</text>
  <text x="122" y="140" text-anchor="middle" font-size="9"  fill="#94a3b8">wall</text>
  <rect x="160" y="95" width="65" height="65" rx="4" fill="#60a5fa" opacity="0.85" style="animation:heat-cell 2s ease-in-out infinite;"/>
  <text x="192" y="126" text-anchor="middle" font-size="11" fill="#1e3a8a">0.90</text>
  <!-- Row 2 -->
  <rect x="20"  y="165" width="65" height="65" rx="4" fill="#dbeafe" opacity="0.7"/>
  <text x="52"  y="196" text-anchor="middle" font-size="11" fill="#1e40af">0.59</text>
  <rect x="90"  y="165" width="65" height="65" rx="4" fill="#93c5fd" opacity="0.7"/>
  <text x="122" y="196" text-anchor="middle" font-size="11" fill="#1e40af">0.66</text>
  <rect x="160" y="165" width="65" height="65" rx="4" fill="#f97316"/>
  <text x="192" y="196" text-anchor="middle" font-size="12" fill="white" font-weight="bold">GOAL</text>
  <text x="192" y="210" text-anchor="middle" font-size="10" fill="white">+1.00</text>
  <!-- Axis labels -->
  <text x="52"  y="245" text-anchor="middle" font-size="9" fill="#64748b">(0,0)</text>
  <text x="122" y="245" text-anchor="middle" font-size="9" fill="#64748b">(0,1)</text>
  <text x="192" y="245" text-anchor="middle" font-size="9" fill="#64748b">(0,2)</text>
</svg>
<figcaption>Converged Q-values (best action) in a 3×3 gridworld with γ=0.9. Values decrease with distance from the goal by factors of 0.9. The wall cell at (1,1) has no Q-value.</figcaption>
</figure></div>

## Grid World Example

Consider a 4×4 grid world with a goal state (reward +1) and a hole (reward −1), with $$\gamma = 0.9$$. After 500 episodes of Q-learning with ε=0.1:

- Q-values at states adjacent to the goal converge to approximately 0.9 (one step away).
- Q-values two steps away converge to ≈ 0.81 = 0.9².
- The greedy policy recovers the shortest path to the goal.

SARSA, run on the same grid with ε=0.1, learns a slightly different policy: it avoids states adjacent to the hole (because ε-greedy may select the dangerous action), while Q-learning finds the optimal (riskier but shorter) path.

## SARSA vs Q-Learning: When to Use Which

| | SARSA | Q-Learning |
|---|---|---|
| On/Off policy | On-policy | Off-policy |
| Safety | Safer (accounts for exploration) | Riskier (assumes greedy future) |
| With replay buffer | Problematic | Works naturally |
| Convergence | To $$V^\mu$$ | To $$V^*$$ |
| Typical use | Safe RL, on-policy settings | DQN, experience replay |

## References

1. Watkins, C. J. C. H. (1989). *Learning from Delayed Rewards*. PhD thesis, University of Cambridge.
2. Watkins, C. J. C. H., & Dayan, P. (1992). Q-learning. *Machine Learning*, 8(3–4), 279–292.
3. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.), Chapter 6. MIT Press.
