---
layout: single
title: "Output, Gated, and Special Activations: Softmax, GLU, SIREN, and More"
date: 2026-06-01
categories: [basics]
book: basics
subsection: activation-functions
tags: [softmax, glu, swiglu, sparsemax, siren]
excerpt: "Not every activation is a hidden-layer curve. Some produce probabilities, some implement learned gates, some shrink values toward zero, and some are designed for very specialized settings such as implicit neural representations."
author_profile: true
read_time: true
is_overview: false
icon: "🧰"
read_mins: 5
permalink: /blog/basics/output-gated-and-special-activations/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 980px); display: block; margin: 0 auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,62,116,0.12); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .55rem; font-style: italic; }
.tldr-box, .insight-box, .summary-box, .warning-box, .formula-box {
  border-radius: 10px;
  padding: 1rem 1.15rem;
  margin: 1.2rem 0;
}
.tldr-box { background: linear-gradient(145deg,#ecfeff,#dbeafe); border-left: 4px solid #0891b2; }
.insight-box { background: #eff6ff; border-left: 4px solid #2563eb; }
.summary-box { background: #f8fbff; border: 1px solid #dbe7f5; }
.warning-box { background: #fff7ed; border-left: 4px solid #f97316; }
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
.formula-grid--shrink {
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
}
.formula-grid--shrink .formula-card mjx-container {
  font-size: 78% !important;
}
.formula-grid--gated {
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}
.formula-grid--gated .formula-card mjx-container {
  font-size: 82% !important;
}
.formula-grid--special {
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}
.formula-grid--special .formula-card mjx-container {
  font-size: 80% !important;
}
@media (max-width: 900px) {
  .formula-grid--gated,
  .formula-grid--shrink,
  .formula-grid--special {
    grid-template-columns: 1fr;
  }
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
  <strong>TL;DR:</strong> Many important activations are not “hidden-layer curves” at all. Softmax and sigmoid control outputs, GLU-style activations learn gates, shrinkage activations push values toward zero, and specialized activations such as SIREN or Gaussian RBFs are built for niche but powerful settings.
</div>

## Output Activations Have a Different Job

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Intuition First:</strong> In hidden layers, activations shape what the network <em>thinks</em>. At the output layer, activations shape what the network <em>says</em>. They must convert raw scores (logits) into the exact format the loss function expects. Using the wrong output activation is not just suboptimal — it breaks the loss's mathematical assumptions and can make training completely undefined.</div>

In hidden layers, activation functions mainly shape representation learning and gradient flow. At the output layer, they must match the task.

### The three most important output cases

| Task | Typical activation | Why |
| --- | --- | --- |
| Binary classification | <strong>Sigmoid</strong> | Turns one logit into a probability in `[0, 1]` |
| Multi-class classification | <strong>Softmax</strong> | Converts logits into a probability distribution that sums to `1` |
| Regression | <strong>Linear / Identity</strong> | Leaves the output unconstrained |

The softmax formula is:

<div class="formula-box">
\[
\operatorname{softmax}(z_i) = \frac{e^{z_i}}{\sum_j e^{z_j}}
\]
</div>

**Concrete step-by-step: softmax on 3 logits**

Say a 3-class classifier produces logits `z = [2.0, 1.0, 0.1]`.

| Step | Computation | Result |
|---|---|---|
| Exponentiate | e², e¹, e^0.1 | 7.389, 2.718, 1.105 |
| Sum | 7.389 + 2.718 + 1.105 | **11.212** |
| Normalize | 7.389/11.212, 2.718/11.212, 1.105/11.212 | **0.659, 0.242, 0.099** |
| Check | 0.659 + 0.242 + 0.099 | = 1.000 ✓ |

The original logit differences (2.0 vs 1.0 vs 0.1) are now calibrated probabilities summing to 1. Note that a 1-unit logit advantage roughly triples the probability — the exponential makes the winner-take-most effect strong.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — temperature:</strong> Dividing logits by a temperature T before softmax controls sharpness. T→0 makes softmax behave like argmax (one-hot). T→∞ makes it uniform. This is why temperature scaling is the standard post-hoc calibration technique: the model's weights stay frozen, only the output distribution is reshaped.</div>

<!-- Animated: softmax with temperature — bars morphing -->
<style>
@keyframes growSoftmax {
  from { height: 0; y: 155; }
}
@keyframes growSoftmaxB {
  from { height: 0; y: 155; }
}
</style>
<div class="blog-figure">
<figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 185" style="max-width:480px;width:100%">
  <style>
    .bar { rx:4; transition: all 0.4s; }
    .bar-hot  { fill:#0891b2; animation: growSoftmax 1s ease-out forwards; }
    .bar-warm { fill:#60a5fa; animation: growSoftmax 1.3s ease-out forwards; }
    .bar-cool { fill:#bae6fd; animation: growSoftmax 1.6s ease-out forwards; }
    .bar-lbl  { font-family:sans-serif; font-size:10px; fill:#374151; }
    .ax-fine  { stroke:#e2e8f0; stroke-width:1; }
    .grp-lbl  { font-family:sans-serif; font-size:10.5px; font-weight:700; }
  </style>

  <rect x="1" y="1" width="478" height="183" rx="9" fill="#f8fafc" stroke="#dbe7f5"/>

  <!-- T=0.5 (sharp) -->
  <text x="90" y="16" text-anchor="middle" class="grp-lbl" fill="#0c4a6e">T = 0.5 (sharp)</text>
  <line x1="15" y1="155" x2="175" y2="155" class="ax-fine"/>
  <!-- class 1: prob≈0.88 → height 88*1.1=97 -->
  <rect x="25"  y="58"  width="35" height="97" class="bar bar-hot"/>
  <text x="42"  y="53"  text-anchor="middle" class="bar-lbl">88%</text>
  <!-- class 2: prob≈0.10 → height 11 -->
  <rect x="75"  y="144" width="35" height="11" class="bar bar-warm"/>
  <text x="92"  y="140" text-anchor="middle" class="bar-lbl">10%</text>
  <!-- class 3: prob≈0.02 → height 2 -->
  <rect x="125" y="153" width="35" height="2" class="bar bar-cool"/>
  <text x="142" y="149" text-anchor="middle" class="bar-lbl">2%</text>
  <text x="42"  y="168" text-anchor="middle" class="bar-lbl">C1</text>
  <text x="92"  y="168" text-anchor="middle" class="bar-lbl">C2</text>
  <text x="142" y="168" text-anchor="middle" class="bar-lbl">C3</text>

  <!-- T=1.0 (standard) -->
  <text x="250" y="16" text-anchor="middle" class="grp-lbl" fill="#0f766e">T = 1.0 (standard)</text>
  <line x1="175" y1="155" x2="335" y2="155" class="ax-fine"/>
  <!-- 66%, 24%, 10% -->
  <rect x="185" y="82"  width="35" height="73" class="bar bar-hot"/>
  <text x="202" y="77"  text-anchor="middle" class="bar-lbl">66%</text>
  <rect x="235" y="128" width="35" height="27" class="bar bar-warm"/>
  <text x="252" y="123" text-anchor="middle" class="bar-lbl">24%</text>
  <rect x="285" y="144" width="35" height="11" class="bar bar-cool"/>
  <text x="302" y="140" text-anchor="middle" class="bar-lbl">10%</text>
  <text x="202" y="168" text-anchor="middle" class="bar-lbl">C1</text>
  <text x="252" y="168" text-anchor="middle" class="bar-lbl">C2</text>
  <text x="302" y="168" text-anchor="middle" class="bar-lbl">C3</text>

  <!-- T=3.0 (soft) -->
  <text x="412" y="16" text-anchor="middle" class="grp-lbl" fill="#7c3aed">T = 3.0 (soft)</text>
  <line x1="335" y1="155" x2="475" y2="155" class="ax-fine"/>
  <!-- ~42%, 33%, 25% -->
  <rect x="345" y="109" width="35" height="46" class="bar bar-hot"/>
  <text x="362" y="104" text-anchor="middle" class="bar-lbl">42%</text>
  <rect x="395" y="118" width="35" height="37" class="bar bar-warm"/>
  <text x="412" y="113" text-anchor="middle" class="bar-lbl">33%</text>
  <rect x="440" y="127" width="27" height="28" class="bar bar-cool"/>
  <text x="453" y="122" text-anchor="middle" class="bar-lbl">25%</text>
  <text x="362" y="168" text-anchor="middle" class="bar-lbl">C1</text>
  <text x="412" y="168" text-anchor="middle" class="bar-lbl">C2</text>
  <text x="453" y="168" text-anchor="middle" class="bar-lbl">C3</text>
</svg>
<figcaption>The same logits [2.0, 1.0, 0.1] passed through softmax at three temperatures. Low T (left) collapses probability onto the top class — useful for greedy decoding. High T (right) spreads probability more evenly — useful for knowledge distillation. T=1 is the standard training setting.</figcaption>
</figure>
</div>

## Why Gated Activations Became So Important

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Intuition First:</strong> A classic activation like ReLU asks one question of each neuron: <em>"should this value pass?"</em> A gated activation asks two neurons to collaborate: one produces content, the other produces a gate score. The gate modulates how much of the content flows forward. This is conceptually identical to the gating mechanism in LSTMs and GRUs — the same idea, applied at every feed-forward layer. It is why gated variants consistently outperform plain ReLU in large Transformer models.</div>

Modern architectures often do not use a single scalar curve after an affine transform. Instead, they split the channel dimension and let one part gate another.

That gives you:

- **GLU:** one linear branch gates another
- **SwiGLU:** same idea, but with a SiLU/Swish-style gate
- **GeGLU:** GELU gate
- **ReGLU:** ReLU gate

<div class="formula-grid formula-grid--gated">
  <div class="formula-card">
    <strong>GLU</strong>
    \[
    \operatorname{GLU}(x) = a \otimes \sigma(b)
    \]
  </div>
  <div class="formula-card">
    <strong>SwiGLU</strong>
    \[
    \operatorname{SwiGLU}(x) = a \otimes \operatorname{SiLU}(b)
    \]
  </div>
  <div class="formula-card">
    <strong>GeGLU / ReGLU</strong>
    \[
    \operatorname{GeGLU}(x) = a \otimes \operatorname{GELU}(b), \qquad
    \operatorname{ReGLU}(x) = a \otimes \operatorname{ReLU}(b)
    \]
  </div>
</div>

This family matters because large Transformers often rely more on **gated feed-forward blocks** than on plain ReLU-style MLPs.

<div class=”insight-box”>
<strong>Useful mental model:</strong> ReLU asks “should this neuron pass?” GLU-like activations ask “how strongly should this feature gate another feature?”
</div>

**Worked example — GLU vs. plain linear, step by step:**

Suppose an input vector is split into two halves: `a = [1.2, −0.4, 0.8]` (content) and `b = [2.1, −1.5, 0.3]` (gate input).

| Step | GLU | Plain linear (no gate) |
|---|---|---|
| Compute gate | σ(b) = [0.89, 0.18, 0.57] | — |
| Element-wise product | a ⊗ σ(b) = [1.07, −0.07, 0.46] | a = [1.2, −0.4, 0.8] |
| Effect | The −0.4 signal is suppressed to −0.07 by a low gate value | −0.4 passes through unchanged |

The gate learned that the second feature is unreliable (low σ(b)=0.18) and almost entirely suppressed it. Plain linear cannot make this context-dependent decision.

<!-- Animated: GLU data-flow diagram -->
<style>
@keyframes flowGLU {
  0%   { stroke-dashoffset: 300; opacity: 0.2; }
  100% { stroke-dashoffset: 0;   opacity: 1;   }
}
@keyframes popBox {
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1);   opacity: 1; }
}
</style>
<div class=”blog-figure”>
<figure>
<svg xmlns=”http://www.w3.org/2000/svg” viewBox=”0 0 520 175” style=”max-width:520px;width:100%”>
  <style>
    .glu-wire { fill:none; stroke-width:2; stroke-dasharray:300; stroke-dashoffset:300;
                animation: flowGLU 1.2s ease-out forwards; }
    .glu-w1 { stroke:#0891b2; animation-delay:0.1s; }
    .glu-w2 { stroke:#f97316; animation-delay:0.5s; }
    .glu-w3 { stroke:#16a34a; animation-delay:1.1s; }
    .glu-box { animation: popBox 0.5s ease-out forwards; opacity:0; }
    .glu-b1 { animation-delay:0.0s; }
    .glu-b2 { animation-delay:0.4s; }
    .glu-b3 { animation-delay:0.8s; }
    .glu-b4 { animation-delay:1.0s; }
    .bx-lbl { font-family:sans-serif; font-size:10px; font-weight:700; }
    .sm-lbl { font-family:sans-serif; font-size:9px; fill:#64748b; }
  </style>
  <rect x=”1” y=”1” width=”518” height=”173” rx=”9” fill=”#f8fafc” stroke=”#dbe7f5”/>

  <!-- Input box -->
  <g class=”glu-box glu-b1”>
    <rect x=”15” y=”65” width=”70” height=”45” rx=”7” fill=”#eff6ff” stroke=”#93c5fd” stroke-width=”1.5”/>
    <text x=”50” y=”85” text-anchor=”middle” class=”bx-lbl” fill=”#1e3a8a”>Input x</text>
    <text x=”50” y=”100” text-anchor=”middle” class=”sm-lbl”>dim d</text>
  </g>

  <!-- Split arrow up and down -->
  <path d=”M85,88 H120 L120,55” class=”glu-wire glu-w1”/>
  <path d=”M85,88 H120 L120,120” class=”glu-wire glu-w2”/>

  <!-- Linear branch a (content) -->
  <g class=”glu-box glu-b1”>
    <rect x=”120” y=”28” width=”80” height=”40” rx=”7” fill=”#f0fdf4” stroke=”#86efac” stroke-width=”1.5”/>
    <text x=”160” y=”46” text-anchor=”middle” class=”bx-lbl” fill=”#166534”>Linear W₁</text>
    <text x=”160” y=”59” text-anchor=”middle” class=”sm-lbl”>→ a</text>
  </g>

  <!-- Linear branch b (gate) -->
  <g class=”glu-box glu-b2”>
    <rect x=”120” y=”107” width=”80” height=”40” rx=”7” fill=”#fff7ed” stroke=”#fdba74” stroke-width=”1.5”/>
    <text x=”160” y=”124” text-anchor=”middle” class=”bx-lbl” fill=”#9a3412”>Linear W₂</text>
    <text x=”160” y=”137” text-anchor=”middle” class=”sm-lbl”>→ b</text>
  </g>

  <!-- gate activation -->
  <path d=”M200,127 H250” class=”glu-wire glu-w2”/>
  <g class=”glu-box glu-b2”>
    <rect x=”250” y=”107” width=”65” height=”40” rx=”7” fill=”#fef9c3” stroke=”#fde047” stroke-width=”1.5”/>
    <text x=”282” y=”124” text-anchor=”middle” class=”bx-lbl” fill=”#713f12”>σ(b)</text>
    <text x=”282” y=”137” text-anchor=”middle” class=”sm-lbl”>gate</text>
  </g>

  <!-- a path -->
  <path d=”M200,48 H315 L315,88” class=”glu-wire glu-w1”/>
  <!-- b → gate path to multiply -->
  <path d=”M315,127 L315,108” class=”glu-wire glu-w2”/>

  <!-- multiply -->
  <g class=”glu-box glu-b3”>
    <circle cx=”315” cy=”88” r=”18” fill=”#e0f2fe” stroke=”#38bdf8” stroke-width=”1.5”/>
    <text x=”315” y=”93” text-anchor=”middle” class=”bx-lbl” fill=”#0c4a6e”>⊗</text>
  </g>

  <!-- output -->
  <path d=”M333,88 H400” class=”glu-wire glu-w3”/>
  <g class=”glu-box glu-b4”>
    <rect x=”400” y=”65” width=”105” height=”45” rx=”7” fill=”#f0fdf4” stroke=”#4ade80” stroke-width=”1.5”/>
    <text x=”452” y=”84” text-anchor=”middle” class=”bx-lbl” fill=”#14532d”>GLU output</text>
    <text x=”452” y=”99” text-anchor=”middle” class=”sm-lbl”>a ⊗ σ(b)</text>
  </g>
</svg>
<figcaption>Animated GLU data-flow. The input is projected by two independent linear layers. The content branch (a) passes through unchanged. The gate branch (b) is squashed by sigmoid to produce per-channel gate values in (0,1). The element-wise product lets the gate selectively suppress or pass each content feature — all learned end-to-end.</figcaption>
</figure>
</div>

<div style=”background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;”><strong>Key Insight — SwiGLU in LLaMA/GPT-4 style FFN blocks:</strong> SwiGLU(x) = (W₁x) ⊗ SiLU(W₂x). Compared to a standard two-layer MLP with a single activation, SwiGLU uses <em>three</em> weight matrices (W₁, W₂, W₃ for the final projection) but achieves better perplexity at the same parameter budget. The reason is expressivity: the gate is a full learned linear transformation, not just a fixed nonlinearity applied to the same pre-activation. This is why nearly every modern open-source LLM (LLaMA, Mistral, Gemma) uses SwiGLU in its feed-forward blocks instead of plain GELU-MLP.</div>

<div class="blog-figure">
<figure>
<img src="/images/blog/basics/activation-output-map.svg" alt="Diagram contrasting hidden-layer activations, output activations, and gated activations">
<figcaption>Figure 1 — Not all activations play the same role. Hidden-layer activations shape features, output activations shape the prediction object, and gated activations decide how one feature stream modulates another.</figcaption>
</figure>
</div>

## Shrinkage and Sparse Activations

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Intuition First:</strong> Standard activations pass strong signals and block weak ones. Shrinkage activations go further: they push <em>small</em> values all the way to zero, creating genuine sparsity in the representation. Think of it as denoising — treat small activations as noise and eliminate them, keep only the confidently large values. Sparsemax takes this idea to the output layer: unlike softmax which distributes probability mass everywhere, Sparsemax assigns exact zero probability to unlikely classes, producing a sparse probability vector. This is especially valuable for attention mechanisms and structured prediction.</div>

Another family is built around sparsity or denoising:

- **TanhShrink:** returns `x - tanh(x)`
- **SoftShrink:** softly pushes small values toward zero
- **HardShrink:** zeroes small values completely
- **Sparsemax:** like softmax, but can produce exact zeros
- **Entmax:** interpolates between dense softmax and sparse alternatives

<div class="formula-grid formula-grid--shrink">
  <div class="formula-card">
    <strong>TanhShrink</strong>
    \[
    \operatorname{TanhShrink}(x) = x - \tanh(x)
    \]
  </div>
  <div class="formula-card">
    <strong>SoftShrink</strong>
    \[
    \operatorname{SoftShrink}(x) =
    \begin{cases}
      x - \lambda, & x > \lambda \\
      0, & |x| \le \lambda \\
      x + \lambda, & x < -\lambda
    \end{cases}
    \]
  </div>
  <div class="formula-card">
    <strong>HardShrink</strong>
    \[
    \operatorname{HardShrink}(x) =
    \begin{cases}
      x, & |x| > \lambda \\
      0, & |x| \le \lambda
    \end{cases}
    \]
  </div>
</div>

These are useful when you want more structured or selective outputs rather than dense probability mass everywhere.

**Concrete example — SoftShrink vs HardShrink vs Sparsemax (λ=0.5):**

| Input value | SoftShrink (λ=0.5) | HardShrink (λ=0.5) | Notes |
|---|---|---|---|
| 2.0 | 1.5 | 2.0 | Large value: both pass through |
| 0.8 | 0.3 | 0.8 | SoftShrink reduces, HardShrink passes |
| 0.4 | 0.0 | 0.0 | Both zero — below threshold |
| 0.1 | 0.0 | 0.0 | Both zero — below threshold |
| −0.6 | −0.1 | −0.6 | SoftShrink clips toward zero |
| −1.5 | −1.0 | −1.5 | Large negative: both pass |

SoftShrink always shrinks by λ before zeroing; HardShrink either passes completely or zeros. SoftShrink is the classical wavelet/signal denoising shrinkage — it corresponds to solving a LASSO-style proximal operator.

<!-- Animated: softmax vs sparsemax probability bars -->
<style>
@keyframes riseBar {
  from { height:0; y:130; }
}
</style>
<div class="blog-figure">
<figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 165" style="max-width:460px;width:100%">
  <style>
    .sp-bar { rx:4; }
    .sp-sm  { fill:#0891b2; animation: riseBar 1.1s ease-out forwards; }
    .sp-sp  { fill:#f97316; animation: riseBar 1.1s ease-out 0.7s both; }
    .sp-ax  { stroke:#e2e8f0; stroke-width:1; }
    .sp-lbl { font-family:sans-serif; font-size:9.5px; fill:#374151; }
    .sp-ttl { font-family:sans-serif; font-size:11px; font-weight:700; }
  </style>
  <rect x="1" y="1" width="458" height="163" rx="9" fill="#f8fafc" stroke="#dbe7f5"/>

  <!-- Softmax panel — all classes get some mass -->
  <text x="115" y="16" text-anchor="middle" class="sp-ttl" fill="#0c4a6e">Softmax (dense)</text>
  <line x1="20" y1="130" x2="215" y2="130" class="sp-ax"/>
  <!-- 5 classes: z=[3,1,0,-1,-2] → sm≈[0.70,0.10,0.09,0.06,0.05] -->
  <rect x="30"  y="53"  width="26" height="77" class="sp-bar sp-sm"/>
  <text x="43"  y="48"  text-anchor="middle" class="sp-lbl">70%</text>
  <rect x="66"  y="119" width="26" height="11" class="sp-bar sp-sm"/>
  <text x="79"  y="114" text-anchor="middle" class="sp-lbl">10%</text>
  <rect x="102" y="120" width="26" height="10" class="sp-bar sp-sm"/>
  <text x="115" y="115" text-anchor="middle" class="sp-lbl">9%</text>
  <rect x="138" y="123" width="26" height="7" class="sp-bar sp-sm"/>
  <text x="151" y="118" text-anchor="middle" class="sp-lbl">6%</text>
  <rect x="174" y="124" width="26" height="6" class="sp-bar sp-sm"/>
  <text x="187" y="119" text-anchor="middle" class="sp-lbl">5%</text>
  <text x="43" y="143" text-anchor="middle" class="sp-lbl">C1</text>
  <text x="79" y="143" text-anchor="middle" class="sp-lbl">C2</text>
  <text x="115" y="143" text-anchor="middle" class="sp-lbl">C3</text>
  <text x="151" y="143" text-anchor="middle" class="sp-lbl">C4</text>
  <text x="187" y="143" text-anchor="middle" class="sp-lbl">C5</text>

  <!-- Sparsemax panel — only top classes get mass -->
  <text x="345" y="16" text-anchor="middle" class="sp-ttl" fill="#c2410c">Sparsemax (sparse)</text>
  <line x1="245" y1="130" x2="445" y2="130" class="sp-ax"/>
  <!-- sparsemax on same z=[3,1,0,-1,-2] → ~[0.80,0.20,0,0,0] -->
  <rect x="255" y="42"  width="26" height="88" class="sp-bar sp-sp"/>
  <text x="268" y="37"  text-anchor="middle" class="sp-lbl">80%</text>
  <rect x="291" y="108" width="26" height="22" class="sp-bar sp-sp"/>
  <text x="304" y="103" text-anchor="middle" class="sp-lbl">20%</text>
  <!-- zeros for C3-C5 — thin line -->
  <rect x="327" y="130" width="26" height="0.5" fill="#94a3b8"/>
  <text x="340" y="145" text-anchor="middle" class="sp-lbl" fill="#94a3b8">0%</text>
  <rect x="363" y="130" width="26" height="0.5" fill="#94a3b8"/>
  <text x="376" y="145" text-anchor="middle" class="sp-lbl" fill="#94a3b8">0%</text>
  <rect x="399" y="130" width="26" height="0.5" fill="#94a3b8"/>
  <text x="412" y="145" text-anchor="middle" class="sp-lbl" fill="#94a3b8">0%</text>
  <text x="268" y="143" text-anchor="middle" class="sp-lbl">C1</text>
  <text x="304" y="143" text-anchor="middle" class="sp-lbl">C2</text>
  <text x="340" y="143" text-anchor="middle" class="sp-lbl">C3</text>
  <text x="376" y="143" text-anchor="middle" class="sp-lbl">C4</text>
  <text x="412" y="143" text-anchor="middle" class="sp-lbl">C5</text>
  <text x="345" y="158" text-anchor="middle" font-family="sans-serif" font-size="8.5" fill="#c2410c">exact zeros — interpretable sparse attention</text>
</svg>
<figcaption>Same logits [3, 1, 0, −1, −2] through Softmax (left) vs. Sparsemax (right). Softmax distributes probability everywhere — even irrelevant classes C4, C5 receive 5–6%. Sparsemax projects onto the probability simplex using a thresholding operation, producing exact zeros for low-scoring classes. This is critical for sparse attention mechanisms where you want some tokens to receive literally zero weight.</figcaption>
</figure>
</div>

## Special-Purpose Activations

Some activations are not mainstream in basic classifiers, but they are extremely important in the right niche.

- **Maxout:** takes the maximum over several learned affine responses
- **Sin / SIREN:** uses sinusoidal activations for implicit neural representations
- **Gaussian / RBF:** activates by distance from a center
- **Soft Exponential:** learns whether to behave more like a log, linear, or exponential function
- **KAN / spline activations:** learns the activation shape itself rather than choosing a fixed closed-form function

<div class="formula-grid formula-grid--special">
  <div class="formula-card">
    <strong>SIREN</strong>
    \[
    f(x) = \sin(\omega x)
    \]
  </div>
  <div class="formula-card">
    <strong>Gaussian / RBF</strong>
    \[
    \phi(x) = \exp\!\left(-\frac{\|x-c\|^2}{2\sigma^2}\right)
    \]
  </div>
  <div class="formula-card">
    <strong>Soft Exponential</strong>
    \[
    f_\alpha(x) =
    \begin{cases}
      -\frac{\log(1-\alpha(x+\alpha))}{\alpha}, & \alpha < 0 \\
      x, & \alpha = 0 \\
      \frac{e^{\alpha x}-1}{\alpha} + \alpha, & \alpha > 0
    \end{cases}
    \]
  </div>
</div>

These remind us that “activation function” is a much broader design space than just ReLU vs GELU.

<div style=”background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;”><strong>Key Insight — why SIREN works for implicit representations:</strong> Modeling a continuous signal (image, shape, audio) as a neural function f(x,y)→RGB requires the network to represent fine-grained detail. ReLU-based networks produce piecewise-linear outputs — they cannot represent smooth higher-order derivatives. SIREN uses sin(ωx), whose derivatives are also sinusoids, so the network naturally represents smooth periodic structure at every layer. The frequency ω controls the scale of detail captured. SIREN networks have been shown to exactly fit high-resolution images with far fewer parameters than ReLU networks because every layer contributes smoothly to all derivative orders — not just the zeroth.</div>

<!-- Animated: SIREN sinusoidal wave vs ReLU piecewise approximation -->
<style>
@keyframes traceSIREN {
  from { stroke-dashoffset: 800; }
  to   { stroke-dashoffset: 0;   }
}
</style>
<div class=”blog-figure”>
<figure>
<svg xmlns=”http://www.w3.org/2000/svg” viewBox=”0 0 520 175” style=”max-width:520px;width:100%”>
  <style>
    .si-ax   { stroke:#e2e8f0; stroke-width:1; }
    .si-sin  { fill:none; stroke:#0891b2; stroke-width:2.4;
               stroke-dasharray:800; stroke-dashoffset:800;
               animation: traceSIREN 2s ease-out 0.3s forwards; }
    .si-relu { fill:none; stroke:#94a3b8; stroke-width:2;
               stroke-dasharray:800; stroke-dashoffset:800;
               animation: traceSIREN 2s ease-out 1.2s forwards; }
    .si-lbl  { font-family:sans-serif; font-size:9.5px; fill:#94a3b8; }
    .si-ttl  { font-family:sans-serif; font-size:11px; font-weight:700; }
    .si-leg  { font-family:sans-serif; font-size:10px; }
  </style>
  <rect x=”1” y=”1” width=”518” height=”173” rx=”9” fill=”#f8fafc” stroke=”#dbe7f5”/>
  <text x=”260” y=”17” text-anchor=”middle” class=”si-ttl” fill=”#0f2a36”>SIREN sin(ωx) vs. ReLU piecewise approximation</text>
  <!-- x-axis -->
  <line x1=”30” y1=”100” x2=”500” y2=”100” class=”si-ax”/>
  <line x1=”30” y1=”20”  x2=”30”  y2=”145” class=”si-ax”/>
  <!-- tick labels -->
  <text x=”30”  y=”158” text-anchor=”middle” class=”si-lbl”>0</text>
  <text x=”147” y=”158” text-anchor=”middle” class=”si-lbl”>π</text>
  <text x=”264” y=”158” text-anchor=”middle” class=”si-lbl”>2π</text>
  <text x=”381” y=”158” text-anchor=”middle” class=”si-lbl”>3π</text>
  <text x=”498” y=”158” text-anchor=”middle” class=”si-lbl”>4π</text>
  <!-- SIREN: sin curve — hand-approximated with cubic beziers for 4 periods -->
  <path d=”M30,100
    C50,100 60,30 87,30 S120,100 147,100
    C165,100 175,170 200,170 S235,100 264,100
    C282,100 292,30  317,30  S350,100 381,100
    C399,100 409,170 434,170 S469,100 498,100”
    class=”si-sin”/>
  <!-- ReLU piecewise approximation of the same curve — jagged steps -->
  <path d=”M30,100 L57,100 L57,30 L114,30 L114,100 L171,100 L171,170 L228,170 L228,100 L264,100 L264,30 L321,30 L321,100 L381,100 L381,170 L435,170 L435,100 L498,100”
    class=”si-relu”/>
  <!-- legend -->
  <line x1=”40”  y1=”168” x2=”65”  y2=”168” stroke=”#0891b2” stroke-width=”2.4”/>
  <text x=”70”  y=”172” class=”si-leg” fill=”#0891b2”>SIREN sin(ωx) — smooth all derivatives</text>
  <line x1=”280” y1=”168” x2=”305” y2=”168” stroke=”#94a3b8” stroke-width=”2”/>
  <text x=”310” y=”172” class=”si-leg” fill=”#94a3b8”>ReLU approx — piecewise, no smooth derivatives</text>
</svg>
<figcaption>SIREN (blue, smooth) vs. a ReLU piecewise approximation of the same sinusoidal target. The SIREN represents the true smooth signal exactly because its activations have infinite-order smooth derivatives. ReLU can approximate it, but only with many more layers and with derivative discontinuities that limit precision in applications like physics-based neural fields.</figcaption>
</figure>
</div>

<div class="blog-figure">
<figure>
<img src="/images/blog/basics/activation-special-grid.svg" alt="Grid of output, gated, sparse, and special activations including Softmax, LogSoftmax, Maxout, GLU, SwiGLU, GeGLU, ReGLU, TanhShrink, SoftShrink, HardShrink, Sparsemax, Entmax, SIREN, Gaussian RBF, Soft Exponential, and spline-style activations">
<figcaption>Figure 2 — This last family is much more diverse. Some activations map logits to probabilities, some implement feature gating, some encourage sparsity, and some are designed for special function classes such as implicit fields or spline-based networks.</figcaption>
</figure>
</div>

## Common Mistakes

<div class="warning-box">
  <strong>Four mistakes that show up constantly:</strong>
  <ol>
    <li><strong>Applying softmax before `CrossEntropyLoss` in PyTorch.</strong> That loss expects raw logits.</li>
    <li><strong>Using sigmoid for mutually exclusive multi-class classification.</strong> Usually you want softmax instead.</li>
    <li><strong>Ignoring the output activation entirely.</strong> The last-layer activation should match both the task and the loss.</li>
    <li><strong>Assuming all gating activations are interchangeable.</strong> SwiGLU, GeGLU, and ReGLU can change optimization noticeably in large models.</li>
  </ol>
</div>

## Practical Recommendation Map

<div class="summary-box">
  <table class="mini-table">
    <thead>
      <tr>
        <th>Use case</th>
        <th>Recommended activation</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Binary classification output</td>
        <td><strong>Sigmoid</strong></td>
      </tr>
      <tr>
        <td>Multi-class classification output</td>
        <td><strong>Softmax</strong></td>
      </tr>
      <tr>
        <td>Regression output</td>
        <td><strong>Linear</strong></td>
      </tr>
      <tr>
        <td>Transformer feed-forward blocks</td>
        <td><strong>GELU</strong> or <strong>SwiGLU</strong></td>
      </tr>
      <tr>
        <td>Sparse probability-like outputs</td>
        <td><strong>Sparsemax</strong> or <strong>Entmax</strong></td>
      </tr>
      <tr>
        <td>Implicit neural representations</td>
        <td><strong>SIREN</strong></td>
      </tr>
      <tr>
        <td>Radial similarity models</td>
        <td><strong>Gaussian / RBF</strong></td>
      </tr>
    </tbody>
  </table>
</div>

## What Can Go Wrong with Output and Special Activations?

<div class="summary-box">
  <table class="mini-table">
    <thead>
      <tr>
        <th>Activation family</th>
        <th>Potential problem</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Softmax</strong></td>
        <td>Easy to misuse with the wrong loss pipeline, especially if you apply it before losses that expect raw logits.</td>
      </tr>
      <tr>
        <td><strong>Sigmoid outputs</strong></td>
        <td>Wrong choice for mutually exclusive multi-class prediction, where softmax is usually the right tool.</td>
      </tr>
      <tr>
        <td><strong>GLU-style gating</strong></td>
        <td>More expressive, but also more parameter-heavy and architecture-dependent.</td>
      </tr>
      <tr>
        <td><strong>Sparsemax / Entmax</strong></td>
        <td>Useful for sparsity, but can change optimization behavior enough that they are not just drop-in replacements for softmax.</td>
      </tr>
      <tr>
        <td><strong>SIREN / RBF / spline-style activations</strong></td>
        <td>Very powerful in the right niche, but usually a poor default if the model and task were not designed for them.</td>
      </tr>
    </tbody>
  </table>
</div>

## Final Takeaway

Activation functions are not a side detail. They define:

1. how information flows forward,
2. how gradients flow backward,
3. what geometry the model can represent,
4. and what kind of output object the network produces.

That is why the full story needs more than one chapter. ReLU, GELU, Softmax, SwiGLU, Sparsemax, and SIREN are not solving the same problem. They all live under the same name, but they serve very different roles.

## References

1. Dauphin, Y. N. et al. “Language Modeling with Gated Convolutional Networks.” 2017.
2. Shazeer, N. “GLU Variants Improve Transformer.” 2020.
3. Martins, A. and Astudillo, R. “From Softmax to Sparsemax.” ICML 2016.
4. Peters, B. et al. “Sparse Sequence-to-Sequence Models.” ACL 2019.
5. Sitzmann, V. et al. “Implicit Neural Representations with Periodic Activation Functions.” NeurIPS 2020.
