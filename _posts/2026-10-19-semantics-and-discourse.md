---
layout: single
title: "Semantics and Discourse: Roles, Negation and Reference"
date: 2026-10-19 09:24:00 +0100
categories: [nlp]
book: nlp
subsection: semantics
tags: ["nlp", "semantics", "discourse"]
excerpt: "Move from grammatical structure to meaning: who did what, what is negated, and how references connect sentences."
author_profile: true
read_time: true
is_overview: false
icon: "🧩"
read_mins: 6
permalink: /blog/nlp/semantics-and-discourse/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Understanding a sentence requires more than recognising its words. Track participants, negation, quantifier scope and references across sentences. Similar wording can express different claims, while different wording can describe the same event.
</div>

## Preserve the participants

“The robot moved the parcel” and “The parcel was moved by the robot” describe the same core event under an ordinary reading. A role representation can record the mover as the robot and the moved object as the parcel. The surface subject changes between the sentences, but the event participants retain their roles.

Now swap the nouns: “The parcel moved the robot.” The vocabulary remains the same while the roles change. A representation intended for event extraction must preserve this distinction.

## Negation has scope

Compare:

- “The robot did not move the parcel.”
- “The robot moved the parcel, not the crate.”
- “The report says the robot did not move the parcel.”

The first denies an event, the second corrects an object, and the third attributes a denial to a report. Finding the token “not” is only the beginning. A system must establish which proposition is negated and who is committed to it.

This matters when extracting facts from documents: a quoted or disputed claim should not silently become an assertion by the author.

## Quantifiers change truth conditions

“Every robot moved a parcel” has at least two possible scope readings. Each robot may have moved a different parcel, or there may be one parcel moved by every robot. In predicate notation, these correspond to

<div class="formula-box">
\[
\forall r\,[\operatorname{robot}(r)\Rightarrow\exists p\,(\operatorname{parcel}(p)\land\operatorname{moved}(r,p))]
\]
</div>

and

<div class="formula-box">
\[
\exists p\,[\operatorname{parcel}(p)\land\forall r\,(\operatorname{robot}(r)\Rightarrow\operatorname{moved}(r,p))].
\]
</div>

Consider two robots, each moving its own distinct parcel and no other. The first formula is true and the second false. The difference is in quantifier scope, not in word identity.

## Reference crosses sentence boundaries

“The robot approached the parcel. It was damaged.” Either object could be damaged. A coreference system links mentions believed to refer to the same entity, but this example lacks decisive context. A later sentence such as “Its cardboard sides were torn” supplies evidence for the parcel.

Maintain uncertainty when the document does not resolve it. An extraction pipeline that must produce one answer should at least expose confidence or a review path rather than treating every guessed antecedent as an observed fact.

## Inference is directional

“The robot moved a red parcel” supports “The robot moved a parcel”. The reverse does not follow: the parcel could be blue. Semantic similarity is symmetric for many vector metrics, while entailment is directional. Use an evaluation task that matches the distinction being tested.

## Compose meanings, not just word scores

In a simple logical interpretation, `robot` can denote a set of entities and `moves` another set. “Rossi moves” is true when the entity denoted by `Rossi` belongs to the denotation of `moves`. “A robot moves” asserts that the two sets have a nonempty intersection:

<div class="formula-box">
\[
\exists x\,[\operatorname{robot}(x)\land\operatorname{moves}(x)].
\]
</div>

This representation preserves a relationship that averaging word vectors need not preserve. It also makes assumptions explicit: the domain of entities, the time of the claim and the sense of `moves` must be supplied or inferred.

Compositionality is an organising principle, not a claim that every expression is interpreted by a literal word-by-word rule. Idioms, metaphor and context-sensitive uses require additional lexical or pragmatic knowledge. “The project is on ice” need not describe a location at low temperature.

## Presupposition differs from assertion

“The robot stopped charging” ordinarily suggests that it was charging before. “The robot did not stop charging” often retains that suggestion even though the asserted stopping event is negated. Such background commitments behave differently from ordinary positive assertions.

An extraction system that records only `charging=false` misses the temporal and inferential structure. Test what survives negation, questioning and attribution rather than assuming every implied proposition has the same status. Presupposition behaviour can be context-sensitive, so these tests are diagnostics rather than a complete mechanical theory.

## Connect sentences through discourse relations

“The battery was empty. Therefore the robot stopped.” expresses a consequence relation. “The battery was empty. Nevertheless the robot continued.” introduces an expectation and a contrast. The facts cannot be interpreted fully by treating the sentences as an unordered set.

Discourse analysis can represent relations such as cause, elaboration and contrast between spans. Connectives provide evidence but do not determine every relation: a causal connection can be implicit, and the same connective can have several uses.

For summarisation, dropping a contrast marker can change the reader's interpretation even when the remaining statements are individually copied correctly. For retrieval, returning a sentence without its preceding qualification can produce an apparently relevant but misleading snippet.

## Pragmatics and the speaker's goal

“Can you open the window?” is grammatically a question about ability and conventionally often a request. A dialogue system needs the intended conversational action. The interpretation depends on the setting, preceding turns and shared assumptions, not only on the sentence form.

Do not collapse intention into factual content. A request to repair a robot does not assert that the repair has happened. An assistant that maps both to the same event record loses the distinction between desired and observed states.

## Route the problem to the right representation

Use [word-sense disambiguation](/blog/nlp/lexical-semantics-and-wsd/) for lexical ambiguity, [semantic role labelling](/blog/nlp/semantic-role-labelling/) for predicate participants, [coreference resolution](/blog/nlp/coreference-resolution/) for entity identity, and [natural language inference](/blog/nlp/natural-language-inference/) for support between claims. These outputs complement one another; none alone is a complete representation of document meaning.

A useful semantic error analysis names the lost distinction: wrong sense, swapped role, missed negation, incorrect antecedent, unsupported inference or mistaken speech act. That is more actionable than a single category labelled “the model did not understand”.

<div class="insight-box">
  <strong>Key Insight:</strong> Assertions, presuppositions, attributed beliefs and requests have different commitments. Preserving their status is essential when converting language into structured records.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A plausible implication is not always an entailment. Separate what the text states, what it conventionally presupposes and what a reader merely guesses from world knowledge.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Event roles can remain stable across changes in grammatical voice.</li>
    <li>Negation, attribution and scope determine what a sentence actually asserts.</li>
    <li>Reference resolution can require document context and may remain ambiguous.</li>
  </ul>
</div>

## References

1. Bird, Klein and Loper, [Analyzing the Meaning of Sentences](https://www.nltk.org/book/ch10.html), introduces logical meaning representations and inference.
2. Bos and Markert. [Recognising Textual Entailment with Logical Inference](https://aclanthology.org/H05-1079/). HLT/EMNLP, 2005.
