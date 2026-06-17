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
.blog-figure--compact { max-width: 440px; margin-left: auto; margin-right: auto; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.insight-box { background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 8px; padding: .95rem 1.1rem; margin: 1.25rem 0; }
.math-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.4rem;
  margin: 1.25rem 0;
  font-family: "Times New Roman", Georgia, serif;
  font-size: 1.02rem;
  text-align: center;
  line-height: 1.7;
}
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Multi-Head Attention runs several self-attention operations in parallel, each in a smaller subspace. Each "head" independently learns what to attend to, capturing different aspects of the input. Their outputs are concatenated and projected back.
</div>

## Why One Head Isn't Enough

A single self-attention head computes one set of relevance scores across all token pairs. But language is rich: in one sentence, "bank" might need to attend to "river" for its meaning AND to "withdrew" for its syntactic role — simultaneously.

With a single head, the model must average these signals into one distribution, losing specificity. Multiple heads solve this by each specialising in a different type of relationship.

<div class="insight-box">
<strong>Intuition:</strong> one head is one lens. Multi-head attention gives the model several lenses at once: one may track syntax, another semantics, another long-range reference.
</div>

## Intuition First: Why Multiple Lenses?

Think about how you understand a sentence like *"The bank by the river approved the loan."*

To fully understand "bank" you need to resolve two things simultaneously:
- Its **syntactic role** (it is the grammatical subject)
- Its **semantic disambiguation** (river context → geographical bank, not financial)

A single attention head must blend these two signals into one distribution. Head A might focus on syntax while Head B focuses on nearby context — and the final linear layer W_O combines both views.

## The Idea: Parallel Subspaces

Instead of computing attention once in the full d-dimensional space, Multi-Head Attention:

1. **Splits** the Q, K, V matrices into *h* smaller pieces (each of dimension d/h).
2. **Runs** scaled dot-product attention independently on each piece (each piece = one "head").
3. **Concatenates** the h output matrices.
4. **Projects** the concatenated result back to the original dimension with a final weight matrix W_O.

<div class="blog-figure--compact">
{% include figure image_path="/images/blog/transformers/vaswani2017_multi_head_attention.png" alt="Multi-head attention diagram from Attention Is All You Need" caption="The original Vaswani et al. multi-head diagram makes the core idea explicit: project Q, K, and V several times, run attention independently in parallel, concatenate the head outputs, then mix them through a final linear layer. Source: [1]." %}
</div>

## In Numbers

The original "Attention Is All You Need" paper uses:
- Model dimension: **d_model = 512**
- Number of heads: **h = 8**
- Head dimension: **d_k = d_v = 512 / 8 = 64**

So each head works in a 64-dimensional subspace — much cheaper per head, but collectively richer than a single 512-dim head.

The formula is simply:

<div class="math-box">
\[
\mathrm{MultiHead}(Q, K, V)
=
\mathrm{Concat}(\mathrm{head}_1, \ldots, \mathrm{head}_h)\,W_O
\]
</div>

where:

<div class="math-box">
\[
\mathrm{head}_i
=
\mathrm{Attention}(QW_i^Q,\; KW_i^K,\; VW_i^V)
\]
</div>

## What Each Head Learns

Research on attention visualisation (e.g., BERTology papers) shows that different heads naturally specialise:

- Some heads track **syntactic dependencies** (subject–verb agreement).
- Some heads track **co-reference** (resolving "it" → "animal").
- Some heads track **positional proximity** (attending mostly to adjacent tokens).
- Some heads look **broadly** across the whole sequence.

This specialisation emerges from training; nobody explicitly assigns these roles.

## Worked Example: 2 Heads, d_model = 4

Let d_model = 4 and h = 2, so each head works in d_k = d_v = 2 dimensions.

Suppose one token has embedding x = [1, 0, 1, 0].

**Head 1** uses W_Q1, W_K1, W_V1 projected onto dimensions 0–1. It might learn to track syntactic role.

**Head 2** uses W_Q2, W_K2, W_V2 projected onto dimensions 2–3. It might learn to track semantic meaning.

Each head produces a 2-dimensional output. After two heads compute their results:

```
head₁ output: [a, b]     (syntactic view)
head₂ output: [c, d]     (semantic view)

Concat: [a, b, c, d]     (back to d_model = 4)
× W_O:  final 4-dim output
```

