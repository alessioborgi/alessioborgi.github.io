---
layout: single
title: "Equivariant Sheaf Neural Networks"
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf, equivariant, connection-Laplacian, gauge-symmetry, geometric]
published: true
excerpt: "Sheaves with orthogonal restriction maps define a connection on the graph — a parallel transport structure over edges. This connects sheaf GNNs to differential geometry and enables equivariant processing of data with local coordinate frames at each node."
author_profile: true
read_time: true
is_overview: false
icon: "🧭"
read_mins: 9
permalink: /blog/gnn/equivariant-sheaf-gnns/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> When the restriction maps are orthogonal, the sheaf is a discrete \(O(d)\)-bundle: a rule for parallel-transporting vectors between nodes along edges. The resulting sheaf Laplacian is the <em>connection Laplacian</em>. Its symmetry group is a gauge group — an independent \(O(d)\) rotation at every node — and building layers out of gauge-covariant quantities is what makes a sheaf GNN equivariant.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_transport.png" alt="Gauge-equivariant sheaf GNN" caption="Gauge-equivariant sheaf diffusion and parallel transport (Bodnar et al., 2022)" %}


## From Sheaves to Connections

**Intuition First:** Imagine each node in the graph is a city with its own local coordinate system — "north" means something slightly different in New York than in Tokyo because the Earth is curved. To compare directions between cities you must transport a vector along a path between them, accounting for the curvature. That transport rule is the "connection." In a sheaf with orthogonal maps, the edge maps are exactly this parallel transport: they tell you how to rotate a vector from node $$u$$'s local frame into node $$v$$'s. The "curvature" shows up when you go around a cycle and the transported vector has rotated away from where it started.

A cellular sheaf whose restriction maps are orthogonal, $$\mathcal{F}_{v \trianglelefteq e} \in O(d)$$, is called a **discrete $$O(d)$$-bundle**. Each node carries a local frame, and the composite

<div class="formula-box">
\[
P_{u \to v}^{e} \;=\; \mathcal{F}_{v \trianglelefteq e}^{\top}\,\mathcal{F}_{u \trianglelefteq e} \;\in\; O(d)
\]
</div>

transports a vector from $$u$$'s frame into $$v$$'s frame across the edge $$e$$. Composing along a path $$\gamma$$ gives $$P^{\gamma}_{v \to u}$$, the transport along that path.

The **holonomy** around a cycle $$\gamma$$ based at $$v$$ is $$P^{\gamma}_{v \to v}$$. If the transport is path-independent (all holonomies are the identity) the sheaf is *flat*, and the harmonic space is as large as it can be. In general Bodnar et al. show two complementary facts:

<div class="formula-box">
\[
x \in H^0(G;\mathcal{F}) \;\Longrightarrow\; x_v \in \ker\!\left(P^{\gamma}_{v \to v} - I\right) \text{ for every cycle } \gamma,
\qquad
\dim H^0 \le d,
\]
</div>

with $$\dim H^0 = d$$ exactly when the transport is path-independent. Non-trivial holonomy shrinks the space of consistent global signals — it is the discrete analogue of curvature obstructing parallel sections.

## The Connection Laplacian

For an $$O(d)$$-bundle the sheaf Laplacian takes a particularly clean form, and is then called the **connection Laplacian**:

<div class="formula-box">
\[
(L_{\mathcal{F}})_{vv} = \deg(v)\, I_d ,
\qquad
(L_{\mathcal{F}})_{vu} = -\,\mathcal{F}_{v \trianglelefteq e}^{\top}\,\mathcal{F}_{u \trianglelefteq e} = -\,P^{e}_{u \to v}
\quad \text{for } e = (u,v).
\]
</div>

The diagonal blocks collapse to degrees because $$\mathcal{F}^{\top}\mathcal{F} = I_d$$, and each off-diagonal block is itself orthogonal.

**Spectrum:** the connection Laplacian is positive semi-definite. Because the diagonal blocks are $$\deg(v) I_d$$ and the off-diagonal blocks have unit operator norm, Gershgorin gives eigenvalues in $$[0,\, 2\deg_{\max}]$$; after the normalisation $$\Delta_{\mathcal{F}} = D^{-1/2} L_{\mathcal{F}} D^{-1/2}$$ they lie in $$[0, 2]$$, just as for the normalised graph Laplacian. Its kernel consists of the parallel sections — signals that are "constant" under parallel transport.

