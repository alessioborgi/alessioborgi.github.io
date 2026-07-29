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
read_mins: 5
permalink: /blog/gnn/message-passing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Message Passing Neural Networks (Gilmer et al., 2017) provide a unified framework for all GNNs. Each layer runs three steps: <strong>MESSAGE</strong> (what each neighbour sends), <strong>AGGREGATE</strong> (collect all messages), <strong>UPDATE</strong> (compute new node representation). Choosing different functions for each step gives you different GNN architectures.
</div>
{% include figure image_path="/images/blog/gnn/gilmer2017_mpnn.png" alt="Message Passing Neural Network" caption="Message Passing Neural Network (MPNN) framework (Gilmer et al., 2017)" %}


## The Framework

The MPNN framework (Gilmer et al., 2017, ICML) defines GNN computation through a series of **message passing steps**. At each step $$t$$:

<div class="formula-box">
\[
m_v^{(t+1)} \;=\; \operatorname{AGGREGATE}\Big(\big\{\, \operatorname{MSG}\big(h_v^{(t)},\, h_u^{(t)},\, e_{uv}\big) \;:\; u \in \mathcal{N}(v) \,\big\}\Big)
\]
\[
h_v^{(t+1)} \;=\; \operatorname{UPDATE}\big(h_v^{(t)},\, m_v^{(t+1)}\big)
\]
</div>

Where:
- $$h_v^{(t)} \in \mathbb{R}^{d_t}$$ — the representation of node $$v$$ after $$t$$ message passing steps; $$h_v^{(0)}$$ is the input feature vector.
- $$\mathcal{N}(v)$$ — the set of neighbours of $$v$$ in the graph.
- $$e_{uv}$$ — the (optional) feature vector of the edge between $$u$$ and $$v$$.
- $$m_v^{(t+1)}$$ — the aggregated message arriving at $$v$$ at step $$t+1$$.
- $$\operatorname{MSG}$$ — the message function, computing what a neighbour sends.
- $$\operatorname{AGGREGATE}$$ — combines all incoming messages (must be permutation-invariant, since $$\{\cdot\}$$ is a *multiset*, not an ordered list).
- $$\operatorname{UPDATE}$$ — computes the new representation from the old one plus the aggregated message.

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
<figcaption>Figure 1: Node B receives messages from its three neighbours A, C, D. The messages are aggregated (e.g., summed or averaged), then combined with B's own representation in an UPDATE function to produce a new \(h_B\).</figcaption>
</figure>
</div>

## Concrete Worked Example: One Full MPNN Step

Let node $$B$$ have features $$h_B = [1, 0]$$, with three neighbours $$\mathcal{N}(B) = \{A, C, D\}$$ whose features are $$h_A = [0, 1]$$, $$h_C = [1, 1]$$ and $$h_D = [0, 0]$$.

