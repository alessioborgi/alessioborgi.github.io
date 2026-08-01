---
layout: single
title: "Support Vector Machines: Margins and the Kernel Trick"
date: 2026-05-08
categories: [basics]
book: basics
subsection: supervised
tags: [svm, kernel-trick, margin, rbf, classification]
published: true
is_overview: false
excerpt: "Among all the hyperplanes that separate two classes, one sits furthest from both. Finding it turns out to depend on the data only through inner products — and that single fact is what lets you work in a space you never build."
author_profile: true
read_time: true
icon: "📐"
read_mins: 8
permalink: /blog/basics/svm-and-kernels/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> If two classes can be separated by a straight line, infinitely many lines will do it. The SVM picks the one with the widest empty corridor around it, which turns out to depend on only a handful of points — the support vectors. Solving it reveals that both the fit and the prediction touch the data <em>only</em> through inner products \(x_i^\top x_j\). Replace that inner product with a kernel and you are working in a much larger feature space without ever constructing it.
</div>

## Which separating line?

Take two classes that a straight line can separate. There is not one such line; there is a continuum of them, and some are visibly worse than others — a line that shaves past a training point will misclassify the next sample drawn from near it.

The support vector machine makes the choice precise: **pick the hyperplane whose distance to the nearest point of either class is as large as possible.**

Write the hyperplane as $$w^\top x + b = 0$$. The signed distance from a point $$x_i$$ to it is $$(w^\top x_i + b)/\lVert w \rVert$$. This is over-parameterised — scaling $$w$$ and $$b$$ together changes nothing geometrically — so fix the scale by demanding that the closest points satisfy $$\lvert w^\top x_i + b \rvert = 1$$. With that convention the two margin boundaries are $$w^\top x + b = \pm 1$$, the distance between them is $$2/\lVert w \rVert$$, and the problem becomes:

<div class="formula-box">
\[
\min_{w,\,b} \ \tfrac{1}{2}\lVert w \rVert^2
\quad \text{subject to} \quad
y_i\bigl(w^\top x_i + b\bigr) \ \ge\ 1 \quad \text{for all } i .
\]
</div>

Maximising the margin and minimising $$\lVert w \rVert^2$$ are the same thing. This is a convex quadratic programme, so it has a unique solution and no local minima to worry about.

## A worked example you can check

Six points in the plane. Class $$+1$$ at $$(2,1)$$, $$(2,3)$$, $$(3,2)$$; class $$-1$$ at $$(0,1)$$, $$(0,3)$$, $$(-1,2)$$.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 268" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="svm-title svm-desc" style="width:100%;max-width:520px;height:auto;font-family:sans-serif">
  <title id="svm-title">Maximum-margin hyperplane with four support vectors</title>
  <desc id="svm-desc">Two classes separated by a vertical line at x equals one. The margin band runs from x equals zero to x equals two. Four points lie exactly on the band edges and are the support vectors; two further points sit outside it and do not affect the solution.</desc>
  <rect width="520" height="268" fill="#f8fafc" rx="10"/>
  <text x="260" y="22" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">The widest empty corridor</text>

  <rect x="150" y="52" width="180" height="182" fill="#0d9488" opacity="0.08"/>
  <line x1="150" y1="52" x2="150" y2="234" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="5 3"/>
  <line x1="330" y1="52" x2="330" y2="234" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="5 3"/>
  <line x1="240" y1="46" x2="240" y2="240" stroke="#0f172a" stroke-width="2.5"/>

  <circle cx="330" cy="200" r="17" fill="none" stroke="#ea580c" stroke-width="2.5"/>
  <circle cx="330" cy="90"  r="17" fill="none" stroke="#ea580c" stroke-width="2.5"/>
  <circle cx="150" cy="200" r="17" fill="none" stroke="#2563eb" stroke-width="2.5"/>
  <circle cx="150" cy="90"  r="17" fill="none" stroke="#2563eb" stroke-width="2.5"/>

  <circle cx="330" cy="200" r="8" fill="#ea580c"/>
  <circle cx="330" cy="90"  r="8" fill="#ea580c"/>
  <circle cx="420" cy="145" r="8" fill="#ea580c"/>
  <circle cx="150" cy="200" r="8" fill="#2563eb"/>
  <circle cx="150" cy="90"  r="8" fill="#2563eb"/>
  <circle cx="60"  cy="145" r="8" fill="#2563eb"/>

  <text x="345" y="204" font-size="8.5" fill="#9a3412">(2,1)</text>
  <text x="345" y="86"  font-size="8.5" fill="#9a3412">(2,3)</text>
  <text x="434" y="149" font-size="8.5" fill="#9a3412">(3,2)</text>
  <text x="108" y="204" font-size="8.5" fill="#1d4ed8">(0,1)</text>
  <text x="108" y="86"  font-size="8.5" fill="#1d4ed8">(0,3)</text>
  <text x="18"  y="149" font-size="8.5" fill="#1d4ed8">(−1,2)</text>

  <text x="240" y="256" text-anchor="middle" font-size="9" fill="#334155">margin = 2 · circled points are the support vectors</text>
  <text x="240" y="42"  text-anchor="middle" font-size="8.5" fill="#475569">w = (1, 0), b = −1</text>
