---
layout: single
title: "Eigenvectors, the Spectral Theorem, and Why the SVD Always Exists"
date: 2026-08-03
categories: [math-basics]
book: math-basics
subsection: linear-algebra
tags: [eigenvalues, svd, spectral-theorem, low-rank]
excerpt: "Eigenvectors are the directions a matrix does not rotate — when they exist. The SVD asks a weaker question that always has an answer, and that is exactly why it, not the eigendecomposition, is the workhorse of applied linear algebra."
author_profile: true
read_time: true
is_overview: false
icon: "🔺"
read_mins: 8
permalink: /blog/math-basics/eigen-and-svd/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> An eigenvector satisfies \(Av = \lambda v\) — a direction the map only rescales. Some matrices have too few of them to form a basis and cannot be diagonalised at all. Symmetric matrices are the happy case: the spectral theorem gives real eigenvalues and an <em>orthonormal</em> eigenbasis. The SVD drops the requirement that input and output directions be the same, and in exchange it exists for <em>every</em> matrix: \(A = U\Sigma V^\top\), read as rotate, scale, rotate. Truncating it gives the provably best low-rank approximation.
</div>

## Invariant directions

For a square $$A$$, a non-zero $$v$$ with

<div class="formula-box">
\[
Av = \lambda v
\]
</div>

is an eigenvector with eigenvalue $$\lambda$$: the map does not turn $$v$$ at all, it only scales it by $$\lambda$$. Find $$n$$ independent such directions and you have found the basis in which $$A$$ is trivial. Stack them as the columns of $$P$$ and, using the [change-of-basis](/blog/math-basics/vectors-and-matrices/) reading,

<div class="formula-box">
\[
A = P\Lambda P^{-1}, \qquad \Lambda = \operatorname{diag}(\lambda_1,\dots,\lambda_n).
\]
</div>

Applying $$A$$ a hundred times becomes $$P\Lambda^{100}P^{-1}$$: raise the diagonal entries to the hundredth power and stop. This is why eigenvalues govern the long-run behaviour of any repeated linear process — power iteration, Markov chains, linear recurrences, the stability of a linearised dynamical system.

## When diagonalisation fails

It fails when there are not enough independent eigenvectors. The standard counterexample is the shear

<div class="formula-box">
\[
N = \begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}.
\]
</div>

Its characteristic polynomial is $$(1-\lambda)^2$$, so $$\lambda = 1$$ twice. But solving $$(N - I)v = 0$$ gives only the line spanned by $$(1,0)^\top$$: one eigendirection where two are needed. $$N$$ is *defective* and no $$P$$ exists. Nothing pathological is happening — a shear genuinely has only one invariant direction — but the eigendecomposition simply has no answer to give.

Even when diagonalisation succeeds, for non-symmetric $$A$$ the eigenvectors need not be orthogonal, $$P$$ can be badly conditioned, and the eigenvalues can be complex.

## The symmetric case is different

If $$A = A^\top$$ with real entries, the **spectral theorem** guarantees all of the following: the eigenvalues are real, eigenvectors for distinct eigenvalues are orthogonal, and there is always an orthonormal basis of eigenvectors even with repeated eigenvalues. So

<div class="formula-box">
\[
A = Q\Lambda Q^\top, \qquad Q^\top Q = I .
\]
</div>

The inverse is now a transpose, which is numerically ideal. Covariance matrices, Gram matrices $$X^\top X$$, graph Laplacians and Hessians are all symmetric, which is why the spectral theorem does so much work in machine learning — PCA is exactly this decomposition applied to a covariance matrix.

## The SVD: weaken the question, always get an answer

The eigenvalue question insists the output direction equal the input direction. Drop that. Ask instead for orthonormal directions $$v_i$$ in the domain that map to orthogonal directions $$u_i$$ in the codomain, with $$Av_i = \sigma_i u_i$$ and $$\sigma_i \ge 0$$. That question always has an answer, for any real $$m \times n$$ matrix, square or not:

