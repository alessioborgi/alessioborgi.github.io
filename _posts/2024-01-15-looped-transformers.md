---
layout: single
title: "Looped Transformers: Thinking More with the Same Weights"
categories: [transformers]
book: transformers
tags: [looped-transformer, weight-tying, inference-time-compute]
published: false
excerpt: "What if instead of making the model wider, you ran the same block multiple times? Looped Transformers tie weights across layers and iterate, trading compute for depth without extra parameters — and they're behind modern 'thinking' models."
author_profile: true
read_time: true
is_overview: false
subsection: variants
icon: "🔁"
read_mins: 4
permalink: /blog/transformers/looped-transformers/
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
.insight-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: .85rem 1.1rem; margin: 1rem 0; }
.insight-box strong { color: #78350f; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Looped Transformers re-use the same transformer block T times in sequence (weight tying). Each "loop" refines the token representations, mimicking deeper networks with far fewer parameters. Varying loop count at inference lets you trade speed for quality.
</div>

## The Standard Transformer's Bottleneck

A standard 32-layer Transformer has 32 *different* blocks, each with its own weights. Depth = more parameters. Making models "think harder" means making them bigger.

But consider this: after seeing a hard question, do you immediately answer, or do you think for a while and refine your answer? For most of us, more thinking time (even with the same brain) leads to better answers.

**Looped Transformers bring this intuition to neural networks.**

## Weight Tying Across Layers

In a standard Transformer: each layer l has its own W_Q^l, W_K^l, W_V^l, W_O^l, and FFN weights.

In a Looped Transformer: all layers share the **same** weights. You apply one Transformer block T times:

```
h₀ = embed(x)
h₁ = Block(h₀)    # iteration 1
h₂ = Block(h₁)    # iteration 2, same Block
h₃ = Block(h₂)    # iteration 3, same Block
...
hₜ = Block(h_{t-1})  # iteration T
output = head(hₜ)
```

The block learns to be a general "refinement step" that improves representations iteratively — like a recurrence in a modern skin.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 260" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="al" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Standard Transformer (left) -->
  <text x="110" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Standard Transformer</text>
  <rect x="60" y="22" width="100" height="28" rx="5" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="110" y="40" text-anchor="middle" font-size="10" fill="#1e3a5f">Block 1 (W₁)</text>
  <line x1="110" y1="50" x2="110" y2="66" stroke="#6b7280" stroke-width="1.5" marker-end="url(#al)"/>
  <rect x="60" y="68" width="100" height="28" rx="5" fill="#d1fae5" stroke="#059669"/>
  <text x="110" y="86" text-anchor="middle" font-size="10" fill="#065f46">Block 2 (W₂)</text>
  <line x1="110" y1="96" x2="110" y2="112" stroke="#6b7280" stroke-width="1.5" marker-end="url(#al)"/>
  <rect x="60" y="114" width="100" height="28" rx="5" fill="#ede9fe" stroke="#7c3aed"/>
  <text x="110" y="132" text-anchor="middle" font-size="10" fill="#4c1d95">Block 3 (W₃)</text>
  <line x1="110" y1="142" x2="110" y2="158" stroke="#6b7280" stroke-width="1.5" marker-end="url(#al)"/>
  <text x="110" y="176" text-anchor="middle" font-size="12" fill="#6b7280">⋮</text>
  <rect x="60" y="184" width="100" height="28" rx="5" fill="#fef3c7" stroke="#d97706"/>
  <text x="110" y="202" text-anchor="middle" font-size="10" fill="#78350f">Block N (Wₙ)</text>
  <text x="110" y="230" text-anchor="middle" font-size="9" fill="#dc2626">N × params_per_block</text>

  <!-- Arrow comparing -->
  <line x1="175" y1="130" x2="205" y2="130" stroke="#9ca3af" stroke-width="1.5"/>
  <text x="190" y="122" text-anchor="middle" font-size="9" fill="#6b7280">vs</text>

  <!-- Looped Transformer (right) -->
  <text x="370" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Looped Transformer</text>
  <rect x="310" y="66" width="120" height="60" rx="8" fill="#ccfbf1" stroke="#0d9488" stroke-width="2.5"/>
  <text x="370" y="88" text-anchor="middle" font-size="11" fill="#134e4a" font-weight="700">Shared Block</text>
  <text x="370" y="104" text-anchor="middle" font-size="10" fill="#134e4a">(one set of W)</text>
  <text x="370" y="118" text-anchor="middle" font-size="9" fill="#0d9488">same block, T loops</text>
  <!-- Loop arrow -->
  <path d="M 432 96 C 470 96 470 130 432 130 C 432 130 432 126 420 126" fill="none" stroke="#0d9488" stroke-width="2" marker-end="url(#al)"/>
  <text x="468" y="116" font-size="9" fill="#0d9488" font-weight="700">× T</text>

  <!-- Input/output -->
  <rect x="310" y="22"  width="120" height="28" rx="5" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="370" y="40"  text-anchor="middle" font-size="10" fill="#1e3a5f">Input embeddings</text>
  <line x1="370" y1="50" x2="370" y2="64" stroke="#6b7280" stroke-width="1.5" marker-end="url(#al)"/>
  <line x1="370" y1="128" x2="370" y2="148" stroke="#6b7280" stroke-width="1.5" marker-end="url(#al)"/>
  <rect x="310" y="150" width="120" height="28" rx="5" fill="#fef3c7" stroke="#d97706"/>
  <text x="370" y="168" text-anchor="middle" font-size="10" fill="#78350f">Output (after T loops)</text>
  <text x="370" y="200" text-anchor="middle" font-size="9" fill="#059669">1 × params_per_block</text>
  <text x="370" y="214" text-anchor="middle" font-size="9" fill="#059669">T-fold reduction in params!</text>

  <!-- Variable T box -->
  <rect x="20" y="238" width="480" height="18" rx="6" fill="#ecfdf5" stroke="#059669"/>
  <text x="260" y="251" text-anchor="middle" font-size="9" fill="#065f46" font-weight="600">At inference: vary T to trade speed vs. quality. Hard problems get more loops; easy ones get fewer.</text>
</svg>
<figcaption>Figure 1: Standard Transformers have N independent blocks; Looped Transformers run one shared block T times. Same compute depth, fraction of the parameters.</figcaption>
</figure>
</div>

## Adaptive Computation: Think Harder When Needed

A key advantage: **the number of loops T can be varied at inference time**.

- Easy question → 2 loops → fast answer.
- Hard math problem → 20 loops → slow but accurate.

This connects to a broader idea called **inference-time scaling** or **test-time compute**: models that can spend more compute on harder examples. This is the idea behind OpenAI's o1/o3 and DeepSeek R1.

<div class="insight-box">
<strong>Key insight:</strong> "Chain of thought" reasoning (generating intermediate steps before answering) is one form of spending more tokens on hard problems. Looped Transformers provide a complementary mechanism: more processing passes at the embedding level before any token is generated.
</div>

## Related Ideas

| Model / Idea | How they loop |
|---|---|
| **Universal Transformer** (Dehghani 2018) | Weight-tied layers with adaptive halting per position |
| **Albert** | Weight-tied encoder layers (parameter efficiency, not computation) |
| **Mixture of Experts (MoE)** | Different experts per token but shared routing — related |
| **Diffusion LMs** | Iteratively refine the output sequence |
| **o1 / o3 / R1** | Generate a long chain-of-thought "scratchpad" before answering |

## Limitations

- Training deeper "looped" networks can be harder — gradients must flow through many applications of the same block.
- Harder to specialise different layers for different types of representations (early layers vs. late layers in standard Transformers learn qualitatively different things).
- Varying T at inference creates deployment complexity.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Looped Transformers apply one <strong>weight-tied block T times</strong>, mimicking depth without proportional parameters.</li>
  <li>T can be varied at inference: more loops = more compute = better answers for hard problems.</li>
  <li>Connects to <strong>inference-time scaling</strong> — the key idea behind reasoning models like o1 and R1.</li>
  <li>Trade-off: harder to train, may lack the specialisation benefits of independent layer weights.</li>
</ul>
</div>
