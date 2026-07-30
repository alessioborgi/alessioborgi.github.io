---
layout: single
title: "Output and Gated Activations: Softmax, Sparsemax, GLU, and SIREN"
date: 2026-06-03
categories: [basics]
book: basics
subsection: activation-functions
tags: [softmax, sparsemax, glu, swiglu, siren]
excerpt: "The last activation in your network is not a modelling preference — it is a contract with your loss function. Break it and training stops meaning anything. Here is the contract, and what changes when the activation itself becomes learned."
author_profile: true
read_time: true
is_overview: false
icon: "🧰"
read_mins: 7
permalink: /blog/basics/output-gated-and-special-activations/
toc: true
toc_label: "Contents"
---
<style>
/* Page-specific only. Callouts, figures, formula boxes, table overflow,
   reduced-motion and dark-mode handling now live in
   _sass/layout/_blog-components.scss and are shared across all posts. */
.temp-demo {
  background: linear-gradient(145deg, #f8fafc, #f0f4f8);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.15rem 1.2rem;
  margin: 1.25rem 0;
}
.temp-demo__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.7rem;
}
.temp-demo__controls label {
  font-weight: 700;
  color: #0f2a36;
  font-size: 0.9rem;
}
.temp-demo__controls input[type="range"] {
  flex: 1 1 200px;
  min-width: 160px;
  height: 1.75rem;
}
.temp-demo__readout {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: #0c4a6e;
  min-width: 4.5rem;
}
.temp-demo__note {
  font-size: 0.82rem;
  color: #4b5563;
  margin: 0.6rem 0 0;
  font-style: italic;
}
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> The activation on your final layer is fixed by the loss you chose, not by taste. The commonest bug in the whole topic follows from that: <code>CrossEntropyLoss</code> already applies log-softmax, so calling softmax before it applies the normalisation twice and flattens your gradients. Inside the network the logic inverts — there the activation is a free design choice, and the modern answer is to make part of it learned.
</div>

<p><em>Part 3 of 3. <a href="/blog/basics/activation-functions/">Part 1</a> covers what activations do; <a href="/blog/basics/modern-activation-functions/">Part 2</a> covers ReLU, GELU and SiLU. This page assumes you have met those.</em></p>

## The output layer is a contract with the loss

Hidden-layer activations shape what a network *thinks*. The output activation decides what it *says*, and must hand the loss exactly the object that loss was derived for.

| Task | Output activation | What the loss needs |
| --- | --- | --- |
| Binary classification | Sigmoid | One probability in \\((0, 1)\\) |
| Multi-class classification | Softmax | A vector on the probability simplex\* |
| Regression | Identity | An unconstrained real value |

\*The **probability simplex** is just the set of valid probability vectors: all entries non-negative, summing to one. Softmax turns \\(K\\) logits into a point in it:

<div class="formula-box">
\[
\operatorname{softmax}(\mathbf{z})_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}},
\qquad \mathbf{z}\in\mathbb{R}^{K}
\]
</div>

The subscript sits on the *output*: softmax maps a whole vector to a whole vector, so \\(\operatorname{softmax}(z_i)\\) is not a meaningful expression.

**Worked example.** A three-class classifier emits logits \\(\mathbf{z} = [2.0,\ 1.0,\ 0.1]\\).

| Step | Computation | Result |
|---|---|---|
| Exponentiate | \\(e^{2.0},\ e^{1.0},\ e^{0.1}\\) | 7.389, 2.718, 1.105 |
| Sum | 7.389 + 2.718 + 1.105 | **11.212** |
| Normalise | each divided by 11.212 | **0.659, 0.242, 0.099** |

These are *normalised*, not *calibrated* — trained networks are usually over-confident, which is why temperature scaling exists. Note 0.659 / 0.242 = 2.72: one unit of logit advantage multiplies the odds by \\(e\\).

Dividing logits by a temperature \\(T\\) before exponentiating rescales that sharpness. Drag the slider:

<div class="temp-demo">
  <div class="temp-demo__controls">
    <label for="temp-slider">Temperature <em>T</em></label>
    <input type="range" id="temp-slider" min="0.1" max="5" step="0.1" value="1"
           aria-describedby="temp-readout">
    <span class="temp-demo__readout" id="temp-readout" role="status" aria-live="polite">T = 1.0</span>
  </div>
  <svg id="temp-svg" role="img" aria-labelledby="temp-title temp-desc"
       viewBox="0 0 460 152" style="max-width:460px;width:100%;height:auto;display:block;margin:0 auto">
    <title id="temp-title">Softmax probabilities at the selected temperature</title>
    <desc id="temp-desc">Three bars for classes C1, C2 and C3, from logits 2.0, 1.0 and 0.1. At T = 1 they read 66%, 24% and 10%. Lowering T concentrates probability on C1 until it approaches 100%; raising T flattens the bars toward 33% each.</desc>
    <line x1="42" y1="130" x2="440" y2="130" stroke="#475569" stroke-width="1.5"/>
    <text x="34" y="50"  font-size="10" fill="#475569" text-anchor="end">100%</text>
    <text x="34" y="133" font-size="10" fill="#475569" text-anchor="end">0%</text>
    <g id="temp-bars">
      <rect x="90"  y="74.6"  width="70" height="55.4" rx="3" fill="#0e7490"/>
      <rect x="200" y="109.6" width="70" height="20.4" rx="3" fill="#0e7490"/>
      <rect x="310" y="121.7" width="70" height="8.3"  rx="3" fill="#0e7490"/>
    </g>
    <g id="temp-vals" font-size="12" font-weight="700" fill="#0f2a36" text-anchor="middle">
      <text x="125" y="69.2">66%</text>
      <text x="235" y="104.2">24%</text>
      <text x="345" y="116.3">10%</text>
    </g>
    <g font-size="10.5" fill="#374151" text-anchor="middle">
      <text x="125" y="146">C1 (z = 2.0)</text>
      <text x="235" y="146">C2 (z = 1.0)</text>
      <text x="345" y="146">C3 (z = 0.1)</text>
    </g>
  </svg>
  <p class="temp-demo__note">As <em>T</em> → 0 softmax approaches one-hot; as <em>T</em> → ∞ it approaches uniform. Distillation uses high <em>T</em> to expose the ratios between losing classes.</p>
</div>

<script>
(function () {
  var slider = document.getElementById('temp-slider');
  if (!slider) return;
  var logits = [2.0, 1.0, 0.1], BASE = 130, SCALE = 0.84;
  var bars = document.querySelectorAll('#temp-bars rect');
  var vals = document.querySelectorAll('#temp-vals text');
  var readout = document.getElementById('temp-readout');
  function render() {
    var T = parseFloat(slider.value);
    var m = Math.max.apply(null, logits);
    var e = logits.map(function (z) { return Math.exp((z - m) / T); });
    var s = e.reduce(function (a, b) { return a + b; }, 0);
    e.forEach(function (v, i) {
      var p = v / s, h = p * 100 * SCALE;
      bars[i].setAttribute('y', (BASE - h).toFixed(1));
      bars[i].setAttribute('height', Math.max(h, 0.5).toFixed(1));
      vals[i].setAttribute('y', (BASE - h - 5.4).toFixed(1));
      vals[i].textContent = (p * 100).toFixed(0) + '%';
    });
    readout.textContent = 'T = ' + T.toFixed(1);
  }
  slider.addEventListener('input', render);
  render();
})();
</script>

### When you need exact zeros: sparsemax

Softmax never returns a zero — every class keeps some mass. **Sparsemax** instead takes the logit vector and finds the *nearest* valid probability vector to it in ordinary Euclidean distance. Because the nearest point often lies on an edge or corner of the simplex, entries genuinely hit zero:

<div class="formula-box">
\[
\operatorname{sparsemax}(\mathbf{z}) = \arg\min_{\mathbf{p}\in\Delta^{K-1}} \lVert \mathbf{p}-\mathbf{z}\rVert_2^2
= \big[\,z_i - \tau(\mathbf{z})\,\big]_+
\]
</div>

