---
layout: single
title: "Skill Learning and Hierarchical Robot Policies"
categories: [robotics]
book: robotics
subsection: learning
tags: [skill-learning, hierarchical-rl, options, primitives, SPiRL]
published: false
excerpt: "Hierarchical robot learning decomposes long-horizon tasks into reusable skills. The options framework, skill discovery methods, SPiRL, and SayCan all tackle the challenge of structured policy learning at multiple time scales."
author_profile: true
read_time: true
is_overview: false
icon: "🧩"
read_mins: 5
permalink: /blog/robotics/skill-learning/
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

<div class="tldr-box"><strong>TL;DR:</strong> Long-horizon robot tasks — "tidy the kitchen", "assemble a circuit board" — are too complex for flat RL policies. Hierarchical approaches decompose tasks into reusable skills or primitives: the options framework formalises this mathematically; skill discovery methods extract skills from data; SPiRL accelerates RL using pre-trained skill priors; and SayCan grounds language instructions to physical skill execution.</div>
{% include figure image_path="/images/blog/robotics/ahn2022_saycan.png" alt="SayCan skill learning" caption="SayCan: grounding language in robot skill primitives (Ahn et al., 2022)" %}


## The Long-Horizon Problem

Flat RL policies struggle with tasks that require many sequential decisions over long time horizons. Reward signals become extremely sparse — the robot might take thousands of actions before receiving any feedback — and the policy must simultaneously solve the exploration problem (finding a viable action sequence) and the optimisation problem (learning to execute it well).

Humans tackle this through hierarchical decomposition: we think of "making coffee" as a sequence of skills — "boil water", "grind beans", "pour" — each of which is itself a sub-plan. Robots benefit from the same structure.

## The Options Framework

The **options framework** (Sutton, Precup & Singh 1999) provides a formal extension of MDPs for temporal abstraction. An **option** consists of:

- An initiation set: states from which the option can begin
- An intra-option policy: the low-level policy executed during the option
- A termination condition: the probability of terminating at each state

A high-level policy selects options rather than primitive actions, operating at a coarser time scale. The **semi-MDP** framework provides the theoretical foundation for learning both high-level option selection and low-level option execution simultaneously.

<div class="math-box">
V(s) = max over options Q(s, omega)
</div>

where $$Q(s, \omega)$$ is the value of initiating option $$\omega$$ in state $$s$$.

## Skill Discovery

Rather than hand-designing options, **skill discovery** methods automatically extract reusable skills from data. Key approaches include:

- **Diversity-driven discovery** (DIAYN, Eysenbach et al. 2018): train skills to be maximally diverse and distinguishable using a mutual information objective. Skills emerge from unsupervised interaction with the environment.
- **Subgoal-based discovery**: identify bottleneck states (states that appear frequently in successful trajectories) as natural skill termination points.
- **Variational skill models**: learn a latent skill space such that sampling a skill code and conditioning a policy on it produces diverse, meaningful behaviours.

<div class="insight-box"><strong>Key Insight:</strong> Skill discovery reframes the question from "what skills should we pre-program?" to "what skills naturally emerge from the task structure?" This allows skills to adapt to the specific robot and environment rather than being imposed by human designers.</div>

## SPiRL: Skill Prior RL

**SPiRL** (Pertsch et al. 2021) pre-trains a skill encoder and decoder on offline datasets of robot behaviour, learning a compact latent skill space. During downstream RL, the high-level policy selects skill latents rather than primitive actions, and the decoder executes them as multi-step motor commands. A **skill prior** — the distribution of skills likely to be useful in a given state — regularises the high-level policy, dramatically accelerating learning:

<div class="math-box">
J(pi) = E[sum r_t] - alpha * KL(pi(z|s) || p(z|s))
</div>

where $$p(z|s)$$ is the skill prior. The KL penalty prevents the policy from exploring random, unproductive skill combinations and instead focuses on skills that are plausible given the robot's current state. SPiRL was demonstrated to accelerate learning on long-horizon kitchen manipulation tasks by an order of magnitude compared to flat RL.

## SayCan: Language-Conditioned Skill Execution

**SayCan** (Ahn et al. 2022, arXiv:2204.01691) combines the representational power of large language models with the physical grounding of learned robot skills. The architecture has two components:

1. **Language model**: given an instruction like "bring me a snack that isn't too sweet", the LLM scores candidate skill strings (e.g., "pick up the apple", "open the drawer") by their probability under the instruction.

2. **Affordance model**: for each candidate skill, a learned value function estimates the probability that the skill can be successfully executed from the current robot state and visual observation.

The robot selects the skill that maximises the product of LLM probability and affordance probability, then executes it with a low-level policy. SayCan demonstrated impressive generalisation to novel instructions on a cafeteria robot, all without task-specific training.

## Language-Conditioned Skill Primitives

Beyond SayCan, a family of work trains skill-conditioned policies that accept natural language as the skill specification. Models like SayCan's skill policies, HULC (Mees et al. 2022), and LISA learn to map language instructions to trajectories, enabling flexible task specification without per-task reward engineering.

## References

- Sutton, R. S., Precup, D., & Singh, S. (1999). Between MDPs and semi-MDPs: A framework for temporal abstraction in reinforcement learning. *Artificial Intelligence*, 112(1–2), 181–211.
- Ahn, M., et al. (2022). Do as I can, not as I say: Grounding language in robotic affordances. *arXiv:2204.01691*.
- Pertsch, K., Lee, Y., & Lim, J. (2021). Accelerating reinforcement learning with learned skill priors. *CoRL 2021*.
- Eysenbach, B., et al. (2018). Diversity is all you need: Learning skills without a reward function. *ICLR 2019*. arXiv:1802.06070.
- Nachum, O., et al. (2018). Data-efficient hierarchical reinforcement learning. *NeurIPS 2018*.
- Mees, O., et al. (2022). HULC: Language grounding for multi-task learning of robot skills. *ICRA 2022*.
