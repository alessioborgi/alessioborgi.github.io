---
layout: single
title: "Message Passing: The Universal GNN Framework"
categories: [gnn]
book: gnn
tags: [message-passing, mpnn, framework]
published: true
excerpt: "Every GNN — GCN, GAT, GraphSAGE, GIN — is a special case of message passing. Learn the three-step loop that defines them all: compute messages, aggregate, update."
author_profile: true
read_time: true
is_overview: false
subsection: architectures
icon: "📨"
read_mins: 4
permalink: /blog/gnn/message-passing/
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
.formula-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .8rem 1.1rem; font-family: 'Georgia', serif; font-size: .98rem; margin: 1rem 0; text-align: center; color: #1e3a5f; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Message Passing Neural Networks (Gilmer et al., 2017) provide a unified framework for all GNNs. Each layer runs three steps: <strong>MESSAGE</strong> (what each neighbour sends), <strong>AGGREGATE</strong> (collect all messages), <strong>UPDATE</strong> (compute new node representation). Choosing different functions for each step gives you different GNN architectures.
</div>
{% include figure image_path="/images/blog/gnn/gilmer2017_mpnn.png" alt="Message Passing Neural Network" caption="Message Passing Neural Network (MPNN) framework (Gilmer et al., 2017)" %}


## The Framework

The MPNN framework (Gilmer et al., 2017, NeurIPS) defines GNN computation through a series of **message passing steps**. At each step t:

<div class="formula-box">
m<sup>t+1</sup><sub>v</sub> = AGGREGATE({ MSG(h<sup>t</sup><sub>v</sub>, h<sup>t</sup><sub>u</sub>, e<sub>uv</sub>) : u ∈ N(v) })<br><br>
h<sup>t+1</sup><sub>v</sub> = UPDATE(h<sup>t</sup><sub>v</sub>, m<sup>t+1</sup><sub>v</sub>)
</div>

Where:
- `h^t_v` — representation of node v at step t.
- `N(v)` — neighbours of v.
- `e_{uv}` — optional edge feature between u and v.
- `MSG` — the message function.
- `AGGREGATE` — combines all messages (must be permutation-invariant).
- `UPDATE` — computes new representation from old + aggregated message.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="amp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
    <marker id="amp2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#0d9488"/></marker>
  </defs>
  <!-- Central node B -->
  <circle cx="240" cy="140" r="30" fill="#ccfbf1" stroke="#0d9488" stroke-width="3"/>
  <text x="240" y="136" text-anchor="middle" font-size="14" fill="#134e4a" font-weight="700">B</text>
  <text x="240" y="152" text-anchor="middle" font-size="9"  fill="#134e4a">h_B</text>

  <!-- Neighbour A (top-left) -->
  <circle cx="90"  cy="60"  r="24" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="90"  y="56"  text-anchor="middle" font-size="13" fill="#1e3a5f" font-weight="700">A</text>
  <text x="90"  y="70"  text-anchor="middle" font-size="8"  fill="#1e3a5f">h_A</text>
  <!-- Message arrow from A to B -->
  <line x1="113" y1="76" x2="208" y2="123" stroke="#3b82f6" stroke-width="2" marker-end="url(#amp)"/>
  <rect x="128" y="74" width="66" height="20" rx="4" fill="#eff6ff" stroke="#93c5fd"/>
  <text x="161" y="88" text-anchor="middle" font-size="8" fill="#1e3a5f" font-weight="600">MSG(h_A, h_B)</text>

  <!-- Neighbour C (bottom-left) -->
  <circle cx="90"  cy="220" r="24" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="90"  y="216" text-anchor="middle" font-size="13" fill="#4c1d95" font-weight="700">C</text>
  <text x="90"  y="230" text-anchor="middle" font-size="8"  fill="#4c1d95">h_C</text>
  <!-- Message from C to B -->
  <line x1="113" y1="205" x2="208" y2="157" stroke="#7c3aed" stroke-width="2" marker-end="url(#amp)"/>
  <rect x="128" y="180" width="66" height="20" rx="4" fill="#f5f3ff" stroke="#c4b5fd"/>
  <text x="161" y="194" text-anchor="middle" font-size="8" fill="#4c1d95" font-weight="600">MSG(h_C, h_B)</text>

  <!-- Neighbour D (right) -->
  <circle cx="400" cy="140" r="24" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
  <text x="400" y="136" text-anchor="middle" font-size="13" fill="#78350f" font-weight="700">D</text>
  <text x="400" y="150" text-anchor="middle" font-size="8"  fill="#78350f">h_D</text>
  <!-- Message from D to B -->
  <line x1="375" y1="140" x2="273" y2="140" stroke="#d97706" stroke-width="2" marker-end="url(#amp)"/>
  <rect x="300" y="124" width="66" height="20" rx="4" fill="#fffbeb" stroke="#fcd34d"/>
  <text x="333" y="138" text-anchor="middle" font-size="8" fill="#78350f" font-weight="600">MSG(h_D, h_B)</text>

  <!-- AGGREGATE box (below B) -->
  <rect x="180" y="184" width="120" height="28" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="240" y="201" text-anchor="middle" font-size="10" fill="#78350f" font-weight="700">② AGGREGATE</text>
  <line x1="240" y1="170" x2="240" y2="182" stroke="#6b7280" stroke-width="1.5" marker-end="url(#amp)"/>

  <!-- UPDATE box -->
  <rect x="180" y="224" width="120" height="28" rx="6" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="240" y="241" text-anchor="middle" font-size="10" fill="#065f46" font-weight="700">③ UPDATE</text>
  <line x1="240" y1="212" x2="240" y2="222" stroke="#6b7280" stroke-width="1.5" marker-end="url(#amp)"/>

  <!-- New h_B -->
  <rect x="195" y="258" width="90" height="20" rx="5" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="240" y="272" text-anchor="middle" font-size="10" fill="#134e4a" font-weight="700">new h_B ✓</text>
  <line x1="240" y1="252" x2="240" y2="256" stroke="#6b7280" stroke-width="1.5" marker-end="url(#amp)"/>

  <!-- Step labels -->
  <text x="44" y="135" font-size="9" fill="#374151" font-weight="700">① Compute</text>
  <text x="44" y="147" font-size="9" fill="#374151" font-weight="700">messages</text>
