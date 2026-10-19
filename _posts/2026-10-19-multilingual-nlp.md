---
layout: single
title: "Multilingual NLP: Transfer, Tokenisation and Uneven Language Coverage"
date: 2026-10-19 09:35:00 +0100
categories: [nlp]
book: nlp
subsection: evaluation
tags: ["nlp", "multilingual", "cross-lingual", "low-resource"]
excerpt: "Analyse cross-lingual transfer, sampling balance and token fragmentation, then design evaluations that expose weak languages and annotation mismatches."
author_profile: true
read_time: true
is_overview: false
icon: "🗺️"
read_mins: 5
permalink: /blog/nlp/multilingual-nlp/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Multilingual NLP shares information across languages while confronting differences in script, morphology, data volume and annotation. Transfer can help a language with little labelled data, but aggregate scores can hide failures. Evaluate per language and audit the processing units and resources behind each score.
</div>

## A shared model does not imply a shared task

An English named-entity scheme may rely heavily on capitalisation. A language without the same casing convention removes that cue. A classifier trained on words separated by spaces encounters a different segmentation problem in another writing system. Rich inflection can also increase the number of surface forms for the same underlying lexeme.

Define the output consistently enough to compare it, while acknowledging where linguistic categories or annotation conventions differ. A translated label name does not guarantee that annotators applied the same operational rule.

## Three routes to transfer

**Translate-train** translates labelled training text into the target language. **Translate-test** translates target-language input into a language supported by the model. **Shared multilingual representations** train common parameters so a task learned in one language may transfer to another.

Each route moves a bottleneck. Translation can change entity boundaries, sentiment intensity or cultural references. Shared representations avoid explicit translation at inference but may still encode unequal coverage from the pretraining corpus. Zero-shot transfer means no target-language task supervision under a specified protocol, not that the model has never encountered that language.

## Sampling balances frequency and exposure

Suppose language $$\ell$$ has $$n_\ell$$ training examples. A temperature-like sampling policy can use

<div class="formula-box">
\[
q_\ell=\frac{n_\ell^\alpha}{\sum_j n_j^\alpha}.
\]
</div>

At $$\alpha=1$$, sampling follows dataset size. At $$\alpha=0$$, each nonempty language receives equal probability. Intermediate values flatten the distribution.

For languages with 100 and one units of data, $$\alpha=1$$ allocates approximately 99% and 1% of samples. With $$\alpha=0.5$$, the weights are ten and one, yielding about 91% and 9%. The smaller language receives more exposure, but repeatedly sampling the same examples does not create new linguistic evidence. Watch for overfitting and negative transfer.

## Measure token fragmentation

Let a held-out corpus contain $$W$$ whitespace-delimited words under a declared convention and $$T$$ model tokens. The ratio $$T/W$$ is one fragmentation diagnostic for languages where that word convention is meaningful. For cross-script comparisons, tokens per character or per byte can answer different questions; none is universally language-neutral.

If one corpus averages two model tokens per annotated word and another four, a 512-token window contains roughly half as many annotated words in the second. Vocabulary sharing therefore changes the effective context budget, not only the embedding table size.

Inspect rare scripts, borrowed words, code-switching and transliterated text. A language-identification front end that rejects mixed-language input can fail before the task model receives any text.

## Keep script and language separate

A script can serve several languages, and a language can be written in more than one script or in informal transliteration. Script detection alone is not language identification. Unicode normalisation can align equivalent encodings but does not translate spelling conventions or repair all mixed-script confusables.

Preserve original text and offsets when annotations refer to spans. If a translation or transliteration changes length, propagate annotations through an explicit alignment rather than reusing old offsets.

## Evaluate the distribution you intend to support

Report per-language scores and both macro and deployment-weighted aggregates. A macro mean treats languages equally; a traffic-weighted mean reflects usage frequency. Neither replaces the individual results. Include uncertainty when a test set is small.

Check whether evaluation data is naturally authored or translated. Translationese can differ systematically from native text and may make a benchmark easier or less representative. Also control duplicated or parallel content across splits: translating a training sentence does not necessarily create an independent test example.

## Diagnose transfer rather than assuming it

Compare a shared model with a relevant monolingual or language-specific baseline where resources permit. Examine whether gains concentrate on shared names and cognates while grammar-sensitive cases remain weak. Validate annotation quality with speakers competent in the language and domain.

Language coverage is an empirical claim about data and behaviour. A model that accepts a script without crashing has demonstrated encoding coverage, not reliable understanding of the language written in it.

<div class="insight-box">
  <strong>Key Insight:</strong> Shared parameters redistribute learning opportunities, but language coverage remains uneven when data, tokenisation and annotation are uneven. Inspect the whole pipeline for each supported language.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A multilingual average can rise while a particular language gets worse. Always inspect per-language changes and the weighting used to combine them.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Translation and shared representations offer different transfer routes.</li>
    <li>Sampling exponents control exposure, not the amount of unique evidence.</li>
    <li>Token fragmentation changes the usable context window.</li>
    <li>Per-language evaluation and native-language annotation checks are necessary.</li>
  </ul>
</div>

## References

1. Joshi et al. [The State and Fate of Linguistic Diversity and Inclusion in the NLP World](https://aclanthology.org/2020.acl-main.560/). ACL, 2020.
2. Conneau et al. [Unsupervised Cross-lingual Representation Learning at Scale](https://aclanthology.org/2020.acl-main.747/). ACL, 2020.
