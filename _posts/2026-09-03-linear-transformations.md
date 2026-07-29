---
layout: single
title: "Linear Maps as Geometry: Rotate, Scale, Rotate"
date: 2026-09-03
categories: [geometry-basics]
book: geometry-basics
subsection: foundations
tags: [linear-algebra, svd, determinant, transformations]
excerpt: "A matrix is not a table of numbers, it is a deformation of space. The SVD says every deformation is the same three moves in sequence: rotate, stretch along axes, rotate again."
author_profile: true
read_time: true
is_overview: false
icon: "🔄"
read_mins: 7
permalink: /blog/geometry-basics/linear-transformations/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Read matrices as motions. Orthogonal matrices are exactly the linear maps that preserve all lengths and angles — rotations when \(\det = +1\), reflections when \(\det = -1\). The determinant is the signed factor by which volumes change, so its magnitude measures expansion and its sign records whether orientation flipped. Every linear map whatsoever factors as \(A = U\Sigma V^\top\): rotate/reflect, scale along the axes by the singular values, rotate/reflect again. Affine maps add a translation and are the ones that actually appear in a neural network layer.
</div>

## Reading a matrix as a motion

A linear map $$T:\mathbb{R}^n\to\mathbb{R}^m$$ satisfies $$T(\alpha x + \beta y) = \alpha T(x) + \beta T(y)$$, and once you fix bases it is a matrix. Its columns are the images of the basis vectors, which is the fastest way to see what a small matrix does: apply it to $$e_1$$ and $$e_2$$ and look at where they land.

The four motions worth having memorised in $$\mathbb{R}^2$$:

| Map | Matrix | $$\det$$ | Effect |
|---|---|---|---|
| Rotation by $$\theta$$ | $$\begin{pmatrix}\cos\theta & -\sin\theta\\\\ \sin\theta & \cos\theta\end{pmatrix}$$ | $$+1$$ | lengths, angles, orientation preserved |
| Reflection in the line at angle $$\theta$$ | $$\begin{pmatrix}\cos 2\theta & \sin 2\theta\\\\ \sin 2\theta & -\cos 2\theta\end{pmatrix}$$ | $$-1$$ | lengths preserved, orientation flipped |
| Scaling | $$\mathrm{diag}(s_1, s_2)$$ | $$s_1 s_2$$ | axis-aligned stretch |
| Shear | $$\begin{pmatrix}1 & k\\\\ 0 & 1\end{pmatrix}$$ | $$1$$ | area preserved, angles destroyed |

The shear is the instructive one. It has determinant $$1$$, so it preserves area, yet it distorts every angle in the plane and turns the unit circle into a tilted ellipse. Volume preservation and shape preservation are unrelated properties.

## Orthogonal matrices are the rigid motions

$$Q$$ is orthogonal when $$Q^\top Q = I$$. That single condition is equivalent to preserving the inner product:

<div class="formula-box">
\[
\langle Qx, Qy\rangle = (Qx)^\top(Qy) = x^\top Q^\top Q\, y = x^\top y = \langle x,y\rangle .
\]
</div>

Preserving inner products means preserving norms ($$y = x$$) and therefore all distances, and preserving angles because both the numerator and denominator of $$\cos\theta$$ are unchanged. So orthogonal matrices are precisely the linear isometries: the rigid motions that fix the origin. Since $$\det(Q^\top Q) = (\det Q)^2 = 1$$, we get $$\det Q = \pm 1$$, and the two cases are rotations ($$+1$$, the group $$SO(n)$$) and orientation-reversing reflections ($$-1$$).

This is why orthogonal or unitary weight matrices are attractive in deep nets: they cannot amplify or shrink a signal, so gradients neither explode nor vanish through them.

## The determinant is a volume

For a linear map $$A$$ and any measurable set $$S$$,

<div class="formula-box">
\[
\mathrm{vol}(A(S)) = \lvert \det A\rvert \cdot \mathrm{vol}(S).
\]
</div>

$$\det A = 0$$ means the image is squashed into a lower-dimensional subspace and volume vanishes — the map is not invertible. The *sign* records orientation: a positive determinant preserves handedness, a negative one turns a right-handed frame into a left-handed one.

<div class="warning-box">
  <strong>Interview trap:</strong> "the sign of the determinant does not matter, only the magnitude." It matters. \(\det = -1\) is the difference between a rotation and a reflection, and reflections are not reachable by any continuous rotation — \(SO(n)\) is a separate connected component from the reflections. In practice this is why a normalising flow tracks \(\log\lvert\det J\rvert\) (the sign cancels in the density, which uses the absolute value) but a 3D pose estimator must not: predicting a matrix with \(\det = -1\) means you have produced a mirror-image molecule or a left-handed coordinate frame, which is a real error, not a rounding artefact.
</div>

## SVD: every linear map is rotate–scale–rotate

The singular value decomposition says that for any real $$A \in \mathbb{R}^{m\times n}$$ there exist orthogonal $$U \in \mathbb{R}^{m\times m}$$, $$V\in\mathbb{R}^{n\times n}$$ and a nonnegative diagonal $$\Sigma$$ with

