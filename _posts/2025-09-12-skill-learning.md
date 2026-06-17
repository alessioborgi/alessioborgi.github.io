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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Long-horizon robot tasks — "tidy the kitchen", "assemble a circuit board" — are too complex for flat RL policies. Hierarchical approaches decompose tasks into reusable skills or primitives: the options framework formalises this mathematically; skill discovery methods extract skills from data; SPiRL accelerates RL using pre-trained skill priors; and SayCan grounds language instructions to physical skill execution.</div>
{% include figure image_path="/images/blog/robotics/ahn2022_saycan.png" alt="SayCan skill learning" caption="SayCan: grounding language in robot skill primitives (Ahn et al., 2022)" %}


## The Long-Horizon Problem

**Intuition first.** When you make a cup of tea, you do not plan every individual muscle contraction. Your brain operates at multiple levels simultaneously: a high level decides "boil water then steep the bag", a mid level sequences "walk to kettle, pick up kettle, fill kettle", and the low level handles the precise finger forces and wrist angles. This hierarchy is exactly what hierarchical robot learning tries to replicate — the high-level policy picks which *skill* to execute, and the low-level policy handles the motor details.

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

<style>
@keyframes skillSelect { 0%,100%{opacity:0.3;} 40%,60%{opacity:1;} }
.skill-a { animation: skillSelect 3s ease-in-out infinite; animation-delay: 0s; }
.skill-b { animation: skillSelect 3s ease-in-out infinite; animation-delay: 1s; }
.skill-c { animation: skillSelect 3s ease-in-out infinite; animation-delay: 2s; }
@keyframes execPulse { 0%,100%{stroke-dashoffset:80;} 50%{stroke-dashoffset:0;} }
.exec-line { stroke-dasharray:80; animation: execPulse 1.5s linear infinite; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <defs><marker id="sk" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#374151"/></marker></defs>
  <!-- High-level policy box -->
  <rect x="10" y="60" width="110" height="50" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="65" y="82" text-anchor="middle" font-size="10" font-weight="bold" fill="#4c1d95" font-family="sans-serif">High-level</text>
  <text x="65" y="96" text-anchor="middle" font-size="10" fill="#4c1d95" font-family="sans-serif">policy</text>
  <text x="65" y="110" text-anchor="middle" font-size="9" fill="#6d28d9" font-family="sans-serif">picks skill z</text>
  <!-- Skill library -->
  <rect x="160" y="20" width="90" height="28" rx="6" fill="#d1fae5" stroke="#059669" stroke-width="1.2"/>
  <text x="205" y="39" text-anchor="middle" font-size="10" fill="#065f46" font-family="sans-serif" class="skill-a">pick_up(obj)</text>
  <rect x="160" y="58" width="90" height="28" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
  <text x="205" y="77" text-anchor="middle" font-size="10" fill="#1e40af" font-family="sans-serif" class="skill-b">open_drawer</text>
  <rect x="160" y="96" width="90" height="28" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.2"/>
  <text x="205" y="115" text-anchor="middle" font-size="10" fill="#92400e" font-family="sans-serif" class="skill-c">place(loc)</text>
  <text x="205" y="140" text-anchor="middle" font-size="9" fill="#64748b" font-family="sans-serif">skill library</text>
  <!-- Low-level executor -->
  <rect x="300" y="60" width="90" height="50" rx="8" fill="#fdf4ff" stroke="#a21caf" stroke-width="1.5"/>
  <text x="345" y="82" text-anchor="middle" font-size="10" font-weight="bold" fill="#701a75" font-family="sans-serif">Low-level</text>
  <text x="345" y="96" text-anchor="middle" font-size="10" fill="#701a75" font-family="sans-serif">policy</text>
  <text x="345" y="110" text-anchor="middle" font-size="9" fill="#a21caf" font-family="sans-serif">joint torques</text>
  <!-- Arrows -->
  <line x1="120" y1="85" x2="158" y2="73" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#sk)"/>
  <line class="exec-line" x1="252" y1="73" x2="298" y2="83" stroke="#059669" stroke-width="1.8" fill="none" marker-end="url(#sk)"/>
  <!-- Labels -->
  <text x="200" y="170" text-anchor="middle" font-size="9" fill="#475569" font-family="sans-serif">Hierarchical policy: high-level selects skill → low-level executes for k steps</text>
</svg>
<figcaption>Hierarchical robot policy. A high-level policy selects a skill (option) every k steps; a low-level skill policy executes it, outputting joint torques each timestep.</figcaption>
</figure></div>

## SPiRL: Skill Prior RL

**SPiRL** (Pertsch et al. 2021) pre-trains a skill encoder and decoder on offline datasets of robot behaviour, learning a compact latent skill space. During downstream RL, the high-level policy selects skill latents rather than primitive actions, and the decoder executes them as multi-step motor commands. A **skill prior** — the distribution of skills likely to be useful in a given state — regularises the high-level policy, dramatically accelerating learning:

<div class="math-box">
J(pi) = E[sum r_t] - alpha * KL(pi(z|s) || p(z|s))
</div>

where $$p(z|s)$$ is the skill prior. The KL penalty prevents the policy from exploring random, unproductive skill combinations and instead focuses on skills that are plausible given the robot's current state. SPiRL was demonstrated to accelerate learning on long-horizon kitchen manipulation tasks by an order of magnitude compared to flat RL.

## Worked Example: SayCan Skill Selection

Given the instruction "bring me something to drink from the fridge", SayCan scores each candidate skill string:

| Skill string | LLM score | Affordance score | Product |
|---|---|---|---|
| "pick up the water bottle" | 0.35 | 0.82 | **0.287** ← selected |
| "pick up the apple juice" | 0.28 | 0.74 | 0.207 |
| "open the fridge" | 0.22 | 0.91 | 0.200 |
| "pick up the sandwich" | 0.04 | 0.88 | 0.035 |

The LLM ranks drinks over food; the affordance model confirms the water bottle is reachable and graspable from the robot's current state. The product selects the skill that is both linguistically appropriate and physically feasible.

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
