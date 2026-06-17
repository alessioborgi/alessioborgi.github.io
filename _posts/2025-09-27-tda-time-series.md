---
layout: single
title: "TDA for Time Series: Topology of Dynamical Systems"
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-time-series, sliding-window, dynamical-systems, winding-number, takens-theorem]
published: false
excerpt: "Persistent homology applied to time series via sliding window embeddings detects periodicity, chaos, and dynamical transitions. The winding number of H₁ generators captures frequency; the persistence of loops measures how clearly periodic a signal is. Applications span EEG, ECG, climate data, and financial time series."
author_profile: true
read_time: true
icon: "📈"
read_mins: 5
permalink: /blog/persistent-homology/tda-time-series/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Given a scalar time series x(t), the sliding window embedding SW_{d,τ}(x) = (x(t), x(t+τ), ..., x(t+(d-1)τ)) creates a point cloud in ℝᵈ. For a periodic signal, this cloud traces a loop (S¹); for a quasiperiodic signal, a torus (T²). Persistent H₁ detects these loops: a single long-lived H₁ bar = periodic; two long-lived bars = quasiperiodic. This converts the signal analysis problem into a topology problem.</div>

## Intuition First

A pure sinusoid traces a perfect circle when you plot $$x(t)$$ against $$x(t + T/4)$$ — the delayed version. That circle is topologically a loop ($$H_1$$). A noisy or aperiodic signal traces a jumbled cloud instead — no loop. The sliding window embedding generalises this idea to higher dimensions: it wraps the time series into a point cloud in $$\mathbb{R}^d$$, and persistent homology asks "is there a robust loop here?" A long-lived $$H_1$$ bar means yes — the signal is periodic. TDA has thus converted a signal analysis question into a shape recognition question.

## Sliding Window Embeddings

For a time series $$x: \{0, 1, \ldots, T\} \to \mathbb{R}$$ and parameters $$d$$ (dimension) and $$\tau$$ (lag):

<div class="math-box">$$\mathrm{SW}_{d,\tau}(x)(t) = (x(t), x(t+\tau), x(t+2\tau), \ldots, x(t+(d-1)\tau)) \in \mathbb{R}^d$$</div>

The sliding window point cloud $$P = \{\mathrm{SW}_{d,\tau}(x)(t) : t = 0, \ldots, T-(d-1)\tau\}$$.

**Takens' Theorem**: For a generic smooth dynamical system on an $$m$$-dimensional attractor, the sliding window embedding with $$d \geq 2m+1$$ gives a diffeomorphism between the attractor and $$P$$. Thus, $$P$$ has the same topology as the attractor.

## Topology of Different Signal Types

**Periodic signal** $$x(t) = \sin(2\pi t / T_0)$$:
- Sliding window traces an ellipse ≅ $$S^1$$.
- $$H_0$$: one component; $$H_1$$: one generator (the loop).
- Persistence diagram: single long-lived $$H_1$$ bar.

**Quasiperiodic signal** $$x(t) = \sin(2\pi t/T_1) + \sin(2\pi t/T_2)$$ with $$T_1/T_2 \notin \mathbb{Q}$$:
- Attractor is a 2-torus $$T^2 = S^1 \times S^1$$.
- $$H_1$$ has rank 2 (two generators).
- Persistence diagram: two long-lived $$H_1$$ bars.

**Chaotic signal** (Lorenz attractor):
- Complex attractor with interesting $$H_1$$ (loops around the "wings").
- Persistence diagram: a few moderate-lived $$H_1$$ bars.

**White noise**: random point cloud, no persistent features; all $$H_1$$ bars short-lived.

## The Periodicity Score

**Perea & Harer (2015)** define the **periodicity score** using the maximum persistence of $$H_1$$:

$$\mathrm{PS}(x, d, \tau) = \max_{(b,d) \in H_1 \text{ diagram}} (d - b) / \mathrm{diam}(P)$$

A high score (close to 1) indicates clear periodicity; a low score indicates noise or aperiodic behaviour.

The optimal parameters $$d, \tau$$ can be estimated from the autocorrelation of $$x$$.