<div class="formula-box">
\[
A = U\Sigma V^\top, \qquad U^\top U = I_m,\quad V^\top V = I_n,\quad \Sigma = \operatorname{diag}(\sigma_1 \ge \sigma_2 \ge \dots \ge 0).
\]
</div>

Geometrically, since $$U$$ and $$V$$ are orthogonal, this reads **rotate, scale along axes, rotate**. Every linear map, however messy, is a rotation followed by an axis-aligned stretch followed by another rotation. The unit sphere is always sent to an ellipsoid whose semi-axis lengths are the singular values.

The connection to eigenvalues is one line of algebra:

<div class="formula-box">
\[
A^\top A = V\Sigma^\top U^\top U \Sigma V^\top = V(\Sigma^\top\Sigma)V^\top .
\]
</div>

$$A^\top A$$ is symmetric positive semi-definite, so this is its spectral decomposition: the right singular vectors are its eigenvectors, and $$\sigma_i = \sqrt{\lambda_i(A^\top A)}$$. Symmetrically, the left singular vectors are eigenvectors of $$AA^\top$$. (In practice nobody forms $$A^\top A$$ to compute an SVD — squaring the matrix squares its condition number — but the identity is the right mental model.)

## A worked $$2\times2$$ example, exactly

Take

<div class="formula-box">
\[
A = \begin{pmatrix} 3 & 0 \\ 4 & 5 \end{pmatrix}.
\]
</div>

It is triangular, so its **eigenvalues are 3 and 5**, with eigenvectors $$(1,-2)^\top/\sqrt5$$ and $$(0,1)^\top$$ — not orthogonal, since $$A$$ is not symmetric.

Now the SVD. $$A^\top A = \begin{pmatrix} 25 & 20 \\ 20 & 25\end{pmatrix}$$, whose eigenvalues are $$25 \pm 20$$, that is $$45$$ and $$5$$, with eigenvectors $$(1,1)^\top/\sqrt2$$ and $$(1,-1)^\top/\sqrt2$$. Hence

<div class="formula-box">
\[
\sigma_1 = \sqrt{45} = 3\sqrt5 \approx 6.708, \qquad \sigma_2 = \sqrt5 \approx 2.236 .
\]
</div>

The left singular vectors follow from $$u_i = Av_i/\sigma_i$$. With $$v_1 = (1,1)^\top/\sqrt2$$ we get $$Av_1 = (3, 9)^\top/\sqrt2$$, and dividing by $$3\sqrt5$$ gives $$u_1 = (1,3)^\top/\sqrt{10}$$. Likewise $$Av_2 = (3,-1)^\top/\sqrt2$$ gives $$u_2 = (3,-1)^\top/\sqrt{10}$$, which is orthogonal to $$u_1$$ as promised.

Two sanity checks: $$\sigma_1\sigma_2 = 3\sqrt5 \cdot \sqrt5 = 15 = \lvert\det A\rvert$$, and $$\sigma_1^2 + \sigma_2^2 = 45 + 5 = 50 = 3^2 + 0^2 + 4^2 + 5^2 = \lVert A\rVert_F^2$$.

