---
layout: single
title: "PCA: Maximum Variance and Minimum Reconstruction Error"
date: 2026-05-11
categories: [basics]
book: basics
subsection: unsupervised
tags: [pca, dimensionality-reduction, svd, eigenvectors, tsne]
published: true
is_overview: false
excerpt: "PCA can be derived by asking for the directions of greatest spread, or by asking for the subspace that loses the least when you project onto it. The two questions look unrelated and have the same answer — which is the most useful thing to understand about it."
author_profile: true
read_time: true
icon: "📉"
read_mins: 7
permalink: /blog/basics/pca-and-dimensionality-reduction/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Principal component analysis finds an orthogonal set of directions ordered by how much of the data's variance each one carries. It answers two apparently different questions — "where is the data most spread out?" and "which subspace can I project onto while losing the least?" — with the same eigenvectors. Compute it with an SVD, never by forming \(X^\top X\), and remember that it is a <em>linear</em> method: no amount of it will unroll a spiral.
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
<strong>Why this matters practically:</strong> it tells you what PCA is optimising when someone asks. It is not "finding meaningful structure" or "removing noise" — it is minimising squared reconstruction error over linear subspaces. Everything PCA is good at, and everything it is bad at, follows from that being the objective.
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

  <text x="384" y="64" font-size="9.5" font-weight="700" fill="#0d9488">PC1 — 97.9%</text>
  <text x="278" y="170" font-size="9.5" font-weight="700" fill="#ea580c">PC2 — 2.1%</text>
  <text x="260" y="250" text-anchor="middle" font-size="8.5" fill="#475569">The second axis is genuinely that short; the ratio is √0.0729 to √3.4271.</text>
</svg>
<figcaption>The two principal axes of the worked example, drawn with lengths proportional to the square roots of their eigenvalues. PC2 is short because it is short — the drawing is not compressed for effect.</figcaption>
</figure>
</div>

Now check the equivalence claim numerically. Projecting onto $$u_1$$ alone leaves a total squared reconstruction error of $$0.2918$$. And $$(n-1)\lambda_2 = 4 \times 0.0729 = 0.2918$$. The variance you discard *is* the error you incur — exactly, not approximately.

## Use the SVD, not the covariance matrix

Everything above is easier and better conditioned through the singular value decomposition $$X = U S V^\top$$. The right singular vectors are the principal directions, and the eigenvalues follow from the singular values:

<div class="formula-box">
\[
\lambda_i = \frac{s_i^2}{n-1} .
\]
</div>

On the example, $$s = (3.7025,\ 0.5402)$$, and $$s^2/4 = (3.4271,\ 0.0729)$$ — the eigenvalues again.

<div class="warning-box">
<strong>Forming \(X^\top X\) squares the conditioning.</strong> The condition number of \(X^\top X\) is the square of that of \(X\), so building the covariance matrix explicitly throws away roughly half your available precision before you start. The <a href="/blog/basics/linear-regression/">linear regression chapter</a> makes the same argument about the normal equations, and the fix is the same: factorise \(X\) directly.
</div>

## Two preprocessing steps that are not optional

**Centring.** PCA on uncentred data does not find the direction of greatest spread — it finds the direction of the mean. Shift the example by $$(10,10)$$ and the leading direction becomes $$\approx(0.709, 0.705)$$, which points at the centroid, not along the data. The variance structure is unchanged; only the centring was dropped. Most libraries centre for you. Verify that yours does.

**Scaling.** Covariance is not unit-free. Measure one feature in metres and another in millimetres and the millimetre feature's variance is a million times larger, so PC1 will align with it regardless of whether it carries any real information. If your features have incomparable units, standardise first — which amounts to running PCA on the correlation matrix instead.

## How many components

The honest answer is that this is a judgement call dressed up in several ways: keep enough components to reach a chosen cumulative explained-variance ratio (90%, 95%); look for a bend in the scree plot; or, if you are feeding a downstream model, cross-validate the number as a hyperparameter. The last is the only one that optimises something you actually care about. The first two are conventions, and the "elbow" is frequently not there.

## What PCA cannot do

**It is linear.** The components are linear combinations of the original features, so PCA can rotate and project but never bend. Data on a spiral, a Swiss roll, or a circle has no low-dimensional *linear* description, and PCA will report that honestly by spreading variance across many components. That is not a failure of the algorithm; it is the algorithm telling you its model does not fit.

**Variance is not importance.** PCA is unsupervised and has never seen your labels. A direction with tiny variance can be the one that separates your classes, and PCA will discard it first. If you have labels and want a discriminative projection, that is a different method.

**Components are rarely interpretable.** PC1 is a weighted mixture of every original feature. Occasionally that mixture means something; usually it does not, and reading a story into the loadings is a common way to fool yourself.

**Non-linear alternatives, and a warning.** Kernel PCA applies the [kernel trick](/blog/basics/svm-and-kernels/) to do PCA in a feature space. Autoencoders learn a non-linear encoder and decoder, and reduce to PCA's subspace when made linear with a squared-error loss. t-SNE and UMAP are for visualisation.

<div class="warning-box">
<strong>Do not read t-SNE or UMAP plots quantitatively.</strong> Both optimise the preservation of <em>local</em> neighbourhoods and explicitly do not preserve global geometry. Cluster sizes on the plot do not indicate cluster variance, distances between clusters do not indicate dissimilarity, and both change with the perplexity or neighbour count. They are excellent for noticing that groups exist, and unreliable for anything you would put a number on.
</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Maximising retained variance and minimising squared reconstruction error are the same optimisation — Pythagoras splits a fixed total between them.</li>
  <li>Components are eigenvectors of the covariance; explained variance is its eigenvalues. On the worked example \(\lambda = (3.4271, 0.0729)\), so PC1 carries 97.9%.</li>
  <li>The discarded variance <em>equals</em> the reconstruction error: \((n-1)\lambda_2 = 0.2918\) is exactly the SSE from projecting onto PC1.</li>
  <li>Compute via SVD, using \(\lambda_i = s_i^2/(n-1)\). Forming \(X^\top X\) squares the condition number for no benefit.</li>
  <li>Centre always; standardise whenever features have different units. Skipping the centring makes PC1 point at the mean.</li>
  <li>PCA is linear, unsupervised, and optimises reconstruction — so it cannot unroll curved structure, and it has no reason to keep the direction your classifier needs.</li>
</ul>
</div>
