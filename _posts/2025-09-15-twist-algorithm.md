---
layout: single
title: "The Twist Algorithm and Clearing Optimisation"
categories: [tdl]
book: tdl
subsection: computation
tags: [twist-algorithm, clearing-optimisation, boundary-matrix, persistence-computation]
published: false
excerpt: "The standard persistence algorithm runs in O(n³) in the worst case. The twist algorithm exploits Poincaré duality to halve the computation on manifolds. The clearing optimisation avoids redundant reductions by zeroing out columns whose pivots are already known. Together, they make Ripser 10–100× faster."
author_profile: true
read_time: true
icon: "⚙️"
read_mins: 5
permalink: /blog/persistent-homology/twist-algorithm/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Standard boundary matrix reduction reduces each column left-to-right, taking O(n³) worst case. The twist algorithm (Chen & Kerber 2011) processes columns in two passes — forwards for high dimensions and backwards for low — to exploit that positive simplices never need full reduction. The clearing optimisation (Cohen-Steiner et al.) zeros columns for "positive" simplices immediately, halving work in practice.</div>

## Intuition First

The standard persistence algorithm is like reducing a triangular matrix left-to-right — but it does a lot of redundant work. Imagine building a jigsaw: if you already know a piece belongs to a completed section, you don't need to try fitting it again. The **clearing optimisation** recognises finished pairs and skips them. The **twist algorithm** goes further: by exploiting the duality between low and high dimensions, it completes one pass and immediately knows half the answers for the other pass.

