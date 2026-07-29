---
layout: single
title: "Confidence Intervals: The Interval Is Random, the Parameter Is Not"
date: 2026-08-15
categories: [stats-basics]
book: stats-basics
subsection: inference
tags: [confidence-intervals, standard-error, t-distribution, sampling-distribution]
excerpt: "A 95% confidence interval does not say the parameter is 95% likely to be inside it. It says the recipe that produced the interval succeeds 95% of the time. That distinction is the single most-failed question in statistics interviews."
author_profile: true
read_time: true
is_overview: false
icon: "📏"
read_mins: 5
permalink: /blog/stats-basics/confidence-intervals/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Build a confidence interval by inverting a pivot: find a quantity whose distribution you know regardless of the unknown parameter, bracket it between two quantiles, and rearrange. The 95% refers to the long-run success rate of the <em>procedure</em> across repeated samples — the endpoints are the random objects, the parameter is a fixed unknown constant. Width shrinks as \(1/\sqrt{n}\), so buying half the uncertainty costs four times the data.
</div>

## The sampling distribution and the standard error

Compute \\(\bar{x}\\) from a sample of size \\(n\\). Collect another sample and you get a different \\(\bar{x}\\). The distribution of those values across hypothetical repetitions is the **sampling distribution** of the mean, and its standard deviation is the **standard error**:

<div class="formula-box">
\[
\mathrm{SE}(\bar{x}) = \frac{\sigma}{\sqrt{n}} \;\approx\; \frac{s}{\sqrt{n}}
\]
</div>

Two things separate the standard error from the sample standard deviation \\(s\\), and conflating them is common. \\(s\\) estimates the spread of *individual observations* and converges to \\(\sigma\\), a fixed property of the population that does not shrink with more data. The standard error measures the spread of the *estimate* and does shrink, at rate \\(1/\sqrt{n}\\).

## Constructing the interval

For Gaussian data the standardised mean has a known distribution that does not depend on \\(\mu\\) or \\(\sigma\\) — a **pivot**:

<div class="formula-box">
\[
T = \frac{\bar{x} - \mu}{s/\sqrt{n}} \;\sim\; t_{n-1}
\]
</div>

Let \\(t^\star\\) be the 0.975 quantile of $$t_{n-1}$$. Then \\(\mathbb{P}(-t^\star < T < t^\star) = 0.95\\) by construction, and rearranging the inequality to isolate \\(\mu\\) gives

<div class="formula-box">
\[
\bar{x} - t^\star\frac{s}{\sqrt{n}} \;<\; \mu \;<\; \bar{x} + t^\star\frac{s}{\sqrt{n}}
\]
</div>

The probability statement was made *before* the data arrived, about the random variables \\(\bar{x}\\) and \\(s\\). Rearranging an inequality does not move randomness from one side to the other.

**Worked example.** A sample of \\(n = 25\\) response times gives \\(\bar{x} = 100\\) ms and \\(s = 15\\) ms. Then \\(\mathrm{SE} = 15/\sqrt{25} = 3.0\\) ms, and $$t^\star_{24} = 2.0639$$, so the half-width is \\(2.0639 \times 3.0 = 6.19\\) and the interval is \\([93.81,\ 106.19]\\).

## What the 95% attaches to

<div class="warning-box">
  <strong>Interview trap — the misinterpretation:</strong> "there is a 95% probability that \(\mu\) lies in [93.81, 106.19]" is <em>wrong</em>. Once the data are in, the endpoints are two specific numbers and \(\mu\) is a specific unknown constant; either it is in there or it is not, and there is no randomness left to carry a probability. What is 95% is the <em>coverage of the procedure</em>: if you repeated the whole experiment many times, 95% of the intervals so constructed would contain \(\mu\). The interval is random; the parameter is not. If you want "95% probability that the parameter is in this range", you want a <a href="/blog/stats-basics/bayesian-vs-frequentist/">credible interval</a>, which requires a prior.
