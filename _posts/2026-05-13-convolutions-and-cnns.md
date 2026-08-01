---
layout: single
title: "Convolutions and CNNs: Weight Sharing as a Prior"
date: 2026-05-13
categories: [basics]
book: basics
subsection: deep-learning
tags: [cnn, convolution, receptive-field, pooling, equivariance]
published: true
is_overview: false
excerpt: "A dense layer from a 224-by-224 colour image to 1000 units holds 150.5 million weights; a 3-by-3, 64-filter convolution holds 1,792 — and the two constraints that buy that factor of 84,000 are exactly the prior that makes it work on images."
author_profile: true
read_time: true
icon: "🖼️"
read_mins: 16
permalink: /blog/basics/convolutions-and-cnns/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A convolutional layer is a fully-connected layer with two constraints bolted on: each output unit may look only at a small spatial neighbourhood (<em>local connectivity</em>), and every output unit in a channel must use the same weights (<em>weight sharing</em>). On a \(224 \times 224 \times 3\) input, a dense layer to 1000 units needs 150,529,000 parameters; a \(3 \times 3\) convolution with 64 filters needs 1,792 — a factor of about 84,000. Those constraints are not merely a compression trick: they encode the assumption that a useful visual feature is local and means the same thing everywhere. Convolution is <em>equivariant</em> to translation, never invariant — pooling is what buys invariance. And what you do not get for free: rotation, scale, or a receptive field that grows faster than linearly with depth.
</div>

## Start from the layer you already know

Take a dense layer. Every output unit sees every input, with its own private weight for each. That is the most expressive linear map available, and on images it is a disaster — not because it cannot represent the right function, but because it can represent far too many wrong ones, and you would need an implausible amount of data to pick out the right one.

So impose two constraints.

**Local connectivity.** An output unit at position $$(i,j)$$ may read only a small window of the input centred on $$(i,j)$$ — say $$3 \times 3$$. Every weight connecting it to a distant pixel is forced to zero. The assumption: whatever an edge or a corner is, you can tell it is there by looking at a small patch. You do not need pixel $$(3,7)$$ to decide whether there is an edge at $$(180, 200)$$.

**Weight sharing.** Every output unit in the same channel uses the *same* window of weights. The unit at $$(0,0)$$ and the unit at $$(180,200)$$ are computed by the identical $$3 \times 3$$ pattern of numbers. The assumption: a vertical edge in the top-left corner is the same thing as a vertical edge in the bottom-right, so it should be detected by the same detector.

That is the entire content of a convolutional layer. Everything else — stride, padding, dilation, channels — is bookkeeping about *which* windows and *how many* detectors. The two assumptions above are the prior, and the prior is what does the work.

<div class="insight-box">
  <strong>The framing that matters:</strong> constraints on a hypothesis class are only useful when they are <em>true of the data</em>. Locality and shift-invariance of features are true of natural images and false of, say, a table of unordered clinical measurements. The same constraint that makes a CNN data-efficient on photographs makes it worse than useless on data with no meaningful spatial ordering.
</div>

## The confession: it is cross-correlation

The operation every framework calls `conv2d` is not convolution. Convolution, in the signal-processing sense, flips the kernel:

<div class="formula-box">
\[
(x * w)[i] \;=\; \sum_{m} x[m]\, w[i - m]
\]
</div>

What PyTorch, TensorFlow, JAX and every other library actually compute is cross-correlation, which does not:

<div class="formula-box">
\[
y[i] \;=\; \sum_{m} x[i + m]\, w[m]
\]
</div>

Say it once, plainly: **the flip is missing, and it does not matter for learning.** The kernel $$w$$ is a free parameter. Whatever the flipped version would have learned, the unflipped version learns the mirror image of it, and the two networks compute exactly the same set of functions. The function class is identical, so nobody bothers to flip.

It does matter in three places. First, if you *hand-set* a kernel — a Sobel operator, a Gaussian derivative — the sign and orientation conventions from a textbook will come out reversed. Second, true convolution is commutative and associative and satisfies the convolution theorem; cross-correlation does not, so any proof that leans on those properties needs the flip put back. Third, the gradient of a cross-correlation with respect to its input is a convolution (a genuine one), which is why the backward pass and the "transposed convolution" used for upsampling look flipped relative to the forward pass.

