---
layout: single
title: "Gradient Descent and Backpropagation: How a Model Learns"
date: 2026-05-03
categories: [basics]
book: basics
subsection: foundations
tags: [gradient-descent, backpropagation, sgd, adam, optimisation]
published: true
is_overview: false
excerpt: "Training is one loop: measure the loss, ask backpropagation which way is downhill, take a small step. This chapter derives exactly how small that step has to be, why the answer is 2/a for a quadratic, and why reverse-mode differentiation gets you every gradient for roughly the price of one forward pass."
author_profile: true
read_time: true
icon: "⛰️"
read_mins: 20
permalink: /blog/basics/gradient-descent-and-backprop/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Learning is a loop with two halves. <em>Gradient descent</em> asks "which way is downhill, and how far do I dare walk?" — the answer is \( \theta \leftarrow \theta - \eta \nabla_\theta L \), and the learning rate \( \eta \) is the one number that can turn the whole thing into noise. On the quadratic \( L = \tfrac12 a\theta^2 \) the iteration is stable <em>exactly</em> when \( \eta < 2/a \); nothing about the deep-learning case makes that ceiling go away. <em>Backpropagation</em> answers the "which way" half. It is not a special neural-network algorithm — it is the chain rule evaluated right-to-left, and that ordering is why you get millions of partial derivatives for roughly the cost of one forward pass instead of millions of forward passes.
</div>

## The loop, before any mathematics

A model has parameters. Right now they are wrong. You want them less wrong.

So you need two things: a number that says *how* wrong (the loss), and a direction that says *which way to nudge every parameter to make that number smaller*. Everything in this post is those two things, done carefully.

The loop:

1. Push a batch of data forward through the model. Get predictions. Compare to targets. That is one number, $$L$$.
2. Push the error backward. Get $$\partial L / \partial \theta_i$$ for every single parameter $$\theta_i$$. That is backpropagation.
3. Step every parameter a little way against its own gradient. That is gradient descent.
4. Repeat a few hundred thousand times.

Step 3 is three lines of code and the source of most training failures. Step 2 is the algorithmic miracle that makes step 3 affordable. Let us take them in that order, because you need to understand what the step *does* before it matters how you compute it.

## Why the negative gradient?

The gradient $$\nabla_\theta L$$ is the vector of all the partial derivatives, stacked. Its geometric content is this: for a small step $$\epsilon u$$ in a *unit* direction $$u$$, the first-order change in the loss is

<div class="formula-box">
\[ L(\theta + \epsilon u) - L(\theta) \;\approx\; \epsilon \, \nabla_\theta L \cdot u . \]
</div>

You want this as negative as possible. By Cauchy–Schwarz, $$\nabla_\theta L \cdot u \ge -\lVert \nabla_\theta L \rVert$$ for any unit $$u$$, with equality precisely when

<div class="formula-box">
\[ u \;=\; -\,\frac{\nabla_\theta L}{\lVert \nabla_\theta L \rVert}. \]
</div>

So the negative gradient is not merely *a* downhill direction — among all directions of a fixed length it is the one that buys the most loss reduction per unit of movement. That is the whole justification, and it takes two lines.

<div class="insight-box">
  <strong>The fine print nobody mentions:</strong> "of a fixed length" means <em>measured in the Euclidean norm</em>. Steepest descent is norm-dependent. Change what you mean by "a step of size one" — weight some parameters more than others — and a different direction becomes steepest. That is not a technicality; it is precisely the loophole that Adam, RMSProp and natural-gradient methods exploit. They are all still doing steepest descent, just in a metric of their own choosing.
</div>

Note also the word *approximately*. The formula above is a first-order Taylor expansion, valid for small $$\epsilon$$. The gradient tells you the direction. It tells you nothing reliable about how far you can walk before the linear approximation stops being true. That is the learning rate's job, and it is where things break.

## The learning rate, derived rather than tuned

Take the simplest loss with curvature: a one-dimensional quadratic

<div class="formula-box">
\[ L(\theta) \;=\; \tfrac12 a \theta^{2}, \qquad a > 0 . \]
</div>

Three lines and you have the complete answer.

**Line one.** The gradient is $$\nabla L = a\theta$$, so the update $$\theta \leftarrow \theta - \eta \nabla L$$ becomes

<div class="formula-box">
\[ \theta_{k+1} \;=\; \theta_k - \eta a \theta_k \;=\; (1 - \eta a)\,\theta_k . \]
</div>

**Line two.** That is a plain geometric sequence, so by induction

<div class="formula-box">
\[ \theta_k \;=\; (1 - \eta a)^{k}\, \theta_0 . \]
</div>

**Line three.** A geometric sequence converges to zero if and only if the common ratio is smaller than one in magnitude, so we need $$\lvert 1 - \eta a \rvert < 1$$, that is $$-1 < 1 - \eta a < 1$$, that is $$0 < \eta a < 2$$, that is

<div class="formula-box">
\[ \boxed{\;\eta \;<\; \frac{2}{a}\;} \]
</div>

Done. And it is not an approximation or a sufficient condition — it is exact, and it is sharp. Read off the four regimes:

