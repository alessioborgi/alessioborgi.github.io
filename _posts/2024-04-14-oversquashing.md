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
read_mins: 10
permalink: /blog/gnn/oversquashing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> In \(K\)-layer message passing, node \(v\)'s embedding must summarise information from its \(K\)-hop neighbourhood \(\mathcal{N}_K(v)\), which on a tree-like graph grows exponentially with \(K\). If the route to a distant important node passes through a single bottleneck edge, that node's contribution is diluted by exponentially many competing signals. This is oversquashing — distinct from oversmoothing.
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
| Cause | Iterated averaging → feature collapse | Neighbourhood growth + bottlenecks → info compression |
| Affects | Nearby nodes most | Distant nodes most |
| More layers | Makes it worse | Would help (more hops) but also squashes more |
| Root mechanism | Low-pass filtering | Information bottleneck |
| Formal object | Spectrum of $\hat{A}$: $\hat{A}^K \to u_1u_1^{\top}$ | Jacobian: $\lVert \partial h_v^{(K)}/\partial x_u \rVert \to 0$ |
| Graph structure involved | Dense, connected graphs | Narrow bottleneck edges |

## The Exponential Growth Problem

In a $K$-layer MPNN, node $v$'s embedding $h_v^{(K)}$ depends on every node within $K$ hops — its receptive field $\mathcal{N}_K(v)$. On a graph that is locally tree-like with branching factor $d$, that set grows exponentially:

<div class="formula-box">
\[
\lvert \mathcal{N}_K(v) \rvert \;\sim\; d^{K} \quad\text{nodes, all compressed into}\quad h_v^{(K)} \in \mathbb{R}^{p},
\]
</div>

where $p$ is the fixed hidden width. The width $p$ does not grow with $K$, so the information any single distant node $u$ can claim shrinks roughly like $1/d^{K}$. Even if $u$'s feature is critical for predicting $v$'s label, it is drowned out.

Note the condition: this exponential argument needs the neighbourhood to actually expand. On a path or a cycle, $$\lvert\mathcal{N}_K(v)\rvert$$ grows only linearly, and oversquashing there arises from a different mechanism — the decay of the propagation operator over distance, quantified next.

## The Jacobian Analysis

Alon & Yahav (2021) identified and named oversquashing; Topping et al. (2022) made it quantitative by bounding the Jacobian

<div class="formula-box">
\[
\frac{\partial h_v^{(K)}}{\partial x_u} \in \mathbb{R}^{p \times p},
\]
</div>

which measures how sensitive $v$'s $K$-layer embedding is to $u$'s input feature $x_u$. Unrolling $K$ layers of message passing gives a bound of the form

<div class="formula-box">
\[
\left\lVert \frac{\partial h_v^{(K)}}{\partial x_u} \right\rVert \;\le\; (c\,w)^{K}\,\bigl(\hat{A}^{K}\bigr)_{vu},
\]
</div>

where $w$ bounds the norms of the weight matrices, $c$ bounds the Lipschitz constant of the non-linearity, and $\hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}$ is the same propagation matrix as in the oversmoothing post. The topology enters through the single factor $$(\hat{A}^{K})_{vu}$$.

Two consequences follow. First, if $u$ is more than $K$ hops from $v$ then $$(\hat{A}^{K})_{vu} = 0$$ exactly — no amount of training can create sensitivity that the receptive field does not contain. Second, when $u$ is reachable but only through a bottleneck, $$(\hat{A}^{K})_{vu}$$ is tiny, so the forward signal *and* the gradient $\partial \mathcal{L}/\partial x_u$ are both suppressed: the model cannot learn that $u$ matters for $v$.

<div class="insight-box">
<strong>What the bound does and does not say:</strong> it is an <em>upper</em> bound. A small \((\hat{A}^{K})_{vu}\) proves that sensitivity <em>must</em> be small; a large one does not guarantee the model actually uses the connection. That asymmetry is exactly what makes it useful as a diagnosis of failure rather than a guarantee of success.
</div>

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

Take the path graph on 6 nodes, 1–2–3–4–5–6, and ask how much node 1 can influence node 6, which is 5 hops away. Suppose each message-passing step multiplies by a weight matrix with $\lVert W \rVert = 0.9$ and the non-linearity is 1-Lipschitz, so the bound above reads $$0.9^{K}\,(\hat{A}^{K})_{6,1}$$.