For the rest of this post, "convolution" means what the framework means.

## The parameter argument, done properly

Take the standard ImageNet input shape: $$224 \times 224$$ pixels, 3 colour channels. That is

<div class="formula-box">
\[
224 \times 224 \times 3 \;=\; 150{,}528 \ \text{input values.}
\]
</div>

**Dense layer to 1000 units.** Every one of the 1000 units gets its own weight for each of the 150,528 inputs, plus a bias:

<div class="formula-box">
\[
150{,}528 \times 1000 \;+\; 1000 \;=\; 150{,}529{,}000 \ \text{parameters.}
\]
</div>

Roughly 150.5 million weights in a *single layer*, before you have computed a single nonlinearity.

**Convolution, $$3 \times 3$$, 64 filters.** Each filter spans the full input depth, so it is $$3 \times 3 \times 3$$, and there are 64 of them, each with a bias:

<div class="formula-box">
\[
3 \times 3 \times 3 \times 64 \;+\; 64 \;=\; 1728 + 64 \;=\; 1792 \ \text{parameters.}
\]
</div>

The ratio of the weight counts is $$150{,}528{,}000 / 1728 = 87{,}111.1\ldots$$; including biases, $$150{,}529{,}000 / 1792 \approx 84{,}000$$. Either way: roughly five orders of magnitude.

That comparison is a little unfair in the convolution's favour, because the two layers do not produce the same shape of output. Make it fair. The convolution with "same" padding produces a $$224 \times 224 \times 64$$ volume, which is $$3{,}211{,}264$$ values. A dense layer producing that same volume from the same input would need

<div class="formula-box">
\[
150{,}528 \times 3{,}211{,}264 \;=\; 483{,}385{,}147{,}392 \;\approx\; 4.8 \times 10^{11} \ \text{weights,}
\]
</div>

about 280 million times as many as the 1,728 the convolution uses. The like-for-like saving is far larger than the headline comparison suggests.

<div class="warning-box">
  <strong>Parameters are not compute.</strong> The same convolution performs \(224 \times 224 \times 64\) output values, each a sum of \(3 \times 3 \times 3 = 27\) products, for \(86{,}704{,}128 \approx 86.7\) million multiply-accumulates. The dense layer to 1000 units performs 150,528,000 — about 150.5 million. So the convolution has 84,000 times fewer parameters but only about 1.7 times less arithmetic. Weight sharing saves <em>memory and sample complexity</em>, not FLOPs. Each of the 1,728 weights is reused \(224 \times 224 = 50{,}176\) times.
</div>

That reuse factor is the honest statement of what weight sharing does. It is not that the layer does less work; it is that the same small set of numbers is held accountable for 50,176 separate predictions, so the data has 50,176 times as much leverage on each one.

## Channels: why a kernel is three-dimensional

A common confusion: people picture a $$3 \times 3$$ kernel as a $$3 \times 3$$ grid of numbers. On a colour image it is not — it is $$3 \times 3 \times 3$$, a small cuboid, because it must span *all* input channels.

The rule generalises. With $$C_{\text{in}}$$ input channels, one filter is a $$k \times k \times C_{\text{in}}$$ tensor, and it produces **one** output channel. "64 filters" means 64 such cuboids, stacked into a weight tensor of shape $$(C_{\text{out}}, C_{\text{in}}, k, k)$$, producing 64 output channels:

<div class="formula-box">
\[
\#\text{params} \;=\; C_{\text{out}} \left( C_{\text{in}} \, k^2 + 1 \right)
\]
</div>

Check it: $$64 \times (3 \times 9 + 1) = 64 \times 28 = 1792$$. Matches.

There is a structural point hiding here. The layer is *locally connected in space* and *fully connected across channels* — every output channel reads every input channel. Locality was imposed on the spatial axes only, because that is where the prior applies: neighbouring pixels are related, but "channel 17" and "channel 18" have no such relationship. Architectures that break the channel-wise density on purpose (depthwise separable convolutions, grouped convolutions) do so for efficiency, and they pay for it with a $$1 \times 1$$ convolution to mix channels back together.

## Stride, padding, dilation, and the output size

