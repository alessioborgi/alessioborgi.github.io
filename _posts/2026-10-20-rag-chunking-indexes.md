---
layout: single
title: "RAG Index Design: Chunking, Metadata, Updates and Context Budgets"
date: 2026-10-20 09:01:00 +0100
categories: [nlp]
book: nlp
subsection: rag-foundations
tags: ["nlp", "rag", "chunking", "indexes", "provenance"]
excerpt: "Choose retrieval units without losing document structure, preserve provenance through indexing, and evaluate chunking under a fixed evidence budget."
author_profile: true
read_time: true
is_overview: false
icon: "🗃️"
read_mins: 5
permalink: /blog/nlp/rag-chunking-indexes/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> An index is a versioned representation of documents, not just a collection of vectors. Chunk boundaries determine what can be retrieved together. Store source offsets and scope metadata, distinguish retrieval units from reading units, and update the entire dependency chain when source material changes.
</div>

## A chunk is a hypothesis about useful context

A fixed window is convenient, but the text needed to answer a question may straddle its boundary. A section-based chunk preserves headings but can be too long. A sentence-based chunk can omit a definition or table header that makes its content interpretable.

Consider “Outdoor charging is permitted” followed by “only with enclosure E2 and firmware 4.” Separating those sentences without preserving their relationship makes the first chunk dangerously incomplete for the question being asked. This is an information-loss problem, not a choice a larger embedding necessarily repairs.

Start from document structure: headings, paragraphs, tables, lists and captions. Keep explicit links from chunks to the source and neighbouring material. For tables, preserve row/column labels; a cell value without its header may be uninterpretable.

## Retrieval units can be smaller than reading units

A short child chunk can make a precise retrieval target, while its parent section supplies the context passed to the generator. This separates search specificity from reading completeness.

If three child hits share a parent, deduplicate before packing. Otherwise overlap consumes the prompt budget repeatedly. Preserve which child triggered the retrieval so the system can explain why the larger section was selected.

| Field | Why it matters |
|---|---|
| Stable document and chunk IDs | Reproduce the retrieved evidence |
| Source offsets or page/section coordinates | Show the exact supporting material |
| Document version and effective date | Resolve applicability and supersession |
| Product, language and source type | Enforce the question's scope |
| Parent/child links | Expand short hits without losing provenance |
| Access metadata | Keep retrieval inside the authorised collection |

## Overlap has a measurable cost

For a long token sequence of length $$N$$, window size $$L$$ and overlap $$O<L$$, the stride is $$L-O$$. A common chunk count is

<div class="formula-box">
\[
n=1+\left\lceil\frac{\max(0,N-L)}{L-O}\right\rceil.
\]
</div>

For $$N=2{,}000$$, $$L=500$$ and $$O=100$$, this produces five chunks. Without overlap it produces four. The extra stored tokens can improve boundary coverage, but overlapping evidence is not independent corroboration.

Keep tokenisation fixed when comparing these settings. A “500-token chunk” produced by one tokenizer can contain different text from the same nominal size under another.

## Pack evidence as a constrained selection

Let chunk $$i$$ have estimated utility $$u_i$$ and token cost $$c_i$$. An illustrative packing objective is

<div class="formula-box">
\[
\max_{S}\sum_{i\in S}u_i\quad\text{subject to}\quad\sum_{i\in S}c_i\leq B.
\]
</div>

This additive objective is only a starting point: duplicated chunks have diminishing value, while two complementary passages can be useful only together. A query asking for a comparison needs evidence about both sides, even if the highest-scoring hits all concern one.

With a 1,000-token budget, two redundant 500-token passages can crowd out a 200-token exception note. Track whether sufficient evidence survives packing, not just whether it appeared somewhere in the initial top-k results.

## Updates invalidate more than vectors

Changing a source can invalidate its chunks, embeddings, lexical postings, cached retrieval results and any derived summaries or graph edges. Keep a document-to-derived-artifact mapping so deletions and corrections propagate. Tombstoning a vector alone does not remove an outdated statement from a [RAPTOR summary](/blog/nlp/rag-raptor/) or [graph community report](/blog/nlp/rag-graphrag/).

If the embedding model changes, old and new vectors may occupy incompatible spaces even at the same dimension. Version the encoder and rebuild or migrate the index under a deliberate compatibility policy.

## Evaluate the design, not a magic chunk size

Hold corpus, questions and context budget constant. Compare evidence-span recall, boundary errors, duplicate context, latency and answer support. Include short facts, long qualifications, tables and multi-document questions.

The [long-context chapter](/blog/nlp/rag-long-context/) explains why retaining more text does not guarantee that a model will use it correctly. Chunking is one part of context selection, and its best setting depends on the task's evidence structure.

<div class="insight-box">
  <strong>Key Insight:</strong> Index design controls which evidence can be found and which qualifications remain attached to it. Provenance and document structure are first-class parts of that representation.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Treat overlapping chunks and copied passages as repeated presentations of the same evidence, not as several independent sources confirming a claim.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Preserve structure and source coordinates when chunking.</li>
    <li>Retrieve small units and expand to larger reading context when useful.</li>
    <li>Measure overlap and packing under a fixed token budget.</li>
    <li>Propagate source updates to embeddings, summaries, graphs and caches.</li>
  </ul>
</div>

## References

1. Lewis et al. [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). NeurIPS, 2020.
2. Sarthi et al. [RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval](https://arxiv.org/abs/2401.18059). ICLR, 2024.
3. Liu et al. [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172). TACL, 2024.
