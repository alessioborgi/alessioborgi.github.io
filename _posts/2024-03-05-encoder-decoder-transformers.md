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
{% include figure image_path="/images/blog/transformers/slides/slide-43-encoder-decoder.png" alt="Slide showing the full encoder-decoder architecture" caption="From the lecture slides: the encoder-decoder pattern separates full-input encoding from autoregressive decoding, with cross-attention connecting the two streams. Source: Simone Scardapane, Transformer models lecture, 2023." %}

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
