---
layout: single
title: "Temporal Graph Networks: Learning from Events"
categories: [gnn]
book: gnn
subsection: dynamic
tags: [TGN, temporal, continuous-time, memory, link-prediction]
published: true
excerpt: "TGN (Temporal Graph Network) is the leading framework for continuous-time dynamic graphs. It maintains a per-node memory that is updated upon each interaction, enabling efficient inductive link prediction on event streams."
author_profile: true
read_time: true
is_overview: false
icon: "⚡"
read_mins: 8
permalink: /blog/gnn/temporal-graph-networks/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> TGN (Rossi et al., 2020) processes a continuous stream of interaction events. Each node maintains a memory vector \(s_v\) that is updated by a memory updater (GRU-based) when \(v\) participates in an event. When node embeddings are needed, a temporal graph attention module aggregates from recent neighbours using time-aware features. This combines persistent memory with structural context — while only ever reading events that have already happened.
</div>
{% include figure image_path="/images/blog/gnn/rossi2020_tgn.png" alt="TGN memory module" caption="Temporal Graph Network (TGN): memory module and interaction processing (Rossi et al., 2020)" %}


## TGN's Design Philosophy

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Think of each node as a person carrying a wallet-sized summary card (the memory \(s_v\)). When they meet someone new, they update their card — but they do not replay their entire life history. When you ask them for a full introduction, they pull out their card and also look around at who is nearby (temporal graph attention). TGN's separation of memory from embedding is exactly this: cheap persistent state plus rich on-demand context.</div>

TGN separates two concerns:
1. **Memory:** long-term history of a node's interactions, stored as a fixed-size vector $$s_v$$
2. **Embedding:** current structural context, computed by aggregating recent neighbours

This separation allows efficient online updates (only memory changes on each event) while preserving rich structural context when embeddings are needed.

## The TGN Components

### 1. Memory Module

Each node $$v$$ has a memory state $$s_v \in \mathbb{R}^{d_s}$$. A node that has never been seen starts from $$s_v = 0$$.

When an interaction $$(u, v, t, e_{uv})$$ occurs — node $$u$$ interacting with node $$v$$ at time $$t$$ with edge features $$e_{uv}$$ — a **raw message** is computed for each of the two endpoints:

<div class="formula-box">
\[
\begin{aligned}
m_u(t) &= \mathrm{msg}_{\text{s}}\big( s_u(t^-),\, s_v(t^-),\, \Delta t_u,\, e_{uv} \big) \\[2pt]
m_v(t) &= \mathrm{msg}_{\text{d}}\big( s_v(t^-),\, s_u(t^-),\, \Delta t_v,\, e_{uv} \big)
\end{aligned}
\]
</div>

Here $$s_u(t^-)$$ is $$u$$'s memory just *before* the event, and $$\Delta t_u = t - t_u^-$$ is the time elapsed since $$u$$'s last memory update. Source and destination get separate message functions $$\mathrm{msg}_{\text{s}}$$ and $$\mathrm{msg}_{\text{d}}$$, because an interaction is not symmetric (a user clicking an item is not the same event as an item being clicked by a user).

**Memory update** (a GRU cell, with the message as input and the old memory as hidden state):

<div class="formula-box">
\[
s_u(t) = \mathrm{mem}\big( m_u(t),\, s_u(t^-) \big), \qquad
s_v(t) = \mathrm{mem}\big( m_v(t),\, s_v(t^-) \big)
\]
</div>

The GRU's gating mechanism naturally handles the trade-off between old memory and new information.

