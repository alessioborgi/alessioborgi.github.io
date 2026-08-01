---
layout: single
title: "Bias, Variance, and Regularisation: Why Models Fail to Generalise"
date: 2026-05-02
categories: [basics]
book: basics
subsection: foundations
tags: [bias-variance, overfitting, regularisation, cross-validation, generalisation]
published: true
is_overview: false
excerpt: "A model can fail for two opposite reasons: it is too rigid to represent the truth, or so flexible that it chases the noise. Squared error splits cleanly into exactly those two terms plus a floor you cannot beat."
author_profile: true
read_time: true
icon: "⚖️"
read_mins: 7
permalink: /blog/basics/bias-variance-and-regularisation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Expected squared test error splits into three pieces: \(\text{bias}^2\) — error because the model is too rigid to represent the truth; \(\text{variance}\) — error because the fit moves when the training sample changes; and \(\sigma^2\) — noise you cannot remove no matter what you do. Almost every technique in this book is a way of trading the first against the second, and the third is the reminder that perfect accuracy was never available.
</div>

## The decomposition, derived

Suppose the data comes from $$y = f(x) + \varepsilon$$ with $$\mathbb{E}[\varepsilon] = 0$$ and $$\operatorname{Var}(\varepsilon) = \sigma^2$$. You fit $$\hat{f}$$ on a random training sample, so $$\hat{f}$$ is itself random. Fix a test point $$x$$ and ask for the expected squared error there, averaging over both the training sample and the fresh noise.

Add and subtract the average prediction $$\bar{f}(x) = \mathbb{E}[\hat{f}(x)]$$:

<div class="formula-box">
\[
\begin{aligned}
\mathbb{E}\bigl[(y - \hat{f}(x))^2\bigr]
&= \mathbb{E}\bigl[(f(x) + \varepsilon - \hat{f}(x))^2\bigr] \\[4pt]
&= \underbrace{\bigl(\bar{f}(x) - f(x)\bigr)^2}_{\text{bias}^2}
 + \underbrace{\mathbb{E}\bigl[(\hat{f}(x) - \bar{f}(x))^2\bigr]}_{\text{variance}}
 + \underbrace{\sigma^2}_{\text{noise}} .
\end{aligned}
\]
</div>

The cross term disappears because $$\bar{f}(x) - f(x)$$ is a constant with respect to the randomness in $$\hat{f}$$, so it factors out of an expectation that is zero: $$\mathbb{E}[\hat{f}(x) - \bar{f}(x)] = 0$$. The noise term separates because $$\varepsilon$$ is independent of the training sample.

<div class="insight-box">
<strong>Read the three terms operationally.</strong> <strong>Bias</strong> asks: if I had infinite data, would this model class still be wrong? <strong>Variance</strong> asks: if I redrew the training set, how much would my predictions move? <strong>Noise</strong> asks nothing — it is the floor. A reported error below \(\sigma\) on held-out data means you have leaked, not succeeded.
</div>

The two extremes make it concrete. A model that always predicts the constant $$0$$ has zero variance — resampling changes nothing — and enormous bias. A 1-nearest-neighbour fit has almost no bias, since it can represent any function given enough points, and large variance, since moving one training point changes its predictions wholesale.

## Measured, not asserted

Fit polynomials of increasing degree to ten noisy samples of a smooth function, and evaluate on ten held-out points.

| Degree | Train RMSE | Validation RMSE |
|---|---|---|
| 0 | 0.6456 | 0.7503 |
| 1 | 0.4527 | 0.4899 |
| 2 | 0.1316 | 0.2681 |
| 3 | 0.0853 | 0.2171 |
| **5** | **0.0816** | **0.2123** |
| 7 | 0.0380 | 0.2402 |
| 8 | 0.0238 | 0.2558 |
| 9 | ≈ 0 | 0.2915 |

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 262" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="bv-title bv-desc" style="width:100%;max-width:520px;height:auto;font-family:sans-serif">
  <title id="bv-title">Training and validation error against polynomial degree</title>
  <desc id="bv-desc">Training error falls monotonically to zero as degree increases, while validation error falls to a minimum at degree five and then rises again.</desc>
  <rect width="520" height="262" fill="#f8fafc" rx="10"/>
  <text x="260" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Train error always falls. Validation error does not.</text>

  <line x1="60" y1="210" x2="450" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="60" y1="46"  x2="60"  y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="255" y="238" text-anchor="middle" font-size="9" fill="#475569">polynomial degree</text>
  <text x="30" y="130" font-size="9" fill="#475569" transform="rotate(-90 30 130)">RMSE</text>

  <polyline fill="none" stroke="#2563eb" stroke-width="2.5"
    points="60,80.9 102,119.5 144,183.7 186,193.0 228,193.0 270,193.7 312,195.8 354,202.4 396,205.2 438,210.0"/>
  <polyline fill="none" stroke="#ea580c" stroke-width="2.5"
    points="60,59.9 102,112.0 144,156.4 186,166.6 228,166.6 270,167.5 312,165.6 354,162.0 396,158.8 438,151.7"/>

  <circle cx="270" cy="167.5" r="5" fill="#ea580c"/>
  <line x1="270" y1="167.5" x2="270" y2="210" stroke="#ea580c" stroke-width="1" stroke-dasharray="3 2"/>
  <text x="270" y="224" text-anchor="middle" font-size="8.5" fill="#9a3412">best: degree 5</text>

  <text x="446" y="214" font-size="9" font-weight="700" fill="#2563eb">train</text>
  <text x="446" y="148" font-size="9" font-weight="700" fill="#ea580c">validation</text>
  <text x="260" y="252" text-anchor="middle" font-size="8.5" fill="#475569">Plotted from the measured RMSE values in the table above.</text>
