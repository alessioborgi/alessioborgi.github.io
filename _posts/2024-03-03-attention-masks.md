---
layout: single
title: "Attention Masks: Causal, Padding, and Bidirectional"
date: 2024-03-03
categories: [transformers]
book: transformers
subsection: core
tags: [attention, masking, causal, BERT, GPT, padding]
excerpt: "The difference between GPT, BERT, and T5 is largely a masking decision. Learn how causal, padding, and bidirectional masks shape what each token is allowed to see."
author_profile: true
read_time: true
is_overview: false
icon: "🎭"
read_mins: 5
permalink: /blog/transformers/attention-masks/
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
  font-family: monospace;
  text-align: center;
}
pre.mask-grid {
  background: #1e293b;
  color: #94a3b8;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  font-size: 0.88rem;
  overflow-x: auto;
}
pre.mask-grid .attend { color: #4ade80; font-weight: bold; }
pre.mask-grid .block  { color: #f87171; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Attention masks control which pairs of tokens can attend to each other. Bidirectional masking (BERT) sees everything. Causal masking (GPT) sees only the past. Padding masks ignore filler tokens. The mask choice determines the model's fundamental capability.
</div>
{% include figure image_path="/images/blog/transformers/vaswani2017_multi_head_attention.png" alt="Masked attention" caption="Masked Multi-Head Attention in the Transformer decoder (Vaswani et al., 2017)" %}


## Why Masks Exist

Raw scaled dot-product attention lets every token attend to every other token. Sometimes that is exactly what you want. But often you need to restrict this:

- **Language modelling:** token 5 must not see token 6 — that would be cheating during training
- **Batching:** sentences padded to equal length should not attend to the padding
- **Encoder-decoder:** the decoder needs restricted attention but the encoder does not

Masks solve all of these. They are applied to the raw attention scores *before* softmax — typically by adding −∞ to masked positions, which softmax converts to 0 weight.

<div class="math-box">
masked_scores = scores + mask &nbsp;&nbsp; where mask[i,j] = 0 (attend) or −∞ (block)
</div>

<div class="insight-box">
<strong>Why masks matter so much:</strong> GPT, BERT, and T5 do not mainly differ in the attention equation. They differ in what that equation is allowed to see.
</div>

## 1. Bidirectional Mask (BERT-style)

A bidirectional mask places no restrictions. Every token can attend to every other token, including itself.

```
     The  cat  sat  on   the  mat
The  [ ✓   ✓    ✓    ✓    ✓    ✓ ]
cat  [ ✓   ✓    ✓    ✓    ✓    ✓ ]
sat  [ ✓   ✓    ✓    ✓    ✓    ✓ ]
on   [ ✓   ✓    ✓    ✓    ✓    ✓ ]
the  [ ✓   ✓    ✓    ✓    ✓    ✓ ]
mat  [ ✓   ✓    ✓    ✓    ✓    ✓ ]
```

Every cell is open. Each token's representation is built from the entire sequence simultaneously.

**Used by:** BERT, RoBERTa, DeBERTa, any encoder-only model.  
**Good for:** classification, NER, question answering — tasks where you read the whole input before deciding.  
**Cannot do:** autoregressive generation — you cannot generate token 6 if token 5 already sees token 6.

## 2. Causal Mask (GPT-style)

A causal (autoregressive) mask enforces that token i can only attend to tokens ≤ i. The future is blocked.

```
      The  cat  sat  on   the  mat
The  [ ✓   ✗    ✗    ✗    ✗    ✗ ]
cat  [ ✓   ✓    ✗    ✗    ✗    ✗ ]
sat  [ ✓   ✓    ✓    ✗    ✗    ✗ ]
on   [ ✓   ✓    ✓    ✓    ✗    ✗ ]
the  [ ✓   ✓    ✓    ✓    ✓    ✗ ]
mat  [ ✓   ✓    ✓    ✓    ✓    ✓ ]
```

The attention matrix is lower-triangular. The diagonal is always visible (self-attention). Everything above the diagonal is −∞.

**Used by:** GPT, GPT-2, GPT-3, GPT-4, LLaMA, Mistral, all decoder-only models.  
**Good for:** language generation — at each step, the model predicts the next token from all previous tokens.  
**Key property:** during training, all positions can be processed in parallel (the mask handles causality). During inference, tokens are generated one at a time.

<div class="insight-box">
<strong>Why causal masking enables parallel training:</strong> Without it, you would need to run the model N times to predict each token sequentially. With the causal mask, all N predictions happen in one forward pass — each row of the attention matrix uses only the visible positions.
</div>

## 3. Padding Mask

When batching sequences of different lengths, shorter sequences are padded to the maximum length in the batch. Padding tokens carry no meaningful information and should not influence attention.

```
Sentence A: "The cat sat" [PAD] [PAD]
Sentence B: "Go"          [PAD] [PAD] [PAD]
```

The padding mask blocks attention to [PAD] positions:

```
           The  cat  sat  PAD  PAD
The   [ ✓    ✓    ✓    ✗    ✗  ]
cat   [ ✓    ✓    ✓    ✗    ✗  ]
sat   [ ✓    ✓    ✓    ✗    ✗  ]
PAD   [ ✗    ✗    ✗    ✗    ✗  ]
PAD   [ ✗    ✗    ✗    ✗    ✗  ]
```

Padding masks are applied on top of whatever other mask is in use. A GPT model uses a causal mask AND a padding mask simultaneously.

## 4. Combining Masks

In practice, masks are combined additively. A decoder in an encoder-decoder model (like T5) uses:

- **Causal mask** on its own tokens (cannot look ahead)
- **No mask** on cross-attention to the encoder (can see the full encoded input)
- **Padding mask** on both (ignores padding in both sequences)

| Model | Self-attention | Cross-attention |
|-------|---------------|-----------------|
| BERT (encoder) | Bidirectional | — |
| GPT (decoder) | Causal | — |
| T5 encoder | Bidirectional | — |
| T5 decoder | Causal | Full (to encoder) |

## Implementation Detail

In PyTorch, attention masks are typically boolean or float tensors added to raw scores before softmax:

```python
# Causal mask for sequence length L
mask = torch.triu(torch.ones(L, L), diagonal=1).bool()
scores = scores.masked_fill(mask, float('-inf'))
attn_weights = torch.softmax(scores, dim=-1)
```

The `masked_fill` replaces masked positions with −∞. After softmax, those positions become exactly 0 — contributing nothing to the weighted value sum.

## Summary

| Mask type | Allows | Used for |
|-----------|--------|---------|
| Bidirectional | All positions | Encoding, understanding |
| Causal | Past + present only | Language generation |
| Padding | Non-pad positions only | Batch processing |
| Combined | Intersection of rules | Encoder-decoder models |

Attention masks are the simplest mechanism in the Transformer, but they define the entire generative capability of the architecture. Change the mask, change the model family.

## References

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017* (introduces causal masking in the decoder to enforce autoregressive generation).
- Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2018). [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805). *NAACL 2019* (BERT: encoder-only model using bidirectional (non-causal) attention with padding masks for variable-length inputs).
- Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., & Sutskever, I. (2019). [Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf). *OpenAI 2019* (GPT-2: decoder-only causal masking applied at scale for generative language modelling).