Three knobs change which windows are taken.

- **Stride** $$s$$: move the window $$s$$ positions between outputs instead of 1. Stride 2 halves the resolution.
- **Padding** $$p$$: add $$p$$ rows and columns of (usually) zeros to each side before sliding, so that the output can stay the same size as the input.
- **Dilation** $$d$$: spread the kernel taps $$d$$ apart, so a $$3 \times 3$$ kernel with $$d = 2$$ covers a $$5 \times 5$$ footprint while still holding only 9 weights.

### Deriving the output size

Work in one dimension; the two-dimensional case is the same formula applied per axis. After padding, the signal has length $$n + 2p$$. A dilated kernel with $$k$$ taps spaced $$d$$ apart has an **effective size**

<div class="formula-box">
\[
k' \;=\; d\,(k - 1) + 1
\]
</div>

(with $$d = 1$$ this is just $$k$$). Place the window at offset $$i$$, counting from zero. It occupies positions $$i, i+1, \ldots, i + k' - 1$$, and it fits entirely inside the padded signal exactly when

<div class="formula-box">
\[
i + k' - 1 \;\le\; n + 2p - 1
\qquad\Longleftrightarrow\qquad
i \;\le\; n + 2p - k'.
\]
</div>

The legal offsets are $$i = 0, s, 2s, 3s, \ldots$$, so the number of them is the number of multiples of $$s$$ in $$[0,\, n + 2p - k']$$, which is

<div class="formula-box">
\[
n_{\text{out}} \;=\; \left\lfloor \frac{n + 2p - k'}{s} \right\rfloor + 1
\;=\; \left\lfloor \frac{n + 2p - d(k-1) - 1}{s} \right\rfloor + 1 .
\]
</div>

For the ordinary undilated case this is the formula everyone memorises:

<div class="formula-box">
\[
n_{\text{out}} \;=\; \left\lfloor \frac{n + 2p - k}{s} \right\rfloor + 1 .
\]
</div>

The $$+1$$ is the window at offset zero; the floor is the windows that would hang off the end being discarded. Both parts fall straight out of "count the legal offsets", which is why it is worth deriving once rather than memorising.

### Checking it

| n | k | p | s | d | formula | output |
|---|---|---|---|---|---------|--------|
| 224 | 3 | 1 | 1 | 1 | floor(223/1)+1 | 224 |
| 224 | 3 | 0 | 1 | 1 | floor(221/1)+1 | 222 |
| 224 | 3 | 1 | 2 | 1 | floor(223/2)+1 | 112 |
| 224 | 7 | 3 | 2 | 1 | floor(223/2)+1 | 112 |
| 224 | 3 | 2 | 1 | 2 | floor(223/1)+1 | 224 |
| 5 | 3 | 0 | 1 | 1 | floor(2/1)+1 | 3 |

The first row is the "same" convolution: $$k = 3$$, $$p = 1$$, $$s = 1$$ preserves resolution, which is why $$3 \times 3$$ with padding 1 is the default building block of almost every modern architecture. The third and fourth rows show a $$7 \times 7$$ stride-2 stem and a $$3 \times 3$$ stride-2 convolution reaching the same $$112$$ — one sees a much larger footprint per output for the same downsampling. The fifth row shows how to keep resolution while dilating: $$k' = 2(3-1)+1 = 5$$, so $$p = 2$$ restores the size. The last row is the figure below.

I checked the formula against brute-force enumeration of the legal window offsets for every combination of $$n \le 59$$, $$k \le 7$$, $$p \le 3$$, $$s \le 4$$, $$d \le 3$$ with a non-degenerate output: zero mismatches.

<div class="blog-figure">
<svg viewBox="0 0 660 300" xmlns="http://www.w3.org/2000/svg" role="img" style="width:100%;max-width:660px;font-family:sans-serif;">
  <title>A 3 by 3 kernel at two positions on a 5 by 5 input, producing two cells of a 3 by 3 output map with the same nine weights</title>
  <rect x="1" y="1" width="658" height="298" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="330" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">5 input positions, 3-tap kernel, stride 1, no padding: floor((5-3)/1) + 1 = 3 outputs</text>

  <text x="120" y="50" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">input 5 by 5</text>
  <text x="478" y="50" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">output 3 by 3</text>

  <!-- input grid, 5x5 cells of 32px from (40,60) to (200,220) -->
  <rect x="40" y="60" width="160" height="160" fill="#ffffff" stroke="#94a3b8"/>
  <line x1="72"  y1="60" x2="72"  y2="220" stroke="#cbd5e1"/>
  <line x1="104" y1="60" x2="104" y2="220" stroke="#cbd5e1"/>
  <line x1="136" y1="60" x2="136" y2="220" stroke="#cbd5e1"/>
  <line x1="168" y1="60" x2="168" y2="220" stroke="#cbd5e1"/>
  <line x1="40" y1="92"  x2="200" y2="92"  stroke="#cbd5e1"/>
  <line x1="40" y1="124" x2="200" y2="124" stroke="#cbd5e1"/>
  <line x1="40" y1="156" x2="200" y2="156" stroke="#cbd5e1"/>
  <line x1="40" y1="188" x2="200" y2="188" stroke="#cbd5e1"/>

  <!-- kernel window A: rows 0-2, cols 0-2 -->
  <rect x="40" y="60" width="96" height="96" fill="#c2410c" fill-opacity="0.14" stroke="#c2410c" stroke-width="3"/>
  <!-- kernel window B: rows 2-4, cols 2-4 -->
  <rect x="104" y="124" width="96" height="96" fill="#0d9488" fill-opacity="0.14" stroke="#0d9488" stroke-width="3"/>

  <!-- output grid, 3x3 cells of 32px from (430,92) to (526,188) -->
  <rect x="430" y="92" width="96" height="96" fill="#ffffff" stroke="#94a3b8"/>
  <line x1="462" y1="92" x2="462" y2="188" stroke="#cbd5e1"/>
  <line x1="494" y1="92" x2="494" y2="188" stroke="#cbd5e1"/>
  <line x1="430" y1="124" x2="526" y2="124" stroke="#cbd5e1"/>
  <line x1="430" y1="156" x2="526" y2="156" stroke="#cbd5e1"/>

  <rect x="430" y="92" width="32" height="32" fill="#c2410c" fill-opacity="0.55" stroke="#c2410c" stroke-width="2"/>
  <rect x="494" y="156" width="32" height="32" fill="#0d9488" fill-opacity="0.55" stroke="#0d9488" stroke-width="2"/>

  <!-- arrows: A at y=108, B at y=172 -->
  <line x1="212" y1="108" x2="404" y2="108" stroke="#c2410c" stroke-width="2"/>
  <polygon points="404,102 420,108 404,114" fill="#c2410c"/>
  <line x1="212" y1="172" x2="404" y2="172" stroke="#0d9488" stroke-width="2"/>
  <polygon points="404,166 420,172 404,178" fill="#0d9488"/>

  <text x="308" y="100" text-anchor="middle" font-size="11.5" fill="#7c2d12">the same 9 weights</text>
  <text x="308" y="164" text-anchor="middle" font-size="11.5" fill="#115e59">the same 9 weights</text>

  <text x="330" y="248" text-anchor="middle" font-size="12" fill="#334155">Local connectivity: each output cell reads a 3 by 3 window, not the whole image.</text>
  <text x="330" y="270" text-anchor="middle" font-size="12" fill="#334155">Weight sharing: the orange window and the teal window use one identical set of weights.</text>
</svg>
<figcaption>One kernel, two positions. The window at the top-left of the input produces the top-left output cell; sliding it two steps right and two down produces the cell two right and two down. Nine weights and one bias serve all nine output positions — that is \(\lfloor (5-3)/1 \rfloor + 1 = 3\) per axis.</figcaption>
</div>

## Equivariance, stated correctly

This is the part most explanations get backwards, so here it is precisely.

Let $$T_v$$ be the operator that translates a signal by $$v$$: $$(T_v x)[i] = x[i - v]$$. Write $$\mathrm{Conv}_w$$ for cross-correlation with kernel $$w$$. Then, on an infinite or circular domain,

<div class="formula-box">
\[
\mathrm{Conv}_w \bigl( T_v\, x \bigr) \;=\; T_v \bigl( \mathrm{Conv}_w\, x \bigr) .
\]
</div>

**Shift the input, and the output shifts by the same amount.** That is *equivariance*: the operation commutes with the symmetry. It is not *invariance*, which would read

<div class="formula-box">
\[
\mathrm{Conv}_w \bigl( T_v\, x \bigr) \;=\; \mathrm{Conv}_w\, x \qquad \text{(false, and undesirable).}
\]
</div>

If a convolutional layer were translation-invariant, its output would be unchanged by moving the cat to the other side of the photo — which would mean the feature map contains no information about *where* anything is, after a single layer. That would destroy the network. Equivariance is the useful property: spatial information is preserved, in a form that moves with the content.

I verified this numerically on a 20-sample signal with a 3-tap kernel: shifting the input by three positions shifts the output by exactly three, entry for entry, everywhere the window stays inside the signal.

<div class="warning-box">
  <strong>Three ways equivariance is only approximate in practice.</strong>
  <ul>
    <li><strong>Boundaries.</strong> On a finite input with zero padding, content shifted near the edge meets zeros it did not meet before. Equivariance holds exactly only in the interior.</li>
    <li><strong>Stride.</strong> A stride-\(s\) layer is equivariant only to shifts that are multiples of \(s\). I checked this: with stride 2, shifting the input by 2 shifts the output by exactly 1; shifting the input by 1 produces an output that matches neither the shifted nor the unshifted result. It samples a different sub-grid.</li>
    <li><strong>Downsampling in general.</strong> Pooling and strided convolution both sample below the Nyquist rate of the signal they receive, so they alias. This is why real CNNs are measurably less shift-stable than the theory promises.</li>
  </ul>
  Pointwise nonlinearities and per-channel normalisations do commute with translation, so they preserve whatever equivariance the convolutions provide.
</div>

### Where invariance actually comes from

If equivariance is what convolution gives, invariance has to be bought elsewhere, and there are exactly two places it is usually bought.

**Local pooling.** Max-pooling over a $$2 \times 2$$ window returns the same value for any shift that keeps the argmax inside the window. That is a small, approximate, local invariance — and it is the honest description, not "pooling makes the network translation-invariant".

**Global pooling.** Global average pooling collapses the whole $$H \times W$$ map to one number per channel:

<div class="formula-box">
\[
z_c \;=\; \frac{1}{HW} \sum_{i=1}^{H} \sum_{j=1}^{W} y_c[i,j]
\]
</div>

A sum over all positions is unchanged by any circular shift of its argument, so this is exactly invariant (and approximately so at real boundaries). This is where a classifier's translation invariance really comes from: an equivariant stack, then one global reduction at the end.

Note the corollary. If you replace global pooling with flatten-then-dense, you reintroduce a position-dependent weight for every location and throw the invariance away. That is one reason the flatten-and-dense head fell out of fashion.

## Receptive field: how far a unit can see

Define the **receptive field** $$r_\ell$$ of a unit at layer $$\ell$$ as the number of input positions (per axis) that can affect it, and the **jump** $$j_\ell$$ as the spacing, in input positions, between adjacent layer-$$\ell$$ units. Starting from $$r_0 = 1$$, $$j_0 = 1$$:

<div class="formula-box">
\[
r_\ell \;=\; r_{\ell-1} + \bigl( k'_\ell - 1 \bigr)\, j_{\ell-1},
\qquad
j_\ell \;=\; j_{\ell-1}\, s_\ell,
\qquad
k'_\ell = d_\ell (k_\ell - 1) + 1 .
\]
</div>

The reasoning: each of the $$k'_\ell$$ inputs to a layer-$$\ell$$ unit is a layer-$$(\ell-1)$$ unit, adjacent ones separated by $$j_{\ell-1}$$ input positions, so the extremes are $$(k'_\ell - 1) j_{\ell-1}$$ apart, and each carries its own $$r_{\ell-1}$$-wide field.

For a stack of $$L$$ layers of $$3 \times 3$$, stride 1, no dilation, $$j$$ stays 1 and the recursion collapses to

<div class="formula-box">
\[
r_L \;=\; 2L + 1 .
\]
</div>

Three layers see $$7$$ input pixels per axis; the figure below traces exactly that.

<div class="blog-figure">
<svg viewBox="0 0 660 300" xmlns="http://www.w3.org/2000/svg" role="img" style="width:100%;max-width:660px;font-family:sans-serif;">
  <title>Receptive field of one unit growing from 1 to 3 to 5 to 7 input positions across three stride-1 3-tap layers</title>
  <rect x="1" y="1" width="658" height="298" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="330" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Three stacked 3-tap, stride-1 layers: one unit at layer 3 sees 7 input positions</text>

  <!-- cones (drawn first, behind the cells) -->
  <polygon points="310,70 350,70 390,114 270,114" fill="#c2410c" fill-opacity="0.13"/>
  <polygon points="270,140 390,140 430,184 230,184" fill="#c2410c" fill-opacity="0.13"/>
  <polygon points="230,210 430,210 470,254 190,254" fill="#c2410c" fill-opacity="0.13"/>

  <!-- layer 3: 3 cells of 40px from x=270, y=44 -->
  <rect x="270" y="44" width="120" height="26" fill="#ffffff" stroke="#94a3b8"/>
  <line x1="310" y1="44" x2="310" y2="70" stroke="#cbd5e1"/>
  <line x1="350" y1="44" x2="350" y2="70" stroke="#cbd5e1"/>
  <rect x="310" y="44" width="40" height="26" fill="#c2410c" fill-opacity="0.6" stroke="#c2410c" stroke-width="2"/>

  <!-- layer 2: 5 cells of 40px from x=230, y=114 -->
  <rect x="230" y="114" width="200" height="26" fill="#ffffff" stroke="#94a3b8"/>
  <line x1="270" y1="114" x2="270" y2="140" stroke="#cbd5e1"/>
  <line x1="310" y1="114" x2="310" y2="140" stroke="#cbd5e1"/>
  <line x1="350" y1="114" x2="350" y2="140" stroke="#cbd5e1"/>
  <line x1="390" y1="114" x2="390" y2="140" stroke="#cbd5e1"/>
  <rect x="270" y="114" width="120" height="26" fill="#c2410c" fill-opacity="0.35" stroke="#c2410c" stroke-width="2"/>

  <!-- layer 1: 7 cells of 40px from x=190, y=184 -->
  <rect x="190" y="184" width="280" height="26" fill="#ffffff" stroke="#94a3b8"/>
  <line x1="230" y1="184" x2="230" y2="210" stroke="#cbd5e1"/>
  <line x1="270" y1="184" x2="270" y2="210" stroke="#cbd5e1"/>
  <line x1="310" y1="184" x2="310" y2="210" stroke="#cbd5e1"/>
  <line x1="350" y1="184" x2="350" y2="210" stroke="#cbd5e1"/>
  <line x1="390" y1="184" x2="390" y2="210" stroke="#cbd5e1"/>
  <line x1="430" y1="184" x2="430" y2="210" stroke="#cbd5e1"/>
  <rect x="230" y="184" width="200" height="26" fill="#c2410c" fill-opacity="0.25" stroke="#c2410c" stroke-width="2"/>

  <!-- input: 9 cells of 40px from x=150, y=254 -->
  <rect x="150" y="254" width="360" height="26" fill="#ffffff" stroke="#94a3b8"/>
  <line x1="190" y1="254" x2="190" y2="280" stroke="#cbd5e1"/>
  <line x1="230" y1="254" x2="230" y2="280" stroke="#cbd5e1"/>
  <line x1="270" y1="254" x2="270" y2="280" stroke="#cbd5e1"/>
  <line x1="310" y1="254" x2="310" y2="280" stroke="#cbd5e1"/>
  <line x1="350" y1="254" x2="350" y2="280" stroke="#cbd5e1"/>
  <line x1="390" y1="254" x2="390" y2="280" stroke="#cbd5e1"/>
  <line x1="430" y1="254" x2="430" y2="280" stroke="#cbd5e1"/>
  <line x1="470" y1="254" x2="470" y2="280" stroke="#cbd5e1"/>
  <rect x="190" y="254" width="280" height="26" fill="#c2410c" fill-opacity="0.18" stroke="#c2410c" stroke-width="2"/>

  <text x="140" y="62"  text-anchor="end" font-size="12" fill="#334155">layer 3</text>
  <text x="140" y="132" text-anchor="end" font-size="12" fill="#334155">layer 2</text>
  <text x="140" y="202" text-anchor="end" font-size="12" fill="#334155">layer 1</text>
  <text x="140" y="272" text-anchor="end" font-size="12" fill="#334155">input</text>

  <text x="530" y="62"  font-size="12" font-weight="600" fill="#7c2d12">r = 7</text>
  <text x="530" y="132" font-size="12" font-weight="600" fill="#7c2d12">r = 5</text>
  <text x="530" y="202" font-size="12" font-weight="600" fill="#7c2d12">r = 3</text>
  <text x="530" y="272" font-size="12" font-weight="600" fill="#7c2d12">r = 1</text>
</svg>
<figcaption>The shaded cone is everything that can influence the highlighted layer-3 unit: 3 units at layer 2, 5 at layer 1, 7 input positions. The number on the right of each row is the receptive field of a <em>single</em> unit in that row, so \(r\) runs 1, 3, 5, 7 — widening by \(k - 1 = 2\) per layer, linear in depth, matching \(r_L = 2L + 1\).</figcaption>
</div>

### A stack with downsampling in it

Now put a pooling layer in the middle: $$3 \times 3$$ convolution, $$3 \times 3$$ convolution, $$2 \times 2$$ max-pool with stride 2, $$3 \times 3$$ convolution. Running the recursion:

| layer | k | s | r after | j after |
|-------|---|---|---------|---------|
| conv 3, s1 | 3 | 1 | 1 + 2(1) = 3 | 1 |
| conv 3, s1 | 3 | 1 | 3 + 2(1) = 5 | 1 |
| pool 2, s2 | 2 | 2 | 5 + 1(1) = 6 | 2 |
| conv 3, s1 | 3 | 1 | 6 + 2(2) = 10 | 2 |

The final convolution adds 4 to the receptive field rather than 2, because after the stride-2 pool each of its inputs is 2 input pixels apart. That is the real reason downsampling is in the architecture: it makes every subsequent layer count double. Continue the pattern (two more $$3 \times 3$$ convolutions and a second pool) and you get $$r = 10, 14, 16$$ with $$j = 4$$.

## Pooling, and why it is going out of fashion

Max-pooling with a $$2 \times 2$$ window and stride 2 takes the largest activation in each disjoint block, halving both spatial axes: $$224 \to 112 \to 56 \to 28 \to 14 \to 7$$ across five stages. What it buys:

- **Downsampling**, which cuts the compute of every subsequent layer by four.
- **Faster receptive-field growth**, via the jump doubling shown above.
- **Small local shift tolerance**, since the max is unchanged by shifts that keep the winner in the window.
- **No parameters at all.**

What it costs, and why the field has drifted away from it: the operation is fixed, not learned, and it discards which of the four positions won. A stride-2 convolution achieves the same downsampling with a learned combination — it is strictly more general, since the right weights make it approximate an average pool — at the price of $$C_{\text{out}}(C_{\text{in}} k^2 + 1)$$ extra parameters and a real increase in compute. Modern designs commonly use stride-2 convolutions between stages and keep a single global average pooling at the head. Both approaches alias, so neither is a free source of shift-invariance.

## What CNNs do not give you

Every prior that helps on the data it fits hurts on the data it does not. Four honest limitations.

**No rotation equivariance.** Convolution commutes with translation, and with nothing else. A concrete demonstration: take the Sobel-x kernel $$[[1,0,-1],[2,0,-2],[1,0,-1]]$$ and a $$6 \times 6$$ image containing a single vertical line of ones. The valid convolution gives a response map whose rows are all $$[0, -4, 0, 4]$$ — a clear detection. Rotate the image by 90 degrees, so the line is horizontal, and the same kernel returns *all zeros*. Rotating the input did not rotate the feature map; it deleted the feature. A CNN handles rotation only by learning separate filters for separate orientations — paid for in parameters and in data — or by building the symmetry in explicitly, which is what group-equivariant convolutions do.

**No scale equivariance.** The kernel has a fixed pixel size. An object at twice the scale is a different pattern to a $$3 \times 3$$ filter. The usual answers are architectural (feature pyramids, multiple parallel kernel sizes) or data-driven (scale augmentation), never free.

**A receptive field that grows only linearly.** At fixed resolution, $$r_L = 2L + 1$$. To make one unit see across a 224-pixel image you would need $$L = 112$$ stacked $$3 \times 3$$ layers, since $$2(112) + 1 = 225 \ge 224$$. The two escape routes both cost something. Downsampling makes growth geometric but throws away resolution — a $$16 \times 16$$ receptive field that arrived via two stride-2 stages cannot recover fine detail it has already discarded. Dilation grows the field geometrically at full resolution — a stack with dilations $$1, 2, 4, 8$$ reaches $$r = 1 + 2(1 + 2 + 4 + 8) = 31$$ where four undilated layers would reach 9 — but the taps become sparse, and consecutive dilated layers sample a grid that can miss what falls between the taps.

**A locality prior that is sometimes simply wrong.** Apply one fixed random permutation to the pixels of every image in a dataset. A dense network is entirely unaffected: permuting the inputs permutes its first-layer weights and nothing else changes. A convolutional network is wrecked, because its neighbourhoods no longer contain neighbours. The prior is not a property of the architecture; it is a claim about the data, and it pays only when the claim is true. On inputs with no meaningful spatial ordering — most tabular data, arbitrary feature vectors — the claim is false and the constraint only removes capacity.

<div class="summary-box">
  <strong>The trade in one line.</strong> Local connectivity plus weight sharing removes an enormous number of parameters and gives translation equivariance in exchange for a hard assumption: that useful features are small and mean the same thing everywhere. On photographs, that is close enough to true to be one of the best deals in machine learning. On data that violates it, it is a pure loss.
</div>

## Forward: the constraint attention removes

Of the two constraints, weight sharing is the one that keeps paying — the same detector applied everywhere is a genuine statement about images. Local connectivity is the one with a hard ceiling: it is why the receptive field grows by a fixed two pixels per layer, and why relating two distant parts of an image requires depth you would rather spend elsewhere.

Self-attention lifts exactly that constraint. It keeps a form of weight sharing — the same query, key, and value projections are applied at every position — but replaces the fixed $$k \times k$$ neighbourhood with a weighting over *all* positions, computed from the content itself. The receptive field is the whole input at the first layer. What that costs, and what has to be added back to replace the locality prior it discards, is the subject of Book I.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>A convolutional layer is a dense layer with local connectivity and weight sharing imposed. Those two constraints <em>are</em> the prior; everything else is bookkeeping.</li>
  <li>Frameworks implement cross-correlation, not convolution — the kernel is not flipped. It makes no difference to a learned kernel, and it does make a difference when you hand-set one or invoke the convolution theorem.</li>
  <li>Dense from \(224 \times 224 \times 3\) to 1000 units: 150,529,000 parameters. A \(3 \times 3\), 64-filter convolution: 1,792. That is about 84,000 times fewer — but only about 1.7 times less arithmetic. Weight sharing buys sample efficiency and memory, not FLOPs.</li>
  <li>Convolution is <strong>equivariant</strong> to translation, not invariant: shift the input, the output shifts too. Local pooling buys small approximate invariance; global average pooling buys the real thing.</li>
  <li>Output size is \(\lfloor (n + 2p - k)/s \rfloor + 1\), and it is just a count of the kernel offsets that fit. With dilation, replace \(k\) by \(d(k-1)+1\).</li>
  <li>A kernel spans all input channels, so it is \(k \times k \times C_{\text{in}}\); "64 filters" means 64 of those, giving 64 output channels and \(C_{\text{out}}(C_{\text{in}}k^2 + 1)\) parameters.</li>
  <li>Receptive field: \(r_\ell = r_{\ell-1} + (k'_\ell - 1) j_{\ell-1}\), \(j_\ell = j_{\ell-1} s_\ell\). Stride-1 \(3 \times 3\) stacks give \(r_L = 2L+1\) — 112 layers to span a 224-pixel image.</li>
  <li>Not included: rotation equivariance, scale equivariance, or long-range interaction without depth. The locality prior is a claim about your data, and it is worth nothing if the claim is false.</li>
</ul>
</div>
