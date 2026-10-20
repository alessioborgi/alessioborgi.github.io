---
layout: single
title: "RAPTOR: Retrieve Across Chunks and Recursive Summaries"
date: 2026-10-20 09:17:00 +0100
categories: [nlp]
book: nlp
subsection: rag-structured
tags: ["nlp", "rag", "raptor", "hierarchical-retrieval", "summaries"]
excerpt: "Explain hierarchical summarisation for retrieval, compare tree traversal with collapsed search, and trace summary claims back to original evidence."
author_profile: true
read_time: true
is_overview: false
icon: "🌳"
read_mins: 5
permalink: /blog/nlp/rag-raptor/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> RAPTOR builds higher-level summaries by clustering and summarising text recursively, then retrieves across levels of abstraction. This can expose themes spanning many chunks. Summary nodes are derived representations, so omissions, unsupported synthesis and source lineage must be checked separately.
</div>

## Why local chunks can miss a global question

A long report may discuss the same supply problem across procurement, maintenance and deployment sections. No single paragraph states the overall pattern. Retrieving only small local chunks can return isolated details without a useful synthesis.

RAPTOR constructs a hierarchy by embedding text chunks, clustering them, summarising clusters and repeating the process. The resulting collection includes both original detail and broader summaries. Its clustering can support overlapping membership, so the tree-organised description should not be mistaken for a guarantee that every fact has exactly one unique ancestor.

## Retrieval can operate across levels

The paper explores retrieval strategies including traversal through the hierarchy and searching a collapsed collection of nodes. A high-level query can match a summary, while a precise question can match an original chunk.

A simplified hierarchy might look like this:

```text
Fleet reliability summary
├── Battery-related summary
│   ├── Charging incidents
│   └── Replacement records
└── Mechanical summary
    ├── Wheel failures
    └── Maintenance schedules
```

This is an illustrative organisation, not a required ontology. Automatically learned clusters need not correspond to clean human categories, and a source chunk may contribute to more than one theme.

## A summary is a new retrieval object

Suppose ten logs each mention delayed replacement parts. A summary can make that pattern easy to retrieve for “What repeatedly slowed repairs?” But it may omit that the problem occurred only at one site or during a specific month.

Store links from each summary to the child nodes and original source spans that generated it. When an answer needs an exact count, date or exception, descend to the underlying evidence rather than treating the abstract summary as a complete substitute.

This is the same source-preservation problem discussed in [summarisation](/blog/nlp/summarisation/), now embedded inside the retrieval index itself.

## Compression can accumulate omissions

Consider an illustrative chain in which a detail has a 0.9 probability of surviving each independent summarisation level. After three levels, its survival probability would be $$0.9^3=0.729$$. Real omissions are correlated, so this is not a model of RAPTOR's measured error; it demonstrates why repeated compression deserves an audit.

A qualification omitted at the first level cannot be recovered by summarising that summary more elegantly. Preserve leaf retrieval and test whether the system can return to original text when a question demands detail.

## The index has an offline cost

Clustering, embedding and generating summaries consume compute before any user query arrives. Updates can invalidate multiple ancestor summaries. A changed charging rule may need propagation through a section summary and then a corpus-level summary.

Report build cost, refresh cost, summary volume and query-time cost separately. A fast query path can depend on substantial preprocessing, and a cheap refresh that leaves stale ancestors can produce inconsistent answers.

## Evaluate abstraction and detail separately

Use local factual questions, cross-section questions and broad thematic questions. Compare original-chunk retrieval, summary-only retrieval and mixed-level retrieval under comparable reading budgets. Count both sufficient evidence coverage and fidelity of the derived summaries.

For a question about an exception, summary retrieval may hurt even if it improves broad-theme answers. For a synthesis question, leaf-only retrieval may scatter evidence across too many chunks. The useful claim is task-dependent improvement, not universal superiority of a tree-shaped index.

## Compare with graph-based approaches

RAPTOR organises recursively compressed text. [GraphRAG](/blog/nlp/rag-graphrag/) organises extracted entities and relationships and uses community summaries for global synthesis. A text-cluster hierarchy and an entity graph encode different structure.

Both introduce derived material that can be easier to retrieve than raw text, and both need lineage back to sources. Choose a structure based on the question's evidence pattern rather than assuming that a more elaborate index automatically supplies better reasoning.

<div class="insight-box">
  <strong>Key Insight:</strong> RAPTOR makes abstraction searchable. That is useful when the relevant pattern spans many local passages, but it also makes summarisation quality part of retrieval quality.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A higher-level summary may omit a decisive exception. Keep original chunks searchable and preserve a path from derived summaries to the source text.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>RAPTOR recursively clusters and summarises text.</li>
    <li>Retrieval can select detailed leaves and higher-level nodes.</li>
    <li>Derived summaries need source lineage and fidelity checks.</li>
    <li>Compare build, update and query costs alongside task-specific quality.</li>
  </ul>
</div>

## References

1. Sarthi et al. [RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval](https://arxiv.org/abs/2401.18059). ICLR, 2024.
2. Edge et al. [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130). Preprint, 2024.
3. Liu et al. [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172). TACL, 2024.
