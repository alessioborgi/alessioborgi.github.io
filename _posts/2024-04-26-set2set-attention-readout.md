---
layout: single
title: "Set2Set and Attention Readout: Order-Invariant Graph Summaries"
date: 2024-04-26
categories: [gnn]
book: gnn
subsection: pooling
tags: [set2set, attention-readout, readout, LSTM, graph-classification]
excerpt: "Mean and sum readout treat all nodes equally. Attention readout learns which nodes matter most for a given task. Set2Set goes further — it uses an LSTM to iteratively query the node set, producing richer graph representations than single-pass pooling."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 4
permalink: /blog/gnn/set2set-attention-readout/
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
<strong>TL;DR:</strong> Attention readout weights node embeddings by learned importance scores before summing — nodes that matter more for the task contribute more to the graph embedding. Set2Set extends this with an LSTM that makes T passes over the node set, each time computing a different attention query. This yields a richer, order-invariant graph summary.
</div>

## Beyond Uniform Pooling

Mean and sum pooling treat all nodes identically. But for most tasks, nodes differ greatly in importance:
- In a molecule, the reactive functional group matters more than inert backbone atoms
- In a social network, hubs matter more than peripheral nodes
- In a citation graph, landmark papers matter more than derivative works

**Attention readout** learns these importance differences during training.

## Attention Readout (Global Attention Pooling)

For each node v, compute a scalar importance score:

<div class="math-box">
a_v = MLP_gate( h_v )   ∈ ℝ
</div>

Normalise scores with softmax:

<div class="math-box">
α_v = exp(a_v) / Σ_{u ∈ V} exp(a_u)
</div>

Compute the graph embedding as a weighted sum:

<div class="math-box">
h_G = Σ_{v ∈ V} α_v · MLP_out(h_v)
</div>

This is a single-pass soft attention over all nodes. The model learns which nodes to weight highly for the specific prediction task.

**Properties:**
- Permutation-invariant (softmax and weighted sum are unordered)
- Differentiable: all operations are smooth
- Task-conditioned: α_v depends on h_v which encodes local neighbourhood

**Limitation:** each node is scored independently. The attention over node v does not account for what other nodes contribute — the weights are computed in isolation.

## Set2Set (Vinyals et al., 2015)

Set2Set produces a graph embedding using **T steps of LSTM-driven attention**. At each step t, the LSTM maintains a query vector q_t, which is used to compute attention over all nodes:

**Step t:**

<div class="math-box">
e^t_v = q_t · h_v   (attention score for node v)
α^t_v = softmax(e^t_v)
m_t = Σ_v α^t_v h_v   (weighted sum at step t)
</div>

Update the LSTM:

<div class="math-box">
(q_{t+1}, c_{t+1}) = LSTM( [q_t ; m_t], c_t )
</div>

After T steps, the final graph embedding is:

<div class="math-box">
h_G = [q_T ; m_T]
</div>

(concatenation of LSTM hidden state and final attended message)

<div class="insight-box">
<strong>Why multiple passes?</strong> At step t=1, the query q_1 is random — the model attends roughly uniformly. At step t=2, q_2 has seen what step 1 attended to, and can direct attention elsewhere. By step T, the LSTM has built up a rich query sequence — each step "reads" a different aspect of the node set. This is analogous to multi-head attention reading different subspaces.
</div>

## Set2Set vs Attention Readout vs Sum

| Property | Sum | Attention Readout | Set2Set |
|----------|-----|------------------|---------|
| Weights nodes uniformly | Yes | No | No |
| Learns importance | No | Yes (independently) | Yes (iteratively) |
| Multiple passes over nodes | No | No | Yes (T passes) |
| Output dimension | d | d | 2d |
| Complexity | O(N d) | O(N d) | O(T N d) |
| Permutation-invariant | Yes | Yes | Yes |

## When Set2Set Helps

Set2Set is particularly effective when:
- Graph-level prediction requires integrating information from multiple disjoint node subsets
- Different "aspects" of the graph matter for the prediction (Set2Set reads each in turn)
- The graph size varies widely across the dataset (attention readout adapts better than fixed pooling)

On molecular benchmarks (QM9 for molecular property prediction), Set2Set significantly outperforms mean/sum pooling and slightly outperforms single-pass attention.

## Multi-head Attention Readout

A simpler extension of attention readout: compute K independent attention heads, each with its own gate MLP:

<div class="math-box">
h_G = concat( Σ_v α^1_v h_v, ..., Σ_v α^K_v h_v )
</div>

Each head learns to attend to a different subset of important nodes. This gives multi-aspect graph summarisation without the LSTM overhead of Set2Set.

## Summary

| Method | Core idea | Strength |
|--------|-----------|---------|
| Sum/Mean | Uniform aggregation | Simple, fast |
| Attention readout | Learned per-node weights | Task-adaptive |
| Set2Set | LSTM queries node set T times | Rich multi-pass summary |
| Multi-head attention | Multiple independent attention pools | Balanced expressiveness/cost |

For small graphs (molecules, proteins), Set2Set and multi-head attention provide meaningful improvements over flat pooling. For large graphs, the O(T N d) cost of Set2Set may be prohibitive, making single-pass attention readout the preferred choice.

## References

- Vinyals, O., Bengio, S., & Kudlur, M. (2015). [Order Matters: Sequence to Sequence for Sets](https://arxiv.org/abs/1511.06391). *ICLR 2016* (Set2Set).
- Li, Y., Tarlow, D., Brockschmidt, M., & Zemel, R. (2016). [Gated Graph Sequence Neural Networks](https://arxiv.org/abs/1511.05493). *ICLR 2016* (global attention readout).
- Gilmer, J., Schütt, K. T., Matera, G., Deisenroth, M. P., & Müller, K.-R. (2017). [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212). *ICML 2017* (uses Set2Set for molecular property prediction).
