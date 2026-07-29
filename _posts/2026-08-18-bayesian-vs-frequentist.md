---
layout: single
title: "Bayesian vs Frequentist: Two Meanings of the Word Probability"
date: 2026-08-18
categories: [stats-basics]
book: stats-basics
subsection: inference
tags: [bayesian, frequentist, credible-interval, conjugate-prior]
excerpt: "One school says probability is a long-run frequency, so parameters cannot have probabilities. The other says probability is a degree of belief, so they can. Everything else — priors, credible intervals, the whole argument — follows from that one disagreement."
author_profile: true
read_time: true
is_overview: false
icon: "🧮"
read_mins: 6
permalink: /blog/stats-basics/bayesian-vs-frequentist/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Frequentists treat the parameter as a fixed unknown and the data as random, so probability statements attach to procedures. Bayesians treat the parameter as uncertain and the data as given, so probability statements attach to the parameter itself. That is why a credible interval can say "95% probability the parameter is in here" and a confidence interval cannot. With plenty of data and a mild prior the two intervals nearly coincide; with little data, or a real prior, they genuinely differ.
</div>

## The disagreement

To a frequentist, \\(\mathbb{P}(A)\\) is the limiting relative frequency of \\(A\\) in repeated trials. A coin's bias \\(\theta\\) is a fixed physical constant, not the outcome of a trial, so "\\(\mathbb{P}(\theta > 0.5)\\)" is not a meaningful expression — it is either true or false. Randomness lives entirely in the sampling, which is why every frequentist guarantee is a statement about what would happen across hypothetical repeated experiments.

To a Bayesian, \\(\mathbb{P}(A)\\) is a degree of belief obeying the probability axioms. Uncertainty about a fixed constant is still uncertainty, so \\(\theta\\) gets a distribution — before the data (the **prior**) and after (the **posterior**). The data, once observed, are not random at all; they are what you conditioned on.

## Bayes' theorem as inference

<div class="formula-box">
\[
\underbrace{p(\theta \mid x)}_{\text{posterior}}
= \frac{\overbrace{p(x \mid \theta)}^{\text{likelihood}}\ \overbrace{p(\theta)}^{\text{prior}}}{\underbrace{p(x)}_{\text{evidence}}},
\qquad
p(x) = \int p(x\mid\theta)\,p(\theta)\,d\theta
\]
</div>

The denominator does not depend on \\(\theta\\), so for inference it is just the constant that makes the posterior integrate to one, and the working form is \\(p(\theta\mid x) \propto p(x\mid\theta)\,p(\theta)\\). The likelihood is the same object [maximum likelihood](/blog/stats-basics/maximum-likelihood/) maximises; the difference is that Bayes multiplies it by a prior and keeps the whole resulting function rather than its peak.

## Beta–Binomial, worked

A **conjugate** prior is one that leaves the posterior in the same family, so the update is arithmetic on parameters rather than an integral. For binomial data the conjugate prior is the Beta.

Take \\(\theta \sim \mathrm{Beta}(2,2)\\) — symmetric, gently favouring values near \\(0.5\\), worth as much as two prior successes and two prior failures. Observe \\(s = 7\\) successes in \\(n = 10\\) trials. Since \\(p(\theta) \propto \theta^{1}(1-\theta)^{1}\\) and \\(p(x\mid\theta)\propto\theta^{7}(1-\theta)^{3}\\), the product is \\(\theta^{8}(1-\theta)^{4}\\):

<div class="formula-box">
\[
\theta \mid x \;\sim\; \mathrm{Beta}(\alpha + s,\ \beta + n - s) = \mathrm{Beta}(9,\ 5)
\]
</div>

The posterior mean is \\(9/14 = 0.643\\), sitting between the prior mean \\(0.5\\) and the MLE \\(0.7\\). It is exactly a weighted average, with weights given by the counts:

<div class="formula-box">
\[
\frac{\alpha+\beta}{\alpha+\beta+n}\cdot 0.5 \;+\; \frac{n}{\alpha+\beta+n}\cdot 0.7
= \tfrac{4}{14}(0.5) + \tfrac{10}{14}(0.7) = 0.643
\]
</div>

