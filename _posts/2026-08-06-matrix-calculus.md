---
layout: single
title: "Matrix Calculus Without Sign Errors: The Identities and the Layout Trap"
date: 2026-08-06
categories: [math-basics]
book: math-basics
subsection: calculus
tags: [matrix-calculus, gradients, layout-convention, least-squares]
excerpt: "Most matrix-calculus mistakes are not mistakes about calculus. They are mistakes about which convention you were using, and they produce an answer that is correct up to a transpose — which is to say, wrong."
author_profile: true
read_time: true
is_overview: false
icon: "🧾"
read_mins: 7
permalink: /blog/math-basics/matrix-calculus/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A dozen identities cover almost everything a practitioner differentiates, and the two that matter most are \(\nabla_x(x^\top A x) = (A + A^\top)x\) and \(\nabla_x \lVert Ax - b\rVert^2 = 2A^\top(Ax-b)\). The reliable way to derive any of them is the differential method: perturb, keep the term linear in the perturbation, and read off the gradient from \(df = \langle G, dx\rangle\). It is layout-free, which sidesteps the numerator-versus-denominator confusion that causes most stray transposes.
</div>

## The two layouts

Everyone agrees that $\partial y/\partial x$ collects all the partials $\partial y_i/\partial x_j$. Nobody agrees how to arrange them.

**Numerator layout** (also called Jacobian layout) puts the numerator's index down the rows: for $y\in\mathbb{R}^m$, $x\in\mathbb{R}^n$, the result is $m\times n$. A scalar function of a vector then has a $1\times n$ *row* derivative.

**Denominator layout** is the transpose of that: the result is $n \times m$, and a scalar function of a vector gives an $n\times1$ *column*.

Machine learning almost always wants the second, for a mundane reason: the gradient is subtracted from the parameter, so it had better have the parameter's shape. This is the **shape convention**, and it is what `w.grad` holds in every autodiff framework. Numerical analysis and control theory tend to prefer numerator layout, because the chain rule then reads as plain left-to-right matrix multiplication, $D(f\circ g) = Df\,Dg$.

Both are correct. The damage comes from silently mixing them mid-derivation — you get an answer whose entries are all right and whose orientation is wrong, and a shape check that happens to pass because the matrix was square.

<div class="warning-box">
  <strong>Interview trap — the layout tells you where the transpose goes.</strong> Two specific errors dominate. First, \(\nabla_x(x^\top A x) = (A + A^\top)x\), which equals \(2Ax\) <em>only</em> when \(A\) is symmetric — assuming symmetry unstated is the single most common slip. Second, \(\nabla_x \lVert Ax - b\rVert^2 = 2A^\top(Ax-b)\) and not \(2A(Ax-b)\); when \(A\) is rectangular the wrong version does not even typecheck, and when \(A\) is square it silently gives the wrong direction. State your convention before you start, and check shapes at every line.
</div>

## The reference table

Vectors are columns; $x \in \mathbb{R}^n$, $a,b$ constant, $A$ constant, $X$ a matrix variable. Gradients follow the shape convention, so $\nabla_x f$ is $n\times 1$ and $\partial f/\partial X$ has the shape of $X$. Jacobians of vector-valued maps are given in numerator layout.

| Expression | Derivative | Notes |
|---|---|---|
| $a^\top x$ | $\nabla_x = a$ | also $x^\top a$ |
| $x^\top x$ | $\nabla_x = 2x$ | |
| $\lVert x\rVert_2$ | $\nabla_x = x/\lVert x\rVert_2$ | undefined at $x = 0$ |
| $x^\top A x$ | $\nabla_x = (A + A^\top)x$ | $= 2Ax$ **iff** $A = A^\top$ |
| $Ax$ | $J = A$ | shape $m\times n$ |
| $\lVert Ax - b\rVert_2^2$ | $\nabla_x = 2A^\top(Ax - b)$ | zero $\Rightarrow$ normal equations |
| $\log\sum_i e^{x_i}$ | $\nabla_x = \operatorname{softmax}(x)$ | |
| $a^\top X b$ | $\partial/\partial X = ab^\top$ | rank one |
| $\operatorname{tr}(AX)$ | $\partial/\partial X = A^\top$ | |
| $\operatorname{tr}(X^\top A)$ | $\partial/\partial X = A$ | |
| $\operatorname{tr}(AXB)$ | $\partial/\partial X = A^\top B^\top$ | via $\operatorname{tr}(AXB)=\operatorname{tr}(BAX)$ |
| $\operatorname{tr}(X^\top A X)$ | $\partial/\partial X = (A + A^\top)X$ | matrix analogue of row 4 |
| $\log\det X$ | $\partial/\partial X = X^{-\top}$ | $X$ invertible; $=X^{-1}$ if symmetric |
| $\det X$ | $\partial/\partial X = \det(X)\,X^{-\top}$ | Jacobi's formula |
| $X^{-1}$ | $d(X^{-1}) = -X^{-1}(dX)X^{-1}$ | differential form |

