---
layout: single
title: "GraphSAGE: Inductive Learning on Large Graphs"
categories: [gnn]
book: gnn
tags: [graphsage, inductive, sampling]
published: true
excerpt: "GCN and GAT learn embeddings for fixed graphs — add a new node and you're stuck. GraphSAGE (Hamilton et al., 2017) learns an aggregation function instead, so it can generate embeddings for entirely new nodes at inference time."
author_profile: true
read_time: true
is_overview: false
subsection: architectures
icon: "🌐"
read_mins: 5
permalink: /blog/gnn/graphsage/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> GraphSAGE (SAmple and aggreGatE) learns to aggregate features from a <em>sampled</em> subset of neighbours. Because it learns the aggregation function (not per-node embeddings), it generalises to new nodes never seen during training — making it <em>inductive</em>.
</div>
{% include figure image_path="/images/blog/gnn/hamilton2017_graphsage.png" alt="GraphSAGE inductive learning" caption="GraphSAGE: inductive representation learning via neighbourhood sampling (Hamilton et al., 2017)" %}


## The Inductive vs. Transductive Distinction

**Transductive GNNs (GCN, GAT):** as originally formulated, these operate on one fixed graph: the layer is a product with a normalised adjacency $\hat{A}$ built from the whole training graph. Add a new node tomorrow and $\hat{A}$ changes, so at minimum you must rebuild it and re-run a full-graph forward pass.

**Inductive GNNs (GraphSAGE):** learn a *function* that maps a node's local neighbourhood to an embedding. Apply this function to any neighbourhood — seen or unseen — to get an embedding.

This matters enormously in practice:
- **Pinterest** uses GraphSAGE to embed new pins (items) in real-time as users upload them.
- **Social networks** onboard new users continuously — their profiles must be embedded immediately.

## The Algorithm

For each node $v$ at each layer $k = 1, \dots, K$:

<div class="formula-box">
\[
\begin{aligned}
\textbf{1. Sample:}\quad & \mathcal{S}_v \sim \operatorname{Uniform}\big(\mathcal{N}(v)\big), \quad \lvert \mathcal{S}_v \rvert = S \\[2pt]
\textbf{2. Aggregate:}\quad & a_v^{(k)} = \operatorname{AGGREGATE}_k\big(\{\, h_u^{(k-1)} : u \in \mathcal{S}_v \,\}\big) \\[2pt]
\textbf{3. Update:}\quad & h_v^{(k)} = \sigma\Big( W^{(k)} \big[\, h_v^{(k-1)} \,\Vert\, a_v^{(k)} \,\big] \Big) \\[2pt]
\textbf{4. Normalise:}\quad & h_v^{(k)} \leftarrow \frac{h_v^{(k)}}{\lVert h_v^{(k)} \rVert_2}
\end{aligned}
\]
</div>

Where:
- $K$ — the number of layers, equivalently the number of hops each node sees.
- $S$ — the **fixed** neighbourhood sample size, a hyperparameter. Note that $$\mathcal{S}_v$$ always has exactly $S$ elements: when $\lvert \mathcal{N}(v) \rvert < S$ the sample is drawn with replacement, which is what keeps the per-node cost constant.
- $\Vert$ — concatenation, so $W^{(k)}$ has twice as many input columns as $h$ has dimensions.
- $\lVert \cdot \rVert_2$ — the Euclidean norm; step 4 projects every embedding onto the unit sphere.

