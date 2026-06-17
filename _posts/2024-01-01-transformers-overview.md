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
.page__content .blog-figure--figure1 figure img {
  width: 350px;
}
.page__content .blog-figure--figure2 figure img {
  width: min(100%, 220px);
}
.page__content .blog-figure--figure3 figure img {
  width: min(100%, 240px);
}
.page__content .blog-figure--figure4 figure img {
  width: min(100%, 350px);
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

<div class="blog-figure">
<figure>
<svg viewBox="0 0 580 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <style>
    @keyframes fade-signal {
      0%   { opacity: 1; }
      60%  { opacity: 0.25; }
      100% { opacity: 0.08; }
    }
    .sig1 { animation: fade-signal 2.8s ease-in-out infinite; }
    .sig2 { animation: fade-signal 2.8s ease-in-out 0.4s infinite; }
    .sig3 { animation: fade-signal 2.8s ease-in-out 0.8s infinite; }
    .sig4 { animation: fade-signal 2.8s ease-in-out 1.2s infinite; }
    .sig5 { animation: fade-signal 2.8s ease-in-out 1.6s infinite; }
  </style>
  <defs>
    <marker id="ov1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- RNN label -->
  <text x="290" y="15" text-anchor="middle" font-size="12" font-weight="700" fill="#374151">RNN: information fades as it travels through steps</text>
  <!-- Boxes -->
  <rect x="30"  y="34" width="70" height="34" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="65"  y="55" text-anchor="middle" font-size="10" fill="#7f1d1d">"The"</text>
  <rect x="140" y="34" width="70" height="34" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="175" y="55" text-anchor="middle" font-size="10" fill="#7f1d1d">"animal"</text>
  <rect x="250" y="34" width="70" height="34" rx="6" fill="#fef2f2" stroke="#f87171" stroke-width="1.5"/>
  <text x="285" y="55" text-anchor="middle" font-size="10" fill="#991b1b">"didn't"</text>
  <rect x="360" y="34" width="70" height="34" rx="6" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="395" y="55" text-anchor="middle" font-size="10" fill="#b91c1c">"cross"</text>
  <rect x="470" y="34" width="70" height="34" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1.5"/>
  <text x="505" y="55" text-anchor="middle" font-size="10" fill="#dc2626">"it"</text>
  <!-- Hidden state arrows -->
  <line x1="100" y1="51" x2="138" y2="51" stroke="#dc2626" stroke-width="2" marker-end="url(#ov1)" class="sig1"/>
  <line x1="210" y1="51" x2="248" y2="51" stroke="#ef4444" stroke-width="2" marker-end="url(#ov1)" class="sig2"/>
  <line x1="320" y1="51" x2="358" y2="51" stroke="#f87171" stroke-width="2" marker-end="url(#ov1)" class="sig3"/>
  <line x1="430" y1="51" x2="468" y2="51" stroke="#fca5a5" stroke-width="2" marker-end="url(#ov1)" class="sig4"/>
  <!-- Signal decay label -->
  <text x="65"  y="90" text-anchor="middle" font-size="8" fill="#dc2626">strong</text>
  <text x="175" y="90" text-anchor="middle" font-size="8" fill="#ef4444">strong</text>
  <text x="285" y="90" text-anchor="middle" font-size="8" fill="#f87171">fading...</text>
  <text x="395" y="90" text-anchor="middle" font-size="8" fill="#fca5a5">weak</text>
  <text x="505" y="90" text-anchor="middle" font-size="8" fill="#fecaca">lost?</text>
  <!-- Bottom label: "it" resolves to "animal" but signal is gone -->
  <text x="290" y="120" text-anchor="middle" font-size="10" fill="#6b7280">"it" should resolve to "animal" — but by the time the RNN reaches "it", that signal has faded.</text>
  <text x="290" y="136" text-anchor="middle" font-size="10" fill="#6b7280">Transformers attend directly: "it" → "animal" in one step.</text>
</svg>
<figcaption>Animated: information from "animal" fades as the RNN processes each subsequent step. Transformers solve this by attending to every token directly.</figcaption>
</figure>
</div>

<div class="insight-box">
  <strong>The real bottleneck:</strong> older sequence models were not only harder to train. They also forced information to move through many intermediate steps, which is exactly the wrong bias when meaning depends on distant words, long documents, or multi-modal context.
</div>

## The Core Insight: Attend to Everything

The 2017 paper *Attention Is All You Need* (Vaswani et al.) asked: what if you let every word look directly at every other word, with no middle layers in between?

That's **self-attention**. Each token computes a score with every other token, learns which ones are relevant, and mixes their information together — in one parallel step. No sequential dependency. No forgetting.

<div class="blog-figure blog-figure--tiny blog-figure--figure2">
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

<div class="blog-figure">
<figure>
<svg viewBox="0 0 580 110" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <style>
    @keyframes pulse-block {
      0%, 100% { opacity: 1; transform: scaleY(1); }
      50%       { opacity: 0.7; transform: scaleY(1.04); }
    }
    .blk1 { animation: pulse-block 2s ease-in-out 0s infinite; transform-origin: 55px 55px; }
    .blk2 { animation: pulse-block 2s ease-in-out 0.3s infinite; transform-origin: 150px 55px; }
    .blk3 { animation: pulse-block 2s ease-in-out 0.6s infinite; transform-origin: 250px 55px; }
    .blk4 { animation: pulse-block 2s ease-in-out 0.9s infinite; transform-origin: 350px 55px; }
    .blk5 { animation: pulse-block 2s ease-in-out 1.2s infinite; transform-origin: 455px 55px; }
  </style>
  <defs>
    <marker id="ov2" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3z" fill="#6b7280"/></marker>
  </defs>
  <rect x="10"  y="28" width="90" height="54" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5" class="blk1"/>
  <text x="55"  y="52" text-anchor="middle" font-size="9" fill="#1e3a5f" font-weight="700">① Token</text>
  <text x="55"  y="65" text-anchor="middle" font-size="9" fill="#1e3a5f">Embedding</text>
  <line x1="100" y1="55" x2="118" y2="55" stroke="#6b7280" stroke-width="1.5" marker-end="url(#ov2)"/>
  <rect x="120" y="28" width="90" height="54" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" class="blk2"/>
  <text x="165" y="52" text-anchor="middle" font-size="9" fill="#78350f" font-weight="700">② Positional</text>
  <text x="165" y="65" text-anchor="middle" font-size="9" fill="#78350f">Encoding</text>
  <line x1="210" y1="55" x2="228" y2="55" stroke="#6b7280" stroke-width="1.5" marker-end="url(#ov2)"/>
  <rect x="230" y="28" width="90" height="54" rx="8" fill="#d1fae5" stroke="#059669" stroke-width="1.5" class="blk3"/>
  <text x="275" y="52" text-anchor="middle" font-size="9" fill="#065f46" font-weight="700">③ Self-</text>
  <text x="275" y="65" text-anchor="middle" font-size="9" fill="#065f46">Attention</text>
  <line x1="320" y1="55" x2="338" y2="55" stroke="#6b7280" stroke-width="1.5" marker-end="url(#ov2)"/>
  <rect x="340" y="28" width="90" height="54" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5" class="blk4"/>
  <text x="385" y="52" text-anchor="middle" font-size="9" fill="#4c1d95" font-weight="700">④ Add &amp;</text>
  <text x="385" y="65" text-anchor="middle" font-size="9" fill="#4c1d95">LayerNorm</text>
  <line x1="430" y1="55" x2="448" y2="55" stroke="#6b7280" stroke-width="1.5" marker-end="url(#ov2)"/>
  <rect x="450" y="28" width="100" height="54" rx="8" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5" class="blk5"/>
  <text x="500" y="52" text-anchor="middle" font-size="9" fill="#134e4a" font-weight="700">⑤ Feed-</text>
  <text x="500" y="65" text-anchor="middle" font-size="9" fill="#134e4a">Forward</text>
  <text x="290" y="102" text-anchor="middle" font-size="9" fill="#6b7280">Blocks ③–⑤ repeat N times (N=6 in the original paper)</text>
</svg>
<figcaption>The five-step Transformer pipeline, animated to highlight the sequential data flow. Steps 3–5 form the repeatable encoder block.</figcaption>
</figure>
</div>

## Architecture Walk-Through

A Transformer encoder consists of these building blocks, stacked N times:

### 1. Token Embedding
Each word (or subword token) is mapped to a dense vector — a point in high-dimensional space where similar words land close together.

### 2. Positional Encoding
Because attention sees all tokens simultaneously, the model would otherwise have no idea which word comes first. Positional encodings inject position information into each token's vector before it enters the attention layers. (<a href="/blog/transformers/positional-encodings/">See the dedicated PE posts for all the variants.</a>)

### 3. Multi-Head Self-Attention
This is the heart of the Transformer. Each token computes three vectors — a **Query** (what I'm looking for), a **Key** (what I offer), and a **Value** (what I'll contribute). The model computes pairwise relevance scores, normalises them with a softmax, then mixes the value vectors accordingly. Running this process in parallel across *h* heads lets the model capture different types of relationships simultaneously.

<div class="blog-figure blog-figure--tiny blog-figure--figure3">
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

<div class="blog-figure blog-figure--tiny blog-figure--figure4">
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
