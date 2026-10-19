---
layout: single
title: "Machine Translation: Alignment, Conditional Generation and Evaluation"
date: 2026-10-19 09:30:00 +0100
categories: [nlp]
book: nlp
subsection: applications
tags: ["nlp", "translation", "alignment", "bleu"]
excerpt: "Connect the noisy-channel view to encoder–decoder translation, explain soft alignment, and calculate clipped precision and the BLEU brevity penalty."
author_profile: true
read_time: true
is_overview: false
icon: "🌍"
read_mins: 4
permalink: /blog/nlp/machine-translation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Translation predicts a target-language sequence conditioned on a source. Word order, morphology and lexical ambiguity prevent simple substitution. Alignment and attention connect source evidence to target decisions; evaluation must assess meaning preservation alongside reference overlap.
</div>

## Translation is a structured prediction problem

English “I gave her the book” and a natural translation into another language may differ in word order, inflection and which grammatical features must be expressed. A target language can require a distinction absent from the source, such as a formality choice. There may be several equally valid outputs.

The classical noisy-channel formulation selects a target $$y$$ for source $$x$$ using

<div class="formula-box">
\[
\hat y=\arg\max_y P(x\mid y)P(y).
\]
</div>

The first term scores how the target could explain the source; the second rewards plausible target-language text. A conditional neural model instead learns $$P(y\mid x)$$ directly and factorises it autoregressively. These are modelling choices, not claims that translation has a unique correct string.

## Alignment connects expressions across languages

A word alignment relates source and target positions, potentially many to many or to an unaligned/null choice. Literal one-to-one matching fails on idioms, compounds and grammatical markers.

Attention provides a weighted source summary at each target step. With encoder states $$h_i$$ and a decoder-dependent compatibility score $$e_{ti}$$,

<div class="formula-box">
\[
\alpha_{ti}=\frac{\exp(e_{ti})}{\sum_j\exp(e_{tj})},\qquad
c_t=\sum_i\alpha_{ti}h_i.
\]
</div>

The decoder uses $$c_t$$ when predicting the next target token. Attention weights are a model computation, not automatically a gold linguistic alignment or a faithful explanation of causality. Multiple source positions may jointly encode the needed information.

## Train conditional generation

Teacher-forced training minimises $$-\sum_t\log P(y_t\mid y_{<t},x)$$ on parallel sentence pairs. Correct target shifting, padding masks and source/target boundary conventions are necessary. Parallel data quality matters: a fluent but mismatched pair teaches the model that unsupported target content is acceptable.

Subword representations help share evidence across rare inflections and spellings. They do not solve terminology consistency or preserve named entities by guarantee. Test numbers, names, negation and units explicitly.

At inference, [beam search](/blog/nlp/decoding-and-search/) or another decoder chooses an output. Length penalties and stopping rules can change adequacy, so compare systems using documented settings.

## BLEU clips counts before measuring precision

For each n-gram order, modified precision counts candidate n-grams that occur in references, clipping each candidate count to the maximum corresponding reference count. This prevents repeating one reference word from earning unlimited credit.

Consider candidate “robot robot moves” and reference “robot moves”. The candidate has three unigrams, but only one `robot` and one `moves` can be matched, so clipped unigram precision is $$2/3$$. Of the candidate's two bigrams, only `robot moves` matches, giving bigram precision $$1/2$$.

Using an illustrative two-order BLEU with equal weights and no brevity penalty, the geometric mean is $$\sqrt{(2/3)(1/2)}\approx0.577$$. Standard corpus BLEU commonly uses four orders; short-sentence smoothing and aggregation conventions must be specified.

## Brevity and alternative translations

BLEU includes a brevity penalty, commonly $$\exp(1-r/c)$$ when candidate length $$c$$ is shorter than effective reference length $$r$$, and one otherwise. A one-token candidate against a two-token reference gets a penalty of $$e^{-1}$$ even if its single word matches.

Reference overlap is imperfect when valid translations use different wording. More references can capture more alternatives but do not exhaust them. A high score can also hide a crucial mistranslated negation or number inside otherwise matching text.

## Evaluate adequacy and consistency

Separate fluency from preservation of source meaning. Inspect omissions, additions, terminology, agreement and discourse consistency. Sentence-level tests may miss pronoun choices that require a previous sentence or an entity introduced earlier.

Human evaluation needs a rubric and source-language competence. Report language direction, domain, tokenisation and metric implementation. A score for translation into one language cannot be treated as a universal measure of a multilingual system's quality.

<div class="insight-box">
  <strong>Key Insight:</strong> The source constrains the meaning while the target language constrains how that meaning can be expressed. A fluent target sentence can still be an incorrect translation.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Attention visualisations and reference-overlap scores are useful diagnostics, but neither alone verifies fidelity. Check content-bearing details such as negation, names and quantities directly.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Translation requires reordering, lexical choice and grammatical realisation.</li>
    <li>Attention forms a context-dependent source summary.</li>
    <li>BLEU uses clipped n-gram precision and a brevity penalty.</li>
    <li>Adequacy, fluency and document consistency need distinct checks.</li>
  </ul>
</div>

## References

1. Bahdanau, Cho and Bengio. [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473). ICLR, 2015.
2. Papineni et al. [BLEU: A Method for Automatic Evaluation of Machine Translation](https://aclanthology.org/P02-1040/). ACL, 2002.
3. Sennrich, Haddow and Birch. [Neural Machine Translation of Rare Words with Subword Units](https://aclanthology.org/P16-1162/). ACL, 2016.
