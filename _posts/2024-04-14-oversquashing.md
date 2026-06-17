---
layout: single
title: "Oversquashing: When Too Much Information Passes Through Bottlenecks"
categories: [gnn]
book: gnn
subsection: expressivity
tags: [oversquashing, bottleneck, Jacobian, graph-rewiring, long-range]
published: true
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> In K-layer message passing, node v's embedding must summarise information from its K-hop neighbourhood — which grows exponentially with K. If the path to a distant important node passes through a single bottleneck edge, the information from that distant node is diluted by exponentially many competing signals. This is oversquashing — distinct from oversmoothing.
</div>
{% include figure image_path="/images/blog/gnn/topping2022_oversquashing.png" alt="Over-squashing bottleneck" caption="Over-squashing and graph curvature as an information bottleneck (Topping et al., 2022)" %}


## Intuition First: The Telephone Game Through a Bottleneck

Imagine passing a message through a chain of people, but at one point the chain narrows to a single person who must relay messages from 1,000 people on one side to 1,000 people on the other. That single relay is a bottleneck: the message each person on the far side receives is an extremely compressed, noisy version of the original. Oversquashing is exactly this — distant node information must squeeze through bottleneck edges into a fixed-size embedding, losing fidelity exponentially with distance.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Oversmoothing and oversquashing are opposites in a sense: oversmoothing means <em>too much</em> information from nearby nodes floods the embedding; oversquashing means <em>too little</em> information from distant nodes reaches the embedding. More layers hurt oversmoothing but would help oversquashing — yet more layers also squash more. The root fix is changing the graph topology, not just depth.</div>

