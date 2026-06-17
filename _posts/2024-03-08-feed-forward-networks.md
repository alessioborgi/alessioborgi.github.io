---
layout: single
title: "Feed-Forward Networks: The Forgotten Half of Transformers"
date: 2026-05-26
categories: [transformers]
book: transformers
subsection: core
tags: [FFN, MLP, key-value memory, SwiGLU, activation]
excerpt: "The FFN block holds two-thirds of a Transformer's parameters and does most of its factual recall. Yet it is almost always overlooked in introductions to attention."
author_profile: true
read_time: true
is_overview: false
icon: "🧠"
read_mins: 5
permalink: /blog/transformers/feed-forward-networks/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
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
  font-family: "Times New Roman", Georgia, serif;
  font-size: 1.02rem;
  text-align: center;
  line-height: 1.7;
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Every Transformer block has two sub-layers: multi-head attention and a two-layer MLP (the FFN). The FFN is applied independently to each token, expands the dimension by 4×, applies a nonlinearity, then contracts back. It accounts for ~2/3 of total parameters and is where most factual knowledge is stored.
</div>
{% include figure image_path="/images/blog/transformers/vaswani2017_transformer_architecture.png" alt="Feed-forward sub-layer" caption="Position-wise feed-forward network in the Transformer (Vaswani et al., 2017)" %}

<div class="insight-box">
<strong>Why the FFN is underrated:</strong> attention decides who talks to whom; the FFN is where each token actually gets nonlinearly transformed and enriched.
</div>


## Intuition First: The FFN as a Pattern-Response Memory

Think of the FFN as a giant associative memory. The first matrix W₁ acts as a bank of **pattern detectors** — each row is a template asking "does this token look like X?" The nonlinearity fires neurons that match. The second matrix W₂ then says "when pattern X fires, add feature vector Y to the output."

So for a token representing "Paris" in context "capital of France", a neuron in the expanded layer might activate for the pattern "capital-of-Europe-city" and the corresponding W₂ column adds a "France-related" feature vector to the output. This is factual retrieval — not via attention, but via the FFN's stored patterns.

