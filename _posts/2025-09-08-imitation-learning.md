---
layout: single
title: "Imitation Learning: Behaviour Cloning and DAgger"
categories: [robotics]
book: robotics
subsection: learning
tags: [imitation-learning, behaviour-cloning, DAgger, dataset-aggregation, covariate-shift]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Imitation learning trains robot policies by mimicking expert demonstrations rather than hand-engineering reward functions. Behaviour cloning (BC) is simple but suffers from compounding errors due to covariate shift. DAgger corrects this with interactive data collection, while GAIL uses adversarial training to match the expert's state-action distribution.</div>
{% include figure image_path="/images/blog/robotics/ho2016_gail.png" alt="GAIL imitation learning" caption="GAIL: Generative Adversarial Imitation Learning (Ho & Ermon, 2016)" %}


## Why Imitation Learning?

**Intuition first.** Think of learning to drive: you could try random steering until you accidentally stay in lane (RL with sparse reward), or you could sit next to an expert and copy what they do (imitation learning). Copying is far faster when good behaviour is easy to demonstrate but hard to describe with a score.

Reinforcement learning requires a reward signal that can be difficult to specify for complex manipulation tasks — "pour water without spilling" is easy for a human to judge but hard to encode mathematically. Imitation learning sidesteps reward engineering by learning directly from expert demonstrations, making it practical for many real-world robotics tasks where human demonstrations are cheap to collect via teleoperation.

<style>
@keyframes slideDemo {
  0%   { transform: translateX(0);   opacity:1; }
  40%  { transform: translateX(80px); opacity:1; }
  60%  { transform: translateX(80px); opacity:0.3; }
  80%  { transform: translateX(80px); opacity:1; }
  100% { transform: translateX(80px); opacity:1; }
}
@keyframes arrowPulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 380 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <!-- Expert demo phase -->
  <rect x="10" y="20" width="100" height="40" rx="6" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="60" y="36" text-anchor="middle" font-size="10" fill="#065f46" font-family="sans-serif">Expert</text>
  <text x="60" y="50" text-anchor="middle" font-size="10" fill="#065f46" font-family="sans-serif">demonstration</text>
  <!-- Dataset -->
  <rect x="150" y="20" width="80" height="40" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="190" y="36" text-anchor="middle" font-size="10" fill="#1e40af" font-family="sans-serif">Dataset D</text>
  <text x="190" y="50" text-anchor="middle" font-size="10" fill="#1e40af" font-family="sans-serif">{(s,a)}</text>
  <!-- Policy -->
  <rect x="280" y="20" width="85" height="40" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="323" y="36" text-anchor="middle" font-size="10" fill="#4c1d95" font-family="sans-serif">Policy π_θ</text>
  <text x="323" y="50" text-anchor="middle" font-size="10" fill="#4c1d95" font-family="sans-serif">supervised</text>
  <!-- Arrows -->
  <line x1="110" y1="40" x2="148" y2="40" stroke="#374151" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="230" y1="40" x2="278" y2="40" stroke="#374151" stroke-width="1.5" marker-end="url(#arr)"/>
  <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#374151"/></marker></defs>
  <!-- Covariate shift warning -->
  <rect x="10" y="80" width="355" height="35" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.2"/>
  <text x="190" y="96" text-anchor="middle" font-size="10" fill="#92400e" font-family="sans-serif">At test time: policy visits NEW states not in D</text>
  <text x="190" y="109" text-anchor="middle" font-size="10" fill="#92400e" font-family="sans-serif">→ errors compound (covariate shift)</text>
</svg>
<figcaption>Behaviour Cloning data flow. The policy sees only expert states during training; at deployment it drifts into unseen states, compounding errors.</figcaption>
</figure></div>

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

## Worked Example: Covariate Shift in One Step

Suppose an expert always steers left when it sees a wall on the right. BC trains a policy with 5% per-step error. At step 1 the robot is in an expert-visited state and acts correctly. At step 2 it has drifted slightly: the wall appears a bit closer than any training state. The policy mis-steers, drifting further. By step 20 the robot is in completely uncharted territory and crashes.

