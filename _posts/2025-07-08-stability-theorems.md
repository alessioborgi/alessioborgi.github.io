---
layout: single
title: "Stability of Persistent Homology: Noise Robustness"
date: 2025-07-08
categories: [tdl]
book: tdl
subsection: core
tags: [stability, bottleneck-distance, Cohen-Steiner, noise-robustness, Lipschitz]
excerpt: "The stability theorem (Cohen-Steiner et al., 2007) is the cornerstone of TDA's applicability to real data: if two functions f and g are close in the L∞ norm, their persistence diagrams are close in the bottleneck distance. This Lipschitz guarantee means persistent homology tolerates noise, sampling variation, and small perturbations — a prerequisite for any statistical analysis."
author_profile: true
read_time: true
is_overview: false
icon: "🛡️"
read_mins: 5
permalink: /blog/persistent-homology/stability-theorems/
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The bottleneck stability theorem guarantees that small perturbations in input data cause at most equally small changes in the persistence diagram. Formally: $$d_B(\mathrm{dgm}(f), \mathrm{dgm}(g)) \leq \|f - g\|_\infty$$. This makes TDA noise-robust — features with persistence larger than the noise level are genuine shape features, not artefacts of measurement error.</div>
{% include figure image_path="/images/blog/tdl/hofer2020_topological_layers.png" alt="Stability of persistence" caption="Topological stability and layers (Hofer et al., 2020)" %}


## The Bottleneck Distance

To state the stability theorem, we first need a metric on persistence diagrams. The **bottleneck distance** between two diagrams $$D_1$$ and $$D_2$$ is:

<div class="math-box">
$$d_B(D_1, D_2) = \inf_{\gamma: D_1 \to D_2} \sup_{x \in D_1} \|x - \gamma(x)\|_\infty$$
</div>

where the infimum is over all **partial matchings** $$\gamma$$ between $$D_1$$ and $$D_2$$. Unmatched points from either diagram must be matched to their closest point on the diagonal $$y = x$$ (at cost equal to their persistence divided by 2). The supremum then measures the worst-case matching cost.

Intuitively: the bottleneck distance is the minimax cost of an optimal bijection between the two multisets (including the diagonal as a "dummy" that absorbs unmatched points). If one diagram has a point $$(1, 3)$$ and the other has $$(1.1, 3.1)$$, their bottleneck distance is at most $$0.1$$.

The $$L^\infty$$ norm is used because it matches the algebraic structure: under a function perturbation bounded by $$\delta$$, each simplex's filtration time shifts by at most $$\delta$$, shifting each persistence pair by at most $$\delta$$ in both coordinates.

## The Stability Theorem

**Theorem** (Cohen-Steiner, Edelsbrunner, Harer 2007): Let $$f, g: X \to \mathbb{R}$$ be tame (finitely many topological changes), Lipschitz functions on a triangulable compact space $$X$$. Then:

<div class="math-box">
$$d_B\!\left(\mathrm{dgm}(f),\, \mathrm{dgm}(g)\right) \leq \|f - g\|_\infty$$
</div>

This is a **1-Lipschitz** bound: the map from functions to persistence diagrams is non-expansive in these metrics. The proof uses the interleaving of the two sublevel-set filtrations induced by $$f$$ and $$g$$: since $$|f(x) - g(x)| \leq \delta$$ for all $$x$$, the filtrations are $$\delta$$-interleaved, which implies the diagrams are at bottleneck distance at most $$\delta$$.

**Corollary** for point clouds: if $$P$$ and $$Q$$ are two point clouds with Hausdorff distance $$d_H(P, Q) \leq \delta$$, then $$d_B(\mathrm{dgm}(P), \mathrm{dgm}(Q)) \leq O(\delta)$$ (up to constants depending on the complex construction). This means small perturbations of the sampled points cause only small changes in the persistence diagram.

## Wasserstein Stability

The **p-Wasserstein distance** between diagrams is:

<div class="math-box">
$$W_p(D_1, D_2) = \left(\inf_{\gamma} \sum_{x \in D_1} \|x - \gamma(x)\|_\infty^p \right)^{1/p}$$
</div>

A corresponding Wasserstein stability theorem holds under stronger assumptions (q-tame modules, Chazal et al. 2016):

$$W_p(\mathrm{dgm}(f), \mathrm{dgm}(g)) \leq C \cdot \|f - g\|_p$$

for appropriate constants $$C$$. Wasserstein stability gives a finer guarantee: not just the worst-case matching cost (bottleneck), but the average-case cost is also bounded.

## Implications for Data Analysis

The stability theorem has three practical consequences:

1. **Noise filtering**: points in the persistence diagram with $$d - b \leq 2\delta$$ (where $$\delta$$ is the noise level) can be discarded as noise. Points with $$d - b > 2\delta$$ are provably robust.

2. **Subsampling stability**: if you subsample $$n$$ points from a manifold and compute PH, the resulting diagram converges to the "true" diagram of the manifold as $$n \to \infty$$ (at the rate of the covering radius).

3. **Differentiability**: the map $$f \mapsto \mathrm{dgm}(f)$$ is Lipschitz, hence differentiable almost everywhere. This is the foundation for topological loss functions in neural networks.

<div class="insight-box"><strong>Key Insight:</strong> Stability is what separates TDA from naive topological analysis. Without it, persistent homology would be a mathematical curiosity — any noise in the data could create or destroy features arbitrarily. With the stability theorem, we have a precise quantitative relationship: the topological signal is at most as sensitive to noise as the input data itself. Features that survive perturbation are real; features that do not are noise. This is the statistical foundation of all TDA applications.</div>

## References

- D. Cohen-Steiner, H. Edelsbrunner, and J. Harer, "Stability of Persistence Diagrams," *Discrete & Computational Geometry*, 37(1):103–120, 2007. The original stability paper.
- F. Chazal, D. Cohen-Steiner, M. Glisse, L. Guibas, and S. Oudot, "Proximity of Persistence Modules and their Diagrams," *SCG*, 2009. [arXiv:0911.3697](https://arxiv.org/abs/0911.3697).
- F. Chazal et al., "The Structure and Stability of Persistence Modules," *Springer*, 2016. [arXiv:1207.3674](https://arxiv.org/abs/1207.3674).
