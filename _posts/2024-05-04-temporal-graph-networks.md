---
layout: single
title: "Temporal Graph Networks: Learning from Events"
date: 2024-05-04
categories: [gnn]
book: gnn
subsection: dynamic
tags: [TGN, temporal, continuous-time, memory, link-prediction]
excerpt: "TGN (Temporal Graph Network) is the leading framework for continuous-time dynamic graphs. It maintains a per-node memory that is updated upon each interaction, enabling efficient inductive link prediction on event streams."
author_profile: true
read_time: true
is_overview: false
icon: "⚡"
read_mins: 5
permalink: /blog/gnn/temporal-graph-networks/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> TGN (Rossi et al., 2020) processes a continuous stream of interaction events. Each node maintains a memory vector s_v that is updated by a memory updater (GRU-based) when v participates in an event. When node embeddings are needed, a temporal graph attention module aggregates from recent neighbours using time-aware features. This combines persistent memory with structural context.
</div>
{% include figure image_path="/images/blog/gnn/rossi2020_tgn.png" alt="TGN memory module" caption="Temporal Graph Network (TGN): memory module and interaction processing (Rossi et al., 2020)" %}


## TGN's Design Philosophy

TGN separates two concerns:
1. **Memory:** long-term history of a node's interactions, stored as a fixed-size vector s_v
2. **Embedding:** current structural context, computed by aggregating recent neighbours

This separation allows efficient online updates (only memory changes on each event) while preserving rich structural context when embeddings are needed.

## The TGN Components

### 1. Memory Module

Each node v has a memory state s_v ∈ ℝ^{d_s}. Initially s_v = 0.

When an interaction (u, v, t, e_{uv}) occurs:
- Node u interacts with node v at time t with edge features e_{uv}

**Raw messages** are computed for both interacting nodes:

<div class="math-box">
m_u(t) = MSG_s( s_u(t^-), s_v(t^-), Δt, e_{uv} )
m_v(t) = MSG_d( s_v(t^-), s_u(t^-), Δt, e_{uv} )
</div>

Where s_u(t^-) is u's memory just before the event, and Δt = t - t_last_u is the time since u's last interaction.

**Memory update** (GRU):

<div class="math-box">
s_u(t) = MEM( m_u(t), s_u(t^-) )
s_v(t) = MEM( m_v(t), s_v(t^-) )
</div>

The GRU's gating mechanism naturally handles the trade-off between old memory and new information.

### 2. Temporal Graph Attention (Embedding Module)

When we need node u's embedding at time t (for inference), we aggregate from temporal neighbours:

**Time encoding:** encode elapsed time as a feature using random Fourier features or learnable frequencies:

<div class="math-box">
φ(Δt) = [cos(ω₁ Δt + b₁), ..., cos(ω_d Δt + b_d)]
</div>

This gives the model a sense of recency — events further in the past have lower encoded similarity to the current time.

**Temporal attention over neighbours:**

<div class="math-box">
h_u(t) = AGG( s_u(t), { (s_v(t), e_{uv}, φ(t - t_{uv})) : (v, t_{uv}) ∈ N_k(u, t) } )
</div>

Where N_k(u, t) is the k most recent temporal neighbours of u before time t.

<div class="insight-box">
<strong>Why time encoding matters:</strong> An interaction 1 second ago should have more influence than one from 1 year ago. Time encoding φ(Δt) provides this recency signal explicitly. The model learns to weight recent interactions more heavily for tasks where recency is informative (e.g., click prediction), or weight them equally for tasks where history matters uniformly.
</div>

### 3. Link Prediction Decoder

Given node embeddings h_u(t) and h_v(t), compute interaction probability:

<div class="math-box">
p(u, v, t) = σ( MLP( [h_u(t) || h_v(t)] ) )
</div>

Trained with binary cross-entropy + negative sampling (sample random non-interacting pairs as negatives).

## The Full TGN Loop

```
For each event (u, v, t, e_{uv}) in the stream:
  1. Retrieve memories s_u(t^-), s_v(t^-)
  2. Compute messages m_u, m_v
  3. Update memories: s_u(t), s_v(t)
  4. When evaluation needed:
     a. Compute temporal embeddings h_u(t), h_v(t)
     b. Predict p(u, v, t)
```

## Variants and Ablations

TGN subsumes several prior architectures:

| Architecture | Memory | Embedding |
|-------------|--------|-----------|
| DeepCoevolve | GRU | None (memory = embedding) |
| JODIE | RNN | Linear projection |
| DyRep | None | Temporal attention |
| TGAT | None | Temporal graph attention |
| TGN-attn | GRU memory | Temporal graph attention |

TGN-attn (full TGN) outperforms all ablations on link prediction benchmarks (Wikipedia, Reddit, MOOC, LastFM).

## Inductive Capability

TGN naturally handles new nodes: when a previously unseen node v appears, its memory is initialised to 0. After its first few interactions, the memory accumulates history. This is the key advantage over transductive methods that require all nodes at training time.

## Batch Processing and Training

Online event processing is not directly compatible with batched GPU training. TGN uses a trick: process events in chronological order within batches, carrying memory states forward. Memory updates are detached from the computation graph to avoid BPTT over the full event history — only the embedding computation and the final prediction are differentiated.

## Summary

| Component | Purpose |
|-----------|---------|
| Memory s_v | Long-term history (fixed-size, GRU-updated) |
| Raw messages | Per-event information for memory update |
| Time encoding | Recency signal for temporal attention |
| Temporal attention | Structural context from recent neighbours |
| Link decoder | Interaction probability from embeddings |

TGN is the standard baseline for continuous-time dynamic graph link prediction. Its modular design (memory + embedding + decoder) allows ablation studies and component swapping — making it a useful research framework as well as a practical model.

## References

- Rossi, E., Chamberlain, B., Frasca, F., Eynard, D., Monti, F., & Bronstein, M. (2020). [Temporal Graph Networks for Deep Learning on Dynamic Graphs](https://arxiv.org/abs/2006.10637). *ICML GRL+ Workshop 2020* (TGN: memory modules + temporal graph attention for continuous-time dynamic graphs).
- Xu, D., Ruan, C., Körpeoglu, E., Kumar, S., & Achan, K. (2020). [Inductive Representation Learning on Temporal Graphs](https://arxiv.org/abs/2002.07962). *ICLR 2020* (TGAT: temporal attention without memory; time-encoding via Bochner's theorem).
- Kumar, S., Zhang, X., & Leskovec, J. (2019). [Predicting Dynamic Embedding Trajectory in Temporal Interaction Networks](https://arxiv.org/abs/1908.01207). *KDD 2019* (JODIE: bipartite temporal interaction model using RNN projections).