<style>
@keyframes colFade {
  0%   { opacity: 1; }
  50%  { opacity: 0.2; }
  100% { opacity: 0.2; }
}
@keyframes colReduce {
  0%   { fill: #fde68a; }
  40%  { fill: #6ee7b7; }
  100% { fill: #6ee7b7; }
}
@keyframes clearCol {
  0%   { opacity: 1; fill: #fca5a5; }
  60%  { opacity: 1; fill: #fca5a5; }
  80%  { opacity: 0.1; fill: #e5e7eb; }
  100% { opacity: 0.1; fill: #e5e7eb; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:0 auto;">
  <!-- Matrix grid: 6 columns × 6 rows -->
  <!-- Title -->
  <text x="130" y="16" font-size="11" fill="#64748b" text-anchor="middle">Standard: reduce every column</text>
  <text x="370" y="16" font-size="11" fill="#64748b" text-anchor="middle">With clearing: skip cleared columns</text>
  <!-- Divider -->
  <line x1="250" y1="20" x2="250" y2="185" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- LEFT: standard 6×6 -->
  <!-- col j=1 -->
  <rect x="30"  y="25" width="26" height="26" rx="2" fill="#6ee7b7" style="animation:colReduce 4s 0s infinite;"/>
  <rect x="30"  y="53" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="30"  y="81" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="30"  y="109" width="26" height="26" rx="2" fill="#6ee7b7" style="animation:colReduce 4s 0.2s infinite;"/>
  <rect x="30"  y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="30"  y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=2 reduced -->
  <rect x="58"  y="25" width="26" height="26" rx="2" fill="#6ee7b7" style="animation:colReduce 4s 0.4s infinite;"/>
  <rect x="58"  y="53" width="26" height="26" rx="2" fill="#6ee7b7" style="animation:colReduce 4s 0.5s infinite;"/>
  <rect x="58"  y="81" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="58"  y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="58"  y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="58"  y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=3 -->
  <rect x="86"  y="25" width="26" height="26" rx="2" fill="#fde68a" style="animation:colReduce 4s 0.8s infinite;"/>
  <rect x="86"  y="53" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="86"  y="81" width="26" height="26" rx="2" fill="#6ee7b7" style="animation:colReduce 4s 1.0s infinite;"/>
  <rect x="86"  y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="86"  y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="86"  y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=4 (positive - gets reduced unnecessarily in standard) -->
  <rect x="114" y="25" width="26" height="26" rx="2" fill="#fde68a" style="animation:colReduce 4s 1.2s infinite;"/>
  <rect x="114" y="53" width="26" height="26" rx="2" fill="#fde68a" style="animation:colReduce 4s 1.4s infinite;"/>
  <rect x="114" y="81" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="114" y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="114" y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="114" y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=5 -->
  <rect x="142" y="25" width="26" height="26" rx="2" fill="#fde68a" style="animation:colReduce 4s 1.6s infinite;"/>
  <rect x="142" y="53" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="142" y="81" width="26" height="26" rx="2" fill="#fde68a" style="animation:colReduce 4s 1.8s infinite;"/>
  <rect x="142" y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="142" y="137" width="26" height="26" rx="2" fill="#6ee7b7" style="animation:colReduce 4s 2.0s infinite;"/>
  <rect x="142" y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=6 -->
  <rect x="170" y="25" width="26" height="26" rx="2" fill="#fde68a" style="animation:colReduce 4s 2.2s infinite;"/>
  <rect x="170" y="53" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="170" y="81" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="170" y="109" width="26" height="26" rx="2" fill="#fde68a" style="animation:colReduce 4s 2.4s infinite;"/>
  <rect x="170" y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="170" y="165" width="26" height="26" rx="2" fill="#6ee7b7" style="animation:colReduce 4s 2.6s infinite;"/>

  <!-- RIGHT: with clearing - some columns skipped -->
  <!-- col j=1 same -->
  <rect x="270" y="25" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="270" y="53" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="270" y="81" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="270" y="109" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="270" y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="270" y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=2 same -->
  <rect x="298" y="25" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="298" y="53" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="298" y="81" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="298" y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="298" y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="298" y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=3 same -->
  <rect x="326" y="25" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="326" y="53" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="326" y="81" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="326" y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="326" y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="326" y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=4 CLEARED (positive simplex - skip!) -->
  <rect x="354" y="25" width="26" height="26" rx="2" style="animation: clearCol 4s 1s infinite;"/>
  <rect x="354" y="53" width="26" height="26" rx="2" style="animation: clearCol 4s 1s infinite;"/>
  <rect x="354" y="81" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="354" y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="354" y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="354" y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <text x="367" y="50" font-size="18" fill="#ef4444" text-anchor="middle" style="animation: clearCol 4s 1s infinite;">✕</text>
  <!-- col j=5 -->
  <rect x="382" y="25" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="382" y="53" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="382" y="81" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="382" y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="382" y="137" width="26" height="26" rx="2" fill="#6ee7b7"/>
  <rect x="382" y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <!-- col j=6 CLEARED -->
  <rect x="410" y="25" width="26" height="26" rx="2" style="animation: clearCol 4s 1.4s infinite;"/>
  <rect x="410" y="53" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="410" y="81" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="410" y="109" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="410" y="137" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <rect x="410" y="165" width="26" height="26" rx="2" fill="#e5e7eb"/>
  <text x="423" y="50" font-size="18" fill="#ef4444" text-anchor="middle" style="animation: clearCol 4s 1.4s infinite;">✕</text>

  <!-- Legend -->
  <rect x="30" y="185" width="12" height="10" rx="1" fill="#6ee7b7"/>
  <text x="44" y="194" font-size="9" fill="#475569">Reduced</text>
  <rect x="95" y="185" width="12" height="10" rx="1" fill="#fde68a"/>
  <text x="109" y="194" font-size="9" fill="#475569">In progress</text>
  <rect x="170" y="185" width="12" height="10" rx="1" fill="#fca5a5"/>
  <text x="184" y="194" font-size="9" fill="#475569">Cleared (skip)</text>
</svg>
<figcaption style="text-align:center;font-size:.85em;color:#64748b;">Clearing zeros out "positive" simplex columns once their pair is identified — eliminating about half of all column reductions in practice.</figcaption>
</figure></div>

## Standard Reduction Recap

The persistence algorithm reduces the boundary matrix $$R = \partial$$ (columns indexed by simplices, entries in $$\mathbb{F}_2$$):

```
for j = 1 to n:
    while there exists i < j with low(R[j]) == low(R[i]):
        R[j] += R[i]  (add column i to column j)
```

where $$\mathrm{low}(v)$$ is the index of the lowest 1-entry in column $$v$$. After reduction, the non-zero columns give the pairing: $$\mathrm{pivot}(R_j) = i$$ means $$(\sigma_i, \sigma_j)$$ is a persistence pair.

**Complexity**: $$O(n^3)$$ field operations in the worst case ($$n$$ columns, each reduced $$O(n)$$ times, each reduction takes $$O(n)$$ time).

## The Clearing Optimisation

**Observation**: If $$(\sigma_i, \sigma_j)$$ is a persistence pair, then the column for $$\sigma_i$$ (a positive simplex) reduces to zero. We can detect this during the reduction of $$\sigma_j$$'s column: once we find a pivot at row $$i$$ that corresponds to a known pair, we know $$\sigma_i$$'s column will reduce to zero.

**Clearing**: After processing $$\sigma_j$$ and finding its pivot at $$i$$, set $$R[i] = 0$$ immediately. This avoids reducing $$R[i]$$ entirely.

In practice, clearing eliminates about half of all column reductions on typical inputs, giving a roughly $$2\times$$ speedup with no asymptotic change.

## Worked Example: Complexity Reduction

Suppose we have a triangulated torus (genus-1 surface) with 100 vertices, 300 edges, and 200 triangles — 600 simplices total. Standard reduction:

- **Worst case**: 600³ / 6 ≈ 36 million operations.
- **With clearing**: after reducing the 200 triangle columns (finding H₁ pairs), ~150 of the 300 edge columns are immediately cleared. Only ~150 edges need reduction. Effective matrix: 600 × 150. Speedup: roughly 2×.
- **Twist + clearing**: the twist processes dimension 2 first, finds 100 pairs, clears 100 edges; then processes dimension 1 using those clearings. In practice on manifold data, this achieves near-linear time in the output size (number of persistence pairs), which is just ~200 for a torus — a 100,000× speedup over the naive bound.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The twist algorithm's benefit is not asymptotic improvement in the worst case — it is still O(n³) in theory. The practical speedup comes from the fact that on geometric complexes (arising from point cloud data on manifolds), the vast majority of columns are cleared before they need reduction. This is why Ripser can compute persistence of 10,000-point clouds in seconds.</div>

## The Twist Algorithm

The **twist algorithm** (Chen & Kerber 2011) exploits Poincaré duality on closed manifolds: if $$(\sigma_i, \sigma_j)$$ is a pair in dimension $$n$$, there is a corresponding dual pair in dimension $$d-n-1$$.

The algorithm processes dimensions from high to low. After reducing all $$n$$-dimensional columns, it uses the discovered pairings to immediately clear the corresponding $$(n-1)$$-dimensional columns. This significantly reduces the number of actual column reductions required.

**Effect**: On Vietoris-Rips complexes of manifold data, the twist algorithm combined with clearing reduces the practical complexity from $$O(n^3)$$ to nearly linear in the size of the output (number of persistence pairs).

<div class="insight-box"><strong>Key Insight:</strong> Ripser (Bauer 2021) implements both clearing and the cohomology algorithm (which runs in the opposite reduction direction and benefits even more from clearing). On typical benchmarks, Ripser is 10–1000× faster than earlier implementations. The key insight is that most columns are either cleared before reduction (positive simplices) or reduce quickly in cohomology (because the generators appear naturally in reverse order).</div>

## References

- C. Chen & M. Kerber, "Persistent Homology Computation with a Twist," *EuroCG*, 2011.
- U. Bauer, "Ripser: Efficient Computation of Vietoris-Rips Persistence Barcodes," *J. Applied and Computational Topology*, 2021. [arXiv:1908.02518](https://arxiv.org/abs/1908.02518).
