---
layout: single
title: "Norms, Inner Products, and the Geometry Behind L1 Sparsity"
date: 2026-08-07
categories: [math-basics]
book: math-basics
subsection: analysis
tags: [norms, sparsity, cosine-similarity, inner-products]
excerpt: "L1 regularisation produces exact zeros and L2 does not. The reason is not statistical, it is geometric: the L1 unit ball has corners on the axes, and corners are what optimisation solutions stick to."
author_profile: true
read_time: true
is_overview: false
icon: "📏"
read_mins: 7
permalink: /blog/math-basics/norms-and-distances/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A norm is a choice of what "big" means, and different choices give unit balls of different shapes — a diamond for \(L^1\), a sphere for \(L^2\), a cube for \(L^\infty\). That shape is the whole story behind \(L^1\) sparsity: the diamond's extreme points sit on the coordinate axes, so a constrained optimum lands there for a whole cone of gradient directions. Operator norms measure how much a matrix can stretch, with \(\lVert A\rVert_2 = \sigma_{\max}\). Cosine similarity and Euclidean distance give identical rankings on unit-norm vectors and diverge as soon as magnitude carries information.
</div>

## What a norm has to satisfy

A norm $$\lVert\cdot\rVert$$ on $$\mathbb{R}^n$$ obeys three rules: $$\lVert x\rVert \ge 0$$ with equality only at $$x = 0$$; $$\lVert \alpha x\rVert = \lvert\alpha\rvert\,\lVert x\rVert$$; and the triangle inequality $$\lVert x + y\rVert \le \lVert x\rVert + \lVert y\rVert$$. Everything else follows, including the fact that $$d(x,y) = \lVert x - y\rVert$$ is a metric.

The $$L^p$$ family, for $$p \ge 1$$, is

<div class="formula-box">
\[
\lVert x\rVert_p = \Bigl(\textstyle\sum_{i=1}^n \lvert x_i\rvert^p\Bigr)^{1/p},
\qquad \lVert x\rVert_\infty = \max_i \lvert x_i\rvert .
\]
</div>

The $$p \ge 1$$ restriction is not decoration. For $$p < 1$$ the triangle inequality fails — with $$x = (1,0)$$ and $$y = (0,1)$$, the "$$L^{1/2}$$ norm" of $$x+y$$ is $$(1+1)^2 = 4$$ while $$\lVert x\rVert + \lVert y\rVert = 2$$. The $$L^0$$ "norm", the count of non-zeros, is not a norm either, which is exactly why $$L^1$$ is used as its convex surrogate.

For a concrete comparison take $$v = (3, -4, 0, 12)$$: $$\lVert v\rVert_1 = 19$$, $$\lVert v\rVert_2 = \sqrt{9+16+144} = 13$$, $$\lVert v\rVert_\infty = 12$$. The ordering $$\lVert v\rVert_\infty \le \lVert v\rVert_2 \le \lVert v\rVert_1$$ holds for every vector, and the reverse bounds $$\lVert v\rVert_1 \le \sqrt{n}\,\lVert v\rVert_2$$ and $$\lVert v\rVert_2 \le \sqrt{n}\,\lVert v\rVert_\infty$$ are both tight at $$v = (1,1,\dots,1)$$.

## Unit balls, and why $$L^1$$ makes zeros

The unit ball $$\{x : \lVert x\rVert \le 1\}$$ is a picture of the norm. In two dimensions: $$L^1$$ gives a diamond with vertices at $$(\pm1,0)$$ and $$(0,\pm1)$$, $$L^2$$ gives the circle, $$L^\infty$$ gives the square $$[-1,1]^2$$. All three contain the standard basis vectors on their boundary, and $$L^1 \subset L^2 \subset L^\infty$$ as sets.

Now pose the lasso in constrained form: minimise $$\lVert Aw - b\rVert_2^2$$ subject to $$\lVert w\rVert_1 \le t$$. Geometrically, grow the level sets of the loss outward from the unconstrained optimum until they first touch the constraint ball; that first contact is the solution.

The diamond's extreme points lie *on the coordinate axes*, and at those corners the boundary is non-smooth. A corner has a full-dimensional normal cone: an entire two-dimensional wedge of loss-gradient directions leads to the same corner. So contact at a corner is not a coincidence but the generic case, and a corner has some coordinates exactly zero.

