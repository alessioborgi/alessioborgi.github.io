---
layout: single
title: "Topological Deep Learning Is Not Topological Data Analysis"
date: 2026-07-25
categories: [research]
book: tdl
subsection: ml-integration
tags: [topological-deep-learning, tda, simplicial-complexes, higher-order, hypergraphs]
published: true
excerpt: "TDA computes a topological descriptor and hands it to a model; TDL makes the topological object the domain the model runs on. Telling the two apart is the difference between a preprocessing step and an architecture."
author_profile: true
read_time: true
is_overview: false
icon: "🧭"
read_mins: 11
permalink: /blog/tdl/tdl-is-not-tda/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Two distinct research programmes share the word "topology". In <strong>TDA-as-features</strong> you build a filtration, compute persistent homology, vectorise the diagram, and feed that vector to an ordinary model — topology is a fixed preprocessing step and the learning happens in \(\mathbb{R}^d\). In <strong>topological deep learning</strong> the data <em>is</em> a simplicial complex, cell complex, or hypergraph, and message passing runs along its incidences — topology is the domain, not a feature. The distinction matters because the second buys you something the first cannot: a graph edge is intrinsically a pairwise relation, so group interactions can only be encoded lossily. The clique expansion of a hypergraph is <em>not injective</em>, and this post constructs two hypergraphs that collapse to the same graph.
</div>

## Two Things Called "Topology"

Read enough papers with "topological" in the title and you will notice they do not describe the same activity.

One kind of paper takes a point cloud of protein conformations, builds a Vietoris–Rips filtration, computes persistent homology, turns the resulting diagram into a persistence image, concatenates that vector with some chemical descriptors, and trains a gradient-boosted tree. Topology appears once, at the start, and then never again. The model is a tree; it has no idea what a homology class is.

Another kind of paper takes a molecule, treats its six-membered rings as *two-dimensional cells* rather than as six separate edges, and defines a neural network whose layers pass messages between vertices, edges, and rings according to which contains which. There is no persistence diagram anywhere. There is no filtration. But the domain the network operates on is a cell complex, and every layer respects that structure.

Both are legitimate. They are also almost entirely different techniques, with different failure modes, different computational costs, and different things they can and cannot represent. Book IV is titled *Topological Deep Learning* while most of its chapters describe the first programme. This post draws the line.

## Pipeline One: Compute, Then Learn

The classical TDA pipeline is a sequence of four stages, and the crucial property is that only the last one has parameters.

<div class="formula-box">
\[
X \;\xrightarrow{\ \text{filtration}\ } \; \{K_t\}_{t \in \mathbb{R}} \;\xrightarrow{\ \text{PH}\ } \; \mathrm{dgm}(X) \;\xrightarrow{\ \Phi\ } \; \Phi(\mathrm{dgm}) \in \mathbb{R}^d \;\xrightarrow{\ f_\theta\ } \; \hat{y}
\]
</div>

You choose a filtration (Rips, alpha, sublevel sets of a function, cubical for images). You run persistent homology to get a multiset of birth–death pairs. You apply a vectorisation map $$\Phi$$ — a persistence image, a persistence landscape, a Betti curve, a vector of persistence entropies — to land in a fixed-dimensional Euclidean space. Then you train whatever you like: an SVM, a random forest, an MLP.

The properties of this pipeline follow directly from its shape:

- **The descriptor is fixed before training.** $$\Phi(\mathrm{dgm}(X))$$ does not depend on $$\theta$$, on the labels, or on the loss. If the topology you computed is not the topology the task needs, no amount of training fixes it.
- **The learning happens in $$\mathbb{R}^d$$.** Once you have the vector, you are doing ordinary supervised learning. Nothing downstream is topological.
- **You inherit stability for free.** The bottleneck stability theorem bounds how far the diagram can move when the input moves, and good vectorisations are Lipschitz on top of that. This is a real guarantee, and it is the main reason the pipeline is worth using.
- **It works when $$n$$ is small.** A persistence image is a hand-designed feature map with no parameters. On datasets of a few hundred samples, that is an advantage, not a limitation.

