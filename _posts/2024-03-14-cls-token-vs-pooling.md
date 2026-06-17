---
layout: single
title: "Class Token vs Pooling in Vision Transformers"
categories: [transformers]
book: transformers
subsection: vision
tags: [ViT, CLS-token, pooling, classification, representation]
published: false
excerpt: "The [CLS] token and global average pooling are two competing strategies for aggregating patch representations into a single image embedding. Understanding when each works — and why — reveals something fundamental about how ViTs learn."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 4
permalink: /blog/transformers/cls-token-vs-pooling/
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
<strong>TL;DR:</strong> The [CLS] token learns to aggregate global image information through attention. Global average pooling (GAP) simply averages all patch token outputs. Both work; [CLS] tends to better capture discriminative global features, while GAP spreads gradient signal across all patches and trains more stably. Modern self-supervised ViTs often use both.
</div>
{% include figure image_path="/images/blog/transformers/dosovitskiy2020_vit.png" alt="CLS token in ViT" caption="CLS token for global image representation in ViT (Dosovitskiy et al., 2020)" %}


## Intuition First: Two Ways to Summarise a Book

Imagine you have read 196 pages of a book (one page per patch) and must write a one-paragraph summary.

**[CLS] token approach:** You are an editor who, on every page, can ask "wait, what's the key point here for the summary?" — you selectively gather what matters. By the last page your mental summary is refined by selective attention across all chapters.

**Global average pooling:** You photocopy every page and stack them all on top of each other. Every page contributes equal ink. The result is a blurry average — good for capturing the general theme, worse at isolating the crucial scene on page 147.

The [CLS] token is the editor. GAP is the photocopier.

