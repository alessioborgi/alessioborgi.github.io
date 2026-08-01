---
layout: single
title: "RNNs, LSTMs, and GRUs: Sequence Models Before Attention"
date: 2026-05-14
categories: [basics]
book: basics
subsection: deep-learning
tags: [rnn, lstm, gru, sequence-models, vanishing-gradients]
published: true
is_overview: false
excerpt: "A recurrent network shares weights across time exactly as a convolution shares them across space. The trouble is that gradients then travel through a product of Jacobians, and a product of a hundred numbers slightly below one is zero."
author_profile: true
read_time: true
icon: "🔁"
read_mins: 7
permalink: /blog/basics/rnns-lstms-grus/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A recurrent network carries one hidden state forward and applies the same weights at every step. Training it sends gradients backwards through a product of Jacobians, which decays or explodes geometrically in the sequence length — so plain RNNs cannot learn long-range dependencies. The LSTM's fix is a cell state updated <em>additively</em> and gated, so the gradient path along it is multiplication by a forget gate rather than by a weight matrix. What neither fixes is that recurrence is inherently sequential.
</div>

## Weight sharing, but across time

The [convolution chapter](/blog/basics/convolutions-and-cnns/) framed a conv layer as a dense layer with locality and weight sharing imposed. A recurrent network is the same idea rotated: share the weights across **time** instead of across **space**.

<div class="formula-box">
\[
h_t = \sigma\bigl(W_h h_{t-1} + W_x x_t + b\bigr), \qquad t = 1, \dots, n .
\]
</div>

One hidden state $$h_t$$ summarises everything seen so far. The same $$W_h$$, $$W_x$$, $$b$$ apply at every step, so the model handles sequences of any length with a fixed parameter count — the same bargain a CNN strikes for images of any size.

## Backpropagation through time, and the product that kills it

Unroll the recurrence and it is an ordinary feedforward network that happens to reuse its weights. Differentiating the loss at step $$t$$ with respect to a hidden state $$k$$ steps earlier gives a chain of Jacobians:

