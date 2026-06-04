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
read_mins: 4
permalink: /blog/gnn/graphsage/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> GraphSAGE (SAmple and aggreGatE) learns to aggregate features from a <em>sampled</em> subset of neighbours. Because it learns the aggregation function (not per-node embeddings), it generalises to new nodes never seen during training — making it <em>inductive</em>.
</div>
{% include figure image_path="/images/blog/gnn/hamilton2017_graphsage.png" alt="GraphSAGE inductive learning" caption="GraphSAGE: inductive representation learning via neighbourhood sampling (Hamilton et al., 2017)" %}


## The Inductive vs. Transductive Distinction

**Transductive GNNs (GCN, GAT):** learn embeddings for the specific nodes in the training graph. If you add a new node tomorrow, you have to re-train — or at least run another forward pass with the full adjacency matrix.

**Inductive GNNs (GraphSAGE):** learn a *function* that maps a node's local neighbourhood to an embedding. Apply this function to any neighbourhood — seen or unseen — to get an embedding.

This matters enormously in practice:
- **Pinterest** uses GraphSAGE to embed new pins (items) in real-time as users upload them.
- **Social networks** onboard new users continuously — their profiles must be embedded immediately.

## The Algorithm

For each node v at each layer k:

```
1. SAMPLE: S_v = random sample of min(K, |N(v)|) neighbours
2. AGG:    agg_v = AGGREGATE({ h_u^(k-1) : u ∈ S_v })
3. UPDATE: h_v^k = σ( W^k · concat(h_v^(k-1), agg_v) )
4. NORM:   h_v^k = h_v^k / ||h_v^k||₂
```

The key novelty: concatenate the node's **own** previous representation with the aggregated neighbourhood representation, then apply a shared learned W. This ensures the node retains its own identity while incorporating neighbour information.

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
  <text x="210" y="102" text-anchor="middle" font-size="8" fill="#0d9488" font-weight="600">sample K=2</text>

  <!-- Sampled neighbourhood (right) -->
  <text x="370" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Sampled neighbourhood (K=2)</text>
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
<figcaption>Figure 1: GraphSAGE samples K=2 neighbours instead of using all 6. The sampled neighbours' features are aggregated, concatenated with v's own features, then transformed via W. Same W works for any node.</figcaption>
</figure>
</div>

## Aggregator Choices

GraphSAGE offers three built-in aggregators:

| Aggregator | Formula | Properties |
|---|---|---|
| **Mean** | mean({h_u : u ∈ S}) | Fast, size-invariant, similar to GCN |
| **Max-pooling** | max(σ(W·h_u)) per dim | Captures extreme features |
| **LSTM** | LSTM on random order of S | Highest capacity, non-symmetric |

The LSTM aggregator technically violates permutation invariance (LSTMs care about input order) — GraphSAGE handles this by randomly permuting neighbour order each training step, which empirically works well.

## Mini-Batch Training

Because GraphSAGE uses neighbourhood sampling, it supports **mini-batch training** on arbitrarily large graphs:
1. Sample a batch of target nodes.
2. Sample their K-hop neighbourhoods (expanding the computation graph).
3. Compute embeddings bottom-up: 0-hop → 1-hop → ... → target nodes.
4. Update W via backprop.

This is how Pinterest's PinSage scales to graphs with billions of nodes and edges.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>GraphSAGE is <strong>inductive</strong>: learns an aggregation function, not per-node embeddings — generalises to new nodes.</li>
  <li><strong>Neighbourhood sampling</strong> (K neighbours per node) enables mini-batch training on billion-scale graphs.</li>
  <li>Concatenates own representation + aggregated neighbourhood before the linear transform — preserving node identity.</li>
  <li>Used in production at Pinterest, LinkedIn, and other platforms for real-time item/user embedding.</li>
</ul>
</div>
