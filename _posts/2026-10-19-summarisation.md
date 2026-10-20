---
layout: single
title: "Summarisation: Selection, Compression and Faithfulness"
date: 2026-10-19 09:32:00 +0100
categories: [nlp]
book: nlp
subsection: applications
tags: ["nlp", "summarisation", "rouge", "faithfulness"]
excerpt: "Compare extractive and abstractive summaries, derive a redundancy-aware selector and a ROUGE example, and audit factual claims against the source."
author_profile: true
read_time: true
is_overview: false
icon: "📝"
read_mins: 5
permalink: /blog/nlp/summarisation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A summary selects and compresses source information under a length and purpose constraint. Extractive systems select spans; abstractive systems generate wording. Coverage, redundancy, coherence and faithfulness are separate objectives, and overlap metrics cannot verify all of them.
</div>

## Define what the summary is for

A one-sentence incident report, a search-result snippet and a long research digest require different information. A generic salience score cannot decide which details matter without a task definition. A query-focused summary should prioritise the user's question; a general summary may aim for broader coverage.

Length is also a resource constraint. A system asked to summarise a long report in 40 words must omit information. Evaluate whether it omitted the right information rather than treating every missing detail as an error.

## Extractive selection with redundancy control

An extractive model scores source sentences and chooses a subset. Selecting the individually highest-scoring sentences can repeat the same point. A simple maximal marginal relevance rule balances relevance with similarity to already selected sentences:

<div class="formula-box">
\[
\operatorname{MMR}(s)=\lambda\operatorname{rel}(s,q)
-(1-\lambda)\max_{s'\in S}\operatorname{sim}(s,s').
\]
</div>

Here $$S$$ is the selected set and $$q$$ may represent a query or document-centre criterion. Scores should be placed on compatible scales before mixing them. The empty-set redundancy term needs a defined initial value, commonly zero.

Suppose two remaining sentences have relevance 0.9 and 0.8. Their maximum similarity to the selected set is 0.9 and 0.1. With $$\lambda=0.7$$, their MMR scores are 0.36 and 0.53. The less individually relevant sentence wins because it contributes more new information.

## Extraction is not automatically coherent

A selected sentence may begin “This caused the failure” after the sentence naming the cause was omitted. It may also contain a pronoun whose antecedent is absent. Sentence order and reference repair matter even when every output word came from the source.

Extraction can preserve a quoted claim while dropping its attribution, creating a misleading impression. Faithfulness is therefore not guaranteed by copying: the selection must preserve the context needed to interpret the copied text.

## Abstraction adds expressive power and risk

A generative model can combine several source sentences, resolve repetition and express a concise paraphrase. It can also substitute an entity, alter a number or turn a tentative statement into a definite one. Fluency makes those errors harder to notice.

Copy mechanisms explicitly mix generating a vocabulary word with copying from the source. A simplified distribution is

<div class="formula-box">
\[
P(w)=p_{\mathrm{gen}}P_{\mathrm{vocab}}(w)
+(1-p_{\mathrm{gen}})\sum_{i:x_i=w}\alpha_i.
\]
</div>

The sum aggregates attention mass over source positions spelling the same word. This can support rare names and numbers, but copying the wrong span or omitting a qualifier still creates an error.

## Calculate a ROUGE-style overlap

ROUGE-N commonly measures overlap of n-grams with a reference, often reported with recall and sometimes precision/F1 variants. State the metric variant, tokenisation and aggregation procedure.

For reference “robot repaired battery” and candidate “robot repaired screen”, two of three unigrams overlap, giving unigram precision and recall of $$2/3$$ in this toy example. One of two bigrams overlaps, giving bigram recall $$1/2$$. The candidate changed the repaired object, a factual error that still receives substantial overlap credit.

Longer common-subsequence measures capture another form of similarity, but none of these calculations establishes that the summary's propositions follow from the source. Multiple valid paraphrases also limit how completely one reference describes acceptable summaries.

## Audit claims, not only strings

Break a summary into claims and check participants, actions, quantities, time, negation, modality and attribution. “The prototype may reduce errors” does not support “The prototype reduces errors”. “Rossi reported a failure” does not necessarily support the unqualified claim that the failure occurred.

Record a source span for each important claim. If evidence is distributed across the document, inspect the combination rather than assuming proximity. Contradictory sources may require an explicit statement of disagreement.

## Evaluate under the actual budget

Compare systems at similar length budgets and on the same document distribution. A longer summary can increase recall simply by saying more. Report human judgements with a clear rubric for coverage, coherence and source support, and inspect whether automatic metrics agree with those judgements on the error types that matter.

For long documents, evaluate whether the retrieval or chunk-selection stage discarded key evidence before generation. A summariser cannot faithfully include a critical qualification it was never allowed to see.

## Where this goes next

When summaries become searchable evidence, their errors can propagate into later answers. [RAPTOR](/blog/nlp/rag-raptor/) builds a hierarchy of summaries, while [GraphRAG](/blog/nlp/rag-graphrag/) uses graph communities and reports for corpus-level synthesis. Both make the relationship between a compressed representation and its original sources essential.

<div class="insight-box">
  <strong>Key Insight:</strong> Faithfulness concerns the relationship between output claims and source evidence. It is separate from how much wording overlaps with a reference summary.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Copying source text can still mislead when attribution, negation or a necessary antecedent is omitted. Extraction reduces some generation errors but does not eliminate interpretation errors.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Summary quality depends on purpose and length budget.</li>
    <li>Redundancy-aware selection balances salience with new information.</li>
    <li>Copy mechanisms help retain source strings but do not guarantee factuality.</li>
    <li>Overlap metrics and claim-level source checks should be interpreted separately.</li>
  </ul>
</div>

## References

1. Lin, C.-Y. [ROUGE: A Package for Automatic Evaluation of Summaries](https://aclanthology.org/W04-1013/). 2004.
2. See, Liu and Manning. [Get To The Point: Summarization with Pointer-Generator Networks](https://aclanthology.org/P17-1099/). ACL, 2017.
3. Maynez et al. [On Faithfulness and Factuality in Abstractive Summarization](https://aclanthology.org/2020.acl-main.173/). ACL, 2020.
