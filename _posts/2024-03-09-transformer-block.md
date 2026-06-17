---
layout: single
title: "The Transformer Block: Putting It All Together"
date: 2026-05-26
categories: [transformers]
book: transformers
subsection: core
tags: [transformer-block, architecture, residual, layer-norm, attention, FFN]
excerpt: "A single Transformer block combines attention, residuals, layer norm, and an FFN into one reusable unit. Understanding this block is understanding the Transformer."
author_profile: true
read_time: true
is_overview: false
icon: "🧩"
read_mins: 5
permalink: /blog/transformers/transformer-block/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 780px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
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
.diagram {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  margin: 1.25rem 0;
  font-family: monospace;
  font-size: 0.88rem;
  line-height: 1.7;
  overflow-x: auto;
}
.diagram .label { color: #38bdf8; font-weight: bold; }
.diagram .arrow { color: #94a3b8; }
.diagram .op    { color: #4ade80; }
.diagram .plus  { color: #f472b6; font-weight: bold; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A Transformer block = LN → MHA → residual → LN → FFN → residual. This unit is stacked N times. Understanding one block means understanding the entire architecture. Every modern LLM is just this pattern repeated at scale.
</div>
{% include figure image_path="/images/blog/transformers/slides/slide-22-blocks.png" alt="Slide comparing post-normalized and pre-normalized Transformer blocks" caption="The post-norm and pre-norm block layouts show why modern large models usually prefer pre-norm: it is easier to optimize deeply. Source: [2]." %}


## The Block is the Atom

The Transformer is not a complex monolith. It is a simple building block — the **Transformer block** — stacked repeatedly. GPT-2 small stacks 12. GPT-3 stacks 96. LLaMA 3 (70B) stacks 80. But each block is identical in structure.

Understand one block; understand any Transformer.

## Data Flow: Token Embeddings

Before the first block, each input token is converted to a vector via an **embedding lookup** and summed with a **positional encoding**:

```
"The"  → embedding[The]  + pos_enc[0]  → x₀ ∈ ℝ^d_model
"cat"  → embedding[cat]  + pos_enc[1]  → x₁ ∈ ℝ^d_model
"sat"  → embedding[sat]  + pos_enc[2]  → x₂ ∈ ℝ^d_model
```

These vectors form a matrix **X ∈ ℝ^{seq_len × d_model}**. This matrix flows through the stack of blocks.

## The Pre-LN Transformer Block (Modern Standard)

<div class="diagram">
<span class="label">INPUT</span>: x  (shape: [seq_len, d_model])
<br>
│
├─── Identity copy ──────────────────────────────────────────── ⊕ ←──┐
│                                                                     │
└──→ <span class="op">LayerNorm</span> → <span class="op">MultiHeadAttention</span> ─────────────────────────────────────┘
                                                                  ↓
                                                      x' (attended representation)
│
├─── Identity copy ──────────────────────────────────────────── ⊕ ←──┐
│                                                                     │
└──→ <span class="op">LayerNorm</span> → <span class="op">FeedForward (MLP)</span> ───────────────────────────────────┘
                                                                  ↓
<span class="label">OUTPUT</span>: x''  (shape: [seq_len, d_model])
</div>

In equations:

<div class="math-box">
x' = x + MHA( LayerNorm(x) )
<br>
x'' = x' + FFN( LayerNorm(x') )
</div>

Two additions. Two layer norms. One attention operation. One FFN. That is the entire block.

## Step-by-Step Walkthrough

### Step 1: Layer Norm (before attention)

The input x is normalised across its feature dimension. Each token's d_model-dimensional vector is scaled to zero mean and unit variance, then re-scaled by learned γ and β.

This stabilises the distribution entering attention, preventing runaway growth of attention logits.

### Step 2: Multi-Head Attention

The normalised input is projected into Q, K, V for each head:
- **Q, K** used to compute attention weights (which tokens attend to which)
- **V** used to compute the attended output (what information is retrieved)

Heads run in parallel; their outputs are concatenated and projected back to d_model.

*Output shape: [seq_len, d_model] — same as input.*

### Step 3: First Residual Addition

The attention output is added back to the **original** x (before normalisation). This is the residual connection:

```
x' = x + attention_output
```

The original signal is preserved. The attention result is a small correction to it.

### Step 4: Layer Norm (before FFN)

The post-attention representation x' is normalised again, feeding into the FFN with a well-conditioned distribution.

### Step 5: Feed-Forward Network

The FFN processes each token position independently:
- **Project up:** d_model → 4 × d_model
- **Nonlinearity:** GELU or SwiGLU
- **Project down:** 4 × d_model → d_model

The FFN does not mix positions — it refines each token's representation in place.

### Step 6: Second Residual Addition

```
x'' = x' + ffn_output
```

The FFN's contribution is added to x'. Again, the skip connection preserves the signal.

**x'' is the output of the block** and becomes the input to the next block.

## Shapes Throughout One Block

| Stage | Tensor shape |
|-------|-------------|
| Input x | [L, d_model] |
| After LN (pre-attention) | [L, d_model] |
| Q, K per head | [L, d_k] each |
| V per head | [L, d_v] each |
| Attention output (per head) | [L, d_v] |
| After concat + project | [L, d_model] |
| After residual | [L, d_model] |
| After LN (pre-FFN) | [L, d_model] |
| After W₁ (FFN expand) | [L, 4·d_model] |
| After W₂ (FFN contract) | [L, d_model] |
| After residual (output) | [L, d_model] |

The shape is **always [L, d_model]** entering and leaving the block. Stacking blocks does not change the shape — only the content.

## What Each Component Contributes

| Component | Role |
|-----------|------|
| Layer Norm | Stabilises distributions; enables deep stacking |
| Multi-Head Attention | Mixes information across positions |
| First Residual | Preserves input; enables gradient highway |
| Feed-Forward Network | Refines per-position; stores knowledge |
| Second Residual | Preserves input; enables gradient highway |

<div class="insight-box">
<strong>The separation of concerns:</strong> Attention handles <em>where</em> to look (cross-position). FFN handles <em>what to do</em> at each position (per-token). Residuals ensure both can be bypassed if needed. Layer norms keep everything stable. Each component is minimal, independent, and essential.
</div>

## The Stack

A full Transformer is this block, repeated N times, followed by a final layer norm and an output head:

```
Token + Positional Embeddings
         ↓
   [Block 1]  ← LN → MHA → + → LN → FFN → +
         ↓
   [Block 2]
         ↓
      ...
         ↓
   [Block N]
         ↓
   Final LayerNorm
         ↓
   Output projection (lm_head): d_model → vocab_size
         ↓
   Logits → softmax → token probabilities
```

GPT-3 at 175B parameters is 96 of these blocks, each with d_model=12288, 96 attention heads, and d_ff=49152. The architecture is the same as described here. The only differences are scale and a few engineering choices (RoPE, SwiGLU, grouped-query attention in modern models).

{% include figure image_path="/images/blog/transformers/slides/slide-37-full-model.png" alt="Slide showing the full Transformer built from stacked blocks" caption="The block only matters because it repeats: the full Transformer is embeddings, position information, and a stack of this same unit." %}

## Animated: Information Flow Through One Block

<div class="blog-figure">
<figure>
<style>
@keyframes pulse-ln  { 0%,100%{fill:#dbeafe} 50%{fill:#93c5fd} }
@keyframes pulse-mha { 0%,100%{fill:#dcfce7} 50%{fill:#4ade80} }
@keyframes pulse-ffn { 0%,100%{fill:#fef9c3} 50%{fill:#fde047} }
@keyframes pulse-res { 0%,100%{fill:#fff7ed} 50%{fill:#fed7aa} }
@keyframes flow-h {
  0%   { stroke-dashoffset: 60; opacity: 0.3; }
  50%  { stroke-dashoffset: 0;  opacity: 1; }
  100% { stroke-dashoffset:-60; opacity: 0.3; }
}
</style>
<svg viewBox="0 0 720 180" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="blk-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#475569"/>
    </marker>
  </defs>

  <!-- Step labels -->
  <text x="60"  y="16" text-anchor="middle" font-size="10" fill="#475569">① LN</text>
  <text x="185" y="16" text-anchor="middle" font-size="10" fill="#475569">② MHA</text>
  <text x="320" y="16" text-anchor="middle" font-size="10" fill="#ea580c" font-weight="700">③ + residual</text>
  <text x="440" y="16" text-anchor="middle" font-size="10" fill="#475569">④ LN</text>
  <text x="560" y="16" text-anchor="middle" font-size="10" fill="#475569">⑤ FFN</text>
  <text x="680" y="16" text-anchor="middle" font-size="10" fill="#ea580c" font-weight="700">⑥ + residual</text>

  <!-- Input -->
  <rect x="10"  y="70" width="46" height="40" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="33"  y="94" text-anchor="middle" font-size="10" fill="#334155">x in</text>

  <!-- LN1 -->
  <rect x="72"  y="60" width="76" height="60" rx="8" style="animation:pulse-ln 2.5s ease-in-out infinite"/>
  <text x="110" y="88" text-anchor="middle" font-size="11" font-weight="700" fill="#1e40af">Layer</text>
  <text x="110" y="104" text-anchor="middle" font-size="11" font-weight="700" fill="#1e40af">Norm</text>

  <!-- MHA -->
  <rect x="162" y="50" width="96" height="80" rx="8" style="animation:pulse-mha 2.5s 0.4s ease-in-out infinite"/>
  <text x="210" y="84" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">Multi-Head</text>
  <text x="210" y="100" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">Attention</text>

  <!-- Residual add 1 -->
  <circle cx="318" cy="90" r="22" style="animation:pulse-res 2.5s 0.8s ease-in-out infinite" stroke="#ea580c" stroke-width="2"/>
  <text x="318" y="96" text-anchor="middle" font-size="20" fill="#ea580c">⊕</text>

  <!-- LN2 -->
  <rect x="352" y="60" width="76" height="60" rx="8" style="animation:pulse-ln 2.5s 1.2s ease-in-out infinite"/>
  <text x="390" y="88" text-anchor="middle" font-size="11" font-weight="700" fill="#1e40af">Layer</text>
  <text x="390" y="104" text-anchor="middle" font-size="11" font-weight="700" fill="#1e40af">Norm</text>

  <!-- FFN -->
  <rect x="442" y="50" width="96" height="80" rx="8" style="animation:pulse-ffn 2.5s 1.6s ease-in-out infinite"/>
  <text x="490" y="84" text-anchor="middle" font-size="11" font-weight="700" fill="#854d0e">Feed</text>
  <text x="490" y="100" text-anchor="middle" font-size="11" font-weight="700" fill="#854d0e">Forward</text>

  <!-- Residual add 2 -->
  <circle cx="598" cy="90" r="22" style="animation:pulse-res 2.5s 2.0s ease-in-out infinite" stroke="#ea580c" stroke-width="2"/>
  <text x="598" y="96" text-anchor="middle" font-size="20" fill="#ea580c">⊕</text>

  <!-- Output -->
  <rect x="634" y="70" width="58" height="40" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="663" y="94" text-anchor="middle" font-size="10" fill="#334155">x out</text>

  <!-- Connecting arrows -->
  <path d="M56 90 L70 90"   stroke="#475569" stroke-width="2" fill="none" marker-end="url(#blk-arr)" stroke-dasharray="5 3" style="animation:flow-h 1.2s linear infinite"/>
  <path d="M148 90 L160 90" stroke="#475569" stroke-width="2" fill="none" marker-end="url(#blk-arr)" stroke-dasharray="5 3" style="animation:flow-h 1.2s 0.3s linear infinite"/>
  <path d="M258 90 L294 90" stroke="#475569" stroke-width="2" fill="none" marker-end="url(#blk-arr)" stroke-dasharray="5 3" style="animation:flow-h 1.2s 0.6s linear infinite"/>
  <path d="M340 90 L350 90" stroke="#475569" stroke-width="2" fill="none" marker-end="url(#blk-arr)" stroke-dasharray="5 3" style="animation:flow-h 1.2s 0.9s linear infinite"/>
  <path d="M428 90 L440 90" stroke="#475569" stroke-width="2" fill="none" marker-end="url(#blk-arr)" stroke-dasharray="5 3" style="animation:flow-h 1.2s 1.2s linear infinite"/>
  <path d="M538 90 L574 90" stroke="#475569" stroke-width="2" fill="none" marker-end="url(#blk-arr)" stroke-dasharray="5 3" style="animation:flow-h 1.2s 1.5s linear infinite"/>
  <path d="M620 90 L632 90" stroke="#475569" stroke-width="2" fill="none" marker-end="url(#blk-arr)" stroke-dasharray="5 3" style="animation:flow-h 1.2s 1.8s linear infinite"/>

  <!-- Skip connections -->
  <path d="M33 70 Q33 32 318 32 L318 68"  stroke="#ea580c" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
  <path d="M318 112 Q318 148 598 148 L598 112" stroke="#ea580c" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
  <text x="180" y="28" text-anchor="middle" font-size="9" fill="#ea580c">skip 1 (identity)</text>
  <text x="460" y="165" text-anchor="middle" font-size="9" fill="#ea580c">skip 2 (identity)</text>
</svg>
<figcaption>Animated forward pass through one Pre-LN Transformer block. Each component pulses when active. The orange dashed arcs are the residual skip connections — they carry the original signal directly to the addition nodes, ensuring the block only needs to learn a correction, not a full transformation.</figcaption>
</figure>
</div>

## Why This Block Scales So Well

- The **attention** sub-layer mixes information globally across the sequence.
- The **FFN** sub-layer increases per-token expressivity without changing sequence length.
- **Residuals** let gradients bypass either sub-layer if needed.
- **Layer norm** keeps the statistics stable enough to stack dozens or hundreds of blocks.

That division of labor is why the same blueprint works from tiny classroom models to frontier LLMs.

## Summary

The Transformer block is:

1. **LN + MHA + Residual** — cross-position information gathering
2. **LN + FFN + Residual** — per-position processing and knowledge retrieval

Everything else in a Transformer — BERT, GPT, T5, ViT, LLaMA — is a combination of how these blocks are arranged, what masking strategy is used, and what input/output heads are attached. The block itself is always the same.

## References

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017* (original Transformer block: MHA → Add&Norm → FFN → Add&Norm, stacked L times).
- Xiong, R., Yang, Y., He, D., Zheng, K., Zheng, S., Xing, C., Zhang, H., Lan, Y., Wang, L., & Liu, T.-Y. (2020). [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745). *ICML 2020* (Pre-LN block variant: LN before each sublayer instead of after — improves gradient flow and dominates modern LLM architectures).
- Geva, M., et al. (2021). [Transformer Feed-Forward Layers Are Key-Value Memories](https://arxiv.org/abs/2012.14913).
- Touvron, H., Lavril, T., Izacard, G., Martinet, X., Lachaux, M.-A., Lacroix, T., Rozière, B., Goyal, N., Hambro, E., Azhar, F., Rodriguez, A., Joulin, A., Grave, E., & Lample, G. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971). *arXiv 2023* (LLaMA: uses Pre-LN block with RMSNorm, SwiGLU FFN, and RoPE — the dominant open-weight Transformer block design).
- [2] https://www.sscardapane.it/alice-book/
