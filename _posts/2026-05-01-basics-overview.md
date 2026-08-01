---
layout: single
title: "Machine Learning Before Transformers: A Working Foundation"
date: 2026-05-01
categories: [basics]
book: basics
subsection: foundations
tags: [overview, machine-learning, supervised, unsupervised, deep-learning]
published: true
is_overview: true
excerpt: "Every later book on this site assumes you already know what a loss is, why gradient descent works, and what a convolution buys you. This book supplies that, and follows one thread through it: how much structure you build in versus how much you let the data decide."
author_profile: true
read_time: true
icon: "🧭"
read_mins: 5
permalink: /blog/basics/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>What this book is for:</strong> the later books — Transformers, Graph Neural Networks, Sheaf models, Diffusion — all assume a working knowledge of losses, gradients, regularisation, and the pre-Transformer architectures. This book supplies exactly that, and no more. It is not a survey; it is the shortest path to being able to read the rest.
</div>

## One thread runs through all of it

It is tempting to read the history of machine learning as a list of unrelated tricks. It reads better as a single question asked repeatedly:

> **How much structure do we build into the model, and how much do we let the data decide?**

Every method in this book is an answer to that. Linear regression builds in a great deal — it asserts the relationship *is* a straight line — and in exchange needs very little data and yields coefficients you can read. A Transformer builds in almost nothing about which positions should interact, and in exchange needs a great deal of data. Everything else sits between those poles.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 740 196" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="b0-title b0-desc" style="width:100%;max-width:740px;height:auto;font-family:sans-serif">
  <title id="b0-title">Model families ordered by how much structure they assume</title>
  <desc id="b0-desc">Six families from linear models to Transformers, each labelled with the prior it builds in, ordered left to right from most assumed structure to most learned from data.</desc>
  <rect width="740" height="196" fill="#f8fafc" rx="12"/>
  <text x="370" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Each family is a different answer to “how much do we assume?”</text>

  <rect x="10"  y="38" width="110" height="86" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
  <rect x="130" y="38" width="110" height="86" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
  <rect x="250" y="38" width="110" height="86" rx="8" fill="#cffafe" stroke="#0891b2" stroke-width="1.6"/>
  <rect x="370" y="38" width="110" height="86" rx="8" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.6"/>
  <rect x="490" y="38" width="110" height="86" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.6"/>
  <rect x="610" y="38" width="110" height="86" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.6"/>

  <text x="65"  y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#1d4ed8">Linear models</text>
  <text x="185" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#1d4ed8">Trees · kernels</text>
  <text x="305" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#0e7490">Unsupervised</text>
  <text x="425" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#0f766e">Neural nets</text>
  <text x="545" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#b45309">CNNs · RNNs</text>
  <text x="665" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#6d28d9">Transformers</text>

  <text x="65"  y="82" text-anchor="middle" font-size="8" fill="#334155">assumes the</text>
  <text x="65"  y="93" text-anchor="middle" font-size="8" fill="#334155">relationship is</text>
  <text x="65"  y="104" text-anchor="middle" font-size="8" fill="#334155">linear</text>

  <text x="185" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes similar</text>
  <text x="185" y="93" text-anchor="middle" font-size="8" fill="#334155">inputs give similar</text>
  <text x="185" y="104" text-anchor="middle" font-size="8" fill="#334155">outputs</text>

  <text x="305" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes there is</text>
  <text x="305" y="93" text-anchor="middle" font-size="8" fill="#334155">structure without</text>
  <text x="305" y="104" text-anchor="middle" font-size="8" fill="#334155">any labels</text>

  <text x="425" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes the</text>
  <text x="425" y="93" text-anchor="middle" font-size="8" fill="#334155">features themselves</text>
  <text x="425" y="104" text-anchor="middle" font-size="8" fill="#334155">can be learned</text>

  <text x="545" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes locality</text>
  <text x="545" y="93" text-anchor="middle" font-size="8" fill="#334155">(CNN) or sequential</text>
  <text x="545" y="104" text-anchor="middle" font-size="8" fill="#334155">order (RNN)</text>

  <text x="665" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes almost</text>
  <text x="665" y="93" text-anchor="middle" font-size="8" fill="#334155">nothing — learns</text>
  <text x="665" y="104" text-anchor="middle" font-size="8" fill="#334155">what interacts</text>

  <path d="M14 150 L716 150" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="716,145 728,150 716,155" fill="#94a3b8"/>
  <text x="14"  y="171" font-size="9" fill="#475569">more structure assumed · less data needed · easier to interpret</text>
  <text x="716" y="171" text-anchor="end" font-size="9" fill="#475569">more learned from data · more data needed · harder to interpret</text>
  <text x="370" y="188" text-anchor="middle" font-size="8.5" fill="#64748b">Nothing here is obsolete: the left of this line is still the right answer for small, tabular, or interpretability-critical problems.</text>
