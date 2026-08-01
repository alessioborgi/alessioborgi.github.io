---
layout: single
title: "Geodesics: Learning on Curved Domains"
date: 2026-08-07
categories: [gdl]
book: gdl
subsection: domains
tags: [manifolds, meshes, geodesic-convolution, laplace-beltrami, geometric-deep-learning]
published: true
is_overview: false
excerpt: "On a surface there is no global grid to slide a filter along, and no canonical direction to call 'up'. What survives is distance, and building convolution out of distance alone exposes exactly one ambiguity — which is where the next chapter starts."
author_profile: true
read_time: true
icon: "🌐"
read_mins: 8
permalink: /blog/gdl/geodesics-and-manifolds/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A grid has translation. A curved surface does not — you cannot shift a mesh sideways and get the same mesh. What a surface does have is intrinsic distance measured along it, and its symmetry group is the isometries: maps that preserve that distance. Convolution can be rebuilt from local geodesic patches, but doing so leaves one loose end that cannot be tied off intrinsically: there is no canonical choice of which direction is angle zero.
</div>

## Why the previous two chapters do not apply

The grid derivation used a shift operator. Curved domains have no such thing. Bend a sheet into a cylinder and "move one step right" stops being globally defined; on a sphere it is hopeless. There is no translation group to be equivariant to.

What remains is **intrinsic geometry**. Distance measured *along* the surface — geodesic distance — is well defined without reference to any surrounding space, and the natural symmetry is the group of **isometries**: deformations that preserve those distances. Bending a sheet of paper into a cylinder is an isometry; stretching it is not.

<div class="insight-box">
<strong>Intrinsic versus extrinsic, and why it matters practically.</strong> An <em>extrinsic</em> property depends on how the surface sits in space — surface normals, 3-D coordinates. An <em>intrinsic</em> one depends only on distances measured within the surface. A model built from intrinsic quantities automatically handles deformation: a hand recognised as a hand whether the fingers are splayed or curled, because bending barely changes intrinsic distances while changing every coordinate. That robustness is the reason to accept the extra difficulty.
</div>

## Rebuilding convolution locally

A convolution slides a template over the domain and takes an inner product at each position. On a manifold you can still do this locally.

Around each point, build a **geodesic polar patch**: coordinates $$(r, \theta)$$ where $$r$$ is geodesic distance from the point and $$\theta$$ is an angle around it. Within a small enough neighbourhood this is a valid chart, so a filter defined on $$(r, \theta)$$ can be correlated against the signal there, and the operation repeated at every point.

The radial coordinate is unproblematic — $$r$$ is intrinsic and canonical, since it is just distance. The angular coordinate is not.

## The loose end

**There is no intrinsic way to choose where $$\theta = 0$$ points.**

On a grid, "right" is globally meaningful. On a surface, picking a reference direction at one point tells you nothing about which direction is the corresponding one at another point — there is no global frame, and no intrinsic rule that produces one. Every patch's angular coordinate is fixed only up to an arbitrary rotation.

The consequences are unavoidable given the setup:

- Two people building patches at the same point with different conventions get **different filter responses** from the same filter and the same surface.
- The operation is therefore well defined only relative to a choice, and that choice is *per point*.

The standard workarounds all give something up. **Angular max-pooling** takes the maximum response over all rotations of the filter, which removes the dependence by discarding orientation — a real loss when orientation carries information. **Anisotropic kernels** align to an intrinsic direction such as a principal curvature, which is only defined where curvature is non-degenerate. **Spectral methods** sidestep the issue entirely.

## The spectral route

Instead of building patches, use the **Laplace–Beltrami operator** — the manifold's analogue of the Laplacian — and work in its eigenbasis. Its eigenfunctions generalise the Fourier basis, so filtering becomes multiplication in the spectral domain, exactly as in classical signal processing.

This should feel familiar from Book II. The graph Laplacian $$L = D - A$$ is the discrete counterpart, and [spectral graph convolution](/blog/gnn/graph-fourier-transform/) is the same construction on a graph. A mesh is a graph, and the two views meet there.

<div class="warning-box">
<strong>The spectral route trades one problem for another.</strong> Laplace–Beltrami eigenfunctions are determined only up to sign, and up to arbitrary rotation within any eigenspace of repeated eigenvalues — which symmetric shapes have in abundance. So the ambiguity is not removed, it is relocated from the angular coordinate to the eigenbasis. Book II's <a href="/blog/gnn/sign-ambiguity/">sign-ambiguity chapter</a> deals with exactly this in the graph setting. Eigenfunctions are also basis-dependent, so a filter learned on one shape does not transfer to another with a different spectrum.
</div>

## Where this leads

Both routes hit the same wall from different sides: **there is no canonical frame, and every construction must either pick one arbitrarily or throw away the information that depends on it.**

Pooling over orientations is throwing it away. Picking a principal direction is choosing arbitrarily and hoping it is stable. Neither is satisfying, and both are workarounds rather than answers.

The answer is to stop trying to eliminate the choice and instead make the model *equivariant to it* — let each point have its own frame, and require the network to behave correctly when those frames are changed. That requirement has a name, and it is the [last domain](/blog/gdl/gauges-and-local-frames/) in the blueprint.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Curved domains have no translation group, so the grid derivation does not transfer. The symmetry is isometry — preserving intrinsic distance.</li>
  <li>Intrinsic constructions are robust to deformation, which is the practical payoff for the extra difficulty.</li>
  <li>Geodesic patches rebuild convolution locally in \((r,\theta)\). The radial coordinate is canonical; the angular one is not.</li>
  <li>No intrinsic rule fixes where \(\theta = 0\) points, so filter responses depend on an arbitrary per-point choice.</li>
  <li>Angular pooling removes the dependence by discarding orientation; anisotropic kernels need a well-defined principal direction.</li>
  <li>The spectral route via Laplace–Beltrami relocates the ambiguity into eigenvector sign and eigenspace rotation rather than removing it.</li>
  <li>The real fix is to keep the local frames and demand equivariance to changing them — gauge equivariance.</li>
</ul>
</div>

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv:2104.13478*.
- Masci, J., Boscaini, D., Bronstein, M. M., & Vandergheynst, P. (2015). [Geodesic Convolutional Neural Networks on Riemannian Manifolds](https://arxiv.org/abs/1501.06297). *ICCV Workshops 2015*.
- Boscaini, D., Masci, J., Rodolà, E., & Bronstein, M. (2016). [Learning Shape Correspondence with Anisotropic Convolutional Neural Networks](https://arxiv.org/abs/1605.06437). *NeurIPS 2016*.
- Bruna, J., Zaremba, W., Szlam, A., & LeCun, Y. (2014). [Spectral Networks and Locally Connected Networks on Graphs](https://arxiv.org/abs/1312.6203). *ICLR 2014*.