| Quantity | Value |
|---|---|
| Eigenvalues of $$A$$ | $$3,\ 5$$ |
| Singular values of $$A$$ | $$3\sqrt5 \approx 6.708,\ \sqrt5 \approx 2.236$$ |
| Largest stretch of any unit vector | $$6.708$$, **not** $$5$$ |
| $$\lvert\det A\rvert$$ | $$15 = 3\cdot 5 = \sigma_1\sigma_2$$ |

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="sv-title sv-desc" viewBox="0 0 640 320" style="max-width:640px;width:100%;height:auto">
  <title id="sv-title">The SVD sends the unit circle to an ellipse with semi-axes equal to the singular values</title>
  <desc id="sv-desc">On the left, a unit circle with two perpendicular arrows marking the right singular vectors v1 along the direction (1,1)/root2 and v2 along (1,minus 1)/root2. On the right, the image under the matrix with rows (3,0) and (4,5): an ellipse whose semi-major axis has length 6.708, equal to sigma one, pointing along u1 = (1,3)/root10, and whose semi-minor axis has length 2.236, equal to sigma two, pointing along u2 = (3,minus 1)/root10. Both panels are drawn at the same scale, so the ellipse is dramatically larger than the circle.</desc>
  <rect x="1" y="1" width="638" height="318" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="140" y="20" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">unit circle in the domain</text>
  <text x="450" y="20" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">its image: an ellipse, semi-axes 6.708 and 2.236</text>

  <g stroke="#cbd5e1" stroke-width="1">
    <line x1="80" y1="175" x2="205" y2="175"/><line x1="140" y1="112" x2="140" y2="238"/>
    <line x1="358" y1="175" x2="525" y2="175"/><line x1="440" y1="38" x2="440" y2="312"/>
  </g>

  <circle cx="140" cy="175" r="20" fill="none" stroke="#334155" stroke-width="1.8"/>
  <g stroke="#0e7490" stroke-width="2" marker-end="url(#svA)">
    <line x1="140" y1="175" x2="154.1" y2="160.9"/>
  </g>
  <g stroke="#c2410c" stroke-width="2" marker-end="url(#svB)">
    <line x1="140" y1="175" x2="154.1" y2="189.1"/>
  </g>
  <text x="160" y="156" font-size="9.5" fill="#0e7490">v₁ = (1,1)/√2</text>
  <text x="160" y="201" font-size="9.5" fill="#c2410c">v₂ = (1,−1)/√2</text>

  <line x1="215" y1="175" x2="348" y2="175" stroke="#475569" stroke-width="1.8" marker-end="url(#svC)"/>
  <text x="281" y="167" text-anchor="middle" font-size="10.5" font-weight="700" fill="#475569">apply A</text>

  <ellipse cx="440" cy="175" rx="134.2" ry="44.7" transform="rotate(-71.57 440 175)" fill="none" stroke="#334155" stroke-width="1.8"/>
  <g stroke="#0e7490" stroke-width="2" marker-end="url(#svA)">
    <line x1="440" y1="175" x2="482.4" y2="47.7"/>
  </g>
  <g stroke="#c2410c" stroke-width="2" marker-end="url(#svB)">
    <line x1="440" y1="175" x2="482.4" y2="189.1"/>
  </g>
  <text x="490" y="46" font-size="9.5" fill="#0e7490">σ₁u₁, length 6.708</text>
  <text x="490" y="196" font-size="9.5" fill="#c2410c">σ₂u₂, length 2.236</text>

  <defs>
    <marker id="svA" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#0e7490"/></marker>
    <marker id="svB" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#c2410c"/></marker>
    <marker id="svC" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#475569"/></marker>
  </defs>
</svg>
<figcaption>Notice that the longest semi-axis is 6.708, larger than <em>either</em> eigenvalue of A (3 and 5). The maximum stretch a matrix applies is its largest singular value, never its largest eigenvalue.</figcaption>
</figure>
</div>

## Low-rank approximation and Eckart–Young

Write the SVD as a sum of rank-one pieces, $$A = \sum_i \sigma_i u_i v_i^\top$$, and keep the largest $$k$$ terms. The **Eckart–Young–Mirsky theorem** says this truncation $$A_k$$ is optimal: among all matrices of rank at most $$k$$, it minimises both $$\lVert A - A_k\rVert_F$$ and the spectral norm $$\lVert A - A_k\rVert_2$$, with errors

<div class="formula-box">
\[
\lVert A - A_k\rVert_2 = \sigma_{k+1}, \qquad \lVert A - A_k\rVert_F = \sqrt{\textstyle\sum_{i>k}\sigma_i^2}.
\]
</div>