<div class="blog-figure">
<figure>
<style>
@keyframes cls-attend { 0%,100%{r:8} 50%{r:13} }
@keyframes gap-grey   { 0%,100%{opacity:0.5} 50%{opacity:0.9} }
</style>
<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <!-- CLS panel -->
  <text x="185" y="18" text-anchor="middle" font-size="13" font-weight="700" fill="#0d9488">[CLS] Token — selective attention readout</text>
  <rect x="20" y="28" width="330" height="150" rx="10" fill="#f0fdfa" stroke="#5eead4" stroke-width="2"/>

  <!-- Patch tokens (circles) with varying attention weight -->
  <circle cx="70"  cy="80"  r="12" fill="#e2e8f0"/>
  <circle cx="110" cy="80"  r="12" fill="#e2e8f0"/>
  <circle cx="150" cy="80"  r="22" fill="#0d9488" opacity="0.85" style="animation:cls-attend 2s 0.1s ease-in-out infinite"/>
  <circle cx="190" cy="80"  r="12" fill="#e2e8f0"/>
  <circle cx="230" cy="80"  r="18" fill="#0d9488" opacity="0.7" style="animation:cls-attend 2s 0.5s ease-in-out infinite"/>
  <circle cx="270" cy="80"  r="12" fill="#e2e8f0"/>
  <circle cx="310" cy="80"  r="14" fill="#14b8a6" opacity="0.6" style="animation:cls-attend 2s 0.9s ease-in-out infinite"/>

  <!-- CLS token -->
  <circle cx="185" cy="145" r="18" fill="#f59e0b" stroke="#d97706" stroke-width="2.5"/>
  <text x="185" y="150" text-anchor="middle" font-size="10" font-weight="700" fill="#78350f">CLS</text>

  <!-- Attention arrows to CLS -->
  <path d="M150 102 L178 128" stroke="#0d9488" stroke-width="2.5" fill="none" opacity="0.8"/>
  <path d="M230 98  L190 128" stroke="#0d9488" stroke-width="2"   fill="none" opacity="0.6"/>
  <path d="M310 94  L200 130" stroke="#14b8a6" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M70  92  L175 128" stroke="#94a3b8" stroke-width="1"   fill="none" opacity="0.3" stroke-dasharray="3 3"/>
  <path d="M110 92  L178 128" stroke="#94a3b8" stroke-width="1"   fill="none" opacity="0.3" stroke-dasharray="3 3"/>

  <text x="185" y="190" text-anchor="middle" font-size="10" fill="#475569">high-weight patches pull CLS toward object</text>

  <!-- GAP panel -->
  <text x="540" y="18" text-anchor="middle" font-size="13" font-weight="700" fill="#7c3aed">Global Average Pooling — uniform readout</text>
  <rect x="375" y="28" width="330" height="150" rx="10" fill="#f5f3ff" stroke="#c4b5fd" stroke-width="2"/>

  <circle cx="425" cy="80" r="12" fill="#7c3aed" opacity="0.5" style="animation:gap-grey 2.2s 0.0s ease-in-out infinite"/>
  <circle cx="465" cy="80" r="12" fill="#7c3aed" opacity="0.5" style="animation:gap-grey 2.2s 0.1s ease-in-out infinite"/>
  <circle cx="505" cy="80" r="12" fill="#7c3aed" opacity="0.5" style="animation:gap-grey 2.2s 0.2s ease-in-out infinite"/>
  <circle cx="545" cy="80" r="12" fill="#7c3aed" opacity="0.5" style="animation:gap-grey 2.2s 0.3s ease-in-out infinite"/>
  <circle cx="585" cy="80" r="12" fill="#7c3aed" opacity="0.5" style="animation:gap-grey 2.2s 0.4s ease-in-out infinite"/>
  <circle cx="625" cy="80" r="12" fill="#7c3aed" opacity="0.5" style="animation:gap-grey 2.2s 0.5s ease-in-out infinite"/>
  <circle cx="665" cy="80" r="12" fill="#7c3aed" opacity="0.5" style="animation:gap-grey 2.2s 0.6s ease-in-out infinite"/>

  <!-- Equal-weight arrows -->
  <path d="M425 92 L530 128" stroke="#7c3aed" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M465 92 L535 128" stroke="#7c3aed" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M505 92 L538 128" stroke="#7c3aed" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M545 92 L541 128" stroke="#7c3aed" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M585 92 L545 128" stroke="#7c3aed" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M625 92 L548 128" stroke="#7c3aed" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M665 92 L552 128" stroke="#7c3aed" stroke-width="1.5" fill="none" opacity="0.5"/>

  <!-- Mean pool result -->
  <rect x="510" y="128" width="60" height="30" rx="6" fill="#8b5cf6" stroke="#7c3aed" stroke-width="2"/>
  <text x="540" y="147" text-anchor="middle" font-size="10" font-weight="700" fill="white">mean</text>

  <text x="540" y="190" text-anchor="middle" font-size="10" fill="#475569">equal weight → background dilutes object signal</text>
</svg>
<figcaption>Left: the [CLS] token selectively attends to the most discriminative patches (larger circles = higher attention weight), concentrating the image summary on the object. Right: GAP assigns equal weight to every patch — background patches dilute the object signal but gradients flow to every position during training.</figcaption>
</figure>
</div>

## The Problem: From Patches to Image

After L Transformer blocks, you have a sequence of token representations:

```
[z_CLS, z₁, z₂, ..., z_N]   ∈ ℝ^{(N+1) × d_model}
```

For image classification (one label per image), you need a **single vector**. Two approaches:

## Strategy 1: The [CLS] Token

Borrowed from BERT, a learnable vector [CLS] is prepended to the patch sequence at position 0. It has no corresponding image region — it starts as a random trainable embedding.

After L blocks of multi-head attention, the [CLS] position has attended to every patch at every layer. By the final layer, z_CLS is expected to contain a global summary of the image.

The classification head is applied only to z_CLS:

<div class="math-box">
logits = W_head · z_CLS
</div>

**Why it works:** Attention is content-based. The [CLS] token learns to attend to the most discriminative patches — it preferentially gathers features that matter for classification. Through training, it specialises as a global image descriptor.

**Drawback:** Only one token receives the gradient from the classification loss directly. Training can be slower to propagate globally, especially in early layers.

## Strategy 2: Global Average Pooling (GAP)

Instead of a special token, simply average all N patch token outputs at the final layer:

<div class="math-box">
z_image = (1/N) Σᵢ zᵢ
</div>

The classification head is applied to z_image:

