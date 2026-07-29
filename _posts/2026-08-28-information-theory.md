---
layout: single
title: "Entropy, Cross-Entropy and KL: Why Your Classification Loss Is a Divergence"
date: 2026-08-28
categories: [prob-basics]
book: prob-basics
subsection: information
tags: [entropy, kl-divergence, cross-entropy, mutual-information]
excerpt: "Minimising cross-entropy is minimising a KL divergence plus a constant you cannot change. Once that clicks, maximum likelihood, variational inference and the mode-collapse of a VAE all turn out to be the same argument run in different directions."
author_profile: true
read_time: true
is_overview: false
icon: "🔥"
read_mins: 7
permalink: /blog/prob-basics/information-theory/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Entropy is expected surprise, \(H(p) = -\sum_x p(x)\log p(x)\). Cross-entropy \(H(p,q)\) is the cost of coding \(p\) with a code built for \(q\), and it decomposes as \(H(p) + D_{\mathrm{KL}}(p\|q)\) — so minimising it over \(q\) minimises the KL. KL is non-negative and zero only when \(p=q\), but it is asymmetric and violates the triangle inequality, so it is not a distance. Which argument you put first decides whether your fit covers modes or chases one.
</div>

## Entropy

Define the surprise of an outcome as $-\log p(x)$: certain outcomes carry none, rare ones carry a lot, and surprises of independent events add because logs turn products into sums. Entropy is the expected surprise:

<div class="formula-box">
\[
H(p) = -\sum_x p(x)\log p(x) = \mathbb{E}_{x\sim p}\!\left[-\log p(x)\right].
\]
</div>

With $\log_2$ the units are bits. A fair coin has $H = 1$ bit; a coin with $p=0.9$ has $H = -(0.9\log_2 0.9 + 0.1\log_2 0.1) = 0.469$ bits, because most of the time you already knew the answer. Entropy is maximised by the uniform distribution and is zero for a point mass. Shannon's source coding theorem makes this operational: $H(p)$ is the minimum expected code length, in bits per symbol, for data drawn from $p$.

## Cross-entropy and KL

Suppose you build an optimal code for $q$ but the data actually come from $p$. Your expected code length is the **cross-entropy**

<div class="formula-box">
\[
H(p,q) = -\sum_x p(x)\log q(x) = H(p) + D_{\mathrm{KL}}(p\,\|\,q),
\qquad
D_{\mathrm{KL}}(p\,\|\,q) = \sum_x p(x)\log\frac{p(x)}{q(x)} .
\]
</div>

The **KL divergence** is the excess — the bits you waste for using the wrong code. By Jensen's inequality it is non-negative, and it is zero exactly when $p=q$.

This decomposition explains the classification loss. Take $p$ to be the one-hot label distribution and $q$ the model's softmax output. Then $H(p) = 0$ — the label is certain — so cross-entropy *equals* the KL divergence, and it reduces to $$-\log q(y_{\text{true}})$$: the negative log-likelihood of the correct class. Training a classifier by cross-entropy is maximum likelihood with a categorical noise model, and it is simultaneously KL minimisation. The three descriptions are one computation.

More generally, maximum likelihood over a dataset of $n$ points is

<div class="formula-box">
\[
\arg\max_\theta \frac1n\sum_{i=1}^n \log p_\theta(x_i)
\ \approx\ \arg\min_\theta\ D_{\mathrm{KL}}\!\left(p_{\text{data}} \,\|\, p_\theta\right),
\]
</div>

since the two differ only by $$H(p_{\text{data}})$$, a constant in $\theta$. Fitting by likelihood *is* fitting by forward KL against the empirical distribution.

## KL is not a metric

Two failures. It is not symmetric, and it does not satisfy the triangle inequality. Take $p = (0.5, 0.5)$ and $q = (0.9, 0.1)$ on two outcomes:

<div class="formula-box">
\[
D_{\mathrm{KL}}(p\|q) = 0.511\ \text{nats} = 0.737\ \text{bits},
\qquad
D_{\mathrm{KL}}(q\|p) = 0.368\ \text{nats} = 0.531\ \text{bits}.
\]
</div>

Different numbers for the same pair. The asymmetry has a clear source: $$D_{\mathrm{KL}}(p\|q)$$ averages $\log(p/q)$ under $p$, so it is enormous — infinite, in fact — wherever $p$ puts mass and $q$ puts none, and completely indifferent to regions where $q$ has mass but $p$ does not. Call $$D_{\mathrm{KL}}(p\|q)$$ a "distance" in an interview and expect to be asked which direction you meant.

<div class="warning-box">
  <strong>Interview trap — treating KL as a distance:</strong> it is asymmetric, unbounded, and can be \(+\infty\) between two perfectly reasonable distributions with different supports. That last point is why GAN training with a KL-like objective gives vanishing gradients when generator and data manifolds do not overlap, and why the Wasserstein distance — a genuine metric that stays finite and informative across disjoint supports — was proposed as a replacement. If you need a symmetric quantity, the Jensen–Shannon divergence symmetrises KL, and its square root <em>is</em> a metric.
</div>

## Mutual information

Mutual information is the KL between a joint distribution and the product of its marginals:

<div class="formula-box">
\[
I(X;Y) = D_{\mathrm{KL}}\bigl(p(x,y) \,\|\, p(x)p(y)\bigr) = H(X) - H(X\mid Y) = H(Y) - H(Y\mid X).
\]
</div>

It measures how many bits knowing $Y$ saves you when describing $X$. It is symmetric, non-negative, and zero exactly under independence — so, unlike correlation, it detects *any* dependence, including the parabola counterexample from [expectation and variance](/blog/prob-basics/expectation-and-variance/). The cost is that estimating it from samples in high dimensions is hard, which is why the ML literature is full of variational lower bounds on $I$ rather than direct estimates.

