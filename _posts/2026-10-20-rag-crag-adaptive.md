---
layout: single
title: "CRAG and Adaptive-RAG: Correct the Evidence or Route the Question"
date: 2026-10-20 09:13:00 +0100
categories: [nlp]
book: nlp
subsection: rag-adaptive
tags: ["nlp", "rag", "crag", "adaptive-rag", "routing"]
excerpt: "Compare retrieval-quality correction with question-complexity routing, work through a cost-sensitive decision, and evaluate branch errors separately."
author_profile: true
read_time: true
is_overview: false
icon: "🚦"
read_mins: 4
permalink: /blog/nlp/rag-crag-adaptive/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> CRAG judges retrieved evidence and chooses a corrective action. Adaptive-RAG routes questions among different retrieval strategies using a learned complexity estimate. They control different stages: one reacts to evidence quality, while the other estimates the kind of process the question needs.
</div>

## CRAG inspects the retrieved set

Corrective RAG adds an evaluator for question–document relevance and uses aggregate confidence to choose among corrective paths. In the paper's design, confident relevant retrieval leads to refined internal evidence; poor retrieval can trigger rewritten web search; ambiguous cases combine refined retrieved material with external search results.

Its refinement procedure also filters smaller knowledge units. The contribution is a control layer around uncertain retrieval, not a guarantee that a document classified “correct” is factually authoritative. The labels refer to the method's evaluation and branching procedure.

## Adaptive-RAG chooses a strategy from the question

Adaptive-RAG learns to select among no retrieval, single-step retrieval and iterative retrieval based on question complexity. Its training labels are informed by the outcomes of different strategies rather than a universal linguistic definition of difficulty.

A short question can require several evidence hops, while a long question may be answered by one passage. Routing must therefore be tested on the actual corpus and reader, not inferred solely from question length or the presence of words such as “why”.

| Method | Main decision input | Controlled action |
|---|---|---|
| CRAG | Quality of retrieved question–document pairs | Refine, search externally or combine |
| Adaptive-RAG | Estimated question complexity | Use zero, one or iterative retrieval |
| Self-RAG | Learned generation-time control signals | Retrieve and score generated segments |

## A cost-sensitive routing example

Suppose single-step retrieval costs one unit and answers a question class correctly 80% of the time. Iterative retrieval costs three units and reaches 90%. If an incorrect answer incurs ten utility units of penalty, expected total costs are $$1+10(0.2)=3$$ and $$3+10(0.1)=4$$. Under this illustrative policy, single-step wins.

If the error penalty rises to 30, the totals become seven and six, so iterative retrieval wins. Routing quality depends on the operating objective, not only on maximum achievable answer accuracy. These invented rates demonstrate the decision calculation rather than reporting either paper's results.

## Branch errors deserve their own confusion matrix

A false “adequate evidence” judgement can stop search too early. A false “inadequate” judgement can waste calls and introduce lower-quality web results. A question routed to no retrieval can be answered confidently from outdated memory.

Label a validation set with the evidence actually required and outcomes under each strategy. Measure routing mistakes, answer quality conditional on route, and average and tail latency. An overall accuracy number cannot reveal whether the controller consistently under-serves one query class.

## External search changes the evidence contract

A corrective web search broadens the source distribution beyond a controlled internal corpus. It may improve coverage, but now dates, authorship, scope and source authority can differ substantially. Preserve the provenance of each result and retain the original question's constraints.

If the task requires answers exclusively from a specified collection, external results cannot silently become valid evidence. A corrective policy must respect that information boundary; sometimes the appropriate outcome is an explicit lack of support rather than a broader search.

## Test correction against simpler alternatives

Compare with always-retrieve, never-retrieve and fixed-budget iterative baselines. For CRAG, isolate the evaluator from the effect of simply adding web search. For Adaptive-RAG, compare the learned router with a fixed strategy under matched cost or accuracy constraints.

Also examine the refinement stage: splitting and filtering can remove a negation or qualification. The smaller text may look more relevant while becoming less faithful. Evaluate supporting evidence after correction, not only before it.

<div class="insight-box">
  <strong>Key Insight:</strong> Evidence-quality correction and question-complexity routing are distinct control problems. Their decisions should be judged against the information and cost available at that point in the pipeline.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Do not read CRAG’s “correct” branch label as a universal truth certificate, or Adaptive-RAG’s complexity label as an intrinsic property independent of the corpus and reader.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>CRAG reacts to retrieved evidence and can trigger corrective search.</li>
    <li>Adaptive-RAG chooses among retrieval strategies before committing their full cost.</li>
    <li>Routing policy depends on error costs and retrieval budgets.</li>
    <li>Audit branch mistakes and evidence quality after refinement.</li>
  </ul>
</div>

## References

1. Yan et al. [Corrective Retrieval Augmented Generation](https://arxiv.org/abs/2401.15884). Preprint, 2024.
2. Jeong et al. [Adaptive-RAG: Learning to Adapt Retrieval-Augmented Large Language Models through Question Complexity](https://arxiv.org/abs/2403.14403). NAACL, 2024.
3. Asai et al. [Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/abs/2310.11511). ICLR, 2024.