**Step 1 — Compute messages** (using the identity message function, $$\operatorname{MSG}(h_v, h_u, e_{uv}) = h_u$$, i.e. just pass the neighbour's features along):

<div class="formula-box">
\[
m_{A \to B} = [0, 1], \qquad m_{C \to B} = [1, 1], \qquad m_{D \to B} = [0, 0]
\]
</div>

**Step 2 — Aggregate** (sum):

<div class="formula-box">
\[
m_B = [0,1] + [1,1] + [0,0] = [1, 2]
\]
</div>

**Step 3 — Update** (concatenate own features with the aggregate, apply a learned linear map $$W \in \mathbb{R}^{2 \times 4}$$ and a ReLU):

<div class="formula-box">
\[
h_B' = \operatorname{ReLU}\big(W \, [\, h_B \,\Vert\, m_B \,]\big) = \operatorname{ReLU}\big(W \, [1, 0, 1, 2]^{\top}\big)
\]
</div>

Here $$\Vert$$ denotes concatenation, so $$[\, h_B \Vert m_B \,] \in \mathbb{R}^4$$. After this one layer, $$B$$'s new 2-dimensional embedding encodes information from all three of its neighbours.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The three steps — MSG, AGGREGATE, UPDATE — are independent design choices. Changing any one of them gives a different GNN family. GCN sends \(W h_u\) and aggregates with a degree-normalised sum. GAT weights that sum by learned attention coefficients. GIN uses a plain sum followed by an MLP. The framework shows that these are all variations on the same theme.</div>

## Step 1: Message Function

The message function computes what each neighbour sends. The simplest choice: just send the neighbour's features.

<div class="formula-box">
\[
\begin{aligned}
\operatorname{MSG}(h_v, h_u, e_{uv}) &= h_u && \text{(pass the raw neighbour features)}\\
\operatorname{MSG}(h_v, h_u, e_{uv}) &= W h_u && \text{(GCN: linear transform first)}\\
\operatorname{MSG}(h_v, h_u, e_{uv}) &= \alpha_{vu} \, W h_u && \text{(GAT: scale by an attention weight)}
\end{aligned}
\]
</div>

Here $$W$$ is a learned weight matrix shared by all edges, and $$\alpha_{vu}$$ is the scalar attention weight GAT places on the edge $$u \to v$$. Including edge features $$e_{uv}$$ allows the model to distinguish bond types in a molecule or relationship types in a knowledge graph.

## Step 2: Aggregate Function

The aggregation combines all messages. It **must be permutation-invariant** (the order of neighbours shouldn't matter):

| Aggregator | Formula | Properties |
|---|---|---|
| Sum | $$\sum_{u \in \mathcal{N}(v)} m_{u \to v}$$ | Keeps the size of the neighbourhood |
| Mean | $$\frac{1}{\lvert \mathcal{N}(v) \rvert} \sum_{u \in \mathcal{N}(v)} m_{u \to v}$$ | Normalised, size-invariant |
| Max | $$\max_{u \in \mathcal{N}(v)} m_{u \to v}$$ (elementwise) | Captures the most extreme feature |
| Attention-weighted | $$\sum_{u \in \mathcal{N}(v)} \alpha_{vu} \, m_{u \to v}$$ | Adaptive, like GAT |

**GIN** (see [the GIN post](/blog/gnn/gin/)) shows that **sum** is the most expressive of these: it is an *injective* function of the multiset of messages when the message space is countable, so it distinguishes every neighbourhood that the 1-WL test distinguishes. Mean and max are not injective — mean discards the neighbourhood size, max discards multiplicities — so both lose structural information.

## Step 3: Update Function

Given the aggregated message $$m_v$$ and the old representation $$h_v$$, compute the new one:

<div class="formula-box">
\[
\begin{aligned}
h_v' &= \sigma\big(W \, [\, h_v \Vert m_v \,]\big) && \text{(single linear layer + non-linearity)}\\
h_v' &= \operatorname{GRU}\big(h_v,\, m_v\big) && \text{(recurrent update, as in the original MPNN)}\\
h_v' &= \operatorname{MLP}\big([\, h_v \Vert m_v \,]\big) && \text{(GraphSAGE-style)}
\end{aligned}
\]
</div>

where $$\sigma$$ is an elementwise non-linearity (usually ReLU) and $$[\,\cdot \Vert \cdot\,]$$ is concatenation.

## A Running Example: Molecule Property Prediction

Consider predicting if a molecule is toxic:
- Nodes = atoms (features: atom type, charge, is_aromatic)
- Edges = bonds (features: bond type: single/double/triple)
- After $$k$$ MPNN layers, each atom knows about its $$k$$-hop neighbourhood.
- A **readout** $$h_G = R(\{h_v^{(k)} : v \in V\})$$ aggregates all atom embeddings into a single graph embedding; $$R$$ must itself be permutation-invariant.
- An MLP predicts toxicity from $$h_G$$.

After 3 layers, an atom "knows" about the atoms 3 bonds away — capturing local chemical environments like functional groups.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>All GNNs are instances of MPNN: choose the \(\operatorname{MSG}\), \(\operatorname{AGGREGATE}\), and \(\operatorname{UPDATE}\) functions.</li>
  <li>\(\operatorname{AGGREGATE}\) must be <strong>permutation-invariant</strong>. Sum is the most expressive choice, because it is injective over multisets (GIN).</li>
  <li>After \(k\) layers, each node's embedding captures its <strong>\(k\)-hop neighbourhood</strong>.</li>
  <li>Graph-level predictions require a <strong>readout function</strong> that pools node embeddings into a single vector.</li>
</ul>
</div>

## References

- Hamilton, W. L. (2020). [Graph Representation Learning](https://www.cs.mcgill.ca/~wlh/grl_book/). *Synthesis Lectures on Artificial Intelligence and Machine Learning*.
- Gilmer, J., Schoenholz, S. S., Riley, P. F., Vinyals, O., & Dahl, G. E. (2017). [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212). *ICML 2017*.