For our $$A$$, the rank-one truncation is $$\sigma_1 u_1 v_1^\top = \begin{pmatrix} 1.5 & 1.5 \\ 4.5 & 4.5\end{pmatrix}$$, and the residual $$A - A_1 = \begin{pmatrix} 1.5 & -1.5 \\ -0.5 & 0.5\end{pmatrix}$$ has Frobenius norm $$\sqrt{2.25+2.25+0.25+0.25} = \sqrt5 = \sigma_2$$, exactly as the theorem predicts.

<div class="insight-box">
  <strong>Key Insight — the SVD exists because it asks less:</strong> the eigendecomposition demands one orthonormal basis that works simultaneously as input and output basis, and for most matrices no such basis exists. The SVD allows two different bases, \(V\) on the way in and \(U\) on the way out. That extra freedom is exactly what makes it unconditionally available — and why the defective shear \(N = \begin{pmatrix}1&1\\0&1\end{pmatrix}\), which has no eigendecomposition, still has a perfectly good SVD with singular values \(\varphi \approx 1.618\) and \(1/\varphi \approx 0.618\) whose product is \(1 = \lvert\det N\rvert\).
</div>

<div class="warning-box">
  <strong>Interview trap — eigenvalues are not singular values.</strong> They coincide only when \(A\) is symmetric positive semi-definite; for symmetric indefinite \(A\), \(\sigma_i = \lvert\lambda_i\rvert\); in general they are unrelated in size, as the example above shows (eigenvalues 3 and 5, singular values 6.708 and 2.236). Two consequences people get wrong under pressure: the operator 2-norm is \(\sigma_{\max}\), not \(\lvert\lambda\rvert_{\max}\); and the right singular vectors are eigenvectors of \(A^\top A\), <em>not</em> of \(A\).
</div>

## Where this shows up

PCA is the SVD of the centred data matrix; whitening, the pseudoinverse and stable rank-deficient least squares all come straight from $$U\Sigma V^\top$$. The condition number $$\kappa_2(A) = \sigma_{\max}/\sigma_{\min}$$ — which governs error amplification and reappears in [convergence rates](/blog/math-basics/convexity-and-optimisation/) — is about singular values, not eigenvalues.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>\(Av = \lambda v\) picks out invariant directions; \(A = P\Lambda P^{-1}\) exists only when there are \(n\) independent eigenvectors, which fails for defective matrices such as the shear.</li>
    <li>Spectral theorem: a real symmetric matrix always has real eigenvalues and an orthonormal eigenbasis, so \(A = Q\Lambda Q^\top\).</li>
    <li>\(A = U\Sigma V^\top\) exists for every real matrix and reads as rotate–scale–rotate; the unit sphere becomes an ellipsoid with semi-axes \(\sigma_i\).</li>
    <li>\(\sigma_i = \sqrt{\lambda_i(A^\top A)}\); right singular vectors are eigenvectors of \(A^\top A\), left ones of \(AA^\top\).</li>
    <li>Eckart–Young: truncating the SVD at \(k\) terms is the best possible rank-\(k\) approximation, with spectral-norm error exactly \(\sigma_{k+1}\).</li>
  </ul>
</div>

## References

1. Eckart, C., & Young, G. [The approximation of one matrix by another of lower rank](https://doi.org/10.1007/BF02288367). *Psychometrika* 1(3), 211–218, 1936.
2. Trefethen, L. N., & Bau, D. *Numerical Linear Algebra*. SIAM, 1997 — lectures 4–5 on the SVD.
3. Golub, G. H., & Van Loan, C. F. *Matrix Computations*, 4th ed., ch. 2 and 8. Johns Hopkins University Press, 2013.
4. Strang, G. *Introduction to Linear Algebra*, 6th ed., ch. 6–7. Wellesley-Cambridge Press, 2023.
5. Halko, N., Martinsson, P.-G., & Tropp, J. A. [Finding Structure with Randomness: Probabilistic Algorithms for Constructing Approximate Matrix Decompositions](https://arxiv.org/abs/0909.4061). *SIAM Review* 53(2), 217–288, 2011.
