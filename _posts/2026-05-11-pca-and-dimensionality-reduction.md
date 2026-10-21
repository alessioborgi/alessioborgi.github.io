---
layout: single
title: "PCA: Maximum Variance and Minimum Reconstruction Error"
date: 2026-05-11
categories: [basics]
book: basics
subsection: dimensionality-reduction
tags: [pca, dimensionality-reduction, svd, eigenvectors, tsne]
published: true
is_overview: false
excerpt: "PCA can be derived by asking for the directions of greatest spread, or by asking for the subspace that loses the least when you project onto it. The two questions look unrelated and have the same answer, which is the most useful thing to understand about it."
author_profile: true
read_time: true
icon: "📉"
read_mins: 11
permalink: /blog/basics/pca-and-dimensionality-reduction/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Principal component analysis finds an orthogonal set of directions ordered by how much of the data's variance each one carries. It answers two apparently different questions, "where is the data most spread out?" and "which subspace can I project onto while losing the least?", with the same eigenvectors. A direct SVD is a numerically robust way to compute it, and remember that it is a <em>linear</em> method: no amount of it will unroll a spiral.
</div>

## The same answer to two questions

**Question one: maximum variance.** Find the unit vector $$u$$ along which the projected data $$Xu$$ has the largest variance. That variance is $$u^\top \Sigma u$$ where $$\Sigma$$ is the covariance matrix, so you want

<div class="formula-box">
\[
\max_{\lVert u \rVert = 1} \ u^\top \Sigma u ,
\]
</div>

whose solution is the top eigenvector of $$\Sigma$$, with the maximum value equal to the top eigenvalue.

**Question two: minimum reconstruction error.** Find the $$k$$-dimensional subspace such that projecting the data onto it loses as little as possible in squared distance.

These sound like different problems. They are the same problem, and the reason is one line of Pythagoras. For a centred point $$x_i$$ and an orthogonal projection $$P$$,

<div class="formula-box">
\[
\underbrace{\lVert x_i \rVert^2}_{\text{fixed}} \;=\; \underbrace{\lVert P x_i \rVert^2}_{\text{variance kept}} \;+\; \underbrace{\lVert x_i - P x_i \rVert^2}_{\text{error}} .
\]
</div>

The left side does not depend on $$P$$. So maximising the first term on the right and minimising the second are the *same* optimisation, and they must select the same subspace.

<div class="insight-box">
<strong>Why this matters practically:</strong> it tells you what PCA is optimising when someone asks. It is not "finding meaningful structure" or "removing noise", it is minimising squared reconstruction error over linear subspaces. Everything PCA is good at, and everything it is bad at, follows from that being the objective.
</div>

## The mechanics, on numbers you can check

Take five points, already centred:

<div class="formula-box">
\[
X = \begin{pmatrix} -2 & -1 \\ -1 & -1 \\ 0 & 0 \\ 1 & 1 \\ 2 & 1 \end{pmatrix} .
\]
</div>

The covariance is $$\Sigma = \tfrac{1}{n-1}X^\top X$$ with $$n = 5$$:

<div class="formula-box">
\[
\Sigma = \tfrac{1}{4}\begin{pmatrix} 10 & 6 \\ 6 & 4 \end{pmatrix} = \begin{pmatrix} 2.5 & 1.5 \\ 1.5 & 1.0 \end{pmatrix} .
\]
</div>

For a $$2 \times 2$$ matrix the eigenvalues follow from the trace and determinant: $$\operatorname{tr}\Sigma = 3.5$$ and $$\det\Sigma = 2.5 - 2.25 = 0.25$$, so

<div class="formula-box">
\[
\lambda = \frac{7 \pm \sqrt{45}}{4}
\qquad\Longrightarrow\qquad
\lambda_1 = 3.4271, \quad \lambda_2 = 0.0729 .
\]
</div>

