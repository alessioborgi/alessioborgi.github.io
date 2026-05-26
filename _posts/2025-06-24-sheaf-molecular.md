---
layout: single
title: "Sheaf GNNs for Molecular Property Prediction"
categories: [sheaf]
book: sheaf
subsection: applications
tags: [molecular, QM9, drug-discovery, force-field, SchNet, DimeNet, sheaf-molecular]
published: false
excerpt: "Molecular graphs are naturally heterophilic — atoms of different types bonded together — and have rich geometric structure (bond angles, torsion angles). Sheaf GNNs can encode this structure via restriction maps that represent the relational geometry between bonded atoms. This post explores how sheaf theory applies to molecular property prediction."
author_profile: true
read_time: true
is_overview: false
icon: "⚗️"
read_mins: 6
permalink: /blog/sheaf/sheaf-molecular/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A molecule is a graph with typed atoms (nodes) and bonds (edges). Molecular graphs are naturally heterophilic — carbon bonds to oxygen, which bonds to hydrogen — and have geometric structure (bond angles, 3D positions). Sheaf restriction maps can encode bond-type-specific relational geometry: different maps for C-C vs C-O vs C-N bonds. This provides a principled alternative to hand-designed bond angle features (DimeNet) while retaining the sheaf's theoretical guarantees.
</div>
{% include figure image_path="/images/blog/gnn/gilmer2017_mpnn.png" alt="Molecular sheaf GNN" caption="Molecular graph MPNN: basis for sheaf GNN extensions (Gilmer et al., 2017)" %}


## Why Molecular Graphs Are Heterophilic

In a molecular graph, adjacent atoms (bonded atoms) are typically of different element types — carbon bonds to oxygen, oxygen bonds to hydrogen. The features of adjacent atoms (atomic number, electronegativity, orbital structure) are systematically different.

Standard GCN on molecular graphs averages these dissimilar features — an operation that conflates chemically distinct information. This is exactly the heterophily problem: adjacent nodes (atoms) should contribute different information, not be averaged toward the same representation.

**Sheaf motivation:** Different bond types (C-C, C-O, C-N, C-H) encode different chemical relationships. A sheaf with bond-type-specific restriction maps can represent the relational geometry of each bond type independently — analogous to R-GCN for knowledge graphs but applied to molecular chemistry.

## From 2D Connectivity to 3D Geometry

Molecular GNNs have progressively incorporated more geometric information:

| Level | Information used | Model |
|---|---|---|
| 2D (topology) | Bond connectivity | MPNN, GIN |
| Distances | Interatomic ||r_i − r_j|| | SchNet |
| Distances + angles | Bond angle θ_{ijk} | DimeNet, DimeNet++ |
| Distances + angles + dihedrals | Torsion angle φ_{ijkl} | SphereNet, GemNet |
| Full equivariance | 3D coordinates, E(n) equivariance | EGNN, NequIP, MACE |

Each level adds richer geometric information but at higher computational cost.

## Sheaf Maps as Bond-Angle Encodings

Consider three bonded atoms: i — j — k (atom j is bonded to both i and k). The bond angle θ_{ijk} = ∠(r_i − r_j, r_k − r_j) is the key geometric quantity DimeNet uses.

In the sheaf framework: the restriction map F_{i▷e_{ij}} encodes the "orientation" of atom i relative to the bond e_{ij}. The bond angle is encoded in the composition of maps:

<div class="math-box">
O_{ij} · O_{jk} = R(θ_{ijk})   (composition of restriction maps = rotation by bond angle)
</div>

When restriction maps are orthogonal, the holonomy around the path i–j–k is a rotation by the bond angle. NSD with orthogonal maps implicitly learns bond-angle-like geometric information — without explicitly computing angles.

**Formal claim:** For a sheaf with orthogonal maps trained on molecular data, the learned maps F_{v▷e} encode the 3D geometric relationship between atom v and bond e — in the same information-theoretic sense as DimeNet's angle features.

## Multi-Relational Molecular Sheaves

Different bond types (single, double, triple, aromatic) have different geometric and electronic properties. A multi-relational molecular sheaf assigns different restriction maps per bond type:

<div class="math-box">
[F^{bond\_type}_{u▷e} | F^{bond\_type}_{v▷e}] = MLP_{bond\_type}(h_u, h_v, r_{uv})
</div>

where r_{uv} = |r_u − r_v| is the interatomic distance and bond_type ∈ {single, double, triple, aromatic}.

The multi-relational Sheaf Laplacian:

