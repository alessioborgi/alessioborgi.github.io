---
layout: single
title: "Persistence Images: From Diagrams to Vectors"
categories: [persistent-homology]
book: persistent-homology
subsection: ml-integration
tags: [persistence-image, vectorisation, weighting-function, Adams, kernel-methods]
published: false
excerpt: "Persistence diagrams are not vectors, so they cannot be directly fed into most ML models. Persistence images (Adams et al., 2017) fix this by mapping each point (b, d) to its persistence (d−b), placing a Gaussian kernel at each point, and rasterising onto a grid. The result is a stable, differentiable vector representation suitable for any kernel method or neural network."
author_profile: true
read_time: true
is_overview: false
icon: "🖼️"
read_mins: 4
permalink: /blog/persistent-homology/persistence-images/
---
{% include figure image_path="/images/blog/tdl/carriere2020_perslay.png" alt="Persistence images vectorisation" caption="Persistence vectorisation for ML (Carrière et al., 2020)" %}

## Intuition First

A persistence diagram is a point cloud in $\mathbb{R}^2$. Point clouds are awkward for machine learning: two diagrams can have different numbers of points, and the space of diagrams is not a vector space. You cannot average two diagrams the way you average two feature vectors.

Persistence images solve this by treating each diagram point as a **blob of ink**: smear a small Gaussian around each point $(b, d)$, weight the blob by how persistent the feature is (so noise near the diagonal contributes little), then photograph the result on a fixed pixel grid. Every diagram now maps to the same $n \times n$ array — a genuine vector you can hand to any classifier.

---

## The Construction (Adams et al., 2017)

**Step 1 — Change coordinates.** Map each point $(b, d)$ in the diagram to $(b, p)$ where $p = d - b$ is the **persistence**. Now all points have $p \geq 0$, and near-diagonal noise has $p \approx 0$.

**Step 2 — Weight by persistence.** Define a weighting function $w : \mathbb{R}^2 \to \mathbb{R}_{\geq 0}$ that is 0 on the diagonal ($p=0$) and increases with persistence. A common choice:

$$w(b, p) = \begin{cases} 0 & p \leq 0 \\ p / p_{\max} & 0 < p \leq p_{\max} \\ 1 & p > p_{\max} \end{cases}$$

**Step 3 — Kernel density surface.** Define the **persistence surface**:

$$\rho_T(z) = \sum_{(b,p) \in T} w(b,p) \cdot \phi_{(b,p)}(z)$$

where $\phi_{(b,p)}$ is a 2D Gaussian with bandwidth $\sigma$ centred at $(b, p)$, and $T$ is the set of points in the persistence diagram (in the new coordinates).

**Step 4 — Rasterise.** Discretise the surface $\rho_T$ on a fixed grid of pixels $\{I_{ij}\}$, integrating $\rho_T$ over each pixel cell:

$$I_{ij} = \iint_{\text{pixel}_{ij}} \rho_T(z)\, dz$$

The result is a vector $\mathbf{v}(T) \in \mathbb{R}^{n \times n}$ — the **persistence image**.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The weighting function is the critical design choice. Without it, near-diagonal noise (many low-persistence points) would dominate the image. With a linearly increasing weight, noise is suppressed and the image is dominated by topologically significant features. The weighting also makes the map stable: the persistence image distance is bounded by the Wasserstein distance between diagrams.</div>

---

## Animated Pipeline: Diagram → Image

