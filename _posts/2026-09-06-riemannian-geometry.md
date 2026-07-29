---
layout: single
title: "Riemannian Geometry: Geodesics, Exponential Maps and Why Trees Prefer Hyperbolic Space"
date: 2026-09-06
categories: [geometry-basics]
book: geometry-basics
subsection: differential
tags: [riemannian, geodesics, hyperbolic-embeddings, slerp]
excerpt: "Put an inner product on every tangent space and let it vary smoothly: that single object determines lengths, angles, distances, straight lines and volume. It also explains why a hierarchy embeds badly in Euclidean space and beautifully in hyperbolic space — the volume is in the wrong place."
author_profile: true
read_time: true
is_overview: false
icon: "🌍"
read_mins: 6
permalink: /blog/geometry-basics/riemannian-geometry/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A Riemannian metric assigns an inner product \(g_p\) to each tangent space, varying smoothly with \(p\). Curve length is \(\int\sqrt{g_\gamma(\dot\gamma,\dot\gamma)}\,dt\) and distance is the infimum over curves. Geodesics are the locally length-minimising, constant-speed curves — the manifold's straight lines. The exponential map \(\exp_p(v)\) walks along the geodesic leaving \(p\) with velocity \(v\) for unit time, and \(\log_p\) inverts it locally, so the pair moves you between the manifold and a flat tangent space. SLERP is exactly this on the sphere. And in hyperbolic space the volume of a ball grows like \(e^r\) rather than \(r^d\), which is why trees embed there with almost no distortion.
</div>

## The metric is the only input

A smooth manifold has tangent spaces but no way to measure anything in them. A **Riemannian metric** $$g$$ supplies one: a positive-definite inner product $$g_p(\cdot,\cdot)$$ on $$T_pM$$ for each $$p$$, depending smoothly on $$p$$. In coordinates it is a symmetric positive-definite matrix field $$g_{ij}(x)$$ — the first fundamental form of the [curvature](/blog/geometry-basics/curvature/) post, promoted to a definition rather than inherited from an ambient space.

Everything else follows. The length of a curve $$\gamma:[0,1]\to M$$ is

<div class="formula-box">
\[
L(\gamma) = \int_0^1 \sqrt{g_{\gamma(t)}\!\left(\dot\gamma(t), \dot\gamma(t)\right)}\; dt ,
\]
</div>

and the distance between two points is $$d(p,q) = \inf\\{L(\gamma) : \gamma(0)=p,\ \gamma(1)=q\\}$$. Angles come from $$g$$ the same way they do in flat space, and the volume element is $$\sqrt{\det g_{ij}}\,dx$$.

## Geodesics

A **geodesic** is a constant-speed curve that is *locally* length-minimising: every sufficiently short segment of it is the shortest path between its endpoints. Equivalently it satisfies

<div class="formula-box">
\[
\ddot\gamma^{\,k} + \Gamma^k_{ij}(\gamma)\,\dot\gamma^{\,i}\dot\gamma^{\,j} = 0 ,
\]
</div>

where the Christoffel symbols $$\Gamma^k_{ij}$$ are built from first derivatives of $$g$$. The equation says the acceleration has no component inside the tangent space — the curve is as straight as the manifold permits.

