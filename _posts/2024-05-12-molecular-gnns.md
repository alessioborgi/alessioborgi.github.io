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
read_mins: 5
permalink: /blog/gnn/molecular-gnns/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A molecule is a graph (atoms = nodes, bonds = edges). Molecular GNNs replace hand-crafted fingerprints with learned embeddings. The progression: 2D graphs (connectivity only) to 3D with distances (SchNet) to 3D with angles (DimeNet) to fully equivariant (EGNN, NequIP). Each step adds geometric information and improves accuracy on quantum chemistry benchmarks.
</div>
{% include figure image_path="/images/blog/gnn/schutt2017_schnet.png" alt="SchNet molecular GNN" caption="SchNet: continuous-filter convolutional neural network for molecular properties (Schütt et al., 2017)" %}


## Molecules as Graphs

A molecule G = (V, E, X, R) where:
- V: atoms (carbon, oxygen, nitrogen, ...)
- E: bonds (single, double, triple, aromatic)
- X: atom features (atomic number, charge, hybridisation, ...)
- R ∈ ℝ^{N×3}: 3D coordinates (from DFT calculations or conformation search)

The task: predict molecular properties from G. Properties include:
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

**Limitation:** cannot distinguish stereoisomers (L-alanine vs D-alanine have identical connectivity). Missing 3D information.

## Level 2: 3D Distance-Based (Invariant)

Add interatomic distances as edge features. Build a graph where all atoms within cutoff distance r_c are connected (not just bonded atoms).

<div class="math-box">
m_{ij} = φ( h_i, h_j, ||r_i - r_j|| )
</div>

**SchNet (Schütt et al., 2017):** uses continuous-filter convolutions based on radial basis functions of distance:

<div class="math-box">
h_i ← Σ_j h_j · W( ||r_i - r_j|| )
</div>

Where W is a distance-dependent filter network. This achieves rotational invariance (distances are invariant) but cannot detect angles.

**QM9 performance:** SchNet achieves chemical accuracy on several QM9 targets (energy, HOMO energy, LUMO energy) — competitive with DFT at orders-of-magnitude less compute.

## Level 3: Angular GNNs (Bond Angles)

Adding interatomic distances is not sufficient — two conformers can have identical pairwise distance matrices but different angles. DimeNet incorporates angles between bond triplets.

**DimeNet (Klicpera et al., 2020):** messages are defined over directed edges (not just nodes), including the angle between edges:

<div class="math-box">
m_{ji} ← AGG_{k ∈ N(j)} φ( m_{kj}, ||r_{ji}||, θ_{kji} )
</div>

Where θ_{kji} is the angle at j between bonds ji and jk. DimeNet uses Bessel functions for radial features and spherical harmonics for angular features.

**SphereNet:** adds dihedral angles (torsions) — the angle between two planes defined by four atoms. This completes the geometric description of local 3D structure.

<div class="insight-box">
<strong>Why angles matter:</strong> Two carbon atoms bonded to the same central atom at different angles (e.g., 90° vs 120°) experience very different bonding environments. The angle encodes hybridisation (sp³ = 109.5°, sp² = 120°, sp = 180°) and strain. Ignoring angles misses key chemical information.
</div>

## Level 4: Equivariant GNNs

Equivariant models process 3D positions as vectors, maintaining E(n) or SE(3) equivariance. They can predict both scalar properties (energy) and vector properties (forces) without violating symmetry.

**EGNN:** distance-based messages + equivariant coordinate updates. Simple, fast, effective for energy prediction.

**NequIP:** TFN-style tensor features + message passing. State-of-the-art for force fields with few training points.

**MACE:** many-body interactions. Current SOTA on MD17 molecular dynamics benchmark.

