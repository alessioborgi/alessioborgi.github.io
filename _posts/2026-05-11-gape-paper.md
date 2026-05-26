---
layout: single
title: "GAPE: Remember to Forget — Gated Adaptive Positional Encoding"
date: 2026-05-11
categories: [research]
book: transformers
subsection: positional-encodings
tags: [positional-encoding, rope, long-context, attention, transformers]
excerpt: "GAPE is a drop-in RoPE augmentation that adds content-aware attention logit biases: a query-gate suppresses irrelevant distant context while a key-gate preserves salient distant tokens. Provably sharper attention and improved long-context robustness — no architecture changes needed."
author_profile: true
read_time: true
icon: "🔑"
read_mins: 8
permalink: /blog/transformers/gape-paper/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { max-width: 100%; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .6rem; font-style: italic; }
.tldr-box {
  background: linear-gradient(145deg,#e8fbfb,#dbeafe);
  border-left: 4px solid #0d9488;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
}
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
.key-takeaways {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-top: 1.5rem;
}
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> RoPE breaks when sequences extend beyond the training window — rotary phases go out-of-distribution, causing spurious long-range alignments and attention diffusion. GAPE adds a content-aware logit bias with two learned gates (query-gate contracts irrelevant context; key-gate protects important distant tokens) without touching the rotary geometry. Drop-in, no fine-tuning needed, provably sharper attention.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Remember to Forget: Gated Adaptive Positional Encoding" &nbsp;·&nbsp; arXiv:2605.10414<br>
  <strong>Authors:</strong> R. Ali, <em>A. Borgi</em>, C. Irwin, M. Severino, P. Liò<br>
  <strong>Venue:</strong> arXiv preprint, 2026 &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2605.10414" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

{% include figure image_path="/images/blog/papers/gape-paper.png" alt="First page of the GAPE paper" caption="Paper preview — Remember to Forget: Gated Adaptive Positional Encoding (Ali et al., 2026)." %}

## The RoPE Long-Context Problem

**Rotary Positional Encoding (RoPE)** is the positional scheme used in almost every modern LLM — LLaMA, Mistral, Gemma, Qwen. It encodes position by rotating query and key vectors in frequency-specific planes, so the dot-product between a query at position *m* and a key at position *n* depends only on their relative distance *m−n*.

This works beautifully within the training range. But when you extend context beyond what the model saw during training:

- Rotary phases at large relative distances enter **out-of-distribution regimes** — the model has never seen those angular configurations.
- Attention becomes **diffuse**: scores spread across irrelevant distant tokens rather than concentrating on relevant ones.
- **Spurious long-range alignments** emerge: distant tokens with "accidentally" matching OOD rotary phases receive high attention.

Existing fixes (RoPE scaling, YaRN, LONGROPE) mostly rescale frequencies to handle longer ranges, but they trade local positional resolution for global stability. None target the *content* mismatch between relevant and irrelevant distant tokens.

## The Key Observation

RoPE failures at long context are not only positional. They are *selective-attention* failures. The model does not simply lose all distant information; it loses the ability to distinguish useful distant tokens from distracting distant tokens. GAPE targets exactly that failure mode by modifying the logits with content-aware gates rather than reparameterising the rotary angles themselves.

## GAPE: Two Gates on the Logits

GAPE introduces a **content-aware additive bias** directly into the pre-softmax attention logits, *after* the rotary dot-product is computed:

$$a_{mn} = \frac{q_m^\top k_n}{\sqrt{d}} + \underbrace{g_q(q_m) \cdot g_k(k_n)}_{\text{GAPE bias}}$$

The two gates are:

- **Query gate** *g_q(q_m)*: a scalar function of the query vector. Learns to output a *negative* value for queries that are "looking for something specific" — this contracts the attention mass assigned to distant, unprotected tokens.
- **Key gate** *g_k(k_n)*: a scalar function of the key vector. Learns to output a *positive* value for keys that carry salient content — this *protects* important distant tokens from being suppressed.

The decoupling is critical: the query gate controls *forgetting* (global distance-based suppression), while the key gate controls *remembering* (token-specific survival). The rotary geometry is untouched.

## Why the Factorisation Matters

If the bias were only query-dependent, the model could suppress distance but would have no mechanism to rescue rare important tokens. If it were only key-dependent, salient keys could be marked, but irrelevant long-range attention would still remain too diffuse. The product structure gives both effects at once: broad contraction plus selective preservation.

<div class="blog-figure">
<figure>
<img src="https://arxiv.org/html/2605.10414/2605.10414v1/x1.png" alt="GAPE mechanism: content-aware attention logit bias separating contraction from token survival">
<figcaption>Figure 1 — GAPE adds a factored logit bias after the rotary dot-product. The query gate (left path) suppresses irrelevant long-range context; the key gate (right path) preserves salient distant tokens. The rotary geometry remains unchanged.</figcaption>
</figure>
</div>

## Theoretical Guarantee

The paper proves that protected tokens (high *g_k* value) remain accessible regardless of distance — their effective attention logit is boosted by the key gate, counteracting any rotary-induced suppression. Conversely, for unprotected tokens, the attention mass decays as a function of the query gate value, giving a formal "forgetting" property for irrelevant context.

## Empirical Validation

### NIAH: Needle-in-a-Haystack Retrieval

The Needle-in-a-Haystack (NIAH) benchmark places a critical fact (the "needle") at various positions in a long context and asks the model to retrieve it. GAPE consistently places sharper attention on the needle token at all context lengths and needle positions, even at 4× training context length.

<div class="blog-figure">
<figure>
<img src="https://arxiv.org/html/2605.10414/2605.10414v1/x2.png" alt="NIAH retrieval: needle near vs. far, 1x/2x/4x context">
<figcaption>Figure 2 — NIAH retrieval scores at 1×, 2×, and 4× training context. GAPE (blue) maintains high recall at all context extensions; the RoPE baseline (orange) degrades significantly at 2× and collapses at 4×.</figcaption>
</figure>
</div>

### Attention Sharpness

The key gate's mechanistic effect is visible directly in the attention maps: GAPE produces sharper, more focused attention patterns compared to the vanilla RoPE baseline.

<div class="blog-figure">
<figure>
<img src="https://arxiv.org/html/2605.10414/2605.10414v1/x3.png" alt="Mechanistic behavior of GAPE gates in NIAH task">
<figcaption>Figure 3 — Attention maps on the NIAH task. With GAPE (right), attention concentrates tightly on the needle token; without GAPE (left), attention diffuses across the haystack at long ranges.</figcaption>
</figure>
</div>

### OOD Perplexity

<div class="blog-figure">
<figure>
<img src="https://arxiv.org/html/2605.10414/2605.10414v1/x4.png" alt="OOD perplexity under context extension">
<figcaption>Figure 4 — Perplexity as context length increases beyond the training window. GAPE (blue) shows slower perplexity growth compared to the RoPE baseline, confirming improved out-of-distribution robustness for language modelling.</figcaption>
</figure>
</div>

## Practical Interpretation

The cleanest way to think about GAPE is as an attention sharpener for long context. RoPE still provides the positional geometry. GAPE then decides, token by token, whether long-range attention should be damped or protected. That makes it a pragmatic drop-in modification rather than a replacement for the whole positional encoding stack.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>GAPE adds a factored content-aware logit bias — query-gate × key-gate — that decouples "forgetting irrelevant context" from "protecting salient distant tokens".</li>
  <li>The rotary geometry of RoPE is completely preserved; GAPE is a drop-in augmentation requiring no architectural changes.</li>
  <li>Formal guarantee: protected tokens (high key-gate) remain accessible; unprotected distant tokens' attention mass decays with the query gate.</li>
  <li>Empirical gains on NIAH retrieval and long-context benchmarks at 1×, 2×, and 4× training context.</li>
</ul>
</div>
