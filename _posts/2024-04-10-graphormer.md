---
layout: single
title: "Graphormer: Transformers with Structural Biases for Graphs"
categories: [gnn]
book: gnn
subsection: architectures
tags: [Graphormer, graph-transformer, structural-encoding, molecular, OGB]
published: true
excerpt: "Graphormer encodes graph structure directly into Transformer attention via three biases: node centrality, spatial encoding (shortest paths), and edge encoding. It won the OGB-LSC 2021 competition on molecular property prediction."
author_profile: true
read_time: true
is_overview: false
icon: "🏆"
read_mins: 9
permalink: /blog/gnn/graphormer/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> Graphormer (Ying et al., Microsoft, 2021) takes a standard Transformer and injects three graph-structural signals: (1) degree centrality added to the input node embeddings, (2) shortest-path distance added as a learned scalar bias on the attention logits, (3) edge features along the shortest path added as a second bias. With these, the paper shows the architecture can reproduce the aggregate-and-combine step of common message-passing GNNs and can separate graphs that 1-WL cannot. It won the KDD Cup 2021 OGB-LSC quantum-property track.
</div>

## The Bridge Between Transformers and GNNs

Graphormer's key insight: a standard Transformer on graphs, without any structural information, ignores the graph entirely. Inject the right structural signals and it can express things message passing cannot.

The paper makes this concrete rather than sweeping. It shows that with an appropriate choice of spatial and edge encodings, a Graphormer layer can represent the aggregate-and-combine step of popular message-passing architectures (GIN, GCN, GraphSAGE) as well as their readout — and, separately, that shortest-path information lets it distinguish graph pairs that 1-WL colour identically. It is a constructive simulation result for specific architectures, not a proof that *every* conceivable MPNN is a special case.

## The Three Structural Encodings

### 1. Centrality Encoding

The input representation of each node $$v$$ is augmented with degree embeddings — for directed graphs, one for the in-degree and one for the out-degree (a single degree embedding suffices for undirected graphs):

<div class="formula-box">
\[
h_v^{(0)} = x_v + z^{-}_{\deg^{-}(v)} + z^{+}_{\deg^{+}(v)} .
\]
</div>

Here $$z^{-}$$ and $$z^{+}$$ are learnable vectors, looked up by degree value. Crucially this happens at the *input*, before $$W_Q, W_K, W_V$$ are applied, so the centrality signal flows into queries, keys and values alike.

**Why:** degree is a fundamental structural property. High-degree "hub" nodes play a different role than low-degree "leaf" nodes. The centrality encoding tells the model about a node's structural importance before attention even begins.

### 2. Spatial Encoding (Shortest Path Distance)

For each ordered pair $$(i,j)$$, the attention logit is offset by a learned scalar depending on their shortest-path distance:

<div class="formula-box">
\[
A_{ij} = \operatorname*{softmax}_{j}\!\left(\frac{q_i^{\top} k_j}{\sqrt{d}} + \varphi\big(\mathrm{dist}(i,j)\big)\right).
\]
</div>

$$\varphi$$ is a lookup table: one learnable scalar per distance value, shared across all node pairs at that distance and learned per attention head. If no path exists, a dedicated "unreachable" entry is used. Note this is a *bias*, not a mask — a distant pair is discouraged, not forbidden, and a strong content match can still override it.

**Why:** nearby nodes usually should interact more strongly, but attention over features alone has no way to discover topology. Encoding distance restores the locality bias of message passing without giving up the ability to attend globally.

### 3. Edge Encoding

For the shortest path $$i \to v_1 \to \dots \to j$$ with edges $$e_1, \dots, e_M$$, the edge features along that path are averaged into a second scalar bias:

<div class="formula-box">
\[
c_{ij} = \frac{1}{M} \sum_{n=1}^{M} x_{e_n}^{\top} w_n^{E},
\]
</div>

where $$x_{e_n}$$ is the feature vector of the $$n$$-th edge on the path and $$w_n^{E}$$ is a learned weight vector for position $$n$$ along the path. The result is a scalar, added to the attention logit alongside $$\varphi$$.

**Why:** in molecules, the bond types along the path between two atoms carry chemically relevant information. Two atoms separated by a chain of single bonds behave differently from two separated by double bonds at the same path length.

## The Full Graphormer Layer

<div class="formula-box">
\[
h_v^{(0)} = x_v + z^{-}_{\deg^{-}(v)} + z^{+}_{\deg^{+}(v)},
\]
\[
A_{ij} = \operatorname*{softmax}_{j}\!\left(\frac{q_i^{\top} k_j}{\sqrt{d}} + \varphi\big(\mathrm{dist}(i,j)\big) + c_{ij}\right),
\qquad
h'_i = \sum_j A_{ij} v_j ,
\]
</div>

with $$q_i = W_Q h_i$$, $$k_j = W_K h_j$$, $$v_j = W_V h_j$$ computed from the centrality-augmented representations.

So the layer is: centrality folded into the input embedding, then distance and path-edge biases added to the logits, then ordinary attention-weighted value aggregation. Both biases depend on the graph alone, so they are computed once per graph and reused at every layer.

**Concrete example: benzene (C₆H₆) molecular attention.**

Benzene's carbon skeleton is a 6-cycle. Every carbon has the same degree and the same features, so consider a carbon $$i$$ and the three distinct distance classes around the ring: adjacent ($$d=1$$), meta ($$d=2$$), and para, directly opposite ($$d=3$$).

