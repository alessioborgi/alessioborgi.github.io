---
layout: single
title: "Semantic Role Labelling: Predicates, Arguments and Event Structure"
date: 2026-10-19 09:26:00 +0100
categories: [nlp]
book: nlp
subsection: semantics
tags: ["nlp", "srl", "propbank", "frames"]
excerpt: "Extract who did what to whom, compare frame-specific and predicate-specific roles, and distinguish event participants from factual assertions."
author_profile: true
read_time: true
is_overview: false
icon: "🎭"
read_mins: 5
permalink: /blog/nlp/semantic-role-labelling/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Semantic role labelling identifies a predicate and its participants, such as an agent, theme or recipient. Role inventories depend on the annotation scheme and predicate sense. Grammatical relations help, but voice, control and omitted arguments prevent a simple subject-to-agent mapping.
</div>

## Describe an event across different syntax

“The technician repaired the robot” and “The robot was repaired by the technician” describe the same basic repair event. In the active sentence the technician is the subject; in the passive sentence the robot is. A semantic representation keeps the repairer and repaired object stable across that change.

A record might be `repair(event, repairer=technician, repaired=robot)`. Time, location and manner can be additional modifiers. This is already more useful for event search than a bag of the same three content words.

## Choose an inventory before assigning roles

Frame-semantic resources describe situations and frame elements. PropBank-style annotation uses predicate senses with numbered arguments and adjunct labels. ARG0 often behaves like a prototypical agent and ARG1 like a prototypical patient for many predicates, but those tendencies are not universal definitions. Read the frame or roleset for the specific predicate.

For a transfer event, an illustrative inventory includes giver, thing transferred and recipient. “Rossi gave Kim a parcel” and “Rossi gave a parcel to Kim” realise the same roles with different constructions. A system should not confuse an argument's linear position with its semantic identity.

| Predicate | Span | Illustrative role |
|---|---|---|
| gave | Rossi | giver |
| gave | Kim | recipient |
| gave | a parcel | transferred object |
| gave | yesterday | time modifier |

These descriptive role names are illustrative; an actual benchmark supplies its own inventory and boundary conventions.

## Factor the prediction problem

A pipeline can detect predicates, disambiguate their senses, find argument spans and label those spans. A joint model can optimise several decisions together. With gold predicates, the task is easier than predicting them from raw text, so evaluation must state which inputs are supplied.

For a candidate span $$a$$, predicate $$p$$ and role $$r$$, a model may learn a score $$s(a,p,r,x)$$. Decoding selects a compatible set of arguments. Depending on the scheme, constraints can prevent overlapping arguments or repeated core roles. Those constraints are task-specific; imposing them universally can reject valid annotations.

## Work through a role reversal

Compare “The robot pushed the cart” with “The cart pushed the robot”. The words and their frequencies are identical. If the first argument is the pusher and the second the pushed object, the two records reverse their participants.

Now add passive voice: “The cart was pushed by the robot.” The cart becomes the syntactic subject while remaining the pushed object. A rule that labels every subject as the pusher succeeds on the first pair's active forms and fails on the passive. Testing all three exposes whether the model learned role relationships or only a surface shortcut.

## Arguments can be implicit or shared

“The technician promised to repair the robot” has an understood subject for `repair`. “The technician asked Kim to repair the robot” changes that understood subject. Recovering it requires the lexical behaviour of `promise` versus `ask`, not just the nearest noun.

Coordination and omitted arguments add similar difficulties. A span-only system cannot directly point to an argument that has no overt span. Decide whether the task annotates implicit roles, and avoid scoring a restricted system as though it produces a complete discourse-level event graph.

## A role record is not proof that the event happened

“The technician did not repair the robot” still contains a repair predicate and its participants. So do “may repair” and “claims to have repaired”. Extract negation, modality and attribution alongside roles when the application needs factual events.

The distinction connects SRL to [natural language inference](/blog/nlp/natural-language-inference/): identifying a proposition's structure does not establish that the text entails its occurrence.

## Evaluate arguments and predicates separately

Span-based evaluation commonly requires exact boundaries and the correct role. Dependency-based SRL may score argument heads instead. These are different outputs. Report predicate detection, sense accuracy and argument performance, then the complete pipeline score.

Inspect passive voice, long-distance arguments, coordination and domain transfer. A model can have good average argument F1 while systematically reversing the participants in the constructions most important to an application.

<div class="insight-box">
  <strong>Key Insight:</strong> Semantic roles abstract over some syntactic variation, but they do not erase predicate-specific meaning. A role label is interpreted inside a defined frame or roleset.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Extracting a predicate and its participants does not assert that the event occurred. Negation, modality and quotation must travel with the record when factual interpretation matters.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>SRL separates event participants from their grammatical realisation.</li>
    <li>Role meanings depend on the predicate and annotation inventory.</li>
    <li>Gold-predicate and end-to-end evaluations test different systems.</li>
    <li>Implicit arguments and factuality require additional modelling decisions.</li>
  </ul>
</div>

## References

1. Gildea and Jurafsky. [Automatic Labeling of Semantic Roles](https://aclanthology.org/J02-3001/). Computational Linguistics, 2002.
2. Carreras and Màrquez. [Introduction to the CoNLL-2005 Shared Task: Semantic Role Labeling](https://aclanthology.org/W05-0620/). 2005.
