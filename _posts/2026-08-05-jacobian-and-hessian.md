---
layout: single
title: "Jacobians, Hessians, and Why Newton's Method Loses at Scale"
date: 2026-08-05
categories: [math-basics]
book: math-basics
subsection: calculus
tags: [jacobian, hessian, curvature, second-order-methods]
excerpt: "The Jacobian tells you how a map distorts volume — which is exactly the term normalising flows have to pay. The Hessian tells you the shape of the valley you are descending. Both are indispensable to reason with and, at a billion parameters, hopeless to form."
author_profile: true
read_time: true
is_overview: false
icon: "🌀"
read_mins: 8
permalink: /blog/math-basics/jacobian-and-hessian/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The Jacobian is the matrix of the derivative of a vector-valued map, and its determinant is the local volume-scaling factor — which is why a change of variables pays a \(\log\lvert\det J\rvert\) term, and why normalising flows are architected so that determinant is cheap. The Hessian is the matrix of second derivatives; its eigenvalues are curvatures, and a stationary point is a minimum only when they are all positive. Newton's method uses the Hessian to become scale-invariant and locally quadratic, but at \(10^9\) parameters you can neither store it nor solve with it, so quasi-Newton methods reconstruct curvature from gradient differences instead.
</div>

## The Jacobian

For $f : \mathbb{R}^n \to \mathbb{R}^m$, the derivative from the [previous post](/blog/math-basics/derivatives-and-gradients/) is represented by the $m\times n$ matrix

<div class="formula-box">
\[
[J_f(x)]_{ij} = \frac{\partial f_i}{\partial x_j}(x).
\]
</div>

Row $i$ is the gradient of output $i$; column $j$ is the sensitivity of all outputs to input $j$. That is the whole object. When $m = n$, $\det J_f(x)$ has a clean geometric meaning: it is the factor by which $f$ scales infinitesimal volume at $x$, with the sign recording whether orientation is preserved.

## Change of variables, and the price flows pay

Push a random variable $X$ with density $p_X$ through an invertible, differentiable $f$ to get $Y = f(X)$. Probability mass is conserved but the volume element is not, so

<div class="formula-box">
\[
p_Y(y) = p_X(x)\,\bigl\lvert\det J_f(x)\bigr\rvert^{-1}, \qquad x = f^{-1}(y),
\]
</div>

or, in the form that actually appears in code,

<div class="formula-box">
\[
\log p_Y(y) = \log p_X(x) \;-\; \log\bigl\lvert\det J_f(x)\bigr\rvert .
\]
</div>

Read it as an accounting identity: if $f$ expands a neighbourhood, the same probability mass is spread over more volume, so the density there must drop — hence the subtraction.

This single term dictates the design of normalising flows. A general $\det J$ costs $O(n^3)$ to evaluate and is recomputed every training step, which is fatal. The fix is architectural: make $J$ triangular. An affine coupling layer splits the input and writes

<div class="formula-box">
\[
y_1 = x_1, \qquad y_2 = x_2 \odot \exp\!\bigl(s(x_1)\bigr) + t(x_1),
\]
</div>

where $s$ and $t$ are arbitrary networks. Because $y_1$ ignores $x_2$, the Jacobian is block lower-triangular with diagonal blocks $I$ and $\operatorname{diag}(\exp s(x_1))$. Its determinant is the product of the diagonal, so

<div class="formula-box">
\[
\log\lvert\det J\rvert = \textstyle\sum_k s_k(x_1),
\]
</div>

an $O(n)$ sum. The networks $s$ and $t$ can be as expressive as you like and never appear in the determinant — the expensive term was engineered away, not approximated.

## The Hessian and curvature

For scalar $f$, the Hessian collects second partials, $$H_{ij} = \partial^2 f/\partial x_i \partial x_j$$. For twice continuously differentiable $f$ the mixed partials commute, so $H$ is symmetric and the [spectral theorem](/blog/math-basics/eigen-and-svd/) applies: real eigenvalues, orthonormal eigenvectors. The second-order Taylor expansion is

<div class="formula-box">
\[
f(x + h) \approx f(x) + \nabla f(x)^\top h + \tfrac12 h^\top H(x)\, h .
\]
</div>

Each eigenvalue of $H$ is the curvature along its eigenvector: positive means the surface bends upward there, negative means downward. Hence the standard conditions at a stationary point ($\nabla f = 0$):

| Hessian at the stationary point | Conclusion |
|---|---|
| positive definite, all $\lambda_i > 0$ | strict local minimum |
| negative definite, all $\lambda_i < 0$ | strict local maximum |
| indefinite, mixed signs | saddle point |
| singular positive semi-definite | inconclusive from second order alone |

A worked case. Let $f(x,y) = x^2 + 4xy + y^2$. Then $\nabla f = (2x + 4y,\ 4x + 2y)$, zero only at the origin, and

<div class="formula-box">
\[
H = \begin{pmatrix} 2 & 4 \\ 4 & 2\end{pmatrix},
\qquad \lambda = 2 \pm 4 = 6,\, -2 .
\]
</div>

Both diagonal entries are positive, yet the matrix is indefinite and the origin is a saddle. Check it directly: along the eigenvector $(1,1)$, $f(t,t) = 6t^2$ rises; along $(1,-1)$, $f(t,-t) = -2t^2$ falls.