<style>
@keyframes flow-pulse {
  0%, 100% { opacity: 0.2; r: 3; }
  50% { opacity: 1; r: 5; }
}
@keyframes bottleneck-squeeze {
  0%, 100% { stroke-width: 3; stroke: #f97316; }
  50% { stroke-width: 6; stroke: #dc2626; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:580px;display:block;margin:auto;">
  <style>
    .sq-node { stroke:#0d9488; stroke-width:2; fill:#dbeafe; }
    .sq-edge { stroke:#94a3b8; stroke-width:1.2; }
    .sq-bot { stroke-width:3; stroke:#f97316; fill:none; }
    .sq-lbl { font-size:9px; font-family:sans-serif; fill:#475569; text-anchor:middle; }
  </style>
  <!-- Left cluster: many nodes -->
  <text x="70" y="12" class="sq-lbl" font-weight="bold">Large left subtree</text>
  <circle cx="20" cy="45" r="10" class="sq-node"/>
  <circle cx="20" cy="75" r="10" class="sq-node"/>
  <circle cx="20" cy="105" r="10" class="sq-node"/>
  <circle cx="55" cy="45" r="10" class="sq-node"/>
  <circle cx="55" cy="75" r="10" class="sq-node"/>
  <circle cx="55" cy="105" r="10" class="sq-node"/>
  <circle cx="95" cy="60" r="10" class="sq-node"/>
  <circle cx="95" cy="90" r="10" class="sq-node"/>
  <line x1="20" y1="45" x2="55" y2="45" class="sq-edge"/>
  <line x1="20" y1="75" x2="55" y2="75" class="sq-edge"/>
  <line x1="20" y1="105" x2="55" y2="105" class="sq-edge"/>
  <line x1="55" y1="45" x2="95" y2="60" class="sq-edge"/>
  <line x1="55" y1="75" x2="95" y2="60" class="sq-edge"/>
  <line x1="55" y1="75" x2="95" y2="90" class="sq-edge"/>
  <line x1="55" y1="105" x2="95" y2="90" class="sq-edge"/>
  <!-- Bottleneck edge -->
  <line x1="105" y1="75" x2="195" y2="75" style="animation:bottleneck-squeeze 2s ease-in-out infinite;" class="sq-bot"/>
  <text x="150" y="68" class="sq-lbl" fill="#dc2626" font-weight="bold">BOTTLENECK</text>
  <!-- traveling dots -->
  <circle cx="110" cy="75" r="4" fill="#f97316" style="animation:flow-pulse 1.5s 0s ease-in-out infinite;"/>
  <circle cx="135" cy="75" r="4" fill="#f97316" style="animation:flow-pulse 1.5s 0.4s ease-in-out infinite;"/>
  <circle cx="160" cy="75" r="4" fill="#f97316" style="animation:flow-pulse 1.5s 0.8s ease-in-out infinite;"/>
  <circle cx="185" cy="75" r="4" fill="#f97316" style="animation:flow-pulse 1.5s 1.2s ease-in-out infinite;"/>
  <!-- Right cluster -->
  <text x="310" y="12" class="sq-lbl" font-weight="bold">Large right subtree</text>
  <circle cx="205" cy="45" r="10" class="sq-node"/>
  <circle cx="205" cy="75" r="10" class="sq-node"/>
  <circle cx="205" cy="105" r="10" class="sq-node"/>
  <circle cx="245" cy="60" r="10" class="sq-node"/>
  <circle cx="245" cy="90" r="10" class="sq-node"/>
  <circle cx="285" cy="45" r="10" class="sq-node"/>
  <circle cx="285" cy="75" r="10" class="sq-node"/>
  <circle cx="285" cy="105" r="10" class="sq-node"/>
  <line x1="205" y1="45" x2="245" y2="60" class="sq-edge"/>
  <line x1="205" y1="75" x2="245" y2="60" class="sq-edge"/>
  <line x1="205" y1="75" x2="245" y2="90" class="sq-edge"/>
  <line x1="205" y1="105" x2="245" y2="90" class="sq-edge"/>
  <line x1="245" y1="60" x2="285" y2="45" class="sq-edge"/>
  <line x1="245" y1="60" x2="285" y2="75" class="sq-edge"/>
  <line x1="245" y1="90" x2="285" y2="75" class="sq-edge"/>
  <line x1="245" y1="90" x2="285" y2="105" class="sq-edge"/>
  <text x="200" y="128" class="sq-lbl" fill="#64748b">All left-subtree info must flow through one edge — exponential compression</text>
</svg>
<figcaption>Oversquashing: information from many left-subtree nodes must pass through a single bottleneck edge, arriving severely compressed on the right side.</figcaption>
</figure></div>

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

## Concrete Worked Example: Jacobian Decay on a Path

Consider a path graph with 6 nodes: 1–2–3–4–5–6. Node 1 wants to influence node 6 via 5 hops. Suppose each message passing step multiplies by weight W with ||W|| = 0.9, and each node averages over degree d=2 neighbours.

The Jacobian bound after 5 hops:

```
||∂h_6^(5)/∂x_1|| ≤ (0.9)^5 × (1/2)^5 = 0.59 × 0.031 ≈ 0.018
```

Now compare node 1 influencing node 2 (1 hop):

```
||∂h_2^(1)/∂x_1|| ≤ 0.9 × (1/2) = 0.45
```

Node 6's embedding is **25× less sensitive** to node 1's feature than node 2's is. If node 1's feature is the critical signal for a prediction at node 6, it is effectively invisible to the model.

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

## References

- Alon, U., & Yahav, E. (2021). [On the Bottleneck of Graph Neural Networks and Its Practical Implications](https://arxiv.org/abs/2006.05205). *ICLR 2021*.
- Topping, J., Di Giovanni, F., Chamberlain, B. P., Dong, X., & Bronstein, M. M. (2022). [Understanding over-squashing and Bottlenecks on Graphs via Curvature](https://arxiv.org/abs/2111.14522). *ICLR 2022*.
- Di Giovanni, F., Giusti, L., Barbero, F., Maschi, G., Lio, P., & Bronstein, M. M. (2023). [On Over-Squashing in Message Passing Neural Networks: The Impact of Width, Depth, and Topology](https://arxiv.org/abs/2302.02941). *ICML 2023*.
