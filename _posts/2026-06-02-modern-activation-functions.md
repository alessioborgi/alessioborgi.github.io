---
layout: single
title: "Modern Activation Functions: GELU, SiLU, Mish, and Smooth Gating"
date: 2026-06-01
categories: [basics]
book: basics
subsection: activation-functions
tags: [activation-functions, gelu, silu, swish, mish]
excerpt: "Once ReLU became the default, researchers started asking a better question: can we keep the easy optimization while making the activation smoother, softer, and more expressive? This chapter covers the modern answers."
author_profile: true
read_time: true
is_overview: false
icon: "🌊"
read_mins: 5
permalink: /blog/basics/modern-activation-functions/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 980px); display: block; margin: 0 auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,62,116,0.12); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .55rem; font-style: italic; }
.tldr-box, .insight-box, .recommend-box, .summary-box, .formula-box {
  border-radius: 10px;
  padding: 1rem 1.15rem;
  margin: 1.2rem 0;
}
.tldr-box { background: linear-gradient(145deg,#eefcfb,#dbeafe); border-left: 4px solid #0d9488; }
.insight-box { background: #fff7ed; border-left: 4px solid #f97316; }
.recommend-box { background: #f0fdf4; border-left: 4px solid #16a34a; }
.summary-box { background: #f8fbff; border: 1px solid #dbe7f5; }
.formula-box {
  background: #f8fafc;
  border: 1px solid #dbeafe;
  text-align: center;
  color: #1e3a5f;
}
.formula-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: .85rem;
  margin: 1rem 0 1.2rem;
}
.formula-card {
  background: linear-gradient(155deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #dbe7f5;
  border-radius: 12px;
  padding: .9rem 1rem;
  overflow: hidden;
}
.formula-card strong {
  display: block;
  margin-bottom: .45rem;
  color: #0f2a36;
}
.formula-card mjx-container[display="true"],
.formula-box mjx-container[display="true"] {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: .15rem;
}
.formula-card mjx-container {
  font-size: 90% !important;
}
.mini-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0 1.2rem;
  font-size: .93rem;
}
.mini-table th, .mini-table td {
  border: 1px solid #dbe7f5;
  padding: .72rem .8rem;
  text-align: left;
  vertical-align: top;
}
.mini-table th { background: #eff6ff; color: #0f2a36; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Modern activations try to keep the optimization benefits of ReLU while making the transition around zero smoother and more expressive. GELU became standard in Transformers, SiLU/Swish became popular in efficient deep networks, and Mish explored even more flexible smooth non-monotonic behavior.
</div>

## Why ReLU Was Not the End of the Story

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Intuition First:</strong> Think of ReLU as a light switch — it is either fully off or fully on. That simplicity is great for optimization, but sometimes you want a dimmer switch: something that smoothly transitions from "mostly off" to "fully on," with a meaningful response even near zero. Modern activations are dimmers. They keep the same "pass positives strongly" behavior of ReLU while giving the network richer structure near the transition point.</div>

ReLU solved a huge optimization problem, but it also introduced a blunt shape:

- exactly zero on the negative side
- exactly linear on the positive side
- non-differentiable at zero

That simplicity is often a strength, but it is not always the best match for large modern architectures. Once deep learning scaled up, researchers started testing smoother alternatives that preserve gradient flow while making the network's response less abrupt.

## The Main Modern Idea

Instead of saying:

<div class="formula-box">
\[
f(x) =
\begin{cases}
0, & x < 0 \\
x, & x \ge 0
\end{cases}
\]
</div>

modern activations often say:

<div class="formula-box">
\[
f(x) \text{ should turn on smoothly and keep a useful derivative near } x = 0
\]
</div>

That makes them feel more like **soft gates** than hard thresholds.

<div class="blog-figure">
<figure>
<img src="/images/blog/basics/activation-soft-gating.svg" alt="Diagram comparing a hard ReLU switch with smoother GELU, SiLU, and Mish style gating">
<figcaption>Figure 1 — Modern activations are easier to understand if you think in terms of gating. ReLU flips on abruptly, while GELU, SiLU, and Mish let the signal turn on gradually and keep more structure around zero.</figcaption>
</figure>
</div>

## Smooth ReLU-Like Families

### ELU, SELU, and CELU

These functions keep the positive linear branch, but replace the dead negative side with a smooth saturating tail.

- **ELU:** negative values bend toward a negative plateau
- **SELU:** a self-normalizing variant designed to stabilize mean and variance
- **CELU:** a continuously differentiable ELU-like variant

They are especially interesting because they acknowledge that "all negatives become zero" is sometimes too crude.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — why a negative floor helps:</strong> ReLU neurons that receive consistently negative input produce zero output and zero gradient — they are effectively dead. ELU solves this by letting negative inputs produce a small but non-zero output (approaching −α ≈ −1). This creates a negative mean activation that pushes subsequent layers to self-correct, reducing the need for careful initialization. SELU takes this further by choosing α and the scale λ analytically (λ≈1.0507, α≈1.6733) so that the activations' mean and variance automatically stay near (0, 1) across layers — a built-in batch-norm effect at no extra computation cost.</div>

### GELU

GELU is the activation you now see everywhere in Transformers.

<div class="formula-box">
\[
\operatorname{GELU}(x) \approx x \, \Phi(x)
\]
</div>

where `Φ(x)` is the Gaussian cumulative distribution function.

The intuition is elegant: instead of passing all positive signals and rejecting all negative ones, GELU keeps a value in proportion to how likely it is to be useful under a Gaussian view of the input.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> GELU can be read as "stochastic ReLU." If neuron inputs are roughly Gaussian, then Φ(x) is the probability that a standard normal sample is less than x. So GELU(x) = x · P(keep this value) — it applies a data-driven soft gate. At x=0, exactly half the signal is gated through. At x=2, roughly 97% passes. At x=−2, only 3% passes. Unlike ReLU, even mildly negative values contribute a small residual signal.</div>

**Step-by-step numerical comparison — GELU vs. ReLU vs. ELU at key input values:**

| x | ReLU | ELU (α=1) | GELU | GELU′ |
|---|---|---|---|---|
| −3 | 0 | −0.950 | −0.004 | 0.020 |
| −1 | 0 | −0.632 | −0.159 | 0.083 |
| 0 | 0 | 0 | **0** | **0.500** |
| 1 | 1 | 1 | **0.841** | 1.083 |
| 2 | 2 | 2 | **1.955** | 1.086 |
| 3 | 3 | 3 | **2.996** | 1.010 |

Notice how GELU preserves a small negative output near x=−1 (−0.159), giving gradients a foothold even in the mildly negative region — something ReLU completely discards.

### Swish and SiLU

<div class="formula-box">
\[
\operatorname{SiLU}(x) = x \, \sigma(x)
\]
</div>

Swish is the same family idea; SiLU is the most common fixed version. These activations are smooth, slightly non-monotonic, and behave like a gated linear response.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> SiLU = x · σ(x) has a beautiful interpretation: the sigmoid term acts as a learned data-driven gate on the identity term. When x is large and positive, σ(x)→1 so SiLU behaves like identity. When x is large and negative, σ(x)→0 so SiLU suppresses — but smoothly. The slight dip below zero near x≈−1.28 (SiLU minimum ≈ −0.278) gives the network a small negative anchor, which empirically helps optimization.</div>

### Mish

Mish pushes the same logic further:

<div class="formula-box">
\[
\operatorname{Mish}(x) = x \, \tanh(\operatorname{softplus}(x))
\]
</div>

It is smooth, non-monotonic, and often visually looks like "a softer Swish with a richer negative-side bend."

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Mish wraps SiLU's gating idea inside a tanh, which compresses the gate values into (−1, 1) before scaling by x. The result is unbounded above (like ReLU/SiLU), bounded-below (minimum ≈ −0.31), and has continuous higher-order derivatives. The richer curvature near zero gives optimizers more informative local slope information to work with.</div>

**Worked example — tracing a value through SiLU vs GELU vs Mish:**

Let x = −0.5 (a mildly negative pre-activation):

| Function | Computation | Output | Gradient at x=−0.5 |
|---|---|---|---|
| ReLU | max(0, −0.5) | **0** | 0 (dead!) |
| GELU | −0.5 · Φ(−0.5) ≈ −0.5 · 0.309 | **−0.154** | ≈ 0.154 |
| SiLU | −0.5 · σ(−0.5) ≈ −0.5 · 0.378 | **−0.189** | ≈ 0.072 |
| Mish | −0.5 · tanh(softplus(−0.5)) ≈ −0.5 · 0.393 | **−0.196** | ≈ 0.065 |

All three modern activations preserve a small but non-zero gradient where ReLU goes completely silent.

<div class="formula-grid">
  <div class="formula-card">
    <strong>ELU</strong>
    \[
    \operatorname{ELU}(x) =
    \begin{cases}
      x, & x > 0 \\
      \alpha(e^x - 1), & x \le 0
    \end{cases}
    \]
  </div>
  <div class="formula-card">
    <strong>GELU</strong>
    \[
    \operatorname{GELU}(x) \approx \frac{x}{2}\left(1 + \tanh\!\Big(\sqrt{\frac{2}{\pi}}\big(x + 0.044715x^3\big)\Big)\right)
    \]
  </div>
  <div class="formula-card">
    <strong>Swish / SiLU</strong>
    \[
    \operatorname{Swish}(x) = x \, \sigma(\beta x), \qquad \operatorname{SiLU}(x) = x \, \sigma(x)
    \]
  </div>
</div>

<div class="blog-figure">
<figure>
<img src="/images/blog/basics/activation-modern-grid.svg" alt="Grid of modern activation functions including ELU, SELU, CELU, GELU, Swish, SiLU, Mish, Hard Sigmoid, Hard Tanh, Hard Swish, Bent Identity, and Arctan">
<figcaption>Figure 2 — Modern activation functions mostly differ in one place: how sharply or smoothly they transition around zero, and how much negative information they preserve. GELU, SiLU, and Mish are all trying to replace a hard switch with a softer gate.</figcaption>
</figure>
</div>

<!-- Animated overlay: ReLU vs ELU vs GELU vs SiLU vs Mish on same axes -->
<style>
@keyframes traceModern {
  from { stroke-dashoffset: 600; }
  to   { stroke-dashoffset: 0;   }
}
</style>
<div class="blog-figure">
<figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 260" style="max-width:520px;width:100%">
  <style>
    .mod-ax  { stroke:#e2e8f0; stroke-width:1; }
    .mod-fn  { fill:none; stroke-width:2.2; stroke-dasharray:600; stroke-dashoffset:600; }
    .m-relu  { stroke:#94a3b8; animation:traceModern 1.3s ease-out 0.1s forwards; }
    .m-elu   { stroke:#a855f7; animation:traceModern 1.3s ease-out 0.5s forwards; }
    .m-gelu  { stroke:#0891b2; animation:traceModern 1.3s ease-out 0.9s forwards; }
    .m-silu  { stroke:#f97316; animation:traceModern 1.3s ease-out 1.3s forwards; }
    .m-mish  { stroke:#16a34a; animation:traceModern 1.3s ease-out 1.7s forwards; }
    .ax-lbl  { font-family:sans-serif; font-size:9.5px; fill:#94a3b8; }
    .leg-dot { r:5; }
    .leg-lbl { font-family:sans-serif; font-size:10px; }
  </style>

  <rect x="1" y="1" width="518" height="258" rx="10" fill="#f8fafc" stroke="#dbe7f5"/>

  <!-- axes -->
  <line x1="60" y1="210" x2="490" y2="210" class="mod-ax"/>  <!-- x-axis -->
  <line x1="60" y1="15"  x2="60"  y2="215" class="mod-ax"/>  <!-- y-axis -->

  <!-- x-axis ticks -->
  <line x1="148" y1="207" x2="148" y2="213" stroke="#cbd5e1" stroke-width="1"/>
  <text x="148" y="224" text-anchor="middle" class="ax-lbl">−2</text>
  <line x1="236" y1="207" x2="236" y2="213" stroke="#cbd5e1" stroke-width="1"/>
  <text x="236" y="224" text-anchor="middle" class="ax-lbl">−1</text>
  <line x1="324" y1="207" x2="324" y2="213" stroke="#cbd5e1" stroke-width="1"/>
  <text x="324" y="224" text-anchor="middle" class="ax-lbl">0</text>
  <line x1="412" y1="207" x2="412" y2="213" stroke="#cbd5e1" stroke-width="1"/>
  <text x="412" y="224" text-anchor="middle" class="ax-lbl">1</text>
  <text x="490" y="224" text-anchor="middle" class="ax-lbl">2</text>

  <!-- y-axis ticks -->
  <line x1="57" y1="122" x2="63" y2="122" stroke="#cbd5e1" stroke-width="1"/>
  <text x="50" y="126" text-anchor="end" class="ax-lbl">1</text>
  <line x1="57" y1="34"  x2="63" y2="34"  stroke="#cbd5e1" stroke-width="1"/>
  <text x="50" y="38"  text-anchor="end" class="ax-lbl">2</text>
  <line x1="57" y1="210" x2="63" y2="210" stroke="#cbd5e1" stroke-width="1"/>
  <text x="50" y="214" text-anchor="end" class="ax-lbl">0</text>

  <!-- zero-line reference (y=0) -->
  <line x1="60" y1="210" x2="490" y2="210" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>

  <!-- ReLU: zero left of x=0 (x=324), linear right -->
  <path d="M60,210 H324 L490,34" class="mod-fn m-relu"/>

  <!-- ELU: saturates to -alpha on left, linear on right; alpha=1 so sat at y=210+88=298→clip -->
  <!-- left: from x=-3(60) y≈-0.95 → (148,-1 plateau approach) right: linear like relu -->
  <path d="M60,298 C80,297 110,293 148,268 S210,230 236,222 S280,214 324,210 L490,34" class="mod-fn m-elu"/>

  <!-- GELU: slight dip left of 0, then tracks near relu -->
  <!-- hand-approximated: at x=-3: ~-0.004 (y≈210), x=-1: -0.159 (y≈224), x=0: 0 (y=210), x=1: 0.841 (y=136), x=2: 1.955 (y=34) -->
  <path d="M60,210 C110,210 180,214 236,224 S300,217 324,210 C348,203 380,158 412,136 L490,34" class="mod-fn m-gelu"/>

  <!-- SiLU: similar to GELU, slightly more pronounced dip -->
  <!-- x=-2: -0.238(y≈231), x=-1: -0.269(y≈234), x=0:0, x=1:0.731(y~146), x=2:1.762(y~57) -->
  <path d="M60,209 C110,210 168,216 236,234 S295,219 324,210 C350,201 385,162 412,146 L490,57" class="mod-fn m-silu"/>

  <!-- Mish: deepest dip ~-0.31 near x=-1 -->
  <path d="M60,209 C110,210 165,217 236,237 S295,220 324,210 C350,200 386,163 412,148 L490,55" class="mod-fn m-mish"/>

  <!-- legend -->
  <circle cx="80"  cy="240" r="5" fill="#94a3b8"/>
  <text x="90"  y="244" class="leg-lbl" fill="#94a3b8">ReLU</text>
  <circle cx="140" cy="240" r="5" fill="#a855f7"/>
  <text x="150" y="244" class="leg-lbl" fill="#a855f7">ELU</text>
  <circle cx="190" cy="240" r="5" fill="#0891b2"/>
  <text x="200" y="244" class="leg-lbl" fill="#0891b2">GELU</text>
  <circle cx="250" cy="240" r="5" fill="#f97316"/>
  <text x="260" y="244" class="leg-lbl" fill="#f97316">SiLU</text>
  <circle cx="305" cy="240" r="5" fill="#16a34a"/>
  <text x="315" y="244" class="leg-lbl" fill="#16a34a">Mish</text>
</svg>
<figcaption>Animated overlay — ReLU, ELU, GELU, SiLU, and Mish on the same axes, drawn in sequence. The key region to watch is x ∈ [−2, 0]: ReLU is flat at zero (dead zone), ELU saturates to a fixed floor, while GELU/SiLU/Mish all preserve a smooth negative dip that carries gradient information back through the network.</figcaption>
</figure>
</div>

## Fast Approximations and Mobile-Friendly Variants

Smooth functions can be strong, but they are more expensive than piecewise-linear ones. That is why approximation-based activations became popular in efficient models:

- **Hard Sigmoid:** piecewise-linear approximation of sigmoid
- **Hard Tanh:** clipped tanh-like shape
- **Hard Swish:** approximation of Swish used in mobile models

The guiding tradeoff is simple: give up a bit of smoothness to gain speed.

<!-- Animated: SiLU (Swish) vs Hard Swish overlay — showing the approximation -->
<style>
@keyframes traceHard {
  from { stroke-dashoffset: 500; }
  to   { stroke-dashoffset: 0;   }
}
</style>
<div class="blog-figure">
<figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 200" style="max-width:440px;width:100%">
  <style>
    .hs-ax  { stroke:#e2e8f0; stroke-width:1; }
    .hs-fn  { fill:none; stroke-dasharray:500; stroke-dashoffset:500; }
    .hs-silu { stroke:#f97316; stroke-width:2.4; animation:traceHard 1.4s ease-out 0.2s forwards; }
    .hs-hard { stroke:#0891b2; stroke-width:2.2; stroke-dasharray:6,3; animation:traceHard 1.4s ease-out 1.0s forwards; }
    .hs-lbl { font-family:sans-serif; font-size:9.5px; fill:#94a3b8; }
    .hs-leg { font-family:sans-serif; font-size:10px; }
  </style>
  <rect x="1" y="1" width="438" height="198" rx="9" fill="#f8fafc" stroke="#dbe7f5"/>
  <!-- axes -->
  <line x1="50" y1="155" x2="420" y2="155" class="hs-ax"/>
  <line x1="50" y1="20"  x2="50"  y2="160" class="hs-ax"/>
  <!-- tick labels -->
  <text x="50"  y="170" text-anchor="middle" class="hs-lbl">−3</text>
  <text x="112" y="170" text-anchor="middle" class="hs-lbl">−2</text>
  <text x="174" y="170" text-anchor="middle" class="hs-lbl">−1</text>
  <text x="236" y="170" text-anchor="middle" class="hs-lbl">0</text>
  <text x="298" y="170" text-anchor="middle" class="hs-lbl">1</text>
  <text x="360" y="170" text-anchor="middle" class="hs-lbl">2</text>
  <text x="420" y="170" text-anchor="middle" class="hs-lbl">3</text>
  <!-- SiLU smooth curve -->
  <!-- x=-3:≈-0.14, x=-2:≈-0.24, x=-1:≈-0.27, x=0:0, x=1:0.73, x=2:1.76, x=3:2.86 -->
  <path d="M50,163 C80,162 112,165 174,168 S215,159 236,155 C258,151 285,126 298,135 L360,80 L420,30" class="hs-fn hs-silu"/>
  <!-- Hard Swish: piecewise — 0 for x≤-3, x*(x+3)/6 for -3<x<3, x for x≥3 -->
  <!-- at x=-3: 0, at x=-2: -2*1/6≈-0.33, at x=-1: -1*2/6≈-0.33, at x=0: 0, at x=1: 1*4/6≈0.67, at x=2: 2*5/6≈1.67, at x=3: 3 -->
  <path d="M50,155 L112,163 L174,163 L236,155 L298,138 L360,84 L420,30" class="hs-fn hs-hard"/>
  <!-- legend -->
  <line x1="60"  y1="186" x2="85"  y2="186" stroke="#f97316" stroke-width="2.4"/>
  <text x="90"  y="190" class="hs-leg" fill="#f97316">SiLU (smooth)</text>
  <line x1="200" y1="186" x2="225" y2="186" stroke="#0891b2" stroke-width="2.2" stroke-dasharray="6,3"/>
  <text x="230" y="190" class="hs-leg" fill="#0891b2">Hard Swish (approx.)</text>
</svg>
<figcaption>SiLU (solid orange) vs. Hard Swish approximation (dashed blue). Hard Swish clips to zero below x=−3, uses the piecewise formula x(x+3)/6 in the middle range, and becomes linear above x=3. The two curves are nearly identical in the critical region [−1, 1] — close enough that mobile networks accept the tradeoff for substantially faster on-device computation.</figcaption>
</figure>
</div>

## A Few More Interesting Curves

The visual grid also includes a few less standard but conceptually useful shapes:

- **Bent Identity:** almost linear, but gently nonlinear near zero
- **Arctan:** another smooth bounded squash
- **SELU / CELU:** reminders that negative values do not have to be thrown away completely

These are not the default choices in modern LLMs, but they help build the reader's intuition: activation design is really about deciding what should happen around zero, in the tails, and in the derivative.

## Which Ones Actually Matter Most Today?

<div class="summary-box">
  <table class="mini-table">
    <thead>
      <tr>
        <th>Activation</th>
        <th>Why people use it</th>
        <th>Main tradeoff</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>GELU</strong></td>
        <td>Very strong default in Transformers</td>
        <td>More expensive than ReLU</td>
      </tr>
      <tr>
        <td><strong>SiLU / Swish</strong></td>
        <td>Smooth, gated, stable, often great in efficient deep nets</td>
        <td>Still more expensive than ReLU</td>
      </tr>
      <tr>
        <td><strong>Mish</strong></td>
        <td>Flexible smooth non-monotonic response</td>
        <td>Less standard in large production stacks</td>
      </tr>
      <tr>
        <td><strong>Hard Swish</strong></td>
        <td>Good hardware-friendly approximation</td>
        <td>Less smooth than the original</td>
      </tr>
    </tbody>
  </table>
</div>

## Practical Advice

<div class="recommend-box">
  <strong>Strong modern defaults:</strong>
  <ul>
    <li><strong>Transformers:</strong> GELU remains the standard baseline.</li>
    <li><strong>Efficient CNNs / mobile models:</strong> Hard Swish or SiLU are common.</li>
    <li><strong>General-purpose modern MLPs:</strong> ReLU is still a valid baseline, but SiLU is worth testing.</li>
  </ul>
</div>

## What Can Go Wrong with Modern Activations?

<div class="summary-box">
  <table class="mini-table">
    <thead>
      <tr>
        <th>Activation</th>
        <th>Potential problem</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>ELU / SELU / CELU</strong></td>
        <td>More expensive than ReLU and more sensitive to architectural assumptions than many beginners expect.</td>
      </tr>
      <tr>
        <td><strong>GELU</strong></td>
        <td>Excellent in Transformers, but often unnecessary overhead in smaller or simpler models.</td>
      </tr>
      <tr>
        <td><strong>SiLU / Swish</strong></td>
        <td>Smoother optimization, but still costlier than piecewise-linear activations.</td>
      </tr>
      <tr>
        <td><strong>Mish</strong></td>
        <td>Can work well, but is less standardized and not always worth the extra complexity.</td>
      </tr>
      <tr>
        <td><strong>Hard approximations</strong></td>
        <td>Faster on-device, but they give up part of the smooth behavior that motivated the original function.</td>
      </tr>
    </tbody>
  </table>
</div>

## Common Misunderstanding

The best activation is not the one with the fanciest formula. It is the one whose shape matches:

1. the optimization constraints,
2. the architecture,
3. the hardware budget,
4. the role of that layer inside the model.

That is why ReLU still survives, GELU dominates Transformers, and Hard Swish shows up in mobile networks. The "best" activation is context-dependent.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — the convergence story:</strong> GELU, SiLU, and Mish are all smooth approximations of the same underlying idea: a data-dependent soft gate applied to the linear pre-activation. They differ mainly in <em>how</em> they compute the gate (Gaussian CDF, sigmoid, or tanh∘softplus) and in the precise shape of the negative dip. In practice, the differences between them are usually smaller than the difference between any of them and plain ReLU. If you are unsure, GELU for Transformers and SiLU for convolutional/MLP architectures is a well-validated starting point.</div>

## References

1. Hendrycks, D. and Gimpel, K. “Gaussian Error Linear Units (GELUs).” 2016.
2. Ramachandran, P., Zoph, B., and Le, Q. V. “Searching for Activation Functions.” 2017.
3. Misra, D. “Mish: A Self Regularized Non-Monotonic Activation Function.” 2019.
4. Klambauer, G. et al. “Self-Normalizing Neural Networks.” NeurIPS 2017.
