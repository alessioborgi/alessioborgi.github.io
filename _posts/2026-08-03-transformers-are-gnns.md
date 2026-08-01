---
layout: single
title: "Transformers Are GNNs on Fully Connected Graphs"
date: 2026-08-03
categories: [gdl]
book: gdl
subsection: unification
tags: [transformers, gnn, attention, gat, geometric-deep-learning]
published: true
is_overview: false
excerpt: "Write self-attention in the message-passing template and you get the Graph Attention Network equations with one substitution: the neighbourhood becomes the whole input. The two architectures are not analogous — they are the same operator on different graphs."
author_profile: true
read_time: true
icon: "🔗"
read_mins: 7
permalink: /blog/gdl/transformers-are-gnns/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A Graph Attention Network computes attention over a node's neighbours. A Transformer computes attention over every token. Written in the same notation, the equations differ in exactly one symbol — \(\mathcal{N}_i\) against \(\mathcal{S}\). So a Transformer is a GNN whose graph happens to be complete, and a GAT is a Transformer whose attention has been masked by an adjacency matrix. This chapter does the substitution carefully, then flags two places where "identical" is stronger than the mathematics supports.
</div>

## The two update rules

**Self-attention.** For token $$i$$ in a sentence $$\mathcal{S}$$:

<div class="formula-box">
\[
h_i^{\ell+1} = \sum_{j \in \mathcal{S}} w_{ij} \cdot W_V^{\ell} h_j^{\ell},
\qquad
w_{ij} = \operatorname{softmax}_{j \in \mathcal{S}}\bigl(W_Q^{\ell} h_i^{\ell} \cdot W_K^{\ell} h_j^{\ell}\bigr).
\]
</div>

**Graph attention.** For node $$i$$ with neighbourhood $$\mathcal{N}_i$$, the message function is

<div class="formula-box">
\[
\psi\bigl(h_i^{\ell}, h_j^{\ell}\bigr)
= \frac{\exp\bigl(W_Q^{\ell} h_i^{\ell} \cdot W_K^{\ell} h_j^{\ell}\bigr)}
       {\sum_{j' \in \mathcal{N}_i} \exp\bigl(W_Q^{\ell} h_i^{\ell} \cdot W_K^{\ell} h_{j'}^{\ell}\bigr)}
  \cdot W_V^{\ell} h_j^{\ell},
\qquad
h_i^{\ell+1} = h_i^{\ell} + \sum_{j \in \mathcal{N}_i} \psi\bigl(h_i^{\ell}, h_j^{\ell}\bigr).
\]
</div>

Put them side by side and the only structural difference is the index set the softmax normalises over and the sum runs across. Replace $$\mathcal{N}_i$$ with $$\mathcal{S}$$ and you have self-attention. Replace $$\mathcal{S}$$ with $$\mathcal{N}_i$$ and you have a GAT.

<div class="insight-box">
<strong>The substitution in one sentence:</strong> attention <em>is</em> message passing in which the message from \(j\) to \(i\) is a learned scalar weight times a learned linear transform of \(h_j\), and the aggregator is a sum. Self-attention is that operator on the complete graph.
</div>

## Verified, on three tokens

Take three tokens with attention scores $$s_{ij}$$ given directly (rows $$= i$$):

<div class="formula-box">
\[
S = \begin{pmatrix} 2 & 1 & 0 \\ 1 & 2 & 1 \\ 0 & 1 & 2 \end{pmatrix},
\qquad
V = \begin{pmatrix} 1 & 0 \\ 0 & 1 \\ 1 & 1 \end{pmatrix}.
\]
</div>

**As a Transformer**, each token attends to all three:

| token | attention weights | output |
|---|---|---|
| 0 | (0.6652, 0.2447, 0.0900) | (0.7553, 0.3348) |
| 1 | (0.2119, 0.5761, 0.2119) | (0.4239, 0.7881) |
| 2 | (0.0900, 0.2447, 0.6652) | (0.7553, 0.9100) |

**As a GAT** on the path graph $$0 - 1 - 2$$ (with self-loops), each node attends only to its neighbours:

| node | neighbourhood | attention weights | output |
|---|---|---|---|
| 0 | $$\{0,1\}$$ | (0.7311, 0.2689, 0) | (0.7311, 0.2689) |
| 1 | $$\{0,1,2\}$$ | (0.2119, 0.5761, 0.2119) | (0.4239, 0.7881) |
| 2 | $$\{1,2\}$$ | (0, 0.2689, 0.7311) | (0.7311, 1.0000) |

Two things to read off. Node 1 is adjacent to everything, so its row is **identical** in both tables — locality is only a constraint where it actually removes something. And computing the GAT instead as *global attention with $$-\infty$$ on non-edges* reproduces the GAT table exactly, to machine precision.

<div class="insight-box">
<strong>So masking is the whole difference.</strong> A GAT is a Transformer with an attention mask given by the adjacency matrix. Set the mask to all-ones and you recover full self-attention — I checked this collapse numerically and it is exact, not approximate. This is why modern graph libraries implement GATs as masked attention kernels rather than as gather-scatter loops.
</div>