They sum to $$3.5$$, matching the trace, and multiply to $$0.25$$, matching the determinant. The first component carries $$3.4271/3.5 = 97.9\%$$ of the variance, and its eigenvector is $$u_1 \approx (0.851,\ 0.526)$$.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 262" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pca-title pca-desc" style="width:100%;max-width:520px;height:auto;font-family:sans-serif">
  <title id="pca-title">Five points with their two principal axes drawn to scale</title>
  <desc id="pca-desc">The first principal axis runs along the direction of greatest spread and is much longer than the second, whose length reflects that it carries only two per cent of the variance.</desc>
  <rect width="520" height="262" fill="#f8fafc" rx="10"/>
  <text x="260" y="22" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">Axis lengths are proportional to √λ</text>

  <line x1="80" y1="140" x2="440" y2="140" stroke="#cbd5e1" stroke-width="1"/>
  <line x1="260" y1="50" x2="260" y2="230" stroke="#cbd5e1" stroke-width="1"/>

  <line x1="148" y1="209" x2="372" y2="71" stroke="#0d9488" stroke-width="3"/>
  <line x1="250" y1="124" x2="270" y2="156" stroke="#ea580c" stroke-width="3"/>

  <circle cx="140" cy="200" r="7" fill="#334155"/>
  <circle cx="200" cy="200" r="7" fill="#334155"/>
  <circle cx="260" cy="140" r="7" fill="#334155"/>
  <circle cx="320" cy="80"  r="7" fill="#334155"/>
  <circle cx="380" cy="80"  r="7" fill="#334155"/>

  <text x="126" y="220" font-size="8.5" fill="#475569">(−2,−1)</text>
  <text x="188" y="220" font-size="8.5" fill="#475569">(−1,−1)</text>
  <text x="330" y="72"  font-size="8.5" fill="#475569">(1,1)</text>
  <text x="390" y="72"  font-size="8.5" fill="#475569">(2,1)</text>

  <text x="384" y="64" font-size="9.5" font-weight="700" fill="#0d9488">PC1, 97.9%</text>
  <text x="278" y="170" font-size="9.5" font-weight="700" fill="#ea580c">PC2, 2.1%</text>
  <text x="260" y="250" text-anchor="middle" font-size="8.5" fill="#475569">The second axis is genuinely that short; the ratio is √0.0729 to √3.4271.</text>
</svg>
<figcaption>The two principal axes of the worked example, drawn with lengths proportional to the square roots of their eigenvalues. PC2 is short because it is short, the drawing is not compressed for effect.</figcaption>
</figure>
</div>

Now check the equivalence claim numerically. Projecting onto $$u_1$$ alone leaves a total squared reconstruction error of $$0.2918$$. And $$(n-1)\lambda_2 = 4 \times 0.0729 = 0.2918$$. The variance you discard *is* the error you incur, exactly, not approximately.

## Compute the components with an SVD

Everything above is easier and better conditioned through the singular value decomposition $$X = U S V^\top$$. The right singular vectors are the principal directions, and the eigenvalues follow from the singular values:

<div class="formula-box">
\[
\lambda_i = \frac{s_i^2}{n-1} .
\]
</div>

On the example, $$s = (3.7025,\ 0.5402)$$, and $$s^2/4 = (3.4271,\ 0.0729)$$, the eigenvalues again.

<div class="warning-box">
<strong>Forming \(X^\top X\) squares the conditioning.</strong> The condition number of \(X^\top X\) is the square of that of \(X\), so explicit covariance formation can lose accuracy in weak directions when the data is ill-conditioned. Covariance eigendecomposition can still be practical when the feature dimension is small and conditioning is acceptable. The <a href="/blog/basics/linear-regression/">linear regression chapter</a> makes the same argument about the normal equations, and the fix is the same: factorise \(X\) directly.
</div>

## Centring and scaling define the geometry

