---
layout: single
title: "TDA in Drug Discovery: Molecular Topology"
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-drug-discovery, molecular-topology, protein-structure, drug-design, cheminformatics]
published: false
excerpt: "Persistent homology provides multi-scale topological fingerprints of molecular structures — capturing rings, cavities, and protein pockets that traditional cheminformatics descriptors miss. Applications include binding site detection, ADMET property prediction, and protein-ligand interaction modelling."
author_profile: true
read_time: true
icon: "💊"
read_mins: 5
permalink: /blog/persistent-homology/tda-drug-discovery/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Molecular structures — atom position clouds with element types — are natural inputs for TDA. By building element-specific Rips filtrations (e.g., on carbon atoms, on nitrogen atoms, on C–N atom pairs), one computes persistence diagrams that encode ring systems, binding pockets, and molecular cavities. These topological molecular descriptors predict ADMET properties and binding affinities better than many classical fingerprints, especially when combined with GNNs.</div>

## Intuition First

A drug molecule is not just a graph of atom–bond connections — it is a 3D shape. Two molecules can have identical bond graphs but different 3D arrangements, and only one may fit the binding pocket. Traditional fingerprints count subgraph patterns; they are blind to 3D geometry. TDA sees geometry: it grows balls around atoms and tracks when ring-shaped voids appear (H₁ bars = aromatic rings, macrocycles) and when enclosed cavities form (H₂ bars = binding pockets). The birth scale of an H₁ bar directly encodes the ring's spatial diameter — information no 2D fingerprint captures.

## Molecular Topology

A molecule can be represented as a **3D point cloud**: $$P = \{(x_i, \text{element}_i)\}$$ where $$x_i \in \mathbb{R}^3$$ is the 3D position of atom $$i$$ and $$\text{element}_i \in \{\text{C}, \text{N}, \text{O}, \text{S}, \ldots\}$$ is the element type.

**Traditional fingerprints** (Morgan/ECFP, MACCS keys): encode local graph structure (subgraph patterns up to radius $$r$$). These miss:
- 3D spatial arrangement.
- Multi-scale geometric features.
- Cavities and voids.

**Topological fingerprints** from persistent homology capture all of the above.

## Element-Specific Filtrations

**Cang & Wei (2017)** introduced element-specific TDA: instead of one Rips filtration on all atoms, compute separate filtrations for each element type and pair:

- $$\mathrm{Rips}(P_C)$$ — carbon-only complex; $$H_1$$ captures aromatic rings and ring systems.
- $$\mathrm{Rips}(P_N)$$ — nitrogen atoms; encodes nitrogen-containing rings (pyridine, imidazole).
- $$\mathrm{Rips}(P_{C,O})$$ — carbon-oxygen pairs; captures carbonyl and ether geometry.

Each element-specific diagram is vectorised (persistence images) and concatenated into a multi-channel topological fingerprint.

**Performance**: On benchmark ADMET datasets (solubility, toxicity, metabolic stability), element-specific TDA features achieve state-of-the-art performance among non-deep-learning methods and are competitive with GNNs.

## Protein Binding Site Detection

**H₂ persistence** of the protein surface point cloud captures **cavities** (enclosed voids) that correspond to binding pockets:

- A large, long-lived $$H_2$$ bar = a deep, geometrically robust cavity.
- Birth scale $$b$$ ≈ pocket entrance width; death scale $$d$$ ≈ pocket depth.

This gives a scale-parameterised pocket detection without requiring a threshold on solvent-accessible surface area.

<div class="math-box">Binding pocket score: $$\mathrm{PS} = \max_{(b,d) \in H_2(\text{surface})} (d - b) \cdot d$$</div>

## Worked Example: Benzene vs. Cyclohexane

Both molecules have the formula C₆H₆ / C₆H₁₂ — a 6-membered carbon ring. Their 3D atom positions give very similar Rips filtrations on the carbon-only point cloud $$P_C$$:

**Benzene** (flat, aromatic, bond length ≈ 1.40 Å):
- At $$r \approx 0.70$$ Å: adjacent C atoms connect.
- At $$r \approx 1.21$$ Å: the ring loop closes → $$H_1$$ bar born at $$(0.70, 2.42)$$, persistence $$= 1.72$$ Å.