Two of these deserve a caution. The trace identities assume the entries of $X$ are free; if $X$ is constrained to be symmetric and you differentiate with respect to the independent parameters only, the off-diagonal terms pick up a factor of two. And $\log\det$ is defined only where $\det X > 0$, which is why covariance parameterisations carry a Cholesky factor rather than the matrix itself.

## One derivation, done properly

Take the least-squares objective and derive its gradient from the definition, with no index manipulation and no layout convention required. Let

<div class="formula-box">
\[
f(x) = \lVert Ax - b\rVert_2^2 = (Ax-b)^\top(Ax-b), \qquad r = Ax - b .
\]
</div>

Perturb $x$ by $h$ and expand. Since $A(x+h) - b = r + Ah$,

<div class="formula-box">
\[
f(x+h) - f(x) = (r + Ah)^\top(r + Ah) - r^\top r
= \underbrace{2\,r^\top A h}_{\text{linear in } h} + \underbrace{h^\top A^\top A h}_{O(\lVert h\rVert^2)} .
\]
</div>

The cross terms combined because $r^\top A h$ and $h^\top A^\top r$ are the same scalar — a $1\times1$ matrix equals its own transpose, which is the one manipulation this method needs. By the [definition of the derivative](/blog/math-basics/derivatives-and-gradients/), the linear term *is* $Df(x)[h]$, and the quadratic remainder is $o(\lVert h\rVert)$. Now rewrite the linear term as an inner product with $h$:

<div class="formula-box">
\[
2\,r^\top A h = \langle 2A^\top r,\ h\rangle \quad\Longrightarrow\quad \nabla f(x) = 2A^\top(Ax - b).
\]
</div>

The transpose appeared for a reason you can see rather than recall: moving $A$ from acting on $h$ to acting on $r$ inside an inner product is exactly what the adjoint does. Setting the gradient to zero gives the normal equations $A^\top A x = A^\top b$, and the solution is unique precisely when $A$ has [full column rank](/blog/math-basics/vectors-and-matrices/), since that is when $A^\top A$ is invertible.

The same three lines give row 4 of the table. With $f(x) = x^\top A x$,

<div class="formula-box">
\[
f(x+h) - f(x) = h^\top A x + x^\top A h + h^\top A h
= \langle (A + A^\top)x,\ h\rangle + O(\lVert h\rVert^2),
\]
</div>

because $h^\top A x = \langle h, Ax\rangle$ and $x^\top A h = \langle A^\top x, h\rangle$. The symmetric case collapses to $2Ax$; the general case does not.

<div class="insight-box">
  <strong>Key Insight — differentials are layout-free:</strong> write \(df = \langle G, dx\rangle\) for vectors, or \(df = \operatorname{tr}(G^\top dX)\) for matrices, and \(G\) <em>is</em> the gradient in the shape convention, automatically. You never choose a layout, so you cannot mix two. The trace form also explains why so many matrix identities are really one identity: cyclic invariance, \(\operatorname{tr}(ABC) = \operatorname{tr}(BCA)\), lets you shuffle \(dX\) into the rightmost position, and whatever is left multiplying it is the answer.
</div>

## Checking yourself

Three checks catch nearly every error before it reaches code. **Shapes**: the gradient must have the shape of the variable. **Scalars**: set $n = 1$ and confirm the expression reduces to ordinary calculus — $\nabla_x(ax^2)$ should give $2ax$. **Finite differences**: compare against $(f(x + \varepsilon e_i) - f(x - \varepsilon e_i))/2\varepsilon$ with $\varepsilon \approx 10^{-5}$; the central difference has $O(\varepsilon^2)$ error and will agree to five or six digits when the analytic gradient is right.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Numerator layout gives \(m\times n\); denominator (shape convention) gives \(n\times m\). Machine learning uses the shape convention so that gradients match parameters.</li>
    <li>\(\nabla_x(x^\top A x) = (A + A^\top)x\); it is \(2Ax\) only for symmetric \(A\).</li>
    <li>\(\nabla_x\lVert Ax-b\rVert^2 = 2A^\top(Ax-b)\), giving the normal equations \(A^\top A x = A^\top b\).</li>
    <li>\(\partial\operatorname{tr}(AX)/\partial X = A^\top\) and \(\partial\log\det X/\partial X = X^{-\top}\).</li>
    <li>Derive with differentials: read \(G\) off \(df = \langle G, dx\rangle\) or \(df = \operatorname{tr}(G^\top dX)\), then verify with shapes, the scalar case, and central finite differences.</li>
  </ul>
</div>

## References

1. Petersen, K. B., & Pedersen, M. S. [*The Matrix Cookbook*](https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf), version 20121115, 2012 — sections 2 and 9 cover every identity above.
2. Magnus, J. R., & Neudecker, H. *Matrix Differential Calculus with Applications in Statistics and Econometrics*, 3rd ed. Wiley, 2019 — the rigorous treatment of the differential method.
3. Parr, T., & Howard, J. [The Matrix Calculus You Need For Deep Learning](https://arxiv.org/abs/1802.01528). arXiv:1802.01528, 2018.
4. Golub, G. H., & Van Loan, C. F. *Matrix Computations*, 4th ed., ch. 5 on least squares. Johns Hopkins University Press, 2013.
