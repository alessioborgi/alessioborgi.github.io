---
layout: single
title: "Class Token vs Pooling in Vision Transformers"
date: 2024-03-14
categories: [transformers]
book: transformers
subsection: vision
tags: [ViT, CLS-token, pooling, classification, representation]
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
