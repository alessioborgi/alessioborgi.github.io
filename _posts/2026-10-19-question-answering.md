---
layout: single
title: "Question Answering: Retrieval, Span Extraction and Answerability"
date: 2026-10-19 09:31:00 +0100
categories: [nlp]
book: nlp
subsection: applications
tags: ["nlp", "qa", "reading-comprehension", "answerability"]
excerpt: "Decompose a QA system, derive span scores, and distinguish finding an answer string from demonstrating that the passage supports it."
author_profile: true
read_time: true
is_overview: false
icon: "❓"
read_mins: 4
permalink: /blog/nlp/question-answering/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Question answering combines evidence retrieval with an answer decision. Extractive systems choose a span; generative systems produce text; both need an answerability policy. Evaluate retrieval, reading and complete evidence-supported answering separately.
</div>

## Specify the information boundary

A reading-comprehension task supplies a passage and asks for an answer from it. Open-domain QA must retrieve evidence from a collection. Closed-book QA answers from model parameters without a supplied source. These settings test different capabilities and have different failure modes.

For a corpus-grounded assistant, a correct answer should be supported by the accessible evidence under a stated time and domain scope. A fact remembered from elsewhere may be true yet still fail a task requiring an answer from a particular document.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="nlp-qa-title nlp-qa-desc" viewBox="0 0 660 110" style="max-width:660px;width:100%;height:auto;font-family:system-ui,sans-serif">
<title id="nlp-qa-title">A QA pipeline separates evidence access from the decision to answer.</title>
<desc id="nlp-qa-desc">Question|and scope → Retrieve|passages → Read and|check support → Answer|or abstain</desc>
<rect x="5.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="75.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Question</text>
<text x="75.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">and scope</text>
<text x="155.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="170.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="240.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Retrieve</text>
<text x="240.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">passages</text>
<text x="320.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="335.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="405.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Read and</text>
<text x="405.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">check support</text>
<text x="485.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="500.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="570.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Answer</text>
<text x="570.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">or abstain</text>
</svg>
<figcaption>A QA pipeline separates evidence access from the decision to answer.</figcaption>
</figure>
</div>

## Extract a span

An extractive reader can produce start logits $$s_i$$ and end logits $$e_j$$ over passage tokens. A simple decoder chooses

<div class="formula-box">
\[
(i^*,j^*)=\arg\max_{i\leq j,\ j-i+1\leq L}\left(s_i+e_j\right).
\]
</div>

The ordering and maximum-length constraints prevent invalid spans. Choosing the highest start and end independently can produce an end before the start. A joint span model can represent further dependencies; the factorised score above is a modelling simplification.

For passage “Rossi joined the lab in 2021”, a start distribution peaking at `2021` is helpful for “When did Rossi join?” but irrelevant to “Why did Rossi join?” The latter has no answer in the passage. The existence of a high-scoring span does not establish answerability.

## A constrained example

Suppose start scores for three positions are 3, 1 and 0, while end scores are 0, 2 and 4. With maximum span length two, span [1,3] in one-based indexing is illegal even though its unconstrained score would be seven. The best legal spans [1,2] and [2,3] both score five. Define tie handling or retain uncertainty.

This example shows why decoder constraints must be applied before interpreting the output. A model that was trained on legal spans but decoded without the same restrictions can emit impossible answers.

## No-answer decisions

A reader can include a null option or compare the best answer score with a no-answer score. Tune the decision threshold on validation data containing unanswerable questions. A threshold learned only on answerable examples cannot estimate the intended false-answer tradeoff.

Unanswerability has several causes: no relevant passage was retrieved, the source does not contain the fact, the question contains a false premise, or the answer requires combining evidence the reader cannot handle. Keep these categories separate in error analysis.

## Generating an answer adds another failure mode

A generative reader can paraphrase and combine evidence, but it can also introduce unsupported detail. Returning a source link does not by itself show that the source supports the generated sentence. Check claims against specific spans, including conditions, dates and negation.

If two passages disagree, the task may require reporting the disagreement rather than selecting the more fluent answer. Preserve provenance and source dates so the system can reason about scope rather than silently merging incompatible statements.

## Measure each stage

Retrieval recall asks whether a supporting passage appears among candidates. Reader accuracy conditioned on gold evidence isolates comprehension. End-to-end evaluation measures the pipeline actually used. If retrieval misses the evidence, a stronger reader may have no opportunity to help.

Exact match requires an answer string to match a reference after specified normalisation. Token F1 measures lexical overlap; for predicted `North Harbour` and gold `North Harbour Labs`, precision is one, recall is $$2/3$$ and F1 is 0.8. That partial score does not necessarily mean the named organisation was identified correctly.

Multiple valid answer forms and aliases require an evaluation policy. Also report answerability, unsupported-answer rates and performance on questions requiring more than one sentence. A high extractive F1 should not be advertised as evidence of broad conversational reasoning.

<div class="insight-box">
  <strong>Key Insight:</strong> Answerability is a separate prediction from span selection. Every passage has a highest-scoring span, including passages that contain no answer.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Evaluating only with gold evidence hides retrieval failures. Conversely, evaluating only the whole pipeline can hide whether the bottleneck is retrieval, comprehension or answer rejection.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Define whether evidence is supplied, retrieved or absent.</li>
    <li>Span decoding must enforce start/end and length constraints.</li>
    <li>No-answer thresholds require appropriate validation data.</li>
    <li>Exact match, token F1 and evidence support measure different properties.</li>
  </ul>
</div>

## References

1. Rajpurkar et al. [SQuAD: 100,000+ Questions for Machine Comprehension of Text](https://aclanthology.org/D16-1264/). EMNLP, 2016.
2. Rajpurkar, Jia and Liang. [Know What You Don’t Know: Unanswerable Questions for SQuAD](https://aclanthology.org/P18-2124/). ACL, 2018.
