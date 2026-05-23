---
layout: single
title: "Layer Normalization in Transformers"
date: 2024-03-06
categories: [transformers]
book: transformers
subsection: core
tags: [layer-norm, batch-norm, Pre-LN, Post-LN, training stability]
excerpt: "Layer norm is not optional plumbing. It determines training stability, gradient flow, and whether deep Transformers converge at all. Pre-LN vs Post-LN is not a detail — it changes training dynamics fundamentally."
author_profile: true
read_time: true
is_overview: false
icon: "📊"
read_mins: 4
permalink: /blog/transformers/layer-normalization/
toc: true
toc_label: "Contents"
---

<style>
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
  font-size: 0.95rem;
}
.arch-block {
  background: #1e293b;
  color: #94a3b8;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1.25rem 0;
  font-family: monospace;
  font-size: 0.88rem;
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Layer norm rescales each token's feature vector to have zero mean and unit variance, then applies learned scale (γ) and shift (β). Post-LN (original Transformer) is less stable; Pre-LN (used by GPT-2, LLaMA) allows training without warmup and scales more reliably.
</div>

## Why Normalisation at All?

Deep networks suffer from **internal covariate shift**: as weights update during training, the distribution of activations at each layer changes unpredictably. Later layers must constantly adapt to a moving target.

Normalisation layers stabilise these distributions. For Transformers, layer normalisation is the standard solution.

## Layer Norm vs Batch Norm

**Batch Normalisation** normalises across the batch dimension: for each feature, compute mean and variance across all examples in the batch.

- Problematic for variable-length sequences (different batch elements have different lengths)
- Requires large batch sizes to estimate statistics reliably
- Behaviour differs between training and inference (running mean/var at test time)

**Layer Normalisation** normalises across the feature dimension: for each token, compute mean and variance across all d_model features.

- Independent of batch size and sequence length
- Identical behaviour at training and inference time
- Natural fit for sequence models

## The Layer Norm Formula

Given a token representation **x** ∈ ℝ^d:

<div class="math-box">
μ = (1/d) Σᵢ xᵢ &nbsp;&nbsp;&nbsp; σ² = (1/d) Σᵢ (xᵢ − μ)²
<br><br>
LayerNorm(x) = γ · (x − μ) / √(σ² + ε) + β
</div>

- **μ, σ²** are computed per-token (across features)
- **γ** (scale) and **β** (shift) are learned parameters, initialised to 1 and 0 respectively
- **ε** (typically 1e-5) prevents division by zero

After normalisation, the output has approximately zero mean and unit variance. γ and β then allow the network to re-scale and re-shift to whatever distribution is optimal — without collapsing the normalisation.

## Post-LN: The Original Placement

The 2017 Transformer paper placed layer norm **after** the residual addition:

<div class="arch-block">
x → [Attention] → x + attn(x) → LayerNorm → next layer
</div>

In full notation for one sub-layer:

```
y = LayerNorm(x + Sublayer(x))
```

This is called **Post-LN** (normalisation after the residual). It was the standard until roughly 2019.

**Problem:** In Post-LN, gradients must flow through the LayerNorm on the path back through the residual stream. At initialisation, this can produce very large or unstable gradients in early layers of deep networks. Post-LN models require careful learning rate warmup and are sensitive to hyperparameters.

## Pre-LN: The Modern Standard

Pre-LN places layer norm **before** each sub-layer, inside the residual branch:

<div class="arch-block">
x → LayerNorm → [Attention] → x + attn(LayerNorm(x)) → next layer
</div>

In full notation:

```
y = x + Sublayer(LayerNorm(x))
```

The residual path remains a clean identity: **y = x + f(x)**. Gradients can bypass the sub-layer entirely by flowing through the residual skip connection. This dramatically stabilises training.

<div class="insight-box">
<strong>Practical consequence:</strong> Pre-LN models can be trained without learning rate warmup, at higher learning rates, and to greater depth. GPT-2, GPT-3, LLaMA, PaLM, and most modern LLMs use Pre-LN. Post-LN is still used in BERT and some encoder models with careful tuning.
</div>

## RMSNorm: A Simpler Variant

Many recent models (LLaMA, Mistral, Gemma) use **RMSNorm** instead of full layer norm:

<div class="math-box">
RMSNorm(x) = γ · x / RMS(x) &nbsp;&nbsp;&nbsp; where RMS(x) = √( (1/d) Σᵢ xᵢ² )
</div>

RMSNorm removes the mean-centering step (no μ subtraction). This is:
- **Faster:** ~15-20% less computation
- **Equally effective** empirically
- **Motivated** by the observation that re-centring contributes little to training stability

The scale γ is still learned; the shift β is dropped.

## Where LayerNorm Appears in a Transformer Block

In a Pre-LN Transformer, each block looks like:

```
x → LN → MultiHeadAttention → + x → LN → FFN → + x
          ↑___________________↑       ↑__________↑
               residual                 residual
```

There are two layer norms per block: one before attention, one before the FFN. For a 96-layer model (GPT-3 scale), that is 192 LayerNorm operations per forward pass.

## Comparison

| Property | Post-LN | Pre-LN | RMSNorm |
|----------|---------|--------|---------|
| Gradient flow | Through LN | Via identity skip | Via identity skip |
| Training stability | Lower | Higher | Higher |
| Warmup required | Usually yes | Often no | Often no |
| Used by | BERT, original T5 | GPT-2/3, LLaMA | LLaMA 2/3, Mistral |
| Mean-centering | Yes | Yes | No |
| Compute | Standard | Standard | ~15% faster |

## Summary

Layer norm is not cosmetic. It controls how information flows and how gradients propagate through the network. The choice between Pre-LN and Post-LN explains many practical differences between model families — and Pre-LN's superior stability is why it dominates modern large language model training.
