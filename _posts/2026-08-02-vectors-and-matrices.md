---
layout: single
title: "Matrices as Linear Maps: Span, Rank, and the Subspaces They Create"
date: 2026-08-02
categories: [math-basics]
book: math-basics
subsection: linear-algebra
tags: [linear-algebra, rank, basis, null-space]
excerpt: "A matrix is not a grid of numbers, it is a map. Once you read it that way, rank, column space, null space and rank–nullity stop being definitions to memorise and become one geometric statement about what the map keeps and what it destroys."
author_profile: true
read_time: true
is_overview: false
icon: "📐"
read_mins: 7
permalink: /blog/math-basics/vectors-and-matrices/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Reading \(Ax\) as a linear combination of the columns of \(A\) makes almost everything else immediate. The reachable outputs are exactly the span of the columns — the column space — and its dimension is the rank. Whatever the map destroys lives in the null space. Rank–nullity says the domain is exactly split between the two: \(\operatorname{rank}(A) + \dim\ker(A) = n\). Matrix multiplication is composition of maps; conjugation \(P^{-1}AP\) is the same map read in a different basis.
</div>

## Two readings of $Ax$

The mechanical reading of $Ax$ is "row $i$ of $A$ dotted with $x$". It is correct and it explains nothing.

The useful reading is by columns. If $A$ has columns $a_1,\dots,a_n$ and $x = (x_1,\dots,x_n)^\top$, then

<div class="formula-box">
\[
Ax = x_1 a_1 + x_2 a_2 + \dots + x_n a_n .
\]
</div>

So $A$ takes the coordinates in $x$ and uses them as mixing weights on a fixed set of output vectors. The set of everything you can produce this way is the **span** of the columns — the **column space** $\operatorname{col}(A)$. Nothing outside it is reachable, which is exactly why $Ax = b$ has a solution if and only if $b \in \operatorname{col}(A)$.

A **basis** for a subspace is a spanning set with no redundancy, and every basis of a given subspace has the same size — that size is the dimension. The **rank** of $A$ is $\dim \operatorname{col}(A)$: the number of genuinely independent output directions. A $1000 \times 1000$ matrix of rank 3 maps a thousand-dimensional space onto a three-dimensional plane inside it.

## What the map destroys

If the columns are dependent, some non-zero combination of them gives zero. Those coefficient vectors form the **null space** (or kernel) $$\ker(A) = \{x : Ax = 0\}$$, a subspace of the *domain*. Every vector in it is annihilated.

That gives the conservation law. Each input dimension either survives to contribute an independent output direction, or it is collapsed:

<div class="formula-box">
\[
\underbrace{\operatorname{rank}(A)}_{\text{dimensions that survive}} \;+\; \underbrace{\dim \ker(A)}_{\text{dimensions destroyed}} \;=\; n = \text{number of columns}.
\]
</div>

This is **rank–nullity**, and read this way it is almost a tautology rather than a theorem. The genuinely non-obvious fact sitting alongside it is that row rank equals column rank: the number of independent rows and the number of independent columns are the same, so $\operatorname{rank}(A) = \operatorname{rank}(A^\top)$ even when $A$ is rectangular and the two spaces live in different places.

## A worked example

Take