<div class="summary-box">
  <ul>
    <li>\( 0 < \eta < 1/a \) — the ratio \( 1-\eta a \) lies in \( (0,1) \). Monotone approach from one side. Slow but never overshoots.</li>
    <li>\( \eta = 1/a \) — the ratio is exactly \( 0 \). One step lands on the minimum. This is Newton's method: \( 1/a \) is the inverse second derivative.</li>
    <li>\( 1/a < \eta < 2/a \) — the ratio is in \( (-1,0) \). You overshoot every step and land alternately on either side, but the magnitude still shrinks. Converges, oscillating.</li>
    <li>\( \eta \ge 2/a \) — the ratio has magnitude at least \( 1 \). At exactly \( 2/a \) you orbit forever between \( \theta_0 \) and \( -\theta_0 \); above it you diverge geometrically.</li>
  </ul>
</div>

<div class="warning-box">
  <strong>What divergence looks like in practice.</strong> With \( a = 4 \) the ceiling is \( 2/a = 0.5 \). Starting from \( \theta_0 = 1 \) and running 40 steps: \( \eta = 0.20 \) gives \( \theta_{40} \approx 1.1 \times 10^{-28} \); \( \eta = 0.49 \) gives \( 0.96^{40} = 0.1954 \) — still converging, but so slowly it looks stuck; \( \eta = 0.50 \) gives exactly \( \lvert \theta_{40} \rvert = 1 \), no progress at all, forever; \( \eta = 0.51 \) gives \( 1.04^{40} = 4.80 \) and climbing. A 4% increase in the learning rate is the entire difference between "training" and "diverging". Every one of those numbers is just \( (1-\eta a)^{40} \) — check them yourself.
</div>

The multivariable version is the same statement wearing a hat. For $$L(\theta) = \tfrac12 \theta^\top H \theta$$ with $$H$$ symmetric positive definite, diagonalise: in the eigenbasis of $$H$$ the problem splits into independent one-dimensional problems, one per eigenvalue $$\lambda_i$$, each contracting by $$1 - \eta\lambda_i$$. Stability therefore requires *every* one of them to be well behaved:

<div class="formula-box">
\[ \eta \;<\; \frac{2}{\lambda_{\max}} . \]
</div>

The *sharpest* direction sets the speed limit for all the others. Hold that thought — it is the entire content of the next section.

## Batch, stochastic, and mini-batch

The loss you actually care about is an average over the dataset:

<div class="formula-box">
\[ L(\theta) \;=\; \frac{1}{N}\sum_{i=1}^{N} \ell(f_\theta(x_i), y_i) . \]
</div>

Gradients are linear, so $$\nabla_\theta L$$ is the average of the per-example gradients. Three choices of how many examples to average:

<div class="summary-box">
  <ul>
    <li><strong>Batch (full) gradient descent</strong> — use all \( N \). The gradient is exact; the loss decreases monotonically if \( \eta \) is small enough. One update costs a full pass over the data, so with a million examples you get one step per epoch. Almost nobody does this.</li>
    <li><strong>Stochastic gradient descent (SGD)</strong> — use one example. The gradient is an unbiased but extremely noisy estimate. Updates are cheap and frequent; hardware utilisation is terrible.</li>
    <li><strong>Mini-batch</strong> — use \( B \) examples, typically 32 to 4096. This is what everyone means by "SGD" in practice. It is the only one of the three that matches how GPUs work: a batch of 256 costs far less than 256 times a batch of one.</li>
  </ul>
</div>

For independent samples the standard error of the mini-batch gradient falls as $$1/\sqrt{B}$$. Quadrupling the batch size halves the noise — a poor return, which is exactly why nobody pushes batch sizes to infinity even when memory allows.

### What the noise actually does

The honest answer is: it depends, and the folklore overstates it.

What is genuinely true is that the mini-batch gradient is an *unbiased* estimator of the full gradient, so on average you are still walking downhill. The variance means you are walking downhill drunk. A few consequences follow with reasonable confidence:

- **Exact minima of the mini-batch loss are not exact minima of the full loss.** Noise stops you from settling into any single batch's idiosyncratic dip.
- **Noise lets you leave shallow basins.** A perturbation of a given size escapes a shallow minimum and does not escape a deep one, so there is a real filtering effect.
- **Noise scale is coupled to $$\eta/B$$, not to $$\eta$$ or $$B$$ alone.** This is why doubling the batch size and doubling the learning rate together often reproduces the original training curve almost exactly. It is a rule of thumb that holds well in a useful regime and breaks at large batch sizes.

<div class="warning-box">
  <strong>What SGD noise does <em>not</em> buy you.</strong> "SGD noise finds flat minima which generalise better" is a plausible story, not an established fact — every clause in it is contested, including whether flatness is even well defined (you can reparameterise a network to change the flatness of a minimum without changing the function it computes). Treat gradient noise as an unavoidable cost of cheap updates that sometimes helps, not as a regulariser you are deliberately deploying. If you want regularisation, use a regulariser.
</div>

## Conditioning: why plain gradient descent zig-zags

Here is the failure mode that motivates every optimiser after 1964.

