---
layout: single
title: "Equivariant Sheaf Neural Networks: Learning Geometric Transport on Graphs"
date: 2026-09-01
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [sheaf-neural-networks, equivariance, geometric-deep-learning, egnn, symmetry-breaking, radial-tangential-transport]
published: true
is_overview: false
excerpt: "Sheaf networks move features through matrix-valued maps but ignore the symmetries of physical space; equivariant GNNs respect those symmetries but move vectors with scalars. ESNN does both — learned, directed, matrix-valued transport that is exactly E(n)-equivariant — and proves that when displacement is the only geometric input, the radial–tangential family is all the transport there is."
author_profile: true
read_time: true
icon: "🧲"
read_mins: 20
permalink: /blog/sheaf/equivariant-sheaf-neural-networks/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Sheaf networks have always moved features through matrix-valued edge maps — but however those matrices are structured, nothing ties them to rotations of the world the graph lives in. Equivariant GNNs respect those rotations exactly, and move vectors with scalars. ESNN takes the sheaf's matrix transport and forces it to obey the ambient symmetry: every directed edge map factorises into an \(O(n)\)-covariant spatial operator and an invariant channel operator — <strong>spatial rotates, channel mixes</strong>. Four instantiations follow, and a completeness theorem closes the menu: when relative displacement is the only geometric input, the radial–tangential family is <em>all the transport there is</em>. A zero-initialised scalar \(\lambda_g\langle \mathbf{r}_{ij},\mathbf{g}\rangle\) lets training break symmetry only when the data pays for it — with the exact \(E(n)\) guarantee returning the moment it reads zero. Results: −28% MSE against EGNN on charged N-body, the gravity axis recovered from data with alignment 1.000, and DeformingPlate rollout error cut from 15.1 to 5.8 against MeshGraphNets.
</div>

<div class="paper-box">
<strong>Paper:</strong> Equivariant Sheaf Neural Networks: Learning Geometric Transport on Graphs<br>
<strong>Authors:</strong> Alessio Borgi* (University of Cambridge & Sapienza University of Rome), Mario Severino* (University of Cambridge & University of Padua), Fabrizio Silvestri (Sapienza University of Rome), Pietro Liò (University of Cambridge) — *equal contribution<br>
<strong>Preprint:</strong> <a href="https://arxiv.org/abs/2608.28853">arXiv:2608.28853</a>, August 2026
</div>

## Two literatures, one missing bridge

Geometric graph learning has spent five years perfecting two ideas that have barely spoken to each other.

On one side, **equivariant GNNs**. EGNN, PaiNN, GVP and their descendants carry invariant scalars and first-order Cartesian vectors, and guarantee that if you rotate the input system, the output rotates with it. The guarantee is exact and the models are cheap — no spherical harmonics, no Clebsch–Gordan contractions. But look at what actually crosses an edge. In EGNN, the geometric content of a message is $$\phi(\lVert \mathbf{r}_{ij}\rVert)\,\mathbf{r}_{ij}$$ — an invariant scalar times the displacement. A neighbour's vector features arrive **isotropically scaled at best**. Longitudinal and transverse responses, shear, anisotropic propagation — the direction-dependent interactions that dominate real physics — are exactly what a scalar coefficient cannot express. The steerable family (TFN, SE(3)-Transformers, MACE, EquiformerV2) buys that anisotropy by raising the representation order, and pays for it in tensor-product machinery.

On the other side, **sheaf neural networks**. Since Hansen & Gebhart's first sheaf network and [Neural Sheaf Diffusion](/blog/sheaf/neural-sheaf-diffusion/), the sheaf literature has insisted that the interesting object on an edge is not a scalar weight but a **linear map between local feature spaces**. That is precisely the machinery the equivariant world is missing — matrix-valued, edge-dependent, learned transport. But every sheaf network to date treats its stalks as abstract: nothing in a generic restriction map knows that the vectors it moves are *arrows in physical space*. Rotate the input point cloud and a learned restriction map does not transform accordingly. Matrix transport, no symmetry.

<div class="insight-box">
<strong>The gap in one sentence.</strong> Equivariant GNNs have the right transformation law and the wrong transport (scalars); sheaf networks have the right transport (matrices) and no transformation law. ESNN constrains the sheaf's matrix-valued transport to intertwine the ambient \(O(n)\) action — and then asks, precisely, how much freedom survives the constraint.
</div>

The answer turns out to be a small, fully characterised family — and that characterisation is the paper's theoretical core.

## Stop factoring through the edge

<div class="insight-box">
<strong>A sheaf, if this is your first one.</strong> A cellular sheaf equips a graph with local coordinate systems: every node \(i\) and every edge \(e\) carries its own private vector space — its <em>stalk</em>, \(\mathcal{F}(i)\) and \(\mathcal{F}(e)\) — and each incident node–edge pair carries a <em>restriction map</em> \(\rho_{i\to e}:\mathcal{F}(i)\to\mathcal{F}(e)\), a matrix that re-expresses the node's data in the edge's coordinates. Neighbours are compared <em>on the edge</em>: they agree when their restrictions match there, and the <a href="/blog/sheaf/spectral-sheaf-theory/">sheaf Laplacian</a> aggregates exactly those disagreements. In sheaf neural networks the restriction maps are learned. That is all the sheaf theory this post needs.
</div>

In classical sheaf diffusion, the contribution of node $$j$$ to node $$i$$ across $$e=\{i,j\}$$ is — up to the Laplacian's minus sign — the composition