<div class="formula-box">
\[
\frac{\partial h_t}{\partial h_{t-k}} \;=\; \prod_{j=t-k+1}^{t} \frac{\partial h_j}{\partial h_{j-1}}
\;=\; \prod_{j} \operatorname{diag}\bigl(\sigma'(\cdot)\bigr) W_h^{\top} .
\]
</div>

A product of $$k$$ matrices. In the scalar case it is literally $$w^k$$, and that is enough to see the problem:

| $$w$$ | $$w^{10}$$ | $$w^{50}$$ | $$w^{100}$$ |
|---|---|---|---|
| 0.90 | 0.349 | 0.0052 | $$2.66\times10^{-5}$$ |
| 0.95 | 0.599 | 0.0769 | $$5.92\times10^{-3}$$ |
| 1.10 | 2.59 | 117 | $$1.38\times10^{4}$$ |

A weight of $$0.9$$ — not small, not pathological — reduces the gradient by a factor of about 38,000 over a hundred steps. A weight of $$1.1$$ multiplies it by 14,000. The knife edge at exactly $$1$$ has measure zero.

The nonlinearity makes it worse rather than better. For $$\tanh$$, $$\sigma' = 1 - \tanh^2 \le 1$$, with equality only at zero: $$\sigma'(1) = 0.42$$ and $$\sigma'(2) = 0.071$$. Once units saturate, each step contributes a factor well below one. Twenty steps at an effective factor of $$0.42$$ gives $$2.9\times10^{-8}$$.

<div class="insight-box">
<strong>The asymmetry is the important part.</strong> Exploding gradients are easy to fix: clip the gradient norm and carry on. The direction survives, only the magnitude is capped. Vanishing gradients cannot be fixed that way — there is no information left to rescale. Multiplying a number that has underflowed to \(10^{-8}\) by a large constant recovers nothing. That is why the architectures below attack vanishing specifically.
</div>

The general phenomenon — gradients travelling through a long product of Jacobians — is the same one covered in the [gradient descent chapter](/blog/basics/gradient-descent-and-backprop/), and it is the reason residual connections exist in deep feedforward networks too.

## The LSTM: an additive path through time

The LSTM adds a second state, the **cell state** $$c_t$$, and three gates controlling what enters, leaves, and is read from it. Each gate is a sigmoid, so each produces a value in $$(0,1)$$ per coordinate.

<div class="formula-box">
\[
\begin{aligned}
f_t &= \sigma\bigl(W_f [h_{t-1}, x_t] + b_f\bigr) &&\text{forget} \\[2pt]
i_t &= \sigma\bigl(W_i [h_{t-1}, x_t] + b_i\bigr) &&\text{input} \\[2pt]
\tilde{c}_t &= \tanh\bigl(W_c [h_{t-1}, x_t] + b_c\bigr) &&\text{candidate} \\[2pt]
o_t &= \sigma\bigl(W_o [h_{t-1}, x_t] + b_o\bigr) &&\text{output} \\[6pt]
c_t &= f_t \odot c_{t-1} + i_t \odot \tilde{c}_t &&\text{cell update} \\[2pt]
h_t &= o_t \odot \tanh(c_t) &&\text{hidden state}
\end{aligned}
\]
</div>

The cell update line is the whole design. Look at what it does to the gradient:

<div class="formula-box">
\[
\frac{\partial c_t}{\partial c_{t-1}} = f_t .
\]
</div>

Not a weight matrix. Not a saturating nonlinearity's derivative. Just the forget gate, elementwise. The path from $$c_{t-k}$$ to $$c_t$$ is a product of forget gates, and if the network learns to keep $$f \approx 1$$ on some coordinate, that coordinate's gradient passes through essentially undamped. With $$f = 0.99$$, a hundred steps still retains $$0.99^{100} = 0.37$$ of the signal — against $$2.7\times10^{-5}$$ for the vanilla recurrence at $$w = 0.9$$.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 560 236" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="lstm-title lstm-desc" style="width:100%;max-width:560px;height:auto;font-family:sans-serif">
  <title id="lstm-title">The multiplicative path in an RNN against the additive cell-state path in an LSTM</title>
  <desc id="lstm-desc">In the vanilla recurrent network the state passes through a weight matrix and a nonlinearity at every step. In the LSTM the cell state runs straight through, modified only by an elementwise forget gate and an additive update.</desc>
  <rect width="560" height="236" fill="#f8fafc" rx="10"/>

  <text x="16" y="26" font-size="10" font-weight="700" fill="#9a3412">Vanilla RNN — every step multiplies by Wₕ and a saturating σ′</text>
  <line x1="30" y1="66" x2="530" y2="66" stroke="#ea580c" stroke-width="2"/>
  <polygon points="530,61 542,66 530,71" fill="#ea580c"/>
  <g fill="#ffedd5" stroke="#ea580c" stroke-width="1.6">
    <rect x="96"  y="52" width="52" height="28" rx="6"/>
    <rect x="216" y="52" width="52" height="28" rx="6"/>
    <rect x="336" y="52" width="52" height="28" rx="6"/>
    <rect x="440" y="52" width="52" height="28" rx="6"/>
  </g>
  <text x="122" y="71" text-anchor="middle" font-size="9" fill="#9a3412">Wₕ, σ</text>
  <text x="242" y="71" text-anchor="middle" font-size="9" fill="#9a3412">Wₕ, σ</text>
  <text x="362" y="71" text-anchor="middle" font-size="9" fill="#9a3412">Wₕ, σ</text>
  <text x="466" y="71" text-anchor="middle" font-size="9" fill="#9a3412">Wₕ, σ</text>
  <text x="280" y="98" text-anchor="middle" font-size="9" fill="#9a3412">gradient carries a product of k Jacobians → 0.9¹⁰⁰ ≈ 2.7 × 10⁻⁵</text>

  <text x="16" y="140" font-size="10" font-weight="700" fill="#0f766e">LSTM — the cell state runs straight through</text>
  <line x1="30" y1="180" x2="530" y2="180" stroke="#0d9488" stroke-width="4"/>
  <polygon points="530,174 544,180 530,186" fill="#0d9488"/>
  <g fill="#ccfbf1" stroke="#0d9488" stroke-width="1.6">
    <circle cx="122" cy="180" r="13"/>
    <circle cx="242" cy="180" r="13"/>
    <circle cx="362" cy="180" r="13"/>
    <circle cx="466" cy="180" r="13"/>
  </g>
  <text x="122" y="184" text-anchor="middle" font-size="10" fill="#0f766e">×f</text>
  <text x="242" y="184" text-anchor="middle" font-size="10" fill="#0f766e">×f</text>
  <text x="362" y="184" text-anchor="middle" font-size="10" fill="#0f766e">×f</text>
  <text x="466" y="184" text-anchor="middle" font-size="10" fill="#0f766e">×f</text>
  <text x="280" y="212" text-anchor="middle" font-size="9" fill="#0f766e">gradient carries a product of forget gates → 0.99¹⁰⁰ ≈ 0.37</text>
  <text x="280" y="228" text-anchor="middle" font-size="8.5" fill="#475569">Same number of steps. The difference is what sits on the path.</text>
</svg>
<figcaption>The structural difference in one picture. The RNN's state is transformed at every step; the LSTM's cell state is only scaled elementwise and added to, which is what keeps the gradient path open.</figcaption>
</figure>
</div>

<div class="insight-box">
<strong>The forget-gate bias trick.</strong> Initialising \(b_f\) to a positive value (commonly 1) starts every forget gate near \(\sigma(1) \approx 0.73\) rather than near \(0.5\), so the cell state defaults to remembering. It is a one-line change and it matters, because a gate initialised near zero erases the state before the model has had a chance to learn otherwise.
</div>

## The GRU

The GRU merges the cell and hidden state and uses two gates instead of three — an update gate interpolating between keeping the old state and taking the new candidate, and a reset gate controlling how much history enters the candidate. Fewer parameters, same additive-path idea.

Whether GRU or LSTM is better is task-dependent and usually a small effect. Anyone claiming a universal winner is overstating.

## What actually ended them

The gating fixes the gradient problem well enough to be useful. Two limits remain, and neither is about gradients.

**Recurrence is sequential.** Computing $$h_t$$ requires $$h_{t-1}$$. That dependency cannot be parallelised across time, so training time scales with sequence length no matter how many GPUs you own. This is a hardware argument, not a modelling one — and it turned out to be the decisive one, because the models that won were the ones that could absorb more compute.

**Everything passes through one vector.** In an encoder–decoder, the entire input is compressed into a single fixed-size state before decoding begins. Long inputs must lose information; the vector does not grow.

**The path between distant positions is long.** Information from position 1 reaching position 100 traverses 99 recurrent steps, each an opportunity to be overwritten. Path length is $$O(n)$$.

<div class="warning-box">
<strong>Where this leads.</strong> Attention removes both limits at once: every position attends to every other in a single step, so the path length between any two becomes \(O(1)\) instead of \(O(n)\), and all positions are computed in parallel rather than in sequence. The cost is that attention compares every pair, which is \(O(n^2)\) work and memory in the sequence length — a trade the <a href="/blog/transformers/overview/">Transformers book</a> takes up from here.

None of which makes recurrence obsolete. For short sequences, streaming inputs where the future is genuinely unavailable, or tight memory budgets, a GRU remains a sensible and much smaller choice.
</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>An RNN shares weights across time as a CNN shares them across space — a fixed parameter count for any sequence length.</li>
  <li>Backpropagation through time carries a product of \(k\) Jacobians, so gradients move geometrically in \(k\). At \(w = 0.9\), a hundred steps leaves \(2.7\times10^{-5}\); at \(w = 1.1\) it reaches \(1.4\times10^{4}\).</li>
  <li>Exploding gradients are fixable by clipping. Vanishing gradients are not — there is nothing left to rescale. That asymmetry is what the gating architectures target.</li>
  <li>The LSTM's cell state is updated additively, so \(\partial c_t / \partial c_{t-1} = f_t\) — a gate, not a weight matrix. At \(f = 0.99\), 0.37 of the gradient survives a hundred steps.</li>
  <li>Initialise the forget-gate bias positive so the cell defaults to remembering.</li>
  <li>What ended RNNs was not gradients but parallelism: recurrence is inherently sequential, and the path between distant positions is \(O(n)\). Attention makes both \(O(1)\), at a quadratic cost in sequence length.</li>
</ul>
</div>
