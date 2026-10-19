---
layout: single
title: "GloVe and fastText: Global Counts and Subword Sharing"
date: 2026-10-19 09:09:00 +0100
categories: [nlp]
book: nlp
subsection: representations
tags: ["nlp", "glove", "fasttext", "embeddings"]
excerpt: "Compare weighted co-occurrence regression with character n-gram composition, including the objectives, rare-word behaviour and limitations of each."
author_profile: true
read_time: true
is_overview: false
icon: "🧬"
read_mins: 4
permalink: /blog/nlp/glove-and-fasttext/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> GloVe fits weighted log co-occurrence counts with word and context vectors. fastText builds word representations from character n-gram parameters in a predictive model. One changes how corpus statistics are fitted; the other changes how parameters are shared across spellings.
</div>

## Two different questions about word vectors

After [word2vec](/blog/nlp/word2vec/), two natural questions remain. Can we fit the global co-occurrence matrix directly? Can a rare or unseen spelling borrow parameters from familiar parts? GloVe addresses the first; fastText's subword representation addresses the second. These are different modelling dimensions, so “which is more modern?” is not the useful comparison.

Let $$X_{ij}$$ count how often context word $$j$$ appears around word $$i$$. The count depends on window construction and any distance weighting. Preserve that definition when comparing algorithms.

## GloVe as weighted regression

A standard GloVe objective is

<div class="formula-box">
\[
J=\sum_{i,j:X_{ij}\gt 0}f(X_{ij})\left(w_i^\top\tilde w_j+b_i+\tilde b_j-\log X_{ij}\right)^2.
\]
</div>

The vectors model interactions, while biases absorb some word and context frequency effects. The weighting function limits the influence of unreliable small counts and prevents very large counts from dominating purely through their magnitude. A common family uses $$f(x)=(x/x_{\max})^\alpha$$ below $$x_{\max}$$ and one above it.

Why logarithms? A multiplicative count difference becomes additive. If one pair occurs 100 times and another ten times, their log-count difference is $$\log 10$$. The model can express such differences through vector dot products and biases without requiring a score proportional to the raw count.

## Inspect one residual

Suppose $$X_{ij}=4$$, the weight is 0.5, and the current predicted log count is 1.0. The residual is $$1-\log4\approx-0.3863$$. This pair contributes about $$0.5(0.3863)^2\approx0.0746$$ to the objective. Its derivative with respect to the predicted score is $$2(0.5)(1-\log4)\approx-0.3863$$, so gradient descent increases that score.

This arithmetic makes the objective concrete: it is fitting a numeric target for each observed pair. Zero counts cannot enter through $$\log0$$ and are excluded in this formulation. Absence from the observed matrix therefore has a different role than sampled negative evidence in skip-gram training.

## fastText shares pieces across words

Represent a word through a collection of character n-grams, commonly with boundary markers and a whole-word component. Abstractly,

<div class="formula-box">
\[
v_w=\sum_{g\in G(w)}z_g,
\]
</div>

where $$z_g$$ is a learned vector for a subword feature. The precise inclusion and aggregation conventions must be recorded. The important property is shared parameters: `robot` and `robots` reuse several character fragments even if the latter is rare.

For a toy three-character inventory, `<cat>` supplies `<ca`, `cat` and `at>`. `<cats>` supplies `<ca`, `cat`, `ats` and `ts>`. The first two fragments are shared. If the plural word was absent during training, those shared fragments still carry learned values, while unfamiliar fragments may contribute little useful evidence.

## What sharing buys, and what it confuses

Morphologically related forms often benefit from shared fragments. Misspellings may also remain close enough for useful predictions. But shared spelling does not guarantee shared meaning, and unrelated words can overlap in fragments. Conversely, irregular forms such as `go` and `went` share little surface material despite a close morphological relationship.

Hashing n-grams into a fixed bucket table bounds memory but permits collisions: unrelated fragments can update the same parameter. Evaluate this as a resource–accuracy tradeoff rather than assuming every bucket names one linguistic unit.

| Property | GloVe | Subword fastText |
|---|---|---|
| Main emphasis | Weighted global co-occurrence fit | Parameter sharing through spelling |
| Word form unseen in training | Usually no dedicated stored vector | Can compose from available fragment parameters |
| Polysemy | One static representation per stored word | Still a static composition for a spelling |

An unseen-word vector is computable, but its quality is an empirical question. Compare frequent, rare, misspelled and genuinely novel words separately. For sequence labelling, also test whether casing and inflectional distinctions survive the preprocessing used to build those vectors.

<div class="insight-box">
  <strong>Key Insight:</strong> An objective and a parameterisation solve different problems. GloVe changes the statistical fitting target; subword composition changes which examples share learnable parameters.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Being able to construct a vector for an unseen word does not mean its meaning was learned. Inspect how much of that representation comes from well-trained fragments, unknown pieces or hash collisions.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>GloVe fits log counts with a weighted squared-error objective.</li>
    <li>Bias terms and count weighting influence the resulting geometry.</li>
    <li>Subword vectors share parameters across spellings and can support unseen forms.</li>
    <li>Neither static method resolves a word’s sense from sentence context.</li>
  </ul>
</div>

## References

1. Pennington, Socher and Manning. [GloVe: Global Vectors for Word Representation](https://aclanthology.org/D14-1162/). EMNLP, 2014.
2. Bojanowski et al. [Enriching Word Vectors with Subword Information](https://aclanthology.org/Q17-1010/). TACL, 2017.