Consider $$L(\theta) = \tfrac12(\theta_1^2 + 10\,\theta_2^2)$$. The curvatures are $$\lambda_{\min} = 1$$ and $$\lambda_{\max} = 10$$, so the **condition number** is

<div class="formula-box">
\[ \kappa \;=\; \frac{\lambda_{\max}}{\lambda_{\min}} \;=\; 10 . \]
</div>

The contours are ellipses ten times more curved across the valley than along it. The gradient at any off-axis point is dominated by the steep direction, so it points mostly *across* the valley rather than *along* it — and the single scalar $$\eta$$ has to serve both directions at once. Stability caps it at $$2/\lambda_{\max} = 0.2$$, which is far too small for the $$\lambda_{\min}=1$$ direction, where you would happily have used $$\eta = 1$$.

The classically optimal choice balances the two:

<div class="formula-box">
\[ \eta^{\star} \;=\; \frac{2}{\lambda_{\min}+\lambda_{\max}} \;=\; \frac{2}{11} \;\approx\; 0.1818 . \]
</div>

At this $$\eta$$, the two contraction factors are $$1 - \eta^\star \lambda_{\min} = +9/11$$ and $$1 - \eta^\star \lambda_{\max} = -9/11$$. Equal in magnitude, opposite in sign: the second coordinate flips sign every step while both shrink by $$9/11 \approx 0.818$$. That sign flip *is* the zig-zag, and note that it happens at the **best possible learning rate**. It is not a tuning mistake. It is what the geometry forces.

<figure class="blog-figure">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 272" role="img" aria-labelledby="condTitle condDesc" style="max-width:680px;width:100%">
  <title id="condTitle">Gradient descent on an ill-conditioned versus a well-conditioned quadratic</title>
  <desc id="condDesc">Left: elliptical contours with condition number ten; the iterates cross the valley back and forth while creeping slowly along it. Right: circular contours with condition number one; the iterates run straight to the minimum.</desc>

  <rect x="0" y="0" width="680" height="272" fill="#f8fafc"/>

  <text x="168" y="20" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="600" fill="#0f2a36">Ill-conditioned (kappa = 10)</text>
  <text x="512" y="20" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="600" fill="#0f2a36">Well-conditioned (kappa = 1)</text>

  <!-- ============ LEFT PANEL: L = 0.5(x^2 + 10 y^2), eta = 2/11 ============ -->
  <g transform="translate(4,34)">
    <rect x="0.5" y="0.5" width="319" height="219" rx="9" fill="#ffffff" stroke="#dbe7f5"/>
    <!-- axes through the minimum at local (160,110) -->
    <line x1="24" y1="110" x2="296" y2="110" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="160" y1="14" x2="160" y2="206" stroke="#e2e8f0" stroke-width="1"/>
    <!-- contours: ellipses with semi-axis ratio sqrt(10); 11 px per unit -->
    <ellipse cx="160" cy="110" rx="121.00" ry="38.26" fill="none" stroke="#cbd5e1" stroke-width="1.1"/>
    <ellipse cx="160" cy="110" rx="89.74"  ry="28.38" fill="none" stroke="#cbd5e1" stroke-width="1.1"/>
    <ellipse cx="160" cy="110" rx="66.27"  ry="20.96" fill="none" stroke="#cbd5e1" stroke-width="1.1"/>
    <ellipse cx="160" cy="110" rx="45.27"  ry="14.32" fill="none" stroke="#cbd5e1" stroke-width="1.1"/>
    <!-- iterates (9,2) -> ... , each coordinate scaled by 9/11 with a sign flip on the second -->
    <polyline points="259.0,88.0 241.0,128.0 226.3,95.3 214.2,122.0 204.4,100.1 196.3,118.1 189.7,103.4 184.3,115.4"
              fill="none" stroke="#dc2626" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="259.0" cy="88.0"  r="3.6" fill="#dc2626"/>
    <circle cx="241.0" cy="128.0" r="2.6" fill="#dc2626"/>
    <circle cx="226.3" cy="95.3"  r="2.6" fill="#dc2626"/>
    <circle cx="214.2" cy="122.0" r="2.6" fill="#dc2626"/>
    <circle cx="204.4" cy="100.1" r="2.6" fill="#dc2626"/>
    <circle cx="196.3" cy="118.1" r="2.6" fill="#dc2626"/>
    <circle cx="189.7" cy="103.4" r="2.6" fill="#dc2626"/>
    <circle cx="184.3" cy="115.4" r="2.6" fill="#dc2626"/>
    <circle cx="160" cy="110" r="3.4" fill="#0f2a36"/>
    <text x="259" y="78" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#dc2626">start</text>
    <text x="160" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0f2a36">min</text>
    <text x="160" y="200" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">7 steps, still far out</text>
  </g>

  <!-- ============ RIGHT PANEL: L = 0.5(x^2 + y^2), eta = 0.5 ============ -->
  <g transform="translate(348,34)">
    <rect x="0.5" y="0.5" width="319" height="219" rx="9" fill="#ffffff" stroke="#dbe7f5"/>
    <line x1="24" y1="110" x2="296" y2="110" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="160" y1="14" x2="160" y2="206" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="160" cy="110" r="101.41" fill="none" stroke="#cbd5e1" stroke-width="1.1"/>
    <circle cx="160" cy="110" r="55.78"  fill="none" stroke="#cbd5e1" stroke-width="1.1"/>
    <circle cx="160" cy="110" r="30.42"  fill="none" stroke="#cbd5e1" stroke-width="1.1"/>
    <circle cx="160" cy="110" r="14.20"  fill="none" stroke="#cbd5e1" stroke-width="1.1"/>
    <polyline points="259.0,88.0 209.5,99.0 184.8,104.5 172.4,107.2 166.2,108.6 163.1,109.3 161.5,109.7"
              fill="none" stroke="#0d9488" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="259.0" cy="88.0"  r="3.6" fill="#0d9488"/>
    <circle cx="209.5" cy="99.0"  r="2.6" fill="#0d9488"/>
    <circle cx="184.8" cy="104.5" r="2.6" fill="#0d9488"/>
    <circle cx="172.4" cy="107.2" r="2.6" fill="#0d9488"/>
    <circle cx="166.2" cy="108.6" r="2.6" fill="#0d9488"/>
    <circle cx="163.1" cy="109.3" r="2.6" fill="#0d9488"/>
    <circle cx="160" cy="110" r="3.4" fill="#0f2a36"/>
    <text x="259" y="78" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0d9488">start</text>
    <text x="160" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#0f2a36">min</text>
    <text x="160" y="200" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">6 steps, essentially arrived</text>
  </g>