<div class="formula-box">
\[
\rho^{*}_{i\to e}\,\rho_{j\to e}\;:\;\mathcal{F}(j)\longrightarrow \mathcal{F}(i)
\]
</div>

— push $$j$$'s feature into the edge space, pull it back down into $$i$$'s. Every node-to-node coupling in NSD, [Conn-NSD](/blog/sheaf/conn-nsd-paper/), Sheaf Attention Networks and their variants has this factored form.

ESNN's structural move is to stop factoring. Rather than learning two incidence maps and composing them through an edge stalk, it **parameterises the directed node-to-node transport itself**:

<div class="formula-box">
\[
\mathcal{T}_{i\leftarrow j}\;:\;\mathcal{F}_{\mathrm{vec}}(j)\longrightarrow\mathcal{F}_{\mathrm{vec}}(i)
\]
</div>

The stalk now has physical structure. Each node carries $$\mathbf{h}_i=(\mathbf{s}_i,\mathbf{V}_i)$$ — invariant scalar channels $$\mathbf{s}_i\in\mathbb{R}^{c_s}$$ and covariant vector channels $$\mathbf{V}_i\in\mathbb{R}^{n\times c_v}$$, so the vector stalk is $$\mathcal{F}_{\mathrm{vec}}(i)=\mathbb{R}^n\otimes\mathbb{R}^{c_v}$$. Under a rigid motion $$\mathbf{x}_i\mapsto Q\mathbf{x}_i+\mathbf{t}$$, scalars stay put and vectors rotate: $$\mathbf{V}_i\mapsto Q\mathbf{V}_i$$. Any legitimate transport has to commute with that action — and this single requirement is what generic sheaf parameterisations violate.

## Spatial rotates, channel mixes

The vector stalk $$\mathbb{R}^n\otimes\mathbb{R}^{c_v}$$ has two axes with entirely different symmetry behaviour: the **spatial axis** $$\mathbb{R}^n$$, on which $$O(n)$$ acts, and the **channel axis** $$\mathbb{R}^{c_v}$$, on which it acts trivially. Since $$\mathrm{End}(\mathbb{R}^n\otimes\mathbb{R}^{c_v})\cong\mathrm{End}(\mathbb{R}^n)\otimes\mathrm{End}(\mathbb{R}^{c_v})$$, *every* linear map on the stalk is a finite sum of separable left–right actions. ESNN's transport is exactly that sum, with one transformation law imposed per axis:

<div class="formula-box">
\[
\mathcal{T}_{i\leftarrow j}(\mathbf{V}_j)=\sum_{k=1}^{K}\mathbf{S}^{(k)}_{ij}\,\mathbf{V}_j\,\mathbf{M}^{(k)}_{ij},
\qquad
\mathbf{S}^{(k)}_{ij}(Q\cdot\mathcal{C}_{ij})=Q\,\mathbf{S}^{(k)}_{ij}(\mathcal{C}_{ij})\,Q^{\top},
\qquad
\mathbf{M}^{(k)}_{ij}(Q\cdot\mathcal{C}_{ij})=\mathbf{M}^{(k)}_{ij}(\mathcal{C}_{ij})
\]
</div>

The spatial operator $$\mathbf{S}^{(k)}_{ij}\in\mathbb{R}^{n\times n}$$ multiplies from the left and must transform **by conjugation** when the edge's geometric context $$\mathcal{C}_{ij}$$ (displacement, endpoint vector features) is rotated. The channel operator $$\mathbf{M}^{(k)}_{ij}\in\mathbb{R}^{c_v\times c_v}$$ multiplies from the right and must be built from **invariants only**. In words: rotating the world does not change what the spatial operator does, only the coordinates it is written in — and a linear map on $$\mathbb{R}^n$$ re-expressed in a rotated frame is exactly its conjugate $$Q\mathbf{S}Q^{\top}$$. The channel axis carries no geometry, so nothing there is allowed to notice the rotation at all. Proposition 3.2 verifies that these two conditions alone make the whole sum equivariant: $$\mathcal{T}'_{i\leftarrow j}(Q\mathbf{V}_j)=Q\,\mathcal{T}_{i\leftarrow j}(\mathbf{V}_j)$$.

<div class="insight-box">
<strong>Spatial rotates, channel mixes — and that split is the whole design.</strong> Channel operators decide <em>how features are mixed</em>; spatial operators decide <em>how vectors are geometrically transformed</em>. The group never touches the channel axis, so channel mixing can be arbitrarily expressive — ESNN uses the structured form \(\mathbf{M}^{(k)}_{ij}=\mathbf{W}^{(k)}\mathbf{D}(\mathbf{g}^{(k)}_{ij})\): a shared learned mixer \(\mathbf{W}^{(k)}\), modulated by \(\mathbf{D}(\mathbf{g}^{(k)}_{ij})\) — the diagonal matrix carrying a per-edge gate vector predicted from invariant edge features. All of the symmetry burden lands on the spatial factor — which is why classifying admissible spatial operators classifies the architecture.
</div>

Two clarifications, then the taxonomy. The transport is **linear in what it moves and nonlinear in what it reads**: for a fixed edge context it acts linearly on $$\mathbf{V}_j$$, while $$\mathbf{S}$$ and $$\mathbf{M}$$ come from networks watching the local geometry, so the map adapts edge by edge with Proposition 3.2 keeping every instance equivariant. And it is **directed** — $$\mathcal{T}_{i\leftarrow j}$$ owes nothing to $$\mathcal{T}_{j\leftarrow i}$$, a point we return to below.

