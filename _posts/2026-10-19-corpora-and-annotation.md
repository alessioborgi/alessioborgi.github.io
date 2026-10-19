---
layout: single
title: "Corpora and Annotation: What Your Dataset Actually Measures"
date: 2026-10-19 09:01:00 +0100
categories: [nlp]
book: nlp
subsection: foundations
tags: ["nlp", "corpora", "annotation", "agreement"]
excerpt: "A corpus is a sample of language use, and an annotation scheme is a measurement procedure. Sampling, agreement and split design determine what the resulting scores mean."
author_profile: true
read_time: true
is_overview: false
icon: "📚"
read_mins: 5
permalink: /blog/nlp/corpora-and-annotation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A corpus samples particular speakers, genres and time periods. Annotation turns an interpretation into a target. Define the population, write operational label rules, measure agreement before adjudication, and split at the unit on which you want to generalise.
</div>

## A corpus has a sampling frame

A million product reviews and a million support messages are both large text collections, but they answer different questions. Reviews often contain retrospective judgements; support messages frequently describe unresolved problems. A classifier trained on one may learn vocabulary that is misleading on the other. More examples reduce uncertainty about the sampled population; they do not automatically make that population representative of another.

Start with a statement such as: “Predict the primary issue in English support conversations from first-time customers.” That statement specifies the unit, language, domain and population. Compare it with “Predict issues in all incoming messages”: returning customers, quotations and several messages from the same conversation now matter.

Record source, date range, inclusion rules and deduplication policy. A corpus is not fully described by its number of tokens. The [tokenisation chapter](/blog/nlp/tokenisation-and-morphology/) explains why even that number depends on a processing convention.

## Turn concepts into annotation decisions

Suppose the label is *delivery complaint*. Does “The parcel came late, but that was fine” qualify? A topic scheme may say yes; a dissatisfaction scheme may say no. Both are coherent, but mixing them creates an inconsistent target.

A useful annotation manual contains a definition, inclusion and exclusion examples, precedence rules for competing labels, and a way to mark genuine uncertainty. Separate the observed span from the interpretation whenever possible. For an entity task, store the mention offsets, its type and its identifier in distinct fields.

| Record | Operational decision |
|---|---|
| “Battery is dead” | Hardware issue under a stated component taxonomy |
| “They said the battery was dead” | Attributed report; whether it counts must be specified |
| “Battery is not dead” | Negation changes the asserted condition |
| “Battery dead; parcel late” | Multiple issues; requires multilabel output or a primary-label rule |

Pilot the scheme on a varied sample before scaling annotation. If annotators repeatedly need exceptions, revise the definitions and re-annotate the affected pilot records.

## Agreement, computed

For two annotators assigning one category to each item, Cohen's kappa is

<div class="formula-box">
\[
\kappa=\frac{p_o-p_e}{1-p_e},
\]
</div>

where $$p_o$$ is observed agreement and $$p_e$$ is agreement expected from the annotators' marginal label frequencies. It adjusts a particular chance model; it is not a universal measure of annotation quality.

Consider 100 binary judgements. Both annotators mark 45 items positive and 40 negative. They disagree on the other 15: A-positive/B-negative on ten and A-negative/B-positive on five. Then $$p_o=0.85$$. A's positive rate is 0.55 and B's is 0.50, so $$p_e=0.55(0.50)+0.45(0.50)=0.50$$ and $$\kappa=0.70$$.

The disagreements are useful data. Are they concentrated on negation, quoted claims or rare categories? A single agreement number hides that distinction. For spans, specify alignment and matching before computing agreement; token labels and exact spans measure different errors.

## Adjudication and uncertainty

Adjudication produces a final reference, often through a third reader or a discussion. Measure independent agreement before that discussion. Agreement after annotators see one another's answers no longer measures the reproducibility of the original instructions.

Some examples remain ambiguous even with good instructions. Preserve alternative labels or uncertainty markers if the task allows them. If the final benchmark requires one label, document the decision rule so evaluation does not mistake a convention for an uncontested linguistic fact.

## Split examples before learning the vocabulary

Group all messages from the same conversation when evaluating new conversations. Group by author when evaluating transfer to new authors. Use a chronological split when the deployment claim concerns future data. These choices can produce different scores because they test different kinds of generalisation.

Freeze test records and their preprocessing contract. Fit learned vocabulary statistics on training data, as discussed in [text representations](/blog/nlp/text-representations/). Keep a dataset version, annotation-manual version and split manifest together: without those, a later score may refer to a different measurement procedure.

<div class="insight-box">
  <strong>Key Insight:</strong> Annotation disagreement is often a diagnostic of the task definition. Reviewing disagreement categories can improve the target before any model is trained.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> High agreement on a dominant label can coexist with unreliable rare labels. Report the confusion counts and label frequencies alongside an agreement coefficient.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>A corpus represents a specified source population, not language in general.</li>
    <li>Operational annotation rules make labels reproducible.</li>
    <li>Kappa depends on marginal label frequencies and its chance model.</li>
    <li>Measure agreement before adjudication and choose splits to match deployment.</li>
  </ul>
</div>

## References

1. Bird, Klein and Loper. [Managing Linguistic Data](https://www.nltk.org/book/ch11.html).
2. Cohen, J. *A Coefficient of Agreement for Nominal Scales*. Educational and Psychological Measurement, 1960.