The threshold \\(\tau\\) is set so the clipped values sum to one. (**Entmax** interpolates between the two.)

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="sp-title sp-desc" viewBox="0 0 460 168" style="max-width:460px;width:100%;height:auto">
  <title id="sp-title">Softmax compared with sparsemax on identical logits</title>
  <desc id="sp-desc">Two bar charts built from logits 3, 2.4, 0, minus 1 and minus 2. Softmax gives 61.6, 33.8, 3.1, 1.1 and 0.4 percent, so every class keeps some mass. Sparsemax gives 80, 20, 0, 0 and 0 percent, so the last three classes are exactly zero.</desc>
  <rect x="1" y="1" width="458" height="166" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="118" y="19" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">Softmax (dense)</text>
  <text x="342" y="19" text-anchor="middle" font-size="11" font-weight="700" fill="#9a3412">Sparsemax (sparse)</text>
  <line x1="25" y1="130" x2="212" y2="130" stroke="#475569" stroke-width="1.3"/>
  <line x1="250" y1="130" x2="437" y2="130" stroke="#475569" stroke-width="1.3"/>
  <!-- softmax = 61.6 33.8 3.1 1.1 0.4 percent, drawn at 0.8 px per percent -->
  <g fill="#0e7490">
    <rect x="33"  y="80.7"  width="24" height="49.3" rx="2"/>
    <rect x="69"  y="102.9" width="24" height="27.1" rx="2"/>
    <rect x="105" y="127.5" width="24" height="2.5"  rx="1"/>
    <rect x="141" y="129.1" width="24" height="0.9"  rx="1"/>
    <rect x="177" y="129.4" width="24" height="0.6"  rx="1"/>
  </g>
  <g font-size="9.5" fill="#334155" text-anchor="middle">
    <text x="45"  y="76">61.6%</text><text x="81"  y="98">33.8%</text>
    <text x="117" y="123">3.1%</text><text x="153" y="123">1.1%</text><text x="189" y="123">0.4%</text>
  </g>
  <!-- sparsemax = 80 20 0 0 0 percent -->
  <g fill="#c2410c">
    <rect x="258" y="66"    width="24" height="64"  rx="2"/>
    <rect x="294" y="114"   width="24" height="16"  rx="2"/>
    <rect x="330" y="129.4" width="24" height="0.6" rx="0.3"/>
    <rect x="366" y="129.4" width="24" height="0.6" rx="0.3"/>
    <rect x="402" y="129.4" width="24" height="0.6" rx="0.3"/>
  </g>
  <g font-size="9.5" fill="#334155" text-anchor="middle">
    <text x="270" y="61">80%</text><text x="306" y="109">20%</text>
    <text x="342" y="123">0</text><text x="378" y="123">0</text><text x="414" y="123">0</text>
  </g>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="45"  y="144">C1</text><text x="81"  y="144">C2</text><text x="117" y="144">C3</text>
    <text x="153" y="144">C4</text><text x="189" y="144">C5</text>
    <text x="270" y="144">C1</text><text x="306" y="144">C2</text><text x="342" y="144">C3</text>
    <text x="378" y="144">C4</text><text x="414" y="144">C5</text>
  </g>
  <text x="230" y="161" text-anchor="middle" font-size="9.5" fill="#475569">logits z = [3, 2.4, 0, −1, −2]</text>
</svg>
<figcaption>Softmax leaves C3–C5 holding 3.1%, 1.1% and 0.4% — small, but never zero. Sparsemax zeroes them exactly, which is what sparse attention needs when some tokens must receive no weight. The trade-off: classes outside the support receive no gradient.</figcaption>
</figure>
</div>

Sparsemax is often filed beside the elementwise *shrinkage* maps (SoftShrink, HardShrink), but those treat each coordinate independently with no normalisation, whereas sparsemax acts on the whole vector at once.

## Gating: when part of the activation is learned

A ReLU asks one question per unit: *should this value pass?* A gated activation asks two projections to collaborate — one produces content, the other a per-channel gate that scales it:

<div class="formula-box">
\[
\operatorname{GLU}(\mathbf{x}) = \underbrace{(W_1\mathbf{x} + \mathbf{b}_1)}_{\text{content }\mathbf{a}}
\;\odot\;
\sigma\big(\underbrace{W_2\mathbf{x} + \mathbf{b}_2}_{\text{gate input }\mathbf{b}}\big)
\]
</div>

Here \\(\odot\\) is the elementwise product. Swapping the gate nonlinearity gives the family: **SwiGLU** (SiLU), **GeGLU** (GELU), **ReGLU** (ReLU).

**Worked example.** With content \\(\mathbf{a} = [1.2,\ -0.4,\ 0.8]\\) and gate input \\(\mathbf{b} = [2.1,\ -1.5,\ 0.3]\\):

| Step | GLU | Plain linear |
|---|---|---|
| Gate | \\(\sigma(\mathbf{b}) = [0.89,\ 0.18,\ 0.57]\\) | — |
| Output | \\(\mathbf{a} \odot \sigma(\mathbf{b}) = [1.07,\ -0.07,\ 0.46]\\) | \\([1.2,\ -0.4,\ 0.8]\\) |

The second channel drops from −0.4 to −0.07 because its gate value is 0.18. Since \\(\mathbf{b}\\) is learned from the input, that suppression varies per example — a decision no plain linear layer can make.

