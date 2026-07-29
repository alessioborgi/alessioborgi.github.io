---
layout: single
title: "Diagonal, Orthogonal, and General Sheaf Maps"
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf-maps, diagonal, orthogonal, general, expressivity, scalability]
published: true
excerpt: "The restriction maps in a cellular sheaf can be constrained to different matrix classes: scalars, diagonal matrices, orthogonal matrices, or general matrices. Each class offers a different trade-off between expressivity and computational cost."
author_profile: true
read_time: true
is_overview: false
icon: "🎛️"
read_mins: 8
permalink: /blog/gnn/sheaf-map-types/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Restriction maps \(\mathcal{F}_{v \trianglelefteq e}\) can be scalars (\(d = 1\)), diagonal (\(d\) degrees of freedom), orthogonal (\(d(d-1)/2\)), or general \(d \times d\) matrices (\(d^2\)). General maps are the most flexible but the hardest to normalise and the easiest to overfit. Orthogonal maps are often the sweet spot: they mix the stalk coordinates, they constrain the model, and they make the Laplacian's diagonal blocks collapse to \(\deg(v) I_d\).
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="Sheaf map types comparison" caption="Restriction map types in neural sheaf diffusion (Bodnar et al., 2022)" %}


## The Design Space of Restriction Maps

**Intuition First:** Think of the four map types as four ways to describe the relationship between two people's views of the same object. A scalar map says "person B sees things three times more intensely than person A — and possibly with the opposite sign." A diagonal map says "person B weights each channel differently." An orthogonal map says "person B is looking from a rotated angle — same information, different frame." A general map says "person B's perception is an arbitrary linear combination of person A's." The richer the class, the more relationships the sheaf can represent — and the more numbers the predictor must output per edge.

In Neural Sheaf Diffusion the predictor $$\Phi$$ outputs a restriction map $$\mathcal{F}_{v \trianglelefteq e}$$ for each *incidence* (node, incident edge) — so two maps per undirected edge. The counts below are the degrees of freedom of the matrix $$\Phi$$ must produce, which fixes its output width; they are not free parameters stored per edge.

## Scalar Maps ($$d = 1$$)

<div class="formula-box">
\[
\mathcal{F}_{v \trianglelefteq e} \in \mathbb{R} \qquad (\text{one real number per incidence})
\]
</div>

**Degrees of freedom per incidence:** 1. All stalks are $$\mathbb{R}$$, so the sheaf Laplacian is $$n \times n$$.

**What it represents:** a signed edge weight. The off-diagonal block reduces to

<div class="formula-box">
\[
(L_{\mathcal{F}})_{vu} \;=\; -\,\mathcal{F}_{v \trianglelefteq e}\,\mathcal{F}_{u \trianglelefteq e},
\]
</div>

so the transport along the edge is $$\mathcal{F}_{v \trianglelefteq e}\mathcal{F}_{u \trianglelefteq e}$$ — positive for "these should agree", negative for "these should be opposite".

**Connection to existing models:** if the two endpoint maps are forced to be *equal*, the resulting operators are exactly the positively-weighted graph Laplacians — the family GCN and ChebNet already use. Allowing them to differ in sign is what buys anything new, and it recovers signed-attention models such as FAGCN rather than GAT (whose softmax weights cannot be negative).

**Limitation:** the harmonic space of a $$d = 1$$ sheaf is at most one-dimensional, so no scalar sheaf can linearly separate three or more classes in the diffusion limit, no matter how the signs are chosen. That is the argument for widening the stalks.

## Diagonal Maps

<div class="formula-box">
\[
\mathcal{F}_{v \trianglelefteq e} = \operatorname{diag}(f_1, \dots, f_d) \in \mathbb{R}^{d \times d}
\qquad (d \text{ degrees of freedom})
\]
</div>

**What it represents:** per-coordinate scaling and sign flipping — a set of $$d$$ independent scalar sheaves stacked into one.

**Sheaf Laplacian block:** $$(L_{\mathcal{F}})_{vu} = -\operatorname{diag}(f^v_1 f^u_1, \dots, f^v_d f^u_d)$$, itself diagonal. The Laplacian therefore decouples across the $$d$$ stalk coordinates: they interact only through the left multiplication by $$W_1$$ in the NSD layer.

**Advantage:** $$O(d)$$ outputs per incidence instead of $$O(d^2)$$, diagonal blocks, and cheaper sparse products.

**Separation capacity:** since a diagonal sheaf is $$d$$ independent scalar sheaves, a one-vs-all construction shows that $$d \ge C$$ suffices to linearly separate $$C$$ classes — expressive, but only by spending stalk width.

**Limitation:** no coupling between stalk coordinates inside the operator. What node $$u$$ means by coordinate 1 is what node $$v$$ means by coordinate 1; only magnitudes and signs differ, not directions.

## Orthogonal Maps

<div class="formula-box">
\[
\mathcal{F}_{v \trianglelefteq e} \in O(d) = \left\{ Q \in \mathbb{R}^{d \times d} : Q^{\top} Q = I_d \right\}
\]
</div>

**Degrees of freedom per incidence:** $$d(d-1)/2$$, the dimension of the Lie group $$O(d)$$. In NSD these are realised as a composition of Householder reflections.

**What it represents:** rotations and reflections — a rigid change of frame.

**Key property:** $$\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e} = I_d$$, so the diagonal blocks collapse:

<div class="formula-box">
\[
(L_{\mathcal{F}})_{vv} = \sum_{v \trianglelefteq e} \mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e} = \deg(v)\, I_d .
\]
</div>

