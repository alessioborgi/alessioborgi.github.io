---
layout: single
title: "Self-Attention: Teaching Machines to Focus"
date: 2026-05-26
categories: [transformers]
book: transformers
tags: [attention, mechanism]
excerpt: "Self-attention is the core of every Transformer. Learn how Query, Key, and Value vectors let every token directly attend to every other — and why that matters."
author_profile: true
read_time: true
is_overview: false
subsection: core
icon: "🔍"
read_mins: 4
permalink: /blog/transformers/attention/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.blog-figure--compact { max-width: 620px; margin-left: auto; margin-right: auto; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.formula-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .8rem 1.1rem; font-family: 'Georgia', serif; font-size: 1.05rem; margin: 1rem 0; text-align: center; color: #1e3a5f; }
.insight-box { background: #fff7ed; border-left: 4px solid #f97316; border-radius: 8px; padding: .95rem 1.1rem; margin: 1.25rem 0; }
.insight-box strong { color: #9a3412; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Self-attention lets each token in a sequence ask "who else here is relevant to me?" It uses three learned projections — Query, Key, and Value — to compute a weighted mixture of all token representations in one shot.
</div>
{% include figure image_path="/images/blog/transformers/slides/slide-14-attention-op.png" alt="Slide visualizing the attention operation with Q K transpose softmax and V" caption="Attention is easiest to understand as a pipeline from Queries and Keys to a row-normalized weighting pattern that mixes the Values. Source: [2]." %}


## The Focusing Analogy

Imagine reading a paper and highlighting sentences that are relevant to your current question. Self-attention does something similar: for every word in a sentence, it calculates a relevance score against every other word, then creates a new representation that is a blend of the most relevant words.

Consider: *"The animal didn't cross the street because **it** was too tired."*

What does "it" refer to? To understand this, the model needs to relate "it" to "animal" (not "street"). Self-attention learns to assign a high score to that pair.

<div class="insight-box">
<strong>Why this changed everything:</strong> before Transformers, sequence models mostly passed information step by step through recurrence or convolution. Self-attention made it possible for any token to directly inspect any other token in a single layer.
</div>

## Query, Key, and Value

Self-attention introduces three projections from each token's embedding vector:

- **Query (Q):** "What am I looking for?"
- **Key (K):** "What do I contain?"
- **Value (V):** "What will I contribute if selected?"

Think of it like a library search system:
- You submit a *Query* (your search request).
- Every book has a *Key* (its index entry).
- The relevance between your query and each key determines how much of each book's *Value* (its content) you receive.

Each of Q, K, V is produced by multiplying the token's embedding by a learned weight matrix: `Q = X·W_Q`, `K = X·W_K`, `V = X·W_V`.

## The Four-Step Computation

<div class="blog-figure">
<figure>
<svg viewBox="0 0 580 290" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Input embeddings -->
  <text x="80" y="18" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Token Embeddings (X)</text>
  <rect x="30"  y="24" width="40" height="22" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="50"  y="39" text-anchor="middle" font-size="10" fill="#1e3a5f">x₁</text>
  <rect x="80"  y="24" width="40" height="22" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="100" y="39" text-anchor="middle" font-size="10" fill="#1e3a5f">x₂</text>
  <rect x="130" y="24" width="40" height="22" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="150" y="39" text-anchor="middle" font-size="10" fill="#1e3a5f">x₃</text>

  <!-- Step 1: Linear projections -->
  <line x1="80" y1="46" x2="80" y2="62" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a2)"/>
  <text x="80" y="78" text-anchor="middle" font-size="10" fill="#374151" font-weight="600">① Linear projections</text>
  <text x="80" y="90" text-anchor="middle" font-size="10" fill="#6b7280">W_Q  W_K  W_V</text>

  <!-- Q K V boxes -->
  <text x="240" y="18" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Q, K, V matrices</text>
  <rect x="190" y="24" width="40" height="22" rx="4" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="210" y="39" text-anchor="middle" font-size="11" fill="#065f46" font-weight="700">Q</text>
  <rect x="240" y="24" width="40" height="22" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="260" y="39" text-anchor="middle" font-size="11" fill="#78350f" font-weight="700">K</text>
  <rect x="290" y="24" width="40" height="22" rx="4" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="310" y="39" text-anchor="middle" font-size="11" fill="#4c1d95" font-weight="700">V</text>
  <line x1="170" y1="35" x2="188" y2="35" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a2)"/>

  <!-- Step 2: Dot product -->
  <rect x="190" y="80" width="140" height="30" rx="6" fill="#fff7ed" stroke="#ea580c" stroke-width="1.5"/>
  <text x="260" y="99" text-anchor="middle" font-size="11" fill="#7c2d12" font-weight="600">② Scores = Q · Kᵀ / √dₖ</text>
  <line x1="210" y1="46" x2="220" y2="78" stroke="#059669" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="260" y1="46" x2="260" y2="78" stroke="#d97706" stroke-width="1.5" marker-end="url(#a2)"/>

  <!-- Score matrix illustration -->
  <rect x="370" y="80" width="90" height="66" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
  <text x="415" y="74" text-anchor="middle" font-size="10" fill="#6b7280">Attention scores</text>
  <!-- 3x3 grid -->
  <line x1="400" y1="80" x2="400" y2="146" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="430" y1="80" x2="430" y2="146" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="370" y1="102" x2="460" y2="102" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="370" y1="124" x2="460" y2="124" stroke="#e2e8f0" stroke-width="1"/>
  <text x="385" y="95"  text-anchor="middle" font-size="9" fill="#1e3a5f">0.8</text>
  <text x="415" y="95"  text-anchor="middle" font-size="9" fill="#1e3a5f">0.1</text>
  <text x="445" y="95"  text-anchor="middle" font-size="9" fill="#1e3a5f">0.1</text>
  <text x="385" y="117" text-anchor="middle" font-size="9" fill="#1e3a5f">0.3</text>
  <text x="415" y="117" text-anchor="middle" font-size="9" fill="#1e3a5f">0.6</text>
  <text x="445" y="117" text-anchor="middle" font-size="9" fill="#1e3a5f">0.1</text>
  <text x="385" y="139" text-anchor="middle" font-size="9" fill="#1e3a5f">0.2</text>
  <text x="415" y="139" text-anchor="middle" font-size="9" fill="#1e3a5f">0.2</text>
  <text x="445" y="139" text-anchor="middle" font-size="9" fill="#1e3a5f">0.6</text>
  <line x1="330" y1="95" x2="368" y2="95" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a2)"/>

  <!-- Step 3: Softmax -->
  <rect x="190" y="158" width="140" height="28" rx="6" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
  <text x="260" y="176" text-anchor="middle" font-size="11" fill="#065f46" font-weight="600">③ Softmax (row-wise)</text>
  <line x1="260" y1="110" x2="260" y2="156" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a2)"/>

  <!-- Step 4: Weighted sum -->
  <rect x="190" y="230" width="140" height="28" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="260" y="248" text-anchor="middle" font-size="11" fill="#4c1d95" font-weight="600">④ Weights × V → Output</text>
  <line x1="260" y1="186" x2="260" y2="228" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="310" y1="35" x2="360" y2="244" stroke="#7c3aed" stroke-width="1" stroke-dasharray="4,3" opacity=".7"/>
  <line x1="415" y1="146" x2="310" y2="228" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a2)"/>

  <!-- Output -->
  <rect x="190" y="272" width="140" height="18" rx="4" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="260" y="284" text-anchor="middle" font-size="10" fill="#134e4a" font-weight="600">Contextualised token vectors</text>
  <line x1="260" y1="258" x2="260" y2="270" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a2)"/>
