---
layout: single
title: "Persistence Landscapes: Statistical Topological Data Analysis"
categories: [persistent-homology]
book: persistent-homology
subsection: ml-integration
tags: [persistence-landscape, Banach-space, mean-landscape, central-limit-theorem, Bubenik]
published: false
excerpt: "Persistence landscapes (Bubenik, 2015) map a persistence diagram into a sequence of piecewise-linear functions, forming a Banach space representation. This enables averaging, variance computation, and hypothesis testing directly on persistence diagrams — the statistical machinery needed for TDA-based inference. They also admit an exact central limit theorem, making them the right representation for statistical TDA."
author_profile: true
read_time: true
is_overview: false
icon: "📉"
read_mins: 4
permalink: /blog/persistent-homology/persistence-landscapes/
---
{% include figure image_path="/images/blog/tdl/carriere2020_perslay.png" alt="Persistence landscapes" caption="Landscape-based persistence representation (Carrière et al., 2020)" %}

## Intuition First

Suppose you have 50 brain scans from healthy subjects and 50 from patients with a neurological condition. You compute a persistence diagram for each scan. Now you want to ask: "Is there a statistically significant topological difference between the two groups?"

To do this, you need to **average** persistence diagrams and compute **confidence intervals**. But persistence diagrams are multisets — you cannot add two multisets and divide by two in any meaningful way. You need a representation that lives in a vector space.

Persistence landscapes solve this by converting each diagram into a **sequence of tent functions** — piecewise-linear curves stacked on top of each other. These curves live in an $L^p$ function space, where averaging, variance, and the central limit theorem all apply. The first landscape function captures the most prominent topological features; subsequent ones capture the next layer down, and so on.

---

## Construction

Given a persistence diagram $\text{Dgm} = \{(b_i, d_i)\}$, define for each point a **tent function**:

$$f_i(t) = \begin{cases}
t - b_i & b_i \leq t \leq \tfrac{b_i + d_i}{2} \\
d_i - t & \tfrac{b_i + d_i}{2} < t \leq d_i \\
0 & \text{otherwise}
\end{cases}$$

This is a triangle with peak at $t = \frac{b_i + d_i}{2}$, height $\frac{d_i - b_i}{2}$ (half the persistence), and support $[b_i, d_i]$.

The **$k$-th landscape function** is then:

$$\lambda_k(t) = \text{kmax}_{i}\, f_i(t)$$

where $\text{kmax}$ denotes the $k$-th largest value. So $\lambda_1$ is the upper envelope, $\lambda_2$ is the second-highest, and so on.

The **persistence landscape** is the sequence $\lambda = (\lambda_1, \lambda_2, \ldots)$, typically truncated at some $K$.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Each landscape function $\lambda_k$ is piecewise-linear and lives in $L^p(\mathbb{R})$ for any $p \geq 1$. The full landscape lives in $\bigoplus_k L^p(\mathbb{R})$, a Banach space. This is why you can average landscapes: the mean landscape $\bar{\lambda}_k(t) = \frac{1}{n}\sum_{j=1}^n \lambda_k^{(j)}(t)$ is simply the pointwise average of functions — perfectly well-defined.</div>

---

## Animated Construction: Three Bars → Landscape

