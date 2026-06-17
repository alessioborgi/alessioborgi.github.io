---
layout: single
title: "Patch Embeddings: How Images Become Tokens"
categories: [transformers]
book: transformers
subsection: vision
tags: [ViT, patch-embeddings, vision-transformer, tokenization]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A 224×224 RGB image is split into 16×16 patches (196 patches total). Each patch is flattened to a 768-dimensional vector and passed through a linear projection. These 196 vectors become the token sequence fed to the Transformer — identical in format to word embeddings.
</div>
{% include figure image_path="/images/blog/transformers/dosovitskiy2020_vit.png" alt="Patch embedding in ViT" caption="Image patch embeddings as input tokens (Dosovitskiy et al., 2020)" %}


## Visual: From Image Grid to Token Sequence

<div class="blog-figure">
<figure>
<style>
@keyframes patch-reveal {
  0%   { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes token-flow {
  0%   { stroke-dashoffset: 200; opacity: 0.3; }
  100% { stroke-dashoffset: 0;   opacity: 1; }
}
</style>
<svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <text x="85"  y="18" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">224×224 Image</text>
  <text x="310" y="18" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">14×14 patch grid</text>
  <text x="560" y="18" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">196 token vectors</text>

  <!-- Image -->
  <rect x="20" y="28" width="130" height="130" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/>
  <text x="85" y="98" text-anchor="middle" font-size="28">🖼️</text>
  <text x="85" y="122" text-anchor="middle" font-size="10" fill="#64748b">H×W×3 pixels</text>

  <!-- Arrow 1 -->
  <path d="M155 93 L195 93" stroke="#475569" stroke-width="2.5" fill="none" marker-end="url(#pe-arr)"/>
  <text x="175" y="84" text-anchor="middle" font-size="9" fill="#64748b">÷16</text>
  <defs>
    <marker id="pe-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#475569"/>
    </marker>
    <marker id="pe-arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#7c3aed"/>
    </marker>
  </defs>

  <!-- 14×14 patch grid (show 4×4 as representative) -->
  <g>
  <!-- row 1 -->
  <rect x="200" y="28" width="25" height="25" rx="2" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1" style="animation:patch-reveal 0.3s 0.05s ease-out both"/>
  <rect x="228" y="28" width="25" height="25" rx="2" fill="#a5f3fc" stroke="#67e8f9" stroke-width="1" style="animation:patch-reveal 0.3s 0.10s ease-out both"/>
  <rect x="256" y="28" width="25" height="25" rx="2" fill="#bbf7d0" stroke="#6ee7b7" stroke-width="1" style="animation:patch-reveal 0.3s 0.15s ease-out both"/>
  <rect x="284" y="28" width="25" height="25" rx="2" fill="#fde68a" stroke="#fcd34d" stroke-width="1" style="animation:patch-reveal 0.3s 0.20s ease-out both"/>
  <!-- row 2 -->
  <rect x="200" y="56" width="25" height="25" rx="2" fill="#c7d2fe" stroke="#a5b4fc" stroke-width="1" style="animation:patch-reveal 0.3s 0.25s ease-out both"/>
  <rect x="228" y="56" width="25" height="25" rx="2" fill="#fbcfe8" stroke="#f9a8d4" stroke-width="1" style="animation:patch-reveal 0.3s 0.30s ease-out both"/>
  <rect x="256" y="56" width="25" height="25" rx="2" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1" style="animation:patch-reveal 0.3s 0.35s ease-out both"/>
  <rect x="284" y="56" width="25" height="25" rx="2" fill="#d1fae5" stroke="#6ee7b7" stroke-width="1" style="animation:patch-reveal 0.3s 0.40s ease-out both"/>
  <!-- row 3 -->
  <rect x="200" y="84" width="25" height="25" rx="2" fill="#fde68a" stroke="#fcd34d" stroke-width="1" style="animation:patch-reveal 0.3s 0.45s ease-out both"/>
  <rect x="228" y="84" width="25" height="25" rx="2" fill="#bbf7d0" stroke="#6ee7b7" stroke-width="1" style="animation:patch-reveal 0.3s 0.50s ease-out both"/>
  <rect x="256" y="84" width="25" height="25" rx="2" fill="#c7d2fe" stroke="#a5b4fc" stroke-width="1" style="animation:patch-reveal 0.3s 0.55s ease-out both"/>
  <rect x="284" y="84" width="25" height="25" rx="2" fill="#fbcfe8" stroke="#f9a8d4" stroke-width="1" style="animation:patch-reveal 0.3s 0.60s ease-out both"/>
  <!-- row 4 -->
  <rect x="200" y="112" width="25" height="25" rx="2" fill="#a5f3fc" stroke="#67e8f9" stroke-width="1" style="animation:patch-reveal 0.3s 0.65s ease-out both"/>
  <rect x="228" y="112" width="25" height="25" rx="2" fill="#bfdbfe" stroke="#93c5fd" stroke-width="1" style="animation:patch-reveal 0.3s 0.70s ease-out both"/>
  <rect x="256" y="112" width="25" height="25" rx="2" fill="#fde68a" stroke="#fcd34d" stroke-width="1" style="animation:patch-reveal 0.3s 0.75s ease-out both"/>
  <rect x="284" y="112" width="25" height="25" rx="2" fill="#bbf7d0" stroke="#6ee7b7" stroke-width="1" style="animation:patch-reveal 0.3s 0.80s ease-out both"/>
  <text x="255" y="155" text-anchor="middle" font-size="9" fill="#64748b">14×14 = 196 patches</text>
  <text x="255" y="168" text-anchor="middle" font-size="9" fill="#64748b">(showing 4×4 for clarity)</text>
  </g>

  <!-- Arrow 2: flatten + project -->
  <path d="M316 93 L388 93" stroke="#7c3aed" stroke-width="2.5" fill="none" marker-end="url(#pe-arr2)"
        stroke-dasharray="120" style="animation:token-flow 1s 0.9s ease-out forwards"/>
  <text x="352" y="82" text-anchor="middle" font-size="9" fill="#7c3aed">flatten + W_E</text>
  <text x="352" y="108" text-anchor="middle" font-size="9" fill="#64748b">768-dim projection</text>

  <!-- Token sequence (show as vertical bars) -->
  <g>
  <rect x="396" y="38" width="14" height="110" rx="3" fill="#7c3aed" opacity="0.9" style="animation:patch-reveal 0.2s 1.0s ease-out both"/>
  <rect x="414" y="38" width="14" height="110" rx="3" fill="#6366f1" opacity="0.85" style="animation:patch-reveal 0.2s 1.05s ease-out both"/>
  <rect x="432" y="38" width="14" height="110" rx="3" fill="#8b5cf6" opacity="0.8" style="animation:patch-reveal 0.2s 1.10s ease-out both"/>
  <rect x="450" y="38" width="14" height="110" rx="3" fill="#7c3aed" opacity="0.75" style="animation:patch-reveal 0.2s 1.15s ease-out both"/>
  <rect x="468" y="38" width="14" height="110" rx="3" fill="#6366f1" opacity="0.9" style="animation:patch-reveal 0.2s 1.20s ease-out both"/>
  <rect x="486" y="38" width="14" height="110" rx="3" fill="#8b5cf6" opacity="0.85" style="animation:patch-reveal 0.2s 1.25s ease-out both"/>
  <text x="450" y="165" text-anchor="middle" font-size="9" fill="#64748b">each column = one</text>
  <text x="450" y="177" text-anchor="middle" font-size="9" fill="#64748b">768-dim token vector</text>
  <text x="515" y="93" text-anchor="middle" font-size="16" fill="#94a3b8">···</text>
  </g>

  <!-- CLS token -->
  <rect x="548" y="38" width="20" height="110" rx="3" fill="#f59e0b" stroke="#d97706" stroke-width="2" style="animation:patch-reveal 0.2s 1.4s ease-out both"/>
  <text x="558" y="177" text-anchor="middle" font-size="9" fill="#d97706" font-weight="700">[CLS]</text>

  <!-- + pos emb -->
  <text x="600" y="93" text-anchor="middle" font-size="14" fill="#ea580c">+ pos</text>
  <text x="600" y="110" text-anchor="middle" font-size="10" fill="#64748b">embedding</text>

  <!-- Final sequence box -->
  <rect x="640" y="38" width="68" height="110" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="674" y="86" text-anchor="middle" font-size="10" font-weight="700" fill="#92400e">197 tokens</text>
  <text x="674" y="102" text-anchor="middle" font-size="9" fill="#92400e">([CLS] + 196)</text>
  <text x="674" y="118" text-anchor="middle" font-size="9" fill="#92400e">→ Transformer</text>

  <text x="360" y="208" text-anchor="middle" font-size="11" fill="#475569">Each 16×16×3 = 768-pixel patch becomes one 768-dim vector — identical format to word embeddings</text>
</svg>
<figcaption>Animated patch embedding pipeline: a 224×224 image is divided into 196 non-overlapping 16×16 patches (coloured grid), each flattened and projected to 768 dimensions. A learnable [CLS] token (amber) is prepended and positional embeddings are added, giving 197 tokens ready for any standard Transformer.</figcaption>
</figure>
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

## Worked Example: Patch Count and Sequence Length

**ViT-Base on a 224×224 RGB image with P=16:**

- Number of patches: (224/16)² = 14² = **196**
- Pixels per patch: 16 × 16 × 3 = **768**
- After linear projection: 768 → **768** (d_model for ViT-Base)
- After prepending [CLS]: sequence length = **197**
- Attention cost: 197² ≈ **38,809 operations** (vs. 224² × 224² ≈ 2.5 billion for pixel-level attention)

**With P=8 (finer resolution):**
- Patches: (224/8)² = 28² = **784**
- Sequence length = **785**
- Attention cost: 785² ≈ **616,225** — still 4,000× cheaper than pixel-level, but 16× more costly than P=16

This trade-off is why P=16 became the standard for classification and P=8 is reserved for tasks needing fine-grained detail (dense prediction, medical imaging).

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

## References

- Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Dehghani, M., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., & Houlsby, N. (2020). [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929). *ICLR 2021* (ViT: introduces patch embeddings — flattening 16×16 image patches into a token sequence fed to a standard Transformer).
- He, K., Chen, X., Xie, S., Li, Y., Dollár, P., & Girshick, R. (2022). [Masked Autoencoders Are Scalable Vision Learners](https://arxiv.org/abs/2111.06377). *CVPR 2022* (MAE: applies masked autoencoding to ViT patch tokens for self-supervised pre-training).
- Touvron, H., Cord, M., Douze, M., Massa, F., Sablayrolles, A., & Jégou, H. (2021). [Training Data-Efficient Image Transformers & Distillation through Attention](https://arxiv.org/abs/2012.12877). *ICML 2021* (DeiT: shows patch-based ViT can be trained effectively on ImageNet alone without JFT-300M).
