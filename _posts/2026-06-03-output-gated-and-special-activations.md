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

## Why Gated Activations Became So Important

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

<div class="insight-box">
<strong>Useful mental model:</strong> ReLU asks “should this neuron pass?” GLU-like activations ask “how strongly should this feature gate another feature?”
</div>

<div class="blog-figure">
<figure>
<img src="/images/blog/basics/activation-output-map.svg" alt="Diagram contrasting hidden-layer activations, output activations, and gated activations">
<figcaption>Figure 1 — Not all activations play the same role. Hidden-layer activations shape features, output activations shape the prediction object, and gated activations decide how one feature stream modulates another.</figcaption>
</figure>
</div>

## Shrinkage and Sparse Activations

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
