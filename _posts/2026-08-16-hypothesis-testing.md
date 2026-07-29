---
layout: single
title: "Hypothesis Testing: What a p-Value Actually Measures"
date: 2026-08-16
categories: [stats-basics]
book: stats-basics
subsection: inference
tags: [hypothesis-testing, p-values, statistical-power, multiple-comparisons]
excerpt: "A p-value answers one narrow question: if nothing were going on, how often would data look at least this extreme? It says nothing about whether the effect is real, large, or worth shipping — and running twenty of them changes the meaning of all twenty."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 7
permalink: /blog/stats-basics/hypothesis-testing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Assume the null, compute a statistic, and ask how often the null would produce something at least this extreme. That tail probability is the p-value: \(\mathbb{P}(\text{data at least this extreme} \mid H_0)\), not \(\mathbb{P}(H_0 \mid \text{data})\). A small p-value with a tiny effect is a large sample, not a discovery; a large p-value with an underpowered study is no evidence of absence. And every extra test you run inflates the chance that at least one comes back "significant" by luck.
</div>

## The machinery

A test needs three parts. The **null hypothesis** \\(H_0\\) is a specific claim precise enough to have a distribution — "the two means are equal" — and the **alternative** \\(H_1\\) is its complement, or a directional part of it. The **test statistic** is a function of the data whose distribution under \\(H_0\\) is known. You then locate your observed statistic in that null distribution and report how far into the tail it fell.

## A two-sample test, all the arithmetic

Two variants of an onboarding flow, measuring time-on-task in seconds. Variant A: \\(n_1 = 40\\), $$\bar{x}_1 = 52.0$$, \\(s_1 = 12.0\\). Variant B: \\(n_2 = 40\\), $$\bar{x}_2 = 57.0$$, \\(s_2 = 14.0\\). Test \\(H_0: \mu_1 = \mu_2\\) against a two-sided alternative.

Pool the two variance estimates, weighting by degrees of freedom:

<div class="formula-box">
\[
s_p^2 = \frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}
= \frac{39(144) + 39(196)}{78} = \frac{13260}{78} = 170
\]
</div>

So \\(s_p = \sqrt{170} = 13.038\\). The standard error of the difference of means is

<div class="formula-box">
\[
\mathrm{SE} = s_p\sqrt{\tfrac{1}{n_1}+\tfrac{1}{n_2}} = 13.038\sqrt{0.05} = 2.9155
\]
</div>

