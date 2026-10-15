---
layout: single
title: 'Temporal-Difference Learning: Update a Value from One Transition'
categories:
- rl
book: rl
subsection: foundations
tags:
- temporal-difference
- bootstrapping
- value-functions
- foundations
published: true
excerpt: Learn the TD error with a numerical update, compare bootstrapping with full returns, and handle terminal states without confusing them with rollout cutoffs.
author_profile: true
read_time: true
is_overview: false
icon: ⏱️
read_mins: 4
permalink: /blog/rl/temporal-difference/
toc: true
toc_label: Contents
last_modified_at: '2026-10-15'
---

<div class="tldr-box"><strong>TL;DR:</strong> TD learning updates a value estimate towards reward plus an estimated continuation value. It can learn before an episode finishes. Because its target includes another estimate, it bootstraps; terminal states and externally truncated rollouts need different treatment.</div>

## Learn from a step before knowing the whole outcome

**Intuition first.** You predicted that a route would yield return 4. After one step, you receive reward 1 and arrive somewhere currently valued at 5. With discount 0.9, that experience suggests a target of 5.5 for the earlier state.

For transitions collected under a fixed policy, tabular TD(0) uses

<div class="formula-box">
\[
\begin{aligned}
\delta_t&=R_{t+1}+\gamma V(S_{t+1})-V(S_t),\\
V(S_t)&\leftarrow V(S_t)+\alpha\delta_t.
\end{aligned}
\]
</div>

The TD error $$\delta_t$$ measures disagreement between the current estimate and a one-step target. The learning rate $$\alpha$$ controls how far to move towards that target. [Model-free prediction lecture](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-4-model-free-prediction-.pdf).

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="td-update-title td-update-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="td-update-title">A temporal-difference update</title>
<desc id="td-update-desc">The target uses the observed reward and an estimated continuation; the learning rate controls the update size.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Observe transition</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Build TD target</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Adjust old value</text></g>
</svg>
<figcaption>The target uses the observed reward and an estimated continuation; the learning rate controls the update size.</figcaption>
</figure></div>

## Worked example: target, error, update

Take $$V(S_t)=4$$, $$R_{t+1}=1$$, $$V(S_{t+1})=5$$, $$\gamma=0.9$$, and $$\alpha=0.2$$:

<div class="formula-box">
\[
\begin{aligned}
\text{target}&=1+0.9(5)=5.5,\\
\delta_t&=5.5-4=1.5,\\
V_{\mathrm{new}}(S_t)&=4+0.2(1.5)=4.3.
\end{aligned}
\]
</div>

The update does not set the estimate equal to the target because $$\alpha<1$$. Nor does a positive TD error prove that the action was objectively good: an inaccurate next-state estimate can make the target overoptimistic.

## Compare three kinds of backup

| Method | Information used for the target | Main distinction |
|---|---|---|
| Dynamic programming | Expected outcomes from a model | Sums over possible transitions |
| Monte Carlo prediction | Observed return to episode end | Waits for the sampled outcome |
| TD(0) | One reward plus next-state estimate | Bootstraps immediately |

Monte Carlo targets can vary substantially across episodes. TD uses an imperfect continuation estimate and can propagate its errors. Neither method is universally more accurate for a fixed amount of data.

## A terminal transition has no continuation

If the transition ends the task, its target is just the received reward. In the same example, a terminal reward of 1 gives $$\delta=1-4=-3$$ and updated value $$4+0.2(-3)=3.4$$.

An external collection cutoff is different. If the underlying task would continue, its continuation value remains relevant. Use the final observation before reset for that estimate. A reset observation belongs to a different episode. [Gymnasium's termination and truncation guide](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/) explains this distinction.

A time limit that is part of the task definition is a genuine finite-horizon boundary; the state should then account for remaining time. The word “timeout” alone does not determine the correct target.

## From one step to several

An $$n$$-step target combines several observed rewards before bootstrapping:

<div class="formula-box">
\[
G_t^{(n)}=\sum_{k=0}^{n-1}\gamma^kR_{t+k+1}
+\gamma^nV(S_{t+n}).
\]
</div>

If the task terminates earlier, stop at that boundary and omit the continuation. This connects one-step updates to longer returns and prepares the idea behind [generalised advantage estimation](/blog/rl/generalised-advantage-estimation/).

<div class="insight-box"><strong>Key Insight:</strong> Bootstrapping replaces an unknown future return with a current estimate. It makes early updates possible, while making the target's accuracy and episode boundaries part of the algorithm.</div>

Next, [actor–critic basics](/blog/rl/policies-and-actor-critics/) explains how value estimates help update the action policy.

## References

1. Silver, D. [Reinforcement Learning course: Model-Free Prediction](https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/lecture-4-model-free-prediction-.pdf).
2. Farama Foundation. [Handling Time Limits](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/).
