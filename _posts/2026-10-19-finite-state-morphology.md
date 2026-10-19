---
layout: single
title: "Finite-State Morphology: From Lemmas and Features to Surface Words"
date: 2026-10-19 09:04:00 +0100
categories: [nlp]
book: nlp
subsection: foundations
tags: ["nlp", "morphology", "finite-state", "transducers"]
excerpt: "Analyse and generate word forms with finite-state transducers, separating lexical choices from spelling rules and keeping ambiguity explicit."
author_profile: true
read_time: true
is_overview: false
icon: "⚙️"
read_mins: 4
permalink: /blog/nlp/finite-state-morphology/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A finite-state transducer relates an input string to an output string. Morphological systems use that relation to connect a lemma and grammatical features to a surface form. Composing a lexicon with spelling rules supports both analysis and generation.
</div>

## Morphology is a relation

The surface string `walked` can be related to the analysis `walk+Verb+Past`. Generation travels from analysis to spelling; analysis travels from spelling to a set of possible analyses. The inverse is often ambiguous: `walks` can be a plural noun or a third-person singular verb.

A suffix-removal rule cannot capture that distinction by itself. It also cannot explain `went → go+Verb+Past`, where the surface form does not contain the lemma. A morphological analyser combines a lexicon, feature constraints and spelling behaviour. The [tokenisation chapter](/blog/nlp/tokenisation-and-morphology/) distinguishes this task from dividing text into model tokens.

## Automata versus transducers

A finite-state acceptor recognises strings through transitions labelled with symbols. A transducer labels each transition with an input/output pair. A label `a:b` consumes `a` and emits `b`; an epsilon on one side permits insertion or deletion on that side.

For a simplified plural rule, a path might consume `cat+N+Pl` and emit `cats`. The grammatical tags are part of the analysis alphabet, not characters that appear in the surface word. Different paths can map different analyses to the same spelling.

| Analysis | Intermediate form | Surface |
|---|---|---|
| cat + N + Pl | cat + s | cats |
| city + N + Pl | city + s | cities |
| sheep + N + Pl | sheep + zero | sheep |

This table separates morphological choice from spelling. The plural of `city` needs a spelling alternation; the plural of `sheep` needs a lexical exception or class rule. Neither is evidence that the grammatical feature *plural* has disappeared.

## Compose the pieces

Let $$L$$ map lexical analyses to intermediate strings and $$R$$ map intermediate strings to surface spellings. Their composition maps analyses directly to surfaces:

<div class="formula-box">
\[
(L\circ R)(a,s)\quad\Longleftrightarrow\quad
\exists m:\ L(a,m)\land R(m,s).
\]
</div>

Here the composition order is explicitly “apply $$L$$, then $$R$$”; notation differs across libraries. The intermediate string $$m$$ lets a lexicon choose an affix while a separate rule handles its spelling. This modularity makes it possible to inspect which component licensed an output.

For `city+N+Pl`, let $$L$$ produce `city+s`. A contextual rule changes the final `y` to `ie` before this plural suffix, yielding `cities`. Such a toy rule needs a consonant context and lexical exceptions before it describes English reliably: applying it indiscriminately would damage `boys`.

## Constraints prevent impossible analyses

A morphotactic grammar controls which features and affixes can co-occur. A path for an English noun might allow number, while a verb path allows tense and agreement. Simply concatenating every known affix would generate many impossible forms.

Agreement can also be checked outside the word. “These robot” contains individually analysable words but an incompatible number pattern under the ordinary noun-phrase analysis. Word-level morphology provides features that a [syntactic parser](/blog/nlp/syntactic-parsing/) can use; it does not solve sentence-level agreement alone.

## Add weights, then disambiguate

A weighted transducer attaches costs or weights to paths. Depending on the chosen algebra, path weights combine additively or multiplicatively, and competing paths are summed or minimised. State the convention before calling a weight a probability.

A word analyser may return both noun and verb readings of `flies`. Sentence context then ranks them: “time flies” and “fruit flies” can support different structures. Preserve alternatives until the component with the needed context can decide. Coverage tests should include rare inflections and exceptions, while precision tests should include plausible-looking forms that the grammar should reject.

<div class="insight-box">
  <strong>Key Insight:</strong> Analysis and generation can share one explicit relation. Ambiguity is represented by multiple valid paths, allowing later context to choose among them.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Inverting a transducer does not guarantee a unique analysis. A system that returns only the first path may hide valid readings and make downstream disambiguation impossible.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>A transducer maps between two symbol sequences; an acceptor recognises one.</li>
    <li>Morphotactics and spelling alternations are separate constraints.</li>
    <li>Composition connects lexical analyses to surface forms through an intermediate representation.</li>
    <li>Context is often needed to choose among valid morphological analyses.</li>
  </ul>
</div>

## References

1. Beesley and Karttunen. *Finite State Morphology*. CSLI Publications, 2003.
2. Mohri, M. [Finite-State Transducers in Language and Speech Processing](https://aclanthology.org/J97-2003/). Computational Linguistics, 1997.
3. Bird, Klein and Loper. [Building Feature Based Grammars](https://www.nltk.org/book/ch09.html).
