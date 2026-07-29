---
layout: single
title: "Sample Spaces and the Kolmogorov Axioms: What a Probability Actually Is"
date: 2026-08-22
categories: [prob-basics]
book: prob-basics
subsection: foundations
tags: [probability, axioms, measure, counting]
excerpt: "Probability is not defined as a long-run frequency or a degree of belief. It is defined as a function on sets that obeys three rules — and the third rule, countable additivity, is the one doing all the work."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 5
permalink: /blog/prob-basics/sample-spaces-and-axioms/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A probability space is a triple \((\Omega, \mathcal{F}, P)\): a set of outcomes, a collection of measurable events, and a function assigning each event a number. The three Kolmogorov axioms are non-negativity, \(P(\Omega)=1\), and countable additivity for disjoint events. Everything else — complements, monotonicity, inclusion–exclusion, the union bound — is a consequence. The subtlety is that \(\mathcal{F}\) usually cannot be all subsets of \(\Omega\).
</div>

## The three objects

Start with the **sample space** $$\Omega$$: the set of every outcome the experiment could produce, with exactly one occurring. Two dice give $$\Omega = \{1,\dots,6\}^2$$, so $$|\Omega| = 36$$. A real-valued measurement gives $$\Omega = \mathbb{R}$$.

An **event** is a subset of $$\Omega$$ — "the sum is 7" is the six-element set $$\{(1,6),(2,5),\dots,(6,1)\}$$. Events are sets, which is why probability inherits the algebra of sets: "and" is intersection, "or" is union, "not" is complement. The collection of admissible events is $$\mathcal{F}$$, closed under complement and countable union.

**Probability** is a function $$P:\mathcal{F}\to[0,1]$$ obeying three axioms:

<div class="formula-box">
\[
\text{(i)}\ \ P(A) \ge 0 \qquad
\text{(ii)}\ \ P(\Omega) = 1 \qquad
\text{(iii)}\ \ P\!\left(\bigcup_{i=1}^{\infty} A_i\right) = \sum_{i=1}^{\infty} P(A_i)
\ \ \text{for disjoint } A_i
\]
</div>

Axiom (iii) is **countable additivity**: the probability of a union of pairwise disjoint events is the sum of their probabilities, for infinitely many events, not just finitely many. Nothing here says what a probability *means*; frequentist and Bayesian readings are interpretations layered on top of the same axioms.

## Why countable, and why not all subsets

Finite additivity alone is too weak. Ask for the probability that a fair coin flipped repeatedly ever shows heads. Let $$A_i$$ be "first head on flip $$i$$", so $$P(A_i)=2^{-i}$$, and the events are disjoint. Only countable additivity licenses

<div class="formula-box">
\[
P(\text{some head}) = \sum_{i=1}^{\infty} 2^{-i} = 1 .
\]
</div>

The same axiom gives *continuity*: if $$A_1 \subseteq A_2 \subseteq \cdots$$ then $$P(\bigcup_i A_i) = \lim_{n} P(A_n)$$. Every limiting argument in probability — the law of large numbers, almost-sure convergence, the behaviour of a Markov chain as $$t\to\infty$$ — runs through that exchange of limit and probability, and it is countable additivity that permits it.

The other restriction is subtler. You might hope $$\mathcal{F} = 2^{\Omega}$$, every subset. For a countable $$\Omega$$ it can be. For $$\Omega = [0,1]$$ with the uniform distribution it cannot: Vitali showed in 1905 that one can construct a set whose translates tile $$[0,1]$$ in a way incompatible with any translation-invariant, countably additive assignment of length. Assigning it any value at all — zero, positive, anything — contradicts the axioms. The fix is to shrink $$\mathcal{F}$$ to the Borel sets: the smallest $$\sigma$$-algebra containing the intervals. Every set you will meet in practice is Borel, which is why the restriction is invisible in applications. A **random variable** is then just a function $$X:\Omega\to\mathbb{R}$$ for which $$\{X \le t\}$$ lies in $$\mathcal{F}$$ for all $$t$$ — "measurable" means "you are allowed to ask for its probability".

## Consequences you use constantly

From the axioms alone: $$P(A^c) = 1 - P(A)$$; if $$A \subseteq B$$ then $$P(A) \le P(B)$$; and for two events