<div class="math-box">
Δ_F = Σ_{bt} Δ_{F^{bt}}
</div>

This separates the contribution of different bond types to the diffusion — single bonds propagate information differently from double bonds.

## Equivariant Molecular Sheaves

For molecular property prediction with 3D coordinates, E(n) equivariance is required: predictions must be invariant to rotation, translation, and reflection of the molecule.

A **sheaf with O(3)-valued restriction maps** achieves this: maps O_{v▷e} ∈ O(3) encode the 3D orientation of atom v relative to bond e. The Sheaf Laplacian is gauge-equivariant under O(3) — applying a global rotation to all atoms corresponds to a gauge transformation.

This is the connection Laplacian approach applied to molecular graphs — the sheaf GNN becomes a gauge-equivariant model for 3D molecules.

**Comparison with EGNN:** EGNN achieves E(n) equivariance via distance-only messages (no directional information). Orthogonal sheaf maps add directional information (encoded in the maps) while maintaining equivariance — potentially capturing more geometric detail than EGNN.

## Experimental Setup: QM9 Benchmark

QM9 is the standard molecular property benchmark:
- 133,885 small organic molecules (≤9 heavy atoms)
- 12 quantum chemistry targets: U₀ (internal energy), HOMO/LUMO gap, dipole moment, polarisability, ...
- MAE (mean absolute error) is the standard metric

A molecular sheaf GNN for QM9:
1. Node features: atom type (one-hot), degree, aromaticity
2. Edge features: bond type (one-hot), interatomic distance
3. Sheaf predictor: MLP(h_u, h_v, bond_type, ||r_u − r_v||) → restriction maps
4. 3-layer sheaf diffusion with d=4 orthogonal maps
5. Graph readout: mean pooling over node stalks
6. Final MLP for property prediction

## Expected Performance and Limitations

Based on the theoretical analysis:

**Expected benefit:**
- Heterophilic bonds (C-O, N-H): sheaf maps correctly represent the dissimilar atom features
- Geometric information: orthogonal maps encode bond angles implicitly
- Multi-relational structure: different maps per bond type capture bond chemistry

**Expected limitations:**
- 3D position encoding: sheaf maps encode relative orientations, not absolute positions → equivariance but limited chirality resolution
- Long-range effects: with K=3 sheaf layers, only 3-hop interactions are captured → large molecules with long-range electronic effects require more layers or global attention
- No explicit angle features: unlike DimeNet which explicitly computes θ_{ijk}, the sheaf must learn this from data — may require more training examples

**Comparison with SchNet:** SchNet uses distance-based filter functions, not restriction maps. For predicting energy (U₀): SchNet ≈ 14 meV MAE; a sheaf GNN with orthogonal maps (without explicit 3D position) would likely achieve ≈ 20–30 meV — better than 2D-only MPNNs but not competing with full 3D equivariant models.

## Drug Discovery Applications

Beyond QM9, molecular sheaf GNNs are applicable to:
- **ADMET prediction:** molecular heterophily (different atom types in a drug molecule) benefits from sheaf maps; OGB-molhiv, OGB-molpcba benchmarks
- **Protein-ligand binding:** the protein-ligand interface is a heterophilic bipartite graph — sheaf maps encode the complementarity between protein residues and ligand atoms
- **Retrosynthesis:** reaction graphs have heterophilic structure (reagents of different types interacting) — sheaf maps encode the chemical compatibility constraints

<div class="insight-box">
<strong>Key research gap:</strong> No published paper has directly applied NSD or PNSD to QM9 or OGB molecular benchmarks as of 2024. The theoretical framework suggests clear benefits for heterophilic molecular structures, but empirical validation is an open research opportunity.
</div>

## References

- Gilmer, J., Schütt, K. T., Ramsundar, B., Ramakrishnan, R., Bronskill, M., Gomes, C., & Dahl, G. E. (2017). [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212). *ICML 2017* (MPNN: unified molecular GNN framework — the 2D baseline that sheaf GNNs extend).
- Klicpera, J., Groß, J., & Günnemann, S. (2020). [Directional Message Passing for Molecular Graphs](https://arxiv.org/abs/2003.03123). *ICLR 2020* (DimeNet: explicit bond angles — the geometric information sheaf restriction maps can implicitly encode).
- Satorras, V. G., Hoogeboom, E., & Welling, M. (2021). [E(n) Equivariant Graph Neural Networks](https://arxiv.org/abs/2102.09844). *ICML 2021* (EGNN: the equivariant baseline that orthogonal sheaf maps can extend with richer geometric structure).