"Locally" is doing real work. On the sphere, the geodesics are great circles, and a great-circle arc of $$200^\circ$$ is a geodesic but is emphatically not the shortest route; the complementary $$160^\circ$$ arc is. Geodesics are also not unique in general: antipodal points on a sphere are joined by infinitely many.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="riem-geo-title riem-geo-desc" viewBox="0 0 430 250" style="max-width:430px;width:100%;height:auto">
  <title id="riem-geo-title">Geodesic versus chord between two points on a unit sphere</title>
  <desc id="riem-geo-desc">A circle represents a great circle of the unit sphere. Two points A and B sit on it, separated by a central angle of 120 degrees. A teal arc along the surface joins them: this is the geodesic, of length 2.094, equal to two pi over three. A dashed orange straight chord cuts through the interior of the sphere: its length is 1.732, equal to the square root of three, but it leaves the surface, so it is not an available path.</desc>
  <rect x="1" y="1" width="428" height="248" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <circle cx="200" cy="150" r="110" fill="#ffffff" stroke="#334155" stroke-width="1.4"/>
  <ellipse cx="200" cy="150" rx="110" ry="30" fill="none" stroke="#cbd5e1" stroke-width="1"/>
  <path d="M104.7,95 A110,110 0 0 1 295.3,95" fill="none" stroke="#0e7490" stroke-width="3.2"/>
  <line x1="104.7" y1="95" x2="295.3" y2="95" stroke="#c2410c" stroke-width="2.2" stroke-dasharray="6 4"/>
  <circle cx="104.7" cy="95" r="4" fill="#0c4a6e"/>
  <circle cx="295.3" cy="95" r="4" fill="#0c4a6e"/>
  <text x="82" y="88" font-size="11.5" font-weight="700" fill="#0c4a6e">A</text>
  <text x="306" y="88" font-size="11.5" font-weight="700" fill="#0c4a6e">B</text>
  <text x="200" y="42" font-size="11" font-weight="700" fill="#0e7490" text-anchor="middle">geodesic 2π/3 = 2.094</text>
  <text x="200" y="112" font-size="11" font-weight="700" fill="#c2410c" text-anchor="middle">chord √3 = 1.732</text>
  <text x="200" y="176" font-size="10.5" fill="#475569" text-anchor="middle">central angle 120°</text>
  <text x="200" y="236" font-size="10.5" fill="#334155" text-anchor="middle">the chord is shorter, but it is not on the sphere</text>
</svg>
<figcaption>Notice that the straight line is genuinely shorter — geodesics minimise length only among curves that stay on the manifold. Interpolating linearly in the ambient space leaves the surface, which is the failure SLERP fixes.</figcaption>
</figure>
</div>

## Exponential and logarithmic maps

Given $$p \in M$$ and $$v \in T_pM$$, let $$\gamma_v$$ be the unique geodesic with $$\gamma_v(0)=p$$, $$\dot\gamma_v(0)=v$$. Then

<div class="formula-box">
\[
\exp_p(v) = \gamma_v(1), \qquad \log_p = \exp_p^{-1} \ \text{(on a neighbourhood of } p).
\]
</div>

$$\exp_p$$ takes a tangent vector — a flat, linear object you can do arithmetic with — and returns a point on the manifold, travelling a distance $$\lVert v\rVert_g$$ in the direction $$v$$. $$\log_p(q)$$ returns the initial velocity needed to reach $$q$$. Together they are the standard device for optimisation on manifolds: pull the problem into $$T_pM$$, take a Euclidean step, push back with $$\exp$$. The inverse only exists locally — on the unit sphere the injectivity radius is $$\pi$$, and beyond that geodesics start colliding.

On the unit sphere $$S^{n-1}$$ the maps are explicit: $$\exp_p(v) = \cos(\lVert v\rVert)\,p + \sin(\lVert v\rVert)\,v/\lVert v\rVert$$. Feed that the tangent direction toward $$q$$ and you get spherical linear interpolation:

<div class="formula-box">
\[
\mathrm{slerp}(p,q;t) = \frac{\sin\!\big((1-t)\Omega\big)}{\sin\Omega}\,p + \frac{\sin(t\Omega)}{\sin\Omega}\,q,
\qquad \Omega = \arccos\langle p,q\rangle .
\]
</div>

SLERP is not a heuristic for interpolating unit vectors, it is $$\exp_p\\!\big(t\log_p(q)\big)$$ written out. It matters because linear interpolation shrinks: the midpoint of two unit vectors has norm $$\cos(\Omega/2)$$, so at $$\Omega = 60^\circ$$ the lerped midpoint has norm $$0.866$$ and at $$\Omega = 120^\circ$$ only $$0.5$$ — halfway between two latents, at half the radius, in a region the model never saw during training.

## Hyperbolic space and the volume argument

Hyperbolic space $$\mathbb{H}^d$$ has constant negative curvature. The Poincaré ball model puts it on the open unit ball with the conformal metric $$g_x = \lambda_x^2\,g^{\mathrm{E}}$$, $$\lambda_x = 2/(1-\lVert x\rVert^2)$$, giving

