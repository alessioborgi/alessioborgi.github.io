---
layout: single
title: "Retrieval-Augmented Generation: The Pipeline, the Evidence and the Paper Map"
date: 2026-10-20 09:00:00 +0100
categories: [nlp]
book: nlp
subsection: rag-foundations
tags: ["nlp", "rag", "overview", "retrieval", "grounding"]
excerpt: "Build a complete mental model of RAG, locate its failure points, and follow the important paper families from dense retrieval to search agents and graph-based synthesis."
author_profile: true
read_time: true
is_overview: false
icon: "📚"
read_mins: 6
permalink: /blog/nlp/rag-foundations/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> RAG gives a language model access to retrieved external information. A useful system must find relevant evidence, preserve it through context construction, generate supported claims and identify their sources. Retrieval quality, answer quality and attribution quality are separate properties.
</div>

## Two memories, several decisions

A language model stores statistical information in its parameters. A retrieval system exposes an external collection that can be searched and updated separately. The original [RAG paper](/blog/nlp/rag-original-paper/) combines a learned retriever and generator; modern engineering also uses the term for retrieve–prompt–generate pipelines that do not implement its latent-document objective.

That distinction matters. Replacing documents in a prompt is different from training a model to marginalise over retrieved passages. Both can use external evidence, but their training signals, interfaces and failure modes differ.

A minimal pipeline contains ingestion, indexing, query processing, candidate retrieval, optional reranking, context construction, generation and evidence checks. Changing any stage changes the behaviour of the whole system.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="rag-pipeline-title rag-pipeline-desc" viewBox="0 0 660 110" style="max-width:660px;width:100%;height:auto;font-family:system-ui,sans-serif">
<title id="rag-pipeline-title">RAG converts a question into an evidence-conditioned answer through several independently testable stages.</title>
<desc id="rag-pipeline-desc">Query|and scope → Retrieve|and rerank → Pack|evidence → Answer|with sources</desc>
<rect x="5.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="75.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Query</text>
<text x="75.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">and scope</text>
<text x="155.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="170.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="240.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Retrieve</text>
<text x="240.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">and rerank</text>
<text x="320.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="335.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="405.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Pack</text>
<text x="405.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">evidence</text>
<text x="485.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="500.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="570.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Answer</text>
<text x="570.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">with sources</text>
</svg>
<figcaption>RAG converts a question into an evidence-conditioned answer through several independently testable stages.</figcaption>
</figure>
</div>

## Follow one question end to end

Suppose a user asks whether the R7 robot supports outdoor charging. The corpus contains an old R7 manual, a current R7 safety note and an R8 brochure. A semantic search can return all three because their vocabulary is similar.

A good pipeline preserves the product identifier and version constraint, prefers the applicable R7 evidence, and keeps the qualification attached to the charging statement. The generator must not borrow the R8 feature or average the old and new instructions into a compromise. If the documents genuinely conflict, the answer should explain the conflict with the relevant dates and sources.

A fluent answer can therefore fail despite successful similarity search. Relevance is a relation to a question; applicability includes scope and version; support is a relation between a source and a specific claim.

## A probability model and an engineering model

A latent-document formulation writes

<div class="formula-box">
\[
p(y\mid x)=\sum_z p_\eta(z\mid x)p_\theta(y\mid x,z).
\]
</div>

The retriever distributes mass over documents; the generator predicts an answer conditional on one. Practical systems usually approximate the sum or use a selected set as a combined context. Concatenating documents into one prompt is not automatically the same computation as marginalising their conditional answer probabilities.

For diagnosis, use a conditional success chain. If sufficient evidence is retrieved with probability 0.9, retained in context with probability 0.8 given retrieval, and used correctly with probability 0.85 given both, the probability of that successful path is $$0.9\times0.8\times0.85=0.612$$. These are conditional rates, so the product does not assume independence. Other paths, including correct answers from parametric knowledge, should be measured separately.

## Before generative RAG: DrQA and ORQA