## Four ways to move a vector across an edge

Each choice of spatial operator instantiates a transport family.

**Identity.** $$\mathbf{S}_{ij}=\mathbf{I}_n$$, $$\mathbf{M}_{ij}=\mathbf{I}_{c_v}$$: neighbours' vectors are aggregated in the common frame untouched. This is the trivial-sheaf limit, and a useful control — any gain beyond it is attributable to learned transport rather than to the surrounding architecture.

**Diagonal.** $$\mathbf{S}_{ij}=\lambda_{ij}\mathbf{I}_n$$ with $$\lambda_{ij}$$ predicted from invariant edge features:

<div class="formula-box">
\[
\mathcal{T}_{i\leftarrow j}(\mathbf{V}_j)=\lambda_{ij}\,(\mathbf{V}_j\mathbf{W})\,\mathbf{D}(\mathbf{g}_{ij})
\]
</div>

Edge-adaptive, but spatially isotropic — the closest ESNN analogue of what EGNN-style messages already do, plus channel mixing.

**Orthogonal.** The first genuinely non-trivial spatial action, and the most sheaf-flavoured one: a **feature-conditioned rotation**. The idea: the cross-feature matrix $$\mathbf{C}_{ij}=\mathbf{V}_j\mathbf{V}_i^{\top}\in\mathbb{R}^{n\times n}$$ correlates $$j$$'s arrows with $$i$$'s, so its skew part measures the net twist between the two nodes' feature frames — and exponentiating a learned fraction of that twist gives a rotation that can turn a neighbour's message towards the receiver's frame before aggregation. Concretely: Frobenius-normalise, $$\widetilde{\mathbf{C}}_{ij}=\mathbf{C}_{ij}/(\lVert\mathbf{C}_{ij}\rVert_F+\varepsilon)$$, take the skew part $$\boldsymbol{\Omega}_{ij}=\widetilde{\mathbf{C}}_{ij}-\widetilde{\mathbf{C}}_{ij}^{\top}\in\mathfrak{so}(n)$$, and exponentiate with an invariant learned coefficient:

<div class="formula-box">
\[
\mathbf{R}_{ij}=\exp(\beta_{ij}\boldsymbol{\Omega}_{ij})\in SO(n),
\qquad
\mathcal{T}_{i\leftarrow j}(\mathbf{V}_j)=\mathbf{R}_{ij}\,(\mathbf{V}_j\mathbf{W})\,\mathbf{D}(\mathbf{g}_{ij})
\]
</div>

Under a global rotation both the generator and its exponential conjugate — $$\mathbf{R}_{ij}\mapsto Q\mathbf{R}_{ij}Q^{\top}$$ — so equivariance holds (Lemma 4.1). Readers of the [connection-Laplacian post in the GNN book](/blog/gnn/equivariant-sheaf-gnns/) will recognise the shape: an $$SO(n)$$ map per edge is parallel transport. The difference is that Conn-NSD *computes* its orthogonal maps once from a manifold assumption, while ESNN *derives* them from the current features, end to end, under an ambient rather than local gauge symmetry.

**Radial–Tangential.** The family the theory singles out. The displacement $$\mathbf{r}_{ij}=\mathbf{x}_i-\mathbf{x}_j$$ splits space into the line along the edge and its orthogonal complement:

<div class="formula-box">
\[
\mathbf{P}^{\parallel}_{ij}=\widehat{\mathbf{r}}_{ij}\widehat{\mathbf{r}}_{ij}^{\top},\qquad
\mathbf{P}^{\perp}_{ij}=\mathbf{I}_n-\mathbf{P}^{\parallel}_{ij},\qquad
\mathcal{T}_{i\leftarrow j}(\mathbf{V}_j)=\mathbf{P}^{\parallel}_{ij}\mathbf{V}_j\mathbf{M}^{\parallel}_{ij}+\mathbf{P}^{\perp}_{ij}\mathbf{V}_j\mathbf{M}^{\perp}_{ij}
\]
</div>

Longitudinal and transverse components of a message get **independent channel transformations**. Picture a ball-and-spring network: the part of a neighbour's motion along the spring stretches or compresses it, while the part across the spring bends it sideways — two physically different stiffnesses. EGNN's scalar coefficient is forced to scale both identically; here each gets its own learned channel map, $$\mathbf{M}^{\parallel}_{ij}$$ for the push along the bond, $$\mathbf{M}^{\perp}_{ij}$$ for the shear across it. That is the anisotropy physics wants, obtained without leaving first-order features. And it is cheap: the projectors are never materialised, since $$\mathbf{P}^{\parallel}_{ij}\mathbf{V}_j=\widehat{\mathbf{r}}_{ij}(\widehat{\mathbf{r}}_{ij}^{\top}\mathbf{V}_j)$$ costs $$\mathcal{O}(nc_v)$$, keeping the layer linear in the spatial dimension. Self-loops, where $$\mathbf{r}_{ii}=\mathbf{0}$$ defines no direction, are carried by an explicit identity self-loop in the diffusion operator instead.

## The completeness theorem: radial–tangential is all there is

Here is the result that turns a design menu into a classification.

