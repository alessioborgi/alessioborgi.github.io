---
layout: single
title: "SheafPool: Basis-Invariant Graph Readout for Sheaf Neural Networks"
date: 2026-05-27
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [sheafpool, sheaf-neural-networks, graph-classification, pooling, heterogeneous-graphs]
published: true
excerpt: "SheafPool solves a key missing piece in sheaf GNNs: graph-level pooling. Instead of averaging stalk vectors in arbitrary local bases, it aligns them into a shared canonical frame and builds a readout that is invariant to local basis changes."
author_profile: true
read_time: true
icon: "🧭"
read_mins: 5
permalink: /blog/sheaf/sheafpool/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 780px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .6rem; font-style: italic; }
.paper-preview img { width: min(100%, 560px); }
.tldr-box {
  background: linear-gradient(145deg,#e8fbfb,#dbeafe);
  border-left: 4px solid #0d9488;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
}
.tldr-box strong { color: #0f2a36; }
.paper-meta {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
  font-size: 0.93rem;
}
.paper-meta strong { color: #003E74; }
.insight-box {
  background: #fff7ed;
  border-left: 4px solid #f97316;
  border-radius: 8px;
  padding: .95rem 1.1rem;
  margin: 1.25rem 0;
}
.insight-box strong { color: #9a3412; }
.key-takeaways {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-top: 1.5rem;
}
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Sheaf GNNs can learn strong node representations, but graph classification still needs a basis-invariant readout. SheafPool aligns local stalk features before pooling, so the final graph embedding does not depend on arbitrary local frames.
</div>

<div class="paper-meta">
  <strong>Source paper:</strong> "Heterogeneous Sheaf Neural Networks" &nbsp;·&nbsp; arXiv:2409.08036<br>
  <strong>Context:</strong> SheafPool is introduced as the graph-level readout mechanism inside the HetSheaf framework.<br>
  <strong>Read:</strong>
  <a href="https://arxiv.org/abs/2409.08036" target="_blank" rel="noopener">📄 Paper</a>
  &nbsp;·&nbsp;
  <a href="/blog/sheaf/hetsheaf-paper/">🌿 HetSheaf blog post</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/hetsheaf-paper.png" alt="First page of the Heterogeneous Sheaf Neural Networks paper" caption="Paper preview — Heterogeneous Sheaf Neural Networks (Borgi et al., 2024)." %}
</div>

## The Problem: Pooling in Sheaf Models Is Not Ordinary Pooling

In a standard graph neural network, graph classification is conceptually simple: run message passing, get one embedding per node, then pool those embeddings with a sum, mean, or attention readout. That works because every node embedding lives in the same vector space.

In a sheaf neural network, this assumption breaks. Each node feature is not just a plain vector in one shared ambient space. It lives in a **local stalk**, which means it is represented in a node-specific coordinate frame. Even if all stalks have the same dimensionality, there is no canonical reason why the basis at node $u$ should line up with the basis at node $v$.

So naive pooling creates a real geometric bug: averaging stalk vectors directly can mix coordinates that mean different things in different local frames. The graph embedding then depends on arbitrary basis choices rather than only on the graph itself.

<div class="insight-box">
<strong>Why this is a serious issue:</strong> two sheaf representations that are mathematically equivalent up to local basis changes should produce the same graph-level prediction. If your pooling operator changes under those basis transformations, the classifier is learning the coordinate system as much as the graph.
</div>

## What SheafPool Tries to Preserve

The goal is not merely to compress node information. The goal is to compress it in a way that respects the **gauge structure** of the sheaf. A correct readout should be:

- **Permutation-invariant** across nodes, as any graph pooling should be.
- **Basis-invariant** across local stalk frames.
- **Expressive enough** to preserve graph-level differences after alignment.

That second requirement is the new one. It is what makes SheafPool different from ordinary mean/sum pooling and from most standard attention readouts.

## The Core Idea

SheafPool builds a graph embedding in stages:

1. **Whiten each stalk representation** so scale and covariance distortions are removed locally.
2. **Align stalks to a shared anchor frame** so residual rotational ambiguity is resolved consistently across nodes.
3. **Compute invariant attention weights** from channel-wise energies rather than basis-dependent raw coordinates.
4. **Pool the aligned stalks** into a receive-only graph token.
5. **Collapse the pooled token into graph features** using invariant channel-wise energies.

The big picture is simple: before you aggregate, make sure the quantities you aggregate are actually comparable.

<div class="blog-figure">
<figure>
<img src="/images/blog/papers/hetsheaf-sheafpool.png" alt="SheafPool architecture with whitening, anchor-guided alignment, invariant attention weights, stalk pooling, and invariant graph feature extraction">
<figcaption>Figure 1 — SheafPool first normalises each local stalk, then aligns residual frame ambiguity with a shared anchor, assigns invariant attention weights, pools the aligned stalks, and finally extracts graph-level features from invariant channel-wise energies. The whole point is to make graph readout independent of local basis choices.</figcaption>
</figure>
</div>

## Why Whitening and Alignment Are Both Needed

Whitening alone is not enough. It removes scale distortions and correlation structure, but it still leaves a residual orthogonal ambiguity: two whitened stalks can represent the same content under different rotations.

That is why the second step matters. SheafPool introduces an **anchor-guided alignment** procedure that maps each whitened stalk into a common reference frame. After this step, the vectors are not just normalised; they are oriented consistently enough to be aggregated meaningfully.

This is the key conceptual move in the method. SheafPool is not saying "pool better." It is saying: **alignment must happen before pooling**, otherwise graph-level classification in sheaf space is not properly defined.

## Why the Attention Weights Are Different

The attention mechanism inside SheafPool is also designed carefully. If the weights were computed directly from raw stalk coordinates, they would inherit the same basis dependence as naive pooling.

Instead, the paper builds attention weights from **invariant energies**. That way, the score assigned to a node depends on content that survives a local basis change. So both parts of the readout are protected:

- the **features being pooled** are aligned first;
- the **weights used to pool them** are themselves invariant.

That combination is what makes the readout genuinely geometric rather than just heuristic.

## What It Buys in Practice

In the HetSheaf paper, SheafPool is used for graph classification and yields a very large improvement over naive mean pooling. The gain is not a small optimization detail. It is evidence that graph-level sheaf learning needs a dedicated readout design rather than a borrowed GNN pooling trick.

The practical message is:

- sheaf models are naturally strong at node- and edge-level relational geometry;
- graph-level tasks need an additional mechanism to compare local stalk information consistently;
- SheafPool is that missing bridge.

## Why This Matters Beyond HetSheaf

SheafPool is important even outside heterogeneous graphs. Any future sheaf GNN that wants to do graph classification, graph retrieval, or graph-level reasoning faces the same problem: local stalk representations are not globally aligned by default.

So SheafPool should be read as more than one component in one paper. It is an answer to a general question in sheaf deep learning:

**What is the right graph-level readout when node features live in local geometric frames?**

That is why it is a useful concept to understand on its own.

## References

- Braithwaite, L., Borgi, A., Onorato, G., Tarantelli, K., Restuccia, F., Silvestri, F., & Liò, P. (2024). [Heterogeneous Sheaf Neural Networks](https://arxiv.org/abs/2409.08036).

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>SheafPool addresses a real geometric failure mode: naive pooling of stalk vectors is basis-dependent and therefore ill-defined.</li>
  <li>The method aligns local stalk representations into a shared canonical frame before aggregation.</li>
  <li>Its attention weights are also built from invariant quantities, not raw basis-dependent coordinates.</li>
  <li>SheafPool is the graph-level readout mechanism that makes sheaf-based graph classification principled.</li>
</ul>
</div>