and the statistic is \\(t = (57.0 - 52.0)/2.9155 = 1.715\\) on \\(n_1+n_2-2 = 78\\) degrees of freedom. The two-sided critical value is $$t^\star_{78} = 1.991$$, so at \\(\alpha = 0.05\\) we do **not** reject. The exact two-sided p-value is 0.090: under the null, a gap of 5 seconds or more in either direction would arise about 9% of the time. The 95% interval for the difference is \\(5 \pm 1.991 \times 2.9155 = [-0.80,\ 10.80]\\) — it contains zero, which is the same conclusion in a more informative form.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="ht-title ht-desc" viewBox="0 0 640 190" style="max-width:640px;width:100%;height:auto">
  <title id="ht-title">The null distribution, the rejection region and the observed statistic</title>
  <desc id="ht-desc">A bell-shaped t distribution with 78 degrees of freedom, centred at zero. The two tails beyond plus and minus 1.991 are shaded orange and together hold 5 percent of the area — the rejection region at alpha 0.05. A vertical marker at t equals 1.715, the observed statistic, sits just inside the right-hand boundary, corresponding to a two-sided p-value of 0.090.</desc>
  <rect x="1" y="1" width="638" height="188" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <polygon fill="#fed7aa" points="449,144 449,129.3 458,132.5 466,135.2 474,137.3 482,139.0 490,140.3 498,141.3 507,142.0 515,142.6 523,143.0 531,143.3 539,143.5 547,143.7 556,143.8 564,143.9 572,143.9 580,143.9 580,144"/>
  <polygon fill="#fed7aa" points="60,144 60,143.9 68,143.9 76,143.9 84,143.8 93,143.7 101,143.5 109,143.3 117,143.0 125,142.6 133,142.0 142,141.3 150,140.3 158,139.0 166,137.3 174,135.2 182,132.5 191,129.3 191,144"/>
  <polyline fill="none" stroke="#0c4a6e" stroke-width="2" points="60,143.9 76,143.9 92,143.7 109,143.3 125,142.6 141,141.3 158,139.0 174,135.3 190,129.6 206,121.2 222,110.1 239,96.4 255,81.0 271,65.6 288,52.2 304,43.1 320,39.8 336,43.1 352,52.2 369,65.6 385,81.0 401,96.4 418,110.1 434,121.2 450,129.6 466,135.3 482,139.0 499,141.3 515,142.6 531,143.3 548,143.7 564,143.9 580,143.9"/>
  <line x1="60" y1="144" x2="600" y2="144" stroke="#cbd5e1"/>
  <line x1="449" y1="144" x2="449" y2="120" stroke="#c2410c" stroke-width="1.2" stroke-dasharray="3 2"/>
  <line x1="191" y1="144" x2="191" y2="120" stroke="#c2410c" stroke-width="1.2" stroke-dasharray="3 2"/>
  <line x1="431" y1="144" x2="431" y2="60" stroke="#0e7490" stroke-width="2"/>
  <circle cx="431" cy="60" r="3.5" fill="#0e7490"/>
  <text x="431" y="52" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0e7490">observed t = 1.715</text>
  <text x="449" y="115" text-anchor="middle" font-size="9.5" fill="#c2410c">+1.991</text>
  <text x="191" y="115" text-anchor="middle" font-size="9.5" fill="#c2410c">−1.991</text>
  <text x="530" y="166" text-anchor="middle" font-size="9.5" font-weight="700" fill="#c2410c">2.5% tail</text>
  <text x="110" y="166" text-anchor="middle" font-size="9.5" font-weight="700" fill="#c2410c">2.5% tail</text>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="60" y="158">−4</text><text x="190" y="158">−2</text><text x="320" y="158">0</text><text x="450" y="158">2</text><text x="580" y="158">4</text>
  </g>
  <text x="320" y="182" text-anchor="middle" font-size="10.5" fill="#334155">t statistic under H₀ (78 degrees of freedom); two-sided p = 0.090</text>
</svg>
<figcaption>Notice how little separates the two conclusions. The observed statistic falls just short of the boundary, so a 0.05 threshold reports "no effect" for data that is also perfectly compatible with a 10-second slowdown. The interval carries information the verdict discards.</figcaption>
</figure>
</div>

<div class="warning-box">
  <strong>Interview trap — what a p-value is:</strong> it is \(\mathbb{P}(T \ge t_{\text{obs}} \mid H_0)\), the probability of data at least this extreme <em>given the null is true</em>. It is <strong>not</strong> the probability that the null is true, not the probability the result was chance, not one minus the probability of replication, and not a measure of effect size. Inverting the conditional requires a prior — see <a href="/blog/stats-basics/bayesian-vs-frequentist/">Bayesian versus frequentist</a>. A related trap: \(p &gt; 0.05\) does not mean the null is true. Our test above returned \(p = 0.090\) while remaining compatible with a real 10-second effect; failing to reject is not evidence of no difference.
</div>

## Errors, and the one people forget

A **Type I error** rejects a true null; its rate is \\(\alpha\\), which you choose. A **Type II error** fails to reject a false null; its rate \\(\beta\\) you do *not* choose — it follows from the effect size, the noise and \\(n\\). **Power** is \\(1-\beta\\), the probability of detecting a real effect of a given size.

In the example above, if the true difference really is 5 seconds with \\(\sigma \approx 13.0\\), then 40 per group gives power of only about 0.40. The study was more likely to miss the effect than to find it. Reaching the conventional 80% would need roughly 107 per group — from $$n \approx 2(z_{0.975}+z_{0.80})^2\sigma^2/\delta^2 = 2(1.96+0.84)^2(170)/25$$. Power is decided before the data are collected, and a non-significant result from an underpowered study carries almost no information.

