---
layout: single
title: "Topological Layers in Neural Networks: Differentiable TDA"
categories: [persistent-homology]
book: persistent-homology
subsection: ml-integration
tags: [topological-layer, differentiable-TDA, TopNet, PLLay, backpropagation, persistent-homology-gradient]
published: false
excerpt: "To train neural networks end-to-end with topological loss terms, we need to differentiate through the persistent homology computation. This post covers the gradient of persistence diagrams with respect to inputs (via sub-gradients through the reduction algorithm), differentiable vectorisations (PLLay, TopNet), and how to write a topological regulariser that encourages or discourages specific shape features during training."
author_profile: true
read_time: true
is_overview: false
icon: "🧠"
read_mins: 5
permalink: /blog/persistent-homology/topological-layers/
---
{% include figure image_path="/images/blog/tdl/hofer2020_topological_layers.png" alt="Topological layers in neural networks" caption="Topological layers for deep learning (Hofer et al., 2020)" %}

## Intuition First

Persistent homology tells you about loops, voids, and connected components in your data. But standard neural networks are oblivious to this — they cannot be penalised for "producing output with the wrong number of loops" unless you can **differentiate through the topology computation** and send gradients back through it.

The challenge: persistent homology is combinatorial. The persistence pairs come from a sorting and column-reduction procedure. How do you differentiate through a sort? The answer is that you do not differentiate through the sort itself — the **pairing is fixed** at any given input configuration. You only need to differentiate through the **filtration values** (the scalar function values attached to simplices), treating the combinatorial pairing structure as a constant.

This is the key insight behind all differentiable TDA: the topology (which pairs exist) changes discretely, but the birth and death values (how long each feature lives) vary smoothly with the input. Gradients flow through the birth/death values, not through the pairing decisions.

---

## Gradient of Persistence Diagrams

Let $f : K \to \mathbb{R}$ be a filtration function on a simplicial complex $K$ (e.g., the output of a neural network applied to each vertex). The persistence pairs $\{(b_i, d_i)\} = \{(f(\sigma_i), f(\tau_i))\}$ depend smoothly on $f$ **as long as no topological event (pairing change) occurs**.

**Theorem (Subgradient of persistence, Poulenard et al., 2018).** Let $\mathcal{L}(\text{Dgm}(f))$ be a loss on the persistence diagram. Then:

$$\frac{\partial \mathcal{L}}{\partial f(\sigma)} = \sum_{i : \sigma = \sigma_i} \frac{\partial \mathcal{L}}{\partial b_i} + \sum_{i : \sigma = \tau_i} \frac{\partial \mathcal{L}}{\partial d_i}$$

Each simplex $\sigma$ appears as the birth simplex of at most one pair and the death simplex of at most one pair. The gradient is therefore a sparse sum — at most two nonzero terms per simplex.

In practice, this means: once you have the persistence pairs from a forward pass, the backward pass through the diagram is $O(m)$ — as fast as a single linear layer.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The gradient of a persistence-based loss is <em>extremely sparse</em>. Only the simplices that are birth or death simplices of a persistence pair receive nonzero gradient. In a typical filtration, this is a tiny fraction of all simplices — most simplices are in apparent pairs that contribute nothing to the loss, and their gradients are zero. This makes topological regularisation computationally cheap once the pairs are known.</div>

---

## Architecture: End-to-End Topological Training

A standard differentiable TDA pipeline looks like this:

```
Input X
   │
   ▼
Neural network f_θ : X → scalar function on K
   │  (e.g., vertex-wise MLP, graph network, etc.)
   ▼
Persistent homology computation
   │  (forward: boundary matrix reduction)
   │  (backward: sparse gradient via pairing structure)
   ▼
Persistence diagram Dgm(f_θ(X))
   │
   ▼
Differentiable vectorisation
   │  (PersLay, persistence image layer, landscape layer)
   ▼
Task loss  +  Topological regulariser
   │
   ▼
Gradients back to θ
```

The key modules are the **PH computation** (forward only, outputs pairs) and the **differentiable vectorisation** (forward + backward, differentiable w.r.t. birth/death values).

---

## Animated: Gradient Flow Through a Topological Layer