</div>

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="ci-title ci-desc" viewBox="0 0 640 200" style="max-width:640px;width:100%;height:auto">
  <title id="ci-title">Twenty simulated 95% confidence intervals against a fixed true mean</title>
  <desc id="ci-desc">Twenty horizontal intervals, each from a simulated sample of 25 draws from a Normal distribution with mean 100 and standard deviation 15. A dashed vertical line marks the true mean of 100. Eighteen intervals, drawn in teal, cross the line. Two, drawn in orange — the seventeenth and the twentieth — fall entirely to one side and miss it. The true mean never moves; only the intervals do.</desc>
  <rect x="1" y="1" width="638" height="198" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="330" y1="18" x2="330" y2="172" stroke="#334155" stroke-width="1.4" stroke-dasharray="4 3"/>
  <line x1="223" y1="26" x2="393" y2="26" stroke="#0e7490" stroke-width="2.2"/><circle cx="308" cy="26" r="1.8" fill="#0e7490"/>
  <line x1="217" y1="33" x2="404" y2="33" stroke="#0e7490" stroke-width="2.2"/><circle cx="310" cy="33" r="1.8" fill="#0e7490"/>
  <line x1="158" y1="40" x2="397" y2="40" stroke="#0e7490" stroke-width="2.2"/><circle cx="278" cy="40" r="1.8" fill="#0e7490"/>
  <line x1="256" y1="48" x2="475" y2="48" stroke="#0e7490" stroke-width="2.2"/><circle cx="365" cy="48" r="1.8" fill="#0e7490"/>
  <line x1="278" y1="55" x2="461" y2="55" stroke="#0e7490" stroke-width="2.2"/><circle cx="370" cy="55" r="1.8" fill="#0e7490"/>
  <line x1="285" y1="62" x2="469" y2="62" stroke="#0e7490" stroke-width="2.2"/><circle cx="377" cy="62" r="1.8" fill="#0e7490"/>
  <line x1="186" y1="69" x2="442" y2="69" stroke="#0e7490" stroke-width="2.2"/><circle cx="314" cy="69" r="1.8" fill="#0e7490"/>
  <line x1="229" y1="76" x2="454" y2="76" stroke="#0e7490" stroke-width="2.2"/><circle cx="341" cy="76" r="1.8" fill="#0e7490"/>
  <line x1="304" y1="84" x2="526" y2="84" stroke="#0e7490" stroke-width="2.2"/><circle cx="415" cy="84" r="1.8" fill="#0e7490"/>
  <line x1="219" y1="91" x2="462" y2="91" stroke="#0e7490" stroke-width="2.2"/><circle cx="341" cy="91" r="1.8" fill="#0e7490"/>
  <line x1="221" y1="98" x2="412" y2="98" stroke="#0e7490" stroke-width="2.2"/><circle cx="317" cy="98" r="1.8" fill="#0e7490"/>
  <line x1="125" y1="105" x2="347" y2="105" stroke="#0e7490" stroke-width="2.2"/><circle cx="236" cy="105" r="1.8" fill="#0e7490"/>
  <line x1="287" y1="112" x2="498" y2="112" stroke="#0e7490" stroke-width="2.2"/><circle cx="392" cy="112" r="1.8" fill="#0e7490"/>
  <line x1="266" y1="120" x2="530" y2="120" stroke="#0e7490" stroke-width="2.2"/><circle cx="398" cy="120" r="1.8" fill="#0e7490"/>
  <line x1="228" y1="127" x2="422" y2="127" stroke="#0e7490" stroke-width="2.2"/><circle cx="325" cy="127" r="1.8" fill="#0e7490"/>
  <line x1="164" y1="134" x2="367" y2="134" stroke="#0e7490" stroke-width="2.2"/><circle cx="265" cy="134" r="1.8" fill="#0e7490"/>
  <line x1="379" y1="141" x2="577" y2="141" stroke="#c2410c" stroke-width="2.2"/><circle cx="478" cy="141" r="1.8" fill="#c2410c"/>
  <line x1="240" y1="148" x2="422" y2="148" stroke="#0e7490" stroke-width="2.2"/><circle cx="331" cy="148" r="1.8" fill="#0e7490"/>
  <line x1="140" y1="156" x2="362" y2="156" stroke="#0e7490" stroke-width="2.2"/><circle cx="251" cy="156" r="1.8" fill="#0e7490"/>
  <line x1="151" y1="163" x2="322" y2="163" stroke="#c2410c" stroke-width="2.2"/><circle cx="236" cy="163" r="1.8" fill="#c2410c"/>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="161" y="185">90</text><text x="246" y="185">95</text><text x="330" y="185">100</text><text x="414" y="185">105</text><text x="499" y="185">110</text>
  </g>
  <text x="330" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">true μ = 100 (fixed)</text>
  <text x="600" y="163" text-anchor="end" font-size="9.5" font-weight="700" fill="#c2410c">2 of 20 miss</text>