<div class="insight-box">
<strong>Theorem 4.3.</strong> Let \(n\ge 2\), and consider a linear transport on \(\mathbb{R}^n\otimes\mathbb{R}^{c_v}\) whose only covariant geometric conditioning is a non-zero displacement \(\mathbf{r}_{ij}\), plus arbitrary invariant scalars. Then every \(O(n)\)-equivariant such transport has the form
\[
\mathcal{T}_{i\leftarrow j}(\mathbf{V}_j)=\mathbf{P}^{\parallel}_{ij}\mathbf{V}_j\mathbf{A}_{ij}+\mathbf{P}^{\perp}_{ij}\mathbf{V}_j\mathbf{B}_{ij}
\]
for invariant channel maps \(\mathbf{A}_{ij},\mathbf{B}_{ij}\in\mathbb{R}^{c_v\times c_v}\). Radial–tangential transport is not <em>an</em> equivariant choice; under displacement-only conditioning it is <em>the</em> equivariant choice.
</div>

The proof is a stabiliser argument worth internalising, because it explains *why* only two projectors appear. Fix $$\mathbf{r}\neq\mathbf{0}$$ and look at the subgroup that preserves it, $$H_{\mathbf{r}}=\{Q: Q\mathbf{r}=\mathbf{r}\}\cong O(n-1)$$. Equivariance for these $$Q$$ says the transport must commute with the stabiliser's action. But under $$H_{\mathbf{r}}$$, space decomposes as $$\mathbb{R}^n=\mathrm{span}\{\widehat{\mathbf{r}}\}\oplus\widehat{\mathbf{r}}^{\perp}$$ — the radial line carrying the **trivial** representation, the tangent space carrying the **standard** representation of $$O(n-1)$$. The two are inequivalent, so a commuting operator cannot mix them (Schur), and on the tangent block the spatial part must be a multiple of the identity. What survives is exactly $$\big(\mathbf{P}^{\parallel}\otimes\mathrm{End}(\mathbb{R}^{c_v})\big)\oplus\big(\mathbf{P}^{\perp}\otimes\mathrm{End}(\mathbb{R}^{c_v})\big)$$: free channel maps on each geometric block, nothing else. Full $$O(n)$$-equivariance then forces the channel maps to depend on $$\mathbf{r}$$ only through invariants like $$\lVert\mathbf{r}\rVert$$.

<div class="warning-box">
<strong>Read the scope line before citing this.</strong> The theorem is a completeness result for <em>displacement-conditioned</em> transport under the <em>full</em> orthogonal group, and both qualifiers bite. Under \(SO(n)\) alone, orientation-sensitive operators become admissible — in 3D, the cross-product map \([\widehat{\mathbf{r}}]_{\times}\) transforms as \([Q\widehat{\mathbf{r}}]_{\times}=\det(Q)\,Q[\widehat{\mathbf{r}}]_{\times}Q^{\top}\), fine for rotations, sign-flipped under reflections. And once learned covariant features enter the conditioning (as in Orthogonal transport), the stabiliser argument no longer applies and the admissible class grows. The paper is explicit on both boundaries — the theorem tells you exactly where the classified regime ends and the design space reopens.
</div>

Beyond the classified regime, ESNN offers a **Unified Transport**: choose any subset $$\mathcal{K}\subseteq\{\mathrm{id},\parallel,\perp,\mathrm{skew}\}$$ of spatial operators and sum them as in the general definition — the four named families are its single-operator special cases. The skew member $$\widehat{\boldsymbol{\Omega}}{}^{V}_{ij}$$ is the Frobenius-normalised skew matrix built from $$\mathbf{V}_j\mathbf{V}_i^{\top}-\mathbf{V}_i\mathbf{V}_j^{\top}$$, used directly as a spatial operator. It is feature-conditioned and covariant: deliberately outside Theorem 4.3's displacement-only conditioning, yet still inside Proposition 3.2's equivariance.

The practical reading of the theorem is worth spelling out. EGNN-style messages condition on displacement alone, so radial–tangential transport is not a rival design you might benchmark against them — it is the completion of the class they already live in. When displacement is all the edge sees, radial–tangential is all the transport there is.

## The layer: five stages, one audit

The transports slot into a complete message-passing layer. One rule runs through all five stages: **everything that decides is invariant; everything that moves is covariant.**

**1. Invariant edge context.** For each directed non-self interaction, everything invariant the edge can know:

<div class="formula-box">
\[
\mathbf{z}_{ij}=\Big[\mathbf{s}_i,\,\mathbf{s}_j,\,\mathbf{n}(\mathbf{V}_i),\,\mathbf{n}(\mathbf{V}_j),\,\phi_r(\lVert\mathbf{r}_{ij}\rVert),\,\mathrm{diag}(\mathbf{V}_i^{\top}\mathbf{V}_j),\,\mathbf{V}_i^{\top}\widehat{\mathbf{r}}_{ij},\,\mathbf{V}_j^{\top}\widehat{\mathbf{r}}_{ij},\,\mathbf{e}^{\mathrm{attr}}_{ij}\Big]
\]
</div>

Read the bracket left to right: both endpoints' scalars; per-channel norms $$\mathbf{n}(\cdot)$$ of their vector features; a radial embedding $$\phi_r$$ of the distance; per-channel inner products between the endpoints' vectors; each endpoint's vectors projected onto the edge direction; and any supplied invariant edge attributes. Every gate, coefficient and attention weight in the layer is predicted from this summary — so nothing that decides can endanger equivariance.

**2. Transport and scalar messaging.** Vector messages $$\mathbf{m}^{V}_{i\leftarrow j}=\mathcal{T}_{i\leftarrow j}(\mathbf{V}_j)$$; scalar messages through a separate invariant pathway $$\mathbf{m}^{s}_{i\leftarrow j}=\mathbf{s}_j+\phi_s(\mathbf{z}^{s}_{ij})$$.