</svg>
<figcaption>Both panels use the same starting point \( (9,\,2) \), the same pixels-per-unit scale, and true contours of their respective losses. Left: \( L = \tfrac12(\theta_1^2 + 10\theta_2^2) \) at the optimal \( \eta^\star = 2/11 \). Every step multiplies \( \theta_1 \) by \( 9/11 \) and \( \theta_2 \) by \( -9/11 \), so the path crosses the valley on every single iteration while creeping along it — after seven steps \( \theta_1 \) has only fallen from \( 9 \) to \( 2.21 \). Right: \( L = \tfrac12(\theta_1^2 + \theta_2^2) \) at \( \eta = 0.5 \). The negative gradient points straight at the minimum from everywhere, and six halvings land you at \( (0.14,\,0.03) \).</figcaption>
</figure>

The general result: with the optimal $$\eta$$, plain gradient descent on a quadratic contracts the error by a factor of

<div class="formula-box">
\[ \frac{\kappa - 1}{\kappa + 1} \quad\text{per step.} \]
</div>

For $$\kappa = 10$$ that is $$9/11 = 0.818$$, so reducing the error by a factor of $$10^{6}$$ needs about $$\ln(10^{-6})/\ln(0.818) \approx 69$$ iterations — and running the iteration confirms 69. For $$\kappa = 1000$$, $$(\kappa-1)/(\kappa+1) = 0.998$$ and you need about 6900. Iteration count scales roughly *linearly in* $$\kappa$$, which is the reason real training problems — where $$\kappa$$ can be enormous — are slow.

## Momentum

Momentum treats the parameter vector as a ball with mass rather than a point that teleports. Maintain a running velocity and step along it:

<div class="formula-box">
\[ v_{t} = \mu\, v_{t-1} + \nabla_\theta L(\theta_{t-1}), \qquad \theta_{t} = \theta_{t-1} - \eta\, v_{t}, \]
</div>

with $$\mu$$ typically $$0.9$$. The mechanism is exactly the one the zig-zag figure suggests: the across-valley component of the gradient reverses sign every step and therefore *cancels* in the running sum, while the along-valley component keeps the same sign and *accumulates*. For a constant gradient $$g$$ the velocity converges to $$g/(1-\mu)$$, so $$\mu = 0.9$$ means a persistent direction eventually moves you ten times faster than it would without momentum.

The payoff on a quadratic is a genuine improvement in the exponent. With the optimal heavy-ball settings

<div class="formula-box">
\[ \mu^{\star} = \left(\frac{\sqrt{\kappa}-1}{\sqrt{\kappa}+1}\right)^{2}, \qquad \eta^{\star} = \frac{4}{\left(\sqrt{\lambda_{\min}}+\sqrt{\lambda_{\max}}\right)^{2}}, \]
</div>

the contraction factor becomes $$(\sqrt{\kappa}-1)/(\sqrt{\kappa}+1)$$ rather than $$(\kappa-1)/(\kappa+1)$$ — dependence on $$\sqrt{\kappa}$$ instead of $$\kappa$$. On our $$\kappa = 10$$ problem that is $$0.519$$ against $$0.818$$, and running both to a $$10^{-6}$$ relative error gives **26 iterations with momentum against 69 without**. For $$\kappa = 1000$$ the same formulas predict roughly 6900 against roughly 220.

<div class="insight-box">
  <strong>Momentum buys you a better exponent, not a different problem.</strong> \( \sqrt{\kappa} \) is still unbounded. And the ball-with-mass intuition has a real cost: with a large \( \mu \) the iterate can overshoot the minimum and take several steps to come back, so momentum makes the loss curve less monotone, not more. If your loss is bouncing, momentum is a suspect before the learning rate is.
