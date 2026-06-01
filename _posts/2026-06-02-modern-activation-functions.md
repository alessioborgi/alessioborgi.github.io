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
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #1e3a5f;
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

ReLU solved a huge optimization problem, but it also introduced a blunt shape:

- exactly zero on the negative side
- exactly linear on the positive side
- non-differentiable at zero

That simplicity is often a strength, but it is not always the best match for large modern architectures. Once deep learning scaled up, researchers started testing smoother alternatives that preserve gradient flow while making the network's response less abrupt.

## The Main Modern Idea

Instead of saying:

<div class="formula-box">
"negative values are off, positive values are fully on"
</div>

modern activations often say:

<div class="formula-box">
"let the signal turn on gradually, and maybe let small negative values still matter"
</div>

That makes them feel more like **soft gates** than hard thresholds.

## Smooth ReLU-Like Families

### ELU, SELU, and CELU

These functions keep the positive linear branch, but replace the dead negative side with a smooth saturating tail.

- **ELU:** negative values bend toward a negative plateau
- **SELU:** a self-normalizing variant designed to stabilize mean and variance
- **CELU:** a continuously differentiable ELU-like variant

They are especially interesting because they acknowledge that "all negatives become zero" is sometimes too crude.

### GELU

GELU is the activation you now see everywhere in Transformers.

<div class="formula-box">
GELU(x) ≈ x · Φ(x)
</div>

where `Φ(x)` is the Gaussian cumulative distribution function.

The intuition is elegant: instead of passing all positive signals and rejecting all negative ones, GELU keeps a value in proportion to how likely it is to be useful under a Gaussian view of the input.

### Swish and SiLU

<div class="formula-box">
SiLU(x) = x · sigmoid(x)
</div>

Swish is the same family idea; SiLU is the most common fixed version. These activations are smooth, slightly non-monotonic, and behave like a gated linear response.

### Mish

Mish pushes the same logic further:

<div class="formula-box">
Mish(x) = x · tanh(softplus(x))
</div>

It is smooth, non-monotonic, and often visually looks like "a softer Swish with a richer negative-side bend."

<div class="blog-figure">
<figure>
<img src="/images/blog/basics/activation-modern-grid.svg" alt="Grid of modern activation functions including ELU, SELU, CELU, GELU, Swish, SiLU, Mish, Hard Sigmoid, Hard Tanh, Hard Swish, Bent Identity, and Arctan">
<figcaption>Figure 1 — Modern activation functions mostly differ in one place: how sharply or smoothly they transition around zero, and how much negative information they preserve. GELU, SiLU, and Mish are all trying to replace a hard switch with a softer gate.</figcaption>
</figure>
</div>

## Fast Approximations and Mobile-Friendly Variants

Smooth functions can be strong, but they are more expensive than piecewise-linear ones. That is why approximation-based activations became popular in efficient models:

- **Hard Sigmoid:** piecewise-linear approximation of sigmoid
- **Hard Tanh:** clipped tanh-like shape
- **Hard Swish:** approximation of Swish used in mobile models

The guiding tradeoff is simple: give up a bit of smoothness to gain speed.

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

## Common Misunderstanding

The best activation is not the one with the fanciest formula. It is the one whose shape matches:

1. the optimization constraints,
2. the architecture,
3. the hardware budget,
4. the role of that layer inside the model.

That is why ReLU still survives, GELU dominates Transformers, and Hard Swish shows up in mobile networks. The "best" activation is context-dependent.

## References

1. Hendrycks, D. and Gimpel, K. “Gaussian Error Linear Units (GELUs).” 2016.
2. Ramachandran, P., Zoph, B., and Le, Q. V. “Searching for Activation Functions.” 2017.
3. Misra, D. “Mish: A Self Regularized Non-Monotonic Activation Function.” 2019.
4. Klambauer, G. et al. “Self-Normalizing Neural Networks.” NeurIPS 2017.
