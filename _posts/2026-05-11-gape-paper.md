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
.blog-figure--compact { max-width: 620px; margin-left: auto; margin-right: auto; }
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

GAPE introduces a **content-aware additive mask** directly into the pre-softmax attention logits. In the paper notation, the attention logit is written as

$$a_{i,j} = \frac{1}{\sqrt{d}} \mathbf{q}_i^\top R_\Theta(i-j)\mathbf{k}_j + M_{i,j}$$

with GAPE mask

$$M_{i,j} = \Gamma_h g_i \left(\frac{j(1-l_j)}{T} + \frac{i\,l_j}{T}\right).$$

The routing variables are defined in the paper as:

- **Landmark gate**: $l_j = \sigma(\mathbf{w}_l^\top \mathbf{k}_j + b_l)$
- **Query gate**: $g_i = \operatorname{Softplus}(\mathbf{w}_g^\top \mathbf{q}_i + b_g)$
- **Head amplitude**: $\Gamma_h = \operatorname{Softplus}(\gamma_h)$

This is the key decoupling: $g_i$ controls how strongly query $i$ suppresses unprotected distant context, while $l_j$ marks key $j$ as a landmark that should be protected from that suppression. RoPE’s rotary geometry remains untouched because the structural intervention enters additively through $M_{i,j}$ rather than by changing the rotations themselves.

## Why the Factorisation Matters

If the bias were only query-dependent, the model could suppress distance but would have no mechanism to rescue rare important tokens. If it were only key-dependent, salient keys could be marked, but irrelevant long-range attention would still remain too diffuse. The product structure gives both effects at once: broad contraction plus selective preservation.

<div class="blog-figure">
<figure>
<img src="/images/blog/papers/gape-mechanism.png" alt="GAPE mechanism showing query-gate controlled mask strength and protected landmark tokens">
<figcaption>Figure 1 — The core GAPE mechanism is easiest to read as a selective context controller. Larger query-gate values shrink the effective usable context by pushing down unprotected distant tokens, while protected landmarks remain recoverable through the key-side protection term. The key design choice is visible directly in the figure: RoPE’s geometry is untouched, and the intervention happens only through a learned content-aware logit mask.</figcaption>
</figure>
</div>

## Theoretical Guarantee

The paper proves that protected tokens (high *g_k* value) remain accessible regardless of distance — their effective attention logit is boosted by the key gate, counteracting any rotary-induced suppression. Conversely, for unprotected tokens, the attention mass decays as a function of the query gate value, giving a formal "forgetting" property for irrelevant context.

## Empirical Validation

### NIAH: Needle-in-a-Haystack Retrieval

The Needle-in-a-Haystack (NIAH) benchmark places a critical fact (the "needle") at various positions in a long context and asks the model to retrieve it. GAPE consistently places sharper attention on the needle token at all context lengths and needle positions, even at 4× training context length.

<div class="blog-figure">
<figure>
<img src="/images/blog/papers/gape-needle-close-entropy.png" alt="Attention entropy for close-needle retrieval across context lengths with and without GAPE">
<figcaption>Figure 2 — When the needle is relatively close, GAPE already lowers average attention entropy for the strongest positional schemes. Lower entropy here means attention is less diffuse and more concentrated on the relevant evidence, which is exactly the behaviour you want even before the retrieval task becomes maximally hard.</figcaption>
</figure>
</div>

<div class="blog-figure">
<figure>
<img src="/images/blog/papers/gape-needle-far-entropy.png" alt="Attention entropy for far-needle retrieval across context lengths with and without GAPE">
<figcaption>Figure 3 — The gap becomes more meaningful when the needle is far away. As context length grows, the GAPE variants keep entropy systematically lower than their ungated counterparts, showing that the method is not merely preserving long-range access in theory: it is actively preventing attention from diffusing across distractors in the hard retrieval regime.</figcaption>
</figure>
</div>

### Attention Sharpness

The key gate's mechanistic effect is visible directly in the attention maps: GAPE produces sharper, more focused attention patterns compared to the vanilla RoPE baseline.

<div class="blog-figure">
<figure>
<img src="/images/blog/papers/gape-mask-layer5-pos.png" alt="Mask strength over positions at layer 5 for different attention heads in GAPE">
<figcaption>Figure 4 — This layer-5 positional mask plot shows that the heads do not all behave the same way. Some learn aggressively contracting masks, others remain permissive, and a few protect selected regions. That diversity matters: GAPE is not imposing one fixed long-context bias, it is giving each head a way to specialise its own notion of what should be forgotten and what should survive.</figcaption>
</figure>
</div>

### Gate Dynamics During Training

This part matters because GAPE is only useful if the gates learn a nontrivial routing policy rather than collapsing to a constant bias. The training dynamics show exactly that they do not collapse. Different heads and different layers settle into different regimes: some become strong suppressors of irrelevant background context, some remain relatively permissive, and some specialise in preserving a narrower set of salient positions.

In other words, the model is not learning one global "forget more" knob. It is learning a structured allocation of filtering behaviour across the attention stack. That is a much stronger result, because it suggests GAPE is expressive enough to adapt to the role of each head rather than merely acting as a blunt long-context penalty.

<div class="blog-figure">
<figure>
<img src="/images/blog/papers/gape-g-evolution.png" alt="Evolution of GAPE mask values by attention head across layers and training steps">
<figcaption>Figure 5 — The gate evolution curves make the learning dynamics concrete. Useful heads rapidly develop strong mask values and then stabilise, while others remain weak or specialised. In practice this means the model discovers which heads should act as strong context filters rather than requiring that behaviour to be hard-coded.</figcaption>
</figure>
</div>

The next question is whether those learned gates actually change attention behaviour in the intended direction. The entropy plots answer that directly. If the gates are doing real work, attention should become sharper exactly in the layers where the model has learned stronger suppression of diffuse background context.

<div class="blog-figure blog-figure--compact">
<figure>
<img src="/images/blog/papers/gape-attention-entropy-by-layer.png" alt="Average attention entropy by layer comparing p-RoPE, RoPE, and p-RoPE with GAPE">
<figcaption>Figure 6 — Layer-wise entropy confirms the same story from a different angle: adding GAPE to positional schemes yields more concentrated attention in the middle and deeper layers, where long-context selection pressure is strongest. The gain is not uniform, which is precisely why a learned gating mechanism is useful: different layers need different amounts of forgetting.</figcaption>
</figure>
</div>

What makes the section convincing is the consistency between the mechanism variables and the downstream statistics. The learned gate magnitude is not floating independently of the attention maps; it tracks the same contraction effect that shows up in entropy. That is the kind of alignment you want from a mechanistic intervention: one variable that is interpretable, trainable, and visibly tied to the claimed behaviour.

<div class="blog-figure blog-figure--compact">
<figure>
<img src="/images/blog/papers/gape-g-and-entropy-by-layer.png" alt="Average gate magnitude and average attention entropy by layer in GAPE">
<figcaption>Figure 7 — This summary plot links the mechanism to the outcome. Layers with stronger average gating tend to be the layers where entropy is driven down the most, tying the learned gate magnitude directly to sharper attention. It is a compact sanity check that the gate is not just present, but causally aligned with the behaviour the paper claims.</figcaption>
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
