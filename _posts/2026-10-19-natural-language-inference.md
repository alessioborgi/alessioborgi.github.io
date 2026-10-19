---
layout: single
title: "Natural Language Inference: Entailment, Contradiction and Shortcuts"
date: 2026-10-19 09:28:00 +0100
categories: [nlp]
book: nlp
subsection: semantics
tags: ["nlp", "nli", "entailment", "reasoning"]
excerpt: "Reason about premise–hypothesis pairs with role reversals, quantifier examples and challenge sets that expose lexical-overlap heuristics."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 5
permalink: /blog/nlp/natural-language-inference/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> NLI asks whether a premise supports a hypothesis, rules it out, or leaves it unresolved under the task’s interpretation conventions. Entailment is directional. Word overlap, negation cues and plausible world knowledge can become shortcuts unless the evaluation isolates the required reasoning.
</div>

## Three relations between two statements

Take the premise “A robot moved a red parcel.” The hypothesis “A robot moved a parcel” is entailed under the ordinary reading. “No robot moved any parcel” contradicts it. “The parcel was heavy” is neutral: it may be true or false, but the premise does not decide.

Neutral does not mean unlikely. A plausible detail remains unsupported. Likewise, a contradiction requires incompatibility under the interpretation, not merely a different topic or a negative-sounding word.

| Hypothesis | Relation to the premise | Reason |
|---|---|---|
| A parcel was moved | Entailment | Drops detail while preserving the event |
| Nothing was moved | Contradiction | Denies the asserted event |
| The robot was expensive | Neutral | Adds an unestablished property |

The task convention controls assumptions about time, identity and ordinary background knowledge. Formal logical entailment and a crowdsourced NLI label are related but not identical measurement procedures.

## Entailment is directional

The red-parcel premise entails the less specific parcel statement. Reversing the pair does not entail redness. Symmetric vector similarity therefore cannot by itself represent the relation.

Quantifiers make direction especially important. “Every parcel is red” entails “Every small parcel is red”, assuming small parcels are parcels. “Some parcel is red” does not entail “Some small parcel is red”: the red parcel could be large. A substitution that preserves truth in one environment can fail in another.

Also avoid importing existence into universal claims without an explicit convention. In classical first-order logic, “every robot is charged” can be true when there are no robots; it does not by itself entail that a robot exists.

## Roles defeat overlap heuristics

“The technician inspected the robot” does not entail “The robot inspected the technician”. The sentences share every content word, but the participants' roles reverse. A classifier using lexical overlap can confidently fail.

A subsequence can also be misleading. “The engineer believes the robot failed” contains the clause “the robot failed”, but belief attribution does not assert that the failure occurred. A system needs to distinguish a proposition embedded under belief from one asserted directly.

Build minimal pairs that change one relation at a time: active/passive equivalence, subject/object reversal, negation scope and attribution. Preserve grammaticality so a model cannot solve the challenge by detecting malformed text.

## The prediction model is not the explanation

A pair classifier computes $$P(y\mid p,h)$$ for premise $$p$$, hypothesis $$h$$ and label $$y$$. Good accuracy only shows agreement with the labelled pairs in the evaluation distribution. It does not reveal which evidence the model used.

A hypothesis-only baseline removes the premise. If it performs well, the dataset contains label-predictive cues in hypotheses alone. Examples include annotation habits that place certain negation words disproportionately in contradictions. Such a baseline is a diagnostic, not proof that every pair is invalid.

## Controlled evaluation

Use held-out templates, vocabulary and constructions where appropriate. Training on every lexical item in the exact challenge template can turn a reasoning test into pattern memorisation. Separate in-distribution accuracy from performance on controlled linguistic tests.

Report a confusion matrix for entailment, contradiction and neutral. A model may handle obvious contradictions while collapsing neutral cases into entailment whenever the hypothesis sounds plausible. That error matters in [question answering](/blog/nlp/question-answering/) and [summarisation](/blog/nlp/summarisation/), where unsupported details can be fluent.

## Use NLI scores cautiously for factuality

An NLI model can help compare a generated claim with a source passage, but it is itself fallible and sensitive to domain, length and segmentation. A document may contain evidence spread across sentences or conflicting statements attributed to different speakers.

If a summary makes several claims, evaluate each claim and its supporting evidence rather than treating one high pair score as verification of the entire summary. Preserve the original source spans so a human or another check can inspect what is actually asserted.

<div class="insight-box">
  <strong>Key Insight:</strong> Entailment asks what follows from the premise, not what sounds plausible beside it. Directionality and scope are central to the task.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> High overlap is compatible with entailment, contradiction or neutrality. Challenge sets must vary roles and scope while holding superficial lexical cues steady.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Entailment supports a claim; contradiction excludes it; neutral leaves it open.</li>
    <li>Quantifiers and embedded clauses change valid inferences.</li>
    <li>Hypothesis-only and controlled-pair baselines expose dataset shortcuts.</li>
    <li>An NLI score is evidence from a model, not a proof of factual correctness.</li>
  </ul>
</div>

## References

1. Bowman et al. [A Large Annotated Corpus for Learning Natural Language Inference](https://aclanthology.org/D15-1075/). EMNLP, 2015.
2. McCoy, Pavlick and Linzen. [Right for the Wrong Reasons: Diagnosing Syntactic Heuristics in Natural Language Inference](https://aclanthology.org/P19-1334/). ACL, 2019.
3. Bos and Markert. [Recognising Textual Entailment with Logical Inference](https://aclanthology.org/H05-1079/). HLT/EMNLP, 2005.