The honest summary: this is feature engineering, done with unusually good mathematics.

## Pipeline Two: Learning on a Topological Domain

Now change what the input *is*.

Suppose the data point is not a point cloud but a **simplicial complex** $$K$$: a set of vertices, edges, triangles, tetrahedra, closed under taking faces. Attach a feature vector to every simplex, not just every vertex. Define a layer that updates the feature of a simplex $$\sigma$$ from the features of the simplices it touches — its faces, its cofaces, and the simplices it is adjacent to through a shared face or a shared coface. Stack those layers. Read out.

Schematically, for a $$k$$-simplex $$\sigma$$ with features $$h_\sigma$$:

<div class="formula-box">
\[
h_\sigma^{(\ell+1)} \;=\; \psi\Big( h_\sigma^{(\ell)},\;
\bigoplus_{\tau \in \mathcal{B}(\sigma)} m_{\mathcal{B}}\big(h_\sigma^{(\ell)}, h_\tau^{(\ell)}\big),\;
\bigoplus_{\tau \in \mathcal{C}(\sigma)} m_{\mathcal{C}}\big(h_\sigma^{(\ell)}, h_\tau^{(\ell)}\big),\;
\bigoplus_{\tau \in \mathcal{N}_{\uparrow}(\sigma)} m_{\uparrow}\big(h_\sigma^{(\ell)}, h_\tau^{(\ell)}\big)
\Big)
\]
</div>

where $$\mathcal{B}(\sigma)$$ are the boundary simplices (faces of $$\sigma$$), $$\mathcal{C}(\sigma)$$ the coboundary simplices ($$\sigma$$ is a face of them), $$\mathcal{N}_{\uparrow}(\sigma)$$ the upper-adjacent simplices (those sharing a coface with $$\sigma$$), and $$\bigoplus$$ a permutation-invariant aggregator. Set $$k = 0$$, delete every term except upper adjacency, and you have recovered an ordinary graph neural network. That is not a coincidence; it is the point.

Nothing here computes homology. No filtration is chosen. The topology is in the incidence structure that the messages travel along.

<div class="insight-box">
<strong>The one-line test.</strong> Ask: <em>if I deleted the persistent homology computation, would the model still be topological?</em> If the answer is no, it is TDA-as-features. Ask instead: <em>could I run this model on a plain graph without changing the code?</em> If the answer is no because the model needs triangles or cells or hyperedges as first-class objects, it is TDL proper.
</div>

## A Classification Table

| | TDA-as-features | TDL proper |
|---|---|---|
| What the model sees | a vector in $$\mathbb{R}^d$$ | a complex with features on cells |
| Where topology enters | preprocessing | the domain and the message-passing scheme |
| Trained end-to-end | no (unless made differentiable) | yes |
| Typical machinery | filtrations, persistence diagrams, persistence images | boundary and incidence matrices, higher-order message passing |
| Main guarantee | stability of the diagram | expressivity above 1-WL |
| Main cost | choosing the filtration | building the lift, and its combinatorial size |
| Scales with | number of simplices in the filtration | number of cells in a single complex |

## What a Graph Cannot Say

Here is the concrete reason the second programme exists.

A graph edge is a *pair*. That is not a convention; it is what an edge is. So whenever the real relation in your data involves three or more entities at once — three authors on one paper, six atoms in one aromatic ring, four nodes in one communication group, a triangular face of a mesh — the graph representation must encode it indirectly. The standard trick is the **clique expansion**: replace each group by all the pairwise edges among its members.