The prior carries \\(\alpha+\beta = 4\\) pseudo-observations against the data's 10, so it holds 29% of the weight. Double the data to 20 trials and the prior's share falls to 17%; the prior is a fixed amount of evidence that real data eventually swamp.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="bb-title bb-desc" viewBox="0 0 640 190" style="max-width:640px;width:100%;height:auto">
  <title id="bb-title">Beta prior, likelihood and posterior for seven successes in ten trials</title>
  <desc id="bb-desc">Three densities over theta from 0 to 1. The Beta(2,2) prior is a low broad hump peaking at 0.5 with height 1.5. The normalised likelihood peaks near 0.7. The Beta(9,5) posterior is the tallest and narrowest, peaking at 0.667 with height 3.1, and lies between the other two but much closer to the likelihood. A bar underneath marks the 95 percent equal-tailed credible interval from 0.386 to 0.861.</desc>
  <rect x="1" y="1" width="638" height="188" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="60" y1="140" x2="600" y2="140" stroke="#cbd5e1"/>
  <polyline fill="none" stroke="#475569" stroke-width="1.6" stroke-dasharray="5 3" points="60,140.0 82,133.0 103,126.5 125,120.6 146,115.4 168,110.7 190,106.6 211,103.0 233,100.1 254,97.8 276,96.0 298,94.8 319,94.2 341,94.2 362,94.8 384,96.0 406,97.8 427,100.1 449,103.0 470,106.6 492,110.7 514,115.4 535,120.6 557,126.5 578,133.0 600,140.0"/>
  <polyline fill="none" stroke="#c2410c" stroke-width="1.8" points="60,140.0 82,140.0 103,140.0 125,140.0 146,139.9 168,139.7 190,139.2 211,138.0 233,135.6 254,131.7 276,125.7 298,117.4 319,106.7 341,94.1 362,80.7 384,67.7 406,57.2 427,51.1 449,51.2 470,58.3 492,72.3 514,91.2 535,111.5 557,128.5 578,138.1 600,140.0"/>
  <polyline fill="none" stroke="#0c4a6e" stroke-width="2.4" points="60,140.0 82,140.0 103,140.0 125,140.0 146,140.0 168,139.8 190,139.3 211,138.0 233,135.4 254,130.7 276,123.3 298,112.8 319,99.5 341,84.2 362,68.7 384,55.5 406,47.0 427,45.7 449,52.7 470,67.4 492,87.2 514,108.1 535,125.3 557,135.9 578,139.6 600,140.0"/>
  <line x1="268" y1="158" x2="525" y2="158" stroke="#0c4a6e" stroke-width="3"/>
  <line x1="268" y1="153" x2="268" y2="163" stroke="#0c4a6e" stroke-width="2"/>
  <line x1="525" y1="153" x2="525" y2="163" stroke="#0c4a6e" stroke-width="2"/>
  <text x="396" y="176" text-anchor="middle" font-size="10" font-weight="700" fill="#0c4a6e">95% credible interval [0.386, 0.861]</text>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="60" y="152">0</text><text x="168" y="152">0.2</text><text x="276" y="152">0.4</text><text x="384" y="152">0.6</text><text x="492" y="152">0.8</text><text x="600" y="152">1.0</text>
  </g>
  <text x="150" y="112" font-size="10" font-weight="700" fill="#475569">prior Beta(2,2)</text>
  <text x="520" y="70" font-size="10" font-weight="700" fill="#c2410c">likelihood</text>
  <text x="330" y="42" font-size="10" font-weight="700" fill="#0c4a6e">posterior Beta(9,5)</text>
  <text x="330" y="22" text-anchor="middle" font-size="10.5" fill="#334155">θ, the success probability — 7 successes in 10 trials</text>
</svg>
<figcaption>Notice that the posterior is taller and narrower than either input. Multiplying two densities concentrates: the posterior is more certain than the prior and than the data alone, because it uses both.</figcaption>
</figure>
</div>

## Credible versus confidence

The 95% equal-tailed credible interval for \\(\mathrm{Beta}(9,5)\\) runs from 0.386 to 0.861, and it means what people wish a confidence interval meant: given this prior and this data, there is a 95% probability that \\(\theta\\) lies in that range. You can also read off \\(\mathbb{P}(\theta > 0.5 \mid x) = 0.867\\) directly, a question a p-value cannot answer.

