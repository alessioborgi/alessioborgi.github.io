---
layout: single
title: "Citations in RAG: ALCE, Claim Support and Source Provenance"
date: 2026-10-20 09:21:00 +0100
categories: [nlp]
book: nlp
subsection: rag-evidence
tags: ["nlp", "rag", "alce", "citations", "attribution"]
excerpt: "Distinguish answer correctness from citation correctness, audit compound claims, and trace generated statements through summaries and graphs to source evidence."
author_profile: true
read_time: true
is_overview: false
icon: "📎"
read_mins: 5
permalink: /blog/nlp/rag-attribution/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> ALCE studies generating answers with citations and evaluating their quality. A citation must support the associated claim, not merely point to a relevant page. Correctness, citation coverage and citation precision are distinct, and derived summaries need provenance back to original material.
</div>

## A source marker is not an explanation

“The R7 supports outdoor charging [1]” looks grounded, but source [1] might discuss the R8 or state that R7 outdoor charging is prohibited. The presence of a numbered marker establishes only a link, not an entailment relation.

The ALCE work introduces a framework for evaluating answers with citations, including answer quality and citation support. It makes attribution an explicit evaluation target rather than assuming that retrieved documents automatically justify the output.

## Split compound claims before judging support

Consider “R7 launched in 2021 and supports charger E2.” A source may establish the launch year but say nothing about the charger. If one citation is attached to the whole sentence, a sentence-level glance can over-credit partial support.

Represent the output as claims $$c_1,\ldots,c_n$$ and associated source sets $$S_i$$. The key question is whether $$S_i$$ jointly establishes $$c_i$$ under the task's interpretation rules. Some claims need two passages; others require one specific qualification within a long passage.

This is related to [natural language inference](/blog/nlp/natural-language-inference/), but an NLI model can itself make mistakes. Human checks and domain-specific cases remain useful for evaluating automated citation judgements.

## Coverage and precision ask different questions

In a simplified audit, citation coverage measures the fraction of claims needing evidence that receive adequate support. Citation precision measures whether attached sources provide relevant support rather than being decorative or misleading. Exact implementations, including ALCE's, require their own matching and support rules.

Suppose four claims require evidence, three are adequately supported, and five citation links are attached. If only four links contribute valid support under the audit rubric, claim coverage is $$3/4$$ and link precision $$4/5$$. These illustrative denominators should not be silently substituted for a benchmark's official metrics.

Adding ten irrelevant citations cannot improve support for the missing claim. Conversely, one compact source can support several claims if the relevant statements are actually present.

## Correctness and faithfulness can diverge

A model may correctly remember a release date while citing a passage that never mentions it. The answer is correct but the citation is unsupported. It may also faithfully repeat an outdated source, producing an answer that is supported by that source but inappropriate for a question about the current version.

Evaluate source applicability, not just textual entailment. Dates, product variants, jurisdiction or document status can change which source is relevant. Preserve these attributes through [chunking and index updates](/blog/nlp/rag-chunking-indexes/).

## Derived evidence needs a lineage

A [RAPTOR summary](/blog/nlp/rag-raptor/) or [GraphRAG report](/blog/nlp/rag-graphrag/) is produced from other text. Citing that derived node identifies where the generator read the claim, but it does not verify that summarisation preserved the originals.

Store the chain from answer claim to selected node, then to source documents and spans. For a graph edge, retain the evidence supporting the relationship and its qualifiers. For a summary, retain its child sources and version. A source correction should invalidate affected derived claims and cached answers.

## Citation formatting is part of the interface

Give citations stable IDs and map them to actual retrieved sources. Check that every emitted marker resolves, that quoted spans exist and that truncation has not removed the cited material. A generator should not invent a bibliographic title or URL to fill a missing citation slot.

Prefer source locations precise enough for a reader to verify the claim. A link to an entire manual is less helpful than a section or page reference, especially when the manual contains both the rule and its exceptions.

## A practical evaluation set

Include sources with wrong entities, explicit denials, partial support, conflicting dates and copied text. Test whether removing a decisive citation makes the claim unsupported, and whether the model can acknowledge an evidence gap instead of attaching an unrelated source.

Report answer completeness alongside citation quality. A system that says almost nothing can obtain excellent support scores while failing the user's request. Grounded usefulness requires both substantive answers and evidence that justifies them.

<div class="insight-box">
  <strong>Key Insight:</strong> Attribution is a claim-to-evidence relation. A source can be relevant to the topic while failing to support the sentence beside its citation.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Do not reward citation quantity as evidence quality. Audit compound claims, source applicability and the provenance of any generated summaries used as evidence.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>ALCE makes citation quality an explicit evaluation target.</li>
    <li>Separate claim coverage from the precision of attached sources.</li>
    <li>Correct answers and correctly supported answers are not identical sets.</li>
    <li>Preserve stable source IDs, locations, versions and derived-evidence lineage.</li>
  </ul>
</div>

## References

1. Gao et al. [Enabling Large Language Models to Generate Text with Citations](https://arxiv.org/abs/2305.14627). EMNLP, 2023.
2. Es et al. [Ragas: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2309.15217). EACL System Demonstrations, 2024.
3. Edge et al. [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130). Preprint, 2024.