Replace the diamond with the circle and the argument collapses. At every point of a smooth boundary the normal cone is a single ray, so each contact point corresponds to essentially one gradient direction, and the set of directions producing an exact zero has measure zero. $$L^2$$ shrinks coefficients towards zero; it does not put them there.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="nb-title nb-desc" viewBox="0 0 640 215" style="max-width:640px;width:100%;height:auto">
  <title id="nb-title">Unit balls of the L1, L2 and L-infinity norms, and why the L1 constraint yields a zero coefficient</title>
  <desc id="nb-desc">Left panel: three nested unit balls sharing a centre — an orange diamond with vertices at plus and minus one on each axis (L1), a teal circle of radius one (L2), and a dark grey square from minus one to one on both axes (L-infinity). All three pass through the points (1,0) and (0,1). Right panel: the same orange diamond with circular loss contours centred at a least-squares optimum up and to the right of it. The contours grow until the first one touches the diamond, and the touching point is the top corner, where the first coordinate is exactly zero.</desc>
  <rect x="1" y="1" width="638" height="213" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <g stroke="#cbd5e1" stroke-width="1">
    <line x1="75" y1="105" x2="225" y2="105"/><line x1="150" y1="30" x2="150" y2="180"/>
    <line x1="400" y1="137" x2="548" y2="137"/><line x1="470" y1="22" x2="470" y2="195"/>
  </g>

  <rect x="95" y="50" width="110" height="110" fill="none" stroke="#334155" stroke-width="1.8"/>
  <circle cx="150" cy="105" r="55" fill="none" stroke="#0e7490" stroke-width="1.8"/>
  <polygon points="205,105 150,50 95,105 150,160" fill="none" stroke="#c2410c" stroke-width="2"/>
  <circle cx="205" cy="105" r="2.6" fill="#334155"/><circle cx="150" cy="50" r="2.6" fill="#334155"/>

  <g font-size="9.5" fill="#475569">
    <line x1="60" y1="196" x2="80" y2="196" stroke="#c2410c" stroke-width="2"/><text x="85" y="199">L¹ (diamond)</text>
    <line x1="152" y1="196" x2="172" y2="196" stroke="#0e7490" stroke-width="1.8"/><text x="177" y="199">L²</text>
    <line x1="200" y1="196" x2="220" y2="196" stroke="#334155" stroke-width="1.8"/><text x="225" y="199">L∞</text>
  </g>

  <polygon points="515,137 470,92 425,137 470,182" fill="none" stroke="#c2410c" stroke-width="2"/>
  <circle cx="485" cy="62" r="33.54" fill="none" stroke="#0e7490" stroke-width="1.8"/>
  <circle cx="485" cy="62" r="16" fill="none" stroke="#0e7490" stroke-width="1.2" stroke-dasharray="3 3"/>
  <circle cx="485" cy="62" r="2.8" fill="#0e7490"/>
  <circle cx="470" cy="92" r="3.4" fill="#c2410c"/>
  <text x="497" y="59" font-size="9.5" fill="#0e7490">least-squares optimum</text>
  <text x="445" y="103" text-anchor="end" font-size="9.5" fill="#c2410c">first contact is a corner</text>
  <text x="445" y="116" text-anchor="end" font-size="9.5" fill="#c2410c">so w₁ = 0 exactly</text>
  <text x="553" y="141" font-size="9.5" fill="#475569">w₁</text>
  <text x="476" y="20" font-size="9.5" fill="#475569">w₂</text>
</svg>
<figcaption>Notice that the corner is reached for a whole wedge of possible optimum locations, not one special one. Swap the diamond for the circle and every contact point becomes a single isolated case — which is why L² shrinks but never zeroes.</figcaption>
</figure>
</div>

## Matrix norms

An **induced** (operator) norm asks how much a matrix can stretch a vector:

<div class="formula-box">
\[
\lVert A\rVert_p = \sup_{x \ne 0} \frac{\lVert Ax\rVert_p}{\lVert x\rVert_p} .
\]
</div>

Three of them are computable in closed form: $$\lVert A\rVert_2 = \sigma_{\max}$$, the largest [singular value](/blog/math-basics/eigen-and-svd/); $$\lVert A\rVert_1$$ is the largest absolute column sum; $$\lVert A\rVert_\infty$$ is the largest absolute row sum. Induced norms are submultiplicative, $$\lVert AB\rVert \le \lVert A\rVert\lVert B\rVert$$, and satisfy $$\lVert I\rVert = 1$$ by construction.

The **Frobenius** norm treats the matrix as a long vector, $$\lVert A\rVert_F = \sqrt{\sum_{ij}a_{ij}^2} = \sqrt{\operatorname{tr}(A^\top A)} = \sqrt{\sum_i \sigma_i^2}$$. It is submultiplicative but *not* induced by any vector norm — the giveaway is $$\lVert I_n\rVert_F = \sqrt{n} \ne 1$$.

Taking $$A = \begin{pmatrix} 3 & 0\\ 4 & 5\end{pmatrix}$$ from the SVD post, whose singular values are $$3\sqrt5$$ and $$\sqrt5$$:

| Norm | Value |
|---|---|
| $$\lVert A\rVert_1$$ (max column sum) | $$\max(7, 5) = 7$$ |
| $$\lVert A\rVert_\infty$$ (max row sum) | $$\max(3, 9) = 9$$ |
| $$\lVert A\rVert_2 = \sigma_{\max}$$ | $$3\sqrt5 \approx 6.708$$ |
| $$\lVert A\rVert_F$$ | $$\sqrt{50} \approx 7.071$$ |

Note $$\lVert A\rVert_2 \le \lVert A\rVert_F$$ always, since $$\sigma_{\max}^2 \le \sum_i\sigma_i^2$$.

