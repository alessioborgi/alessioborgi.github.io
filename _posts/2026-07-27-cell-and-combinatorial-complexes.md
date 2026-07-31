---
layout: single
title: "Beyond Simplices: Cell and Combinatorial Complexes"
date: 2026-07-27
categories: [research]
book: tdl
subsection: ml-integration
tags: [topological-deep-learning, cell-complexes, combinatorial-complexes, hypergraphs, higher-order]
published: true
excerpt: "A simplicial complex cannot hold a benzene ring as a single cell — filling the hexagon costs three edges between atoms that share no bond, and this one constraint is what cell and combinatorial complexes exist to remove."
author_profile: true
read_time: true
is_overview: false
icon: "⬡"
read_mins: 16
permalink: /blog/tdl/cell-and-combinatorial-complexes/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The downward-closure axiom forces a simplicial complex to contain every subset of every cell, which pins the dimension of a cell to its size: a two-dimensional cell has exactly three vertices, full stop. So a six-membered ring cannot be one face — triangulating it costs three diagonals between atoms that are not bonded. Cell complexes drop that constraint by gluing a disc along <em>any</em> boundary cycle; hypergraphs drop it in a different direction, allowing arbitrary subsets with no boundary structure at all; combinatorial complexes keep only a set of cells, an order-preserving rank, and a neighbourhood relation, which is all message passing ever needed. The cost is real: the more permissive the domain, the less inherited theory you get. Simplicial complexes hand you a canonical signed boundary map and a Hodge Laplacian; a general combinatorial complex hands you neighbourhood matrices and nothing else.
</div>

## The rule that gets in the way

A simplicial complex $$K$$ on a vertex set $$V$$ is a collection of non-empty finite subsets of $$V$$ that is closed downwards:

<div class="formula-box">
\[
\sigma \in K, \quad \emptyset \neq \tau \subseteq \sigma \quad \Longrightarrow \quad \tau \in K
\]
</div>

That single axiom does more work than it looks. Because every subset of a cell must itself be a cell, and because the cells are subsets of $$V$$, the dimension of a cell is determined by its size: a cell with $$p+1$$ vertices is a $$p$$-simplex, and there is no other option. A two-dimensional cell is a triangle. Not a square, not a pentagon — a triangle.

Now take a benzene-style aromatic ring: six carbons, six bonds, no chords. The ring is the chemically meaningful object. Aromaticity is a property of the cycle as a whole, not of any individual bond, so you would like the ring to *be* a cell — one two-dimensional object with its own feature vector, participating in message passing alongside the atoms and the bonds.

