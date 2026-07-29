---
layout: single
title: "Probability for ML Interviews: The Eight Ideas Worth Re-deriving"
date: 2026-08-21
categories: [prob-basics]
book: prob-basics
subsection: foundations
tags: [probability, foundations, interviews, overview]
excerpt: "Almost every loss function in machine learning is a negative log-likelihood in disguise, and almost every model output is a distribution. This book rebuilds the probability you need to read those objects fluently — and flags the eight places interviewers know people slip."
author_profile: true
read_time: true
is_overview: true
icon: "🎲"
read_mins: 5
permalink: /blog/prob-basics/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Modern ML is written in probability, not despite it. Cross-entropy is a KL divergence, maximum likelihood is a KL minimisation, a diffusion model is a chain of conditionals, and every calibrated confidence is a posterior. This book is a seven-chapter refresher for someone who once knew this and needs it back under interview pressure — sample spaces, conditioning, random variables, moments, the standard distributions, the limit theorems, and information theory. Each chapter ends with the traps.
</div>

## Why the language matters

You can train a classifier without ever writing down a likelihood. You cannot *explain* one. The moment an interviewer asks why the softmax cross-entropy loss is the right thing to minimise, or what a model's 0.83 output actually means, the answer is probabilistic and there is no way around it.

Three threads run through most of contemporary machine learning, and all three are probability.

**Likelihoods.** Fitting a model by maximum likelihood means choosing parameters $$\theta$$ to make the observed data as probable as possible under $$p_\theta$$. Take the negative logarithm and you have a loss:

<div class="formula-box">
\[
\mathcal{L}(\theta) = -\frac{1}{n}\sum_{i=1}^{n} \log p_\theta(y_i \mid x_i)
\]
</div>

Here $$p_\theta(y\mid x)$$ is the model's predicted distribution over labels. Instantiate it as a categorical distribution and this *is* softmax cross-entropy; instantiate it as a Gaussian with fixed variance and it *is* mean squared error. The two losses everyone uses are the same principle with two different assumed noise models.

**Generative models.** A generative model is a claim about $$p(x)$$, and every architecture is a different way of making that claim tractable. Autoregressive models factor it with the chain rule, $$p(x) = \prod_t p(x_t \mid x_{1:t-1})$$. Diffusion models define a Markov chain of conditionals and learn to reverse it. Variational autoencoders bound the intractable $$\log p(x)$$ using a KL divergence. None of these are readable without conditioning and divergences.

**Uncertainty.** A deployed model that says "cat, 0.99" when it is looking at noise is not making a modelling error so much as a probabilistic one. Distinguishing what the model does not know because the data are noisy from what it does not know because it has never seen this input requires the decomposition in the [law of total variance](/blog/prob-basics/expectation-and-variance/).

## The map

The other seven chapters go in dependency order. Nothing later assumes anything you have not already read.

**[Sample spaces and the axioms](/blog/prob-basics/sample-spaces-and-axioms/)** sets up the object itself: outcomes, events, and the three Kolmogorov axioms. It explains why countable additivity is the interesting axiom, why not every subset can be assigned a probability, and it works inclusion–exclusion through a counting example.

**[Conditional probability and Bayes](/blog/prob-basics/conditional-probability-and-bayes/)** is the chapter that earns its keep in interviews. The chain rule, the law of total probability, Bayes' theorem — then a medical test with 99% sensitivity where a positive result still means only a one-in-six chance of disease. It also separates independence from conditional independence, which are unrelated properties despite the shared word.

**[Random variables](/blog/prob-basics/random-variables/)** moves from events to numbers: PMFs, PDFs, CDFs, and the fact that a density value is not a probability and can exceed one. Then change of variables with the Jacobian — the identity underneath normalising flows — and inverse-transform sampling.

**[Expectation and variance](/blog/prob-basics/expectation-and-variance/)** covers the moments. Linearity of expectation holds without independence, which is the single most useful fact in combinatorial probability. Variance does not, which is why the covariance term exists. Ends with a two-line counterexample to "uncorrelated implies independent".

**[Common distributions](/blog/prob-basics/common-distributions/)** is a reference table — ten distributions with parameters, means and variances — plus real treatment of the multivariate Gaussian, whose covariance matrix determines the geometry of its level sets.

**[Limit theorems](/blog/prob-basics/limit-theorems/)** covers the law of large numbers, the central limit theorem and what it does not claim, the three modes of convergence, and the concentration inequalities that give you finite-sample guarantees where the CLT only gives asymptotics.

**[Information theory](/blog/prob-basics/information-theory/)** closes the loop: entropy, cross-entropy, KL divergence and its asymmetry, mutual information, and why forward KL covers modes while reverse KL seeks them.

<div class="insight-box">
  <strong>Key Insight — the same three objects recur:</strong> nearly every derivation in this book is an application of one of three things: the chain rule \(p(a,b) = p(a\mid b)p(b)\), linearity of expectation, or Jensen's inequality. If you can state those three cleanly and say when each applies, you can reconstruct most of the rest on a whiteboard rather than recalling it.
</div>

## How to use this book

Read a chapter, then close it and re-derive the boxed results. The traps in this material are not hard theorems — they are places where an intuitive answer is confidently wrong: base rates get ignored, zero correlation gets read as independence, a density gets read as a probability, and the CLT gets applied to $$n = 8$$. Each chapter flags its own in a warning box.

For the estimation side of the same story — estimators, bias and variance, confidence intervals, hypothesis testing — see the companion book at [statistics basics](/blog/stats-basics/overview/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Cross-entropy and MSE are both negative log-likelihoods, differing only in the assumed noise model — categorical versus Gaussian.</li>
    <li>Generative models are factorisations of \(p(x)\): the chain rule for autoregressive models, learned reverse conditionals for diffusion, a variational bound for VAEs.</li>
    <li>Three tools carry most derivations: the chain rule, linearity of expectation, and Jensen's inequality.</li>
    <li>The interview risk in this material is confident wrong intuition, not missing theorems.</li>
  </ul>
</div>

## References

1. Murphy, K. P. [Probabilistic Machine Learning: An Introduction](https://probml.github.io/pml-book/book1.html). *MIT Press, 2022*.
2. Bishop, C. M. *Pattern Recognition and Machine Learning*. Springer, 2006.
3. Wasserman, L. *All of Statistics: A Concise Course in Statistical Inference*. Springer, 2004.
4. MacKay, D. J. C. [Information Theory, Inference, and Learning Algorithms](https://www.inference.org.uk/mackay/itila/). *Cambridge University Press, 2003*.
