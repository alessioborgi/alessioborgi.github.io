---
layout: single
title: "Reinforcement Learning: A Complete Guide"
categories: [rl]
book: rl
subsection: foundations
tags: [reinforcement-learning, overview, agent, environment, reward]
published: false
excerpt: "A comprehensive map of reinforcement learning: from the agent-environment loop and core mathematical objects to major algorithm families and how this book is structured."
author_profile: true
read_time: true
is_overview: true
icon: "🎮"
read_mins: 5
permalink: /blog/rl/rl-overview/
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

<div class="tldr-box"><strong>TL;DR:</strong> Reinforcement Learning trains agents to maximise cumulative reward through trial-and-error interaction with an environment. Unlike supervised learning, there are no labelled examples — only a scalar reward signal that may be sparse and delayed. This book covers foundational theory through state-of-the-art algorithms.</div>
{% include figure image_path="/images/blog/rl/ouyang2022_rlhf.png" alt="RL overview and RLHF pipeline" caption="The RL training loop and RLHF pipeline (Ouyang et al., 2022)" %}


## What is Reinforcement Learning?

Reinforcement Learning (RL) is the computational study of decision-making. An **agent** interacts with an **environment** over discrete time steps: at each step, the agent observes a **state** $$s_t$$, selects an **action** $$a_t$$ according to its **policy** $$\pi$$, and receives a scalar **reward** $$r_t$$ along with the next state $$s_{t+1}$$.

The goal is to find a policy $$\pi$$ that maximises the **expected cumulative discounted return**:

<div class="math-box">
$$J(\pi) = \mathbb{E}_\pi\!\left[\sum_{t=0}^{\infty} \gamma^t r_t\right], \quad \gamma \in [0, 1)$$
</div>

The discount factor $$\gamma$$ balances immediate vs. future rewards. When $$\gamma \to 0$$ the agent is myopic; when $$\gamma \to 1$$ it cares about the distant future.

What distinguishes RL from other machine learning paradigms:
- **No supervision**: no teacher provides the correct action.
- **Delayed credit**: a reward at step $$t$$ may result from actions taken many steps earlier.
- **Non-stationarity**: the agent's own learning changes the data distribution it encounters.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Think of RL like learning to ride a bike: no one tells you the exact muscle adjustments to make — you just try, fall, and use the pain/balance signal to improve. The reward is delayed (you feel stable only after a sequence of correct micro-adjustments) and the "supervisor" is purely the outcome, not a labelled correction.</div>

## The RL Pipeline

Every RL system follows the same fundamental loop:

1. Agent observes state $$s_t$$ from the environment.
2. Agent selects action $$a_t \sim \pi(\cdot \mid s_t)$$.
3. Environment transitions to $$s_{t+1} \sim P(\cdot \mid s_t, a_t)$$ and emits reward $$r_t = R(s_t, a_t, s_{t+1})$$.
4. Agent updates its policy using the observed transition $$(s_t, a_t, r_t, s_{t+1})$$.