<style>
@keyframes bar-grow {
  from { width: 0; }
  to   { width: var(--bar-w); }
}
</style>
<div class="blog-figure">
<figure>
<svg viewBox="0 0 420 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;">
  <text x="210" y="18" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">HOMO-LUMO Gap Error on QM9 (eV, lower = better)</text>
  <!-- Axis -->
  <line x1="165" y1="30" x2="165" y2="185" stroke="#d1d5db" stroke-width="1"/>
  <line x1="165" y1="185" x2="405" y2="185" stroke="#d1d5db" stroke-width="1"/>
  <!-- Labels + bars -->
  <!-- Morgan RF: 0.50 eV → 200px wide (scale: 400px = 0.50 eV) -->
  <text x="160" y="52"  text-anchor="end" font-size="10" fill="#6b7280">Morgan+RF</text>
  <rect x="165" y="40"  height="18" width="200" fill="#ef4444" rx="2"><animate attributeName="width" from="0" to="200" dur="0.8s" fill="freeze"/></rect>
  <text x="370" y="52"  font-size="9" fill="#374151">0.50</text>

  <text x="160" y="82"  text-anchor="end" font-size="10" fill="#6b7280">MPNN (2D)</text>
  <rect x="165" y="70"  height="18" width="144" fill="#f97316" rx="2"><animate attributeName="width" from="0" to="144" dur="0.9s" fill="freeze"/></rect>
  <text x="314" y="82"  font-size="9" fill="#374151">0.18</text>

  <text x="160" y="112" text-anchor="end" font-size="10" fill="#6b7280">SchNet</text>
  <rect x="165" y="100" height="18" width="56"  fill="#f59e0b" rx="2"><animate attributeName="width" from="0" to="56"  dur="1.0s" fill="freeze"/></rect>
  <text x="226" y="112" font-size="9" fill="#374151">0.07</text>

  <text x="160" y="142" text-anchor="end" font-size="10" fill="#6b7280">DimeNet</text>
  <rect x="165" y="130" height="18" width="40"  fill="#10b981" rx="2"><animate attributeName="width" from="0" to="40"  dur="1.1s" fill="freeze"/></rect>
  <text x="210" y="142" font-size="9" fill="#374151">0.05</text>

  <text x="160" y="172" text-anchor="end" font-size="10" fill="#6b7280">NequIP/MACE</text>
  <rect x="165" y="160" height="18" width="16"  fill="#3b82f6" rx="2"><animate attributeName="width" from="0" to="16"  dur="1.2s" fill="freeze"/></rect>
  <text x="186" y="172" font-size="9" fill="#374151">0.02</text>

  <!-- Chemical accuracy line -->
  <line x1="197" y1="30" x2="197" y2="185" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="199" y="28" font-size="9" fill="#8b5cf6">chem. accuracy (0.04 eV)</text>
</svg>
<figcaption>HOMO-LUMO gap prediction error by model level. Each step down the geometric hierarchy roughly halves the error.</figcaption>
</figure>
</div>

## Benchmarks

**QM9:** 134k small organic molecules (up to 9 heavy atoms). 12 quantum chemical properties (HOMO energy, LUMO energy, dipole moment, etc.) computed by DFT.

**MD17:** molecular dynamics trajectories. Predict energy and forces at each timestep. Tests generalisation to conformational space.

**OGB-molhiv / OGB-molpcba:** large-scale drug discovery benchmarks (41k/437k molecules).

**PDBbind:** protein-ligand binding affinity from crystal structures.

## The Accuracy Progression on QM9 (HOMO-LUMO gap)

```
Morgan fingerprint + RF:  ~0.5 eV
MPNN (2D):                ~0.18 eV
SchNet (distance):        ~0.07 eV
DimeNet (angles):         ~0.05 eV
SphereNet (dihedrals):    ~0.03 eV
NequIP (equivariant):     ~0.02 eV
MACE (many-body):         ~0.01 eV  (near DFT accuracy)
```

Each geometric level roughly halves the error. Chemical accuracy is ~0.04 eV — equivariant models are within or below this threshold.

## Summary

| Level | Geometry used | Key model | QM9 error |
|-------|-------------|-----------|-----------|
| 2D (connectivity) | None | MPNN, GIN | ~0.18 eV |
| Distances | ||r_ij|| | SchNet | ~0.07 eV |
| Distances + angles | θ_{ijk} | DimeNet | ~0.05 eV |
| Distances + angles + dihedrals | φ_{ijkl} | SphereNet | ~0.03 eV |
| Full equivariance | 3D vectors | NequIP, MACE | ~0.01 eV |

For industrial drug discovery, 2D GNNs suffice for fast virtual screening. For physics-accurate property prediction and force fields, equivariant models are the only option.

## References

- Gilmer, J., Schütt, K. T., Ramsundar, B., Ramakrishnan, R., Bronskill, M., Gomes, C., & Dahl, G. E. (2017). [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212). *ICML 2017* (MPNN: unified message passing framework for quantum chemistry, benchmarked on QM9).
- Schütt, K. T., Kindermans, P.-J., Sauceda Felix, H. E., Chmiela, S., Tkatchenko, A., & Müller, K.-R. (2017). [SchNet: A Continuous-Filter Convolutional Neural Network for Modeling Quantum Interactions](https://arxiv.org/abs/1706.08566). *NeurIPS 2017* (SchNet: continuous-filter convolutions over interatomic distances for E(3)-invariant molecular property prediction).
- Klicpera, J., Groß, J., & Günnemann, S. (2020). [Directional Message Passing for Molecular Graphs](https://arxiv.org/abs/2003.03123). *ICLR 2020* (DimeNet: adds bond angles to message passing, enabling chirality-aware representations beyond pure distances).
- Liu, Y., Wang, L., Liu, M., Lin, Y., Zhang, X., Oztekin, B., & Ji, S. (2022). [Spherical Message Passing for 3D Molecular Graphs](https://arxiv.org/abs/2102.05013). *ICLR 2022* (SphereNet: extends DimeNet with torsion angles for full 3D geometry encoding).
