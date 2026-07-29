---
layout: single
title: "Why Geometry Matters in Graph Neural Networks"
categories: [gnn]
book: gnn
subsection: geometric
tags: [geometry, 3D, molecular, coordinates, symmetry]
published: true
excerpt: "Many real-world graphs are embedded in 3D space — molecules, proteins, point clouds, crystal structures. Standard GNNs ignore coordinates and only use connectivity. Geometric GNNs incorporate spatial positions and must respect physical symmetries."
author_profile: true
read_time: true
is_overview: false
icon: "🔮"
read_mins: 7
permalink: /blog/gnn/why-geometry-matters-gnns/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> A molecule is not just a graph of atoms and bonds — it is a 3D geometric object. The same chemical formula with different 3D arrangements (stereoisomers) can have completely different properties. A GNN that ignores 3D coordinates cannot distinguish them. Geometric GNNs incorporate position data while respecting the symmetries of 3D space.
</div>
{% include figure image_path="/images/blog/gnn/satorras2021_egnn.png" alt="Geometric structure in molecules" caption="E(n) Equivariant GNN captures 3D molecular geometry (Satorras et al., 2021)" %}


## The Geometric Setting

**Intuition First:** Imagine you have a molecular model kit. You can describe the connectivity — carbon bonded to two oxygens — without saying *how* those bonds are arranged in 3D space. But a flat (180°) CO₂ and a bent (120°) arrangement have wildly different properties. Standard GNNs only read the assembly instructions; geometric GNNs also read the 3D blueprint.

