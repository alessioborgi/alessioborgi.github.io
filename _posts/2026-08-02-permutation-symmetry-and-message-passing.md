---
layout: single
title: "Permutation Symmetry and the Message-Passing Blueprint"
date: 2026-08-02
categories: [gdl]
book: gdl
subsection: foundations
tags: [permutation-equivariance, message-passing, symmetry, gnn, geometric-deep-learning]
published: true
is_overview: false
excerpt: "A graph's nodes have no canonical order, so any model that reads one must give the same answer under relabelling. That single requirement forces the three-step message, aggregate, update template — it is not a design choice."
author_profile: true
read_time: true
icon: "🔀"
read_mins: 6
permalink: /blog/gdl/permutation-symmetry-and-message-passing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Relabelling the nodes of a graph produces the same graph. So a model that reads the adjacency matrix must produce output that is <em>permuted the same way</em> — equivariant — and a graph-level prediction must not move at all — invariant. Requiring that immediately rules out any aggregation step that depends on neighbour ordering, which is why every message-passing GNN aggregates with a sum, mean or max. The template is forced by the symmetry, not chosen for convenience.
</div>

## The symmetry

An attributed graph is $$\mathcal{G} = (A, H)$$ with $$A \in \{0,1\}^{n \times n}$$ the adjacency matrix and $$H \in \mathbb{R}^{n \times d}$$ the node features. Node $$i$$'s neighbourhood is $$\mathcal{N}_i = \{\, j \in \mathcal{V} \mid a_{ij} = 1 \,\}$$.

Nothing about the graph designates node 1 as first. Any relabelling gives an equally valid description of the same object. Formally, a permutation $$\sigma$$ acts through its permutation matrix $$P_\sigma$$:

<div class="formula-box">
\[
P_\sigma \cdot \mathcal{G} \;=\; \bigl(P_\sigma A P_\sigma^{\top},\ P_\sigma H\bigr).
\]
</div>

The adjacency matrix is conjugated — rows *and* columns move, because an edge is a pair — while the feature matrix is only row-permuted.

<div class="insight-box">
<strong>What we require of a layer.</strong> A message-passing layer \(f\) must satisfy
\(f(P_\sigma A P_\sigma^{\top},\ P_\sigma H) = P_\sigma f(A, H)\).
Relabel first and run the layer, or run the layer and relabel — the same answer either way. For a graph-level prediction the readout must be <em>invariant</em>: the permutation disappears entirely. Equivariance for the layers, invariance for the readout, exactly as the <a href="/blog/gdl/overview/">blueprint</a> prescribes.
</div>

## The template that follows

Given that constraint, a layer updates node $$i$$ in three steps.

**1 — Message.** For each neighbour, build a message from the pair:

<div class="formula-box">
\[
m_{ij}^{\ell} = \psi\bigl(h_i^{\ell},\, h_j^{\ell}\bigr), \qquad j \in \mathcal{N}_i ,
\]
</div>

with $$\psi$$ typically an MLP.

**2 — Aggregate.** Combine the messages into one vector:

<div class="formula-box">
\[
m_i^{\ell} = \bigoplus_{j \in \mathcal{N}_i} m_{ij}^{\ell} ,
\]
</div>

where $$\bigoplus$$ is **permutation-invariant** — sum, mean, or max.

**3 — Update.** Combine with the node's own state:

<div class="formula-box">
\[
h_i^{\ell+1} = \phi\bigl(h_i^{\ell},\, m_i^{\ell}\bigr).
\]
</div>

That is the whole framework, and it covers GCN, GIN, MPNN and GAT as special cases.

<div class="warning-box">
<strong>Step 2 is where the symmetry is enforced, and it is the only place.</strong> Steps 1 and 3 act on a node or an ordered pair and cannot see the labelling at all. The neighbourhood \(\mathcal{N}_i\) is a <em>set</em>, and the only functions of a set that ignore its enumeration order are the permutation-invariant ones. Choose an aggregator that depends on order and the whole construction stops being a graph model — it becomes a model of your indexing convention.
</div>

## Checking it, and checking that it can fail

Take the 4-node path $$1 - 2 - 3 - 4$$ with scalar features $$h = (1, 2, 3, 4)$$, and the simplest possible layer, $$h_i' = h_i + \sum_{j \in \mathcal{N}_i} h_j$$.

Run it directly: $$h' = (3,\ 6,\ 9,\ 7)$$.

