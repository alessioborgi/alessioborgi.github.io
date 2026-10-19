---
layout: single
title: "Distributional Semantics: Co-occurrence, PMI and Latent Semantic Analysis"
date: 2026-10-19 09:07:00 +0100
categories: [nlp]
book: nlp
subsection: representations
tags: ["nlp", "distributional-semantics", "pmi", "svd"]
excerpt: "Build a word–context matrix, correct raw counts with pointwise mutual information, and derive what a low-rank approximation preserves and loses."
author_profile: true
read_time: true
is_overview: false
icon: "📊"
read_mins: 4
permalink: /blog/nlp/distributional-semantics/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Distributional representations describe words through their contexts. PMI asks whether a pair occurs more often than independence predicts; positive PMI clips negative associations; truncated SVD compresses the resulting matrix. The context definition determines which kind of similarity emerges.
</div>

## First decide what a context is

A context can be a neighbouring word, a document, or a syntactic relation such as “object of repair”. These choices produce different matrices. A wide word window often captures shared subject matter; a dependency context can emphasise grammatical substitutability. There is no context-free meaning of “distributional similarity”.

Let $$X_{wc}$$ count observations of word $$w$$ in context $$c$$. A tiny matrix might contain rows for `battery`, `screen` and `parcel`, with columns for `charge`, `display` and `arrive`. Counts describe evidence, but frequent words and contexts dominate them. A context seen everywhere is less informative than one selectively associated with a word.

## Compare a pair with independence

Let $$N=\sum_{w,c}X_{wc}$$ count word–context events, and let row and column sums define empirical marginals. Pointwise mutual information is

<div class="formula-box">
\[
\operatorname{PMI}(w,c)=\log\frac{P(w,c)}{P(w)P(c)}
=\log\frac{X_{wc}N}{X_{w*}X_{*c}}.
\]
</div>

If a pair occurs exactly as often as independence predicts, the ratio is one and PMI is zero. Positive values indicate more co-occurrence than that baseline; negative values indicate less. The logarithm base changes the numerical scale, not the ranking.

Suppose $$N=100$$, the row total for `battery` is 20, the column total for `charge` is ten, and the pair count is six. Independence predicts two occurrences, while six were observed. PMI is $$\log 3\approx1.099$$ with natural logs. Compare another pair with count six but row and column totals of 40 and 30: its expected count is 12, so its PMI is $$\log(1/2)$$. Identical raw counts can carry opposite associations.

## Positive PMI and the rare-event problem

PPMI replaces negative values with zero:

<div class="formula-box">
\[
\operatorname{PPMI}(w,c)=\max(0,\operatorname{PMI}(w,c)).
\]
</div>

Zero-count pairs have undefined logarithms and are conventionally stored as zero in a sparse PPMI matrix. This is a representation convention, not evidence that their true association is exactly neutral.

A pair seen once can have a very large PMI if both marginals are tiny. High association is not the same as high statistical confidence. Minimum-count filters, smoothing and context-distribution adjustments address different aspects of this issue. Keep the underlying counts available so a striking neighbour can be traced to its evidence.

## Compress with SVD

For a real matrix $$M$$, the singular value decomposition is $$M=U\Sigma V^\top$$. Retaining the largest $$k$$ singular values gives

<div class="formula-box">
\[
M_k=U_k\Sigma_kV_k^\top.
\]
</div>

This is a best rank-$$k$$ approximation under the Frobenius norm. That guarantee concerns matrix reconstruction, not downstream semantic accuracy. Word vectors can be taken as rows of $$U_k\Sigma_k$$ or another explicitly chosen singular-value scaling. Changing the scaling changes distances.

A full-rank factorisation changes coordinates without discarding information. Truncation discards directions. If a rare but important distinction lies in a discarded direction, compression can improve average reconstruction while hurting the task that needs that distinction.

| Decision | What changes |
|---|---|
| Window or dependency context | Which relations count as evidence |
| Counts or PMI | Frequency versus association emphasis |
| Rank $$k$$ | Capacity and smoothing through compression |
| Vector normalisation | How magnitude influences comparison |

## Inspect a neighbour rather than trusting its score

`Broken` and `working` both appear beside product names and may therefore be close. This is useful for identifying a semantic field but dangerous for sentiment. Similar contexts do not guarantee the same truth conditions.

Inspect nearest neighbours, rare-word coverage and a task-specific probe set. Compare the same preprocessing and corpus when studying algorithms; otherwise a difference attributed to SVD versus prediction may actually come from window size or subsampling. The next chapter, [word2vec](/blog/nlp/word2vec/), changes the learning objective while retaining the central idea of learning from contexts.

<div class="insight-box">
  <strong>Key Insight:</strong> PMI separates association strength from raw frequency; SVD separates matrix rank from vocabulary size. Neither operation supplies a guarantee that the preserved geometry matches a particular language task.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A large PMI from one observation is fragile evidence. Always distinguish the magnitude of an estimated association from how reliably that association was estimated.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Word–context matrices depend on a stated context construction.</li>
    <li>PMI measures departure from an independence baseline.</li>
    <li>PPMI clips negative associations and needs a zero-count convention.</li>
    <li>Truncated SVD optimises reconstruction error, not semantic truth.</li>
  </ul>
</div>

## References

1. Church and Hanks. [Word Association Norms, Mutual Information, and Lexicography](https://aclanthology.org/J90-1003/). Computational Linguistics, 1990.
2. Deerwester et al. *Indexing by Latent Semantic Analysis*. Journal of the American Society for Information Science, 1990.
3. Baroni, Dinu and Kruszewski. [Don’t count, predict!](https://aclanthology.org/P14-1023/). ACL, 2014.