</svg>
<figcaption>The organising axis of this book. Moving right buys flexibility and costs data, compute, and interpretability — a trade, not an upgrade.</figcaption>
</figure>
</div>

<div class="warning-box">
<strong>The direction of that arrow is not a ranking.</strong> On a few hundred rows of tabular data, gradient-boosted trees routinely beat anything deeper, and a logistic regression you can explain to a regulator may be worth more than two points of accuracy you cannot. “Newer” is a statement about assumptions, not about quality.
</div>

## What you need before the later books

Each book on this site leans on a specific part of this one:

- **[Transformers](/blog/transformers/overview/)** assumes softmax, cross-entropy, gradient descent, residual connections, and — most of all — that you know what a convolution's fixed receptive field costs, because attention is the answer to that cost.
- **Graph Neural Networks** assume message passing is a generalisation of convolution, which only lands if convolution is solid first.
- **[Sheaf Neural Networks](/blog/sheaf/overview/)** assume the graph Laplacian, eigen-decomposition, and the idea of a diffusion operator.
- **Diffusion models** assume maximum likelihood, the Gaussian, and the ELBO.

## The chapters

<div class="insight-box">
<strong>Reading order:</strong> the chapters are arranged by dependency, not by difficulty. Gradient descent comes first because everything after it is trained that way; linear regression comes next because it is the one model where you can see the whole solution in closed form and check it by hand.
</div>

**Learning foundations** — how a model is trained at all: the gradient descent update, why the learning rate can break everything, and backpropagation as reverse-mode differentiation.

**Supervised learning** — linear regression as a projection, logistic regression as linearity in the log-odds, and the classical non-linear workhorses.

**Unsupervised learning** — clustering, where the real lesson is that each algorithm encodes a different definition of what a cluster *is*, and dimensionality reduction.

**Neural networks** — the multilayer perceptron, then convolutions as a fully-connected layer with locality and weight sharing imposed, and recurrent models for sequences.

**Activation functions** — the three chapters already published, covering why non-linearity is required at all, the modern smooth-gating family, and output activations as a contract with your loss.

<div class="warning-box">
<strong>Status.</strong> This book is being written now, and chapters appear as they are finished. The cards below this overview show what is live. If a topic you want is missing, it is likely in the next batch rather than deliberately omitted.
</div>

## How to read it

If you are here to unblock a later book, read only what that book needs — the list above tells you which chapters those are. If you are building the foundation properly, read in order; each chapter assumes the ones before it and nothing else.

Every chapter follows the same shape: the intuition first, then the mathematics, then a worked example small enough to check by hand, then an honest section on what the method does *not* do. That last part is the one worth reading twice.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>This book exists to make the other books readable, not to survey the field.</li>
  <li>The through-line is how much structure a model assumes versus how much it learns — that single axis orders everything from least squares to attention.</li>
  <li>Moving along that axis is a trade against data, compute, and interpretability. It is not a ranking, and the classical end is still the correct choice for a great many real problems.</li>
  <li>Chapters are ordered by dependency. Gradient descent first, because everything afterwards is trained with it.</li>
</ul>
</div>
