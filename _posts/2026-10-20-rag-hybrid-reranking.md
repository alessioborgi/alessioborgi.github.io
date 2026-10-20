---
layout: single
title: "Hybrid Retrieval and Reranking: BM25, Reciprocal Rank Fusion and Cross-Encoders"
date: 2026-10-20 09:05:00 +0100
categories: [nlp]
book: nlp
subsection: rag-retrieval
tags: ["nlp", "rag", "hybrid-search", "rrf", "reranking"]
excerpt: "Combine lexical and dense candidates without mixing incompatible score scales, calculate RRF, and identify the recall ceiling of a reranker."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 4
permalink: /blog/nlp/rag-hybrid-reranking/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Hybrid search combines complementary retrieval routes. Reciprocal rank fusion uses ranks instead of incomparable raw scores; rerankers then inspect a smaller candidate set more carefully. Fusion broadens candidate coverage, while reranking cannot recover evidence absent from that set.
</div>

## Two routes can fail differently

A lexical retriever can find a rare part number exactly while missing a paraphrased description. A dense retriever can bridge paraphrases while confusing nearby product variants. Their union can cover more useful evidence than either alone, but only if duplicates, filters and budgets are handled consistently.

Do not add a BM25 score of 12 to a cosine score of 0.8 and assume the numbers have comparable meaning. Normalisation or a learned score combiner is possible, but it requires a defined procedure and validation data.

## Reciprocal rank fusion avoids raw score calibration

For document $$d$$ in ranked lists $$L$$, RRF uses

<div class="formula-box">
\[
\operatorname{RRF}(d)=\sum_{\ell\in L:\ d\in\ell}\frac{1}{c+\operatorname{rank}_{\ell}(d)}.
\]
</div>

Ranks here start at one, and an absent item contributes zero. The constant $$c>0$$ controls how strongly the first few ranks dominate; 60 is a commonly used setting, not a universal optimum. The original RRF paper studies rank fusion, not RAG generation.

Suppose A is first lexically and tenth densely, while B is second in both. With $$c=60$$, A scores $$1/61+1/70\approx0.03068$$ and B scores $$2/62\approx0.03226$$. Consistent support across lists puts B ahead. If one route is systematically poor for a query class, equal-weight fusion can still hurt.

```python
def rrf(rankings, constant=60):
    scores = {}
    for ranking in rankings:
        assert len(ranking) == len(set(ranking))
        for rank, doc_id in enumerate(ranking, 1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (constant + rank)
    return sorted(scores, key=lambda doc: (-scores[doc], doc))

assert rrf([["A", "B"], ["B", "C"]])[0] == "B"
```

The assertion prevents one document appearing repeatedly within a list from collecting accidental extra votes. Canonicalise document or chunk identifiers before fusion, especially when retrievers use different segmentation schemes.

## Reranking spends computation on promising candidates

A cross-encoder reads a query and passage together and predicts a relevance score. A sequence-to-sequence reranker can instead estimate a relevance label through generated tokens. Both can use richer interactions than separately encoded vectors, but typically operate on a limited candidate set.

Keep retrieval k and reranking k distinct. If the first stage retrieves 100 passages and the reranker returns ten, measure supporting-evidence retention at both boundaries. A better top-ten precision can coexist with losing the only passage containing an essential exception.

## Candidate coverage imposes a ceiling

If sufficient evidence appears in the union for 88 of 100 questions, a reranker limited to that union cannot recover the missing evidence for the other 12. It can still produce a correct answer from model memory, but that is not successful retrieval-grounded recovery.

Use oracle candidate experiments to locate the bottleneck. If an oracle selector improves answers greatly, ranking or packing may be the issue. If even oracle evidence fails, inspect the reader and the evidence-to-answer task.

## Select complementary context, not only relevant passages

The highest-ranked passages may repeat the same claim. A question comparing two versions needs evidence for both, and a question about an exception needs the rule plus the exception. Consider source diversity and coverage when selecting the final context, then verify that diversity has not promoted weaker evidence over authoritative material.

Evaluate query slices, source duplication, latency and token usage. Compare hybrid retrieval to each constituent retriever and reranking to the same candidate set without reranking. These ablations identify which stage earned the improvement.

<div class="insight-box">
  <strong>Key Insight:</strong> Fusion and reranking solve different problems: fusion changes which evidence is available; reranking changes the order of evidence already available.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A high reranker score is not calibrated proof of answer support. Train and evaluate relevance separately from whether a particular generated claim follows from the passage.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Fuse canonical document identities under consistent scope filters.</li>
    <li>RRF combines ranks rather than raw score scales.</li>
    <li>Rerankers are bounded by candidate-set recall.</li>
    <li>Final context selection should retain complementary evidence and qualifications.</li>
  </ul>
</div>

## References

1. Cormack, Clarke and Büttcher. [Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods](https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf). SIGIR, 2009.
2. Nogueira et al. [Document Ranking with a Pretrained Sequence-to-Sequence Model](https://arxiv.org/abs/2003.06713). Findings of EMNLP, 2020.
3. Karpukhin et al. [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906). EMNLP, 2020.
