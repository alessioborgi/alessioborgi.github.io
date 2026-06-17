---
layout: single
title: "Sinusoidal Positional Encodings: The Original Solution"
date: 2026-05-26
categories: [transformers]
book: transformers
tags: [positional-encoding, sinusoidal]
excerpt: "The PE method from the 2017 'Attention Is All You Need' paper uses sine and cosine waves at different frequencies. Learn why this elegant choice encodes position without any training."
author_profile: true
read_time: true
is_overview: false
subsection: positional-encodings
icon: "〰️"
read_mins: 4
permalink: /blog/transformers/pe-sinusoidal/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.insight-box { background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 8px; padding: .95rem 1.1rem; margin: 1.25rem 0; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.formula-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .8rem 1.1rem; font-family: 'Georgia', serif; font-size: 1rem; margin: 1rem 0; text-align: center; color: #1e3a5f; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Sinusoidal PE assigns each position a unique vector made of alternating sin/cos values at geometrically spaced frequencies. It requires no training, generalises gracefully, and was the default for early Transformers.
</div>
{% include figure image_path="/images/blog/transformers/vaswani2017_scaled_dot_product.png" alt="Sinusoidal PE diagram" caption="Sinusoidal positional encodings (Vaswani et al., 2017)" %}

<div class="insight-box">
<strong>Why this design feels elegant:</strong> no learned parameters, smooth frequency spectrum, and every position gets a unique code the model can extrapolate beyond training.
</div>


## Intuition First: Why Waves?

Imagine you want to give each position in a sequence a unique "fingerprint" using only values between −1 and +1. A single sine wave won't work — it repeats. But if you stack many sine waves at different frequencies, their combined values at any position form a unique signature (like a barcode).

That's exactly what sinusoidal PE does: each dimension of the encoding vector is one wave of a specific frequency. Low-index dimensions oscillate fast; high-index dimensions oscillate slowly. Together, they uniquely identify any position.

## The Formula

For a token at position `pos`, dimension `i` of its PE vector is:

<div class="formula-box">
PE(pos, 2i)   = sin( pos / 10000<sup>2i/d</sup> )<br>
PE(pos, 2i+1) = cos( pos / 10000<sup>2i/d</sup> )
</div>

That's it. Even dimensions get a sine, odd dimensions get a cosine. The frequency shrinks geometrically as `i` increases.

## The Intuition: A Continuous Binary Counter

Think of binary numbers: 0001, 0010, 0011, 0100, … The rightmost bit flips every step (high frequency); the leftmost bit flips rarely (low frequency). Together they uniquely identify each integer.

Sinusoidal PE does the same in a continuous, smooth way:
- **High dimensions (i small → high frequency):** the sin/cos oscillates rapidly, capturing fine-grained position differences.
- **Low dimensions (i large → low frequency):** the sin/cos changes slowly, encoding coarse position.

Each position gets a unique fingerprint — a mix of fast and slow oscillations — that the model can read.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <!-- Heatmap: positions (rows) x dimensions (columns) -->
  <!-- Simulate using colored rectangles -->
  <!-- 10 positions × 16 dimensions -->
  <!-- Colors represent sin values: dark blue = -1, white = 0, dark teal = +1 -->
  <text x="260" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Sinusoidal PE heatmap (10 positions × 16 dims)</text>
  <text x="12" y="110" text-anchor="middle" font-size="9" fill="#6b7280" transform="rotate(-90,12,110)">position →</text>
  <text x="260" y="195" text-anchor="middle" font-size="9" fill="#6b7280">dimension →</text>
  <!-- Row/col labels -->
  <text x="34" y="30" text-anchor="end" font-size="8" fill="#9ca3af">0</text>
  <text x="34" y="46" text-anchor="end" font-size="8" fill="#9ca3af">1</text>
  <text x="34" y="62" text-anchor="end" font-size="8" fill="#9ca3af">2</text>
  <text x="34" y="78" text-anchor="end" font-size="8" fill="#9ca3af">3</text>
  <text x="34" y="94" text-anchor="end" font-size="8" fill="#9ca3af">4</text>
  <text x="34" y="110" text-anchor="end" font-size="8" fill="#9ca3af">5</text>
  <text x="34" y="126" text-anchor="end" font-size="8" fill="#9ca3af">6</text>
  <text x="34" y="142" text-anchor="end" font-size="8" fill="#9ca3af">7</text>
  <text x="34" y="158" text-anchor="end" font-size="8" fill="#9ca3af">8</text>
  <text x="34" y="174" text-anchor="end" font-size="8" fill="#9ca3af">9</text>
  <!-- dim labels -->
  <text x="43"  y="187" text-anchor="middle" font-size="7" fill="#9ca3af">0</text>
  <text x="73"  y="187" text-anchor="middle" font-size="7" fill="#9ca3af">2</text>
  <text x="103" y="187" text-anchor="middle" font-size="7" fill="#9ca3af">4</text>
  <text x="133" y="187" text-anchor="middle" font-size="7" fill="#9ca3af">6</text>
  <text x="163" y="187" text-anchor="middle" font-size="7" fill="#9ca3af">8</text>
  <text x="193" y="187" text-anchor="middle" font-size="7" fill="#9ca3af">10</text>
  <text x="223" y="187" text-anchor="middle" font-size="7" fill="#9ca3af">12</text>
  <text x="253" y="187" text-anchor="middle" font-size="7" fill="#9ca3af">14</text>
  <!-- Approximated heatmap cells (sin/cos values precomputed) -->
  <!-- pos=0: all dims → sin(0)=0, cos(0)=1 alternating → 0,1,0,1,... -->
  <rect x="37" y="22" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/><!-- ~0 -->
  <rect x="67" y="22" width="28" height="12" rx="1" fill="#0d9488"/><!-- +1 cos -->
  <rect x="97" y="22" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="127" y="22" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="157" y="22" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="187" y="22" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="22" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="22" width="28" height="12" rx="1" fill="#0d9488"/>
  <!-- pos=1 high-freq dims oscillate -->
  <rect x="37" y="38" width="28" height="12" rx="1" fill="#0d9488"/><!-- sin(1)≈0.84 -->
  <rect x="67" y="38" width="28" height="12" rx="1" fill="#1e9b8a"/><!-- cos(1)≈0.54 -->
  <rect x="97" y="38" width="28" height="12" rx="1" fill="#5bbfba"/><!-- sin(0.1)≈0.1 -->
  <rect x="127" y="38" width="28" height="12" rx="1" fill="#0f9c8e"/><!-- cos ~1 -->
  <rect x="157" y="38" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".6"/>
  <rect x="187" y="38" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="38" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="38" width="28" height="12" rx="1" fill="#0d9488"/>
  <!-- pos=2 -->
  <rect x="37" y="54" width="28" height="12" rx="1" fill="#3bbfb8"/>
  <rect x="67" y="54" width="28" height="12" rx="1" fill="#fff" stroke="#e2e8f0" stroke-width="1"/><!-- cos(2)≈-0.42 -->
  <rect x="97" y="54" width="28" height="12" rx="1" fill="#6ec9c3"/>
  <rect x="127" y="54" width="28" height="12" rx="1" fill="#0d9d8e"/>
  <rect x="157" y="54" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".7"/>
  <rect x="187" y="54" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="54" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="54" width="28" height="12" rx="1" fill="#0d9488"/>
  <!-- pos=3 -->
  <rect x="37" y="70" width="28" height="12" rx="1" fill="#eef" stroke="#c7d4f2"/>
  <rect x="67" y="70" width="28" height="12" rx="1" fill="#c5e8e6"/>
  <rect x="97" y="70" width="28" height="12" rx="1" fill="#7dd3d0"/>
  <rect x="127" y="70" width="28" height="12" rx="1" fill="#0d9c8e"/>
  <rect x="157" y="70" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".8"/>
  <rect x="187" y="70" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="70" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="70" width="28" height="12" rx="1" fill="#0d9488"/>
  <!-- Remaining rows simplified, showing pattern -->
  <rect x="37" y="86"  width="28" height="12" rx="1" fill="#c5e8e6"/>
  <rect x="67" y="86"  width="28" height="12" rx="1" fill="#e8faff" stroke="#c7d4f2"/>
  <rect x="97" y="86"  width="28" height="12" rx="1" fill="#5bbfba"/>
  <rect x="127" y="86" width="28" height="12" rx="1" fill="#0d9c8d"/>
  <rect x="157" y="86" width="28" height="12" rx="1" fill="#8adbd8"/>
  <rect x="187" y="86" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="86" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="86" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="37"  y="102" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="67"  y="102" width="28" height="12" rx="1" fill="#3bbfb8"/>
  <rect x="97"  y="102" width="28" height="12" rx="1" fill="#7dd3d0"/>
  <rect x="127" y="102" width="28" height="12" rx="1" fill="#0d9c8e"/>
  <rect x="157" y="102" width="28" height="12" rx="1" fill="#8adbd8"/>
  <rect x="187" y="102" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="102" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="102" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="37"  y="118" width="28" height="12" rx="1" fill="#4bc5be"/>
  <rect x="67"  y="118" width="28" height="12" rx="1" fill="#eef" stroke="#c7d4f2"/>
  <rect x="97"  y="118" width="28" height="12" rx="1" fill="#aaddd9"/>
  <rect x="127" y="118" width="28" height="12" rx="1" fill="#0e9c8e"/>
  <rect x="157" y="118" width="28" height="12" rx="1" fill="#8adbd8"/>
  <rect x="187" y="118" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="118" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="118" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="37"  y="134" width="28" height="12" rx="1" fill="#e8faff" stroke="#c7d4f2"/>
  <rect x="67"  y="134" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="97"  y="134" width="28" height="12" rx="1" fill="#c5e8e6"/>
  <rect x="127" y="134" width="28" height="12" rx="1" fill="#0d9c8d"/>
  <rect x="157" y="134" width="28" height="12" rx="1" fill="#8adbd8"/>
  <rect x="187" y="134" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="134" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="134" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="37"  y="150" width="28" height="12" rx="1" fill="#3bbfb8"/>
  <rect x="67"  y="150" width="28" height="12" rx="1" fill="#4bc5be"/>
  <rect x="97"  y="150" width="28" height="12" rx="1" fill="#e8faff" stroke="#c7d4f2"/>
  <rect x="127" y="150" width="28" height="12" rx="1" fill="#0e9c8d"/>
  <rect x="157" y="150" width="28" height="12" rx="1" fill="#8adbd8"/>
  <rect x="187" y="150" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="150" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="150" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="37"  y="166" width="28" height="12" rx="1" fill="#eef" stroke="#c7d4f2"/>
  <rect x="67"  y="166" width="28" height="12" rx="1" fill="#c5e8e6"/>
  <rect x="97"  y="166" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="127" y="166" width="28" height="12" rx="1" fill="#0f9e90"/>
  <rect x="157" y="166" width="28" height="12" rx="1" fill="#8adbd8"/>
  <rect x="187" y="166" width="28" height="12" rx="1" fill="#0d9488"/>
  <rect x="217" y="166" width="28" height="12" rx="1" fill="#7dd3d0" opacity=".5"/>
  <rect x="247" y="166" width="28" height="12" rx="1" fill="#0d9488"/>
  <!-- Legend -->
  <rect x="310" y="80" width="14" height="14" rx="2" fill="#0d9488"/>
  <text x="328" y="92" font-size="9" fill="#374151">+1 (max sin/cos)</text>
  <rect x="310" y="100" width="14" height="14" rx="2" fill="#7dd3d0"/>
  <text x="328" y="112" font-size="9" fill="#374151">~0</text>
  <rect x="310" y="120" width="14" height="14" rx="2" fill="#eef" stroke="#c7d4f2"/>
  <text x="328" y="132" font-size="9" fill="#374151">−1 (min)</text>
  <text x="355" y="155" text-anchor="middle" font-size="9" fill="#6b7280">High freq (left cols) oscillate fast.</text>
  <text x="355" y="167" text-anchor="middle" font-size="9" fill="#6b7280">Low freq (right cols) change slowly.</text>
</svg>
<figcaption>Figure 1: Sinusoidal PE heatmap. Each row is a position; each column is a dimension. Left columns (high frequency) alternate rapidly; right columns (low frequency) stay nearly constant.</figcaption>
</figure>
</div>

## Concrete Worked Example (d = 4)

Let's compute the PE vector for position pos = 1 with d = 4 dimensions (i = 0 and i = 1):

```
PE(1, dim=0) = sin(1 / 10000^(0/4)) = sin(1 / 1)       = sin(1.0)  ≈  0.841
PE(1, dim=1) = cos(1 / 10000^(0/4)) = cos(1 / 1)       = cos(1.0)  ≈  0.540
PE(1, dim=2) = sin(1 / 10000^(2/4)) = sin(1 / 100)     = sin(0.01) ≈  0.010
PE(1, dim=3) = cos(1 / 10000^(2/4)) = cos(1 / 100)     = cos(0.01) ≈  1.000
```

So PE(pos=1) ≈ [0.841, 0.540, 0.010, 1.000].

Now compare pos = 2:
```
PE(2, dim=0) = sin(2.0) ≈  0.909    (changed a lot — high frequency)
PE(2, dim=2) = sin(0.02) ≈ 0.020    (barely changed — low frequency)
```

The high-frequency dims (left) distinguish nearby positions; the low-frequency dims (right) distinguish distant ones. Together they uniquely encode every position.

<div class="insight-box">
<strong>Why this is clever:</strong> at d_model = 512, the 256 pairs of (sin, cos) cover frequencies from a period of ~6 tokens up to ~62,832 tokens. Every position gets a unique fingerprint, and the model can learn to read it.
</div>

## Three Key Properties

**1. Uniqueness.** The combination of many frequencies produces a unique vector for each position — like a fingerprint. Two positions will never have the same PE vector.

**2. Smooth transitions.** Adjacent positions have similar PE vectors. The model can learn that nearby positions are related without any explicit guidance.

**3. Relative encoding via dot products.** The dot product `PE(pos₁) · PE(pos₂)` depends only on the *distance* `pos₁ − pos₂`. This means the model can implicitly reason about relative distances from absolute positions — a crucial and non-obvious property.

## Why Use 10000?

The base 10000 is chosen so that the wavelengths span from 2π (highest frequency, dim 0) to 10000·2π (lowest frequency, last dim). This gives the model coverage over positions from 1 to roughly 10,000 tokens — sufficient for most early use cases.

## Limitations

- Fixed formula, so it can't be fine-tuned for a specific task.
- Extrapolation beyond the training length is imperfect, though better than learned absolute PEs.
- Modern LLMs (with 128K+ context windows) need better solutions — enter RoPE and ALiBi.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Sinusoidal PE uses <strong>sin/cos at geometrically decreasing frequencies</strong> to build unique position fingerprints.</li>
  <li>No parameters — fully deterministic and requires no training.</li>
  <li>Adjacent positions have similar encodings; the dot product encodes <strong>relative distance implicitly</strong>.</li>
  <li>Works well for sequences up to ~10K tokens; modern LLMs prefer RoPE or ALiBi for longer contexts.</li>
</ul>
</div>
