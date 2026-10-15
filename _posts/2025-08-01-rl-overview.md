---
layout: single
title: 'Reinforcement Learning Basics: Agents, Rewards, and Returns'
categories:
- rl
book: rl
subsection: foundations
tags:
- reinforcement-learning
- foundations
- policy
- return
published: true
excerpt: Start with the agent–environment loop, delayed rewards, and the difference between a policy, a value function, and a model. Then follow a beginner route into the paper chapters.
author_profile: true
read_time: true
is_overview: true
icon: 🎮
read_mins: 4
permalink: /blog/rl/rl-overview/
toc: true
toc_label: Contents
last_modified_at: '2026-10-15'
---

<div class="tldr-box"><strong>TL;DR:</strong> Reinforcement learning studies how an agent chooses actions to improve its expected accumulated reward. Actions change the situations the agent encounters next. Start with the interaction loop, then learn how states, values, exploration, and policy updates fit together.</div>

## Decisions change the next training example

**Intuition first.** A robot navigating a corridor chooses whether to turn left or right. That choice changes its next camera image and the decisions that follow. It may only discover several steps later that one route reaches the goal.

The agent needs a rule for choosing actions, called a **policy**. The environment supplies the consequences: a new observation and a numerical reward. An **episode** is one run of a task, ending at a terminal condition such as reaching the destination.

Rewards are feedback about outcomes. They do not normally provide the correct action for every observation. The reward definition is part of the problem design: rewarding forward movement alone may encourage driving past a destination.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="rl-loop-title rl-loop-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="rl-loop-title">One step in the interaction loop</title>
<desc id="rl-loop-desc">The new observation feeds the next decision. Rewards can arrive long after the action that made them possible.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Observe</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Choose an action</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Receive feedback</text></g>
</svg>
<figcaption>The new observation feeds the next decision. Rewards can arrive long after the action that made them possible.</figcaption>
</figure></div>

## Reward is one outcome; return includes the future

We write $$R_{t+1}$$ for the reward received after action $$A_t$$. For an episode ending at time $$T$$, the discounted return is

<div class="formula-box">
\[
G_t=\sum_{k=0}^{T-t-1}\gamma^kR_{t+k+1},
\qquad 0\leq\gamma\leq1.
\]
</div>

The discount factor $$\gamma$$ sets the weight of later rewards. For an infinite discounted sum with bounded rewards, using $$\gamma<1$$ makes the return finite. The learning objective is an expectation over possible runs, rather than the outcome of one lucky run. [Core RL definitions](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html).

## Worked example: accepting a short-term cost

Suppose a three-step route receives rewards $$-1,-1,+10$$. With $$\gamma=0.9$$,

<div class="formula-box">
\[
G_0=-1+0.9(-1)+0.9^2(10)=6.2.
\]
</div>

An alternative that ends immediately with reward $$+2$$ has return 2. The first route is preferable under this objective despite its negative initial reward. With $$\gamma=0$$, only the first reward counts, and the preference reverses.

This does not mean one discount factor is universally correct. It means discounting is part of what “good behaviour” means in the mathematical problem.

## Three objects that recur throughout the book

| Object | Question it answers | Example |
|---|---|---|
| Policy | What action should I take? | A distribution over left and right |
| Value function | How much return should I expect? | Expected return from this junction |
| Dynamics model | What happens after an action? | Distribution of the next location |

An agent may use several of these together. A learned value is not itself a reward, and a model of the next observation is not automatically a good action selector.

## Read the foundations in order

1. [MDPs](/blog/rl/mdp/): states, observations, actions, and transitions.
2. [Bellman equations](/blog/rl/bellman-equations/): relate present value to future value.
3. [Exploration](/blog/rl/exploration-exploitation/): gather information while acting.
4. [Temporal-difference learning](/blog/rl/temporal-difference/): learn values from sampled transitions.
5. [Policies and actor–critics](/blog/rl/policies-and-actor-critics/): turn estimates into policy updates.

Then follow the paper chapters on [IQL](/blog/rl/offline-rl-iql/), [GAE](/blog/rl/generalised-advantage-estimation/), [TD3](/blog/rl/td3/), and [hindsight replay](/blog/rl/hindsight-experience-replay/).

<div class="insight-box"><strong>Key Insight:</strong> RL connects a choice now to rewards later. The first task is to define the interaction and objective clearly enough that an algorithm can learn the behaviour you intended.</div>

## References

1. OpenAI. [Spinning Up: Key Concepts in RL](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html).
2. Silver, D. [Reinforcement Learning course](https://www.davidsilver.uk/teaching/), introduction and MDP lectures.
