---
layout: single
title: "Global Pooling in GNNs: Mean, Sum, and Max"
date: 2024-04-23
categories: [gnn]
book: gnn
subsection: pooling
tags: [pooling, readout, graph-classification, aggregation, global-pooling]
excerpt: "To predict a property of an entire graph, node embeddings must be aggregated into a single vector. The choice of global pooling — mean, sum, or max — is not arbitrary: each has distinct expressive power and fits different tasks."
author_profile: true
read_time: true
is_overview: false
icon: "🧺"
read_mins: 4
permalink: /blog/gnn/global-pooling/
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
<strong>TL;DR:</strong> After message passing, a readout function aggregates all node embeddings into a single graph embedding. Mean pooling is permutation-invariant and size-normalised. Sum pooling retains count information. Max pooling captures extremes. Each has different expressivity — sum is the most expressive for distinguishing graph sizes and multisets.
</div>

## The Readout Problem

A K-layer GNN produces a set of node embeddings {h^{(K)}_v : v ∈ V}. For node-level tasks (node classification, link prediction), these are used directly. For **graph-level tasks** (graph classification, graph regression), they must be compressed into a single vector h_G.

This compression is the **readout** or **global pooling** step. It must be:
1. **Permutation-invariant:** the same graph regardless of node ordering
2. **Differentiable:** end-to-end training
3. **Expressive:** different graphs should map to different embeddings

## Mean Pooling

<div class="math-box">
h_G = (1/|V|) Σ_{v ∈ V} h^{(K)}_v
</div>

**Properties:**
- Permutation-invariant: ✓
- Normalised by graph size: yes (divides by |V|)
- Sensitive to graph size: no (a graph with 10 nodes and 100 identical nodes → same embedding)
- Captures average node behaviour

**When to use:** tasks where the typical node matters — e.g., average atom property in a molecule, average sentiment in a document graph.

**Failure case:** cannot distinguish a graph with one active node from a graph with 100 identical active nodes — mean pooling normalises out the count.

## Sum Pooling

<div class="math-box">
h_G = Σ_{v ∈ V} h^{(K)}_v
</div>

**Properties:**
- Permutation-invariant: ✓
- Sensitive to graph size: yes (more nodes → larger magnitude)
- Injective over multisets of bounded node embeddings: yes (under the right conditions)
- Captures total contribution of all nodes

**When to use:** tasks where the total matters — e.g., total charge of a molecule, total influence in a social network.

**Expressive power:** Xu et al. (GIN, 2019) proved that sum readout is strictly more expressive than mean or max for distinguishing non-isomorphic graphs. Mean collapses count information; sum preserves it.

**Failure case:** sensitive to graph size in ways that may not be desired — a graph with 100 zero-embedding nodes has the same sum as a graph with 0 nodes.

## Max Pooling

<div class="math-box">
h_G[i] = max_{v ∈ V} h^{(K)}_v[i]   (elementwise maximum)
</div>

**Properties:**
- Permutation-invariant: ✓
- Captures the most prominent feature value in each dimension
- Insensitive to count of nodes with non-maximal features

**When to use:** tasks where the extreme matters — e.g., is there any toxic functional group? Does any node have property X?

**Failure case:** cannot distinguish {1, 2} from {2} — max pooling drops information about non-maximal elements.

<div class="insight-box">
<strong>The multiset analogy:</strong> Think of pooling as summarising a multiset of vectors. Mean collapses {1,1,1} and {1} to the same value. Max collapses {1,2} and {2}. Sum distinguishes all three — but loses ordering (which is intended for permutation invariance).
</div>

## Expressivity Ranking

For graph-level tasks requiring discrimination between non-isomorphic graphs:

```
Sum > Mean ≈ Max (in terms of distinguishing power)
```

Sum aggregation is the foundation of GIN's graph-level expressiveness. The GIN paper proved: if node-level embeddings are injective and readout is sum, the resulting graph-level model is as expressive as 1-WL on graphs.

## Combinations and Hierarchical Pooling

In practice, combining multiple pooling types often works best:

```python
h_G = concat( mean_pool(H), sum_pool(H), max_pool(H) )
```

This captures average behaviour (mean), count sensitivity (sum), and extreme values (max) simultaneously.

For graphs where structure at different scales matters (molecules with atoms and functional groups, social networks with individuals and communities), **hierarchical pooling** — covered in DiffPool and TopK-Pool posts — is more appropriate than flat global pooling.

## Summary

| Pooling | Formula | Sensitive to Size | Information Captured | Best For |
|---------|---------|-----------------|---------------------|----------|
| Mean | Σh / \|V\| | No | Average node behaviour | Distribution of properties |
| Sum | Σh | Yes | Total + count | Additive properties |
| Max | max(h) | No | Extreme values | Existence queries |
| Concat(all) | [mean; sum; max] | Partial | Combined | General tasks |

The choice of readout is as important as the choice of message passing architecture. On graph classification benchmarks, switching from mean to sum pooling alone can change accuracy by 5-10 percentage points.

## References

- Xu, K., Hu, W., Leskovec, J., & Jegelka, S. (2019). [How Powerful are Graph Neural Networks?](https://arxiv.org/abs/1810.00826). *ICLR 2019* (proves sum readout is strictly more expressive than mean or max).
- Zaheer, M., Kottur, S., Ravanbakhsh, S., Poczos, B., Salakhutdinov, R., & Smola, A. J. (2017). [Deep Sets](https://arxiv.org/abs/1703.06114). *NeurIPS 2017* (theory of permutation-invariant functions over sets).
