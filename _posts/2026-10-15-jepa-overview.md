---
layout: single
title: "JEPA: Learning What to Predict in Representation Space"
date: 2026-10-15
last_modified_at: 2026-10-21
categories: [jepa]
book: jepa
subsection: foundations
tags: [JEPA, self-supervised-learning, representation-learning, world-models]
published: true
excerpt: "A guide to joint-embedding predictive architectures: what their targets mean, why prediction can collapse, and how the idea extends from images to video, robotics, and language."
author_profile: true
read_time: true
is_overview: true
icon: "🧩"
read_mins: 5
permalink: /blog/jepa/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box"><strong>TL;DR:</strong> A Joint-Embedding Predictive Architecture learns to predict a target representation from available context. The choice of representation determines which details matter to the prediction problem. This book follows that idea through images, video, robot planning, and language, while keeping three questions separate: what is predicted, what prevents collapse, and how the representation is evaluated.</div>

## Start with the target

**Intuition first.** Watch a cup move behind a book. You may predict that the cup will reappear on the other side without knowing the exact reflection on its surface. A useful predictive model should preserve information needed for that judgement. Whether it actually learns to do so is an experimental question.

JEPA makes the prediction target a learned representation. In [I-JEPA](https://arxiv.org/abs/2301.08243), the target describes hidden image regions; in [V-JEPA](https://arxiv.org/abs/2404.08471), it describes hidden parts of a video. The word *predictive* does not require the target to be in the future: a missing patch in the same image is also a prediction problem.

## The common pattern

Let $$x$$ be visible context, $$y$$ the target observation, and $$c$$ information such as target position, a question, or an action. A schematic objective is

<div class="formula-box">
\[
\begin{aligned}
z_x &= f_\theta(x), & z_y &= f_\xi(y),\\
\hat z_y &= g_\phi(z_x,c), &
\mathcal L &= D(\hat z_y,z_y)+\lambda\mathcal R.
\end{aligned}
\]
</div>

Here $$D$$ measures prediction error, while $$\mathcal R$$ stands for an explicit regulariser when the method uses one. This is a reading aid, not a universal implementation: the papers use different losses, encoders, and mechanisms for maintaining informative features.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="jepa-title jepa-desc" viewBox="0 0 640 230" style="width:100%;max-width:640px;height:auto">
<title id="jepa-title">Prediction and comparison happen in representation space</title>
<desc id="jepa-desc">Context is encoded and passed through a predictor. A target observation is encoded separately. The two representations are compared; the target pixels are not the prediction output.</desc>
<rect width="640" height="230" rx="10" fill="#f8fafc"/>
<g fill="#ccfbf1"><rect x="20" y="30" width="155" height="55" rx="7"/><rect x="230" y="30" width="155" height="55" rx="7"/></g>
<g fill="#dbeafe"><rect x="20" y="140" width="155" height="55" rx="7"/><rect x="230" y="140" width="155" height="55" rx="7"/></g>
<rect x="455" y="83" width="160" height="65" rx="7" fill="#ede9fe"/>
<g stroke="#64748b" stroke-width="2" fill="none"><path d="M175 57 H222 M214 51 L222 57 L214 63 M175 167 H222 M214 161 L222 167 L214 173 M385 57 H425 V105 H448 M440 99 L448 105 L440 111 M385 167 H425 V130 H448 M440 124 L448 130 L440 136"/></g>
<g font-family="sans-serif" font-size="16" fill="#334155" text-anchor="middle"><text x="97" y="63">Context encoder</text><text x="307" y="63">Predictor</text><text x="97" y="173">Target encoder</text><text x="307" y="173">Target features</text><text x="535" y="111">Compare</text><text x="535" y="132">representations</text><text x="320" y="220">Positions, actions, or questions can condition the predictor.</text></g>
</svg>
<figcaption>The shared idea is a prediction task in a learned feature space. The training recipe differs across the papers.</figcaption>
</figure></div>

## Worked example: a perfect loss can be useless

Take two unrelated images. Suppose both target embeddings equal $$(0,0)$$, and the predictor always returns $$(0,0)$$. Their squared prediction errors are both zero. Yet the representation cannot tell the images apart.

This is **representation collapse**. Measuring prediction error alone cannot establish usefulness when the model also learns the targets. [LeJEPA](https://arxiv.org/abs/2511.08544) tackles this through distribution regularisation; I-JEPA and V-JEPA use a moving-average target encoder within their training recipes. These mechanisms should be examined together with masking, architecture, and evaluation.

A second failure is subtler. Suppose two scenes differ only in whether a cup is inside a gripper. A representation that erases this distinction may be adequate for identifying the object and inadequate for deciding whether to lift. The downstream task decides which invariances are helpful.

## A reading route through the book

| Chapter | Question to carry into the paper |
|---|---|
| [I-JEPA](/blog/jepa/i-jepa/) | How do masking and target features shape image learning? |
| [LeJEPA](/blog/jepa/lejepa/) | Why must agreement be paired with a distribution constraint? |
| [LocaLeJEPA](/blog/jepa/localejepa/) | How can local entropy-inspired regularisation respect geometric priors? |
| [V-JEPA](/blog/jepa/v-jepa/) | What changes when the missing information spans time? |
| [V-JEPA 2](/blog/jepa/v-jepa-2/) | What additional information makes action-conditioned planning possible? |
| [V-JEPA 2.1](/blog/jepa/v-jepa-2-1/) | Why can good global features still be poor local features? |
| [LeWorldModel](/blog/jepa/leworldmodel/) | How can visual representations and action-conditioned dynamics be learned together? |
| [VL-JEPA](/blog/jepa/vl-jepa/) | When should a predicted meaning be decoded into words? |
| [Audio-JEPA](/blog/jepa/audio-jepa/) | Which sound information survives masked spectrogram prediction? |
| [LLM-JEPA](/blog/jepa/llm-jepa/) | How can a representation objective complement token generation? |
| [D-JEPA](/blog/jepa/d-jepa/) | How can predicted features condition a generative denoising model? |

## Reading the evidence

Check whether a result freezes the encoder and trains a small task head, fine-tunes the whole model, or evaluates a complete control system. These measure different capabilities. Also check which labels, captions, actions, and pretrained components enter each stage.

[V-JEPA 2](https://arxiv.org/abs/2506.09985) distinguishes action-free video learning from robot interaction post-training. [VL-JEPA](https://arxiv.org/abs/2512.10942) uses vision-language supervision and a contrastive objective. The JEPA name therefore does not imply that every model is action-aware, label-free, or non-contrastive.

<div class="insight-box"><strong>Key Insight:</strong> A latent prediction loss is a design choice about what information the model should retain. Its value is established by the distinctions the representation preserves and the tasks it supports.</div>

For the control background, continue into [learned model predictive control](/blog/robotics/learned-model-predictive-control/). The paper-specific chapters above each include the original first page, source links, and a worked explanation.
