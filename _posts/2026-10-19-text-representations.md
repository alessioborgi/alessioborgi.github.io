---
layout: single
title: "Text Representations: Counts, TF–IDF and Word Vectors"
date: 2026-10-19 09:06:00 +0100
categories: [nlp]
book: nlp
subsection: representations
tags: ["nlp", "tf-idf", "embeddings"]
excerpt: "How sparse counts and dense vectors encode text, what similarity means, and which distinctions disappear when word order is removed."
author_profile: true
read_time: true
is_overview: false
icon: "🔤"
read_mins: 6
permalink: /blog/nlp/text-representations/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A representation decides which texts look similar. Counts preserve lexical identity, TF–IDF adjusts for document frequency, and dense vectors can share information across words. Every representation also discards information.
</div>

## Build a tiny document space

For the vocabulary `[battery, screen, broken]`, represent a document by counts in that order:

| Text | Vector |
|---|---|
| “battery broken” | (1, 0, 1) |
| “screen broken” | (0, 1, 1) |
| “battery battery” | (2, 0, 0) |

The first two overlap on “broken”; the first and third overlap on “battery”. Which similarity matters depends on whether we want to group failures or product components.

A bag of words loses order. “Robots help people” and “people help robots” have identical counts. Adding word bigrams preserves some local order, at the cost of a larger and sparser feature space.

## Weight terms by document frequency

One simple TF–IDF convention is

<div class="formula-box">
\[
\operatorname{tfidf}(w,d)=C(w,d)\log\frac{N}{\operatorname{df}(w)},
\]
</div>

where $$N$$ is the number of training documents and $$\operatorname{df}(w)$$ counts documents containing the term. A term appearing in two of eight documents gets an IDF of $$\log 4$$; one appearing in every document gets zero under this convention. Implementations may add smoothing or rescale term frequency, so record the exact variant.

Fit the vocabulary and IDF on training data. Otherwise the held-out documents influence the representation used to evaluate the model.

## Compare directions

For nonzero vectors, cosine similarity is

<div class="formula-box">
\[
\cos(x,y)=\frac{x^\top y}{\lVert x\rVert\lVert y\rVert}.
\]
</div>

In the table, the first and second vectors have cosine $$1/2$$. Repeating the entire first document doubles its counts without changing its direction. Cosine therefore removes this particular effect of document length. It does not establish that two documents mean the same thing.

## Dense representations

A static word embedding assigns a learned vector to a vocabulary item. Distributional training uses patterns of surrounding words, allowing related terms to share statistical information. A contextual representation instead depends on the occurrence: “bank” beside “river” can receive a different vector from “bank” beside “loan”.

Neither makes similarity equivalent to truth or entailment. “Working” and “broken” may occur in very similar product descriptions while expressing opposite outcomes. Averaging word vectors can also erase who did what to whom.

For a practical diagnostic, compare representations of “battery works”, “battery does not work” and “screen works”. Check whether the distances reflect the distinctions your application needs before interpreting a nearest neighbour as a semantic answer.

## Sparse storage and feature identity

With a vocabulary of $$V$$ terms, a document vector has $$V$$ coordinates even if only a few are nonzero. A dense matrix for $$D$$ documents requires $$DV$$ stored values. A sparse representation stores the nonzero values and indices, making cost depend largely on observed document–term pairs.

Suppose 10,000 documents use a vocabulary of 50,000 terms, with an average of 100 nonzero features per document. The dense matrix contains 500 million entries; the sparse matrix contains roughly one million nonzero values plus indexing overhead. The exact memory depends on numeric and index types, but the order-of-magnitude difference explains why sparse linear baselines can remain practical.

The vocabulary map is a learned artefact. Coordinate 17 must mean the same term at training and inference. Rebuilding the map on new input while reusing old classifier weights silently connects weights to the wrong words.

## Normalisation changes a classifier's evidence

Let a linear classifier score a document as $$s(x)=w^\top x+b$$. If a document is repeated twice, raw counts become $$2x$$ and the lexical contribution doubles. With unit-length normalisation, $$x/\lVert x\rVert$$ and $$2x/\lVert2x\rVert$$ are identical.

Neither choice is universally correct. Repetition can be evidence of emphasis, or merely a result of document length. Decide whether the task should use that magnitude and verify the effect on held-out data. Empty documents need special handling because their vector has zero norm.

For the earlier `battery broken` example, $$x=(1,0,1)$$ has norm $$\sqrt2$$. Its unit vector is $$(1/\sqrt2,0,1/\sqrt2)$$. A classifier with weights $$(2,-1,1)$$ gives lexical score three on raw counts and $$3/\sqrt2$$ on the unit vector. Normalisation changes the score scale and may therefore require retraining or recalibration.

## Hashing trades a vocabulary map for collisions

Feature hashing maps strings into a fixed number of buckets. It avoids storing a complete vocabulary and can accept unseen feature names, but distinct terms can collide. A signed hashing convention can reduce some collision bias; it cannot recover which original term contributed to a collided coordinate.

This tradeoff matters for interpretation. A large weight on one bucket may combine several unrelated terms, so reporting that weight as the importance of a single word is misleading. Choose a bucket count using the resource budget and validation results, and retain an inspectable vocabulary baseline for comparison where possible.

## Probe what the representation erased

Use paired texts with controlled differences: swapped subject/object roles, an added negation, a changed product code and a harmless spelling variant. Some pairs should move apart and others should remain close. These checks reveal the representation's invariances before a downstream model hides them behind a score.

For the statistical construction of word–context vectors, continue with [PMI and SVD](/blog/nlp/distributional-semantics/). For learned predictive vectors, see [word2vec](/blog/nlp/word2vec/) and [GloVe and fastText](/blog/nlp/glove-and-fasttext/).

<div class="insight-box">
  <strong>Key Insight:</strong> A representation defines which changes are visible to later models. If two documents become exactly the same vector, no classifier using only that vector can distinguish them.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Fit and save the entire feature pipeline, not just the classifier. Vocabulary order, IDF values, normalisation and hashing conventions must match at inference.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Counts and TF–IDF expose lexical evidence directly.</li>
    <li>Cosine compares directions and requires a policy for zero vectors.</li>
    <li>Distributional similarity does not imply equivalent meaning.</li>
  </ul>
</div>

## References

1. Manning, Raghavan and Schütze, [Inverse document frequency](https://nlp.stanford.edu/IR-book/html/htmledition/inverse-document-frequency-1.html), gives the IDF construction. Jurafsky and Martin, [Vector Semantics and Embeddings](https://web.stanford.edu/~jurafsky/slp3/6.pdf), develops distributional representations.
2. Manning, Raghavan and Schütze. [Term Frequency and Weighting](https://nlp.stanford.edu/IR-book/html/htmledition/term-frequency-and-weighting-1.html). *Introduction to Information Retrieval*.
