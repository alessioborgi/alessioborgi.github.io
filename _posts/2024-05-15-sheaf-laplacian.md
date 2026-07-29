---
layout: single
title: "The Sheaf Laplacian: Spectral Theory for Sheaves"
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf-laplacian, spectral, coboundary, Dirichlet-energy, diffusion]
published: true
excerpt: "The Sheaf Laplacian generalises the graph Laplacian by incorporating per-edge restriction maps. Its spectrum reveals how consistent data is under the sheaf. Sheaf diffusion with this Laplacian generalises GCN to handle heterophilic graphs."
author_profile: true
read_time: true
is_overview: false
icon: "📐"
read_mins: 8
permalink: /blog/gnn/sheaf-laplacian/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> The sheaf Laplacian \(L_{\mathcal{F}} = \delta^{\top}\delta\) is a block matrix built from the restriction maps of a sheaf. Its \((v,u)\) off-diagonal block is \(-\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}\). It is positive semi-definite, its kernel is the space of global sections \(H^0(G;\mathcal{F})\), and sheaf diffusion \(X \leftarrow (I - \Delta_{\mathcal{F}})X\) generalises GCN to accommodate feature transformations at edges.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_laplacian.png" alt="Sheaf Laplacian block matrix" caption="The Sheaf Laplacian block-matrix structure (Bodnar et al., 2022)" %}


## Constructing the Sheaf Laplacian

**Intuition First:** The standard graph Laplacian penalises adjacent nodes for being *different* (it is the gradient flow of $$\sum (x_u - x_v)^2$$). The sheaf Laplacian instead penalises adjacent nodes for being *inconsistent after transformation* (the flow of $$\sum \lVert \mathcal{F}_{v \trianglelefteq e} x_v - \mathcal{F}_{u \trianglelefteq e} x_u \rVert^2$$). With identity maps, these are the same. With learned maps, "consistent" can mean "opposite in a structured way" — which is exactly what heterophilic graphs need.

Given a cellular sheaf $$\mathcal{F}$$ on a graph $$G$$ with coboundary $$\delta$$, the **sheaf Laplacian** is

<div class="formula-box">
\[
L_{\mathcal{F}} \;=\; \delta^{\top}\delta \;:\; C^0(G;\mathcal{F}) \to C^0(G;\mathcal{F}).
\]
</div>

This is positive semi-definite, since $$x^{\top} L_{\mathcal{F}} x = \lVert \delta x \rVert^2 \ge 0$$ for all $$x$$.

Node-wise it reads

<div class="formula-box">
\[
(L_{\mathcal{F}} x)_v \;=\; \sum_{e = (v,u)} \mathcal{F}_{v \trianglelefteq e}^{\top}
\left( \mathcal{F}_{v \trianglelefteq e}\, x_v - \mathcal{F}_{u \trianglelefteq e}\, x_u \right),
\]
</div>

which says: measure the disagreement at each incident edge, pull it back into $$v$$'s stalk, and sum.

**Block structure:** $$L_{\mathcal{F}}$$ is a block matrix indexed by nodes. For a graph with $$n$$ nodes each having stalk $$\mathbb{R}^d$$, $$L_{\mathcal{F}} \in \mathbb{R}^{nd \times nd}$$. The blocks are:

<div class="formula-box">
\[
(L_{\mathcal{F}})_{vv} = \sum_{v \trianglelefteq e} \mathcal{F}_{v \trianglelefteq e}^{\top} \mathcal{F}_{v \trianglelefteq e},
\qquad
(L_{\mathcal{F}})_{vu} = -\,\mathcal{F}_{v \trianglelefteq e}^{\top} \mathcal{F}_{u \trianglelefteq e}
\quad \text{for } e = (u,v).
\]
</div>

Note $$(L_{\mathcal{F}})_{uv} = (L_{\mathcal{F}})_{vu}^{\top}$$, so the matrix is symmetric as it must be.

## Connection to the Standard Graph Laplacian

The graph Laplacian is *exactly* the special case in which every stalk is $$\mathbb{R}$$ and every restriction map is the identity:

<div class="formula-box">
\[
\mathcal{F}(v) = \mathcal{F}(e) = \mathbb{R},\quad
\mathcal{F}_{v \trianglelefteq e} = 1
\quad\Longrightarrow\quad
(L_{\mathcal{F}})_{vv} = \deg(v),\ \ (L_{\mathcal{F}})_{vu} = -1,
\]
</div>

so $$L_{\mathcal{F}} = D - A = L$$, the ordinary $$n \times n$$ graph Laplacian. If we keep the identity maps but widen the stalks to $$\mathbb{R}^d$$, we instead get

<div class="formula-box">
\[
L_{\mathcal{F}} \;=\; L \otimes I_d ,
\]
</div>

the Kronecker product that applies the same scalar Laplacian independently in each of the $$d$$ coordinates. Widening the stalks alone buys nothing; it is the non-trivial restriction maps that "twist" the off-diagonal blocks and change how features from different nodes interact.