## TDA Time Series Pipeline

<style>
@keyframes ts-signal {
  0%   { stroke-dashoffset: 300; }
  100% { stroke-dashoffset: 0; }
}
@keyframes ts-loop-spin {
  from { transform: rotate(0deg); transform-origin: 310px 90px; }
  to   { transform: rotate(360deg); transform-origin: 310px 90px; }
}
@keyframes ts-bar-grow {
  0%,50% { width: 0; }
  100%   { width: var(--bw, 80px); }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto;">
  <!-- Step labels -->
  <text x="40"  y="12" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">1. Signal</text>
  <text x="150" y="12" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">2. SW Embed</text>
  <text x="300" y="12" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">3. Point Cloud</text>
  <text x="430" y="12" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">4. Barcode</text>

  <!-- 1. Sinusoidal signal -->
  <rect x="5" y="20" width="70" height="80" rx="5" fill="#f0fdf4" stroke="#86efac"/>
  <polyline stroke="#0d9488" stroke-width="2" fill="none"
    points="10,75 17,45 24,75 31,45 38,75 45,45 52,75 59,45 66,75"
    stroke-dasharray="300" stroke-dashoffset="300">
    <animate attributeName="stroke-dashoffset" values="300;0" dur="1.5s" fill="freeze"/>
  </polyline>
  <text x="40" y="115" text-anchor="middle" font-size="8" fill="#0d9488">x(t) = sin(t)</text>

  <!-- Arrow 1→2 -->
  <text x="88" y="65" font-size="16" fill="#64748b">→</text>
  <text x="82" y="78" font-size="7" fill="#64748b">SW_{d,τ}</text>

  <!-- 2. Sliding window matrix (schematic) -->
  <rect x="102" y="20" width="90" height="80" rx="5" fill="#fefce8" stroke="#fde68a"/>
  <text x="115" y="38" font-size="7" fill="#92400e">[x₀, x₁, x₂]</text>
  <text x="115" y="52" font-size="7" fill="#92400e">[x₁, x₂, x₃]</text>
  <text x="115" y="66" font-size="7" fill="#92400e">[x₂, x₃, x₄]</text>
  <text x="115" y="80" font-size="7" fill="#92400e">...</text>
  <text x="147" y="115" text-anchor="middle" font-size="8" fill="#92400e">rows = windows</text>

  <!-- Arrow 2→3 -->
  <text x="200" y="65" font-size="16" fill="#64748b">→</text>
  <text x="196" y="78" font-size="7" fill="#64748b">Rips(P)</text>

  <!-- 3. Point cloud loop (periodic → circle) -->
  <rect x="218" y="20" width="140" height="80" rx="5" fill="#eff6ff" stroke="#93c5fd"/>
  <circle cx="310" cy="60" r="28" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.5"/>
  <!-- points on circle, animated -->
  <circle cx="310" cy="32" r="3.5" fill="#1d4ed8" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.6s" fill="freeze"/></circle>
  <circle cx="333" cy="46" r="3.5" fill="#1d4ed8" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.7s" fill="freeze"/></circle>
  <circle cx="338" cy="72" r="3.5" fill="#1d4ed8" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.8s" fill="freeze"/></circle>
  <circle cx="318" cy="88" r="3.5" fill="#1d4ed8" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.9s" fill="freeze"/></circle>
  <circle cx="288" cy="88" r="3.5" fill="#1d4ed8" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.3s" begin="2.0s" fill="freeze"/></circle>
  <circle cx="282" cy="72" r="3.5" fill="#1d4ed8" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.3s" begin="2.1s" fill="freeze"/></circle>
  <circle cx="286" cy="46" r="3.5" fill="#1d4ed8" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.3s" begin="2.2s" fill="freeze"/></circle>
  <text x="288" y="115" text-anchor="middle" font-size="8" fill="#1e40af">loop = periodic</text>

  <!-- Arrow 3→4 -->
  <text x="366" y="65" font-size="16" fill="#64748b">→</text>
  <text x="360" y="78" font-size="7" fill="#64748b">persist.</text>

  <!-- 4. Barcode -->
  <rect x="383" y="20" width="110" height="80" rx="5" fill="#fdf4ff" stroke="#e9d5ff"/>
  <!-- H0 short bars -->
  <rect x="390" y="35" height="8" fill="#94a3b8" rx="2" width="0">
    <animate attributeName="width" values="0;20" dur="0.4s" begin="2.5s" fill="freeze"/>
  </rect>
  <rect x="390" y="48" height="8" fill="#94a3b8" rx="2" width="0">
    <animate attributeName="width" values="0;12" dur="0.4s" begin="2.6s" fill="freeze"/>
  </rect>
  <text x="388" y="32" font-size="7" fill="#64748b">H₀</text>
  <!-- H1 long bar (the key one) -->
  <rect x="390" y="63" height="8" fill="#7c3aed" rx="2" width="0">
    <animate attributeName="width" values="0;88" dur="0.6s" begin="2.8s" fill="freeze"/>
  </rect>
  <text x="388" y="61" font-size="7" fill="#7c3aed">H₁ ← periodic!</text>
  <text x="438" y="115" text-anchor="middle" font-size="8" fill="#7c3aed">long bar → PS≈1</text>
</svg>
<figcaption>TDA pipeline for time series: signal → sliding window embedding → point cloud (circle for periodic signal) → persistence barcode with one long H₁ bar indicating strong periodicity.</figcaption>
</figure>
</div>

## Worked Example: Periodicity Score

Take $$x(t) = \sin(2\pi t / 10)$$ sampled at $$t = 0, 1, \ldots, 49$$ (50 points, period $$T_0=10$$).

**Sliding window**: $$d=3$$, $$\tau=2$$ gives vectors $$(x(t), x(t+2), x(t+4))$$ — 46 points in $$\mathbb{R}^3$$ tracing an ellipse.

**Rips persistence on $$P$$**:
- $$H_0$$: one bar $$(0, \infty)$$ — all points form one component quickly.
- $$H_1$$: one long bar $$(b, d) \approx (0.8, 3.2)$$, persistence $$= 2.4$$.
- Diameter of $$P \approx 3.0$$.

**Periodicity score**: $$\mathrm{PS} = 2.4 / 3.0 \approx 0.80$$ — high, confirming clear periodicity.

For white noise with same length: max $$H_1$$ persistence $$\approx 0.3$$, diameter $$\approx 3.5$$, $$\mathrm{PS} \approx 0.09$$ — near zero, confirming aperiodicity.

## Applications

**EEG analysis**: Persistent $$H_1$$ of sliding window embeddings detects epileptic seizure onset — the irregular burst activity has a different topological signature than normal brain rhythms.

**ECG analysis**: Heartbeat irregularities (atrial fibrillation) disrupt the regular $$S^1$$ loop of normal heartbeat embeddings, producing topological changes detectable by persistence.

**Climate data**: Ocean temperature oscillations (ENSO cycles) have periodic/quasiperiodic components identifiable via topological methods that are robust to missing data and measurement noise.

**Financial time series**: Market cycles and regime changes show up as changes in the topological complexity of the sliding window embedding.

<div class="insight-box"><strong>Key Insight:</strong> The key advantage of TDA for time series over spectral methods (Fourier, wavelets) is robustness: a signal with a strong frequency component but phase noise, missing samples, or amplitude modulation still produces a clear loop in the sliding window embedding. Fourier analysis would show broad spectral peaks; TDA shows a sharp persistence bar. This makes TDA particularly powerful for biological and physical signals where stationarity and regularity are only approximate.</div>

## References

- J. Perea, J. Harer, "Sliding Windows and Persistence: An Application of Topological Methods to Signal Analysis," *Foundations of Computational Mathematics*, 2015. [arXiv:1307.6188](https://arxiv.org/abs/1307.6188).
- F. Takens, "Detecting Strange Attractors in Turbulence," *Lecture Notes in Mathematics*, Springer, 1981.
- J. Perea, "Topological Time Series Analysis," *Notices of the AMS*, 2019.
