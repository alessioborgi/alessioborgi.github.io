---
layout: single
title: "Self-RAG: Learning When to Retrieve and How to Critique Evidence"
date: 2026-10-20 09:12:00 +0100
categories: [nlp]
book: nlp
subsection: rag-adaptive
tags: ["nlp", "rag", "self-rag", "reflection", "adaptive-retrieval"]
excerpt: "Explain retrieval and reflection tokens, separate relevance from support and utility, and analyse why self-assessment needs independent evaluation."
author_profile: true
read_time: true
is_overview: false
icon: "🪞"
read_mins: 4
permalink: /blog/nlp/rag-self-rag/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Self-RAG trains a generator to emit retrieval and reflection signals alongside text. These signals help decide whether to retrieve and assess relevance, support and usefulness during generation. They are learned predictions, not independent verification that an answer is true.
</div>

## A trained control interface

Self-RAG augments generation with special signals for retrieval and reflection. Its training pipeline uses critique annotations to teach a generator when external evidence may be needed and how to assess retrieved material and generated segments. Inference can use these signals to select among candidate continuations.

The paper's method is more specific than adding “check your answer” to a prompt. Its behaviour depends on training data, special-token supervision and a decoding policy. A prompt-only critique baseline is a useful comparison, but it is not the same trained system.

## Three assessments answer different questions

| Assessment | Question | Example failure |
|---|---|---|
| Relevance | Does this passage address the query? | A related product manual |
| Support | Does the passage establish this generated claim? | A claim that reverses a qualification |
| Utility | Does this answer help satisfy the request? | A supported but uninformative sentence |

A relevant passage can contradict the proposed answer. A supported answer can omit the main requested comparison. Keeping these axes separate prevents one broad “quality” score from hiding the reason a candidate should be rejected.

## Segment-level decisions

Suppose an answer first states a well-supported release date, then attempts to explain why a design changed. The first segment may have adequate evidence while the second needs a different source. A retrieval decision at a later segment can respond to that change in information needs.

A static pipeline retrieves once from the initial question. Self-RAG's control signals create a different opportunity: the generation process can condition its next action on what it is about to say. This also creates another failure mode if an earlier mistaken claim steers later retrieval.

## Candidate selection is a policy

A schematic candidate score might combine generation likelihood with learned relevance, support and utility signals:

<div class="formula-box">
\[
S(y,d)=\log p_\theta(y\mid x,d)+\alpha R(d,x)+\beta S_{\mathrm{support}}(y,d)+\gamma U(y,x).
\]
</div>

This equation illustrates multi-criterion decoding, not a replacement for the paper's exact token-based scoring procedure. The weights express a preference over candidates; increasing support weight may improve groundedness while changing length or coverage.

For a toy comparison, candidate A has utility 0.9 but support 0.3; candidate B has utility 0.7 and support 0.9. A utility-only selector picks A. With equal weights on these two axes, B scores 1.6 against A's 1.2. Neither toy number should be interpreted as a calibrated probability without validation.

## Self-critique can share the generator's blind spots

If the same training distribution rewards a misleading lexical cue in both generation and support judgement, the two components can agree on the wrong answer. Agreement is not independent corroboration.

Test critiques with controlled negatives: a source denying the answer, a correct fact about the wrong entity, an obsolete document and a passage that contains only part of a compound claim. Compare predicted support with human-labelled evidence relations.

## Measure retrieval decisions as well as answers

Record retrieval frequency, useful-evidence acquisition, unsupported-claim rate and total cost. A model can appear more accurate by retrieving on every question, which does not demonstrate selective retrieval. Conversely, a model can reduce calls by declining to retrieve on questions it answers incorrectly from memory.

Evaluate easy closed-book questions, answerable evidence-dependent questions and genuinely unanswerable questions. Use a fixed search system to isolate the controller, then vary the retriever to test robustness.

[CRAG and Adaptive-RAG](/blog/nlp/rag-crag-adaptive/) place control decisions at different points, while [FLARE](/blog/nlp/rag-flare/) uses anticipated output and confidence to trigger retrieval. Comparing the signal that causes a search is more informative than grouping them all under “self-correction”.

<div class="insight-box">
  <strong>Key Insight:</strong> Useful self-reflection separates the need for information from the quality of retrieved evidence and the support of the proposed answer. Each signal can fail independently.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A reflection token is a model prediction. Do not treat a model’s own “supported” judgement as a substitute for an evidence audit or independent evaluation.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Self-RAG learns retrieval and reflection signals through training.</li>
    <li>Relevance, support and utility measure distinct properties.</li>
    <li>Decoding weights change the operating policy.</li>
    <li>Evaluate control decisions, answer support and search cost together.</li>
  </ul>
</div>

## References

1. Asai et al. [Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/abs/2310.11511). ICLR, 2024.
2. Gao et al. [Enabling Large Language Models to Generate Text with Citations](https://arxiv.org/abs/2305.14627). EMNLP, 2023.
3. Jiang et al. [Active Retrieval Augmented Generation](https://arxiv.org/abs/2305.06983). EMNLP, 2023.
