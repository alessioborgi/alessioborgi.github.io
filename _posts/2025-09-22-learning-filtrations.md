---
layout: single
title: "Learning Filtrations: Task-Optimised Topology"
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [learning-filtrations, graph-filtration-learning, task-specific-topology, parametric-filtration]
published: false
excerpt: "Standard TDA uses pre-defined filtrations (Rips, sublevel sets). Learning filtrations optimises the filtration function jointly with a downstream task — so the persistent homology computed reflects features that are actually discriminative for the task, not just geometric proximity."
author_profile: true
read_time: true
icon: "🎓"
read_mins: 5
permalink: /blog/persistent-homology/learning-filtrations/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A filtration f: K → ℝ is just a function assigning "importance" to simplices. If we parameterise f by a neural network (e.g., a GNN on graph nodes/edges), we can learn f end-to-end by backpropagating through the persistence diagram. Graph Filtration Learning (Hofer et al. 2020) does exactly this: a 1-layer GNN outputs node values, inducing a filtration, whose persistence diagram is vectorised and classified.</div>

## The Fixed Filtration Problem

In classical TDA, the filtration is fixed by the data geometry:
- Rips: $$f(\sigma) = \max_{u,v \in \sigma} d(u,v)$$.
- Sublevel set: $$f(\sigma) = \max_{v \in \sigma} h(v)$$ for some fixed height function $$h$$.

But for graph classification, the "right" filtration depends on the task:
- For classifying molecules by toxicity, bond lengths matter.
- For social networks, community structure matters.
- For protein folding graphs, secondary structure matters.

A fixed filtration cannot be simultaneously optimal for all tasks.

## Graph Filtration Learning

**Setup**: Given a graph $$G = (V, E)$$ with node features $$X \in \mathbb{R}^{|V| \times d}$$, define:

1. A **parameterised filtration** $$f_\theta: V \cup E \to \mathbb{R}$$ using a GNN:
   - Node values: $$f_\theta(v) = \mathrm{GNN}_\theta(v, X)$$
   - Edge values: $$f_\theta(\{u,v\}) = \max(f_\theta(u), f_\theta(v))$$ (flag complex convention)

2. Compute persistence diagram $$\mathrm{dgm}(f_\theta(G))$$ using the flag filtration.

3. Vectorise via PersLay or persistence images → dense layers → classification.

4. Train end-to-end: gradients flow back through PersLay → through $$\mathrm{dgm}$$ → to $$\theta$$ in the GNN.

<div class="math-box">$$\theta^* = \arg\min_\theta \mathcal{L}(\mathrm{PersLay}(\mathrm{dgm}(f_\theta(G))), y)$$</div>

## Expressive Power

**Theorem (Hofer et al. 2020)**: Graph Filtration Learning is strictly more powerful than 1-WL GNNs on certain graph families. Two graphs that are indistinguishable by the Weisfeiler-Leman test can be distinguished by their persistent $$H_0$$ under a learned filtration.

The intuition: topology sees global structure (connectivity, cycles) that local message-passing misses.

## Extended to Higher Dimensions

For $$H_1$$, $$H_2$$ persistence, one builds the **Rips filtration** on the learned node values:
$$K_t = \{S \subseteq V : f_\theta(v) \leq t \ \forall v \in S, \mathrm{diam}(S) \leq t\}$$

This captures loops and voids in the graph, weighted by learned node importance.

## Comparison: Fixed vs. Learned Filtrations

| Property | Fixed (Rips/Sublevel) | Learned |
|-----------|----------------------|---------|
| Computation | Fast | Requires GNN forward pass |
| Task optimality | No | Yes |
| Interpretability | High (geometric meaning) | Task-dependent |
| Requires labels | No | Yes (supervised) |

<div class="insight-box"><strong>Key Insight:</strong> Learning filtrations resolves a long-standing tension in TDA-ML: classical TDA computes topological features that are provably stable and interpretable, but may not be discriminative for a given task. Learned filtrations sacrifice some interpretability to gain task-relevance. The result in practice is that learned filtrations outperform fixed filtrations on benchmark graph classification tasks by 5–15%, particularly on datasets with rich node features (e.g., biological networks, molecular graphs).</div>

## References

- C. Hofer, F. Graf, B. Rieck, M. Niethammer, R. Kwitt, "Graph Filtration Learning," *ICML* 2020. [arXiv:1905.10996](https://arxiv.org/abs/1905.10996).
- B. Rieck, C. Bock, K. Borgwardt, "A Persistent Weisfeiler-Lehman Procedure for Graph Classification," *ICML* 2019.
