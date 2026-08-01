---
layout: single
title: "Sheaf Neural Networks: A Complete Research Guide"
categories: [sheaf]
book: sheaf
subsection: foundations
tags: [sheaf, overview, cellular-sheaf, graph-learning, heterophily]
published: true
excerpt: "Standard GNNs assume neighbouring nodes should agree. Sheaf Neural Networks replace that assumption with a learned linear map on every edge, which turns heterophily, oversmoothing, and directional structure into one operator: the sheaf Laplacian."
author_profile: true
read_time: true
is_overview: true
icon: "🔭"
read_mins: 9
permalink: /blog/sheaf/overview/
toc: true
toc_label: "Contents"
---
<style>
/* Page-specific only. Shared callout, figure and formula classes live in
   _sass/layout/_blog-components.scss — do not re-declare them here. */
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: .8rem;
  margin: 1.2rem 0 1.5rem;
}
.sheaf-card {
  background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #dbe7f5;
  border-radius: 12px;
  padding: .95rem 1rem;
  box-shadow: 0 4px 16px rgba(15,42,54,.06);
}
.sheaf-card h3 { margin: 0 0 .35rem; font-size: .98rem; color: #0f2a36; }
.sheaf-card p { margin: 0; font-size: .9rem; color: #4b5563; line-height: 1.5; }
.roadmap-box {
  background: linear-gradient(160deg, #0f2a36 0%, #164e63 100%);
  color: #ecfeff;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  margin: 1.5rem 0;
}
.roadmap-box h3 { margin-top: 0; color: #99f6e4; font-size: 1rem; }
.roadmap-box ol { margin: 0; padding-left: 1.2rem; }
.roadmap-box li { margin-bottom: .45rem; }
html[data-theme="dark"] .sheaf-card {
  background: #1f2937 !important;
  border-color: #374151 !important;
}
html[data-theme="dark"] .sheaf-card h3 { color: #e5e7eb !important; }
html[data-theme="dark"] .sheaf-card p  { color: #cbd5e1 !important; }

/* Pipeline animation. Everything below is decorative only: the diagram is
   fully readable with animation disabled, which is what the site-wide
   prefers-reduced-motion guard produces. */
@keyframes sfp-pulse {
  0%, 100% { opacity: 0; }
  6%       { opacity: 0.24; }
  15%      { opacity: 0; }
}
@keyframes sfp-travel {
  0%   { transform: translateX(0px);   opacity: 0; }
  4%   { opacity: 1; }
  94%  { opacity: 1; }
  100% { transform: translateX(600px); opacity: 0; }
}
.sfp-glow   { opacity: 0; animation: sfp-pulse 6s ease-in-out infinite; }
.sfp-g2     { animation-delay: 1.2s; }
.sfp-g3     { animation-delay: 2.4s; }
.sfp-g4     { animation-delay: 3.6s; }
.sfp-g5     { animation-delay: 4.8s; }
.sfp-packet { animation: sfp-travel 6s linear infinite; }
</style>

<div class="tldr-box">
<strong>What this book covers:</strong> Standard GNNs average a node with its neighbours, which quietly assumes every node measures the world in the same units. Sheaf Neural Networks drop that assumption: each node gets its own vector space, each edge gets a learned linear map between them, and comparison happens only <em>after</em> transport. One operator — the sheaf Laplacian — then covers heterophily, directional structure, and a principled account of oversmoothing.
</div>

{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="Two nodes v and u, each with a vector-space stalk, connected through a shared edge stalk by restriction maps and their transposes" caption="The whole object in one picture: nodes v and u carry stalks F(v) and F(u), the edge carries F(e), and the restriction maps F(v◁e) and F(u◁e) transport vectors into the shared edge space. Φ is the learned function that produces those maps from node features (Bodnar et al., 2022)." %}

<div class="chapter-grid">
  <div class="sheaf-card">
    <h3>The big idea</h3>
    <p>Do not force neighbouring nodes to be equal. Learn how they should be <em>related</em>, through a linear map attached to each edge.</p>
  </div>
  <div class="sheaf-card">
    <h3>Why it matters</h3>
    <p>That single change gives one language for heterophily, signed and directional relations, and diffusion richer than a plain graph Laplacian allows.</p>
  </div>
  <div class="sheaf-card">
    <h3>Where the book is</h3>
    <p>The paper chapters are live now. The foundations and theory chapters are still being written, so this overview carries the maths you need to read them.</p>
  </div>
</div>

## The problem, stated precisely

A GCN layer propagates with $$\hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}$$, which is an averaging operator. Averaging has a fixed point, and repeated averaging converges to it: features collapse towards a single degree-scaled direction. That is **oversmoothing**, and it is not a bug in the implementation — it is what averaging does.

It also encodes an assumption. Adding $$h_u$$ to $$h_v$$ only means something if the two vectors are expressed in the same basis. On a **heterophilic** graph, where an edge signals *difference* rather than similarity, that assumption is actively wrong.

<div class="insight-box">
<strong>Intuition first — the weather-station analogy.</strong> Picture a network of weather stations. Each measures temperature, but in its own units: some Celsius, some Fahrenheit, some a proprietary scale. Knowing that two adjacent stations read \(22\) and \(71\) tells you nothing until you know the conversion between them. That conversion is the <strong>restriction map</strong>. A <strong>global section</strong> is an assignment of readings — one per station — on which every adjacent pair agrees <em>after</em> conversion. The sheaf Laplacian is the penalty for disagreement measured in those converted units. Sheaf neural networks learn the conversions from data. That is the entire conceptual leap.
</div>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="wx-title wx-desc" style="width:100%;max-width:560px;height:auto;font-family:sans-serif">
  <title id="wx-title">A restriction map as a unit conversion between two weather stations</title>
  <desc id="wx-desc">Node u reads 22 degrees Celsius and node v reads 71.6 degrees Fahrenheit. Both restriction maps carry those readings into a shared edge space, where both equal 295.15 kelvin, so the two stations agree.</desc>
  <rect width="560" height="200" fill="#f8fafc" rx="12"/>
  <text x="280" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">A restriction map is a unit conversion</text>

  <text x="68" y="66" text-anchor="middle" font-size="10" fill="#0f766e" font-weight="700">node u</text>
  <circle cx="68" cy="112" r="30" fill="#ccfbf1" stroke="#0d9488" stroke-width="2.5"/>
  <text x="68" y="117" text-anchor="middle" font-size="13" fill="#0f766e" font-weight="700">22 °C</text>

  <text x="492" y="66" text-anchor="middle" font-size="10" fill="#9a3412" font-weight="700">node v</text>
  <circle cx="492" cy="112" r="30" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
  <text x="492" y="117" text-anchor="middle" font-size="12" fill="#9a3412" font-weight="700">71.6 °F</text>

  <rect x="225" y="86" width="110" height="52" rx="8" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
  <text x="280" y="109" text-anchor="middle" font-size="13" fill="#3730a3" font-weight="700">295.15 K</text>
  <text x="280" y="127" text-anchor="middle" font-size="9" fill="#4338ca">shared edge space</text>

  <path d="M100 112 L215 112" stroke="#64748b" stroke-width="2"/>
  <polygon points="215,107 224,112 215,117" fill="#64748b"/>
  <text x="157" y="102" text-anchor="middle" font-size="10" fill="#334155">transport from u</text>

  <path d="M460 112 L345 112" stroke="#64748b" stroke-width="2"/>
  <polygon points="345,107 336,112 345,117" fill="#64748b"/>
  <text x="403" y="102" text-anchor="middle" font-size="10" fill="#334155">transport from v</text>

  <text x="280" y="166" text-anchor="middle" font-size="9.5" fill="#475569">The readings look nothing alike — 22 against 71.6 — yet they are the same temperature.</text>
  <text x="280" y="182" text-anchor="middle" font-size="9.5" fill="#475569">Agreement is checked in the shared space, never in the local units.</text>
</svg>
<figcaption>Two stations disagree numerically and agree physically. A sheaf makes that distinction first-class: the restriction maps are the conversions, and the sheaf Laplacian measures disagreement only after they have been applied. Sheaf GNNs learn the conversions.</figcaption>
</figure>
</div>

## The core object

A cellular sheaf $$\mathcal{F}$$ on a graph $$G = (V, E)$$ assigns:

- a **node stalk** $$\mathcal{F}(v) \cong \mathbb{R}^{d}$$ to each $$v \in V$$;
- an **edge stalk** $$\mathcal{F}(e) \cong \mathbb{R}^{d}$$ to each $$e \in E$$;
- a **restriction map** $$\mathcal{F}_{v \trianglelefteq e} : \mathcal{F}(v) \to \mathcal{F}(e)$$ for each incident pair.

The **coboundary** $$\delta_0$$ measures disagreement across an edge, after transport:

<div class="formula-box">
\[
(\delta_0 x)_e \;=\; \mathcal{F}_{v \trianglelefteq e}\, x_v \;-\; \mathcal{F}_{u \trianglelefteq e}\, x_u ,
\qquad e = (u,v).
\]
</div>

The **sheaf Laplacian** is $$\Delta_{\mathcal{F}} = \delta_0^{\top}\delta_0$$, a block matrix with

<div class="formula-box">
\[
(\Delta_{\mathcal{F}})_{vv} = \sum_{e \ni v} \mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e},
\qquad
(\Delta_{\mathcal{F}})_{uv} = -\,\mathcal{F}_{u \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e}.
\]
</div>

Because it is built as $$\delta_0^{\top}\delta_0$$, it is symmetric and positive semi-definite, and its kernel is exactly the space of global sections. Set every restriction map to the identity and it collapses to the familiar case:

<div class="formula-box">
\[
\Delta_{\mathcal{F}} \;=\; L \otimes I_d ,
\qquad L = D - A .
\]
</div>

So the graph Laplacian is the sheaf Laplacian of the *trivial* sheaf. Everything a GCN does, a sheaf GNN can do by choosing identity maps — and it has $$d \times d$$ more room per edge when identity is the wrong choice.

<div class="insight-box">
<strong>The mental shift:</strong> a sheaf GNN never asks whether neighbours are <em>similar</em>. It asks how one neighbour should be transported into another's frame before comparison at all. Keep that sentence and the rest of the book follows.
</div>

## The pipeline, end to end

Definitions settle nothing until you watch a signal move through them. Here is one full step, from raw node features to a diffusion update.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 760 236" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="sfp-title sfp-desc" style="width:100%;max-width:760px;height:auto;font-family:sans-serif">
  <title id="sfp-title">The sheaf neural network pipeline in five stages</title>
  <desc id="sfp-desc">Raw scalar node features are lifted to two-dimensional stalks; each stalk is transported into the shared edge space by its restriction map; the difference of the transported vectors is the coboundary on that edge; the coboundary is pulled back to the nodes to give the diffusion update.</desc>
  <rect width="760" height="236" fill="#f8fafc" rx="12"/>
  <text x="380" y="21" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">From raw features to one diffusion step</text>

  <!-- panels -->
  <rect x="8"   y="34" width="126" height="150" rx="9" fill="#ffffff" stroke="#0d9488" stroke-width="1.6"/>
  <rect x="158" y="34" width="126" height="150" rx="9" fill="#ffffff" stroke="#0d9488" stroke-width="1.6"/>
  <rect x="308" y="34" width="126" height="150" rx="9" fill="#ffffff" stroke="#6366f1" stroke-width="1.6"/>
  <rect x="458" y="34" width="126" height="150" rx="9" fill="#ffffff" stroke="#ea580c" stroke-width="1.6"/>
  <rect x="608" y="34" width="126" height="150" rx="9" fill="#ffffff" stroke="#7c3aed" stroke-width="1.6"/>

  <rect class="sfp-glow"          x="8"   y="34" width="126" height="150" rx="9" fill="#0d9488"/>
  <rect class="sfp-glow sfp-g2"   x="158" y="34" width="126" height="150" rx="9" fill="#0d9488"/>
  <rect class="sfp-glow sfp-g3"   x="308" y="34" width="126" height="150" rx="9" fill="#6366f1"/>
  <rect class="sfp-glow sfp-g4"   x="458" y="34" width="126" height="150" rx="9" fill="#ea580c"/>
  <rect class="sfp-glow sfp-g5"   x="608" y="34" width="126" height="150" rx="9" fill="#7c3aed"/>

  <text x="71"  y="52" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f766e">① raw features</text>
  <text x="221" y="52" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0f766e">② sheaf lifting</text>
  <text x="371" y="52" text-anchor="middle" font-size="9.5" font-weight="700" fill="#4338ca">③ transport</text>
  <text x="521" y="52" text-anchor="middle" font-size="9.5" font-weight="700" fill="#9a3412">④ coboundary</text>
  <text x="671" y="52" text-anchor="middle" font-size="9.5" font-weight="700" fill="#6d28d9">⑤ diffusion</text>

  <!-- (1) two nodes, scalar features -->
  <line x1="45" y1="104" x2="97" y2="104" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="45" cy="104" r="14" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <circle cx="97" cy="104" r="14" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
  <text x="45" y="108" text-anchor="middle" font-size="11" font-weight="700" fill="#0f766e">u</text>
  <text x="97" y="108" text-anchor="middle" font-size="11" font-weight="700" fill="#9a3412">v</text>
  <text x="71" y="146" text-anchor="middle" font-size="9" fill="#334155">x⁠ᵤ = 1   x⁠ᵥ = 2</text>
  <text x="71" y="166" text-anchor="middle" font-size="8" fill="#64748b">one scalar per node</text>

  <!-- (2) lifted to 2-dim stalks -->
  <rect x="181" y="82" width="30" height="21" fill="#ccfbf1" stroke="#0d9488"/>
  <rect x="181" y="103" width="30" height="21" fill="#ccfbf1" stroke="#0d9488"/>
  <text x="196" y="97"  text-anchor="middle" font-size="9" fill="#0f766e">1</text>
  <text x="196" y="118" text-anchor="middle" font-size="9" fill="#0f766e">0</text>
  <rect x="233" y="82" width="30" height="21" fill="#fed7aa" stroke="#ea580c"/>
  <rect x="233" y="103" width="30" height="21" fill="#fed7aa" stroke="#ea580c"/>
  <text x="248" y="97"  text-anchor="middle" font-size="9" fill="#9a3412">0</text>
  <text x="248" y="118" text-anchor="middle" font-size="9" fill="#9a3412">2</text>
  <text x="196" y="77" text-anchor="middle" font-size="8" fill="#475569">Xᵤ</text>
  <text x="248" y="77" text-anchor="middle" font-size="8" fill="#475569">Xᵥ</text>
  <text x="221" y="146" text-anchor="middle" font-size="9" fill="#334155">each node → a stalk in ℝ²</text>
  <text x="221" y="166" text-anchor="middle" font-size="8" fill="#64748b">d = 2 here</text>

  <!-- (3) transported into the edge stalk -->
  <rect x="331" y="82" width="30" height="21" fill="#e0e7ff" stroke="#6366f1"/>
  <rect x="331" y="103" width="30" height="21" fill="#e0e7ff" stroke="#6366f1"/>
  <text x="346" y="97"  text-anchor="middle" font-size="9" fill="#3730a3">1</text>
  <text x="346" y="118" text-anchor="middle" font-size="9" fill="#3730a3">0</text>
  <rect x="383" y="82" width="30" height="21" fill="#e0e7ff" stroke="#6366f1"/>
  <rect x="383" y="103" width="30" height="21" fill="#e0e7ff" stroke="#6366f1"/>
  <text x="398" y="97"  text-anchor="middle" font-size="9" fill="#3730a3">−2</text>
  <text x="398" y="118" text-anchor="middle" font-size="9" fill="#3730a3">0</text>
  <text x="346" y="77" text-anchor="middle" font-size="8" fill="#475569">Fᵤ Xᵤ</text>
  <text x="398" y="77" text-anchor="middle" font-size="8" fill="#475569">Fᵥ Xᵥ</text>
  <text x="371" y="146" text-anchor="middle" font-size="9" fill="#334155">both land in ℱ(e)</text>
  <text x="371" y="166" text-anchor="middle" font-size="8" fill="#64748b">Fᵥ rotates by 90°</text>

  <!-- (4) coboundary -->
  <rect x="506" y="82" width="32" height="21" fill="#ffedd5" stroke="#ea580c"/>
  <rect x="506" y="103" width="32" height="21" fill="#ffedd5" stroke="#ea580c"/>
  <text x="522" y="97"  text-anchor="middle" font-size="9.5" font-weight="700" fill="#9a3412">−3</text>
  <text x="522" y="118" text-anchor="middle" font-size="9.5" font-weight="700" fill="#9a3412">0</text>
  <text x="522" y="77" text-anchor="middle" font-size="8" fill="#475569">(δ₀X)ₑ</text>
  <text x="521" y="146" text-anchor="middle" font-size="9" fill="#334155">disagreement</text>
  <text x="521" y="166" text-anchor="middle" font-size="8" fill="#64748b">measured after transport</text>

  <!-- (5) diffusion update -->
  <circle cx="645" cy="104" r="14" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <circle cx="697" cy="104" r="14" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <line x1="645" y1="104" x2="697" y2="104" stroke="#a78bfa" stroke-width="2"/>
  <text x="645" y="108" text-anchor="middle" font-size="8.5" fill="#5b21b6">3,0</text>
  <text x="697" y="108" text-anchor="middle" font-size="8.5" fill="#5b21b6">0,3</text>
  <text x="671" y="146" text-anchor="middle" font-size="9" fill="#334155">pulled back to nodes</text>
  <text x="671" y="166" text-anchor="middle" font-size="8" fill="#64748b">X ← X − Δ⁠₣ X</text>

  <!-- arrows -->
  <path d="M138 109 L150 109" stroke="#94a3b8" stroke-width="2"/><polygon points="150,105 157,109 150,113" fill="#94a3b8"/>
  <path d="M288 109 L300 109" stroke="#94a3b8" stroke-width="2"/><polygon points="300,105 307,109 300,113" fill="#94a3b8"/>
  <path d="M438 109 L450 109" stroke="#94a3b8" stroke-width="2"/><polygon points="450,105 457,109 450,113" fill="#94a3b8"/>
  <path d="M588 109 L600 109" stroke="#94a3b8" stroke-width="2"/><polygon points="600,105 607,109 600,113" fill="#94a3b8"/>

  <!-- travelling packet (decorative) -->
  <g class="sfp-packet">
    <circle cx="71" cy="200" r="6" fill="#0d9488"/>
    <circle cx="71" cy="200" r="10" fill="#0d9488" opacity="0.28"/>
  </g>
  <text x="380" y="228" text-anchor="middle" font-size="8.5" fill="#475569">the same signal, carried through every stage</text>
</svg>
<figcaption>One diffusion step on a two-node graph with stalk dimension d = 2. The restriction map at u is the identity and at v is a 90° rotation, so the two nodes genuinely disagree once both are expressed in the edge's frame.</figcaption>
</figure>
</div>

Every number above is checkable. With $$\mathcal{F}_{u \trianglelefteq e} = I$$ and $$\mathcal{F}_{v \trianglelefteq e} = R(90^\circ)$$:

<div class="formula-box">
\[
\begin{aligned}
\mathcal{F}_{u \trianglelefteq e} X_u &= \begin{pmatrix} 1 \\ 0 \end{pmatrix},
&\qquad
\mathcal{F}_{v \trianglelefteq e} X_v &= \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}\!\begin{pmatrix} 0 \\ 2 \end{pmatrix} = \begin{pmatrix} -2 \\ 0 \end{pmatrix}, \\[4pt]
(\delta_0 X)_e &= \begin{pmatrix} -3 \\ 0 \end{pmatrix},
&\qquad
(\Delta_{\mathcal{F}} X)_u &= \begin{pmatrix} 3 \\ 0 \end{pmatrix}, \quad
(\Delta_{\mathcal{F}} X)_v = \begin{pmatrix} 0 \\ 3 \end{pmatrix}.
\end{aligned}
\]
</div>

The resulting $$\Delta_{\mathcal{F}}$$ has eigenvalues $$\{0, 0, 2, 2\}$$, so its kernel is two-dimensional: on this graph there is a whole plane of assignments the sheaf considers globally consistent. A graph Laplacian on two connected nodes has a one-dimensional kernel — the constants. That gap is the extra room sheaf diffusion has to work in.

## What changes, concretely

| | Standard GCN | Sheaf GNN |
|---|---|---|
| Operator | graph Laplacian $$L$$ | sheaf Laplacian $$\Delta_{\mathcal{F}}$$ |
| Edge weight | one scalar | a $$d \times d$$ linear map |
| Propagation | $$H \leftarrow \hat{A}H$$ | $$H \leftarrow (I - \Delta_{\mathcal{F}})H$$ |
| Depth limit | collapses to a constant direction | converges to $$\ker(\Delta_{\mathcal{F}})$$, which can separate classes |
| Heterophily | destructive averaging | signed or rotating maps make disagreement meaningful |

The fourth row is the theoretical heart. Oversmoothing is not avoided by making the operator weaker; it is avoided by making its **null space richer**. A graph Laplacian has an essentially one-dimensional-per-component null space. A sheaf Laplacian's null space is the space of global sections, and with the right restriction maps that space is large enough to hold a separating assignment.

## The whole story in one paragraph

A sheaf equips every node and edge with a vector space and every incidence with a linear map; the sheaf Laplacian then measures inconsistency **after** transporting signals through those maps. Accept that one formulation and a set of separately-studied GNN problems start to look like one problem: heterophily, sign structure, gauge symmetry, directional flow, and the null-space account of oversmoothing.

## What is live now

The paper chapters are published; the foundations and theory chapters are still in draft. If you are arriving new, read them in this order:

<div class="roadmap-box">
<h3>Suggested reading order</h3>
<ol>
  <li><strong><a href="/blog/sheaf/polynsd-paper/" style="color:#99f6e4">PolyNSD</a></strong> — replaces the fixed diffusion step with a Chebyshev polynomial in \(\Delta_{\mathcal{F}}\). The clearest entry point to what the operator actually does.</li>
  <li><strong><a href="/blog/sheaf/dnsd-paper/" style="color:#99f6e4">DNSD</a></strong> — why sheaf diffusion stalls at depth, and what it costs to fix. Read this second: it is the sharpest critique of the framework from inside it.</li>
  <li><strong><a href="/blog/sheaf/hetsheaf-paper/" style="color:#99f6e4">HetSheaf</a></strong> — sheaves on heterogeneous graphs, where node and edge <em>types</em> condition the restriction maps.</li>
  <li><strong><a href="/blog/sheaf/sheafpool/" style="color:#99f6e4">SheafPool</a></strong> — graph-level readout that respects the sheaf's basis ambiguity.</li>
  <li><strong><a href="/blog/sheaf/braindyn-paper/" style="color:#99f6e4">BrainDyn</a></strong> — sheaves inside a neural ODE, applied to brain dynamics. The most different thing in the book.</li>
</ol>
</div>

Still to come: the foundations run (what a sheaf is, cellular sheaves on graphs, cohomology, the Laplacian spectrum, connection Laplacians), the theory run (oversmoothing, heterophily, oversquashing, expressiveness, Hodge decomposition), and the extensions run (cosheaves, simplicial sheaves, multi-relational and temporal sheaves).

## Key papers at a glance

<div class="paper-box">
<strong>Hansen &amp; Gebhart (2020)</strong> — <em>Sheaf Neural Networks.</em> The first sheaf GNN. Restriction maps are fixed by hand rather than learned, which makes it the cleanest illustration of what the operator does on its own.
</div>

<div class="paper-box">
<strong>Bodnar et al. (2022)</strong> — <em>Neural Sheaf Diffusion.</em> NeurIPS 2022. Learns the restriction maps from node features, and proves the null-space result that makes sheaves a genuine answer to heterophily and oversmoothing rather than a heuristic.
</div>

<div class="paper-box">
<strong>Barbero et al. (2022)</strong> — <em>Sheaf Attention Networks.</em> NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations. Combines restriction maps with attention-weighted aggregation.
</div>

<div class="paper-box">
<strong>Borgi, Silvestri &amp; Liò (2025)</strong> — <em>Polynomial Neural Sheaf Diffusion.</em> A degree-\(K\) Chebyshev polynomial in the normalised sheaf Laplacian, with diagonal restriction maps sufficing.
</div>

<div class="paper-box">
<strong>Bourgerie, Girdzijauskas &amp; Fodor (2026)</strong> — <em>Deep Neural Sheaf Diffusion.</em> Diagnoses why the Laplacian's signal vanishes with depth and replaces it with a sheaf adjacency operator.
</div>

<div class="warning-box">
<strong>One honest caveat.</strong> Sheaf GNNs are not a free win. The extra machinery costs parameters and compute, the theory that motivates them applies to the linear diffusion rather than the trained network, and on several small heterophilic benchmarks a plain MPNN still wins. The <a href="/blog/sheaf/dnsd-paper/">DNSD chapter</a> works through a concrete case where the published tables and the appendix tell different stories.
</div>

## References

- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *arXiv:2012.06333*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *Advances in Neural Information Processing Systems 35*.
- Barbero, F., Bodnar, C., de Ocáriz Borde, H. S., & Liò, P. (2022). Sheaf Attention Networks. *NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations*.
- Barbero, F., Bodnar, C., de Ocáriz Borde, H. S., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *Topological, Algebraic and Geometric Learning Workshops 2022*, PMLR.
- Zaghen, O., Longa, A., Azzolin, S., Telyatnikov, L., Passerini, A., & Liò, P. (2024). [Sheaf Diffusion Goes Nonlinear: Enhancing GNNs with Adaptive Sheaf Laplacians](https://proceedings.mlr.press/v251/zaghen24a.html). *Proceedings of the Geometry-grounded Representation Learning and Generative Modeling Workshop, ICML 2024*, PMLR 251.
- Borgi, A., Silvestri, F., & Liò, P. (2025). [Polynomial Neural Sheaf Diffusion: A Spectral Filtering Approach on Cellular Sheaves](https://arxiv.org/abs/2512.00242). *arXiv:2512.00242*.
- Bourgerie, R., Girdzijauskas, Š., & Fodor, V. (2026). [Deep Neural Sheaf Diffusion](https://arxiv.org/abs/2605.19021). *arXiv:2605.19021*.
