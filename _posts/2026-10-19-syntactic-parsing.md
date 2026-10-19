---
layout: single
title: "Syntactic Parsing: Constituents, Dependencies and Ambiguity"
date: 2026-10-19 09:21:00 +0100
categories: [nlp]
book: nlp
subsection: syntax
tags: ["nlp", "syntax", "parsing"]
excerpt: "Represent sentence structure with phrases or dependencies, and see why grammatical attachment changes interpretation."
author_profile: true
read_time: true
is_overview: false
icon: "🌳"
read_mins: 6
permalink: /blog/nlp/syntactic-parsing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Parsing predicts grammatical structure. Constituency groups words into phrases; dependency parsing connects words through head–dependent relations. Both must resolve ambiguity that a sequence of word counts cannot express.
</div>

## Two views of one sentence

For “The robot carries a parcel”, a simplified constituency analysis groups “The robot” as a noun phrase and “carries a parcel” as a verb phrase:

```text
Sentence
├── Noun phrase: The robot
└── Verb phrase
    ├── Verb: carries
    └── Noun phrase: a parcel
```

A dependency view instead makes “carries” the root, with “robot” as its subject and “parcel” as its object. Determiners depend on their nouns. The phrase tree makes nested spans explicit; the dependency tree makes grammatical relations between words explicit.

These structures are annotations under a chosen grammar. Different schemes may assign different heads or labels, so compare a parser against data using the same convention.

## Attachment changes the reading

Consider “The technician inspected the robot with a camera.” Does the technician use a camera to inspect, or does the robot have a camera? Attaching the final phrase to the verb supports the first reading; attaching it to the noun supports the second.

Both readings use the same words in the same order. Choosing between them can require context beyond the sentence. A parser returning one tree commits to a reading even when the evidence is insufficient.

## Search over structures

A context-free grammar can include rules such as `S → NP VP` and `VP → V NP`. A chart parser stores analyses of spans so they can be reused rather than recomputed for every candidate tree. Grammar rules alone may license several trees; a probabilistic or learned scorer can rank them.

A dependency parser searches for head assignments subject to structural constraints. For a basic tree, each non-root word has one head, the structure is connected, and directed cycles are excluded. Independent head choices can violate these requirements, so producing valid structure is part of decoding.

## Read the errors linguistically

A parser may identify every noun correctly while attaching a modifier to the wrong noun. That error can change an extracted relation. If “damaged” modifies “box” rather than “robot”, a downstream system should not automatically record a damaged robot.

Evaluate structural accuracy and inspect the relations needed by the application. A small overall difference may conceal a large change on negation, coordination or long-distance attachments. Also keep tokenisation aligned: a disagreement over the units can make otherwise compatible structures impossible to compare directly.

## Ambiguity grows faster than the sentence

Even before assigning grammatical categories, the number of binary bracketings of $$n$$ ordered leaves is the Catalan number $$C_{n-1}$$. For four leaves there are five bracketings; for five leaves there are 14. Real grammars rule out many structures but can also supply multiple labels and lexical analyses for each span.

This is why a parser benefits from sharing subproblems. If several complete trees contain the same noun phrase over the same words, a chart can store that analysis once. The [CKY chapter](/blog/nlp/constituency-and-cky/) derives the recurrence and distinguishes recognition, best-tree decoding and marginalisation over trees.

A parser returning only one structure hides alternative analyses. For an ambiguous sentence, keep a ranked set, a packed forest or local uncertainty where the application can use it. A single tree is a decision, not evidence that language supplied only one possible reading.

## Grammatical features constrain structure

A rule `S → NP VP` alone cannot distinguish “the robots move” from “the robots moves”. Feature structures can attach number and person to categories, and unification can require compatible values between subject and predicate.

A toy rule can require the NP's number feature to equal the VP's agreement feature. If NP is plural and VP is singular, the attempted combination fails. This constrains grammar without treating every inflected surface form as an unrelated syntactic category.

The constraint depends on the language and construction. Collective nouns, coordination and dialect variation can complicate a simple agreement rule. Treat such examples as questions about the grammar being modelled rather than automatically labelling every departure as corrupt text.

## Phrase boundaries and word heads answer different questions

For “the very small robot”, a constituency tree identifies the nested adjective phrase and noun phrase spans. A dependency tree identifies the head `robot` and relations among modifiers and determiners. Neither output is simply a more detailed version of the other; they organise structure differently.

Conversion between representations requires head rules and annotation decisions. If a converted tree disagrees with a manually annotated dependency tree, the disagreement may arise from conversion conventions rather than the original phrase analysis. Report those conventions when evaluating a converted parser.

## Evaluate the structure the application needs

Constituent evaluation often scores labelled spans after excluding designated root or punctuation structures. Dependency evaluation scores heads and relation labels. A sentence can have mostly correct local attachments while a single wrong coordination structure changes the extracted meaning.

Inspect a concrete downstream query. If the task asks which component is damaged, modifier attachment and coordination scope matter more than whether every determiner attaches correctly. Report overall structural scores, then a relevant diagnostic slice rather than replacing the overall metric with anecdotes.

For parsing comparisons, control tokenisation and any supplied gold tags. A parser receiving gold part-of-speech labels has information unavailable to a fully automatic pipeline. The [dependency-parsing chapter](/blog/nlp/dependency-parsing/) follows tree construction and its constraints in more detail.

<div class="insight-box">
  <strong>Key Insight:</strong> A parser separates the space of licensed structures, the score assigned to each structure and the search procedure. Diagnose coverage, scoring and search errors independently.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A correct parse under one annotation scheme may be scored as wrong under another. Head rules, punctuation, unary nodes and token boundaries must agree before metrics are comparable.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Constituency describes nested phrases; dependencies describe word relations.</li>
    <li>Ambiguous attachment can change the interpreted event.</li>
    <li>A valid tree and a correct interpretation are separate requirements.</li>
  </ul>
</div>

## References

1. Bird, Klein and Loper, [Analyzing Sentence Structure](https://www.nltk.org/book/ch08.html), introduces grammars, parsing and syntactic ambiguity.
2. Bird, Klein and Loper. [Building Feature Based Grammars](https://www.nltk.org/book/ch09.html).