<div class="formula-box">
\[
A = U\Sigma V^\top,\qquad \sigma_1 \ge \sigma_2 \ge \dots \ge 0.
\]
</div>

Geometrically: $$V^\top$$ rotates (or reflects) the input so that the special directions line up with the axes, $$\Sigma$$ stretches each axis by its singular value, and $$U$$ rotates the result into place. The picture to keep is that $$A$$ maps the unit sphere to an ellipsoid whose semi-axes have lengths $$\sigma_i$$ and point along the columns of $$U$$. For a square matrix, $$\lvert\det A\rvert = \prod_i \sigma_i$$, since the two orthogonal factors contribute $$\pm 1$$ each.

Work it out for the shear $$A = \begin{pmatrix}1&1\\\\0&1\end{pmatrix}$$. Then $$A^\top A = \begin{pmatrix}1&1\\\\1&2\end{pmatrix}$$, whose characteristic polynomial is $$\lambda^2 - 3\lambda + 1$$, so $$\lambda = (3\pm\sqrt 5)/2 = 2.6180$$ and $$0.3820$$. The singular values are their square roots:

| Quantity | Value |
|---|---|
| $$\sigma_1$$ | $$1.6180$$ (the golden ratio $$\varphi$$) |
| $$\sigma_2$$ | $$0.6180 = 1/\varphi$$ |
| $$\sigma_1\sigma_2$$ | $$1.0000$$ |
| $$\det A$$ | $$1$$ |
| Most-stretched input direction | $$\propto (1,\ 1.618)$$, at $$58.28^\circ$$ |

A map that "preserves area" stretches one direction by $$62\%$$ and squeezes another by $$38\%$$. The condition number $$\sigma_1/\sigma_2 = 2.618$$ is what an optimiser actually feels, and the determinant tells you nothing about it.

<div class="insight-box">
  <strong>Key Insight — the determinant and the singular values answer different questions:</strong> \(\lvert\det A\rvert = \prod_i\sigma_i\) is a <em>product</em>, so a matrix with \(\sigma = (1000, 0.001)\) has determinant \(1\) and looks volume-neutral while being catastrophically ill-conditioned. Numerical stability, gradient scaling and effective rank are all governed by the individual \(\sigma_i\) — in particular by \(\sigma_1\) (the operator norm, the largest possible amplification) and \(\sigma_{\min}\). This is why spectral normalisation constrains \(\sigma_1\) and not the determinant.
</div>

## Affine versus linear

The layer you actually write is $$x \mapsto Wx + b$$, which is *affine*, not linear: it fails $$T(0) = 0$$ whenever $$b \neq 0$$. Affine maps preserve straight lines, parallelism, and ratios of lengths along a line, but not lengths, angles or the origin. Composing affine maps gives affine maps, which is why a network of affine layers with no nonlinearity collapses to a single affine map. The standard trick for handling them uniformly is homogeneous coordinates: append a $$1$$ to $$x$$ and use the $$(n{+}1)\times(n{+}1)$$ block matrix $$\begin{pmatrix}W & b\\\\ 0 & 1\end{pmatrix}$$, so translation becomes linear one dimension up. Graphics pipelines and $$SE(3)$$ pose representations both run on exactly this.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Orthogonal \(\Leftrightarrow\) \(Q^\top Q = I\) \(\Leftrightarrow\) preserves inner products \(\Leftrightarrow\) preserves all lengths and angles. \(\det = +1\) rotation, \(\det = -1\) reflection.</li>
    <li>\(\mathrm{vol}(A(S)) = \lvert\det A\rvert\,\mathrm{vol}(S)\); the sign records orientation, and orientation-reversal is a genuine physical distinction, not a bookkeeping detail.</li>
    <li>\(A = U\Sigma V^\top\): rotate, scale by \(\sigma_i\), rotate. The unit sphere becomes an ellipsoid with semi-axes \(\sigma_i\) along the columns of \(U\).</li>
    <li>\(\lvert\det A\rvert = \prod\sigma_i\), so determinant \(1\) is compatible with arbitrarily bad conditioning — shear is the standard counterexample.</li>
    <li>\(x\mapsto Wx+b\) is affine, not linear; homogeneous coordinates make it linear in one extra dimension.</li>
  </ul>
</div>

Flat space is now finished. [Curvature](/blog/geometry-basics/curvature/) asks what changes when the space itself bends; the algebraic side of the SVD — how it is computed and how it relates to eigendecomposition — sits in [eigenvalues and the SVD](/blog/math-basics/eigen-and-svd/).

## References

1. Strang, G. *Introduction to Linear Algebra*, 6th ed. Wellesley–Cambridge Press, 2023.
2. Trefethen, L. N., & Bau, D. *Numerical Linear Algebra*. SIAM, 1997.
3. Miyato, T., Kataoka, T., Koyama, M., & Yoshida, Y. [Spectral Normalization for Generative Adversarial Networks](https://arxiv.org/abs/1802.05957). *ICLR 2018*.
