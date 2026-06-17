---
layout: single
title: "Encoder vs Decoder vs Encoder-Decoder Transformers"
date: 2026-05-26
categories: [transformers]
book: transformers
subsection: core
tags: [BERT, GPT, T5, encoder, decoder, architecture]
excerpt: "BERT, GPT, and T5 are all Transformers — but their architectures are fundamentally different. One comparison table clarifies the entire landscape."
author_profile: true
read_time: true
is_overview: false
icon: "🏛️"
read_mins: 5
permalink: /blog/transformers/encoder-decoder-architectures/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.page__content .encoder-decoder-figure img { max-width: 320px; }
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
.arch-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.4rem;
  margin: 1.25rem 0;
  font-family: monospace;
  font-size: 0.9rem;
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Encoder-only models (BERT) read everything bidirectionally — great for understanding. Decoder-only models (GPT) generate left-to-right — great for generation. Encoder-decoder models (T5) encode the input fully, then generate the output — great for transformation tasks like translation and summarisation.
</div>
<div class="encoder-decoder-figure">
{% include figure image_path="/images/blog/transformers/vaswani2017_transformer_architecture.png" alt="Original Transformer encoder-decoder architecture from Attention Is All You Need" caption="The original Transformer diagram is still the clearest high-level view of the encoder-decoder design: the encoder builds a full representation of the input, while the decoder combines masked self-attention with cross-attention to generate the output autoregressively. Source: [1]." %}
</div>

<div class="insight-box">
<strong>Rule of thumb:</strong> encoder-only models are best at understanding, decoder-only at generating, encoder-decoder at transforming one sequence into another.
</div>


## The Three Families

The original 2017 Transformer ("Attention Is All You Need") was an encoder-decoder. The field then diverged into three distinct families, each optimised for different tasks.

## 1. Encoder-Only: BERT-style

<div class="arch-block">
Input → [Encoder Block × N] → Contextual representations
</div>

Each encoder block contains:
- **Bidirectional self-attention** (every token sees every other token)
- Feed-forward network
- Layer norm + residual connections

**Training objective:** Masked Language Modelling (MLM). Random tokens in the input are replaced with [MASK], and the model predicts them. Because the answer is already in the sequence (just hidden), the model can attend bidirectionally.

**What this is good at:**
- Sentence classification (spam detection, sentiment)
- Token classification (NER, POS tagging)
- Question answering (span extraction)
- Sentence embeddings (semantic search)

**What this cannot do:** autoregressive generation. Generating token N+1 requires seeing token N+1 (bidirectional), which is circular during inference.

**Examples:** BERT, RoBERTa, DeBERTa, ALBERT, ModernBERT.

## 2. Decoder-Only: GPT-style

<div class="arch-block">
Input → [Decoder Block × N] → Next-token probabilities
</div>

Each decoder block contains:
- **Causal (masked) self-attention** (each token sees only past tokens)
- Feed-forward network
- Layer norm + residual connections

Note: there is no cross-attention in decoder-only models. Each decoder block has only two sub-layers (not three), because there is no encoder output to attend to.

**Training objective:** Next-token prediction. Given tokens 1…N, predict token N+1. The causal mask ensures no peeking.

**What this is good at:**
- Text generation (stories, code, completions)
- In-context learning (few-shot prompting)
- Instruction following (with RLHF/fine-tuning)
- Anything you can frame as completion

**What this is less natural for:** tasks that require reading the full input before producing an output (e.g., translation, summarisation) — though modern large decoder-only models handle these with prompting anyway.

**Examples:** GPT-2, GPT-3, GPT-4, LLaMA, Mistral, Gemma, Claude.

<div class="insight-box">
<strong>Why did decoder-only win?</strong> Scale. Decoder-only models are simpler to scale (one attention type, no encoder-decoder interaction), and next-token prediction is a perfect self-supervised objective on any text. As scale increased, emergent capabilities made them competitive on understanding tasks too.
</div>

## 3. Encoder-Decoder: T5-style

<div class="arch-block">
Input → [Encoder Block × N] → Latent
                                  ↓
               Prompt → [Decoder Block × M] → Generated output
</div>