In a simplicial complex you cannot have that. The only two-dimensional cells available are triangles, so filling the hexagon means triangulating it. A convex polygon with $$n$$ vertices triangulates into $$n-2$$ triangles using $$n-3$$ diagonals. For $$n = 6$$ that is **four triangles and three diagonals**. Fanning from atom 1, the diagonals are 1–3, 1–4 and 1–5: the two meta relationships and the para relationship. None of them is a bond. The filled ring now carries **nine edges where the molecule has six**, and nineteen cells in total ($$6 + 9 + 4$$) against the thirteen ($$6 + 6 + 1$$) that a single hexagonal face would need.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" role="img" style="width:100%;max-width:640px;font-family:sans-serif;">
  <title>A six-membered ring filled with four simplices versus the same ring carried by a single 2-cell</title>
  <rect x="1" y="1" width="638" height="298" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="150" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Simplicial fill: 9 edges, 4 triangles</text>
  <text x="490" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Cell complex: 6 edges, 1 face</text>

  <!-- left: fan triangulation from atom 1 -->
  <polygon points="150,55 215,92.5 215,167.5" fill="#0d9488" fill-opacity="0.14"/>
  <polygon points="150,55 215,167.5 150,205" fill="#0d9488" fill-opacity="0.14"/>
  <polygon points="150,55 150,205 85,167.5" fill="#0d9488" fill-opacity="0.14"/>
  <polygon points="150,55 85,167.5 85,92.5" fill="#0d9488" fill-opacity="0.14"/>

  <line x1="150" y1="55" x2="215" y2="167.5" stroke="#c2410c" stroke-width="2" stroke-dasharray="6,4"/>
  <line x1="150" y1="55" x2="150" y2="205" stroke="#c2410c" stroke-width="2" stroke-dasharray="6,4"/>
  <line x1="150" y1="55" x2="85" y2="167.5" stroke="#c2410c" stroke-width="2" stroke-dasharray="6,4"/>

  <polygon points="150,55 215,92.5 215,167.5 150,205 85,167.5 85,92.5" fill="none" stroke="#334155" stroke-width="3"/>

  <circle cx="150" cy="55" r="6" fill="#334155"/>
  <circle cx="215" cy="92.5" r="6" fill="#334155"/>
  <circle cx="215" cy="167.5" r="6" fill="#334155"/>
  <circle cx="150" cy="205" r="6" fill="#334155"/>
  <circle cx="85" cy="167.5" r="6" fill="#334155"/>
  <circle cx="85" cy="92.5" r="6" fill="#334155"/>

  <text x="150" y="44" text-anchor="middle" font-size="11" fill="#475569">1</text>
  <text x="232" y="89" text-anchor="middle" font-size="11" fill="#475569">2</text>
  <text x="232" y="178" text-anchor="middle" font-size="11" fill="#475569">3</text>
  <text x="150" y="223" text-anchor="middle" font-size="11" fill="#475569">4</text>
  <text x="68" y="178" text-anchor="middle" font-size="11" fill="#475569">5</text>
  <text x="68" y="89" text-anchor="middle" font-size="11" fill="#475569">6</text>

  <text x="150" y="252" text-anchor="middle" font-size="11" fill="#c2410c">dashed 1–3, 1–4, 1–5: invented, not bonds</text>
  <text x="150" y="270" text-anchor="middle" font-size="11" fill="#475569">19 cells in total</text>

  <!-- right: one 2-cell attached along the six real bonds -->
  <polygon points="490,55 555,92.5 555,167.5 490,205 425,167.5 425,92.5" fill="#7c3aed" fill-opacity="0.16" stroke="#334155" stroke-width="3"/>

  <circle cx="490" cy="55" r="6" fill="#334155"/>
  <circle cx="555" cy="92.5" r="6" fill="#334155"/>
  <circle cx="555" cy="167.5" r="6" fill="#334155"/>
  <circle cx="490" cy="205" r="6" fill="#334155"/>
  <circle cx="425" cy="167.5" r="6" fill="#334155"/>
  <circle cx="425" cy="92.5" r="6" fill="#334155"/>

  <text x="490" y="135" text-anchor="middle" font-size="12" font-weight="700" fill="#5b21b6">one 2-cell</text>
  <text x="490" y="252" text-anchor="middle" font-size="11" fill="#475569">boundary = the six real bonds</text>
  <text x="490" y="270" text-anchor="middle" font-size="11" fill="#475569">13 cells in total</text>
</svg>
<figcaption>Left: filling a six-membered ring inside a simplicial complex. A hexagon triangulates into four 2-simplices, which needs three diagonals (dashed) joining atoms that share no bond, giving nine edges and nineteen cells. Right: the same ring as a single 2-cell attached along the six real bonds — six edges, one face, thirteen cells, and nothing invented.</figcaption>
</figure>
</div>

The obvious workaround is worse. Add a phantom vertex at the ring centre and cone the hexagon over it: that is seven vertices, twelve edges and six triangles, twenty-five cells, plus an atom that does not exist. And no triangulation is canonical — a hexagon has $$C_4 = 14$$ distinct triangulations, and nothing in the chemistry prefers one of them.

Be precise about what is actually lost here, because it is easy to overstate. Closure does not stop you *representing* the ring. Leave the hexagon unfilled and it is a genuine 1-cycle; $$H_1$$ sees it, persistent homology sees it. What closure prevents is making the ring a **single cell** — an object with a rank, a learnable feature vector, and a defined place in the neighbourhood structure that messages travel along. That is the thing higher-order networks want, and closure denies it.

