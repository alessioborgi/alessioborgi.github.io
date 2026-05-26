---
layout: single
title: "Query, Key, Value: The Intuition Behind QKV"
date: 2024-03-02
categories: [transformers]
book: transformers
subsection: core
tags: [attention, QKV, intuition, beginner]
excerpt: "Q, K, and V are not arbitrary labels. They map precisely onto search queries, database labels, and retrieved content — a framework you already understand."
author_profile: true
read_time: true
is_overview: false
icon: "🔍"
read_mins: 4
permalink: /blog/transformers/qkv-intuition/
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
.analogy-box {
  background: #f0fdf4;
  border-left: 4px solid #16a34a;
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
.insight-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1.25rem 0;
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Q (query) is what you're looking for. K (key) is what each token advertises about itself. V (value) is the information that gets retrieved when a match is found. Together they implement a soft, differentiable information lookup.
</div>
{% include figure image_path="/images/blog/transformers/vaswani2017_multi_head_attention.png" alt="Query Key Value attention" caption="Query, Key, Value projections in Multi-Head Attention (Vaswani et al., 2017)" %}


## The Analogy: A Smart Library

Imagine walking into a library with a question: *"I want something about neural networks."*

- **Query (Q):** your question — what you're searching for
- **Key (K):** the labels on every book's spine — what each book is *about*
- **Value (V):** the actual content of each book — what you retrieve when you pick one up

You compare your question (Q) against every spine label (K). The closer the match, the more of that book's content (V) you retrieve. If three books are slightly relevant and one is very relevant, you blend them proportionally.

This is exactly what attention does — but over tokens in a sequence, and with vectors instead of text labels.

## In Transformer Notation

Each token in the input sequence gets three vector representations learned by the model:

<div class="math-box">
Q = X · Wᵩ &nbsp;&nbsp;&nbsp; K = X · W_K &nbsp;&nbsp;&nbsp; V = X · W_V
</div>

Where X is the token representation and W_Q, W_K, W_V are learned weight matrices. The model learns what to advertise (K), what to ask for (Q), and what to share (V) — and these can be different projections of the same token.

## A Token's Three Faces

Consider the word **"bank"** in the sentence *"The bank approved the loan."*

When **"bank"** is being asked about (as a **key**):
- It advertises: *I'm a financial institution*

When **"bank"** is asking questions (as a **query**):
- It might ask: *What other financial terms are nearby?*

When **"bank"** contributes information (as a **value**):
- It provides: *its full contextual representation*, to be mixed into other tokens' outputs

A single token plays all three roles simultaneously — as a key for others querying it, as a query seeking information from others, and as a value supplying its content when called.

## Why Not Just Use One Matrix?

A natural question: why not compute similarity directly between token representations, without Q, K, V projections?

Two reasons:

**1. Asymmetry.** The question you ask (Q) and the label you advertise (K) can be different things. The word "bank" might advertise its financial meaning but query for loan-related terms. A single representation forces them to be the same — which is too restrictive.

**2. Information compression.** The value (V) can be a different, richer projection than the key (K). Keys are optimised for matching; values are optimised for being informative. Separating them lets the model decouple *finding* information from *extracting* it.

<div class="insight-box">
<strong>Key insight:</strong> Q and K are both in the same "matching space" (so their dot product is meaningful). V lives in a different "content space" (what actually gets mixed into the output). These are distinct roles, and the model learns each separately.
</div>

{% include figure image_path="/images/blog/transformers/vaswani2017_scaled_dot_product.png" alt="Scaled dot-product attention as lookup over Q, K, V" caption="Q and K decide the lookup weights; V provides the content that gets mixed into the output (Vaswani et al., 2017)." %}

## The Most Common Beginner Confusion

A lot of people think V is just "K later in the pipeline." It is not. K is optimized to be matched against queries; V is optimized to carry useful information once a match has been found.

## The Full Attention Computation Step by Step

Given a single query token and a sequence of key-value pairs:

1. **Match:** compute q · kᵢ for every token i → raw similarity scores
2. **Scale:** divide by √d_k → prevent softmax saturation
3. **Normalise:** softmax → convert scores to a probability distribution (attention weights)
4. **Retrieve:** weighted sum of values → the output for this query token

<div class="math-box">
output = Σᵢ softmax( q · kᵢ / √d_k ) · vᵢ
</div>

The result is a blend of all value vectors, weighted by how much each token's key matched the query. Tokens with high relevance contribute more; irrelevant tokens contribute near zero.

## The Analogy Revisited: A Database

| Database concept | Attention equivalent |
|-----------------|---------------------|
| Search query | Query vector **q** |
| Index keys | Key vectors **k₁…kₙ** |
| Retrieved records | Value vectors **v₁…vₙ** |
| Exact match (hard) | Argmax over scores |
| Fuzzy match (soft) | Softmax-weighted blend |

Classic databases return one result (hard lookup). Attention returns a differentiable weighted blend — which means gradients can flow through it and the whole system can be trained end-to-end.

## Summary

| Symbol | What it is | What it does |
|--------|-----------|-------------|
| **Q** | Query | What this token is looking for |
| **K** | Key | What each token advertises it contains |
| **V** | Value | What each token contributes when selected |
| **QKᵀ** | Similarity | How well query matches each key |
| **Softmax** | Normalisation | Converts similarities to weights |
| **Weighted V** | Output | Blend of values, weighted by attention |

QKV is a learned, differentiable, soft database lookup. Once you see it this way, the rest of the Transformer follows naturally.

## References

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017* (source of the QKV formulation: W_Q, W_K, W_V projection matrices for scaled dot-product attention).
- Elhage, N., Nanda, N., Olsson, C., Henighan, T., et al. (2021). [A Mathematical Framework for Transformer Circuits](https://transformer-circuits.pub/2021/framework/index.html). *Anthropic 2021* (mechanistic interpretability analysis of how QKV matrices implement composition and information routing in Transformers).
