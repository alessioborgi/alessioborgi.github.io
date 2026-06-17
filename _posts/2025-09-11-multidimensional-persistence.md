---
layout: single
title: "Multidimensional Persistence: Topology with Multiple Parameters"
categories: [tdl]
book: tdl
subsection: core
tags: [multidimensional-persistence, bifiltration, rank-invariant, multiparameter]
published: false
excerpt: "When data has multiple meaningful scale parameters (e.g., scale and density), a single filtration parameter is insufficient. Multidimensional persistence indexes complexes by tuples of parameters — but the elegant barcode theorem no longer holds, and only weaker invariants (rank functions, fibered barcodes) are computable."
author_profile: true
read_time: true
icon: "🧊"
read_mins: 5
permalink: /blog/persistent-homology/multidimensional-persistence/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> In 1D persistence, a bifiltration indexed by (scale, density) encodes richer topological information than either parameter alone. However, the 1D interval decomposition theorem fails in higher dimensions — most 2-parameter persistence modules are not decomposable into intervals. The rank invariant and fibered barcodes provide computable weaker summaries.</div>

**Intuition First.** Single-parameter persistence is like watching a shape through one adjustable lens: you control the scale, and the topology changes as you zoom. Multidimensional persistence is like having two independent lenses simultaneously — scale and density, for instance. The bad news is that no single "barcode" can encode what two independent lenses see: you get a two-dimensional parameter space, and the algebra becomes wild. The good news is that you can always slice along a line and get a 1D barcode for that slice — this is the fibered barcode, and it's practically very useful.

<div class="blog-figure"><figure>
<svg viewBox="0 0 480 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;font-family:sans-serif;">
  <text x="240" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">2-parameter persistence module and fibered barcode</text>
  <!-- 2D parameter space grid -->
  <rect x="30" y="30" width="150" height="120" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" rx="4"/>
  <text x="105" y="48" font-size="10" fill="#475569" text-anchor="middle" font-weight="bold">Parameter space (r, ρ)</text>
  <!-- Grid lines -->
  <line x1="30" y1="80"  x2="180" y2="80"  stroke="#e2e8f0" stroke-width="1"/>
  <line x1="30" y1="110" x2="180" y2="110" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="80" y1="30"  x2="80"  y2="150" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="130" y1="30" x2="130" y2="150" stroke="#e2e8f0" stroke-width="1"/>
  <!-- Rank invariant heatmap (rank values) -->
  <rect x="31"  y="31"  width="49" height="49" fill="#1e40af" fill-opacity="0.7" rx="2"/>
  <rect x="81"  y="31"  width="49" height="49" fill="#1e40af" fill-opacity="0.5" rx="2"/>
  <rect x="131" y="31"  width="49" height="49" fill="#1e40af" fill-opacity="0.3" rx="2"/>
  <rect x="31"  y="81"  width="49" height="29" fill="#1e40af" fill-opacity="0.4" rx="2"/>
  <rect x="81"  y="81"  width="49" height="29" fill="#1e40af" fill-opacity="0.2" rx="2"/>
  <rect x="131" y="81"  width="49" height="29" fill="#1e40af" fill-opacity="0.1" rx="2"/>
  <!-- Rank values -->
  <text x="55"  y="60" font-size="11" fill="white" text-anchor="middle" font-weight="bold">3</text>
  <text x="105" y="60" font-size="11" fill="white" text-anchor="middle" font-weight="bold">2</text>
  <text x="155" y="60" font-size="11" fill="#1e40af" text-anchor="middle" font-weight="bold">1</text>
  <text x="55"  y="100" font-size="11" fill="white" text-anchor="middle" font-weight="bold">2</text>
  <text x="105" y="100" font-size="11" fill="#1e40af" text-anchor="middle" font-weight="bold">1</text>
  <text x="155" y="100" font-size="11" fill="#1e40af" text-anchor="middle" font-weight="bold">0</text>
  <!-- Axis labels -->
  <text x="105" y="163" font-size="10" fill="#64748b" text-anchor="middle">scale r →</text>
  <text x="18" y="100"  font-size="10" fill="#64748b" text-anchor="middle" transform="rotate(-90,18,100)">density ρ →</text>
  <!-- Fibered barcode: slice along a line -->
  <line x1="45" y1="145" x2="175" y2="45" stroke="#f97316" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="195" y="42" font-size="10" fill="#f97316">line L</text>
  <!-- Arrow to barcode -->
  <line x1="215" y1="90" x2="245" y2="90" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="243,85 253,90 243,95" fill="#94a3b8"/>
  <text x="229" y="83" font-size="9" fill="#64748b" text-anchor="middle">restrict</text>
  <text x="229" y="100" font-size="9" fill="#64748b" text-anchor="middle">to L</text>
  <!-- 1D barcode panel -->
  <rect x="260" y="40" width="200" height="110" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="360" y="58" font-size="10" fill="#f97316" font-weight="bold" text-anchor="middle">Fibered barcode on L</text>
  <line x1="275" y1="75" x2="440" y2="75" stroke="#1e40af" stroke-width="4" opacity="0.8"/>
  <line x1="290" y1="92" x2="415" y2="92" stroke="#1e40af" stroke-width="4" opacity="0.6"/>
  <line x1="310" y1="109" x2="380" y2="109" stroke="#1e40af" stroke-width="4" opacity="0.4"/>
  <text x="270" y="138" font-size="9" fill="#64748b">t along L →</text>
