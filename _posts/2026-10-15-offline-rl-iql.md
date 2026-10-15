---
layout: single
title: "Offline RL and IQL: Learning Without Asking for Another Trial"
date: 2026-10-15
categories: [rl]
book: rl
subsection: value-based
tags: [offline-RL, IQL, expectile-regression, distribution-shift]
published: true
excerpt: "A fixed dataset cannot correct an agent's optimistic guesses. Implicit Q-learning improves a policy by fitting values and reweighting recorded actions, without querying unseen actions in its Bellman target."
author_profile: true
read_time: true
is_overview: false
icon: "🗃️"
read_mins: 5
permalink: /blog/rl/offline-rl-iql/
toc: true
toc_label: "Contents"
---

<div class="tldr-box"><strong>TL;DR:</strong> Offline reinforcement learning uses a fixed collection of transitions. Its central difficulty is evaluating actions that the dataset does not support. Implicit Q-learning (IQL) fits an upper expectile of recorded action values, bootstraps through that state value, then learns a policy by advantage-weighted behaviour cloning. Avoiding unseen actions during value training does not guarantee that the deployed policy stays inside the data distribution.</div>

{% include paper-preview.html paper="arxiv-2110-06169" %}

## Replay without the next experiment

**Intuition first.** A warehouse robot has a month of recorded trajectories. You can train on them repeatedly, but you cannot send the robot out to test a speculative shortcut. A value function might predict that shortcut is excellent simply because no recorded transition contradicts it.

An online off-policy method can gather evidence after changing its policy. Offline learning fixes the dataset $$\mathcal D=\{(s,a,r,s',d)\}$$. The distinction is not whether replay is used; it is whether new interaction can correct mistakes.

## The IQL update in three lines

Let $$\bar Q$$ denote a target critic and $$d$$ a terminal indicator. IQL fits a state value, a critic, and a policy using

<div class="formula-box">
\[
\begin{aligned}
L_V &= \mathbb E_{(s,a)\sim\mathcal D}
\left[|\tau-\mathbf 1_{u<0}|u^2\right],
\quad u=\bar Q(s,a)-V(s),\\
L_Q &= \mathbb E_{\mathcal D}
\left[(Q(s,a)-r-\gamma(1-d)V(s'))^2\right],\\
L_\pi &= -\mathbb E_{(s,a)\sim\mathcal D}
\left[w(s,a)\log\pi(a\mid s)\right],
\quad w=\exp\!\left(\beta[\bar Q(s,a)-V(s)]\right).
\end{aligned}
\]
</div>

Choose $$\tau>0.5$$ to favour higher recorded action values; $$\beta>0$$ controls policy selectivity. Practical implementations cap the exponential weights. The Bellman target queries $$V(s')$$, without proposing a fresh action for a critic to score. These are the central updates in [Kostrikov, Nair, and Levine](https://arxiv.org/abs/2110.06169).

## Worked example: an expectile is not a percentile

Suppose one state has two equally frequent recorded actions with values $$2$$ and $$6$$. Ordinary squared-error regression fits their mean, $$4$$.

For an expectile parameter $$\tau=0.75$$, and a fitted value $$v$$ between the observations, the loss is proportional to

<div class="formula-box">
\[
0.25(v-2)^2+0.75(6-v)^2.
\]
</div>

Setting its derivative to zero gives

<div class="formula-box">
\[
0.25(v-2)+0.75(v-6)=0
\quad\Longrightarrow\quad v=5.
\]
</div>

This is a weighted squared-distance balance. It is not a claim that 75% of observations lie below five. With $$\beta=1$$, the corresponding cloning weights are $$e^{-3}$$ and $$e^1$$: the higher-value action receives about $$e^4\approx54.6$$ times as much weight. That ratio assumes no weight clipping.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="iql-title iql-desc" viewBox="0 0 640 160" style="width:100%;max-width:640px;height:auto">
<title id="iql-title">Mean and upper expectile for two recorded values</title>
<desc id="iql-desc">Recorded action values lie at two and six. Their mean is four, while the 0.75 expectile is five.</desc>
<rect width="640" height="160" rx="10" fill="#f8fafc"/>
<line x1="80" y1="85" x2="560" y2="85" stroke="#64748b" stroke-width="2"/>
<circle cx="100" cy="85" r="7" fill="#2563eb"/><circle cx="540" cy="85" r="7" fill="#2563eb"/>
<path d="M320 55 V110" stroke="#64748b" stroke-width="3"/><path d="M430 55 V110" stroke="#0d9488" stroke-width="3"/>
<g fill="#334155" font-family="sans-serif" font-size="15" text-anchor="middle"><text x="100" y="130">Q = 2</text><text x="540" y="130">Q = 6</text><text x="300" y="35">mean = 4</text><text x="465" y="35">expectile = 5</text></g>
</svg>
<figcaption>Increasing the weight on positive residuals moves the fitted value towards the better recorded action. It does not insert a new action into the dataset.</figcaption>
</figure></div>

## A concrete dataset failure

Imagine all successful examples turn left around an obstacle. None turns right. A fitted policy might still output a right turn on an unfamiliar camera image, because a neural network maps inputs beyond its training examples. The absence of unseen-action queries in the training equations is not a hard constraint on the policy's outputs.

Now imagine the dataset contains only failed episodes, and no transition ever reaches the desired room. Reweighting actions cannot manufacture evidence of reaching that room. Useful improvement depends on coverage, reward information, and the ability to combine supported decisions.

<div class="insight-box"><strong>Key Insight:</strong> Offline learning changes what counts as evidence. A large value for an unrecorded action is a prediction that cannot be tested during training, so the update must account for that missing feedback.</div>

## What to check before trusting a result

Split data by episode or collection session, so near-identical neighbouring frames do not leak across train and validation sets. Check action units, terminal flags, reward scales, and whether final observations were preserved. A normalised action interpreted as a raw joint command changes the task completely.

Behaviour cloning is a useful reference: it asks whether value-based reweighting improves on simply imitating the same data. Compare policies under a separate evaluation protocol. Held-out Bellman error alone cannot establish successful closed-loop behaviour.

For a different way to reuse recorded experience, [hindsight experience replay](/blog/rl/hindsight-experience-replay/) changes the goal attached to a transition. It solves a sparse-reward problem rather than the full offline distribution-shift problem.

## References

1. Kostrikov, I., Nair, A., & Levine, S. [Offline Reinforcement Learning with Implicit Q-Learning](https://arxiv.org/abs/2110.06169). *ICLR 2022*.
