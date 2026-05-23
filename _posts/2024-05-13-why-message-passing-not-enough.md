---
layout: single
title: "Why Message Passing Is Not Enough: The Case for Sheaves"
date: 2024-05-13
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf, message-passing, heterophily, limitations, cellular-sheaf]
excerpt: "Standard message passing aggregates neighbour features and averages. On heterophilic graphs (where neighbours often disagree), this is harmful. Cellular sheaves provide a mathematically principled framework to model per-edge relationships between node features — going beyond mere averaging."
author_profile: true
read_time: true
is_overview: false
icon: "🔭"
read_mins: 4
permalink: /blog/gnn/why-message-passing-not-enough/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Standard message passing computes h_v = UPDATE(h_v, AGG({h_u : u ∈ N(v)})). This assumes neighbours' features are directly comparable — the same "type" of information. On heterophilic graphs, this assumption fails: neighbours have different labels, different semantics, different feature spaces. Sheaves replace this flat comparison with per-edge linear maps that transform features before comparison.
</div>

## The Fundamental Assumption of Message Passing

Standard message passing (e.g., GCN, GAT) computes something like:

<div class="math-box">
h^{(k+1)}_v = σ( W^{(k)} · AGG({ h^{(k)}_u : u ∈ N(v) }) )
</div>

For this to make sense, the features h^{(k)}_u from different neighbouring nodes must live in the **same feature space** and be meaningfully aggregatable (averageable, summable).

This is a strong assumption. Consider:

**Heterophilic graphs:** in a social network, a user interested in cooking might be connected to a user interested in music. Their feature vectors are in very different semantic directions. Averaging them produces something meaningful to neither.

**Multi-relational graphs:** "A is-parent-of B" and "A works-with B" are very different relationships. Aggregating h_B via both gives a confused mixture.

**Cross-domain graphs:** a node representing a paper (text features) connected to a node representing an author (profile features). These live in literally different feature spaces.

## What Goes Wrong: The Heterophily Problem

On homophilic graphs (connected nodes tend to have the same label), GNNs work well — averaging similar nodes gives a good representation of the node's label.

On heterophilic graphs (connected nodes tend to have different labels), the standard GNN suffers:
1. It averages over nodes with different labels → the average is "between" all label classes → uninformative
2. Oversmoothing pushes all nodes toward the global average faster → even worse on heterophilic data
3. The model must learn to "undo" the averaging to recover discriminative information

Empirically: GCN on Chameleon and Squirrel (heterophilic graphs) achieves 50-60% accuracy — barely above random. Models designed for heterophily (H2GCN, GPRGNN, GPR) reach 70-80%.

## The Core Issue: Features on Edges

Standard GNNs attach features to **nodes** and send them unchanged along edges. There is no mechanism to transform features as they cross an edge.

Consider two nodes u and v connected by an edge, with features x_u ∈ ℝ^d. The message from u to v is (some function of) x_u. But what if the "right" message from u to v should be **a different projection of x_u** — one that highlights what is relevant from u's perspective to v?

**Sheaves** formalise exactly this: each edge (u,v) carries a **linear map** F(u→v): ℝ^{d_u} → ℝ^{d_{uv}} that transforms u's features before they are compared to v's (also transformed) features.

<div class="insight-box">
<strong>The geometric intuition:</strong> Think of two observers at different locations. They may be looking at the same object, but from different angles. To compare their observations, you must first transform each observation to a common reference frame. The sheaf's edge maps are exactly these "frame transformation" operations — they align features from different nodes before aggregation.
</div>

## From Flat to Structured Aggregation

**Standard message passing:**
<div class="math-box">
Aggregation: AGG({ h_u : u ∈ N(v) })
</div>
All neighbour features aggregated directly.

**Sheaf message passing:**
<div class="math-box">
Aggregation: AGG({ F_{u→v} h_u : u ∈ N(v) })
</div>
Each neighbour feature transformed by edge-specific map before aggregation.

The edge maps F_{u→v} can be:
- **Scalar (d=1):** just a scalar weight per edge — equivalent to standard GAT with fixed weights
- **Diagonal:** elementwise rescaling — captures which features to emphasise
- **Orthogonal:** rotation in feature space — preserves norm, changes direction
- **General (d×d matrix):** full linear transformation — most expressive

## The Mathematical Object: A Cellular Sheaf

A **cellular sheaf** on graph G assigns:
- A vector space F(v) to each node v (the "stalk" over v)
- A vector space F(e) to each edge e (the "stalk" over e)
- A linear map F(v ⊴ e): F(v) → F(e) for each v incident to e (the "restriction map")

The restriction maps are the edge maps F_{u→v}. They "restrict" the node feature to the edge — producing a view of the node from the edge's perspective.

This structure, coming from algebraic topology, provides a principled mathematical foundation for understanding information flow on graphs beyond simple averaging.

## Why This Matters for Deep Learning

Sheaf-based GNNs can:
1. Handle heterophilic graphs by learning edge maps that align features of nodes with different labels
2. Model multi-relational graphs with different maps per edge type
3. Enable richer information flow: the "disagreement" between F(u→e) h_u and F(v→e) h_v measures edge inconsistency — a useful signal
4. Connect to topological data analysis, providing interpretability

The next posts build this intuition into concrete architectures: the Sheaf Laplacian, Neural Sheaf Diffusion, and Polynomial Neural Sheaf Diffusion.
