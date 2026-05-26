---
layout: single
title: "Multi-Head Attention: Many Eyes on the Data"
date: 2026-05-26
categories: [transformers]
book: transformers
tags: [attention, multi-head]
excerpt: "One attention head sees one relationship. Multiple heads running in parallel let the model capture syntax, semantics, and coreference simultaneously — here's how."
author_profile: true
read_time: true
is_overview: false
subsection: core
icon: "👁️"
read_mins: 4
permalink: /blog/transformers/multi-head-attention/
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
.insight-box { background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 8px; padding: .95rem 1.1rem; margin: 1.25rem 0; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Multi-Head Attention runs several self-attention operations in parallel, each in a smaller subspace. Each "head" independently learns what to attend to, capturing different aspects of the input. Their outputs are concatenated and projected back.
</div>
{% include figure image_path="/images/blog/transformers/slides/slide-19-multi-head.png" alt="Slide visualizing multi-head attention" caption="Multi-head attention repeats the same attention pattern across several learned subspaces before concatenating the results. Source: [2]." %}


## Why One Head Isn't Enough

A single self-attention head computes one set of relevance scores across all token pairs. But language is rich: in one sentence, "bank" might need to attend to "river" for its meaning AND to "withdrew" for its syntactic role — simultaneously.

With a single head, the model must average these signals into one distribution, losing specificity. Multiple heads solve this by each specialising in a different type of relationship.

<div class="insight-box">
<strong>Intuition:</strong> one head is one lens. Multi-head attention gives the model several lenses at once: one may track syntax, another semantics, another long-range reference.
</div>

## The Idea: Parallel Subspaces

Instead of computing attention once in the full d-dimensional space, Multi-Head Attention:

1. **Splits** the Q, K, V matrices into *h* smaller pieces (each of dimension d/h).
2. **Runs** scaled dot-product attention independently on each piece (each piece = one "head").
3. **Concatenates** the h output matrices.
4. **Projects** the concatenated result back to the original dimension with a final weight matrix W_O.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 560 310" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="a3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Input -->
  <rect x="205" y="10" width="130" height="26" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="270" y="27" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3a5f">Input X</text>

  <!-- Three paths -->
  <!-- Head 1 -->
  <line x1="230" y1="36" x2="100" y2="60" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="55" y="60" width="90" height="26" rx="5" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="100" y="77" text-anchor="middle" font-size="10" fill="#065f46" font-weight="600">Linear (W₁)</text>
  <line x1="100" y1="86" x2="100" y2="108" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="55" y="108" width="90" height="26" rx="5" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="100" y="125" text-anchor="middle" font-size="10" fill="#134e4a" font-weight="600">Attention Head 1</text>
  <text x="100" y="155" text-anchor="middle" font-size="9" fill="#6b7280">Focus: syntax</text>

  <!-- Head 2 -->
  <line x1="270" y1="36" x2="270" y2="60" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="225" y="60" width="90" height="26" rx="5" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="270" y="77" text-anchor="middle" font-size="10" fill="#78350f" font-weight="600">Linear (W₂)</text>
  <line x1="270" y1="86" x2="270" y2="108" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="225" y="108" width="90" height="26" rx="5" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
  <text x="270" y="125" text-anchor="middle" font-size="10" fill="#78350f" font-weight="600">Attention Head 2</text>
  <text x="270" y="155" text-anchor="middle" font-size="9" fill="#6b7280">Focus: semantics</text>

  <!-- Head 3 (h) -->
  <line x1="310" y1="36" x2="440" y2="60" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="395" y="60" width="90" height="26" rx="5" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="440" y="77" text-anchor="middle" font-size="10" fill="#4c1d95" font-weight="600">Linear (Wₕ)</text>
  <line x1="440" y1="86" x2="440" y2="108" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="395" y="108" width="90" height="26" rx="5" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="440" y="125" text-anchor="middle" font-size="10" fill="#4c1d95" font-weight="600">Attention Head h</text>
  <text x="440" y="155" text-anchor="middle" font-size="9" fill="#6b7280">Focus: co-reference</text>

  <!-- Dots indicating more heads -->
  <text x="348" y="118" text-anchor="middle" font-size="18" fill="#9ca3af">…</text>

  <!-- Concatenate -->
  <line x1="100" y1="134" x2="200" y2="178" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <line x1="270" y1="134" x2="270" y2="178" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <line x1="440" y1="134" x2="340" y2="178" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="155" y="180" width="230" height="26" rx="5" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
  <text x="270" y="197" text-anchor="middle" font-size="11" fill="#334155" font-weight="600">Concat (head₁ ‖ head₂ ‖ … ‖ headₕ)</text>

  <!-- Final projection -->
  <line x1="270" y1="206" x2="270" y2="226" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="155" y="228" width="230" height="26" rx="5" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
  <text x="270" y="245" text-anchor="middle" font-size="11" fill="#065f46" font-weight="600">Linear projection W_O</text>

  <!-- Output -->
  <line x1="270" y1="254" x2="270" y2="274" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a3)"/>
  <rect x="155" y="276" width="230" height="26" rx="5" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="270" y="293" text-anchor="middle" font-size="11" fill="#134e4a" font-weight="600">Multi-Head Attention Output</text>
</svg>
<figcaption>Figure 1: h attention heads run in parallel, each with its own learned projection. Their outputs are concatenated and projected to the original dimension.</figcaption>
</figure>
</div>

## In Numbers

The original "Attention Is All You Need" paper uses:
- Model dimension: **d_model = 512**
- Number of heads: **h = 8**
- Head dimension: **d_k = d_v = 512 / 8 = 64**

So each head works in a 64-dimensional subspace — much cheaper per head, but collectively richer than a single 512-dim head.

The formula is simply:

**MultiHead(Q, K, V) = Concat(head₁, …, headₕ) · W_O**

where **headᵢ = Attention(Q·Wᵢ_Q, K·Wᵢ_K, V·Wᵢ_V)**

{% include figure image_path="/images/blog/transformers/slides/slide-14-attention-op.png" alt="Attention operation reused as the building block inside each head" caption="Each head is still just standard scaled dot-product attention. Multi-head attention becomes powerful because the model learns several such views at once." %}

## What Each Head Learns

Research on attention visualisation (e.g., BERTology papers) shows that different heads naturally specialise:

- Some heads track **syntactic dependencies** (subject–verb agreement).
- Some heads track **co-reference** (resolving "it" → "animal").
- Some heads track **positional proximity** (attending mostly to adjacent tokens).
- Some heads look **broadly** across the whole sequence.

This specialisation emerges from training; nobody explicitly assigns these roles.

## Efficiency Note

The total compute is the same as one big attention head (d² operations), but split across h heads. GPUs parallelise this well because each head is independent. The final W_O projection is the only cross-head interaction.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Multi-Head Attention runs <strong>h independent attention operations</strong> in lower-dimensional subspaces.</li>
  <li>Each head learns a different set of Q, K, V projections — and tends to specialise in different relationship types.</li>
  <li>Outputs are <strong>concatenated</strong> and projected back to d_model with a final linear layer W_O.</li>
  <li>Total compute ≈ single-head attention; expressive power is strictly greater.</li>
</ul>
</div>
