---
layout: single
title: "What Mathematics an ML Engineer Actually Needs"
date: 2026-08-01
categories: [math-basics]
book: math-basics
subsection: foundations
tags: [linear-algebra, calculus, optimisation, interview-prep]
excerpt: "Almost every mathematical question asked in an ML interview reduces to two things: what a matrix does to space, and how to differentiate a composition. This book covers those two things properly and is honest about what you can safely forget."
author_profile: true
read_time: true
is_overview: true
icon: "🧮"
read_mins: 6
permalink: /blog/math-basics/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A trained network is a composition of linear maps and pointwise nonlinearities, fitted by following gradients. That single sentence determines the syllabus. You need linear algebra to understand what the linear maps do, and multivariable calculus to understand how the gradients are computed. Norms and convexity round it out because they tell you when the fitting converges. Measure theory, topology and real analysis are not what you will be asked about — and this book says so rather than padding itself with them.
</div>

## The syllabus is determined by one sentence

Write down what a feed-forward network is. Each layer applies a matrix, adds a bias, and passes the result through a nonlinearity applied elementwise. Training adjusts the matrices by descending a scalar loss.

Everything mathematical you need follows from unpacking that:

- **The matrices.** What does $$W$$ *do* to a vector? Which directions does it stretch, which does it destroy, what information does it throw away? That is linear algebra, and it is the single largest slice of the syllabus.
- **The descending.** How does a change in one weight, buried eleven layers deep, affect a scalar at the end? That is the chain rule, applied at scale. Backpropagation is nothing else.
- **The convergence.** How fast does this get anywhere, and what shape of loss surface makes it slow? That is norms, curvature and convexity.

The nonlinearity is the only piece that is not mathematically interesting, which is why it gets one line and moves on.

## The honest note about interviews

Interview mathematics is overwhelmingly linear algebra and calculus. Rank, eigenvectors, SVD, gradients, Jacobians, and a sanity check on convexity account for the large majority of questions actually asked. Probability and statistics form their own body of material and are treated separately from this book.

What almost never appears: epsilon-delta arguments, Lebesgue integration, compactness, Banach spaces. If a role genuinely needs those — theory positions, some optimisation research — the interview will say so in advance. Revising analysis instead of practising a Jacobian derivation is a bad trade.

What does appear, and catches people out, is not hard material. It is material people once knew and then stopped using: the difference between eigenvalues and singular values, why the gradient of $$x^\top A x$$ is $$(A + A^\top)x$$ and not $$Ax$$, why $$L^1$$ produces sparsity and $$L^2$$ does not.

<div class="warning-box">
  <strong>The three traps this book keeps returning to:</strong> (1) treating eigenvalues and singular values as the same object — they agree only for symmetric positive semi-definite matrices, and the general relationship is that the singular values of \(A\) are the square roots of the eigenvalues of \(A^\top A\); (2) getting matrix-calculus layout wrong, which produces an answer that is right up to a transpose and therefore wrong; (3) claiming a stationary point is a minimum without checking curvature.
</div>

## The map

The seven remaining posts, in the order they build on one another.

**Linear algebra**

1. [Vectors and matrices](/blog/math-basics/vectors-and-matrices/) — span, basis, rank; matrix multiplication read as composition of maps and as a change of basis; column space against null space, and rank–nullity as the conservation law that connects them.
2. [Eigenvalues, the spectral theorem and SVD](/blog/math-basics/eigen-and-svd/) — invariant directions, when diagonalisation fails, why the SVD always exists, and low-rank approximation with a worked $$2\times2$$ example carried through exactly.

**Calculus**

3. [Derivatives and gradients](/blog/math-basics/derivatives-and-gradients/) — the derivative as the best linear approximation, the gradient as a covector, and why reverse-mode differentiation is cheap precisely when there is one scalar output.
4. [Jacobians and Hessians](/blog/math-basics/jacobian-and-hessian/) — change of variables and the log-determinant term in normalising flows; curvature, second-order optimality, and why Newton's method loses at scale.
5. [Matrix calculus](/blog/math-basics/matrix-calculus/) — the dozen identities worth memorising, one derivation done slowly, and the layout convention that causes most sign errors.

**Analysis and optimisation**

6. [Norms and distances](/blog/math-basics/norms-and-distances/) — $$L^1$$, $$L^2$$, $$L^\infty$$, operator and Frobenius norms; the geometry behind $$L^1$$ sparsity; cosine similarity against Euclidean distance.
7. [Convexity and optimisation](/blog/math-basics/convexity-and-optimisation/) — what convexity guarantees, how the condition number sets the convergence rate, KKT conditions, and the honest position on non-convex deep learning.

<div class="insight-box">
  <strong>Key Insight — the two views that unify the book:</strong> almost every result here is one of two statements in disguise. Either <em>"this matrix is a map, so ask what it does to space"</em> — which gives you rank, eigenvectors, SVD, operator norms and conditioning — or <em>"this function is locally linear, so approximate it"</em> — which gives you gradients, Jacobians, Hessians, Newton steps and convergence rates. If you can place a question in one of those two frames, you can usually reconstruct the answer instead of recalling it.
</div>

## How to use this for revision

Read each post once for the argument, then close it and try to reproduce the one worked example from memory. The examples are chosen to be small enough to do by hand and specific enough that getting them right means you understood the mechanism, not the vocabulary.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>The syllabus falls out of one fact: a network is composed linear maps trained by gradients. Linear algebra explains the maps, calculus explains the gradients.</li>
    <li>Interview mathematics is dominated by linear algebra and calculus. Real analysis is rarely asked and is a poor use of revision time.</li>
    <li>Two framings recover most answers: <em>what does this matrix do to space</em>, and <em>what is the local linear approximation</em>.</li>
    <li>The recurring traps are eigenvalues versus singular values, matrix-calculus layout, and asserting optimality from a vanishing gradient alone.</li>
  </ul>
</div>

## References

1. Strang, G. *Introduction to Linear Algebra*, 6th ed. Wellesley-Cambridge Press, 2023. Companion lectures: [MIT 18.06](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/).
2. Deisenroth, M. P., Faisal, A. A., & Ong, C. S. [*Mathematics for Machine Learning*](https://mml-book.github.io/). Cambridge University Press, 2020.
3. Boyd, S., & Vandenberghe, L. [*Convex Optimization*](https://web.stanford.edu/~boyd/cvxbook/). Cambridge University Press, 2004.
4. Golub, G. H., & Van Loan, C. F. *Matrix Computations*, 4th ed. Johns Hopkins University Press, 2013.
5. Petersen, K. B., & Pedersen, M. S. [*The Matrix Cookbook*](https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf), version 20121115, 2012.