<div class="math-box">
logits = W_head · z_image
</div>

**Why it works:** Every patch contributes equally to the representation (initially). Gradient flows back to every patch token during training — the learning signal is spread across the full sequence from the start.

**Drawback:** No mechanism for selective attention at readout time. All patches contribute equally regardless of relevance — a background patch contributes as much as the object of interest.

## What Experiments Show

Dosovitskiy et al. (ViT, 2020) found that **both strategies perform comparably** when trained at the same scale. The original ViT uses [CLS] (following BERT convention).

DeiT finds similar results. MAE (masked autoencoder) uses GAP because masked reconstruction benefits from gradients flowing to all patches.

DINO and DINOv2 use [CLS] — and the [CLS] token embedding from DINOv2 is remarkably useful for dense tasks (segmentation, depth) despite being trained with classification objectives.

<div class="insight-box">
<strong>The [CLS] token as a query over the image:</strong> In later layers, the [CLS] token's query vector asks "which patches contain the most class-relevant information?" and its key becomes the aggregated answer. This is why [CLS] representations from large pre-trained ViTs are strong classifiers even with a linear head — they have learned to summarise images through selective attention.
</div>

## [CLS] Token as a Dense Feature Extractor

An important property: because [CLS] attends to all patches, its attention weights in the last layer form an **attention map** — a rough spatial map of which regions mattered for classification.

DINO exploits this: the attention maps from a self-supervised ViT produce surprisingly clean segmentation-like highlights of the foreground object, with no segmentation supervision whatsoever.

```
Input image: dog on grass
[CLS] last-layer attention: high weight on dog, low on grass
Attention map: roughly segments the dog
```

This property is unique to [CLS]-based ViTs (not GAP) and makes them powerful for localisation without detection supervision.

## When to Use Each

| Scenario | Recommendation |
|----------|---------------|
| Image classification | Either; [CLS] matches BERT convention |
| Self-supervised pretraining (MAE-style) | GAP (gradient to all patches) |
| Dense prediction (segmentation, depth) | Patch tokens directly (not CLS or GAP) |
| Image retrieval / linear probing | [CLS] (especially DINOv2) |
| Multimodal models (CLIP, LLaVA) | [CLS] (standard for vision encoders) |

## A Hybrid Approach

Some models use both: the [CLS] token representation and the mean-pooled patch tokens are concatenated or ensembled. BEiT-3 and some CLIP variants find marginal gains from this.

## Summary

| Property | [CLS] Token | Global Average Pooling |
|----------|-------------|----------------------|
| Architecture | Extra prepended token | No extra token |
| Readout | One token's output | Mean of all patch outputs |
| Gradient distribution | Concentrated at position 0 | Spread across all patches |
| Selective attention | Yes (implicit via attention) | No (uniform averaging) |
| Interpretable attention map | Yes | No |
| Performance | Comparable | Comparable |
| Used by | ViT, DeiT, DINO, CLIP | MAE, some CNN hybrids |

The [CLS] token is the dominant convention in Transformer-based vision models. Understanding it — and its alternative — clarifies how image representations are formed and why ViT attention maps can serve as segmentation signals without any spatial supervision.

## References

- Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Dehghani, M., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., & Houlsby, N. (2020). [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929). *ICLR 2021* (ViT: introduces the [CLS] token prepended to patch sequences; the final [CLS] embedding is used for image classification).
- He, K., Chen, X., Xie, S., Li, Y., Dollár, P., & Girshick, R. (2022). [Masked Autoencoders Are Scalable Vision Learners](https://arxiv.org/abs/2111.06377). *CVPR 2022* (MAE: uses global average pooling of patch tokens instead of [CLS] for its encoder — the canonical pooling approach).
- Caron, M., Touvron, H., Misra, I., Jégou, H., Mairal, J., Bojanowski, P., & Joulin, A. (2021). [Emerging Properties in Self-Supervised Vision Transformers](https://arxiv.org/abs/2104.14294). *ICCV 2021* (DINO: self-supervised ViT with [CLS] token; shows that [CLS] attention maps form interpretable segmentation maps without spatial supervision).