<div class="insight-box">
  <strong>Key Insight:</strong> The problem is not that simplicial complexes are too small a class of spaces. Up to homotopy they are not: the filled hexagon and the four-triangle fan are both contractible discs, so no topological invariant tells them apart. The problem is that a neural network reads <em>cells</em>, not homotopy types. Nineteen cells with three fictitious adjacencies is a different computational object from thirteen cells with none, even when the two are topologically identical.
</div>

## What closure buys, so you know what you are giving up

Before dropping the axiom, it is worth being clear on what it pays for. Closure means every $$p$$-simplex has exactly $$p+1$$ faces of dimension $$p-1$$, all present, all obtained by deleting one vertex. That gives a boundary map with no design decisions in it:

<div class="formula-box">
\[
\partial_p [v_0, v_1, \ldots, v_p] \;=\; \sum_{i=0}^{p} (-1)^i \, [v_0, \ldots, \widehat{v_i}, \ldots, v_p]
\]
</div>

where the hat means the vertex is omitted. The alternating signs are what make consecutive boundaries compose to zero, $$\partial_p \circ \partial_{p+1} = 0$$, which is the whole basis of homology. From the same maps you get the Hodge Laplacian in each degree,

<div class="formula-box">
\[
L_p \;=\; \partial_{p+1}\partial_{p+1}^{\top} \;+\; \partial_p^{\top}\partial_p ,
\qquad
C_p \;=\; \operatorname{im}\partial_{p+1} \,\oplus\, \ker L_p \,\oplus\, \operatorname{im}\partial_p^{\top}
\]
</div>

with $$\ker L_p \cong H_p(K;\mathbb{R})$$. None of this requires a choice: order the vertices and everything else follows. That canonicality is the asset. Remember it — section six is about what happens when you spend it.

## Cell complexes: glue a disc along whatever you like

A CW complex is built one dimension at a time. Start with a set of points, the 0-cells. To add a 1-cell, take a closed interval and glue its two endpoints onto points already present. To add a 2-cell, take a closed disc $$D^2$$ and glue its boundary circle onto the existing structure by a continuous **attaching map**. In general, a $$p$$-cell is a copy of $$D^p$$ glued along $$S^{p-1}$$ to the part of the complex already built.

All the freedom is in the attaching map, and nothing in the definition says the circle has to land on three edges. It can run once around the six bonds of an aromatic ring and stop. The result is a legitimate 2-cell whose boundary is exactly the ring — a hexagonal face with six boundary edges, none of them invented.

For the combinatorial setting the case that matters is the **regular** one, where each attaching map is a homeomorphism onto its image and the boundary of every cell is a union of lower-dimensional cells. Regularity is what keeps the structure finite and bookkeepable: incidence numbers land in $$\{-1, 0, +1\}$$ and can be read off the combinatorics instead of computed as degrees of maps.

Two facts fix the relationship to simplices. Every simplicial complex *is* a regular cell complex — a $$p$$-simplex is a $$p$$-disc attached along its faces, and closure guarantees those faces are present. The converse fails concretely: on six vertices carrying exactly the six edges of a 6-cycle, no triangle exists, so no 2-simplex can be attached at all, while a cell complex attaches one hexagonal face without adding a thing.

In practice you get a cell complex from a graph by a **lift**: choose a family of cycles and attach a 2-cell to each. Bodnar et al. use exactly this in CW Networks, and the payoff is easy to see on a small example. Take the disjoint union of two triangles, and take a single 6-cycle. Both have six vertices, six edges, and every vertex of degree 2 whose neighbours also have degree 2 — so 1-WL assigns the same colour to every vertex of both graphs at every round and never separates them. Lift by attaching a 2-cell to each cycle and the two objects stop being comparable at a glance: one has two faces with boundary length 3, the other has one face with boundary length 6.

## Hypergraphs relax a different axiom

A hypergraph is a pair $$(V, E)$$ where $$E$$ is a set of non-empty subsets of $$V$$ of any size. There is no closure requirement and no relation asserted between a hyperedge and its subsets. A paper with five authors is one hyperedge on five vertices; it does not claim that any four of them ever collaborated. Reaching for a simplicial complex here would be a modelling error, because closure would manufacture exactly that claim — thirty smaller collaborations that never happened.

