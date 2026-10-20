---
layout: single
title: "Fusion-in-Decoder and Atlas: Reading Many Passages and Learning Retrieval"
date: 2026-10-20 09:08:00 +0100
categories: [nlp]
book: nlp
subsection: rag-models
tags: ["nlp", "rag", "fid", "atlas", "multi-passage"]
excerpt: "Explain independent passage encoding with shared decoding, compare FiD with Atlas training, and analyse how multi-passage fusion changes computation and evidence use."
author_profile: true
read_time: true
is_overview: false
icon: "🧩"
read_mins: 4
permalink: /blog/nlp/rag-fid-atlas/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> FiD encodes question–passage pairs independently and lets a decoder attend across their representations. Atlas combines a retrieval-augmented reader with retrieval-aware training for few-shot learning. Multi-passage access creates an opportunity to combine evidence, not a guarantee that the model will do so correctly.
</div>

## FiD changes where passages meet

Fusion-in-Decoder uses an encoder–decoder architecture. Each retrieved passage is paired with the question and encoded separately. The resulting token representations are concatenated for decoder cross-attention, allowing generation to draw on several passages.

This avoids full encoder self-attention across all passages. It also differs from the original RAG mixture, where separate document-conditioned answer distributions are marginalised. FiD gives one decoder direct access to multiple encoded sources within its computation.

## Compare the attention costs

If there are $$K$$ passages of length $$L$$, separately encoding them has an encoder self-attention term proportional to $$KL^2$$. Jointly encoding the entire concatenated input has a corresponding term proportional to $$(KL)^2$$. These expressions isolate the attention component, not all runtime or memory costs.

For ten passages of 100 tokens, the pair-count scale is 100,000 for separate encoding versus 1,000,000 for full concatenation. FiD's decoder must still attend to about 1,000 encoder positions per output step. Independent encoding does not make the evidence free.

The repeated question and passage formatting also consume tokens. Report actual sequence lengths and memory use when comparing architectures, rather than treating this simplified ratio as a measured speedup.

## Two passages can supply complementary facts

Suppose one passage identifies a product's manufacturer, while another gives that manufacturer's headquarters. A decoder with access to both can answer the composed question. But it can also conflate similarly named manufacturers or use an unrelated location.

Evaluate the two pieces of evidence separately and together. If the answer remains unchanged when either supporting passage is removed, inspect whether the model uses parametric knowledge or a shortcut. Attention weights alone do not establish which passage causally supported a claim.

## Atlas adds retrieval-aware learning

Atlas builds on a retrieval-augmented encoder–decoder setup and studies pretraining and few-shot adaptation with a learned retriever. It investigates ways to transfer the reader's assessment of passage usefulness into retriever training, rather than relying only on a fixed external relevance model.

One general distillation pattern compares a reader-derived distribution over passages with retriever probabilities:

<div class="formula-box">
\[
\mathcal L_{\mathrm{ret}}=D_{\mathrm{KL}}(p_{\mathrm{teacher}}(d\mid q,y)\Vert p_\eta(d\mid q)).
\]
</div>

This equation illustrates the learning relationship; Atlas evaluates several objectives and update choices, so a reproduction must identify the exact one. Reader likelihood and attention-based scores are not interchangeable definitions of a teacher distribution.

## A toy teacher signal

For three passages, suppose the retriever assigns `(0.6, 0.3, 0.1)` while a normalised reader-derived target is `(0.1, 0.2, 0.7)`. The distillation loss encourages more mass on the third passage. Whether that change improves factual support depends on why the reader prefers it.

A passage that repeats an answer string can improve likelihood without providing a valid explanation. Pair retriever-training diagnostics with supporting-evidence labels and examples containing misleading answer mentions.

## What to measure in a multi-passage system

Vary the passage count under a fixed or explicitly reported context budget. Measure sufficient-evidence coverage, redundant context, latency, reader loss and claim support. Include source-order and distractor tests, especially when several documents discuss different versions of the same subject.

Compare a frozen retriever with an adapted retriever while holding the reader fixed where possible. Then compare reader adaptation on the same retrieved sets. This separates gains from better evidence access and gains from better evidence use.

For the long-input alternative, see [retrieval versus long context](/blog/nlp/rag-long-context/). A larger context window and FiD's multi-passage interface solve different computational problems even when they expose the same source material.

<div class="insight-box">
  <strong>Key Insight:</strong> FiD provides a multi-source reading architecture; Atlas studies learning to make retrieval useful for that kind of reader. Access, fusion and training are separate design choices.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> More passages can add contradictory or redundant evidence. Report the passage budget and test whether newly retrieved material actually improves supported answering.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>FiD fuses separately encoded passages in decoder cross-attention.</li>
    <li>Independent encoding reduces one attention cost while leaving decoder reading costs.</li>
    <li>Atlas connects retrieval-aware training with few-shot adaptation.</li>
    <li>Reader-derived retriever targets still require evidence-quality checks.</li>
  </ul>
</div>

## References

1. Izacard and Grave. [Leveraging Passage Retrieval with Generative Models for Open Domain Question Answering](https://arxiv.org/abs/2007.01282). EACL, 2021.
2. Izacard et al. [Atlas: Few-shot Learning with Retrieval Augmented Language Models](https://arxiv.org/abs/2208.03299). Preprint, 2022; JMLR, 2023.
3. Lewis et al. [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). NeurIPS, 2020.
