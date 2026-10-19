---
layout: single
title: "Lexical Retrieval and BM25: Ranking Documents Without Losing Rare Terms"
date: 2026-10-19 09:29:00 +0100
categories: [nlp]
book: nlp
subsection: applications
tags: ["nlp", "retrieval", "bm25", "ranking"]
excerpt: "Derive term-frequency saturation and length normalisation, compute a BM25 contribution, and evaluate ranked results with query-level metrics."
author_profile: true
read_time: true
is_overview: false
icon: "🔎"
read_mins: 4
permalink: /blog/nlp/lexical-retrieval-bm25/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> BM25 ranks documents using weighted lexical matches, saturating repeated term counts and adjusting for document length. An inverted index makes candidate retrieval efficient. Ranking quality depends on query intent, preprocessing and the relevance definition, not just the scoring formula.
</div>

## Retrieve before reading

A question-answering system cannot inspect every document in a large collection at once. Retrieval finds a smaller candidate set. Lexical methods are especially useful for rare names, codes and exact terminology because they preserve explicit term identity.

An inverted index maps a term to the documents containing it, often with counts and positions. A query can visit those posting lists rather than scanning every document. Preprocessing must agree between indexing and querying: stemming only one side changes which strings can match.

## BM25 combines three effects

For a query $$q$$ and document $$d$$, one common form is

<div class="formula-box">
\[
\operatorname{BM25}(q,d)=\sum_{t\in q}\operatorname{IDF}(t)
\frac{f(t,d)(k_1+1)}{f(t,d)+k_1\left(1-b+b\frac{|d|}{\operatorname{avgdl}}\right)}.
\]
</div>

Here $$f(t,d)$$ is term frequency, $$|d|$$ is document length in indexed tokens, $$k_1>0$$ controls saturation and $$b\in[0,1]$$ controls length normalisation. The sum convention for repeated query terms and the IDF formula vary across implementations; record them.

For the example below, use the positive IDF variant

<div class="formula-box">
\[
\operatorname{IDF}(t)=\log\left(1+\frac{N-\operatorname{df}(t)+0.5}{\operatorname{df}(t)+0.5}\right).
\]
</div>

Other variants omit the outer one and can produce negative weights for very common terms. The name “BM25” does not fully specify those choices.

## Work through one term

Take $$N=100$$ documents, with `battery` in ten. Its IDF is $$\log(1+90.5/10.5)\approx2.264$$. Let $$k_1=1.2$$, $$b=0.75$$ and average document length 100.

For an average-length document containing the term twice, the term-frequency factor is $$2(2.2)/(2+1.2)=1.375$$, giving a contribution of approximately 3.113. For a document of length 200 with the same count, the denominator's length term becomes $$1.2(0.25+1.5)=2.1$$, so the factor is $$4.4/4.1\approx1.073$$ and the contribution about 2.430.

The longer document receives less credit for the same two occurrences. Repeating the term many times cannot increase the factor without bound: as frequency grows, it approaches $$k_1+1$$. This is the saturation that raw counts lack.

## Query language and document language

A user may ask for “power loss” while the document says “battery failure”. Exact matching can miss that relation. Query expansion, synonym resources or learned retrieval can improve coverage, but they can also introduce irrelevant senses. The [word-sense chapter](/blog/nlp/lexical-semantics-and-wsd/) explains why indiscriminate synonym substitution is risky.

A hybrid system combines lexical and dense retrieval. Their raw scores need not be comparable, so use a validated fusion policy rather than adding them arbitrarily. Retaining a lexical route can help preserve rare identifiers that dense similarity overlooks.

## Evaluate a ranking at the query level

Recall@k asks how much relevant material appears among the first $$k$$ results. Reciprocal rank is $$1/r$$ for the first relevant result at rank $$r$$, with a specified value when none is retrieved. For a query whose first relevant document is third, reciprocal rank is $$1/3$$.

With graded relevance, a common discounted cumulative gain is $$\sum_i(2^{rel_i}-1)/\log_2(i+1)$$. NDCG divides by the best possible gain under the same judged items. State the treatment of queries with no relevant documents and of unjudged results.

## Chunking changes the retrieval task

Indexing whole documents versus passages changes lengths, vocabulary statistics and relevance labels. A passage may contain the answer but omit the qualifier in the next paragraph. Store document identifiers and offsets so retrieved chunks can be expanded and inspected.

Evaluate both answer-containing passage recall and downstream answer quality when retrieval supports QA. A high ranking score is not evidence that a passage entails a particular answer; it only measures the retrieval model's match under its scoring rule.

<div class="insight-box">
  <strong>Key Insight:</strong> BM25 distinguishes repeated evidence from independent evidence: more occurrences help, but with diminishing returns and a correction for how much text produced them.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A retrieval score is not a probability of truth or relevance unless an additional calibrated model establishes that interpretation. Do not use a large BM25 value as evidence that a claim is supported.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Inverted indexes retrieve documents through explicit term postings.</li>
    <li>BM25 combines IDF, frequency saturation and length normalisation.</li>
    <li>Implementation variants and tokenisation affect the score.</li>
    <li>Query-level ranking metrics and downstream evidence checks answer different questions.</li>
  </ul>
</div>

## References

1. Manning, Raghavan and Schütze. [Okapi BM25: A Non-Binary Model](https://nlp.stanford.edu/IR-book/html/htmledition/okapi-bm25-a-non-binary-model-1.html). *Introduction to Information Retrieval*.
2. Robertson and Zaragoza. *The Probabilistic Relevance Framework: BM25 and Beyond*. Foundations and Trends in Information Retrieval, 2009.
