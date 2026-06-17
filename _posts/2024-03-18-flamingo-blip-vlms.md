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

## Intuition First: Three Philosophies for Connecting Vision and Language

Think of the problem as bridging two experts: a **vision expert** (trained to understand images) and a **language expert** (trained to generate text). You want them to collaborate on visual question answering. Three different philosophies emerged:

**Flamingo's philosophy:** Keep both experts frozen — their skills are precious and easily destroyed. Build a translation layer (gated cross-attention) that lets the language expert consult the vision expert on demand.

**BLIP's philosophy:** The bottleneck is noisy training data. Fix the data first (bootstrapped captions), then train a unified model that can do both understanding and generation.

**LLaVA's philosophy:** The experts are already so powerful that the bridge can be minimal — a single linear layer is enough to map vision features into the language expert's coordinate system, and it learns the rest.

<div class="blog-figure">
<figure>
<style>
@keyframes arch-pulse { 0%,100%{opacity:0.8} 50%{opacity:1} }
</style>
<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="vlm-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#475569"/>
    </marker>
  </defs>

  <!-- Flamingo -->
  <text x="110" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Flamingo</text>
  <rect x="22"  y="28" width="68" height="36" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="56"  y="50" text-anchor="middle" font-size="10" font-weight="700" fill="#1e40af">Frozen ViT</text>
  <path d="M90 46 L106 46" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#vlm-arr)"/>
  <rect x="108" y="28" width="60" height="36" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" style="animation:arch-pulse 2s ease-in-out infinite"/>
  <text x="138" y="44" text-anchor="middle" font-size="9" font-weight="700" fill="#92400e">Perceiver</text>
  <text x="138" y="57" text-anchor="middle" font-size="9" fill="#92400e">Resampler</text>
  <path d="M168 46 L184 46" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#vlm-arr)"/>
  <rect x="186" y="28" width="60" height="36" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" style="animation:arch-pulse 2s 0.3s ease-in-out infinite"/>
  <text x="216" y="44" text-anchor="middle" font-size="9" font-weight="700" fill="#92400e">Gated</text>
  <text x="216" y="57" text-anchor="middle" font-size="9" fill="#92400e">Cross-Attn</text>
  <path d="M246 46 L262 46" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#vlm-arr)"/>
  <rect x="264" y="28" width="68" height="36" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="298" y="44" text-anchor="middle" font-size="9" font-weight="700" fill="#166534">Frozen LLM</text>
  <text x="298" y="57" text-anchor="middle" font-size="9" fill="#166534">(Chinchilla 70B)</text>
  <text x="22"  y="82" font-size="9" fill="#64748b">Frozen</text>
  <text x="108" y="82" font-size="9" fill="#f59e0b">Trained</text>
  <text x="186" y="82" font-size="9" fill="#f59e0b">Trained</text>
  <text x="264" y="82" font-size="9" fill="#64748b">Frozen</text>

  <!-- BLIP-2 -->
  <text x="500" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">BLIP-2 / LLaVA</text>
  <rect x="360" y="28" width="68" height="36" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="394" y="50" text-anchor="middle" font-size="10" font-weight="700" fill="#1e40af">Frozen ViT</text>
  <path d="M428 46 L444 46" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#vlm-arr)"/>
  <rect x="446" y="28" width="80" height="36" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" style="animation:arch-pulse 2s 0.6s ease-in-out infinite"/>
  <text x="486" y="44" text-anchor="middle" font-size="9" font-weight="700" fill="#92400e">Q-Former (BLIP-2)</text>
  <text x="486" y="57" text-anchor="middle" font-size="9" fill="#92400e">or Linear (LLaVA)</text>
  <path d="M526 46 L542 46" stroke="#475569" stroke-width="1.5" fill="none" marker-end="url(#vlm-arr)"/>
  <rect x="544" y="28" width="68" height="36" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="578" y="44" text-anchor="middle" font-size="9" font-weight="700" fill="#166534">Frozen LLM</text>
  <text x="578" y="57" text-anchor="middle" font-size="9" fill="#166534">(LLaMA / T5)</text>
  <text x="360" y="82" font-size="9" fill="#64748b">Frozen</text>
  <text x="446" y="82" font-size="9" fill="#f59e0b">Trained</text>
  <text x="544" y="82" font-size="9" fill="#64748b">Frozen (or LoRA)</text>

  <!-- Comparison bar -->
  <rect x="22" y="105" width="598" height="70" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="30" y="122" font-size="10" font-weight="700" fill="#334155">Trainable params:</text>
  <rect x="30"  y="130" width="160" height="16" rx="4" fill="#7c3aed" opacity="0.8"/>
  <text x="110" y="143" text-anchor="middle" font-size="9" fill="white">Flamingo ~10B</text>
  <rect x="30"  y="152" width="30" height="16" rx="4" fill="#f59e0b" opacity="0.8"/>
  <text x="100" y="165" font-size="9" fill="#78350f">BLIP-2 ~188M</text>
  <rect x="30"  y="152" width="4"  height="16" rx="2" fill="#16a34a" opacity="0.9"/>
  <text x="200" y="165" font-size="9" fill="#166534">LLaVA ~35M (just the projection)</text>
  <text x="370" y="143" font-size="9" fill="#64748b">Key insight: the richer the pre-trained components,</text>
  <text x="370" y="157" font-size="9" fill="#64748b">the simpler the bridge needs to be.</text>
</svg>
<figcaption>Three VLM architectures compared. Flamingo inserts trainable Perceiver Resampler + Gated Cross-Attention layers between frozen components (~10B trainable params). BLIP-2 uses a lightweight Q-Former (~188M). LLaVA uses a single linear projection (~35M) — the simplest possible bridge. All three freeze the vision encoder; they differ in how much of the LLM they touch.</figcaption>
</figure>
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
