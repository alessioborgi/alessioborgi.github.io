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

<style>
@keyframes pipelineFlow {
  0%   { opacity:0.2; transform:translateX(-4px); }
  50%  { opacity:1;   transform:translateX(4px); }
  100% { opacity:0.2; transform:translateX(-4px); }
}
@keyframes stageAppear {
  0%   { opacity:0; transform:scaleY(0.5); }
  100% { opacity:1; transform:scaleY(1); }
}
.pipe-arrow { animation: pipelineFlow 1.6s ease-in-out infinite; }
.stage-box  { animation: stageAppear 0.5s ease-out both; }
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="max-width:560px;width:100%;font-family:sans-serif;">
  <text x="280" y="15" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">SheafPool Pipeline</text>

  <!-- Stage 1: Whiten -->
  <rect x="10" y="35" width="90" height="110" rx="8" fill="#dbeafe" stroke="#93c5fd" stroke-width="1.5" class="stage-box" style="animation-delay:0s;transform-origin:55px 90px;"/>
  <text x="55" y="58" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">Whiten</text>
  <!-- Ellipses becoming circles -->
  <ellipse cx="55" cy="85" rx="18" ry="11" fill="none" stroke="#93c5fd" stroke-width="1.5"/>
  <circle  cx="55" cy="115" r="11" fill="none" stroke="#1d4ed8" stroke-width="1.5"/>
  <text x="55" y="145" text-anchor="middle" font-size="8" fill="#3b82f6">ellipse → circle</text>
  <text x="55" y="155" text-anchor="middle" font-size="8" fill="#3b82f6">(remove covariance)</text>

  <!-- Arrow 1 -->
  <path d="M102 90 L118 90" stroke="#94a3b8" stroke-width="2" marker-end="url(#spArrow)" class="pipe-arrow" style="animation-delay:0.2s"/>

  <!-- Stage 2: Align -->
  <rect x="120" y="35" width="90" height="110" rx="8" fill="#fef3c7" stroke="#fcd34d" stroke-width="1.5" class="stage-box" style="animation-delay:0.3s;transform-origin:165px 90px;"/>
  <text x="165" y="58" text-anchor="middle" font-size="11" fill="#92400e" font-weight="bold">Align</text>
  <!-- Two arrows at different angles, then aligned -->
  <line x1="145" y1="100" x2="165" y2="80" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#spArrowY)"/>
  <line x1="185" y1="100" x2="165" y2="80" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#spArrowY)"/>
  <line x1="155" y1="120" x2="165" y2="102" stroke="#1d4ed8" stroke-width="1.5" marker-end="url(#spArrowB)" stroke-dasharray="3,2"/>
  <line x1="175" y1="120" x2="165" y2="102" stroke="#1d4ed8" stroke-width="1.5" marker-end="url(#spArrowB)" stroke-dasharray="3,2"/>
  <text x="165" y="145" text-anchor="middle" font-size="8" fill="#92400e">anchor frame</text>
  <text x="165" y="155" text-anchor="middle" font-size="8" fill="#92400e">(canonical orient.)</text>

  <!-- Arrow 2 -->
  <path d="M212 90 L228 90" stroke="#94a3b8" stroke-width="2" marker-end="url(#spArrow)" class="pipe-arrow" style="animation-delay:0.5s"/>

  <!-- Stage 3: Score -->
  <rect x="230" y="35" width="90" height="110" rx="8" fill="#fdf4ff" stroke="#d8b4fe" stroke-width="1.5" class="stage-box" style="animation-delay:0.6s;transform-origin:275px 90px;"/>
  <text x="275" y="58" text-anchor="middle" font-size="11" fill="#6b21a8" font-weight="bold">Score</text>
  <!-- Alpha labels -->
  <circle cx="258" cy="80" r="7" fill="#e9d5ff"/>
  <text x="258" y="83" text-anchor="middle" font-size="8" fill="#6b21a8">α₁</text>
  <circle cx="275" cy="95" r="7" fill="#e9d5ff"/>
  <text x="275" y="98" text-anchor="middle" font-size="8" fill="#6b21a8">α₂</text>
  <circle cx="292" cy="80" r="7" fill="#e9d5ff"/>
  <text x="292" y="83" text-anchor="middle" font-size="8" fill="#6b21a8">α₃</text>
  <text x="275" y="125" text-anchor="middle" font-size="8" fill="#6b21a8">invariant energy</text>
  <text x="275" y="135" text-anchor="middle" font-size="8" fill="#6b21a8">weights α_i = ||h_i'||²</text>

  <!-- Arrow 3 -->
  <path d="M322 90 L338 90" stroke="#94a3b8" stroke-width="2" marker-end="url(#spArrow)" class="pipe-arrow" style="animation-delay:0.8s"/>

  <!-- Stage 4: Pool -->
  <rect x="340" y="35" width="90" height="110" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5" class="stage-box" style="animation-delay:0.9s;transform-origin:385px 90px;"/>
  <text x="385" y="58" text-anchor="middle" font-size="11" fill="#166534" font-weight="bold">Pool</text>
  <!-- Multiple vectors collapsing to one -->
  <line x1="360" y1="75" x2="380" y2="95" stroke="#4ade80" stroke-width="1.5" marker-end="url(#spArrowG)"/>
  <line x1="375" y1="70" x2="383" y2="93" stroke="#4ade80" stroke-width="1.5" marker-end="url(#spArrowG)"/>
  <line x1="390" y1="70" x2="385" y2="93" stroke="#4ade80" stroke-width="1.5" marker-end="url(#spArrowG)"/>
  <line x1="405" y1="75" x2="388" y2="95" stroke="#4ade80" stroke-width="1.5" marker-end="url(#spArrowG)"/>
  <rect x="372" y="96" width="26" height="14" rx="3" fill="#15803d"/>
  <text x="385" y="107" text-anchor="middle" font-size="8" fill="white">z_G</text>
  <text x="385" y="130" text-anchor="middle" font-size="8" fill="#166534">graph token</text>
  <text x="385" y="140" text-anchor="middle" font-size="8" fill="#166534">(single vector)</text>

  <!-- Final output arrow -->
  <path d="M432 90 L450 90" stroke="#94a3b8" stroke-width="2" marker-end="url(#spArrow)" class="pipe-arrow" style="animation-delay:1.1s"/>

  <!-- Output label -->
  <rect x="452" y="60" width="98" height="60" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="501" y="82" text-anchor="middle" font-size="10" fill="#374151">Graph</text>
  <text x="501" y="95" text-anchor="middle" font-size="10" fill="#374151">Embedding</text>
  <text x="501" y="110" text-anchor="middle" font-size="9" fill="#64748b">basis-invariant</text>

  <!-- Arrowhead markers -->
  <defs>
    <marker id="spArrow"  markerWidth="7" markerHeight="7" refX="4" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8"/></marker>
    <marker id="spArrowY" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b"/></marker>
    <marker id="spArrowB" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1d4ed8"/></marker>
    <marker id="spArrowG" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#4ade80"/></marker>
  </defs>
