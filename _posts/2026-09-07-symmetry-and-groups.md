---
layout: single
title: "Symmetry and Groups: Invariance, Equivariance, and Why You Build It In"
date: 2026-09-07
categories: [geometry-basics]
book: geometry-basics
subsection: symmetry
tags: [groups, equivariance, invariance, geometric-deep-learning]
excerpt: "If rotating a molecule cannot change its energy, that is a fact about the target function you know before training starts. Encoding it in the architecture makes it true everywhere; learning it from augmented data makes it approximately true where you happened to have samples."
author_profile: true
read_time: true
is_overview: false
icon: "🔁"
read_mins: 6
permalink: /blog/geometry-basics/symmetry-and-groups/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A group acting on a space partitions it into orbits. A function is <em>invariant</em> when \(f(g\cdot x) = f(x)\) — constant on orbits. It is <em>equivariant</em> when \(f(g\cdot x) = \rho(g)\, f(x)\), where \(\rho\) is how the same group acts on the output space; invariance is the case \(\rho(g) = \mathrm{id}\). Convolution is translation equivariant, message passing is permutation equivariant, and a molecular energy model should be \(SE(3)\) invariant while its force predictions are \(SE(3)\) equivariant. Building the symmetry into the architecture makes it hold exactly and everywhere; augmentation only approximates it, near the data you have.
</div>

## Groups, actions, orbits

A **group** $$(G,\cdot)$$ is a set with an associative operation, an identity $$e$$, and inverses. An **action** of $$G$$ on a set $$X$$ is a map $$G\times X\to X$$ with $$e\cdot x = x$$ and $$(gh)\cdot x = g\cdot(h\cdot x)$$ — the group's structure is faithfully reflected in how it moves points.

The **orbit** of $$x$$ is $$\mathcal{O}_x = \{g\cdot x : g\in G\}$$: everything reachable from $$x$$ by a symmetry. Orbits partition $$X$$, which gives the cleanest description of invariance — an invariant function is one that is constant on every orbit, i.e. a function on the quotient $$X/G$$ rather than on $$X$$.

The three groups worth knowing cold:

| Group | Acts on | Elements |
|---|---|---|
| $$\mathbb{Z}^2$$ (translations) | image grids | integer shifts |
| $$S_n$$ (permutations) | node sets, sets | relabellings, $$n!$$ of them |
| $$SE(3)$$ | point clouds in $$\mathbb{R}^3$$ | rotation $$R\in SO(3)$$ plus translation $$t$$ |

## The two definitions, precisely

Let $$G$$ act on the input space $$X$$ and on the output space $$Y$$. A map $$f: X\to Y$$ is

<div class="formula-box">
\[
\textbf{invariant:}\quad f(g\cdot x) = f(x)\quad \forall g\in G,\ \forall x\in X,
\]
\[
\textbf{equivariant:}\quad f(g\cdot x) = \rho(g)\, f(x)\quad \forall g\in G,\ \forall x\in X,
\]
</div>

where $$\rho$$ is the action (a representation, when $$Y$$ is a vector space) of $$G$$ on $$Y$$. Equivariance says $$f$$ commutes with the symmetry: transform-then-predict equals predict-then-transform. Invariance is the special case $$\rho(g)=\mathrm{id}$$ for all $$g$$.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="sym-cd-title sym-cd-desc" viewBox="0 0 470 250" style="max-width:470px;width:100%;height:auto">
  <title id="sym-cd-title">Commuting square defining equivariance</title>
  <desc id="sym-cd-desc">A square diagram with four corners. Top left is the input x, top right is f of x, reached by an arrow labelled f. Bottom left is g acting on x, reached from the top left by a downward arrow labelled "act with g". Bottom right is f of g acting on x, reached from the bottom left by another arrow labelled f, and also reached from the top right by a downward arrow labelled rho of g. Equivariance is the statement that both routes from top left to bottom right agree. A note says invariance is the case where rho of g is the identity, making the right-hand arrow do nothing.</desc>
  <rect x="1" y="1" width="468" height="248" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g font-size="13" font-weight="700" fill="#0c4a6e" text-anchor="middle">
    <text x="95" y="62">x</text>
    <text x="345" y="62">f(x)</text>
    <text x="95" y="182">g · x</text>
    <text x="345" y="182">f(g · x)</text>
  </g>
  <g stroke="#334155" stroke-width="1.6" fill="none" marker-end="url(#symArr)">
    <line x1="130" y1="57" x2="300" y2="57"/>
    <line x1="130" y1="177" x2="292" y2="177"/>
    <line x1="95" y1="76" x2="95" y2="152"/>
    <line x1="345" y1="76" x2="345" y2="152"/>
  </g>
  <defs>
    <marker id="symArr" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#334155"/></marker>
  </defs>
  <g font-size="11" font-weight="700" fill="#0e7490" text-anchor="middle">
    <text x="215" y="46">f</text>
    <text x="215" y="200">f</text>
  </g>
  <text x="60" y="118" font-size="11" font-weight="700" fill="#c2410c" text-anchor="middle">act with g</text>
  <text x="382" y="118" font-size="11" font-weight="700" fill="#c2410c">ρ(g)</text>
  <text x="235" y="228" font-size="10.5" fill="#475569" text-anchor="middle">invariance is this square with ρ(g) = id — the right-hand arrow does nothing</text>