</svg>
<figcaption>The maximum-margin solution is the vertical line at x = 1, giving a corridor of width 2. Four points sit exactly on its edges; the two outermost points are irrelevant to the solution.</figcaption>
</figure>
</div>

Take $$w = (1,0)$$ and $$b = -1$$, so the hyperplane is $$x_1 = 1$$. Evaluating $$y_i(w^\top x_i + b)$$ at each point:

| Point | Class | $$y_i(w^\top x_i + b)$$ | |
|---|---|---|---|
| $$(2,1)$$ | $$+1$$ | $$+1$$ | support vector |
| $$(2,3)$$ | $$+1$$ | $$+1$$ | support vector |
| $$(3,2)$$ | $$+1$$ | $$+2$$ | |
| $$(0,1)$$ | $$-1$$ | $$+1$$ | support vector |
| $$(0,3)$$ | $$-1$$ | $$+1$$ | support vector |
| $$(-1,2)$$ | $$-1$$ | $$+2$$ | |

Every constraint holds, four of them with equality, and $$\lVert w \rVert = 1$$ gives a margin of $$2/1 = 2$$. A brute-force search over separating directions confirms nothing beats it.

<div class="insight-box">
<strong>The property the name refers to.</strong> Delete \((3,2)\) and \((-1,2)\) and re-solve: you get exactly the same hyperplane and exactly the same margin. Only the points touching the margin constrain the answer. Everything else could be moved freely — as long as it stays outside the corridor — without changing a thing. Those touching points are the <strong>support vectors</strong>, and there are usually far fewer of them than there are training examples.
</div>

## Soft margins, for data that is not separable

Real data overlaps, and then no $$w$$ satisfies every constraint. Introduce a slack $$\xi_i \ge 0$$ per point measuring how far it intrudes:

<div class="formula-box">
\[
\min_{w,\,b,\,\xi} \ \tfrac{1}{2}\lVert w \rVert^2 + C\sum_i \xi_i
\quad \text{subject to} \quad
y_i\bigl(w^\top x_i + b\bigr) \ \ge\ 1 - \xi_i, \quad \xi_i \ge 0 .
\]
</div>

$$C$$ sets the exchange rate between a wide margin and a clean fit. Large $$C$$ punishes violations heavily and drives the model towards the separable solution, narrowing the margin and increasing variance. Small $$C$$ tolerates intrusions and buys a wider, steadier corridor. It is a regularisation parameter in the sense the [bias–variance chapter](/blog/basics/bias-variance-and-regularisation/) describes, and it must be tuned rather than guessed.

## The one fact everything else rests on

Solve the problem through its Lagrangian dual and the solution takes the form

<div class="formula-box">
\[
w = \sum_i \alpha_i y_i x_i ,
\qquad
f(x) = \sum_i \alpha_i y_i \, x_i^\top x + b ,
\]
</div>

with $$\alpha_i \ge 0$$ and — this is the same observation as before, now falling out of the algebra — $$\alpha_i = 0$$ for every point that is not a support vector.

Look at what $$f$$ actually touches. Not the coordinates of $$x$$. Only the **inner product** between $$x$$ and each support vector. The training problem has the same character: the dual objective involves the data solely through the pairwise products $$x_i^\top x_j$$.

<div class="insight-box">
<strong>So the coordinates were never needed.</strong> If an algorithm reads the data only through inner products, you can hand it a different inner product and it will not notice. That is the whole idea. You do not need to know where the points are in some enormous feature space — you only need to know the angles and lengths between them there.
</div>

## The kernel trick, made concrete

Define $$k(x,z) = (x^\top z)^2$$ for $$x, z \in \mathbb{R}^2$$ and expand it:

