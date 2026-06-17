---
layout: single
title: "Layer Normalization in Transformers"
date: 2026-05-26
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
{% include figure image_path="/images/blog/transformers/vaswani2017_transformer_architecture.png" alt="Layer normalisation in Transformer" caption="Layer normalisation position in the Transformer block (Vaswani et al., 2017)" %}

<div class="insight-box">
<strong>Why people care about Pre-LN vs Post-LN:</strong> this is one of those seemingly small design choices that decides whether very deep Transformers train smoothly or become unstable.
</div>


## Intuition First: What Does "Normalise" Actually Do?

Imagine you are a neuron receiving thousands of inputs from the previous layer. If those inputs have wildly different scales — some near 0, some near 1000 — your weights need to be tiny for large inputs and large for small inputs simultaneously. That is a frustrating optimisation landscape.

Normalisation is simply: "before passing information to the next layer, rescale it so every token's feature vector looks roughly the same." You lose no information (learned γ and β can undo the normalisation) but you gain a predictable, well-conditioned signal at every layer.

<div class="blog-figure">
<figure>
<style>
@keyframes norm-bars { 0%{transform:scaleY(1)} 50%{transform:scaleY(0.25)} 100%{transform:scaleY(1)} }
@keyframes norm-bars2 { 0%{transform:scaleY(1)} 50%{transform:scaleY(0.25)} 100%{transform:scaleY(1)} }
@keyframes appear { 0%,49%{opacity:0} 50%,100%{opacity:1} }
</style>
<svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <text x="180" y="20" text-anchor="middle" font-size="14" font-weight="700" fill="#dc2626">Before LayerNorm — high variance</text>
  <text x="540" y="20" text-anchor="middle" font-size="14" font-weight="700" fill="#0d9488">After LayerNorm — unit variance</text>

  <!-- before bars (raw activations, varying heights) -->
  <rect x="40"  y="170" width="22" height="-90" rx="3" fill="#fca5a5" style="transform-origin:40px 170px;animation:norm-bars 3s ease-in-out infinite"/>
  <rect x="72"  y="170" width="22" height="-18" rx="3" fill="#fca5a5" style="transform-origin:72px 170px;animation:norm-bars 3s 0.1s ease-in-out infinite"/>
  <rect x="104" y="170" width="22" height="-140"rx="3" fill="#ef4444" style="transform-origin:104px 170px;animation:norm-bars 3s 0.2s ease-in-out infinite"/>
  <rect x="136" y="170" width="22" height="-55" rx="3" fill="#fca5a5" style="transform-origin:136px 170px;animation:norm-bars 3s 0.3s ease-in-out infinite"/>
  <rect x="168" y="170" width="22" height="-120"rx="3" fill="#ef4444" style="transform-origin:168px 170px;animation:norm-bars 3s 0.4s ease-in-out infinite"/>
  <rect x="200" y="170" width="22" height="-30" rx="3" fill="#fca5a5" style="transform-origin:200px 170px;animation:norm-bars 3s 0.5s ease-in-out infinite"/>
  <rect x="232" y="170" width="22" height="-75" rx="3" fill="#fca5a5" style="transform-origin:232px 170px;animation:norm-bars 3s 0.6s ease-in-out infinite"/>
  <rect x="264" y="170" width="22" height="-48" rx="3" fill="#fca5a5" style="transform-origin:264px 170px;animation:norm-bars 3s 0.7s ease-in-out infinite"/>
  <line x1="30" y1="170" x2="300" y2="170" stroke="#94a3b8" stroke-width="2"/>
  <text x="165" y="195" text-anchor="middle" font-size="11" fill="#64748b">features (d_model dimensions)</text>

  <text x="360" y="95" text-anchor="middle" font-size="24" fill="#0f172a">→</text>

  <!-- after bars (normalised, uniform heights) -->
  <rect x="400" y="170" width="22" height="-65" rx="3" fill="#5eead4" style="transform-origin:400px 170px;animation:norm-bars2 3s ease-in-out infinite"/>
  <rect x="432" y="170" width="22" height="-68" rx="3" fill="#5eead4" style="transform-origin:432px 170px;animation:norm-bars2 3s 0.1s ease-in-out infinite"/>
  <rect x="464" y="170" width="22" height="-70" rx="3" fill="#14b8a6" style="transform-origin:464px 170px;animation:norm-bars2 3s 0.2s ease-in-out infinite"/>
  <rect x="496" y="170" width="22" height="-64" rx="3" fill="#5eead4" style="transform-origin:496px 170px;animation:norm-bars2 3s 0.3s ease-in-out infinite"/>
  <rect x="528" y="170" width="22" height="-72" rx="3" fill="#14b8a6" style="transform-origin:528px 170px;animation:norm-bars2 3s 0.4s ease-in-out infinite"/>
  <rect x="560" y="170" width="22" height="-63" rx="3" fill="#5eead4" style="transform-origin:560px 170px;animation:norm-bars2 3s 0.5s ease-in-out infinite"/>
  <rect x="592" y="170" width="22" height="-67" rx="3" fill="#5eead4" style="transform-origin:592px 170px;animation:norm-bars2 3s 0.6s ease-in-out infinite"/>
  <rect x="624" y="170" width="22" height="-66" rx="3" fill="#5eead4" style="transform-origin:624px 170px;animation:norm-bars2 3s 0.7s ease-in-out infinite"/>
  <line x1="390" y1="170" x2="660" y2="170" stroke="#94a3b8" stroke-width="2"/>
  <text x="525" y="195" text-anchor="middle" font-size="11" fill="#64748b">features re-centered to mean 0, std 1</text>
