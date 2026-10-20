---
layout: single
title: "ColBERT and SPLADE: Beyond One Dense Vector per Passage"
date: 2026-10-20 09:04:00 +0100
categories: [nlp]
book: nlp
subsection: rag-retrieval
tags: ["nlp", "rag", "colbert", "splade", "late-interaction"]
excerpt: "Compare late token interaction with learned sparse expansion, work through MaxSim, and understand the storage and matching tradeoffs."
author_profile: true
read_time: true
is_overview: false
icon: "🔬"
read_mins: 4
permalink: /blog/nlp/rag-colbert-splade/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> ColBERT preserves multiple contextual token vectors and matches them through late interaction. SPLADE learns sparse vocabulary-space weights that can include expansion terms. These methods retain different kinds of evidence from a single-vector retriever and have different indexing costs.
</div>

## What a single vector compresses

A passage can mention several entities and conditions. Compressing all of them into one vector may blur the exact combination requested by a query. A cross-encoder can model detailed query–passage interactions, but running it over an entire corpus is expensive.

ColBERT offers a middle position: encode the query and document separately, retain token representations, then compute a lightweight interaction score. SPLADE takes another route by learning sparse term-weight vectors compatible with inverted-index retrieval.

## ColBERT's MaxSim score

For contextual query vectors $$q_i$$ and document vectors $$d_j$$, a simplified late-interaction score is

<div class="formula-box">
\[
s(Q,D)=\sum_i\max_j q_i^\top d_j.
\]
</div>

Each query token finds its strongest document-token match, and the matches are summed. The original system includes additional representation and indexing details; this equation exposes the central interaction.

For a two-token query, suppose token similarities to a three-token document are `(0.9, 0.2, 0.1)` and `(0.1, 0.4, 0.8)`. MaxSim gives $$0.9+0.8=1.7$$. A competing document with maxima 0.95 and 0.3 scores 1.25. Strong coverage of both query components beats an excellent match to only one.

The same document token may maximise more than one query term. MaxSim is not a one-to-one alignment, and a high score does not enforce factual entailment or relational consistency.

## Storage and search consequences

A multi-vector document representation contains more stored information than one vector per passage. Compression, pruning and candidate generation therefore matter to practical performance. Compare systems under a stated memory and latency budget rather than attributing all improvements to the scoring formula.

For an identifier-heavy query, retaining token-level distinctions can be useful. Yet contradictory passages can still match all query terms. “R7 does not support outdoor charging” is highly relevant to the query even though it supports a negative answer.

## SPLADE learns lexical expansion

SPLADE produces nonnegative weights over a vocabulary using a language model and sparsity regularisation. The sparse vector can assign weight to terms not literally present, allowing learned expansion while preserving term-based indexing.

The original SPLADE and later variants differ in pooling choices. A general schematic is

<div class="formula-box">
\[
w_v(d)=\operatorname{pool}_{i}\log(1+\operatorname{ReLU}(a_{iv})),
\qquad s(q,d)=\sum_v w_v(q)w_v(d).
\]
</div>

The pooling operation must be specified: sum and max do not define the same model. Sparsity regularisation controls how many vocabulary dimensions remain active and therefore affects both retrieval quality and index cost.

If a query activates `battery` with weight two and `charging` with weight one, while a document activates those terms with weights one and three, their dot product contribution is five. Expanded terms can help bridge wording differences, but an expansion into the wrong sense can also introduce false matches.

## Pick a representation through failure analysis

| Representation | Retained evidence | Main tradeoff |
|---|---|---|
| Single dense vector | Global passage geometry | Compact but compressed interactions |
| ColBERT-style vectors | Contextual token matches | More storage and interaction work |
| SPLADE-style sparse vector | Learned vocabulary weights | Expansion quality and posting-list cost |
| Cross-encoder | Joint query–passage features | Usually limited to a candidate set |

Use a fixed corpus and supporting-evidence labels. Measure rare-term behaviour, compositional queries, index size and end-to-end answer support. A retriever's improved matching can be lost if the [context packer](/blog/nlp/rag-chunking-indexes/) removes the useful detail before generation.

<div class="insight-box">
  <strong>Key Insight:</strong> Late interaction and sparse expansion preserve different information. Compare the matching failure each representation fixes, not just the headline label “neural retrieval”.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> MaxSim similarity and expanded lexical overlap do not prove that a passage supports the intended answer. Negation and entity relationships still need to be read.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>ColBERT aggregates strongest token-level matches after separate encoding.</li>
    <li>SPLADE learns sparse vocabulary weights and expansion terms.</li>
    <li>Pooling and sparsity settings are part of the model definition.</li>
    <li>Compare retrieval quality alongside memory, latency and evidence preservation.</li>
  </ul>
</div>

## References

1. Khattab and Zaharia. [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832). SIGIR, 2020.
2. Formal, Piwowarski and Clinchant. [SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking](https://arxiv.org/abs/2107.05720). SIGIR, 2021.
3. Karpukhin et al. [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906). EMNLP, 2020.
