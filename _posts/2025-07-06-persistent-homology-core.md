---
layout: single
title: "Persistent Homology: Tracking Topological Features Across Scales"
categories: [tdl]
book: tdl
subsection: core
tags: [persistent-homology, birth-death, persistence, filtration, topological-features]
published: false
excerpt: "Persistent homology applies homology to a filtration rather than a single space. Each topological feature — a connected component, a loop, a void — has a birth time (when it first appears) and a death time (when it merges with an older feature). Persistence pairs these events into a complete multi-scale description of shape."
author_profile: true
read_time: true
is_overview: false
icon: "🔁"
read_mins: 5
permalink: /blog/persistent-homology/persistent-homology-core/
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Persistent homology applies homology to a filtration. Each topological feature has a birth time (when it first appears) and a death time (when it merges with an older feature or becomes trivial). The full lifetime of all features is encoded in a persistence diagram — a multi-scale, noise-robust shape signature. The fundamental decomposition theorem guarantees this encoding is complete and unique.</div>
{% include figure image_path="/images/blog/tdl/carriere2020_perslay.png" alt="Persistent homology barcodes" caption="Persistent homology via PersLay (Carrière et al., 2020)" %}


**Intuition First.** Think of a persistence module as a film reel. Each frame is a vector space (the homology group at that scale), and consecutive frames are connected by linear maps (induced by inclusions). The decomposition theorem says: every such film can be cut into independent single-feature films, each showing one topological feature alive for exactly one contiguous interval. The barcode is just the list of those intervals — a complete, lossless description of the entire reel.