<div class="formula-box">
\[
d(u,v) = \operatorname{arcosh}\!\left(1 + 2\,\frac{\lVert u-v\rVert^2}{(1-\lVert u\rVert^2)(1-\lVert v\rVert^2)}\right).
\]
</div>

The metric blows up near the boundary, so the rim is infinitely far away and there is unlimited room out there. Quantitatively, a disc of radius $$r$$ in $$\mathbb{H}^2$$ has area $$2\pi(\cosh r - 1)$$, against $$\pi r^2$$ in the plane:

| $$r$$ | Hyperbolic area | Euclidean area | Ratio |
|---|---|---|---|
| $$2$$ | $$17.36$$ | $$12.57$$ | $$1.4$$ |
| $$5$$ | $$460.0$$ | $$78.54$$ | $$5.9$$ |
| $$10$$ | $$69{,}193$$ | $$314.2$$ | $$220$$ |

<div class="insight-box">
  <strong>Key Insight — why trees fit:</strong> a complete \(b\)-ary tree has on the order of \(b^r\) nodes within \(r\) hops of the root, and if the embedding is to preserve distances, those nodes need room that also grows like \(b^r\). Euclidean space offers only \(r^d\) — polynomial against exponential — so the descendants get crushed together and distortion grows with depth. Hyperbolic area grows like \(\pi e^r\) for large \(r\), matching the tree's own growth rate. Sarkar's construction makes this exact: any tree embeds into \(\mathbb{H}^2\) with distortion arbitrarily close to \(1\). Negative curvature is not a trick for hierarchies, it is the same shape as a hierarchy.
</div>

This is what Poincaré embeddings exploit for taxonomies such as WordNet, reaching better reconstruction with a handful of hyperbolic dimensions than Euclidean embeddings manage with far more; hyperbolic neural networks and hyperbolic GNNs extend the layers themselves to the manifold.

<div class="warning-box">
  <strong>Interview trap:</strong> "geodesic" and "shortest path" are not the same statement. A geodesic is <em>locally</em> minimising and solves the geodesic ODE; the global minimiser may be a different geodesic, may not be unique, and need not exist at all on an incomplete manifold. Likewise \(\log_p\) is only defined inside the injectivity radius. Optimisers that take large \(\exp/\log\) steps break for exactly this reason.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>A Riemannian metric is a smoothly varying inner product on tangent spaces; lengths, angles, distances and volume all derive from it.</li>
    <li>Geodesics solve \(\ddot\gamma^k + \Gamma^k_{ij}\dot\gamma^i\dot\gamma^j = 0\) and are locally, not globally, length-minimising.</li>
    <li>\(\exp_p(v) = \gamma_v(1)\) maps tangent vectors to points; \(\log_p\) inverts it near \(p\). Riemannian optimisation is: \(\log\), Euclidean step, \(\exp\).</li>
    <li>SLERP is \(\exp_p(t\log_p q)\) on the sphere; linear interpolation shrinks norms by \(\cos(\Omega/2)\) at the midpoint.</li>
    <li>Ball volume grows like \(e^r\) in hyperbolic space versus \(r^d\) in Euclidean space, matching the \(b^r\) growth of a tree — hence low-distortion hierarchy embeddings.</li>
  </ul>
</div>

## References

1. do Carmo, M. P. *Riemannian Geometry*. Birkhäuser, 1992.
2. Shoemake, K. [Animating Rotation with Quaternion Curves](https://doi.org/10.1145/325334.325242). *SIGGRAPH 1985*.
3. Sarkar, R. [Low Distortion Delaunay Embedding of Trees in Hyperbolic Plane](https://doi.org/10.1007/978-3-642-25878-7_34). *Graph Drawing 2011*.
4. Nickel, M., & Kiela, D. [Poincaré Embeddings for Learning Hierarchical Representations](https://arxiv.org/abs/1705.08039). *NeurIPS 2017*.
5. Ganea, O., Bécigneul, G., & Hofmann, T. [Hyperbolic Neural Networks](https://arxiv.org/abs/1805.09112). *NeurIPS 2018*.
6. Chami, I., Ying, R., Ré, C., & Leskovec, J. [Hyperbolic Graph Convolutional Neural Networks](https://arxiv.org/abs/1910.12933). *NeurIPS 2019*.
