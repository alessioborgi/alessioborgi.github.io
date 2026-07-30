---
layout: single
title: "Why Message Passing Is Not Enough: The Case for Sheaves"
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf, message-passing, heterophily, limitations, cellular-sheaf]
published: true
excerpt: "Standard message passing aggregates neighbour features and averages. On heterophilic graphs (where neighbours often disagree), this is harmful. Cellular sheaves provide a mathematically principled framework to model per-edge relationships between node features — going beyond mere averaging."
author_profile: true
read_time: true
is_overview: false
icon: "🔭"
read_mins: 7
permalink: /blog/gnn/why-message-passing-not-enough/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Standard message passing computes \(h_v \leftarrow \mathrm{UPDATE}\big(h_v, \mathrm{AGG}\{h_u : u \in \mathcal{N}(v)\}\big)\). This assumes neighbours' features are directly comparable — the same "type" of information. On heterophilic graphs, this assumption fails: neighbours have different labels, different semantics, different feature spaces. Sheaves replace this flat comparison with per-edge linear maps that transform features before comparison.
</div>
{% include figure image_path="/images/blog/gnn/xu2019_gin.png" alt="Non-isomorphic graphs that message passing maps to identical representations (Xu et al., 2019)" caption="A <em>different</em> limitation, shown for contrast: the <em>expressivity</em> bound of Xu et al. (2019) — non-isomorphic graph structures that standard MPNNs provably cannot tell apart. This post is about a separate failure mode: even on graphs message passing can distinguish, averaging neighbours whose features live in incompatible frames destroys the signal." %}


## The Fundamental Assumption of Message Passing

**Intuition First:** Standard message passing is like asking every person in a room to shout their opinion, then averaging what you hear. In a room where everyone agrees (homophilic graph), the average is a good summary. But in a room where your neighbours all have opposite political views, the average is a useless mush that says nothing about *your* views. Sheaves give each pair of people a translation device: instead of averaging raw opinions, you first transform what each person says into a common frame of reference — then compare.

<style>
@keyframes avg-collapse {
  0%   { opacity:1; }
  60%  { opacity:0.4; }
  100% { opacity:1; }
}
</style>
<div class="blog-figure">
<figure>
<svg viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;">
  <!-- Homophilic -->
  <text x="95" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">Homophilic</text>
  <circle cx="95" cy="80" r="20" fill="#3b82f6"/><text x="95" y="85" text-anchor="middle" font-size="10" fill="white">A</text>
  <circle cx="45" cy="50" r="16" fill="#60a5fa"/><text x="45" y="55" text-anchor="middle" font-size="9" fill="white">B</text>
  <circle cx="45" cy="110" r="16" fill="#60a5fa"/><text x="45" y="115" text-anchor="middle" font-size="9" fill="white">C</text>
  <circle cx="145" cy="50" r="16" fill="#60a5fa"/><text x="145" y="55" text-anchor="middle" font-size="9" fill="white">D</text>
  <circle cx="145" cy="110" r="16" fill="#60a5fa"/><text x="145" y="115" text-anchor="middle" font-size="9" fill="white">E</text>
  <line x1="75" y1="68" x2="58" y2="58" stroke="#93c5fd" stroke-width="1.5"/>
  <line x1="75" y1="92" x2="58" y2="103" stroke="#93c5fd" stroke-width="1.5"/>
  <line x1="115" y1="68" x2="132" y2="58" stroke="#93c5fd" stroke-width="1.5"/>
  <line x1="115" y1="92" x2="132" y2="103" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="95" y="150" text-anchor="middle" font-size="10" fill="#10b981">avg ≈ meaningful ✓</text>
  <!-- Heterophilic -->
  <text x="315" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">Heterophilic</text>
  <circle cx="315" cy="80" r="20" fill="#3b82f6"/><text x="315" y="85" text-anchor="middle" font-size="10" fill="white">A</text>
  <circle cx="265" cy="50" r="16" fill="#ef4444"/><text x="265" y="55" text-anchor="middle" font-size="9" fill="white">X</text>
  <circle cx="265" cy="110" r="16" fill="#f97316"/><text x="265" y="115" text-anchor="middle" font-size="9" fill="white">Y</text>
  <circle cx="365" cy="50" r="16" fill="#8b5cf6"/><text x="365" y="55" text-anchor="middle" font-size="9" fill="white">Z</text>
  <circle cx="365" cy="110" r="16" fill="#10b981"/><text x="365" y="115" text-anchor="middle" font-size="9" fill="white">W</text>
  <line x1="295" y1="68" x2="278" y2="58" stroke="#fca5a5" stroke-width="1.5"/>
  <line x1="295" y1="92" x2="278" y2="103" stroke="#fca5a5" stroke-width="1.5"/>
  <line x1="335" y1="68" x2="352" y2="58" stroke="#fca5a5" stroke-width="1.5"/>
  <line x1="335" y1="92" x2="352" y2="103" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="315" y="150" text-anchor="middle" font-size="10" fill="#ef4444">avg = useless mix ✗</text>
