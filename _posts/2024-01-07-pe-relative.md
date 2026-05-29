---
layout: single
title: "Relative Positional Encodings: It's All About Distance"
date: 2026-05-26
categories: [transformers]
book: transformers
tags: [positional-encoding, relative]
excerpt: "Instead of asking 'where am I?', relative PEs ask 'how far are these two tokens apart?' Shaw et al. and T5 both use this idea to build models that generalise better to variable-length inputs."
author_profile: true
read_time: true
is_overview: false
subsection: positional-encodings
icon: "↔️"
read_mins: 4
permalink: /blog/transformers/pe-relative/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.paper-preview img { width: min(100%, 620px); }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.paper-meta {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
  font-size: 0.93rem;
}
.paper-meta strong { color: #003E74; }
.insight-box { background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 8px; padding: .95rem 1.1rem; margin: 1.25rem 0; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.formula-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .8rem 1.1rem; font-family: 'Georgia', serif; font-size: .98rem; margin: 1rem 0; text-align: center; color: #1e3a5f; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Relative PE encodes how far apart two tokens are rather than where each one sits. Shaw et al. (2018) add learnable distance vectors to the attention computation; T5 adds a simpler learned scalar bias per distance bucket. Both approaches generalise better than absolute PE.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Self-Attention with Relative Position Representations" &nbsp;·&nbsp; arXiv:1803.02155<br>
  <strong>Authors:</strong> Peter Shaw, Jakob Uszkoreit, Ashish Vaswani<br>
  <strong>Venue:</strong> NAACL 2018 &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/1803.02155" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/relative-pe-paper.png" alt="First page of the Self-Attention with Relative Position Representations paper" caption="Paper preview — Self-Attention with Relative Position Representations (Shaw et al., 2018)." %}
</div>
{% include figure image_path="/images/blog/transformers/raffel2020_t5.png" alt="T5 and relative positional bias" caption="T5 popularised a lightweight learned relative attention bias instead of absolute positional vectors (Raffel et al., 2020)." %}

<div class="insight-box">
<strong>What relative PE gets right:</strong> for many language tasks, distance matters more than absolute index. "one token back" is often reusable; "position 387" usually is not.
</div>

## The Problem with Absolute Position

Absolute PEs assign a position vector based on where a token sits in the sequence — position 0, position 1, etc.

But think about what really matters for attention: whether token A is **close to** or **far from** token B, not exactly where either one sits in a global index. The word "love" in *"I love dogs"* and *"I really truly love dogs"* has the same relationship to "dogs" (it's the verb, directly preceding the object) — even though its absolute position is different.

Relative PE captures exactly this intuition.

## Shaw et al. (2018): Relative Attention

Shaw, Uszkoreit, and Vaswani modify the attention score between token i and token j to include a learned relative position embedding `a_{ij}`:

<div class="formula-box">
score(i, j) = (q_i · k_j + q_i · a_{ij}) / √d_k
</div>

Here `a_{ij}` is the embedding for the *clipped relative distance* `clip(i − j, −k, k)`. A maximum distance k (e.g., 16) is used — beyond that, all distances share the same embedding.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="a7" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Tokens -->
  <text x="260" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Relative Distance Between Token Pairs</text>
  <rect x="40"  y="26" width="50" height="28" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="65"  y="44" text-anchor="middle" font-size="12" fill="#1e3a5f" font-weight="600">I</text>
  <rect x="110" y="26" width="50" height="28" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="135" y="44" text-anchor="middle" font-size="12" fill="#1e3a5f" font-weight="600">love</text>
  <rect x="180" y="26" width="50" height="28" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="205" y="44" text-anchor="middle" font-size="12" fill="#1e3a5f" font-weight="600">dogs</text>
  <rect x="270" y="26" width="50" height="28" rx="5" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="295" y="44" text-anchor="middle" font-size="12" fill="#065f46" font-weight="600">and</text>
  <rect x="340" y="26" width="50" height="28" rx="5" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="365" y="44" text-anchor="middle" font-size="12" fill="#065f46" font-weight="600">cats</text>

  <!-- Distance labels for token pairs with "dogs" (pos 2) -->
  <text x="205" y="72" text-anchor="middle" font-size="9" fill="#6b7280">anchor: "dogs"</text>
  <!-- Arrows showing distances -->
  <line x1="170" y1="54" x2="100" y2="82" stroke="#dc2626" stroke-width="1.5" marker-end="url(#a7)"/>
  <text x="90"  y="96" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="600">dist = −2</text>
  <line x1="185" y1="54" x2="145" y2="82" stroke="#ea580c" stroke-width="1.5" marker-end="url(#a7)"/>
  <text x="145" y="96" text-anchor="middle" font-size="9" fill="#ea580c" font-weight="600">dist = −1</text>
  <line x1="225" y1="54" x2="285" y2="82" stroke="#059669" stroke-width="1.5" marker-end="url(#a7)"/>
  <text x="290" y="96" text-anchor="middle" font-size="9" fill="#059669" font-weight="600">dist = +1</text>
  <line x1="235" y1="54" x2="345" y2="82" stroke="#0d9488" stroke-width="1.5" marker-end="url(#a7)"/>
  <text x="365" y="96" text-anchor="middle" font-size="9" fill="#0d9488" font-weight="600">dist = +2</text>

  <!-- Key insight box -->
  <rect x="40" y="110" width="430" height="46" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
  <text x="255" y="128" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">Key insight: same relative distances in any sentence position</text>
  <text x="255" y="146" text-anchor="middle" font-size="10" fill="#374151">"love" → "dogs" is always distance +1, whether at position 3, 7, or 25 globally.</text>

  <!-- Shaw vs T5 comparison -->
  <rect x="40" y="168" width="200" height="46" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="140" y="184" text-anchor="middle" font-size="10" font-weight="700" fill="#1e3a5f">Shaw et al. (2018)</text>
  <text x="140" y="198" text-anchor="middle" font-size="9" fill="#374151">Learned vector a_{ij} added to QK attention</text>
  <text x="140" y="210" text-anchor="middle" font-size="9" fill="#374151">Also modifies V computation</text>

  <rect x="260" y="168" width="210" height="46" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="365" y="184" text-anchor="middle" font-size="10" font-weight="700" fill="#78350f">T5 Relative Bias (2020)</text>
  <text x="365" y="198" text-anchor="middle" font-size="9" fill="#374151">Learned scalar bias b_{ij} added to attention logits</text>
  <text x="365" y="210" text-anchor="middle" font-size="9" fill="#374151">Simpler, buckets for distance, shared across layers</text>
</svg>
<figcaption>Figure 1: "dogs" attending to tokens at relative distances −2, −1, +1, +2. The same distance embeddings apply regardless of absolute position.</figcaption>
</figure>
</div>

## T5 Relative Bias

Raffel et al. (T5, 2020) simplify further. Instead of a full vector per relative position, they add a **learned scalar bias** to the attention score:

<div class="formula-box">
score(i, j) = q_i · k_j / √d_k + b(i − j)
</div>

`b(·)` is a small lookup table of scalars, indexed by bucketed distances. Nearby distances (−1, 0, +1) each get their own bucket; farther distances share buckets. The biases are shared across all layers but learned separately per attention head.

This is extremely memory-efficient and generalises gracefully to longer sequences.

## Why Relative PE Generalises Better

Absolute PE puts a token at "position 42" — if training sequences were at most 64 long, the model learned what position 42 means. At position 200? It never saw that index.

Relative PE never mentions global positions. It only says "these two tokens are 5 apart." As long as the model has seen pairs 5 apart before (which it almost certainly has), it can handle any sequence length.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Relative PE encodes the <strong>gap between pairs of tokens</strong>, not their absolute position.</li>
  <li>Shaw et al. (2018) adds a learned vector to the QK dot-product; T5 adds a simpler scalar bias.</li>
  <li>Generalises better to longer sequences — the model never sees an "unseen absolute position".</li>
  <li>T5-style relative biases are lightweight (one small table) and used across Flan-T5, Switch Transformer, and more.</li>
</ul>
</div>