DrQA couples document retrieval with an extractive reader over Wikipedia. Its answer is a passage span, which makes it an important precursor to the retrieval–reader decomposition. ORQA learns a dense retriever with latent evidence using question–answer supervision; supporting documents need not be provided as training labels. Together they motivate two questions that recur throughout this book: how does the reader consume evidence, and what supervision teaches the retriever to find it?

RAG extends this lineage with a generative answer distribution. A generated sentence can combine information and produce wording absent from the source, so span extraction metrics alone no longer establish evidence support.

## The research families

| Question | Chapters and representative papers |
|---|---|
| How do we find evidence? | [DPR/Contriever](/blog/nlp/rag-dpr-contriever/), [ColBERT/SPLADE](/blog/nlp/rag-colbert-splade/), [hybrid reranking](/blog/nlp/rag-hybrid-reranking/) |
| How does retrieval enter learning? | [REALM](/blog/nlp/rag-realm/), [FiD/Atlas](/blog/nlp/rag-fid-atlas/), [RETRO](/blog/nlp/rag-retro/), [kNN-LM](/blog/nlp/rag-knn-lm/), [REPLUG](/blog/nlp/rag-replug/) |
| When should we search again? | [Self-RAG](/blog/nlp/rag-self-rag/), [CRAG/Adaptive-RAG](/blog/nlp/rag-crag-adaptive/), [FLARE](/blog/nlp/rag-flare/) |
| How do we answer multi-step questions? | [IRCoT/ReAct](/blog/nlp/rag-ircot-react/), [Search-R1](/blog/nlp/rag-search-r1/) |
| How do we organise corpus-wide evidence? | [RAPTOR](/blog/nlp/rag-raptor/), [GraphRAG](/blog/nlp/rag-graphrag/), [LightRAG](/blog/nlp/rag-lightrag/) |
| How do we know the answer is supported? | [RAGAS/ARES](/blog/nlp/rag-evaluation/), [ALCE and attribution](/blog/nlp/rag-attribution/), [long-context analysis](/blog/nlp/rag-long-context/) |

These are connected reading routes through influential methods, not interchangeable product labels. The chapters explain both the papers' contributions and worked examples of their implications.

## Establish a baseline before adding components

Start with a versioned corpus, a lexical retrieval baseline, a fixed context budget and a question set with supporting passages. Record retrieved IDs, scores, selected context and output claims. Add one change at a time: dense retrieval, query expansion, a reranker or an adaptive loop.

Measure evidence recall, answer support and cost together. More retrieval calls or a longer prompt can improve one metric while increasing delay or distracting the generator. Oracle-evidence experiments help distinguish a retrieval bottleneck from a generator that cannot use the right evidence even when it is supplied.

Treat retrieved text as source material, with its own authority and uncertainty. Content inside a document does not become an instruction merely because the retriever returned it. For systems with document permissions, apply the authorised corpus boundary before information reaches the generator.

<div class="insight-box">
  <strong>Key Insight:</strong> RAG is a chain of evidence decisions. Finding a relevant passage, using it correctly and citing it accurately are three different achievements.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> An answer can be factually correct from model memory while unsupported by its cited passages. Evaluate both correctness and source support rather than using one as a substitute for the other.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Separate parametric memory from the searchable corpus.</li>
    <li>Distinguish the original probabilistic RAG model from prompt-based RAG pipelines.</li>
    <li>Measure retrieval, context retention, generation and attribution separately.</li>
    <li>Use a fixed corpus and budget when comparing paper-inspired changes.</li>
  </ul>
</div>

## References

1. Lewis et al. [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). NeurIPS, 2020.
2. Karpukhin et al. [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906). EMNLP, 2020.
3. Gao et al. [Enabling Large Language Models to Generate Text with Citations](https://arxiv.org/abs/2305.14627). EMNLP, 2023.
4. Chen et al. [Reading Wikipedia to Answer Open-Domain Questions](https://aclanthology.org/P17-1171/). ACL, 2017.
5. Lee, Chang and Toutanova. [Latent Retrieval for Weakly Supervised Open Domain Question Answering](https://aclanthology.org/P19-1612/). ACL, 2019.