<div class="blog-figure">
<figure>
<style>
@keyframes ffn-expand {
  0%   { opacity: 0.2; transform: scaleX(0.1); }
  40%  { opacity: 1;   transform: scaleX(1); }
  60%  { opacity: 1;   transform: scaleX(1); }
  100% { opacity: 0.2; transform: scaleX(0.1); }
}
@keyframes ffn-contract {
  0%,39% { opacity: 0; }
  40%,60% { opacity: 1; }
  100%    { opacity: 0; }
}
@keyframes neuron-fire {
  0%,35%  { fill: #e2e8f0; }
  50%     { fill: #f59e0b; }
  65%,100%{ fill: #e2e8f0; }
}
@keyframes neuron-dark {
  0%,35%  { fill: #e2e8f0; }
  50%     { fill: #334155; }
  65%,100%{ fill: #e2e8f0; }
}
</style>
<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <!-- Input token -->
  <rect x="18" y="70" width="80" height="60" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="58" y="97" text-anchor="middle" font-size="11" font-weight="700" fill="#1e40af">token</text>
  <text x="58" y="113" text-anchor="middle" font-size="10" fill="#3b82f6">d_model</text>

  <!-- W1 arrow + label -->
  <path d="M98 100 L148 100" stroke="#2563eb" stroke-width="2.5" fill="none" marker-end="url(#arr1)"/>
  <text x="123" y="92" text-anchor="middle" font-size="10" fill="#64748b">W₁</text>
  <defs>
    <marker id="arr1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#2563eb"/>
    </marker>
    <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#16a34a"/>
    </marker>
    <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#7c3aed"/>
    </marker>
  </defs>

  <!-- Hidden layer neurons (4× expansion, some fire) -->
  <text x="285" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#f59e0b">hidden (4×d_model) — some neurons fire</text>
  <circle cx="210" cy="50"  r="11" style="animation:neuron-dark 2.5s ease-in-out infinite"/>
  <circle cx="210" cy="75"  r="11" style="animation:neuron-fire 2.5s 0.1s ease-in-out infinite"/>
  <circle cx="210" cy="100" r="11" style="animation:neuron-dark 2.5s 0.2s ease-in-out infinite"/>
  <circle cx="210" cy="125" r="11" style="animation:neuron-fire 2.5s 0.3s ease-in-out infinite"/>
  <circle cx="210" cy="150" r="11" style="animation:neuron-dark 2.5s 0.4s ease-in-out infinite"/>
  <circle cx="255" cy="50"  r="11" style="animation:neuron-fire 2.5s 0.1s ease-in-out infinite"/>
  <circle cx="255" cy="75"  r="11" style="animation:neuron-dark 2.5s 0.2s ease-in-out infinite"/>
  <circle cx="255" cy="100" r="11" style="animation:neuron-fire 2.5s 0.3s ease-in-out infinite"/>
  <circle cx="255" cy="125" r="11" style="animation:neuron-dark 2.5s 0.4s ease-in-out infinite"/>
  <circle cx="255" cy="150" r="11" style="animation:neuron-fire 2.5s 0.5s ease-in-out infinite"/>
  <circle cx="300" cy="50"  r="11" style="animation:neuron-dark 2.5s 0.0s ease-in-out infinite"/>
  <circle cx="300" cy="75"  r="11" style="animation:neuron-dark 2.5s 0.1s ease-in-out infinite"/>
  <circle cx="300" cy="100" r="11" style="animation:neuron-fire 2.5s 0.2s ease-in-out infinite"/>
  <circle cx="300" cy="125" r="11" style="animation:neuron-dark 2.5s 0.3s ease-in-out infinite"/>
  <circle cx="300" cy="150" r="11" style="animation:neuron-fire 2.5s 0.6s ease-in-out infinite"/>
  <circle cx="345" cy="50"  r="11" style="animation:neuron-fire 2.5s 0.2s ease-in-out infinite"/>
  <circle cx="345" cy="75"  r="11" style="animation:neuron-dark 2.5s 0.3s ease-in-out infinite"/>
  <circle cx="345" cy="100" r="11" style="animation:neuron-fire 2.5s 0.4s ease-in-out infinite"/>
  <circle cx="345" cy="125" r="11" style="animation:neuron-dark 2.5s 0.5s ease-in-out infinite"/>
  <circle cx="345" cy="150" r="11" style="animation:neuron-dark 2.5s 0.6s ease-in-out infinite"/>

  <!-- W2 arrow -->
  <path d="M370 100 L430 100" stroke="#16a34a" stroke-width="2.5" fill="none" marker-end="url(#arr2)"/>
  <text x="400" y="92" text-anchor="middle" font-size="10" fill="#64748b">W₂</text>

  <!-- Output token -->
  <rect x="440" y="70" width="80" height="60" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="480" y="97" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">enriched</text>
  <text x="480" y="113" text-anchor="middle" font-size="10" fill="#16a34a">d_model</text>

  <!-- Residual add -->
  <circle cx="580" cy="100" r="20" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>
  <text x="580" y="106" text-anchor="middle" font-size="18" fill="#ea580c">⊕</text>
  <path d="M520 100 L558 100" stroke="#16a34a" stroke-width="2" fill="none" marker-end="url(#arr3)"/>
  <path d="M58 70 Q58 30 580 30 L580 78" stroke="#ea580c" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
  <text x="325" y="186" text-anchor="middle" font-size="11" fill="#64748b">position-wise: token i processed independently of token j</text>

  <!-- Output arrow -->
  <path d="M600 100 L650 100" stroke="#7c3aed" stroke-width="2.5" fill="none" marker-end="url(#arr3)"/>
  <rect x="660" y="78" width="52" height="44" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="686" y="103" text-anchor="middle" font-size="10" font-weight="700" fill="#5b21b6">output</text>
</svg>
<figcaption>Animated FFN forward pass. Amber neurons = fired (active after nonlinearity); dark neurons = suppressed (ReLU/GELU set them near zero). The sparse firing pattern is the FFN "reading" which patterns match the current token and assembling the response via W₂.</figcaption>
</figure>
</div>

## The FFN Is Half the Block

Every Transformer block follows this pattern:

```
x → MultiHeadAttention → residual + LN → FeedForward → residual + LN → output
```

The **FeedForward** (FFN) sub-layer is the second half of every block. In popular Transformer explanations, it is often described in one sentence and then forgotten in favour of attention. This is a mistake — the FFN is critical.

## The Architecture of the FFN

The FFN is a simple two-layer MLP applied **position-wise**: each token is processed identically and independently.

<div class="math-box">
\[
\mathrm{FFN}(x)
=
W_2\,\mathrm{activation}(W_1x + b_1) + b_2
\]
</div>

- **W₁ ∈ ℝ^{d_model × d_ff}**: projects up from d_model to d_ff
- **activation**: nonlinearity (ReLU, GELU, or SwiGLU)
- **W₂ ∈ ℝ^{d_ff × d_model}**: projects back down
- **d_ff = 4 × d_model** in most models (e.g., 512 → 2048, or 4096 → 16384)

The 4× expansion and contraction is standard but not derived from first principles — it was established empirically in the original paper and has remained the default.

## Parameter Count: FFN Dominates

For a model with d_model = 1024 and d_ff = 4096, in each block:

| Sub-layer | Parameters |
|-----------|-----------|
| Multi-head attention (4 matrices) | 4 × 1024² = 4.2M |
| FFN (2 matrices) | 2 × 1024 × 4096 = 8.4M |

The FFN holds **twice as many parameters** as the attention sub-layer. In a 96-layer model, FFNs collectively account for roughly **2/3 of all parameters**.

<div class="insight-box">
<strong>Implication for inference efficiency:</strong> When running a large model on a single token (e.g., during autoregressive generation), attention is cheap (one query against a cached KV store) but the FFN still requires a full matrix multiply. FFN computation, not attention, is often the bottleneck in inference.
</div>

## What Does the FFN Actually Do?

### Attention vs FFN: Division of Labour

Research into Transformer internals has revealed a rough division:

- **Attention heads** move information between positions — they determine *which* tokens influence each other and gather context
- **FFN layers** process information at a single position — they apply transformations and recall facts

This is why you can have a model that "knows" Paris is the capital of France even though that fact was not encoded in the positional attention pattern of the current context — the FFN retrieves it.

### FFN as a Key-Value Memory

A 2020 paper (Geva et al., "Transformer Feed-Forward Layers Are Key-Value Memories") showed that the FFN can be interpreted as:

- **W₁ rows (the "keys")**: pattern detectors — each neuron in the expanded dimension activates for specific input patterns
- **W₂ columns (the "values")**: for each activated key, the corresponding value vector is added to the output

When a token activates a key neuron (because it matches a learned pattern), the associated value is retrieved and added to the representation. This is analogous to a soft content-addressable memory — the FFN stores and retrieves (token, fact) associations.

## The Nonlinearity: ReLU, GELU, SwiGLU

### ReLU (original Transformer, 2017)

<div class="math-box">
\[
\mathrm{ReLU}(x) = \max(0, x)
\]
</div>

Simple and sparse — negative activations are exactly zero, which gives the FFN a sparse, efficient structure.

### GELU (GPT-2, BERT, and successors)

<div class="math-box">
\[
\mathrm{GELU}(x) \approx x \cdot \sigma(1.702x)
\]
</div>

Smooth approximation of ReLU with non-zero gradient for negative inputs. Empirically outperforms ReLU on most language tasks.

### SwiGLU (LLaMA, PaLM, Mistral)

<div class="math-box">
\[
\mathrm{SwiGLU}(x, W, V)
=
\mathrm{Swish}(xW) \odot (xV)
\]
</div>

A gated variant: two parallel linear projections, one gating the other element-wise. SwiGLU-based FFNs use d_ff = (8/3) × d_model (not 4×) to keep parameter count comparable. Consistently outperforms ReLU and GELU at large scale.

## Position-Wise Independence: A Key Property

The FFN processes each token **independently** — it does not look at neighbouring tokens. There is no attention-like mechanism: the computation for position i uses only the vector at position i.

This means:
- **Parallelisable across positions** (all tokens in a sequence processed simultaneously)
- **No position-to-position information mixing** — that is strictly the role of attention
- The FFN refines each token's representation in place; it does not redistribute information

## Worked Example: Parameter Count in GPT-3

GPT-3: d_model = 12,288 · d_ff = 49,152 (4×) · 96 layers

Per layer FFN parameters:
- W₁: 12,288 × 49,152 = **603.9M**
- W₂: 49,152 × 12,288 = **603.9M**
- Total FFN per layer: **≈1.21B**

Per layer MHA parameters (96 heads, d_k = d_v = 128):
- Q, K, V, O projections: 4 × 12,288² = **603.9M**

Across 96 layers:
- All FFNs: 96 × 1.21B ≈ **116B parameters**
- All MHA: 96 × 603.9M ≈ **58B parameters**
- FFN share: **≈ 67% of the 175B total**

This confirms the rule: in any standard Transformer, the FFN holds roughly two-thirds of all parameters. Scaling the model mostly means scaling the FFN.

<div class="insight-box">
<strong>Inference bottleneck:</strong> During autoregressive generation, attention uses a KV-cache so only the newest token's query hits the full key-value store — cheap at long context. But the FFN still executes a full 12,288 → 49,152 → 12,288 projection for every single generated token, on every layer, every step. The FFN, not attention, is typically the memory and compute bottleneck in LLM inference.
</div>

## Sparse FFNs: MoE

Mixture-of-Experts (MoE) Transformers replace the dense FFN with multiple expert FFNs, routing each token to only a subset (often 2 out of 64 or more experts):

```
token → router → expert_k → output
```

This allows vastly more total parameters (stored in expert FFNs) while keeping computation constant (only a fraction is used per token). Models like Mixtral 8×7B and GPT-4 (allegedly) use MoE in the FFN sub-layer.

## Summary

| Property | Value |
|----------|-------|
| Architecture | Two-layer MLP with expansion |
| Expansion factor | 4× (ReLU/GELU) or 8/3× (SwiGLU) |
| Applied to | Each token independently |
| Parameter share | ~2/3 of total in standard models |
| Information role | Per-position processing and fact retrieval |
| Attention role comparison | Attention mixes positions; FFN refines each position |

The FFN is not attention's sidekick. It is an equal partner — the knowledge storage and processing unit that sits beside attention's information-routing mechanism.

## References

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017* (Transformer FFN: two-layer MLP with ReLU, dimension 4d hidden, applied position-wise after each attention sublayer).
- Geva, M., Schuster, R., Berant, J., & Levy, O. (2021). [Transformer Feed-Forward Layers Are Key-Value Memories](https://arxiv.org/abs/2012.14913). *EMNLP 2021* (shows that FFN keys activate for human-interpretable input patterns and values store associated output information — FFN as learned key-value memory).
- Shazeer, N. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). *arXiv 2020* (SwiGLU: gated linear units replacing ReLU in the FFN — now the dominant activation in LLaMA, Mistral, PaLM, and Gemini).