<style>
@keyframes flowDown {
  0%   { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes flowUp {
  0%   { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes highlightBox {
  0%   { stroke: #e2e8f0; }
  50%  { stroke: #f97316; stroke-width: 2.5; }
  100% { stroke: #3b82f6; stroke-width: 2; }
}
.flow-fwd  { animation: flowDown 0.5s ease forwards; }
.flow-bwd  { animation: flowUp  0.5s ease forwards; }
.box-pulse { animation: highlightBox 1.5s ease forwards; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:440px;display:block;margin:auto;">

  <!-- Forward pass boxes -->
  <rect x="100" y="10"  width="200" height="36" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5" class="flow-fwd" style="animation-delay:0.1s"/>
  <text x="200" y="32" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">Input X</text>

  <line x1="200" y1="46" x2="200" y2="62" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="80"  y="62"  width="240" height="36" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5" class="flow-fwd" style="animation-delay:0.3s"/>
  <text x="200" y="84" text-anchor="middle" font-size="11" fill="#4c1d95" font-weight="bold">Neural network f_θ(X)</text>

  <line x1="200" y1="98" x2="200" y2="114" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="60"  y="114" width="280" height="50" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" class="box-pulse" style="animation-delay:0.5s"/>
  <text x="200" y="134" text-anchor="middle" font-size="11" fill="#78350f" font-weight="bold">PH computation</text>
  <text x="200" y="152" text-anchor="middle" font-size="9"  fill="#92400e">boundary matrix reduction → pairs {(b_i, d_i)}</text>

  <line x1="200" y1="164" x2="200" y2="180" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="70"  y="180" width="260" height="36" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5" class="flow-fwd" style="animation-delay:0.7s"/>
  <text x="200" y="202" text-anchor="middle" font-size="11" fill="#14532d" font-weight="bold">Differentiable vectorisation</text>

  <line x1="200" y1="216" x2="200" y2="232" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="90"  y="232" width="220" height="36" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5" class="flow-fwd" style="animation-delay:0.9s"/>
  <text x="200" y="254" text-anchor="middle" font-size="11" fill="#7f1d1d" font-weight="bold">Loss L = L_task + λ·L_topo</text>

  <!-- Backward pass arrow on right -->
  <path d="M 345 254 C 380 254, 380 32, 345 32" stroke="#f97316" stroke-width="2" fill="none"
        stroke-dasharray="6,3" marker-end="url(#arrorange)" class="flow-bwd" style="animation-delay:1.1s"/>
  <text x="388" y="150" font-size="10" fill="#ea580c" transform="rotate(90,388,150)">← gradients</text>

  <!-- PH layer annotation: sparse gradient -->
  <rect x="5" y="120" width="52" height="38" rx="4" fill="#fff7ed" stroke="#f97316" stroke-width="1"/>
  <text x="31" y="132" text-anchor="middle" font-size="8" fill="#ea580c">sparse</text>
  <text x="31" y="144" text-anchor="middle" font-size="8" fill="#ea580c">gradient</text>
  <text x="31" y="155" text-anchor="middle" font-size="8" fill="#ea580c">O(m)</text>
  <line x1="57" y1="139" x2="62" y2="139" stroke="#f97316" stroke-width="1" stroke-dasharray="2,1"/>

  <!-- Arrow markers -->
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#64748b"/>
    </marker>
    <marker id="arrorange" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#f97316"/>
    </marker>
  </defs>
</svg>
<figcaption>Forward pass (blue→green): network produces a filtration, PH extracts pairs, vectorisation maps to a vector, loss is computed. Backward pass (orange dashed): gradients flow back through vectorisation and the sparse PH gradient into the network weights.</figcaption>
</figure>
</div>

---

## Topological Regularisers

**Goal 1 — Encourage one prominent loop** (e.g., latent space of an autoencoder should have circular structure):

$$\mathcal{L}_{\text{topo}} = -\max_{i} (d_i^{H_1} - b_i^{H_1}) + \sum_{i \neq i^*} (d_i^{H_1} - b_i^{H_1})$$

Maximise the most persistent $H_1$ feature while penalising all others — encourages exactly one loop.

**Goal 2 — Push all $H_1$ bars to zero** (ensure simply-connected representation):

$$\mathcal{L}_{\text{topo}} = \sum_i (d_i^{H_1} - b_i^{H_1})^2$$

**Goal 3 — Match a target diagram** (shape supervision):

$$\mathcal{L}_{\text{topo}} = W_2(\text{Dgm}(f_\theta(X)),\, \text{Dgm}_{\text{target}})$$

This uses the 2-Wasserstein loss between diagrams — differentiable through the matching (the matching is fixed during the backward pass, so gradients flow only through the birth/death values of matched pairs).

---

## Key Methods

| Method | Vectorisation | Gradient mechanism |
|--------|--------------|-------------------|
| **TopoNet (Hofer et al., 2019)** | Learned sum of structure elements | Subgradient through PH pairs |
| **PLLay (Kim et al., 2020)** | Persistence landscape layer | Analytic piecewise-linear gradient |
| **PersLay (Carriere et al., 2020)** | General DeepSet-style layer | Autodiff through point operations |
| **DTM-based (Anai et al., 2020)** | DTM filtration | Smooth approximation of PH |
| **CubicalRipser** | Cubical PH for images | Gradient through pixel filtration values |

---

## Worked Example: Topological Autoencoder

The topological autoencoder (Moor et al., 2020) trains a standard autoencoder with an extra topological loss that enforces the latent space to have the **same persistence diagram** as the input space:

$$\mathcal{L} = \|X - \hat{X}\|^2 + \lambda \cdot W_2(\text{Dgm}(X),\, \text{Dgm}(Z))$$

where $Z$ is the latent representation. This encourages the encoder to be a topology-preserving map — loops in the input space appear as loops in the latent space.

In experiments on synthetic manifolds (sphere, torus, klein bottle), the topological autoencoder recovers the correct Betti numbers in the latent space, while standard autoencoders collapse topological structure.

---

## References

- Hofer, C. et al. (2019). *Learning representations of persistence barcodes.* JMLR.
- Carriere, M. et al. (2020). *PersLay: A neural network layer for persistence diagrams.* AISTATS.
- Kim, K. et al. (2020). *PLLay: Efficient topological layer based on persistence landscapes.* NeurIPS.
- Moor, M. et al. (2020). *Topological autoencoders.* ICML.
- Poulenard, A. et al. (2018). *Topological function optimization for continuous shape matching.* SGP.