**3. Normalised transport diffusion.** Messages aggregate under symmetrised-degree normalisation $$\nu_{ij}=\omega_{ij}/\sqrt{(\bar d_i+1)(\bar d_j+1)}$$ — where $$\omega_{ij}\ge 0$$ is an optional invariant edge weight (unit in the unweighted case) and $$\bar d_i=\tfrac{1}{2}\big(\sum_j\omega_{ij}+\sum_j\omega_{ji}\big)$$ the symmetrised degree — with an explicit identity self-loop $$\nu_{ii}=1/(\bar d_i+1)$$ — the vector branch defining a normalised transport operator $$(\mathcal{A}_{\mathcal{T}}\mathbf{V})_i=\nu_{ii}\mathbf{V}_i+\sum_j\nu_{ij}\mathcal{T}_{i\leftarrow j}(\mathbf{V}_j)$$. Invariant multi-head attention can replace the fixed normalisation without touching the equivariance argument.

**4. Residual updates in-type.** Channel mixing $$\mathbf{V}^{\mathrm{diff}}_i\mathbf{W}_V$$ commutes with the group action; the vector non-linearity is radial, $$\sigma_V(\mathbf{v})=a(\lVert\mathbf{v}\rVert)\mathbf{v}$$, so it rescales but never rotates. Scalars update conventionally. Both branches are residual.

**5. Coordinate kinematics.** For dynamical tasks, an EGNN-style update $$\Delta\mathbf{x}_i=\tfrac{1}{|\mathcal{N}(i)|}\sum_j\gamma_{ij}\mathbf{r}_{ij}$$ with invariant $$\gamma_{ij}$$, extended to velocities as $$\mathbf{u}'_i=a_i\mathbf{u}_i+\Delta\mathbf{x}_i$$, $$\mathbf{x}'_i=\mathbf{x}_i+\mathbf{u}'_i$$.

Theorem 5.1 assembles the pieces: with an $$E(n)$$-invariant graph construction, invariant edge attributes, $$\mathbf{r}_{ij}\neq\mathbf{0}$$ wherever $$\widehat{\mathbf{r}}_{ij}$$ appears, and transports satisfying Proposition 3.2, the whole layer is exactly $$E(n)$$-equivariant — coordinates move with the frame, vectors rotate, scalars are untouched. The proof is a straight audit of the five stages; every one preserves the transformation type of its inputs.

## Directed, and only sometimes a connection

A structural point distinguishes ESNN inside the sheaf family. Because $$\mathcal{T}_{i\leftarrow j}$$ and $$\mathcal{T}_{j\leftarrow i}$$ are parameterised independently, the normalised transport operator is **directional and need not be self-adjoint** — for a fixed layer context it is a quiver representation (vector spaces on nodes, linear maps on arrows, composable along paths) rather than a Laplacian. That places ESNN in the same current as the recent directed-sheaf work: [Cooperative Sheaf Neural Networks](/blog/sheaf/cooperative-sheaf-networks/) and Directed Sheaf Neural Networks also refuse to make the two orientations of an edge carry the same interaction, and copresheaf networks make the directed-functor view explicit.

The classical picture is recovered as a hierarchy of specialisations, worked out in Appendix C. Impose adjoint consistency on a bidirected graph — $$\nu_{ij}=\nu_{ji}$$ and $$\mathcal{T}_{j\leftarrow i}=\mathcal{T}^{*}_{i\leftarrow j}$$ — and the operator becomes self-adjoint (Proposition C.1). Additionally require each full transport to be an orthogonal map $$\mathcal{U}_{i\leftarrow j}$$ of the whole stalk $$\mathcal{H}=\mathbb{R}^n\otimes\mathbb{R}^{c_v}$$, with the reverse map its adjoint — hence its inverse — and the transport is realised *exactly* by classical sheaf restriction maps, with edge contribution

<div class="formula-box">
\[
\mathbf{L}_e=\begin{pmatrix}\mathbf{I}_{\mathcal{H}} & -\,\mathcal{U}_{i\leftarrow j}\\[2pt] -\,\mathcal{U}^{*}_{i\leftarrow j} & \mathbf{I}_{\mathcal{H}}\end{pmatrix}
\]
</div>

— a discrete orthogonal connection, the [Conn-NSD](/blog/sheaf/conn-nsd-paper/) coupling (Proposition C.2). Outside that specialisation, "connection-style" describes the geometric role of the transport, not an exact connection sheaf.

<div class="warning-box">
<strong>Ambient equivariance is not gauge equivariance.</strong> ESNN's symmetry is one global \(Q\in O(n)\) applied to the whole system — coordinates and every vector feature at once. It is deliberately <em>not</em> covariance under independent per-node frame changes \(\mathbf{V}_i\mapsto Q_i\mathbf{V}_i\): the cross-feature matrix behind Orthogonal transport transforms as \(Q_j\mathbf{C}_{ij}Q_i^{\top}\) under independent changes and only reduces to conjugation when \(Q_i=Q_j\). The paper states this distinction precisely and leaves the gauge-equivariant extension — transports transforming as \(\mathbf{Q}_i\mathcal{T}_{i\leftarrow j}\mathbf{Q}_j^{\top}\) — as future work. If you come to this paper from the GNN book's <a href="/blog/gnn/equivariant-sheaf-gnns/">connection-Laplacian and gauge-theory post</a>, this is the paragraph that locates it on that map.
</div>