<style>
@keyframes bar-grow {
  from { width: 0; opacity: 0; }
  to   { opacity: 1; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;font-family:sans-serif;">
  <!-- Title -->
  <text x="260" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Barcode: each bar = one topological feature [birth, death)</text>
  <!-- Axis -->
  <line x1="60" y1="150" x2="490" y2="150" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="60"  y="165" font-size="10" fill="#64748b" text-anchor="middle">0</text>
  <text x="160" y="165" font-size="10" fill="#64748b" text-anchor="middle">r₁</text>
  <text x="280" y="165" font-size="10" fill="#64748b" text-anchor="middle">r₂</text>
  <text x="400" y="165" font-size="10" fill="#64748b" text-anchor="middle">r₃</text>
  <text x="490" y="165" font-size="10" fill="#64748b" text-anchor="middle">∞</text>
  <!-- H0 bars -->
  <text x="30" y="45" font-size="10" fill="#1e40af" text-anchor="middle">H₀</text>
  <rect x="60" y="34" width="430" height="10" rx="3" fill="#1e40af" opacity="0.8"/>
  <rect x="60" y="48" width="100" height="10" rx="3" fill="#1e40af" opacity="0.5"/>
  <rect x="60" y="62" width="80"  height="10" rx="3" fill="#1e40af" opacity="0.5"/>
  <!-- H1 bar -->
  <text x="30" y="100" font-size="10" fill="#ef4444" text-anchor="middle">H₁</text>
  <rect x="160" y="89" width="120" height="10" rx="3" fill="#ef4444" opacity="0.85"/>
  <text x="160" y="85" font-size="9" fill="#ef4444">born</text>
  <text x="280" y="85" font-size="9" fill="#ef4444">died</text>
  <!-- H2 bar (essential) -->
  <text x="30" y="130" font-size="10" fill="#7c3aed" text-anchor="middle">H₂</text>
  <rect x="280" y="119" width="210" height="10" rx="3" fill="#7c3aed" opacity="0.7"/>
  <text x="490" y="133" font-size="9" fill="#7c3aed">essential (→∞)</text>
  <!-- Persistence annotation -->
  <line x1="160" y1="108" x2="280" y2="108" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="220" y="120" font-size="9" fill="#ef4444" text-anchor="middle">persistence = r₂ − r₁</text>
</svg>
<figcaption>A schematic barcode. Blue bars are H₀ (connected components); the red H₁ bar captures one loop alive from r₁ to r₂; the purple H₂ bar is an essential class that never dies.</figcaption>
</figure></div>

## Persistence Modules

Given a filtration $$\{K_\varepsilon\}_{\varepsilon \geq 0}$$, applying the $$k$$-th homology functor gives a **persistence module**: a family of vector spaces $$\{H_k(K_\varepsilon)\}_{\varepsilon \geq 0}$$ connected by linear maps induced by inclusions:

<div class="math-box">
$$\iota_{\varepsilon_1, \varepsilon_2}: H_k(K_{\varepsilon_1}) \to H_k(K_{\varepsilon_2}) \quad \text{for } \varepsilon_1 \leq \varepsilon_2$$
</div>

These maps are the homological shadows of the simplicial inclusions $$K_{\varepsilon_1} \hookrightarrow K_{\varepsilon_2}$$. The persistence module records how topological classes are created (born) and destroyed (die) as the filtration grows.

A persistence module is **pointwise finite-dimensional** if each $$H_k(K_\varepsilon)$$ is finite-dimensional — which is guaranteed for finite simplicial complexes. Under this condition, the module decomposes as a direct sum of **interval modules**.

## The Fundamental Decomposition Theorem

**Theorem** (Zomorodian and Carlsson, 2005): Every pointwise finite-dimensional persistence module $$\mathbb{V}$$ over a field decomposes uniquely (up to isomorphism) as a direct sum of interval modules:

<div class="math-box">
$$\mathbb{V} \cong \bigoplus_{i} \mathbb{I}[b_i, d_i)$$
</div>

where each $$\mathbb{I}[b, d)$$ is the persistence module that equals the field $$\mathbf{k}$$ for $$\varepsilon \in [b, d)$$ and 0 otherwise, with identity maps within the interval.

This decomposition is the algebraic version of the barcode: each interval $$[b_i, d_i)$$ corresponds to one topological feature alive from scale $$b_i$$ to $$d_i$$. The collection of all intervals is the **barcode** $$\mathcal{B}_k(K)$$, and the multiset of endpoints $$\{(b_i, d_i)\}$$ is the **persistence diagram** $$\mathrm{dgm}_k(K)$$.

## The Elder Rule and Persistence Pairs

When two connected components (or higher-dimensional features) merge, the **elder rule** determines which survives: the feature with the earlier birth time is the "elder" and survives; the younger one dies. This rule ensures that the pairing of births and deaths is unique.

Algorithmically, persistence pairs are computed by reducing the boundary matrix (see the boundary matrix post). Each column reduction produces a pivot that corresponds to a birth–death pair $$(b, d)$$. Columns that are never reduced correspond to **essential classes** — features that persist to infinity, i.e., have $$d = \infty$$.

For a connected simplicial complex, there is always exactly one essential $$H_0$$ class (the single connected component) with birth 0 and death $$\infty$$. For closed surfaces, essential $$H_1$$ and $$H_2$$ classes record non-bounding cycles.

## Birth, Death, and Feature Significance

A homology class $$\gamma \in H_k(K_\varepsilon)$$ is said to be **born** at $$\varepsilon = b$$ if $$\gamma \notin \mathrm{im}(\iota_{b-\delta, b})$$ for any small $$\delta > 0$$: the class is genuinely new at scale $$b$$. It **dies** at $$\varepsilon = d$$ when its image under $$\iota_{b, d}$$ first merges with an older class, i.e., $$\iota_{b, d}(\gamma) \in \mathrm{im}(\iota_{0, d})$$ but $$\iota_{b, d-\delta}(\gamma) \notin \mathrm{im}(\iota_{0, d-\delta})$$.

The **persistence** $$\mathrm{pers}(\gamma) = d - b$$ measures feature lifetime. The stability theorem (Cohen-Steiner et al., 2007) shows that only features with persistence greater than the noise level $$\delta$$ are truly data-driven: the bottleneck distance between diagrams of perturbed inputs is bounded by the perturbation size.

<div class="insight-box"><strong>Key Insight:</strong> The fundamental decomposition theorem is the reason TDA works: it says the persistence module — an infinite-dimensional algebraic object — has a completely discrete, finite, canonical description: its barcode. This means we can represent all topological information at all scales with a finite multiset of intervals. No information is lost; no choices are made. The barcode is the unique complete invariant of the persistence module.</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The elder rule is what makes the persistence pairing <em>unique</em>. Without it, merging events would be ambiguous: when two components fuse, either could be declared dead. The elder rule resolves this canonically — the younger one dies — ensuring that every filtration has exactly one barcode, with no arbitrary choices. This uniqueness is what makes persistence diagrams a well-defined invariant.</div>

## Example: Two Loops

Consider a point cloud sampled from two disjoint circles. In $$\mathrm{dgm}_0$$, many components are born at small $$\varepsilon$$ and die as nearby points connect; one persistent component survives per loop until the two loops connect (if the inter-loop distance is large). In $$\mathrm{dgm}_1$$, two prominent points appear — one per loop — with high persistence (they are born when the loop forms and die only when the triangulation fills the interior, which happens at a much larger scale). These two off-diagonal points in $$\mathrm{dgm}_1$$ are the topological signature of "two circles."

## References

- H. Edelsbrunner, D. Letscher, and A. Zomorodian, "Topological Persistence and Simplification," *Discrete & Computational Geometry*, 28(4):511–533, 2002.
- A. Zomorodian and G. Carlsson, "Computing Persistent Homology," *Discrete & Computational Geometry*, 33(2):249–274, 2005. [PDF](https://geometry.stanford.edu/papers/zc-cph-05/zc-cph-05.pdf).
- H. Edelsbrunner and J. Harer, *Computational Topology: An Introduction*, AMS, 2010. The definitive textbook.