**Cyclohexane** (chair conformation, bond length ≈ 1.54 Å, puckered):
- At $$r \approx 0.77$$ Å: adjacent C atoms connect.
- At $$r \approx 1.54$$ Å: ring closes but at a larger scale → $$H_1$$ bar born at $$(0.77, 2.80)$$, persistence $$= 2.03$$ Å.

The birth times differ (0.70 vs 0.77 Å) because aromatic C–C bonds are shorter. The death times differ because the ring diameter differs. A classifier using these H₁ birth/death values can distinguish aromatic from non-aromatic rings without any chemical domain knowledge — the geometry is encoded automatically.

<style>
@keyframes dd-grow {
  0%   { r: 0; }
  60%  { r: 22; }
  100% { r: 22; }
}
@keyframes dd-ring {
  0%,50%  { opacity: 0; }
  80%,100% { opacity: 1; }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto;">
  <!-- Drug discovery TDA pipeline -->
  <text x="250" y="13" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">TDA Drug Discovery Pipeline</text>

  <!-- Step 1: Molecule -->
  <rect x="5" y="22" width="80" height="80" rx="5" fill="#f0fdf4" stroke="#86efac"/>
  <text x="45" y="38" text-anchor="middle" font-size="8" fill="#166534" font-weight="bold">Molecule</text>
  <!-- Benzene ring schematic -->
  <polygon points="45,55 60,63 60,79 45,87 30,79 30,63" fill="none" stroke="#0d9488" stroke-width="2"/>
  <!-- aromatic circle inside -->
  <circle cx="45" cy="71" r="10" fill="none" stroke="#0d9488" stroke-width="1" stroke-dasharray="3,2"/>
  <!-- atom dots -->
  <circle cx="45" cy="55" r="3" fill="#0d9488"/>
  <circle cx="60" cy="63" r="3" fill="#0d9488"/>
  <circle cx="60" cy="79" r="3" fill="#0d9488"/>
  <circle cx="45" cy="87" r="3" fill="#0d9488"/>
  <circle cx="30" cy="79" r="3" fill="#0d9488"/>
  <circle cx="30" cy="63" r="3" fill="#0d9488"/>
  <text x="45" y="112" text-anchor="middle" font-size="7" fill="#0d9488">3D atom cloud</text>

  <!-- Arrow 1 -->
  <text x="98" y="68" font-size="15" fill="#64748b">→</text>
  <text x="90" y="82" font-size="7" fill="#64748b">element</text>
  <text x="90" y="91" font-size="7" fill="#64748b">Rips(P_C)</text>

  <!-- Step 2: Element filtrations -->
  <rect x="115" y="22" width="90" height="80" rx="5" fill="#fefce8" stroke="#fde68a"/>
  <text x="160" y="38" text-anchor="middle" font-size="8" fill="#92400e" font-weight="bold">Filtrations</text>
  <!-- Growing balls animation -->
  <circle cx="145" cy="68" r="0" fill="#0d9488" opacity="0.15">
    <animate attributeName="r" values="0;22;22;0" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.15;0.15;0" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="145" cy="68" r="4" fill="#0d9488"/>
  <circle cx="168" cy="55" r="4" fill="#0d9488"/>
  <circle cx="175" cy="68" r="4" fill="#0d9488"/>
  <circle cx="168" cy="81" r="4" fill="#0d9488"/>
  <text x="160" y="112" text-anchor="middle" font-size="7" fill="#92400e">Rips(C), Rips(N), Rips(C,O)</text>

  <!-- Arrow 2 -->
  <text x="218" y="68" font-size="15" fill="#64748b">→</text>
  <text x="212" y="82" font-size="7" fill="#64748b">persist.</text>

  <!-- Step 3: Multi-channel diagrams -->
  <rect x="235" y="22" width="90" height="80" rx="5" fill="#eff6ff" stroke="#93c5fd"/>
  <text x="280" y="38" text-anchor="middle" font-size="8" fill="#1e40af" font-weight="bold">Diagrams</text>
  <!-- H1 bar (ring) -->
  <text x="240" y="54" font-size="7" fill="#0d9488">C: H₁</text>
  <rect x="260" y="47" height="8" fill="#0d9488" rx="2" width="0">
    <animate attributeName="width" values="0;55" dur="0.6s" begin="0.5s" fill="freeze"/>
  </rect>
  <!-- H2 bar (pocket) -->
  <text x="240" y="72" font-size="7" fill="#6366f1">C: H₂</text>
  <rect x="260" y="65" height="8" fill="#6366f1" rx="2" width="0">
    <animate attributeName="width" values="0;35" dur="0.6s" begin="0.8s" fill="freeze"/>
  </rect>
  <!-- N channel -->
  <text x="240" y="90" font-size="7" fill="#f97316">N: H₁</text>
  <rect x="260" y="83" height="8" fill="#f97316" rx="2" width="0">
    <animate attributeName="width" values="0;28" dur="0.6s" begin="1.0s" fill="freeze"/>
  </rect>
  <text x="280" y="112" text-anchor="middle" font-size="7" fill="#1e40af">multi-channel fingerprint</text>

  <!-- Arrow 3 -->
  <text x="338" y="68" font-size="15" fill="#64748b">→</text>
  <text x="332" y="82" font-size="7" fill="#64748b">persist.</text>
  <text x="332" y="91" font-size="7" fill="#64748b">images</text>

  <!-- Step 4: ML Prediction -->
  <rect x="358" y="22" width="132" height="80" rx="5" fill="#fdf4ff" stroke="#e9d5ff"/>
  <text x="424" y="38" text-anchor="middle" font-size="8" fill="#7c3aed" font-weight="bold">ML Prediction</text>
  <!-- Feature bars -->
  <rect x="366" y="48" width="70" height="10" rx="2" fill="#7c3aed" opacity="0.7"/>
  <text x="440" y="57" font-size="7" fill="#7c3aed">topo feat.</text>
  <rect x="366" y="63" width="50" height="10" rx="2" fill="#94a3b8" opacity="0.7"/>
  <text x="420" y="72" font-size="7" fill="#64748b">GNN feat.</text>
  <!-- Output -->
  <rect x="366" y="80" width="116" height="14" rx="3" fill="#0d9488" opacity="0">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="1.5s" fill="freeze"/>
  </rect>
  <text x="424" y="91" text-anchor="middle" font-size="7" fill="#fff" opacity="0">ADMET / binding affinity
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.5s" fill="freeze"/>
  </text>
  <text x="424" y="112" text-anchor="middle" font-size="7" fill="#7c3aed">property prediction</text>

  <!-- Bottom caption row -->
  <text x="250" y="178" text-anchor="middle" font-size="7.5" fill="#94a3b8">3D molecule → element-specific Rips filtrations → multi-channel persistence diagrams → ML model → predicted property</text>
</svg>
<figcaption>TDA drug discovery pipeline: element-specific Rips filtrations on 3D atom positions produce multi-channel persistence diagrams capturing rings (H₁) and pockets (H₂), fed into an ML model for property prediction.</figcaption>
</figure>
</div>

## Protein-Ligand Interaction

For a protein-ligand complex:
1. Build element-specific Rips filtrations on the **complex** and on the **apo protein**.
2. Compute the difference in persistence diagrams (before and after ligand binding).
3. The "topological fingerprint of binding" = the difference diagram.

This captures how the ligand changes the topological environment of the binding pocket — complementary to docking score energy terms.

<div class="insight-box"><strong>Key Insight:</strong> The power of TDA in drug discovery comes from capturing ring systems — both aromatic rings (critical for drug-likeness) and macrocyclic loops (increasingly important drug scaffolds). Classical 2D fingerprints count ring patterns by subgraph matching; TDA captures them geometrically via H₁ persistence. The geometric information (ring size, 3D arrangement, conformation) is automatically encoded in the birth-death times, giving TDA a natural advantage for 3D-QSAR applications.</div>

## References

- Z. Cang, G.-W. Wei, "TopologyNet: Topology Based Deep Convolutional and Multi-Task Neural Networks for Biomolecular Property Predictions," *PLOS Computational Biology*, 2017.
- K. Xia, G.-W. Wei, "Persistent Homology Analysis of Protein Structure, Flexibility, and Folding," *International Journal for Numerical Methods in Biomedical Engineering*, 2014.
- C. Nguyen, Z. Cang, K. Wu, M. Chen, Y. Nie, G.-W. Wei, "Mathematical Deep Learning for D and F Block Organometallic and Inorganic Chemistry," *J. Chem. Inf. Model.*, 2018.
