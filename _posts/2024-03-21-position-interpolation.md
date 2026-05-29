---
layout: single
title: "Position Interpolation: Extending RoPE with Minimal Fine-Tuning"
date: 2026-05-29
categories: [transformers]
book: transformers
subsection: positional-encodings
tags: [RoPE, position-interpolation, long-context, positional-encoding]
excerpt: "Position Interpolation rescales positions before applying RoPE so a model trained on short contexts can be adapted to longer ones with surprisingly little fine-tuning. It became the reference baseline for long-context RoPE extension."
author_profile: true
read_time: true
is_overview: false
icon: "🪜"
read_mins: 5
permalink: /blog/transformers/position-interpolation/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.paper-preview img { width: min(100%, 560px); }
.paper-meta { background: linear-gradient(135deg,#f8fafc,#eef6ff); border: 1px solid #dbeafe; border-radius: 10px; padding: 1rem 1.15rem; margin: 1rem 0 1.35rem; font-size: .96rem; line-height: 1.55; }
.paper-meta strong { color: #003E74; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.15rem; margin: 1.25rem 0; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.formula-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .85rem 1.05rem; font-family: 'Georgia', serif; font-size: .98rem; margin: 1rem 0; text-align: center; color: #1e3a5f; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Position Interpolation (PI) stretches RoPE to longer contexts by compressing large positions back into the range seen during training. It is simple, works surprisingly well, and usually needs only light fine-tuning. Conceptually, it is the baseline long-context RoPE fix that later methods such as NTK scaling and YaRN improved upon.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Extending Context Window of Large Language Models via Positional Interpolation" &nbsp;·&nbsp; arXiv:2306.15595<br>
  <strong>Authors:</strong> Shouyuan Chen, Sherman Wong, Liangchen Luo, Yuandong Tian<br>
  <strong>Venue:</strong> arXiv 2023 &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2306.15595" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/position-interpolation-paper.png" alt="First page of the Position Interpolation paper" caption="Paper preview — Extending Context Window of Large Language Models via Positional Interpolation (Chen et al., 2023)." %}
</div>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 760 290" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <rect x="38" y="52" width="300" height="178" rx="18" fill="#eff6ff" stroke="#93c5fd" stroke-width="2"/>
  <rect x="422" y="52" width="300" height="178" rx="18" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="2"/>
  <text x="188" y="82" text-anchor="middle" font-size="19" font-weight="800" fill="#0f2a36">training context</text>
  <text x="572" y="82" text-anchor="middle" font-size="19" font-weight="800" fill="#0f2a36">longer inference context</text>

  <line x1="74" y1="165" x2="300" y2="165" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
  <line x1="458" y1="165" x2="684" y2="165" stroke="#16a34a" stroke-width="6" stroke-linecap="round"/>

  <circle cx="112" cy="165" r="10" fill="#2563eb"/>
  <circle cx="164" cy="165" r="10" fill="#2563eb"/>
  <circle cx="216" cy="165" r="10" fill="#2563eb"/>
  <circle cx="268" cy="165" r="10" fill="#2563eb"/>

  <circle cx="490" cy="165" r="10" fill="#16a34a"/>
  <circle cx="550" cy="165" r="10" fill="#16a34a"/>
  <circle cx="610" cy="165" r="10" fill="#16a34a"/>
  <circle cx="670" cy="165" r="10" fill="#16a34a"/>

  <path d="M300 165 C360 122, 398 122, 458 165" fill="none" stroke="#0f2a36" stroke-width="3" stroke-dasharray="8 7"/>
  <polygon points="458,165 446,158 446,172" fill="#0f2a36"/>

  <text x="380" y="115" text-anchor="middle" font-size="15" font-weight="700" fill="#0f2a36">compress positions before RoPE</text>
  <text x="380" y="138" text-anchor="middle" font-size="14" fill="#475569">same rotary mechanism, but mapped back into the familiar range</text>

  <text x="188" y="204" text-anchor="middle" font-size="13" fill="#334155">seen during training</text>
  <text x="572" y="204" text-anchor="middle" font-size="13" fill="#334155">adapted to a longer window</text>

  <rect x="182" y="242" width="395" height="28" rx="14" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="379" y="260" text-anchor="middle" font-size="13" font-weight="700" fill="#78350f">pos' = pos × (Ltrain / Ltarget)</text>
</svg>
<figcaption>Figure 1 — Position Interpolation extends a RoPE model by squeezing larger positions back into the positional range seen during training. The architecture stays the same; the trick is to remap coordinates before applying the rotary transform. Source: [1].</figcaption>
</figure>
</div>

<div class="insight-box">
<strong>The central idea:</strong> do not ask the model to handle raw positions it has never seen. Instead, remap those positions into a compressed coordinate system that still looks familiar to the original RoPE frequencies.
</div>

## Why It Was Such a Big Deal

Once RoPE-based LLMs became standard, the obvious next question was: how do we make them handle longer context without retraining from scratch?

Position Interpolation gave one of the first practical answers. Instead of changing the attention mechanism or inventing a new positional encoding, it simply rescales positions:

<div class="formula-box">
\[
\text{pos}_{\text{new}} = \text{pos} \cdot \frac{L_{\text{train}}}{L_{\text{target}}}
\]
</div>

If the original model was trained up to \(L_{\text{train}}\) and you want to run it at \(L_{\text{target}}\), you compress all coordinates so the rotary angles remain inside a more familiar regime.

## What This Changes in Practice

RoPE normally rotates queries and keys by an angle proportional to position. If you double or quadruple context length, those angles can move into regimes the model never learned to interpret.

Position Interpolation avoids that by saying:

> the model may read a longer sequence, but the positional coordinates fed to RoPE should move more slowly.

So the token sequence becomes longer, but the positional trajectory through rotary space becomes denser and less extreme.

## Why Fine-Tuning Still Matters

PI is much better than naive extrapolation, but it is not magic. Compressing positions changes the geometry of how nearby and far-away tokens are separated. The model usually benefits from a short adaptation phase so it can relearn how to use that modified geometry.

That is why Position Interpolation is often described as:
- simple
- effective
- cheap to adapt

but not fully "free" in the way NTK-aware scaling tries to be.

## How It Fits in the RoPE Family

Position Interpolation is the baseline long-context RoPE extension recipe. Later methods can be read as refinements:

- <strong>NTK-aware scaling</strong> changes frequencies instead of compressing positions directly
- <strong>YaRN</strong> mixes interpolation and extrapolation across frequency bands
- <strong>LongRoPE</strong> searches for dimension-wise rescaling schedules

So PI is worth knowing because it is the conceptual bridge between plain RoPE and the more advanced long-context methods.

## When to Use It

PI makes sense when:
- you already have a trained RoPE model
- you want a longer context quickly
- you can afford a short fine-tuning run

It is especially useful as a baseline, because if a fancier method does not clearly beat PI, that method probably is not worth the complexity.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Position Interpolation extends RoPE by <strong>compressing positions</strong> before applying rotary embeddings.</li>
  <li>It preserves the architecture and keeps the change local to the positional mechanism.</li>
  <li>It usually works well with <strong>light fine-tuning</strong>, making it a practical context-extension baseline.</li>
  <li>Conceptually, it sits right before NTK scaling, YaRN, and LongRoPE in the long-context RoPE story.</li>
</ul>
</div>

## References

- [1] Chen, S., Wong, S., Chen, L., Tian, Y. (2023). [Extending Context Window of Large Language Models via Positional Interpolation](https://arxiv.org/abs/2306.15595). *arXiv 2023*.
- [2] Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., Liu, Y. (2021). [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864). *arXiv 2021*.