W_O mixes both views — it can learn to weight syntactic information from head₁ more heavily for certain tasks (e.g., POS tagging) or semantic information from head₂ more heavily for others (e.g., coreference).

<div class="blog-figure">
<figure>
<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <style>
    @keyframes head-glow {
      0%, 100% { filter: drop-shadow(0 0 0px #3b82f6); }
      50%       { filter: drop-shadow(0 0 6px #3b82f6); }
    }
    @keyframes head-glow2 {
      0%, 100% { filter: drop-shadow(0 0 0px #059669); }
      50%       { filter: drop-shadow(0 0 6px #059669); }
    }
    .hd1 { animation: head-glow  2.2s ease-in-out infinite; }
    .hd2 { animation: head-glow2 2.2s ease-in-out 1.1s infinite; }
  </style>
  <defs>
    <marker id="mha1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Input -->
  <rect x="10" y="80" width="80" height="40" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="50" y="104" text-anchor="middle" font-size="10" fill="#1e3a5f" font-weight="700">Input X</text>
  <line x1="90" y1="100" x2="108" y2="68" stroke="#6b7280" stroke-width="1.2" marker-end="url(#mha1)"/>
  <line x1="90" y1="100" x2="108" y2="132" stroke="#6b7280" stroke-width="1.2" marker-end="url(#mha1)"/>
  <!-- Head 1 -->
  <rect x="110" y="46" width="120" height="44" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" class="hd1"/>
  <text x="170" y="65" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="700">Head 1</text>
  <text x="170" y="80" text-anchor="middle" font-size="9" fill="#1e3a5f">Attn(Q₁,K₁,V₁)</text>
  <!-- Head 2 -->
  <rect x="110" y="110" width="120" height="44" rx="6" fill="#ecfdf5" stroke="#059669" stroke-width="1.5" class="hd2"/>
  <text x="170" y="129" text-anchor="middle" font-size="10" fill="#065f46" font-weight="700">Head 2</text>
  <text x="170" y="144" text-anchor="middle" font-size="9" fill="#065f46">Attn(Q₂,K₂,V₂)</text>
  <!-- Concat -->
  <line x1="230" y1="68" x2="260" y2="95" stroke="#6b7280" stroke-width="1.2" marker-end="url(#mha1)"/>
  <line x1="230" y1="132" x2="260" y2="105" stroke="#6b7280" stroke-width="1.2" marker-end="url(#mha1)"/>
  <rect x="262" y="76" width="90" height="48" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="307" y="97" text-anchor="middle" font-size="10" fill="#78350f" font-weight="700">Concat</text>
  <text x="307" y="111" text-anchor="middle" font-size="9" fill="#78350f">[h₁; h₂]</text>
  <!-- W_O -->
  <line x1="352" y1="100" x2="372" y2="100" stroke="#6b7280" stroke-width="1.5" marker-end="url(#mha1)"/>
  <rect x="374" y="76" width="80" height="48" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="414" y="97" text-anchor="middle" font-size="10" fill="#4c1d95" font-weight="700">× W_O</text>
  <text x="414" y="111" text-anchor="middle" font-size="9" fill="#4c1d95">Linear mix</text>
  <!-- Output -->
  <line x1="454" y1="100" x2="472" y2="100" stroke="#6b7280" stroke-width="1.5" marker-end="url(#mha1)"/>
  <rect x="474" y="76" width="76" height="48" rx="6" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="512" y="97" text-anchor="middle" font-size="10" fill="#134e4a" font-weight="700">Output</text>
  <text x="512" y="111" text-anchor="middle" font-size="9" fill="#134e4a">d_model</text>
  <!-- Labels below heads -->
  <text x="170" y="168" text-anchor="middle" font-size="8" fill="#1e40af">syntax focus</text>
  <text x="170" y="178" text-anchor="middle" font-size="8" fill="#059669">semantic focus</text>
</svg>
<figcaption>Two heads run in parallel — each glows when "active". Their outputs are concatenated and mixed by W_O to produce the final multi-head representation.</figcaption>
</figure>
</div>

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

## References

- [1] Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762).
- [2] https://www.sscardapane.it/alice-book/
