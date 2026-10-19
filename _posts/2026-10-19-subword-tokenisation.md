---
layout: single
title: "Subword Tokenisation: BPE, WordPiece and Unigram Models"
date: 2026-10-19 09:03:00 +0100
categories: [nlp]
book: nlp
subsection: foundations
tags: ["nlp", "tokenisation", "bpe", "subwords"]
excerpt: "Follow a BPE merge by hand, compare segmentation objectives, and see how vocabulary size changes sequence length, coverage and evaluation."
author_profile: true
read_time: true
is_overview: false
icon: "🧱"
read_mins: 4
permalink: /blog/nlp/subword-tokenisation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Subword tokenisers trade vocabulary size for sequence length. BPE learns a sequence of frequent-pair merges; WordPiece uses a learned piece vocabulary with its own training and matching conventions; unigram tokenisation scores alternative segmentations. None guarantees linguistic morphemes.
</div>

## Why whole-word vocabularies run out of room

A fixed word vocabulary assigns a separate entry to every stored spelling. Inflected forms, compounds, product codes and typos create new spellings continually. An unknown-word token collapses all excluded words into one symbol, discarding distinctions that the model might need.

Characters have broad coverage but produce long sequences. Subwords occupy the space between these choices: frequent strings become single units while unfamiliar strings can be assembled from smaller pieces. Coverage still depends on the base alphabet and fallback mechanism. A character-based vocabulary that never included a script does not magically encode that script.

## A BPE training step, by hand

Use a toy word inventory with frequencies: `low` occurs five times, `lower` twice, and `new` three times. Start from characters and a word-boundary symbol. Count adjacent symbol pairs weighted by word frequency.

| Pair | Weighted count |
|---|---:|
| l + o | 7 |
| o + w | 7 |
| w + boundary | 8 |
| w + e | 2 |
| n + e | 3 |
| e + w | 3 |

The most frequent pair is `w + boundary`, so merge it into one symbol. The representations of `low` and `new` change, while `lower` keeps its internal `w`. Recompute affected pairs and continue until the merge budget is reached. Ties require a deterministic policy.

At inference, apply the learned merge ranking to the new string. Do not re-estimate frequencies from the evaluation text. Training chooses the code; inference uses it. The boundary convention also matters: an end-of-word marker can distinguish `low` as a complete word from the same substring inside another word.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="nlp-bpe-title nlp-bpe-desc" viewBox="0 0 660 110" style="max-width:660px;width:100%;height:auto;font-family:system-ui,sans-serif">
<title id="nlp-bpe-title">A BPE vocabulary grows through repeated pair merges; inference reuses the saved ranking.</title>
<desc id="nlp-bpe-desc">Characters|+ boundaries → Weighted|pair counts → Merge most|frequent pair → Store merge|ranking</desc>
<rect x="5.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="75.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Characters</text>
<text x="75.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">+ boundaries</text>
<text x="155.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="170.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="240.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Weighted</text>
<text x="240.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">pair counts</text>
<text x="320.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="335.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="405.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Merge most</text>
<text x="405.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">frequent pair</text>
<text x="485.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="500.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="570.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Store merge</text>
<text x="570.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">ranking</text>
</svg>
<figcaption>A BPE vocabulary grows through repeated pair merges; inference reuses the saved ranking.</figcaption>
</figure>
</div>

## Three families, three decisions

**BPE** specifies a greedy merge construction. **WordPiece** is commonly associated with building a piece vocabulary and greedily choosing the longest matching piece at each position; training implementations differ, so the model name alone is not a complete algorithm specification. **Unigram language-model tokenisation** assigns probabilities to pieces and scores a segmentation by the product of its piece probabilities.

For unigram pieces $$z_1,\ldots,z_m$$ that concatenate to a word $$x$$,

<div class="formula-box">
\[
P(z_1,\ldots,z_m)=\prod_{i=1}^{m}P(z_i),\qquad
z^*=\arg\max_{z:\operatorname{concat}(z)=x}\sum_i\log P(z_i).
\]
</div>

A dynamic program can find the best segmentation. The method can also sample segmentations during training, exposing a downstream model to several decompositions of the same string. That regularises the representation without requiring a change in the underlying text.

## Vocabulary size has two costs

A larger vocabulary generally reduces token count for familiar text but increases the embedding table and output classifier. With vocabulary size $$V$$ and dimension $$d$$, an embedding matrix contains $$Vd$$ parameters. A smaller vocabulary saves those parameters but may expand the sequence, increasing the number of prediction steps and the work of sequence processing.

Measure the tradeoff on the actual language mix. If one language needs twice as many tokens per character, a fixed token window gives it less document context. Report fragmentation by language or domain instead of only an aggregate mean.

## Reversibility and offsets

A reversible tokeniser can reconstruct the representation it was given. It cannot reconstruct distinctions removed earlier by lowercasing or Unicode normalisation. Keep the raw text separately if exact round trips matter.

For span tasks, carry token-to-character offsets and mask any training positions that do not correspond to annotated units. For [language-model evaluation](/blog/nlp/ngram-language-models/), compare perplexities only under compatible tokenisation; changing the units changes the denominator.

<div class="insight-box">
  <strong>Key Insight:</strong> Tokenisation is a learned compression policy. Its units shape the model’s context budget and statistical sharing, even when those units have no clean linguistic interpretation.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A successful encode/decode round trip does not prove that the original text was preserved: a normaliser may already have changed it. Test the entire pipeline on accents, spaces and unsupported scripts.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>BPE counts pairs with corpus frequencies and saves an ordered merge policy.</li>
    <li>Unigram tokenisation scores complete alternative segmentations.</li>
    <li>Vocabulary size trades embedding parameters against sequence length.</li>
    <li>Coverage, normalisation and offsets must be specified separately.</li>
  </ul>
</div>

## References

1. Sennrich, Haddow and Birch. [Neural Machine Translation of Rare Words with Subword Units](https://aclanthology.org/P16-1162/). ACL, 2016.
2. Kudo, T. [Subword Regularization: Improving Neural Network Translation Models with Multiple Subword Candidates](https://aclanthology.org/P18-1007/). ACL, 2018.
