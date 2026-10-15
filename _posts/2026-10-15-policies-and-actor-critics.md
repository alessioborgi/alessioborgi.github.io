---
layout: single
categories:
- rl
book: rl
subsection: foundations
author_profile: true
read_time: true
is_overview: false
permalink: /blog/rl/policies-and-actor-critics/
toc: true
toc_label: Contents
title: 'Policies and Actor–Critics: Turning Value Estimates into Better Actions'
excerpt: Understand policy probabilities, state and action values, advantages, and the separate jobs of actor and critic before reading GAE and TD3.
published: true
read_mins: 4
last_modified_at: '2026-10-15'
tags:
- actor-critic
- policy
- advantage
- foundations
icon: 🎯
---

<div class="tldr-box"><strong>TL;DR:</strong> A policy chooses actions. A critic estimates their expected consequences. An advantage compares an action with the policy's average performance in the same state, giving a relative signal for policy improvement.</div>

## Choosing and judging are different computations

**Intuition first.** At a junction, an actor decides which route to take. A critic estimates the return associated with the current situation or a candidate choice. The critic supplies a learning signal; it does not necessarily execute actions itself.

For discrete actions, a stochastic policy $$\pi_\theta(a\mid s)$$ assigns probabilities that sum to one. A deterministic policy instead produces one action $$\mu_\theta(s)$$. Continuous stochastic policies typically specify a probability density over actions, not a finite list of probabilities.

## Three values to keep separate

The state value $$V^\pi(s)$$ is expected return under the policy. The action value $$Q^\pi(s,a)$$ first fixes action $$a$$, then follows the policy. Their difference defines advantage:

<div class="formula-box">
\[
\begin{aligned}
V^\pi(s)&=\sum_a\pi(a\mid s)Q^\pi(s,a),\\
A^\pi(s,a)&=Q^\pi(s,a)-V^\pi(s).
\end{aligned}
\]
</div>

For continuous actions, replace the sum with an integral. Advantage is relative to a policy in a state, so an action can have positive return and negative advantage.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="actor-critic-title actor-critic-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="actor-critic-title">Actor and critic have separate jobs</title>
<desc id="actor-critic-desc">Interaction supplies data for both models. The critic’s estimate then informs a subsequent actor update.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Actor chooses</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Environment responds</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Critic evaluates</text></g>
</svg>
<figcaption>Interaction supplies data for both models. The critic’s estimate then informs a subsequent actor update.</figcaption>
</figure></div>

## Worked example: above or below the current baseline

Suppose the policy chooses left with probability 0.75 and right with probability 0.25. Its action values are 6 and 2. Then

<div class="formula-box">
\[
\begin{aligned}
V^\pi(s)&=0.75(6)+0.25(2)=5,\\
A^\pi(s,\mathrm{left})&=1,\\
A^\pi(s,\mathrm{right})&=-3.
\end{aligned}
\]
</div>

The policy-weighted average advantage is zero: $$0.75(1)+0.25(-3)=0$$. Right has positive expected return, yet performs below this policy's baseline. This is why the sign of raw reward and the sign of advantage answer different questions.

## How the actor uses a critic

For a simple on-policy stochastic actor, a sample surrogate loss is

<div class="formula-box">
\[
\mathcal L_{\mathrm{actor}}=-\frac{1}{N}\sum_t
\log\pi_\theta(a_t\mid s_t)\,\operatorname{sg}(\hat A_t).
\]
</div>

The advantages are treated as fixed weights in this actor update. Positive weights encourage the sampled actions; negative weights discourage them locally. The critic has its own fitting objective. This expression illustrates the update mechanism; the exact return objective and sampling convention determine the corresponding policy-gradient estimator. [Policy optimisation derivation](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html).

For a single sample with probability 0.25 and estimated advantage 2, the loss contribution is $$-2\log(0.25)\approx2.773$$. Increasing that probability to 0.30 lowers this contribution to approximately 2.408. Other actions and states share parameters, so a full update can have broader effects.

## A useful gradient is not a performance certificate

Minimising a surrogate repeatedly on old data does not guarantee continued return improvement. The policy changes the data distribution, and the critic's estimate can be wrong. Evaluate actual episodes separately from the numerical actor and critic losses.

[GAE](/blog/rl/generalised-advantage-estimation/) constructs advantage estimates from TD residuals. [TD3](/blog/rl/td3/) uses a deterministic actor and action-value critics, with different update equations. Learning this vocabulary makes those distinctions easier to follow.

<div class="insight-box"><strong>Key Insight:</strong> The actor controls action selection; the critic supplies an estimate of consequences. Advantage turns that estimate into a comparison with the current policy, rather than an absolute reward judgement.</div>

## References

1. OpenAI. [Spinning Up: Intro to Policy Optimization](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html).