</svg>
<figcaption>Left: homophilic graph — all neighbours share the same class (blue), averaging works. Right: heterophilic — node A is surrounded by four different classes; averaging pushes its embedding to an uninformative middle point.</figcaption>
</figure>
</div>

Standard message passing (e.g., GCN, GAT) computes something like:

<div class="formula-box">
\[
h_v^{(k+1)} \;=\; \sigma\!\left( W^{(k)} \cdot \mathrm{AGG}\Big\{\, h_u^{(k)} \;:\; u \in \mathcal{N}(v) \,\Big\} \right)
\]
</div>

For this to make sense, the features $$h_u^{(k)}$$ from different neighbouring nodes must live in the **same feature space** and be meaningfully aggregatable (averageable, summable).

This is a strong assumption. Consider:

**Heterophilic graphs:** in a social network, a user interested in cooking might be connected to a user interested in music. Their feature vectors are in very different semantic directions. Averaging them produces something meaningful to neither.

**Multi-relational graphs:** "A is-parent-of B" and "A works-with B" are very different relationships. Aggregating $$h_B$$ via both gives a confused mixture.

**Cross-domain graphs:** a node representing a paper (text features) connected to a node representing an author (profile features). These live in literally different feature spaces.

## What Goes Wrong: The Heterophily Problem

On homophilic graphs (connected nodes tend to have the same label), GNNs work well — averaging similar nodes gives a good representation of the node's label.

On heterophilic graphs (connected nodes tend to have different labels), the standard GNN suffers:
1. It averages over nodes with different labels → the average is "between" all label classes → uninformative
2. Oversmoothing pushes all nodes toward the global average faster → even worse on heterophilic data
3. The model must learn to "undo" the averaging to recover discriminative information

Empirically this shows up as a clear gap. On the classic heterophilic benchmarks Chameleon and Squirrel (edge homophily $$h \approx 0.23$$ and $$h \approx 0.22$$, five classes each), a plain GCN sits in the mid-50s to mid-60s in accuracy, while models built for heterophily — and sheaf models in particular — sit several points higher. Note that these accuracies are still far above the 20% chance level: the failure of GCN here is a *relative* failure, not a collapse to random guessing.

## The Core Issue: Features on Edges

Standard GNNs attach features to **nodes** and send them unchanged along edges. There is no mechanism to transform features as they cross an edge.

Consider two nodes $$u$$ and $$v$$ connected by an edge, with features $$x_u \in \mathbb{R}^d$$. The message from $$u$$ to $$v$$ is (some function of) $$x_u$$. But what if the "right" message from $$u$$ to $$v$$ should be **a different projection of $$x_u$$** — one that highlights what is relevant from $$u$$'s perspective to $$v$$?

**Sheaves** formalise exactly this. Each edge $$e$$ gets its own vector space, and each endpoint gets its own **linear map** into it. For the edge $$e = (u,v)$$ these are

<div class="formula-box">
\[
\mathcal{F}_{u \trianglelefteq e} : \mathcal{F}(u) \to \mathcal{F}(e),
\qquad
\mathcal{F}_{v \trianglelefteq e} : \mathcal{F}(v) \to \mathcal{F}(e),
\]
</div>

so that $$u$$'s features are transformed *before* they are compared to $$v$$'s (also transformed) features. Note that the transformation happens on the way to the shared edge space, not directly from node to node.

<div class="insight-box">
<strong>The geometric intuition:</strong> Think of two observers at different locations. They may be looking at the same object, but from different angles. To compare their observations, you must first transform each observation to a common reference frame. The sheaf's edge maps are exactly these "frame transformation" operations — they align features from different nodes before aggregation.
</div>

