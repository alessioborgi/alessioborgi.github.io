---
layout: single
title: "Molecular GNNs: Learning on Atoms and Bonds"
categories: [gnn]
book: gnn
subsection: geometric
tags: [molecular, drug-discovery, SchNet, DimeNet, QM9, HOMO-LUMO]
published: true
excerpt: "Molecules are graphs. Molecular GNNs predict chemical properties from structure. The best models use 3D coordinates and bond angles — not just connectivity."
author_profile: true
read_time: true
is_overview: false
icon: "💊"
read_mins: 9
permalink: /blog/gnn/molecular-gnns/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> A molecule is a graph (atoms = nodes, bonds = edges). Molecular GNNs replace hand-crafted fingerprints with learned embeddings. The progression: 2D graphs (connectivity only) to 3D with distances (SchNet) to 3D with angles (DimeNet) to fully equivariant (EGNN, NequIP). Each step adds geometric information and improves accuracy on quantum chemistry benchmarks.
</div>
{% include figure image_path="/images/blog/gnn/schutt2017_schnet.png" alt="SchNet molecular GNN" caption="SchNet: continuous-filter convolutional neural network for molecular properties (Schütt et al., 2017)" %}


## Molecules as Graphs

A molecule $$G = (V, E, H, X)$$ where:
- $$V$$: atoms (carbon, oxygen, nitrogen, …)
- $$E$$: bonds (single, double, triple, aromatic)
- $$H = \{h_v\}$$: atom features (atomic number, charge, hybridisation, …)
- $$X = \{x_v\}$$ with $$x_v \in \mathbb{R}^3$$: 3D coordinates (from DFT calculations or conformer search)

The task: predict molecular properties from $$G$$. Properties include:
- **HOMO-LUMO gap** (electronic structure, relevant to photovoltaics)
- **Solubility** (pharmaceutical drug delivery)
- **Toxicity** (drug safety screening)
- **Binding affinity** (protein-drug interaction)
- **Dipole moment, polarisability** (material properties)

## From Fingerprints to GNNs

**Intuition First:** Morgan fingerprints work like a census of neighbourhoods. Each atom looks at the atoms within K bonds of it, hashes the whole pattern to a number, and reports that number. The GNN approach instead lets atoms *talk* to their neighbours iteratively — at round 1 atoms share their own identity, at round 2 they share what they heard from round 1, and so on. Unlike the fixed hash, GNN representations are learned end-to-end for the specific task, so they focus on the features that actually predict toxicity (or solubility, or binding), rather than encoding everything uniformly.

**Traditional approach — Morgan fingerprints (ECFP):**
- Encode each atom's K-hop neighbourhood as a hash
- Sum over all atoms → fixed-size bit vector
- Feed to SVM or random forest

**GNN approach:**
- Run K rounds of message passing → node embeddings encode K-hop neighbourhoods
- Global pooling → graph embedding
- MLP → property prediction

GNNs outperform fingerprints because they learn task-specific features rather than encoding all structural information uniformly.

## Level 1: 2D GNNs (Connectivity Only)

Standard GCN, GAT, or GIN on the molecular graph with:
- Node features: atomic number (one-hot), formal charge, number of Hs, hybridisation
- Edge features: bond type (single/double/triple/aromatic), is-conjugated, is-ring

**Examples:** MPNN (Gilmer et al., 2017), AttentiveFP.

**Limitation:** cannot distinguish stereoisomers (L-alanine and D-alanine have identical connectivity), and cannot represent any 3D quantity at all.

## Level 2: 3D Distance-Based (Invariant)

Add interatomic distances as edge features. Build a graph where all atoms within a cutoff distance $$r_c$$ are connected, not just bonded ones.

<div class="formula-box">
\[
m_{ij} = \phi\Big( h_i,\ h_j,\ \big\lVert x_i - x_j \big\rVert \Big)
\]
</div>

**SchNet (Schütt et al., 2017):** uses continuous-filter convolutions, with the filter generated from radial basis functions of the distance:

<div class="formula-box">
\[
h_i \;\leftarrow\; \sum_{j \in \mathcal{N}(i)} h_j \odot W\Big( \big\lVert x_i - x_j \big\rVert \Big)
\]
</div>

$$W$$ is a filter-generating network and $$\odot$$ is elementwise. Because distances are invariant under the full $$\mathrm{E}(3)$$ — rotations, translations *and* reflections — the model is $$\mathrm{E}(3)$$-invariant. Two consequences follow directly: it cannot output vector quantities, and it assigns enantiomers identical predictions.

**QM9 performance:** SchNet reaches chemical accuracy on several QM9 targets — notably the atomisation energies — at a small fraction of the cost of the DFT calculations that produced the labels.

## Level 3: Angular GNNs (Bond Angles)

