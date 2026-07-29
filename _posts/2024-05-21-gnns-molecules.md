---
layout: single
title: "GNNs for Molecules: Drug Discovery and Material Design"
categories: [gnn]
book: gnn
subsection: applications
tags: [molecules, drug-discovery, QSAR, molecular-property, ADMET]
published: true
excerpt: "Graph neural networks are transforming computational drug discovery. Molecules are natural graphs, and GNNs learn molecular representations that predict toxicity, solubility, binding affinity, and synthesis feasibility — tasks that previously required expensive laboratory experiments."
author_profile: true
read_time: true
is_overview: false
icon: "🧪"
read_mins: 7
permalink: /blog/gnn/gnns-molecules/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Drug discovery requires predicting how molecules interact with biological targets — a task that historically required either expensive experiments or hand-designed descriptors. A molecule is a graph \(G = (V, E)\) with atoms as nodes and bonds as edges, so a GNN can learn its representation end to end instead of consuming a fixed fingerprint. Gilmer et al. (2017) showed this works on the QM9 quantum-chemistry benchmark, and the same recipe now underpins large-scale virtual screening.
</div>
{% include figure image_path="/images/blog/gnn/gilmer2017_mpnn.png" alt="MPNN for molecular property prediction" caption="MPNN for molecular property prediction on QM9 (Gilmer et al., 2017)" %}


## The Drug Discovery Pipeline

**Intuition First:** Finding a drug is like searching for a key that fits a specific lock (the protein target). Drug-like chemical space is commonly estimated at around $$10^{60}$$ molecules — far too many to test physically. A GNN is trained on known key–lock pairs to predict which untested keys are likely to fit. It learns that certain atom arrangements near certain bond types correlate with good binding, then uses those patterns to score large virtual libraries far faster than any experimental campaign could.

Industry estimates put the cost of an approved drug at over a decade of work and \\$2B+ in capitalised R&D spend. GNNs are used to accelerate three stages:

1. **Virtual screening:** filter billions of candidate molecules to thousands using property predictions
2. **Lead optimisation:** predict ADMET (absorption, distribution, metabolism, excretion, toxicity) properties
3. **De novo design:** generate novel molecules with desired properties

## What GNNs Predict

**ADMET properties:**
- **Solubility:** how much dissolves in water (affects bioavailability)
- **Lipophilicity (LogP):** determines membrane permeability
- **Toxicity (hERG, AMES):** cardiac toxicity, mutagenicity
- **Metabolic stability:** how quickly the liver degrades the drug
- **Blood-brain barrier penetration:** reaches the brain?

**Binding affinity:**
- Predicted IC50, Ki, Kd for specific protein targets
- Virtual screening: rank candidates by predicted affinity

**Quantum chemistry (QM9 benchmarks):**
- HOMO-LUMO gap (electronic excitation energy)
- Dipole moment, polarisability
- Zero-point energy

## The GNN Pipeline for Molecules

```
SMILES string → RDKit graph → Atom/bond features
                      ↓
              GNN (2-4 layers)
                      ↓
              Node embeddings
                      ↓
              Global pooling (sum/attention)
                      ↓
              Graph embedding
                      ↓
              MLP → property prediction
```

**Atom features:** atomic number, formal charge, number of Hs, hybridisation (sp/sp²/sp³), aromaticity, chirality

**Bond features:** bond type (single/double/triple/aromatic), is-conjugated, is-ring, stereo

## Key Models for Molecular Property Prediction

**MPNN (Gilmer et al., 2017):** unified several earlier molecular GNNs under a single message-passing framework, and benchmarked it systematically on the twelve QM9 quantum-chemistry targets.

The framework is exactly the message-passing recipe, specialised so that bond features $$e_{uv}$$ parameterise the message:

<div class="formula-box">
\[
m_v^{(k)} = \sum_{u \in \mathcal{N}(v)} M^{(k)}\!\left( h_u^{(k-1)},\, e_{uv} \right),
\qquad
h_v^{(k)} = U^{(k)}\!\left( h_v^{(k-1)},\, m_v^{(k)} \right),
\]
\[
\hat{y}_G = R\!\left( \{\, h_v^{(K)} : v \in V \,\} \right).
\]
</div>

Here $$M^{(k)}$$ is the message function, $$U^{(k)}$$ the update function (a GRU in the original paper), and $$R$$ a permutation-invariant readout. Because the message depends on $$e_{uv}$$, a double bond and a single bond between the same atom types send different messages — which is the whole point for chemistry.

**AttentiveFP (Xiong et al., 2019):** adds graph attention for molecular property prediction. Handles multi-task learning across different ADMET endpoints.

