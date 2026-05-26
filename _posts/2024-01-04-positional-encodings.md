---
layout: single
title: "Positional Encodings: Why Position Matters"
date: 2026-05-26
categories: [transformers]
book: transformers
tags: [positional-encoding, overview]
excerpt: "Transformers see all tokens at once — which means without help they'd treat 'cat ate mouse' and 'mouse ate cat' the same. Positional encodings fix this. Here's the full landscape."
author_profile: true
read_time: true
is_overview: false
subsection: positional-encodings
icon: "📐"
read_mins: 4
permalink: /blog/transformers/positional-encodings/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.pe-table { width: 100%; border-collapse: collapse; font-size: .9rem; margin: 1rem 0; }
.pe-table th { background: #0f2a36; color: #fff; padding: .5rem .75rem; text-align: left; }
.pe-table td { padding: .45rem .75rem; border-bottom: 1px solid #e2e8f0; }
.pe-table tr:hover td { background: #f0fdf4; }
.insight-box { background: #fff7ed; border-left: 4px solid #f97316; border-radius: 8px; padding: .95rem 1.1rem; margin: 1.25rem 0; }
.insight-box strong { color: #9a3412; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Because self-attention is order-agnostic, Transformers need an extra signal to know which token is at which position. Positional encodings (PEs) inject this information as vectors added to the token embeddings. Different PE designs have wildly different properties.
</div>
{% include figure image_path="/images/blog/transformers/slides/slide-34-positional-heatmap.png" alt="Slide visualizing sinusoidal positional encodings across positions" caption="From the lecture slides: sinusoidal positional encodings create a multi-frequency pattern across sequence positions rather than a single scalar counter. Source: Simone Scardapane, Transformer models lecture, 2023." %}


## The Order-Agnostic Problem

Self-attention computes pairwise scores between all tokens. It doesn't matter if token A is first or last — the attention equation treats both identically. Shuffle the sentence and the model gets the exact same output (just with rows permuted).

This is catastrophic for language: "**dog bites man**" and "**man bites dog**" have opposite meanings.

<div class="insight-box">
  <strong>Core intuition:</strong> positional encodings are not a small implementation detail. They decide whether a Transformer understands sequence as an ordered structure or as an unordered bag of tokens.
</div>

## The Solution: Inject Position into the Embedding

The fix is conceptually simple: before the first attention layer, **add a position-dependent vector** to each token's embedding.

```
final_input[pos] = token_embedding[pos] + positional_encoding[pos]
```

The attention mechanism then sees the *mixed* vector and can pick up position information from it. Simple. But the choice of what those position vectors *are* turns out to matter a lot.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="a4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Word embedding -->
  <text x="130" y="18" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Word Embedding</text>
  <rect x="55" y="24" width="150" height="36" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="130" y="38" text-anchor="middle" font-size="10" fill="#1e3a5f">"cat" → [0.3, −0.7, 0.1, ...]</text>
  <text x="130" y="52" text-anchor="middle" font-size="10" fill="#1e3a5f">dim: d_model</text>

  <!-- Plus sign -->
  <text x="235" y="48" text-anchor="middle" font-size="24" font-weight="700" fill="#0d9488">+</text>

  <!-- Position encoding -->
  <text x="360" y="18" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Positional Encoding</text>
  <rect x="285" y="24" width="150" height="36" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="360" y="38" text-anchor="middle" font-size="10" fill="#78350f">pos=1 → [0.0, 1.0, 0.0, ...]</text>
  <text x="360" y="52" text-anchor="middle" font-size="10" fill="#78350f">same dim: d_model</text>

  <!-- Arrow down -->
  <line x1="248" y1="78" x2="248" y2="108" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a4)"/>
  <text x="275" y="97" font-size="10" fill="#6b7280">element-wise add</text>

  <!-- Result -->
  <rect x="140" y="110" width="220" height="36" rx="6" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="250" y="124" text-anchor="middle" font-size="10" fill="#134e4a" font-weight="600">Input to Transformer: [0.3, 0.3, 0.1, ...]</text>
  <text x="250" y="138" text-anchor="middle" font-size="10" fill="#134e4a">carries both word identity + position</text>

  <!-- Labels for different PE types -->
  <text x="260" y="170" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Types of Positional Encodings:</text>
  <text x="80"  y="190" text-anchor="middle" font-size="10" fill="#0d9488" font-weight="600">Sinusoidal</text>
  <text x="170" y="190" text-anchor="middle" font-size="10" fill="#0a66c2" font-weight="600">Learned</text>
  <text x="260" y="190" text-anchor="middle" font-size="10" fill="#d97706" font-weight="600">Relative</text>
  <text x="350" y="190" text-anchor="middle" font-size="10" fill="#7c3aed" font-weight="600">RoPE</text>
  <text x="440" y="190" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="600">ALiBi</text>
</svg>
<figcaption>Figure 1: Positional encoding is added element-wise to the token embedding before the first attention layer.</figcaption>
</figure>
</div>

## The Landscape of PE Methods

<table class="pe-table">
<thead>
<tr><th>Method</th><th>Type</th><th>Learnable?</th><th>Extrapolates?</th><th>Used in</th></tr>
</thead>
<tbody>
<tr><td>Sinusoidal</td><td>Absolute</td><td>No</td><td>Moderate</td><td>Original Transformer (2017)</td></tr>
<tr><td>Learned Absolute</td><td>Absolute</td><td>Yes</td><td>No</td><td>BERT, GPT-1, ViT</td></tr>
<tr><td>Relative (Shaw)</td><td>Relative</td><td>Yes</td><td>Yes</td><td>Music Transformer</td></tr>
<tr><td>Relative (T5 Bias)</td><td>Relative</td><td>Yes</td><td>Yes</td><td>T5, Flan-T5</td></tr>
<tr><td>RoPE</td><td>Rotary (Absolute→Relative)</td><td>No</td><td>Good</td><td>LLaMA, Mistral, GPT-NeoX</td></tr>
<tr><td>ALiBi</td><td>Attention bias</td><td>No</td><td>Excellent</td><td>BLOOM, MPT</td></tr>
</tbody>
</table>

## Three Axes to Understand PEs

**1. Absolute vs. Relative**
Absolute methods assign a vector to each *position index* (0, 1, 2, …). Relative methods instead encode the *distance between two tokens* (±1, ±2, …). Relative encodings tend to generalise better across lengths.

**2. Fixed vs. Learned**
Fixed methods (sinusoidal, ALiBi) use a deterministic formula — no extra parameters. Learned methods (BERT-style, relative biases) train position representations end-to-end. Learned = more flexible; fixed = no max-length constraint.

**3. Extrapolation**
Can the model handle sequences *longer* than those seen during training? This is the key practical question for LLMs serving long documents. ALiBi and RoPE generally win here; standard learned absolute PEs fail badly.

{% include figure image_path="/images/blog/transformers/press2022_alibi.png" alt="ALiBi as linear biases added to attention scores" caption="ALiBi changes the attention logits directly with a distance-dependent bias instead of adding explicit positional vectors at the input layer (Press et al., 2022)." %}

## Which PE Should You Reach For?

- If you want the **historical baseline**, start with sinusoidal PE.
- If you care about **simple pretraining on fixed lengths**, learned absolute PE is easy.
- If you care about **relative order and text-to-text transfer**, T5-style relative bias is strong.
- If you care about **modern LLMs and long context**, RoPE is the default starting point.
- If you care about **extreme extrapolation with minimal machinery**, ALiBi is still conceptually elegant.

## References

- Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762).
- Shaw, P., Uszkoreit, J., & Vaswani, A. (2018). [Self-Attention with Relative Position Representations](https://arxiv.org/abs/1803.02155).
- Raffel, C., et al. (2020). [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://arxiv.org/abs/1910.10683).
- Su, J., et al. (2021). [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864).
- Press, O., Smith, N. A., & Lewis, M. (2022). [Train Short, Test Long: Attention with Linear Biases](https://arxiv.org/abs/2108.12409).
- Simone Scardapane. *Transformer (attention-based) models*, lecture slides, 2023.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Self-attention is order-agnostic; PEs inject position information as vectors <strong>added to token embeddings</strong>.</li>
  <li>The main design axes are: absolute vs. relative, fixed vs. learned, extrapolation capability.</li>
  <li>Modern LLMs (LLaMA, Mistral, BLOOM) moved away from sinusoidal PEs toward RoPE and ALiBi.</li>
  <li>Each subsequent chapter covers one PE method in depth — start with sinusoidal to understand the origin.</li>
</ul>
</div>
