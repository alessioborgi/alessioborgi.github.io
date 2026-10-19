---
layout: single
title: "Constituency Parsing with CKY: Spans, Split Points and Inside Scores"
date: 2026-10-19 09:22:00 +0100
categories: [nlp]
book: nlp
subsection: syntax
tags: ["nlp", "constituency", "cky", "pcfg"]
excerpt: "Build a parse chart from a small grammar, derive the cubic recurrence, and distinguish recognition, best-tree parsing and summing over trees."
author_profile: true
read_time: true
is_overview: false
icon: "🌲"
read_mins: 5
permalink: /blog/nlp/constituency-and-cky/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> CKY builds larger constituents from shorter spans under a binarised context-free grammar. A chart stores reusable subproblems. Boolean, max-product and sum-product versions respectively recognise parses, select the best tree and sum probability over trees.
</div>

## Put the grammar into a useful form

The core CKY algorithm assumes rules of the form $$A\to BC$$ or $$A\to w$$, with special handling for any permitted empty string. Longer productions can be binarised using auxiliary nonterminals; unary rules require elimination or a closure procedure. Those transformations are part of the parser specification.

For a toy sentence `robots carry parcels`, use:

```text
S  → NP VP
VP → V NP
NP → robots
NP → parcels
V  → carry
```

The grammar is deliberately tiny. It licenses one simple structure and says nothing about agreement, modifiers or unknown words. Starting with a constrained grammar makes the chart mechanics visible before adding linguistic coverage.

## A chart cell names a span

Use half-open boundaries $$[i,j)$$. The sentence has tokens at positions 0, 1 and 2, and boundaries 0 through 3. Cell $$(i,j)$$ stores nonterminals that can derive exactly that span.

Initialise one-token spans from lexical rules:

| Span | Text | Categories |
|---|---|---|
| [0,1) | robots | NP |
| [1,2) | carry | V |
| [2,3) | parcels | NP |
| [1,3) | carry parcels | VP |
| [0,3) | robots carry parcels | S |

To obtain VP over [1,3), split at 2 and combine V over [1,2) with NP over [2,3). To obtain S over [0,3), split at 1 and combine NP with VP. The chart stores each subanalysis once even if several larger trees reuse it.

## The recurrence and its cost

For Boolean recognition,

<div class="formula-box">
\[
\operatorname{chart}[i,j,A]=
\bigvee_{A\to BC}\ \bigvee_{k=i+1}^{j-1}
\left(\operatorname{chart}[i,k,B]\land\operatorname{chart}[k,j,C]\right).
\]
</div>

There are $$O(n^2)$$ spans and up to $$O(n)$$ split points per span. With a fixed grammar, the usual time bound is cubic in sentence length; explicitly checking binary productions adds a grammar-size factor. Space for category membership is $$O(n^2|N|)$$. Storing every complete tree separately can be exponential, so ambiguous parses are represented compactly through chart edges or packed forests.

## Best tree versus total probability

A probabilistic context-free grammar assigns probabilities to rules, normalised for each left-hand nonterminal. A tree probability is the product of its rule probabilities. Best-tree CKY chooses the maximum product over each rule and split; the inside algorithm sums those products.

If a sentence has two trees with probabilities 0.3 and 0.2, its total probability under those alternatives is 0.5, while the best-tree score is 0.3. Under a complete set of those alternatives, the posterior probability of the best tree given the sentence is 0.6. Confusing these quantities leads to misleading confidence estimates.

A PCFG also needs a proper termination behaviour for its derivations if it is to define a distribution over finite trees. Locally normalised recursive rules alone do not guarantee that every derivation terminates.

## Recover the tree

For best-tree parsing, save the winning rule and split point at each chart entry. Follow the backpointers from the root S over [0,n). Without them, the chart proves that a tree exists but does not tell you its structure.

Binarisation introduces artificial nodes. Remove or interpret those nodes consistently when evaluating against the original treebank. Otherwise a parser may be penalised for implementation-specific structure that the reference never annotated.

## What the algorithm cannot fix

CKY searches the structures allowed by its grammar. If the correct tree is not licensed, exact search cannot return it. A strong scoring model cannot fix missing lexical coverage either. Distinguish grammar coverage, scoring mistakes and search approximation when analysing errors.

Plain context-free categories can also miss agreement or lexical preferences. Feature grammars enrich categories; lexicalised or neural scores add contextual evidence. These changes affect which subproblems can still be shared exactly. The [dependency chapter](/blog/nlp/dependency-parsing/) explores another representation and its corresponding search choices.

<div class="insight-box">
  <strong>Key Insight:</strong> The chart is a reusable map of span analyses. Changing the algebra from Boolean to max or sum changes the inference task while preserving the same decomposition into subspans.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> An inside score sums over trees; a Viterbi score selects one. Reporting the latter as the full sentence likelihood discards the probability mass of alternative parses.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Core CKY combines binary grammar rules over half-open spans.</li>
    <li>Cubic time comes from spans, split points and grammar combinations.</li>
    <li>Backpointers recover a best tree; packed structures preserve ambiguity.</li>
    <li>Grammar transformations and evaluation conventions must be aligned.</li>
  </ul>
</div>

## References

1. Younger, D. H. *Recognition and Parsing of Context-Free Languages in Time n³*. Information and Control, 1967.
2. Bird, Klein and Loper. [Analyzing Sentence Structure](https://www.nltk.org/book/ch08.html).
3. Manning and Schütze. *Foundations of Statistical Natural Language Processing*. MIT Press, 1999.
