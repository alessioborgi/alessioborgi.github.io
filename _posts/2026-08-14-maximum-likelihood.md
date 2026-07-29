---
layout: single
title: "Maximum Likelihood: The Default Recipe for Turning Data Into Parameters"
date: 2026-08-14
categories: [stats-basics]
book: stats-basics
subsection: estimation
tags: [maximum-likelihood, fisher-information, map, kl-divergence]
excerpt: "Pick the parameter under which the data you actually observed would have been least surprising. That single sentence generates the Gaussian mean, cross-entropy loss, and — once you add a prior — L2 regularisation."
author_profile: true
read_time: true
is_overview: false
icon: "📈"
read_mins: 6
permalink: /blog/stats-basics/maximum-likelihood/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The likelihood is the sampling density read as a function of the parameter with the data held fixed. Maximising it is equivalent to minimising the KL divergence from the empirical distribution to your model, which is why the negative log-likelihood is the loss function in most of supervised learning. For a Gaussian the MLE gives \(\hat\mu = \bar{x}\) and \(\hat\sigma^2 = \frac{1}{n}\sum_i (x_i - \bar{x})^2\) — and that variance estimate is biased low. Adding a prior turns MLE into MAP, and a Gaussian prior is exactly an L2 penalty.
</div>

## Likelihood is the density, read sideways

For a model \\(p(x \mid \theta)\\) and independent observations \\(x_1,\dots,x_n\\), the likelihood is

<div class="formula-box">
\[
L(\theta) = \prod_{i=1}^{n} p(x_i \mid \theta)
\]
</div>

Algebraically this is the joint density. Conceptually it is something different: the data are fixed and known, and \\(\theta\\) is the free argument. \\(L(\theta)\\) is *not* a probability distribution over \\(\theta\\) — it does not integrate to one, and rescaling it changes nothing about where the maximum is. Only ratios of likelihoods at different \\(\theta\\) carry meaning.

We maximise the logarithm because sums are easier than products in three separate ways: the derivative of a sum is a sum of derivatives; the exponential families that dominate practice have log-densities that are simple polynomials; and a product of \\(10^5\\) densities underflows to zero in floating point while its log does not. Since \\(\log\\) is strictly increasing, the maximiser is unchanged.

## The Gaussian, worked end to end

Take \\(x_i \sim \mathcal{N}(\mu, \sigma^2)\\) with both parameters unknown. The log-likelihood is

<div class="formula-box">
\[
\ell(\mu, \sigma^2) = -\frac{n}{2}\log(2\pi) - \frac{n}{2}\log \sigma^2 - \frac{1}{2\sigma^2}\sum_{i=1}^n (x_i - \mu)^2
\]
</div>

Differentiate in \\(\mu\\): only the last term depends on it, giving \\(\partial\ell/\partial\mu = \frac{1}{\sigma^2}\sum_i (x_i - \mu)\\). Setting this to zero gives \\(\hat\mu = \bar{x}\\), independently of \\(\sigma^2\\).

Now differentiate in \\(\sigma^2\\), treating it as a single variable \\(v\\):

<div class="formula-box">
\[
\frac{\partial \ell}{\partial v} = -\frac{n}{2v} + \frac{1}{2v^2}\sum_i (x_i - \hat\mu)^2 = 0
\qquad\Longrightarrow\qquad
\hat\sigma^2 = \frac{1}{n}\sum_{i=1}^n (x_i - \bar{x})^2
\]
</div>

Concretely, for the five measurements 2.1, 1.9, 2.4, 2.0, 2.6: the sum is 11.0 so \\(\hat\mu = 2.2\\), and the squared deviations \\(0.01 + 0.09 + 0.04 + 0.04 + 0.16\\) total 0.34. The MLE gives \\(\hat\sigma^2 = 0.34/5 = 0.068\\), while the unbiased estimator gives \\(0.34/4 = 0.085\\). The ratio is \\(0.8 = (n-1)/n\\), exactly as the Bessel argument in [descriptive statistics](/blog/stats-basics/descriptive-statistics/) predicts.

<div class="warning-box">
  <strong>Interview trap — "is the MLE biased?":</strong> for the Gaussian mean, no. For the variance, yes: \(\mathbb{E}[\hat\sigma^2] = \frac{n-1}{n}\sigma^2\), an underestimate at every finite \(n\). The reason is that the MLE divides by \(n\) while measuring deviations from the fitted \(\bar{x}\) rather than the true \(\mu\). Maximum likelihood is <em>consistent</em> and asymptotically efficient under regularity conditions, but it carries no finite-sample unbiasedness guarantee — and unbiasedness is not preserved by reparameterisation, whereas the MLE is (the MLE of \(\sigma\) is \(\sqrt{\hat\sigma^2}\)).