## The Sheaf Dirichlet Energy

The quadratic form

<div class="formula-box">
\[
E_{\mathcal{F}}(x) \;=\; x^{\top} L_{\mathcal{F}}\, x \;=\; \lVert \delta x \rVert^2
\;=\; \sum_{e = (u,v)} \big\lVert \mathcal{F}_{v \trianglelefteq e}\, x_v - \mathcal{F}_{u \trianglelefteq e}\, x_u \big\rVert^2
\]
</div>

measures the total **sheaf disagreement** over the graph — how much the restriction maps disagree across all edges when applied to the signal $$x$$.

- $$E_{\mathcal{F}}(x) = 0 \iff x \in H^0(G;\mathcal{F})$$ (perfect consistency)
- $$E_{\mathcal{F}}(x)$$ large $$\iff x$$ has large disagreement at many edges

(The same quantity is usually written with the normalised Laplacian, $$E_{\mathcal{F}}(x) = x^{\top}\Delta_{\mathcal{F}} x$$, which inserts a $$D_v^{-1/2}$$ factor at each endpoint; the characterisation of the zero set is unchanged.)

**Spectral view:** eigenvectors of $$L_{\mathcal{F}}$$ with small eigenvalues correspond to signals with low sheaf Dirichlet energy — near-consistent signals. Diffusion with $$L_{\mathcal{F}}$$ drives signals toward its kernel.

<div class="insight-box">
<strong>The key difference from the standard Laplacian:</strong> the graph Laplacian minimises \(\sum \lVert x_u - x_v \rVert^2\) — it pushes adjacent nodes to have equal features. The sheaf Laplacian minimises \(\sum \lVert \mathcal{F}_{v \trianglelefteq e} x_v - \mathcal{F}_{u \trianglelefteq e} x_u \rVert^2\) — it pushes adjacent nodes to have features that agree <em>after transformation</em>. With identity maps this reduces to equality. With learned maps, adjacent nodes can remain different while satisfying a structural relationship — exactly what heterophilic graphs need.
</div>

## Sheaf Diffusion

The heat equation on the sheaf is

<div class="formula-box">
\[
\dot{X}(t) \;=\; -\,L_{\mathcal{F}}\, X(t),
\]
</div>

whose Euler discretisation with unit step is

<div class="formula-box">
\[
X(t+1) \;=\; X(t) - L_{\mathcal{F}} X(t) \;=\; (I - L_{\mathcal{F}})\, X(t).
\]
</div>

This is **sheaf diffusion** — the generalisation of graph heat diffusion. At each step, each node's features are updated using the sheaf-weighted contributions of its neighbours.

In practice one uses the **normalised sheaf Laplacian**, whose spectrum is bounded:

<div class="formula-box">
\[
\Delta_{\mathcal{F}} \;=\; D^{-1/2} L_{\mathcal{F}} D^{-1/2},
\qquad D = \operatorname{blockdiag}(L_{\mathcal{F}}),
\]
</div>

and the update $$X \leftarrow (I - \Delta_{\mathcal{F}}) X$$, which is the sheaf analogue of the normalised GCN propagation $$\hat{A} = D^{-1/2} A D^{-1/2}$$.

## Worked Example: 2-Node Sheaf Laplacian

**Setup:** two nodes $$u, v$$ connected by one edge $$e$$, stalks $$\mathbb{R}^2$$, restriction maps

<div class="formula-box">
\[
\mathcal{F}_{u \trianglelefteq e} = I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix},
\qquad
\mathcal{F}_{v \trianglelefteq e} = R = \begin{pmatrix} 0 & 1 \\ -1 & 0 \end{pmatrix}
\quad (90^\circ \text{ rotation}).
\]
</div>

**Diagonal blocks:** $$ (L_{\mathcal{F}})_{uu} = I^{\top} I = I$$ and $$(L_{\mathcal{F}})_{vv} = R^{\top} R = I$$ (both maps are orthogonal).

**Off-diagonal blocks:**

<div class="formula-box">
\[
(L_{\mathcal{F}})_{uv} = -\,I^{\top} R = -R = \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix},
\qquad
(L_{\mathcal{F}})_{vu} = -\,R^{\top} I = \begin{pmatrix} 0 & 1 \\ -1 & 0 \end{pmatrix}.
\]
</div>

**Full $$4 \times 4$$ sheaf Laplacian** (ordering the coordinates $$u_1, u_2, v_1, v_2$$):

<div class="formula-box">
\[
L_{\mathcal{F}} =
\begin{pmatrix}
\ \ 1 & \ \ 0 & \ \ 0 & -1 \\
\ \ 0 & \ \ 1 & \ \ 1 & \ \ 0 \\
\ \ 0 & \ \ 1 & \ \ 1 & \ \ 0 \\
-1 & \ \ 0 & \ \ 0 & \ \ 1
\end{pmatrix}
\]
</div>

