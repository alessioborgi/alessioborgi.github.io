---
layout: single
title: "Euclidean Space: Inner Products, Projections and the Margin"
date: 2026-09-02
categories: [geometry-basics]
book: geometry-basics
subsection: foundations
tags: [linear-algebra, projections, svm, geometry]
excerpt: "One bilinear form generates the whole of flat geometry: lengths, angles, orthogonality, projections and the distance from a point to a hyperplane. Get the projection formula and you get the SVM margin for free."
author_profile: true
read_time: true
is_overview: false
icon: "📏"
read_mins: 6
permalink: /blog/geometry-basics/euclidean-spaces/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Everything in Euclidean geometry descends from the inner product. The norm is \(\lVert x\rVert=\sqrt{\langle x,x\rangle}\), the angle is defined by \(\cos\theta = \langle x,y\rangle/(\lVert x\rVert\lVert y\rVert)\), and orthogonality is \(\langle x,y\rangle = 0\). Projecting \(x\) onto a direction \(u\) means choosing the coefficient that minimises the residual, which gives \(\langle x,u\rangle u/\lVert u\rVert^2\) and leaves a residual orthogonal to \(u\). Apply that to a hyperplane \(\mathbf{w}^\top x + b = 0\) and the distance from any point is \(\lvert \mathbf{w}^\top x_0 + b\rvert / \lVert \mathbf{w}\rVert\) — which is the quantity an SVM maximises.
</div>

## The one structure everything else comes from

A vector space on its own has no lengths and no angles; it only knows about addition and scaling. Add an inner product $$\langle \cdot,\cdot\rangle$$ — bilinear, symmetric, and positive definite ($$\langle x,x\rangle > 0$$ for $$x \neq 0$$) — and geometry appears. In $$\mathbb{R}^n$$ the standard choice is $$\langle x,y\rangle = x^\top y$$, and the norm it induces is

<div class="formula-box">
\[
\lVert x \rVert = \sqrt{\langle x, x\rangle} = \sqrt{\textstyle\sum_i x_i^2}.
\]
</div>

The Cauchy–Schwarz inequality $$\lvert\langle x,y\rangle\rvert \le \lVert x\rVert\,\lVert y\rVert$$ guarantees that the ratio $$\langle x,y\rangle/(\lVert x\rVert \lVert y\rVert)$$ always lies in $$[-1,1]$$, so it is legitimate to *define* the angle $$\theta$$ between two vectors by

<div class="formula-box">
\[
\cos\theta = \frac{\langle x, y\rangle}{\lVert x\rVert\,\lVert y\rVert}.
\]
</div>

That definition is cosine similarity. It is not an analogy to angles; it is the angle. Orthogonality, $$\langle x,y\rangle = 0$$, is the case $$\theta = 90^\circ$$.

## Projection, derived rather than quoted

Given $$x$$ and a nonzero direction $$u$$, which multiple of $$u$$ is closest to $$x$$? Minimise the squared residual over the scalar $$\alpha$$:

<div class="formula-box">
\[
\frac{d}{d\alpha}\,\lVert x - \alpha u\rVert^2
= \frac{d}{d\alpha}\left(\lVert x\rVert^2 - 2\alpha\langle x,u\rangle + \alpha^2\lVert u\rVert^2\right)
= -2\langle x,u\rangle + 2\alpha\lVert u\rVert^2 = 0 .
\]
</div>