</svg>
<figcaption>Figure 1: The four steps of scaled dot-product attention.</figcaption>
</figure>
</div>

**Step 1 — Project:** Multiply the input matrix X by three weight matrices to get Q, K, V.

**Step 2 — Score:** Compute the dot product of every query with every key: `Q · Kᵀ`. Divide by √dₖ to prevent large values from pushing the softmax into saturation.

<div class="formula-box">Attention(Q, K, V) = softmax( Q · Kᵀ / √d<sub>k</sub> ) · V</div>

**Step 3 — Normalise:** Apply softmax row-wise. Each row now sums to 1, giving a probability distribution: *"how much should token i attend to token j?"*

**Step 4 — Mix:** Multiply the attention weights by V. Each token's output is a weighted average of all value vectors — heavily weighted towards the tokens it found most relevant.

<div class="blog-figure--compact">
{% include figure image_path="/images/blog/transformers/vaswani2017_scaled_dot_product.png" alt="Scaled dot-product attention equation and computation flow" caption="Scaled dot-product attention: queries score keys, softmax turns scores into weights, and values are mixed accordingly (Vaswani et al., 2017)." %}
</div>

## Why Divide by √dₖ?

Without scaling, the dot products grow large as dimensionality dₖ increases (because they're sums of dₖ products). Large values push softmax into regions where gradients are tiny, slowing training. Dividing by √dₖ keeps the variance stable regardless of model size.

## What the Scores Represent

The attention matrix has a score for every (query-token, key-token) pair. High score = "I find you useful." After softmax, these are weights that determine how much each token borrows from each other token when forming its output representation.

Critically, this computation is **fully differentiable** — the model learns which token pairs should have high attention purely from training signal, with no hand-crafted rules.

## What Self-Attention Gives You That RNNs Do Not

- **Direct long-range access:** the last token can attend to the first token immediately.
- **Parallelism:** all token pairs are processed at once on modern hardware.
- **Task-specific structure:** the model learns what counts as a useful dependency instead of relying on fixed linguistic rules.
- **Flexible context mixing:** the same mechanism can capture syntax, coreference, topic, and retrieval-like behavior.

## References

- Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017*.
- Bahdanau, D., Cho, K., & Bengio, Y. (2014). [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473).
- [2] https://www.sscardapane.it/alice-book/

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Self-attention projects each token into <strong>Q, K, V</strong> vectors via learned weight matrices.</li>
  <li>Relevance scores are <strong>dot products of Q and K</strong>, scaled by √d_k and normalised with softmax.</li>
  <li>The output of each token is a <strong>weighted sum of all Value vectors</strong>.</li>
  <li>The whole computation runs in parallel across all token pairs — no sequential dependency.</li>
</ul>
</div>
