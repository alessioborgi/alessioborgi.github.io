---
layout: single
categories:
- jepa
book: jepa
subsection: video
author_profile: true
read_time: true
is_overview: false
permalink: /blog/jepa/leworldmodel/
toc: true
toc_label: Contents
title: 'LeWorldModel: Learning Action-Conditioned Dynamics from Pixels'
excerpt: LeWorldModel jointly trains a visual encoder and an action-conditioned predictor, combining next-embedding prediction with SIGReg. Connect the training objective to image-goal planning.
published: true
read_mins: 5
last_modified_at: '2026-10-16'
tags:
- LeWorldModel
- world-models
- planning
- SIGReg
icon: 🌍
---

<div class="tldr-box"><strong>TL;DR:</strong> LeWorldModel learns visual representations and action-conditioned latent dynamics together. A next-embedding prediction loss is paired with SIGReg to discourage collapse. A planner can then search for action sequences whose predicted final representation approaches an image goal.</div>

{% include paper-preview.html paper="arxiv-2603-19312" %}

## A world model must connect actions to consequences

**Intuition first.** A robot sees a block and considers pushing it left or right. A useful model must predict different consequences for those actions, while retaining the information needed to judge progress towards the goal.

[Maes et al.](https://arxiv.org/abs/2603.19312) introduce LeWorldModel, or LeWM, which learns an encoder and predictor jointly from pixel observations and actions. It uses prediction plus Gaussian-distribution regularisation rather than a pretrained visual encoder, a pixel-reconstruction objective, or a moving-average target encoder. The method connects the representation geometry of [LeJEPA](/blog/jepa/lejepa/) to a sequential control problem.

## Two loss terms, jointly differentiated

Let $$z_t=f_\theta(o_t)$$ encode observation $$o_t$$. Suppressing the predictor's history window for readability, the objective is

<div class="formula-box">
\[
\begin{aligned}
\hat z_{t+1}&=g_\phi(z_t,a_t),\\
\mathcal L_{\mathrm{pred}}&=\|\hat z_{t+1}-z_{t+1}\|_2^2,\\
\mathcal L&=\mathcal L_{\mathrm{pred}}+
\lambda\operatorname{SIGReg}(Z).
\end{aligned}
\]
</div>

$$Z$$ collects training embeddings. SIGReg compares random projections with a Gaussian target. Gradients flow through both predicted and target representations; the complete predictor uses a causal history and action conditioning. [Training formulation](https://arxiv.org/html/2603.19312v3).

Prediction alone permits an uninformative constant representation. Regularisation constrains its distribution, while the action-conditioned prediction task supplies the relationship between successive observations.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="lewm-title lewm-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="lewm-title">Learn representations that predict action consequences</title>
<desc id="lewm-desc">The prediction loss shapes dynamics and representations jointly. SIGReg separately constrains the embedding distribution.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Encode observations</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Predict with actions</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Compare next features</text></g>
</svg>
<figcaption>The prediction loss shapes dynamics and representations jointly. SIGReg separately constrains the embedding distribution.</figcaption>
</figure></div>

## Worked example: choosing an action sequence in latent space

Consider a deliberately simple scalar latent model $$\hat z_{t+1}=\hat z_t+a_t$$. Start at $$z_0=0.4$$ and set the goal to $$z_g=1.0$$. Over three steps, candidate A applies $$0.2$$ each time; candidate B applies $$0.1$$ each time.

<div class="formula-box">
\[
\begin{aligned}
\hat z_3(A)&=0.4+3(0.2)=1.0, & J(A)&=0,\\
\hat z_3(B)&=0.4+3(0.1)=0.7, & J(B)&=0.09,
\end{aligned}
\]
</div>

where $$J=(\hat z_3-z_g)^2$$. The model prefers A. This arithmetic illustrates planning, not LeWM's learned architecture or a physical unit conversion.

If the real latent transition adds an unmodelled 0.02 per step, A finishes at 1.06 instead. Its goal error becomes $$0.06^2=0.0036$$. Even a small systematic one-step error can change a planned outcome over a longer horizon.

## Teacher forcing and rollout are different conditions

During one-step training, the predictor receives representations of observed history. In a multi-step imagined rollout, its predictions become part of the context for later predictions. Errors can therefore move it away from the inputs used during training.

Evaluate rollouts at the horizons used by the controller, and test whether candidate trajectories are ranked correctly. Low average one-step error does not establish either property. The [authors' project page](https://le-wm.github.io/) describes image-goal planning with the cross-entropy method.

## Representation quality and task success need separate checks

A latent feature can encode position while ignoring whether an object is securely grasped. If that distinction matters for the task, a low goal distance can be misleading. Probe relevant physical quantities and evaluate full executions rather than treating a smooth latent trajectory as a success certificate.

The paper's control and physical-prediction experiments support results within their protocols. Model size and planning speed comparisons also depend on the chosen baseline, hardware, and horizon.

<div class="insight-box"><strong>Key Insight:</strong> Joint representation and dynamics learning makes predictability part of the encoder's objective. Planning still requires accurate action consequences and a goal representation that preserves task-relevant distinctions.</div>

Read [learned MPC](/blog/robotics/learned-model-predictive-control/) for the control loop, and compare [V-JEPA 2](/blog/jepa/v-jepa-2/) for a pipeline using large-scale visual pretraining before action-conditioned post-training.

## References

1. Maes, L., et al. [LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels](https://arxiv.org/abs/2603.19312). 2026.
2. Authors' [project page](https://le-wm.github.io/) and [implementation](https://github.com/KidIkaros/LeWorldModel).