## Breaking symmetry on purpose

Full $$E(n)$$-equivariance is the right prior only when the physics has no preferred direction. Gravity, background flow, an applied field — all select an axis and *reduce* the true symmetry group. Hard-coding the reduction (as subequivariant GNNs do) requires knowing the axis; ignoring it wastes the information. ESNN threads the needle with one scalar: symmetry becomes a dial rather than a switch — and the dial starts at zero.

When symmetry relaxation is enabled, the edge context is augmented with a single signed projection,

<div class="formula-box">
\[
\mathbf{z}^{\mathrm{relaxed}}_{ij}=\big[\mathbf{z}_{ij},\;\lambda_g\,\langle\mathbf{r}_{ij},\mathbf{g}\rangle\big]
\]
</div>

where $$\mathbf{g}$$ is a global preferred direction — prescribed, or a learned parameter — and $$\lambda_g$$ is a **learnable relaxation coefficient initialised at zero**. (Two disambiguations: $$\lambda_g$$ is a single global scalar, unrelated to the per-edge transport scale $$\lambda_{ij}$$; and $$\mathbf{g}\in\mathbb{R}^n$$ is a direction, not the channel gate $$\mathbf{g}_{ij}$$.) Theorem 6.1 gives the exact accounting. For $$\lambda_g\neq 0$$, the architecture is equivariant to the stabiliser subgroup $$E_{\mathbf{g}}(n)=O_{\mathbf{g}}(n)\ltimes\mathbb{R}^n$$ — all translations, plus every rotation or reflection fixing $$\mathbf{g}$$. The reason is one line: $$\langle Q\mathbf{r},\mathbf{g}\rangle=\langle\mathbf{r},\mathbf{g}\rangle$$ exactly when $$Q^{\top}\mathbf{g}=\mathbf{g}$$. And at $$\lambda_g=0$$ the directional term vanishes identically, so full $$E(n)$$-equivariance is recovered — not approximately, exactly.

<div class="insight-box">
<strong>Why zero-initialisation is the elegant part.</strong> The model <em>starts</em> exactly equivariant and must be pushed off the symmetric point by gradients — symmetry breaking becomes something training does only when the data pays for it, and the learned \(\lambda_g\) is a readable diagnostic of whether it did. This sits between two existing regimes: subequivariant models (exact subgroup, axis known a priori) and relaxed-equivariance methods (approximate deviations, no group-theoretic guarantee). ESNN keeps the exact stabiliser guarantee <em>and</em> learns the axis.
</div>

## Where transport earns its keep

The evaluation is organised as four questions, each isolating one claim.

**Q1 — Does richer transport help when full symmetry is correct?** Charged 5-body dynamics in the reduced-data protocol — 3,000 training trajectories, predicting 0.2 simulation-time units ahead — where $$E(3)$$ is the true prior, so EGNN and ESNN share the same symmetry assumption and differ only in transport.

| Method | MSE ↓ |
|---|---|
| SE(3)-Transformer | 0.0244 |
| Tensor Field Network | 0.0155 |
| Graph Neural Network | 0.0107 |
| EGNN | 0.0071 |
| ESNN-Id | 0.0060 |
| ESNN-Diag | 0.0054 |
| ESNN-RadTan | 0.0052 |
| **ESNN-Ortho** | **0.0051** |

Every variant beats EGNN; the best cuts error by ~28%. The instructive gap is Id → Ortho/RadTan: the architecture shell explains part of the gain (0.0071 → 0.0060), but *learning the transport itself* is worth the rest. Anisotropic edge maps pay even when the symmetry assumption is unchanged.

**Q2 — Can it exploit reduced symmetry, or discover the axis?** Same system plus uniform gravity $$\mathbf{a}_g=(0,0,-9.81)^{\top}$$, now observed at the very start of the trajectory and predicted over a five-times-longer horizon. The early window is the point of the protocol: run the system for long and gravity stamps a common downward drift onto every velocity — and since velocities are input vector features, any equivariant model could then read the axis straight off them. Observing before that happens forces the model to *infer* the hidden axis rather than be handed it. Three matched settings: *None* (fully equivariant), *Fixed* (true axis given), *Learned* (a single trainable global vector, axis inferred from dynamics).

| Mode | MSE ↓ (best transport) | Alignment $$A_g$$ ↑ |
|---|---|---|
| None — full $$E(3)$$ | 0.1019 ± 0.0324 | – |
| Fixed $$\mathbf{g}$$ | 0.0198 ± 0.0017 | 1.000 (by construction) |
| Learned $$\mathbf{g}$$ | **0.0197 ± 0.0015** | **1.000** |

A five-fold error gap separates the equivariant model from both relaxed ones — the cost of insisting on a symmetry the data does not have. The result that matters: **Learned matches Fixed**, with sign-invariant alignment $$\lvert\langle\widehat{\mathbf{g}},\widehat{\mathbf{g}}_{\mathrm{true}}\rangle\rvert=1.000$$ across every transport family and seed. Nothing pushes it there — there is no penalty on $$\mathbf{g}$$ or $$\lambda_g$$ anywhere in the objective; the equivariant prior lives entirely in the zero initialisation — yet the learned relaxation scales $$\max_\ell\lvert\lambda^{(\ell)}_g\rvert\lVert\mathbf{g}\rVert_2$$ come out decisively non-zero (0.40 ± 0.07 for Ortho, 2.06 ± 0.63 for RadTan).

