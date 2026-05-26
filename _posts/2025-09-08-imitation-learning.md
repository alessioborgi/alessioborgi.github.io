---
layout: single
title: "Imitation Learning: Behaviour Cloning and DAgger"
date: 2025-09-08
categories: [robotics]
book: robotics
subsection: learning
tags: [imitation-learning, behaviour-cloning, DAgger, dataset-aggregation, covariate-shift]
excerpt: "Learning robot policies from expert demonstrations: behaviour cloning, the covariate shift problem, DAgger's interactive fix, and adversarial imitation via GAIL."
author_profile: true
read_time: true
is_overview: false
icon: "🎓"
read_mins: 5
permalink: /blog/robotics/imitation-learning/
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

<div class="tldr-box"><strong>TL;DR:</strong> Imitation learning trains robot policies by mimicking expert demonstrations rather than hand-engineering reward functions. Behaviour cloning (BC) is simple but suffers from compounding errors due to covariate shift. DAgger corrects this with interactive data collection, while GAIL uses adversarial training to match the expert's state-action distribution.</div>
{% include figure image_path="/images/blog/robotics/ho2016_gail.png" alt="GAIL imitation learning" caption="GAIL: Generative Adversarial Imitation Learning (Ho & Ermon, 2016)" %}


## Why Imitation Learning?

Reinforcement learning requires a reward signal that can be difficult to specify for complex manipulation tasks — "pour water without spilling" is easy for a human to judge but hard to encode mathematically. Imitation learning sidesteps reward engineering by learning directly from expert demonstrations, making it practical for many real-world robotics tasks where human demonstrations are cheap to collect via teleoperation.

## Behaviour Cloning

**Behaviour cloning (BC)** treats imitation as supervised learning. Given a dataset $$\mathcal{D} = \{(s_i, a_i)\}$$ of state-action pairs from an expert, we train a policy $$\pi_\theta$$ to minimise:

<div class="math-box">
L(θ) = E_{(s,a) ~ D} [ -log π_θ(a | s) ]
</div>

BC is appealing in its simplicity and can be implemented with any standard supervised learning toolkit. In practice, it achieves surprisingly strong results on tasks with limited variation — robotic arm reaching, simple pick-and-place — when sufficient demonstrations are provided.

## The Covariate Shift Problem

Despite its simplicity, BC has a fundamental flaw: **covariate shift**. During training, the policy sees states visited by the expert. During deployment, small prediction errors shift the state distribution slightly. The policy is now in states it has never seen, leading to more errors, further state shift, and ultimately catastrophic failure — even though the original training error was small.

<div class="insight-box"><strong>Key Insight:</strong> BC's compounding error problem is not about fitting the training data well — it is about generalising to the distribution of states that the learner's own mistakes create. A policy with 1% error per step accumulates O(T²) total error over a horizon of T steps.</div>

This is made formal in Ross et al. (2011): the expected loss of a BC policy over a trajectory of length $$T$$ is bounded by $$O(\epsilon T^2)$$ where $$\epsilon$$ is the per-step imitation error, compared to $$O(\epsilon T)$$ for an oracle with interactive corrections.

## DAgger: Dataset Aggregation

**DAgger** (Dataset Aggregation, Ross et al. 2011) fixes covariate shift through an iterative, interactive data collection procedure:

1. Train an initial policy $$\pi_1$$ on expert data $$\mathcal{D}_1$$.
2. Roll out $$\pi_i$$ in the environment to collect states $$\{s_t\}$$ visited by the learner.
3. Query the expert for correct actions at those states: $$\{(s_t, \pi^*(s_t))\}$$.
4. Aggregate: $$\mathcal{D}_{i+1} = \mathcal{D}_i \cup \{(s_t, \pi^*(s_t))\}$$.
5. Retrain $$\pi_{i+1}$$ on $$\mathcal{D}_{i+1}$$. Repeat.

By training on states encountered by the learner (not just the expert), DAgger reduces the error bound to $$O(\epsilon T)$$, matching the oracle. The catch is that expert querying must occur online, which is costly if a human must label in real time. Variants like **SafeDAgger** and **EnsembleDAgger** reduce the number of human interventions needed.

## GAIL: Generative Adversarial Imitation Learning

**GAIL** (Ho & Ermon 2016, arXiv:1606.03476) reframes imitation learning as inverse reinforcement learning combined with policy optimisation. Rather than regressing on expert actions directly, GAIL trains a **discriminator** $$D_\phi$$ to distinguish expert state-action pairs from learner pairs, while the policy $$\pi_\theta$$ tries to fool the discriminator:

<div class="math-box">
min_π max_D  E_π[log D(s,a)] + E_{π*}[log(1 - D(s,a))]
</div>

The discriminator's output acts as a reward signal for the policy, which is optimised with any RL algorithm (typically TRPO or PPO). GAIL recovers the expert's state-action distribution without needing explicit access to the reward function — making it a powerful framework for learning from demonstrations in complex environments.

## Inverse Reinforcement Learning

**Inverse RL (IRL)** takes a different angle: infer the expert's reward function from demonstrations, then use it to train a policy with standard RL. Maximum entropy IRL (Ziebart et al. 2008) recovers a reward $$R_\theta$$ such that the expert's trajectory distribution matches the distribution induced by the maximum-entropy policy under $$R_\theta$$. IRL is more interpretable than GAIL but computationally expensive — it requires solving an RL problem in an inner loop.

## References

- Ross, S., Gordon, G., & Bagnell, D. (2011). A reduction of imitation learning and structured prediction to no-regret online learning. *AISTATS 2011*, 627–635.
- Ho, J., & Ermon, S. (2016). Generative adversarial imitation learning. *NeurIPS 2016*. arXiv:1606.03476.
- Pomerleau, D. A. (1989). ALVINN: An autonomous land vehicle in a neural network. *NeurIPS 1989*.
- Ziebart, B. D., et al. (2008). Maximum entropy inverse reinforcement learning. *AAAI 2008*.
- Torabi, F., et al. (2018). Behavioural cloning from observation. *IJCAI 2018*.