Why are distances not enough? The careful statement matters here, because the loose one is false. A *complete* pairwise distance matrix does determine the geometry up to rigid motion and reflection, and therefore determines every bond angle. The problem is that models never see the complete matrix: they build a cutoff graph, keeping only distances below $$r_c$$. From that partial set the angles are genuinely not recoverable, and two different structures can produce identical cutoff-graph distance multisets. That gap — not some impossibility about distances in principle — is what angular models close. Note also what stays out of reach: bond angles are unsigned and reflection-invariant, so adding them does not make a model chirality-aware.

**DimeNet (Klicpera et al., 2020):** messages live on directed edges rather than nodes, and each edge message is updated using the angle it makes with adjacent incoming edges:

<div class="formula-box">
\[
m_{ji} \;\leftarrow\; f\Big( m_{ji},\ \sum_{k \in \mathcal{N}(j) \setminus \{i\}} g\big( m_{kj},\ \lVert x_{ji} \rVert,\ \theta_{kji} \big) \Big)
\]
</div>

$$\theta_{kji}$$ is the angle at $$j$$ between the edges $$ji$$ and $$jk$$; the exclusion $$k \ne i$$ prevents a message from immediately feeding back on itself. DimeNet uses spherical Bessel functions for the radial basis and spherical harmonics for the angular basis.

**SphereNet:** adds torsion (dihedral) angles — the angle between two planes defined by four atoms. Torsions are *signed*, and the sign flips under reflection, which is what finally makes chirality visible to the model. With distances, angles and torsions together, the local 3D geometry is fully specified.

<div class="insight-box">
<strong>Why angles matter:</strong> Two carbon atoms bonded to the same central atom at different angles (e.g., 90° vs 120°) experience very different bonding environments. The angle encodes hybridisation (sp³ = 109.5°, sp² = 120°, sp = 180°) and strain. Ignoring angles misses key chemical information.
</div>

## Level 4: Equivariant GNNs

Equivariant models process 3D positions as vectors, satisfying $$\Phi(\rho_{\text{in}}(g)x) = \rho_{\text{out}}(g)\Phi(x)$$ for $$\mathrm{E}(n)$$ or $$\mathrm{SE}(3)$$. They can predict both scalar properties (energy, with $$\rho_{\text{out}} = I$$) and vector properties (forces, with $$\rho_{\text{out}}(g) = Q$$) without violating symmetry.

**EGNN:** invariant distance-based messages plus equivariant coordinate updates. Simple, fast, effective for energies and forces; blind to chirality.

**NequIP:** TFN-style irrep features inside a message-passing network. Its headline result is data efficiency — competitive interatomic potentials from small training sets.

**MACE:** many-body interactions built from repeated tensor products. Among the strongest reported results on MD17-style force-field benchmarks.

<style>
@keyframes bar-grow {
  from { width: 0; }
  to   { width: var(--bar-w); }
}
</style>
<div class="blog-figure">
<figure>
<svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;">
  <text x="210" y="18" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">Prediction error by geometric level (schematic)</text>
  <!-- Axis -->
  <line x1="165" y1="30" x2="165" y2="185" stroke="#d1d5db" stroke-width="1"/>
  <line x1="165" y1="185" x2="405" y2="185" stroke="#d1d5db" stroke-width="1"/>
  <text x="285" y="200" text-anchor="middle" font-size="9" fill="#9ca3af">error (relative, lower = better)</text>

  <text x="160" y="52"  text-anchor="end" font-size="10" fill="#6b7280">Fingerprint + RF</text>
  <rect x="165" y="40"  height="18" width="200" fill="#ef4444" rx="2"><animate attributeName="width" from="0" to="200" dur="0.8s" fill="freeze"/></rect>
  <text x="370" y="52"  font-size="9" fill="#9ca3af">no geometry</text>

  <text x="160" y="82"  text-anchor="end" font-size="10" fill="#6b7280">MPNN (2D graph)</text>
  <rect x="165" y="70"  height="18" width="144" fill="#f97316" rx="2"><animate attributeName="width" from="0" to="144" dur="0.9s" fill="freeze"/></rect>
  <text x="314" y="82"  font-size="9" fill="#9ca3af">connectivity</text>

  <text x="160" y="112" text-anchor="end" font-size="10" fill="#6b7280">SchNet</text>
  <rect x="165" y="100" height="18" width="80"  fill="#f59e0b" rx="2"><animate attributeName="width" from="0" to="80"  dur="1.0s" fill="freeze"/></rect>
  <text x="250" y="112" font-size="9" fill="#9ca3af">+ distances</text>

  <text x="160" y="142" text-anchor="end" font-size="10" fill="#6b7280">DimeNet</text>
  <rect x="165" y="130" height="18" width="48"  fill="#10b981" rx="2"><animate attributeName="width" from="0" to="48"  dur="1.1s" fill="freeze"/></rect>
  <text x="218" y="142" font-size="9" fill="#9ca3af">+ angles</text>

  <text x="160" y="172" text-anchor="end" font-size="10" fill="#6b7280">Equivariant</text>
  <rect x="165" y="160" height="18" width="26"  fill="#3b82f6" rx="2"><animate attributeName="width" from="0" to="26"  dur="1.2s" fill="freeze"/></rect>
  <text x="196" y="172" font-size="9" fill="#9ca3af">+ vectors / tensors</text>
