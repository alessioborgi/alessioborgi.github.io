---
layout: single
title: "Search-R1: Learning a Search Policy with Reinforcement Learning"
date: 2026-10-20 09:16:00 +0100
categories: [nlp]
book: nlp
subsection: rag-adaptive
tags: ["nlp", "rag", "search-r1", "reinforcement-learning", "search-policy"]
excerpt: "Explain retrieval inside an RL rollout, distinguish action tokens from retrieved observations, and diagnose reward shortcuts and search-environment dependence."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 4
permalink: /blog/nlp/rag-search-r1/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Search-R1 trains language models to use search during answer generation through reinforcement learning. Search results enter the rollout as observations, while the model learns its own query and answer actions. Retrieved-token masking prevents external text from being treated as model-generated policy actions.
</div>

## From a prompted loop to a learned policy

Search-R1 studies reinforcement learning with an integrated search environment, allowing a model to issue queries, consume retrieved results and continue toward an answer. The approach learns search behaviour from task rewards rather than relying only on a fixed prompted interaction pattern.

The paper's experiments use specific models, search resources and reward definitions. It should not be described as automatically reproducing arbitrary web browsing, or as necessarily starting from a model whose name includes R1. The central contribution is training a language-model policy in a retrieval-interleaved environment.

## Actions and observations are different tokens

During a rollout, the model generates an action such as a search query. The environment returns text that the model did not choose token by token. Those returned tokens become context for subsequent generation but are not policy actions.

Search-R1 masks retrieved tokens in its training loss. Without that distinction, the optimiser can incorrectly treat the environment's passage as if the model generated it. This is especially important when applying sequence-level rewards over trajectories containing both kinds of text.

A useful trace marks each span as policy output or environment observation, along with the query and source IDs that produced it. A single flattened string loses information needed to reconstruct the learning problem.

## An illustrative RL objective

Let $$\tau$$ denote a trajectory of generated actions and retrieved observations. A general objective is

<div class="formula-box">
\[
J(\theta)=\mathbb E_{\tau\sim\pi_\theta,\mathcal E}[R(\tau)].
\]
</div>

Here $$\mathcal E$$ is the search environment. Policy-gradient updates involve model-chosen actions, conditioned on observations. This equation describes the general RL setting; reproducing Search-R1 requires its actual optimisation, reward and masking choices.

A cost-aware extension might use $$R=R_{\mathrm{answer}}-\lambda N_{\mathrm{search}}$$. That is an illustrative design option, not a claim that it is the paper's exact reward. If two policies achieve the same answer reward with one and four calls, a positive call penalty prefers the shorter route.

## Outcome reward does not certify the evidence path

A final-answer reward can be earned through memorisation, a lucky guess or an unsupported intermediate assumption. Search use is beneficial only if it improves the intended evidence-dependent task.

Test questions whose supporting facts can be changed in the retrieval corpus without changing the question. A system genuinely using the evidence should respond appropriately to the controlled change, while still handling contradictions and source scope. Also measure performance when relevant evidence is removed.

## The search environment is part of training

Index contents, retrieval quality, result formatting and maximum calls define what policy behaviour is rewarded. A query style effective against one engine may transfer poorly to another. Search results can also change over time, making an uncontrolled live environment difficult to reproduce.

Record corpus and retriever snapshots, tool limits, formatting and failure behaviour. Evaluate with altered retrieval quality and unseen question templates. This tests whether the model learned useful search decisions or overfit to particular snippets and answer cues.

## Compare learning against stronger baselines

Use a no-search baseline, one-shot RAG and a prompted iterative baseline such as [ReAct](/blog/nlp/rag-ircot-react/). Match or report model size, training data, retrieval budget and inference tokens. Training compute and added supervision are part of the comparison.

Inspect query usefulness, evidence coverage, invalid tool calls, repeated searches and supported-answer rate. A longer reasoning trace is not itself a better search policy. The scientific question is whether learned interaction acquires and uses the right information more reliably under the chosen constraints.

<div class="insight-box">
  <strong>Key Insight:</strong> A retrieval-interleaved rollout contains two sources of text: actions chosen by the policy and observations returned by the environment. Training must preserve that distinction.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> High answer reward does not prove that the search path was necessary or valid. Test evidence dependence and report search-environment and compute assumptions.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Search-R1 learns search behaviour through reinforcement learning.</li>
    <li>Retrieved observations must be distinguished from generated actions.</li>
    <li>Reward design can encourage shortcuts as well as useful search.</li>
    <li>Evaluate transfer across retrieval settings and compare against budget-matched baselines.</li>
  </ul>
</div>

## References

1. Jin et al. [Search-R1: Training LLMs to Reason and Leverage Search Engines with Reinforcement Learning](https://arxiv.org/abs/2503.09516). Preprint, 2025.
2. Yao et al. [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629). ICLR, 2023.
3. Trivedi et al. [Interleaving Retrieval with Chain-of-Thought Reasoning for Knowledge-Intensive Multi-Step Questions](https://arxiv.org/abs/2212.10509). ACL, 2023.
