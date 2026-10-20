---
layout: single
title: "IRCoT and ReAct: Interleave Evidence Acquisition with Multi-Step Work"
date: 2026-10-20 09:15:00 +0100
categories: [nlp]
book: nlp
subsection: rag-adaptive
tags: ["nlp", "rag", "ircot", "react", "multi-hop"]
excerpt: "Compare retrieval-guided reasoning with general tool interaction, follow a two-hop evidence graph, and distinguish generated plans from observed results."
author_profile: true
read_time: true
is_overview: false
icon: "🧭"
read_mins: 4
permalink: /blog/nlp/rag-ircot-react/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> IRCoT alternates intermediate reasoning and retrieval for multi-step questions. ReAct interleaves generated reasoning with actions and observations in a broader tool environment. Both make later information requests depend on earlier results, but their action spaces and evaluation settings differ.
</div>

## A bridge fact creates the next query

Consider “In which city was the manufacturer of the R7 founded?” The initial question names a product, not the company whose history is needed. The first retrieval must establish the manufacturer; only then can the second query target that company's founding location.

One-shot retrieval may happen to find both facts, but an iterative process can make the dependency explicit. The evidence graph has a product-to-company edge and a company-to-city edge. The final answer is justified only if the entities on the two edges refer to the same company.

## IRCoT uses intermediate reasoning to retrieve

IRCoT interleaves generated reasoning steps with retrieval, using newly available evidence to improve subsequent steps and using those steps to guide further searches. Its contribution is this reciprocal dependence for knowledge-intensive multi-step questions.

The intermediate text is a hypothesis about how to proceed, not a new source. If it incorrectly identifies the manufacturer, all later retrieval may be internally coherent yet answer the wrong question. Check the bridge fact before treating it as a stable search constraint.

## ReAct generalises the action loop

ReAct combines reasoning and actions with observations from an environment. Actions can include search or lookup, and in other settings can involve different tools. The observed result is supplied back to the model to inform the next action.

This is broader than retrieval-only RAG. A system using a fixed retriever and a single prompt is not a full ReAct loop merely because its prompt contains the word “reason”. The interface must define available actions, their arguments and how results return.

## A small state model

Represent an iterative evidence state as

<div class="formula-box">
\[
s_t=(q,E_t,U_t,B_t),
\]
</div>

where $$q$$ is the original question, $$E_t$$ verified acquired evidence, $$U_t$$ unresolved subquestions and $$B_t$$ the remaining budget. A controller chooses a search, lookup or answer action; observations update the evidence state.

This is an explanatory abstraction rather than either paper's exact implementation. It encourages useful bookkeeping: generated conjectures should not be silently inserted into $$E_t$$ as if a tool had observed them.

For the R7 example, after the first search the unresolved question changes from “Who made R7?” to “Where was that company founded?” If two manufacturers remain plausible, preserve the alternatives or seek disambiguating evidence rather than arbitrarily choosing one.

## Loops need termination and deduplication

Track canonical queries and returned source IDs. Repeating the same search with small wording changes may not add evidence. A stopping policy can require sufficient support for the final claim, exhaustion of a call budget or an explicit finding that the collection lacks an answer.

A generated assertion that a tool succeeded is not a tool result. Store actual outputs and errors, and ensure a failed search cannot be transformed into a successful observation by the next text-generation step.

## Evaluate paths as well as final answers

A final answer can be correct by guessing while its evidence path is invalid. Measure bridge-entity accuracy, supporting-path completeness, unnecessary calls and final claim support. Include questions where similarly named entities make the wrong path plausible.

Compare against one-shot retrieval with the same total evidence budget. Otherwise an iterative method may win simply because it sees many more documents. Also inspect whether each additional step improves evidence coverage or compounds an earlier error.

[Search-R1](/blog/nlp/rag-search-r1/) moves from a primarily prompted interaction pattern toward learning a search policy with reinforcement learning. The same distinction between model-authored actions and externally observed evidence remains important there.

<div class="insight-box">
  <strong>Key Insight:</strong> Multi-hop answering is an evidence-dependency problem. The correctness of the bridge between sources matters as much as finding individually relevant passages.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A generated plan or intermediate explanation is not external evidence. Keep conjectures, executed actions and observed tool results separate in both implementation and evaluation.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>IRCoT alternates reasoning and retrieval for multi-step questions.</li>
    <li>ReAct supports a broader action–observation loop.</li>
    <li>Track bridge facts, unresolved questions and remaining budget.</li>
    <li>Evaluate evidence paths and tool outcomes, not only final-answer accuracy.</li>
  </ul>
</div>

## References

1. Trivedi et al. [Interleaving Retrieval with Chain-of-Thought Reasoning for Knowledge-Intensive Multi-Step Questions](https://arxiv.org/abs/2212.10509). ACL, 2023.
2. Yao et al. [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629). ICLR, 2023.
3. Jeong et al. [Adaptive-RAG: Learning to Adapt Retrieval-Augmented Large Language Models through Question Complexity](https://arxiv.org/abs/2403.14403). NAACL, 2024.
