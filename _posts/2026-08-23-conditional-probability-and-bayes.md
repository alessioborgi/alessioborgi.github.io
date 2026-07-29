---
layout: single
title: "Conditional Probability and Bayes: Why a 99% Accurate Test Means Almost Nothing"
date: 2026-08-23
categories: [prob-basics]
book: prob-basics
subsection: foundations
tags: [bayes, conditioning, independence, base-rate]
excerpt: "A test catches 99% of a disease and false-alarms only 5% of the time. You test positive. The chance you are ill is one in six. Here is the computation, and why almost everyone guesses ten times too high."
author_profile: true
read_time: true
is_overview: false
icon: "🔀"
read_mins: 6
permalink: /blog/prob-basics/conditional-probability-and-bayes/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Conditioning restricts the sample space and renormalises: \(P(A\mid B) = P(A\cap B)/P(B)\). From that one definition come the chain rule, the law of total probability and Bayes' theorem. The famous failure mode is ignoring the prior: with a 1% base rate, a test with 99% sensitivity and 95% specificity gives a positive predictive value of exactly 1/6. Independence and conditional independence are logically unrelated — neither implies the other.
</div>

## Conditioning is renormalisation

Learning that $$B$$ occurred throws away every outcome outside $$B$$ and rescales what remains so it sums to one:

<div class="formula-box">
\[
P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \qquad P(B) > 0 .
\]
</div>

$$P(\cdot \mid B)$$ is a genuine probability measure on the smaller space — it satisfies all three [Kolmogorov axioms](/blog/prob-basics/sample-spaces-and-axioms/) — so every identity you know still holds inside a conditional.

Rearranging gives the **chain rule**, $$P(A\cap B) = P(A\mid B)P(B)$$, which iterates to any number of variables:

<div class="formula-box">
\[
P(x_1, \dots, x_n) = \prod_{t=1}^{n} P(x_t \mid x_1,\dots,x_{t-1}).
\]
</div>

That factorisation is exact, requires no assumptions, and is the entire justification for autoregressive language models: predicting the next token given the prefix is not an approximation to the joint distribution, it *is* the joint distribution.

If $$\{B_1,\dots,B_k\}$$ partitions $$\Omega$$, the **law of total probability** reassembles a marginal from conditionals, $$P(A) = \sum_i P(A\mid B_i)P(B_i)$$ — averaging over cases, weighted by how often each case arises.

## Bayes' theorem

Write the joint two ways, $$P(A\mid B)P(B) = P(B\mid A)P(A)$$, and solve:

<div class="formula-box">
\[
\underbrace{P(H \mid E)}_{\text{posterior}} = \frac{\overbrace{P(E \mid H)}^{\text{likelihood}}\ \overbrace{P(H)}^{\text{prior}}}{\underbrace{P(E)}_{\text{evidence}}},
\qquad P(E) = \sum_{h} P(E\mid h)P(h).
\]
</div>

$$H$$ is a hypothesis, $$E$$ the evidence. The theorem is a one-line rearrangement; the difficulty is never the algebra, it is remembering that $$P(E\mid H)$$ and $$P(H\mid E)$$ are different numbers and that the prior $$P(H)$$ has a vote.

## The medical test, computed

A disease affects 1% of the screened population. The test has **sensitivity** $$P(+\mid D) = 0.99$$ and **specificity** $$P(-\mid \neg D) = 0.95$$, so its false-positive rate is $$P(+\mid \neg D) = 0.05$$. You test positive.

Evidence first, by total probability:

<div class="formula-box">
\[
P(+) = 0.99 \times 0.01 + 0.05 \times 0.99 = 0.0099 + 0.0495 = 0.0594 .
\]
</div>

Then Bayes:

<div class="formula-box">
\[
P(D \mid +) = \frac{0.0099}{0.0594} = \frac{1}{6} \approx 16.7\% .
\]
</div>

Counting bodies makes it obvious. Screen 100,000 people:

| Group | Size | Test positive |
|---|---|---|
| Diseased | 1,000 | 990 |
| Healthy | 99,000 | 4,950 |
| **All positives** | | **5,940** |

