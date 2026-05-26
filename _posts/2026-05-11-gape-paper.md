---
layout: single
title: "GAPE: Remember to Forget — Gated Adaptive Positional Encoding"
date: 2026-05-26
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
.blog-figure img { width: min(100%, 780px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .6rem; font-style: italic; }
.paper-preview img { width: min(100%, 620px); }
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
.paper-insight {
  margin: 1.25rem 0;
  padding: 1rem 1.15rem;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: linear-gradient(145deg, #f8fbff, #eef6ff);
}
.paper-insight h3 {
  margin: 0 0 0.45rem;
  color: #0f2a36;
  font-size: 1rem;
}
.paper-insight p {
  margin: 0;
  color: #334155;
  font-size: 0.95rem;
}
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
  &nbsp;·&nbsp;
  <a href="/publications/2026-05-11-gape/">🔗 Publication page</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/gape-paper.png" alt="First page of the GAPE paper" caption="Paper preview — Remember to Forget: Gated Adaptive Positional Encoding (Ali et al., 2026)." %}
</div>

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

<div class="paper-insight">
  <h3>Figure 1 — Mechanism Overview</h3>
  <p>GAPE adds a factored logit bias after the rotary dot-product. The query gate contracts irrelevant long-range context, while the key gate protects salient distant tokens. The important design choice is that RoPE itself is left untouched: geometry stays positional, gating stays content-aware.</p>
</div>

## Theoretical Guarantee

The paper proves that protected tokens (high *g_k* value) remain accessible regardless of distance — their effective attention logit is boosted by the key gate, counteracting any rotary-induced suppression. Conversely, for unprotected tokens, the attention mass decays as a function of the query gate value, giving a formal "forgetting" property for irrelevant context.

## Empirical Validation

### NIAH: Needle-in-a-Haystack Retrieval

The Needle-in-a-Haystack (NIAH) benchmark places a critical fact (the "needle") at various positions in a long context and asks the model to retrieve it. GAPE consistently places sharper attention on the needle token at all context lengths and needle positions, even at 4× training context length.

<div class="paper-insight">
  <h3>Figure 2 — NIAH Retrieval</h3>
  <p>On Needle-in-a-Haystack retrieval, the paper shows that GAPE keeps recall high at 1×, 2×, and 4× training context. The RoPE baseline progressively loses the needle as the context grows, while GAPE keeps the attention mass anchored on the relevant token.</p>
</div>

### Attention Sharpness

The key gate's mechanistic effect is visible directly in the attention maps: GAPE produces sharper, more focused attention patterns compared to the vanilla RoPE baseline.

<div class="paper-insight">
  <h3>Figure 3 — Attention Sharpness</h3>
  <p>The mechanistic attention maps are the clearest intuition for the method: vanilla RoPE diffuses attention across the haystack at long range, whereas GAPE sharpens it and keeps the model focused on the useful distant token instead of spreading mass over distractors.</p>
</div>

### OOD Perplexity

<div class="paper-insight">
  <h3>Figure 4 — OOD Perplexity</h3>
  <p>As context extends beyond the training window, GAPE shows slower perplexity growth than RoPE. That result matters because it says the gain is not just a benchmark trick: the model remains more stable under the exact distribution shift that long-context inference creates.</p>
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
