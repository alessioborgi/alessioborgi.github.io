---
layout: single
title: "Sequence Labelling: Parts of Speech and Named Entities"
date: 2026-10-19 09:17:00 +0100
categories: [nlp]
book: nlp
subsection: sequence-models
tags: ["nlp", "ner", "sequence-labelling"]
excerpt: "Predict token labels while respecting context and span boundaries, from grammatical tags to named entities."
author_profile: true
read_time: true
is_overview: false
icon: "🧵"
read_mins: 6
permalink: /blog/nlp/sequence-labelling/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Sequence labelling predicts a label for each token. Context resolves ambiguous words, and output conventions turn token labels into spans. Correct labels at most positions can still hide poor entity extraction.
</div>

## Two different questions

Part-of-speech tagging asks about grammatical function: noun, verb, adjective and other categories. Named entity recognition asks which spans mention entities of designated types, such as people or organisations. The inventory depends on the annotation scheme.

In “Rossi joined North Harbour Labs”, a possible BIO annotation is:

| Token | Label |
|---|---|
| Rossi | B-PER |
| joined | O |
| North | B-ORG |
| Harbour | I-ORG |
| Labs | I-ORG |

`B` begins a span, `I` continues it, and `O` is outside. The same entity type can occur in adjacent spans, which is one reason a beginning marker matters. Fix the BIO variant and its legal transitions before training or decoding.

## Context changes the tag

“Book a repair” uses “book” as a verb; “read the book” uses it as a noun. A dictionary assigning one tag per word cannot resolve both correctly. Useful evidence includes neighbouring words, suffixes, capitalisation and the surrounding sentence.

A hidden Markov model treats tags as latent states. In its basic first-order form, a tag depends on the preceding tag, and the observed word depends on the current tag. Viterbi decoding finds the highest-scoring complete tag sequence by keeping the best partial path ending in each state. It need not choose the locally best tag at every position.

A linear-chain conditional random field models the tag sequence conditional on the input and can combine input features with adjacent-label scores. In either case, enforce the chosen span conventions explicitly if the decoder would otherwise permit invalid transitions.

## Labels must align with text

Suppose a model divides “Harbour” into two pieces while the dataset annotates whole words. Choose a training policy: label only the first piece and mask the others, or propagate labels according to a documented rule. Reconstruct word-level or character-level spans before scoring. Comparing subword predictions directly to word labels changes the task.

## Boundary errors count

Predicting “North Harbour” as an organisation misses part of the annotated name. Under exact-span entity evaluation, that prediction is a false positive and the full gold span is a false negative. A token-accuracy score can look excellent when most tokens are outside any entity, so inspect span precision and recall as well.

## A label inventory defines a language of outputs

Under BIO2, `B-ORG I-ORG O` can represent a two-token organisation followed by an outside token. Starting a sequence with `I-ORG` is invalid under that convention, while other IOB variants have different rules. The name “BIO” alone is insufficient to reconstruct the permitted sequences.

A transition mask encodes these restrictions. It does not teach the model which words form an organisation; it prevents combinations that cannot represent an annotation under the scheme. Apply the same rules during training and decoding if the model is intended to normalise over only legal outputs.

Nested entities require more than one flat label per token. In “North Harbour University”, a location mention may be embedded within an organisation mention. Span classification, layered tagging or graph representations can express structures that one BIO sequence cannot.

## Independent predictions can disagree with the best path

Suppose a two-token entity has local scores favouring `B-ORG` at the first token and `O` at the second. A structured model can also score transitions, rewarding a plausible continuation to `I-ORG`. Its complete path score is the sum of emissions and transition scores.

Consider two candidate paths. `B-ORG O` has emission total four and transition score minus three, for total one. `B-ORG I-ORG` has emission total three and transition score zero, for total three. The structured decoder selects the second despite its lower emission total. This is useful only if the transition evidence is learned or constrained appropriately; a strong transition preference can also force a mistaken span to continue.

The [HMM chapter](/blog/nlp/hidden-markov-models/) derives a generative path model, while the [CRF chapter](/blog/nlp/conditional-random-fields/) derives conditional sequence normalisation. Both distinguish summing over alternatives from selecting the best path.

## Measure spans with an exact matching rule

Let gold entities be `(0,2,ORG)` and `(4,5,PER)` in token-offset notation. Suppose predictions are `(0,1,ORG)` and `(4,5,PER)`. Only the person span matches exactly: one true positive, one false positive and one false negative. Precision, recall and F1 are all 0.5.

A token-level score can be much higher because the first organisation token and many outside tokens are correct. Partial-overlap scoring answers another question and should be reported under a distinct name. It can be useful for diagnostics without replacing exact-span evaluation.

## Handle padding and truncated sequences

Padding positions must not contribute to token loss, transitions or metric denominators. If a long document is split into windows, an entity can cross a boundary. Decide whether to use overlapping windows, merge predictions or restrict evaluation to a convention that does not discard such entities.

For overlapping windows, deduplicate predictions in original-document coordinates. Two correct predictions of the same entity should not become two separate extraction records. Preserve offset maps through subword segmentation so a predicted piece span can be reconstructed as the annotated word or character span.

These details become especially important when [entity linking](/blog/nlp/named-entities-and-linking/) consumes the spans. The linker can choose the correct identifier for the wrong boundary and still produce a faulty end-to-end result.

<div class="insight-box">
  <strong>Key Insight:</strong> Structured output conventions are part of the task definition. A sequence can contain individually plausible labels while failing to describe a valid set of spans.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> High token accuracy can come from predicting the dominant outside label. Use entity-level precision and recall to measure the output an extraction system actually needs.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Part-of-speech tags and entity labels describe different properties.</li>
    <li>Sequence decoding can use relationships between output labels.</li>
    <li>Token alignment and span boundaries are part of correctness.</li>
  </ul>
</div>

## References

1. Bird, Klein and Loper, [Categorizing and Tagging Words](https://www.nltk.org/book/ch05.html) and [Extracting Information from Text](https://www.nltk.org/book/ch07.html), develop tagging and entity extraction.
2. Lafferty, McCallum and Pereira. [Conditional Random Fields](https://home.cs.colorado.edu/~mozer/Teaching/syllabi/6622/papers/LaffertyMcCallumPereira2001.pdf). ICML, 2001.