<div class="formula-box">
\[
P(A \cup B) = P(A) + P(B) - P(A \cap B).
\]
</div>

The subtraction corrects the double-count of the overlap. Extended to $$n$$ events, this is the **inclusion–exclusion principle**: add all singles, subtract all pairwise intersections, add back all triples, and so on with alternating sign:

<div class="formula-box">
\[
P\!\left(\bigcup_{i=1}^{n} A_i\right) = \sum_i P(A_i) - \sum_{i \lt j} P(A_i \cap A_j) + \sum_{i \lt j \lt k} P(A_i\cap A_j\cap A_k) - \cdots
\]
</div>

Truncating after the first term gives the **union bound** $$P(\bigcup_i A_i) \le \sum_i P(A_i)$$, which needs no independence and is the workhorse of generalisation bounds and multiple-testing corrections.

## A worked count

Draw an integer uniformly from $$\{1,\dots,100\}$$. What is the probability it is divisible by 2, 3 or 5?

Let $$A_d$$ be "divisible by $$d$$", so $$|A_d| = \lfloor 100/d \rfloor$$. Intersections are divisibility by the products, since 2, 3 and 5 are coprime.

| Term | Set | Count |
|---|---|---|
| singles | $$A_2, A_3, A_5$$ | $$50 + 33 + 20 = 103$$ |
| pairs | $$A_6, A_{10}, A_{15}$$ | $$-(16 + 10 + 6) = -32$$ |
| triple | $$A_{30}$$ | $$+3$$ |
| **total** | | **74** |

So $$P = 74/100 = 0.74$$. Naively adding the singles would have given $$1.03$$ — impossible, and a clean diagnostic that overlaps were double-counted. The union bound here says only $$P \le 1.03$$, which is true and useless: bounds get loose exactly when events overlap heavily.

<div class="insight-box">
  <strong>Key Insight — the axioms are about sets, not about beliefs:</strong> \(P\) is a normalised measure, mathematically the same kind of object as area or mass. That is why "probability" and "expected proportion" share every algebraic identity, and why disputes about frequentist versus Bayesian interpretation change none of the mathematics — both camps use the same three axioms and disagree only about what \(\Omega\) is allowed to contain.
</div>

<div class="warning-box">
  <strong>Interview trap — "probability zero means impossible":</strong> false on continuous spaces. Drawing exactly \(0.5\) from a uniform on \([0,1]\) has probability zero, yet some value is drawn. The correct phrase is <em>almost surely</em>: an event of probability 1 need not be all of \(\Omega\). This distinction is what "almost sure convergence" in the <a href="/blog/prob-basics/limit-theorems/">limit theorems</a> is named after.
</div>

## Where this goes next

Once $$P$$ exists, conditioning restricts it to a sub-event and renormalises — that is [conditional probability and Bayes](/blog/prob-basics/conditional-probability-and-bayes/). Pushing $$P$$ forward through a measurable function gives a distribution on $$\mathbb{R}$$, which is what [random variables](/blog/prob-basics/random-variables/) are about.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>A probability space is \((\Omega,\mathcal{F},P)\); the axioms are non-negativity, \(P(\Omega)=1\), and countable additivity.</li>
    <li>Countable additivity gives continuity of \(P\), which every limit theorem depends on.</li>
    <li>\(\mathcal{F}\) cannot be all subsets of \([0,1]\) — non-measurable sets exist — so events are restricted to a \(\sigma\)-algebra.</li>
    <li>Inclusion–exclusion alternates signs over intersections; truncating it after one term gives the union bound.</li>
    <li>Probability zero means "almost never", not "impossible".</li>
  </ul>
</div>

## References

1. Kolmogorov, A. N. *Grundbegriffe der Wahrscheinlichkeitsrechnung*. Springer, 1933. (English: *Foundations of the Theory of Probability*, Chelsea, 1956.)
2. Billingsley, P. *Probability and Measure*, 3rd ed. Wiley, 1995.
3. Durrett, R. [Probability: Theory and Examples](https://services.math.duke.edu/~rtd/PTE/pte.html), 5th ed. *Cambridge University Press, 2019*.
4. Feller, W. *An Introduction to Probability Theory and Its Applications*, Vol. 1, 3rd ed. Wiley, 1968.