<style>
@keyframes fadeStep {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes pulsePixel {
  0%   { opacity: 0.1; }
  50%  { opacity: 0.9; }
  100% { opacity: 0.7; }
}
.step-fade { animation: fadeStep 0.6s ease forwards; }
.pixel-pulse { animation: pulsePixel 1s ease forwards; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:560px;display:block;margin:auto;">

  <!-- Step 1: Persistence Diagram -->
  <rect x="5" y="25" width="110" height="110" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="60" y="18" text-anchor="middle" font-size="10" fill="#64748b" font-weight="bold">Dgm (b,d)</text>
  <line x1="5" y1="135" x2="115" y2="25" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="3,2"/>
  <circle cx="30"  cy="120" r="4" fill="#3b82f6" class="step-fade" style="animation-delay:0.1s"/>
  <circle cx="40"  cy="100" r="4" fill="#3b82f6" class="step-fade" style="animation-delay:0.2s"/>
  <circle cx="55"  cy="65"  r="5" fill="#1d4ed8" class="step-fade" style="animation-delay:0.3s"/>
  <circle cx="80"  cy="50"  r="6" fill="#1d4ed8" class="step-fade" style="animation-delay:0.4s"/>
  <text x="60" y="150" text-anchor="middle" font-size="9" fill="#64748b">birth → death</text>

  <!-- Arrow 1 -->
  <text x="128" y="85" text-anchor="middle" font-size="18" fill="#94a3b8">→</text>
  <text x="128" y="98" text-anchor="middle" font-size="8" fill="#64748b">(b,p=d-b)</text>

  <!-- Step 2: Rotated coords + Gaussians -->
  <rect x="145" y="25" width="110" height="110" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="200" y="18" text-anchor="middle" font-size="10" fill="#64748b" font-weight="bold">Surface ρ(b,p)</text>
  <!-- Gaussian blobs (ellipses) -->
  <ellipse cx="165" cy="128" rx="8"  ry="5"  fill="#93c5fd" opacity="0.4" class="step-fade" style="animation-delay:0.5s"/>
  <ellipse cx="178" cy="115" rx="10" ry="6"  fill="#93c5fd" opacity="0.5" class="step-fade" style="animation-delay:0.6s"/>
  <ellipse cx="198" cy="85"  rx="14" ry="9"  fill="#3b82f6" opacity="0.5" class="step-fade" style="animation-delay:0.7s"/>
  <ellipse cx="225" cy="60"  rx="18" ry="11" fill="#1d4ed8" opacity="0.55" class="step-fade" style="animation-delay:0.8s"/>
  <line x1="145" y1="135" x2="255" y2="135" stroke="#94a3b8" stroke-width="0.8"/>
  <text x="145" y="147" font-size="8" fill="#94a3b8">b</text>
  <text x="147" y="30" font-size="8" fill="#94a3b8">p</text>
  <text x="200" y="155" text-anchor="middle" font-size="9" fill="#64748b">weighted Gaussians</text>

  <!-- Arrow 2 -->
  <text x="268" y="85" text-anchor="middle" font-size="18" fill="#94a3b8">→</text>
  <text x="268" y="98" text-anchor="middle" font-size="8" fill="#64748b">rasterise</text>

  <!-- Step 3: Pixel grid -->
  <rect x="285" y="25" width="110" height="110" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="340" y="18" text-anchor="middle" font-size="10" fill="#64748b" font-weight="bold">Image (vector)</text>
  <!-- 5x5 pixel grid with varying intensities -->
  <rect x="287" y="27" width="21" height="21" rx="1" fill="#eff6ff" class="pixel-pulse" style="animation-delay:1.0s"/>
  <rect x="308" y="27" width="21" height="21" rx="1" fill="#dbeafe" class="pixel-pulse" style="animation-delay:1.05s"/>
  <rect x="329" y="27" width="21" height="21" rx="1" fill="#bfdbfe" class="pixel-pulse" style="animation-delay:1.1s"/>
  <rect x="350" y="27" width="21" height="21" rx="1" fill="#93c5fd" class="pixel-pulse" style="animation-delay:1.15s"/>
  <rect x="371" y="27" width="21" height="21" rx="1" fill="#60a5fa" class="pixel-pulse" style="animation-delay:1.2s"/>

  <rect x="287" y="48" width="21" height="21" rx="1" fill="#dbeafe" class="pixel-pulse" style="animation-delay:1.1s"/>
  <rect x="308" y="48" width="21" height="21" rx="1" fill="#93c5fd" class="pixel-pulse" style="animation-delay:1.15s"/>
  <rect x="329" y="48" width="21" height="21" rx="1" fill="#3b82f6" class="pixel-pulse" style="animation-delay:1.2s"/>
  <rect x="350" y="48" width="21" height="21" rx="1" fill="#2563eb" class="pixel-pulse" style="animation-delay:1.25s"/>
  <rect x="371" y="48" width="21" height="21" rx="1" fill="#1d4ed8" class="pixel-pulse" style="animation-delay:1.3s"/>

  <rect x="287" y="69" width="21" height="21" rx="1" fill="#eff6ff"/>
  <rect x="308" y="69" width="21" height="21" rx="1" fill="#dbeafe"/>
  <rect x="329" y="69" width="21" height="21" rx="1" fill="#bfdbfe"/>
  <rect x="350" y="69" width="21" height="21" rx="1" fill="#93c5fd"/>
  <rect x="371" y="69" width="21" height="21" rx="1" fill="#60a5fa"/>

  <rect x="287" y="90" width="21" height="21" rx="1" fill="#f8fafc"/>
  <rect x="308" y="90" width="21" height="21" rx="1" fill="#eff6ff"/>
  <rect x="329" y="90" width="21" height="21" rx="1" fill="#dbeafe"/>
  <rect x="350" y="90" width="21" height="21" rx="1" fill="#bfdbfe"/>
  <rect x="371" y="90" width="21" height="21" rx="1" fill="#93c5fd"/>

  <rect x="287" y="111" width="21" height="21" rx="1" fill="#f8fafc"/>
  <rect x="308" y="111" width="21" height="21" rx="1" fill="#f8fafc"/>
  <rect x="329" y="111" width="21" height="21" rx="1" fill="#eff6ff"/>
  <rect x="350" y="111" width="21" height="21" rx="1" fill="#dbeafe"/>
  <rect x="371" y="111" width="21" height="21" rx="1" fill="#bfdbfe"/>
  <text x="340" y="150" text-anchor="middle" font-size="9" fill="#64748b">flatten → ℝⁿ²</text>

  <!-- Arrow 3 -->
  <text x="408" y="85" text-anchor="middle" font-size="18" fill="#94a3b8">→</text>
  <text x="408" y="98" text-anchor="middle" font-size="8" fill="#64748b">ML model</text>

  <!-- ML box -->
  <rect x="420" y="55" width="72" height="50" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="456" y="77" text-anchor="middle" font-size="10" fill="#92400e" font-weight="bold">SVM /</text>
  <text x="456" y="91" text-anchor="middle" font-size="10" fill="#92400e" font-weight="bold">MLP</text>
</svg>
<figcaption>Pipeline: persistence diagram → rotate to (birth, persistence) coords → weighted Gaussian surface → rasterise to pixel grid → flatten to vector for any ML model.</figcaption>
</figure>
</div>

---

## Worked Numerical Example

**Diagram:** $T = \{(0.5, 2.0),\, (1.0, 1.2),\, (0.1, 0.15)\}$ (birth, death pairs).

**Step 1 — Convert to (b, p):**
- $(0.5,\, 1.5)$ — persistence 1.5 (significant)
- $(1.0,\, 0.2)$ — persistence 0.2 (moderate)
- $(0.1,\, 0.05)$ — persistence 0.05 (near-diagonal noise)

**Step 2 — Linear weights** with $p_{\max} = 1.5$:
- $w(0.5, 1.5) = 1.0$
- $w(1.0, 0.2) = 0.2/1.5 \approx 0.133$
- $w(0.1, 0.05) = 0.05/1.5 \approx 0.033$

**Observation:** the near-diagonal point contributes only 3.3% of the weight of the most persistent feature. When rasterised on a $20 \times 20$ grid, its Gaussian barely registers. This is exactly the desired noise-suppression behaviour.

**Step 3 — Pixel values** are computed by integrating the weighted Gaussian mixture over each cell. Pixels near $(0.5, 1.5)$ will have large values; pixels near $(0.1, 0.05)$ will be nearly zero.

---

## Stability Theorem

**Theorem (Adams et al., 2017).** Let $\rho_w$ denote the map from persistence diagrams to persistence images using weighting function $w$ (assumed Lipschitz with constant $C$) and Gaussian bandwidth $\sigma$. Then:

$$\|\mathbf{v}(T_1) - \mathbf{v}(T_2)\|_\infty \;\leq\; \frac{C}{\sigma\sqrt{2\pi}} \cdot W_1(T_1, T_2)$$

where $W_1$ is the 1-Wasserstein distance between diagrams.

This confirms that persistence images are **stable**: small changes in the input data (hence small changes in the persistence diagram under $W_1$) produce small changes in the persistence image.

---

## Hyperparameter Choices

| Parameter | Typical range | Effect |
|-----------|--------------|--------|
| Grid resolution $n$ | 10–50 | Higher: finer detail, more dimensions |
| Bandwidth $\sigma$ | 0.1–0.5 × diagram spread | Smaller: sharper but noisier |
| Weight function | Linear, sigmoid, constant | Controls noise suppression |
| Coordinate range | Data-driven or fixed | Must cover all diagram points |

In practice, grid resolution 20×20 with linear weighting and $\sigma$ set to ~10% of the birth/persistence range is a robust default.

---

## References

- Adams, H. et al. (2017). *Persistence images: A stable vector representation of persistent homology.* JMLR.
- Carrière, M. et al. (2020). *PersLay: A neural network layer for persistence diagrams and new graph topological signatures.* AISTATS.