<style>
@keyframes mol-rotate {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fade-label {
  0%,100% { opacity:0.4; }
  50%      { opacity:1.0; }
}
</style>
<div class="blog-figure">
<figure>
<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:400px;display:block;margin:0 auto;">
  <!-- L-alanine (left) -->
  <text x="100" y="18" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">L-Alanine</text>
  <line x1="100" y1="60" x2="70"  y2="100" stroke="#6b7280" stroke-width="2"/>
  <line x1="100" y1="60" x2="130" y2="100" stroke="#6b7280" stroke-width="2"/>
  <line x1="100" y1="60" x2="100" y2="30"  stroke="#6b7280" stroke-width="2"/>
  <line x1="100" y1="60" x2="135" y2="55"  stroke="#6b7280" stroke-width="2"/>
  <circle cx="100" cy="60"  r="14" fill="#3b82f6"/>
  <circle cx="70"  cy="105" r="11" fill="#ef4444"/>
  <circle cx="130" cy="105" r="11" fill="#10b981"/>
  <circle cx="100" cy="26"  r="10" fill="#8b5cf6"/>
  <circle cx="140" cy="53"  r="9"  fill="#f59e0b"/>
  <text x="100" y="64"  text-anchor="middle" font-size="10" fill="white" font-weight="bold">C</text>
  <text x="70"  y="109" text-anchor="middle" font-size="9"  fill="white">NH₂</text>
  <text x="130" y="109" text-anchor="middle" font-size="9"  fill="white">COOH</text>
  <text x="100" y="30"  text-anchor="middle" font-size="9"  fill="white">CH₃</text>
  <text x="140" y="57"  text-anchor="middle" font-size="9"  fill="white">H</text>
  <text x="100" y="150" text-anchor="middle" font-size="10" fill="#10b981">✓ Biologically active</text>
  <!-- D-alanine (right) — mirror image -->
  <text x="300" y="18" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">D-Alanine</text>
  <line x1="300" y1="60" x2="330" y2="100" stroke="#6b7280" stroke-width="2"/>
  <line x1="300" y1="60" x2="270" y2="100" stroke="#6b7280" stroke-width="2"/>
  <line x1="300" y1="60" x2="300" y2="30"  stroke="#6b7280" stroke-width="2"/>
  <line x1="300" y1="60" x2="265" y2="55"  stroke="#6b7280" stroke-width="2"/>
  <circle cx="300" cy="60"  r="14" fill="#3b82f6"/>
  <circle cx="330" cy="105" r="11" fill="#ef4444"/>
  <circle cx="270" cy="105" r="11" fill="#10b981"/>
  <circle cx="300" cy="26"  r="10" fill="#8b5cf6"/>
  <circle cx="260" cy="53"  r="9"  fill="#f59e0b"/>
  <text x="300" y="64"  text-anchor="middle" font-size="10" fill="white" font-weight="bold">C</text>
  <text x="330" y="109" text-anchor="middle" font-size="9"  fill="white">NH₂</text>
  <text x="270" y="109" text-anchor="middle" font-size="9"  fill="white">COOH</text>
  <text x="300" y="30"  text-anchor="middle" font-size="9"  fill="white">CH₃</text>
  <text x="260" y="57"  text-anchor="middle" font-size="9"  fill="white">H</text>
  <text x="300" y="150" text-anchor="middle" font-size="10" fill="#ef4444">✗ Inactive (mirror)</text>
  <!-- Mirror line -->
  <line x1="200" y1="20" x2="200" y2="155" stroke="#d1d5db" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="200" y="172" text-anchor="middle" font-size="10" fill="#9ca3af">Same connectivity — opposite chirality → different biology</text>
</svg>
<figcaption>Stereoisomers: identical bond graph, completely different 3D structure and biological activity. A connectivity-only GNN gives them the same embedding.</figcaption>
</figure>
</div>

Consider a molecule modelled as a graph $$G = (V, E, H, X)$$:
- $$V$$: atoms (nodes), $$E$$: bonds (edges), $$H = \{h_v\}$$: atomic features (atom type, charge)
- $$X = \{x_v\}$$ with $$x_v \in \mathbb{R}^3$$: the 3D coordinate of each atom

Standard GNNs use only $$(V, E, H)$$ and ignore $$X$$. This loses crucial information:

**Stereoisomers:** molecules with the same atoms and bonds but different 3D arrangement. L-alanine and D-alanine are mirror images — identical connectivity, different biological activity. A GNN without 3D coordinates assigns them the same embedding; so, as it happens, does any model built purely from interatomic distances, since distances survive reflection unchanged.

**Conformation:** proteins fold into specific 3D shapes that determine their function. Two proteins with the same sequence but different folds (conformers) have different biological roles — invisible to connectivity-only GNNs.

**Distances and angles:** in chemistry, reaction rates depend on bond angles and dihedral angles — geometric properties that cannot be inferred from connectivity alone.

## The Symmetry Problem

3D coordinates are not unique to a molecule. Writing $$g$$ for a symmetry transformation acting on coordinates as $$x_v \mapsto Q x_v + t$$:
- **Translation** ($$t$$): moving the molecule in space leaves chemistry unchanged
- **Rotation** ($$Q$$ with $$\det Q = +1$$): rotating the molecule leaves chemistry unchanged
- **Reflection** ($$Q$$ with $$\det Q = -1$$): mirroring leaves *most* scalar properties unchanged, but swaps enantiomers, and those can differ biologically

Rotations plus translations form $$\mathrm{SE}(3)$$; adding reflections gives $$\mathrm{E}(3)$$. Which one you want is a modelling decision, not a detail: an $$\mathrm{E}(3)$$-invariant model is *by construction* unable to tell L-alanine from D-alanine, because it assigns mirror images the same output. If chirality matters for your target, you want $$\mathrm{SE}(3)$$ and features that change sign under reflection.

**Failure mode:** naive addition of coordinates to node features gives the model different inputs for the same molecule in different orientations. The model must learn the symmetry from data — requiring training examples covering all orientations, and even then only approximately.

## Invariance vs Equivariance

Let $$\Phi$$ be the network, $$g$$ a group element, and $$\rho(g)$$ the representation of $$g$$ — the concrete matrix by which $$g$$ acts on a given space.

**Invariant:** the output does not move at all when the input is transformed.

<div class="formula-box">
\[
\Phi\big( \rho(g)\, x \big) = \Phi(x) \qquad \text{for all } g \in G
\]
</div>

For graph-level scalar properties (energy, solubility): the property is invariant. Rotating the molecule doesn't change its energy.

**Equivariant:** the output transforms too, under the group's action on the *output* space, which need not be the same as its action on the input space.

<div class="formula-box">
\[
\Phi\big( \rho_{\text{in}}(g)\, x \big) = \rho_{\text{out}}(g)\, \Phi(x) \qquad \text{for all } g \in G
\]
</div>

For node-level vector properties (forces, velocities): the property is equivariant with $$\rho_{\text{out}}(g) = Q$$. Rotate the molecule and the forces rotate with it.

Invariance is the special case $$\rho_{\text{out}}(g) = I$$ for every $$g$$ — the trivial representation. Writing both with $$\rho_{\text{in}}$$ and $$\rho_{\text{out}}$$ made explicit is worth the extra symbols, because "$$\Phi(g x) = g \Phi(x)$$" hides the fact that the two $$g$$'s act on different spaces and are generally different matrices.

<div class="insight-box">
<strong>Why you need both:</strong> In molecular dynamics simulations, you need to predict both energy (invariant — a scalar) and forces (equivariant — 3D vectors). An equivariant force field model outputs forces that automatically rotate with the molecule — no data augmentation needed, no invariance violation possible.
</div>

## What Standard GNNs Cannot Do

| Task | Requires | Standard GNN |
|------|---------|-------------|
| Distinguish stereoisomers | Reflection-sensitive 3D features | Cannot |
| Predict 3D forces | Equivariant vectors ($$\rho_{\text{out}}(g) = Q$$) | Cannot |
| Learn protein structure | 3D coordinates + symmetry | Cannot |
| Model crystal symmetry | Space group symmetry | Cannot |
| Point cloud processing | 3D position | Cannot |

## What Geometric GNNs Add

Three levels of geometric sophistication:

**Level 1: Distance-based (invariant)**
Add interatomic distances $$\lVert x_u - x_v \rVert$$ as edge features. Distances are unchanged by translation, rotation *and* reflection, so such a model is $$\mathrm{E}(3)$$-invariant. Two consequences: it cannot predict vector quantities at all, and it cannot distinguish enantiomers.

**Level 2: Angle-based (richer invariant)**
Add angles between bond triplets $$(u, v, w)$$ and dihedral angles $$(u, v, w, z)$$. DimeNet and SphereNet operate at this level. Bond angles are still reflection-invariant; it is the *signed* dihedral angle that flips sign under reflection, which is why torsions — not angles — are what buy you chirality sensitivity.

**Level 3: Equivariant (full 3D)**
Process 3D vectors as vectors — not just their magnitudes. EGNN, SE(3)-Transformers, NequIP, MACE operate at this level.

## Real Applications

**Drug discovery:** predict binding affinity, toxicity, ADMET properties from 3D molecular structure.

**Protein structure prediction:** model protein folding and protein-protein interaction geometry.

**Materials science:** predict crystal properties (band gap, stability) from atomic positions in unit cell.

**Robotics:** process point cloud sensor data while maintaining rotational equivariance.

**Particle physics:** predict particle interaction properties with detector geometry.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Every symmetry you bake into the architecture is one fewer thing the model needs to learn from data. A rotation-invariant model trained on one molecular orientation generalises to all orientations for free, exactly and not approximately. That is a real reduction in what has to be learned from data, and it shows up as better sample efficiency on molecular benchmarks — though how much depends heavily on the task, and it is not a fixed multiplier.</div>

## Summary

Adding geometry to GNNs is not optional for applications where 3D structure matters. The challenge is doing so while respecting the symmetries of 3D space — translation, rotation, and (depending on the target) reflection. State which group you actually want: $$\mathrm{E}(3)$$ invariance is the right default for energies, but it forecloses chirality by construction. The subsequent posts in this section cover the architectures (EGNN, SE(3)-Transformers, TFN) that build these constraints in systematically.

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv 2021* (the unifying geometric deep learning blueprint: symmetry groups, equivariance, and the 5G framework).
- Schütt, K. T., Kindermans, P.-J., Sauceda Felix, H. E., Chmiela, S., Tkatchenko, A., & Müller, K.-R. (2017). [SchNet: A Continuous-Filter Convolutional Neural Network for Modeling Quantum Interactions](https://arxiv.org/abs/1706.08566). *NeurIPS 2017* (SchNet: distance-based interaction filters for molecular property prediction).
- Klicpera, J., Groß, J., & Günnemann, S. (2020). [Directional Message Passing for Molecular Graphs](https://arxiv.org/abs/2003.03123). *ICLR 2020* (DimeNet: directional message passing over bond angles, recovering angular information that a cutoff-graph distance model cannot — though bond angles alone remain reflection-invariant).
