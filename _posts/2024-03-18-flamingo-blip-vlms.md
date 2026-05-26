---
layout: single
title: "Flamingo, BLIP, and the Rise of Vision-Language Models"
categories: [transformers]
book: transformers
subsection: vision
tags: [Flamingo, BLIP, LLaVA, VLM, multimodal, vision-language]
published: false
excerpt: "From Flamingo's frozen LLM + cross-attention vision interface, to BLIP's bootstrapped captioning, to LLaVA's minimalist projector — three generations of vision-language model design, each with a distinct philosophy."
author_profile: true
read_time: true
is_overview: false
icon: "🦩"
read_mins: 6
permalink: /blog/transformers/flamingo-blip-vlms/
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
<strong>TL;DR:</strong> Flamingo (DeepMind, 2022) froze a powerful LLM and added cross-attention to visual features — few-shot VQA at scale. BLIP (Salesforce, 2022) bootstrapped better captions with a filter-generator loop. LLaVA (2023) showed that a linear projection from CLIP ViT into LLaMA is sufficient — matching Flamingo with 1% of the parameters. Modern VLMs follow LLaVA's recipe.
</div>

## The Vision-Language Model Problem

CLIP gives a shared embedding space for images and text. But it does not generate text — it classifies and retrieves. The next step: combine a vision encoder with a language model to produce a model that can *describe*, *reason about*, and *answer questions* about images.

Three landmark models — Flamingo, BLIP, and LLaVA — each solved this differently.

## Flamingo (DeepMind, 2022)

### Architecture

Flamingo freezes a large pre-trained language model (Chinchilla 70B) and a CLIP-like vision encoder, and bridges them with new trainable components:

1. **Perceiver Resampler:** pools the vision encoder's patch features (hundreds of tokens) into a fixed number of visual tokens (64). This decouples the visual sequence length from the LLM context.

2. **Gated Cross-Attention layers:** inserted between frozen LLM layers. The text tokens attend to the visual tokens via cross-attention. A learned tanh gate controls how much visual information flows in (initialised to 0 — at start, the LLM behaves as if no images are present).

```
Frozen LLM layer N
       ↓
Gated Cross-Attention (text → visual tokens)   ← NEW (trained)
       ↓
Frozen LLM layer N+1
```

### Key Properties

- **Frozen LLM:** language capabilities are preserved exactly. Visual information is injected without catastrophic forgetting.
- **Interleaved image-text input:** Flamingo can handle sequences like [image, text, image, text, ...] naturally — each image conditions the subsequent text.
- **Few-shot learning:** by prepending example (image, answer) pairs in context, Flamingo achieves strong few-shot VQA — a first for large vision-language models.

### Flamingo's result

At 80B parameters (Flamingo-80B), state-of-the-art on VQA, COCO captioning, and other benchmarks — without any task-specific fine-tuning in most settings.

## BLIP (Salesforce, 2022)

### The Noisy Caption Problem