**Centring.** An uncentred singular-value decomposition uses second moments about the origin, rather than covariance about the mean. A large mean can dominate its leading direction. Shift the example by $$(10,10)$$ and the leading direction becomes $$\approx(0.709, 0.705)$$, which points at the centroid, not along the data. The variance structure is unchanged; only the centring was dropped. Most libraries centre for you. Verify that yours does.

**Scaling.** Covariance is not unit-free. Measure one feature in metres and another in millimetres and the millimetre feature's variance is a million times larger, so PC1 will align with it regardless of whether it carries any real information. If equal standardised variation is the intended geometry, scale the features first; correlation-matrix PCA expresses that choice. Physical units or domain priorities may justify a different scaling. Fit these statistics on the training data only.

## Project new observations and reconstruct them

Let the columns of \(V_k\) contain the retained principal directions. With training mean \(\mu\), row-vector observations transform and reconstruct as

<div class="formula-box">
\[
z=(x-\mu)V_k,\qquad \hat x=\mu+zV_k^\top.
\]
</div>

If features were standardised, apply the fitted training scales before projection and undo them after reconstruction. Otherwise the reconstructed values are expressed in transformed units. New observations use the original fitted mean and axes; refitting on the test set changes the representation and contaminates an inductive evaluation.

For the worked example, take \(x=(2,1)\) and \(u_1\approx(0.85065,0.52573)\). Its coordinate is about 2.2270, giving reconstruction \((1.8944,1.1708)\). The discarded residual is perpendicular to the retained axis. Its squared norm contributes to the total discarded variance calculated above.

```python
import math
u = (math.sqrt((1+1/math.sqrt(5))/2),
     math.sqrt((1-1/math.sqrt(5))/2))
x = (2.0, 1.0)
score = sum(a*b for a, b in zip(x, u))
reconstruction = tuple(score*a for a in u)
residual = tuple(a-b for a, b in zip(x, reconstruction))
assert abs(sum(a*b for a, b in zip(residual, u))) < 1e-12
assert abs(sum(a*a for a in x)-score**2-sum(a*a for a in residual)) < 1e-12
```

## Scores, directions and loadings are different objects

Principal directions are vectors in feature space. Scores are the coordinates of observations along those directions. The term *loadings* is used inconsistently: some sources mean the direction coefficients, while others scale them by square roots of eigenvalues or report correlations with original variables. State the convention before comparing tables from different packages.

The sign of any principal direction is arbitrary. Replacing a direction with its negative and negating its scores leaves reconstruction unchanged. When eigenvalues repeat, rotations inside the corresponding eigenspace are also valid. Nearly tied eigenvalues can therefore produce unstable individual directions even when the retained subspace is stable.

For interpretation, examine the span, reconstruction and stability under resampling rather than treating a sign change or a rotated pair of similar components as a failed fit. A large coefficient also reflects feature scaling, so it is not automatically an importance score in original units.

## Whitening changes the metric after PCA

Ordinary PCA scores have covariance \(\operatorname{diag}(\lambda_1,\ldots,\lambda_k)\) under the sample-covariance convention. Whitened scores divide coordinate j by \(\sqrt{\lambda_j}\), giving identity covariance on the retained positive-eigenvalue subspace.

If two score directions have variances 9 and 1, whitening divides the first coordinate by 3 and leaves the second unchanged. It gives equal variance to directions that ordinary PCA regards as differently energetic. That can help a later estimator, but it removes relative scale information and amplifies noise when an eigenvalue is tiny.

Whitening does not imply independence, normality or semantic disentanglement. [ICA](/blog/basics/independent-component-analysis/) uses stronger assumptions to seek independent sources; [ridge regression](/blog/basics/ridge-regression/) instead shrinks weak singular directions without assigning them equal variance. Exact finite-sample scaling can vary by software convention, so verify whether variances use n or n−1.

## How many components

