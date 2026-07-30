---
layout: single
title: "Limit Theorems: What the CLT Promises and What It Refuses to Promise"
date: 2026-08-27
categories: [prob-basics]
book: prob-basics
subsection: asymptotics
tags: [clt, lln, concentration, convergence]
excerpt: "The central limit theorem is an asymptotic statement about the centre of a distribution. It says nothing about your sample size, and nothing about the tails you actually care about — which is why concentration inequalities exist."
author_profile: true
read_time: true
is_overview: false
icon: "📐"
read_mins: 6
permalink: /blog/prob-basics/limit-theorems/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The law of large numbers says the sample mean converges to \(\mu\) — in probability (weak) or almost surely (strong). The CLT says its <em>fluctuation</em>, scaled by \(\sqrt{n}\), converges in distribution to a Gaussian. Both are asymptotic: neither tells you anything guaranteed at \(n=100\). Markov, Chebyshev and Hoeffding do, at the cost of being conservative — and Hoeffding's exponential decay is what makes finite-sample generalisation bounds possible.
</div>

## The law of large numbers

Let $$X_1,\dots,X_n$$ be i.i.d. with mean $$\mu$$, and $$\bar{X}_n = \frac1n\sum_i X_i$$. The **weak** law says that for every $$\varepsilon>0$$,

<div class="formula-box">
\[
P\bigl(|\bar{X}_n - \mu| > \varepsilon\bigr) \longrightarrow 0 \quad \text{as } n\to\infty ,
\]
</div>

which requires only that $$\mu$$ exists. The **strong** law upgrades this to $$P(\lim_{n} \bar{X}_n = \mu) = 1$$: almost every infinite sequence of draws has a running average that settles on $$\mu$$ and stays there.

The difference is not pedantic. The weak law allows the sequence to keep making rare excursions away from $$\mu$$ forever, as long as each individual excursion becomes less likely. The strong law forbids that for all but a probability-zero set of sequences. Monte Carlo estimation is justified by the weak law; the claim that a single long simulation run converges is the strong law.

## Three modes of convergence

<div class="formula-box">
\[
X_n \xrightarrow{\text{a.s.}} X \quad\Longrightarrow\quad X_n \xrightarrow{\;p\;} X \quad\Longrightarrow\quad X_n \xrightarrow{\;d\;} X
\]
</div>

**Almost surely**: the sequence of values converges, for every outcome outside a null set. **In probability**: $$P(\lvert X_n - X\rvert>\varepsilon)\to0$$ for each $$\varepsilon$$ — the values may keep jumping, but jumps become rare. **In distribution**: $$F_n(x)\to F(x)$$ at every continuity point of $$F$$ — only the *laws* converge, and $$X_n$$ need not live on the same probability space as $$X$$ at all.

The implications run one way only. The classic separating example: let $$X_n$$ be 1 on a window of width $$1/n$$ that marches repeatedly across $$[0,1]$$, and 0 elsewhere. Then $$X_n\to0$$ in probability, since the window shrinks, but for any fixed point the window returns infinitely often, so the sequence of values never settles — no almost-sure convergence. Convergence in distribution is weakest of all: if $$X\sim\mathcal{N}(0,1)$$ then the constant sequence $$X_n = -X$$ converges in distribution to $$X$$, while $$\lvert X_n - X\rvert = 2\lvert X\rvert$$ never shrinks.

## The central limit theorem

With finite variance $$\sigma^2$$,

<div class="formula-box">
\[
\sqrt{n}\,\frac{\bar{X}_n - \mu}{\sigma} \ \xrightarrow{\;d\;}\ \mathcal{N}(0,1).
\]
</div>

Read it carefully. The theorem is about the *rescaled deviation*, not about $$\bar{X}_n$$ itself (which converges to a constant) and not about the data. The $$\sqrt{n}$$ is the exchange rate: fluctuations of the mean shrink like $$1/\sqrt{n}$$, so quartering the error costs sixteen times the samples.

What the CLT does **not** say:

- **Nothing about any finite $$n$$.** It is a limit. The Berry–Esseen theorem supplies the missing rate — with a finite third moment, the uniform error in the Gaussian approximation is at most $$C\rho/(\sigma^3\sqrt{n})$$ for a universal constant below $$0.5$$ — but that error can be large for skewed data at modest $$n$$.
- **Nothing without finite variance.** Averaging i.i.d. Cauchy draws gives a sample mean with exactly the same Cauchy distribution, for every $$n$$. No concentration, ever.
- **Nothing about the tails.** Convergence in distribution is pointwise on the CDF near the centre; relative error in the far tail can stay enormous. Estimating a $$10^{-6}$$ quantile with a CLT approximation is a well-known way to be badly wrong.
- **Nothing about maxima, minima or quantiles.** Those have their own limit theory (extreme value theory), with Gumbel, Fréchet and Weibull limits rather than Gaussian ones.