So hypergraphs are the right semantics for set-valued data, and precisely the wrong semantics for geometry. A hyperedge has no boundary. There is no interior-to-boundary hierarchy, no notion of "the faces of this cell", nothing that plays the role of $$\partial$$. That is why the usual hypergraph learning reductions — clique expansion, star expansion — discard information: they flatten a set-type relation onto pairwise or bipartite structure that was never the point.

Notice that hypergraphs and cell complexes relax two *different* things. Cell complexes keep a boundary hierarchy and give up the size-equals-dimension rule. Hypergraphs give up the hierarchy entirely and keep nothing in its place. Neither contains the other.

## Combinatorial complexes: rank instead of closure

Step back and ask what higher-order message passing actually consumes. Every such layer has the same shape:

<div class="formula-box">
\[
h_x^{(\ell+1)} \;=\; \phi\!\left( h_x^{(\ell)}, \;\; \bigoplus_{\mathcal{N} \in \mathfrak{N}} \; \bigoplus_{y \in \mathcal{N}(x)} \psi_{\mathcal{N}}\!\left(h_x^{(\ell)}, h_y^{(\ell)}\right) \right)
\]
</div>

Read off what is required: a set of cells $$x$$, some notion of which cells are comparable in scale, and a family $$\mathfrak{N}$$ of neighbourhood functions. Discs, attaching maps and homeomorphisms appear nowhere. That observation is what a **combinatorial complex** formalises. It is a triple $$(S, \mathcal{X}, \mathrm{rk})$$ with $$S$$ a ground set, $$\mathcal{X} \subseteq \mathcal{P}(S) \setminus \{\emptyset\}$$ a set of cells, and $$\mathrm{rk} : \mathcal{X} \to \mathbb{Z}_{\geq 0}$$ a rank function, subject to two conditions only:

<div class="formula-box">
\[
\text{(i)}\;\; \{s\} \in \mathcal{X} \;\; \text{for all } s \in S,
\qquad
\text{(ii)}\;\; x \subseteq y \;\Longrightarrow\; \mathrm{rk}(x) \leq \mathrm{rk}(y)
\]
</div>

Condition (i) says the singletons are cells. Condition (ii) — the rank function is order-preserving — is the entire replacement for closure. It does not require that subsets of a cell be cells; it only requires that when a subset *does* happen to be a cell, its rank is no larger. That is enough to organise the cells into a hierarchy of interior-to-boundary relations without demanding that the hierarchy be complete.

From the rank function and set inclusion you can define the neighbourhoods directly. Hajij et al. define down-incidence and up-incidence (the cells strictly contained in, or strictly containing, a given cell), together with adjacency and coadjacency (cells of equal rank linked through a higher-rank or lower-rank cell), each optionally restricted by a prescribed rank gap. These become the incidence matrices $$B_{r,k}$$ and adjacency matrices $$A_{r,k}$$ that the layer above sums over.

<div class="insight-box">
  <strong>Three ways to read the same definition:</strong> a combinatorial complex is a simplicial complex in which cells are permitted to be missing; or a cell complex with the attachment condition relaxed to a bare rank; or a hypergraph enriched with a rank function. All three readings are accurate, which is exactly why the definition unifies the family.
</div>

## The family is a lattice, not a ladder

It is tempting to draw one arrow of increasing generality, but the picture has two independent axes. Axis one: must the subsets of a cell also be cells? Axis two: is a cell's rank forced by its cardinality?

Simplicial complexes answer yes to both. Cell complexes answer yes to a weakened form of the first (the boundary must consist of lower-rank cells) and no to the second, which is exactly what admits a hexagonal face. Hypergraphs answer no to the first and have no meaningful second axis, since there are effectively only two ranks. Combinatorial complexes answer no to the first and no to the second, keeping only monotonicity.

So $$\text{graph} \subset \text{simplicial complex} \subset \text{cell complex}$$ is a genuine chain, hypergraphs sit off to one side as a different relaxation, and combinatorial complexes sit above the whole picture as a container that can encode any of them.

