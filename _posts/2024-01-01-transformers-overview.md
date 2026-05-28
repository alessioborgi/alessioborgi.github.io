---
layout: single
title: "Transformers: The Architecture That Changed AI"
date: 2026-05-26
categories: [transformers]
book: transformers
tags: [architecture, deep-learning, nlp]
excerpt: "A self-contained guide to the Transformer — the engine behind GPT, BERT, and modern AI. Learn how attention replaces recurrence and why every major AI system uses it."
author_profile: true
read_time: true
is_overview: true
icon: "🤖"
read_mins: 5
permalink: /blog/transformers/overview/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 700px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.blog-figure--compact img { width: min(100%, 500px); }
.blog-figure--tiny img { width: min(100%, 250px); }
.blog-figure--figure1 img {
  width: 350px;
}
.paper-preview img { width: min(100%, 430px); }
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
.next-posts {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-top: 1.2rem;
}
.next-posts h3 { margin-top: 0; font-size: 1rem; color: #374151; }
.next-posts ul { margin: 0; padding-left: 1.2rem; }
.next-posts li { margin-bottom: .3rem; font-size: .92rem; }
.insight-box {
  background: #fff7ed;
  border-left: 4px solid #f97316;
  border-radius: 8px;
  padding: .95rem 1.1rem;
  margin: 1.25rem 0;
}
.insight-box strong { color: #9a3412; }
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: .8rem;
  margin: 1.2rem 0 1.6rem;
}
.chapter-card {
  background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #dbe7f5;
  border-radius: 12px;
  padding: .95rem 1rem;
  box-shadow: 0 4px 16px rgba(15,42,54,.06);
}
.chapter-card h3 { margin: 0 0 .35rem; font-size: .98rem; color: #0f2a36; }
.chapter-card p { margin: 0; font-size: .9rem; color: #4b5563; line-height: 1.5; }
.roadmap-box {
  background: linear-gradient(160deg, #0f2a36 0%, #164e63 100%);
  color: #ecfeff;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  margin: 1.5rem 0;
}
.roadmap-box h3 { margin-top: 0; color: #99f6e4; font-size: 1rem; }
.roadmap-box ol { margin: 0; padding-left: 1.2rem; }
.roadmap-box li { margin-bottom: .45rem; }
.roadmap-box strong { color: #ffffff; font-weight: 800; }
.reference-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-top: 1.4rem;
}
.reference-box h3 { margin-top: 0; font-size: 1rem; color: #374151; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> The Transformer dropped sequential processing in favour of parallel attention over all tokens at once. This simple shift unlocked GPT, BERT, Whisper, AlphaFold, ViT — essentially all of modern AI.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Attention Is All You Need" &nbsp;·&nbsp; arXiv:1706.03762<br>
  <strong>Authors:</strong> A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, I. Polosukhin<br>
  <strong>Venue:</strong> NeurIPS 2017 &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/vaswani2017-paper.png" alt="First page of the Attention Is All You Need paper" caption="Paper preview — Attention Is All You Need (Vaswani et al., 2017)." %}
</div>

<div class="blog-figure blog-figure--tiny blog-figure--figure1">
<figure>
<img src="/images/blog/transformers/vaswani2017_transformer_architecture.png" alt="Original Transformer encoder-decoder architecture from Attention Is All You Need">
<figcaption>Figure 1 — The original Transformer diagram is still the best high-level map of the architecture: token embeddings and positional information enter stacked encoder and decoder blocks, while masked self-attention and cross-attention let generation stay autoregressive without losing access to the encoded source sequence. Source: [1].</figcaption>
</figure>
</div>

<div class="chapter-grid">
  <div class="chapter-card">
    <h3>Why it matters</h3>
    <p>Transformers are the common backbone behind LLMs, vision-language models, speech models, and a growing share of scientific AI.</p>
  </div>
  <div class="chapter-card">
    <h3>Core mechanism</h3>
    <p>Every token can directly inspect every other token through self-attention, instead of waiting for information to travel step by step.</p>
  </div>
  <div class="chapter-card">
    <h3>What to learn next</h3>
    <p>Attention, QKV, masking, residuals, and positional encodings are the five ideas that make the whole architecture click.</p>
  </div>
</div>

## The Problem with the Old Way

Before 2017, the go-to model for text was the **Recurrent Neural Network (RNN)**. It worked like a conveyor belt: read one word, update a hidden state, pass it to the next word. The trouble is that by the time you reach the end of a long sentence, the beginning is already fading — the network forgets.

This is the **vanishing gradient problem**: information from far-back positions barely influences the model. Researchers patched it with LSTMs and GRUs, but the fundamental bottleneck remained: you can't parallelise a sequential process. Training was slow, and long-range dependencies were hard to capture.

<div class="insight-box">
  <strong>The real bottleneck:</strong> older sequence models were not only harder to train. They also forced information to move through many intermediate steps, which is exactly the wrong bias when meaning depends on distant words, long documents, or multi-modal context.
</div>

## The Core Insight: Attend to Everything

The 2017 paper *Attention Is All You Need* (Vaswani et al.) asked: what if you let every word look directly at every other word, with no middle layers in between?

That's **self-attention**. Each token computes a score with every other token, learns which ones are relevant, and mixes their information together — in one parallel step. No sequential dependency. No forgetting.

<div class="blog-figure blog-figure--tiny blog-figure--figure1">
<figure>
<img src="/images/blog/transformers/vaswani2017_scaled_dot_product.png" alt="Scaled dot-product attention pipeline from Attention Is All You Need">
<figcaption>Figure 2 — Scaled dot-product attention is the core computation inside the Transformer: queries score keys, scaling keeps those scores numerically well behaved, softmax turns them into weights, and values are mixed accordingly. Source: [1].</figcaption>
</figure>
</div>

## The Big Picture in One Pass

If you strip away the implementation details, a Transformer does five things:

1. Turn tokens into vectors.
2. Inject position information, because attention alone is order-agnostic.
3. Let tokens exchange information via self-attention.
4. Stabilise deep training with residual connections and layer normalisation.
5. Refine each token independently with a feed-forward network.

That recipe is simple enough to reuse across domains, which is why the same core architecture reappears in language, vision, audio, biology, robotics, and multi-modal systems.

## Architecture Walk-Through

A Transformer encoder consists of these building blocks, stacked N times:

### 1. Token Embedding
Each word (or subword token) is mapped to a dense vector — a point in high-dimensional space where similar words land close together.

### 2. Positional Encoding
Because attention sees all tokens simultaneously, the model would otherwise have no idea which word comes first. Positional encodings inject position information into each token's vector before it enters the attention layers. (See the dedicated PE posts for all the variants.)

### 3. Multi-Head Self-Attention
This is the heart of the Transformer. Each token computes three vectors — a **Query** (what I'm looking for), a **Key** (what I offer), and a **Value** (what I'll contribute). The model computes pairwise relevance scores, normalises them with a softmax, then mixes the value vectors accordingly. Running this process in parallel across *h* heads lets the model capture different types of relationships simultaneously.

<div class="blog-figure blog-figure--tiny blog-figure--figure1">
<figure>
<img src="/images/blog/transformers/vaswani2017_multi_head_attention.png" alt="Multi-head attention architecture from Attention Is All You Need">
<figcaption>Figure 3 — Multi-head attention repeats the same attention computation in parallel with different learned projections. Afterward, the heads are concatenated and remixed through one final linear layer, which lets the model combine several relational views of the same sequence at once. Source: [1].</figcaption>
</figure>
</div>

### 4. Add & Layer Norm
A residual connection adds the attention output back to the input, then layer normalisation stabilises training. This pattern repeats after every sub-layer and is crucial for training deep stacks.

### 5. Feed-Forward Network
Two linear layers with a non-linearity (typically GELU or ReLU) applied independently to each token position. This is where the model "thinks" about each token after mixing information via attention.

<div class="roadmap-box">
  <h3>Reading Roadmap</h3>
  <ol>
    <li>Start with <strong>Self-Attention</strong> and <strong>Scaled Dot-Product Attention</strong>.</li>
    <li>Then learn <strong>QKV</strong>, <strong>attention masks</strong>, and <strong>multi-head attention</strong>.</li>
    <li>After that, study <strong>positional encodings</strong> and their modern long-context variants.</li>
    <li>Finally, zoom out with <strong>The Transformer Block</strong> to see how everything composes into one layer.</li>
  </ol>
</div>

## Where Transformers Are Used Today

| Domain | Model | What it does |
|---|---|---|
| Language | GPT-4, LLaMA 3 | Generate and understand text |
| Language | BERT, RoBERTa | Classify, extract, embed text |
| Vision | ViT, Swin | Classify and segment images |
| Audio | Whisper | Transcribe speech |
| Biology | AlphaFold 2 | Predict protein structure |
| Multi-modal | CLIP, Gemini | Connect text + images |

## Encoders, Decoders, and Hybrids

- **Encoder-only** (BERT): reads the full sequence bidirectionally; great for understanding tasks.
- **Decoder-only** (GPT): reads left-to-right and predicts the next token; great for generation.
- **Encoder–Decoder** (T5, original Transformer): encodes a source sequence, then decodes a target; great for translation and summarisation.

## Why the Architecture Scaled So Well

Transformers won not because attention is mathematically elegant, but because the whole stack lines up with modern compute:

- self-attention parallelises well on GPUs and TPUs;
- the same layer can be repeated dozens or hundreds of times;
- the architecture does not assume language specifically, only sequences of tokens;
- scaling data, model size, and context length tends to improve performance smoothly.

That combination made Transformers less like a one-off NLP model and more like a general-purpose interface between data and computation.

<div class="blog-figure blog-figure--tiny blog-figure--figure1">
<figure>
<img src="/images/blog/transformers/vaswani2017_attention_complexity_table.png" alt="Comparison table of self-attention, recurrent, and convolutional layers from Attention Is All You Need">
<figcaption>Figure 4 — This comparison table captures why the design scaled so well in practice: self-attention keeps the path length between any two tokens at O(1), and unlike recurrent layers it avoids sequential dependence during the main computation. That combination is exactly what made long-range reasoning easier and GPU training far more efficient. Source: [1].</figcaption>
</figure>
</div>

## What This Overview Should Leave You With

The Transformer is not one trick. It is a **clean composition of simple blocks** that together solve three hard problems at once:

- how to model long-range dependencies;
- how to train efficiently at scale;
- how to reuse the same backbone across many data types.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Transformers replaced sequential RNNs with <strong>parallel self-attention</strong>.</li>
  <li>Each layer has two sub-layers: multi-head attention and a feed-forward network, both with residual connections.</li>
  <li>Positional encodings compensate for the order-agnostic nature of attention.</li>
  <li>The same architecture works across text, images, audio, and biology by changing inputs and objectives.</li>
</ul>
</div>

<div class="reference-box">
<h3>References</h3>
<ul>
  <li>[1] Vaswani, A. et al. (2017). <a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>.</li>
  <li>Devlin, J. et al. (2018). <a href="https://arxiv.org/abs/1810.04805">BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding</a>.</li>
  <li>Dosovitskiy, A. et al. (2020). <a href="https://arxiv.org/abs/2010.11929">An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale</a>.</li>
  <li>[2] <a href="https://www.sscardapane.it/alice-book/">https://www.sscardapane.it/alice-book/</a></li>
  <li>Zhang, Lipton, Li, and Smola. <em>Dive into Deep Learning</em>, chapters on attention and Transformers.</li>
</ul>
</div>

<div class="next-posts">
<h3>📚 Read Next</h3>
<ul>
  <li><a href="/blog/transformers/attention/">Self-Attention: Teaching Machines to Focus</a></li>
  <li><a href="/blog/transformers/multi-head-attention/">Multi-Head Attention: Many Eyes on the Data</a></li>
  <li><a href="/blog/transformers/positional-encodings/">Positional Encodings: Why Position Matters</a></li>
</ul>
</div>