<div class="warning-box">
  <strong>Interview trap — positive diagonal is not positive definite.</strong> The example above has \(H_{11}, H_{22} > 0\) and is still indefinite, because \(\det H = 4 - 16 = -12 < 0\). Definiteness is a statement about eigenvalues (or all leading principal minors), never about the diagonal alone. The related trap: \(\nabla f = 0\) alone establishes nothing — in high dimensions almost every stationary point of a deep network's loss is a saddle rather than a local minimum.
</div>

## Newton's method, and why it loses

Minimise the quadratic model exactly instead of taking a fixed step along the gradient. Setting the derivative of the model to zero gives the Newton step

<div class="formula-box">
\[
x_{k+1} = x_k - H(x_k)^{-1}\nabla f(x_k).
\]
</div>

Two genuine advantages. It converges quadratically near a nondegenerate minimum — the number of correct digits roughly doubles per iteration. And it is affine invariant: reparameterise $x \mapsto Px$ and the iterates are unchanged, which repairs precisely the scale-sensitivity that makes plain gradient descent suffer on ill-conditioned problems.

Three reasons it is nonetheless rare in deep learning:

- **Storage.** $H$ has $n^2$ entries. At $n = 10^9$ that is $10^{18}$ numbers.
- **Solve cost.** A direct solve is $O(n^3)$, per iteration.
- **Indefiniteness.** Away from a minimum $H$ has negative eigenvalues, and $-H^{-1}\nabla f$ then points *uphill* along those directions. Newton's method is attracted to saddle points, not repelled by them, so it needs damping or a trust region to be safe at all.

## What quasi-Newton buys

BFGS never forms $H$. It maintains an approximation $B_k$ satisfying the secant condition

<div class="formula-box">
\[
B_{k+1}\, s_k = y_k, \qquad s_k = x_{k+1}-x_k,\quad y_k = \nabla f(x_{k+1}) - \nabla f(x_k),
\]
</div>

which is a finite-difference statement about curvature along the direction just travelled: gradients that changed a lot mean high curvature. L-BFGS goes further and stores only the last $m$ pairs $(s_k, y_k)$, typically $m$ between 5 and 20, reconstructing the step in $O(mn)$ time and memory. You get superlinear convergence in practice at roughly the cost of a gradient.

The honest caveat: the secant condition assumes the two gradients being differenced come from the *same* function. With minibatch gradients they do not, and the curvature pairs are corrupted by sampling noise. That is why L-BFGS is standard for deterministic, full-batch problems — logistic regression, CRFs, physics-informed fitting — and largely absent from stochastic deep learning, where cheap diagonal preconditioners such as Adam occupy the same niche.

<div class="insight-box">
  <strong>Key Insight — curvature without the matrix:</strong> you rarely need \(H\) itself, only products \(Hv\). Since \(Hv = \nabla_x\bigl(\nabla f(x)^\top v\bigr)\), a Hessian–vector product is one reverse-mode pass over one forward-mode directional derivative — cost \(O(n)\), no \(n^2\) storage. Hessian-free optimisation, Gauss–Newton approximations and Hessian-based sharpness measures all live entirely on this fact.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>\([J_f]_{ij} = \partial f_i/\partial x_j\); \(\det J\) is the local volume scaling factor.</li>
    <li>Change of variables costs \(-\log\lvert\det J\rvert\); coupling layers make \(J\) triangular so the term is an \(O(n)\) sum.</li>
    <li>The Hessian is symmetric, its eigenvalues are curvatures, and a stationary point is a minimum only if all of them are positive — the diagonal alone tells you nothing.</li>
    <li>Newton's method is affine invariant and locally quadratic, but costs \(O(n^2)\) memory and \(O(n^3)\) per solve, and steps towards saddles when \(H\) is indefinite.</li>
    <li>L-BFGS reconstructs curvature from \(m\) recent gradient differences in \(O(mn)\); it degrades under minibatch noise, which is why deep learning uses diagonal preconditioners instead.</li>
  </ul>
</div>

## References

1. Nocedal, J., & Wright, S. J. *Numerical Optimization*, 2nd ed., ch. 3, 6 and 7. Springer, 2006.
2. Liu, D. C., & Nocedal, J. [On the limited memory BFGS method for large scale optimization](https://doi.org/10.1007/BF01589116). *Mathematical Programming* 45, 503–528, 1989.
3. Pearlmutter, B. A. [Fast Exact Multiplication by the Hessian](https://doi.org/10.1162/neco.1994.6.1.147). *Neural Computation* 6(1), 147–160, 1994.
4. Dinh, L., Sohl-Dickstein, J., & Bengio, S. [Density Estimation using Real NVP](https://arxiv.org/abs/1605.08803). *ICLR 2017*.
5. Rezende, D. J., & Mohamed, S. [Variational Inference with Normalizing Flows](https://arxiv.org/abs/1505.05770). *ICML 2015*.
6. Dauphin, Y., Pascanu, R., Gulcehre, C., Cho, K., Ganguli, S., & Bengio, Y. [Identifying and attacking the saddle point problem in high-dimensional non-convex optimization](https://arxiv.org/abs/1406.2572). *NeurIPS 2014*.
