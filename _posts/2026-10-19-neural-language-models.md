---
layout: single
title: "Neural Language Models: Shared Embeddings, Recurrence and Training"
date: 2026-10-19 09:12:00 +0100
categories: [nlp]
book: nlp
subsection: language-models
tags: ["nlp", "language-models", "rnn", "cross-entropy"]
excerpt: "Connect conditional language modelling to embeddings, recurrent states, cross-entropy and the practical details of padding and truncated backpropagation."
author_profile: true
read_time: true
is_overview: false
icon: "🔁"
read_mins: 4
permalink: /blog/nlp/neural-language-models/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A neural language model parameterises next-token probabilities with shared vectors and a learned context function. Recurrence summarises the prefix in a state; cross-entropy trains the observed continuation. Correct shifting, masking and state boundaries are as important as the recurrence equation.
</div>

## Share evidence across similar histories

A count model treats every stored history as a separate case. A neural model maps tokens to vectors and uses common parameters to turn the context into a prediction. Histories containing related words can then share statistical strength, although whether the learned similarity is useful depends on training.

A fixed-window feed-forward model uses a chosen number of previous embeddings. A recurrent model updates a state after each token. Both still implement the same conditional factorisation introduced in [n-gram language models](/blog/nlp/ngram-language-models/); the architecture changes how the conditional probabilities are estimated.

## A recurrent parameterisation

Let $$e_t=E[w_t]$$ be the embedding of the current token. A simple recurrent model uses

<div class="formula-box">
\[
h_t=\tanh(W_he_{t}+U_hh_{t-1}+b_h),\qquad
P(w_{t+1}\mid w_{\leq t})=\operatorname{softmax}(W_oh_t+b_o).
\]
</div>

If embeddings have dimension $$d$$, states dimension $$H$$ and the vocabulary size $$V$$, then $$W_h$$ is $$H\times d$$, $$U_h$$ is $$H\times H$$ and $$W_o$$ is $$V\times H$$. Writing the dimensions catches a common confusion: the embedding lives in a different space from the hidden state unless the design makes them equal.

The state can depend on the whole prefix in principle, but it has fixed dimension and must learn what to retain. Gated recurrent units and LSTMs change the state dynamics to make some forms of information retention easier; they do not guarantee perfect memory.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="nlp-rnn-title nlp-rnn-desc" viewBox="0 0 660 110" style="max-width:660px;width:100%;height:auto;font-family:system-ui,sans-serif">
<title id="nlp-rnn-title">A recurrent language model updates its prefix summary before predicting the next token.</title>
<desc id="nlp-rnn-desc">Current token|embedding → Previous state|+ update → New state|h(t) → Next-token|distribution</desc>
<rect x="5.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="75.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Current token</text>
<text x="75.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">embedding</text>
<text x="155.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="170.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="240.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Previous state</text>
<text x="240.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">+ update</text>
<text x="320.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="335.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="405.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">New state</text>
<text x="405.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">h(t)</text>
<text x="485.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="500.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="570.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Next-token</text>
<text x="570.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">distribution</text>
</svg>
<figcaption>A recurrent language model updates its prefix summary before predicting the next token.</figcaption>
</figure>
</div>

## Train with shifted targets

For a sentence containing `robot moves`, the inputs might be `[START, robot, moves]` and the targets `[robot, moves, END]`. Each target follows its input prefix. Feeding the target token into the context at the same prediction position leaks the answer.

The average negative log likelihood over valid target positions is

<div class="formula-box">
\[
\mathcal L=-\frac{1}{\sum_t m_t}\sum_t m_t\log P(w_{t+1}\mid w_{\leq t}),
\]
</div>

where $$m_t$$ masks padding. If three targets receive probabilities 0.5, 0.25 and 0.8, the mean loss is $$-(\log0.5+\log0.25+\log0.8)/3\approx0.7675$$. Perplexity is its exponential, approximately 2.154. Averaging losses separately per sentence gives a different weighting from averaging over all tokens.

During teacher-forced training, the context contains observed previous tokens. During generation, it contains the model's earlier outputs. Errors can therefore move generation into contexts encountered less often in training. The [decoding chapter](/blog/nlp/decoding-and-search/) examines how the inference procedure uses these distributions.

## Gradients through time

Backpropagation follows the recurrent state through earlier steps. Repeated Jacobian products can shrink or grow strongly, making long-range credit assignment difficult. Gradient clipping controls the size of an update caused by large gradients; it does not recover information from gradients that have vanished.

Truncated backpropagation detaches the computation graph at chosen boundaries. The numeric hidden state may continue across a chunk boundary while the gradient stops there. Resetting the state is a different operation. Decide which is appropriate for sentence boundaries, independent documents and streams.

## Evaluate what the model was allowed to see

Use the same tokenisation, vocabulary and boundary policy for comparisons. Ensure padded positions do not contribute to loss. If state is carried across documents, report the ordering and whether that matches deployment; accidental state carryover can make one document influence another.

Inspect performance by context length and rare-word frequency. A lower aggregate perplexity does not prove the model resolves reference, respects negation or answers questions faithfully. Those claims require language tasks with corresponding outputs and checks.

<div class="insight-box">
  <strong>Key Insight:</strong> Neural modelling keeps the probabilistic objective but shares its parameters across histories. The generalisation comes from that shared parameterisation, not from changing the chain rule.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Detaching a recurrent state, resetting it, and masking padding solve different problems. Treating them as interchangeable can create leakage, broken context or a misleading loss denominator.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Embeddings and a context function parameterise next-token distributions.</li>
    <li>Inputs and targets must be shifted by one prediction step.</li>
    <li>Cross-entropy and perplexity depend on masking and aggregation conventions.</li>
    <li>A carried state can retain context even when its gradient history is detached.</li>
  </ul>
</div>

## References

1. Bengio et al. [A Neural Probabilistic Language Model](https://jmlr.org/papers/v3/bengio03a.html). JMLR, 2003.
2. Mikolov et al. *Recurrent Neural Network Based Language Model*. Interspeech, 2010.
3. Hochreiter and Schmidhuber. *Long Short-Term Memory*. Neural Computation, 1997.
