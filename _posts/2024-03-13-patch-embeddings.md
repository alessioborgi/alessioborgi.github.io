---
layout: single
title: "Patch Embeddings: How Images Become Tokens"
date: 2024-03-13
categories: [transformers]
book: transformers
subsection: vision
tags: [ViT, patch-embeddings, vision-transformer, tokenization]
excerpt: "ViT's key insight: split an image into fixed-size patches, flatten each patch into a vector, and project it linearly. The image is now a sequence of tokens — and any Transformer can handle it."
author_profile: true
read_time: true
is_overview: false
icon: "🖼️"
read_mins: 4
permalink: /blog/transformers/patch-embeddings/
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
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A 224×224 RGB image is split into 16×16 patches (196 patches total). Each patch is flattened to a 768-dimensional vector and passed through a linear projection. These 196 vectors become the token sequence fed to the Transformer — identical in format to word embeddings.
</div>

## The Core Problem: Transformers Expect Sequences

The Transformer architecture processes sequences of vectors. Text is naturally sequential — words come one after another. Images are 2D grids. How do you turn a grid into a sequence?

The naive answer: flatten the entire image pixel by pixel. A 224×224×3 image would become a sequence of 150,528 tokens — far too long for attention (quadratic cost).

ViT's answer: **patches**.

## The Patch Embedding Process

Given an image of size H × W × C (height, width, channels):

**Step 1 — Divide into patches.**  
Split the image into a grid of non-overlapping P×P patches. For ViT-Base: P=16, giving (224/16)² = **196 patches**.

**Step 2 — Flatten each patch.**  
Each patch has shape P × P × C = 16 × 16 × 3 = **768 raw values**.

**Step 3 — Project linearly.**  
Apply a learnable linear projection: 768 → d_model (also 768 for ViT-Base). This is equivalent to a convolution with kernel size P, stride P, and d_model output channels — often implemented exactly that way.

<div class="math-box">
x_patch_i = Flatten(patch_i) · W_E + b   ∈ ℝ^{d_model}
</div>

**Step 4 — Add positional encoding.**  
Since the patches lose spatial order when flattened, add a learned 1D positional embedding to each patch token (ViT uses 1D, not 2D, and finds it works fine).

**Step 5 — Prepend [CLS] token.**  
Add a learned classification token at position 0. Its final representation is used for image-level classification.

The sequence fed to the Transformer: **[CLS, patch₁, patch₂, ..., patch₁₉₆]** — 197 vectors of dimension 768.

## Why Patches, Not Pixels?

| | Pixel-level | Patch-level |
|--|------------|------------|
| Sequence length (224²) | 50,176 | 196 |
| Attention cost (quadratic) | ~2.5 billion | ~38,000 |
| Local structure preserved | Fully | Within patches |
| Practical with attention | No | Yes |

Patches retain local structure within each 16×16 region. Attention across patches captures global structure (how different image regions relate). This mirrors how convolution captures local patterns while global pooling captures global structure — but with full attention instead.

## The Linear Projection as a Convolutional Layer

The patch embedding is often implemented as a single Conv2d with:
- **Kernel size:** P × P (e.g., 16×16)
- **Stride:** P (non-overlapping)
- **Output channels:** d_model

```python
self.proj = nn.Conv2d(in_channels=3, out_channels=d_model,
                      kernel_size=patch_size, stride=patch_size)
# Input:  [B, 3, 224, 224]
# Output: [B, d_model, 14, 14]
# Reshape: [B, 196, d_model]
```

This is mathematically identical to the flatten-then-project formulation. Conv2d is used in practice for implementation efficiency.

<div class="insight-box">
<strong>What does the projection learn?</strong> The linear projection W_E learns to extract features from each patch — essentially learning a local feature detector. Unlike CNNs which stack many convolutional layers, ViT uses a single linear projection and relies on Transformer attention to combine patches globally. Despite this simplicity, it works remarkably well at scale.
</div>

## Patch Size vs Sequence Length Trade-off

| Patch size | # patches (224²) | Sequence length | Resolution sensitivity |
|-----------|-----------------|----------------|----------------------|
| 32×32 | 49 | 50 | Low |
| 16×16 | 196 | 197 | Medium |
| 14×14 | 256 | 257 | Medium-high |
| 8×8 | 784 | 785 | High |

Smaller patches = longer sequences = better fine-grained resolution = more compute. ViT-Base and ViT-Large use 16×16. DINOv2 and ViT-H often use 14×14 for finer detail.

## Position Encoding in ViT

ViT uses **learned 1D positional embeddings** (not the sinusoidal encodings of the original Transformer). Each position 0…196 gets a learned vector of dimension d_model.

Interestingly, when ViT-Base is fine-tuned on higher-resolution images (more patches), interpolating the positional embeddings to the new length works surprisingly well — the model transfers its spatial understanding.

## The [CLS] Token

Borrowed from BERT, the [CLS] token is a learnable vector prepended to the patch sequence. It has no corresponding image region — it serves as a global "accumulator" that attends to all patches and whose final representation is used for classification.

An alternative is **global average pooling** (GAP) over all patch tokens. Both approaches work; see the next post on Class Token vs Pooling.

## Summary

Patch embeddings are the minimal, elegant bridge between 2D images and 1D Transformer sequences:

1. **Divide** the image into P×P patches
2. **Flatten** each patch to a vector
3. **Project** linearly to d_model
4. **Add** positional embeddings
5. **Feed** to any standard Transformer

The simplicity is the point. Once the image is a token sequence, every Transformer technique — multi-head attention, pre-training objectives, fine-tuning, scaling laws — applies directly.