**GROVER (Rong et al., 2020):** self-supervised pre-training of a graph transformer on 10M unlabelled molecules, then fine-tuning on small labelled datasets. This mitigates — rather than solves — label scarcity in drug discovery.

**MolBERT / ChemBERTa:** treat SMILES as a token sequence and apply BERT-style pre-training. Competitive with graph-based methods on several benchmarks, which is a useful reminder that the graph inductive bias is not always decisive.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Why pre-training matters:</strong> Labelled molecular data is expensive — a binding-affinity assay across a compound series easily runs to \$100K+, so labelled sets are small while unlabelled ones are not. GNNs trained from scratch on a few thousand labelled molecules overfit readily. Pre-training on millions of unlabelled molecules from ChEMBL or PubChem gives a much better starting point, and Hu et al. (2020) show that the choice of pre-training strategy matters: naive pre-training can transfer <em>negatively</em>, and gains appear reliably only when node-level and graph-level objectives are combined.</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The most impactful use of GNNs in drug discovery is not replacing wet-lab experiments — it is prioritising them. Screening is a funnel: a GNN scores a very large virtual library cheaply, the surviving candidates go to physics-based docking, and only the last, smallest tier is actually synthesised and assayed. Each stage is orders of magnitude more expensive per molecule than the one before it, so the GNN earns its keep purely by improving the ranking at the widest, cheapest point of the funnel. It is a first-pass filter, not a replacement for experiment — and a filter with modest precision is still valuable when the alternative is choosing at random.</div>

## Virtual Screening at Scale

**The challenge:** the numbers span many orders of magnitude. A few thousand small molecules have been approved as drugs; PubChem catalogues on the order of $$10^{8}$$ compounds; drug-like chemical space is estimated at around $$10^{60}$$ molecules. Which of them do you test?

**GNN-based screening:**
1. Train a GNN on known actives and inactives for the target protein
2. Run inference over a large virtual library
3. Select the top-$$k$$ predicted actives for experimental validation

The value here is not that the GNN is right about any individual molecule — it is that inference costs a forward pass while an assay costs reagents and weeks, so even a modestly accurate ranking changes which experiments get run.

## Protein-Ligand Interaction

Beyond single-molecule property prediction: predicting how a small molecule (ligand) binds to a protein target.

**Input:** protein structure (graph of residues) + ligand structure (graph of atoms) + 3D binding pose

**Model:** heterogeneous GNN with protein nodes, ligand nodes, and protein-ligand interaction edges. Equivariant GNNs (EGNN, SE3-Transformers) respect 3D symmetry.

**Output:** binding affinity score (docking score)

## Benchmarks

- **MoleculeNet:** 17 datasets covering classification and regression across ADMET endpoints
- **OGB-molhiv:** HIV activity (41,127 molecules)
- **OGB-molpcba:** 128 PCBA assays (437,929 molecules)
- **QM9:** 12 quantum chemistry properties (134k molecules)
- **MD17:** molecular dynamics trajectories for force field learning

## Summary

GNNs are now a standard molecular representation-learning method in computational chemistry, sitting alongside — rather than wholly replacing — handcrafted fingerprints, which remain surprisingly competitive baselines on small datasets. The distinctive advantages are end-to-end learning of the representation, the ability to condition messages on bond features, and compatibility with both 2D connectivity and 3D geometry through equivariant variants. The honest summary of the benchmark literature is that GNNs win consistently where data is plentiful and structure matters (QM9, large PCBA-style assay collections), and win less clearly on small, noisy ADMET endpoints.

## References

- Gilmer, J., Schütt, K. T., Ramsundar, B., Ramakrishnan, R., Bronskill, M., Gomes, C., & Dahl, G. E. (2017). [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212). *ICML 2017* (MPNN: unified framework for molecular GNNs, benchmarked on QM9 properties).
- Rong, Y., Bian, Y., Xu, T., Xie, W., Wei, Y., Huang, W., & Huang, J. (2020). [Self-Supervised Graph Transformer on Large-Scale Molecular Data](https://arxiv.org/abs/2007.02835). *NeurIPS 2020* (GROVER: large-scale pre-training of molecular GNNs on 10M unlabelled molecules for drug property prediction).
- Hu, W., Liu, B., Gomes, J., Zitnik, M., Liang, P., Pande, V., & Leskovec, J. (2020). [Strategies for Pre-training Graph Neural Networks](https://arxiv.org/abs/1905.12265). *ICLR 2020* (systematic study of GNN pre-training strategies for molecular property prediction and other biological tasks).
