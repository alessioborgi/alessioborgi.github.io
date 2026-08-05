---
layout: single
title: "What Is a Sheaf? From Topology to Graph Learning"
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf, cellular-sheaf, stalk, restriction-map, global-sections]
published: true
excerpt: "A sheaf is a mathematical object from algebraic topology that assigns vector spaces to cells and linear maps between them. On graphs, sheaves assign feature spaces to nodes and edges, with restriction maps encoding how node features relate across edges."
author_profile: true
read_time: true
is_overview: false
icon: "📚"
read_mins: 8
permalink: /blog/gnn/what-is-a-sheaf/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A cellular sheaf on a graph assigns a vector space ("stalk") to each node and each edge, with linear "restriction maps" from node stalks to adjacent edge stalks. A global section is an assignment of vectors to all nodes that is "consistent" — the restriction maps agree at every edge. The sheaf Laplacian \(L_{\mathcal{F}} = \delta^{\top}\delta\) measures the degree of global inconsistency.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="Sheaf structure on a graph" caption="Cellular sheaf on a graph: node/edge stalks and restriction maps (Bodnar et al., 2022)" %}


## Sheaves in Ordinary Mathematics

**Intuition First:** Imagine you're assembling a jigsaw puzzle. Each piece (node) has part of the picture. Two adjacent pieces (connected by an edge) must agree along their shared border — but the border on piece A's side is the same physical border as on piece B's side, viewed from slightly different angles. The "restriction maps" are exactly the rotation/flip transforms that make A's border match B's border. A global section is a completed puzzle where every adjacent pair agrees perfectly after applying those transforms.

In mathematics, a sheaf is a tool for tracking local data (defined on open sets of a topological space) and understanding when local data can be assembled into global data.

The key property: **local-to-global consistency**. Data is consistent locally at every overlap → data assembles into a unique global section.

For our purposes (cellular sheaves on graphs), we use a discretisation: the "topological space" is the graph, "open sets" are nodes and edges, and "local data" are vectors in the stalks.

## Cellular Sheaves on Graphs

A **cellular sheaf** $$\mathcal{F}$$ on a graph $$G = (V, E)$$ assigns:

1. **Node stalks:** a vector space $$\mathcal{F}(v) = \mathbb{R}^{d_v}$$ to each node $$v$$
2. **Edge stalks:** a vector space $$\mathcal{F}(e) = \mathbb{R}^{d_e}$$ to each edge $$e$$
3. **Restriction maps:** for each edge $$e = (u,v)$$ and each incident node $$w \in \{u,v\}$$, a linear map

<div class="formula-box">
\[
\mathcal{F}_{w \trianglelefteq e} : \mathcal{F}(w) \longrightarrow \mathcal{F}(e).
\]
</div>

**Notation:** $$w \trianglelefteq e$$ reads "$$w$$ is a face of $$e$$", i.e. $$w$$ is an endpoint of the edge $$e$$. Throughout this book we fix a common stalk dimension $$d_v = d_e = d$$, so every restriction map is a $$d \times d$$ matrix.

## The Cochain Complex

The stalks and restriction maps define a **cochain complex**:

<div class="formula-box">
\[
C^0(G;\mathcal{F}) \;\xrightarrow{\ \delta\ }\; C^1(G;\mathcal{F})
\]
</div>

Where:
- $$C^0(G;\mathcal{F}) = \bigoplus_{v \in V} \mathcal{F}(v)$$: the space of all node assignments (0-cochains)
- $$C^1(G;\mathcal{F}) = \bigoplus_{e \in E} \mathcal{F}(e)$$: the space of all edge assignments (1-cochains)
- $$\delta : C^0 \to C^1$$ is the **coboundary map**, defined for an oriented edge $$e = (u,v)$$ by

<div class="formula-box">
\[
(\delta x)_e \;=\; \mathcal{F}_{v \trianglelefteq e}\, x_v \;-\; \mathcal{F}_{u \trianglelefteq e}\, x_u .
\]
</div>

The coboundary $$\delta x$$ measures the **disagreement** between $$u$$'s and $$v$$'s contributions to edge $$e$$. (The choice of orientation only flips the sign of $$(\delta x)_e$$, so nothing below depends on it.)

## Global Sections

A **global section** is a 0-cochain $$x \in C^0(G;\mathcal{F})$$ such that

