---
layout: "single"
title: "Nonnegative Matrix Factorisation: Additive Parts, Loss Functions and Ambiguity"
date: "2026-10-20 10:25:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "dimensionality-reduction"
tags: ["machine-learning", "dimensionality-reduction", "nmf", "factorisation"]
excerpt: "Derive nonnegative low-rank reconstruction, inspect multiplicative updates and scale ambiguity, and separate useful additive factors from guaranteed semantic parts."
author_profile: true
read_time: true
is_overview: false
icon: "🧩"
read_mins: 5
permalink: "/blog/basics/nonnegative-matrix-factorisation/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> NMF approximates a nonnegative matrix as the product of two nonnegative factors. This creates additive combinations without cancellation by negative coefficients. The loss, constraints and initialisation determine the result; nonnegativity alone does not guarantee unique or meaningful parts.
</div>

## Represent observations as additive combinations

Let $$X\in\mathbb R_+^{n\times d}$$ contain nonnegative observations such as counts, intensities or magnitudes. NMF seeks

<div class="formula-box">
\[
X\approx WH,\qquad W\in\mathbb R_+^{n\times k},\quad H\in\mathbb R_+^{k\times d}.
\]\n</div>

Rows of H are factors in the original feature space, and each row of W describes how an observation combines them. The rank k controls the size of the representation. Unlike PCA coordinates, neither factor is required to be orthogonal.

Additivity can aid interpretation: a document can combine word groups, or an image can combine intensity patterns. It does not force factors to match human categories. A factor may capture acquisition background, document length or another nuisance pattern instead.

## Choose a reconstruction loss

A common objective is squared Frobenius error:

<div class="formula-box">
\[
\min_{W,H\ge0}\ \frac12\|X-WH\|_F^2.
\]\n</div>

Another uses generalised KL divergence, with terms $$x\log(x/y)-x+y$$ and appropriate zero conventions. These losses penalise deviations differently and can correspond to different noise assumptions. A factorisation good under one loss may not be good under another.

For fixed H, the W problem is convex, and vice versa. Jointly optimising both is nonconvex. Alternating updates can converge to different solutions depending on initialisation, even when each block is solved accurately.

## An exact two-factor example

Take factors $$H_1=(1,0,1)$$ and $$H_2=(0,1,1)$$. With weights

<div class="formula-box">
\[
W=\begin{pmatrix}1&0\\0&1\\1&1\end{pmatrix},
\qquad H=\begin{pmatrix}1&0&1\\0&1&1\end{pmatrix},
\]\n</div>

the reconstruction rows are $$(1,0,1)$$, $$(0,1,1)$$ and $$(1,1,2)$$. The third observation contains both patterns additively. No negative coefficient cancels the shared third feature.

Now multiply the first column of W by 2 and divide the first row of H by 2. The reconstruction stays identical. This scaling ambiguity means factor magnitudes are not independently interpretable without a normalisation convention. Permuting factors also leaves the product unchanged.

## Multiplicative updates expose the mechanism

For the squared-error objective, a classic pair of updates is

<div class="formula-box">
\[
H\leftarrow H\odot\frac{W^\top X}{W^\top WH},\qquad
W\leftarrow W\odot\frac{XH^\top}{WHH^\top},
\]\n</div>

where multiplication and division are elementwise, with denominators handled safely. Numerators reflect agreement with observed data; denominators reflect what the current reconstruction already supplies. Nonnegative initial values remain nonnegative.

These are not the only solvers. Coordinate-descent and projected or constrained optimisation approaches can converge differently and sometimes more efficiently. A monotonicity statement for ideal updates does not automatically cover every numerical safeguard, regularisation term or approximate stopping rule.

Exact zeros can be locked in by multiplicative updates because multiplying zero leaves zero. Initialisation therefore matters beyond speed. Small positive starts or appropriate structured initialisations avoid some unintended restrictions, while zero denominators need a mathematically sensible policy.

## Preprocessing can help or invalidate the model

Ordinary mean centring creates negative entries and conflicts with basic NMF. Shifting all data upward to restore nonnegativity changes the additive structure and can create a dominant baseline factor. That transformation needs an interpretation, not just a way to satisfy an API.

Normalising document lengths or image intensities changes whether total magnitude contributes to the factors. If counts are meaningful, removing their scale may discard signal; if acquisition exposure dominates, retaining it may obscure the phenomenon of interest.

Missing entries are not observed zeros. Filling them with zero tells the reconstruction loss that absence of signal was measured. Missing-data factorisation needs a mask or an appropriate statistical model rather than relying on nonnegativity alone.

## Rank, sparsity and new observations

Higher rank generally allows lower best-achievable training reconstruction error, so training error alone cannot select k. Use held-out reconstruction with a valid masking or observation split, downstream performance and interpretability stability.

Sparsity penalties can encourage a small number of active weights or concentrated factors, but they change the objective and add tuning choices. Nonnegative factors are not necessarily sparse without such structure or favourable data.

For a new observation, hold the learned H fixed and solve a nonnegative coding problem for its W row. Re-estimating H with test observations changes the fitted representation. Keep the transform procedure inside the same evaluation boundary as any downstream predictor.

## Evaluate more than a parts-like picture

Compare reconstruction error, repeated starts, factor alignment and application performance. Normalise factors consistently before comparing runs, since arbitrary scaling otherwise distorts apparent differences. Inspect whether factors remain meaningful across subsets or reflect duplicates and nuisance variables.

NMF is a useful alternative to [PCA](/blog/basics/pca-and-dimensionality-reduction/) when nonnegative addition matches the data. [ICA](/blog/basics/independent-component-analysis/) asks for independent sources instead; orthogonal variance directions, independent sources and additive parts are three different representation goals.

<div class="insight-box">
  <strong>Key Insight:</strong> Nonnegativity removes subtractive cancellation, making an additive interpretation possible. It does not remove nonconvexity, scaling ambiguity or the need to validate what each factor represents.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Missing values are not zeros, and shifting centred data upward changes the model. Choose preprocessing that preserves the intended meaning of nonnegative observations.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Specify factor dimensions and the reconstruction loss.</li>
    <li>Recognise scale and permutation ambiguities.</li>
    <li>Understand multiplicative updates and their zero-locking issue.</li>
    <li>Select rank and validate new-data coding without refitting on evaluation data.</li>
  </ul>
</div>

## References

1. Lee and Seung. [Learning the parts of objects by non-negative matrix factorization](https://www.nature.com/articles/44565). Nature, 1999.
2. scikit-learn. [Matrix decomposition user guide](https://scikit-learn.org/stable/modules/decomposition.html).