</div>

## Curvature is information

Under regularity conditions the MLE is asymptotically normal:

<div class="formula-box">
\[
\sqrt{n}\,(\hat\theta_n - \theta) \;\xrightarrow{d}\; \mathcal{N}\!\big(0,\ I(\theta)^{-1}\big),
\qquad
I(\theta) = -\,\mathbb{E}\!\left[\frac{\partial^2 \log p(x\mid\theta)}{\partial\theta^2}\right]
\]
</div>

\\(I(\theta)\\) is the Fisher information per observation — the expected curvature of the log-density at the truth. A sharply peaked log-likelihood means small parameter changes cost a lot of fit, so the parameter is well determined; a flat one means many values fit almost equally well. For the Gaussian mean, \\(I(\mu) = 1/\sigma^2\\), so the asymptotic variance of \\(\hat\mu\\) is \\(\sigma^2/n\\) — which here is the exact finite-sample answer too.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="mle-title mle-desc" viewBox="0 0 640 190" style="max-width:640px;width:100%;height:auto">
  <title id="mle-title">Log-likelihood curvature at two sample sizes</title>
  <desc id="mle-desc">Two log-likelihood curves for a Gaussian mean, both peaking at mu equals 2.2 and both normalised to zero at the peak. The curve for n equals 5 is broad, falling only about 2.5 log units by mu equals 1.2. The curve for n equals 20 is four times as curved and falls off the bottom of the plot within about 0.7 of the peak. Standard error markers show plus or minus 0.447 for n equals 5 and plus or minus 0.224 for n equals 20, illustrating that four times the data gives four times the curvature and halves the standard error.</desc>
  <rect x="1" y="1" width="638" height="188" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="70" y1="152" x2="600" y2="152" stroke="#cbd5e1"/>
  <line x1="330" y1="32" x2="330" y2="152" stroke="#cbd5e1" stroke-dasharray="3 3"/>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="70" y="166">1.2</text><text x="200" y="166">1.7</text><text x="330" y="166">2.2</text><text x="460" y="166">2.7</text><text x="590" y="166">3.2</text>
  </g>
  <g font-size="9.5" fill="#475569" text-anchor="end">
    <text x="64" y="35">0</text><text x="64" y="83">−2</text><text x="64" y="131">−4</text>
  </g>
  <text x="335" y="182" text-anchor="middle" font-size="10.5" fill="#334155">candidate mean μ  (peak at the MLE, μ̂ = x̄ = 2.2); vertical axis: log-likelihood relative to the peak</text>
  <polyline fill="none" stroke="#0e7490" stroke-width="2" points="70,92.0 96,80.6 122,70.4 148,61.4 174,53.6 200,47.0 226,41.6 252,37.4 278,34.4 304,32.6 330,32.0 356,32.6 382,34.4 408,37.4 434,41.6 460,47.0 486,53.6 512,61.4 538,70.4 564,80.6 590,92.0"/>
  <polyline fill="none" stroke="#c2410c" stroke-width="2" points="148,149.6 174,118.4 200,92.0 226,70.4 252,53.6 278,41.6 304,34.4 330,32.0 356,34.4 382,41.6 408,53.6 434,70.4 460,92.0 486,118.4 512,149.6"/>
  <line x1="214" y1="140" x2="446" y2="140" stroke="#0e7490" stroke-width="1.4"/>
  <line x1="272" y1="128" x2="388" y2="128" stroke="#c2410c" stroke-width="1.4"/>
  <text x="452" y="143" font-size="9.5" fill="#0e7490">±0.447</text>
  <text x="394" y="125" font-size="9.5" fill="#c2410c">±0.224</text>
  <text x="82" y="100" font-size="10" font-weight="700" fill="#0e7490">n = 5 (flat)</text>
  <text x="500" y="115" font-size="10" font-weight="700" fill="#c2410c">n = 20 (sharp)</text>
</svg>
<figcaption>Notice that the peak location is the same in both curves — more data does not move the estimate, it narrows the set of parameters that explain the data almost as well. Curvature at the peak <em>is</em> the information, and its reciprocal is the squared standard error.</figcaption>
</figure>
</div>

