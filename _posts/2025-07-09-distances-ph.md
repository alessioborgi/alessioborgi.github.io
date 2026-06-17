---
layout: single
title: "Wasserstein and Bottleneck Distances Between Persistence Diagrams"
categories: [persistent-homology]
book: persistent-homology
subsection: core
tags: [Wasserstein-distance, bottleneck-distance, optimal-transport, diagram-matching, metric]
published: false
excerpt: "Comparing persistence diagrams requires a metric on the space of multisets. The bottleneck distance measures the minimum cost of matching all points via a bijection (allowing unmatched points to be sent to the diagonal). The p-Wasserstein distance trades the max-cost matching for an L^p sum. Both are stable, computable, and widely used in TDA pipelines."
author_profile: true
read_time: true
is_overview: false
icon: "📏"
read_mins: 4
permalink: /blog/persistent-homology/distances-ph/
---
{% include figure image_path="/images/blog/tdl/hofer2020_topological_layers.png" alt="Distances between persistence diagrams" caption="Topological distance representations (Hofer et al., 2020)" %}

## Intuition First

Imagine two scatter plots — your two persistence diagrams — each with a handful of points. You want to say "these two diagrams are similar." But how? You cannot simply take a Euclidean distance between two point sets of potentially different sizes.

The key idea is an **optimal matching**: pair up each point in diagram A with either a point in diagram B, or with its own nearest point on the diagonal (the line $b = d$). Sending a point to the diagonal means declaring it "unpaired" — a topological feature we choose not to match. The cost of this choice is proportional to the point's persistence ($d - b$), so short-lived noise is cheaply discarded.

The **bottleneck distance** then asks: what is the minimum, over all such matchings, of the *maximum* edge cost? The **Wasserstein distance** instead sums (or takes the $L^p$ norm of) all edge costs. Both yield a genuine metric on the space of persistence diagrams.

---

## Mathematical Setup

Let $\text{Dgm}(X)$ denote the persistence diagram of a filtered space $X$, viewed as a multiset of points $(b_i, d_i)$ above the diagonal in $\mathbb{R}^2$, together with all diagonal points (with infinite multiplicity, representing the "free" option of sending any point to $\Delta$).

A **partial matching** between diagrams $\text{Dgm}_1$ and $\text{Dgm}_2$ is a bijection

$$\mu : \text{Dgm}_1 \cup \Delta \;\longrightarrow\; \text{Dgm}_2 \cup \Delta$$

where diagonal points can be matched to diagonal points at zero cost.

The **cost** of matching point $p = (b, d)$ to point $q = (b', d')$ is $\|p - q\|_\infty = \max(|b - b'|, |d - d'|)$. The cost of sending $p$ to the diagonal is $\|p - \Delta\|_\infty = \frac{d - b}{2}$.

---

## Bottleneck Distance

$$d_B(\text{Dgm}_1, \text{Dgm}_2) \;=\; \inf_{\mu} \sup_{p \in \text{Dgm}_1 \cup \Delta} \|p - \mu(p)\|_\infty$$

The bottleneck distance is controlled by the **single worst-matched pair**. It is robust to noise (small perturbations of the input space change $d_B$ by at most the size of the perturbation — the stability theorem) but can ignore many-to-few imbalances.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The bottleneck distance is essentially the <em>minimax</em> matching cost. It is dominated by the largest unmatched feature. If one diagram has a single highly persistent point that the other lacks, the bottleneck distance is determined entirely by that point — regardless of how well everything else matches.</div>

---

## p-Wasserstein Distance

$$W_p(\text{Dgm}_1, \text{Dgm}_2) \;=\; \left(\inf_{\mu} \sum_{p \in \text{Dgm}_1 \cup \Delta} \|p - \mu(p)\|_\infty^p\right)^{1/p}$$

The Wasserstein distance **aggregates all matching costs**. Common choices: $p = 1$ (total cost, robust) and $p = 2$ (least-squares, differentiable in practice). As $p \to \infty$, $W_p \to d_B$.