Now relabel with $$\sigma$$ sending node $$1 \mapsto 3,\ 2 \mapsto 1,\ 3 \mapsto 4,\ 4 \mapsto 2$$, so $$H' = (2, 4, 1, 3)$$ and the adjacency is conjugated accordingly. Running the same layer on the relabelled graph gives $$(6,\ 7,\ 3,\ 9)$$ — which is exactly $$P_\sigma$$ applied to $$(3,6,9,7)$$. Equivariant.

The sum readout gives $$25$$ either way. Invariant.

Now break it deliberately. Replace the sum with *"add the neighbour of lowest index"* — a perfectly well-defined function that happens to consult the labelling:

<div class="formula-box">
\[
h_i' = h_i + h_{\min \mathcal{N}_i} .
\]
</div>

Sweeping all $$24$$ permutations of four nodes:

| Aggregator | Equivariant under |
|---|---|
| sum | **24 of 24** |
| lowest-indexed neighbour | 6 of 24 |

A witness: under $$\sigma = (0, 2, 3, 1)$$ the order-dependent rule gives $$(3, 7, 3, 7)$$ when applied to the relabelled graph, but $$(3, 7, 3, 5)$$ when applied first and relabelled after. Two different answers for the same graph.

<div class="insight-box">
<strong>Note that it survived 6 of the 24.</strong> A broken symmetry does not fail on every input — it fails on <em>most</em>. This is why testing equivariance on a single random permutation is not a test. If you are implementing a layer and want to know whether it is equivariant, sweep permutations or sample many; one draw can easily pass by luck.
</div>

## Which invariant aggregator

All three standard choices satisfy the constraint; they differ in what they can distinguish.

| Aggregator | Preserves | Blind to |
|---|---|---|
| **sum** | multiset size and content | nothing, for countable features |
| **mean** | average | how many neighbours there are |
| **max** | the extreme | multiplicity, and everything below the max |

Sum is the strictly most expressive of the three, which is the argument behind GIN — the [expressivity chapter](/blog/gnn/gin/) in Book II works through why. Mean cannot tell $$\{1, 3\}$$ from $$\{2, 2\}$$'s average, and max cannot tell $$\{1, 3\}$$ from $$\{3, 3\}$$. Whether the loss matters depends entirely on your task; a degree-blind aggregator is a liability when degree is informative and a convenience when it is noise.

## The step that makes Transformers fall out

The template says nothing about *where* $$\mathcal{N}_i$$ comes from. It is supplied by $$A$$, and $$A$$ is an input.

Set $$a_{ij} = 1$$ for every pair — a complete graph — and $$\mathcal{N}_i$$ becomes the entire input. Every node messages every node, the aggregation is over everything, and there is no sparsity left to exploit. That configuration has a name in a different literature: it is self-attention, and it is what the [next chapter](/blog/gdl/transformers-are-gnns/) works through line by line.

Two consequences worth stating now. First, a **set** is just a graph you have declined to put edges in, so permutation equivariance over sets and over graphs is the same requirement. Second, a model on a complete graph has no structural inductive bias to be wrong about — which is a liability when you know the structure and an asset when you do not.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Relabelling acts as \(P_\sigma \cdot \mathcal{G} = (P_\sigma A P_\sigma^{\top}, P_\sigma H)\) — the adjacency is conjugated because an edge is a pair.</li>
  <li>Layers must be equivariant, the graph-level readout invariant. These are different requirements and mixing them up is the standard error.</li>
  <li>The message/aggregate/update template is <em>forced</em> by permutation symmetry, not chosen. Step 2 is the only place the symmetry is enforced.</li>
  <li>Verified on a 4-node path: the sum aggregator is equivariant under all 24 permutations; an index-order aggregator survives only 6, so a single random permutation is not a valid test.</li>
  <li>Sum is more expressive than mean or max — mean discards degree, max discards multiplicity.</li>
  <li>The neighbourhood is an input, not a constant. Make every node adjacent to every other and message passing becomes self-attention.</li>
</ul>
</div>

## References

- Joshi, C. K. (2025). [Transformers are Graph Neural Networks](https://arxiv.org/abs/2506.22084). *arXiv:2506.22084*.
- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv:2104.13478*.
- Battaglia, P. W., Hamrick, J. B., Bapst, V., Sanchez-Gonzalez, A., Zambaldi, V., et al. (2018). [Relational Inductive Biases, Deep Learning, and Graph Networks](https://arxiv.org/abs/1806.01261). *arXiv:1806.01261*.
- Gilmer, J., Schoenholz, S. S., Riley, P. F., Vinyals, O., & Dahl, G. E. (2017). [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212). *ICML 2017*.
- Xu, K., Hu, W., Leskovec, J., & Jegelka, S. (2019). [How Powerful are Graph Neural Networks?](https://arxiv.org/abs/1810.00826) *ICLR 2019*.