</svg>
<figcaption>Left: the rank invariant of a 2-parameter persistence module as a heatmap over parameter space (r, ρ). The orange dashed line L is one slice. Right: restricting the module to L gives a 1D barcode — the fibered barcode on that line.</figcaption>
</figure></div>

## Why Multiple Parameters?

Single-parameter persistence is limited because real data often has multiple relevant scales:

- **Noisy point clouds**: simultaneously filter by distance scale $$r$$ and density threshold $$\rho$$. Points in sparse regions (noise) should be down-weighted.
- **Weighted networks**: filter simultaneously by edge weight and node degree.
- **Image data**: filter by pixel intensity and local gradient.

The **Rips density bifiltration** defines $$K^{(r,\rho)} = \mathrm{Rips}(P_\rho, r)$$ where $$P_\rho = \{p \in P : \rho(p) \geq \rho\}$$ and $$\rho(p)$$ is a local density estimate at $$p$$. This is monotone in both parameters: increasing $$r$$ adds simplices, decreasing $$\rho$$ adds more points.

## Persistence Modules over Posets

A **2-parameter persistence module** assigns a vector space $$M_{(a,b)}$$ to each point $$(a,b) \in \mathbb{R}^2$$ and a linear map $$M_{(a,b)} \to M_{(a',b')}$$ whenever $$(a,b) \leq (a', b')$$ (componentwise). This is a functor from the poset $$(\mathbb{R}^2, \leq)$$ to vector spaces.

**The bad news** (Carlsson & Zomorodian 2009): For 2-parameter persistence modules over fields, there is generally **no complete discrete invariant** analogous to the barcode. The indecomposable representations of the 2-parameter grid poset are not classified by a finite set of intervals — the representation theory is "wild."

## Computable Invariants

Despite the negative result, several useful invariants exist:

**Rank invariant**: For $$(a,b) \leq (a',b')$$, define:
<div class="math-box">$$\mathrm{rank}(a,b,a',b') = \dim \mathrm{im}(M_{(a,b)} \to M_{(a',b')})$$</div>

The rank invariant captures how many topological features persist from scale $$(a,b)$$ to scale $$(a',b')$$.

**Fibered barcodes**: For a line $$L$$ in parameter space, the restriction of $$M$$ to $$L$$ is a 1-parameter persistence module with a well-defined barcode. The collection of barcodes over all lines is the **fibered barcode**.

**RIVET**: A software tool (Lesnick & Wright 2015) that computes and visualises fibered barcodes efficiently using a 2D arrangement structure.

<div class="insight-box"><strong>Key Insight:</strong> The failure of a complete barcode-type invariant in 2+ parameters is fundamental — it is not a computational limitation but an algebraic one. Recent work (2020–2025) on "minimal presentations" and "stable rank invariants" is making multidimensional persistence increasingly practical. For most applications, the fibered barcode computed along a relevant family of lines gives sufficient information.</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The algebraic hardness of multidimensional persistence is not a gap waiting to be filled — it is provably fundamental. The representation theory of the 2-parameter grid poset is "wild" (contains all finite-dimensional algebras as quotients), meaning no finite list of indecomposable types can exist. Practical progress therefore comes from weaker but computable invariants: the rank invariant, fibered barcodes, and minimal presentations, all of which are now implemented in RIVET.</div>

## References

- G. Carlsson & A. Zomorodian, "The Theory of Multidimensional Persistence," *Discrete & Computational Geometry*, 2009.
- M. Lesnick & M. Wright, "Interactive Visualisation of 2-D Persistence Modules," arXiv:1512.00180.
- RIVET: [rivet.readthedocs.io](https://rivet.readthedocs.io)
