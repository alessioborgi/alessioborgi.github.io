---
layout: single
title: "Tokenisation and Morphology: What Counts as a Word?"
date: 2026-10-19 09:02:00 +0100
categories: [nlp]
book: nlp
subsection: foundations
tags: ["nlp", "tokenisation", "morphology"]
excerpt: "Sentence boundaries, Unicode, word pieces, stemming and lemmatisation: preprocessing choices determine which linguistic distinctions survive."
author_profile: true
read_time: true
is_overview: false
icon: "✂️"
read_mins: 6
permalink: /blog/nlp/tokenisation-and-morphology/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A token is a unit chosen by a processing system. It may be a word, punctuation mark, character or word piece. Choose boundaries and normalisation rules to preserve the information your task needs.
</div>

## Boundaries are decisions

Take “Dr. Rossi can't attend at 3.30.” Splitting at every full stop breaks an abbreviation and a number. Splitting at spaces leaves punctuation attached and treats “can't” as one unit. That may be fine for a toy count, but a syntactic annotation scheme may require separate units for the verb and negation.

A **token** is one occurrence; a **type** is a distinct item in the vocabulary. Under whitespace splitting, “small robot small battery” has four tokens and three types. State the tokenisation convention before reporting vocabulary size or sequence length.

Word boundaries also depend on language and task. A whitespace rule developed for English is not a general segmentation algorithm.

## Normalisation changes the evidence

| Operation | Possible benefit | Possible loss |
|---|---|---|
| Lowercase | Merge case variants | “US” and “us” become identical |
| Unicode normalisation | Align equivalent encodings | Compatibility forms may collapse distinctions |
| Remove punctuation | Reduce some feature variation | Lose questions, emoticons and sentence cues |
| Remove frequent words | Reduce vocabulary size | Lose negation or grammatical relations |

For the support message “not charging”, removing “not” reverses the practical interpretation. Apply cleaning rules because of evidence from your task, and keep the original text so that mistakes remain inspectable.

## Stems, lemmas and word pieces

**Stemming** applies reduction rules, sometimes producing a fragment. **Lemmatisation** aims for a dictionary form and may need grammatical context: “saw” can be the past tense of “see” or a noun naming a tool. **Morphological analysis** goes further by identifying features such as tense, number or case.

Subword tokenisation solves a different problem: representing text with a bounded vocabulary. A segmentation such as `un + help + ful` may resemble morphology, but a learned frequency-based segmentation need not respect morpheme boundaries. The units convenient for a model are not automatically linguistic explanations.

## Keep offsets

Suppose an entity extractor returns the span for “Rossi”. If preprocessing changes string length, offsets into the processed text may no longer identify the same characters in the original. Preserve a mapping or perform annotation against a stable text representation. Also document whether offsets count bytes or Unicode code points.

A useful check is a small table of original text, normalised text, tokens and offsets. Include apostrophes, accents, emoji, abbreviations and examples from every supported language. This makes hidden assumptions visible before they become model errors.

## A reversible Unicode example

A displayed character need not be one code point. The accented character in `café` can be stored as a precomposed `é` or as `e` followed by a combining accent. The strings look alike but have different lengths and can compare unequal before normalisation.

```python
import unicodedata

composed = "café"
decomposed = "cafe\u0301"
assert composed != decomposed
assert len(composed) == 4
assert len(decomposed) == 5
assert unicodedata.normalize("NFC", decomposed) == composed
```

NFC composes canonically equivalent sequences where possible. Compatibility normalisation such as NFKC goes further and may collapse formatting distinctions. Choose it because the task accepts those changes, not merely because it makes more strings equal. Grapheme clusters, code points and encoded bytes are separate units; an offset must say which it counts.

This distinction becomes concrete when highlighting an extracted entity in a browser. A model can return a correct span in its internal units while the interface highlights the wrong substring because the two components count differently.

## Tokenisation as an explicit contract

For each processing stage, specify input representation, output units, normalisation and alignment. A useful record might contain the original document, a normalised working string, tokens and each token's original-text span. If a transformation is many-to-one, preserve enough provenance to explain the mapping rather than assuming an inverse exists.

A toy whitespace tokenizer is easy to inspect:

```python
import re

text = "Rossi  can't attend."
tokens = [(m.group(), m.start(), m.end())
          for m in re.finditer(r"\S+", text)]
assert tokens == [("Rossi", 0, 5), ("can't", 7, 12),
                  ("attend.", 13, 20)]
```

This code deliberately retains the apostrophe and final full stop inside tokens. It is a baseline with a defined behaviour, not a general linguistic tokenizer. A more elaborate system should be tested against the same alignment invariants: slicing the original string with a returned span should recover the intended token text whenever the representation claims that property.

## Evaluate preprocessing as part of the task

Compare boundary precision and recall against a declared annotation convention, then measure the downstream effect. A segmentation that matches a linguistic treebank may differ from the subword segmentation used by a neural model; neither is a universal gold standard for the other's purpose.

Keep diagnostic cases for abbreviations, contractions, compounds, accents, emoji and mixed-language messages. Track changes in vocabulary size, unknown-token rate and average sequence length. A normaliser that lowers unknown-token rate by deleting information can improve that statistic while making the classifier worse.

For learned piece vocabularies, continue with [BPE, WordPiece and unigram tokenisation](/blog/nlp/subword-tokenisation/). For grammatical analyses of word forms, use [finite-state morphology](/blog/nlp/finite-state-morphology/). These chapters separate representation choices from linguistic structure.

<div class="insight-box">
  <strong>Key Insight:</strong> Text units are part of the model interface. A token boundary, code-point offset and byte offset can all be correct under different conventions while being incompatible with one another.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Do not reuse offsets after changing Unicode normalisation or deleting characters unless you maintain an alignment map. Correct predictions with incorrect offsets are still broken extractions.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Token boundaries and vocabulary size depend on a stated convention.</li>
    <li>Normalisation can remove task-relevant evidence.</li>
    <li>Stems, lemmas and subword pieces serve different purposes.</li>
  </ul>
</div>

## References

1. Bird, Klein and Loper, [Processing Raw Text](https://www.nltk.org/book/ch03.html), covers tokenisation, regular expressions and normalisation.
2. Python Software Foundation. [Unicode HOWTO](https://docs.python.org/3/howto/unicode.html).