The clique expansion loses information, and it is easy to see exactly how.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 580 300" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <title>Two different hypergraphs on three vertices with the same clique expansion</title>
  <defs>
    <marker id="tdlarrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8"/>
    </marker>
  </defs>

  <!-- Panel A: one hyperedge of size 3 -->
  <text x="125" y="17" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">H₁ = { {1,2,3} }</text>
  <text x="125" y="31" text-anchor="middle" font-size="9" fill="#64748b">one hyperedge of size 3</text>
  <polygon points="125,49 187,130 63,130" fill="#0d9488" fill-opacity="0.16" stroke="#0d9488" stroke-width="1.6" stroke-dasharray="5,3"/>
  <circle cx="125" cy="60" r="13" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="125" y="64" text-anchor="middle" font-size="10" font-weight="700" fill="#134e4a">3</text>
  <circle cx="75" cy="125" r="13" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="75" y="129" text-anchor="middle" font-size="10" font-weight="700" fill="#134e4a">1</text>
  <circle cx="175" cy="125" r="13" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="175" y="129" text-anchor="middle" font-size="10" font-weight="700" fill="#134e4a">2</text>

  <!-- Panel B: three hyperedges of size 2 -->
  <text x="125" y="172" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">H₂ = { {1,2}, {1,3}, {2,3} }</text>
  <text x="125" y="186" text-anchor="middle" font-size="9" fill="#64748b">three hyperedges of size 2</text>
  <line x1="75" y1="278" x2="175" y2="278" stroke="#3b82f6" stroke-width="2.2"/>
  <line x1="75" y1="278" x2="125" y2="215" stroke="#3b82f6" stroke-width="2.2"/>
  <line x1="175" y1="278" x2="125" y2="215" stroke="#3b82f6" stroke-width="2.2"/>
  <circle cx="125" cy="215" r="13" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="125" y="219" text-anchor="middle" font-size="10" font-weight="700" fill="#1e3a5f">3</text>
  <circle cx="75" cy="278" r="13" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="75" y="282" text-anchor="middle" font-size="10" font-weight="700" fill="#1e3a5f">1</text>
  <circle cx="175" cy="278" r="13" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="175" y="282" text-anchor="middle" font-size="10" font-weight="700" fill="#1e3a5f">2</text>

  <!-- Arrows -->
  <line x1="218" y1="100" x2="348" y2="170" stroke="#94a3b8" stroke-width="2" marker-end="url(#tdlarrow)"/>
  <line x1="218" y1="248" x2="348" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#tdlarrow)"/>
  <text x="283" y="176" text-anchor="middle" font-size="9" fill="#64748b">replace each hyperedge</text>
  <text x="283" y="188" text-anchor="middle" font-size="9" fill="#64748b">by a clique on its vertices</text>

  <!-- Result -->
  <line x1="380" y1="215" x2="480" y2="215" stroke="#64748b" stroke-width="2.2"/>
  <line x1="380" y1="215" x2="430" y2="152" stroke="#64748b" stroke-width="2.2"/>
  <line x1="480" y1="215" x2="430" y2="152" stroke="#64748b" stroke-width="2.2"/>
  <circle cx="430" cy="152" r="13" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
  <text x="430" y="156" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">3</text>
  <circle cx="380" cy="215" r="13" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
  <text x="380" y="219" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">1</text>
  <circle cx="480" cy="215" r="13" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/>
  <text x="480" y="219" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">2</text>
  <text x="430" y="254" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">the same graph G</text>
  <text x="430" y="270" text-anchor="middle" font-size="9" fill="#64748b">3 vertices, 3 edges</text>
</svg>
<figcaption>Figure 1: The clique expansion is not injective. The hypergraph \(H_1\), whose single hyperedge \(\{1,2,3\}\) is one three-way relation, and the hypergraph \(H_2\), whose three hyperedges are three separate pairwise relations, both expand to the identical graph on 3 vertices and 3 edges. A model that consumes \(G\) cannot distinguish "one group of three" from "three couples".</figcaption>
</figure>
</div>

The minimal example above is deliberately blunt: one triple versus three pairs. A sceptic will say the two hypergraphs differ in the *size* of their hyperedges, so of course a graph loses that. So here is a second pair, in which every hyperedge has size exactly three.

<div class="math-box">
\[
H_A = \big\{\{1,2,3\},\ \{1,2,4\},\ \{1,3,4\}\big\}, \qquad
H_B = \big\{\{1,2,3\},\ \{1,2,4\},\ \{1,3,4\},\ \{2,3,4\}\big\}
\]
</div>