## Forward versus reverse KL

Fit a simple $$q_\theta$$ to a complicated $p$. The direction you choose changes the answer.

**Forward, $$D_{\mathrm{KL}}(p\|q)$$** — the expectation is over $p$, so any region where $p>0$ but $q\approx0$ contributes a huge $\log(p/q)$. The fit is *zero-avoiding*: it spreads $q$ to cover every mode, including the empty space between them. This is the maximum-likelihood direction.

**Reverse, $$D_{\mathrm{KL}}(q\|p)$$** — the expectation is over $q$, so regions where $q\approx0$ cost nothing regardless of $p$. The penalty falls on placing $q$ mass where $p$ has none. The fit is *zero-forcing* and **mode-seeking**: it collapses onto one mode and ignores the rest. This is the direction used by variational inference, because the ELBO is derived from $$D_{\mathrm{KL}}(q\|p)$$ — and it is why variational posteriors are famously over-confident and under-dispersed.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="kl-title kl-desc" viewBox="0 0 600 220" style="max-width:600px;width:100%;height:auto">
  <title id="kl-title">Forward versus reverse KL fitting a single Gaussian to a bimodal target</title>
  <desc id="kl-desc">Two panels. Both show the same bimodal target density with two separated peaks, drawn in grey. In the left panel, labelled forward KL, a single broad Gaussian is centred between the two peaks and spans both, placing mass in the low-density valley. In the right panel, labelled reverse KL, a narrow Gaussian sits on top of the left peak only and ignores the right peak entirely.</desc>
  <rect x="1" y="1" width="598" height="218" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g stroke="#94a3b8" stroke-width="1"><line x1="25" y1="170" x2="285" y2="170"/><line x1="315" y1="170" x2="575" y2="170"/></g>
  <path d="M30,170 C60,170 70,80 100,80 C130,80 138,168 155,168 C172,168 180,80 210,80 C240,80 250,170 280,170" fill="none" stroke="#475569" stroke-width="1.8"/>
  <path d="M320,170 C350,170 360,80 390,80 C420,80 428,168 445,168 C462,168 470,80 500,80 C530,80 540,170 570,170" fill="none" stroke="#475569" stroke-width="1.8"/>
  <path d="M30,170 C70,168 90,105 155,105 C220,105 240,168 280,170" fill="none" stroke="#0e7490" stroke-width="2.4"/>
  <path d="M355,170 C375,168 380,72 390,72 C400,72 405,168 425,170" fill="none" stroke="#c2410c" stroke-width="2.4"/>
  <g font-size="11" fill="#334155" text-anchor="middle">
    <text x="155" y="196" font-weight="700" fill="#0e7490">forward KL(p‖q): mode-covering</text>
    <text x="445" y="196" font-weight="700" fill="#c2410c">reverse KL(q‖p): mode-seeking</text>
  </g>
  <g font-size="10" fill="#475569"><text x="120" y="30">target p (grey), fitted q (colour)</text></g>
</svg>
<figcaption>Notice where each fit puts mass it should not. Forward KL fills the valley between the modes — samples from it will look like neither mode. Reverse KL puts nothing there, but silently drops half the target.</figcaption>
</figure>
</div>

<div class="insight-box">
  <strong>Key Insight — the direction encodes what you are willing to be wrong about:</strong> forward KL punishes <em>missing</em> mass, so it prefers a blurry model that covers everything — the classic explanation for blurry likelihood-trained generative samples. Reverse KL punishes <em>invented</em> mass, so it prefers a sharp model that covers part of the truth. Neither is more correct; the choice states whether false negatives or false positives are the worse failure for your application.
</div>

## Where this goes next

The Gaussian's maximum-entropy property, and the families whose entropies have closed forms, are in [common distributions](/blog/prob-basics/common-distributions/). Estimation and model selection built on likelihood — AIC, likelihood ratios — appear in [statistics basics](/blog/stats-basics/overview/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>\(H(p)\) is expected surprise and the optimal expected code length; a \(p=0.9\) coin carries \(0.469\) bits.</li>
    <li>\(H(p,q) = H(p) + D_{\mathrm{KL}}(p\|q)\); with one-hot labels \(H(p)=0\), so cross-entropy is exactly the KL and exactly the negative log-likelihood.</li>
    <li>Maximum likelihood minimises forward KL against the empirical distribution.</li>
    <li>KL is non-negative and zero only at equality, but asymmetric and not a metric: for \(p=(0.5,0.5)\), \(q=(0.9,0.1)\) the two directions give \(0.511\) and \(0.368\) nats.</li>
    <li>Forward KL is mode-covering, reverse KL is mode-seeking; variational inference uses the reverse and inherits its over-confidence.</li>
  </ul>
</div>

## References

1. Shannon, C. E. A Mathematical Theory of Communication. *Bell System Technical Journal* 27(3), 379–423, 1948.
2. Cover, T. M. & Thomas, J. A. *Elements of Information Theory*, 2nd ed. Wiley, 2006.
3. Minka, T. Divergence measures and message passing. *Microsoft Research Technical Report MSR-TR-2005-173*, 2005.
4. Blei, D. M., Kucukelbir, A. & McAuliffe, J. D. [Variational Inference: A Review for Statisticians](https://arxiv.org/abs/1601.00670). *JASA 112(518), 859–877, 2017*.
5. Arjovsky, M., Chintala, S. & Bottou, L. [Wasserstein GAN](https://arxiv.org/abs/1701.07875). *ICML 2017*.