</svg>
<figcaption>Notice that equivariance needs <em>two</em> actions, one per space. Saying a model "is equivariant" without naming the output action is an incomplete statement.</figcaption>
</figure>
</div>

## The three cases that come up

**Translation in CNNs.** For a signal $$x:\mathbb{Z}^2\to\mathbb{R}$$ and shift $$(T_v x)(u) = x(u-v)$$, cross-correlation with a kernel $$\psi$$ satisfies $$(T_v x)\star\psi = T_v(x\star\psi)$$. A convolution layer is translation *equivariant*: shift the input and the feature map shifts identically. Invariance appears only when you collapse the spatial axes — global pooling, or in practice the classifier head. In real networks the equivariance is approximate: striding and pooling alias, so it holds exactly only for shifts that are multiples of the stride, and padding breaks it at the borders.

**Permutation in GNNs and set models.** With node features $$X\in\mathbb{R}^{n\times d}$$, adjacency $$A$$, and a permutation matrix $$P$$, a message-passing layer $$F$$ satisfies

<div class="formula-box">
\[
F\!\left(PX,\, PAP^\top\right) = P\,F(X, A)
\quad\text{(equivariant)},\qquad
\rho\!\left(PX,\, PAP^\top\right) = \rho(X, A)
\quad\text{(invariant readout)}.
\]
</div>

Node-level predictions must be equivariant — relabel the nodes and the predictions come along. Graph-level predictions must be invariant, which is what the sum/mean/max readout provides. The same split governs Deep Sets and set transformers.

**$$SE(3)$$ in molecular models.** A potential energy is invariant, $$E(Rx+t) = E(x)$$, while forces are equivariant, $$F(Rx+t) = R\,F(x)$$ — a rotated molecule feels rotated forces. There is a neat consistency here: since $$F = -\nabla_x E$$, the gradient of an $$SE(3)$$-invariant scalar is automatically equivariant, so getting the energy right gets the forces right by construction. See the GNN book's posts on [equivariance](/blog/gnn/equivariance/), [EGNN](/blog/gnn/egnn/) and [SE(3) transformers](/blog/gnn/se3-transformers/) for the architectures.

<div class="insight-box">
  <strong>Key Insight — why constraints beat augmentation:</strong> an invariant model does not learn a function on \(X\), it learns one on the quotient \(X/G\). For a finite group acting freely that shrinks the effective input space by a factor of \(\lvert G\rvert\); for \(SE(3)\) it removes a six-dimensional family of variation per example. Augmentation attacks the same problem from the other side — it asks the model to <em>discover</em> the symmetry from samples, so the constraint holds only near the data, costs capacity that is spent memorising the group, and gives nothing on inputs far from the training distribution. Elesedy and Zaidi (2021) make the gap precise for linear models and group-averaged predictors: the equivariant model has strictly lower generalisation error, and the size of the improvement grows with the group.
</div>

The counter-argument is real too. A symmetry that is only approximately true in the data — near-symmetry, or a symmetry broken by context, like gravity breaking full rotational symmetry for a robot — is expensive to hard-code and can hurt. Constraints are priors: correct ones help, wrong ones bite.

<div class="warning-box">
  <strong>Interview trap:</strong> two mistakes, both common. (1) Calling a convolution layer translation <em>invariant</em>. It is equivariant; invariance comes from pooling. (2) Making a network invariant too early. A segmentation head must be equivariant — an invariant intermediate representation has thrown away the position information the task needs. Ask what the output <em>should</em> do under the group before deciding which property you want.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>An action satisfies \(e\cdot x = x\) and \((gh)\cdot x = g\cdot(h\cdot x)\); orbits partition the space, and invariant functions are exactly functions on the quotient.</li>
    <li>Invariance: \(f(g\cdot x) = f(x)\). Equivariance: \(f(g\cdot x) = \rho(g)f(x)\). Invariance is equivariance with the trivial output representation.</li>
    <li>Convolution is translation equivariant (approximately so under striding); message passing is permutation equivariant, with an invariant readout for graph-level tasks.</li>
    <li>Molecular energies are \(SE(3)\) invariant, forces are \(SE(3)\) equivariant, and \(F = -\nabla E\) makes the second follow from the first.</li>
    <li>Built-in symmetry holds exactly and everywhere; augmentation only approximates it near the training data and spends capacity doing so.</li>
  </ul>
</div>

That closes the book — back to the [overview](/blog/geometry-basics/overview/) for the map of all seven posts.

## References

1. Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv:2104.13478*, 2021.
2. Cohen, T., & Welling, M. [Group Equivariant Convolutional Networks](https://arxiv.org/abs/1602.07576). *ICML 2016*.
3. Zaheer, M., Kottur, S., Ravanbakhsh, S., Poczos, B., Salakhutdinov, R., & Smola, A. [Deep Sets](https://arxiv.org/abs/1703.06114). *NeurIPS 2017*.
4. Satorras, V. G., Hoogeboom, E., & Welling, M. [E(n) Equivariant Graph Neural Networks](https://arxiv.org/abs/2102.09844). *ICML 2021*.
5. Elesedy, B., & Zaidi, S. [Provably Strict Generalisation Benefit for Equivariant Models](https://arxiv.org/abs/2102.10333). *ICML 2021*.
6. Zhang, R. [Making Convolutional Networks Shift-Invariant Again](https://arxiv.org/abs/1904.11486). *ICML 2019*.
