---
layout: single
title: "Over-smoothing vs Over-squashing: The Difference"
date: 2024-04-15
categories: [gnn]
book: gnn
subsection: expressivity
tags: [oversmoothing, oversquashing, GNN, depth, comparison]
excerpt: "Oversmoothing and oversquashing are both problems with deep GNNs, but they affect different nodes, have different causes, and require different fixes. Confusing them leads to applying the wrong solution."
author_profile: true
read_time: true
is_overview: false
icon: "⚖️"
read_mins: 4
permalink: /blog/gnn/oversmoothing-vs-oversquashing/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Oversmoothing = forward-pass feature collapse from too much averaging (nearby nodes become identical). Oversquashing = gradient/information collapse at bottleneck edges for long-range communication. Both increase with depth but in different ways, on different nodes, and need different fixes.
</div>
{% include figure image_path="/images/blog/gnn/topping2022_oversquashing.png" alt="Oversmoothing vs oversquashing" caption="Over-smoothing vs over-squashing — two distinct failure modes in deep GNNs (Topping et al., 2022)" %}


## The Confusion

Both oversmoothing and oversquashing:
- Occur with deep GNNs
- Cause performance degradation
- Involve information loss

They are often mentioned together or confused. But they are fundamentally different phenomena.

## Head-to-Head Comparison

| Property | Oversmoothing | Oversquashing |
|----------|---------------|---------------|
| **Root cause** | Iterated averaging → all embeddings converge | Exponential neighbourhood growth → info bottleneck |
| **Direction** | Forward pass (computation) | Both forward (dilution) and backward (gradient) |
| **Which nodes affected** | All nodes, especially nearby ones | Nodes that are far apart (long paths) |
| **Graph structure** | Worse on dense, well-connected graphs | Worse on tree-like, sparse graphs with bridge edges |
| **With more layers** | Provably gets worse (converges to constant) | Could get better (reach distant nodes) but squashing increases |
| **Measure** | Dirichlet energy → 0; MAD → 0 | Jacobian ||∂h_v/∂x_u|| → 0 |
| **Spectral view** | Low-pass filter removes high frequencies | Not spectral: it's about topology/curvature |
| **Fix** | Residual connections, jump knowledge, APPNP | Graph rewiring, global attention, virtual nodes |

## When You Have Oversmoothing

You add layers hoping to capture longer-range patterns, but performance peaks at 2-3 layers then drops. Node embeddings in the last layer have near-zero pairwise distances. The model assigns nearly the same embedding to all nodes.

**Symptom:** accuracy peaks at 2-3 layers, then monotonically decreases. MAD scores drop toward zero with depth.

**Fix:** residual connections (GCNII), APPNP, JK-Net (jumping knowledge). Do NOT add more layers — that makes it worse.

## When You Have Oversquashing

You have a task requiring long-range reasoning (e.g., predicting whether two distant atoms in a molecule will react). The model performs well on local structure tasks but fails on long-range ones. Adding more layers doesn't help.

**Symptom:** performance on long-range tasks (e.g., LRGB benchmarks) is poor regardless of depth. Jacobian norms near zero for distant node pairs.

**Fix:** graph rewiring (SDRF, add virtual nodes), global attention (Graph Transformers, GPS). Adding residual connections does NOT fix oversquashing — information still can't reach distant nodes.

## A Unified View

Li et al. and Alon & Yahak propose viewing both as failures of information flow, but in different regimes:

```
Short range:  Oversmoothing dominates (too many hops → convergence)
Long range:   Oversquashing dominates (too few paths → bottlenecks)
```

They create opposing pressures on depth:
- Oversmoothing says: use FEWER layers
- Task requirements say: use MORE layers (to reach distant nodes)
- Oversquashing says: more layers don't help anyway for bottlenecks

The resolution: **decouple propagation from transformation** (APPNP, SGC) and/or **add global attention** (Graph Transformers, GPS).

<div class="insight-box">
<strong>The practical diagnostic:</strong> Run your GNN on the same task with increasing layers (1, 2, 4, 8, 16). If performance peaks early and then drops: oversmoothing. If performance never improves beyond a ceiling regardless of depth, and tasks require long-range reasoning: oversquashing. If both: you need both architectural and rewiring fixes.
</div>

## Fixes Summary

**Oversmoothing fixes (forward collapse):**
- GCNII: residual connections to initial representation
- JK-Net: concatenate all layer outputs
- APPNP: teleport back to initial features during propagation
- DropEdge: randomly drop edges to reduce averaging
- PairNorm: explicit normalisation to maintain diversity

**Oversquashing fixes (bottleneck communication):**
- SDRF: Ricci flow-based graph rewiring
- Virtual node: global communication node
- Graph Transformers: bypass message passing for long-range
- GPS: combine local MPNN + global attention

**Fixes for both:**
- GPS (General, Powerful, Scalable): local MPNN avoids oversmoothing; global attention bypasses oversquashing

## Summary

| Question | Oversmoothing | Oversquashing |
|----------|---------------|---------------|
| Where does info die? | Nearby (convergence) | At bottleneck edges (long range) |
| When does it hurt? | Dense graphs, many layers | Sparse graphs with bridges, long-range tasks |
| Can more layers help? | Never (makes it worse) | Should, but squashing increases too |
| Key fix | Residuals, less aggregation | Rewiring, global attention |

These two pathologies define the fundamental challenges of deep GNNs. Understanding both — and distinguishing them — is essential for diagnosing GNN failures and choosing appropriate solutions.

## References

- Li, Q., Han, Z., & Wu, X.-M. (2018). [Deeper Insights Into Graph Convolutional Networks for Semi-Supervised Classification](https://arxiv.org/abs/1801.07606). *AAAI 2018* (oversmoothing).
- Alon, U., & Yahav, E. (2021). [On the Bottleneck of Graph Neural Networks and Its Practical Implications](https://arxiv.org/abs/2006.05205). *ICLR 2021* (oversquashing).
- Topping, J., Di Giovanni, F., Chamberlain, B. P., Dong, X., & Bronstein, M. M. (2022). [Understanding over-squashing and Bottlenecks on Graphs via Curvature](https://arxiv.org/abs/2111.14522). *ICLR 2022*.
