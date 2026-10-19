---
layout: single
title: "Decoding Text: Greedy Search, Beam Search and Sampling"
date: 2026-10-19 09:13:00 +0100
categories: [nlp]
book: nlp
subsection: language-models
tags: ["nlp", "decoding", "beam-search", "sampling"]
excerpt: "Separate model probabilities from the algorithm that chooses a sequence, with a counterexample to greedy search and an explicit sampling calculation."
author_profile: true
read_time: true
is_overview: false
icon: "🔀"
read_mins: 4
permalink: /blog/nlp/decoding-and-search/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A language model supplies conditional probabilities; decoding turns them into an output. Greedy search makes local choices, beam search preserves several partial sequences, and sampling draws from a chosen distribution. A better search score does not necessarily imply a more useful answer.
</div>

## The sequence objective

For input $$x$$ and a completed target sequence $$y$$ including an end marker, maximum-probability decoding seeks

<div class="formula-box">
\[
y^*=\arg\max_y\sum_t\log P(y_t\mid y_{\lt t},x).
\]
</div>

The input may be a source sentence, question or dialogue history. Searching all outputs is infeasible for realistic vocabularies and lengths, so decoders approximate the search or intentionally choose another criterion.

Greedy search selects the most probable next token and never revisits that decision. It is fast, but it does not generally maximise the probability of the complete output.

## A counterexample to greedy search

At the first step, let token A have probability 0.6 and B probability 0.4. After A, the highest-probability continuation is the end marker at 0.4; the other continuations each have probability at most 0.3. After B, the end marker has probability 0.9. Suppose any longer continuation after A can have completed probability no greater than its prefix probability.

Greedy chooses A and then ends, obtaining $$0.6\times0.4=0.24$$. The completed sequence B–END has probability $$0.4\times0.9=0.36$$. The locally worse first token produces the globally better sequence. No training mistake is required for this counterexample: it follows from the distinction between local and sequence optimisation.

## Beam search retains alternatives

A beam of width $$B$$ stores up to $$B$$ active partial sequences. At each step, expand them, score candidates and retain a limited set. Track completed hypotheses separately or state precisely how they compete with active ones. Termination rules matter: ending when any candidate finishes differs from ending when no active path can beat the best completed one under the chosen score.

Beam search is still approximate because a pruned prefix cannot return. Increasing beam width generally explores more possibilities, but task quality need not improve monotonically. The model's highest-probability output may be too short, generic or otherwise unsuitable.

Length normalisation changes the objective. Dividing log probability by a function of length can favour longer outputs, but the resulting score is no longer simply log sequence probability. Tune that choice on validation data and report it alongside beam width.

## Sampling changes the goal

Sampling draws tokens rather than always choosing the maximum. Temperature $$T>0$$ transforms logits $$z_i$$ as

<div class="formula-box">
\[
p_T(i)=\frac{\exp(z_i/T)}{\sum_j\exp(z_j/T)}.
\]
</div>

Lower temperatures concentrate mass on larger logits; higher temperatures flatten it. Temperature zero is a limiting greedy interpretation, not a value that can be inserted into the division.

For probabilities 0.6, 0.3 and 0.1, top-2 sampling keeps the first two and renormalises them to $$2/3$$ and $$1/3$$. Nucleus sampling with threshold 0.8 also keeps the first two because their cumulative mass reaches 0.9. With threshold 0.5 it keeps only the first. The order of temperature scaling and truncation can change the retained set.

## Constraints and reproducibility

Some tasks require legal outputs: a tag sequence, a fixed schema or terminology in a translation. Masking illegal transitions changes the candidate set. Ensure at least one valid completion remains, and distinguish a decoder constraint from a property learned by the model.

Record random seed, temperature, truncation policy, maximum length and stop conditions. A sample that reaches the length limit without an end marker is truncated, not necessarily complete. Evaluate several samples when the deployed system is stochastic; selecting the best one using the reference answer would leak evaluation information.

For translation and summarisation, inspect fidelity as well as fluency. Decoding can expose or hide a model's tendencies, but it cannot turn an unsupported statement into an evidenced one.

<div class="insight-box">
  <strong>Key Insight:</strong> Model estimation and search error are separate. A wider beam can reduce search error while revealing that the model itself prefers an undesirable output.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Do not compare two models with different decoding settings and attribute the entire difference to training. Temperature, length penalties and stopping criteria can materially change the outputs.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Greedy local choices need not maximise complete-sequence probability.</li>
    <li>Beam width, completion handling and stopping rules define the search.</li>
    <li>Temperature and truncation define a sampling distribution.</li>
    <li>Length normalisation and constraints change the decoding objective or search space.</li>
  </ul>
</div>

## References

1. Sutskever, Vinyals and Le. [Sequence to Sequence Learning with Neural Networks](https://arxiv.org/abs/1409.3215). NeurIPS, 2014.
2. Holtzman et al. [The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751). ICLR, 2020.
