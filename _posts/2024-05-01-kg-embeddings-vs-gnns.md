---
layout: single
title: "Knowledge Graph Embeddings vs GNNs"
categories: [gnn]
book: gnn
subsection: heterogeneous
tags: [knowledge-graph, TransE, DistMult, ComplEx, R-GCN, link-prediction]
published: true
excerpt: "Knowledge graph completion can be solved with shallow KG embeddings (TransE, DistMult, ComplEx) or with structural GNNs (R-GCN, CompGCN). Each approach has different inductive biases and failure modes. Understanding when to use each is the central design decision for KG tasks."
author_profile: true
read_time: true
is_overview: false
icon: "🧠"
read_mins: 11
permalink: /blog/gnn/kg-embeddings-vs-gnns/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Shallow KG embeddings (TransE, DistMult, ComplEx) learn one free vector per entity and one per relation — fast, scalable, and transductive: a new entity has no vector and no way to get one without retraining. GNN-based approaches (R-GCN, CompGCN) <em>compute</em> an entity's embedding from its neighbourhood, so they carry structural context and can extend to unseen entities <em>provided those entities arrive with input features</em>. Which scoring function you choose also decides which relation patterns the model can express at all — symmetry, antisymmetry, inversion and composition are not all available to every method.
</div>

## The Knowledge Graph Completion Task

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Shallow KG embeddings are like a phone book — each entity gets exactly one entry, and lookup is instant. GNN-based methods are like a detective's case file — each entity's embedding is assembled from its neighbourhood context. The phone book scales to millions of entries but cannot handle a new person who just arrived; the case file generalises to new people but costs more to build.</div>

A knowledge graph (KG) is a collection of triples $$(s, r, o)$$ — subject, relation, object — e.g. (John Lennon, member of, The Beatles). It is always incomplete: some true triples are missing. **KG completion** is the task of predicting them.

Evaluation: given $$(s, r, ?)$$, rank all candidate objects by their score. Metrics: MRR (mean reciprocal rank) and Hits@$$k$$.

## Shallow KG Embeddings

These methods assign a learned embedding to each entity and relation, then score triples with a simple closed-form function. What separates them is not accuracy so much as **which relation patterns the score function is algebraically capable of representing**. The four patterns that matter:

- **Symmetry:** $$r(s,o) \Rightarrow r(o,s)$$ — *married to*, *sibling of*
- **Antisymmetry:** $$r(s,o) \Rightarrow \neg r(o,s)$$ — *parent of*, *part of*
- **Inversion:** $$r_1(s,o) \Leftrightarrow r_2(o,s)$$ — *supervises* / *supervised by*
- **Composition:** $$r_1(x,y) \wedge r_2(y,z) \Rightarrow r_3(x,z)$$ — mother's father is a grandfather

### TransE (Bordes et al., 2013)

<div class="formula-box">
\[
f(s, r, o) \;=\; -\,\bigl\lVert e_s + w_r - e_o \bigr\rVert
\]
</div>

Relations are translations in embedding space: $$e_o \approx e_s + w_r$$. Composition falls out for free ($$w_{r_3} = w_{r_1} + w_{r_2}$$), and antisymmetry is natural, since $$e_s + w_r \approx e_o$$ does not give $$e_o + w_r \approx e_s$$ unless $$w_r$$ is null.

**TransE cannot model symmetry.** The argument is short and worth following. If $$r$$ is symmetric then both $$(s,r,o)$$ and $$(o,r,s)$$ must score near-perfectly, which requires $$e_s + w_r = e_o$$ *and* $$e_o + w_r = e_s$$. Adding the two gives $$2w_r = 0$$, so $$w_r = 0$$ and therefore $$e_s = e_o$$. The only way TransE can represent a symmetric relation is to collapse every pair of entities it connects onto the same point — which destroys the ability to tell those entities apart for every other relation. This is a structural impossibility, not a training difficulty.

TransE also handles one-to-many, many-to-one and many-to-many relations poorly, for a related reason: if $$(s, r, o_1)$$ and $$(s, r, o_2)$$ are both true, both force $$e_{o} \approx e_s + w_r$$, pushing $$e_{o_1}$$ and $$e_{o_2}$$ together.

### DistMult (Yang et al., 2015)

<div class="formula-box">
\[
f(s, r, o) \;=\; e_s^{\top} \mathrm{diag}(w_r)\, e_o \;=\; \sum_{k=1}^{d} \bigl(e_s\bigr)_k \bigl(w_r\bigr)_k \bigl(e_o\bigr)_k
\]
</div>

A diagonal bilinear form, with $$w_r \in \mathbb{R}^{d}$$. It captures symmetry perfectly.

**DistMult cannot model antisymmetry.** Again the reason is immediate from the algebra: the expression is a sum of products $$(e_s)_k (w_r)_k (e_o)_k$$, and multiplication of reals commutes, so swapping $$e_s$$ and $$e_o$$ leaves every term unchanged. Therefore $$f(s,r,o) = f(o,r,s)$$ **identically, for every relation and every pair of entities**. DistMult scores *parent of* between two people the same in both directions no matter what it learns. It cannot model inversion either, for the same reason.

