---
layout: single
title: "GNNs for Recommender Systems"
categories: [gnn]
book: gnn
subsection: applications
tags: [recommender-systems, collaborative-filtering, PinSage, LightGCN, bipartite-graph]
published: true
excerpt: "Recommendation is naturally a graph problem: users and items are nodes, interactions are edges. GNNs on bipartite user-item graphs capture higher-order collaborative filtering signals — friends of friends liked this — that matrix factorisation cannot represent."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 6
permalink: /blog/gnn/gnns-recommender-systems/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> The user-item interaction graph is bipartite: users on one side, items on the other, with edges representing clicks, purchases or ratings. GCN-style propagation on this graph captures multi-hop collaborative signals — "users who liked what you liked also liked X." LightGCN strips the layer down to pure normalised propagation, dropping both the weight matrix and the non-linearity, and reports better accuracy <em>and</em> fewer parameters than the NGCF design it ablates.
</div>
{% include figure image_path="/images/blog/gnn/ying2018_pinsage.png" alt="PinSage recommendation GNN" caption="PinSage: graph convolutional network for web-scale recommender systems (Ying et al., 2018)" %}


## Recommendation as a Graph Problem

**Intuition First:** Matrix factorisation is like learning that "Alice likes comedies" and "this film is a comedy" and multiplying those two vectors. It captures direct user–item similarity but cannot represent the chain: "Alice liked this film, Bob also liked it, Bob also liked that other film, so Alice might like that other film too." GNNs capture this multi-hop chain by propagating information along the bipartite graph — 2-hop neighbours of Alice (items liked by users who liked Alice's items) are exactly the collaborative filtering signal that matrix factorisation misses.

**Traditional collaborative filtering:** learn a user embedding $$e_u$$ and an item embedding $$e_i$$, then predict the score as $$\hat{y}_{ui} = e_u^{\top} e_i$$. This captures pairwise similarity but not higher-order structure.

**GNN approach:** build a bipartite graph in which user $$u$$ is joined to item $$i$$ whenever $$u$$ interacted with $$i$$. Run a GNN to produce embeddings that capture multi-hop neighbourhood structure:
- 1-hop: items $$u$$ has interacted with (or users who interacted with $$i$$)
- 2-hop: items interacted with by users who also interacted with $$u$$'s items — the collaborative filtering signal
- 3-hop: transitive similarities

## The Bipartite User-Item Graph

Let $$U$$ be the users and $$I$$ the items, with $$V = U \sqcup I$$:

<div class="formula-box">
\[
G = (U \sqcup I,\; E), \qquad (u, i) \in E \iff \text{user } u \text{ interacted with item } i .
\]
</div>

Because the graph is bipartite, message passing alternates sides — users only ever hear from items, and items only from users:

<div class="formula-box">
\[
h_u^{(k)} = \mathrm{AGG}\!\left( \{\, h_i^{(k-1)} : i \in \mathcal{N}(u) \,\} \right),
\qquad
h_i^{(k)} = \mathrm{AGG}\!\left( \{\, h_u^{(k-1)} : u \in \mathcal{N}(i) \,\} \right).
\]
</div>

After $$K$$ layers, $$h_u^{(K)}$$ encodes the $$K$$-hop neighbourhood. Note the parity: odd $$k$$ mixes in items, even $$k$$ mixes in other *users*, so it takes at least two layers before any collaborative signal reaches $$u$$ at all.

## LightGCN (He et al., 2020)

LightGCN makes a key simplification: **remove the weight matrices and the non-linearities**. Each layer is nothing but symmetrically normalised averaging over the bipartite graph:

<div class="formula-box">
\[
h_u^{(k)} = \sum_{i \in \mathcal{N}(u)} \frac{1}{\sqrt{\lvert \mathcal{N}(u) \rvert \, \lvert \mathcal{N}(i) \rvert}}\, h_i^{(k-1)},
\qquad
h_i^{(k)} = \sum_{u \in \mathcal{N}(i)} \frac{1}{\sqrt{\lvert \mathcal{N}(i) \rvert \, \lvert \mathcal{N}(u) \rvert}}\, h_u^{(k-1)}.
\]
</div>

The final embedding is a weighted combination of every layer, which is how the model retains the 0-hop signal instead of over-smoothing it away:

<div class="formula-box">
\[
e_u = \sum_{k=0}^{K} \alpha_k\, h_u^{(k)},
\qquad
\alpha_k = \frac{1}{K+1},
\qquad
\hat{y}_{ui} = e_u^{\top} e_i .
\]
</div>

**Why remove the transformations?** Because on these benchmarks there is nothing for them to transform. The paper's ablation removes $$W_k$$ and $$\sigma(\cdot)$$ one at a time and finds that each removal helps, with the combined removal helping most: the collaborative signal lives in the propagation, and extra learnable matrices mainly add capacity to overfit.

<div class="insight-box">
<strong>LightGCN's key insight:</strong> Standard GCNs were designed for graphs with rich node features, where \(W\) does real work reprojecting them. In pure collaborative filtering the only input is a free ID embedding, already learned end to end — so \(W\) merely reparameterises a vector the model was free to choose anyway, buying no expressiveness while adding parameters and an optimisation burden. Stripping it back leaves the normalised propagation, which is the part that actually carries collaborative signal. This is a recommender-specific argument, not a general claim that simpler GNNs are better.
</div>

## PinSage (Ying et al., 2018)

Pinterest's GNN for image recommendation, and one of the first published industrial deployments of a GNN.

**Scale:** the paper reports a bipartite pin–board graph of 3 billion nodes and roughly 18 billion edges.

**Key innovations:**
1. **GraphSAGE-style sampling:** for each node, sample a fixed-size neighbourhood rather than the full one — this is what makes the computation tractable, since a full-neighbourhood pass over a graph this size is hopeless
2. **Random-walk importance sampling:** choose neighbours by how often they are visited in short random walks from the target node, not uniformly, and weight their messages by that visit count
3. **Curriculum training:** feed progressively harder negative examples as training proceeds

## NGCF and Variants

**NGCF (Wang et al., 2019):** adds an explicit feature interaction to the message:

<div class="formula-box">
\[
m_{u \leftarrow i} = \frac{1}{\sqrt{\lvert \mathcal{N}(u) \rvert \, \lvert \mathcal{N}(i) \rvert}}
\Big( W_1 h_i + W_2 \left( h_i \odot h_u \right) \Big).
\]
</div>

The Hadamard product $$h_i \odot h_u$$ is meant to capture user-item feature interaction. LightGCN's ablation found that on the standard collaborative-filtering benchmarks this term costs more in overfitting than it returns in expressiveness — though the argument is specific to the ID-embedding-only setting, and richer side features change the calculus.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;">
  <text x="210" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">2-hop Collaborative Filtering via GNN</text>
  <!-- Users left column -->
  <circle cx="60"  cy="70"  r="18" fill="#3b82f6"/><text x="60"  y="74"  text-anchor="middle" font-size="10" fill="white">Alice</text>
  <circle cx="60"  cy="140" r="18" fill="#3b82f6"/><text x="60"  y="144" text-anchor="middle" font-size="10" fill="white">Bob</text>
  <!-- Items middle column -->
  <circle cx="200" cy="55"  r="16" fill="#10b981"/><text x="200" y="59"  text-anchor="middle" font-size="9"  fill="white">Item1</text>
  <circle cx="200" cy="110" r="16" fill="#10b981"/><text x="200" y="114" text-anchor="middle" font-size="9"  fill="white">Item2</text>
  <circle cx="200" cy="165" r="16" fill="#10b981"/><text x="200" y="169" text-anchor="middle" font-size="9"  fill="white">Item3</text>
  <!-- Edges Alice–items -->
  <line x1="78"  y1="64"  x2="184" y2="58"  stroke="#93c5fd" stroke-width="1.5"/>
  <line x1="78"  y1="74"  x2="184" y2="108" stroke="#93c5fd" stroke-width="1.5"/>
  <!-- Edges Bob–items (both observed) -->
  <line x1="78"  y1="136" x2="184" y2="112" stroke="#6ee7b7" stroke-width="1.5"/>
  <line x1="78"  y1="146" x2="184" y2="162" stroke="#6ee7b7" stroke-width="1.5"/>
  <!-- Predicted edge Alice–Item3, reached via Alice → Item2 → Bob → Item3 -->
  <circle cx="200" cy="165" r="22" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3"/>
  <line x1="76" y1="87" x2="184" y2="152" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 3"><animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite"/></line>
  <!-- Brace marking Alice's 1-hop items -->
  <path d="M 222 55 L 227 55 L 227 110 L 222 110" fill="none" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="233" y="86" text-anchor="start" font-size="9" fill="#6b7280">1-hop: items Alice liked</text>
  <!-- Annotation for the recommendation -->
  <rect x="245" y="120" width="165" height="48" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="327" y="136" text-anchor="middle" font-size="9" font-weight="bold" fill="#92400e">Recommend Item3 to Alice</text>
  <text x="327" y="149" text-anchor="middle" font-size="8" fill="#b45309">2-hop path: Alice – Item2 – Bob – Item3</text>
  <text x="327" y="161" text-anchor="middle" font-size="8" fill="#b45309">(dashed amber = predicted link)</text>
</svg>
<figcaption>GNN propagation on the bipartite graph: Alice and Bob both liked Item2 (1-hop, solid edges). Bob also liked Item3, so Item3 is two hops from Alice. LightGCN propagates the signal along that path and scores the missing Alice–Item3 edge (dashed amber) highly.</figcaption>
</figure>
</div>

## Session-Based Recommendation

Standard CF assumes all past interactions are known for each user. **Session-based recommendation** has no long-term user history — only the current session (sequence of clicks).

**SR-GNN (Wu et al., 2019):** model a session as a directed graph (clicks are edges from previous item to next item). Run GCN on session graph, then use attention to extract user intent from node embeddings. This captures transition patterns between items within a session.

## Knowledge Graph-Enhanced Recommendation

**KGNN-LS / KGCN:** enrich the item side with a knowledge graph (item → category, brand, attributes). GNN propagates over both the user-item graph and the item knowledge graph simultaneously.

Benefit: cold-start items with no interactions can leverage KG features (genre, director for movies) to receive recommendations from users with similar taste in KG-related items.

## Summary

| Model | Key idea | Hops used |
|-------|---------|-------|
| Matrix factorisation | Pairwise similarity only | 0 (direct inner product) |
| NGCF | GCN + explicit feature interaction | $$K$$ hops, with $$W_1, W_2$$ per layer |
| LightGCN | Normalised propagation, no $$W$$ or $$\sigma$$ | $$K$$ hops, layer-combined |
| PinSage | GraphSAGE + random-walk importance sampling | Sampled 2-hop neighbourhoods |
| SR-GNN | Session graph + gated GNN | Within-session transitions |

The mechanism that unifies these is the one worth remembering: on a bipartite interaction graph, a $$K$$-layer GNN gives every user an embedding that already contains the items liked by users like them. That is collaborative filtering expressed as message passing, and it is why PinSage could be deployed at Pinterest's graph scale while a dense user-item matrix could not.

## References

- Ying, R., He, R., Chen, K., Eksombatchai, P., Hamilton, W. L., & Leskovec, J. (2018). [Graph Convolutional Neural Networks for Web-Scale Recommender Systems](https://arxiv.org/abs/1806.01973). *KDD 2018* (PinSage: GraphSAGE-based GNN for Pinterest's 3-billion-node pin-board graph at production scale).
- He, X., Deng, K., Wang, X., Li, Y., Zhang, Y., & Wang, M. (2020). [LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation](https://arxiv.org/abs/2002.02126). *SIGIR 2020* (LightGCN: ablation study showing that removing feature transformation and activation from GCN improves collaborative filtering).
- Wu, S., Tang, Y., Zhu, Y., Wang, L., Xie, X., & Tan, T. (2019). [Session-Based Recommendation with Graph Neural Networks](https://arxiv.org/abs/1811.00855). *AAAI 2019* (SR-GNN: models session sequences as directed graphs for next-item prediction with GNN).