</div>

## Adam

Adam keeps two exponential moving averages per parameter — a first moment (the mean gradient) and a second moment (the mean squared gradient) — and uses the second to rescale the first.

<div class="formula-box">
\[
\begin{aligned}
m_t &= \beta_1 m_{t-1} + (1-\beta_1)\, g_t, &\quad& \text{first moment}\\
v_t &= \beta_2 v_{t-1} + (1-\beta_2)\, g_t^{2}, &\quad& \text{second moment (elementwise square)}\\
\hat m_t &= \frac{m_t}{1-\beta_1^{\,t}}, \qquad \hat v_t = \frac{v_t}{1-\beta_2^{\,t}}, &\quad& \text{bias correction}\\
\theta_t &= \theta_{t-1} - \eta\,\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon}. &\quad& \text{update}
\end{aligned}
\]
</div>

Defaults are $$\beta_1 = 0.9$$, $$\beta_2 = 0.999$$, $$\epsilon = 10^{-8}$$.

**What the second moment does.** The update is a signal-to-noise ratio: a parameter whose gradient is consistently $$0.001$$ gets $$\hat m / \sqrt{\hat v} \approx 1$$, and so does a parameter whose gradient is consistently $$1000$$. The step size becomes roughly $$\eta$$ for *every* parameter, regardless of gradient scale. That is a per-parameter learning rate obtained for free, and it is why Adam tolerates a network whose layers have wildly different gradient magnitudes. It also, as promised earlier, means Adam is doing steepest descent in a diagonal metric of its own devising rather than the Euclidean one.

**Why bias correction is not cosmetic.** Both averages start at zero, which biases them towards zero early on. Unrolling with a constant gradient $$g$$:

<div class="formula-box">
\[ m_t = (1-\beta_1)\sum_{i=1}^{t}\beta_1^{\,t-i} g \;=\; g\left(1 - \beta_1^{\,t}\right), \]
</div>

which is exactly the factor $$\hat m_t$$ divides out. Concretely at $$t=1$$: $$m_1 = 0.1\,g$$ — a tenth of the true gradient — and $$v_1 = 0.001\,g^2$$. Without correction the first update direction would be $$0.1g / \sqrt{0.001 g^2} = \sqrt{10} \approx 3.16$$ times its intended size, in the *wrong* direction of error (the first moment is under-estimated by ten, but the square root of the second moment is under-estimated by 31.6, and the smaller denominator wins). Bias correction makes the ratio exactly $$1$$ from the first step. This is the reason Adam without correction needs a warm-up and Adam with it usually does not.

<div class="warning-box">
  <strong>Adam is not universally better.</strong> It is close to mandatory for transformer language models, where gradient scales differ enormously across layers and well-tuned plain SGD is genuinely hard to make work. It is far less clear-cut on convolutional vision models, where SGD with momentum and a good schedule remains fully competitive and sometimes preferable. Adam also costs two extra full-size state tensors — three times the optimiser memory of plain SGD, which is a real constraint at scale — and its default \( \epsilon \) and \( \beta_2 \) are load-bearing rather than arbitrary. "Use Adam" is a sensible starting default. It is not a theorem, and there is no published result that establishes Adam as superior in general.
</div>

## Backpropagation is the chain rule, ordered correctly

Now the other half. Gradient descent needs $$\nabla_\theta L$$. A modern model has $$10^{8}$$ to $$10^{12}$$ parameters. How do you get $$10^{12}$$ partial derivatives without doing $$10^{12}$$ units of work?

The naive method is finite differences: perturb each parameter, re-run the model, see how the loss moves. That costs one forward pass **per parameter**. For a billion parameters, one gradient would take a billion forward passes. Training would be over before the heat death of the universe.

Backpropagation costs about **two** forward passes, total, regardless of the parameter count. Here is why.

### Forward mode versus reverse mode

Write your model as a composition of $$k$$ elementary steps,

<div class="formula-box">
\[ f = f_k \circ f_{k-1} \circ \cdots \circ f_1 : \mathbb{R}^{n} \to \mathbb{R}^{m}, \]
</div>

so by the chain rule the Jacobian is a product of the per-step Jacobians:

<div class="formula-box">
\[ J \;=\; J_k\, J_{k-1}\, \cdots\, J_2\, J_1 . \]
</div>

Matrix multiplication is associative, so you may bracket that product however you like and the answer is identical. **The cost is not identical.** That single observation is all of automatic differentiation.

<div class="summary-box">
  <ul>
    <li><strong>Forward mode</strong> brackets right-to-left and applies the product to a vector on the right: \( J v = J_k(J_{k-1}(\cdots(J_1 v))) \). Every operation is a matrix-times-vector, never matrix-times-matrix. One sweep, running <em>alongside</em> the forward computation, produces one <em>column</em> of \( J \) (take \( v = e_i \)) — that is, the sensitivity of <em>all outputs</em> to <em>one input</em>. Cost per sweep: about one forward pass. Cost of the full Jacobian: \( n \) sweeps.</li>
    <li><strong>Reverse mode</strong> brackets left-to-right and applies the product to a row vector on the left: \( u^{\top} J = ((u^{\top} J_k) J_{k-1}) \cdots J_1 \). Again only matrix-times-vector. One sweep produces one <em>row</em> of \( J \) — the sensitivity of <em>one output</em> to <em>all inputs</em>. Cost per sweep: about one forward pass. Cost of the full Jacobian: \( m \) sweeps.</li>
  </ul>
