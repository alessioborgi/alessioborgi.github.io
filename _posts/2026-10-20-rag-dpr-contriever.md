---
layout: single
title: "DPR and Contriever: Learning a Searchable Dense Representation"
date: 2026-10-20 09:03:00 +0100
categories: [nlp]
book: nlp
subsection: rag-retrieval
tags: ["nlp", "rag", "dpr", "contriever", "dense-retrieval"]
excerpt: "Derive dual-encoder retrieval and contrastive training, compare supervised DPR with Contriever pretraining, and separate embedding errors from approximate-search errors."
author_profile: true
read_time: true
is_overview: false
icon: "🧲"
read_mins: 4
permalink: /blog/nlp/rag-dpr-contriever/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A dual encoder embeds questions and passages separately so passage vectors can be indexed ahead of time. DPR learns from question–passage supervision; Contriever explores contrastive pretraining without relevance labels. Both require careful negative sampling and evaluation beyond their training distribution.
</div>

## Encode once, search many times

DPR scores a question $$q$$ and passage $$d$$ with separate encoders:

<div class="formula-box">
\[
s(q,d)=E_Q(q)^\top E_D(d).
\]
</div>

The corpus can be embedded offline. At query time, compute one question vector and search for large inner products. This avoids running a full cross-encoder over every query–document pair, but compresses each passage into one vector.

Dot product and cosine are equivalent only under appropriate normalisation. A model trained with unnormalised inner products may use vector magnitude; silently normalising its index changes the scoring function.

## DPR's supervised signal

The DPR paper uses question–positive-passage pairs with negative passages, including in-batch negatives and harder lexical negatives. A typical loss is

<div class="formula-box">
\[
\mathcal L=-\log\frac{\exp(s(q,d^+)/\tau)}{\exp(s(q,d^+)/\tau)+\sum_j\exp(s(q,d^-_j)/\tau)}.
\]
</div>

The temperature $$\tau$$ is shown as a general contrastive parameter; implementations need not expose or tune it in the same way. The loss raises the positive score relative to the sampled competitors. It does not calibrate scores as probabilities over the entire corpus.

With scores two, one and zero and $$\tau=1$$, the positive probability within the three-item set is $$e^2/(e^2+e+1)\approx0.665$$, giving loss about 0.408. A score change is meaningful relative to the negative set that produced it.

## Contriever changes where supervision comes from

Contriever trains representations through contrastive learning from text, using augmented views and a momentum-based setup to supply positives and many negatives without question–passage relevance annotation. The paper also studies subsequent supervised adaptation.

This provides an important distinction: a retriever can learn useful semantic structure without the target task's relevance labels, yet still benefit from task supervision. “Unsupervised pretraining” does not imply that every reported checkpoint or experiment uses no labelled data anywhere.

The comparison with DPR is about training signal and transfer, not a claim that one encoder family always replaces lexical retrieval. Product codes, new entity names and domain-specific terminology remain useful reasons to retain a [BM25 baseline](/blog/nlp/lexical-retrieval-bm25/).

## Hard negatives can be falsely negative

A passage that looks relevant but does not answer the question can teach discrimination. A second passage that genuinely supports the answer is a false negative if the training pipeline treats it as irrelevant. The loss then pushes away useful evidence.

For “Which year did the R7 ship?”, two release notes may both establish the date. Mining the second as a hard negative because only the first was annotated creates contradictory supervision. Inspect mined negatives, deduplicate the corpus and use multiple positives where the task supports them.

## The index adds another approximation

Approximate nearest-neighbour search trades speed and memory against recovery of the encoder's top-scoring passages. Measure it against exact vector search on a manageable sample. A perfect approximate index cannot repair poor embeddings, and excellent embeddings can be undermined by overly aggressive search settings.

Suppose exact search retrieves a supporting passage in 90 of 100 questions and the approximate index retains that support for 86. The four-question drop belongs to the search configuration, not the learned relevance model. Keep that distinction in the experiment log.

## Evaluate retrieval and reader use

Measure recall of supporting passages at several k values, not only answer-string presence. A passage can mention the answer string in a denial or an unrelated event. Then evaluate a fixed reader with the retrieved set and with oracle evidence.

Compare domain transfer, rare identifiers, query paraphrases and language changes. Report encoder versions, corpus snapshot, negative construction and index settings. These choices jointly define the retrieval system a RAG generator actually receives.

<div class="insight-box">
  <strong>Key Insight:</strong> A contrastive retriever learns relative preferences against a sampled candidate set. Its score is not automatically a corpus-wide relevance probability or an answer-support score.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Changing embedding normalisation, distance metric or encoder version without rebuilding a compatible index can silently change retrieval behaviour even when vector dimensions match.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Dual encoders make offline passage indexing possible.</li>
    <li>DPR and Contriever differ in their primary training signals.</li>
    <li>False negatives can penalise genuinely useful evidence.</li>
    <li>Audit representation quality and approximate-search fidelity separately.</li>
  </ul>
</div>

## References

1. Karpukhin et al. [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906). EMNLP, 2020.
2. Izacard et al. [Unsupervised Dense Information Retrieval with Contrastive Learning](https://arxiv.org/abs/2112.09118). TMLR, 2022.
3. Khattab and Zaharia. [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832). SIGIR, 2020.