The key novelty is step 3: concatenate the node's **own** previous representation with the aggregated neighbourhood representation, then apply a shared learned $W^{(k)}$. This ensures the node retains its own identity while incorporating neighbour information — and because $W^{(k)}$ does not depend on which node it is applied to, the same layer works for a node that was never seen during training.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 250" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="ags" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Full neighbourhood (left) -->
  <text x="90" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Full neighbourhood of v</text>
  <!-- Central node -->
  <circle cx="90" cy="110" r="22" fill="#ccfbf1" stroke="#0d9488" stroke-width="3"/>
  <text x="90" y="115" text-anchor="middle" font-size="13" fill="#134e4a" font-weight="700">v</text>
  <!-- 6 neighbours -->
  <circle cx="30"  cy="50"  r="14" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="30"  y="55"  text-anchor="middle" font-size="10" fill="#1e3a5f">n1</text>
  <circle cx="90"  cy="30"  r="14" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="90"  y="35"  text-anchor="middle" font-size="10" fill="#1e3a5f">n2</text>
  <circle cx="150" cy="50"  r="14" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="150" y="55"  text-anchor="middle" font-size="10" fill="#1e3a5f">n3</text>
  <circle cx="165" cy="120" r="14" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="165" y="125" text-anchor="middle" font-size="10" fill="#1e3a5f">n4</text>
  <circle cx="30"  cy="170" r="14" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="30"  y="175" text-anchor="middle" font-size="10" fill="#1e3a5f">n5</text>
  <circle cx="90"  cy="185" r="14" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="90"  y="190" text-anchor="middle" font-size="10" fill="#1e3a5f">n6</text>
  <!-- All edges to v -->
  <line x1="44"  y1="62"  x2="71"  y2="94"  stroke="#e2e8f0" stroke-width="1.5"/>
  <line x1="90"  y1="44"  x2="90"  y2="88"  stroke="#e2e8f0" stroke-width="1.5"/>
  <line x1="137" y1="62"  x2="109" y2="94"  stroke="#e2e8f0" stroke-width="1.5"/>
  <line x1="151" y1="120" x2="113" y2="118" stroke="#e2e8f0" stroke-width="1.5"/>
  <line x1="44"  y1="162" x2="69"  y2="130" stroke="#e2e8f0" stroke-width="1.5"/>
  <line x1="90"  y1="171" x2="90"  y2="133" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="90" y="218" text-anchor="middle" font-size="8" fill="#dc2626">Too expensive to use all 6!</text>

  <!-- Arrow -->
  <line x1="195" y1="110" x2="225" y2="110" stroke="#6b7280" stroke-width="1.5" marker-end="url(#ags)"/>
  <text x="210" y="102" text-anchor="middle" font-size="8" fill="#0d9488" font-weight="600">sample S=2</text>

  <!-- Sampled neighbourhood (right) -->
  <text x="370" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Sampled neighbourhood (S=2)</text>
  <!-- Central node -->
  <circle cx="370" cy="110" r="22" fill="#ccfbf1" stroke="#0d9488" stroke-width="3"/>
  <text x="370" y="115" text-anchor="middle" font-size="13" fill="#134e4a" font-weight="700">v</text>
  <!-- 2 sampled neighbours -->
  <circle cx="290" cy="70"  r="18" fill="#d1fae5" stroke="#059669" stroke-width="2.5"/>
  <text x="290" y="66"  text-anchor="middle" font-size="10" fill="#065f46" font-weight="700">n2</text>
  <text x="290" y="80"  text-anchor="middle" font-size="8"  fill="#065f46">sampled ✓</text>
  <circle cx="450" cy="70"  r="18" fill="#d1fae5" stroke="#059669" stroke-width="2.5"/>
  <text x="450" y="66"  text-anchor="middle" font-size="10" fill="#065f46" font-weight="700">n5</text>
  <text x="450" y="80"  text-anchor="middle" font-size="8"  fill="#065f46">sampled ✓</text>
  <!-- Edges to sampled -->
  <line x1="308" y1="83" x2="349" y2="99" stroke="#059669" stroke-width="2.5" marker-end="url(#ags)"/>
  <line x1="432" y1="83" x2="391" y2="99" stroke="#059669" stroke-width="2.5" marker-end="url(#ags)"/>
  <!-- Grayed out nodes (not sampled) -->
  <circle cx="300" cy="155" r="14" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="300" y="160" text-anchor="middle" font-size="9" fill="#9ca3af">n1</text>
  <circle cx="440" cy="155" r="14" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="440" y="160" text-anchor="middle" font-size="9" fill="#9ca3af">n6</text>
  <text x="370" y="218" text-anchor="middle" font-size="8" fill="#059669">Only 2 neighbours needed per node!</text>

  <!-- Aggregation note -->
  <rect x="235" y="165" width="270" height="24" rx="5" fill="#fef3c7" stroke="#d97706"/>
  <text x="370" y="181" text-anchor="middle" font-size="9" fill="#78350f" font-weight="600">AGGREGATE({h_n2, h_n5}) → concat with h_v → W → new h_v</text>
