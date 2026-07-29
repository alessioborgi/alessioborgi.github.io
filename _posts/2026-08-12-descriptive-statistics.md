---
layout: single
title: "Descriptive Statistics: What a Summary Keeps and What It Discards"
date: 2026-08-12
categories: [stats-basics]
book: stats-basics
subsection: foundations
tags: [descriptive-statistics, variance, robustness, quantiles]
excerpt: "A summary statistic is a lossy compression of a sample. Knowing which information each one discards — and why sample variance divides by n minus 1 rather than n — is most of what descriptive statistics has to teach."
author_profile: true
read_time: true
is_overview: false
icon: "📐"
read_mins: 6
permalink: /blog/stats-basics/descriptive-statistics/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The mean uses every observation and is therefore hostage to any one of them; the median ignores magnitudes and survives outliers. Sample variance divides by \(n-1\) because the deviations are measured around \(\bar{x}\), which was itself fitted to the data and so sits closer to the points than the true mean does — the shortfall is exactly one \(\sigma^2\). Skewness, kurtosis and quantiles restore some of what the first two moments throw away, but Anscombe's quartet shows that no fixed set of summaries is safe: plot the data.
</div>

## Centre, and how fragile it is

Take five request latencies, in milliseconds: 12, 15, 15, 18, 90.

| Statistic | Value | What it uses |
|---|---|---|
| Mean \\(\bar{x}\\) | 30.0 ms | every value, weighted equally |
| Median | 15 ms | only the rank order |
| Mode | 15 ms | only repeated values |

The mean is 30 ms and no request took anywhere near 30 ms — one slow request dragged it above the fourth-fastest observation. Push that 90 to 900 and the median is still 15, while the mean climbs to 192.

The formal version is the **breakdown point** — the fraction of the sample an adversary must corrupt to send the statistic anywhere they like. For the mean it is \\(1/n\\), which tends to zero; for the median it is \\(1/2\\). Hence latency dashboards report medians and p99s, and a mean is the right choice only once you have convinced yourself the tail is not pathological.

## Spread, and the \\(n-1\\)

Variance is the mean squared deviation from the centre. The population version divides by \\(n\\); the sample version divides by \\(n-1\\):

<div class="formula-box">
\[
s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2,
\qquad
\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i
\]
</div>

For the latencies, \\(\sum (x_i - 30)^2 = 324 + 225 + 225 + 144 + 3600 = 4518\\). Dividing by \\(n-1 = 4\\) gives \\(s^2 = 1129.5\\) and \\(s = 33.6\\) ms; dividing by \\(n = 5\\) gives 903.6 and 30.1 ms. The gap is a factor of \\(4/5\\), and it is not a convention — it is a correction for a bias you can derive in three lines.

Start from an identity that holds for *any* constant \\(\mu\\):

<div class="formula-box">
\[
\sum_i (x_i - \mu)^2 \;=\; \sum_i (x_i - \bar{x})^2 \;+\; n(\bar{x} - \mu)^2
\]
</div>

The cross term vanishes because \\(\sum_i (x_i - \bar{x}) = 0\\) by construction. Now let \\(\mu\\) be the true mean and take expectations. Each \\(x_i\\) has variance \\(\sigma^2\\), so the left side has expectation \\(n\sigma^2\\). The sample mean has variance \\(\sigma^2/n\\), so the last term has expectation \\(n \cdot \sigma^2/n = \sigma^2\\). Rearranging:

<div class="formula-box">
\[
\mathbb{E}\!\left[\sum_i (x_i - \bar{x})^2\right] = n\sigma^2 - \sigma^2 = (n-1)\sigma^2
\]
</div>

Divide by \\(n-1\\) and the estimator is unbiased. The intuition behind the algebra: \\(\bar{x}\\) is the value that *minimises* the sum of squared deviations, so measuring spread around it always understates spread around the true mean. You spent one degree of freedom locating the centre, and the deficit it causes is exactly \\(\sigma^2\\) — one observation's worth.

<div class="warning-box">
  <strong>Interview trap — "why \(n-1\)?":</strong> the answer is <em>not</em> "because you lose a degree of freedom", stated as a slogan; that is the conclusion, not the reason. The reason is the identity above: deviations around the fitted \(\bar{x}\) are systematically too small, by an amount whose expectation is \(\sigma^2\). A follow-up that catches people: <em>is the sample standard deviation \(s\) unbiased for \(\sigma\)?</em> No. Square root is concave, so by Jensen's inequality \(\mathbb{E}[s] &lt; \sigma\) even though \(\mathbb{E}[s^2] = \sigma^2\). Unbiasedness does not survive nonlinear transformation.