If several events touching $$u$$ arrive in the same batch, TGN first collapses their raw messages into one with an aggregator (the paper's default is simply "keep the most recent"), then applies a single memory update.

### 2. Temporal Graph Attention (Embedding Module)

When we need node $$u$$'s embedding at time $$t$$ (for inference), we aggregate from temporal neighbours:

**Time encoding:** encode elapsed time as a feature using learnable frequencies — the Bochner-theorem construction of TGAT:

<div class="formula-box">
\[
\varphi(\Delta t) = \big[\, \cos(\omega_1 \Delta t + b_1),\ \dots,\ \cos(\omega_d \Delta t + b_d) \,\big]
\]
</div>

This gives the model a sense of recency — events further in the past have lower encoded similarity to the current time.

**Temporal attention over neighbours:**

<div class="formula-box">
\[
h_u(t) = \mathrm{AGG}\Big( s_u(t),\ \big\{ \big( s_w(t),\, e_{uw},\, \varphi(t - t_{uw}) \big) \ :\ (w, t_{uw}) \in \mathcal{N}_k(u, t) \big\} \Big)
\]
</div>

where $$\mathcal{N}_k(u, t) = \{(w, t_{uw}) : t_{uw} < t\}$$ restricted to the $$k$$ most recent such neighbours. The strict inequality is the point: the neighbourhood is defined by a *temporal* cut, so an embedding at time $$t$$ can never see an edge that has not happened yet.

<div class="insight-box">
<strong>Why time encoding matters:</strong> An interaction 1 second ago should have more influence than one from 1 year ago. Time encoding \(\varphi(\Delta t)\) provides this recency signal explicitly. The model learns to weight recent interactions more heavily for tasks where recency is informative (e.g. click prediction), or weight them equally for tasks where history matters uniformly.
</div>

### 3. Link Prediction Decoder

Given node embeddings $$h_u(t)$$ and $$h_v(t)$$, compute interaction probability:

<div class="formula-box">
\[
p(u, v, t) = \sigma\Big( \mathrm{MLP}\big( [\, h_u(t) \,\Vert\, h_v(t) \,] \big) \Big)
\]
</div>

Trained with binary cross-entropy + negative sampling (sample random non-interacting pairs as negatives).

## Worked Example: One TGN Memory Update

Suppose user $$u$$ has memory $$s_u = [0.5, -0.2, 0.8]$$ (so $$d_s = 3$$). At time $$t = 100$$, $$u$$ interacts with item $$v$$ (memory $$s_v = [0.1, 0.9, 0.3]$$) via edge features $$e_{uv} = [1]$$ (e.g. a "click"). The time since $$u$$'s last memory update is $$\Delta t_u = 100 - 85 = 15$$.

**Step 1: Raw message for u**
```
m_u = MSG_s(s_u, s_v, delta_t, e_uv)
    = Linear([s_u || s_v || delta_t || e_uv])
    = Linear([0.5, -0.2, 0.8,  0.1, 0.9, 0.3,  15,  1])
    → suppose m_u = [0.3, 0.7, -0.1]   (after linear + activation)
```

**Step 2: GRU memory update**
```
s_u(t=100) = GRU(m_u, s_u(t^-))
           = GRU([0.3, 0.7, -0.1],  [0.5, -0.2, 0.8])
           → suppose s_u = [0.45, 0.6, 0.3]   (gate blends old + new)
```

The GRU's forget gate suppresses the old memory dimension 3 (0.8 → 0.3) because the new message strongly activates it differently. Dimension 2 rises (−0.2 → 0.6) reflecting the new interaction. This is all differentiable — gradients flow back through the GRU to learn what to remember.

<style>
@keyframes mem-update {
  0%, 40% { fill: #6366f1; }
  50%, 90% { fill: #f97316; }
  100% { fill: #6366f1; }
}
@keyframes arrow-flow {
  0% { stroke-dashoffset: 30; opacity: 0.4; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 460 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;">
  <!-- Node u memory before -->
  <rect x="15" y="50" width="70" height="40" rx="6" fill="#6366f1" opacity="0.85"/>
  <text x="50" y="68" font-size="10" fill="white" text-anchor="middle" font-weight="bold">s_u(t⁻)</text>
  <text x="50" y="82" font-size="9" fill="#e0e7ff" text-anchor="middle">[0.5,-0.2,0.8]</text>
  <text x="50" y="105" font-size="9" fill="#64748b" text-anchor="middle">Memory before</text>

  <!-- Event arrow -->
  <line x1="85" y1="70" x2="135" y2="70" stroke="#f97316" stroke-width="2" stroke-dasharray="6,3" style="animation:arrow-flow 1.2s linear infinite;"/>
  <polygon points="133,65 143,70 133,75" fill="#f97316"/>
  <text x="110" y="62" font-size="9" fill="#f97316" text-anchor="middle">event</text>
  <text x="110" y="85" font-size="8" fill="#94a3b8" text-anchor="middle">(u,v,t,e_uv)</text>

  <!-- MSG box -->
  <rect x="145" y="42" width="60" height="56" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="175" y="64" font-size="10" fill="#92400e" text-anchor="middle" font-weight="bold">MSG</text>
  <text x="175" y="78" font-size="8" fill="#92400e" text-anchor="middle">Linear+act</text>
  <text x="175" y="91" font-size="8" fill="#92400e" text-anchor="middle">m_u = [0.3,</text>
  <text x="175" y="101" font-size="8" fill="#92400e" text-anchor="middle">0.7, -0.1]</text>

  <!-- GRU arrow -->
  <line x1="205" y1="70" x2="250" y2="70" stroke="#10b981" stroke-width="2" stroke-dasharray="6,3" style="animation:arrow-flow 1.2s linear 0.4s infinite;"/>
  <polygon points="248,65 258,70 248,75" fill="#10b981"/>

  <!-- GRU box -->
  <rect x="260" y="42" width="60" height="56" rx="6" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
  <text x="290" y="66" font-size="10" fill="#065f46" text-anchor="middle" font-weight="bold">GRU</text>
  <text x="290" y="80" font-size="8" fill="#065f46" text-anchor="middle">forget / update</text>
  <text x="290" y="94" font-size="8" fill="#065f46" text-anchor="middle">gates</text>

  <!-- Output arrow -->
  <line x1="320" y1="70" x2="365" y2="70" stroke="#6366f1" stroke-width="2" stroke-dasharray="6,3" style="animation:arrow-flow 1.2s linear 0.8s infinite;"/>
  <polygon points="363,65 373,70 363,75" fill="#6366f1"/>

  <!-- Node u memory after -->
  <rect x="375" y="50" width="70" height="40" rx="6" style="animation:mem-update 3s ease-in-out infinite;"/>
  <text x="410" y="68" font-size="10" fill="white" text-anchor="middle" font-weight="bold">s_u(t)</text>
  <text x="410" y="82" font-size="9" fill="#e0e7ff" text-anchor="middle">[0.45,0.6,0.3]</text>
  <text x="410" y="105" font-size="9" fill="#64748b" text-anchor="middle">Memory after</text>
</svg>
<figcaption>TGN memory update cycle: the raw message MSG fuses the interaction context, then the GRU gates selectively blend the new message with the old memory state. The pulsing output node illustrates the memory transitioning from before (indigo) to after (orange) the event.</figcaption>
</figure></div>

## The Full TGN Loop

The ordering matters more than it looks. The memory used to predict an event must be the memory *before* that event:

```
For each batch of events, in chronological order:
  1. Flush the raw-message store: update memories using the
     messages generated by EARLIER batches only
  2. Compute temporal embeddings h_u(t), h_v(t) from the
     updated memories + neighbours with timestamp < t
  3. Predict p(u, v, t) and compute the loss
  4. Compute the raw messages for THIS batch's events and
     push them to the store — to be consumed at step 1
     of the next batch
```

Steps 1 and 4 are what keep the model causal. If you updated the memory with an event and then predicted that same event, the target would already be encoded in the input and the reported accuracy would be meaningless.

## Variants and Ablations

Several prior architectures fall out of the TGN template as particular choices of memory updater, message function and embedding module:

| Architecture | Memory | Embedding module |
|-------------|--------|-----------|
| JODIE | RNN | Time projection of the memory |
| DyRep | RNN | Identity (embedding = memory); attention enters via the message function |
| TGAT | None | Temporal graph attention |
| TGN-attn | GRU | Temporal graph attention |

Note that DyRep *does* carry a memory — what distinguishes it from TGN-attn is that its embedding module is the identity, so the memory is used directly as the node representation, and the graph attention is folded into how its messages are built.

In the paper's ablations, TGN-attn is the strongest of these variants on the Wikipedia and Reddit link-prediction benchmarks, and it is also the most expensive: memory plus attention is strictly more computation than either alone.

## Inductive Capability

TGN naturally handles new nodes: when a previously unseen node $$v$$ appears, its memory is initialised to $$0$$. After its first few interactions, the memory accumulates history. This is the key advantage over transductive methods that require all nodes at training time. The caveat is that a node's first prediction is made from an empty memory, so inductive performance leans on the embedding module and edge features rather than the memory.

## Batch Processing and Training

Online, one-event-at-a-time processing is not directly compatible with batched GPU training, and there is a subtler problem: if the memory is updated with an interaction and the loss is then computed on that same interaction, the memory-related modules receive no useful gradient at all — the answer is already in the input.

TGN's fix is the raw-message store described above. Within a batch, memories are brought up to date using messages *from previous batches*, the loss is computed, and only then are this batch's messages stored. The memory updater therefore sits on the path from an earlier batch's events to the current batch's prediction, and does receive gradient. Backpropagation is truncated at the batch boundary rather than run over the entire event history.

A consequence worth remembering: batch size is not a free hyperparameter in TGN. Larger batches mean staler memory at prediction time, which changes the model, not just the optimisation.

## Summary

| Component | Purpose |
|-----------|---------|
| Memory $$s_v$$ | Long-term history (fixed-size, GRU-updated) |
| Raw messages | Per-event information for memory update |
| Raw-message store | Defers updates by one batch — keeps the model causal and trainable |
| Time encoding | Recency signal for temporal attention |
| Temporal attention | Structural context from neighbours strictly before $$t$$ |
| Link decoder | Interaction probability from embeddings |

TGN is the standard baseline for continuous-time dynamic graph link prediction. Its modular design (memory + embedding + decoder) allows ablation studies and component swapping — making it a useful research framework as well as a practical model.

## References

- Rossi, E., Chamberlain, B., Frasca, F., Eynard, D., Monti, F., & Bronstein, M. (2020). [Temporal Graph Networks for Deep Learning on Dynamic Graphs](https://arxiv.org/abs/2006.10637). *ICML GRL+ Workshop 2020* (TGN: memory modules + temporal graph attention for continuous-time dynamic graphs).
- Xu, D., Ruan, C., Körpeoglu, E., Kumar, S., & Achan, K. (2020). [Inductive Representation Learning on Temporal Graphs](https://arxiv.org/abs/2002.07962). *ICLR 2020* (TGAT: temporal attention without memory; time-encoding via Bochner's theorem).
- Kumar, S., Zhang, X., & Leskovec, J. (2019). [Predicting Dynamic Embedding Trajectory in Temporal Interaction Networks](https://arxiv.org/abs/1908.01207). *KDD 2019* (JODIE: bipartite temporal interaction model using RNN projections).
