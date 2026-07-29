---
layout: single
title: "Manifolds and Tangent Spaces: What 'The Data Lies on a Manifold' Actually Claims"
date: 2026-09-05
categories: [geometry-basics]
book: geometry-basics
subsection: differential
tags: [manifolds, tangent-space, manifold-hypothesis, dimensionality-reduction]
excerpt: "A manifold is a space that looks flat close up and can be curved or knotted globally. That gap between local and global is why charts exist, why a single autoencoder latent space sometimes cannot fit the data, and what dimensionality reduction is really exploiting."
author_profile: true
read_time: true
is_overview: false
icon: "🗺️"
read_mins: 6
permalink: /blog/geometry-basics/manifolds-and-tangent-spaces/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A \(d\)-dimensional manifold is a space that is locally homeomorphic to \(\mathbb{R}^d\) but need not be globally — hence charts, and an atlas of them with smooth transitions on overlaps. The tangent space \(T_pM\) is the \(d\)-dimensional vector space of velocities of curves through \(p\): the local linearisation, and a different space at every point. The manifold hypothesis claims real data concentrates near a low-dimensional manifold inside its ambient space; measured intrinsic dimensions of image datasets are in the tens against ambient dimensions in the hundreds of thousands, which is what makes dimensionality reduction more than wishful thinking.
</div>

## Locally flat, globally not

Take the circle $$S^1$$. Near any point it looks like an interval; globally it is compact and closes up, so no continuous injective map to $$\mathbb{R}$$ captures it. That gap between local and global is the entire content of the definition.

A **topological $$d$$-manifold** is a Hausdorff, second-countable space in which every point has a neighbourhood homeomorphic to an open subset of $$\mathbb{R}^d$$. Such a homeomorphism $$\varphi: U \to \mathbb{R}^d$$ is a **chart**, a local coordinate system; a collection of charts covering the space is an **atlas**; and the manifold is **smooth** when every transition map $$\varphi_j\circ\varphi_i^{-1}$$ is $$C^\infty$$.

Why not use one chart? For most interesting spaces you cannot: $$S^2$$ is compact and any nonempty open subset of $$\mathbb{R}^2$$ is not, so a single homeomorphism onto one is impossible. Two stereographic charts, one omitting each pole, suffice. Longitude/latitude is a chart too, with the familiar defect that it degenerates at the poles and tears at the date line.

Keep three examples in mind: $$S^2$$; the torus $$T^2 = S^1\times S^1$$, also 2-dimensional but *not* homeomorphic to the sphere since it has a hole; and the Swiss roll, a flat rectangle rolled up inside $$\mathbb{R}^3$$, intrinsically flat despite looking dramatic.

## The tangent space

Collect the velocities $$\gamma'(0)$$ of all smooth curves with $$\gamma(0) = p$$. The result is a $$d$$-dimensional real vector space, the **tangent space** $$T_pM$$, spanned in a chart by the coordinate directions $$\partial/\partial x^1,\dots,\partial/\partial x^d$$.

Two things make it useful. It is a genuine vector space, so all the machinery of [Euclidean space](/blog/geometry-basics/euclidean-spaces/) applies locally even though the manifold itself has no notion of addition. And it is where derivatives live: the differential of a smooth $$f: M\to N$$ at $$p$$ is a *linear* map $$df_p: T_pM\to T_{f(p)}N$$, so gradients and Jacobians on manifolds are maps between tangent spaces.

<div class="warning-box">
  <strong>Interview trap:</strong> the tangent space is not part of the manifold, and it differs at every point. So if \(u, v \in T_pM\) then \(u + v\) is a tangent vector, <em>not</em> a point on \(M\) — getting back requires the exponential map (see <a href="/blog/geometry-basics/riemannian-geometry/">Riemannian geometry</a>), and adding two points on a sphere then renormalising is a hack rather than a geometric operation. And \(T_pM\) and \(T_qM\) are distinct spaces with no canonical identification; comparing vectors across points needs a connection and parallel transport, which is where curvature enters.
</div>

## The manifold hypothesis

The claim is empirical, not mathematical: high-dimensional data concentrates near a low-dimensional manifold in the ambient space. A $$224\times 224$$ RGB image lives in $$\mathbb{R}^{150528}$$, yet photographs vary along far fewer directions — pose, illumination, identity, background. Three strands of evidence support it, none a proof:

