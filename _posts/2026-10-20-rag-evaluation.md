---
layout: single
title: "Evaluating RAG: RAGAS, ARES and Evidence-Centred Experiments"
date: 2026-10-20 09:20:00 +0100
categories: [nlp]
book: nlp
subsection: rag-evidence
tags: ["nlp", "rag", "ragas", "ares", "evaluation"]
excerpt: "Separate retrieval coverage, faithfulness and answer quality, compare automated evaluation approaches, and calibrate judge predictions against human labels."
author_profile: true
read_time: true
is_overview: false
icon: "🧪"
read_mins: 5
permalink: /blog/nlp/rag-evaluation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> RAG evaluation must distinguish whether evidence was found, whether the answer used it faithfully and whether the answer satisfied the question. RAGAS proposes automated evaluation dimensions; ARES combines learned judges with human-labelled validation and statistical correction. Automated scores are measurements that need their own validation.
</div>

## Begin with the failure you want to detect

A retrieved passage can be relevant but insufficient. An answer can be supported but incomplete. A correct answer can cite the wrong source. These cases need different labels, so define a schema before selecting metrics.

For each question, record the corpus snapshot, any acceptable answers, supporting evidence, the retrieved set, the selected context and the final claims. Keep unanswerable questions and conflicting-source cases in the test set rather than assuming every query has one clean answer.

| Layer | Example measurement | What it cannot establish alone |
|---|---|---|
| Retrieval | Supporting-evidence recall@k | Correct use by the reader |
| Context selection | Sufficient evidence retained | Final answer faithfulness |
| Generation | Correctness and requested coverage | Accurate source attribution |
| Attribution | Claim-level citation support | Completeness of the answer |
| Operation | Calls, tokens, latency, freshness | Linguistic quality |

## What RAGAS contributes

The RAGAS paper develops automated evaluation of retrieval-augmented generation, including faithfulness, answer relevance and context quality. Its reference-free emphasis is useful when full human reference answers are expensive, but it does not make the evaluator infallible.

Do not assume every metric in every later software version has identical inputs or is reference-free. State the paper-style definition or the exact implemented metric, judge model, prompt and version used in the experiment. This chapter describes evaluation ideas rather than a moving library API.

## A claim-based example

Suppose an answer contains five atomic claims, four supported by the supplied context and one unsupported. A simple support fraction is $$4/5=0.8$$. That score changes if a sentence containing three claims is counted as one unit, or if the annotator disagrees about what follows from the source.

An answer repeating a supported trivial fact five times could score perfectly under that fraction while failing the request. Pair faithfulness with answer coverage and relevance. Also distinguish claims unsupported by the retrieved context from claims that are false in the world; those are overlapping but different categories.

## What ARES adds

ARES uses synthetic training data for lightweight evaluation judges and human-labelled examples to support statistical estimation, including prediction-powered inference. It aims to estimate dimensions such as context relevance, answer faithfulness and answer relevance efficiently while accounting for judge errors.

A simplified correction intuition is

<div class="formula-box">
\[
\hat\mu=\operatorname{mean}_{\mathrm{large\ pool}}\hat f(x)
+\operatorname{mean}_{\mathrm{labelled\ sample}}\bigl(y-\hat f(x)\bigr).
\]
</div>

If the judge's large-pool mean is 0.8 and a representative labelled sample reveals an average overestimate of 0.1, the corrected estimate is 0.7. This illustrates residual correction, not a complete confidence-interval implementation. Sampling, dependence and the chosen estimator determine valid uncertainty calculations.

## A judge needs a test set too

Validate automated judgements on wrong-entity passages, negated claims, partial support, stale versions and plausible hallucinations. Judge agreement with humans can vary by domain and answer length. Long polished answers may receive favourable style-based assessments even when they contain unsupported details.

Use blinded comparisons and inspect disagreements. If model A generated both the answer and the evaluation data used to train the judge, correlated biases deserve special attention. A second model's agreement is not automatically independent evidence.

## Isolate retrieval from generation

Run oracle-evidence, shuffled-evidence and no-evidence conditions. A good answer with shuffled evidence may reveal reliance on model memory; a bad answer with oracle evidence reveals a reader or task-format bottleneck.

For retriever transfer, BEIR is a useful related benchmark family, but retrieval benchmark gains do not establish end-to-end RAG gains. RAGTruth supplies another relevant direction: human annotations of hallucination in RAG outputs can inform targeted faithfulness checks. Keep benchmark task definitions separate rather than merging their scores.

## Report uncertainty and budgets

Pair systems on the same questions, resample at the independent unit and include training or generation variation where material. Match or report retrieval calls, context tokens and judge cost. Keep a representative human audit alongside automated scores, especially when selecting among many pipeline configurations.

<div class="insight-box">
  <strong>Key Insight:</strong> An automated evaluator is another model in the measurement pipeline. Its errors and calibration affect every comparison made with its scores.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A single “RAG score” can hide whether a system finds evidence, uses it correctly or merely sounds helpful. Report the component definitions and validate the judge on the errors that matter.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Measure evidence access, answer support and usefulness separately.</li>
    <li>RAGAS supplies automated dimensions; definitions and versions still matter.</li>
    <li>ARES uses judge learning and human-informed statistical estimation.</li>
    <li>Use controlled evidence ablations, paired comparisons and human audits.</li>
  </ul>
</div>

## References

1. Es et al. [Ragas: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2309.15217). EACL System Demonstrations, 2024.
2. Saad-Falcon et al. [ARES: An Automated Evaluation Framework for Retrieval-Augmented Generation Systems](https://arxiv.org/abs/2311.09476). NAACL, 2024.
3. Thakur et al. [BEIR: A Heterogenous Benchmark for Zero-shot Evaluation of Information Retrieval Models](https://arxiv.org/abs/2104.08663). NeurIPS Datasets and Benchmarks, 2021.
4. Niu et al. [RAGTruth: A Hallucination Corpus for Developing Trustworthy Retrieval-Augmented Language Models](https://arxiv.org/abs/2401.00396). ACL, 2024.
