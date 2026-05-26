---
layout: single
title: "TDA for Time Series: Topology of Dynamical Systems"
date: 2025-09-27
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-time-series, sliding-window, dynamical-systems, winding-number, takens-theorem]
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
