---
layout: single
title: "Generalised Advantage Estimation: How Much Future Should an Update Trust?"
date: 2026-10-15
categories: [rl]
book: rl
subsection: policy-gradient
tags: [GAE, actor-critic, bias-variance, policy-gradient]
published: true
excerpt: "An actor needs to know whether an action was better than expected. GAE builds that signal from temporal-difference errors, with one parameter controlling how far credit travels."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 5
permalink: /blog/rl/generalised-advantage-estimation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box"><strong>TL;DR:</strong> Generalised Advantage Estimation (GAE) adds up temporal-difference errors with exponentially decreasing weights. Small \(\lambda\) trusts the critic heavily; large \(\lambda\) uses more observed rewards. The result is an advantage estimate for a policy update, not a complete learning algorithm. Correct handling of terminal states and rollout boundaries matters as much as the formula.</div>

{% include paper-preview.html paper="arxiv-1506-02438" %}

## Better than what?

**Intuition first.** Imagine two decisions in a game. One earns five points from an easy position where ten were expected. The other earns two points from a difficult position where zero were expected. Reward alone favours the first. Improvement over the policy's usual outcome favours the second.

For a policy $$\pi$$, the value $$V^\pi(s)$$ is its expected discounted return from state $$s$$. The action value $$Q^\pi(s,a)$$ fixes the first action, then follows that policy. Their difference is the **advantage**:

<div class="formula-box">
\[
A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s).
\]
</div>

Positive advantage gives an actor a reason to increase an action's probability. The challenge is that neither true value is available during training.

## From one-step errors to a longer view

Let $$V$$ be the learned critic, $$r_t$$ the reward following action $$a_t$$, and $$\gamma$$ the discount. For a rollout ending at index $$T$$, GAE uses

<div class="formula-box">
\[
\delta_t=r_t+\gamma V(s_{t+1})-V(s_t),
\qquad
\hat A_t=\sum_{l=0}^{T-t-1}(\gamma\lambda)^l\delta_{t+l}.
\]
</div>

At a true terminal state set the next-state value to zero. At a collection cutoff in a continuing episode, retain the bootstrap value. The estimator and its bias–variance analysis come from [Schulman et al.](https://arxiv.org/abs/1506.02438).

With $$\lambda=0$$, only the first TD error contributes. With $$\lambda=1$$, the value terms telescope into the discounted reward sum plus a boundary bootstrap, minus $$V(s_t)$$. Intermediate values blend those horizons. An inaccurate critic can introduce bias when $$\lambda<1$$; longer horizons typically introduce more sampling variability.

## Worked example: three rewards, one backwards pass

Consider a deliberately small episode with rewards $$[1,0,2]$$, values $$[1.5,1.0,0.5,0]$$, and $$\gamma=0.9$$. The final state is terminal. The TD errors are

<div class="formula-box">
\[
\delta_0=0.4,\qquad \delta_1=-0.55,\qquad \delta_2=1.5.
\]
</div>

Choose $$\lambda=0.8$$, so $$\gamma\lambda=0.72$$. Compute backwards:

| Step | Calculation | Advantage |
|---|---|---|
| 2 | $$1.5$$ | $$1.5$$ |
| 1 | $$-0.55+0.72(1.5)$$ | $$0.53$$ |
| 0 | $$0.4+0.72(0.53)$$ | $$0.7816$$ |

The middle action has a negative immediate TD error but a positive GAE estimate: the later reward changes its assessment. This is a numerical illustration, not an experimental result.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="gae-title gae-desc" viewBox="0 0 640 175" style="width:100%;max-width:640px;height:auto">
<title id="gae-title">Future TD errors receive decreasing weights</title>
<desc id="gae-desc">For gamma times lambda equal to 0.72, the first three weights are 1, 0.72, and 0.5184. The weighted errors are added to form the advantage.</desc>
<rect width="640" height="175" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="15" fill="#334155">
<text x="22" y="37">δ₀</text><text x="22" y="82">δ₁</text><text x="22" y="127">δ₂</text>
<rect x="65" y="18" width="360" height="25" rx="4" fill="#0d9488"/>
<rect x="65" y="63" width="259.2" height="25" rx="4" fill="#2563eb"/>
<rect x="65" y="108" width="186.624" height="25" rx="4" fill="#7c3aed"/>
<text x="440" y="37">weight 1</text><text x="340" y="82">weight 0.72</text><text x="270" y="127">weight 0.5184</text>
<text x="320" y="159" text-anchor="middle">Â₀ = δ₀ + 0.72 δ₁ + 0.5184 δ₂</text>
</g></svg>
<figcaption>The bars show weights, not advantages. Each weight multiplies a signed TD error, so a later error can increase or decrease the final estimate.</figcaption>
</figure></div>

## Two boundaries, two different decisions

A useful implementation keeps **bootstrapping** separate from **continuing the trace**. A true terminal transition does neither. A time-limit cutoff of an otherwise continuing task can bootstrap from its final observation, but must not carry a trace into the reset episode. A finite-horizon task whose horizon is genuinely part of the objective is different: its endpoint is terminal.

This plain Python version assumes one stored rollout, with `next_values` evaluated on the actual next observations before any reset:

```python
def gae(rewards, values, next_values, terminated, episode_end,
        gamma=0.99, lam=0.95):
    advantages = [0.0] * len(rewards)
    trace = 0.0
    for t in reversed(range(len(rewards))):
        bootstrap = 0.0 if terminated[t] else next_values[t]
        delta = rewards[t] + gamma * bootstrap - values[t]
        continuation = 0.0 if episode_end[t] else trace
        trace = delta + gamma * lam * continuation
        advantages[t] = trace
    return advantages
```

The initial zero trace also stops accumulation at the end of the stored rollout. Its final TD error still bootstraps when appropriate. `episode_end` must include both termination and truncation boundaries.

## What to inspect when learning stalls

Inspect advantage statistics before normalisation, critic errors, and how often rollouts end. A sign error can reward the wrong actions; a reset observation used as a bootstrap can join unrelated episodes. Increasing $$\lambda$$ cannot repair either bug.

<div class="insight-box"><strong>Key Insight:</strong> GAE decides how to estimate the learning signal. A policy optimiser decides how to use it. Changing the estimator and changing the size of the policy update solve different problems.</div>

For a complementary approach to critic error in continuous control, continue with [TD3](/blog/rl/td3/).

## References

1. Schulman, J., Moritz, P., Levine, S., Jordan, M. I., & Abbeel, P. [High-Dimensional Continuous Control Using Generalized Advantage Estimation](https://arxiv.org/abs/1506.02438). *ICLR 2016*.