Expand $$H_A$$: the triple $$\{1,2,3\}$$ contributes edges 12, 13, 23; $$\{1,2,4\}$$ contributes 12, 14, 24; $$\{1,3,4\}$$ contributes 13, 14, 34. The union is $$\{12, 13, 14, 23, 24, 34\}$$ — all six edges, so the clique expansion is $$K_4$$. Expand $$H_B$$: it contains every triple of $$H_A$$, so its expansion contains $$K_4$$, and $$K_4$$ is all there is. **Both clique-expand to $$K_4$$.**

They are not isomorphic hypergraphs: $$H_A$$ has 3 hyperedges and $$H_B$$ has 4, and their vertex degree sequences are $$(2,2,2,3)$$ and $$(3,3,3,3)$$. So this is not a relabelling artefact. Two genuinely different 3-uniform hypergraphs, one graph.

<div class="warning-box">
<strong>What this does and does not prove.</strong> It proves the clique expansion is a many-to-one map, so <em>no</em> model that consumes only the expanded graph can distinguish \(H_A\) from \(H_B\) — this is a statement about the representation, not about any particular architecture, and no amount of depth, width, or attention repairs it. It does <em>not</em> prove the distinction matters for your task. If the label of \(H_A\) and \(H_B\) is the same, you have lost nothing.
</div>

### The lift keeps what the expansion discards

Take the downward closure of each hypergraph — add every subset of every hyperedge — and you get a simplicial complex. Count the simplices:

- $$H_A$$ closed: 4 vertices, 6 edges, 3 triangles. **13 simplices.** Euler characteristic $$\chi = 4 - 6 + 3 = 1$$.
- $$H_B$$ closed: 4 vertices, 6 edges, 4 triangles. **14 simplices.** Euler characteristic $$\chi = 4 - 6 + 4 = 2$$.
- The clique complex of $$K_4$$ (every clique becomes a simplex): 4 vertices, 6 edges, 4 triangles, 1 tetrahedron. **15 simplices.** $$\chi = 4 - 6 + 4 - 1 = 1$$.

Three different complexes, one shared 1-skeleton. And the difference is not cosmetic. The closure of $$H_B$$ is the hollow tetrahedron $$\partial \Delta^3$$, which is a 2-sphere: $$\beta_2 = 1$$. The closure of $$H_A$$ is the cone with apex 1 over the cycle $$2 \to 3 \to 4 \to 2$$, which is contractible: $$\beta_2 = 0$$. One encloses a void, the other does not, and their graphs are indistinguishable.

<div class="insight-box">
<strong>Also worth noticing:</strong> the clique complex is the <em>third</em> object here, distinct from both closures. Automatically filling in every clique is a modelling choice, and it is the aggressive one — it manufactured a solid tetrahedron that neither hypergraph asked for. Choosing the lift is part of the model.
</div>

## The Line Genuinely Blurs in Two Places

Being honest about where the distinction breaks down is more useful than defending it too hard.

**A graph is already a topological object.** A graph is a 1-dimensional simplicial complex. Its $$\beta_0$$ counts connected components and its $$\beta_1$$ counts independent cycles; these are homology groups, computed on a chain complex, in the ordinary sense. So a GNN is already doing message passing on a topological domain — one that happens to be truncated at dimension 1. "Graphs versus topology" is a difference of degree, not of kind, and the honest framing of TDL is *the same idea, without the truncation*. This is also why the expressivity story is continuous rather than a jump: simplicial and cellular Weisfeiler–Leman refinements are defined by the same colour-refinement recipe as 1-WL, run over cells of every dimension instead of vertices only.

**Differentiable persistence deliberately erases the boundary.** If the filtration values are a differentiable function of learnable parameters, and the persistence diagram is a piecewise-linear function of those values, then $$\Phi(\mathrm{dgm})$$ becomes a differentiable layer and the whole "preprocessing" stage joins the computation graph. At that point topology is no longer fixed before training — the model learns which filtration to build. Topological autoencoders and topological regularisation losses live here. They are TDA machinery inside a TDL training loop, and calling them one or the other is a matter of emphasis.

