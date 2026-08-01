---
layout: single
title: "Gauges: When There Is No Shared Frame"
date: 2026-08-08
categories: [gdl]
book: gdl
subsection: domains
tags: [gauge-equivariance, parallel-transport, holonomy, sheaves, geometric-deep-learning]
published: true
is_overview: false
excerpt: "The previous chapter ended on an arbitrary choice that could not be eliminated. Gauge theory's answer is to stop trying: keep every local frame, transport between them explicitly, and require the model to be indifferent to which frames you picked."
author_profile: true
read_time: true
icon: "🧭"
read_mins: 9
permalink: /blog/gdl/gauges-and-local-frames/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> When each point of your domain carries its own coordinate frame and no global frame exists, comparing features at different points requires <em>transporting</em> one into the other's frame first. A <strong>gauge</strong> is a choice of local frame; gauge equivariance is the requirement that the model's predictions do not depend on that choice. This is the last domain of the blueprint, and it is also — exactly, not by analogy — what a cellular sheaf is.
</div>

## The problem, restated precisely

The [geodesics chapter](/blog/gdl/geodesics-and-manifolds/) ended stuck: building convolution on a surface needs an angular reference at every point, and no intrinsic rule supplies one.

Gauge theory reframes the difficulty as a feature. Accept that the choice is arbitrary. Make it anyway, at every point, and then insist that **nothing observable depends on what you chose**.

A **gauge** is a choice of local frame at a point. A **gauge transformation** is a change of that choice — at one point, independently of every other. A model is **gauge equivariant** when transforming the frames transforms the features correspondingly, so that anything you actually predict is unaffected.

<div class="insight-box">
<strong>The everyday version.</strong> Two weather stations report 22 and 71.6. Nothing about those numbers is comparable until you know each station's units. The <em>readings</em> are gauge-dependent — change the units and the number changes — while the <em>temperature</em> is not. A gauge-equivariant model manipulates readings in a way that always respects the conversions, so its conclusions are statements about temperature rather than about anyone's choice of scale.
</div>

## Transport, and why it does not commute

If features at $$u$$ and $$v$$ live in different frames, comparing them requires a map. Call it $$\mathcal{F}_{u \to v}$$: the **transport** taking a vector expressed in $$u$$'s frame to the same vector expressed in $$v$$'s.

Now follow a closed loop. Transport a vector from $$u$$ around some cycle and back to $$u$$. It has returned to its starting point, expressed in its original frame. Is it the vector you started with?

Not necessarily. The composition of the transports around a loop is the **holonomy**, and when it is not the identity the connection is **curved**.

Take three transports, each a 90° rotation:

<div class="formula-box">
\[
R(90^\circ)\,R(90^\circ)\,R(90^\circ) = R(270^\circ) \neq I .
\]
</div>

A vector $$(1,0)$$ sent round that loop comes back as $$(0,-1)$$ — same point, different vector. Whereas three 120° rotations compose to $$R(360^\circ) = I$$, and every vector returns unchanged: that loop is **flat**.

<div class="warning-box">
<strong>This is not a defect to be engineered away.</strong> Non-trivial holonomy is what makes the structure expressive. If every loop returned the identity, all the local frames could be reconciled into one global frame and the whole apparatus would collapse back to the ordinary case. Curvature is the information: it records that the domain cannot be described by a single consistent coordinate system.
</div>

## This is a sheaf

Everything above has a discrete counterpart, and it is the object [Book III](/blog/sheaf/overview/) is about.

| Gauge theory | Cellular sheaf |
|---|---|
| local frame at a point | stalk $$\mathcal{F}(v)$$ at a node |
| transport between frames | restriction map $$\mathcal{F}_{v \trianglelefteq e}$$ |
| gauge transformation | change of basis in a stalk |
| flat connection, zero holonomy | global section exists |
| curvature | obstruction measured by $$\Delta_{\mathcal{F}}$$ |

A cellular sheaf on a graph **is** a discrete connection. The restriction maps are the transports; a global section is an assignment consistent under all of them; and the sheaf Laplacian $$\Delta_{\mathcal{F}} = \delta_0^{\top}\delta_0$$ measures the failure of consistency, with kernel exactly the global sections.

