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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
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

<style>
@keyframes rotateBondMap {
  0%   { transform: rotate(0deg); }
  50%  { transform: rotate(40deg); }
  100% { transform: rotate(0deg); }
}
@keyframes rotateBondMap2 {
  0%   { transform: rotate(0deg); }
  50%  { transform: rotate(-55deg); }
  100% { transform: rotate(0deg); }
}
@keyframes fadeAtom {
  0%   { opacity:0; transform:scale(0.4); }
  100% { opacity:1; transform:scale(1); }
}
.bond-map-arrow  { animation: rotateBondMap  3s ease-in-out infinite; }
.bond-map-arrow2 { animation: rotateBondMap2 3s ease-in-out infinite; animation-delay:0.8s; }
.atom-appear     { animation: fadeAtom 0.7s ease-out both; }
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 230" xmlns="http://www.w3.org/2000/svg" style="max-width:500px;width:100%;font-family:sans-serif;">
  <text x="250" y="16" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">Molecular Sheaf: Atoms, Bonds, and Restriction Maps</text>
  <!-- Methane-like: central C with H neighbours -->
  <!-- C atom -->
  <circle cx="250" cy="115" r="26" fill="#6b7280" class="atom-appear" style="animation-delay:0s"/>
  <text x="250" y="120" text-anchor="middle" font-size="14" fill="white" font-weight="bold">C</text>
  <!-- H atoms -->
  <circle cx="160" cy="75" r="18" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5" class="atom-appear" style="animation-delay:0.2s"/>
  <text x="160" y="80" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">H</text>
  <circle cx="340" cy="75" r="18" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5" class="atom-appear" style="animation-delay:0.4s"/>
  <text x="340" y="80" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">H</text>
  <circle cx="160" cy="160" r="18" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5" class="atom-appear" style="animation-delay:0.6s"/>
  <text x="160" y="165" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">H</text>
  <circle cx="340" cy="160" r="18" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5" class="atom-appear" style="animation-delay:0.8s"/>
  <text x="340" y="165" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">H</text>
  <!-- Bonds -->
  <line x1="224" y1="102" x2="175" y2="84" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="276" y1="102" x2="325" y2="84" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="224" y1="128" x2="175" y2="147" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="276" y1="128" x2="325" y2="147" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Stalk boxes at C -->
  <rect x="248" y="143" width="32" height="18" rx="3" fill="#dbeafe" stroke="#93c5fd" stroke-width="1"/>
  <text x="264" y="155" text-anchor="middle" font-size="8" fill="#1e40af">stalk_C</text>
  <!-- Rotating restriction map arrows on bonds -->
  <g class="bond-map-arrow" style="transform-origin:198px 93px;">
    <line x1="198" y1="93" x2="215" y2="78" stroke="#f97316" stroke-width="2" marker-end="url(#mArrow1)"/>
  </g>
  <g class="bond-map-arrow2" style="transform-origin:302px 93px;">
    <line x1="302" y1="93" x2="318" y2="78" stroke="#7c3aed" stroke-width="2" marker-end="url(#mArrow2)"/>
  </g>
  <g class="bond-map-arrow" style="transform-origin:198px 138px;">
    <line x1="198" y1="138" x2="215" y2="153" stroke="#f97316" stroke-width="2" marker-end="url(#mArrow1)"/>
  </g>
  <g class="bond-map-arrow2" style="transform-origin:302px 138px;">
    <line x1="302" y1="138" x2="318" y2="153" stroke="#7c3aed" stroke-width="2" marker-end="url(#mArrow2)"/>
  </g>
  <!-- Labels -->
  <text x="185" y="65" text-anchor="middle" font-size="9" fill="#f97316">F_{C▷e₁}</text>
  <text x="315" y="65" text-anchor="middle" font-size="9" fill="#7c3aed">F_{C▷e₂}</text>
  <text x="250" y="195" text-anchor="middle" font-size="10" fill="#6b7280">Each bond gets a restriction map encoding bond geometry</text>
  <text x="250" y="210" text-anchor="middle" font-size="10" fill="#6b7280">Animated arrows = maps rotating to different bond angles</text>
  <!-- Legend -->
  <circle cx="45" cy="220" r="7" fill="#6b7280"/>
  <text x="56" y="224" font-size="9" fill="#374151">C (carbon, gray)</text>
  <circle cx="155" cy="220" r="7" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>
  <text x="166" y="224" font-size="9" fill="#374151">H (hydrogen, white)</text>
  <circle cx="265" cy="220" r="7" fill="#ef4444"/>
  <text x="276" y="224" font-size="9" fill="#374151">O (oxygen, red)</text>
  <!-- Arrowhead markers -->
  <defs>
    <marker id="mArrow1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#f97316"/>
    </marker>
    <marker id="mArrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#7c3aed"/>
    </marker>
  </defs>
</svg>
<figcaption>Molecular sheaf on a methane-like fragment. Atoms are nodes (C=gray, H=white, O=red in legend). Each bond is an edge. At each node-edge incidence there is a restriction map (animated colored arrows) encoding the local geometric relationship between atom and bond. The arrows rotate to different angles, representing how different bond orientations are encoded as different restriction maps — the sheaf's geometric vocabulary for molecular structure.</figcaption>
</figure></div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — bond types are restriction map types:</strong> Bond types in chemistry are <em>exactly</em> restriction map types in sheaf theory. A C-C single bond has a different electronic structure from a C=O double bond: different bond length, different orbital overlap, different electronegativity gradient. In sheaf language, these are different restriction maps: the single bond map encodes a sigma-bond geometry, the double bond map encodes sigma+pi geometry. By learning a different map per bond type, a sheaf GNN automatically encodes the chemical distinctions between bond types — without any hand-crafted bond-type features. The maps learn the chemistry.</div>

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

**Concrete bond-angle encoding example.** Consider three atoms arranged as H–C–H in methane, with bond angle θ ≈ 109.5°. Label them i (H), j (C), k (H). The restriction maps on the two bonds are orthogonal matrices O_{i▷e_{ij}} and O_{j▷e_{ij}} (for the i-j bond) and O_{j▷e_{jk}}, O_{k▷e_{jk}} (for the j-k bond).

The **holonomy** around the path i → j → k is the composition of restriction maps:

<div class="math-box">
Holonomy(i→j→k) = O_{j▷e_{jk}}ᵀ · O_{j▷e_{ij}} = R(θ_{ijk}) = R(109.5°)
</div>

This is a rotation by 109.5° in ℝ² (for d=2 stalks). The bond angle is encoded directly as the angle of this rotation matrix — no explicit angle feature is needed. When the sheaf predictor learns orthogonal maps from atomic positions, it implicitly encodes all bond angles as holonomies. This is the same information DimeNet computes explicitly as θ_{ijk} = arccos((r_i−r_j)·(r_k−r_j) / (|r_i−r_j||r_k−r_j|)), but encoded implicitly in the geometry of the sheaf.

**Numerical step-through:** For θ=109.5°, the 2×2 rotation matrix is:
- cos(109.5°) ≈ −0.333,  sin(109.5°) ≈ 0.943
- R(109.5°) = [[−0.333, −0.943], [0.943, −0.333]]

If the j-node's stalk vector is h_j = [1, 0], then after holonomy transport h_j becomes [−0.333, 0.943] — a vector rotated by 109.5°. The sheaf diffusion propagates this angle-encoded signal without ever explicitly computing an angle.

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