</div>

## Shape: skewness and kurtosis

The third and fourth standardised moments describe asymmetry and tail weight. With \\(m_k = \frac{1}{n}\sum_i (x_i - \bar{x})^k\\):

<div class="formula-box">
\[
g_1 = \frac{m_3}{m_2^{3/2}} \quad \text{(skewness)}, \qquad
b_2 = \frac{m_4}{m_2^{2}} \quad \text{(kurtosis)}
\]
</div>

Skewness is signed: positive means the long tail is on the right, which is the usual shape for latencies, incomes and file sizes. Our five latencies give \\(g_1 = 1.49\\), firmly right-skewed, consistent with the mean sitting above the median. A Gaussian has \\(g_1 = 0\\) and \\(b_2 = 3\\), so "excess kurtosis" \\(b_2 - 3\\) is reported instead, and it measures tail weight — the propensity to produce outliers — not "peakedness".

Both are badly behaved in small samples. The latency sample gives \\(b_2 = 3.23\\), which sounds unremarkable until you notice that for \\(n = 5\\) the sample kurtosis cannot exceed \\(n - 2 + 1/(n-1) = 3.25\\). It is pinned at its ceiling and carries almost no information. Treat third and fourth moments as unreliable below a few hundred observations.

## Quantiles

The \\(q\\)-quantile is the value below which a fraction \\(q\\) of the data falls. Quantiles suit skewed distributions because they assume no distributional form and inherit the median's robustness: the p99 latency answers "how bad is it for the unluckiest one percent", which no combination of mean and standard deviation can. There is no single definition, though — packages implement several interpolation rules that disagree on small samples, so quote the convention when the numbers matter.

## Anscombe's quartet

Anscombe (1973) constructed four eleven-point datasets that agree on essentially every summary anyone computes: mean of \\(x\\) is 9, sample variance of \\(x\\) is 11, mean of \\(y\\) is 7.50, sample variance of \\(y\\) is 4.13, correlation is 0.816, and the least-squares fit is \\(y = 3.00 + 0.50x\\) in all four cases.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="anq-title anq-desc" viewBox="0 0 640 200" style="max-width:640px;width:100%;height:auto">
  <title id="anq-title">Anscombe's quartet: four datasets with identical summary statistics</title>
  <desc id="anq-desc">Four scatter panels, each with eleven teal points and the same orange fitted line y equals 3 plus 0.5x. Set I is a diffuse linear cloud. Set II is a smooth downward-curving parabola that the straight line fits badly. Set III is an exact straight line of ten points with one far outlier above it, which is what tilts the fit. Set IV has ten points stacked vertically at x equals 8 and a single point at x equals 19, so that one point alone determines the slope. All four share mean x of 9, variance of x of 11, mean y of 7.50, variance of y of 4.13 and correlation 0.816.</desc>
  <rect x="1" y="1" width="638" height="198" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="10" y="40" width="136" height="124" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
  <line x1="10.0" y1="139.7" x2="146.0" y2="42.7" stroke="#c2410c" stroke-width="1.5"/>
  <g fill="#0e7490"><circle cx="66.7" cy="98.9" r="3"/><circle cx="51.6" cy="110.6" r="3"/><circle cx="89.3" cy="103.8" r="3"/><circle cx="59.1" cy="90.6" r="3"/><circle cx="74.2" cy="95.7" r="3"/><circle cx="96.9" cy="78.2" r="3"/><circle cx="36.4" cy="107.5" r="3"/><circle cx="21.3" cy="139.6" r="3"/><circle cx="81.8" cy="68.7" r="3"/><circle cx="44.0" cy="133.6" r="3"/><circle cx="28.9" cy="124.3" r="3"/></g>
  <text x="78.0" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">Set I</text>
  <rect x="168" y="40" width="136" height="124" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
  <line x1="168.0" y1="139.7" x2="304.0" y2="42.7" stroke="#c2410c" stroke-width="1.5"/>
  <g fill="#0e7490"><circle cx="224.7" cy="87.0" r="3"/><circle cx="209.6" cy="97.8" r="3"/><circle cx="247.3" cy="91.3" r="3"/><circle cx="217.1" cy="91.0" r="3"/><circle cx="232.2" cy="85.7" r="3"/><circle cx="254.9" cy="98.2" r="3"/><circle cx="194.4" cy="119.5" r="3"/><circle cx="179.3" cy="152.1" r="3"/><circle cx="239.8" cy="87.1" r="3"/><circle cx="202.0" cy="107.3" r="3"/><circle cx="186.9" cy="134.5" r="3"/></g>
  <text x="236.0" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">Set II</text>
  <rect x="326" y="40" width="136" height="124" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
  <line x1="326.0" y1="139.7" x2="462.0" y2="42.7" stroke="#c2410c" stroke-width="1.5"/>
  <g fill="#0e7490"><circle cx="382.7" cy="105.1" r="3"/><circle cx="367.6" cy="112.6" r="3"/><circle cx="405.3" cy="48.2" r="3"/><circle cx="375.1" cy="108.9" r="3"/><circle cx="390.2" cy="101.4" r="3"/><circle cx="412.9" cy="90.2" r="3"/><circle cx="352.4" cy="120.0" r="3"/><circle cx="337.3" cy="127.4" r="3"/><circle cx="397.8" cy="97.7" r="3"/><circle cx="360.0" cy="116.3" r="3"/><circle cx="344.9" cy="123.8" r="3"/></g>
  <text x="394.0" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">Set III</text>
  <rect x="484" y="40" width="136" height="124" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
  <line x1="484.0" y1="139.7" x2="620.0" y2="42.7" stroke="#c2410c" stroke-width="1.5"/>
  <g fill="#0e7490"><circle cx="525.6" cy="114.6" r="3"/><circle cx="525.6" cy="123.5" r="3"/><circle cx="525.6" cy="102.4" r="3"/><circle cx="525.6" cy="90.2" r="3"/><circle cx="525.6" cy="94.2" r="3"/><circle cx="525.6" cy="109.7" r="3"/><circle cx="525.6" cy="129.0" r="3"/><circle cx="608.7" cy="50.8" r="3"/><circle cx="525.6" cy="125.6" r="3"/><circle cx="525.6" cy="100.3" r="3"/><circle cx="525.6" cy="111.3" r="3"/></g>
  <text x="552.0" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">Set IV</text>
  <text x="320" y="188" text-anchor="middle" font-size="10.5" fill="#334155">identical means, variances, correlation (0.816) and fitted line <tspan font-weight="700">y = 3.00 + 0.50x</tspan> — four different stories</text>