The honest answer is that this is a judgement call dressed up in several ways: keep enough components to reach a chosen cumulative explained-variance ratio (90%, 95%); look for a bend in the scree plot; or, if you are feeding a downstream model, cross-validate the number as a hyperparameter. Choose the criterion from the task: retained variance can be meaningful for compression, whereas downstream validation measures predictive utility. An elbow is frequently absent, and no fixed variance percentage proves that all useful signal survived.

## Large matrices, sparse data and solver choices

A full SVD is often unnecessary when only a small rank is needed. Randomised methods estimate a subspace using matrix–vector products, with oversampling and power iterations controlling approximation quality. Incremental PCA updates a low-rank approximation in batches, trading memory for approximation and order sensitivity. Neither changes the need for a fixed evaluation protocol.

Centring a sparse matrix can destroy sparsity. Truncated SVD on an uncentred sparse matrix is useful for some applications, but it is a different objective from centred PCA. Keep that distinction explicit when comparing text representations or interpreting explained variance.

Missing values also require a strategy. Replacing missing entries by zero changes the covariance unless zero is truly the measured value. Fit imputation within the training split, or use a method designed for incomplete observations. Outliers can dominate squared-error PCA, motivating robust alternatives when contamination is part of the problem.

## What PCA cannot do

**It is linear.** The components are linear combinations of the original features, so PCA can rotate and project but never bend. Data on a spiral, a Swiss roll, or a circle has no low-dimensional *linear* description, and PCA will report that honestly by spreading variance across many components. That is not a failure of the algorithm; it is the algorithm telling you its model does not fit.

**Variance is not importance.** PCA is unsupervised and has never seen your labels. A direction with tiny variance can be the one that separates your classes, and PCA will discard it first. If you have labels and want a discriminative projection, that is a different method.

**Components are rarely interpretable.** PC1 is a weighted mixture of every original feature. Occasionally that mixture means something; usually it does not, and reading a story into the loadings is a common way to fool yourself.

**Non-linear alternatives, and a warning.** [Kernel PCA](/blog/basics/kernel-pca/) applies the kernel trick to do PCA in a feature space. At a global optimum under the appropriate unconstrained linear bottleneck and squared-error assumptions, a linear autoencoder recovers PCA’s principal subspace, though its coordinates need not be the principal axes. Nonlinear autoencoders have different objectives and constraints. [t-SNE](/blog/basics/t-sne/) and [UMAP](/blog/basics/umap/) focus on neighbourhood structure and are often used for visualisation; UMAP also supports higher-dimensional downstream representations.

<div class="warning-box">
<strong>Do not read t-SNE or UMAP plots quantitatively.</strong> Their neighbourhood objectives do not generally preserve all global distances or densities. Cluster sizes on the plot do not indicate cluster variance, distances between clusters do not indicate dissimilarity, and both change with the perplexity or neighbour count. Use them to inspect candidate structure, then verify group claims and quantitative relationships in the original representation. A plotted island alone does not establish a natural population.
</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Maximising retained variance and minimising squared reconstruction error are the same optimisation, Pythagoras splits a fixed total between them.</li>
  <li>Components are eigenvectors of the covariance; explained variance is its eigenvalues. On the worked example \(\lambda = (3.4271, 0.0729)\), so PC1 carries 97.9%.</li>
  <li>The discarded variance <em>equals</em> the reconstruction error: \((n-1)\lambda_2 = 0.2918\) is exactly the SSE from projecting onto PC1.</li>
  <li>Compute via SVD, using \(\lambda_i = s_i^2/(n-1)\). Direct SVD avoids the squared conditioning of explicit covariance formation.</li>
  <li>Centre for covariance PCA; choose scaling according to the intended geometry, using training statistics only.</li>
  <li>PCA is linear, unsupervised, and optimises reconstruction, so it cannot unroll curved structure, and it has no reason to keep the direction your classifier needs.</li>
</ul>
</div>

## References

1. scikit-learn. [Principal component analysis and decomposition methods](https://scikit-learn.org/stable/modules/decomposition.html#pca).
2. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