## Gauge Symmetry

A **gauge transformation** is a choice of local frame change $$g_v \in O(d)$$ at every node. It acts by

<div class="formula-box">
\[
x_v \;\longmapsto\; g_v\, x_v ,
\qquad
\mathcal{F}_{v \trianglelefteq e} \;\longmapsto\; \mathcal{F}_{v \trianglelefteq e}\, g_v^{-1} ,
\]
</div>

so that the value in the edge stalk, $$\mathcal{F}_{v \trianglelefteq e} x_v$$, is unchanged. Writing $$g = \operatorname{blockdiag}(g_v)$$, the Laplacian is conjugated:

<div class="formula-box">
\[
L_{\mathcal{F}} \;\longmapsto\; g\, L_{\mathcal{F}}\, g^{-1}.
\]
</div>

The **gauge-invariant** quantities are those independent of the choice of local frames:
- the eigenvalues of $$L_{\mathcal{F}}$$ (conjugation preserves the spectrum)
- edge disagreements $$\lVert \mathcal{F}_{v \trianglelefteq e} x_v - \mathcal{F}_{u \trianglelefteq e} x_u \rVert$$, and hence the whole sheaf Dirichlet energy
- the *conjugacy class* of each holonomy $$P^{\gamma}_{v \to v}$$ — the holonomy matrix itself transforms as $$g_v P^{\gamma}_{v \to v} g_v^{-1}$$, so it is its spectrum (e.g. the rotation angle) that is frame-independent, not its entries

A sheaf GNN should produce outputs that are gauge-invariant (for graph-level tasks) or gauge-equivariant (for node-level tasks, where the output lives in the node's own frame).

<div class="insight-box">
<strong>The physics analogy:</strong> this is the structure of a lattice gauge theory. In electromagnetism — a \(U(1)\) gauge theory — each point of spacetime carries a local phase and the field is the connection relating phases at different points; on a lattice, the field lives on the links and the physical content is in the holonomies around plaquettes. An orthogonal sheaf on a graph is the \(O(d)\) version: the maps live on edges, the observables are holonomies and spectra, and the connection Laplacian plays the role of the covariant Laplacian. The analogy is real and load-bearing, though a graph has no metric or dynamics for the connection itself, so it is not literally the same theory.
</div>

## Equivariant Sheaf GNN Layers

A gauge-equivariant layer must be built from quantities that transform predictably. At an edge $$e = (u,v)$$:

**Gauge-invariant:**
- $$\lVert x_u \rVert$$, $$\lVert x_v \rVert$$
- $$x_u^{\top} \mathcal{F}_{u \trianglelefteq e}^{\top} \mathcal{F}_{v \trianglelefteq e}\, x_v$$ — the inner product after transport
- $$\lVert \mathcal{F}_{v \trianglelefteq e} x_v - \mathcal{F}_{u \trianglelefteq e} x_u \rVert^2$$ — the edge's contribution to the sheaf Dirichlet energy

**Gauge-equivariant at $$v$$** (i.e. transforming as $$g_v(\cdot)$$):
- $$P^{e}_{u \to v}\, x_u = \mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}\, x_u$$ — neighbour $$u$$'s feature read in $$v$$'s frame

Note the index order: to land in $$v$$'s frame you transport *from* $$u$$ *to* $$v$$, so the transpose belongs to $$v$$. Under a gauge transformation this becomes $$(\mathcal{F}_{v} g_v^{-1})^{\top}(\mathcal{F}_{u} g_u^{-1})(g_u x_u) = g_v\,\mathcal{F}_{v}^{\top}\mathcal{F}_{u} x_u$$, using $$g_v^{-\top} = g_v$$ for orthogonal $$g_v$$ — the $$g_u$$ cancels and only $$g_v$$ survives, as required.

A complete equivariant sheaf layer therefore looks like

<div class="formula-box">
\[
x_v \;\longleftarrow\; \phi\left( x_v,\ \sum_{u \in \mathcal{N}(v)} \mathcal{F}_{v \trianglelefteq e}^{\top}\,\mathcal{F}_{u \trianglelefteq e}\, x_u \right),
\]
</div>

where $$\phi$$ may be any map that is itself equivariant — for instance a linear combination, or an MLP applied to invariant scalars whose output rescales the equivariant vectors.