### ComplEx (Trouillon et al., 2016)

<div class="formula-box">
\[
f(s, r, o) \;=\; \mathrm{Re}\Bigl(\sum_{k=1}^{d} \bigl(w_r\bigr)_k \bigl(e_s\bigr)_k \overline{\bigl(e_o\bigr)_k}\Bigr),
\qquad
e_s, e_o, w_r \in \mathbb{C}^{d}
\]
</div>

ComplEx is DistMult moved into $$\mathbb{C}^{d}$$ with a **conjugate** on the object embedding, and that conjugate is the entire point. Conjugation breaks the commutativity that trapped DistMult: swapping $$s$$ and $$o$$ conjugates the whole product, which preserves the real part when $$w_r$$ is real and flips the sign of the imaginary contribution when $$w_r$$ is imaginary. So a relation with a real-valued $$w_r$$ behaves symmetrically and one with an imaginary $$w_r$$ behaves antisymmetrically — and the model can learn where on that spectrum each relation sits. It handles symmetry, antisymmetry and inversion; composition it does not.

### RotatE (Sun et al., 2019)

<div class="formula-box">
\[
f(s, r, o) \;=\; -\,\bigl\lVert e_s \circ w_r - e_o \bigr\rVert,
\qquad
\bigl\lvert (w_r)_k \bigr\rvert = 1
\]
</div>

Here $$\circ$$ is the elementwise product in $$\mathbb{C}^{d}$$ and each component of $$w_r$$ is constrained to unit modulus — so it is a pure phase, and the relation acts as a **rotation** of each coordinate. This geometry gives all four patterns: symmetry when every phase is $$0$$ or $$\pi$$ (rotating twice returns to the start), antisymmetry otherwise, inversion by the conjugate rotation, and composition by adding phases.

## Key Properties of Shallow Methods

Write $$\lvert\mathcal{E}\rvert$$ for the number of entities and $$\lvert\mathcal{R}\rvert$$ for the number of relations.

| Property | TransE | DistMult | ComplEx | RotatE |
|----------|--------|----------|---------|--------|
| Parameters | $$(\lvert\mathcal{E}\rvert + \lvert\mathcal{R}\rvert)d$$ | $$(\lvert\mathcal{E}\rvert + \lvert\mathcal{R}\rvert)d$$ | $$2(\lvert\mathcal{E}\rvert + \lvert\mathcal{R}\rvert)d$$ | $$2\lvert\mathcal{E}\rvert d + \lvert\mathcal{R}\rvert d$$ |
| Symmetry | **No** | Yes | Yes | Yes |
| Antisymmetry | Yes | **No** | Yes | Yes |
| Inversion | Yes | No | Yes | Yes |
| Composition | Yes | No | No | Yes |
| Inductive (new entities) | No | No | No | No |

RotatE needs only $$d$$ real parameters per relation despite complex embeddings, because the unit-modulus constraint leaves a phase as the sole free quantity per coordinate.

Notice that TransE and DistMult have exactly complementary blind spots — the one pattern each cannot express is the pattern the other handles best. ComplEx is the smallest change to DistMult that repairs its blind spot, and RotatE is the smallest change to TransE that repairs its.

**Transductive:** all four require every entity to have been seen during training, because an entity's embedding is a free parameter looked up by identity. There is no function to apply to a newly arrived entity — it has no row in the table, and giving it one means retraining.

## Worked Example: TransE vs R-GCN on a Mini-KG

Consider a tiny KG with three entities $$\{A, B, C\}$$ and two triples:

- $$(A,\ \textit{member of},\ B)$$
- $$(A,\ \textit{born in},\ C)$$

**TransE** learns five free vectors in $$\mathbb{R}^2$$: $$e_A, e_B, e_C, w_{\text{member}}, w_{\text{born}}$$.

- Training maximises $$-\lVert e_A + w_{\text{member}} - e_B\rVert$$ and $$-\lVert e_A + w_{\text{born}} - e_C\rVert$$
- $$e_B$$ is a parameter that gradient descent nudges until the first constraint is satisfied. Nothing else determines it, and nothing about $$B$$'s position in the graph is *computed*.

**R-GCN** on the same graph computes $$h_B$$ by aggregating from $$A$$ over the inverse relation *member of*$$^{-1}$$. $$B$$'s embedding is now a function of its neighbourhood — change $$A$$'s features and $$h_B$$ changes with them, with no retraining.

That distinction has a practical consequence and a limit worth being precise about. If a new triple $$(B,\ \textit{located in},\ C)$$ arrives at test time, R-GCN's forward pass simply includes the new edge and $$h_B$$ updates immediately; TransE's $$e_B$$ is fixed until retrained. But if a genuinely **new entity** $$D$$ arrives, R-GCN can only embed it when $$D$$ comes with input features to propagate. In the common KG setting where entities have no features and the R-GCN's input layer is itself a learned per-entity embedding table, R-GCN is just as transductive as TransE. Inductive capability comes from having a feature-to-embedding *function*, not from being a GNN.

## GNN-Based KG Completion