| Method | 95% interval | What it claims |
|---|---|---|
| Credible, \\(\mathrm{Beta}(9,5)\\) | [0.386, 0.861] | 95% posterior probability \\(\theta\\) is inside |
| Clopper–Pearson (exact) | [0.348, 0.933] | ≥95% of such intervals cover \\(\theta\\) |
| Wilson score | [0.397, 0.892] | ≈95% coverage |
| Wald, \\(\hat p \pm 1.96\sqrt{\hat p(1-\hat p)/n}\\) | [0.416, 0.984] | nominally 95%, actually much less |

<div class="warning-box">
  <strong>Interview trap — the two intervals answer different questions:</strong> a <em>credible</em> interval is a statement about \(\theta\) given the data and the prior. A <em>confidence</em> interval is a statement about the procedure's success rate over repeated samples; see <a href="/blog/stats-basics/confidence-intervals/">confidence intervals</a>. They are not interchangeable and they are not generally equal. Note also the Wald row above: it is the interval most people write down by reflex, and at \(n=10\) it reaches 0.984 — its coverage is far below the advertised 95% for \(p\) near 0 or 1, as Brown, Cai and DasGupta (2001) document in detail.
</div>

## When it matters and when it does not

With a large sample and a prior that is not sharply informative, the Bernstein–von Mises theorem says the posterior converges to a Gaussian centred at the MLE with variance given by the inverse Fisher information — the same object the frequentist asymptotics produce. At \\(n = 10\\) the credible and Clopper–Pearson intervals above differ by a lot; at \\(n = 1000\\) they would agree to three digits. The choice is then a matter of interpretation, not of numbers.

The genuine divergences are: small samples, where the prior does real work; problems with sequential or optional stopping, where frequentist error rates depend on the stopping rule and the posterior does not; hierarchical models, where partial pooling is natural in one framework and awkward in the other; and any setting where you want a direct probability about a hypothesis rather than a tail probability under a null.

<div class="insight-box">
  <strong>Key Insight — the prior is not the only assumption:</strong> the usual objection is that priors are subjective. But the likelihood is an assumption too, and it is a much stronger one — choosing "the data are i.i.d. Gaussian" constrains the analysis far more than choosing Beta(2,2) over Beta(1,1). Frequentist methods do not avoid subjectivity, they relocate it into the model, the test statistic, the stopping rule and the \(\alpha\) threshold. The honest difference is that a Bayesian analysis is obliged to write one of its assumptions down explicitly.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Frequentist: parameter fixed, data random, probability = long-run frequency. Bayesian: data given, parameter uncertain, probability = degree of belief.</li>
    <li>Posterior ∝ likelihood × prior; conjugacy makes the update arithmetic — Beta(α,β) with \(s\) of \(n\) becomes Beta(α+s, β+n−s).</li>
    <li>Beta(2,2) with 7/10 gives Beta(9,5): posterior mean 0.643, a weighted average of the prior mean 0.5 and the MLE 0.7 with weights 4/14 and 10/14.</li>
    <li>Credible interval [0.386, 0.861] claims 95% posterior probability; a confidence interval claims 95% coverage of the procedure. Different claims.</li>
    <li>Bernstein–von Mises: with enough data and a non-degenerate prior the two answers converge. Disagreement is a small-sample, stopping-rule or hierarchical phenomenon.</li>
  </ul>
</div>

## References

1. Brown, L. D., Cai, T. T., & DasGupta, A. [Interval Estimation for a Binomial Proportion](https://doi.org/10.1214/ss/1009213286). *Statistical Science*, 16(2), 101–133, 2001.
2. Kass, R. E., & Wasserman, L. [The Selection of Prior Distributions by Formal Rules](https://doi.org/10.1080/01621459.1996.10477003). *Journal of the American Statistical Association*, 91(435), 1343–1370, 1996.
3. van der Vaart, A. W. [*Asymptotic Statistics*](https://doi.org/10.1017/CBO9780511802256). *Cambridge University Press*, 1998.
4. Efron, B., & Hastie, T. [*Computer Age Statistical Inference*](https://hastie.su.domains/CASI/). *Cambridge University Press*, 2016.