<div class="warning-box">
  <strong>Interview trap — "\(n \ge 30\) means the CLT applies":</strong> there is no such threshold. The required \(n\) depends on skewness and kurtosis: symmetric bounded data are near-Gaussian by \(n=10\), while a heavy-tailed revenue distribution can be visibly skewed at \(n=10{,}000\). And for infinite-variance data no \(n\) suffices. The number 30 is a textbook convention, not a theorem.
</div>

The CLT does explain the Gaussian's ubiquity: any quantity that is a sum of many small, roughly independent contributions with finite variance ends up approximately Gaussian regardless of what those contributions look like individually. Measurement error, aggregate demand, and the fluctuation of a minibatch gradient around the full-batch gradient all qualify. The Gaussian is a fixed point of averaging, not a fact about nature.

## Concentration: guarantees at finite $$n$$

Concentration inequalities bound deviation probabilities for a specific $$n$$, with no limits taken.

<div class="formula-box">
\[
\text{Markov: } P(X \ge a) \le \frac{\mathbb{E}[X]}{a}\ (X\ge0)
\qquad
\text{Chebyshev: } P(|X-\mu| \ge k\sigma) \le \frac{1}{k^2}
\]
</div>

Markov uses only the mean and non-negativity, and is correspondingly weak. Chebyshev is Markov applied to $$(X-\mu)^2$$, so it buys a $$1/k^2$$ decay for the price of knowing the variance. **Hoeffding's inequality** buys exponential decay for the price of bounded support: if each $$X_i\in[a,b]$$,

<div class="formula-box">
\[
P\bigl(|\bar{X}_n - \mu| \ge t\bigr) \le 2\exp\!\left(-\frac{2nt^2}{(b-a)^2}\right).
\]
</div>

Take $$n=100$$ fair coin flips, so $$\mu=0.5$$, $$\sigma^2 = 0.25$$, $$b-a=1$$.

| $$t$$ | Chebyshev | Hoeffding | CLT approx. | Exact binomial |
|---|---|---|---|---|
| $$0.1$$ | $$0.250$$ | $$0.271$$ | $$0.0455$$ | $$0.0569$$ |
| $$0.2$$ | $$0.0625$$ | $$0.00067$$ | — | $$0.000079$$ |

At $$t=0.1$$ Chebyshev is actually the tighter bound, and both are five times the truth. At $$t=0.2$$ Hoeffding is a hundred times tighter than Chebyshev, because $$e^{-2nt^2}$$ falls off far faster than $$1/t^2$$. Meanwhile the CLT approximation, $$2(1-\Phi(2)) = 0.0455$$, is close to the exact $$0.0569$$ but is an *approximation* and not a bound — it happens to sit on the wrong side here, understating the true probability.

<div class="insight-box">
  <strong>Key Insight — bounds and approximations answer different questions:</strong> the CLT tells you what the error typically looks like; Hoeffding tells you what it will never exceed, with a stated confidence, at your actual \(n\). Generalisation theory needs the second kind — a PAC bound of the form "with probability \(1-\delta\), test error \(\le\) train error \(+\sqrt{\log(2/\delta)/2n}\)" is Hoeffding's inequality rearranged for \(t\). No asymptotic statement can support a claim about the finite sample in front of you.
</div>

## Where this goes next

The information-theoretic quantities that show up in the same asymptotic arguments — entropy, KL, and the rate at which likelihood ratios separate hypotheses — are in [information theory](/blog/prob-basics/information-theory/). The estimator-level consequences, standard errors and confidence intervals, are in [statistics basics](/blog/stats-basics/overview/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Weak LLN: convergence in probability. Strong LLN: almost-sure convergence. Almost surely \(\Rightarrow\) in probability \(\Rightarrow\) in distribution, never backwards.</li>
    <li>The CLT is about \(\sqrt{n}(\bar{X}_n-\mu)/\sigma\), needs finite variance, and fixes no minimum sample size.</li>
    <li>Errors shrink like \(1/\sqrt{n}\): halving the error costs four times the data.</li>
    <li>Markov needs the mean, Chebyshev the variance, Hoeffding bounded support — and only Hoeffding decays exponentially.</li>
    <li>For 100 fair flips and \(t=0.1\), the true deviation probability is \(0.0569\); Chebyshev says \(\le 0.25\), Hoeffding \(\le 0.271\).</li>
  </ul>
</div>

## References

1. Hoeffding, W. Probability inequalities for sums of bounded random variables. *Journal of the American Statistical Association* 58(301), 13–30, 1963.
2. Boucheron, S., Lugosi, G. & Massart, P. *Concentration Inequalities: A Nonasymptotic Theory of Independence*. Oxford University Press, 2013.
3. Durrett, R. [Probability: Theory and Examples](https://services.math.duke.edu/~rtd/PTE/pte.html), 5th ed. *Cambridge University Press, 2019*.
4. Vershynin, R. [High-Dimensional Probability: An Introduction with Applications in Data Science](https://www.math.uci.edu/~rvershyn/papers/HDP-book/HDP-book.html). *Cambridge University Press, 2018*.
