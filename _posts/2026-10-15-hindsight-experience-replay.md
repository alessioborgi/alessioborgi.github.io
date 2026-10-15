---
layout: single
title: "Hindsight Experience Replay: Learning from the Goal You Actually Reached"
date: 2026-10-15
categories: [rl]
book: rl
subsection: applications
tags: [HER, sparse-rewards, goal-conditioned-RL, replay]
published: true
excerpt: "A failed attempt can still teach a goal-conditioned policy something useful. HER replays the same physical transition with an achieved goal and a recomputed reward."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 4
permalink: /blog/rl/hindsight-experience-replay/
toc: true
toc_label: "Contents"
---

<div class="tldr-box"><strong>TL;DR:</strong> Hindsight Experience Replay (HER) asks what a failed attempt did achieve. It replaces the desired goal in a replay sample with an achieved goal and recomputes the reward. The state transition stays unchanged. This makes sparse rewards more informative for off-policy, goal-conditioned learning, but does not remove the need to explore or make every relabelling valid.</div>

{% include paper-preview.html paper="arxiv-1707-01495" %}

## The robot missed, but it moved something

**Intuition first.** Ask a robot to push a block to the far corner of a table. Its early attempts move the block a few centimetres, earning the same failure reward as doing nothing. Those attempts nevertheless contain evidence about how actions move the block.

Write the policy as $$\pi(a\mid s,g)$$, where $$g$$ is the desired goal. Let $$h(s)$$ extract an achieved goal, such as the block's position. HER reuses a recorded transition under a different goal $$g'$$, often selected from a later state in the same episode. [Andrychowicz et al.](https://arxiv.org/abs/1707.01495) introduced this replay mechanism for sparse-reward tasks.

## What changes in a replay sample?

<div class="formula-box">
\[
(s_t,a_t,r_t,s_{t+1},g)
\quad\longrightarrow\quad
(s_t,a_t,r(s_t,a_t,s_{t+1},g'),s_{t+1},g').
\]
</div>

The action and physical observations are retained. Goal fields in both current and next observations must agree with $$g'$$. Any goal-dependent termination flag must also be reconsidered. This assumes that changing the desired goal does not change the physical transition law.

For a simple continuing reaching task, use the reward

<div class="formula-box">
\[
r(s,a,s',g)=
\begin{cases}
0,&\|h(s')-g\|_2\leq\varepsilon,\\
-1,&\text{otherwise}.
\end{cases}
\]
</div>

Success has reward zero, not one, under this convention. Maximising return encourages reaching the goal quickly because every unsuccessful step costs one.

## Worked example: the very same push

Suppose a one-dimensional block starts at $$0.10$$ metres and the desired goal is $$0.80$$. A recorded trajectory visits $$0.20$$, $$0.35$$, then $$0.50$$. Set the success tolerance to $$0.02$$ metres.

Relabel the trajectory with $$g'=0.50$$, an achieved future position:

| Transition | Reward for original goal $$0.80$$ | Reward for relabelled goal $$0.50$$ |
|---|---|---|
| $$0.10\to0.20$$ | $$-1$$ | $$-1$$ |
| $$0.20\to0.35$$ | $$-1$$ | $$-1$$ |
| $$0.35\to0.50$$ | $$-1$$ | $$0$$ |

The early transitions are still failures for the new goal, but bootstrapping can propagate the useful final outcome backwards. We have not pretended that the block reached $$0.80$$.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="her-title her-desc" viewBox="0 0 640 180" style="width:100%;max-width:640px;height:auto">
<title id="her-title">A missed target becomes an achieved training goal</title>
<desc id="her-desc">The block moves from 0.10 through 0.20 and 0.35 to 0.50 metres. The original goal is 0.80. Relabelling chooses 0.50 without changing the path.</desc>
<rect width="640" height="180" rx="10" fill="#f8fafc"/>
<path d="M70 95 H370" stroke="#0d9488" stroke-width="4"/><path d="M370 95 H580" stroke="#94a3b8" stroke-dasharray="6 5" stroke-width="2"/>
<g fill="#0d9488"><circle cx="70" cy="95" r="7"/><circle cx="145" cy="95" r="7"/><circle cx="257" cy="95" r="7"/><circle cx="370" cy="95" r="9"/></g>
<circle cx="580" cy="95" r="10" fill="none" stroke="#7c3aed" stroke-width="3"/>
<g font-family="sans-serif" font-size="15" text-anchor="middle" fill="#334155"><text x="70" y="130">0.10</text><text x="145" y="130">0.20</text><text x="257" y="130">0.35</text><text x="370" y="130">0.50</text><text x="580" y="130">0.80</text><text x="335" y="46">achieved goal</text><text x="550" y="46">desired goal</text><text x="320" y="162">Same actions and states; a different training question.</text></g>
</svg>
<figcaption>The dashed segment was never traversed. HER changes the goal label, not the observed outcome.</figcaption>
</figure></div>

## A small replay recipe

Store complete episodes so later achieved goals are available. When drawing a transition, decide whether to keep its original goal or relabel it. For relabelled samples, draw an achieved future goal from that same episode, reconstruct the goal-conditioned observations, and call the task's reward function again. Then pass the sample to an off-policy learner.

Keeping original-goal samples matters: evaluation still asks for the real task distribution. Relabelled successes alone could emphasise easy goals that early exploration happens to reach.

## Where hindsight can mislead

Consider a random disturbance that occasionally throws a block onto a target. Selecting that target afterwards overrepresents lucky outcomes. In stochastic environments, hindsight selection can bias the transition distribution conditioned on the relabelled goal; it is not automatically unbiased experience for the new task.

A second failure is more mundane. If the goal tells the simulator which object to spawn, changing the label also changes the environment that should have generated the transition. The stored physical experience may no longer be valid under the new goal.

<div class="insight-box"><strong>Key Insight:</strong> A relabelled sample answers “what did this action achieve under another objective?” It cannot answer “what would have happened in another physical world?”</div>

[Offline RL](/blog/rl/offline-rl-iql/) deals with unsupported actions; HER deals with uninformative goal rewards. A robot-learning system may need to address both problems separately.

## References

1. Andrychowicz, M., Wolski, F., Ray, A., et al. [Hindsight Experience Replay](https://arxiv.org/abs/1707.01495). *NeurIPS 2017*.