</svg>
<figcaption>SheafPool pipeline with CSS transitions. Stage 1 (Whiten, blue): ellipses become circles, removing covariance distortion from each stalk. Stage 2 (Align, yellow): stalks in different frames are oriented to a common anchor frame. Stage 3 (Score, purple): invariant attention weights alpha_i = ||h_i'||^2 are computed from channel-wise energies. Stage 4 (Pool, green): aligned stalks are aggregated into a single basis-invariant graph token z_G.</figcaption>
</figure></div>

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — the coordinate-system analogy:</strong> Imagine pooling GPS coordinates from sensors in different countries, each using a different local coordinate system (one uses UTM Zone 30N, another uses a national grid rotated by 47°). If you average the raw coordinates, the result is meaningless — the average of metres-east in two incompatible frames is not a position anywhere. SheafPool is the mandatory coordinate-system conversion that must happen <em>before</em> any aggregation. Whitening removes the scale and covariance distortion (like converting all distances to metres), and anchor-guided alignment removes the rotational ambiguity (like choosing a common north direction). Only after both steps does averaging produce a meaningful pooled representation.</div>

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

## Numerical Example: d=2 Basis Invariance Step by Step

Consider two nodes with d=2 stalks before pooling:

- **h₁ = [2, 0]** (a vector pointing along the x-axis with magnitude 2)
- **h₂ = [0, 3]** (a vector pointing along the y-axis with magnitude 3)

**Step 1 — Whitening.** Whitening normalises each stalk by its own Euclidean norm (or covariance, depending on the implementation). Using norm-whitening: h₁' = h₁ / ||h₁|| = [2,0] / 2 = **[1, 0]**, and h₂' = h₂ / ||h₂|| = [0,3] / 3 = **[0, 1]**.

**Step 2 — Alignment.** The anchor frame is the identity I. Both [1,0] and [0,1] are already orthonormal, so they are in canonical form after alignment. No rotation is needed in this example.

**Step 3 — Invariant energies.** The channel-wise energy for each stalk is E_i = ||h_i'||². Since h₁' and h₂' are unit vectors: E₁ = ||[1,0]||² = **1** and E₂ = ||[0,1]||² = **1**.

**Step 4 — Graph representation.** The pooled graph feature vector is [E₁, E₂] = **[1, 1]**.

**Basis invariance check.** Now scale h₁ by 2: h₁_scaled = [4, 0]. After whitening: [4,0] / 4 = [1, 0] — the same unit vector as before. The invariant energy E₁ = 1 is unchanged. The graph embedding [1, 1] is identical. This demonstrates that SheafPool's readout is scale-invariant: doubling a stalk vector does not change the graph embedding, because the relevant information is the direction (captured by the whitened vector) not the magnitude.

**Why this matters.** Without whitening, the naive mean pool of h₁=[2,0] and h₂=[0,3] gives [1.0, 1.5] — while the naive mean of [4,0] and [0,3] gives [2.0, 1.5]. These are different graph embeddings for what is structurally the same graph under a local basis change. SheafPool eliminates this spurious dependence on local coordinate scale.

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
