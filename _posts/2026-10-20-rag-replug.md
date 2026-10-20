---
layout: single
title: "REPLUG: Retrieval for a Frozen Black-Box Language Model"
date: 2026-10-20 09:11:00 +0100
categories: [nlp]
book: nlp
subsection: rag-models
tags: ["nlp", "rag", "replug", "black-box-lm", "ensembling"]
excerpt: "Explain document-conditioned probability ensembling and reader-guided retriever learning, including the interface capabilities required to reproduce them."
author_profile: true
read_time: true
is_overview: false
icon: "🔌"
read_mins: 4
permalink: /blog/nlp/rag-replug/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> REPLUG keeps the language model frozen, supplies retrieved documents as context, and combines document-conditioned predictions. Its retrieval-learning variant uses the language model’s feedback to improve the retriever. Black-box access removes the need for model-weight gradients, but still requires the right scoring interface.
</div>

## Retrieval without changing model weights

Many applications can query a language model but cannot modify its architecture or inspect its parameters. REPLUG studies how retrieval can improve such a model by formatting retrieved documents as inputs and ensembling their conditional predictions.

The paper also introduces a language-model-supervised retrieval variant. A document that helps the frozen model predict training text can provide a learning signal for the retriever. This differs from [REALM](/blog/nlp/rag-realm/), where retrieval is integrated into pretraining, and from merely reranking documents by a generic relevance classifier.

## Mix predictions, not just strings

For retrieved documents $$d_i$$ with normalised weights $$w_i$$, a document-conditioned next-token ensemble can be written

<div class="formula-box">
\[
p(y_t\mid x,y_{\lt t})=\sum_i w_i p_{\mathrm{LM}}(y_t\mid d_i,x,y_{\lt t}).
\]
</div>

The same generated prefix is supplied to each branch. This is not equivalent to asking each branch for a full answer and majority-voting the strings, nor to concatenating all documents into one prompt.

Suppose two branches have weights 0.7 and 0.3. For a candidate token, their probabilities are 0.1 and 0.9. The mixture gives $$0.7(0.1)+0.3(0.9)=0.34$$. Selecting only the top-retrieved document would give 0.1. Ensembling preserves uncertainty about which source context is useful.

## What “black box” must expose

A text-only interface that returns a completed string does not necessarily expose the probabilities needed for exact token-level ensembling. Retriever training based on likelihood also needs access to a suitable scoring signal.

Before claiming a reproduction, identify whether the interface supports token probabilities, scoring supplied target text and coordinated decoding across branches. A simpler retrieve-and-prompt approximation can still be useful, but it should be named as an approximation rather than silently equated with the paper's computation.

## Reader feedback can train retrieval

A general reader-guided approach computes a target distribution from document-conditioned likelihoods and trains retrieval probabilities toward it. For example,

<div class="formula-box">
\[
p_T(d_i)\propto\exp\left(\frac{\log p_{\mathrm{LM}}(y\mid x,d_i)}{\tau}\right).
\]
</div>

This schematic highlights the role of the reader; an implementation must follow the paper's precise normalisation, temperatures and sampling choices. The retriever can be updated without differentiating through the frozen language model.

A document that improves answer likelihood might still exploit a shortcut. Compare with evidence-based relevance judgements and inspect whether the gain survives misleading answer-string passages.

## Cost grows with document branches

With $$K$$ separately evaluated document contexts, generation can require more model work than one combined prompt. Shared-prefix caching or batched execution may reduce costs, but the number and length of branches still matter.

Report model calls, input and output tokens, latency and retrieval cost. A comparison against a single-call baseline at an unspecified budget can confuse additional computation with a better retrieval strategy.

## When the method is a useful reference

REPLUG is particularly useful conceptually when the generator is fixed but retrieval can be learned or changed. It demonstrates that adaptation need not always mean changing the generator's weights.

For a practical study, keep the model version and corpus fixed, compare no retrieval, prompt concatenation and document ensembling, then evaluate a generic retriever against the reader-guided one. Use the same questions and report both answer quality and source support. This separates the architectural benefit of ensembling from the training benefit of a better retriever.

<div class="insight-box">
  <strong>Key Insight:</strong> Frozen model weights do not imply a frozen system. Retrieval and document combination can still be learned, provided the model interface exposes the required feedback.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A completion-only API is not automatically sufficient for the paper’s token-probability ensemble or likelihood-based retriever training. State the capabilities and approximations used.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>REPLUG augments a frozen language model through retrieved context.</li>
    <li>Document-conditioned probability mixtures differ from prompt concatenation.</li>
    <li>Reader feedback can supervise retrieval without generator-weight gradients.</li>
    <li>Model interface capabilities and multi-branch costs belong in the method description.</li>
  </ul>
</div>

## References

1. Shi et al. [REPLUG: Retrieval-Augmented Black-Box Language Models](https://arxiv.org/abs/2301.12652). NAACL, 2024.
2. Lewis et al. [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). NeurIPS, 2020.
3. Izacard et al. [Atlas: Few-shot Learning with Retrieval Augmented Language Models](https://arxiv.org/abs/2208.03299). Preprint, 2022; JMLR, 2023.