</div>

Now put in the numbers for training. The inputs are the parameters, so $$n$$ is in the billions. The output is the scalar loss, so $$m = 1$$.

Reverse mode needs **one** sweep. Forward mode needs $$n$$. That factor of $$n$$ is the entire reason deep learning is computationally possible, and it comes from nothing more than choosing which end of an associative product to start at.

Backpropagation is reverse-mode automatic differentiation, specialised to a neural network. Setting $$u = 1$$ (the loss is scalar), the row vector propagating backwards is exactly the familiar $$\delta$$ of the textbook derivation.

<div class="insight-box">
  <strong>What reverse mode costs you.</strong> Nothing is free. To multiply by \( J_t \) on the way back you need the intermediate values from the forward pass, so reverse mode must <em>store every activation</em> until the backward sweep reaches it. Memory grows with depth times batch size, whereas forward mode needs essentially none. That is the trade being unwound when you enable gradient (activation) checkpointing: throw activations away, recompute them during the backward pass, spend roughly 30% more time to cut activation memory dramatically.
  <br><br>
  And forward mode is not obsolete. When \( n \) is small and \( m \) is large — sensitivity to a handful of hyperparameters, or the Jacobian of a network's outputs with respect to a low-dimensional input — forward mode wins by the same argument, reversed. Hessian-vector products \( Hv \) are computed as forward-over-reverse: one forward-mode sweep through the reverse-mode gradient, for the price of a few forward passes and no \( n \times n \) matrix anywhere.
</div>

## Backprop by hand on a network small enough to check

Two layers, scalar input, scalar output, one nonlinearity. Forward:

<div class="formula-box">
\[
\begin{aligned}
z_1 &= w_1 x + b_1 \\
h   &= \tanh(z_1) \\
z_2 &= w_2 h + b_2 \\
L   &= \tfrac12 (z_2 - y)^{2}
\end{aligned}
\]
</div>

Concrete values: $$x = 1.5$$, target $$y = 0.5$$, and parameters $$w_1 = 0.8$$, $$b_1 = -0.2$$, $$w_2 = 1.4$$, $$b_2 = 0.3$$. The forward pass gives

<div class="formula-box">
\[
\begin{aligned}
z_1 &= 0.8 \cdot 1.5 - 0.2 = 1.0 \\
h   &= \tanh(1.0) = 0.7615941560 \\
z_2 &= 1.4 \cdot 0.7615941560 + 0.3 = 1.3662318183 \\
L   &= \tfrac12 (1.3662318183 - 0.5)^{2} = 0.3751787816
\end{aligned}
\]
</div>

Now backwards, one link of the chain at a time. Each line uses only the line above it and one local derivative — that is the whole algorithm.

**Start at the loss.**

<div class="formula-box">
\[ \delta_2 \;\equiv\; \frac{\partial L}{\partial z_2} \;=\; z_2 - y \;=\; 0.8662318183 \]
</div>

**Layer 2 parameters.** Since $$z_2 = w_2 h + b_2$$, the local derivatives are $$\partial z_2/\partial w_2 = h$$ and $$\partial z_2/\partial b_2 = 1$$:

<div class="formula-box">
\[
\frac{\partial L}{\partial w_2} = \delta_2\, h = 0.8662318183 \cdot 0.7615941560 = 0.6597170905,
\qquad
\frac{\partial L}{\partial b_2} = \delta_2 = 0.8662318183
\]
</div>

**Through layer 2 into the hidden unit.** Here $$\partial z_2/\partial h = w_2$$:

<div class="formula-box">
\[ \frac{\partial L}{\partial h} \;=\; \delta_2\, w_2 \;=\; 0.8662318183 \cdot 1.4 \;=\; 1.2127245457 \]
</div>

**Through the nonlinearity.** This is the step that matters for everything later. Since $$\tanh'(z) = 1 - \tanh^{2}(z) = 1 - h^{2}$$:

<div class="formula-box">
\[ \delta_1 \;\equiv\; \frac{\partial L}{\partial z_1} \;=\; \frac{\partial L}{\partial h}\,(1-h^{2}) \;=\; 1.2127245457 \cdot 0.4199743416 \;=\; 0.5093131926 \]
</div>

**Layer 1 parameters.** With $$\partial z_1/\partial w_1 = x$$ and $$\partial z_1/\partial b_1 = 1$$:

<div class="formula-box">
\[
\frac{\partial L}{\partial w_1} = \delta_1\, x = 0.5093131926 \cdot 1.5 = 0.7639697889,
\qquad
\frac{\partial L}{\partial b_1} = \delta_1 = 0.5093131926
\]
</div>

Notice the shape of the computation. Everything flowed through two scalars, $$\delta_2$$ and $$\delta_1$$. Each parameter's gradient is then just "the delta arriving at my layer, times my local input". In a real network the deltas are vectors and the local products become outer products, but the structure is identical, and the total work is one multiply-add per weight — the same order as the forward pass.

