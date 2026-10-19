---
layout: single
title: "Hidden Markov Models: Forward Probabilities, Viterbi and Tagging"
date: 2026-10-19 09:18:00 +0100
categories: [nlp]
book: nlp
subsection: sequence-models
tags: ["nlp", "hmm", "viterbi", "dynamic-programming"]
excerpt: "Derive the two dynamic programs that sum over tag paths or select the best one, and compute a complete two-token example."
author_profile: true
read_time: true
is_overview: false
icon: "🧮"
read_mins: 4
permalink: /blog/nlp/hidden-markov-models/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> An HMM models a sequence of hidden states and emitted observations. The forward algorithm sums probabilities over state paths; Viterbi takes the maximum and stores backpointers. They share a recurrence structure but answer different questions.
</div>

## Factor the joint distribution

For observed words $$x_{1:T}$$ and hidden tags $$y_{1:T}$$, a first-order HMM uses an initial distribution $$\pi$$, transition probabilities $$a_{ij}$$ and emissions $$b_j(x)$$:

<div class="formula-box">
\[
P(x,y)=\pi_{y_1}b_{y_1}(x_1)\prod_{t=2}^{T}a_{y_{t-1},y_t}b_{y_t}(x_t).
\]
</div>

Here we condition on sequence length and omit an explicit end transition. A model of variable-length sequences needs its own termination treatment. Each transition row and each state's emission distribution must normalise.

The assumptions are explicit: the next tag depends only on the previous tag, and the current observation depends only on the current tag. A word can still be ambiguous because several states may emit it. Context changes which path is probable.

## Sum over paths with the forward algorithm

Define $$\alpha_t(j)=P(x_{1:t},y_t=j)$$. Then

<div class="formula-box">
\[
\alpha_1(j)=\pi_jb_j(x_1),\qquad
\alpha_t(j)=b_j(x_t)\sum_i\alpha_{t-1}(i)a_{ij}.
\]
</div>

The observation likelihood is $$\sum_j\alpha_T(j)$$. Every partial path ending in state $$j$$ contributes to this sum. There are exponentially many complete paths but only $$T|Y|$$ states in the dynamic program, each considering $$|Y|$$ predecessors: $$O(T|Y|^2)$$ time.

## Maximise a path with Viterbi

Replace the sum with a maximum:

<div class="formula-box">
\[
\delta_t(j)=b_j(x_t)\max_i\delta_{t-1}(i)a_{ij}.
\]
</div>

Store the predecessor attaining each maximum. Starting from the best final state and following those backpointers recovers a complete path. Keeping only the maximum values gives the path score but not the labels that achieved it.

## A two-word calculation

Use states N and V, initial probabilities 0.6 and 0.4, and transitions N→N=0.3, N→V=0.7, V→N=0.8, V→V=0.2. Let emissions for `robots` be 0.5 under N and 0.1 under V; emissions for `move` are 0.1 under N and 0.6 under V. Remaining emission mass belongs to other vocabulary items.

For the first word, both algorithms start with N=0.30 and V=0.04. At the second word:

| End state | Forward value | Viterbi value |
|---|---|---|
| N | $$0.1(0.30\cdot0.3+0.04\cdot0.8)=0.0122$$ | $$0.1\max(0.09,0.032)=0.009$$ |
| V | $$0.6(0.30\cdot0.7+0.04\cdot0.2)=0.1308$$ | $$0.6\max(0.21,0.008)=0.126$$ |

The observation likelihood is 0.143. The best path is N→V with joint probability 0.126. Its posterior probability given the observations is $$0.126/0.143\approx0.881$$. The best path score and total likelihood are visibly different numbers.

## Training and numerical stability

With labelled sequences, estimate transitions and emissions from counts with a declared smoothing policy. With unlabelled sequences, forward–backward computes expected counts for an EM procedure commonly called Baum–Welch. Latent states learned without labels are not guaranteed to correspond to familiar grammatical tags.

Products of many probabilities underflow. Compute Viterbi in log space; compute forward sums with log-sum-exp or a consistent scaling scheme. Replacing a sum by a maximum for numerical convenience changes the question being answered.

Tokenwise posterior decoding chooses the most probable tag at each position. It need not equal the most probable complete path and can violate path constraints. Use the output criterion that matches the application. The [CRF chapter](/blog/nlp/conditional-random-fields/) keeps structured decoding while modelling the labels conditional on the entire input.

<div class="insight-box">
  <strong>Key Insight:</strong> The same state graph supports different computations: summation marginalises uncertainty, while maximisation chooses one explanation. The operation inside the recurrence determines the answer.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> An HMM emission is P(word given tag), not P(tag given word). Reversing that conditional without Bayes’ rule changes the model and usually breaks normalisation.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>An HMM factorises a joint distribution over observations and states.</li>
    <li>Forward sums over paths; Viterbi finds one highest-probability path.</li>
    <li>Backpointers recover the path that attains a maximum.</li>
    <li>Log-space arithmetic and a defined termination policy are essential.</li>
  </ul>
</div>

## References

1. Rabiner, L. R. *A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition*. Proceedings of the IEEE, 1989.
2. Bird, Klein and Loper. [Categorizing and Tagging Words](https://www.nltk.org/book/ch05.html).