The encoder processes the full input bidirectionally. The decoder generates the output token by token, using:
- **Causal self-attention** (on its own generated tokens so far)
- **Cross-attention** (queries the encoder's output at each step)
- Feed-forward network

**Training objective:** Span corruption (T5) or similar sequence-to-sequence objectives.

**What this is good at:**
- Machine translation (full input available, output generated)
- Summarisation (read document, write summary)
- Question answering with generation (read context, write answer)
- Any task naturally framed as input → output transformation

**Examples:** T5, BART, mT5, Flan-T5, NLLB (translation).

## Side-by-Side Comparison

| Property | Encoder-only | Decoder-only | Encoder-Decoder |
|----------|-------------|-------------|-----------------|
| Self-attention type | Bidirectional | Causal | Both |
| Cross-attention | None | None | Decoder → Encoder |
| Reads input | Fully, in parallel | Autoregressively | Fully (encoder) |
| Generates output | No (fixed-length) | Autoregressively | Autoregressively |
| Training objective | MLM, NSP | Next-token prediction | Seq2seq |
| Good for | Understanding | Generation | Transformation |
| Examples | BERT, DeBERTa | GPT, LLaMA, Claude | T5, BART, Flan-T5 |

## The Attention Mask Differences

```
Encoder self-attention (bidirectional):
✓ ✓ ✓ ✓
✓ ✓ ✓ ✓
✓ ✓ ✓ ✓
✓ ✓ ✓ ✓

Decoder self-attention (causal):
✓ ✗ ✗ ✗
✓ ✓ ✗ ✗
✓ ✓ ✓ ✗
✓ ✓ ✓ ✓

Decoder cross-attention (full encoder access):
✓ ✓ ✓ ✓   ← decoder pos 1 attends to all encoder positions
✓ ✓ ✓ ✓   ← decoder pos 2 attends to all encoder positions
```

The mask tells the whole story. Encoder: open. Decoder: lower triangular. Cross-attention: open to the encoder.

<div class="blog-figure">
<figure>
<style>
@keyframes enc-fill { 0%,15%{opacity:0} 30%,100%{opacity:1} }
@keyframes dec-fill { 0%,40%{opacity:0} 60%,100%{opacity:1} }
@keyframes cross-fill { 0%,65%{opacity:0} 85%,100%{opacity:1} }
</style>
<svg viewBox="0 0 760 260" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <!-- Encoder mask -->
  <text x="95" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#0d9488">Encoder (bidirectional)</text>
  <g>
    <rect x="28" y="30" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.0s"/>
    <rect x="58" y="30" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.1s"/>
    <rect x="88" y="30" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.2s"/>
    <rect x="118" y="30" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="28" y="60" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.1s"/>
    <rect x="58" y="60" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.2s"/>
    <rect x="88" y="60" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="118" y="60" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.4s"/>
    <rect x="28" y="90" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.2s"/>
    <rect x="58" y="90" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="88" y="90" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.4s"/>
    <rect x="118" y="90" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.5s"/>
    <rect x="28" y="120" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="58" y="120" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.4s"/>
    <rect x="88" y="120" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.5s"/>
    <rect x="118" y="120" width="26" height="26" rx="4" fill="#0d9488" style="animation:enc-fill 2.4s ease forwards;animation-delay:0.6s"/>
  </g>
  <text x="95" y="175" text-anchor="middle" font-size="11" fill="#475569">every token sees every token</text>

  <!-- Decoder causal mask -->
  <text x="355" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#7c3aed">Decoder (causal)</text>
  <g>
    <rect x="288" y="30" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.0s"/>
    <rect x="318" y="30" width="26" height="26" rx="4" fill="#e5e7eb"/>
    <rect x="348" y="30" width="26" height="26" rx="4" fill="#e5e7eb"/>
    <rect x="378" y="30" width="26" height="26" rx="4" fill="#e5e7eb"/>
    <rect x="288" y="60" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.1s"/>
    <rect x="318" y="60" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.2s"/>
    <rect x="348" y="60" width="26" height="26" rx="4" fill="#e5e7eb"/>
    <rect x="378" y="60" width="26" height="26" rx="4" fill="#e5e7eb"/>
    <rect x="288" y="90" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.2s"/>
    <rect x="318" y="90" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="348" y="90" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.4s"/>
    <rect x="378" y="90" width="26" height="26" rx="4" fill="#e5e7eb"/>
    <rect x="288" y="120" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="318" y="120" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.4s"/>
    <rect x="348" y="120" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.5s"/>
    <rect x="378" y="120" width="26" height="26" rx="4" fill="#7c3aed" style="animation:dec-fill 2.4s ease forwards;animation-delay:0.6s"/>
  </g>
  <text x="355" y="175" text-anchor="middle" font-size="11" fill="#475569">lower triangular — no peeking forward</text>

  <!-- Cross-attention -->
  <text x="620" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#ea580c">Cross-attention</text>
  <g>
    <rect x="548" y="42" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.0s"/>
    <rect x="578" y="42" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.1s"/>
    <rect x="608" y="42" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.2s"/>
    <rect x="638" y="42" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="548" y="72" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.1s"/>
    <rect x="578" y="72" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.2s"/>
    <rect x="608" y="72" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="638" y="72" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.4s"/>
    <rect x="548" y="102" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.2s"/>
    <rect x="578" y="102" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.3s"/>
    <rect x="608" y="102" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.4s"/>
    <rect x="638" y="102" width="26" height="26" rx="4" fill="#ea580c" style="animation:cross-fill 2.4s ease forwards;animation-delay:0.5s"/>
  </g>
  <text x="524" y="142" text-anchor="start" font-size="10" fill="#475569">← dec pos 1</text>
  <text x="524" y="158" text-anchor="start" font-size="10" fill="#475569">← dec pos 2</text>
  <text x="524" y="174" text-anchor="start" font-size="10" fill="#475569">← dec pos 3</text>
  <text x="524" y="192" text-anchor="middle" font-size="0" fill="#fff"> </text>
  <text x="620" y="215" text-anchor="middle" font-size="11" fill="#475569">decoder rows, encoder columns — fully open</text>
</svg>
<figcaption>Animated attention masks for the three architecture families. Teal = encoder (all attend to all). Purple = decoder causal mask (lower triangular, filled left-to-right). Orange = cross-attention (every decoder position sees every encoder position).</figcaption>
</figure>
</div>

## Concrete Worked Example: Translating "The cat sat"

To make the three architectures concrete, consider translating "The cat sat" into French ("Le chat s'est assis").

**Encoder (reads input):**  
Tokens `[The, cat, sat]` enter simultaneously. At layer 1, `cat` attends to both `The` and `sat` — bidirectional context tells it this is a subject noun, not a verb. All positions are processed in parallel.

**Decoder step 1 (generates "Le"):**  
Input to decoder: `[<BOS>]`. Causal self-attention: only position 0 is visible. Cross-attention: `<BOS>` queries the encoder's full representation of `[The, cat, sat]` and retrieves a weighted mixture centred on "The". Output distribution peaks at "Le".

**Decoder step 2 (generates "chat"):**  
Input: `[<BOS>, Le]`. Causal self-attention: position 1 can see position 0 ("Le") but not future tokens. Cross-attention: "Le" queries the encoder and attends heavily to "cat". Output: "chat".

**Decoder step 3 (generates "s'est"):**  
Input: `[<BOS>, Le, chat]`. Cross-attention now attends to the verb "sat". Autoregressive chain continues until `<EOS>`.

This step-by-step shows why encoder-decoder wins for translation: the encoder reads all context before any generation begins, and cross-attention lets each decoder step query that full context freely.

## Summary

The three architectures are not better or worse in absolute terms — they are optimised for different settings:

- **Understanding a fixed input?** → Encoder-only
- **Generating open-ended text?** → Decoder-only
- **Transforming one sequence into another?** → Encoder-decoder

Modern LLMs (GPT-4, Claude, LLaMA) are decoder-only, using scale and prompting to cover all three use cases. But for specialised tasks with a clear input-output structure and limited compute, encoder-decoder models remain competitive.

## References

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017* (original encoder-decoder Transformer for machine translation).
- Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2018). [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805). *NAACL 2019* (BERT: the canonical encoder-only Transformer for classification and understanding tasks).
- Raffel, C., Shazeer, N., Roberts, A., Lee, K., Narang, S., Matena, M., Zhou, Y., Li, W., & Liu, P. J. (2020). [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://arxiv.org/abs/1910.10683). *JMLR 2020* (T5: unifies NLP tasks under a single encoder-decoder text-to-text format).
- Brown, T., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., et al. (2020). [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165). *NeurIPS 2020* (GPT-3: decoder-only architecture at 175B parameters demonstrating few-shot learning).