</svg>
<figcaption>Figure 1: GraphSAGE samples \(S = 2\) neighbours instead of using all 6. The sampled neighbours' features are aggregated, concatenated with v's own features, then transformed via \(W^{(k)}\) — the same \(W^{(k)}\) for every node, which is what makes the model inductive.</figcaption>
</figure>
</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Why Inductive Learning Matters:</strong> GCN and GAT compute embeddings tied to a specific adjacency matrix. Their weight matrices learn "which position in this fixed graph matters." GraphSAGE instead learns "what kind of neighbourhood looks like this?" — a transferable pattern. This is the difference between memorising a map vs. learning to navigate any city.</div>

## Concrete Example: Embedding a New Node at Inference Time

Suppose we trained GraphSAGE on a product graph. A new product $P$ is uploaded tonight with features $h_P = [0.8,\, 0.3,\, 0.1]$ and two existing, similar products as neighbours: $h_{n_1} = [0.7,\, 0.4,\, 0.2]$ and $h_{n_2} = [0.6,\, 0.5,\, 0.1]$.

**Without retraining**, with one layer and sample size $S = 2$:

<div class="formula-box">
\[
\begin{aligned}
\textbf{1. Sample:}\quad & \mathcal{S}_P = \{n_1, n_2\} \\[2pt]
\textbf{2. Aggregate (mean):}\quad & a_P = \tfrac{1}{2}\big([0.7, 0.4, 0.2] + [0.6, 0.5, 0.1]\big) = [0.65,\, 0.45,\, 0.15] \\[2pt]
\textbf{3. Concatenate + transform:}\quad & h_P' = \sigma\big(W \, [0.8,\, 0.3,\, 0.1,\, 0.65,\, 0.45,\, 0.15]^{\top}\big) \\[2pt]
\textbf{4. Normalise:}\quad & h_P' \leftarrow h_P' / \lVert h_P' \rVert_2
\end{aligned}
\]
</div>

The resulting embedding places $P$ in the correct region of the embedding space relative to existing products — ready for recommendation — all without touching the training set.

## Aggregator Choices

GraphSAGE proposes three aggregators (all operating on the sampled set $$\mathcal{S}_v$$):

| Aggregator | Formula | Properties |
|---|---|---|
| **Mean** | $$\frac{1}{\lvert \mathcal{S}_v \rvert}\sum_{u \in \mathcal{S}_v} h_u$$ | Fast, size-invariant, closest to GCN |
| **Max-pooling** | $$\max_{u \in \mathcal{S}_v} \sigma(W_{\text{pool}} h_u + b)$$, elementwise | Captures extreme features |
| **LSTM** | LSTM applied to a random ordering of $$\mathcal{S}_v$$ | Highest capacity, not permutation-invariant |

The LSTM aggregator violates permutation invariance (an LSTM cares about input order) — GraphSAGE handles this by applying it to a *random* permutation of the neighbours, which empirically works well but gives no invariance guarantee.

Because mean and max are not injective over multisets, none of these aggregators reaches the 1-WL expressiveness bound; the [GIN post](/blog/gnn/gin/) explains why sum is required for that.

## Mini-Batch Training

Because GraphSAGE uses neighbourhood sampling, it supports **mini-batch training** on arbitrarily large graphs:
1. Sample a batch of target nodes.
2. Sample their $K$-hop neighbourhoods, expanding the computation graph outwards — with a fixed sample size $S$ per hop, this costs $O(S^K)$ nodes per target instead of the whole graph.
3. Compute embeddings bottom-up: 0-hop → 1-hop → … → target nodes.
4. Update the $W^{(k)}$ via backprop.

Pinterest's PinSage builds on exactly this idea to scale to a graph with billions of nodes and edges.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>GraphSAGE is <strong>inductive</strong>: it learns an aggregation function \(\operatorname{AGGREGATE}_k\) and shared weights \(W^{(k)}\), not per-node embeddings — so it generalises to nodes never seen in training.</li>
  <li><strong>Neighbourhood sampling</strong> of a fixed \(S\) neighbours per node bounds the cost of a \(K\)-layer forward pass at \(O(S^K)\) nodes, which is what enables mini-batch training on billion-scale graphs.</li>
  <li>Concatenates own representation with the aggregated neighbourhood before the linear transform — preserving node identity — then L2-normalises.</li>
  <li>The same idea underpins production systems such as Pinterest's PinSage for real-time item embedding.</li>
</ul>
</div>
