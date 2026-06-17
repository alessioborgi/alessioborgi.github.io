---
layout: single
title: "Extended Persistence: Capturing Topology Across the Full Range"
categories: [tdl]
book: tdl
subsection: core
tags: [extended-persistence, relative-homology, poincare-duality, long-bars]
published: false
excerpt: "Standard persistence misses features that never die within a finite filtration — typically the top-dimensional class of a closed manifold. Extended persistence augments the filtration with its dual to capture all features, using relative homology and Poincaré duality to produce complete pairings."
author_profile: true
read_time: true
icon: "↔️"
read_mins: 5
permalink: /blog/persistent-homology/extended-persistence/
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

<div class="tldr-box"><strong>TL;DR:</strong> In a sub-level set filtration on a compact manifold, the top homological class is born but never dies — it has infinite persistence. Extended persistence fixes this by concatenating the ascending filtration with a descending one (using relative homology). Every birth is now paired with a death, yielding a finite complete descriptor. Proved stable under the same bottleneck distance.</div>

**Intuition First.** Imagine hiking up a mountain and recording when you first see each topological feature. Standard persistence tracks features that are born as you ascend and die as you keep ascending. But the mountain's overall shape — the fact that you started at the bottom and reached the top — creates a feature that is born but never dies within the ascent alone. Extended persistence fixes this by continuing the journey back down the other side. Features that survived the whole ascent get paired with events on the descent, so every birth has a death and the diagram is complete.

<style>
@keyframes extended-fill {
  from { stroke-dashoffset: 200; }
  to   { stroke-dashoffset: 0; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 520 165" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;font-family:sans-serif;">
  <text x="260" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Extended filtration: ascending then descending</text>
  <!-- Mountain profile -->
  <polyline points="30,140 120,50 210,140" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <!-- Ascending phase labels -->
  <text x="55"  y="155" font-size="10" fill="#1e40af">a₀</text>
  <text x="80"  y="155" font-size="10" fill="#1e40af">a₁</text>
  <text x="105" y="155" font-size="10" fill="#1e40af">a₂</text>
  <text x="120" y="42"  font-size="10" fill="#1e40af" text-anchor="middle">aₙ=M</text>
  <!-- Ascending sub-levels -->
  <line x1="55"  y1="120" x2="55"  y2="140" stroke="#1e40af" stroke-width="1.5"/>
  <line x1="80"  y1="95"  x2="80"  y2="140" stroke="#1e40af" stroke-width="1.5"/>
  <line x1="105" y1="70"  x2="105" y2="140" stroke="#1e40af" stroke-width="1.5"/>
  <!-- Descending phase -->
  <text x="160" y="155" font-size="10" fill="#7c3aed">b₁</text>
  <text x="185" y="155" font-size="10" fill="#7c3aed">b₂</text>
  <line x1="160" y1="95"  x2="160" y2="140" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="185" y1="120" x2="185" y2="140" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Phase arrow -->
  <text x="120" y="155" font-size="10" fill="#0d9488" text-anchor="middle">↑ ascending</text>
  <!-- Barcode: standard persistence (one infinite bar) -->
  <rect x="260" y="35" width="240" height="120" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="380" y="52" font-size="11" fill="#475569" font-weight="bold" text-anchor="middle">Barcode comparison</text>
  <!-- Standard: long bar to infinity -->
  <text x="270" y="70" font-size="9" fill="#1e40af">Standard:</text>
  <line x1="330" y1="67" x2="360" y2="67" stroke="#1e40af" stroke-width="3"/>
  <line x1="360" y1="67" x2="490" y2="67" stroke="#1e40af" stroke-width="3" stroke-dasharray="5,3"/>
  <text x="493" y="71" font-size="10" fill="#1e40af">∞</text>
  <!-- Extended: finite bar -->
  <text x="270" y="95" font-size="9" fill="#7c3aed">Extended:</text>
  <line x1="330" y1="92" x2="460" y2="92" stroke="#7c3aed" stroke-width="3"/>
  <text x="463" y="96" font-size="9" fill="#7c3aed">paired!</text>
  <!-- H0 noise bars both -->
  <text x="270" y="120" font-size="9" fill="#94a3b8">H₀ noise</text>
  <line x1="330" y1="117" x2="355" y2="117" stroke="#94a3b8" stroke-width="2"/>
  <line x1="330" y1="130" x2="348" y2="130" stroke="#94a3b8" stroke-width="2"/>
  <line x1="330" y1="143" x2="342" y2="143" stroke="#94a3b8" stroke-width="2"/>
</svg>
<figcaption>Standard persistence (top bar): the top homological class is born during the ascent but never dies — giving an infinite bar. Extended persistence (middle bar): the descending phase pairs this feature with a death event, giving a finite bar. All features are now paired.</figcaption>
</figure></div>

## The Problem with Infinite Bars

Consider a height function $$f: M \to \mathbb{R}$$ on a compact manifold $$M$$. In the sub-level set filtration $$M^a = f^{-1}((-\infty, a])$$:
- When $$a$$ passes the global maximum, the full $$M$$ becomes connected — but the top fundamental class $$[M] \in H_d(M)$$ was born earlier and **never dies**: there is no higher simplex to kill it.
- Standard persistence gives it an interval $$[b, \infty)$$.

This infinite bar makes comparison between functions awkward and wastes information about when and how the global feature was created.

## The Extended Filtration

**Extended persistence** (Cohen-Steiner, Edelsbrunner, Harer 2009) extends the filtration beyond $$M = M^{\infty}$$ by a dual descent:

<div class="math-box">$$\emptyset = M^{a_0} \subseteq \cdots \subseteq M^{a_n} = M \supseteq M^{a_n,b_1} \supseteq \cdots \supseteq M^{a_n, b_n} = \emptyset$$</div>

where $$M^{a,b} = f^{-1}((b, \infty)) \cap M$$ is a **super-level set** (relative to $$M$$). Technically, the second half uses relative homology $$H_*(M, M^{a,b})$$.

The combined extended filtration has four types of feature intervals:

| Type | Born | Dies | Dimension |
|------|------|------|-----------|
| **Ordinary** | sub-level ascending | sub-level ascending | $$n$$ |
| **Relative** | relative (descending) | relative (descending) | $$n$$ |
| **Extended** | sub-level ascending | relative (descending) | $$n$$ |

## Poincaré Duality and Pairing

On a compact oriented $$d$$-manifold, Poincaré duality gives $$H_k(M) \cong H^{d-k}(M)$$. Extended persistence uses this duality to pair each ascending $$H_k$$ birth with a descending $$H_{d-k-1}$$ death. The extended pairing is:

- Every local minimum of $$f$$ is paired with a saddle (or vice versa, by Morse theory).
- Every $$k$$-cycle birth has a matching $$(k)$$-cycle death, even for the top class.

<div class="insight-box"><strong>Key Insight:</strong> Extended persistence is particularly useful for shape analysis on surfaces (triangulated meshes) and for comparing functions on manifolds. Since all bars are now finite, the standard bottleneck and Wasserstein distances apply without modification. Extended persistence is also the foundation for Reeb graph analysis and for proving tight stability bounds.</div>

## References

- D. Cohen-Steiner, H. Edelsbrunner, J. Harer, "Extending Persistence Using Poincaré and Lefschetz Duality," *Foundations of Computational Mathematics*, 2009. [arXiv:0901.3012](https://arxiv.org/abs/0901.3012).
- H. Edelsbrunner & J. Harer, *Computational Topology*, Chapter VII.