There is no contradiction in using both at once. Nothing stops you from running a simplicial network on a lifted complex *and* appending a persistence-image feature to the readout. They answer different questions: persistence tells you about the shape of the data at many scales; higher-order message passing tells you how to compute on a fixed shape.

## What Higher-Order Structure Does Not Buy You

Four things worth saying plainly, because the enthusiastic version of this post would skip them.

**The lift can be enormous.** If you lift a graph by filling in all its cliques, the count is combinatorial. On $$K_{20}$$ there are $$\binom{20}{2} = 190$$ edges but $$\binom{20}{3} = 1140$$ triangles and $$\binom{20}{4} = 4845$$ tetrahedra. Dense subgraphs are exactly where clique lifting explodes, and social and citation graphs are full of them. Ring lifting and other sparse lifts exist precisely because of this.

**The lift is a modelling assumption, not data.** If your dataset is a plain graph, the higher-order structure did not come with it — you invented it. A clique lift and a ring lift on the same molecule produce different models with different inductive biases, and the choice is on you. This is the exact counterpart of choosing a filtration in the TDA pipeline; the arbitrariness did not go away, it moved.

**More expressive does not mean better generalisation.** The theory says a strictly larger set of inputs can be told apart. It says nothing about test error. An architecture that can distinguish more graphs can also overfit distinctions that are noise.

**Many reported gains are domain-specific.** The clean win cases for higher-order message passing are the ones where the group structure is real and load-bearing — rings in molecules, faces in meshes, co-authorship in bibliographic data, simplicial signals like flows on edges. On a graph whose relations genuinely are pairwise, lifting adds cost and buys nothing.

<div class="paper-box">
<strong>Where the expressivity claim comes from.</strong> Bodnar et al. (2021) introduced message-passing simplicial networks and the simplicial Weisfeiler–Leman refinement, and showed it is strictly more powerful than 1-WL — the ceiling for ordinary message-passing GNNs. A companion paper extended the construction to regular cell complexes, where a ring can be a single 2-cell rather than a filled-in clique, which matters for molecules because the clique lift of a six-membered ring is not a hexagon. Hajij et al. later unified simplicial complexes, cell complexes, and hypergraphs under combinatorial complexes, where the containment relation is decoupled from any dimension-by-dimension face condition.
</div>

## How to Read the Rest of Book IV

Most chapters in this book — filtrations, persistence diagrams, stability, the twist algorithm, Mapper, persistence images, the application chapters — are Pipeline One. They are TDA, and the deep learning in them is a downstream consumer.

A smaller set — differentiable persistence, learning filtrations, topological autoencoders, topological regularisation — sits on the boundary, using TDA objects inside a gradient-based loop.

The chapters that would be TDL proper are the ones about computing *on* a complex: simplicial and cellular networks, hypergraph networks, sheaf neural networks, higher-order attention. If you are reading this book to learn how to build a model that consumes a simplicial complex, this post is the map that tells you which chapters will actually help.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li><strong>TDA-as-features</strong> computes a topological descriptor (a persistence diagram, vectorised) and hands it to an ordinary model. The topology is fixed before training; the learning happens in \(\mathbb{R}^d\).</li>
  <li><strong>TDL proper</strong> makes a higher-order object — simplicial complex, cell complex, hypergraph — the domain the network runs on, with features on cells of every dimension and message passing along incidences.</li>
  <li>The one-line test: remove the persistence computation and ask whether anything topological remains. If not, it is Pipeline One.</li>
  <li>A graph edge is intrinsically a <em>pairwise</em> relation, so group interactions must be encoded lossily. The <strong>clique expansion is not injective</strong>: \(\{\{1,2,3\}\}\) and \(\{\{1,2\},\{1,3\},\{2,3\}\}\) give the same triangle, and the 3-uniform hypergraphs \(H_A\) (3 hyperedges) and \(H_B\) (4 hyperedges) both give \(K_4\).</li>
  <li>The simplicial lifts keep the difference: 13 versus 14 simplices, \(\chi = 1\) versus \(\chi = 2\), \(\beta_2 = 0\) versus \(\beta_2 = 1\). The clique complex of \(K_4\) is a third object again, with 15 simplices.</li>
  <li>The boundary is porous by design: a graph <em>is</em> a 1-dimensional simplicial complex, and differentiable persistence pulls the TDA pipeline inside the training loop.</li>
  <li>What it does not buy you: lifts can be combinatorially huge, the choice of lift is your assumption rather than the data's, and higher expressivity is not a generalisation guarantee.</li>
