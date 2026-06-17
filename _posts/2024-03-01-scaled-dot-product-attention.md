---
layout: single
title: "Scaled Dot-Product Attention: Why the √d Matters"
date: 2026-05-26
categories: [transformers]
book: transformers
subsection: core
tags: [attention, scaling, softmax, gradients]
excerpt: "Dividing by √d_k is not just a trick — it prevents softmax from saturating and dying in high-dimensional spaces. Here's the math and the intuition."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 4
permalink: /blog/transformers/scaled-dot-product-attention/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.blog-figure--compact { max-width: 420px; margin-left: auto; margin-right: auto; }
.tldr-box {
  background: linear-gradient(145deg,#e8fbfb,#dbeafe);
  border-left: 4px solid #0d9488;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1.25rem 0;
}
.tldr-box strong { color: #0d9488; }
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
.insight-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1.25rem 0;
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Without the √d_k scaling factor, dot products grow large in high dimensions → softmax outputs near 0 or 1 everywhere → gradients vanish and training stalls. Dividing by √d_k keeps dot products well-conditioned regardless of model size.
</div>
<div class="blog-figure--compact">
{% include figure image_path="/images/blog/transformers/vaswani2017_scaled_dot_product.png" alt="Scaled Dot-Product Attention" caption="Scaled Dot-Product Attention (Vaswani et al., 2017)" %}
</div>


## The Formula

Scaled dot-product attention is the engine inside every Transformer. Given queries **Q**, keys **K**, and values **V**:

<div class="math-box">
\[
\mathrm{Attention}(Q, K, V)
=
\mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
\]
</div>

The term **d_k** is the dimension of the key vectors. The division by **√d_k** is the "scaling" in the name. It looks minor. It is not.

## Why Dot Products Grow in High Dimensions

Imagine two vectors **q** and **k**, each of dimension d_k, with components independently drawn from a standard normal distribution (mean 0, variance 1).

Their dot product **q · k** = Σᵢ qᵢkᵢ has:
- **Mean = 0** (products of zero-mean variables)
- **Variance = d_k** (sum of d_k independent unit-variance terms)

So the **standard deviation** of the dot product grows as **√d_k**.

When d_k = 64 (a typical value), individual dot products have std ≈ 8. When d_k = 512, std ≈ 22. As dimensions scale up, raw dot products naturally take on large absolute values.

## What Happens to Softmax with Large Inputs

Softmax is defined as:

<div class="math-box">
\[
\mathrm{softmax}(x_i)
=
\frac{e^{x_i}}{\sum_j e^{x_j}}
\]
</div>

When inputs are large — say the vector **[35, 2, -10, 1]** — the exponential function amplifies differences exponentially. The largest value dominates completely. The output becomes something like **[≈1.0, ≈0.0, ≈0.0, ≈0.0]**.

This is called **softmax saturation**. The "soft" maximum collapses into a hard argmax.

### The Gradient Problem

Softmax saturation is catastrophic for learning because it causes **gradient death**. The gradient of softmax with respect to its input is:

<div class="math-box">
\[
\frac{\partial \,\mathrm{softmax}(x_i)}{\partial x_i}
=
\mathrm{softmax}(x_i)\bigl(1-\mathrm{softmax}(x_i)\bigr)
\]
</div>

When \(\mathrm{softmax}(x_i) \approx 1\), the factor \((1-\mathrm{softmax}(x_i))\) is near zero.  
When \(\mathrm{softmax}(x_i) \approx 0\), the leading \(\mathrm{softmax}(x_i)\) term is near zero.

In both cases: no gradient flows. No learning happens. The attention weights are stuck.

## The Fix: Divide by √d_k

Dividing each dot product by √d_k scales the variance back to 1:

<div class="math-box">
\[
\mathrm{Var}\!\left(\frac{q \cdot k}{\sqrt{d_k}}\right)
=
\frac{\mathrm{Var}(q \cdot k)}{d_k}
=
\frac{d_k}{d_k}
=
1
\]
</div>

Now the inputs to softmax live in a reasonable range regardless of d_k. Softmax operates in its smooth, differentiable regime. Gradients flow. Learning works.

<div class="insight-box">
<strong>Key insight:</strong> The √d_k term is not a hyperparameter to tune. It is a mathematical consequence of how dot product variance scales with dimension. It keeps the model trainable as d_k grows.
</div>

## Why This Is So Easy to Miss

If you only read the attention formula once, the scaling term looks cosmetic. In reality it is a stability device: attention is not just about matching tokens, it is also about keeping those matches in a numerical regime where softmax can still learn.

## Concrete Numerical Example

Suppose d_k = 64 and two vectors q = k = [1/8, 1/8, …, 1/8] (all 64 entries equal 1/8).

**Unscaled dot product:**
```
q · k = 64 × (1/8 × 1/8) = 64 × 1/64 = 1.0
```

Now try q with entries drawn from N(0,1): typical magnitude ≈ √64 = 8.

A score of 8 vs. −8 in a 4-token sequence:
```
softmax([8, -8, 2, -1]) ≈ [0.9997, 0.000, 0.003, 0.0001]
```
Nearly all weight on one token — a hard argmax. Gradient ≈ 0.

**After scaling by √64 = 8:**
```
softmax([1.0, -1.0, 0.25, -0.125]) ≈ [0.47, 0.06, 0.30, 0.17]
```
Smooth distribution. Gradient flows to all four tokens.

## Visualising the Effect

| d_k | Raw std(q·k) | Scaled std | Softmax regime |
|-----|-------------|-----------|----------------|
| 4   | 2           | 1         | Smooth         |
| 64  | 8           | 1         | Smooth         |
| 512 | 22.6        | 1         | Smooth         |
| 512 (unscaled) | 22.6 | 22.6 | **Saturated** |

Without scaling, increasing model width makes attention increasingly broken.

## What About Other Scaling Choices?

Why √d_k specifically, and not d_k or some learned parameter?

- **÷ d_k**: over-shrinks; dot products become too small, softmax becomes too uniform (near-equal weights, no sharp attention)
- **÷ √d_k**: correct normalization that restores unit variance
- **Learned scale**: works in practice (some models do this), but adds parameters and can be poorly initialised

The √d_k formula hits the theoretical optimum for variance normalisation with minimal complexity.

## Summary

| Without scaling | With scaling |
|----------------|-------------|
| Dot products grow as √d_k | Dot products stay ~O(1) |
| Softmax saturates | Softmax is smooth |
| Gradients vanish | Gradients flow cleanly |
| Larger models train worse | Larger models train fine |

The √d_k is a single division that makes Transformers scalable. It is easy to overlook, but foundational to why the architecture works at all.

## References

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017* (the original Transformer paper introducing scaled dot-product attention and multi-head attention).
- Bahdanau, D., Cho, K., & Bengio, Y. (2015). [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473). *ICLR 2015* (the additive attention mechanism that preceded scaled dot-product attention and motivated the QKV formulation).
