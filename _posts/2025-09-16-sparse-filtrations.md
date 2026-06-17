---
layout: single
title: "Sparse Filtrations: Scaling Persistent Homology to Large Data"
categories: [tdl]
book: tdl
subsection: computation
tags: [sparse-filtrations, vietoris-rips, sparse-rips, sparsification, scalability]
published: false
excerpt: "The Vietoris-Rips complex grows exponentially with point count. Sparse filtrations — particularly the sparse Rips construction of Sheehy and Cavanna et al. — produce O(n)-simplex complexes that approximate the full Rips persistence diagram up to a controlled multiplicative error."
author_profile: true
read_time: true
icon: "🪶"
read_mins: 5
permalink: /blog/persistent-homology/sparse-filtrations/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The full Vietoris-Rips filtration on n points has up to 2ⁿ simplices, making persistence computation infeasible for large datasets. Sparse Rips filtrations (Sheehy 2013; Cavanna, Jahanseir & Sheehy 2015) produce a filtration with O(n) simplices whose persistence diagram multiplicatively (1+ε)-approximates the full Rips diagram. The core idea: use a greedy net hierarchy to decide which simplices are "necessary."</div>

## Intuition First

Imagine you have 1000 GPS points tracing a hiking trail. The full Rips complex would try every subset — nearly 2^1000 simplices. But most of those simplices are redundant: if you already know points within 10 m form a connected blob, you don't need every 50-simplex inside that blob to prove connectivity. Sparse filtrations are like thinning a dense forest into a skeleton: keep only the trees that carry load-bearing topological information, prune the rest.