</svg>
<figcaption>Animated: before LayerNorm (left) the d_model feature values of one token vary wildly in scale. After LayerNorm (right) all features are rescaled to near-unit variance — the network downstream sees a predictable signal regardless of which token or layer it is in.</figcaption>
</figure>
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

## Worked Example: LayerNorm on a 4-Dimensional Token

Suppose a token's representation is **x = [2, 4, −2, 0]** (d = 4, simplified).

**Step 1 — Compute mean:**  
μ = (2 + 4 + (−2) + 0) / 4 = **1.0**

**Step 2 — Compute variance:**  
σ² = [(2−1)² + (4−1)² + (−2−1)² + (0−1)²] / 4  
= [1 + 9 + 9 + 1] / 4 = **5.0**

**Step 3 — Normalise:**  
x̂ = (x − μ) / √(σ² + ε) ≈ [1/√5, 3/√5, −3/√5, −1/√5] ≈ **[0.45, 1.34, −1.34, −0.45]**

**Step 4 — Apply γ and β** (assume γ = [1,1,1,1], β = [0,0,0,0] at initialisation):  
Output = γ · x̂ + β = **[0.45, 1.34, −1.34, −0.45]**

After training, γ and β may have become [2, 1, 1, 0.5] and [0.1, −0.2, 0.1, 0] — allowing the network to recover any useful scale it needs while keeping the normalisation benefit.

<div class="insight-box">
<strong>Why ε matters:</strong> if σ² = 0 (all features identical), the denominator would be zero. ε = 1e-5 prevents this. In practice it almost never matters numerically but is essential for correctness.
</div>

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

## References

- Ba, J. L., Kiros, J. R., & Hinton, G. E. (2016). [Layer Normalization](https://arxiv.org/abs/1607.06450). *arXiv 2016* (LayerNorm: normalises across the feature dimension rather than the batch dimension, enabling stable training of sequence models).
- Xiong, R., Yang, Y., He, D., Zheng, K., Zheng, S., Xing, C., Zhang, H., Lan, Y., Wang, L., & Liu, T.-Y. (2020). [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745). *ICML 2020* (Pre-LN vs Post-LN: theoretical and empirical comparison showing Pre-LN (before attention) improves gradient flow and training stability).
- Zhang, B., & Sennrich, R. (2019). [Root Mean Square Layer Normalization](https://arxiv.org/abs/1910.07467). *NeurIPS 2019* (RMSNorm: removes the mean-centering step from LayerNorm — used in LLaMA, Mistral, and most modern open-weight LLMs).
