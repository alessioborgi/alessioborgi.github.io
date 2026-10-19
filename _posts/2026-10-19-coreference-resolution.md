---
layout: single
title: "Coreference Resolution: Mentions, Antecedents and Entity Clusters"
date: 2026-10-19 09:27:00 +0100
categories: [nlp]
book: nlp
subsection: semantics
tags: ["nlp", "coreference", "discourse", "mentions"]
excerpt: "Track entities across a document, derive antecedent scoring with a dummy option, and understand how mention detection and cluster metrics affect evaluation."
author_profile: true
read_time: true
is_overview: false
icon: "🪢"
read_mins: 5
permalink: /blog/nlp/coreference-resolution/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Coreference resolution groups mentions that refer to the same entity. An antecedent model chooses an earlier mention or a dummy option for each candidate. Mention detection, ambiguity and cluster-level consistency matter as much as pairwise similarity.
</div>

## From repeated expressions to an entity

“Rossi inspected a robot. The engineer repaired it.” Under an ordinary reading, `Rossi` and `The engineer` can form one cluster, while `a robot` and `it` form another. The task is about referential identity, not lexical similarity: the two mentions in a cluster can have no words in common.

Mention boundaries also matter. `the damaged robot near the door` and its head `robot` may refer to the same entity, but a benchmark can require one particular span. A system evaluated on gold spans avoids the detection problem; an end-to-end system must solve it.

## Not every relation is coreference

“A robot entered. Its battery was empty.” The battery is related to the robot but is not the same entity. This is a bridging or part–whole relation, not ordinary identity coreference. Likewise, a generic mention of “robots” need not corefer with a later particular robot.

Expletive `it` in “It is raining” has no ordinary entity antecedent. Reflexives and pronouns obey grammatical constraints, while names and descriptions require lexical and discourse evidence. A nearest-noun heuristic ignores these distinctions.

## Score antecedents with a dummy option

For mention candidate $$i$$, consider earlier candidates $$j<i$$ and a dummy antecedent $$\epsilon$$. A common decomposition is

<div class="formula-box">
\[
s(i,j)=s_m(i)+s_m(j)+s_a(i,j),\qquad
P(y_i=j)=\frac{e^{s(i,j)}}{\sum_{j'\in\mathcal A(i)}e^{s(i,j')}}.
\]
</div>

Mention scores estimate whether spans are plausible mentions; the pair score estimates compatibility. The dummy can represent a new entity or a non-mention under the model's convention. State that convention before interpreting a dummy decision.

Training can marginalise over several valid earlier mentions in the gold cluster rather than arbitrarily selecting one antecedent. Linking to any of them may produce the same intended cluster, so treating all but one as wrong would create unnecessary supervision noise.

## A small antecedent decision

For a new mention `the robot`, suppose candidates have scores 2 for a previous robot mention, 0 for a technician mention and 1 for the dummy. The normaliser is $$e^2+e^0+e^1\approx11.107$$. Their probabilities are approximately 0.665, 0.090 and 0.245.

The most likely antecedent is the robot mention, but the dummy retains substantial mass. If a new robot has just entered the story, that uncertainty may be appropriate. A name match alone cannot establish identity when several similar entities are present.

Following selected antecedent links induces clusters. One erroneous link can merge two otherwise correct clusters, making its effect larger than a single pairwise mistake.

## Candidate spans create a computational problem

A document of $$n$$ tokens has $$O(n^2)$$ contiguous spans. Comparing all span pairs can become prohibitively expensive. Systems often limit span width, prune by mention score and keep only a subset of antecedents.

These choices impose recall ceilings. If a long gold mention is excluded by a width cap, no later scoring improvement can recover it. Report candidate coverage alongside model accuracy, especially when moving to a domain with longer technical names or different mention conventions.

## Evaluate clusters, not only links

Coreference metrics reward different properties. MUC measures how many links are needed to connect reference clusters; B³ measures mention-level cluster overlap; CEAF aligns predicted and reference clusters. Shared-task averages combine several views, but the precise variant and handling of singleton mentions must be specified.

A system that merges every mention into one cluster has high connectivity and terrible identity precision. A system that leaves every mention alone avoids wrong merges but misses nearly all multi-mention entities. Inspect both over-merging and fragmentation.

## Keep genuine ambiguity visible

“The robot approached the cart. It was damaged.” Both antecedents may fit. Additional context can resolve the sentence, but the local text need not contain enough evidence. Evaluate whether the annotation resolves such ambiguity by policy and distinguish a model error from an underdetermined example.

Coreference also interacts with speaker turns and quoted speech. `I` refers to different people in different turns. Supplying speaker metadata can help, but only if that information is available and reliable at deployment.

<div class="insight-box">
  <strong>Key Insight:</strong> Coreference decisions accumulate into clusters. A locally plausible but wrong link can merge entire entities, so pair accuracy alone understates some errors.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Part–whole relations, generic references and expletive pronouns are not ordinary entity identity. Forcing them into coreference clusters produces an apparently connected but semantically wrong document.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Coreference groups mentions by referential identity.</li>
    <li>Antecedent models need a new-entity or dummy option.</li>
    <li>Span and antecedent pruning limit achievable recall.</li>
    <li>Cluster metrics and singleton conventions must be reported explicitly.</li>
  </ul>
</div>

## References

1. Lee et al. [End-to-end Neural Coreference Resolution](https://aclanthology.org/D17-1018/). EMNLP, 2017.
2. Pradhan et al. [CoNLL-2012 Shared Task: Modeling Multilingual Unrestricted Coreference in OntoNotes](https://aclanthology.org/W12-4501/). 2012.