Without structural encoding the logit is $$q_i^{\top}k_j/\sqrt{d}$$, which is identical for all six atoms because their features are identical. Attention is uniform over the ring — the model literally cannot tell an adjacent carbon from the opposite one.

With Graphormer's spatial encoding the three classes get three different learned scalars $$\varphi(1), \varphi(2), \varphi(3)$$, so the attention distribution becomes a function of ring distance. What the model typically learns is a decreasing profile — nearer atoms weighted more — but nothing forces that: $$\varphi$$ is free to be non-monotone if the chemistry rewards it, which is one of the design's advantages over a hard-coded $$1/d$$ decay.

Note the limit of this particular encoding, though. Going clockwise versus anticlockwise around the ring gives the *same* distance, and benzene's symmetry group maps any carbon to any other, so distance-based bias alone still cannot single out an individual atom in benzene. Distance encodings break ties between structural *classes*, not between automorphic nodes. The edge encoding adds bond-type information along each path, which matters as soon as the ring is substituted and the symmetry is broken.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Why Graphormer Beat GNNs on Molecules:</strong> Molecular property prediction (HOMO-LUMO gap, binding affinity) requires whole-molecule reasoning — the electronic structure of one end of a molecule influences the other. Local message-passing GNNs require many layers to propagate this information, risking oversmoothing. Graphormer's global attention connects every atom pair in one shot, and the structural biases ensure chemically meaningful attention patterns without sacrificing locality entirely.</div>

## Expressive Power

**What the paper actually establishes.** Two separate things, and it is worth keeping them apart:

1. *A simulation result.* With suitable choices of the spatial and edge encodings, one Graphormer layer can represent the aggregation and combination performed by GIN, GCN and GraphSAGE, and the global readout as well. This is constructive — specific encodings are exhibited — and it covers those named architectures, not literally every message-passing scheme.
2. *A separation result.* Shortest-path distances are not recoverable from 1-WL colours, so Graphormer can distinguish graph pairs that 1-WL (and hence any standard MPNN) colours identically.

Together these say Graphormer is at least as expressive as those MPNNs and strictly separates some pairs they cannot. What they do **not** say is that Graphormer is universal: it inherits the limits of its encodings. Two graphs with identical shortest-path distance distributions and identical edge features along paths remain indistinguishable to it, and within a single graph, automorphic nodes still receive identical representations — no permutation-equivariant encoding can break that.

## Results

Graphormer was submitted to the **KDD Cup 2021 OGB-LSC** quantum-property track on PCQM4M-LSC — predicting the HOMO–LUMO gap for a training set of roughly 3.8M molecules — and won it, with the follow-up model also leading on the successor dataset PCQM4Mv2.

The margin over the strongest GNN baselines (GIN and GCN, with and without virtual nodes) was substantial rather than marginal, and it was a landmark result: it was the first strong evidence that a Transformer with the right structural biases could beat message passing on large-scale molecular property prediction, and it set the template that later graph Transformers followed.

Take care when reading MAE tables for this task. Numbers for PCQM4M-LSC and PCQM4Mv2 are not comparable — v2 has a different split and different reported values — and the OGB leaderboards distinguish validation from test-dev. Quoting a single figure across the two datasets is a common and misleading error; check which dataset and which split any number refers to before comparing.

<div class="insight-box">
<strong>Why molecules?</strong> Molecules are small graphs (typically 10–60 atoms), making \(O(N^2)\) attention feasible. Structural information (bond paths, distances) is chemically meaningful. And molecular property prediction is a high-stakes application (drug discovery, materials science) where accuracy matters.
</div>

## Limitations

- **$$O(N^2)$$ attention:** limits applicability to small graphs, and the distance-bias matrix itself needs $$O(N^2)$$ memory per graph
- **Precomputed shortest paths:** on an unweighted graph, BFS from every node gives all-pairs distances in $$O(N(N+\lvert E\rvert))$$ time and $$O(N^2)$$ space — trivial for a 30-atom molecule, hopeless at $$N = 10^5$$
- **No explicit subgraph detection:** the model sees pairwise distances but not higher-order structure such as triangles or cycle membership, beyond whatever the distance profile happens to reveal
- **Automorphic nodes stay tied:** all three encodings are functions of the graph, so symmetric nodes receive identical representations

## Graphormer-3D

A follow-up extends Graphormer to 3D molecular structures — using Euclidean distances and angles between atoms as structural encodings, rather than graph-theoretic path lengths. This is crucial for tasks where 3D geometry determines properties (conformer generation, energy prediction).

## Summary

| Structural element | Encoding in Graphormer | Where it enters | Purpose |
|------------------|----------------------|-----------------|---------|
| Node importance | Degree embedding $$z_{\deg(v)}$$ | Input embedding, before QKV | Hub vs. leaf distinction |
| Pairwise proximity | Learned scalar $$\varphi(\mathrm{dist}(i,j))$$ | Added to attention logits | Local vs. global weighting |
| Edge information | Path-averaged $$c_{ij}$$ | Added to attention logits | Bond type along the connecting path |

Graphormer is the canonical example of how to inject graph structure into a Transformer cleanly. Its three structural biases are now standard components in the Graph Transformer design space.

## References

- Ying, C., Cai, T., Luo, S., Zheng, S., Ke, G., He, D., Shen, Y., & Liu, T.-Y. (2021). [Do Transformers Really Perform Bad for Graph Representation?](https://arxiv.org/abs/2106.05234). *NeurIPS 2021*.
- Vaswani, A., Shazeer, N., Parmar, N., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017*.