### The numerical check

None of the above is worth anything if it is wrong, so verify it against the definition of a derivative. Central differences, $$\left(L(\theta+\epsilon) - L(\theta-\epsilon)\right)/(2\epsilon)$$ with $$\epsilon = 10^{-6}$$:

```python
import numpy as np

x, y = 1.5, 0.5
p0 = np.array([0.8, -0.2, 1.4, 0.3])          # w1, b1, w2, b2

def loss(p):
    w1, b1, w2, b2 = p
    h = np.tanh(w1 * x + b1)
    return 0.5 * (w2 * h + b2 - y) ** 2

# backprop, exactly as derived above
w1, b1, w2, b2 = p0
z1 = w1 * x + b1
h  = np.tanh(z1)
d2 = (w2 * h + b2) - y
d1 = d2 * w2 * (1 - h * h)
analytic = np.array([d1 * x, d1, d2 * h, d2])

eps = 1e-6
fd = np.array([(loss(p0 + eps * e) - loss(p0 - eps * e)) / (2 * eps)
               for e in np.eye(4)])

print(analytic)
print(fd)
print("max abs diff:", np.max(np.abs(analytic - fd)))
```

Running it:

| parameter | backprop | central difference | absolute difference |
|---|---|---|---|
| $$\partial L/\partial w_1$$ | 0.7639697889424688 | 0.7639697889305630 | $$1.19\times10^{-11}$$ |
| $$\partial L/\partial b_1$$ | 0.5093131926283125 | 0.5093131926758865 | $$4.76\times10^{-11}$$ |
| $$\partial L/\partial w_2$$ | 0.6597170905492106 | 0.6597170904565353 | $$9.27\times10^{-11}$$ |
| $$\partial L/\partial b_2$$ | 0.8662318183380708 | 0.8662318182750539 | $$6.30\times10^{-11}$$ |

Largest absolute discrepancy $$9.27 \times 10^{-11}$$; largest relative discrepancy $$1.41 \times 10^{-10}$$.