R-GCN and CompGCN use GNNs as encoders — producing entity embeddings that are informed by the graph structure, not just the entity's identity.

### CompGCN (Vashishth et al., 2020)

CompGCN generalises R-GCN by composing entity and relation embeddings during message passing:

<div class="formula-box">
\[
h_v \;=\; \sigma\!\left( \sum_{(u,r)\, \in\, \mathcal{N}(v)} W_{\lambda(r)}\; \phi\bigl(h_u,\, z_r\bigr) \right)
\]
</div>

Here $$\phi$$ is a composition operator borrowed from the shallow methods — subtraction (TransE-like), multiplication (DistMult-like), or circular correlation — and $$z_r$$ is a learned relation embedding.

The subscript $$\lambda(r)$$ is the part worth noticing. It indexes only the **direction** of the edge — original, inverse, or self-loop — so CompGCN uses **three** weight matrices per layer regardless of how many relations the graph has. Relation-specific behaviour is carried by the $$d$$-dimensional $$z_r$$ inside the composition instead of by a $$d \times d$$ matrix. That is a direct answer to R-GCN's parameter blow-up: the cost per relation drops from $$d^2$$ to $$d$$, without needing basis decomposition to patch it afterwards.

<div class="insight-box">
<strong>Why composition matters:</strong> TransE uses subtraction, \(e_o - e_s \approx w_r\). CompGCN builds that same operation into message passing — when aggregating from neighbour \(u\) over relation \(r\), the message is \(\phi(h_u, z_r)\) rather than \(h_u\) alone. The relation therefore shapes the message rather than merely selecting which weight matrix transforms it, so relational context enters the node embedding itself.
</div>

## When to Use Shallow vs GNN Methods

| Scenario | Recommendation |
|----------|---------------|
| Very large KG (millions of entities) | Shallow (RotatE, ComplEx) — scalable |
| New entities at test time, *with features* | GNN (R-GCN, CompGCN) |
| New entities at test time, *without features* | Neither — no method here embeds an unseen, featureless entity |
| Relation set includes symmetric relations | Not TransE |
| Relation set includes antisymmetric relations | Not DistMult |
| Few triples per entity | GNN (leverages neighbourhood structure) |
| Many triples per entity | Shallow sufficient |
| Multi-hop reasoning required | GNN or neural LP models |
| Production system, speed matters | Shallow (single embedding lookup) |

## Multi-Hop Reasoning

Shallow methods score each triple in isolation from a pair of looked-up vectors — they cannot directly reason over multi-hop paths (e.g. "X is the sibling of Y's parent" therefore X is an aunt or uncle of Y). A $$K$$-layer GNN encoder propagates information over $$K$$ hops before scoring, so multi-hop structure is baked into the embeddings it hands to the decoder.

Note the distinction from composition: RotatE *can* represent a composition rule between three relations, but only as an algebraic identity between relation vectors. It still scores one triple at a time from two entity vectors. The GNN's multi-hop capability is a different mechanism — it changes what the entity representations contain.

Path-based methods such as Neural LP (Yang, Yang & Cohen, 2017) and MINERVA (Das et al., 2018) go further still, reasoning over explicit paths and yielding interpretable rules, at considerably higher cost.

## Summary

Shallow KG embeddings are fast, scalable, and well-understood — and each carries a hard expressiveness limit set by its score function: TransE cannot represent symmetry, DistMult cannot represent antisymmetry, and no amount of data or tuning changes either. GNN-based methods compute rather than look up entity representations, so they carry structural context and handle multi-hop patterns, though inductive generalisation to genuinely new entities still requires those entities to arrive with features.

The two are complementary rather than competing, which is why the common design is hybrid: a GNN encoder for structure-aware entity embeddings, and a shallow decoder (DistMult, ComplEx, RotatE) chosen for the relation patterns your KG actually contains.

## References

- Bordes, A., Usunier, N., Garcia-Durán, A., Weston, J., & Yakhnenko, O. (2013). [Translating Embeddings for Modeling Multi-relational Data](https://papers.nips.cc/paper/2013/hash/1cecc7a77928ca8133fa24680a88d2f9-Abstract.html). *NeurIPS 2013* (TransE).
- Yang, B., Yih, W.-T., He, X., Gao, J., & Deng, L. (2015). [Embedding Entities and Relations for Learning and Inference in Knowledge Bases](https://arxiv.org/abs/1412.6575). *ICLR 2015* (DistMult).
- Trouillon, T., Welbl, J., Riedel, S., Gaussier, É., & Bouchard, G. (2016). [Complex Embeddings for Simple Link Prediction](https://arxiv.org/abs/1606.06357). *ICML 2016* (ComplEx).
- Sun, Z., Deng, Z.-H., Nie, J.-Y., & Tang, J. (2019). [RotatE: Knowledge Graph Embedding by Relational Rotation in Complex Space](https://arxiv.org/abs/1902.10197). *ICLR 2019*.
- Vashishth, S., Sanyal, S., Nitin, V., & Talukdar, P. (2020). [Composition-based Multi-Relational Graph Convolutional Networks](https://arxiv.org/abs/1911.03082). *ICLR 2020* (CompGCN).