| Domain | What a top cell can be | Closure requirement | What it models naturally |
|---|---|---|---|
| Graph | an edge: exactly two vertices | both endpoints must be vertices | pairwise relations |
| Simplicial complex | a *p*-simplex: exactly *p*+1 vertices, so dimension is fixed by size | every non-empty subset of a cell is itself a cell | triangulations, meshes of triangles, clique structure |
| Regular cell complex | a *p*-cell, a disc glued along a boundary sphere; a 2-cell can span a cycle of any length | the boundary of each cell is a union of lower-rank cells, but arbitrary vertex subsets need not be cells | rings, polygonal faces, polyhedral meshes, planar layouts |
| Hypergraph | a hyperedge: any non-empty subset of vertices, any size | none | set-valued relations of varying size, with no boundary |
| Combinatorial complex | any non-empty subset of the ground set, carrying an assigned rank | none; the rank function need only be order-preserving | mixed data with both set-type and part-whole relations |

## What the generality costs

Generality is bought, not granted, and the currency is inherited theory.

**You lose the canonical boundary map.** The alternating-sum formula works because closure guarantees that a $$p$$-simplex has all $$p+1$$ of its facets and that they are indexed by which vertex was deleted. Regular cell complexes still give you a chain complex, but the incidence numbers now depend on chosen orientations and on the chosen cell structure. A general combinatorial complex gives you nothing of the kind. The framework supplies *unsigned* incidence and adjacency matrices, and an unsigned incidence matrix does not compose to zero: without signs there is no chain complex, hence no homology, hence no Hodge Laplacian in the strict sense. What you actually hold is a symmetric non-negative diffusion operator. It is a perfectly good thing to run a network on, but its kernel is not a homology group and its spectrum decomposes nothing.

**You lose canonicality of the object itself.** A Vietoris–Rips complex is determined by a metric and a scale — hand two people the same point cloud and they build the same complex. A ring lift is determined by taste. Fill all induced cycles up to length six? Up to length eight? Use a minimum cycle basis, which need not be unique? Each answer produces a different complex, a different operator and different predictions, and none of them is forced by the data. This is a real modelling burden that does not exist upstream.

**Topological invariance does not rescue you.** Cellular homology is independent of the CW structure, so a topologist can afford to be relaxed about which structure they chose. A network cannot: it reads cells, and the cells are not invariant. The same space admits many cell structures, and the inductive bias you install is a property of the structure, not of the space.

**Cells cost compute.** The cell set *is* the message-passing graph. Filling every induced cycle up to a generous length in a dense graph can produce far more cells than there are vertices, and every one of them carries state and participates in aggregation. On sparse molecular graphs this is cheap; it stops being cheap quickly.

**The expressivity theory thins out.** Message Passing Simplicial Networks and CW Networks come with WL-style tests and proved separations. A "combinatorial complex network" is not a single model class: its power depends on which of the incidence and adjacency relations you actually switch on, so a theorem about one instantiation says little about another. Treat the framework as a language for writing models down, not as a model with guarantees attached.

<div class="warning-box">
  <strong>The trap:</strong> "more general" reads as "strictly better", and it is not. Moving from simplicial to combinatorial does not add capability for free — it removes constraints, and some of those constraints were load-bearing theorems. If your pipeline consumes a Hodge decomposition or a persistence diagram, generalising the domain deletes the thing you were using.
</div>

## How to choose

Default to the smallest domain that can express the relation you care about, and make the lift earn its place. If a plain graph already encodes the relation, lifting adds cells, parameters and arbitrary choices, and may buy nothing at all.

**Genuine set-valued relations of varying size, with no boundary.** Co-authorship, chemical reactions relating a set of reagents, retail baskets, gene sets, group chats. Use a **hypergraph**. There is no interior-to-boundary structure to model, and imposing a rank hierarchy would be fiction. Resist the urge to take the closure and call it a simplicial complex: that manufactures sub-relations the data never asserted.