Of 5,940 positive results, 990 are genuine: $$990/5940 = 1/6$$. The false positives outnumber the true ones five to one purely because the healthy group is 99 times larger. Raise the base rate to 10% — testing a symptomatic group rather than screening everyone — and the same test gives $$0.099/0.144 = 68.75\%$$. The test did not change; the prior did.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="bayes-title bayes-desc" viewBox="0 0 640 210" style="max-width:640px;width:100%;height:auto">
  <title id="bayes-title">Natural-frequency tree for the medical test</title>
  <desc id="bayes-desc">A tree starting from 100,000 people screened. It splits into 1,000 diseased and 99,000 healthy. The diseased branch splits into 990 testing positive and 10 negative. The healthy branch splits into 4,950 testing positive and 94,050 negative. The two positive groups total 5,940, of which 990 are true positives, giving a positive predictive value of 990 divided by 5,940, which equals one sixth or 16.7 per cent.</desc>
  <rect x="1" y="1" width="638" height="208" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g stroke="#475569" stroke-width="1.3" fill="none">
    <line x1="118" y1="105" x2="215" y2="55"/><line x1="118" y1="105" x2="215" y2="155"/>
    <line x1="330" y1="55" x2="430" y2="35"/><line x1="330" y1="55" x2="430" y2="78"/>
    <line x1="335" y1="155" x2="430" y2="130"/><line x1="335" y1="155" x2="430" y2="176"/>
  </g>
  <g font-size="11" fill="#334155">
    <text x="16" y="109" font-weight="700">100,000</text>
    <text x="222" y="59" fill="#c2410c" font-weight="700">1,000 diseased</text>
    <text x="222" y="159" fill="#0c4a6e" font-weight="700">99,000 healthy</text>
    <text x="437" y="39" fill="#c2410c">990 test +</text>
    <text x="437" y="82" fill="#475569">10 test −</text>
    <text x="437" y="134" fill="#c2410c">4,950 test +</text>
    <text x="437" y="180" fill="#475569">94,050 test −</text>
  </g>
  <g stroke="#c2410c" stroke-width="1.2" stroke-dasharray="4 3" fill="none">
    <rect x="430" y="24" width="92" height="20" rx="4"/>
    <rect x="430" y="119" width="92" height="20" rx="4"/>
  </g>
  <text x="545" y="88" font-size="11.5" font-weight="700" fill="#c2410c">5,940 positives</text>
  <text x="545" y="105" font-size="11" fill="#334155">990 of them real</text>
  <text x="545" y="122" font-size="11.5" font-weight="700" fill="#0e7490">= 16.7%</text>
  <text x="320" y="200" text-anchor="middle" font-size="10.5" fill="#475569">sensitivity 99%, specificity 95%, prevalence 1%</text>
</svg>
<figcaption>Notice which box is large: 5% of 99,000 healthy people is 4,950 false positives, five times the 990 true ones. The test's error rate is small; the group it applies to is not.</figcaption>
</figure>
</div>

<div class="warning-box">
  <strong>Interview trap — base-rate neglect:</strong> asked this question, most people answer "about 99%", or "about 95%". Both confuse \(P(+\mid D)\) with \(P(D\mid +)\). Whenever a conditional probability is quoted, ask which way round it runs and what the base rate is. Presenting the problem in counts rather than percentages, as in the table above, reliably fixes the intuition — a finding replicated by Gigerenzer and Hoffrage (1995).
</div>

## Independence is not conditional independence

$$A$$ and $$B$$ are **independent** when $$P(A\cap B) = P(A)P(B)$$, equivalently $$P(A\mid B) = P(A)$$: $$B$$ carries no information about $$A$$. They are **conditionally independent given $$C$$** when $$P(A\cap B\mid C) = P(A\mid C)P(B\mid C)$$. Neither condition implies the other.

**Independent, but not conditionally independent.** Flip two fair coins, $$X$$ and $$Y$$, and let $$Z = X \oplus Y$$ be their parity. $$X$$ and $$Y$$ are independent. Condition on $$Z=1$$: now $$X=1$$ forces $$Y=0$$, so given $$Z$$ they are perfectly dependent. Conditioning on a common *effect* creates dependence between its causes — the mechanism behind Berkson's paradox and behind collider bias in observational data.

**Conditionally independent, but not independent.** Pick one of two coins at random, $$Z$$: coin A lands heads with probability 0.9, coin B with probability 0.1. Flip the chosen coin twice, giving $$X$$ and $$Y$$. Given $$Z$$, the flips are independent by construction. Marginally they are not: $$P(X=1)=P(Y=1)=0.5$$, but $$P(X=1,Y=1) = \tfrac12(0.81) + \tfrac12(0.01) = 0.41 \ne 0.25$$. Seeing heads tells you which coin you are holding, which tells you about the second flip. This is exactly the structure of a latent-variable model — conditioning on the latent decouples the observations.

<div class="insight-box">
  <strong>Key Insight — conditioning both creates and destroys dependence:</strong> conditioning on a common <em>cause</em> removes dependence between its effects; conditioning on a common <em>effect</em> creates dependence between its causes. Which one happens is a property of the graph, not of the numbers, which is why probabilistic graphical models draw arrows before they write any probabilities.
</div>

## Where this goes next

Bayes with continuous quantities needs densities rather than point masses — see [random variables](/blog/prob-basics/random-variables/). The estimation view of the same machinery, priors and posteriors as inference procedures, is in [statistics basics](/blog/stats-basics/overview/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>\(P(A\mid B) = P(A\cap B)/P(B)\); the chain rule and the law of total probability are immediate consequences.</li>
    <li>Posterior \(\propto\) likelihood \(\times\) prior; the evidence is just the normalising sum.</li>
    <li>Sensitivity 99%, specificity 95%, prevalence 1% gives a positive predictive value of exactly 1/6, not 99%.</li>
    <li>Rare conditions make false positives dominate no matter how good the test is; raising prevalence to 10% moves the same test to 68.75%.</li>
    <li>Independence and conditional independence imply each other in neither direction.</li>
  </ul>
</div>

## References

1. Eddy, D. M. Probabilistic reasoning in clinical medicine: problems and opportunities. In Kahneman, D., Slovic, P. & Tversky, A. (eds), *Judgment Under Uncertainty: Heuristics and Biases*. Cambridge University Press, 1982.
2. Tversky, A. & Kahneman, D. Judgment under uncertainty: heuristics and biases. *Science* 185(4157), 1124–1131, 1974.
3. Gigerenzer, G. & Hoffrage, U. How to improve Bayesian reasoning without instruction: frequency formats. *Psychological Review* 102(4), 684–704, 1995.
4. Pearl, J. *Probabilistic Reasoning in Intelligent Systems*. Morgan Kaufmann, 1988.
