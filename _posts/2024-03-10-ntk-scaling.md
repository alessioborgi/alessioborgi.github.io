---
layout: single
title: "NTK-Aware Scaling: Extending Context Without Fine-Tuning"
date: 2026-05-26
categories: [transformers]
book: transformers
subsection: positional-encodings
tags: [RoPE, NTK, context-length, positional-encoding, interpolation]
excerpt: "NTK-Aware Scaling extends the context window of RoPE-based models by rescaling frequencies using Neural Tangent Kernel theory — with no fine-tuning required."
author_profile: true
read_time: true
is_overview: false
icon: "📡"
read_mins: 5
permalink: /blog/transformers/ntk-scaling/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.paper-preview img { width: min(100%, 560px); }
.paper-meta {
  background: linear-gradient(135deg,#f8fafc,#eef6ff);
  border: 1px solid #dbeafe;
  border-radius: 10px;
  padding: 1rem 1.15rem;
  margin: 1rem 0 1.35rem;
  font-size: .96rem;
  line-height: 1.55;
}
.paper-meta strong { color: #003E74; }
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
<strong>TL;DR:</strong> RoPE encodes position through rotation frequencies θᵢ. When you extend context beyond training length, high-frequency dimensions fail (they have seen all their cycles). NTK-Aware Scaling replaces the base (10000) with a larger value, spreading frequencies out so all dimensions remain useful at longer contexts — often with no additional training.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Scaling Laws of RoPE-based Extrapolation" &nbsp;·&nbsp; arXiv:2310.05209<br>
  <strong>Authors:</strong> Xiaoran Liu, Hang Yan, Shuo Zhang, Chenxin An, Xipeng Qiu, Dahua Lin<br>
  <strong>Venue:</strong> ICLR 2024 &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2310.05209" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/ntk-scaling-paper.png" alt="First page of the NTK scaling paper" caption="Paper preview — Scaling Laws of RoPE-based Extrapolation (Liu et al., 2024)." %}
</div>

## The Context Extension Problem

RoPE (Rotary Position Embedding) encodes the position of each token by rotating query and key vectors at dimension-specific frequencies. A model trained with RoPE on sequences up to length L learns to use those frequencies — but when you try to run it on sequences longer than L, the model sees rotation angles it has never encountered.

**Naïve position interpolation** (scaling positions linearly: pos → pos × L/L') works but degrades high-frequency dimensions catastrophically — they change too fast across the rescaled positions, destroying local structure.

## RoPE Frequencies: A Quick Recap

In RoPE, dimension pair i of a d_k-dimensional key or query is rotated by:

<div class="math-box">
θᵢ = 1 / base^(2i/d)   for i = 0, 1, ..., d/2 − 1
</div>

With base = 10000 (the original RoPE default), frequencies range from 1 (low-frequency, long-range position signal) to 1/10000^(d/d) ≈ 0.0001 (high-frequency, fine-grained local signal).

High-frequency dimensions complete many rotation cycles within a short context window. Low-frequency dimensions rotate slowly across the full context.

## Visual Intuition: Frequency Saturation

<div class="blog-figure">
<figure>
<style>
@keyframes freq-sweep {
  0%   { stroke-dashoffset: 400; }
  100% { stroke-dashoffset: 0; }
}
@keyframes freq-alarm {
  0%,60%  { fill: #dcfce7; }
  70%,100%{ fill: #fee2e2; }
}
</style>
<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <text x="360" y="20" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">RoPE frequency dimensions at training length vs 4× extended context</text>

  <!-- Axis lines -->
  <line x1="50" y1="180" x2="690" y2="180" stroke="#94a3b8" stroke-width="2"/>
  <line x1="50" y1="40"  x2="50"  y2="180" stroke="#94a3b8" stroke-width="2"/>
  <text x="370" y="205" text-anchor="middle" font-size="11" fill="#64748b">RoPE dimension index (low freq → high freq)</text>
  <text x="20"  y="115" text-anchor="middle" font-size="11" fill="#64748b" transform="rotate(-90,20,115)">rotation cycles at context length</text>

  <!-- Training length curve (low values — within budget) -->
  <path d="M60,175 C150,173 250,165 370,140 S560,90 680,45" fill="none" stroke="#0d9488" stroke-width="3"
        stroke-dasharray="400" style="animation:freq-sweep 2s ease-out forwards"/>
  <text x="560" y="80" font-size="11" fill="#0d9488" font-weight="700">original L=2k context</text>

  <!-- 4× extended curve (high-freq dims overflow — shown in red) -->
  <path d="M60,175 C150,170 250,155 370,120 S490,68 600,35" fill="none" stroke="#ef4444" stroke-width="3"
        stroke-dasharray="400" style="animation:freq-sweep 2s 0.5s ease-out forwards"/>
  <!-- overflow zone highlight -->
  <rect x="490" y="32" width="200" height="148" rx="6" fill="#fee2e2" opacity="0.5" style="animation:freq-alarm 3s 1s ease-in-out infinite"/>
  <text x="590" y="52" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="700">saturated!</text>
  <text x="590" y="68" text-anchor="middle" font-size="10" fill="#dc2626">high-freq dims see</text>
  <text x="590" y="82" text-anchor="middle" font-size="10" fill="#dc2626">too many cycles</text>
  <text x="460" y="105" font-size="11" fill="#ef4444" font-weight="700">4× extension (no fix)</text>

  <!-- NTK fixed curve -->
  <path d="M60,175 C150,172 250,163 370,138 S560,88 680,43" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="8 5"/>
  <text x="560" y="135" font-size="11" fill="#7c3aed" font-weight="700">NTK-scaled (base↑)</text>

  <!-- Legend -->
  <rect x="60" y="210" width="14" height="4" fill="#0d9488" rx="2"/>
  <text x="80" y="218" font-size="10" fill="#334155">Training budget (2k)</text>
  <rect x="230" y="210" width="14" height="4" fill="#ef4444" rx="2"/>
  <text x="250" y="218" font-size="10" fill="#334155">Naive 4× extension (breaks high-freq)</text>
  <rect x="490" y="210" width="14" height="4" fill="#7c3aed" rx="2"/>
  <text x="510" y="218" font-size="10" fill="#334155">NTK scaling (stretches all dims proportionally)</text>
</svg>
<figcaption>At 4× context extension without NTK scaling (red), high-frequency RoPE dimensions complete far more cycles than during training — their rotation angles enter unseen regimes (red zone). NTK scaling (purple dashed) raises the base value so all dimensions are stretched proportionally, keeping every dimension within a familiar regime.</figcaption>
</figure>
</div>

## What Breaks at Long Context

When context length exceeds training length, two problems arise:

1. **High-frequency dimensions have seen all their cycles** — they wrap around and lose uniqueness. Two distant positions may map to nearly the same rotation angle.

2. **Attention patterns based on relative angles** degrade — the model's learned sense of "close" vs "far" tokens breaks down.

## The NTK-Aware Scaling Insight

Proposed independently by /u/bloc97 on Reddit (2023) and connected to Neural Tangent Kernel theory, NTK-Aware Scaling replaces the base θ with a larger value:

<div class="math-box">
base_new = base · (L' / L)^(d / (d−2))
</div>

Where:
- L = original training context length
- L' = desired new context length
- d = head dimension

For example, extending LLaMA (trained at L=2048) to L'=8192:

<div class="math-box">
base_new = 10000 · (8192/2048)^(128/126) ≈ 10000 · 4^1.016 ≈ 41400
</div>

This larger base stretches all frequencies proportionally. High-frequency dimensions that previously completed a full cycle within L tokens now complete their cycle within L' tokens — no dimension becomes "saturated" at the new length.

<div class="insight-box">
<strong>Why NTK?</strong> The NTK connection comes from viewing the Transformer as a kernel machine in function space. When you change context length, you are effectively changing the kernel's support. The frequency scaling ensures the kernel remains well-conditioned — similar in spirit to how NTK theory analyzes function space behaviour under parameter changes.
</div>

{% include figure image_path="/images/blog/transformers/su2021_rope.png" alt="RoPE as the basis that NTK scaling modifies" caption="NTK-aware scaling is a way to retune RoPE so its frequency spectrum remains useful at longer context lengths." %}

## NTK vs Linear Interpolation

| Method | High-freq dims | Low-freq dims | Fine-tuning needed |
|--------|--------------|--------------|-------------------|
| Linear interpolation | Severely degraded | Good | Often needed |
| NTK scaling | Preserved | Good | Usually not needed |

Linear interpolation scales positions but keeps frequencies fixed — the high-frequency dimensions see too many cycles per unit position. NTK scaling changes the frequencies to match the new scale.

## Worked Example: Computing the NTK Base

Model: LLaMA-2 7B, trained at L = 4096, head dimension d = 128, original base = 10,000.

**Target: extend to L' = 32,768 (8× extension)**

base_new = 10,000 × (32768 / 4096)^(128 / (128−2))  
= 10,000 × 8^(128/126)  
= 10,000 × 8^1.016  
= 10,000 × 8.36  
≈ **83,600**

The new base of ~83,600 means every RoPE frequency θᵢ = 1/base^(2i/d) is reduced by a factor of ~8×, spreading cycles proportionally over 8× more tokens.

**For dimension i = 0** (lowest frequency):
- Original: θ₀ = 1/10,000⁰ = 1.0 (full rotation per token — highest freq)
- After NTK: θ₀ = 1/83,600⁰ = 1.0 (unchanged — already handles short range fine)

**For dimension i = 63** (highest frequency of the pair, near d/2):
- Original: θ₆₃ = 1/10,000^(126/128) ≈ 1/7,244 ≈ 0.000138
- After NTK: θ₆₃ = 1/83,600^(126/128) ≈ 1/60,600 ≈ 0.0000165

The highest-frequency dimension now completes its cycle every ~60,600 tokens instead of ~7,244 — scaled with the 8× target extension.

## Dynamic NTK Scaling

A practical variant applies NTK scaling **dynamically** at inference time, adjusting the base only for sequences that exceed the training length:

```python
def get_ntk_base(seq_len, training_len=2048, base=10000, dim=128):
    if seq_len <= training_len:
        return base
    scale = seq_len / training_len
    return base * (scale ** (dim / (dim - 2)))
```

This is zero-cost for short sequences and automatically extends context for long ones. LLaMA.cpp and many inference engines implement this by default.

## Limitations

- NTK scaling degrades gradually as L' / L increases. At 8× extension (e.g., 2k → 16k), quality noticeably drops without at least a small amount of fine-tuning.
- It is a post-hoc fix, not a principled training strategy. For best long-context performance, fine-tuning with the new scale (or using YaRN) is recommended.
- It does not address the **attention sink** problem — very long sequences still have attention pattern degradation.

## Summary

| Property | Value |
|----------|-------|
| Core idea | Rescale RoPE base to stretch frequencies to longer contexts |
| Fine-tuning | Not required for moderate extension (2-4×) |
| Quality at 8× | Degrades; short fine-tune recommended |
| Implementation | Single hyperparameter change (new base value) |
| Relation to linear interpolation | Complementary — fixes what interpolation breaks |

NTK-Aware Scaling is the simplest way to extend the context of an existing RoPE model. For more sophisticated extension, see YaRN.

## References

- Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., & Liu, Y. (2021). [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864). *arXiv 2021* (RoPE: rotary position embeddings that encode relative positions; the basis for NTK-Aware Scaling).
- Bloc97 (2023). [NTK-Aware Scaled RoPE allows LLaMA models to have extended (8k+) context size without any fine-tuning and minimal perplexity degradation](https://www.reddit.com/r/LocalLLaMA/comments/14lz7j5/ntkaware_scaled_rope_allows_llama_models_to_have/). *Reddit r/LocalLLaMA 2023* (original NTK-Aware Scaling proposal: rescales RoPE base to preserve high-frequency information during context extension).
- Chen, S., Wong, S., Chen, L., & Tian, Y. (2023). [Extending Context Window of Large Language Models via Positional Interpolation](https://arxiv.org/abs/2306.15595). *arXiv 2023* (Position Interpolation: the alternative to NTK scaling that linearly rescales positions — requires fine-tuning but more stable).