<div class="insight-box">
<strong>Why the sheaf book sits where it does on this site.</strong> Standard message passing assumes every node's features live in one shared space — implicitly, that the connection is trivial and every transport is the identity. Sheaf neural networks drop that assumption and <em>learn</em> the transports. In blueprint terms: a GNN is permutation-equivariant, and a sheaf GNN is permutation-equivariant <em>and</em> gauge-equivariant. It is the graph row and the gauge row at once, which is why it is the most general architecture covered on this site.
</div>

The [triangle holonomy example](/blog/sheaf/overview/) in the sheaf overview is the same calculation as the rotation composition above, with restriction maps in place of rotation matrices.

## What it costs

**Parameters.** A scalar edge weight becomes a $$d \times d$$ matrix per edge. That is the price of transport being a linear map rather than a number, and it is why the sheaf literature keeps finding that *diagonal* restriction maps — $$O(d)$$ per edge rather than $$O(d^2)$$ — perform as well as full ones. Three independent papers now report it.

**Theory that does not survive contact with the architecture.** The spectral guarantees hold for the linear diffusion. Once you insert nonlinearities, attention gates, or swap the Laplacian for something else, they stop applying — as [DNSD](/blog/sheaf/dnsd-paper/) does deliberately and [BrainDyn](/blog/sheaf/braindyn-paper/) does inadvertently.

**A symmetry you may not need.** Gauge equivariance is the right constraint when the domain genuinely lacks a global frame — meshes, molecules in local coordinates, heterogeneous graphs whose node types have incomparable feature spaces. When one global frame is fine, the machinery is pure overhead.

## The blueprint, closed

That completes the five domains:

| Domain | Symmetry | Architecture |
|---|---|---|
| [Grid](/blog/gdl/grids-and-translation-equivariance/) | translation | convolution |
| [Group](/blog/gdl/groups-and-equivariance/) | any group $$G$$ | group / steerable convolution |
| [Graph](/blog/gdl/permutation-symmetry-and-message-passing/) | permutation | message passing |
| [Geodesic](/blog/gdl/geodesics-and-manifolds/) | isometry | geodesic convolution |
| Gauge | frame change | sheaf / connection Laplacian |

One procedure, five instantiations, each forced rather than invented. And running underneath, the [equivalence](/blog/gdl/transformers-are-gnns/) showing rows two and three are the same operator on different graphs — with the [hardware](/blog/gdl/the-hardware-lottery/), not the mathematics, deciding which one the field adopted.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>A gauge is a choice of local frame; gauge equivariance means predictions do not depend on the choice. It is the answer to the ambiguity the geodesics chapter could not remove.</li>
  <li>Comparing features across points requires explicit transport. Composing transports around a loop gives the holonomy.</li>
  <li>\(R(90°)^3 = R(270°) \neq I\) — a vector \((1,0)\) returns as \((0,-1)\). \(R(120°)^3 = I\) is flat. Curvature is the information, not a defect.</li>
  <li>A cellular sheaf <em>is</em> a discrete connection: stalks are frames, restriction maps are transports, global sections are flat assignments, and \(\Delta_{\mathcal{F}}\) measures the obstruction.</li>
  <li>A sheaf GNN is permutation-equivariant <em>and</em> gauge-equivariant — the graph and gauge rows simultaneously.</li>
  <li>The cost is \(d \times d\) per edge, which is why diagonal maps keep proving sufficient, and theory that applies to the linear diffusion rather than the trained network.</li>
</ul>
</div>

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv:2104.13478*.
- Cohen, T., Weiler, M., Kicanaoglu, B., & Welling, M. (2019). [Gauge Equivariant Convolutional Networks and the Icosahedral CNN](https://arxiv.org/abs/1902.04615). *ICML 2019*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Singer, A., & Wu, H.-T. (2012). [Vector Diffusion Maps and the Connection Laplacian](https://arxiv.org/abs/1102.0075). *Communications on Pure and Applied Mathematics*.