- BC error bound: $$O(\epsilon T^2) = O(0.05 \times 400) = 20$$ expected mistakes over 20 steps.
- DAgger error bound: $$O(\epsilon T) = O(0.05 \times 20) = 1$$ expected mistake.

The quadratic vs. linear scaling is the entire motivation for DAgger.

## DAgger: Dataset Aggregation

**DAgger** (Dataset Aggregation, Ross et al. 2011) fixes covariate shift through an iterative, interactive data collection procedure:

1. Train an initial policy $$\pi_1$$ on expert data $$\mathcal{D}_1$$.
2. Roll out $$\pi_i$$ in the environment to collect states $$\{s_t\}$$ visited by the learner.
3. Query the expert for correct actions at those states: $$\{(s_t, \pi^*(s_t))\}$$.
4. Aggregate: $$\mathcal{D}_{i+1} = \mathcal{D}_i \cup \{(s_t, \pi^*(s_t))\}$$.
5. Retrain $$\pi_{i+1}$$ on $$\mathcal{D}_{i+1}$$. Repeat.

By training on states encountered by the learner (not just the expert), DAgger reduces the error bound to $$O(\epsilon T)$$, matching the oracle. The catch is that expert querying must occur online, which is costly if a human must label in real time. Variants like **SafeDAgger** and **EnsembleDAgger** reduce the number of human interventions needed.

<style>
@keyframes daggerLoop {
  0%   { stroke-dashoffset: 300; }
  100% { stroke-dashoffset: 0; }
}
.dagger-flow { stroke-dasharray: 300; animation: daggerLoop 2s ease-in-out infinite; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <defs><marker id="da" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#0d9488"/></marker></defs>
  <!-- Boxes -->
  <rect x="10"  y="55" width="80" height="40" rx="6" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="50" y="73" text-anchor="middle" font-size="10" fill="#065f46" font-family="sans-serif">Policy π_i</text>
  <text x="50" y="86" text-anchor="middle" font-size="9"  fill="#065f46" font-family="sans-serif">rolls out</text>
  <rect x="155" y="55" width="90" height="40" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="200" y="73" text-anchor="middle" font-size="10" fill="#1e40af" font-family="sans-serif">Expert labels</text>
  <text x="200" y="86" text-anchor="middle" font-size="9"  fill="#1e40af" font-family="sans-serif">π*(s_t)</text>
  <rect x="305" y="55" width="85" height="40" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="348" y="73" text-anchor="middle" font-size="10" fill="#4c1d95" font-family="sans-serif">Retrain on</text>
  <text x="348" y="86" text-anchor="middle" font-size="9"  fill="#4c1d95" font-family="sans-serif">D_i ∪ new</text>
  <!-- Forward arrows -->
  <line x1="90" y1="75" x2="153" y2="75" stroke="#0d9488" stroke-width="1.8" marker-end="url(#da)"/>
  <line x1="245" y1="75" x2="303" y2="75" stroke="#0d9488" stroke-width="1.8" marker-end="url(#da)"/>
  <!-- Loop back arrow -->
  <path class="dagger-flow" d="M348,95 Q348,140 200,140 Q50,140 50,97" fill="none" stroke="#0d9488" stroke-width="1.8" marker-end="url(#da)"/>
  <text x="200" y="155" text-anchor="middle" font-size="9" fill="#0d9488" font-family="sans-serif">iterate → π_{i+1}</text>
  <!-- Step labels -->
  <text x="50"  y="50" text-anchor="middle" font-size="9" fill="#374151" font-family="sans-serif">① rollout</text>
  <text x="200" y="50" text-anchor="middle" font-size="9" fill="#374151" font-family="sans-serif">② query expert</text>
  <text x="348" y="50" text-anchor="middle" font-size="9" fill="#374151" font-family="sans-serif">③ retrain</text>
</svg>
<figcaption>DAgger's interactive loop. The learner collects states it actually visits, an expert labels the correct action there, and the dataset grows to cover the learner's own error distribution.</figcaption>
</figure></div>

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