The zero-initialised pathway switches itself on and points at gravity.

**Q3 — Mesh-based simulation.** Three MeshGraphNets benchmarks — incompressible flow (CylinderFlow), structural deformation (DeformingPlate), compressible aerodynamics (Airfoil) — RMSE ×10⁻³ at one step, 50 steps, and full rollout:

| | 1-step | 50-step | Full trajectory |
|---|---|---|---|
| **DeformingPlate** — MeshGraphNets | 0.25 | 1.8 | 15.1 |
| **DeformingPlate** — ESNN-RadTan | **0.08** | **1.0** | **5.8** |
| **CylinderFlow** — MeshGraphNets | **2.34** | **6.3** | 40.88 |
| **CylinderFlow** — ESNN-Ortho | 2.40 | 7.7 | **35.94** |
| **Airfoil** — MeshGraphNets | **314** | **582** | 11529 |
| **Airfoil** — ESNN-RadTan | 2584 | 3346 | **7787** |

The paper is candid that the advantage is not uniform, and the pattern is more interesting than a clean sweep would be. DeformingPlate — where anisotropy is the physics: material response along versus across the deformation — is better at *every* horizon, and not only for the best variant: every ESNN family, Identity included, beats MeshGraphNets at all three horizons, with the best full-rollout error under 40% of the baseline's. CylinderFlow and Airfoil trade short-horizon accuracy for better full-trajectory error — modestly on CylinderFlow (40.88 → 35.94), substantially on Airfoil (11529 → 7787). The suggestion: structured equivariant transport earns its keep where geometric information must survive **repeated** propagation through an evolving state, i.e. exactly where autoregressive rollouts die. And this is a general-purpose geometric architecture matching a purpose-built mesh simulator on its own benchmarks.

**Q4 — Rotation generalisation off physics.** ModelNet40 classification on k-NN graphs, with the informative protocol being $$z/\mathrm{SO}(3)$$: train with vertical-axis rotations only, test under arbitrary 3D rotations.

| Method | z/z | z/SO(3) | SO(3)/SO(3) | $$\Delta_{\mathrm{OOD}}$$ ↓ |
|---|---|---|---|---|
| PointNet | 85.9 | 19.6 | 74.7 | 66.3 |
| DGCNN | 90.3 | 33.8 | 88.6 | 56.5 |
| VN-DGCNN | 89.5 | 89.5 | 90.2 | 0.0 |
| CRIN | 91.8 | 91.8 | 91.8 | 0.0 |
| ESNN-Id | 84.7 | 85.7 | 85.6 | 1.1 |
| ESNN-Diag | 84.6 | 84.3 | 84.4 | 0.3 |
| ESNN-Ortho | 84.9 | 85.2 | 84.7 | 0.2 |
| ESNN-RadTan | 85.4 | 84.6 | 86.3 | 0.7 |

ESNN holds 84–86% essentially unmoved across protocols ($$\Delta_{\mathrm{OOD}}\le 1.1$$, and just 0.2 for Ortho) while orientation-sensitive baselines shed 50+ points; the exactly invariant baselines sit at 0.0 by construction. This is robustness by construction, not by augmentation. Specialised rotation-invariant point-cloud architectures do reach higher absolute accuracy; the point of this experiment is transfer, the *same* transport framework moving from particle physics to shape recognition intact.

**QM9, as a coda.** On twelve invariant molecular targets, the strongest ESNN variant beats EGNN on nine (including $$\alpha$$, $$\Delta\epsilon$$, $$\mu$$), with Radial–Tangential the best family on most — evidence the transport helps even when the final prediction is a single invariant scalar. EGNN keeps $$C_v$$, $$H$$ and $$\langle R^2\rangle$$, and dedicated molecular architectures remain ahead in absolute terms; the paper frames this benchmark as a transport-mechanism test, not a leaderboard entry.

## Where this sits in the sheaf story

Three threads of this book meet in ESNN.

**The meaning of restriction maps.** The recurring finding in this literature — from [identity-sheaf baselines being competitive](/blog/sheaf/neural-sheaf-diffusion/) to [Conn-NSD computing maps instead of learning them](/blog/sheaf/conn-nsd-paper/) — is that unrestricted learned maps are not automatically useful; structure is what makes them earn their parameters. ESNN is the sharpest version of that lesson so far: it derives the *correct* structure from a symmetry requirement, and then proves (Theorem 4.3) that under displacement conditioning nothing else was available anyway. The sheaf stops being an abstract algebraic gadget and becomes a carrier of physical transformation law.

**Directionality.** The self-adjoint sheaf Laplacian's inability to treat $$i\to j$$ and $$j\to i$$ differently drove [CSNN](/blog/sheaf/cooperative-sheaf-networks/) to directed sheaves; ESNN arrives at directed transport from the opposite motivation — physical interactions are asymmetric — and keeps the classical picture available as an exact specialisation rather than discarding it.

**Symmetry as a dial rather than a switch.** Where the rest of the sheaf literature fixes its symmetry stance in the architecture, the relaxation mechanism makes it a differentiable, zero-initialised, group-theoretically-accounted parameter. That template — exact equivariance as the origin of a learnable coordinate, stabiliser guarantees away from it — seems likely to travel well beyond this paper.