## Inner products, orthogonality, Cauchy–Schwarz

The Euclidean inner product $$\langle x,y\rangle = x^\top y$$ adds angle to length. Vectors are orthogonal when $$\langle x,y\rangle = 0$$, and **Cauchy–Schwarz** bounds the overlap:

<div class="formula-box">
\[
\lvert\langle x, y\rangle\rvert \le \lVert x\rVert_2 \,\lVert y\rVert_2,
\]
</div>

with equality if and only if the vectors are parallel. This is what makes $$\cos\theta = \langle x,y\rangle/(\lVert x\rVert\lVert y\rVert)$$ well defined in $$[-1,1]$$, and it is also the inequality that proves the gradient is the [steepest-ascent direction](/blog/math-basics/derivatives-and-gradients/).

## Cosine or Euclidean?

Expand the squared distance:

<div class="formula-box">
\[
\lVert x - y\rVert_2^2 = \lVert x\rVert_2^2 + \lVert y\rVert_2^2 - 2\lVert x\rVert_2\lVert y\rVert_2\cos\theta .
\]
</div>

If both vectors are $$L^2$$-normalised this collapses to $$2 - 2\cos\theta$$, a strictly decreasing function of the cosine. On the unit sphere the two measures are therefore *rank-equivalent*: nearest neighbours by cosine and by Euclidean distance are the same set, in the same order. Arguing about which to use for normalised embeddings is arguing about nothing.

They diverge when magnitude carries meaning. Cosine discards it: $$(1,1)$$ and $$(100,100)$$ are identical. Use cosine when direction is the signal and norm is an artefact — word embeddings, where norm tracks token frequency, or document term vectors of wildly different lengths. Use Euclidean when magnitude is part of the data: physical coordinates, k-means centroids, any regression target space.

<div class="insight-box">
  <strong>Key Insight — choosing a norm is choosing a geometry, and the geometry chooses the answer:</strong> the same optimisation problem gives dense solutions under \(L^2\), sparse ones under \(L^1\), and equal-magnitude ones under \(L^\infty\), purely because of the shape of the ball. The same logic reappears in optimisation: \(\lVert v\rVert_2 \le 1\) makes steepest descent follow the gradient, while \(\lVert v\rVert_\infty \le 1\) makes it follow \(\operatorname{sign}(\nabla f)\).
</div>

<div class="warning-box">
  <strong>Interview trap — the Frobenius norm is not the spectral norm.</strong> \(\lVert A\rVert_F = \sqrt{\sum_i \sigma_i^2}\) and \(\lVert A\rVert_2 = \sigma_{\max}\); they agree only for rank-one matrices. A second trap: \(\lVert A\rVert_2\) is the largest <em>singular</em> value, not the largest eigenvalue or the largest entry. And a third: cosine similarity is not a metric — it violates the triangle inequality, which is why libraries convert it to \(1 - \cos\theta\) or to Euclidean distance on normalised vectors before building any index that assumes metric structure.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>\(L^p\) requires \(p \ge 1\) for the triangle inequality; \(\lVert x\rVert_\infty \le \lVert x\rVert_2 \le \lVert x\rVert_1\) always.</li>
    <li>The \(L^1\) ball is a diamond whose extreme points sit on the axes; a corner's normal cone is full-dimensional, so constrained optima land there and coefficients become exactly zero.</li>
    <li>\(\lVert A\rVert_2 = \sigma_{\max}\), \(\lVert A\rVert_1\) is the max column sum, \(\lVert A\rVert_\infty\) the max row sum, and \(\lVert A\rVert_F = \sqrt{\sum_i\sigma_i^2}\) is not an induced norm.</li>
    <li>Cauchy–Schwarz, \(\lvert\langle x,y\rangle\rvert \le \lVert x\rVert\lVert y\rVert\), makes cosine similarity well defined and proves steepest ascent.</li>
    <li>On unit-norm vectors, \(\lVert x-y\rVert^2 = 2 - 2\cos\theta\), so cosine and Euclidean rank identically; they differ only when magnitude is informative.</li>
  </ul>
</div>

## References

1. Boyd, S., & Vandenberghe, L. [*Convex Optimization*](https://web.stanford.edu/~boyd/cvxbook/), §A.1.2 and §6.3. Cambridge University Press, 2004.
2. Tibshirani, R. [Regression Shrinkage and Selection via the Lasso](https://doi.org/10.1111/j.2517-6161.1996.tb02080.x). *JRSS-B* 58(1), 267–288, 1996.
3. Horn, R. A., & Johnson, C. R. *Matrix Analysis*, 2nd ed., ch. 5. Cambridge University Press, 2012.
4. Golub, G. H., & Van Loan, C. F. *Matrix Computations*, 4th ed., §2.3. Johns Hopkins University Press, 2013.
5. Hastie, T., Tibshirani, R., & Wainwright, M. [*Statistical Learning with Sparsity*](https://hastie.su.domains/StatLearnSparsity/). CRC Press, 2015.