</svg>
<figcaption>Training error decreases monotonically with capacity — it must, since a higher-degree polynomial can reproduce anything a lower one can. Validation error bottoms out at degree 5 and climbs thereafter. At degree 9 the fit interpolates all ten training points perfectly and is 37% worse than the best model on held-out data.</figcaption>
</figure>
</div>

Decomposing the error directly at a single test point, over 4,000 resampled training sets:

| Degree | bias² | variance | sum | measured error |
|---|---|---|---|---|
| 0 | 0.35011 | 0.00379 | 0.35391 | 0.35391 |
| 3 | 0.00667 | 0.00882 | 0.01549 | 0.01549 |
| 9 | 0.00004 | 0.02924 | 0.02928 | 0.02928 |

The identity holds to every digit shown, and the pattern is exactly as advertised: the constant-ish model is nearly all bias, the interpolating model is nearly all variance, and the middle is where their sum is smallest.

## Train, validation, test

Three splits, three jobs. **Training** fits parameters. **Validation** chooses hyperparameters — degree, $$\lambda$$, depth, learning rate. **Test** estimates generalisation, once.

<div class="warning-box">
<strong>A test set you have looked at repeatedly is a validation set.</strong> Every time you check test performance and change something in response, you leak a little information about it into your model, and the estimate drifts optimistic. This is not a rule of etiquette — it is the same overfitting mechanism operating on your decisions rather than on your weights. If you have tuned against it twenty times, the number it gives you is no longer an unbiased estimate of anything.
</div>

**Cross-validation** gets more out of limited data. Split into $$k$$ folds, train on $$k-1$$ and validate on the remaining one, rotate, average. Every point is used for validation exactly once, so the estimate is far less sensitive to an unlucky split than a single hold-out, at $$k$$ times the compute.

## Regularisation is buying variance with bias

Every technique below deliberately introduces bias because the variance reduction more than pays for it.

**Ridge** adds $$\lambda\lVert \beta \rVert_2^2$$ and shrinks coefficients smoothly towards zero. **Lasso** adds $$\lambda\lVert \beta \rVert_1$$ and sets some exactly to zero, giving selection as well as shrinkage. Both are [derived in the linear regression chapter](/blog/basics/linear-regression/), including the geometric reason only lasso produces sparsity.

**Early stopping** halts training when validation error turns up. It is regularisation by wall clock: you never reach the high-variance region of parameter space because you stop first.

**Dropout** randomly zeroes units during training, so no unit can rely on any particular other one being present.

**Data augmentation** is the odd one out, and the most effective when it applies. Instead of restricting the model, it enlarges the data with transformations that should not change the label. That reduces variance without adding bias — provided your invariance claim is true. Rotating handwritten digits by 180° is not label-preserving; a 6 becomes a 9.

<div class="insight-box">
<strong>The unifying view:</strong> regularisation shrinks the effective size of the hypothesis space. A smaller space means fewer ways for the fit to move when the data changes — less variance — and a greater chance the truth is not in it — more bias. \(\lambda\) is the dial, and validation tells you where to set it.
</div>

## Where the classical picture stops

The U-shaped validation curve above is real and reproduces reliably at this scale. It is not the complete story.

For very heavily over-parameterised models, test error often *falls again* after the point where the model has enough capacity to interpolate the training set — the phenomenon usually called **double descent**. The classical account predicts monotone deterioration past the interpolation threshold, and that is not what is observed for large neural networks.

<div class="warning-box">
<strong>Treat this as an observation, not a resolved theory.</strong> Double descent is well documented empirically, and there are partial explanations involving implicit regularisation from the optimiser and the geometry of over-parameterised solutions. There is no settled account. The practical consequence is narrow but real: "my model has more parameters than data points, so it must overfit" is not a sound argument, and you should look at a validation curve rather than assume the shape of one.
</div>

The bias–variance decomposition itself remains exactly true — it is an algebraic identity, not an empirical claim. What double descent complicates is the assumption that variance rises monotonically with parameter count.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Expected squared error \(=\ \text{bias}^2 + \text{variance} + \sigma^2\). The cross term vanishes because \(\bar{f} - f\) is constant with respect to the training randomness. This is an identity, not an approximation.</li>
  <li>\(\sigma^2\) is irreducible. A held-out error below the noise level is evidence of leakage, not of a good model.</li>
  <li>Measured on real fits: degree 0 gives bias² 0.350 and variance 0.004; degree 9 gives bias² 0.00004 and variance 0.029. Same total error budget, opposite causes.</li>
  <li>Training error falls monotonically with capacity and therefore carries no information about generalisation. Only held-out error does.</li>
  <li>A test set consulted repeatedly stops being one — the leakage is through your decisions, not your weights.</li>
  <li>Ridge, lasso, early stopping and dropout all buy variance reduction with bias. Data augmentation is the exception, reducing variance for free — if the invariance you assume is genuinely true.</li>
  <li>Double descent means "more parameters than data" does not by itself imply overfitting. Look at the curve.</li>
</ul>
</div>