</ul>
</div>

## References

- Xu, K., Hu, W., Leskovec, J., & Jegelka, S. (2019). [How Powerful are Graph Neural Networks?](https://arxiv.org/abs/1810.00826) *ICLR 2019* (establishes 1-WL as the expressivity ceiling for message-passing GNNs — the baseline that higher-order methods aim to exceed).
- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478) (the symmetry-first framing in which "choose the domain, then the equivariant layer" is the design principle TDL follows).
- Bodnar, C., Frasca, F., Wang, Y. G., Otter, N., Montúfar, G., Liò, P., & Bronstein, M. (2021). [Weisfeiler and Lehman Go Topological: Message Passing Simplicial Networks](https://arxiv.org/abs/2103.03212). *ICML 2021* (introduces simplicial WL and MPSN; the strict improvement over 1-WL).
- Bodnar, C., Frasca, F., Otter, N., Wang, Y. G., Liò, P., Montúfar, G., & Bronstein, M. (2021). [Weisfeiler and Lehman Go Cellular: CW Networks](https://arxiv.org/abs/2106.12575). *NeurIPS 2021* (extends the construction to regular cell complexes, where a ring is a single 2-cell).
- Hajij, M., Zamzmi, G., Papamarkou, T., Miolane, N., Guzmán-Sáenz, A., Ramamurthy, K. N., Birdal, T., Dey, T. K., Mukherjee, S., Samaga, S. N., Livesay, N., Walters, R., Rosen, P., & Schaub, M. T. (2022). [Topological Deep Learning: Going Beyond Graph Data](https://arxiv.org/abs/2206.00606). *arXiv:2206.00606* (combinatorial complexes as a common generalisation of simplicial complexes, cell complexes, and hypergraphs).
- Carlsson, G. (2009). Topology and Data. *Bulletin of the American Mathematical Society*, 46(2) (the survey that set out the persistent-homology-as-feature-extraction programme).
- Bubenik, P. (2015). Statistical Topological Data Analysis using Persistence Landscapes. *Journal of Machine Learning Research* (a Banach-space vectorisation of persistence diagrams).
- Adams, H., et al. (2017). [Persistence Images: A Stable Vector Representation of Persistent Homology](https://arxiv.org/abs/1507.06217). *Journal of Machine Learning Research*, 18(8), 1–35 (the most widely used diagram vectorisation).
- Zhou, D., Huang, J., & Schölkopf, B. (2006). Learning with Hypergraphs: Clustering, Classification, and Embedding. *NIPS 2006* (the source of the normalised clique-expansion Laplacian that most hypergraph methods still reduce to).
- Ebli, S., Defferrard, M., & Spreemann, G. (2020). [Simplicial Neural Networks](https://arxiv.org/abs/2010.03633). *arXiv:2010.03633* (convolution on simplicial complexes via the Hodge Laplacian).
- Feng, Y., You, H., Zhang, Z., Ji, R., & Gao, Y. (2019). [Hypergraph Neural Networks](https://arxiv.org/abs/1809.09401). *AAAI 2019* (message passing on hypergraphs without collapsing to a graph).
- Papillon, M., Sanborn, S., Hajij, M., & Miolane, N. (2023). [Architectures of Topological Deep Learning: A Survey of Message-Passing Topological Neural Networks](https://arxiv.org/abs/2304.10031). *arXiv:2304.10031* (a taxonomy of higher-order message-passing models).
