---
layout: single
title: "Grids: Why Translation Equivariance Forces Convolution"
date: 2026-08-05
categories: [gdl]
book: gdl
subsection: domains
tags: [grids, convolution, translation-equivariance, cnn, geometric-deep-learning]
published: true
is_overview: false
excerpt: "Convolution is not a clever idea someone had about images. It is the only linear map that commutes with translation — a theorem, not a design choice, and one you can verify by exhaustion on a small enough case."
author_profile: true
read_time: true
icon: "▦"
read_mins: 7
permalink: /blog/gdl/grids-and-translation-equivariance/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Ask for a linear layer on a grid that commutes with shifting the input, and you do not get to choose what it looks like. The requirement pins the weight matrix down to a circulant one, and a circulant matrix multiplied by a vector <em>is</em> a convolution. Weight sharing is not a parameter-saving trick that happens to help — it is what the constraint looks like once you write it out.
</div>

## The domain and its symmetry

A grid is the domain where the data sits at regularly spaced positions: pixels in an image, samples in an audio clip, cells in a time series. Its symmetry group is **translation** — shift the signal and it is still the same kind of object, with the content moved.

For a length-$$n$$ signal with wraparound, the shift is a matrix $$S$$ with $$S_{ij} = 1$$ exactly when $$j = i - 1 \pmod n$$. Applying $$S$$ moves every entry one place along.

The [blueprint](/blog/gdl/overview/) asks for a layer $$L$$ that is **equivariant**: shifting then transforming equals transforming then shifting.

<div class="formula-box">
\[
L S = S L .
\]
</div>

That is the whole specification. Now see what it forces.

## The constraint pins the matrix down

Write out $$LS = SL$$ entrywise. Both sides are matrices, and comparing entry $$(i,j)$$ gives

<div class="formula-box">
\[
L_{i,j} \;=\; L_{i-1,\,j-1} \pmod n .
\]
</div>

Every entry equals the one diagonally up-left from it. So the matrix is constant along each diagonal, and is determined entirely by its first row — there are $$n$$ free numbers, not $$n^2$$. A matrix of this shape is called **circulant**, and multiplying a vector by a circulant matrix is exactly a (circular) convolution with the kernel given by that first row.

<div class="insight-box">
<strong>Convolution was never a choice.</strong> We did not propose convolution and then observe that it is translation-equivariant. We demanded translation equivariance and convolution came out. Any other linear layer on a grid either fails to commute with shifts, or is a convolution wearing a different notation.
</div>

## Verified by exhaustion

The argument above is short enough to check completely on a small case. Take $$3 \times 3$$ matrices with entries in $$\{0,1\}$$ — there are $$2^9 = 512$$ of them — and test every one against the 3-cycle shift.

| | count |
|---|---|
| binary $$3\times3$$ matrices | 512 |
| that commute with the cyclic shift | **8** |
| of those, circulant | **8** |

Exactly 8, and every one of them circulant. That is $$2^3$$: one free binary value per diagonal, which is precisely the "determined by its first row" claim. Commuting with the shift and being a convolution are the same condition, with nothing in between.

A second check in the other direction: take a genuine circulant matrix, perturb a single entry, and it stops commuting. The property is rigid — it is not approximately satisfied by matrices that are approximately convolutions.

## What the theorem actually gives you

**Weight sharing.** The $$n^2 \to n$$ parameter reduction is not a compression heuristic. It is the dimension of the space of equivariant maps. There are no other equivariant linear layers to find.

**Locality is a separate assumption.** Translation equivariance alone gives you a *full-width* convolution — the first row can be dense. Restricting the kernel to a small window is an additional prior about how far interactions reach, imposed for efficiency and because it is usually true of images. Two constraints, often conflated: equivariance gives weight sharing, locality gives the small kernel. The [CNN chapter](/blog/basics/convolutions-and-cnns/) in Book 0 works through the consequences of the second one.

**Equivariance, then invariance.** Stacked convolutions keep the representation equivariant, so a feature that appears at a shifted location produces a shifted activation. Classification needs the shift gone entirely, and that is what global pooling supplies — the invariant readout the blueprint calls for at the end.

<div class="warning-box">
<strong>What you do not get.</strong> Translation is one group among many. A convolution is equivariant to shifts and to nothing else: rotate the input and the output does not rotate, it changes. Scale the input and the same. If your data has rotational or scale symmetry and you want the architecture to know it, translation equivariance will not supply it — you need a bigger group, which is what the <a href="/blog/gdl/groups-and-equivariance/">next chapter</a> builds.
</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>The requirement is one equation: \(LS = SL\), the layer commutes with the shift.</li>
  <li>Entrywise it forces \(L_{i,j} = L_{i-1,j-1}\) — constant along diagonals, so circulant, so a convolution.</li>
  <li>Verified exhaustively: of 512 binary \(3\times3\) matrices, exactly 8 commute with the cyclic shift and all 8 are circulant. Perturbing one entry of a circulant matrix breaks the property.</li>
  <li>Weight sharing is the dimension of the equivariant space, not a compression trick.</li>
  <li>Locality is a <em>separate</em> assumption. Equivariance alone permits a full-width kernel.</li>
  <li>A convolution is equivariant to translation and to nothing else — not rotation, not scale.</li>
</ul>
</div>

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv:2104.13478*.
- Joshi, C. K. (2025). [Transformers are Graph Neural Networks](https://arxiv.org/abs/2506.22084). *arXiv:2506.22084*.