<div class="formula-box">
\[
(\delta x)_e = 0 \quad \text{for all } e \in E,
\]
</div>

i.e. $$\mathcal{F}_{v \trianglelefteq e}\, x_v = \mathcal{F}_{u \trianglelefteq e}\, x_u$$ for every edge $$e = (u,v)$$. The two endpoints "agree" at every edge.

The space of global sections is the zeroth sheaf cohomology,

<div class="formula-box">
\[
H^0(G;\mathcal{F}) \;=\; \ker \delta ,
\]
</div>

and it measures how much consistent global data the sheaf supports.

**Special case — trivial sheaf:** $$\mathcal{F}(v) = \mathbb{R}$$, $$\mathcal{F}(e) = \mathbb{R}$$, all restriction maps equal to $$1$$. Then $$(\delta x)_e = x_v - x_u$$ is just the ordinary graph gradient, and global sections are the functions that are constant on each connected component. This is exactly the setting in which the sheaf Laplacian becomes the ordinary graph Laplacian.

<div class="insight-box">
<strong>Intuition via temperature:</strong> Imagine nodes are thermometers at different locations. The "sheaf" models how readings should relate across edges — maybe a north-facing thermometer at A and a south-facing one at B should read slightly differently even if they measure the same "true" temperature. The restriction maps encode this "transformation rule." A global section represents a consistent temperature assignment across the network after applying all local transformations.
</div>

## The Standard Graph as a Trivial Sheaf

The graph Laplacian is the special case of the sheaf Laplacian in which

<div class="formula-box">
\[
\mathcal{F}(v) = \mathbb{R} \ \ \forall v, \qquad
\mathcal{F}(e) = \mathbb{R} \ \ \forall e, \qquad
\mathcal{F}_{v \trianglelefteq e} = \mathrm{id}_{\mathbb{R}} \ \ \forall\, v \trianglelefteq e .
\]
</div>

Then $$(\delta x)_e = x_v - x_u$$ is the edge-difference operator and

<div class="formula-box">
\[
L_{\mathcal{F}} \;=\; \delta^{\top}\delta \;=\; D - A \;=\; L,
\]
</div>

the ordinary $$\lvert V \rvert \times \lvert V \rvert$$ graph Laplacian. If instead the stalks are $$\mathbb{R}^d$$ with identity restriction maps, one gets the block version $$L \otimes I_d$$, which applies the same scalar Laplacian independently to each of the $$d$$ coordinates. Either way, no per-edge structure is available — the sheaf is trivial.

GCN's propagation $$\hat{A} H = (I - \tilde{\Delta})H$$, with $$\tilde{\Delta}$$ the symmetric normalised Laplacian of the self-looped graph, is one Euler step of heat diffusion; and heat diffusion $$\dot{x} = -Lx$$ is precisely gradient flow on the Dirichlet energy $$\tfrac12\sum_{(u,v) \in E} \lVert x_u - x_v \rVert^2$$. Each layer therefore *decreases* that energy — which is another way of saying it pushes neighbours toward equality.

## Non-Trivial Sheaves Allow Disagreement

With non-trivial restriction maps, the "agreement" condition becomes $$\mathcal{F}_{u \trianglelefteq e} x_u = \mathcal{F}_{v \trianglelefteq e} x_v$$ — $$x_u$$ and $$x_v$$ are not required to be equal, only to agree after transformation.

This allows adjacent nodes to have **different but compatible** features. In a heterophilic graph, two nodes with different labels might have very different features, but a learned sheaf map could rotate one into the other's space — making them "consistent" under the sheaf even though they are numerically different.

## Worked Example: Global Section on a Triangle Graph

**Setup:** triangle graph with nodes $$u, v, w$$ and edges $$e_{uv}, e_{vw}, e_{uw}$$, all stalks $$\mathbb{R}$$. Restriction maps:

<div class="formula-box">
\[
\mathcal{F}_{u \trianglelefteq e_{uv}} = 1,\quad
\mathcal{F}_{v \trianglelefteq e_{uv}} = 1,\quad
\mathcal{F}_{v \trianglelefteq e_{vw}} = 2,\quad
\mathcal{F}_{w \trianglelefteq e_{vw}} = 1,\quad
\mathcal{F}_{u \trianglelefteq e_{uw}} = 1,\quad
\mathcal{F}_{w \trianglelefteq e_{uw}} = 3 .
\]
</div>

