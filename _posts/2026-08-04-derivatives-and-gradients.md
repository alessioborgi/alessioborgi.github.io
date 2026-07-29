---
layout: single
title: "The Derivative Is a Linear Approximation, and the Gradient Is a Covector"
date: 2026-08-04
categories: [math-basics]
book: math-basics
subsection: calculus
tags: [gradients, chain-rule, backpropagation, autodiff]
excerpt: "Treating the derivative as a slope stops working the moment there is more than one input. Treating it as the best linear approximation keeps working forever — and makes backpropagation an obvious consequence of the chain rule rather than an algorithm to memorise."
author_profile: true
read_time: true
is_overview: false
icon: "📉"
read_mins: 6
permalink: /blog/math-basics/derivatives-and-gradients/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The derivative at a point is the linear map that best approximates the function near that point. For a scalar-valued function that map is a <em>row</em> object — a covector — and the gradient is the column vector representing it through the Euclidean inner product. The gradient points along steepest ascent only because we chose that inner product. The chain rule composes these linear maps, and backpropagation is nothing more than evaluating the resulting product of Jacobians from the left, which is cheap exactly when there is one scalar output.
</div>

## The definition that survives more than one variable

In one dimension the derivative is a slope. In $$n$$ dimensions there is no single slope, so use the characterisation that generalises: $$f$$ is differentiable at $$x$$ if there is a linear map $$Df(x)$$ with

<div class="formula-box">
\[
f(x + h) = f(x) + Df(x)[h] + o(\lVert h\rVert)\quad\text{as } h \to 0 .
\]
</div>

$$Df(x)$$ is *the* best linear approximation — the error it leaves behind vanishes faster than $$\lVert h\rVert$$ itself. Everything else in differential calculus is bookkeeping about how to represent and compose this map.

For $$f:\mathbb{R}^n\to\mathbb{R}$$, $$Df(x)$$ eats a vector and returns a scalar, so it is a linear functional: a $$1\times n$$ row. Write it in coordinates and it is the row of partial derivatives.

## Why the gradient is a covector

The gradient is *defined* by demanding that the functional be expressed as an inner product:

<div class="formula-box">
\[
Df(x)[h] = \langle \nabla f(x),\, h\rangle \quad\text{for all } h .
\]
</div>

In standard coordinates with the Euclidean inner product this makes $$\nabla f$$ the column vector of partials, which is why the distinction usually goes unnoticed. It matters as soon as coordinates change. Substituting $$x = Py$$ and setting $$g(y) = f(Py)$$, the chain rule gives

<div class="formula-box">
\[
\nabla_y g(y) = P^\top \nabla_x f(Py),
\]
</div>

while an ordinary tangent vector transforms as $$v_x = P v_y$$. Gradients transform by $$P^\top$$, vectors by $$P$$. The two rules agree only when $$P$$ is orthogonal. So the gradient is not really a vector in the same sense as a displacement — it is a covector wearing a vector's clothes, and the disguise only holds up in orthonormal coordinates.

The practical consequence is concrete: **gradient descent is not invariant to reparameterisation**. Rescale one weight by 1000 and the descent trajectory changes, even though the function being optimised is the same. That is the entire motivation for natural gradient methods, which replace the Euclidean inner product with one adapted to the model.

## Directional derivatives and steepest ascent

The rate of change along a direction $$v$$ is

<div class="formula-box">
\[
D_v f(x) = Df(x)[v] = \langle \nabla f(x), v\rangle .
\]
</div>

Maximise this over unit $$v$$. Cauchy–Schwarz gives $$\langle \nabla f, v\rangle \le \lVert \nabla f\rVert_2 \lVert v\rVert_2$$ with equality only when $$v \parallel \nabla f$$, so the steepest ascent direction is $$\nabla f / \lVert\nabla f\rVert_2$$ and the maximal rate is $$\lVert\nabla f\rVert_2$$.

Note where the $$\lVert\cdot\rVert_2$$ entered: in the constraint. Constrain $$\lVert v\rVert_\infty \le 1$$ instead and the maximiser becomes $$v = \operatorname{sign}(\nabla f)$$, a sign vector rather than a scaled gradient. "The gradient is the direction of steepest ascent" is true relative to the Euclidean norm and false in general — and the $$L^\infty$$ version is not an academic curiosity, it is close to what sign-based and adaptive optimisers actually take as their step direction.

## The chain rule is composition of linear maps

If $$h = f \circ g$$, then near a point the best linear approximation of the composition is the composition of the best linear approximations:

<div class="formula-box">
\[
Dh(x) = Df\big(g(x)\big)\,\cdot\,Dg(x).
\]
</div>

In coordinates that is a product of [Jacobian matrices](/blog/math-basics/jacobian-and-hessian/). A network with $$L$$ layers, $$f = f_L \circ \dots \circ f_1$$, therefore has

<div class="formula-box">
\[
Df(x) = J_L J_{L-1} \cdots J_1 .
\]
</div>

## Why reverse mode is the cheap one

Matrix multiplication is associative, so that product can be bracketed either way, and the two choices have wildly different costs.

- **Forward mode** evaluates right to left: $$J_L(\cdots(J_2(J_1 e)))$$, propagating one input perturbation $$e$$ forward. One pass gives one *column* of the full Jacobian — the sensitivity of all outputs to one input. Getting everything needs $$n$$ passes.
- **Reverse mode** evaluates left to right: $$((\bar{y}^\top J_L)J_{L-1})\cdots J_1$$, propagating one output covector backwards. One pass gives one *row* — the sensitivity of one output to all inputs. Getting everything needs $$m$$ passes.

Training a network is the case $$m = 1$$: a single scalar loss, and $$n$$ in the billions. Reverse mode therefore needs exactly one backward pass to obtain the entire gradient, at a cost that is a small constant multiple of the forward pass — the "cheap gradient" result, with the constant typically under 5. Forward mode would need one pass per parameter. That asymmetry, not any property of neural networks specifically, is why backpropagation is the algorithm.

Nothing is free: reverse mode must keep intermediate activations alive until the backward pass reaches them, which is where training memory goes, and why activation checkpointing trades recomputation for memory.

<div class="insight-box">
  <strong>Key Insight — backpropagation is bracketing, not an algorithm:</strong> forward and reverse mode compute exactly the same Jacobian product and differ only in association order. Reverse mode wins for \(n \gg m\) and loses for \(m \gg n\) — which is why Jacobian-vector products in forward mode are the right tool for, say, propagating uncertainty through a model with few inputs, and why a Hessian-vector product is computed as reverse mode applied to a forward-mode directional derivative.
</div>

<div class="warning-box">
  <strong>Interview trap — row versus column.</strong> \(Df(x)\) for scalar \(f\) is a \(1\times n\) row; \(\nabla f(x)\) is the \(n\times 1\) column, and \(\nabla f = (Df)^\top\). Mixing them silently produces answers that are right up to a transpose, which is the single most common error in [matrix calculus](/blog/math-basics/matrix-calculus/). A second trap: a vanishing gradient means <em>stationary</em>, not <em>minimal</em> — you need <a href="/blog/math-basics/jacobian-and-hessian/">curvature</a> to distinguish a minimum from a saddle.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>The derivative is the best linear approximation: \(f(x+h) = f(x) + Df(x)[h] + o(\lVert h\rVert)\).</li>
    <li>\(Df(x)\) is a row functional; the gradient is its representation under a chosen inner product, and transforms by \(P^\top\) rather than \(P\) under a change of variables.</li>
    <li>Steepest ascent along \(\nabla f\) is a statement about the Euclidean norm; under \(\lVert v\rVert_\infty \le 1\) the answer is \(\operatorname{sign}(\nabla f)\).</li>
    <li>The chain rule composes linear maps, giving a product of Jacobians \(J_L\cdots J_1\).</li>
    <li>Reverse mode brackets that product from the left, so one backward pass yields the whole gradient of a scalar loss at a small constant multiple of forward cost. That is backpropagation.</li>
  </ul>
</div>

## References

1. Rumelhart, D. E., Hinton, G. E., & Williams, R. J. [Learning representations by back-propagating errors](https://doi.org/10.1038/323533a0). *Nature* 323, 533–536, 1986.
2. Baydin, A. G., Pearlmutter, B. A., Radul, A. A., & Siskind, J. M. [Automatic Differentiation in Machine Learning: a Survey](https://arxiv.org/abs/1502.05767). *JMLR* 18(153), 1–43, 2018.
3. Griewank, A., & Walther, A. *Evaluating Derivatives: Principles and Techniques of Algorithmic Differentiation*, 2nd ed. SIAM, 2008.
4. Amari, S. [Natural Gradient Works Efficiently in Learning](https://doi.org/10.1162/089976698300017746). *Neural Computation* 10(2), 251–276, 1998.
5. Chen, T., Xu, B., Zhang, C., & Guestrin, C. [Training Deep Nets with Sublinear Memory Cost](https://arxiv.org/abs/1604.06174). arXiv:1604.06174, 2016.