<style>
@keyframes drawTent {
  from { stroke-dashoffset: 200; opacity: 0; }
  to   { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes drawEnvelope {
  from { stroke-dashoffset: 400; opacity: 0; }
  to   { stroke-dashoffset: 0; opacity: 1; }
}
.tent-line    { stroke-dasharray: 200; animation: drawTent 0.7s ease forwards; }
.env-line     { stroke-dasharray: 400; animation: drawEnvelope 0.9s ease forwards; }
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:540px;display:block;margin:auto;">

  <!-- Left panel: barcode -->
  <rect x="5" y="10" width="210" height="200" rx="5" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="110" y="25" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">Barcode (3 bars)</text>
  <!-- t-axis -->
  <line x1="20" y1="185" x2="205" y2="185" stroke="#94a3b8" stroke-width="1"/>
  <text x="207" y="188" font-size="9" fill="#94a3b8">t</text>
  <text x="20" y="196" font-size="8" fill="#94a3b8">0</text>
  <text x="195" y="196" font-size="8" fill="#94a3b8">10</text>

  <!-- Bar 1: [1, 9] — long, prominent -->
  <line x1="37" y1="70" x2="183" y2="70" stroke="#3b82f6" stroke-width="6" stroke-linecap="round"/>
  <text x="110" y="65" text-anchor="middle" font-size="9" fill="#1d4ed8">[1, 9]</text>

  <!-- Bar 2: [2, 6] — medium -->
  <line x1="55" y1="110" x2="128" y2="110" stroke="#7c3aed" stroke-width="5" stroke-linecap="round"/>
  <text x="92" y="105" text-anchor="middle" font-size="9" fill="#5b21b6">[2, 6]</text>

  <!-- Bar 3: [3, 5] — short -->
  <line x1="73" y1="145" x2="100" y2="145" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
  <text x="87" y="140" text-anchor="middle" font-size="9" fill="#065f46">[3, 5]</text>

  <!-- Right panel: landscape functions -->
  <rect x="260" y="10" width="215" height="200" rx="5" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="368" y="25" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">Persistence Landscape</text>

  <!-- axes -->
  <line x1="275" y1="185" x2="465" y2="185" stroke="#94a3b8" stroke-width="1"/>
  <line x1="275" y1="185" x2="275" y2="30"  stroke="#94a3b8" stroke-width="1"/>
  <text x="467" y="188" font-size="9" fill="#94a3b8">t</text>
  <text x="268" y="33" font-size="9" fill="#94a3b8">λ</text>
  <!-- t axis labels -->
  <text x="292" y="196" font-size="8" fill="#94a3b8">1</text>
  <text x="311" y="196" font-size="8" fill="#94a3b8">2</text>
  <text x="330" y="196" font-size="8" fill="#94a3b8">3</text>
  <text x="349" y="196" font-size="8" fill="#94a3b8">4</text>
  <text x="368" y="196" font-size="8" fill="#94a3b8">5</text>
  <text x="387" y="196" font-size="8" fill="#94a3b8">6</text>
  <text x="425" y="196" font-size="8" fill="#94a3b8">9</text>

  <!-- Tent for [1,9]: peak at t=5, height=4 -->
  <!-- Peak pixel: t=5 → x=368, height 4 units → y = 185 - 4*18 = 185-72 = 113 -->
  <polyline points="292,185 368,113 444,185"
    stroke="#3b82f6" stroke-width="1.8" fill="none"
    class="tent-line" style="animation-delay:0.2s"/>

  <!-- Tent for [2,6]: peak at t=4, height=2 -->
  <!-- t=4 → x=349, height 2 → y=185-36=149; t=2→x=311, t=6→x=387 -->
  <polyline points="311,185 349,149 387,185"
    stroke="#7c3aed" stroke-width="1.8" fill="none"
    class="tent-line" style="animation-delay:0.5s"/>

  <!-- Tent for [3,5]: peak at t=4, height=1 -->
  <!-- t=3→x=330, t=4→x=349, height 1→y=185-18=167, t=5→x=368 -->
  <polyline points="330,185 349,167 368,185"
    stroke="#059669" stroke-width="1.8" fill="none"
    class="tent-line" style="animation-delay:0.8s"/>

  <!-- λ1 envelope (upper envelope of the three tents) -->
  <!-- From t=1 to t=2: only [1,9] active, follows blue tent -->
  <!-- From t=2: [1,9] and [2,6] overlap; [1,9] is higher until they cross -->
  <!-- Crossing of [1,9] and [2,6]: 185-18*(t-1)=185-18*(t-2) → never cross since [1,9] always ≥ [2,6] in their shared support -->
  <!-- Actually [1,9] has value 18*(t-1) for t<5 and [2,6] has value 18*(t-2) for t<4 -->
  <!-- At t=4: [1,9]=54, [2,6]=36, so [1,9] always dominates in λ1 -->
  <polyline points="292,185 368,113 444,185"
    stroke="#f97316" stroke-width="2.5" fill="none" stroke-dasharray="6,3"
    class="env-line" style="animation-delay:1.2s"/>

  <!-- Legend -->
  <line x1="265" y1="208" x2="280" y2="208" stroke="#3b82f6" stroke-width="2"/>
  <text x="283" y="211" font-size="8" fill="#1e293b">f[1,9]</text>
  <line x1="310" y1="208" x2="325" y2="208" stroke="#7c3aed" stroke-width="2"/>
  <text x="328" y="211" font-size="8" fill="#1e293b">f[2,6]</text>
  <line x1="355" y1="208" x2="370" y2="208" stroke="#059669" stroke-width="2"/>
  <text x="373" y="211" font-size="8" fill="#1e293b">f[3,5]</text>
  <line x1="400" y1="208" x2="415" y2="208" stroke="#f97316" stroke-width="2.5" stroke-dasharray="5,2"/>
  <text x="418" y="211" font-size="8" fill="#1e293b">λ₁</text>
</svg>
<figcaption>Three persistence bars generate three tent functions. The first landscape λ₁ (orange dashed) is their upper envelope — here dominated by the long bar [1,9].</figcaption>
</figure>
</div>

---

## Worked Numerical Example

**Diagram:** $\{(1, 9),\, (2, 6),\, (3, 5)\}$

**Tent function values at $t = 4$:**
- $f_{[1,9]}(4) = 4 - 1 = 3$ (ascending side, peak at $t=5$)
- $f_{[2,6]}(4) = 4 - 2 = 2$ (ascending side, peak at $t=4$)
- $f_{[3,5]}(4) = 4 - 3 = 1$ (ascending side, peak at $t=4$)

**Landscape values at $t = 4$:**
- $\lambda_1(4) = \max(3, 2, 1) = 3$
- $\lambda_2(4) = \text{2nd max}(3, 2, 1) = 2$
- $\lambda_3(4) = \text{3rd max}(3, 2, 1) = 1$

**Tent function values at $t = 7$:**
- $f_{[1,9]}(7) = 9 - 7 = 2$ (descending side)
- $f_{[2,6]}(7) = 0$ (outside support $[2,6]$)
- $f_{[3,5]}(7) = 0$ (outside support $[3,5]$)

**Landscape values at $t = 7$:**
- $\lambda_1(7) = 2$, $\lambda_2(7) = 0$, $\lambda_3(7) = 0$

---

## Statistical Properties

Because landscapes live in $L^p(\mathbb{R})$, standard statistical tools apply directly:

**Mean landscape** of a sample $\{\text{Dgm}^{(j)}\}_{j=1}^n$:
$$\bar{\lambda}_k(t) = \frac{1}{n} \sum_{j=1}^n \lambda_k^{(j)}(t)$$

**Variance:**
$$\text{Var}_k(t) = \frac{1}{n} \sum_{j=1}^n \left(\lambda_k^{(j)}(t) - \bar{\lambda}_k(t)\right)^2$$

**Central Limit Theorem (Bubenik & Dlotko, 2017):** Under mild conditions, $\sqrt{n}(\bar{\lambda} - \mathbb{E}[\lambda])$ converges in distribution to a Gaussian process in $L^2(\mathbb{R})$. This enables exact confidence bands and hypothesis tests.

**Permutation test** for two-sample comparison: compute the test statistic $\|\bar{\lambda}_A - \bar{\lambda}_B\|_{L^2}$ and compare to the permutation distribution.

---

## Stability

**Theorem.** $\|\lambda(T_1) - \lambda(T_2)\|_{L^p} \leq W_p(T_1, T_2)$

Persistence landscapes are stable: small changes in the diagram produce small changes in the landscape in the $L^p$ norm. Combined with the CLT, this makes them the gold standard for statistical hypothesis testing in TDA.

---

## Comparison: Landscapes vs Images

| Property | Persistence Images | Persistence Landscapes |
|----------|-------------------|----------------------|
| Output space | $\mathbb{R}^{n \times n}$ (finite vector) | $L^p(\mathbb{R})$ (function sequence) |
| Statistical tools | Ad-hoc | Full $L^p$ statistics, CLT |
| Stability | $W_1$ stable | $W_p$ stable (exact) |
| Hyperparameters | Grid size, bandwidth, weight | None (or truncation depth $K$) |
| Differentiability | Yes (smooth Gaussians) | Piecewise-linear (subgradient) |

---

## References

- Bubenik, P. (2015). *Statistical topological data analysis using persistence landscapes.* JMLR.
- Bubenik, P., & Dlotko, P. (2017). *A persistence landscapes toolbox for topological statistics.* Journal of Symbolic Computation.
- Chazal, F. et al. (2014). *Stochastic convergence of persistence landscapes and silhouettes.* SoCG.