<style>
@keyframes pulse-agent { 0%,100%{fill:#0d9488;} 50%{fill:#14b8a6;} }
@keyframes pulse-env { 0%,100%{fill:#7c3aed;} 50%{fill:#8b5cf6;} }
@keyframes flow-arrow { 0%{stroke-dashoffset:30;} 100%{stroke-dashoffset:0;} }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg" style="max-width:520px;width:100%;display:block;margin:auto;">
  <!-- Agent box -->
  <rect x="20" y="55" width="130" height="50" rx="10" fill="#0d9488" style="animation:pulse-agent 2s ease-in-out infinite;"/>
  <text x="85" y="84" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Agent π</text>
  <!-- Environment box -->
  <rect x="370" y="55" width="130" height="50" rx="10" fill="#7c3aed" style="animation:pulse-env 2s ease-in-out infinite;"/>
  <text x="435" y="84" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Environment</text>
  <!-- Action arrow (top) -->
  <path d="M150 68 Q260 20 370 68" fill="none" stroke="#f97316" stroke-width="2.5" stroke-dasharray="8 4" style="animation:flow-arrow 1.2s linear infinite;"/>
  <polygon points="370,68 358,62 362,74" fill="#f97316"/>
  <text x="260" y="28" text-anchor="middle" fill="#f97316" font-size="12" font-weight="bold">action aₜ</text>
  <!-- State+Reward arrow (bottom) -->
  <path d="M370 92 Q260 140 150 92" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-dasharray="8 4" style="animation:flow-arrow 1.2s linear infinite reverse;"/>
  <polygon points="150,92 162,86 158,98" fill="#0ea5e9"/>
  <text x="260" y="148" text-anchor="middle" fill="#0ea5e9" font-size="12" font-weight="bold">state sₜ₊₁ , reward rₜ</text>
</svg>
<figcaption>The agent-environment loop: the agent sends actions, the environment returns the next state and a reward signal.</figcaption>
</figure></div>

This loop is mathematically formalised as a **Markov Decision Process** (MDP), covered in the next post. The Markov property — that $$s_{t+1}$$ depends only on $$(s_t, a_t)$$, not on full history — is the key simplifying assumption.

<div class="insight-box"><strong>Key Insight:</strong> RL is fundamentally different from supervised learning because the agent must explore the environment to generate its own training data. This creates the <em>exploration-exploitation dilemma</em>: should the agent try known good actions (exploit) or try new ones to gather information (explore)?</div>

## Algorithm Landscape

Modern RL algorithms can be organised along two axes:

**Model-free vs. Model-based:**
- *Model-free*: the agent learns a policy or value function directly from experience, without building an explicit model of environment dynamics. Examples: Q-learning, DQN, PPO, SAC.
- *Model-based*: the agent learns a model $$\hat{P}(s' \mid s, a)$$ and uses it for planning. Examples: Dyna, World Models, MuZero.

**Value-based vs. Policy-based:**
- *Value-based*: learn $$Q^*(s,a)$$ and derive a greedy policy. Examples: Q-learning, DQN, Rainbow.
- *Policy-based*: directly parameterise and optimise $$\pi_\theta$$. Examples: REINFORCE, A3C, PPO.
- *Actor-critic*: maintain both a policy (actor) and a value function (critic). Examples: A3C, SAC, PPO with value baseline.

The rough historical progression: tabular Q-learning (1989) → DQN with deep neural networks (2013) → policy gradient methods with trust regions (2015–2017, TRPO/PPO) → off-policy maximum-entropy methods (2018, SAC) → model-based planning (MuZero 2019).

<style>
@keyframes grow-bar { from { width: 0; } to { width: var(--w); } }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg" style="max-width:480px;width:100%;display:block;margin:auto;">
  <text x="10" y="20" font-size="12" font-weight="bold" fill="#334155">RL Algorithm Timeline</text>
  <!-- Year axis -->
  <line x1="10" y1="170" x2="470" y2="170" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Bars -->
  <rect x="20"  y="140" width="30" height="28" rx="4" fill="#0d9488" opacity="0.85"/>
  <text x="35"  y="138" text-anchor="middle" font-size="9" fill="#0d9488" font-weight="bold">Q-learn</text>
  <text x="35"  y="185" text-anchor="middle" font-size="9" fill="#64748b">1989</text>

  <rect x="110" y="120" width="30" height="48" rx="4" fill="#0d9488" opacity="0.85"/>
  <text x="125" y="118" text-anchor="middle" font-size="9" fill="#0d9488" font-weight="bold">DQN</text>
  <text x="125" y="185" text-anchor="middle" font-size="9" fill="#64748b">2013</text>

  <rect x="195" y="100" width="30" height="68" rx="4" fill="#7c3aed" opacity="0.85"/>
  <text x="210" y="98" text-anchor="middle" font-size="9" fill="#7c3aed" font-weight="bold">TRPO</text>
  <text x="210" y="185" text-anchor="middle" font-size="9" fill="#64748b">2015</text>

  <rect x="250" y="90" width="30" height="78" rx="4" fill="#7c3aed" opacity="0.85"/>
  <text x="265" y="88" text-anchor="middle" font-size="9" fill="#7c3aed" font-weight="bold">PPO</text>
  <text x="265" y="185" text-anchor="middle" font-size="9" fill="#64748b">2017</text>

  <rect x="315" y="75" width="30" height="93" rx="4" fill="#f97316" opacity="0.85"/>
  <text x="330" y="73" text-anchor="middle" font-size="9" fill="#f97316" font-weight="bold">SAC</text>
  <text x="330" y="185" text-anchor="middle" font-size="9" fill="#64748b">2018</text>

  <rect x="390" y="55" width="30" height="113" rx="4" fill="#0ea5e9" opacity="0.85"/>
  <text x="405" y="53" text-anchor="middle" font-size="9" fill="#0ea5e9" font-weight="bold">MuZero</text>
  <text x="405" y="185" text-anchor="middle" font-size="9" fill="#64748b">2019</text>

  <!-- Legend -->
  <rect x="10" y="192" width="10" height="8" fill="#0d9488" rx="2"/>
  <text x="24" y="200" font-size="9" fill="#334155">Value-Based</text>
  <rect x="100" y="192" width="10" height="8" fill="#7c3aed" rx="2"/>
  <text x="114" y="200" font-size="9" fill="#334155">Policy-Gradient</text>
  <rect x="210" y="192" width="10" height="8" fill="#f97316" rx="2"/>
  <text x="224" y="200" font-size="9" fill="#334155">Max-Entropy</text>
  <rect x="300" y="192" width="10" height="8" fill="#0ea5e9" rx="2"/>
  <text x="314" y="200" font-size="9" fill="#334155">Model-Based</text>
</svg>
<figcaption>RL milestone algorithms by year and family. Bar height loosely reflects impact on the field.</figcaption>
</figure></div>

## RL vs. Supervised Learning

| Aspect | Supervised Learning | Reinforcement Learning |
|---|---|---|
| Labels | Provided by oracle | Generated through interaction |
| Data distribution | Fixed | Non-stationary (policy-dependent) |
| Feedback | Immediate, per-sample | Delayed, sparse reward |
| Goal | Minimise prediction error | Maximise cumulative return |

This distinction matters when applying RL to language model alignment (RLHF): the reward signal comes from a trained reward model or human preferences, not ground-truth labels.

## Book Structure

This book is organised into six parts:

1. **Foundations**: MDPs, Bellman equations, exploration, temporal-difference learning.
2. **Value-Based Methods**: Q-learning, DQN, Rainbow.
3. **Policy Gradient Methods**: REINFORCE, A3C, PPO, SAC, TRPO.
4. **Model-Based RL**: Dyna, World Models, MuZero.
5. **Multi-Agent RL**: cooperative and competitive settings, QMIX, MADDPG.
6. **Applications**: games, RLHF for LLMs, robotics.

## References

1. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online: incompleteideas.net]
2. Silver, D., Singh, S., Precup, D., & Sutton, R. S. (2021). Reward is enough. *Artificial Intelligence*, 299, 103535.
3. Arulkumaran, K., Deisenroth, M. P., Brundage, M., & Bharath, A. A. (2017). Deep reinforcement learning: A brief survey. *IEEE Signal Processing Magazine*, 34(6), 26–38.