## Significant versus meaningful

Statistical significance says an effect is distinguishable from zero; it says nothing about size. Because the standard error shrinks as \\(1/\sqrt{n}\\), any non-zero effect becomes significant at large enough \\(n\\). With ten million users, a 0.01% conversion change is detectable and irrelevant. Always report the effect size and its interval, and decide separately whether the magnitude justifies the change.

## Many tests at once

Testing \\(m\\) independent true nulls at \\(\alpha = 0.05\\), the chance of at least one false positive is \\(1 - 0.95^m\\): 40% at \\(m=10\\), 64% at \\(m=20\\), 99.4% at \\(m=100\\). Two corrections dominate.

**Bonferroni** tests each at \\(\alpha/m\\), bounding the probability of *any* false positive at \\(\alpha\\). At \\(m=20\\) that means a threshold of 0.0025 — safe, and often so conservative that real effects are lost.

**Benjamini–Hochberg** controls the *false discovery rate*, the expected fraction of rejections that are false. Sort the p-values $$p_{(1)} \le \dots \le p_{(m)}$$, find the largest \\(k\\) with $$p_{(k)} \le \frac{k}{m}\alpha$$, and reject the first \\(k\\). It is far more powerful when many alternatives are genuinely true, which is why it is standard in genomics and in large feature screens.

**p-hacking** is what happens when \\(m\\) is not counted. Trying several metrics, several subgroups, or several stopping points and reporting only the significant one gives a nominal 0.05 test whose real Type I rate is far higher — Simmons, Nelson and Simonsohn (2011) showed that a handful of ordinary, undisclosed analyst choices pushes it above 60%. The defence is to pre-register the primary metric and the sample size.

<div class="insight-box">
  <strong>Key Insight — the test is a decision rule, not a measurement:</strong> Neyman and Pearson designed testing to control long-run error rates for repeated decisions, not to grade the evidence in one experiment. That is why "\(p = 0.049\) versus \(p = 0.051\)" is a meaningless distinction being made to look decisive, and why a confidence interval — which reports the estimate, its precision, and the null verdict together — is almost always the better thing to publish. A p-value throws away the effect size; the interval keeps it.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>p-value = \(\mathbb{P}(\text{as extreme or more} \mid H_0)\). Never \(\mathbb{P}(H_0 \mid \text{data})\), and never an effect size.</li>
    <li>Worked test: \(s_p^2 = 170\), SE = 2.9155, \(t = 1.715\) on 78 df, \(p = 0.090\), CI for the difference \([-0.80, 10.80]\).</li>
    <li>\(\alpha\) is chosen; \(\beta\) is inherited. That study had ~40% power for the effect it was looking for; 80% would need ~107 per group.</li>
    <li>Large \(n\) makes trivial effects significant — report magnitude and interval, not just the verdict.</li>
    <li>Twenty tests at \(\alpha=0.05\) give a 64% chance of at least one false positive. Bonferroni controls any-false-positive; Benjamini–Hochberg controls the false discovery rate.</li>
  </ul>
</div>

## References

1. Neyman, J., & Pearson, E. S. [On the Problem of the Most Efficient Tests of Statistical Hypotheses](https://doi.org/10.1098/rsta.1933.0009). *Philosophical Transactions of the Royal Society A*, 231, 289–337, 1933.
2. Wasserstein, R. L., & Lazar, N. A. [The ASA Statement on p-Values: Context, Process, and Purpose](https://doi.org/10.1080/00031305.2016.1154108). *The American Statistician*, 70(2), 129–133, 2016.
3. Benjamini, Y., & Hochberg, Y. [Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing](https://doi.org/10.1111/j.2517-6161.1995.tb02031.x). *Journal of the Royal Statistical Society B*, 57(1), 289–300, 1995.
4. Simmons, J. P., Nelson, L. D., & Simonsohn, U. [False-Positive Psychology](https://doi.org/10.1177/0956797611417632). *Psychological Science*, 22(11), 1359–1366, 2011.
