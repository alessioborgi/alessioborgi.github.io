---
layout: single
title: "N-gram Language Models: Counts, Smoothing and Perplexity"
date: 2026-10-19 09:10:00 +0100
categories: [nlp]
book: nlp
subsection: language-models
tags: ["nlp", "language-models", "probability"]
excerpt: "Derive a language model from conditional counts, handle unseen sequences, and understand exactly what perplexity measures."
author_profile: true
read_time: true
is_overview: false
icon: "🎲"
read_mins: 5
permalink: /blog/nlp/ngram-language-models/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A language model assigns probabilities to token sequences. N-gram models approximate the next-token distribution using a short history. Smoothing handles missing counts; perplexity evaluates held-out predictions under a fixed tokenisation.
</div>

## Factor a sequence

The chain rule gives

<div class="formula-box">
\[
P(w_1,\ldots,w_T)=\prod_{t=1}^{T}P(w_t\mid w_1,\ldots,w_{t-1}).
\]
</div>

This is exact. A bigram model makes an approximation: retain only the previous token. A trigram model retains the previous two. Include start markers as context and an end marker as a predicted token when modelling complete sentences.

For a history $$h$$, a count estimate is

<div class="formula-box">
\[
P(w\mid h)=\frac{C(h,w)}{\sum_{v\in V}C(h,v)}.
\]
</div>

Here $$V$$ contains the possible next tokens. An unobserved history has a zero denominator and needs an explicit fallback.

## A worked smoothing example

Suppose the four allowed continuations after “battery” are `works`, `fails`, `charges` and an end marker. Their counts are 3, 1, 0 and 0. The unsmoothed model assigns “charges” probability zero even though the phrase is perfectly plausible.

Add-one smoothing gives

<div class="formula-box">
\[
P_{+1}(w\mid h)=\frac{C(h,w)+1}{\sum_v C(h,v)+|V|}.
\]
</div>

The resulting probabilities are $$4/8,2/8,1/8,1/8$$. They sum to one and reserve mass for unseen continuations. The tradeoff is visible: the frequent continuation drops from $$3/4$$ to $$1/2$$. With a huge vocabulary, adding one everywhere can allocate too much mass to unobserved events. Interpolation can instead combine a longer-context model with shorter-context distributions.

## Read perplexity correctly

Given $$T$$ evaluated tokens, including whichever boundary tokens the protocol specifies,

<div class="formula-box">
\[
\operatorname{PPL}=\exp\left(-\frac{1}{T}\sum_t\log P(w_t\mid h_t)\right).
\]
</div>

If the model assigns probability $$1/4$$ to every observed token, perplexity is four. More generally, it is the exponential of average negative log probability, not a literal count of candidates at each position.

Compare models on the same held-out text, tokenisation, vocabulary policy and boundary convention. A word-level score and a subword-level score have different units. Any unseen token also needs a declared treatment, such as a trained unknown-token category.

## What the model misses

A bigram cannot distinguish histories ending with the same word. “The battery” and “They replaced the battery” produce the same next-token distribution. This is a modelling assumption, not a data-cleaning mistake. Longer histories capture more context but have fewer examples per history, exposing the central tension between detail and reliable counts.

## A complete count model on two sentences

Train a bigram model on `robots move` and `robots stop`, adding a start and an end marker to each. The observed transitions are START→robots twice; robots→move and robots→stop once each; move→END and stop→END once each.

The maximum-likelihood conditionals are therefore one for `robots` after START, one-half for each continuation after `robots`, and one for END after either final word. The completed sentence `robots move END` has probability $$1\times\tfrac12\times1=\tfrac12$$. Omitting END would leave the model without an explicit decision about where the sentence stops.

```python
from collections import Counter

sentences = [["robots", "move"], ["robots", "stop"]]
pairs, histories = Counter(), Counter()
for sentence in sentences:
    seq = ["<s>"] + sentence + ["</s>"]
    for previous, word in zip(seq, seq[1:]):
        pairs[previous, word] += 1
        histories[previous] += 1

p_move = pairs["robots", "move"] / histories["robots"]
assert p_move == 0.5
assert sum(pairs["robots", w] / histories["robots"]
           for w in ["move", "stop"]) == 1.0
```

This is an intentionally closed training example. A new history has no estimate, and an unseen continuation has probability zero. Those limitations motivate [discounting and Kneser–Ney smoothing](/blog/nlp/smoothing-and-kneser-ney/), rather than being bugs to conceal with arbitrary fallback constants.

## Why an end marker changes the sample space

A sequence model that always emits ordinary tokens describes an ongoing stream. A sentence model must also describe termination. Under a valid terminating process, probability is distributed over complete finite sentences. A chain can have an absorbing END state yet still fail to reach it with probability one if another reachable closed class never terminates, so the presence of an END token alone is not a proof of proper termination.

For evaluation, say whether END contributes to the predicted-token count. In the toy sentence above, including the two words and END gives perplexity $$\exp(\log2/3)=2^{1/3}$$. Excluding END from the denominator while retaining its probability changes the units of that reported score.

## Cross-entropy is an average surprise

If the true next-token distribution is $$q$$ and the model uses $$p$$, expected negative log probability is

<div class="formula-box">
\[
H(q,p)=-\sum_w q(w)\log p(w)=H(q)+D_{\mathrm{KL}}(q\Vert p).
\]
</div>

The decomposition separates irreducible uncertainty under $$q$$ from the cost of using the wrong distribution. It assumes the model assigns positive mass wherever $$q$$ does. A zero on a possible event can make the divergence infinite.

Held-out token loss estimates this predictive quantity under the evaluation distribution. It is not a direct measure of grammaticality, truth or task usefulness. A highly probable sentence can be false, and a rare but correct technical sentence can have high surprise.

When moving to [neural language models](/blog/nlp/neural-language-models/), retain this same probabilistic interpretation. Shared representations change how conditionals generalise; they do not change what cross-entropy measures.

<div class="insight-box">
  <strong>Key Insight:</strong> Boundary conventions define the random object being modelled: a token stream, a fixed-length sequence or a complete sentence. Probabilities and perplexities must be interpreted within that choice.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Never compare perplexities with different tokenisation, end-marker counting or unknown-word policies as if they had the same unit. A smaller number can result from changing the measurement.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>The chain rule is exact; truncating the history is the approximation.</li>
    <li>Smoothing reallocates probability mass rather than merely patching zeros.</li>
    <li>Perplexity requires a shared evaluation protocol.</li>
  </ul>
</div>

## References

1. Jurafsky and Martin, [N-gram Language Models](https://web.stanford.edu/~jurafsky/slp3/3.pdf), develops count estimation, interpolation and perplexity.
2. Bengio et al. [A Neural Probabilistic Language Model](https://jmlr.org/papers/v3/bengio03a.html). JMLR, 2003.