**Relationship:** $d_B \leq W_p$ always. Wasserstein is more sensitive to bulk differences; bottleneck is more sensitive to outlier features.

---

## Animated Example: Matching Two Diagrams

The animation below shows the optimal bottleneck matching between two small persistence diagrams. Each off-diagonal point is matched either to its counterpart in the other diagram (blue edge) or sent to the diagonal (orange edge).

<style>
@keyframes drawEdge {
  from { stroke-dashoffset: 60; opacity: 0; }
  to   { stroke-dashoffset: 0;  opacity: 1; }
}
@keyframes popDot {
  0%   { r: 0; }
  60%  { r: 7; }
  100% { r: 5; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.match-edge {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: drawEdge 0.7s ease forwards;
}
.match-dot { animation: popDot 0.5s ease forwards; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto;">
  <!-- Diagram 1 (left) -->
  <rect x="10" y="10" width="180" height="180" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="100" y="198" text-anchor="middle" font-size="11" fill="#64748b">Diagram 1</text>
  <!-- diagonal -->
  <line x1="10" y1="190" x2="190" y2="10" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,3"/>
  <!-- axes labels -->
  <text x="12" y="196" font-size="9" fill="#94a3b8">b</text>
  <text x="8" y="14" font-size="9" fill="#94a3b8">d</text>
  <!-- Points in Dgm1 -->
  <circle cx="60"  cy="140" r="5" fill="#3b82f6" class="match-dot" style="animation-delay:0.1s"/>
  <circle cx="100" cy="80"  r="5" fill="#3b82f6" class="match-dot" style="animation-delay:0.2s"/>
  <circle cx="140" cy="50"  r="5" fill="#3b82f6" class="match-dot" style="animation-delay:0.3s"/>
  <!-- labels -->
  <text x="63"  y="135" font-size="9" fill="#1d4ed8">A</text>
  <text x="103" y="75"  font-size="9" fill="#1d4ed8">B</text>
  <text x="143" y="45"  font-size="9" fill="#1d4ed8">C</text>

  <!-- Diagram 2 (right) -->
  <rect x="230" y="10" width="180" height="180" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="320" y="198" text-anchor="middle" font-size="11" fill="#64748b">Diagram 2</text>
  <line x1="230" y1="190" x2="410" y2="10" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,3"/>
  <text x="232" y="196" font-size="9" fill="#94a3b8">b</text>
  <text x="228" y="14" font-size="9" fill="#94a3b8">d</text>
  <!-- Points in Dgm2 -->
  <circle cx="275" cy="135" r="5" fill="#10b981" class="match-dot" style="animation-delay:0.4s"/>
  <circle cx="330" cy="75"  r="5" fill="#10b981" class="match-dot" style="animation-delay:0.5s"/>
  <!-- D is near-diagonal, cheaply sent to diagonal -->
  <circle cx="380" cy="165" r="5" fill="#10b981" class="match-dot" style="animation-delay:0.6s"/>
  <text x="278" y="130" font-size="9" fill="#065f46">A'</text>
  <text x="333" y="70"  font-size="9" fill="#065f46">B'</text>
  <text x="383" y="160" font-size="9" fill="#065f46">D</text>

  <!-- Matching arrows: A→A', B→B' (cross-diagram, shown as curved lines through centre) -->
  <!-- Represent matching conceptually with colour-coded connector arrows -->
  <path d="M65 140 C 150 90, 200 100, 270 138" stroke="#3b82f6" stroke-width="1.5" fill="none"
        stroke-dasharray="60" class="match-edge" style="animation-delay:0.8s"/>
  <path d="M105 80 C 170 55, 210 60, 325 78" stroke="#3b82f6" stroke-width="1.5" fill="none"
        stroke-dasharray="60" class="match-edge" style="animation-delay:1.0s"/>
  <!-- C sent to diagonal (orange) -->
  <line x1="140" y1="50" x2="168" y2="22" stroke="#f97316" stroke-width="1.5"
        stroke-dasharray="30" class="match-edge" style="animation-delay:1.2s"/>
  <!-- D sent to diagonal (orange) -->
  <line x1="380" y1="165" x2="398" y2="147" stroke="#f97316" stroke-width="1.5"
        stroke-dasharray="25" class="match-edge" style="animation-delay:1.4s"/>

  <!-- Legend -->
  <line x1="30" y1="8" x2="50" y2="8" stroke="#3b82f6" stroke-width="2"/>
  <text x="53" y="11" font-size="9" fill="#1e293b">matched pair</text>
  <line x1="120" y1="8" x2="140" y2="8" stroke="#f97316" stroke-width="2" stroke-dasharray="4,2"/>
  <text x="143" y="11" font-size="9" fill="#1e293b">→ diagonal</text>
</svg>
<figcaption>Optimal bottleneck matching: blue edges pair off-diagonal points; orange dashed edges send near-diagonal points to Δ at cost (persistence)/2.</figcaption>
</figure>
</div>

---

## Worked Numerical Example

**Setup.** Let $\text{Dgm}_1 = \{(0, 3),\,(1, 4)\}$ and $\text{Dgm}_2 = \{(0.2, 3.1)\}$.

We must find a bijection between $\text{Dgm}_1 \cup \Delta$ and $\text{Dgm}_2 \cup \Delta$.

**Option 1 — Match $(0,3) \leftrightarrow (0.2, 3.1)$, send $(1,4)$ to diagonal.**

- Cost of $(0,3) \leftrightarrow (0.2, 3.1)$: $\|(0,3)-(0.2,3.1)\|_\infty = \max(0.2, 0.1) = 0.2$
- Cost of $(1,4) \to \Delta$: persistence $= 4 - 1 = 3$, diagonal cost $= 3/2 = 1.5$
- **Bottleneck cost: $\max(0.2, 1.5) = 1.5$**

**Option 2 — Match $(1,4) \leftrightarrow (0.2, 3.1)$, send $(0,3)$ to diagonal.**

- Cost of $(1,4) \leftrightarrow (0.2,3.1)$: $\max(0.8, 0.9) = 0.9$
- Cost of $(0,3) \to \Delta$: $3/2 = 1.5$
- **Bottleneck cost: $\max(0.9, 1.5) = 1.5$**

Both options give $d_B = 1.5$. The bottleneck distance is determined by the unmatched, persistent point $(0,3)$ in option 1 and by the diagonal sending in both cases.

**Wasserstein $W_1$ for Option 1:** $0.2 + 1.5 = 1.7$. For Option 2: $0.9 + 1.5 = 2.4$. So $W_1 = 1.7$ (Option 1 is optimal for $W_1$).

---

## Stability Theorem

The stability theorem (Cohen-Steiner et al., 2007) is the central theoretical justification for using these distances:

$$d_B(\text{Dgm}(f), \text{Dgm}(g)) \;\leq\; \|f - g\|_\infty$$

Small perturbations of the input function $f$ (or the point cloud) produce small changes in the persistence diagram under the bottleneck metric. Wasserstein stability requires additional regularity (tameness conditions).

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Stability is what makes TDA useful in practice. Without it, a tiny amount of noise could create or destroy many topological features, making the pipeline meaningless. The diagonal acts as a "noise floor": features with small persistence (close to Δ) are the cheap ones to discard.</div>

---

## Computational Complexity

- **Bottleneck distance**: reducible to maximum bipartite matching. Runs in $O(n^{3/2} \log n)$ for $n$ points per diagram using the Hopcroft–Karp algorithm.
- **Wasserstein distance**: Hungarian algorithm or auction-based methods, $O(n^3)$ naive, but faster in practice with geometric data structures.
- In Python: `gudhi.bottleneck_distance`, `persim.wasserstein`, `scikit-tda` all provide fast implementations.

---

## References

- Cohen-Steiner, D., Edelsbrunner, H., & Harer, J. (2007). *Stability of persistence diagrams.* Discrete & Computational Geometry.
- Mémoli, F. (2011). *Gromov–Wasserstein distances and the metric approach to object matching.* Foundations of Computational Mathematics.
- Hofer, C. et al. (2020). *Graph filtration learning.* ICML.
