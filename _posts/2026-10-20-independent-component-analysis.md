---
layout: "single"
title: "Independent Component Analysis: Whitening, Non-Gaussianity and Source Recovery"
date: "2026-10-20 10:24:00 +0100"
categories: ["basics"]
book: "basics"
subsection: dimensionality-reduction
tags: ["machine-learning", "dimensionality-reduction", "ica", "signal-processing"]
excerpt: "Explain the linear mixing model, why decorrelation is insufficient, and how non-Gaussian contrasts identify sources only under explicit assumptions and ambiguities."
author_profile: true
read_time: true
is_overview: false
icon: "🎛️"
read_mins: 5
permalink: "/blog/basics/independent-component-analysis/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> ICA seeks statistically independent latent sources whose linear mixture produces the observations. Whitening removes second-order dependence, then a rotation is identified using stronger distributional assumptions, often non-Gaussianity. Source scale, sign and order remain inherently ambiguous.
</div>

## A source model rather than a variance ranking

Imagine two microphones recording different mixtures of two speakers. Each microphone observes a sum, and the goal is to recover the underlying signals. In an ideal instantaneous linear model,

<div class="formula-box">
\[
x=As,
\]
</div>

where s contains latent sources and A is an unknown mixing matrix. Basic ICA assumes independent sources, sufficient observations and a suitable full-rank mixing relationship. Real recordings with echoes, delays and changing sources may require a more complicated model.

[PCA](/blog/basics/pca-and-dimensionality-reduction/) asks which directions explain variance. ICA asks which transformed coordinates behave independently under its source model. A high-variance direction can still mix several independent sources.

## What is identifiable?

Multiplying one source by a nonzero constant and dividing its mixing column by that constant leaves x unchanged. Permuting sources and the corresponding columns also leaves the observations unchanged. Sign reversal is included in the scale ambiguity.

Consequently a recovered component may have opposite sign, different amplitude or a different position in the output than the original source. Evaluate source recovery with those ambiguities in mind rather than comparing columns literally.

A central identifiability condition is that at most one source is Gaussian in the standard model. Multiple independent Gaussian sources with equalised variances can be rotated without changing their joint distribution, so independence alone cannot identify their original axes.

## Whitening is only the first stage

Centre the observations and write their covariance as $$C=U\Lambda U^\top$$. A whitening transformation can use

<div class="formula-box">
\[
z=\Lambda^{-1/2}U^\top(x-\mu).
\]
</div>

On the retained positive-eigenvalue subspace, the transformed covariance is identity. Tiny eigenvalues amplify noise, so dimensionality reduction and numerical regularisation may be needed before inversion.

Whitening removes correlation. It does not generally establish independence: non-Gaussian variables can be uncorrelated and still dependent through nonlinear relationships. Under the ideal full-dimensional ICA model with standardised sources, the remaining mixing can be treated as an orthogonal rotation, which simplifies the search.

## A two-source illustration

Let independent sources take values −1 and +1 with equal probability, and mix them as $$x_1=s_1+s_2$$ and $$x_2=s_1-s_2$$. Each observed coordinate has variance 2 and their covariance is zero. They are already uncorrelated.

Yet they are dependent: when $$x_1=\pm2$$, necessarily $$x_2=0$$; when $$x_2=\pm2$$, necessarily $$x_1=0$$. Decorrelation alone has not recovered the sources.

The inverse relationships are $$s_1=(x_1+x_2)/2$$ and $$s_2=(x_1-x_2)/2$$. ICA needs higher-order distributional information to prefer this orientation over the observed uncorrelated axes. This example makes the difference between uncorrelated and independent concrete.

## Non-Gaussianity supplies a contrast

Under suitable conditions, mixtures of independent variables tend to be more Gaussian than individual non-Gaussian sources. ICA algorithms exploit contrasts such as approximations to negentropy, kurtosis or likelihood under source distributions.

For a whitened z and a unit direction w, one common fixed-point idea has the form

<div class="formula-box">
\[
w_{\mathrm{new}}\propto\mathbb E[z\,g(w^\top z)]-
\mathbb E[g'(w^\top z)]w,
\]
</div>

followed by normalisation and appropriate orthogonalisation across components. The chosen nonlinearity g specifies the contrast. This sketches the mechanism of FastICA; a full implementation must handle simultaneous components, convergence and numerical details.

Kurtosis-based contrasts can be highly sensitive to outliers. Robust nonlinearities reduce some sensitivity but do not eliminate violations of the source model. Inspect whether extreme observations dominate a recovered component.

## Choosing the number of components

If a reduced PCA subspace is used before ICA, discarded directions cannot be recovered later. The retained dimension should reflect signal-to-noise considerations and the number of plausible sources, not only a convenient plot size.

More sensors than sources, noise, dependent sources and nonlinear mixing each change the estimation problem. A fitted independent-looking component is not proof that a physically separate source exists. Domain validation remains necessary.

Unlike PCA, ICA components do not come with a natural descending explained-variance order after whitening and arbitrary rescaling. Ranking them by a chosen quantity is an additional reporting convention.

## Validate stability and meaning

Compare fits across seeds, data subsets and preprocessing choices after aligning sign and order where possible. Examine residual dependence, reconstruction under the fitted mixing model and associations with independent measurements.

In applications such as physiological signal cleaning, removing a component because it resembles an artefact is an additional intervention. Verify that useful signal was not removed with it. Save the centring, whitening, unmixing and inverse transformations as one pipeline.

ICA is appropriate when a source-separation model is defensible. Use PCA for low-rank variance compression, [NMF](/blog/basics/nonnegative-matrix-factorisation/) for nonnegative additive factors, and explicit probabilistic models when uncertainty and noise structure must be represented directly.

<div class="insight-box">
  <strong>Key Insight:</strong> Whitening narrows the problem to relationships beyond covariance. The remaining orientation is identified by independence and non-Gaussian assumptions, not by another variance-maximisation step.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> An uncorrelated representation is not necessarily independent, and an ICA component is not automatically a physically meaningful source. Check model assumptions and stability.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>State the linear mixing and source-independence assumptions.</li>
    <li>Recognise unavoidable scale, sign and permutation ambiguities.</li>
    <li>Use whitening carefully when eigenvalues are small.</li>
    <li>Validate recovered components beyond a visually plausible waveform.</li>
  </ul>
</div>

## References

1. Hyvärinen and Oja. [Independent Component Analysis: Algorithms and Applications](https://www.cs.helsinki.fi/u/ahyvarin/papers/NN00new.pdf). Neural Networks, 2000.
2. scikit-learn. [Matrix decomposition user guide](https://scikit-learn.org/stable/modules/decomposition.html).