That agreement is not merely "good" — it is as good as double precision permits. Central differences carry two error terms: a truncation error of order $$\epsilon^{2} L'''$$ (about $$10^{-12}$$ here) and a round-off error of order $$\varepsilon_{\text{machine}}/\epsilon \approx 10^{-16}/10^{-6} = 10^{-10}$$. The observed $$10^{-10}$$ is the round-off floor. The backprop derivation is exact; the finite difference is the approximate one.

<div class="insight-box">
  <strong>Do this yourself when you write a custom layer.</strong> A gradient check that agrees to \( 10^{-10} \) means your backward pass is right. Agreement to \( 10^{-2} \) means it is wrong and you have been misled by a loss that still went down. Relative error is the thing to look at, and note that \( \epsilon \) has a sweet spot — shrinking it below about \( 10^{-7} \) makes the check <em>worse</em>, because round-off grows as \( \epsilon \) shrinks.
</div>

## Vanishing and exploding gradients

Now stack the worked example many times and watch what the chain rule does.

For a deep network with hidden states $$h_0, h_1, \ldots, h_T$$, the chain rule gives the gradient at the input end as a product of every intermediate Jacobian:

<div class="formula-box">
\[ \frac{\partial L}{\partial h_0} \;=\; \frac{\partial L}{\partial h_T}\;\prod_{t=T}^{1} J_t, \qquad J_t \;=\; \frac{\partial h_t}{\partial h_{t-1}} . \]
</div>

Submultiplicativity of the operator norm gives

<div class="formula-box">
\[ \left\lVert \prod_{t=T}^{1} J_t \right\rVert \;\le\; \prod_{t=T}^{1} \lVert J_t \rVert \;\le\; \sigma^{T} \quad\text{if } \lVert J_t \rVert \le \sigma \ \text{ for all } t . \]
</div>

The behaviour is exponential in depth, and the base is roughly the typical Jacobian norm:

<div class="summary-box">
  <ul>
    <li>\( \sigma = 0.9 \), \( T = 100 \): the factor is \( 0.9^{100} = 2.66 \times 10^{-5} \). Early layers receive a gradient tens of thousands of times smaller than late ones and effectively stop learning. <strong>Vanishing.</strong></li>
    <li>\( \sigma = 1.1 \), \( T = 100 \): the factor is \( 1.1^{100} = 1.38 \times 10^{4} \). Updates overshoot wildly and the loss returns NaN. <strong>Exploding.</strong></li>
    <li>\( \sigma = 1 \): the only stable regime, and it is a knife edge you have to engineer onto.</li>
  </ul>
</div>

Saturating nonlinearities make this the default rather than the exception. We computed $$\tanh'(z_1) = 1 - h^{2} = 0.4199743416$$ in the worked example above, at the perfectly reasonable pre-activation $$z_1 = 1$$. And $$\tanh'$$ never exceeds $$1$$ anywhere, attaining it only at $$z = 0$$. Twenty such layers, ignoring the weights entirely, contribute $$0.42^{20} \approx 2.9 \times 10^{-8}$$. The gradient does not so much vanish as evaporate.

This single product is the reason for three things you will meet later:

<div class="summary-box">
  <ul>
    <li><strong>Careful initialisation.</strong> He and Xavier initialisation choose the weight variance precisely so that \( \lVert J_t \rVert \) starts near \( 1 \), buying \( \sigma \approx 1 \) at step zero. This is a strong start, not a guarantee — the weights move during training.</li>
    <li><strong>Residual connections.</strong> With \( h_t = h_{t-1} + F(h_{t-1}) \) the Jacobian is \( J_t = I + \partial F/\partial h \). The product then expands around the identity instead of around a small number, so a gradient path of length zero exists from the loss to every layer. This is the structural fix, and it is why networks went from tens of layers to hundreds.</li>
    <li><strong>Normalisation layers</strong> (batch, layer, RMS), which re-standardise activations and so keep the local Jacobians from drifting away from unit scale as training proceeds.</li>
    <li><strong>Gradient clipping</strong>, which is a blunt patch for the exploding half only: rescale the gradient if its norm exceeds a threshold. It prevents a single catastrophic step. It does nothing whatsoever for vanishing.</li>
  </ul>
</div>

## What this means when you are actually training

<div class="summary-box">
  <ul>
    <li><strong>If the loss goes to NaN, the learning rate is the first suspect</strong>, before the data and before the architecture. The \( \eta < 2/a \) analysis says divergence is geometric — once you are past the ceiling, a handful of steps is enough to reach infinity. Halve \( \eta \) and try again.</li>
    <li><strong>If the loss is flat, the learning rate is also the first suspect.</strong> \( \eta = 0.49 \) against a ceiling of \( 0.5 \) converges at \( 0.96 \) per step; that is genuinely converging and it looks exactly like a bug. Sweep \( \eta \) logarithmically, not linearly — the useful range spans orders of magnitude.</li>
    <li><strong>Warm-up exists because the curvature changes.</strong> The stable \( \eta \) depends on \( \lambda_{\max} \), and \( \lambda_{\max} \) is not constant during training. A short linear warm-up is cheap insurance against a large early step at a badly conditioned starting point.</li>
    <li><strong>Gradient-check any layer you write by hand.</strong> Ten lines of finite differences, agreement to \( 10^{-10} \), and you never wonder again.</li>
    <li><strong>A loss that decreases is not proof the gradient is correct.</strong> A gradient with the right sign and the wrong magnitude still decreases the loss, just slower and to a worse place. This is the single most common silent bug in custom training code.</li>
  </ul>
</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>The update is \( \theta \leftarrow \theta - \eta \nabla_\theta L \). The negative gradient is the steepest-descent direction by Cauchy–Schwarz — but only with respect to the Euclidean norm, which is the loophole every adaptive optimiser exploits.</li>
  <li>On \( L = \tfrac12 a\theta^2 \) the iteration is \( \theta_k = (1-\eta a)^k\theta_0 \), so it converges if and only if \( \lvert 1-\eta a \rvert < 1 \), that is \( \eta < 2/a \). In many dimensions the ceiling is \( 2/\lambda_{\max} \): the sharpest direction sets the speed limit for every other direction.</li>
  <li>Mini-batching is a compute decision first. Gradient noise falls as \( 1/\sqrt{B} \) and scales with \( \eta/B \); it sometimes helps generalisation, but "SGD noise is a regulariser" is folklore, not a result.</li>
  <li>Ill conditioning is the core difficulty. With the optimal \( \eta \), plain gradient descent contracts by \( (\kappa-1)/(\kappa+1) \) per step and zig-zags across the valley even when perfectly tuned. Momentum improves that to \( (\sqrt{\kappa}-1)/(\sqrt{\kappa}+1) \) — on \( \kappa=10 \), 26 iterations against 69 for the same accuracy.</li>
  <li>Adam rescales the first moment by the square root of the second, giving every parameter a step of roughly \( \eta \) regardless of gradient scale; bias correction matters because without it the very first step is \( \sqrt{10} \approx 3.16 \) times too large. Adam is a good default, not a universally superior method, and it triples optimiser memory.</li>
  <li>Backpropagation is reverse-mode automatic differentiation: the same associative Jacobian product as forward mode, bracketed from the other end. Forward mode costs one sweep per <em>input</em>; reverse mode costs one sweep per <em>output</em>. A scalar loss has one output and billions of inputs, so reverse mode wins by a factor of the parameter count — at the price of storing every activation.</li>
  <li>The hand derivation on a two-layer scalar network matched central differences to \( 9.3\times10^{-11} \) absolute, \( 1.4\times10^{-10} \) relative — the double-precision round-off floor for \( \epsilon = 10^{-6} \), which is to say: exact.</li>
  <li>Gradients through depth are a product of Jacobians, so they behave like \( \sigma^T \): \( 0.9^{100} = 2.7\times10^{-5} \) vanishes, \( 1.1^{100} = 1.4\times10^{4} \) explodes. Careful initialisation, normalisation and — decisively — residual connections exist to hold \( \sigma \) near one.</li>
</ul>
</div>
