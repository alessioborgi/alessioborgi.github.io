---
layout: single
title: "Transformers: The Architecture That Changed AI"
date: 2024-01-01
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
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.tldr-box {
  background: linear-gradient(145deg,#e8fbfb,#dbeafe);
  border-left: 4px solid #0d9488;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
}
.tldr-box strong { color: #0f2a36; }
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
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> The Transformer dropped sequential processing in favour of parallel attention over all tokens at once. This simple shift unlocked GPT, BERT, Whisper, AlphaFold, ViT — essentially all of modern AI.
</div>

## The Problem with the Old Way

Before 2017, the go-to model for text was the **Recurrent Neural Network (RNN)**. It worked like a conveyor belt: read one word, update a hidden state, pass it to the next word. The trouble is that by the time you reach the end of a long sentence, the beginning is already fading — the network forgets.

This is the **vanishing gradient problem**: information from far-back positions barely influences the model. Researchers patched it with LSTMs and GRUs, but the fundamental bottleneck remained: you can't parallelise a sequential process. Training was slow, and long-range dependencies were hard to capture.

## The Core Insight: Attend to Everything

The 2017 paper *Attention Is All You Need* (Vaswani et al.) asked: what if you let every word look directly at every other word, with no middle layers in between?

That's **self-attention**. Each token computes a score with every other token, learns which ones are relevant, and mixes their information together — in one parallel step. No sequential dependency. No forgetting.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 560 320" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- RNN side -->
  <text x="110" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#dc2626">RNN (sequential)</text>
  <rect x="30"  y="35" width="50" height="28" rx="5" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="55"  y="53" text-anchor="middle" font-size="11" fill="#7f1d1d">the</text>
  <rect x="95"  y="35" width="50" height="28" rx="5" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="120" y="53" text-anchor="middle" font-size="11" fill="#7f1d1d">cat</text>
  <rect x="160" y="35" width="50" height="28" rx="5" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="185" y="53" text-anchor="middle" font-size="11" fill="#7f1d1d">sat</text>
  <line x1="80"  y1="49" x2="93"  y2="49" stroke="#dc2626" stroke-width="1.5" marker-end="url(#a1)"/>
  <line x1="145" y1="49" x2="158" y2="49" stroke="#dc2626" stroke-width="1.5" marker-end="url(#a1)"/>
  <text x="110" y="86" text-anchor="middle" font-size="10" fill="#9ca3af">Must process one-by-one →</text>

  <!-- Transformer side -->
  <text x="410" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#0d9488">Transformer (parallel)</text>
  <rect x="310" y="35" width="50" height="28" rx="5" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="335" y="53" text-anchor="middle" font-size="11" fill="#134e4a">the</text>
  <rect x="385" y="35" width="50" height="28" rx="5" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="410" y="53" text-anchor="middle" font-size="11" fill="#134e4a">cat</text>
  <rect x="460" y="35" width="50" height="28" rx="5" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
  <text x="485" y="53" text-anchor="middle" font-size="11" fill="#134e4a">sat</text>
  <!-- All-to-all attention lines -->
  <line x1="335" y1="63" x2="410" y2="63" stroke="#0d9488" stroke-width="1" opacity=".5"/>
  <line x1="335" y1="63" x2="485" y2="63" stroke="#0d9488" stroke-width="1" opacity=".5"/>
  <line x1="410" y1="63" x2="335" y2="63" stroke="#0d9488" stroke-width="1" opacity=".5"/>
  <line x1="410" y1="63" x2="485" y2="63" stroke="#0d9488" stroke-width="1" opacity=".5"/>
  <line x1="485" y1="63" x2="335" y2="63" stroke="#0d9488" stroke-width="1" opacity=".5"/>
  <line x1="485" y1="63" x2="410" y2="63" stroke="#0d9488" stroke-width="1" opacity=".5"/>
  <text x="410" y="86" text-anchor="middle" font-size="10" fill="#9ca3af">All tokens attend to each other at once</text>

  <!-- Architecture stack (bottom) -->
  <text x="280" y="118" text-anchor="middle" font-size="12" font-weight="700" fill="#374151">Transformer Encoder Stack</text>
  <rect x="155" y="128" width="250" height="30" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="280" y="147" text-anchor="middle" font-size="12" fill="#1e3a5f" font-weight="600">Input Tokens + Embedding</text>
  <line x1="280" y1="158" x2="280" y2="170" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="155" y="170" width="250" height="30" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="280" y="189" text-anchor="middle" font-size="12" fill="#78350f" font-weight="600">Positional Encoding</text>
  <line x1="280" y1="200" x2="280" y2="212" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a1)"/>
  <!-- Repeat block -->
  <rect x="140" y="212" width="280" height="72" rx="8" fill="none" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="5,3"/>
  <text x="406" y="228" font-size="10" fill="#0d9488" font-weight="700">× N layers</text>
  <rect x="155" y="218" width="250" height="25" rx="5" fill="#cffafe" stroke="#0891b2" stroke-width="1.5"/>
  <text x="280" y="234" text-anchor="middle" font-size="11" fill="#164e63" font-weight="600">Multi-Head Self-Attention + Add &amp; Norm</text>
  <line x1="280" y1="243" x2="280" y2="250" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="155" y="252" width="250" height="25" rx="5" fill="#cffafe" stroke="#0891b2" stroke-width="1.5"/>
  <text x="280" y="268" text-anchor="middle" font-size="11" fill="#164e63" font-weight="600">Feed-Forward Network + Add &amp; Norm</text>
  <line x1="280" y1="285" x2="280" y2="297" stroke="#6b7280" stroke-width="1.5" marker-end="url(#a1)"/>
  <rect x="155" y="297" width="250" height="25" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="280" y="313" text-anchor="middle" font-size="12" fill="#4c1d95" font-weight="600">Output Representations</text>
</svg>
<figcaption>Figure 1: RNNs process tokens sequentially (left); Transformers attend to all tokens in parallel (right). The bottom shows the encoder stack.</figcaption>
</figure>
</div>

## Architecture Walk-Through

A Transformer encoder consists of these building blocks, stacked N times:

### 1. Token Embedding
Each word (or subword token) is mapped to a dense vector — a point in high-dimensional space where similar words land close together.

### 2. Positional Encoding
Because attention sees all tokens simultaneously, the model would otherwise have no idea which word comes first. Positional encodings inject position information into each token's vector before it enters the attention layers. (See the dedicated PE posts for all the variants.)

### 3. Multi-Head Self-Attention
This is the heart of the Transformer. Each token computes three vectors — a **Query** (what I'm looking for), a **Key** (what I offer), and a **Value** (what I'll contribute). The model computes pairwise relevance scores, normalises them with a softmax, then mixes the value vectors accordingly. Running this process in parallel across *h* heads lets the model capture different types of relationships simultaneously.

### 4. Add & Layer Norm
A residual connection adds the attention output back to the input, then layer normalisation stabilises training. This pattern repeats after every sub-layer and is crucial for training deep stacks.

### 5. Feed-Forward Network
Two linear layers with a non-linearity (typically GELU or ReLU) applied independently to each token position. This is where the model "thinks" about each token after mixing information via attention.

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

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Transformers replaced sequential RNNs with <strong>parallel self-attention</strong>.</li>
  <li>Each layer has two sub-layers: multi-head attention and a feed-forward network, both with residual connections.</li>
  <li>Positional encodings compensate for the order-agnostic nature of attention.</li>
  <li>The same architecture works across text, images, audio, and biology by changing inputs and objectives.</li>
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
