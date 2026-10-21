---
layout: "single"
title: "Kernel PCA: Centred Gram Matrices, Nonlinear Coordinates and Pre-Images"
date: "2026-10-20 10:23:00 +0100"
categories: ["basics"]
book: "basics"
subsection: dimensionality-reduction
tags: ["machine-learning", "dimensionality-reduction", "pca", "kernels"]
excerpt: "Derive kernel centring and feature-space coordinates, project new observations correctly, and distinguish nonlinear representation from reconstruction in the original space."
author_profile: true
read_time: true
is_overview: false
icon: "🌀"
read_mins: 5
permalink: "/blog/basics/kernel-pca/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Kernel PCA performs ordinary PCA in an implicit feature space defined by a kernel. A centred Gram matrix supplies the eigenvectors and coordinates. Kernel choice changes the geometry, and mapping a low-dimensional point back to the original input is a separate pre-image problem.
</div>

## Keep PCA’s objective and change its feature space

Ordinary [PCA](/blog/basics/pca-and-dimensionality-reduction/) finds linear directions of variation. A curved structure may become simpler after mapping inputs through a nonlinear feature map $$\phi(x)$$. Kernel PCA applies the same variance principle to those mapped observations.

A positive-semidefinite kernel computes inner products $$k(x,z)=\langle\phi(x),\phi(z)\rangle$$ without explicitly constructing the feature vectors. “Nonlinear” describes the map from original inputs to resulting coordinates; the principal-component calculation remains linear in feature space.

## Centre the mapped observations

The feature-space mean is $$\bar\phi=n^{-1}\sum_i\phi(x_i)$$. Let $$K_{ij}=k(x_i,x_j)$$ and $$H=I-\mathbf1\mathbf1^\top/n$$. The centred Gram matrix is

<div class="formula-box">
\[
K_c=HKH.
\]
</div>

Elementwise, subtract the row mean and column mean and add the grand mean. Centring raw x before evaluating a nonlinear kernel does not generally equal centring $$\phi(x)$$. The feature-space correction is still required.

For two observations with Gram matrix $$\begin{pmatrix}1&r\\r&1\end{pmatrix}$$, centring gives $$\tfrac{1-r}{2}\begin{pmatrix}1&-1\\-1&1\end{pmatrix}$$. Its nonzero eigenvalue is 1−r. As the observations become indistinguishable under the kernel, r approaches 1 and their nonconstant variation disappears.

## Recover principal coordinates

Let $$K_cv_j=\lambda_jv_j$$ with $$\|v_j\|=1$$ and positive eigenvalue. The corresponding unit principal direction in feature space is a linear combination of centred feature vectors with coefficients $$v_j/\sqrt{\lambda_j}$$. Training coordinates are

<div class="formula-box">
\[
z_{ij}=\sqrt{\lambda_j}\,v_{ij}.
\]
</div>

The Gram eigenvalue and the sample covariance eigenvalue differ by the factor n−1 under the usual sample convention. Keeping this distinction prevents unexplained scale mismatches between derivations and software outputs.

Zero eigenvalues cannot be divided by. Tiny positive values may amplify numerical errors, and materially negative eigenvalues suggest an indefinite similarity or numerical problem rather than an ordinary positive-semidefinite kernel PCA calculation.

## Project a new observation using training means

For a new x, define its vector of kernel evaluations against the training set. Its centred entry for training observation i is

<div class="formula-box">
\[
\widetilde k_i(x)=k(x_i,x)-\frac1n\sum_l k(x_l,x)
-\frac1n\sum_l K_{il}+\frac1{n^2}\sum_{l,m}K_{lm}.
\]
</div>

Then $$z_j(x)=v_j^\top\widetilde k(x)/\sqrt{\lambda_j}$$. The training Gram means remain fixed. Recentring the combined training-and-test collection changes the fitted representation and leaks information when used during evaluation.

This formula also explains storage requirements: ordinary kernel PCA retains training examples or an equivalent representation to evaluate new kernel vectors. A fitted projection is not necessarily a small matrix in the original input dimension.

## Kernel and bandwidth define the geometry

A polynomial kernel creates feature interactions according to its degree and offset. An RBF kernel uses a length scale to decide how quickly similarity decays. If the scale is so broad that all observations are nearly equally similar, little useful variation remains after centring. If it is extremely narrow, the Gram matrix approaches an identity-like structure with little meaningful sharing.

Tune the kernel and retained dimension for the intended downstream task, inside training folds. An embedding with visually distinct islands is not independent evidence that the kernel captured the correct structure.

Scaling raw inputs still matters because it enters the kernel. A feature measured in large numerical units can dominate RBF distances before the nonlinear transformation begins.

## Reconstruction is a pre-image problem

In linear PCA, mapping retained coordinates back through the principal axes gives a direct least-squares reconstruction. In kernel PCA, a reconstructed point in feature space may not correspond exactly to any original input x.

Finding an approximate pre-image requires another optimisation or learned inverse map. That map can introduce its own regularisation and error. Do not report original-space reconstruction quality as if it followed automatically from retaining a particular fraction of feature-space variance.

If compression and accurate inversion are central, compare ordinary PCA or a carefully validated autoencoder. If a nonlinear coordinate representation is useful for a downstream estimator, a pre-image may not be needed at all.

## Cost and validation

A dense n-by-n Gram matrix uses quadratic memory. A full dense eigendecomposition can be cubic in n, though partial solvers and approximations reduce work. Nyström approximations replace some of that cost with landmark selection and approximation error; their settings become part of the fitted model.

Validate downstream predictions, neighbourhood behaviour and sensitivity to kernel parameters. Compare with linear PCA at the same retained dimension and include transformation time for new observations. Kernel PCA is valuable when its geometry captures a useful nonlinear relation, not merely because it produces a more flexible picture.

<div class="insight-box">
  <strong>Key Insight:</strong> Kernel PCA retains PCA’s variance objective in a different space. Feature-space centring and new-point projection follow from that statement; original-space reconstruction does not.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Centring the raw inputs is not enough for a nonlinear kernel. Use training-derived Gram means when transforming new observations.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Centre the Gram matrix and distinguish its eigenvalues from covariance eigenvalues.</li>
    <li>Project new points with the fitted training statistics.</li>
    <li>Treat kernel choice and dimension as model-selection decisions.</li>
    <li>Account for quadratic storage and the separate pre-image problem.</li>
  </ul>
</div>

## References

1. Schölkopf, Smola and Müller. [Nonlinear Component Analysis as a Kernel Eigenvalue Problem](https://is.mpg.de/de/publications/730). Neural Computation, 1998.
2. scikit-learn. [Matrix decomposition user guide](https://scikit-learn.org/stable/modules/decomposition.html).