</svg>
<figcaption>Schematic only — bar lengths illustrate the direction of the trend, not measured values. Each additional level of geometric information tends to reduce error, but by how much depends heavily on the target and the dataset; consult the individual papers for figures on a specific benchmark.</figcaption>
</figure>
</div>

## Benchmarks

**QM9:** 134k small organic molecules (up to 9 heavy atoms). 12 quantum chemical properties (HOMO energy, LUMO energy, dipole moment, etc.) computed by DFT.

**MD17:** molecular dynamics trajectories. Predict energy and forces at each timestep. Tests generalisation to conformational space.

**OGB-molhiv / OGB-molpcba:** large-scale drug discovery benchmarks (41k/437k molecules).

**PDBbind:** protein-ligand binding affinity from crystal structures.

## Reading Benchmark Numbers

The usual way this progression is presented — a single column of QM9 errors, one row per model — is worth treating with care, and this post deliberately does not reproduce one.

Three reasons. QM9 has twelve targets with different units and different difficulty, so "the QM9 error" is not a well-defined quantity; a model can lead on dipole moment and trail on the HOMO-LUMO gap. Chemical accuracy is likewise target-dependent — it is conventionally 1 kcal/mol $$\approx 0.043$$ eV for energies, and quoting one threshold across all properties is a category error. And several of the strongest equivariant models, NequIP and MACE among them, were built and evaluated as *interatomic potentials* on MD17-style force-field tasks rather than on QM9 property regression, so placing them in the same column as SchNet or DimeNet compares numbers that were never measured on the same task.

What is robust is the ordering of *information*, which is the point the hierarchy is really making:

- connectivity alone cannot represent 3D structure
- distances add geometry but remain $$\mathrm{E}(3)$$-invariant, so no vector outputs and no chirality
- angles recover what a cutoff distance graph loses
- torsions add reflection sensitivity
- equivariant features add vector and higher-degree outputs

Each step strictly increases what the model can represent. How much accuracy that converts into is an empirical question, and the honest place to get the number is the paper reporting the specific target and split you care about.

## Summary

| Level | Geometry used | Key model | Symmetry | Can output vectors? |
|-------|-------------|-----------|----------|---------------------|
| 2D (connectivity) | None | MPNN, GIN | Permutation only | No |
| Distances | $$\lVert x_i - x_j \rVert$$ | SchNet | $$\mathrm{E}(3)$$-invariant | No |
| Distances + angles | $$\theta_{kji}$$ | DimeNet | $$\mathrm{E}(3)$$-invariant | No |
| + torsions | $$\varphi_{ijkl}$$ (signed) | SphereNet | $$\mathrm{SE}(3)$$-invariant | No |
| Full equivariance | 3D vectors, irreps | EGNN, NequIP, MACE | $$\mathrm{E}(n)$$ / $$\mathrm{E}(3)$$-equivariant | Yes |

For industrial drug discovery, 2D GNNs suffice for fast virtual screening. For physics-accurate property prediction and force fields — anywhere you need forces, not just energies — equivariant models are the only ones that can express the target at all.

## References

- Gilmer, J., Schoenholz, S. S., Riley, P. F., Vinyals, O., & Dahl, G. E. (2017). [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212). *ICML 2017* (MPNN: unified message passing framework for quantum chemistry, benchmarked on QM9).
- Schütt, K. T., Kindermans, P.-J., Sauceda Felix, H. E., Chmiela, S., Tkatchenko, A., & Müller, K.-R. (2017). [SchNet: A Continuous-Filter Convolutional Neural Network for Modeling Quantum Interactions](https://arxiv.org/abs/1706.08566). *NeurIPS 2017* (SchNet: continuous-filter convolutions over interatomic distances for E(3)-invariant molecular property prediction).
- Klicpera, J., Groß, J., & Günnemann, S. (2020). [Directional Message Passing for Molecular Graphs](https://arxiv.org/abs/2003.03123). *ICLR 2020* (DimeNet: directional message passing over bond angles, recovering angular structure that a cutoff-distance model loses — bond angles alone are still reflection-invariant).
- Liu, Y., Wang, L., Liu, M., Lin, Y., Zhang, X., Oztekin, B., & Ji, S. (2022). [Spherical Message Passing for 3D Molecular Graphs](https://arxiv.org/abs/2102.05013). *ICLR 2022* (SphereNet: extends DimeNet with torsion angles for full 3D geometry encoding).