Honest limits, stated by the authors: features stay scalar-plus-first-order-vector (no higher tensors); the completeness theorem covers displacement-conditioned linear transport only, with the feature-conditioned class left uncharacterised; the relaxation mechanism assumes one global preferred direction, not a spatially varying field; and the mesh gains are horizon- and system-dependent rather than uniform. Gauge-aware local transport and richer symmetry-breaking fields are named as the road ahead.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>ESNN bridges the two literatures: sheaf-style matrix-valued edge transport, constrained — unlike generic sheaf parameterisations — to respect the ambient Euclidean transformation law of geometric vector features.</li>
  <li>Every transport factorises as covariant spatial operator × invariant channel operator, \(\sum_k \mathbf{S}^{(k)}_{ij}\mathbf{V}_j\mathbf{M}^{(k)}_{ij}\) — the symmetry burden lives entirely on the spatial factor, leaving channel mixing free.</li>
  <li>Four families: Identity, Diagonal (isotropic), Orthogonal (feature-conditioned \(SO(n)\) rotation via matrix exponential of a skew cross-feature generator), Radial–Tangential (independent longitudinal/transverse channel maps; projectors applied in \(\mathcal{O}(nc_v)\), the full transport in \(\mathcal{O}(nc_v^2)\)).</li>
  <li><strong>Theorem 4.3:</strong> with displacement as the only covariant input, the radial–tangential form is the <em>complete</em> class of linear \(O(n)\)-equivariant transports — proved by a stabiliser/Schur argument. Scope: needs full \(O(n)\) (under \(SO(3)\), \([\widehat{\mathbf{r}}]_{\times}\) sneaks in) and displacement-only conditioning.</li>
  <li>The transport operator is directed and generally not self-adjoint — a quiver representation — with adjoint-consistency and orthogonality recovering classical connection sheaves exactly as a special case.</li>
  <li>Controlled symmetry relaxation via zero-initialised \(\lambda_g\langle\mathbf{r}_{ij},\mathbf{g}\rangle\): exact \(E(n)\)-equivariance at \(\lambda_g=0\), exact stabiliser equivariance \(E_{\mathbf{g}}(n)=O_{\mathbf{g}}(n)\ltimes\mathbb{R}^n\) when active, and \(\mathbf{g}\) learnable — recovering the gravity axis from data with alignment 1.000 while matching the oracle given the true axis.</li>
  <li>Results: −28% MSE vs EGNN on charged N-body; 5× error reduction under gravity vs the fully equivariant model; DeformingPlate beaten at every horizon (15.1 → 5.8 full-rollout) and best full-trajectory error on all three mesh benchmarks; ModelNet40 accuracy shifting ≤ 1.1 points under unseen test rotations.</li>
  <li>Limits, plainly stated: first-order features only, completeness restricted to displacement conditioning, one global preferred direction, and mesh gains concentrated at long horizons.</li>
</ul>
</div>

## References

- Borgi, A.\*, Severino, M.\*, Silvestri, F., & Liò, P. (2026). [Equivariant Sheaf Neural Networks: Learning Geometric Transport on Graphs](https://arxiv.org/abs/2608.28853). *arXiv:2608.28853*.
- Satorras, V. G., Hoogeboom, E., & Welling, M. (2021). [E(n) Equivariant Graph Neural Networks](https://arxiv.org/abs/2102.09844). *ICML 2021*.
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 Workshop on TDA and Beyond*.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 TAG-ML Workshop*.
- Ribeiro, A., Tenório, A. L., Belieni, J., Souza, A. H., & Mesquita, D. (2025). [Cooperative Sheaf Neural Networks](https://arxiv.org/abs/2507.00647). *arXiv:2507.00647*.
- Fiorini, S., Aktas, H., Duta, I., Coniglio, S., Morerio, P., Del Bue, A., & Liò, P. (2025). [Sheaves Reloaded: A Directional Awakening](https://arxiv.org/abs/2506.02842). *arXiv:2506.02842*.
- Hajij, M., et al. (2025). Copresheaf Topological Neural Networks: A Generalized Deep Learning Framework. *NeurIPS 2025*.
- Han, J., Huang, W., Ma, H., Li, J., Tenenbaum, J., & Gan, C. (2022). Learning Physical Dynamics with Subequivariant Graph Neural Networks. *NeurIPS 2022*.
- Hofgard, E., Wang, R., Walters, R., & Smidt, T. (2024). [Relaxed Equivariant Graph Neural Networks](https://arxiv.org/abs/2407.20471). *arXiv:2407.20471*.
- Schütt, K., Unke, O., & Gastegger, M. (2021). Equivariant Message Passing for the Prediction of Tensorial Properties and Molecular Spectra (PaiNN). *ICML 2021*.
- Thomas, N., Smidt, T., Kearnes, S., Yang, L., Li, L., Kohlhoff, K., & Riley, P. (2018). [Tensor Field Networks](https://arxiv.org/abs/1802.08219). *arXiv:1802.08219*.
- Pfaff, T., Fortunato, M., Sanchez-Gonzalez, A., & Battaglia, P. W. (2021). [Learning Mesh-Based Simulation with Graph Networks](https://arxiv.org/abs/2010.03409). *ICLR 2021*.
- Kipf, T., Fetaya, E., Wang, K.-C., Welling, M., & Zemel, R. (2018). Neural Relational Inference for Interacting Systems. *ICML 2018*.
- Wu, Z., Song, S., Khosla, A., Yu, F., Zhang, L., Tang, X., & Xiao, J. (2015). 3D ShapeNets: A Deep Representation for Volumetric Shapes. *CVPR 2015*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