- **Intrinsic-dimension estimates.** Nearest-neighbour estimators such as Levina and Bickel's maximum-likelihood method return dimensions in the tens for standard image datasets; Pope et al. (2021) report roughly $$40$$ for ImageNet against $$150{,}528$$ ambient, and find that lower estimated intrinsic dimension goes with easier learning — fewer samples for the same accuracy.
- **Testability.** Fefferman, Mitter and Narayanan (2016) turned the hypothesis into a decidable statistical question: given samples, test whether they lie near a manifold of bounded dimension, volume and reach. It can fail, so it is a hypothesis rather than a slogan.
- **What works in practice.** Methods that assume a manifold — Isomap, LLE, their descendants — recover structure PCA cannot.

<div class="insight-box">
  <strong>Key Insight — this is why nonlinear dimensionality reduction beats PCA:</strong> on the Swiss roll, two points on opposite sheets can be close in \(\mathbb{R}^3\) while being far apart <em>along the surface</em>. PCA sees only the ambient straight-line distance, so it collapses the sheets together. Isomap replaces ambient distance with the shortest path through a \(k\)-nearest-neighbour graph, approximating the intrinsic distance, and the roll unrolls into the flat rectangle it always was. The manifold hypothesis is what licenses that substitution: it says the neighbourhood graph is a faithful stand-in for the surface.
</div>

## Where the hypothesis is weaker than it sounds

Data lies *near* a manifold, not on one — noise thickens the support, which is why "reach" appears in the formal statements. The support may also be a *union* of manifolds of different dimensions, making a single latent dimension the wrong model. And topology matters: an autoencoder with latent space $$\mathbb{R}^k$$ and continuous encoder and decoder is precisely one chart. If the data manifold is a circle of rotations, no such pair can be a homeomorphism, so the model must either tear the circle or fold it — the failure that hyperspherical and other structured-latent VAEs were built to avoid.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>A \(d\)-manifold is locally homeomorphic to \(\mathbb{R}^d\); charts are local coordinates, an atlas covers the space, smoothness constrains the transition maps.</li>
    <li>One chart is often impossible: \(S^2\) is compact and open subsets of \(\mathbb{R}^2\) are not; two stereographic charts suffice.</li>
    <li>\(T_pM\) is a \(d\)-dimensional space of curve velocities — the local linearisation, distinct at each point, not a subset of \(M\).</li>
    <li>The manifold hypothesis is empirical: intrinsic dimension of image data measures in the tens against \(10^5\)-plus ambient dimensions, and lower intrinsic dimension correlates with easier learning.</li>
    <li>Caveats: data is near, not on; the support may be a union of manifolds; a single \(\mathbb{R}^k\) latent space is one chart, so nontrivial topology breaks it.</li>
  </ul>
</div>

## References

1. Lee, J. M. *Introduction to Smooth Manifolds*, 2nd ed. Springer, 2012.
2. Levina, E., & Bickel, P. J. [Maximum Likelihood Estimation of Intrinsic Dimension](https://proceedings.neurips.cc/paper/2004/hash/74934548253bcab8490ebd74afed7031-Abstract.html). *NeurIPS 2004*.
3. Fefferman, C., Mitter, S., & Narayanan, H. [Testing the Manifold Hypothesis](https://arxiv.org/abs/1310.0425). *Journal of the American Mathematical Society*, 29(4), 2016.
4. Pope, P., Zhu, C., Abdelkader, A., Goldblum, M., & Goldstein, T. [The Intrinsic Dimension of Images and Its Impact on Learning](https://arxiv.org/abs/2104.08894). *ICLR 2021*.
5. Tenenbaum, J. B., de Silva, V., & Langford, J. C. [A Global Geometric Framework for Nonlinear Dimensionality Reduction](https://doi.org/10.1126/science.290.5500.2319). *Science*, 290(5500), 2000.
6. Davidson, T. R., Falorsi, L., De Cao, N., Kipf, T., & Tomczak, J. M. [Hyperspherical Variational Auto-Encoders](https://arxiv.org/abs/1804.00891). *UAI 2018*.
