---
layout: single
title: "Dependency Parsing: Transition Systems, Tree Constraints and Attachment Scores"
date: 2026-10-19 09:23:00 +0100
categories: [nlp]
book: nlp
subsection: syntax
tags: ["nlp", "dependency-parsing", "syntax", "structured-prediction"]
excerpt: "Parse a sentence with stack actions, compare local transition decisions with graph-based tree search, and interpret attachment metrics."
author_profile: true
read_time: true
is_overview: false
icon: "🕸️"
read_mins: 5
permalink: /blog/nlp/dependency-parsing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Dependency parsing assigns each word a head and relation. Transition-based parsers construct a tree through actions; graph-based parsers score arcs or larger structures and search for a valid tree. Root, cycle and projectivity constraints determine which outputs are legal.
</div>

## State the tree convention

For a basic dependency tree, each token has exactly one head, except that the designated sentence root attaches to an artificial ROOT node. The graph is connected and acyclic, and many annotation schemes require exactly one token attached directly to ROOT. Enhanced dependency graphs may add further edges, so do not apply basic-tree assumptions to them without checking the task.

An arc $$h\to d$$ says that head $$h$$ governs dependent $$d$$. A relation label adds the grammatical role. The subject of a passive sentence need not be its semantic agent; [semantic role labelling](/blog/nlp/semantic-role-labelling/) handles that separate interpretation.

## A stack, a buffer and a set of arcs

An arc-standard transition system maintains a stack, an unread-token buffer and constructed arcs. SHIFT moves the next buffer token onto the stack. With the top two stack items $$s_1,s_0$$, LEFT-ARC makes $$s_0$$ the head of $$s_1$$ and removes $$s_1$$; RIGHT-ARC makes $$s_1$$ the head of $$s_0$$ and removes $$s_0$$. Apply legality conditions so ROOT is not made a dependent and an already completed subtree is not damaged.

For `robots carry parcels`, one valid action sequence is:

| Action | Stack after action | Added arc |
|---|---|---|
| Initial | ROOT | — |
| SHIFT robots | ROOT, robots | — |
| SHIFT carry | ROOT, robots, carry | — |
| LEFT-ARC | ROOT, carry | carry → robots |
| SHIFT parcels | ROOT, carry, parcels | — |
| RIGHT-ARC | ROOT, carry | carry → parcels |
| RIGHT-ARC | ROOT | ROOT → carry |

Each removal attaches a completed dependent. If an item is removed before its own dependents have been attached, later actions cannot recover that subtree. The oracle used to create training actions must respect this condition.

## Local actions can have lasting consequences

A greedy parser chooses one action at each state. A wrong attachment can change the stack and remove options needed later. Beam search retains several action histories, but it remains approximate and increases computation.

Training only on gold action histories exposes a parser to clean states, while inference visits states produced by its own errors. Training strategies that account for non-gold states address that mismatch. The precise oracle and loss determine which recovery actions are considered acceptable.

## Graph-based parsing chooses a tree

An arc-factored model scores a candidate tree as

<div class="formula-box">
\[
s(x,y)=\sum_{(h,d)\in y}s(h,d,x).
\]
</div>

Choosing each dependent's highest-scoring head independently can create a directed cycle or an invalid root configuration. A tree-search algorithm enforces the global constraints. Maximum spanning arborescence methods support non-projective structures under appropriate constraints; projective dynamic programs restrict the allowed trees.

Consider three words where the strongest local arcs are 1→2, 2→3 and 3→1. Every word gets one head, but the result is a cycle disconnected from ROOT. The constrained optimum must sacrifice at least one locally preferred arc. This is why a tree constraint is more than a formatting rule.

## Projectivity is a linguistic and algorithmic restriction

In a projective tree, descendants of a node occupy a contiguous span under the usual dependency ordering definition. Crossing arcs are a common visible sign of non-projectivity. Some languages and constructions require such structures more often than others.

An ordinary arc-standard parser without extra operations generates projective trees. Adding a SWAP-like operation or using a non-projective graph algorithm changes the reachable structures. Report that choice before interpreting a parser's error rate as a pure scoring failure.

## Read UAS and LAS carefully

Unlabelled attachment score measures correct heads; labelled attachment score requires both the correct head and relation. Tokenisation, punctuation inclusion and root conventions affect the denominator. A system can have high UAS while confusing subject and object labels, which matters for downstream extraction.

Inspect attachment distance, coordination, modifier attachment and language-specific constructions. Compare parsers under the same annotation scheme and input segmentation. A correct tree in one convention can appear systematically wrong under another.

<div class="insight-box">
  <strong>Key Insight:</strong> A dependency parser must optimise inside the space of legal trees. Independent arc preferences are useful scores, but they are not themselves a valid parse.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Grammatical subjects and objects are not universal semantic agents and patients. Passive voice and other constructions break that shortcut even when the dependency tree is correct.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Basic dependency trees require explicit head, root and cycle constraints.</li>
    <li>Arc-standard actions build and remove completed subtrees.</li>
    <li>Graph-based search enforces tree structure over arc scores.</li>
    <li>Projectivity and attachment-metric conventions materially affect comparisons.</li>
  </ul>
</div>

## References

1. Nivre, J. [An Efficient Algorithm for Projective Dependency Parsing](https://aclanthology.org/W03-3017/). IWPT, 2003.
2. McDonald, Crammer and Pereira. [Online Large-Margin Training of Dependency Parsers](https://aclanthology.org/P05-1012/). ACL, 2005.
3. Nivre et al. [Universal Dependencies v2: An Evergrowing Multilingual Treebank Collection](https://aclanthology.org/2020.lrec-1.497/). LREC, 2020.
