---
layout: single
title: "The Hardware Lottery: Why the Dense Version Won"
date: 2026-08-04
categories: [gdl]
book: gdl
subsection: systems
tags: [hardware-lottery, scaling, attention, sparse, geometric-deep-learning]
published: true
is_overview: false
excerpt: "Message passing on a sparse graph does asymptotically less work than attention over every pair. It is still the slower one to train. This chapter is about why the architecture that wins is the one your hardware happens to like."
author_profile: true
read_time: true
icon: "🎰"
read_mins: 6
permalink: /blog/gdl/the-hardware-lottery/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> The <a href="/blog/gdl/transformers-are-gnns/">previous chapter</a> established that Transformers and GNNs compute the same thing on different graphs. This one asks why one of them took over. Attention compares every pair — asymptotically <em>more</em> work than sparse message passing — but expresses that work as dense matrix multiplication, which modern accelerators are built for. Sparse message passing needs gather and scatter over a neighbour index, which they are not. The winner was decided by hardware, not by mathematics.
</div>

## The dense formulation

Self-attention over a whole input is three matrix multiplications and a softmax:

<div class="formula-box">
\[
\tilde{H}^{\ell} = \operatorname{softmax}\Bigl( H^{\ell} W_Q^{\ell} \bigl( H^{\ell} W_K^{\ell} \bigr)^{\top} \Bigr) \bigl( H^{\ell} W_V^{\ell} \bigr).
\]
</div>

No loops, no indices, no per-node branching. Multi-head parallelises the same way: do one projection for all heads at once, then reshape queries, keys and values to $$n \times k \times d/k$$. Everything after attention is token-wise and therefore trivially parallel.

Sparse message passing cannot be written like that. You maintain an index of neighbours, **gather** the source features for every edge, apply the message function, then **scatter-add** the results back to destination nodes. The access pattern is irregular by construction, memory-bound rather than compute-bound, and hostile to the wide, regular pipelines a GPU or TPU is built around.

## The asymptotics say the opposite

Here is the tension, made concrete. Attention compares $$n^2$$ pairs. Message passing on a graph of average degree $$k$$ handles $$nk$$ directed messages.

| nodes $$n$$ | attention pairs $$n^2$$ | messages at $$k = 10$$ | ratio |
|---|---|---|---|
| 100 | 10,000 | 1,000 | 10× |
| 1,000 | 1,000,000 | 10,000 | 100× |
| 10,000 | 100,000,000 | 100,000 | 1,000× |
| 1,000,000 | $$10^{12}$$ | $$10^{7}$$ | 100,000× |

Sparse message passing does dramatically **less arithmetic**, and the gap widens without bound. On operation count it is not close.

<div class="insight-box">
<strong>And yet the dense one is faster to train at the scales people actually use.</strong> That is the whole phenomenon. Let \(C\) be how many times more <em>throughput</em> a dense matmul achieves per arithmetic operation than gather-scatter. Dense wins while \(n^2 &lt; C \cdot nk\), i.e. while
<div class="formula-box">
\[
n \;&lt;\; C \, k .
\]
</div>
The crossover is linear in both the hardware constant and the graph's density. For a sparse graph with \(k\) around 10 and a large \(C\), that threshold sits in the thousands of nodes — which is above most sequence lengths and most molecular graphs, and far below a billion-node social network. I am not giving a number for \(C\): it depends on hardware, kernel and precision, and the source paper reports none. The <em>shape</em> of the trade-off is the point.
</div>

This explains the exception the argument always carries: for very sparse or billion-scale graphs, message passing remains the only option. There, $$n \gg Ck$$ and no constant factor rescues $$n^2$$.

## The hardware lottery

Sara Hooker's term for this: a research idea wins partly on merit and partly because it happens to fit the hardware available when it arrives. Ideas that need hardware nobody built lose, whatever their intrinsic quality — and the loss looks like the idea being wrong rather than being early.

Transformers are the clean case. Attention was not selected because it does less work — it does more. It was selected because its work is shaped like the operation accelerators execute best, and because that shape kept paying off as models and datasets grew.

This connects to Sutton's *bitter lesson*: methods that scale with compute tend to beat methods that encode human insight about the problem. A GNN's sparse graph *is* encoded insight — a claim that these entities interact and those do not. A Transformer declines to make that claim and learns which pairs matter. When compute is scarce the encoded insight is valuable; when compute is abundant, learning it beats asserting it.

<div class="warning-box">
<strong>Two things this argument does not establish.</strong>

First, that structure is worthless. There is empirical evidence Transformers can <em>learn</em> the inductive biases GNNs hard-code — locality especially — when trained at sufficient scale and given positional encodings as hints. "Can learn given enough data and compute" is not "is better to learn"; on small scientific datasets the encoded prior is often still the better trade.

Second, that the lottery is permanent. It is a statement about current accelerators. Hardware with better sparse support, or graphs large enough to make \(n^2\) impossible, changes the arithmetic — and the equivalence from the previous chapter means the <em>model</em> need not change at all, only which implementation of the same operator you run.
</div>

## What to take from it

Practically: if your graph is small or dense, run attention with a mask and get the fast kernel for free. If it is large and sparse, message passing is not a legacy choice, it is the only feasible one. The [equivalence](/blog/gdl/transformers-are-gnns/) means this is an implementation decision, not an architectural commitment.

Conceptually, this is the honest ending to the geometric deep learning story. The blueprint tells you which architectures *respect your data's symmetry*. It is silent on which will run fast, and that silence turned out to determine what the field actually adopted. Both facts are worth holding at once: the mathematics unified these architectures, and the hardware picked a winner among them anyway.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Attention is three dense matmuls and a softmax — no indices, no branching, and multi-head parallelises by reshaping to \(n \times k \times d/k\).</li>
  <li>Sparse message passing needs gather and scatter over a neighbour index: irregular, memory-bound, and poorly matched to current accelerators.</li>
  <li>Attention does asymptotically <em>more</em> arithmetic — \(n^2\) pairs against \(nk\) messages, a 1,000× gap at \(n = 10^4, k = 10\) — and is still faster to train at typical scales.</li>
  <li>Dense wins while \(n &lt; Ck\), linear in the hardware constant and the graph's density. Above that, sparsity is the only option.</li>
  <li>The hardware lottery: architectures win partly because they fit the hardware of their moment. Attention's advantage is the <em>shape</em> of its computation, not the amount.</li>
  <li>None of this shows structure is worthless, or that the outcome is permanent — and by the equivalence, changing implementation does not require changing the model.</li>
</ul>
</div>

## References

- Joshi, C. K. (2025). [Transformers are Graph Neural Networks](https://arxiv.org/abs/2506.22084). *arXiv:2506.22084*.
- Hooker, S. (2021). [The Hardware Lottery](https://arxiv.org/abs/2009.06489). *Communications of the ACM*.
- Sutton, R. (2019). The Bitter Lesson. *Incomplete Ideas* (blog).
- Fey, M., & Lenssen, J. E. (2019). [Fast Graph Representation Learning with PyTorch Geometric](https://arxiv.org/abs/1903.02428). *ICLR Workshop on Representation Learning on Graphs and Manifolds*.
- Jaegle, A., Borgeaud, S., Alayrac, J.-B., Doersch, C., Ionescu, C., et al. (2021). [Perceiver IO: A General Architecture for Structured Inputs & Outputs](https://arxiv.org/abs/2107.14795). *arXiv:2107.14795*.
