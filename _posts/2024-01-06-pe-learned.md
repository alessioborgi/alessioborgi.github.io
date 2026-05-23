---
layout: single
title: "Learned Positional Encodings: Data-Driven Position"
date: 2024-01-06
categories: [transformers]
book: transformers
tags: [positional-encoding, learned]
excerpt: "Instead of a fixed formula, why not just train position embeddings from scratch — like word embeddings? That's exactly what BERT and GPT-1 do. Here's how and when it works."
author_profile: true
read_time: true
is_overview: false
subsection: positional-encodings
icon: "🎓"
read_mins: 3
permalink: /blog/transformers/pe-learned/
toc: true
toc_label: "Contents"
---

<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
.pros-cons .col { border-radius: 8px; padding: .85rem 1rem; }
.pros { background: #f0fdf4; border: 1px solid #bbf7d0; }
.cons { background: #fef2f2; border: 1px solid #fecaca; }
.pros h4 { margin: 0 0 .4rem; color: #166534; font-size: .9rem; }
.cons h4 { margin: 0 0 .4rem; color: #dc2626; font-size: .9rem; }
.pros ul, .cons ul { margin: 0; padding-left: 1.1rem; font-size: .87rem; }
.pros li, .cons li { margin-bottom: .2rem; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Learned PE keeps a trainable embedding matrix where row <em>i</em> is the position vector for position <em>i</em>. It's flexible and often slightly outperforms sinusoidal PE on benchmark tasks — but it can't generalise to sequences longer than seen during training.
</div>

## The Simplest Possible Idea

Word embeddings map each token in the vocabulary to a learned vector. Learned PE does exactly the same thing for positions.

You create an embedding matrix `E` of shape `[max_length × d_model]`. During training, `E[pos]` is trained alongside all other model parameters via backpropagation. At inference, you look up the row matching the token's position and add it to the word embedding.

```
input[pos] = word_embedding(token[pos]) + E[pos]
```

That's it. No formula, no frequencies — just a trainable lookup table.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 230" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="a6" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Embedding matrix table -->
  <text x="115" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Learned Position Embedding Matrix E</text>
  <!-- Header -->
  <rect x="30" y="22" width="60" height="22" rx="0" fill="#0f2a36"/>
  <text x="60" y="37" text-anchor="middle" font-size="10" fill="#fff" font-weight="600">Position</text>
  <rect x="90" y="22" width="160" height="22" rx="0" fill="#0f2a36"/>
  <text x="170" y="37" text-anchor="middle" font-size="10" fill="#fff" font-weight="600">Embedding Vector (d_model dims)</text>
  <!-- Rows -->
  <rect x="30" y="44" width="60" height="20" rx="0" fill="#fef3c7" stroke="#e2e8f0"/>
  <text x="60" y="58" text-anchor="middle" font-size="10" fill="#78350f" font-weight="600">pos = 0</text>
  <rect x="90" y="44" width="160" height="20" rx="0" fill="#fffbeb" stroke="#e2e8f0"/>
  <text x="170" y="58" text-anchor="middle" font-size="10" fill="#374151">[0.12, −0.45, 0.87, ...]</text>
  <text x="262" y="58" font-size="9" fill="#9ca3af">← trainable</text>

  <rect x="30" y="64" width="60" height="20" rx="0" fill="#dbeafe" stroke="#e2e8f0"/>
  <text x="60" y="78" text-anchor="middle" font-size="10" fill="#1e3a5f" font-weight="600">pos = 1</text>
  <rect x="90" y="64" width="160" height="20" rx="0" fill="#eff6ff" stroke="#e2e8f0"/>
  <text x="170" y="78" text-anchor="middle" font-size="10" fill="#374151">[−0.33, 0.21, 0.55, ...]</text>
  <text x="262" y="78" font-size="9" fill="#9ca3af">← trainable</text>

  <rect x="30" y="84" width="60" height="20" rx="0" fill="#d1fae5" stroke="#e2e8f0"/>
  <text x="60" y="98" text-anchor="middle" font-size="10" fill="#065f46" font-weight="600">pos = 2</text>
  <rect x="90" y="84" width="160" height="20" rx="0" fill="#ecfdf5" stroke="#e2e8f0"/>
  <text x="170" y="98" text-anchor="middle" font-size="10" fill="#374151">[0.77, 0.03, −0.12, ...]</text>
  <text x="262" y="98" font-size="9" fill="#9ca3af">← trainable</text>

  <text x="60" y="122" text-anchor="middle" font-size="12" fill="#6b7280">⋮</text>
  <text x="170" y="122" text-anchor="middle" font-size="12" fill="#6b7280">⋮</text>

  <rect x="30" y="128" width="60" height="20" rx="0" fill="#ede9fe" stroke="#e2e8f0"/>
  <text x="60" y="142" text-anchor="middle" font-size="10" fill="#4c1d95" font-weight="600">pos = T</text>
  <rect x="90" y="128" width="160" height="20" rx="0" fill="#f5f3ff" stroke="#e2e8f0"/>
  <text x="170" y="142" text-anchor="middle" font-size="10" fill="#374151">[0.41, −0.67, 0.22, ...]</text>
  <text x="262" y="142" font-size="9" fill="#dc2626">max length!</text>

  <!-- Warning -->
  <rect x="30" y="158" width="240" height="28" rx="6" fill="#fef2f2" stroke="#fecaca"/>
  <text x="150" y="170" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="600">⚠ Cannot generalise beyond pos = T</text>
  <text x="150" y="182" text-anchor="middle" font-size="9" fill="#dc2626">No row exists for pos = T+1, T+2, …</text>

  <!-- Arrow showing lookup -->
  <line x1="340" y1="58" x2="400" y2="58" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a6)"/>
  <rect x="402" y="44" width="68" height="90" rx="6" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="436" y="60" text-anchor="middle" font-size="9" fill="#134e4a" font-weight="600">Lookup</text>
  <text x="436" y="74" text-anchor="middle" font-size="9" fill="#134e4a">E[pos]</text>
  <text x="436" y="100" text-anchor="middle" font-size="9" fill="#134e4a">Add to</text>
  <text x="436" y="114" text-anchor="middle" font-size="9" fill="#134e4a">word</text>
  <text x="436" y="128" text-anchor="middle" font-size="9" fill="#134e4a">embedding</text>
</svg>
<figcaption>Figure 1: Learned PE is a simple lookup table trained end-to-end. Row i is the position vector for position i. Sequences longer than the table length cannot be handled.</figcaption>
</figure>
</div>

## Who Uses It?

- **BERT (2018):** 512 position limit, learned embeddings. The most influential NLP model of its era.
- **GPT-1 (2018):** 512 positions, learned.
- **GPT-2 (2019):** 1024 positions, learned.
- **ViT (2020):** Patches are treated as tokens, learned 1D or 2D PE.

## Pros and Cons

<div class="pros-cons">
<div class="col pros">
<h4>✅ Advantages</h4>
<ul>
<li>Flexible — learns what works best for the data</li>
<li>Simple to implement (one embedding layer)</li>
<li>Often matches or slightly beats sinusoidal on standard benchmarks</li>
<li>The model can shape position representations to the task</li>
</ul>
</div>
<div class="col cons">
<h4>❌ Disadvantages</h4>
<ul>
<li>Cannot generalise beyond the training length</li>
<li>Adds parameters proportional to max sequence length</li>
<li>Position 512 might be poorly trained if few training examples are that long</li>
<li>Less interpretable than a fixed formula</li>
</ul>
</div>
</div>

## Sinusoidal vs. Learned: Which Is Better?

The original Transformer paper tested both and found *"roughly equal results"*. The key distinction is use case:
- If your sequences are bounded and short → learned PE is fine.
- If you need unlimited extrapolation → sinusoidal, RoPE, or ALiBi are better.

Modern large-scale LLMs abandoned both in favour of RoPE or ALiBi, which combine the benefits of learned representations with better extrapolation.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Learned PE is a <strong>trainable embedding table</strong>: one row per position, trained end-to-end.</li>
  <li>Used in BERT, GPT-1/2, and early ViT — simple and effective for bounded-length tasks.</li>
  <li>The main weakness: <strong>no generalisation beyond the maximum training length</strong>.</li>
  <li>Slightly more expressive than sinusoidal, but modern LLMs prefer RoPE or ALiBi for long contexts.</li>
</ul>
</div>