<style>
@keyframes pruneNode {
  0%,40%  { opacity: 1; r: 5; }
  60%     { opacity: 0.2; r: 3; fill: #e5e7eb; }
  100%    { opacity: 0.2; r: 3; fill: #e5e7eb; }
}
@keyframes keepNode {
  0%   { r: 5; fill: #0d9488; }
  50%  { r: 7; fill: #0d9488; }
  100% { r: 5; fill: #0d9488; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:0 auto;">
  <text x="125" y="15" font-size="11" fill="#64748b" text-anchor="middle">Full Rips: O(2ⁿ) simplices</text>
  <text x="375" y="15" font-size="11" fill="#64748b" text-anchor="middle">Sparse Rips: O(n) simplices</text>
  <line x1="250" y1="18" x2="250" y2="175" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- LEFT: dense cluster of points with many edges -->
  <!-- edges first (background) -->
  <line x1="60" y1="80" x2="100" y2="60" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="60" y1="80" x2="90" y2="110" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="60" y1="80" x2="130" y2="90" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="100" y1="60" x2="90" y2="110" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="100" y1="60" x2="130" y2="90" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="90" y1="110" x2="130" y2="90" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="60" y1="80" x2="75" y2="50" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="100" y1="60" x2="75" y2="50" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="130" y1="90" x2="155" y2="70" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="130" y1="90" x2="160" y2="110" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <line x1="155" y1="70" x2="160" y2="110" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>
  <!-- filled triangles -->
  <polygon points="60,80 100,60 90,110" fill="#bfdbfe" opacity="0.4"/>
  <polygon points="100,60 130,90 90,110" fill="#bfdbfe" opacity="0.4"/>
  <polygon points="130,90 155,70 160,110" fill="#bfdbfe" opacity="0.4"/>
  <!-- points -->
  <circle cx="60"  cy="80"  r="4" fill="#3b82f6"/>
  <circle cx="100" cy="60"  r="4" fill="#3b82f6"/>
  <circle cx="90"  cy="110" r="4" fill="#3b82f6"/>
  <circle cx="130" cy="90"  r="4" fill="#3b82f6"/>
  <circle cx="75"  cy="50"  r="4" fill="#3b82f6"/>
  <circle cx="155" cy="70"  r="4" fill="#3b82f6"/>
  <circle cx="160" cy="110" r="4" fill="#3b82f6"/>
  <circle cx="110" cy="140" r="4" fill="#3b82f6"/>
  <circle cx="80"  cy="140" r="4" fill="#3b82f6"/>
  <text x="110" y="165" font-size="9" fill="#ef4444" text-anchor="middle">Exponential redundancy</text>

  <!-- RIGHT: sparse skeleton -->
  <!-- only essential edges -->
  <line x1="300" y1="80" x2="350" y2="60" stroke="#0d9488" stroke-width="1.5"/>
  <line x1="350" y1="60" x2="390" y2="90" stroke="#0d9488" stroke-width="1.5"/>
  <line x1="390" y1="90" x2="430" y2="70" stroke="#0d9488" stroke-width="1.5"/>
  <line x1="300" y1="80" x2="330" y2="120" stroke="#0d9488" stroke-width="1.5"/>
  <line x1="390" y1="90" x2="410" y2="130" stroke="#0d9488" stroke-width="1.5"/>
  <!-- net representative points kept -->
  <circle cx="300" cy="80"  r="5" fill="#0d9488" style="animation: keepNode 2s infinite;"/>
  <circle cx="350" cy="60"  r="5" fill="#0d9488"/>
  <circle cx="390" cy="90"  r="5" fill="#0d9488"/>
  <circle cx="430" cy="70"  r="5" fill="#0d9488"/>
  <circle cx="330" cy="120" r="5" fill="#0d9488"/>
  <circle cx="410" cy="130" r="5" fill="#0d9488"/>
  <!-- pruned points -->
  <circle cx="320" cy="50"  r="5" fill="#94a3b8" style="animation: pruneNode 4s infinite;"/>
  <circle cx="370" cy="110" r="5" fill="#94a3b8" style="animation: pruneNode 4s 0.5s infinite;"/>
  <circle cx="450" cy="100" r="5" fill="#94a3b8" style="animation: pruneNode 4s 1s infinite;"/>
  <text x="370" y="165" font-size="9" fill="#0d9488" text-anchor="middle">O(n) net representatives</text>
</svg>
<figcaption style="text-align:center;font-size:.85em;color:#64748b;">Sparse Rips keeps only net-hierarchy representatives (teal), pruning redundant points (grey, fading). The resulting complex has O(n) simplices and (1+ε)-approximates full Rips persistence.</figcaption>
</figure></div>

## The Scalability Problem

For a point cloud $$P$$ of $$n$$ points, the **Vietoris-Rips complex** $$\mathrm{Rips}(P, r)$$ includes every simplex $$\sigma$$ whenever all pairwise distances between vertices of $$\sigma$$ are at most $$r$$. As $$r$$ grows, this can include every subset of $$P$$, giving $$2^n - 1$$ simplices.

Even for $$n = 1000$$ points, the full Rips complex is computationally intractable. We need filtrations with far fewer simplices that still capture the topological structure.

## Nets and Hierarchies

A **net** at scale $$r$$ is a maximal set of points with pairwise distances $$\geq r$$. A **net tree** (or greedy permutation hierarchy) organises points at multiple scales:

- At scale $$r$$, points in the net are "representatives" for nearby points.
- As $$r$$ decreases, the net becomes finer, eventually including all points.

This hierarchical structure is key to sparse filtrations.

## The Sparse Rips Construction

**Sheehy (2013)** defines the sparse Rips filtration $$\mathrm{Rips}_\varepsilon(P, \cdot)$$ as follows. For each simplex $$\sigma$$, include $$\sigma$$ in the filtration at scale:

<div class="math-box">$$r_\varepsilon(\sigma) = \frac{\mathrm{diam}(\sigma)}{1 - \varepsilon} \cdot \frac{1}{\lambda(\sigma)}$$</div>

where $$\lambda(\sigma)$$ is a "insertion scale" determined by the net hierarchy. Intuitively:
- Simplices in dense regions are inserted later (their insertion scale is inflated).
- Only simplices that are "necessary" at each scale are kept.

**Result**: The sparse Rips filtration has $$O(n \log(1/\varepsilon))$$ simplices (or $$O(n)$$ for fixed $$\varepsilon$$) and its persistence diagram is a $$(1+\varepsilon)$$-approximation of the full Rips diagram (in the bottleneck distance sense after rescaling).

## Concrete Numbers: Why Sparsification Matters

For $$n = 500$$ points in $$\mathbb{R}^3$$:

| Filtration | Simplex count | Reduction time (est.) |
|---|---|---|
| Full Rips (dim ≤ 3) | ~20 million | > 10 min |
| Sparse Rips (ε = 0.5) | ~3,000 | < 1 sec |
| Sparse Rips (ε = 0.1) | ~12,000 | ~2 sec |

The (1+ε)-approximation error means persistence pairs (b,d) become (b′,d′) with b′/b, d′/d ∈ [1/(1+ε), 1+ε]. At ε = 0.5 this is a 50% relative error on birth/death times — acceptable for topological shape analysis where we care about *which* features are long-lived, not their exact values.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The trade-off is not accuracy vs. speed in the traditional sense — it is <em>additive stability</em> (full Rips, exact) vs. <em>multiplicative approximation</em> (sparse Rips, fast). For classification tasks that use persistent homology as a feature, multiplicative approximation is usually sufficient: classifiers trained on sparse features perform within 1–2% of classifiers trained on full features, while being 100× faster to compute.</div>

## Cavanna–Jahanseir–Sheehy Variant

**Cavanna, Jahanseir & Sheehy (2015)** give a cleaner construction based on relaxed net hierarchies, producing:

- A filtration with $$O_\varepsilon(n)$$ simplices (the constant depends on $$\varepsilon$$ and the doubling dimension of the metric).
- An interleaving between the sparse and full Rips modules of size controlled by $$\varepsilon$$.
- A practical algorithm implementable via greedy insertion into a lazy net tree.

## Practical Variants

Several practical alternatives exist:

**Sparsified Rips (Boissonnat & Pritam 2020)**: A different sparsification that focuses on reducing the maximum simplex dimension rather than the total count.

**Landmark-based complexes**: Witness complexes use a small landmark set $$L \subset P$$ (size $$l \ll n$$) to build a complex. The full Rips on $$L$$ approximates topology, but requires good landmark selection.

**Čech with lazy evaluation**: Since $$\mathrm{Rips}(P, r) \subseteq \check{C}(P, r) \subseteq \mathrm{Rips}(P, 2r)$$, one can use Čech-like conditions (miniball containment) to prune edges early.

<div class="insight-box"><strong>Key Insight:</strong> The multiplicative approximation guarantee means that all persistence pairs $$(b, d)$$ in the full Rips diagram correspond to pairs $$(b', d')$$ in the sparse diagram with $$b/b', d/d' \in [1/(1+\varepsilon), 1+\varepsilon]$$. This is weaker than the additive bottleneck guarantee of standard stability, but sufficient for most practical TDA applications where the goal is to identify the "shape" of data rather than compute exact persistence values.</div>

## References

- D. Sheehy, "Linear-Size Approximations to the Vietoris-Rips Filtration," *Discrete & Computational Geometry*, 2013.
- N. Cavanna, M. Jahanseir, D. Sheehy, "A Geometric Perspective on Sparse Filtrations," *CCCG* 2015. [arXiv:1506.03797](https://arxiv.org/abs/1506.03797).
- J.-D. Boissonnat, S. Pritam, "Edge Collapse and Persistence of Flag Complexes," *SoCG* 2020.