## The same thing as minimising KL

Let \\(\hat{p}\\) be the empirical distribution, putting mass \\(1/n\\) on each observed point. Then

<div class="formula-box">
\[
D_{\mathrm{KL}}\!\left(\hat{p}\,\|\,p_\theta\right)
= \underbrace{\mathbb{E}_{\hat p}[\log \hat p(x)]}_{\text{no }\theta}
- \frac{1}{n}\sum_{i=1}^n \log p(x_i \mid \theta)
\]
</div>

The first term is the negative entropy of the data and does not involve \\(\theta\\). So minimising KL divergence to the empirical distribution and maximising the average log-likelihood are the same optimisation. This is the bridge to machine learning: cross-entropy loss on a classifier is the negative log-likelihood of a categorical model, and squared error is the negative log-likelihood of a Gaussian with fixed variance. Nobody chose those losses for aesthetic reasons.

## MAP, and why L2 is a Gaussian prior

Put a prior \\(p(\theta)\\) on the parameter and maximise the posterior instead. Since \\(p(\theta \mid x) \propto p(x\mid\theta)\,p(\theta)\\),

<div class="formula-box">
\[
\hat\theta_{\mathrm{MAP}} = \arg\max_\theta \Big[ \log p(x \mid \theta) + \log p(\theta) \Big]
\]
</div>

MAP is MLE plus one extra additive term. Take linear regression with Gaussian noise of variance \\(\sigma^2\\) and a prior \\(\theta \sim \mathcal{N}(0, \tau^2 I)\\). The log-prior is \\(-\lVert\theta\rVert^2/(2\tau^2)\\) up to a constant, so maximising gives

<div class="formula-box">
\[
\arg\min_\theta \ \sum_i (y_i - x_i^\top\theta)^2 \;+\; \frac{\sigma^2}{\tau^2}\lVert\theta\rVert^2
\]
</div>

which is ridge regression with \\(\lambda = \sigma^2/\tau^2\\). A tight prior (small \\(\tau\\)) means heavy regularisation; a flat prior recovers plain MLE. A Laplace prior gives L1 and hence lasso by the same route.

<div class="insight-box">
  <strong>Key Insight — MAP is not Bayesian inference:</strong> MAP returns the mode of the posterior, a single point, and discards the rest of the distribution. That makes it reparameterisation-<em>dependent</em> — the mode of a density moves under a nonlinear change of variables while the posterior itself does not — and it says nothing about uncertainty. Genuine Bayesian inference keeps the whole posterior; see <a href="/blog/stats-basics/bayesian-vs-frequentist/">Bayesian versus frequentist</a>. MAP is best understood as regularised optimisation wearing Bayesian notation.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Likelihood is the density with data fixed and \(\theta\) free; it is not a distribution over \(\theta\), so only ratios matter.</li>
    <li>Gaussian MLE: \(\hat\mu = \bar{x}\) (unbiased), \(\hat\sigma^2 = \frac1n\sum_i(x_i-\bar x)^2\) (biased by \((n-1)/n\)).</li>
    <li>Asymptotically \(\hat\theta \approx \mathcal{N}(\theta, (nI(\theta))^{-1})\); Fisher information is expected log-likelihood curvature.</li>
    <li>Maximising log-likelihood = minimising \(D_{\mathrm{KL}}(\hat p \,\|\, p_\theta)\), which is why cross-entropy and squared error are the standard losses.</li>
    <li>MAP = MLE + log-prior; a Gaussian prior gives ridge with \(\lambda = \sigma^2/\tau^2\), a Laplace prior gives lasso.</li>
  </ul>
</div>

## References

1. Fisher, R. A. [On the Mathematical Foundations of Theoretical Statistics](https://doi.org/10.1098/rsta.1922.0009). *Philosophical Transactions of the Royal Society A*, 222, 309–368, 1922.
2. van der Vaart, A. W. [*Asymptotic Statistics*](https://doi.org/10.1017/CBO9780511802256). *Cambridge University Press*, 1998.
3. Efron, B. [R. A. Fisher in the 21st Century](https://doi.org/10.1214/ss/1028905930). *Statistical Science*, 13(2), 95–122, 1998.
4. Murphy, K. P. [*Probabilistic Machine Learning: An Introduction*](https://probml.github.io/pml-book/book1.html). *MIT Press*, 2022.
