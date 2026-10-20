---
layout: single
title: "The Original RAG Paper: Latent Documents, RAG-Sequence and RAG-Token"
date: 2026-10-20 09:02:00 +0100
categories: [nlp]
book: nlp
subsection: rag-foundations
tags: ["nlp", "rag", "rag-sequence", "rag-token", "latent-variables"]
excerpt: "Derive the two marginalisation schemes in Lewis et al., work through a toy mixture, and distinguish them from concatenating search results into a prompt."
author_profile: true
read_time: true
is_overview: false
icon: "📄"
read_mins: 4
permalink: /blog/nlp/rag-original-paper/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Lewis et al. combine a dense retriever with a sequence-to-sequence generator and treat the retrieved document as a latent variable. RAG-Sequence marginalises one document for a complete output; RAG-Token marginalises at each output position. Neither name means issuing a fresh search for every token.
</div>

## The paper's contribution

The 2020 RAG model links a DPR-style retriever to a pretrained sequence-to-sequence generator. A query encoder scores an external passage index; the generator conditions on the input and a retrieved passage. The answer loss trains the generator and query-side retrieval behaviour, with the document index kept fixed in the paper's setup.

The distinctive idea is to let answer likelihood influence which latent documents are useful. A passage need not carry a separately supervised relevance label for every task example. This connects [DPR](/blog/nlp/rag-dpr-contriever/) to generation and differs from simply supplying a list of search hits to a frozen chat model.

## RAG-Sequence keeps one latent document per answer

For candidate set $$D_k(x)$$, the sequence formulation approximates

<div class="formula-box">
\[
p_{\mathrm{seq}}(y\mid x)\approx\sum_{z\in D_k(x)}p_\eta(z\mid x)
\prod_{t=1}^{T}p_\theta(y_t\mid x,z,y_{\lt t}).
\]
</div>

A complete answer receives a probability under each document, then those probabilities are mixed. The formulation encourages a single document-conditioned path to explain the full answer. Top-k retrieval truncates the document space; it is an approximation, and the treatment of retrieved weights must be specified.

For a toy normalised two-document set, let weights be 0.75 and 0.25. If the full answer has conditional probabilities 0.2 and 0.6, its mixture probability is $$0.75(0.2)+0.25(0.6)=0.30$$. The less highly retrieved document contributes more answer probability than its retrieval rank alone suggests.

## RAG-Token changes where the sum appears

The token formulation uses

<div class="formula-box">
\[
p_{\mathrm{tok}}(y\mid x)\approx\prod_{t=1}^{T}\sum_{z\in D_k(x)}p_\eta(z\mid x)
 p_\theta(y_t\mid x,z,y_{\lt t}).
\]
</div>

The product of sums allows different document-conditioned distributions to contribute at different positions. It is not generally equal to the sum of products. The retrieved set is associated with the input; token-level marginalisation does not itself introduce an adaptive search loop.

For two equally weighted documents, suppose the two observed-token probabilities are (0.9, 0.1) under the first and (0.1, 0.9) under the second. RAG-Sequence gives $$0.5(0.09)+0.5(0.09)=0.09$$. RAG-Token gives $$(0.5)(0.5)=0.25$$. Each position benefits from a different document. These are constructed conditional probabilities for illustrating the algebra, not a benchmark result.

## What answer supervision teaches retrieval

For the sequence mixture, the posterior responsibility of document $$z$$ is proportional to $$p_\eta(z\mid x)p_\theta(y\mid x,z)$$. A document that makes the observed answer easier to predict can gain retrieval weight.

But usefulness to prediction is not identical to factual support. A passage can contain a lexical shortcut or correlate with the answer without establishing it. Evaluate evidence support separately from the marginal likelihood objective, especially when adapting the method to domains with revisions or contradictory sources.

## Compare with joint-context readers

[FiD](/blog/nlp/rag-fid-atlas/) encodes multiple passages and lets a decoder attend to their combined representations. It can explicitly use several passages within one decoder computation. A mixture over separate document-conditioned generators is a different architecture, even when both retrieve the same top-k set.

For a two-hop question, inspect whether any single passage contains the necessary bridge. If not, the way a model combines documents becomes central. Improving retrieval alone cannot settle whether the reader's architecture can perform the required composition.

## A useful reproduction protocol

Record the corpus snapshot, passage segmentation, retriever checkpoints, top-k, generator and decoding settings. Compare retrieval-only changes using a fixed reader, and reader changes using fixed retrieved passages. Include questions with known supporting evidence and an oracle-passage condition.

The original paper establishes a modelling family, not a guarantee of truthful answers or correct citations. The [attribution chapter](/blog/nlp/rag-attribution/) treats those as explicit outputs with their own supervision and evaluation.

<div class="insight-box">
  <strong>Key Insight:</strong> The position of the marginalisation changes the model: a sum of sequence probabilities and a product of token-level mixtures represent different assumptions about document use.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> RAG-Token does not mean “run a new retrieval query after every generated token”. That is a separate adaptive-retrieval design, covered by FLARE and related methods.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>RAG treats retrieved passages as latent variables in an answer model.</li>
    <li>RAG-Sequence and RAG-Token differ in the order of sums and products.</li>
    <li>Answer likelihood can train retrieval without proving source support.</li>
    <li>Prompt concatenation and FiD are distinct ways to condition on retrieved evidence.</li>
  </ul>
</div>

## References

1. Lewis et al. [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). NeurIPS, 2020.
2. Karpukhin et al. [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906). EMNLP, 2020.
3. Izacard and Grave. [Leveraging Passage Retrieval with Generative Models for Open Domain Question Answering](https://arxiv.org/abs/2007.01282). EACL, 2021.