</svg>
<figcaption>Figure 1: Node B receives messages from its three neighbours A, C, D. The messages are aggregated (e.g., summed or averaged), then combined with B's own representation in an UPDATE function to produce a new h_B.</figcaption>
</figure>
</div>

## Concrete Worked Example: One Full MPNN Step

Let node B have features h_B = [1, 0], with three neighbours:
- A: h_A = [0, 1]
- C: h_C = [1, 1]
- D: h_D = [0, 0]

**Step 1 — Compute messages** (using identity MSG, i.e. just pass neighbour features):
```
msg(A→B) = [0, 1]
msg(C→B) = [1, 1]
msg(D→B) = [0, 0]
```

**Step 2 — Aggregate** (sum):
```
agg_B = [0,1] + [1,1] + [0,0] = [1, 2]
```

**Step 3 — Update** (concatenate own features + aggregated, apply linear W):
```
input = concat(h_B, agg_B) = [1, 0, 1, 2]
h_B_new = ReLU( W · [1, 0, 1, 2] )   # W is 2×4 learned weight matrix
```

After this one layer, B's new 2-d embedding encodes information from all three of its neighbours.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The three steps — MSG, AGGREGATE, UPDATE — are independent design choices. Changing any one of them gives a different GNN family. GCN uses W·h_u as message and sum as aggregation. GAT weights the sum by learned attention. GIN uses sum + MLP. The framework shows that these are all variations on the same theme.</div>

## Step 1: Message Function

The message function computes what each neighbour sends. The simplest choice: just send the neighbour's features.

```python
MSG(h_v, h_u, e_uv) = h_u         # GCN: just pass neighbour features
MSG(h_v, h_u, e_uv) = W · h_u     # Linear transform first
MSG(h_v, h_u, e_uv) = α · W · h_u # GAT: scale by attention weight
```

Including edge features allows the model to distinguish bond types in a molecule or relationship types in a knowledge graph.

## Step 2: Aggregate Function

The aggregation combines all messages. It **must be permutation-invariant** (the order of neighbours shouldn't matter):

| Aggregator | Formula | Properties |
|---|---|---|
| Sum | Σ m_u | Captures size of neighbourhood |
| Mean | (1/|N|) Σ m_u | Normalised, size-invariant |
| Max | max_u m_u | Captures the most extreme feature |
| Attention-weighted | Σ α_u m_u | Adaptive, like GAT |

**GIN** (see separate post) proves that **sum** is the most powerful aggregator for distinguishing graph structures. Mean and max lose information.

## Step 3: Update Function

Given the aggregated message and the old representation, compute the new one:

```python
h_v^new = σ(W · concat(h_v, agg_message))  # GCN-style
h_v^new = GRU(h_v, agg_message)            # Recurrent update
h_v^new = MLP(concat(h_v, agg_message))    # GraphSAGE-style
```

## A Running Example: Molecule Property Prediction

Consider predicting if a molecule is toxic:
- Nodes = atoms (features: atom type, charge, is_aromatic)
- Edges = bonds (features: bond type: single/double/triple)
- After k MPNN layers, each atom knows about its k-hop neighbourhood.
- A **readout** aggregates all atom embeddings into a graph embedding.
- An MLP predicts toxicity from the graph embedding.

After 3 layers, an atom "knows" about the atoms 3 bonds away — capturing local chemical environments like functional groups.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>All GNNs are instances of MPNN: choose MSG, AGGREGATE, and UPDATE functions.</li>
  <li>AGGREGATE must be <strong>permutation-invariant</strong>. Sum is the most expressive choice (GIN).</li>
  <li>After k layers, each node's embedding captures its <strong>k-hop neighbourhood</strong>.</li>
  <li>Graph-level predictions require a <strong>readout function</strong> that pools node embeddings into a single vector.</li>
</ul>
</div>

## References

- Hamilton, W. L. (2020). [Graph Representation Learning](https://www.cs.mcgill.ca/~wlh/grl_book/). *Synthesis Lectures on Artificial Intelligence and Machine Learning*.
- Gilmer, J., Schoenholz, S. S., Riley, P. F., Vinyals, O., & Dahl, G. E. (2017). [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212). *ICML 2017*.
