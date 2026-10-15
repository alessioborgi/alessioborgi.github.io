---
layout: single
title: "ACT: Why a Robot Policy Predicts a Chunk of Actions"
date: 2026-10-15
categories: [robotics]
book: robotics
subsection: frontier
tags: [ACT, imitation-learning, transformers, action-chunking]
published: true
excerpt: "Action Chunking with Transformers predicts coordinated action sequences from demonstrations. Its key timing distinction is between how far ahead a policy predicts and how often the robot observes again."
author_profile: true
read_time: true
is_overview: false
icon: "🦾"
read_mins: 5
permalink: /blog/robotics/action-chunking-transformers/
toc: true
toc_label: "Contents"
---

<div class="tldr-box"><strong>TL;DR:</strong> Action Chunking with Transformers (ACT) learns sequences of robot actions from demonstrations. A conditional variational autoencoder models demonstration variation, and temporal ensembling combines overlapping predictions for the same execution time. Predicting a long chunk does not require executing it entirely without feedback.</div>

{% include paper-preview.html paper="arxiv-2304-13705" %}

## One frame does not explain a whole movement

**Intuition first.** Imagine inserting a battery while the other hand steadies its holder. A single image may support several reasonable next commands, depending on the demonstrator's timing and intended approach. Predicting each action independently can lose the coordination across the movement.

ACT maps images and joint positions to an action sequence. Its original setting uses joint-position targets for bimanual manipulation, learned from teleoperated demonstrations. The method was introduced by [Zhao et al.](https://arxiv.org/abs/2304.13705).

## A sequence model with a training-time latent

Let $$o_t$$ contain images and proprioception, $$q_t$$ denote joint positions, and $$A_t=(a_t,\ldots,a_{t+K-1})$$ be a demonstration chunk. A compact form of the training objective is

<div class="formula-box">
\[
\mathcal L=
\mathbb E_{z\sim q_\phi(z\mid q_t,A_t)}
\left[\|A_t-f_\theta(o_t,z)\|_1\right]
+\beta D_{\mathrm{KL}}\!\left(q_\phi(z\mid q_t,A_t)\,\|\,\mathcal N(0,I)\right).
\]
</div>

The encoder sees demonstrated future actions during training. At deployment that encoder is discarded, and the original ACT procedure sets $$z=0$$, the prior mean. The policy uses current observations to predict the chunk. It does not receive future ground-truth actions at inference. [The paper](https://arxiv.org/abs/2304.13705) details this training–deployment distinction.

## Two horizons that need separate names

The **prediction horizon** is the number of actions output by the model. The **execution horizon** is how many commands are applied before another policy query incorporates fresh observations.

For an illustrative 50 Hz control loop, a chunk of 20 actions describes 0.4 seconds. Executing all 20 before looking again leaves 0.4 seconds without a new policy decision. Querying every control step incorporates another observation every 0.02 seconds, if inference and sensing can meet that deadline.

Those systems use the same chunk length and have very different feedback behaviour.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="act-title act-desc" viewBox="0 0 640 225" style="width:100%;max-width:640px;height:auto">
<title id="act-title">Overlapping action chunks agree on an execution time</title>
<desc id="act-desc">Chunks predicted at times zero, one, and two each contain a prediction for time two. Temporal ensembling combines those aligned predictions, rather than adjacent actions in one chunk.</desc>
<rect width="640" height="225" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="15" fill="#334155"><text x="25" y="65">query t = 0</text><text x="25" y="115">query t = 1</text><text x="25" y="165">query t = 2</text></g>
<rect x="170" y="40" width="300" height="35" rx="6" fill="#dbeafe"/><rect x="245" y="90" width="300" height="35" rx="6" fill="#ccfbf1"/><rect x="320" y="140" width="300" height="35" rx="6" fill="#ede9fe"/>
<rect x="320" y="25" width="75" height="160" rx="5" fill="none" stroke="#b45309" stroke-width="3" stroke-dasharray="5 4"/>
<g font-family="sans-serif" font-size="15" fill="#334155" text-anchor="middle"><text x="207" y="63">a₀</text><text x="282" y="63">a₁</text><text x="357" y="63">a₂</text><text x="432" y="63">a₃</text><text x="282" y="113">a₁</text><text x="357" y="113">a₂</text><text x="432" y="113">a₃</text><text x="507" y="113">a₄</text><text x="357" y="163">a₂</text><text x="432" y="163">a₃</text><text x="507" y="163">a₄</text><text x="582" y="163">a₅</text><text x="320" y="210">Combine predictions in the highlighted column.</text></g>
</svg>
<figcaption>Each row comes from a different observation. The highlighted predictions all refer to the action executed at time two.</figcaption>
</figure></div>

## Worked example: temporal ensembling

Suppose three overlapping chunks predict joint targets $$0.20$$, $$0.24$$, and $$0.22$$ radians for the same execution time. Use illustrative normalised weights $$0.5$$, $$0.3$$, and $$0.2$$, ordered from oldest prediction to newest:

<div class="formula-box">
\[
\begin{aligned}
\bar a_t&=0.5(0.20)+0.3(0.24)+0.2(0.22)\\
&=0.216\;\mathrm{rad}.
\end{aligned}
\]
</div>

This smooths disagreement between plans for one timestamp. Averaging $$a_t$$, $$a_{t+1}$$, and $$a_{t+2}$$ within a single plan instead mixes commands intended for different times.

The original ACT weighting uses $$w_i=\exp(-mi)$$ with index zero assigned to the **oldest** prediction; normalisation makes the weights sum to one. Check the indexing before interpreting the decay parameter. This detail is specified in [the temporal-ensemble description](https://arxiv.org/pdf/2304.13705).

## What the model cannot fix for you

If the camera timestamp lags behind the joint observation, the model receives a physically inconsistent scene. If training actions are absolute joint targets but deployment interprets them as increments, even an accurate predictor commands the wrong movement. Verify alignment, units, action meaning, and inference latency before tuning architecture depth.

Also split demonstrations by complete episode. Randomly splitting overlapping action windows can put almost identical sequences on both sides of the evaluation boundary.

<div class="insight-box"><strong>Key Insight:</strong> Chunking provides temporal structure; frequent observation provides feedback. Smooth actions are useful, but smoothness alone does not show that the robot reacts correctly when the scene changes.</div>

Compare this demonstration-based approach with [residual RL](/blog/robotics/residual-reinforcement-learning/), which learns corrections from rewards, and [learned MPC](/blog/robotics/learned-model-predictive-control/), which scores future sequences through a dynamics model.

## References

1. Zhao, T. Z., Kumar, V., Levine, S., & Finn, C. [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705). *RSS 2023*.