<div class="insight-box">
  <strong>Key Insight — the parameter budget:</strong> A GLU block needs <em>three</em> matrices (\(W_1\), \(W_2\), and the down-projection) where a plain MLP needs two, so a like-for-like comparison has to shrink the hidden width to \(\tfrac{2}{3}\) of \(4d_{\text{model}}\). At \(d_{\text{model}} = 4096\) that is LLaMA's width of 11008, which brings SwiGLU back to ≈135M parameters against the GELU MLP's ≈134M — without the correction it would be ≈201M. The reported gains are real but modest, and Shazeer offers no theory for <em>why</em> Swish beats GELU as the gate.
</div>

Only the original sigmoid gate is bounded in \\((0,1)\\); SwiGLU, GeGLU and ReGLU gates are unbounded above, so they can amplify a channel, not just attenuate it. LLaMA, Mistral and Qwen use SwiGLU; Gemma uses GeGLU.

## SIREN: when you need derivatives, not just values

Inside the network the activation is a free choice, and sometimes the task dictates it just as firmly as a loss does. To store an image or 3-D shape *as a function* from coordinates to values — an implicit neural representation — a ReLU network is a poor fit: it is piecewise linear, so its second derivative is zero almost everywhere. If you need the field's curvature, that is fatal. **SIREN** uses a sine, whose derivatives are again sines:

<div class="formula-box">
\[
\Phi_i(\mathbf{x}) = \sin\!\big(\omega_0 (W_i\mathbf{x} + \mathbf{b}_i)\big), \qquad \omega_0 = 30
\]
</div>

The \\(\omega_0\\) factor is not cosmetic, and neither is its initialisation: hidden-layer weights are drawn from $$\mathcal{U}\!\left(-\sqrt{6/n}/\omega_0,\ +\sqrt{6/n}/\omega_0\right)$$ for fan-in \\(n\\) (the first layer uses \\(\mathcal{U}(-1/n,\ 1/n)\\) instead). That keeps the pre-activation distribution stable with depth. Sine activations predate SIREN; this initialisation is what made deep ones trainable — implement \\(\sin(\omega x)\\) without it and the network will not converge.

## Common mistakes

<div class="warning-box">
  <strong>Three that show up constantly:</strong>
  <ol>
    <li><strong>Applying softmax before <code>CrossEntropyLoss</code>.</strong> That loss already applies log-softmax internally — hand it raw logits.</li>
    <li><strong>Using sigmoid for mutually exclusive classes.</strong> Independent per-class probabilities will not sum to one; use softmax.</li>
    <li><strong>Treating gate variants as drop-in swaps.</strong> Moving from SwiGLU to GeGLU changes optimisation behaviour, and changing the hidden width changes the parameter count.</li>
  </ol>
</div>

Why the first one bites: the fused loss evaluates \\(\log \sum_j e^{z_j} = m + \log \sum_j e^{z_j - m}\\) with \\(m = \max_j z_j\\), which cannot overflow. Normalising yourself throws that away *and* normalises twice:

```python
logits = model(x)                    # no softmax inside the model
loss = F.cross_entropy(logits, y)    # applies log_softmax internally
probs = logits.softmax(-1)           # only for reporting
```

## Which one to reach for

The three output cases are in the table at the top. Beyond those:

| Use case | Activation | Watch out for |
|---|---|---|
| Transformer feed-forward | SwiGLU or GeGLU | Shrink hidden width by 2/3 to keep parameters matched |
| Sparse attention weights | Sparsemax or Entmax | Not in PyTorch core (`pip install entmax`); zeroed classes get no gradient |
| Implicit neural fields | SIREN | Useless without the \\(\omega_0\\) initialisation |

Output activations answer to the loss. Everything inside answers to the task.

## References

1. Dauphin, Y. N., Fan, A., Auli, M., & Grangier, D. [Language Modeling with Gated Convolutional Networks](https://arxiv.org/abs/1612.08083). *ICML 2017*.
2. Shazeer, N. [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). arXiv:2002.05202, 2020.
3. Martins, A. & Astudillo, R. [From Softmax to Sparsemax](https://arxiv.org/abs/1602.02068). *ICML 2016*.
4. Peters, B., Niculae, V., & Martins, A. [Sparse Sequence-to-Sequence Models](https://arxiv.org/abs/1905.05702). *ACL 2019*.
5. Sitzmann, V., Martel, J., Bergman, A., Lindell, D., & Wetzstein, G. [Implicit Neural Representations with Periodic Activation Functions](https://arxiv.org/abs/2006.09661). *NeurIPS 2020*.
6. Guo, C., Pleiss, G., Sun, Y., & Weinberger, K. [On Calibration of Modern Neural Networks](https://arxiv.org/abs/1706.04599). *ICML 2017*.