## From Flat to Structured Aggregation

**Standard message passing:**

<div class="formula-box">
\[
\mathrm{AGG}\Big\{\, h_u \;:\; u \in \mathcal{N}(v) \,\Big\}
\]
</div>

All neighbour features aggregated directly.

**Sheaf message passing:**

<div class="formula-box">
\[
\mathrm{AGG}\Big\{\, \mathcal{F}_{v \trianglelefteq e}^{\top}\,\mathcal{F}_{u \trianglelefteq e}\, h_u \;:\; u \in \mathcal{N}(v),\; e = (u,v) \,\Big\}
\]
</div>

Each neighbour feature is first pushed into the edge space by $$\mathcal{F}_{u \trianglelefteq e}$$ and then pulled back into $$v$$'s space by $$\mathcal{F}_{v \trianglelefteq e}^{\top}$$ — a *transport* from $$u$$'s frame to $$v$$'s frame.

The restriction maps can be constrained to different matrix classes:
- **Scalar ($$d = 1$$):** a single signed number per endpoint. Crucially the sign is free, so the transport $$\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}$$ can be negative — something softmax attention (GAT) cannot express.
- **Diagonal:** elementwise rescaling — captures which stalk coordinates to emphasise.
- **Orthogonal:** rotations and reflections in feature space — preserves norm, changes direction.
- **General ($$d \times d$$ matrix):** full linear transformation — most expressive.

<div class="insight-box"><strong>Key Insight:</strong> The restriction maps are learnable linear transformations applied to each endpoint's features before they are compared in the shared edge space. When two nodes have different class-driven feature directions (heterophily), the model can learn maps that rotate \(u\)'s features into alignment with \(v\)'s — making the comparison meaningful. Standard message passing is the special case where every stalk is \(\mathbb{R}\) and every restriction map is the identity: neighbours are always compared raw, which is only appropriate when they should be equal.</div>

## The Mathematical Object: A Cellular Sheaf

A **cellular sheaf** $$\mathcal{F}$$ on a graph $$G = (V, E)$$ assigns:
- A vector space $$\mathcal{F}(v)$$ to each node $$v$$ (the "stalk" over $$v$$)
- A vector space $$\mathcal{F}(e)$$ to each edge $$e$$ (the "stalk" over $$e$$)
- A linear map $$\mathcal{F}_{v \trianglelefteq e} : \mathcal{F}(v) \to \mathcal{F}(e)$$ for each node $$v$$ incident to $$e$$ (the "restriction map")

The restriction maps "restrict" the node feature to the edge — producing a view of the node from the edge's perspective. The notation $$v \trianglelefteq e$$ reads "$$v$$ is a face of $$e$$", i.e. $$v$$ is an endpoint of $$e$$.

This structure, coming from algebraic topology, provides a principled mathematical foundation for understanding information flow on graphs beyond simple averaging.

## Why This Matters for Deep Learning

Sheaf-based GNNs can:
1. Handle heterophilic graphs by learning restriction maps that align features of nodes with different labels
2. Model multi-relational graphs with different maps per edge type
3. Enable richer information flow: the "disagreement" $$\mathcal{F}_{v \trianglelefteq e} x_v - \mathcal{F}_{u \trianglelefteq e} x_u$$ measures edge inconsistency — a useful signal
4. Connect to topological data analysis, providing interpretability

The next posts build this intuition into concrete architectures: the sheaf Laplacian, Neural Sheaf Diffusion, and Polynomial Neural Sheaf Diffusion.

## References

- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (first application of cellular sheaves to graph neural networks, using a hand-crafted sheaf Laplacian in a synthetic setting).
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology* (the spectral theory of the sheaf Laplacian that all sheaf GNNs build on).
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (NSD: learning restriction maps from data to build the sheaf Laplacian, with theoretical analysis of heterophily and oversmoothing).
- Zhu, M., Wang, X., Shi, C., Ji, H., & Cui, P. (2021). [Interpreting and Unifying Graph Neural Networks with An Optimization Framework](https://arxiv.org/abs/2101.11859). *WWW 2021* (unified GNN analysis showing that oversmoothing corresponds to feature homogenisation by the graph Laplacian).
