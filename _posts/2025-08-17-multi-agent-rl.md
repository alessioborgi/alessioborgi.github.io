---
layout: single
title: "Multi-Agent Reinforcement Learning"
date: 2025-08-17
categories: [rl]
book: rl
subsection: multi-agent
tags: [MARL, cooperative, competitive, CTDE, QMIX, MADDPG]
excerpt: "Multi-agent RL studies how multiple agents learn simultaneously in a shared environment, raising fundamental challenges in non-stationarity, credit assignment, and emergent coordination."
author_profile: true
read_time: true
is_overview: false
icon: "👥"
read_mins: 5
permalink: /blog/rl/multi-agent-rl/
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

<div class="tldr-box"><strong>TL;DR:</strong> Multi-agent RL (MARL) extends single-agent RL to settings with multiple interacting agents. Key challenges include non-stationarity (other agents change as you learn), credit assignment (who caused the team reward?), and scalability. The centralised training with decentralised execution (CTDE) paradigm addresses these via a centralised critic at training time and independent policies at execution time.</div>
{% include figure image_path="/images/blog/rl/lowe2017_maddpg.png" alt="Multi-agent RL with MADDPG" caption="MADDPG centralised training with decentralised execution (Lowe et al., 2017)" %}


## The Multi-Agent Setting

In a multi-agent environment, $$N$$ agents simultaneously take actions $$a^1, \ldots, a^N$$ in a shared state $$s$$, receiving rewards $$r^1, \ldots, r^N$$. Depending on the reward structure:

- **Cooperative**: all agents share a common reward — maximise team performance.
- **Competitive (zero-sum)**: one agent's gain is another's loss — find a Nash equilibrium.
- **Mixed**: agents cooperate partially and compete partially (e.g., team sports).

The Markov Game framework (Littman 1994) generalises MDPs to multiple agents:

<div class="math-box">(S, A^1,...,A^N, T, R^1,...,R^N, γ)</div>

where $$T(s' \mid s, a^1, \ldots, a^N)$$ is the joint transition and each $$R^i$$ is agent $$i$$'s reward function.

## The Non-Stationarity Problem

The central challenge in MARL is **non-stationarity**: from agent $$i$$'s perspective, the environment is non-Markovian because other agents' policies are changing during training. Standard convergence guarantees for single-agent RL do not apply.

<div class="insight-box"><strong>Key Insight:</strong> Non-stationarity is unavoidable in MARL — each agent is simultaneously trying to learn while the environment (other agents) keeps changing. This invalidates the stationary MDP assumption and requires either joint learning (centralised) or robust decentralised methods that are aware of the non-stationarity.</div>

## Centralised Training with Decentralised Execution (CTDE)

The CTDE paradigm resolves the tension between:

- **Training**: access to global information (all agents' observations, actions, communications) makes learning stable.
- **Execution**: each agent must act using only its local observations (partial observability, communication constraints).

CTDE methods train a centralised critic that uses global information, while each agent's policy only conditions on local observations.

## MADDPG: Multi-Agent DDPG

MADDPG (Lowe et al. 2017) extends DDPG to the multi-agent setting under CTDE. Each agent $$i$$ has:

- A decentralised actor $$\pi_i(a^i \mid o^i)$$ — conditioned only on agent $$i$$'s local observation.
- A centralised critic $$Q_i(o^1,...,o^N, a^1,...,a^N)$$ — takes all observations and actions.

<div class="math-box">L(φ_i) = E [ (Q_i(o,a) - (r^i + γ Q_i'(o',a'_1,...,a'_N)))² ]</div>

By conditioning the critic on all agents' actions, MADDPG handles the non-stationarity: from the critic's perspective, the environment is stationary given all agents' actions.

## QMIX: Monotonic Value Decomposition

QMIX (Rashid et al. 2018) addresses cooperative MARL by decomposing the joint action-value function into per-agent utilities via a monotonic mixing network:

<div class="math-box">Q_tot(s, a^1,...,a^N) = f_mix(Q_1(o^1,a^1), ..., Q_N(o^N,a^N); s)</div>

The mixing network has positive weights (enforced by absolute value activations), guaranteeing that:

<div class="math-box">argmax_{a} Q_tot = (argmax_{a^1} Q_1, ..., argmax_{a^N} Q_N)</div>

This factorisation means each agent can greedily maximise its individual utility and the result is globally optimal — dramatically simplifying decentralised execution.

## Nash Equilibria in Competitive Settings

In zero-sum games, the appropriate solution concept is a **Nash equilibrium**: a joint policy $$({\pi^*}^1, \ldots, {\pi^*}^N)$$ such that no agent can improve by unilaterally deviating. Computing Nash equilibria is PPAD-hard in general, but self-play (each agent trains against the other) empirically converges to strong policies in many games. AlphaZero and OpenAI Five exploit this principle.

## References

- Lowe, R., Wu, Y., Tamar, A., Harb, J., Abbeel, P., & Mordatch, I. (2017). *Multi-Agent Actor-Critic for Mixed Cooperative-Competitive Environments (MADDPG)*. NeurIPS. arXiv:1706.02275.
- Rashid, T., Samvelyan, M., Schroeder, C., Farquhar, G., Foerster, J., & Whiteson, S. (2018). *QMIX: Monotonic Value Function Factorisation for Deep Multi-Agent Reinforcement Learning*. ICML. arXiv:1803.11605.
- Littman, M.L. (1994). *Markov Games as a Framework for Multi-Agent Reinforcement Learning*. ICML.
- Oliehoek, F.A., & Amato, C. (2016). *A Concise Introduction to Decentralized POMDPs*. Springer.
- Foerster, J., Farquhar, G., Afouras, T., Nardelli, N., & Whiteson, S. (2018). *Counterfactual Multi-Agent Policy Gradients (COMA)*. AAAI. arXiv:1705.08926.