<div class="formula-box">
\[
\begin{aligned}
(x^\top z)^2 &= (x_1 z_1 + x_2 z_2)^2 \\[3pt]
&= x_1^2 z_1^2 + 2 x_1 z_1 x_2 z_2 + x_2^2 z_2^2 \\[3pt]
&= \bigl(x_1^2,\ \sqrt{2}\,x_1 x_2,\ x_2^2\bigr) \cdot \bigl(z_1^2,\ \sqrt{2}\,z_1 z_2,\ z_2^2\bigr).
\end{aligned}
\]
</div>

The right-hand side is an inner product of two explicit three-dimensional vectors. So with $$\varphi(x) = (x_1^2, \sqrt{2}x_1x_2, x_2^2)$$ we have $$k(x,z) = \varphi(x)^\top \varphi(z)$$ exactly.

Check it on $$x = (1,2)$$ and $$z = (3,-1)$$. Directly, $$x^\top z = 3 - 2 = 1$$, so $$k = 1$$. Through the feature map, $$\varphi(x) = (1,\ 2\sqrt{2},\ 4)$$ and $$\varphi(z) = (9,\ -3\sqrt{2},\ 1)$$, giving $$9 - 12 + 4 = 1$$. The same.

That is the trick in full. Computing $$k$$ costs one two-dimensional dot product and a squaring. Computing $$\varphi(x)^\top\varphi(z)$$ the honest way costs building two three-dimensional vectors first. Here the saving is trivial; for a degree-$$d$$ polynomial kernel in $$n$$ dimensions the feature space has $$\binom{n+d-1}{d}$$ coordinates and the saving is the difference between possible and impossible.

The decision function becomes

<div class="formula-box">
\[
f(x) = \sum_{i \in \text{SV}} \alpha_i y_i \, k(x_i, x) + b .
\]
</div>

**Common kernels.** The linear kernel $$k(x,z) = x^\top z$$ recovers the plain SVM. The polynomial kernel $$(x^\top z + c)^d$$ gives all monomials up to degree $$d$$. The RBF kernel $$k(x,z) = \exp(-\gamma \lVert x - z \rVert^2)$$ corresponds to an infinite-dimensional feature space — which is only usable *because* you never construct it. Its $$\gamma$$ controls locality: large $$\gamma$$ makes each support vector's influence decay quickly, giving a wiggly boundary that can overfit; small $$\gamma$$ approaches a linear fit.

<div class="warning-box">
<strong>Not every function is a kernel.</strong> \(k\) must be symmetric and positive semi-definite — every Gram matrix \(K_{ij} = k(x_i, x_j)\) it produces must be PSD. That condition is what guarantees a feature space exists, and it is what keeps the optimisation convex. Invent a similarity function that violates it and the "kernel" SVM you get is solving a different, possibly non-convex problem.
</div>

## What SVMs do not buy you

**They do not scale.** Training involves the $$n \times n$$ Gram matrix, so cost grows roughly quadratically to cubically in the number of training points and memory quadratically. Past the order of $$10^5$$ samples this is the binding constraint, and it is the main reason SVMs receded as datasets grew.

**They do not give probabilities.** The output $$f(x)$$ is a signed distance, not a likelihood. Converting it to a probability requires a separate calibration step fitted on held-out data, and the result is a retrofit rather than something the model estimated.

**Kernel choice is a real decision.** With an RBF kernel you are tuning $$C$$ and $$\gamma$$ together over a 2-D grid, and the result is genuinely sensitive to both. There is no principled default.

**They stop being interpretable once kernelised.** A linear SVM has a weight vector you can read. An RBF SVM has a set of support vectors and coefficients, and no accessible statement about which features mattered.

**They need scaled features.** The margin is measured with a Euclidean norm, so a feature in millimetres will dominate one in metres for no good reason. Standardise first.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Among the infinitely many separating hyperplanes, the SVM takes the one maximising the corridor width \(2/\lVert w \rVert\) — which makes it the minimiser of \(\lVert w \rVert^2\) under margin constraints.</li>
  <li>Only the points touching the margin matter. Deleting the rest changes nothing, which is what "support vector" means and why the solution is sparse.</li>
  <li>The soft margin adds slack variables and the parameter \(C\), trading margin width against violations — a regularisation knob, not a convenience.</li>
  <li>Both the training problem and the prediction touch the data only through inner products. That is the fact the kernel trick exploits.</li>
  <li>\((x^\top z)^2\) in 2-D is <em>exactly</em> an inner product of explicit 3-D feature vectors — expand it and see. RBF does the same thing into an infinite-dimensional space you never build.</li>
  <li>The costs are real: quadratic-to-cubic training, no native probabilities, two coupled hyperparameters, and no interpretability once kernelised.</li>
</ul>
</div>
