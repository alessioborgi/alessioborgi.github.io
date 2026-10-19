---
layout: single
title: "Sentiment and Aspect Analysis: Who Feels What About Which Feature?"
date: 2026-10-19 09:15:00 +0100
categories: [nlp]
book: nlp
subsection: classification
tags: ["nlp", "sentiment", "aspect-analysis", "opinion-mining"]
excerpt: "Move from document polarity to targets, opinion spans and aspect-level sentiment, with negation, attribution and domain shift made explicit."
author_profile: true
read_time: true
is_overview: false
icon: "💭"
read_mins: 5
permalink: /blog/nlp/sentiment-and-aspect-analysis/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Sentiment is a relation among a holder, a target and an expressed evaluation. A document label compresses those relations; aspect analysis separates them. Negation, comparison, attribution and domain vocabulary determine which sentiment is actually being expressed.
</div>

## A single label can destroy the useful answer

“The screen is excellent, but the battery is terrible.” A document classifier must choose a convention: mixed, negative overall, or perhaps the sentiment toward a designated product. An aspect system can preserve two records: positive toward screen quality and negative toward battery quality.

An opinion representation might contain the holder, target span, aspect category, opinion expression and polarity. Time and attribution may also matter. “The reviewer said the old battery was terrible” is a different claim from the author reporting dissatisfaction with the current battery.

The first modelling decision is therefore the output structure. Do not train on whole-review stars and then assume the model learned which component caused the rating.

## Split extraction from classification

An explicit aspect mention such as `battery` has a text span. An implicit aspect may be inferred from “dies after an hour”, with no occurrence of the word `battery`. Aspect extraction finds spans; aspect-category detection maps language to a taxonomy; sentiment classification predicts an evaluation toward the chosen target.

| Text | Target or aspect | Evidence | Polarity |
|---|---|---|---|
| “The screen is crisp” | Screen quality | crisp | positive |
| “Battery is not reliable” | Battery reliability | not reliable | negative |
| “Less heavy than before” | Weight | comparison with earlier version | convention-dependent |
| “I expected a disaster; it works” | Current product | contrast across clauses | needs sentence context |

A pipeline makes each step inspectable but propagates errors. A joint model can share evidence across steps, yet evaluation should still reveal whether failures come from missing targets, wrong span boundaries or wrong polarity.

## Negation is more than a polarity flip

A lexicon baseline assigns scores to words and aggregates them. It is transparent, but “not bad” is rarely equivalent in intensity to “excellent”, and “not only good but cheap” does not negate “good”. Negation scope needs syntax or at least carefully defined context rules.

A simple rule that flips every score after `not` until punctuation can be a diagnostic baseline. Test it on contrastive examples rather than interpreting it as a grammar of negation. Report the cases in which its assumptions fail.

For a target-conditioned model, write the prediction as $$P(y\mid x,a)$$, where $$x$$ is the text and $$a$$ the target or aspect. The same sentence can then receive different labels for different aspects. Without the target input, asking the model for those separate labels is an ill-specified request.

## A concrete aggregation failure

Suppose a review contains three positive screen sentences and one strongly negative battery sentence. A count-based aggregator outputs positive because three exceeds one. A user who cares primarily about battery life would reasonably reach the opposite purchase decision. Neither conclusion follows from sentence counts alone: aggregation needs weights and a declared decision goal.

For aspect scores $$s_a$$ and user weights $$w_a$$, a utility summary could be $$U=\sum_a w_as_a$$. That is a decision model layered on top of sentiment extraction. Do not confuse its user-dependent weights with linguistic polarity labels.

## Domain shift and shortcuts

“Unpredictable” can praise a plot and criticise navigation behaviour. “Small” can praise portability and criticise storage. A model trained on one product category may carry the wrong association into another.

Review data also contains shortcuts: star symbols, template phrases or text that directly states the rating. Whether these are valid features depends on deployment. If the intended input lacks them, evaluate a version with those cues controlled. Group near-duplicate reviews and keep products or authors separate when that matches the generalisation claim.

## Evaluate the full opinion tuple

Score target extraction and target-conditioned polarity separately, then score complete target–polarity pairs. A correct negative label assigned to the wrong component is not a correct opinion extraction.

Build slices for negation, mixed sentiment, implicit targets, comparisons and attributed opinions. Include neutral factual statements such as “the battery weighs 200 grams”: factual content is not automatically a sentiment. The [experimental-design chapter](/blog/nlp/experimental-design/) explains how paired comparisons make improvements on these slices more credible.

<div class="insight-box">
  <strong>Key Insight:</strong> Polarity belongs to an interpretation of a target in context. Aspect conditioning preserves distinctions that a single document label must compress away.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A review rating is weak supervision for individual sentences or aspects. Copying the rating onto every sentence introduces incorrect labels for mixed reviews and factual passages.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Specify whether the task predicts document sentiment, aspects or full opinion records.</li>
    <li>Negation scope and attribution can change the expressed claim.</li>
    <li>Aspect aggregation requires a separate decision policy.</li>
    <li>Evaluate target–polarity pairs, domain transfer and difficult linguistic slices.</li>
  </ul>
</div>

## References

1. Hu and Liu. [Mining and Summarizing Customer Reviews](https://www.cs.uic.edu/~liub/publications/kdd04-revSummary.pdf). KDD, 2004.
2. Pang and Lee. [A Sentimental Education](https://aclanthology.org/P04-1035/). ACL, 2004.
3. Turney, P. [Thumbs Up or Thumbs Down?](https://aclanthology.org/P02-1053/). ACL, 2002.
