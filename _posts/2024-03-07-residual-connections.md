---
layout: single
title: "Residual Connections: Why Transformers Can Be Deep"
date: 2026-05-26
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
  font-family: "Times New Roman", Georgia, serif;
  font-size: 1.02rem;
  text-align: center;
  line-height: 1.7;
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A residual connection adds the input of a sub-layer directly to its output: y = x + f(x). This creates a highway for gradients to bypass any sub-layer during backpropagation, enabling very deep networks to train stably. It also encourages each layer to learn small refinements rather than full transformations.
</div>
{% include figure image_path="/images/blog/transformers/vaswani2017_transformer_architecture.png" alt="Residual connections" caption="Residual (skip) connections in the Transformer block (Vaswani et al., 2017)" %}

<div class="insight-box">
<strong>Simple mental model:</strong> a residual connection tells every sub-layer, "improve the representation if you can, but do not destroy what is already there."
</div>


## Intuition First: The Highway Analogy

Picture a motorway with 96 exits in sequence. Without residual connections, information must travel through every exit in order — if one exit is blocked (saturated gradient), everything behind it grinds to a halt.

A residual connection adds a **parallel express lane** that bypasses each exit entirely. Traffic (gradients) can always reach the start of the motorway via the express lane, regardless of congestion at any individual exit.

<div class="blog-figure">
<figure>
<style>
@keyframes flow-signal {
  0%   { stroke-dashoffset: 200; opacity: 0.3; }
  50%  { stroke-dashoffset: 0;   opacity: 1; }
  100% { stroke-dashoffset: -200; opacity: 0.3; }
}
@keyframes flow-skip {
  0%   { stroke-dashoffset: 300; opacity: 0.5; }
  50%  { stroke-dashoffset: 0;   opacity: 1; }
  100% { stroke-dashoffset: -300; opacity: 0.5; }
}
</style>
<svg viewBox="0 0 700 210" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <!-- Input node -->
  <circle cx="60" cy="105" r="22" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="60" y="109" text-anchor="middle" font-size="12" font-weight="700" fill="#1e40af">x</text>

  <!-- Sub-layer box -->
  <rect x="200" y="72" width="110" height="66" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
  <text x="255" y="100" text-anchor="middle" font-size="12" font-weight="700" fill="#166534">f(x)</text>
  <text x="255" y="118" text-anchor="middle" font-size="10" fill="#4b5563">(attention / FFN)</text>

  <!-- Addition circle -->
  <circle cx="460" cy="105" r="22" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>
  <text x="460" y="111" text-anchor="middle" font-size="18" font-weight="700" fill="#ea580c">⊕</text>

  <!-- Output node -->
  <circle cx="620" cy="105" r="22" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="620" y="109" text-anchor="middle" font-size="11" font-weight="700" fill="#5b21b6">x + f(x)</text>

  <!-- Through-layer arrow -->
  <path d="M82 105 L196 105" stroke="#2563eb" stroke-width="3" fill="none"
        stroke-dasharray="8 6" style="animation:flow-signal 2s linear infinite"/>
  <polygon points="196,105 183,98 183,112" fill="#2563eb"/>
  <path d="M310 105 L435 105" stroke="#16a34a" stroke-width="3" fill="none"
        stroke-dasharray="8 6" style="animation:flow-signal 2s 0.4s linear infinite"/>
  <polygon points="435,105 422,98 422,112" fill="#16a34a"/>

  <!-- Skip connection (the highway) -->
  <path d="M82 85 Q255 30 438 85" stroke="#ea580c" stroke-width="3" fill="none"
        stroke-dasharray="10 6" style="animation:flow-skip 2s 0.2s linear infinite"/>
  <polygon points="438,85 428,80 432,95" fill="#ea580c"/>
  <text x="255" y="28" text-anchor="middle" font-size="11" font-weight="700" fill="#ea580c">skip connection (identity)</text>

  <!-- Output arrow -->
  <path d="M482 105 L595 105" stroke="#7c3aed" stroke-width="3" fill="none"
        stroke-dasharray="8 6" style="animation:flow-signal 2s 0.6s linear infinite"/>
  <polygon points="595,105 582,98 582,112" fill="#7c3aed"/>

  <!-- Gradient backward label -->
  <text x="350" y="190" text-anchor="middle" font-size="11" fill="#64748b">← gradient always has a direct path back via the skip lane →</text>
</svg>
<figcaption>Animated information flow through a residual block. The orange skip connection (express lane) carries both forward signal and backward gradients past the sub-layer, guaranteeing gradient flow regardless of what f(x) does.</figcaption>
</figure>
</div>

## The Problem with Deep Networks

Stacking many layers allows a model to learn increasingly abstract representations. But deep networks face a fundamental training problem: **vanishing gradients**.

During backpropagation, gradients are computed by repeated multiplication through the chain rule. In a network with L layers, the gradient of the loss with respect to early-layer weights involves multiplying L Jacobians together. If each Jacobian has singular values less than 1 (common for standard activations), the gradient shrinks exponentially. Early layers learn almost nothing.

This is why naive deep networks (without tricks) perform worse than shallower ones — a counter-intuitive result that motivated residual connections.

## The Residual Fix

Introduced by He et al. (2015) for CNNs (ResNet), residual connections add the input directly to the output of each sub-layer:

<div class="math-box">
\[
y = x + f(x)
\]
</div>

Where x is the input, f(x) is whatever the sub-layer computes (attention, FFN, etc.), and y is the output.

This changes what the sub-layer must learn. Instead of learning a full transformation from x to the desired output, it only needs to learn the **residual** — the difference between x and the desired output. If no change is needed, f(x) = 0 works perfectly (identity function).

## Why Gradients Flow Better

In a standard deep network, the gradient of the loss L with respect to an early activation x_l is:

<div class="math-box">
\[
\frac{\partial L}{\partial x_l}
=
\frac{\partial L}{\partial x_L}
\prod_{i=l}^{L}
\frac{\partial f_i}{\partial x_{i-1}}
\]
</div>

This is a product of L Jacobians — exponentially small or large.

With residual connections, y_l = x_l + f(x_l), so:

<div class="math-box">
\[
\frac{\partial y_l}{\partial x_l}
=
1 + \frac{\partial f}{\partial x_l}
\]
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

## Concrete Example: Gradient Flow with and Without Residuals

Consider a toy 3-layer network, each layer applying a transformation with Jacobian magnitude 0.5:

**Without residuals:**  
Gradient reaching layer 1 = 1 × 0.5 × 0.5 × 0.5 = **0.125**  
After 10 layers: 1 × 0.5^10 ≈ **0.001** — essentially vanished.

**With residuals** (each Jacobian is now 1 + 0.5 = 1.5 at best, but more importantly the identity term always contributes 1):  
Even if ∂f/∂x ≈ 0 at every layer, gradient at layer 1 = **1.0** (via the skip path).  
In practice the Jacobian is (1 + small correction), so even 96 layers multiply out to a value near 1 rather than near zero.

This is the key: the "1" in (1 + ∂f/∂x) acts as a floor that prevents gradient collapse.

<div class="insight-box">
<strong>Near-zero initialisation is intentional:</strong> At the start of training, f(x) ≈ 0 (small random weights), so y ≈ x. The 96-layer GPT-3 starts as a near-identity function. This is not an accident — it means no single layer corrupts the signal from the start, and learning proceeds incrementally.
</div>

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