## Where "identical" overstates it

The equivalence is real, and two details are usually glossed. Neither breaks the argument; both matter if you are implementing or reasoning precisely.

**The message function is not pairwise.** The message-passing template says $$m_{ij} = \psi(h_i, h_j)$$ — a function of two nodes. But the attention weight has a softmax denominator summing over the *entire* neighbourhood, so the message from $$j$$ to $$i$$ depends on every other neighbour of $$i$$ as well. Written honestly it is $$\psi\bigl(h_i, h_j; \{h_{j'}\}_{j' \in \mathcal{N}_i}\bigr)$$. Attention-based GNNs therefore sit slightly outside the strict pairwise formulation, in a class sometimes distinguished as *anisotropic* message passing. The three-step template still applies; step 1 is just doing more than the notation admits.

**The surrounding layer is not the same.** The attention *cores* match. The layers around them do not, in practice. A Transformer layer wraps attention in a residual connection, layer normalisation, and a token-wise MLP:

<div class="formula-box">
\[
h_i^{\ell+1} = \operatorname{MLP}\Bigl( \operatorname{LayerNorm}\bigl( h_i^{\ell} + \textstyle\sum_{j \in \mathcal{S}} \psi(h_i^{\ell}, h_j^{\ell}) \bigr) \Bigr).
\]
</div>

A standard GAT layer has the residual but typically no token-wise feedforward block. That block is not a detail: it holds **more learnable parameters than the attention mechanism does**. So "Transformers are GNNs" is precise about the aggregation operator and loose about the layer, and most of a Transformer's parameters live in the part the equivalence does not cover.

<div class="warning-box">
<strong>A third simplification, stated by the paper itself:</strong> the scores above omit the \(1/\sqrt{d_k}\) factor from real scaled dot-product attention. It changes nothing structurally — it is a variance correction, covered in the <a href="/blog/transformers/scaled-dot-product-attention/">Transformers book</a> — but the equations as written are a simplified attention, not the deployed one.
</div>

## What the equivalence buys you

**A Transformer has no graph, and that is a choice with two edges.** Committing to a sparse graph is an inductive bias: helpful when the structure is real, harmful when it is wrong or incomplete. The pathologies Book II documents — [oversmoothing](/blog/gnn/oversmoothing/) and [oversquashing](/blog/gnn/oversquashing/) — are consequences of forcing information through a fixed sparse topology. A complete graph has no bottleneck to squash through. It also has no prior, so everything must be learned from data.

**Positional encodings are how you put the structure back, softly.** A Transformer given no positional information cannot tell one ordering of its input from another — it is a set model. Positional encodings inject order as a *feature* rather than as an architectural constraint, so the model can use it or ignore it. That idea transfers directly to graphs: encode structural information (Laplacian eigenvectors, random-walk statistics, shortest-path distances) as node features and hand them to a Transformer. This is the recipe behind **Graph Transformers**, which combine local message passing with global attention.

**GATs and Transformers are one implementation.** If your framework has a fast masked-attention kernel, you have a fast GAT.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Self-attention and graph attention differ in one symbol: the index set the softmax normalises over. \(\mathcal{S}\) gives a Transformer, \(\mathcal{N}_i\) gives a GAT.</li>
  <li>Verified on three tokens: computing a GAT as global attention masked with \(-\infty\) on non-edges reproduces local attention exactly, and an all-ones mask recovers full self-attention.</li>
  <li>A node adjacent to everything has an identical row either way — locality only constrains where it actually removes candidates.</li>
  <li>The message function is not truly pairwise: the softmax denominator makes every message depend on the whole neighbourhood.</li>
  <li>The equivalence covers the attention core, not the full layer. The token-wise MLP — which holds more parameters than attention — has no GAT counterpart.</li>
  <li>No graph means no structural prior and no bottleneck. Positional and structural encodings put the information back as features rather than as constraints, which is what Graph Transformers do.</li>
</ul>
</div>

## References

- Joshi, C. K. (2025). [Transformers are Graph Neural Networks](https://arxiv.org/abs/2506.22084). *arXiv:2506.22084*.
- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017*.
- Veličković, P., Cucurull, G., Casanova, A., Romero, A., Liò, P., & Bengio, Y. (2018). [Graph Attention Networks](https://arxiv.org/abs/1710.10903). *ICLR 2018*.
- Dwivedi, V. P., & Bresson, X. (2020). [A Generalization of Transformer Networks to Graphs](https://arxiv.org/abs/2012.09699). *arXiv:2012.09699*.
- Rampášek, L., Galkin, M., Dwivedi, V. P., Luu, A. T., Wolf, G., & Beaini, D. (2022). [Recipe for a General, Powerful, Scalable Graph Transformer](https://arxiv.org/abs/2205.12454). *NeurIPS 2022*.
- Di Giovanni, F., Giusti, L., Barbero, F., Luise, G., Liò, P., & Bronstein, M. M. (2023). [On Over-Squashing in Message Passing Neural Networks: The Impact of Width, Depth, and Topology](https://arxiv.org/abs/2302.02941). *ICML 2023*.
