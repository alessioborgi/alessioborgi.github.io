---
layout: single
title: "Curvature: Why a Flat Map of the Earth Must Lie"
date: 2026-09-04
categories: [geometry-basics]
book: geometry-basics
subsection: differential
tags: [curvature, differential-geometry, surfaces, theorema-egregium]
excerpt: "Curvature at a point is one over the radius of the circle that best hugs the curve there. Push that idea up to surfaces and Gauss's Theorema Egregium falls out: some curvature is visible from inside the surface, which is why no map projection can ever get distances right."
author_profile: true
read_time: true
is_overview: false
icon: "🌀"
read_mins: 6
permalink: /blog/geometry-basics/curvature/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> For a plane curve, curvature is \(\kappa = 1/r\) where \(r\) is the radius of the best-fitting circle — a circle of radius \(r\) has curvature \(1/r\) everywhere, a straight line has curvature \(0\). On a surface there are two principal curvatures \(\kappa_1,\kappa_2\); their product \(K = \kappa_1\kappa_2\) is the Gaussian curvature and their average \(H = (\kappa_1+\kappa_2)/2\) is the mean curvature. Gauss's Theorema Egregium says \(K\) is <em>intrinsic</em>: an ant confined to the surface could measure it, and it is unchanged by any bending that does not stretch. \(H\) is not. That single asymmetry is why a cylinder can be rolled from flat paper and a sphere cannot, and why every world map distorts.
</div>

## Curves, arc length, tangents

A parameterised curve is a smooth map $\gamma:[a,b]\to\mathbb{R}^n$. Its velocity $\gamma'(t)$ is the tangent vector, its speed is $\lVert\gamma'(t)\rVert$, and arc length is the integral of speed:

<div class="formula-box">
\[
s(t) = \int_a^t \lVert \gamma'(\tau)\rVert\, d\tau .
\]
</div>

Parameterisation is a choice, arc length is not — traverse the same track twice as fast and $\gamma'$ doubles while $s$ is unchanged. Reparameterising by arc length gives unit speed, $\lVert\gamma'(s)\rVert = 1$, and then the tangent $T = \gamma'$ only rotates, never lengthens. Curvature is exactly the rate of that rotation:

<div class="formula-box">
\[
\kappa(s) = \lVert T'(s)\rVert .
\]
</div>

In the usual non-unit-speed parameterisation $\gamma(t) = (x(t), y(t))$ this becomes $\kappa = \lvert x'y'' - y'x''\rvert/(x'^2+y'^2)^{3/2}$, and for a graph $y = f(x)$,