</svg>
<figcaption>Notice Set IV: ten points share one x value, so the slope is decided entirely by the eleventh point. Delete it and the fit is undefined. No moment-based summary can reveal that, but two seconds of looking can.</figcaption>
</figure>
</div>

<div class="insight-box">
  <strong>Key Insight — summaries are projections:</strong> the mean and variance are the first two moments, and specifying moments is specifying a projection of the empirical distribution onto a low-dimensional space. Anscombe's construction simply picks four points in the fibre of that projection. This is the same reason a single accuracy number cannot distinguish a model that fails uniformly from one that fails on a subgroup — a scalar summary has a large pre-image, and the interesting variation lives inside it.
</div>

## What to carry forward

These feed everything that follows: \\(\bar{x}\\) and \\(s\\) are the estimators analysed in [estimators, bias and variance](/blog/stats-basics/estimators-bias-variance/), \\(s/\sqrt{n}\\) is the standard error behind [confidence intervals](/blog/stats-basics/confidence-intervals/), and the failure of moment summaries on skewed data is why you reach for [the bootstrap](/blog/stats-basics/bootstrap-and-resampling/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Breakdown point: mean \(1/n\), median \(1/2\). Report medians and high quantiles for anything with a tail.</li>
    <li>\(n-1\) comes from \(\mathbb{E}\big[\sum_i (x_i-\bar{x})^2\big] = (n-1)\sigma^2\), because deviations are taken around the fitted \(\bar{x}\), not the true \(\mu\).</li>
    <li>\(s^2\) is unbiased for \(\sigma^2\); \(s\) is <em>not</em> unbiased for \(\sigma\) — Jensen's inequality.</li>
    <li>Excess kurtosis measures tail weight, not peakedness, and both it and skewness are unstable in small samples.</li>
    <li>Anscombe's quartet: identical means, variances, correlation and regression line, four different datasets. Plot first.</li>
  </ul>
</div>

## References

1. Anscombe, F. J. [Graphs in Statistical Analysis](https://doi.org/10.1080/00031305.1973.10478966). *The American Statistician*, 27(1), 17–21, 1973.
2. Wasserman, L. [*All of Statistics: A Concise Course in Statistical Inference*](https://doi.org/10.1007/978-0-387-21736-9). *Springer*, 2004.
3. Efron, B., & Hastie, T. [*Computer Age Statistical Inference*](https://hastie.su.domains/CASI/). *Cambridge University Press*, 2016.
