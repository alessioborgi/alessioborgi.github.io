---
layout: single
title: "Feed-Forward Networks: The Forgotten Half of Transformers"
date: 2024-03-08
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
<strong>TL;DR:</strong> Every Transformer block has two sub-layers: multi-head attention and a two-layer MLP (the FFN). The FFN is applied independently to each token, expands the dimension by 4×, applies a nonlinearity, then contracts back. It accounts for ~2/3 of total parameters and is where most factual knowledge is stored.
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
FFN(x) = W₂ · activation( W₁ · x + b₁ ) + b₂
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
ReLU(x) = max(0, x)
</div>

Simple and sparse — negative activations are exactly zero, which gives the FFN a sparse, efficient structure.

### GELU (GPT-2, BERT, and successors)

<div class="math-box">
GELU(x) ≈ x · σ(1.702 · x)
</div>

Smooth approximation of ReLU with non-zero gradient for negative inputs. Empirically outperforms ReLU on most language tasks.

### SwiGLU (LLaMA, PaLM, Mistral)

<div class="math-box">
SwiGLU(x, W, V) = Swish(xW) ⊙ (xV)
</div>

A gated variant: two parallel linear projections, one gating the other element-wise. SwiGLU-based FFNs use d_ff = (8/3) × d_model (not 4×) to keep parameter count comparable. Consistently outperforms ReLU and GELU at large scale.

## Position-Wise Independence: A Key Property

The FFN processes each token **independently** — it does not look at neighbouring tokens. There is no attention-like mechanism: the computation for position i uses only the vector at position i.

This means:
- **Parallelisable across positions** (all tokens in a sequence processed simultaneously)
- **No position-to-position information mixing** — that is strictly the role of attention
- The FFN refines each token's representation in place; it does not redistribute information

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