Orienting each edge from the alphabetically earlier node to the later one, the coboundary is

<div class="formula-box">
\[
\begin{aligned}
(\delta x)_{e_{uv}} &= \mathcal{F}_{v \trianglelefteq e_{uv}} x_v - \mathcal{F}_{u \trianglelefteq e_{uv}} x_u = x_v - x_u,\\[2pt]
(\delta x)_{e_{vw}} &= \mathcal{F}_{w \trianglelefteq e_{vw}} x_w - \mathcal{F}_{v \trianglelefteq e_{vw}} x_v = x_w - 2 x_v,\\[2pt]
(\delta x)_{e_{uw}} &= \mathcal{F}_{w \trianglelefteq e_{uw}} x_w - \mathcal{F}_{u \trianglelefteq e_{uw}} x_u = 3 x_w - x_u .
\end{aligned}
\]
</div>

**Global section condition** (all three coboundaries vanish):

1. Edge $$e_{uv}$$ gives $$x_v - x_u = 0$$, hence $$x_v = x_u$$.
2. Edge $$e_{vw}$$ gives $$x_w - 2 x_v = 0$$, hence $$x_w = 2 x_u$$.
3. Edge $$e_{uw}$$ gives $$3 x_w - x_u = 0$$, and substituting gives $$3(2 x_u) - x_u = 5 x_u = 0$$, hence $$x_u = 0$$.

**Conclusion:** $$H^0(G;\mathcal{F}) = 0$$ — the only global section is the zero vector, so this sheaf carries no non-trivial consistent signal. What killed it is the *cycle*: going around the triangle multiplies a value by $$2 \cdot 3 / 1 \neq 1$$, so the three edge constraints are mutually incompatible. On a tree the same maps would leave a one-dimensional space of sections, because there is no cycle to close.

<div class="insight-box"><strong>Key Insight:</strong> The dimension of \(H^0(G;\mathcal{F}) = \ker \delta\) tells you how much "consistent information" the sheaf can carry. The trivial sheaf on a connected graph has a one-dimensional space of sections — the constants (\(d\)-dimensional if the stalks are \(\mathbb{R}^d\)). Non-trivial maps can shrink this space, and with the right maps can make it carry class information instead of a constant, which directly controls how diffusion with the sheaf Laplacian behaves at long times.</div>

## Why Sheaves for Graphs?

The sheaf framework provides:

1. **Richer aggregation:** edges have their own "mediation" structure (restriction maps)
2. **Heterophily handling:** adjacent nodes with different features are not forced to agree — the restriction maps can accommodate difference
3. **Mathematical guarantees:** the sheaf Laplacian inherits spectral theory from the standard Laplacian, with richer structure
4. **Interpretability:** the consistency defect $$\lVert \delta x \rVert^2$$ measures "how inconsistent" the data is under the learned sheaf

## Summary

| Concept | Standard GCN | Cellular Sheaf |
|---------|-------------|---------------|
| Node data | Vectors $$h_v \in \mathbb{R}^d$$ | Vectors $$x_v \in \mathcal{F}(v)$$ |
| Edge data | None | Vectors $$x_e \in \mathcal{F}(e)$$ |
| Agreement condition | $$h_u = h_v$$ at edges | $$\mathcal{F}_{u \trianglelefteq e} x_u = \mathcal{F}_{v \trianglelefteq e} x_v$$ |
| Laplacian | $$L = D - A$$ | $$L_{\mathcal{F}} = \delta^{\top}\delta$$ |
| Global sections | Constant functions | $$H^0(G;\mathcal{F}) = \ker\delta$$ |

The sheaf framework generalises the standard graph to a richer structure that can encode per-edge relational information. The sheaf Laplacian, covered in the next post, is the key operator that makes this actionable for graph learning.

## References

- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (first use of cellular sheaves for graph learning, with a hand-crafted sheaf Laplacian).
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology* (defines the sheaf Laplacian, its harmonic space, and the isomorphism $$\ker L_{\mathcal{F}} \cong H^0(G;\mathcal{F})$$).
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (NSD: learns sheaf restriction maps from node features, building on the cellular sheaf theory above).
- Curry, J. (2014). [Sheaves, Cosheaves and Applications](https://arxiv.org/abs/1303.3255). *PhD Thesis, University of Pennsylvania* (mathematical foundation of cellular sheaf theory underlying sheaf neural networks).
