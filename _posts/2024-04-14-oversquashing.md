---
layout: single
title: "Oversquashing: When Too Much Information Passes Through Bottlenecks"
date: 2024-04-14
categories: [gnn]
book: gnn
subsection: expressivity
tags: [oversquashing, bottleneck, Jacobian, graph-rewiring, long-range]
excerpt: "Oversquashing occurs when exponentially many node features must be compressed into a fixed-size embedding through a bottleneck edge. It is the reason GNNs struggle with long-range dependencies — not just oversmoothing."
author_profile: true
read_time: true
is_overview: false
icon: "🚱"
read_mins: 5
permalink: /blog/gnn/oversquashing/
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
<strong>TL;DR:</strong> In K-layer message passing, node v's embedding must summarise information from its K-hop neighbourhood — which grows exponentially with K. If the path to a distant important node passes through a single bottleneck edge, the information from that distant node is diluted by exponentially many competing signals. This is oversquashing — distinct from oversmoothing.
</div>

## Two Different Problems

Oversmoothing (too many layers → embeddings converge) and oversquashing (long-range info is lost at bottlenecks) are often confused. They are distinct:

| | Oversmoothing | Oversquashing |
|--|------------|----------------|
| Cause | Iterated averaging → feature collapse | Exponential neighbourhood growth → info compression |
| Affects | Nearby nodes most | Distant nodes most |
| More layers | Makes it worse | Would help (more hops) but also squashes more |
| Root mechanism | Low-pass filtering | Information bottleneck |
| Graph structure involved | Dense, connected graphs | Narrow bottleneck edges |

## The Exponential Growth Problem

In a K-layer MPNN, node v's embedding h^{(K)}_v depends on all nodes within K hops. The K-hop neighbourhood of v can be exponentially large — for a tree-like graph with degree d, it has ~d^K nodes.

All information from these d^K nodes must be compressed into a single vector h^{(K)}_v of fixed dimension d_hidden. As K grows:

<div class="math-box">
|N^K(v)| ~ d^K nodes → compressed into h^{(K)}_v ∈ ℝ^{d_hidden}
</div>

The information from any single distant node u contributes a vanishingly small fraction: ~1/d^K of the total. Even if u's feature is critical for predicting v's label, it is drowned out.

## The Jacobian Analysis

Alon & Yahav (2021) formalised oversquashing via the Jacobian:

<div class="math-box">
∂h^{(K)}_v / ∂x_u
</div>

This matrix measures how sensitive v's K-layer embedding is to u's input feature. If u is K hops from v, this involves K matrix multiplications:

<div class="math-box">
||∂h^{(K)}_v / ∂x_u|| ≤ C · (1/d)^K · [product of weight norms]
</div>

For nodes far apart (large K, bottleneck edges with large fan-in degree d), this norm becomes exponentially small. Gradients of the loss with respect to x_u also vanish — the model cannot learn that u matters for v's prediction.

<div class="insight-box">
<strong>The bottleneck analogy:</strong> Imagine a wide river (large neighbourhood) flowing through a narrow gorge (a single bottleneck edge connecting two parts of the graph). Most water (information) cannot pass through efficiently. The node on the other side of the gorge receives only a tiny, heavily compressed signal from the vast neighbourhood upstream.
</div>

## Where Oversquashing Is Severe

Oversquashing is worst when:

1. **The path between relevant nodes is long** (diameter >> number of layers)
2. **Bottleneck edges connect high-degree subtrees** — many nodes compete through a single edge
3. **The graph has tree-like structure** (few cycles, exponential neighbourhood growth)

Real examples where this matters:
- **Molecular property prediction:** computing HOMO-LUMO gap requires whole-molecule reasoning; bottleneck edges are single bonds connecting large fragments
- **Social network influence:** influence travels through single bridges between communities
- **Traffic forecasting:** a road closure (bottleneck) affects distant nodes but the effect is diluted through many competing paths

## Measuring Oversquashing

The **sensitivity score** ||∂h_v^{(K)}/∂x_u|| measures how much node u influences node v after K layers. Plotting this for all pairs (u,v) reveals which edges are bottlenecks.

Alternatively: the **commute time** between nodes (expected random walk length) — high commute time between u and v means information struggles to flow between them.

## Solutions: Graph Rewiring

**Graph rewiring** adds or removes edges to reduce bottlenecks:

- **SDRF (Stochastic Discrete Ricci Flow):** adds edges based on Ollivier-Ricci curvature — edges with negative curvature are bottlenecks
- **DIGL:** adds edges between nodes with high personalized PageRank similarity
- **CurvDrop:** removes edges with high negative curvature (bottlenecks) and adds long-range connections

**Other approaches:**
- **Global attention (Graph Transformers):** bypasses all bottlenecks — every node attends to every node directly
- **APPNP:** personalized PageRank allows distant information to flow via many paths simultaneously
- **Virtual node:** add a single virtual node connected to all other nodes, providing a global communication channel

## Curvature and Oversquashing

Topping et al. (2022) connected oversquashing to **Ricci curvature**. An edge (u,v) has negative Ollivier-Ricci curvature when its endpoints have few common neighbours — the edge is a bottleneck between two otherwise disconnected regions.

Adding edges at negative-curvature bottlenecks (SDRF) provably reduces oversquashing. This connects graph geometry (curvature) to information flow (oversquashing) — a beautiful theoretical result.

## Summary

| Property | Value |
|----------|-------|
| Root cause | Exponential neighbourhood growth + fixed embedding dimension |
| Formal measure | Jacobian ||∂h_v^{(K)}/∂x_u|| → 0 exponentially |
| Worst cases | Long paths, tree-like graphs, single bottleneck bridges |
| Effect | Distant relevant information lost; gradient vanishes |
| Solution 1 | Graph rewiring (add/remove edges) |
| Solution 2 | Global attention (Graph Transformers) |
| Solution 3 | Virtual nodes (global communication channel) |
| Relation to oversmoothing | Distinct: affects different nodes, different depth regime |

Oversquashing explains why GNNs fail on long-range reasoning tasks even when depth is not the bottleneck. Solving it requires either changing the graph (rewiring) or bypassing message passing altogether (Graph Transformers).
