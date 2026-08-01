---
layout: single
title: "Groups: Equivariance Beyond Translation"
date: 2026-08-06
categories: [gdl]
book: gdl
subsection: domains
tags: [group-equivariance, rotation, steerable-cnn, e3nn, geometric-deep-learning]
published: true
is_overview: false
excerpt: "Translation is one group. Swap it for rotations, reflections, or the rigid motions of 3-D space and the same construction produces a different architecture — with the parameter count cut by exactly the size of the orbit."
author_profile: true
read_time: true
icon: "🔄"
read_mins: 8
permalink: /blog/gdl/groups-and-equivariance/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> The previous chapter derived convolution from translation. Nothing in the derivation was specific to translation — it used only that shifts form a group. Replace that group and the machinery still runs: rotations give rotation-equivariant filters, rigid motions of \(\mathbb{R}^3\) give the architectures used for molecules. The cost is precise and computable: weights must be constant on each orbit of the group, so a \(3\times3\) filter under 90° rotations drops from 9 free parameters to exactly 3.
</div>

## The generalisation

A group $$G$$ acting on a domain gives, for each $$g \in G$$, a way of transforming a signal. Translation was the case $$G = \mathbb{Z}_n$$. A layer $$L$$ is equivariant when

<div class="formula-box">
\[
L \, \rho(g) \;=\; \rho(g) \, L \qquad \text{for every } g \in G ,
\]
</div>

where $$\rho(g)$$ is how $$g$$ acts on the representation. For translation this was $$LS = SL$$ with a single generator; for a bigger group it is one equation per generator.

The consequence generalises too. Commuting with every group element forces the weights to be **constant on orbits** — where the orbit of a position is the set of places the group can move it to. Translation on a cycle has one orbit (you can shift anything anywhere), which is why a circulant matrix has one free value per diagonal. Richer groups partition the domain into more orbits, and each orbit contributes one free parameter.

## Counting: a 3×3 filter under 90° rotations

Take $$G = C_4$$, the four rotations by multiples of 90°, acting on the nine cells of a $$3 \times 3$$ filter. Rotation sends the offset $$(dx, dy)$$ to $$(-dy, dx)$$. Applying it repeatedly partitions the cells:

| orbit | cells | size |
|---|---|---|
| corners | $$(-1,-1), (-1,1), (1,-1), (1,1)$$ | 4 |
| edges | $$(-1,0), (0,-1), (0,1), (1,0)$$ | 4 |
| centre | $$(0,0)$$ | 1 |

Three orbits. So a rotation-equivariant $$3 \times 3$$ filter has **3 free parameters instead of 9** — one shared by the four corners, one by the four edge cells, one for the centre. The constraint is exact and the arithmetic is checkable: $$4 + 4 + 1 = 9$$ cells in $$3$$ orbits.

<div class="insight-box">
<strong>This is the same trade in both directions.</strong> Fewer parameters means less to overfit and less to learn — good when the symmetry is real. But those parameters are gone, not merely regularised: a rotation-equivariant filter <em>cannot</em> represent a feature that distinguishes up from down. If your task depends on orientation, you have removed the very capacity you need, and no amount of data recovers it.
</div>

Adding reflections gives the eight-element group $$D_4$$, which merges orbits further and constrains more. Both appear in the literature as `p4` and `p4m` group convolutions.

## Two ways to build them

**Group convolution** takes the direct route: instead of a feature map over positions, keep one over *position–group-element pairs*, and convolve over the group. Every rotated copy of a filter is applied, and the responses are carried along as separate channels. Straightforward, and the cost is a factor of $$\lvert G \rvert$$ in memory and compute.

**Steerable methods** avoid materialising the copies. Rather than storing every rotation of a filter, they build filters from a basis on which the group acts in a known way, so a rotation of the input becomes a *predictable mixing* of the output channels rather than a re-computation. The bookkeeping is heavier — it is where irreducible representations and spherical harmonics enter — but nothing is duplicated.

## Continuous groups, and where they matter

For point clouds and molecules the relevant group is continuous: $$SE(3)$$, the rotations and translations of 3-D space, or $$E(3)$$ if you also allow reflections. Here equivariance is not a convenience, it is a correctness requirement — a predicted force must rotate with the molecule, and a predicted energy must not change at all.

Book II's geometric subsection covers the architectures: [E(n)-equivariant GNNs](/blog/gnn/egnn/), [SE(3)-Transformers](/blog/gnn/se3-transformers/), and [tensor field networks](/blog/gnn/tensor-field-networks/). Two points from there that belong here:

- **Energies are invariant, forces are equivariant.** Getting these the wrong way round is the standard error, and the [blueprint chapter](/blog/gdl/overview/) sets out the distinction.
- **$$E(n)$$ includes reflections and $$SE(n)$$ does not**, so an $$E(n)$$-equivariant model is blind to chirality. For molecules, where mirror-image compounds can behave differently, that blindness is a real modelling decision rather than a technicality.

<div class="warning-box">
<strong>The group must be known in advance, and being wrong about it is expensive.</strong> Equivariance is a hard architectural constraint, not a soft prior. Build in a symmetry the data does not have and you have permanently removed the capacity to model the asymmetry — the network cannot learn its way out. Build in a symmetry the data does have and you get a genuine reduction in what must be learned. Conversely, a Transformer assumes almost nothing about which pairs interact, which is why the <a href="/blog/gdl/the-hardware-lottery/">last chapter</a> finds it winning when data and compute are plentiful.
</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Equivariance generalises from \(LS = SL\) to \(L\rho(g) = \rho(g)L\) for every \(g\) in a group. Nothing in the grid derivation was specific to translation.</li>
  <li>Weights become constant on orbits. Free parameters = number of orbits, and this is exact arithmetic, not an estimate.</li>
  <li>A \(3\times3\) filter under 90° rotations has 3 orbits — corners, edges, centre — so 3 free parameters instead of 9.</li>
  <li>Group convolution materialises every transformed filter and costs a factor of \(\lvert G \rvert\); steerable methods avoid the duplication at the price of representation-theoretic bookkeeping.</li>
  <li>For molecules the group is \(SE(3)\) or \(E(3)\), and equivariance is a correctness requirement: energies invariant, forces equivariant. \(E(n)\) includes reflections, so it cannot see chirality.</li>
  <li>Equivariance is a hard constraint. Assume the wrong group and the lost capacity cannot be trained back.</li>
</ul>
</div>

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv:2104.13478*.
- Cohen, T., & Welling, M. (2016). [Group Equivariant Convolutional Networks](https://arxiv.org/abs/1602.07576). *ICML 2016*.
- Cohen, T. S., & Welling, M. (2017). [Steerable CNNs](https://arxiv.org/abs/1612.08498). *ICLR 2017*.
- Thomas, N., Smidt, T., Kearnes, S., Yang, L., Li, L., Kohlhoff, K., & Riley, P. (2018). [Tensor Field Networks](https://arxiv.org/abs/1802.08219). *arXiv:1802.08219*.
- Satorras, V. G., Hoogeboom, E., & Welling, M. (2021). [E(n) Equivariant Graph Neural Networks](https://arxiv.org/abs/2102.09844). *ICML 2021*.