<div class="insight-box">
<strong>Why sheaf diffusion is equivariant for free:</strong> the off-diagonal block of the sheaf Laplacian <em>is</em> \(-\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}\). So the diffusion step \(x \leftarrow x - L_{\mathcal{F}} x\) is already built entirely from transports into the receiving node's frame, and inherits gauge equivariance without any extra design work. Equivariance is not bolted on to sheaf diffusion — it is what the operator is made of.
</div>

## Connection to Equivariant GNNs for 3D Data

The geometric deep learning framework (EGNN, SE(3)-Transformers, TFN) handles $$E(n)$$ / $$SE(3)$$ equivariance for 3D point clouds. Sheaf GNNs with $$O(d)$$ restriction maps handle $$O(d)$$ **gauge** equivariance on abstract graphs. The structures are parallel but the groups act differently:

- 3D equivariant GNNs: one *global* rotation $$R \in SO(3)$$ applied to the whole configuration
- Sheaf GNNs: an *independent* $$g_v \in O(d)$$ at each node

Global equivariance is the special case $$g_v = g$$ for all $$v$$ — the diagonal subgroup of the gauge group. Gauge equivariance is therefore the stronger requirement of the two: it constrains the model under a much larger group.

<div class="insight-box"><strong>Key Insight:</strong> Global equivariance (EGNN, SE(3)-Transformers) means the whole graph is rotated by a single \(R\). Gauge equivariance (orthogonal sheaf GNNs) allows an independent rotation at each node, with global rotations sitting inside it as the diagonal subgroup. The practical consequence: a globally equivariant model has no principled way to handle inputs whose parts are reported in <em>inconsistent</em> local frames — protein residues each described in their own backbone frame, say — whereas a gauge-equivariant sheaf model handles this natively, because reconciling frames is exactly what the restriction maps do.</div>

## Applications

**Point clouds with local frames:** each point carries a local frame (surface normal plus tangent plane). Sheaf GNNs with orthogonal maps can process features in these frames and aggregate them consistently — the graph analogue of gauge-equivariant networks on meshes.

**Protein structure:** each residue has a local frame (the N–Cα–C backbone triad). The restriction maps encode how to transform between residue frames along the chain and across contacts.

**Manifold-aware sheaf construction:** rather than learning the maps end-to-end, one can compute orthogonal maps that optimally align the estimated tangent spaces of neighbouring data points under a manifold assumption — a geometrically motivated alternative that reduces both compute and overfitting.

**Graph signal processing:** the connection Laplacian generalises the graph Laplacian to vector-valued signals with local frame structure, and is the operator behind vector diffusion maps and angular synchronisation.

## Summary

| Concept | Sheaf language | Geometry language |
|---------|---------------|------------------|
| Orthogonal restriction maps | $$\mathcal{F}_{v \trianglelefteq e} \in O(d)$$ | Frame maps of a discrete $$O(d)$$-bundle |
| Edge transport | $$\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}$$ | Parallel transport $$u \to v$$ |
| Sheaf Laplacian (orthogonal case) | $$L_{\mathcal{F}}$$ with $$O(d)$$ maps | Connection Laplacian |
| Harmonic space | $$\ker L_{\mathcal{F}} = H^0(G;\mathcal{F})$$ | Parallel sections |
| Holonomy | Transport around a cycle | Curvature obstruction |
| Gauge transformation | $$x_v \mapsto g_v x_v$$, $$\mathcal{F}_{v \trianglelefteq e} \mapsto \mathcal{F}_{v \trianglelefteq e} g_v^{-1}$$ | Change of local frame |

Equivariant sheaf GNNs sit at the intersection of algebraic topology, differential geometry, and graph learning — providing a principled framework for processing data with local frame structure on graphs.

## References

- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (discrete \(O(d)\)-bundles, path-dependent transport, and the bound \(\dim H^0 \le d\) quoted above).
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 Workshop on Topology, Algebra, and Geometry in Machine Learning* (builds orthogonal maps from a manifold assumption by aligning neighbouring tangent spaces, instead of learning them end-to-end).
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology* (spectral theory of sheaf Laplacians, including the orthogonal/connection case).
- Singer, A. (2011). [Angular Synchronization by Eigenvectors and Semidefinite Programming](https://arxiv.org/abs/0911.3448). *Applied and Computational Harmonic Analysis* (recovering node frames from noisy relative rotations — the synchronisation problem that motivates connection Laplacians on graphs).
