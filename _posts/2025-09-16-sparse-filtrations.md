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
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The full Vietoris-Rips filtration on n points has up to 2ⁿ simplices, making persistence computation infeasible for large datasets. Sparse Rips filtrations (Sheehy 2013; Cavanna, Jahanseir & Sheehy 2015) produce a filtration with O(n) simplices whose persistence diagram multiplicatively (1+ε)-approximates the full Rips diagram. The core idea: use a greedy net hierarchy to decide which simplices are "necessary."</div>

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