This makes the normalisation $$D^{-1/2}$$ trivial — $$D$$ is just the degrees — whereas for general maps it requires the inverse square root of a genuine positive semi-definite block matrix.

<div class="insight-box">
<strong>Why orthogonal maps are special:</strong> with orthogonal restriction maps the off-diagonal block is \((L_{\mathcal{F}})_{vu} = -Q_v^{\top} Q_u\), itself an orthogonal matrix (a rotation or a reflection, depending on the determinants). It expresses how much the feature frames of \(u\) and \(v\) are rotated relative to one another. Sheaf diffusion with orthogonal maps is diffusion on a graph where each node carries its own coordinate frame and each edge specifies the frame change — the discrete analogue of a connection Laplacian in differential geometry.
</div>

**Separation capacity:** orthogonal maps use the available stalk space more efficiently than diagonal ones. Bodnar et al. show that $$C \le 2d$$ classes can be separated with $$O(d)$$-bundles (proved for $$d \in \{2, 4\}$$), against $$d \ge C$$ for diagonal maps.

**Connection geometry:** a sheaf with orthogonal restriction maps is a **discrete $$O(d)$$-bundle** — a discrete analogue of a vector bundle with orthogonal structure group, where the maps play the role of parallel transport. It is *flat* only when the holonomy around every cycle is the identity; that is a property a given sheaf may or may not have, not part of the definition. This is what gives orthogonal sheaf GNNs a foothold in differential geometry, and it is developed further in the post on equivariant sheaf GNNs.

## General Linear Maps

<div class="formula-box">
\[
\mathcal{F}_{v \trianglelefteq e} \in \mathbb{R}^{d_e \times d} \qquad (d_e \cdot d \text{ degrees of freedom})
\]
</div>

**Degrees of freedom per incidence:** $$d^2$$ for square $$d \times d$$ maps.

**What it represents:** arbitrary linear transformations — mixing, scaling, rotating, and projecting features. Any linear relationship between the two endpoint stalks is representable.

**Costs:** $$O(d^2)$$ outputs per incidence, dense blocks, $$O(\lvert E \rvert d^2)$$ storage for the Laplacian — and, more awkwardly, the normalisation requires computing $$D^{-1/2}$$ for a positive semi-definite block matrix rather than reading off degrees. Maximal flexibility also brings the highest risk of overfitting, which is why the most general class is not automatically the best-performing one.

## Summary Comparison

| Map type | DoF per incidence | Stalk-coordinate coupling | Geometric meaning | Classes separable |
|----------|------------------|--------------------------|-------------------|-------------------|
| Scalar ($$d=1$$) | 1 | n/a | Signed edge weight | $$\le 2$$ |
| Diagonal | $$d$$ | None (only via $$W_1$$) | Per-coordinate scaling and sign | $$C \le d$$ |
| Orthogonal | $$d(d-1)/2$$ | Full | Frame rotation / reflection | $$C \le 2d$$ |
| General | $$d^2$$ | Full | Arbitrary linear | — |

## Practical Recommendations

**Use diagonal maps when:** the graph is large, the Laplacian must be cheap to build and multiply, and per-coordinate scaling with sign flips is enough. In practice this class is surprisingly competitive.

**Use orthogonal maps when:** the geometry of the feature space matters, numerical stability of the normalisation matters, or the connection-Laplacian interpretation is useful. In the NSD experiments the $$O(d)$$-bundle model was the strongest overall.

**Use general maps when:** you have reason to believe the task needs feature mixing that a rigid frame change cannot express, and you have enough data to avoid overfitting.

<div class="insight-box"><strong>Key Insight:</strong> More expressive is not automatically better. General maps strictly contain the orthogonal ones, yet in the NSD benchmarks the \(O(d)\)-bundle and diagonal variants matched or beat the general one. Two reasons: the orthogonality constraint acts as a regulariser, and \(\mathcal{F}^{\top}\mathcal{F} = I\) makes the Laplacian's normalisation exact and numerically clean instead of an inverse square root that must be approximated. Choose the smallest class that can express the relationship you actually need.</div>

## Impact on Sheaf Laplacian Sparsity

For every map type the sheaf Laplacian has the same *block* sparsity pattern as the graph Laplacian: an $$(nd) \times (nd)$$ matrix with at most $$2\lvert E \rvert$$ off-diagonal blocks plus $$n$$ diagonal blocks. What changes is the density inside each block.

- **Diagonal maps:** each block is diagonal, so the whole operator is sparse even in the expanded $$nd$$ indexing.
- **Orthogonal maps:** off-diagonal blocks are dense, but the diagonal blocks are $$\deg(v) I_d$$ and cost nothing to store.
- **General maps:** every block is dense, giving $$O(\lvert E \rvert d^2)$$ storage.

## References

- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (defines the hierarchy of symmetric, diagonal, orthogonal, and general restriction maps, with the separation results and the empirical comparison quoted above).
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology* (spectral properties of sheaf Laplacians that the map classes inherit).
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 Workshop on Topology, Algebra, and Geometry in Machine Learning* (computes orthogonal restriction maps geometrically instead of learning them end-to-end, cutting the cost and the overfitting risk of fully learned maps).
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., & Liò, P. (2022). [Sheaf Attention Networks](https://neurips.cc/virtual/2022/60824). *NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations* (combines restriction maps with attention, trading some of the cost of dense maps for a sparser, attention-weighted operator).