</svg>
<figcaption>Notice which object moves. The dashed line is fixed; the intervals jump around it. Two of these twenty miss — over 20,000 replications of the same simulation the coverage was 94.8%, as advertised.</figcaption>
</figure>
</div>

## \\(t\\) or \\(z\\)

Use \\(z = 1.96\\) when \\(\sigma\\) is known; use $$t_{n-1}$$ when you estimated it from the same data. Estimating \\(\sigma\\) injects extra variability — sometimes \\(s\\) comes out too small, which would make a \\(z\\)-interval too narrow — and the heavier tails of \\(t\\) pay for exactly that.

| \\(n\\) | multiplier | half-width (\\(s=15\\)) | interval |
|---|---|---|---|
| 25 ($$t_{24}$$) | 2.0639 | 6.19 | [93.81, 106.19] |
| 25 (\\(z\\), wrong here) | 1.9600 | 5.88 | [94.12, 105.88] |
| 100 ($$t_{99}$$) | 1.9842 | 2.98 | [97.02, 102.98] |

At \\(n=25\\) the correction is about 5%; by \\(n=100\\) it is under 2% and the distinction stops mattering in practice. What does *not* stop mattering is the assumption behind the pivot: \\(T\\) is exactly $$t_{n-1}$$ only for Gaussian data. For other distributions the interval is justified by the central limit theorem, which needs \\(n\\) large enough for \\(\bar{x}\\) to be near-Gaussian — and heavy tails or strong skew can make "large enough" run into the hundreds. When in doubt, use [the bootstrap](/blog/stats-basics/bootstrap-and-resampling/).

## The \\(1/\sqrt{n}\\) tax

Half-width is \\(t^\star s/\sqrt{n}\\), so it falls as \\(1/\sqrt{n}\\). Going from \\(n=25\\) to \\(n=100\\) took the half-width from 6.19 to 2.98 — a factor of 2.08, the extra fraction coming from \\(t^\star\\) shrinking towards 1.96 as well. Quadrupling data halves uncertainty; a further tenfold reduction would need 10,000 samples.

<div class="insight-box">
  <strong>Key Insight — why the square root, and what it costs:</strong> \(\mathrm{Var}(\bar x) = \sigma^2/n\) because variances of independent terms add while the \(1/n\) scaling squares, so the standard deviation keeps only \(1/\sqrt{n}\). The consequence for reported model accuracies is uncomfortable. Correctness on one example is Bernoulli, so at 90% accuracy the per-example standard deviation is \(\sqrt{0.9 \times 0.1} = 0.3\). Getting a 95% interval of ±1 percentage point therefore needs \(n = (1.96 \times 0.3 / 0.01)^2 \approx 3{,}460\) test examples, and ±0.5 points needs four times that, about 13,800. A great many published gaps are smaller than the interval of the test set they were measured on.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Standard error \(s/\sqrt{n}\) is the spread of the <em>estimate</em>; \(s\) is the spread of the <em>observations</em> and does not shrink with \(n\).</li>
    <li>A CI comes from inverting a pivot — a quantity whose distribution is free of the unknown parameter.</li>
    <li>95% is the coverage of the procedure over repeated samples. The endpoints are random; \(\mu\) is a fixed constant.</li>
    <li>Use \(t_{n-1}\) when \(\sigma\) is estimated: 2.064 at \(n=25\) versus 1.96, a 5% widening that fades by \(n \approx 100\).</li>
    <li>Width scales as \(1/\sqrt{n}\): four times the data for half the width.</li>
  </ul>
</div>

## References

1. Neyman, J. [Outline of a Theory of Statistical Estimation Based on the Classical Theory of Probability](https://doi.org/10.1098/rsta.1937.0005). *Philosophical Transactions of the Royal Society A*, 236, 333–380, 1937.
2. Greenland, S., Senn, S. J., Rothman, K. J., Carlin, J. B., Poole, C., Goodman, S. N., & Altman, D. G. [Statistical tests, P values, confidence intervals, and power: a guide to misinterpretations](https://doi.org/10.1007/s10654-016-0149-3). *European Journal of Epidemiology*, 31, 337–350, 2016.
3. Brown, L. D., Cai, T. T., & DasGupta, A. [Interval Estimation for a Binomial Proportion](https://doi.org/10.1214/ss/1009213286). *Statistical Science*, 16(2), 101–133, 2001.