<div class="formula-box">
\[
A = \begin{pmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{pmatrix},
\qquad A : \mathbb{R}^3 \to \mathbb{R}^2 .
\]
</div>

The first two columns $(1,4)^\top$ and $(2,5)^\top$ are independent, so the column space is all of $\mathbb{R}^2$ and $\operatorname{rank}(A) = 2$. The third column is redundant: $(3,6)^\top = -(1,4)^\top + 2\,(2,5)^\top$, since $-1 + 4 = 3$ and $-4 + 10 = 6$.

That dependency *is* the null space. It says $-1 \cdot a_1 + 2 \cdot a_2 - 1 \cdot a_3 = 0$, so $x = (1,-2,1)^\top$ satisfies $Ax = 0$: check $1 - 4 + 3 = 0$ and $4 - 10 + 6 = 0$. The null space is the line spanned by $(1,-2,1)^\top$, of dimension 1.

| Quantity | Value | Lives in |
|---|---|---|
| $\operatorname{rank}(A)$ | 2 | — |
| $\operatorname{col}(A)$ | all of $\mathbb{R}^2$ | codomain $\mathbb{R}^2$ |
| $\ker(A)$ | $$\operatorname{span}\{(1,-2,1)^\top\}$$ | domain $\mathbb{R}^3$ |
| Rank–nullity | $2 + 1 = 3$ | $= n$, the 3 columns |

Geometrically: $A$ flattens $\mathbb{R}^3$ onto the plane $\mathbb{R}^2$ by crushing one particular line to the origin. Solutions to $Ax = b$ are never unique — add any multiple of $(1,-2,1)^\top$ and you get another.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="vm-title vm-desc" viewBox="0 0 620 215" style="max-width:620px;width:100%;height:auto">
  <title id="vm-title">Rank–nullity for a 2 by 3 matrix of rank 2</title>
  <desc id="vm-desc">The domain, a box labelled R three, is divided into two parts: a large region labelled row space of dimension 2, and a thin strip labelled null space of dimension 1 spanned by the vector (1, minus 2, 1). An arrow from the row space region to the codomain box, labelled R two, lands on a region labelled column space of dimension 2, which fills the whole codomain. A second arrow from the null space strip is labelled collapsed to zero. Two plus one equals three, the number of columns.</desc>
  <rect x="1" y="1" width="618" height="213" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="120" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0c4a6e">domain — all of ℝ³</text>
  <rect x="30" y="44" width="180" height="146" rx="7" fill="#ffffff" stroke="#94a3b8"/>
  <rect x="44" y="57" width="152" height="88" rx="5" fill="#0e7490"/>
  <text x="120" y="94" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ffffff">row space</text>
  <text x="120" y="110" text-anchor="middle" font-size="10.5" fill="#e0f2fe">dim 2</text>
  <rect x="44" y="153" width="152" height="26" rx="5" fill="#e2e8f0" stroke="#c2410c"/>
  <text x="120" y="170" text-anchor="middle" font-size="9.5" fill="#c2410c">null space, dim 1: span{(1,−2,1)}</text>

  <text x="500" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0c4a6e">codomain — all of ℝ²</text>
  <rect x="410" y="44" width="180" height="146" rx="7" fill="#ffffff" stroke="#94a3b8"/>
  <rect x="424" y="57" width="152" height="88" rx="5" fill="#0e7490"/>
  <text x="500" y="94" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ffffff">column space</text>
  <text x="500" y="110" text-anchor="middle" font-size="10.5" fill="#e0f2fe">dim 2 = rank</text>
  <text x="500" y="170" text-anchor="middle" font-size="9.5" fill="#475569">nothing left over</text>

  <line x1="214" y1="101" x2="404" y2="101" stroke="#0e7490" stroke-width="1.8" marker-end="url(#vmArrA)"/>
  <text x="309" y="93" text-anchor="middle" font-size="10" fill="#0e7490">A is one-to-one here</text>
  <line x1="214" y1="166" x2="404" y2="166" stroke="#c2410c" stroke-width="1.8" stroke-dasharray="4 3" marker-end="url(#vmArrB)"/>
  <text x="309" y="158" text-anchor="middle" font-size="10" fill="#c2410c">everything sent to 0</text>

  <text x="309" y="205" text-anchor="middle" font-size="10.5" font-weight="700" fill="#334155">rank 2 + nullity 1 = 3 columns</text>
  <defs>
    <marker id="vmArrA" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#0e7490"/></marker>
    <marker id="vmArrB" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#c2410c"/></marker>
  </defs>
</svg>
<figcaption>Notice that the split happens on <em>different sides</em>: rank and nullity partition the domain, while the column space sits in the codomain. Confusing the two sides is the most common source of wrong answers about null spaces.</figcaption>
</figure>
</div>

## Multiplication is composition; conjugation is a change of basis

Because $(AB)x = A(Bx)$, the product $AB$ is the map "do $B$, then do $A$". Non-commutativity stops being strange: rotating then projecting is not projecting then rotating. It also explains the shape rule — the output dimension of $B$ must be the input dimension of $A$ — and the bound $\operatorname{rank}(AB) \le \min(\operatorname{rank}A, \operatorname{rank}B)$, since a composition cannot recover dimensions an earlier stage destroyed.

The second reading of a product is a change of coordinates. Let $P$ have as its columns a new basis, written in the old coordinates. Then $P$ converts new coordinates into old ones, and $P^{-1}$ does the reverse. So

<div class="formula-box">
\[
B = P^{-1} A P
\]
</div>

reads right to left as: take a vector in the new coordinates, convert to old ($P$), apply the map ($A$), convert back ($P^{-1}$). $A$ and $B$ are *the same linear map* described in two languages. This is why similar matrices share rank, trace, determinant and eigenvalues — those are properties of the map, not of the description. It is also the whole point of [diagonalisation](/blog/math-basics/eigen-and-svd/): find the basis in which the description is as simple as possible.

<div class="insight-box">
  <strong>Key Insight — rank is a statement about information, not about arithmetic:</strong> rank counts how many independent directions survive the map. Low rank means the output is confined to a thin slice of the space it nominally lives in, and that is why low-rank structure is exploitable — LoRA adapters, matrix factorisation for recommenders, and PCA all rest on the observation that a map with rank \(r\) can be stored and applied with \(r(m+n)\) numbers instead of \(mn\).
</div>

<div class="warning-box">
  <strong>Interview trap — which space does it live in?</strong> For \(A \in \mathbb{R}^{m\times n}\), the null space is a subspace of \(\mathbb{R}^n\) (the domain) and the column space is a subspace of \(\mathbb{R}^m\) (the codomain). They generally have different ambient dimensions, so "orthogonal to each other" is meaningless. The correct orthogonality statement is that \(\ker(A)\) is the orthogonal complement of the <em>row</em> space inside \(\mathbb{R}^n\) — which follows immediately from \(Ax = 0\) meaning every row is perpendicular to \(x\).
</div>

## Why this matters in practice

Rank deficiency is what makes $A^\top A$ singular in least squares, forcing ridge regularisation. Rank collapse in a transformer's attention matrices is a real failure mode. And the entire family of parameter-efficient fine-tuning methods is a bet that the *update* to a weight matrix has far lower rank than the matrix itself.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>\(Ax\) is a linear combination of the columns of \(A\); the column space is therefore the set of all reachable outputs, and the rank is its dimension.</li>
    <li>The null space collects the input directions the map destroys. Rank–nullity, \(\operatorname{rank}(A) + \dim\ker(A) = n\), partitions the <em>domain</em>.</li>
    <li>Row rank equals column rank, so \(\operatorname{rank}(A) = \operatorname{rank}(A^\top)\), even for rectangular \(A\).</li>
    <li>\(AB\) means "\(B\) then \(A\)"; \(P^{-1}AP\) is the same map written in a different basis, which is why similar matrices share rank, trace, determinant and eigenvalues.</li>
    <li>Null space lives in the domain, column space in the codomain — do not compare them directly.</li>
  </ul>
</div>

## References

1. Strang, G. *Introduction to Linear Algebra*, 6th ed. Wellesley-Cambridge Press, 2023. See also [MIT 18.06](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/), lectures 5–10.
2. Axler, S. [*Linear Algebra Done Right*](https://linear.axler.net/), 4th ed. Springer, 2024 — the map-first treatment, free to read online.
3. Deisenroth, M. P., Faisal, A. A., & Ong, C. S. [*Mathematics for Machine Learning*](https://mml-book.github.io/), ch. 2. Cambridge University Press, 2020.
4. Hu, E. J., et al. [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685). *ICLR 2022*.