Web-scraped image-text pairs (like CLIP's WIT) are noisy. BLIP addresses this with a **bootstrapping approach**:

1. **Train** a model on noisy web data
2. **Filter** web captions using the model (remove mismatched pairs)
3. **Generate** synthetic captions using the model's captioner
4. **Retrain** on filtered + synthetic data

This self-improvement loop yields cleaner training data, which yields a better model, which yields cleaner data — bootstrapped caption quality.

### BLIP Architecture: Unified Encoder-Decoder

BLIP uses a single model with three functionalities:

| Mode | What it does |
|------|-------------|
| Image-Text Encoder | Contrastive alignment (like CLIP) |
| Image-grounded Text Encoder | Cross-attention fusion for understanding |
| Image-grounded Text Decoder | Autoregressive caption generation |

The same weights are used for all three modes (shared backbone with different attention masks), making BLIP versatile without training multiple models.

### BLIP-2: Q-Former

BLIP-2 (2023) adds a lightweight **Q-Former** (Querying Transformer): a small Transformer with 32 learned query tokens that extract relevant visual information from a frozen ViT into a compact representation for a frozen LLM.

```
Frozen ViT → Q-Former (32 learned queries ↔ visual patches) → Linear → Frozen LLM
```

Only Q-Former is trained. Two-stage training: (1) vision-language alignment; (2) generative language pretraining with visual conditioning.

BLIP-2 ViT-G + FlanT5-XL achieves competitive VQA performance with far fewer trainable parameters than Flamingo.

## LLaVA (2023): The Minimal Recipe

### Architecture: Just a Linear Projection

LLaVA (Visual Instruction Tuning, Liu et al., 2023) stripped vision-language models to their minimal effective form:

```
CLIP ViT-L/14 → Linear projection W → LLaMA token space
```

The CLIP encoder extracts visual features (256 patch tokens). A **single linear layer** projects them into LLaMA's embedding space. These projected visual tokens are prepended to the text token sequence as if they were language tokens. No cross-attention, no Q-Former, no Perceiver.

<div class="insight-box">
<strong>Why does a linear projection suffice?</strong> CLIP features are already semantically rich — the linear layer just needs to change the coordinate system (from CLIP's d-dimensional space to LLaMA's d-dimensional space). The LLM then processes everything jointly via its own self-attention layers.
</div>

### Instruction Tuning Data

LLaVA generates visual instruction tuning data using GPT-4: given CLIP-described image captions and bounding box annotations, GPT-4 generates conversations, detailed descriptions, and complex reasoning tasks for the image. This synthetic data teaches the model to follow visual instructions.

Fine-tuned on LLaMA-13B with this data (plus some open VQA datasets), LLaVA achieves 85% of Flamingo's performance at 1% of the parameter count.

### LLaVA-Next and Successors

LLaVA-1.5 replaces the linear projection with a 2-layer MLP — a small improvement. LLaVA-Next adds dynamic high-resolution processing. The LLaVA family has spawned countless open-source VLMs (InternVL, Idefics, Qwen-VL, ...) all following the same pattern:

```
Frozen vision encoder → projection → LLM (partially or fully fine-tuned)
```

## Comparison

| Model | Vision encoder | Connection | LLM | Trainable params |
|-------|---------------|-----------|-----|-----------------|
| Flamingo 80B | NFNet | Gated cross-attn + Perceiver | Chinchilla 70B | ~10B |
| BLIP-2 | ViT-G | Q-Former | FlanT5-XL | ~188M |
| **LLaVA-13B** | CLIP ViT-L | **Linear** | LLaMA-13B | **~35M** |

LLaVA's key insight: the vision encoder (CLIP) and LLM are already powerful enough — the bridge can be minimal.

## The Modern VLM Recipe

Current state-of-the-art VLMs (GPT-4V, Gemini, Claude's vision, Qwen-VL) follow evolved versions of these designs:

1. **Vision encoder:** high-resolution CLIP or SigLIP ViT
2. **Projection:** MLP or cross-attention (Q-Former style)
3. **LLM:** large, instruction-tuned language model
4. **Training:** multi-stage (alignment then instruction tuning)

## Summary

| Model | Key Innovation |
|-------|---------------|
| Flamingo | Frozen LLM + gated cross-attention; few-shot visual reasoning |
| BLIP | Bootstrapped caption quality; unified encoder-decoder |
| BLIP-2 | Q-Former for parameter-efficient alignment |
| LLaVA | Linear projection suffices; visual instruction tuning |

The evolution shows a clear trend: **less architectural complexity, more training data quality**. The modern VLM is a CLIP encoder, a small projection, and an LLM — the intelligence comes from scale and data, not from elaborate fusion mechanisms.

## References

- Alayrac, J.-B., Donahue, J., Luc, P., Miech, A., Barr, I., Hasson, Y., Lenc, K., Mensch, A., Millican, K., Reynolds, M., Ring, R., Rutherford, E., Cabi, S., Han, T., Grangier, D., Anthropic, S. Z., McClelland, J., Turski, L., Caluwaerts, K., & Zisserman, A. (2022). [Flamingo: a Visual Language Model for Few-Shot Learning](https://arxiv.org/abs/2204.14198). *NeurIPS 2022* (Flamingo: cross-attention gating between a frozen vision encoder and a frozen LLM enables few-shot visual question answering).
- Li, J., Li, D., Xiong, C., & Hoi, S. (2022). [BLIP: Bootstrapping Language-Image Pre-training for Unified Vision-Language Understanding and Generation](https://arxiv.org/abs/2201.12086). *ICML 2022* (BLIP: unified VLM with a captioner-filter bootstrapping pipeline to clean noisy web image-text pairs).
- Liu, H., Li, C., Wu, Q., & Lee, Y. J. (2023). [Visual Instruction Tuning](https://arxiv.org/abs/2304.08485). *NeurIPS 2023* (LLaVA: visual instruction tuning with a simple linear projection from CLIP to an LLM; GPT-4-generated instruction data enables strong multimodal reasoning).
