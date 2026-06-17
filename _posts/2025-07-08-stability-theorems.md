---
layout: single
title: "Stability of Persistent Homology: Noise Robustness"
categories: [tdl]
book: tdl
subsection: core
tags: [stability, bottleneck-distance, Cohen-Steiner, noise-robustness, Lipschitz]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The bottleneck stability theorem guarantees that small perturbations in input data cause at most equally small changes in the persistence diagram. Formally: $$d_B(\mathrm{dgm}(f), \mathrm{dgm}(g)) \leq \|f - g\|_\infty$$. This makes TDA noise-robust — features with persistence larger than the noise level are genuine shape features, not artefacts of measurement error.</div>
{% include figure image_path="/images/blog/tdl/hofer2020_topological_layers.png" alt="Stability of persistence" caption="Topological stability and layers (Hofer et al., 2020)" %}


**Intuition First.** Imagine two persistence diagrams as two sets of dots in the plane. The bottleneck distance asks: what is the cheapest way to match every dot in diagram 1 to a dot in diagram 2, where unmatched dots get sent to the nearest point on the diagonal? The "cost" of a match is the maximum displacement of any single dot. The stability theorem says this cost is bounded by how much the underlying data changed — measured in the $$L^\infty$$ norm.

<div class="blog-figure"><figure>
<svg viewBox="0 0 460 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;font-family:sans-serif;">
  <text x="230" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Bottleneck matching between two diagrams</text>
  <!-- Diagram 1 points -->
  <circle cx="100" cy="70"  r="7" fill="#1e40af" opacity="0.85"/>
  <circle cx="140" cy="100" r="7" fill="#1e40af" opacity="0.85"/>
  <circle cx="80"  cy="150" r="5" fill="#1e40af" opacity="0.5"/>
  <text x="55" y="190" font-size="10" fill="#1e40af">Diagram D₁</text>
  <!-- Diagram 2 points -->
  <circle cx="210" cy="75"  r="7" fill="#ef4444" opacity="0.85"/>
  <circle cx="250" cy="108" r="7" fill="#ef4444" opacity="0.85"/>
  <circle cx="190" cy="155" r="5" fill="#ef4444" opacity="0.5"/>
  <text x="170" y="190" font-size="10" fill="#ef4444">Diagram D₂</text>
  <!-- Matching arrows -->
  <line x1="107" y1="70"  x2="203" y2="75"  stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="147" y1="100" x2="243" y2="108" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="80"  y1="150" x2="190" y2="155" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Max displacement annotation -->
  <line x1="107" y1="70" x2="203" y2="75" stroke="#7c3aed" stroke-width="0"/>
  <text x="155" y="62" font-size="10" fill="#7c3aed" text-anchor="middle">d_B = max displacement</text>
  <!-- Stability bound -->
  <rect x="300" y="50" width="145" height="90" rx="6" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
  <text x="372" y="72"  font-size="11" fill="#f97316" font-weight="bold" text-anchor="middle">Stability Theorem</text>
  <text x="372" y="92"  font-size="11" fill="#475569" text-anchor="middle">d_B(D₁, D₂)</text>
  <text x="372" y="108" font-size="11" fill="#475569" text-anchor="middle">≤ ‖f − g‖_∞</text>
  <text x="372" y="128" font-size="10" fill="#94a3b8" text-anchor="middle">1-Lipschitz bound</text>
</svg>
<figcaption>Bottleneck matching between diagrams D₁ and D₂. Each point is matched to its nearest counterpart; unmatched points go to the diagonal. The stability theorem bounds this worst-case displacement by the input function difference.</figcaption>
</figure></div>

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

## Concrete Example: Perturbation Bound

Suppose you have a function $$f$$ on a triangulated surface and you add Gaussian noise with standard deviation $$\sigma$$, giving $$g = f + \eta$$ with $$\|\eta\|_\infty \leq 3\sigma$$ (with high probability). Then every point in $$\mathrm{dgm}(f)$$ moves by at most $$3\sigma$$ in the bottleneck metric. Any feature with persistence $$d - b > 6\sigma$$ is guaranteed to remain a distinct off-diagonal point in $$\mathrm{dgm}(g)$$. This gives a concrete noise threshold: filter out everything with persistence $$\leq 6\sigma$$ and the remaining features are provably real.

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