<div class="formula-box">
\[
\kappa = \frac{\lvert f''(x)\rvert}{\left(1 + f'(x)^2\right)^{3/2}} .
\]
</div>

Check it on a circle of radius $r$: with $\gamma(t) = (r\cos t, r\sin t)$ the numerator is $r^2$ and the denominator is $(r^2)^{3/2} = r^3$, giving $\kappa = 1/r$. Small circles curve hard. The reciprocal $1/\kappa$ is the radius of curvature, and the circle of that radius tangent to the curve is the osculating circle.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="curv-osc-title curv-osc-desc" viewBox="0 0 440 262" style="max-width:440px;width:100%;height:auto">
  <title id="curv-osc-title">Osculating circle of the parabola y equals x squared over two at the origin</title>
  <desc id="curv-osc-desc">The parabola y equals x squared over two is drawn in orange between x equals minus two and plus two. At the origin a teal circle of radius one, centred at the point (0, 1), touches the parabola and matches its bending. The caption notes that the curvature there is one over one, equal to one, while at x equals one the curvature has dropped to 0.354, a radius of curvature of 2.83.</desc>
  <rect x="1" y="1" width="438" height="260" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="40" y1="220" x2="410" y2="220" stroke="#cbd5e1" stroke-width="1"/>
  <line x1="220" y1="35" x2="220" y2="240" stroke="#cbd5e1" stroke-width="1"/>
  <circle cx="220" cy="150" r="70" fill="none" stroke="#0e7490" stroke-width="2"/>
  <line x1="220" y1="150" x2="220" y2="220" stroke="#0e7490" stroke-width="1.2" stroke-dasharray="4 3"/>
  <circle cx="220" cy="150" r="3" fill="#0e7490"/>
  <path d="M80,80 Q220,360 360,80" fill="none" stroke="#c2410c" stroke-width="2.4"/>
  <circle cx="220" cy="220" r="3.4" fill="#c2410c"/>
  <text x="228" y="186" font-size="10.5" fill="#0e7490">r = 1/κ = 1</text>
  <text x="300" y="112" font-size="11" font-weight="700" fill="#c2410c">y = x²/2</text>
  <text x="112" y="140" font-size="11" font-weight="700" fill="#0e7490">osculating circle</text>
  <text x="150" y="243" font-size="10.5" fill="#334155">κ(0) = 1</text>
  <text x="262" y="243" font-size="10.5" fill="#334155">κ(1) = 0.354</text>
</svg>
<figcaption>Notice that curvature is a local quantity: the same parabola has \(\kappa = 1\) at the origin and only \(0.354\) one unit to the right, because \(\kappa = \lvert f''\rvert/(1+f'^2)^{3/2}\) is damped by the slope.</figcaption>
</figure>
</div>

## Surfaces and the first fundamental form

Parameterise a surface as $\mathbf{r}(u,v)$. The tangent plane at a point is spanned by $$\mathbf{r}_u$$ and $$\mathbf{r}_v$$, and all *intrinsic* measurement — lengths of curves drawn on the surface, angles between them, areas — is governed by three functions:

<div class="formula-box">
\[
E = \mathbf{r}_u\!\cdot\!\mathbf{r}_u,\quad
F = \mathbf{r}_u\!\cdot\!\mathbf{r}_v,\quad
G = \mathbf{r}_v\!\cdot\!\mathbf{r}_v,
\qquad
ds^2 = E\,du^2 + 2F\,du\,dv + G\,dv^2 .
\]
</div>

This is the first fundamental form: the inner product of the ambient space, restricted to the tangent plane and written in the $(u,v)$ coordinates. It is precisely what the surface-dwelling ant can measure with a ruler and a protractor, without ever leaving the surface.

The *second* fundamental form, by contrast, involves the unit normal and records how the surface bends away from its tangent plane — information about the embedding, invisible from inside. Its eigenvalues are the principal curvatures $\kappa_1, \kappa_2$: the maximum and minimum curvature over all normal slices through the point.

## Gaussian versus mean curvature

<div class="formula-box">
\[
K = \kappa_1\kappa_2 \qquad\text{(Gaussian)},\qquad
H = \tfrac{1}{2}(\kappa_1 + \kappa_2) \qquad\text{(mean)}.
\]
</div>

| Surface | $\kappa_1$ | $\kappa_2$ | $K$ | $H$ |
|---|---|---|---|---|
| Plane | $0$ | $0$ | $0$ | $0$ |
| Cylinder, radius $R$ | $1/R$ | $0$ | $0$ | $1/(2R)$ |
| Sphere, radius $R$ | $1/R$ | $1/R$ | $1/R^2$ | $1/R$ |
| Saddle | $>0$ | $<0$ | $<0$ | depends |

The cylinder is the row that carries the argument. It obviously looks curved, and $H \neq 0$ confirms that — but $K = 0$, the same as a flat plane. And indeed you can roll a flat sheet of paper into a cylinder without stretching or tearing it. Bending is free; stretching is not.

## Theorema Egregium, stated plainly

**Gauss's Theorema Egregium (1827).** The Gaussian curvature $K$ of a surface is determined entirely by the first fundamental form — by $E$, $F$, $G$ and their first and second derivatives. Consequently $K$ is preserved by any local isometry: if two surfaces are locally isometric, corresponding points have equal Gaussian curvature.

"Remarkable" was Gauss's own word, and the surprise is genuine: $K$ was *defined* as a product of two extrinsic quantities, yet it turns out to be measurable from inside. The ant can determine $K$ without knowing the surface is embedded in anything at all — for instance by comparing the circumference of a small geodesic circle of radius $\rho$ against $2\pi\rho$, which comes up short on a sphere and long on a saddle.

<div class="insight-box">
  <strong>Key Insight — why every world map distorts:</strong> a sphere of radius \(R\) has \(K = 1/R^2 > 0\) everywhere; a sheet of paper has \(K = 0\) everywhere. A map projection that preserved all distances would be a local isometry, and by the Theorema Egregium a local isometry must preserve \(K\). Since \(1/R^2 \neq 0\), no such projection exists — not because cartographers have not tried hard enough, but as a theorem. Every projection therefore picks what to sacrifice: Mercator preserves angles and wrecks areas, which is why Greenland (2.17 million km²) looks comparable to Africa (30.4 million km², about fourteen times larger).
</div>

<div class="warning-box">
  <strong>Interview trap:</strong> do not treat "curved" as one property. Mean curvature is extrinsic — it changes when you bend the surface in space and it depends on the choice of normal direction, so its sign flips if you flip the normal. Gaussian curvature is intrinsic and sign-unambiguous. A cylinder has \(H \neq 0\) but \(K = 0\), and any statement that "a cylinder is curved" needs to say which curvature is meant.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Arc length \(s = \int\lVert\gamma'\rVert\) is parameterisation-independent; curvature of a unit-speed curve is \(\kappa = \lVert T'\rVert\), and for \(y=f(x)\), \(\kappa = \lvert f''\rvert/(1+f'^2)^{3/2}\). A circle of radius \(r\) has \(\kappa = 1/r\).</li>
    <li>The first fundamental form \(ds^2 = E\,du^2 + 2F\,du\,dv + G\,dv^2\) captures everything measurable from inside the surface.</li>
    <li>\(K = \kappa_1\kappa_2\) is intrinsic; \(H = (\kappa_1+\kappa_2)/2\) is extrinsic. Cylinder: \(K = 0\), \(H = 1/(2R)\).</li>
    <li>Theorema Egregium: \(K\) is computable from the first fundamental form alone, hence invariant under local isometry. Sphere \(K = 1/R^2 \neq 0 = K_{\text{plane}}\), so a distance-preserving flat map cannot exist.</li>
  </ul>
</div>

Curvature was defined here for surfaces sitting in $\mathbb{R}^3$. [Manifolds and tangent spaces](/blog/geometry-basics/manifolds-and-tangent-spaces/) drops the ambient space, and [Riemannian geometry](/blog/geometry-basics/riemannian-geometry/) rebuilds all of this from the metric alone.

## References

1. do Carmo, M. P. *Differential Geometry of Curves and Surfaces*, 2nd ed. Dover, 2016.
2. Pressley, A. *Elementary Differential Geometry*, 2nd ed. Springer, 2010.
3. Gauss, C. F. *Disquisitiones generales circa superficies curvas*. Göttingen, 1828 (English translation: *General Investigations of Curved Surfaces*, Princeton, 1902).
