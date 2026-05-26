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
.blog-figure img { width: min(100%, 820px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
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

{% include figure image_path="/images/blog/transformers/slides/slide-09-schematic.png" alt="Slide showing short-term versus long-term interactions in convolution and non-local models" caption="From the lecture slides: the key jump is from fixed local interactions to dynamic non-local interactions, which is the conceptual door that attention walks through. Source: Simone Scardapane, Transformer models lecture, 2023." %}

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

## The Big Picture in One Pass

If you strip away the implementation details, a Transformer does five things:

1. Turn tokens into vectors.
2. Inject position information, because attention alone is order-agnostic.
3. Let tokens exchange information via self-attention.
4. Stabilise deep training with residual connections and layer normalisation.
5. Refine each token independently with a feed-forward network.

That recipe is simple enough to reuse across domains, which is why the same core architecture reappears in language, vision, audio, biology, robotics, and multi-modal systems.

{% include figure image_path="/images/blog/transformers/slides/slide-37-full-model.png" alt="Slide showing the complete Transformer model with positional encodings and stacked blocks" caption="From the lecture slides: the full Transformer is not many unrelated ideas, but one repeated block sitting on top of embeddings plus position information. Source: Simone Scardapane, Transformer models lecture, 2023." %}

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
  <li>Vaswani, A. et al. (2017). <a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>.</li>
  <li>Devlin, J. et al. (2018). <a href="https://arxiv.org/abs/1810.04805">BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding</a>.</li>
  <li>Dosovitskiy, A. et al. (2020). <a href="https://arxiv.org/abs/2010.11929">An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale</a>.</li>
  <li>Simone Scardapane. <em>Transformer (attention-based) models</em>, lecture slides, 2023.</li>
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