**Rings, faces and cycles with meaningful boundaries.** Molecules, triangle and quad meshes, planar circuits, road networks with blocks. Use a **cell complex**. The ring becomes one object, the boundary relation is real rather than invented, and the incidence structure means something chemically or geometrically. This is the case where the extra generality directly removes a modelling error rather than merely enabling one.

**You need the Hodge theory.** Edge flows, gradient–curl–harmonic decomposition, harmonic representatives, anything feeding persistent homology downstream. **Stay simplicial.** The operators are canonical, the theory is mature and the software exists. Triangulating everything is a price, but it is a price you pay knowingly and once, and the alternative is reconstructing the theory yourself on a domain that does not supply it.

**Both kinds of relation in one dataset, or you want to compare domains inside one implementation.** Use a **combinatorial complex** as the container. Its value is that it lets you write a hypergraph, a cell complex and a simplicial complex in a single formalism and swap between them without rewriting the model, not that it is a better domain than any of them.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Downward closure ties a simplicial cell's dimension to its size, so a two-dimensional cell has exactly three vertices. That is the constraint everything downstream is reacting to.</li>
  <li>Filling a 6-ring simplicially costs three diagonals between non-bonded atoms (four triangles, nine edges, nineteen cells) against six edges and one face for a cell complex. Coning over a phantom centre is worse: twenty-five cells and an atom that does not exist.</li>
  <li>Closure does not stop you seeing the ring in \(H_1\). It stops the ring from being a single cell with its own feature vector — which is what higher-order message passing actually needs.</li>
  <li>A \(p\)-cell is a disc \(D^p\) glued along \(S^{p-1}\) by an attaching map. Because the map is arbitrary, a 2-cell can span a cycle of any length.</li>
  <li>Hypergraphs relax a <em>different</em> axiom: arbitrary subsets, no closure, but also no boundary and no hierarchy. They do not contain cell complexes and are not contained by them.</li>
  <li>A combinatorial complex keeps only cells, an order-preserving rank and neighbourhood relations — the three things the message-passing equation actually reads.</li>
  <li>The cost is inherited theory. No canonical signed boundary map means no chain complex, no homology and no Hodge Laplacian; unsigned incidence gives a diffusion operator whose kernel means nothing.</li>
  <li>The lift is a modelling choice, not a construction. Which cycles you fill is not determined by the data, and the resulting cells are not topological invariants.</li>
  <li>Choose by the relation you have: set-valued gives a hypergraph, boundaries give a cell complex, Hodge theory keeps you simplicial, and a combinatorial complex is the container when you need more than one.</li>
</ul>
</div>

## References

1. Bodnar, C., Frasca, F., Otter, N., Wang, Y. G., Liò, P., Montúfar, G., & Bronstein, M. [Weisfeiler and Lehman Go Cellular: CW Networks](https://arxiv.org/abs/2106.12575). *NeurIPS 2021*.
2. Bodnar, C., Frasca, F., Wang, Y. G., Otter, N., Montúfar, G., Liò, P., & Bronstein, M. [Weisfeiler and Lehman Go Topological: Message Passing Simplicial Networks](https://arxiv.org/abs/2103.03212). *ICML 2021*.
3. Hajij, M., Zamzmi, G., Papamarkou, T., Miolane, N., Guzmán-Sáenz, A., Ramamurthy, K. N., Birdal, T., Dey, T. K., Mukherjee, S., Samaga, S. N., Livesay, N., Walters, R., Rosen, P., & Schaub, M. T. [Topological Deep Learning: Going Beyond Graph Data](https://arxiv.org/abs/2206.00606). arXiv:2206.00606, 2022.
4. Hajij, M., Zamzmi, G., Papamarkou, T., Guzmán-Sáenz, A., Birdal, T., & Schaub, M. T. [Combinatorial Complexes: Bridging the Gap Between Cell Complexes and Hypergraphs](https://arxiv.org/abs/2312.09504). *57th Asilomar Conference on Signals, Systems, and Computers, 2023*.
5. Barbarossa, S., & Sardellitti, S. [Topological Signal Processing over Simplicial Complexes](https://arxiv.org/abs/1907.11577). *IEEE Transactions on Signal Processing, 2020*.
