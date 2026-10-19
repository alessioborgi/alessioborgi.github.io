---
layout: single
title: "Lexical Semantics and Word Senses: Relations, Glosses and Context"
date: 2026-10-19 09:25:00 +0100
categories: [nlp]
book: nlp
subsection: semantics
tags: ["nlp", "lexical-semantics", "wordnet", "wsd"]
excerpt: "Distinguish word forms from senses, compare lexical relations, and build a transparent sense-disambiguation baseline before using contextual representations."
author_profile: true
read_time: true
is_overview: false
icon: "📖"
read_mins: 5
permalink: /blog/nlp/lexical-semantics-and-wsd/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A word form can realise several senses. Lexical resources organise senses and relations; word sense disambiguation chooses an inventory entry for an occurrence in context. Inventory granularity, candidate coverage and sense frequency are central parts of the task.
</div>

## A spelling is not one meaning

“Charge the battery” and “charge the customer” use the same verb spelling with different senses. A static embedding mixes their training contexts. A contextual vector can distinguish the occurrences, but mapping that vector to a named sense still requires a sense inventory and a decision rule.

A lexeme groups related forms such as `charge`, `charges` and `charged`; a sense describes a particular meaning within that lexical item. Lemma, part of speech and sense are therefore different annotation levels. A pipeline that chooses the wrong part of speech may exclude the correct sense before disambiguation begins.

## Relations belong to senses

WordNet groups lexical senses into synsets and connects them through relations. A **hypernym** is a more general category; a **hyponym** is a more specific one. **Meronymy** relates parts to wholes. Synonymy concerns sufficiently similar meanings in a specified sense, not unrestricted interchangeability of spellings.

| Relation | Illustration | What it does not guarantee |
|---|---|---|
| Hypernymy | poodle → dog | That every dog is a poodle |
| Meronymy | wheel → vehicle | That a wheel is a kind of vehicle |
| Antonymy | hot ↔ cold | That the words occur in different topics |
| Sense similarity | two financial readings of “bank” | That either matches the river-bank reading |

A distributional model may place antonyms close because they occur in similar constructions. A lexical relation system can represent their opposition explicitly. Neither representation subsumes every use of the other.

## A gloss-overlap baseline

A Lesk-style baseline compares the words in a sense definition with the occurrence's context. Choose a preprocessing convention, collect content-word overlap, and select the highest-scoring candidate. Extended variants include related glosses or weighted overlap, but those are additional design choices.

For `charge` in “the cable will charge the battery”, compare toy glosses:

- Electrical sense: “supply electrical energy to a battery”.
- Payment sense: “ask a customer to pay a price”.

The context shares `battery` with the first gloss and nothing with the second. The baseline is interpretable, but a paraphrase such as “restore power to the device” may eliminate exact overlap while preserving the intended sense.

Define tie handling and a fallback, often a training-derived most-frequent-sense prior. Without a strong prior baseline, a model can appear effective merely by selecting the dominant sense for every occurrence.

## Contextual scoring

A learned system may score a context representation $$h(x,i)$$ against a sense representation $$g(s)$$:

<div class="formula-box">
\[
\hat s=\arg\max_{s\in S(w)}\left(h(x,i)^\top g(s)+b_s\right).
\]
</div>

The candidate set $$S(w)$$ is restricted by the word, lemma or part of speech according to the task. Sense vectors can come from labelled examples, gloss encoders or both. A score becomes a distribution only after a specified normalisation, and its confidence still needs validation.

Suppose two senses have scores 2 and 1. A softmax gives probabilities about 0.731 and 0.269. If a third plausible sense was omitted, those probabilities express confidence within an incomplete candidate set. High confidence cannot repair missing inventory coverage.

## Granularity changes the task

A coarse inventory might separate financial and geographical `bank`. A fine inventory may distinguish several financial senses that even careful readers struggle to separate. Accuracy under the two inventories is not directly comparable.

Inspect errors at both fine and coarse levels when the resource permits it. A near miss between two specialised senses may be less consequential for document search than confusing a financial institution with a river edge. The application determines which distinctions must survive.

## Evaluate rare senses and new domains

Report performance beyond the most frequent senses. Group or split data so duplicated examples and dictionary templates do not leak across training and test. A model trained on financial news may over-predict financial senses in a geography corpus.

Sense disambiguation is useful when a task needs explicit lexical meaning: dictionary assistance, semantic search or linguistic analysis. For tasks that only need a good contextual prediction, an explicit inventory may be unnecessary. Choose the output that the user or downstream system will actually consume.

<div class="insight-box">
  <strong>Key Insight:</strong> Word sense disambiguation is classification over an inventory. The inventory defines both what counts as a correct distinction and which meanings the system is allowed to express.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A high-frequency sense can dominate aggregate accuracy. Compare against a most-frequent-sense baseline and report rare-sense behaviour before claiming contextual disambiguation.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Word forms, lemmas and senses are different objects.</li>
    <li>Hypernymy, meronymy and distributional similarity encode different relations.</li>
    <li>Gloss overlap is a transparent baseline with predictable paraphrase failures.</li>
    <li>Inventory coverage and granularity constrain every disambiguation model.</li>
  </ul>
</div>

## References

1. Princeton University. [WordNet](https://wordnet.princeton.edu/).
2. Lesk, M. *Automatic Sense Disambiguation Using Machine Readable Dictionaries: How to Tell a Pine Cone from an Ice Cream Cone*. SIGDOC, 1986.
3. Bevilacqua et al. [Recent Trends in Word Sense Disambiguation: A Survey](https://www.ijcai.org/proceedings/2021/593). IJCAI, 2021.
