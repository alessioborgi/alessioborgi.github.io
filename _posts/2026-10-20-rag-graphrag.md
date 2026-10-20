---
layout: single
title: "GraphRAG: Entity Graphs, Community Reports and Global Questions"
date: 2026-10-20 09:18:00 +0100
categories: [nlp]
book: nlp
subsection: rag-structured
tags: ["nlp", "rag", "graphrag", "knowledge-graphs", "global-search"]
excerpt: "Explain the original GraphRAG approach to corpus-level synthesis, distinguish communities from evidence proofs, and audit extraction and summarisation errors."
author_profile: true
read_time: true
is_overview: false
icon: "🕸️"
read_mins: 5
permalink: /blog/nlp/rag-graphrag/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The original GraphRAG paper targets global questions by extracting an entity graph, building communities and summarising them into reports used for query-focused synthesis. A graph helps organise coverage, but extracted edges and community reports remain fallible representations of the source corpus.
</div>

## A different question from local fact lookup

“Which firmware supports charger E2?” may be answered by one passage. “What themes explain maintenance delays across these reports?” requires broad coverage. A nearest-neighbour search for a few local chunks can miss themes distributed across the collection.

The GraphRAG paper addresses this global query-focused summarisation setting. It extracts entities and relationships, organises the resulting graph into communities, generates community reports and uses those reports to produce and combine query-focused answers. This specific pipeline is more informative than the generic label “RAG with a graph”.

## The graph is an extracted model of the corpus

A source sentence might yield a relation such as `supplier → delayed → component`. Entity resolution determines whether repeated names refer to the same supplier; relation extraction determines what the edge means.

Errors at either step change the topology. Merging two companies with similar names can create a false cross-document connection. Splitting one company into several aliases can hide a genuine recurring theme. The [entity-linking chapter](/blog/nlp/named-entities-and-linking/) explains why a string match alone is insufficient.

Store source spans, dates and qualifiers with extracted relationships. An edge labelled `supports` cannot safely discard the source's “only under firmware 4” condition.

## Communities organise synthesis

Graph communities group densely connected entities or relationships according to the clustering procedure. Reports summarise those groups and can be organised hierarchically. A query can then be addressed across many community reports before the partial answers are combined.

For an illustrative fleet corpus, one community may concern supplier delays and another battery maintenance. A global question can combine both reports even if no original paragraph discusses the whole organisation. This is an opportunity for wider coverage, not a proof that every theme is represented or equally important.

Graph density reflects extraction and corpus frequency as well as real-world relationships. A frequently mentioned project can dominate a community even if its issue is less severe than a rare incident.

## A coverage calculation

Suppose a corpus contains four equally weighted themes. Local retrieval finds strong passages for two, while community retrieval exposes summaries of all four. Coverage increases from one-half to one in this constructed example.

But if one summary invents a causal relationship, broader coverage can come with worse faithfulness. Evaluate thematic coverage and support separately. Do not combine them into a single narrative judgement that rewards length or the appearance of comprehensiveness.

## Source truth must survive multiple transformations

The path is source text → extracted graph → community report → query-specific synthesis. Each transformation can introduce omissions or reinterpretations. A citation to the final report is useful for navigation, but a high-stakes detail or contested relationship should be traceable further back to the underlying source.

For example, two reports may say that a supplier delay and a battery failure occurred in the same month. A summary that says the delay caused the failure adds a causal claim not established by co-occurrence or graph connectivity.

## Compare costs and question classes

Graph construction and report generation are substantial offline work. Updating one entity or relationship can affect community descriptions and cached answers. Measure build and refresh cost, not only query latency.

Compare global and local question sets separately against chunk retrieval and [RAPTOR](/blog/nlp/rag-raptor/). Hold the source collection and answer budget fixed. Report extraction quality, evidence coverage, answer support and the human-evaluation rubric.

## Avoid treating a graph path as an entailment proof

A path can connect a product, a supplier and a country without supporting the claim that the product was manufactured in that country. Edge types, direction, temporal scope and source qualifications determine whether composition is valid.

The graph provides an index over possible relationships. The final answer still needs an evidence-supported interpretation. [LightRAG](/blog/nlp/rag-lightrag/) uses another graph-based retrieval design, which should be compared on its actual retrieval and update mechanisms rather than grouped as an identical architecture.

<div class="insight-box">
  <strong>Key Insight:</strong> GraphRAG’s global synthesis comes from organising and summarising evidence across communities. Graph connectivity itself does not certify a factual or causal conclusion.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Entity extraction, entity resolution and report generation can each change the meaning of the source. Preserve provenance through every layer instead of citing derived reports as unquestionable facts.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>The original GraphRAG pipeline targets broad query-focused synthesis.</li>
    <li>Entity and relation errors alter the graph used for retrieval.</li>
    <li>Community coverage and answer faithfulness are separate evaluation axes.</li>
    <li>Build costs, update propagation and source lineage belong in comparisons.</li>
  </ul>
</div>

## References

1. Edge et al. [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130). Preprint, 2024.
2. Sarthi et al. [RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval](https://arxiv.org/abs/2401.18059). ICLR, 2024.
3. Gao et al. [Enabling Large Language Models to Generate Text with Citations](https://arxiv.org/abs/2305.14627). EMNLP, 2023.
