---
layout: single
title: "Residual Connections: Why Transformers Can Be Deep"
date: 2024-03-07
categories: [transformers]
book: transformers
subsection: core
tags: [residual, skip-connections, gradient-flow, depth]
excerpt: "Without residual connections, training a 96-layer Transformer would be practically impossible. The skip connection is a simple addition that solves the vanishing gradient problem and enables arbitrary depth."
author_profile: true
read_time: true
is_overview: false
icon: "➕"
read_mins: 4
permalink: /blog/transformers/residual-connections/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.tldr-box {
  background: linear-gradient(145deg,#e8fbfb,#dbeafe);
  border-left: 4px solid #0d9488;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1.25rem 0;
}
.tldr-box strong { color: #0d9488; }
.insight-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1.25rem 0;
}
.math-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.4rem;
  margin: 1.25rem 0;
  font-family: monospace;
  text-align: center;
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A residual connection adds the input of a sub-layer directly to its output: y = x + f(x). This creates a highway for gradients to bypass any sub-layer during backpropagation, enabling very deep networks to train stably. It also encourages each layer to learn small refinements rather than full transformations.
</div>
{% include figure image_path="/images/blog/transformers/vaswani2017_transformer_architecture.png" alt="Residual connections" caption="Residual (skip) connections in the Transformer block (Vaswani et al., 2017)" %}

<div class="insight-box">
<strong>Simple mental model:</strong> a residual connection tells every sub-layer, "improve the representation if you can, but do not destroy what is already there."
</div>


## The Problem with Deep Networks

Stacking many layers allows a model to learn increasingly abstract representations. But deep networks face a fundamental training problem: **vanishing gradients**.

During backpropagation, gradients are computed by repeated multiplication through the chain rule. In a network with L layers, the gradient of the loss with respect to early-layer weights involves multiplying L Jacobians together. If each Jacobian has singular values less than 1 (common for standard activations), the gradient shrinks exponentially. Early layers learn almost nothing.

This is why naive deep networks (without tricks) perform worse than shallower ones — a counter-intuitive result that motivated residual connections.

## The Residual Fix

Introduced by He et al. (2015) for CNNs (ResNet), residual connections add the input directly to the output of each sub-layer:

<div class="math-box">
y = x + f(x)
</div>

Where x is the input, f(x) is whatever the sub-layer computes (attention, FFN, etc.), and y is the output.

This changes what the sub-layer must learn. Instead of learning a full transformation from x to the desired output, it only needs to learn the **residual** — the difference between x and the desired output. If no change is needed, f(x) = 0 works perfectly (identity function).

## Why Gradients Flow Better

In a standard deep network, the gradient of the loss L with respect to an early activation x_l is:

<div class="math-box">
∂L/∂x_l = ∂L/∂x_L · ∏ᵢ₌ₗᴸ ∂f_i/∂x_{i-1}
</div>

This is a product of L Jacobians — exponentially small or large.

With residual connections, y_l = x_l + f(x_l), so:

<div class="math-box">
∂y_l/∂x_l = 1 + ∂f/∂x_l
</div>

The gradient always includes the **1** term — a direct, unattenuated path from output to input. Even if ∂f/∂x_l ≈ 0 (a saturated or poorly-conditioned sub-layer), the gradient still flows back as 1.

Summing over all paths: gradients reach early layers directly via the skip connections. Deep networks become trainable.

<div class="insight-box">
<strong>Intuition:</strong> Think of the residual connection as a highway. The sub-layer can refine the signal traveling along the highway, but the highway exists regardless. Gradients can always take the highway home, bypassing any congested sub-layer.
</div>

## Residuals as Incremental Refinements

The residual formulation y = x + f(x) has another interpretation: **each layer proposes a small correction to the current representation**.

If f is initialised near zero (which happens naturally with small random weights), then at the start of training y ≈ x. The network begins as a near-identity function — a useful initialisation since the untrained network does not corrupt the signal.

As training progresses, each layer learns to add increasingly meaningful corrections. This is why Transformers initialise stably even at 96 layers — no single layer needs to do anything dramatic from the start.

## In Transformers: Two Residuals per Block

Each Transformer block contains two sub-layers (attention and FFN), each with its own residual connection:

```
┌─────────────────────────────────────────────┐
│  x ──────────────────────────────────────+  │
│  │                                       │  │
│  └→ LayerNorm → MultiHeadAttention ─────┘  │
│                                             │
│  x' ─────────────────────────────────────+ │
│  │                                       │ │
│  └→ LayerNorm → FeedForward ────────────┘ │
└─────────────────────────────────────────────┘
```

GPT-3's 96 layers means 192 residual additions. At every single one, there is a direct gradient highway from the loss all the way back to the input.

## The Residual Stream View

A useful mental model: think of the Transformer as a **residual stream** — a single high-dimensional vector that persists across all layers. Each attention head and FFN block reads from this stream and writes back to it via residual addition.

This view, popularised by mechanistic interpretability research (Elhage et al., 2021), makes it clear that:
- Information is preserved across layers (it stays in the stream)
- Each layer adds information rather than replacing it
- Individual layers can be interpreted as reading/writing to a shared memory

## What Happens Without Residuals?

Ablation studies confirm: removing residual connections from deep Transformers causes:
- Training instability (loss spikes, divergence)
- Significantly worse final performance
- Requirement for much more careful learning rate tuning

Adding them back is cheap — it is a single addition with no parameters — but the effect is profound.

## Summary

| Without residuals | With residuals |
|------------------|----------------|
| Gradients vanish in early layers | Gradients flow via identity skip |
| Layers learn full transformations | Layers learn small refinements |
| Deep networks hard to train | Deep networks train stably |
| Initialisation is fragile | Initialisation is near-identity |
| Performance degrades with depth | Performance improves with depth |

Residual connections are the single most important structural element that allows Transformers to scale to hundreds of layers. They cost almost nothing (one addition) but change everything.

## References

- He, K., Zhang, X., Ren, S., & Sun, J. (2016). [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385). *CVPR 2016* (ResNets: introduced residual skip connections to train very deep networks; adopted directly into Transformers by Vaswani et al.).
- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017* (Transformer: uses Add & Norm (residual + layer norm) after both attention and FFN sublayers in each block).
- Veit, A., Wilber, M., & Belongie, S. (2016). [Residual Networks Behave Like Ensembles of Relatively Shallow Networks](https://arxiv.org/abs/1605.06431). *NeurIPS 2016* (shows residual networks create exponentially many paths of varying length, explaining their robustness to layer removal).