The degrees on this path are $(1,2,2,2,2,1)$, so with self-loops $\tilde{d} = (2,3,3,3,3,2)$. Computing the relevant entries of $\hat{A}^{K}$ directly:

| Pair | Hops | $$(\hat{A}^{K})_{vu}$$ | Bound $$0.9^{K}(\hat{A}^{K})_{vu}$$ |
|---|---|---|---|
| $1 \to 2$ | 1 | $1/\sqrt{6} \approx 0.408$ | $0.9 \times 0.408 \approx 0.367$ |
| $1 \to 6$ | 5 | $\approx 0.00617$ | $0.9^{5} \times 0.00617 \approx 0.00365$ |

Node 6's embedding is roughly **100× less sensitive** to node 1's feature than node 2's is, and the gap widens geometrically with distance. If node 1's feature is the critical signal for a prediction at node 6, it is effectively invisible to the model.

Notice that most of the decay here comes from $$(\hat{A}^{K})_{vu}$$, not from the weight norms: even with $\lVert W\rVert = 1$ the ratio would be $0.408 / 0.00617 \approx 66$. The topology is doing the damage.

## Measuring Oversquashing

The **sensitivity score** $\lVert \partial h_v^{(K)} / \partial x_u \rVert$ measures how much node $u$ influences node $v$ after $K$ layers. Plotting it for all pairs $(u,v)$ reveals which edges are bottlenecks.

Two topology-only proxies avoid training a model at all:

- **Commute time** $\tau(u,v)$ — the expected number of steps for a random walk to go from $u$ to $v$ and back. High commute time means information struggles to flow between them.
- **Effective resistance** $R(u,v)$, the resistance between $u$ and $v$ when each edge is a unit resistor. The two are proportional, $\tau(u,v) = 2\lvert E\rvert\, R(u,v)$, and effective resistance is the quantity that later work (Di Giovanni et al., 2023) ties directly to oversquashing: pairs separated by high effective resistance are exactly the pairs whose Jacobian is provably small.

## Solutions: Graph Rewiring

**Graph rewiring** adds or removes edges to reduce bottlenecks:

- **SDRF (Stochastic Discrete Ricci Flow):** adds edges around the most negatively curved edges — edges with negative curvature are bottlenecks
- **DIGL:** adds edges between nodes with high personalized PageRank similarity
- **CurvDrop:** removes edges with high negative curvature (bottlenecks) and adds long-range connections

**Other approaches:**
- **Global attention (Graph Transformers):** bypasses all bottlenecks — every node attends to every node directly
- **APPNP:** personalized PageRank allows distant information to flow via many paths simultaneously
- **Virtual node:** add a single virtual node connected to all other nodes, providing a global communication channel

## Curvature and Oversquashing

Topping et al. (2022) connected oversquashing to a notion of **discrete Ricci curvature**. They introduce the *balanced Forman curvature* $\mathrm{Ric}(u,v)$ of an edge — a combinatorial quantity built from the degrees $d_u, d_v$, the number of triangles containing $(u,v)$, and the 4-cycles through it. An edge is negatively curved when its endpoints share few common neighbours and few short cycles: locally, the edge is the only route between two otherwise separate regions.

The link to oversquashing runs through the Jacobian bound above. Their result is a *conditional* one, not a blanket guarantee: for a graph containing a sufficiently negatively curved edge, they prove an upper bound on $\lVert \partial h_v^{(K)}/\partial x_u \rVert$ for pairs $u,v$ on opposite sides of it, and show that a curvature-guided rewiring (SDRF) increases the curvature of the worst edges. That improves the bound; it does not prove that a trained model's downstream accuracy must improve. What it does establish is the direction of the connection — from graph geometry (curvature) to information flow (oversquashing).

## Summary

| Property | Value |
|----------|-------|
| Root cause | Receptive-field growth and bottleneck topology vs. fixed embedding width |
| Formal measure | $$\lVert \partial h_v^{(K)}/\partial x_u \rVert \le (cw)^{K}(\hat{A}^{K})_{vu}$$, decaying geometrically |
| Topological proxies | Effective resistance $R(u,v)$, commute time $\tau(u,v)$, negative edge curvature |
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