**Global sections (kernel):** $$\delta x = 0$$ means $$R x_v - x_u = 0$$, i.e. $$x_u = R x_v$$. Since $$R$$ is invertible, *any* $$x_v \in \mathbb{R}^2$$ extends to a section, so

<div class="formula-box">
\[
H^0(G;\mathcal{F}) = \left\{ (R x_v,\, x_v) \;:\; x_v \in \mathbb{R}^2 \right\},
\qquad \dim H^0 = 2 = d .
\]
</div>

The kernel is *not* trivial — and it could not be. A single edge is a tree, so there are no cycles around which transport could fail to close, and for an $$O(d)$$-bundle over a connected graph one has $$\dim H^0 \le d$$ with equality exactly when transport is path-independent (Bodnar et al., 2022, Lemma 6). To get a trivial harmonic space you need a cycle whose holonomy has no fixed vector — as in the triangle example of the previous post.

<div class="insight-box"><strong>Key Insight:</strong> The non-trivial off-diagonal block \(-\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}\) is the core difference from the standard Laplacian (which would have \(-I\)). Diffusion with this sheaf Laplacian does not try to make \(x_u = x_v\); it tries to make \(x_u = R\, x_v\). That geometric twist in the operator is what allows sheaf GNNs to handle structured disagreement between neighbouring nodes.</div>

## Spectral Properties

**Kernel:** $$L_{\mathcal{F}} x = 0 \iff \delta x = 0 \iff x$$ is a global section. So

<div class="formula-box">
\[
\ker L_{\mathcal{F}} \;\cong\; H^0(G;\mathcal{F}),
\]
</div>

and the number of zero eigenvalues equals the dimension of the space of global sections.

For the trivial sheaf with $$\mathbb{R}^d$$ stalks on a graph with $$c$$ connected components, $$\dim \ker L_{\mathcal{F}} = c\,d$$: one $$d$$-dimensional constant per component. With $$d = 1$$ this is the familiar "one constant per component" of the graph Laplacian.

For a non-trivial sheaf the kernel can be smaller, and — this is the whole point — it can consist of signals that are *not* constant. For an $$O(d)$$-bundle the ceiling is $$\dim H^0 \le d$$, reached exactly when the transport around every cycle is the identity.

**Spectral gap:** the smallest non-zero eigenvalue of $$L_{\mathcal{F}}$$ determines how fast sheaf diffusion converges to the harmonic space. For $$O(d)$$-bundles this gap is controlled by how far the transport maps are from being path-independent.

## Normalised Sheaf Laplacian Spectrum

The eigenvalues of $$\Delta_{\mathcal{F}}$$ lie in $$[0, 2]$$:
- $$0$$: global sections (consistent signals)
- close to $$0$$: nearly consistent signals
- close to $$2$$: maximally inconsistent signals

This is the same range as the standard normalised Laplacian. The difference: with non-trivial restriction maps, "consistency" is defined relative to the sheaf structure, not raw feature equality.

## Summary

| Quantity | Formula | Interpretation |
|----------|---------|---------------|
| Coboundary | $$(\delta x)_e = \mathcal{F}_{v \trianglelefteq e} x_v - \mathcal{F}_{u \trianglelefteq e} x_u$$ | Sheaf disagreement at edge $$e$$ |
| Sheaf Laplacian | $$L_{\mathcal{F}} = \delta^{\top}\delta$$ | Total disagreement operator |
| Dirichlet energy | $$E_{\mathcal{F}}(x) = x^{\top} L_{\mathcal{F}} x$$ | Total inconsistency of signal $$x$$ |
| Harmonic space | $$\ker L_{\mathcal{F}} = H^0(G;\mathcal{F})$$ | Global sections (consistent signals) |
| Diffusion step | $$X \leftarrow (I - \Delta_{\mathcal{F}}) X$$ | Reduces inconsistency; generalises GCN |

The sheaf Laplacian is the central object for sheaf-based graph learning. It generalises the standard graph Laplacian by incorporating edge-level structure — making it possible to define diffusion that respects per-edge feature transformations rather than forcing raw feature equality.

## References

- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology* (defines \(L_{\mathcal{F}} = \delta^{\top}\delta\), its harmonic space, and the spectral bounds used above).
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (first sheaf convolutional layer built on the sheaf Laplacian; shows the trivial sheaf recovers GCN).
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (analyses the harmonic space of \(\Delta_{\mathcal{F}}\), including the bound \(\dim H^0 \le d\) for \(O(d)\)-bundles and its link to path-independent transport).
- Ebli, S., Defferrard, M., & Spreemann, G. (2020). [Simplicial Neural Networks](https://arxiv.org/abs/2010.03633). *NeurIPS 2020 TDA & Beyond Workshop* (related Hodge Laplacian approach on simplicial complexes, providing topological context).