So $$\alpha^\star = \langle x,u\rangle/\lVert u\rVert^2$$ and the projection is $$\mathrm{proj}_u(x) = \frac{\langle x,u\rangle}{\lVert u\rVert^2}\,u$$. The residual is automatically orthogonal to $$u$$, since $$\langle x - \alpha^\star u,\ u\rangle = \langle x,u\rangle - \alpha^\star\lVert u\rVert^2 = 0$$. Least squares is this same argument in higher dimensions: the fitted values are the projection of $$y$$ onto the column space of the design matrix, and the residual vector is orthogonal to every regressor.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="euc-proj-title euc-proj-desc" viewBox="0 0 470 285" style="max-width:470px;width:100%;height:auto">
  <title id="euc-proj-title">Projection of a vector onto a line, with orthogonal residual</title>
  <desc id="euc-proj-desc">A two-dimensional plot. The vector x equals (3, 4) is drawn from the origin. A line through the origin spans the direction u equals (1, 1). The projection of x onto that line lands at the point (3.5, 3.5), and the dashed residual from (3.5, 3.5) back to (3, 4) equals (minus 0.5, 0.5), meeting the line at a right angle. The angle between x and u is 8.13 degrees.</desc>
  <rect x="1" y="1" width="468" height="283" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g stroke="#cbd5e1" stroke-width="1">
    <line x1="60" y1="250" x2="440" y2="250"/>
    <line x1="60" y1="250" x2="60" y2="30"/>
  </g>
  <line x1="60" y1="250" x2="290" y2="20" stroke="#475569" stroke-width="1.3" stroke-dasharray="5 4"/>
  <text x="298" y="24" font-size="10.5" fill="#475569">span{u}, u = (1,1)</text>
  <line x1="60" y1="250" x2="186" y2="82" stroke="#c2410c" stroke-width="2.2"/>
  <circle cx="186" cy="82" r="3.4" fill="#c2410c"/>
  <text x="150" y="70" font-size="11" font-weight="700" fill="#c2410c">x = (3, 4)</text>
  <line x1="60" y1="250" x2="207" y2="103" stroke="#0e7490" stroke-width="3"/>
  <circle cx="207" cy="103" r="3.4" fill="#0e7490"/>
  <text x="216" y="128" font-size="11" font-weight="700" fill="#0e7490">proj = (3.5, 3.5)</text>
  <line x1="207" y1="103" x2="186" y2="82" stroke="#0c4a6e" stroke-width="1.8" stroke-dasharray="4 3"/>
  <path d="M207,103 L214.1,95.9 L207,88.9 L199.9,95.9 Z" fill="none" stroke="#0c4a6e" stroke-width="1.2"/>
  <text x="120" y="185" font-size="10.5" fill="#0c4a6e">residual (−0.5, 0.5) ⟂ u</text>
  <text x="86" y="222" font-size="10.5" fill="#334155">θ = 8.13°</text>
  <g font-size="9.5" fill="#475569">
    <text x="55" y="266">0</text>
    <text x="437" y="266">x₁</text>
    <text x="46" y="34">x₂</text>
  </g>
</svg>
<figcaption>Notice that the projection is the unique point on the line whose residual is perpendicular to it — that orthogonality <em>is</em> the optimality condition, not a coincidence of the picture.</figcaption>
</figure>
</div>

With $$x = (3,4)$$ and $$u = (1,1)$$: $$\langle x,u\rangle = 7$$, $$\lVert u\rVert^2 = 2$$, so $$\alpha^\star = 3.5$$ and the projection is $$(3.5, 3.5)$$. The residual $$(-0.5, 0.5)$$ has inner product $$-0.5 + 0.5 = 0$$ with $$u$$, as promised. The angle satisfies $$\cos\theta = 7/(5\sqrt{2}) = 0.98995$$, so $$\theta = 8.13^\circ$$.

## Orthonormal bases and Gram–Schmidt

A basis $$\\{q_1,\dots,q_n\\}$$ is orthonormal when $$\langle q_i,q_j\rangle = \delta_{ij}$$. It is the convenient case: coordinates are just inner products, $$x = \sum_i \langle x, q_i\rangle q_i$$, and lengths are preserved by Parseval, $$\lVert x\rVert^2 = \sum_i \langle x,q_i\rangle^2$$. Gram–Schmidt manufactures one from any basis $$\\{a_1,\dots,a_n\\}$$ by repeatedly subtracting off what is already explained:

<div class="formula-box">
\[
v_k = a_k - \sum_{j<k} \langle a_k, q_j\rangle\, q_j,
\qquad q_k = \frac{v_k}{\lVert v_k\rVert}.
\]
</div>

Each step is the projection formula applied and subtracted. In floating point, classical Gram–Schmidt loses orthogonality badly on ill-conditioned inputs; the modified variant, or a Householder QR, is what numerical libraries use.

## Hyperplanes and the margin

A hyperplane is the set $$H = \\{x : \mathbf{w}^\top x + b = 0\\}$$ with $$\mathbf{w} \neq 0$$. It is an $$(n{-}1)$$-dimensional affine subspace, and $$\mathbf{w}$$ is normal to it: for any $$x_1, x_2 \in H$$, $$\mathbf{w}^\top(x_1 - x_2) = 0$$. To find the distance from an arbitrary $$x_0$$, step from $$x_0$$ along $$\mathbf{w}$$ until you hit $$H$$. Write the foot as $$x_0 - t\mathbf{w}$$ and solve $$\mathbf{w}^\top(x_0 - t\mathbf{w}) + b = 0$$, giving $$t = (\mathbf{w}^\top x_0 + b)/\lVert \mathbf{w}\rVert^2$$. The distance is $$\lVert t\mathbf{w}\rVert$$:

<div class="formula-box">
\[
d(x_0, H) = \frac{\lvert \mathbf{w}^\top x_0 + b\rvert}{\lVert \mathbf{w}\rVert}.
\]
</div>

Take $$\mathbf{w} = (2,1)$$, $$b = -4$$ and $$x_0 = (3,3)$$: the numerator is $$\lvert 6 + 3 - 4\rvert = 5$$ and $$\lVert\mathbf{w}\rVert = \sqrt 5$$, so the distance is exactly $$\sqrt 5 \approx 2.236$$.

<div class="insight-box">
  <strong>Key Insight — where the SVM's \(2/\lVert \mathbf{w}\rVert\) comes from:</strong> the pair \((\mathbf{w}, b)\) is over-parameterised, since scaling both by \(c>0\) leaves the hyperplane unchanged. The hard-margin SVM removes that freedom by <em>fixing the scale</em> with the constraints \(y_i(\mathbf{w}^\top x_i + b)\ge 1\), so the closest points sit at \(\lvert \mathbf{w}^\top x + b\rvert = 1\). By the distance formula they are \(1/\lVert\mathbf{w}\rVert\) away, the two margins are \(2/\lVert\mathbf{w}\rVert\) apart, and maximising the margin becomes minimising \(\lVert\mathbf{w}\rVert^2\). The quadratic objective is not a modelling choice — it is the distance formula in disguise.
</div>

## What this means for a trained classifier

The last layer of a neural classifier is a set of hyperplanes, one per class in the binary-versus-rest reading. The logit $$\mathbf{w}_c^\top h + b_c$$ is a *signed*, unnormalised distance from the penultimate feature $$h$$ to class $$c$$'s boundary; dividing by $$\lVert \mathbf{w}_c\rVert$$ turns it into an actual distance. This is why logit magnitudes are not comparable across classes with differently scaled weight vectors, and why weight normalisation and cosine-softmax variants exist at all.

<div class="warning-box">
  <strong>Interview trap:</strong> the formula \(\lvert\mathbf{w}^\top x_0 + b\rvert/\lVert\mathbf{w}\rVert\) is a distance only in the norm induced by the inner product you used. Under a different metric — a Mahalanobis inner product \(\langle x,y\rangle_A = x^\top A y\) with \(A \succ 0\), say — orthogonality, angles and the closest point on \(H\) all change. "Perpendicular" is a statement about a chosen inner product, never about the coordinates on the page.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Norm, angle and orthogonality are all defined from the inner product; change the inner product and all three change.</li>
    <li>\(\mathrm{proj}_u(x) = \frac{\langle x,u\rangle}{\lVert u\rVert^2}u\), derived by minimising \(\lVert x - \alpha u\rVert^2\); the residual is orthogonal to \(u\) by construction. Least squares is the same statement in matrix form.</li>
    <li>Gram–Schmidt is repeated projection-and-subtract; use the modified version or QR in floating point.</li>
    <li>Distance from \(x_0\) to \(\{\mathbf{w}^\top x + b = 0\}\) is \(\lvert\mathbf{w}^\top x_0 + b\rvert/\lVert\mathbf{w}\rVert\). Fixing the scale with \(y_i(\mathbf{w}^\top x_i + b)\ge 1\) turns margin maximisation into minimising \(\lVert\mathbf{w}\rVert^2\).</li>
  </ul>
</div>

Next: what happens when you *move* these vectors around — see [linear transformations](/blog/geometry-basics/linear-transformations/).

## References

1. Boyd, S., & Vandenberghe, L. [Convex Optimization](https://web.stanford.edu/~boyd/cvxbook/). Cambridge University Press, 2004.
2. Cortes, C., & Vapnik, V. [Support-Vector Networks](https://doi.org/10.1007/BF00994018). *Machine Learning*, 20(3), 1995.
3. Trefethen, L. N., & Bau, D. *Numerical Linear Algebra*. SIAM, 1997.
