---
layout: single
title: "Sheaf4Rec: What a Recommender Gains from a Vector Space per Node"
date: 2026-08-17
categories: [sheaf]
book: sheaf
subsection: applications
tags: [sheaf-neural-networks, recommender-systems, collaborative-filtering, bpr-loss, bipartite-graphs, oversmoothing]
published: true
is_overview: false
excerpt: "Collaborative filtering represents every user and item as one static vector. Sheaf4Rec replaces each with a vector space, and reports consistent gains on ranking metrics — though the wins come from recall rather than precision, and the headline efficiency claim is hard to reconcile with the timing table."
author_profile: true
read_time: true
icon: "🎬"
read_mins: 10
permalink: /blog/sheaf/sheaf4rec-paper/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A user's behaviour depends on which items they interact with, so a single embedding vector is arguably the wrong object — the same user is a different thing in different contexts. Sheaf4Rec puts a cellular sheaf on the bipartite user–item graph, so each node carries a vector space and each interaction a restriction map, and trains it with the Bayesian Personalized Ranking loss. It reports up to <strong>+11.29% NDCG@10</strong> and <strong>+8.53% F1@10</strong> over NGCF, KGTORe and other GNN recommenders, with every improvement significance-tested. Two things to read carefully: the gains are driven by recall, not precision, and the abstract's "2.5% to 37%" efficiency range does not map onto the timing table.
</div>

<div class="paper-box">
<strong>Paper:</strong> Sheaf4Rec: Sheaf Neural Networks for Graph-based Recommender Systems<br>
<strong>Authors:</strong> Antonio Purificato, Giulia Cassarà, Federico Siciliano, Fabrizio Silvestri (Sapienza University of Rome), Pietro Liò (University of Cambridge)<br>
<strong>Preprint:</strong> <a href="https://arxiv.org/abs/2304.09097">arXiv:2304.09097v3</a>, March 2024 · <a href="https://github.com/antoniopurificato/Sheaf4Rec">code</a>
</div>

## Why a recommender might want a vector space per node

Collaborative filtering on a bipartite user–item graph is the canonical GNN success story: nodes are users and items, edges are observed interactions, and stacked propagation layers cluster users with shared tastes. NGCF, LightGCN and UltraGCN all work this way.

The paper's objection is about representation, not propagation. Every one of those models assigns each user a **single static vector**, and the claim is that this cannot carry what a user is:

> Take, for instance, a user's behaviour, which is influenced by the items they interact with. Traditional vector representations may lack expressive power to capture the nuances of such behaviours, underscoring the need for a full vector space.

<div class="insight-box">
<strong>The mapping onto sheaf structure.</strong> Node stalks hold user and item representations, so the 0-cochains \(C^0\) are the collection of all user and item embeddings. Edge stalks correspond to the <em>observed preference scores</em> \(r_{i,j}\) — the interaction is the discourse space. The restriction map for a (user, item) pair says how that user's representation manifests in that specific interaction, which is precisely the "same user, different context" intuition made into a linear map.
</div>

This is a different use of a sheaf from the rest of Book III. In [NSD](/blog/sheaf/neural-sheaf-diffusion/) or [Sheaf Hypergraph Networks](/blog/sheaf/sheaf-hypergraph-networks/) the sheaf exists to fix heterophily and oversmoothing on a graph whose labels are the target. Here it exists because *relationships are the label* — the ranking task is about the edges, so putting structure on the edges is the natural move.

## The pipeline

Nodes start as bare identifiers, so two embedding tables $$\Psi_u = \bigcup_{j\in U}\psi^u_j$$ and $$\Psi_v = \bigcup_{i \in I}\psi^v_i$$ are randomly initialised and trained end-to-end. The embedded graph feeds a stack of $$N$$ sheaf layers, each aggregating a node's embedding with the transported representations of its neighbours, following the [NSD](/blog/sheaf/neural-sheaf-diffusion/) discretisation $$X(t+1) = X(t) - \sigma(\Delta_{\mathcal{F}(t)}(I_n \otimes W^t_1)X_tW^t_2)$$.

Scoring is a single matrix product. The final layer's user and item representations $$\mathcal{F}^u$$ and $$\mathcal{F}^v$$ combine into

<div class="formula-box">
\[
S = (\mathcal{F}^u)^{\top}\mathcal{F}^v,
\]
</div>

and each row is ranked to produce a user's recommendation list.

Training uses **Bayesian Personalized Ranking**, which fits the setting exactly: positive edges are observed interactions, negatives are absences, and the loss

<div class="formula-box">
\[
\mathrm{BPR}(S) = -\ln\sigma\!\big(s_{\text{pos}} - s_{\text{neg}}\big)
\]
</div>

maximises the probability that an observed item outranks a sampled unobserved one. Mini-batches sample one positive and one negative item per user.

<div class="warning-box">
<strong>The bipartite step is the least reproducible part of the paper.</strong> Sheaf models have trouble on bipartite graphs — NSD's own Proposition 9 is an <em>impossibility</em> result about balanced bipartite graphs, so this is a real obstacle, not a technicality. Sheaf4Rec's answer is one sentence: the method "involves computing a projection on the bipartite graph, transforming it into a structure that is not strictly bipartite but retains the same properties." No equation, no definition of which properties are retained, and no ablation against the unprojected graph. Given that the entire architecture rests on it, this is the gap a reimplementation would hit first.
</div>

## Results

Three datasets spanning four orders of magnitude of density: Facebook Books (1,398 users, 2,933 items, 1,878 ratings, **0.025%** density), Yahoo! Movies (4,000 / 2,626 / 69,846, 0.664%), MovieLens 1M (6,040 / 3,900 / 1,000,000, 4.24%). Splits are 80/10/10; the tuned configuration is 64 latent dimensions and 5 layers.

Headline ranking metrics, with every improvement marked significant by paired Wilcoxon tests at $$p < 0.01$$ with Bonferroni correction:

| | Facebook Books | Yahoo! Movies | MovieLens 1M |
|---|---|---|---|
| **F1@10** | **0.029** (+7.41%) | **0.076** (+4.11%) | **0.140** (+8.53%) |
| **NDCG@10** | **0.066** (+11.29%) | **0.147** (+7.30%) | **0.182** (+7.69%) |
| **F1@20** | **0.024** (+9.09%) | **0.062** (+8.77%) | **0.151** (+7.09%) |
| **NDCG@20** | **0.081** (+3.85%) | **0.162** (+1.82%) | **0.197** (+8.24%) |

The significance testing is worth crediting — it is not standard in this literature, and it converts "our model is better" into a checkable claim. The absolute values are low (F1@10 of 0.029 on Facebook Books) but that is the dataset: 1,878 ratings across 1,398 users is barely more than one interaction each.

<div class="warning-box">
<strong>The gains are recall, not precision.</strong> Table 5 breaks F1 apart, and the picture changes:

<ul>
  <li><strong>MovieLens 1M P@10:</strong> UltraGCN <strong>0.170</strong> and KGTORe 0.153, against Sheaf4Rec's 0.141.</li>
  <li><strong>Facebook Books P@10:</strong> KGTORe <strong>0.021</strong> against Sheaf4Rec's 0.017.</li>
  <li><strong>Recall</strong>, meanwhile, is where Sheaf4Rec leads: 0.104 / 0.202 / 0.138 at \(K=10\).</li>
</ul>

The paper frames this as achieving "a good trade-off between precision and recall", which is fair, but "consistently outperforms all the competing baselines" (its wording for F1) is not true component-wise. Two smaller inconsistencies sit in the same section: the body text names LightGCN as the high-precision/low-recall competitor while LightGCN's numbers are the worst in the table on every metric, and UltraGCN's reported Recall@20 of 0.910 on Facebook Books is out of line with its Precision@20 of 0.011 and with every other row — worth checking against the code before quoting.
</div>

**MRR** tells a consistent story with one honest exception: Sheaf4Rec wins five of six columns, and reports **−5.88%** on MRR@20 for Facebook Books, where KGTORe's 0.054 beats its 0.051. Reporting a negative delta in your own results table is a point in the paper's favour.

## The loss function and the depth ablations

**The loss function.** Table 8 varies the objective on MovieLens 1M:

| Loss | Layers | F1@10 | Training time |
|---|---|---|---|
| RMSE | 2 / 5 | 0.112 / 0.118 | 283 / 371 min |
| BCE | 2 / 5 | 0.087 / 0.101 | 198 / 262 min |
| **BPR** | 2 / 5 | 0.123 / **0.140** | 163 / **210 min** |

BPR wins on accuracy *and* is the cheapest to train, at both depths — a rare clean result. The reading offered is that a ranking loss matches a structure whose edges carry the supervision, which is coherent with the whole design.

**Depth.** Best performance at $$N = 5$$ layers on all three datasets, with NDCG@20 rising monotonically from $$N=1$$. Given that GNN recommenders are notoriously depth-limited — LightGCN's whole design is about avoiding oversmoothing — this is the same oversmoothing-resistance that sheaf models report on node classification, showing up in a different task.

Separately, latent dimension peaks at 64 and degrades at 128 and 256 while training time keeps climbing (to over 300 minutes on MovieLens 1M at $$d = 256$$), so the capacity is not free.

## The matched-parameter expressiveness test

The best-designed experiment is Table 9, which asks whether the sheaf structure earns its keep **at matched parameter count**. Fix the total budget at the sheaf model's $$d \times d$$ and redistribute it across three stalk configurations:

| $$\dim\mathcal{F}(v)$$ | $$\dim\mathcal{F}(e)$$ | Reading | F1@10 | NDCG@10 | NDCG@20 |
|---|---|---|---|---|---|
| 1 | $$N$$ | GAT-equivalent | 0.048 | 0.093 | 0.111 |
| 1 | 1 | fully trivial | 0.045 | 0.093 | 0.114 |
| $$N$$ | $$N$$ | **Sheaf4Rec** | **0.051** | **0.105** | **0.129** |

The full sheaf wins on every metric with the same number of parameters, which is the right way to make an expressiveness argument — it rules out the obvious objection that the gains are just extra capacity.

<div class="warning-box">
<strong>One of the three declared baselines is absent from the table.</strong> Section 6.3.2 and Figure 8 define three configurations: GAT-equivalent \((1, N)\), <strong>GCN-equivalent \((N, 1)\)</strong>, and Sheaf4Rec \((N,N)\). Table 9 reports \((1,N)\), \((1,1)\) and \((N,N)\) — the GCN-equivalent row is described in the text and never reported, while a fully trivial \((1,1)\) row appears that the text does not introduce. Since GCN is the base model most of the strong baselines derive from, that is the comparison a reader most wants. The table also does not say which dataset it uses, and its values (F1@10 of 0.051) are far below Table 4's MovieLens 1M figure of 0.140, so the two are not directly comparable.
</div>

## Checking the efficiency claim

The abstract advertises "substantial runtime improvements ranging from 2.5% up to 37%". Table 7 reports the time to produce 100 recommendations, over 10 attempts:

| Model | Facebook Books | Yahoo! Movies | MovieLens 1M |
|---|---|---|---|
| **Sheaf4Rec** | **0.586** ± 0.045 | **1.309** ± 0.045 | 3.770 ± 0.051 |
| GAT | 0.594 ± 0.090 | 1.344 ± 0.077 | 3.796 ± 0.068 |
| NGCF | 0.607 ± 0.057 | 1.329 ± 0.073 | 3.821 ± 0.060 |
| KGTORe | 0.763 ± 0.110 | 1.458 ± 0.066 | 4.001 ± 0.035 |
| LightGCN | 0.804 ± 0.349 | 1.434 ± 0.377 | **3.633** ± 0.297 |
| UltraGCN | 1.278 ± 0.044 | 1.388 ± 0.111 | 3.823 ± 0.076 |

Against the *fastest* baseline on each dataset the margin is about **1.3%** on Facebook Books and **1.5%** on Yahoo! Movies, and on MovieLens 1M **LightGCN is faster** (3.633 against 3.770). Against the slowest, the gap on Facebook Books is 54% (0.586 against UltraGCN's 1.278). Neither endpoint of the advertised 2.5–37% band appears in the table, and the strongest defensible efficiency statement is the one the paper makes about *stability*: Sheaf4Rec has the lowest standard deviation in every column, against LightGCN's 0.349, 0.377 and 0.297.

That stability claim is real and independently interesting — a sheaf model being the most predictable rather than the most erratic is the opposite of what its complexity would suggest.

## Why this paper matters to the rest of Book III

Two reasons beyond the results.

**It is the sheaf literature's clearest non-node-classification application.** Almost everything in Book III is benchmarked on the same nine heterophilic node-classification datasets, and it is genuinely hard to tell how much of the field's progress is dataset-specific. Sheaf4Rec is evaluated on three ranking datasets against recommender baselines, and the depth result — best at 5 layers — reproduces the oversmoothing-resistance finding in a setting where nothing else about the setup is shared.

**The framing generalises.** The closing suggestion is that sheaves suit "contexts where relationships and their representations are complex and inherently ambiguous", with side information embeddable in the stalks and next-point-of-interest recommendation named as the next target. That is the same argument [Sheaf Hypergraph Networks](/blog/sheaf/sheaf-hypergraph-networks/) makes for group interactions and [HetSheaf](/blog/sheaf/hetsheaf-paper/) makes for typed relations — three papers, largely overlapping author groups, converging on the claim that when the *relation* is the object of interest, it deserves more than a scalar.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Sheaf4Rec puts a cellular sheaf on the bipartite user–item graph: node stalks hold user and item representations, edge stalks correspond to observed preference scores, and scoring is \(S = (\mathcal{F}^u)^{\top}\mathcal{F}^v\).</li>
  <li>Gains of +7.4 to +11.3% on NDCG and +4.1 to +9.1% on F1 across three datasets, all significance-tested with paired Wilcoxon and Bonferroni correction.</li>
  <li>Those gains come from recall. UltraGCN and KGTORe beat Sheaf4Rec on Precision@10 on two of three datasets, so "outperforms all baselines" holds for F1 and NDCG, not component-wise.</li>
  <li>BPR beats RMSE and BCE on both accuracy and training time at both depths — the cleanest result in the paper.</li>
  <li>Best at 5 layers on every dataset: sheaf oversmoothing-resistance reproduced in a ranking task rather than node classification.</li>
  <li>The matched-parameter stalk ablation is the right experiment, but the GCN-equivalent \((N,1)\) configuration is defined in the text and missing from the table, and the table's dataset is unlabelled.</li>
  <li>The abstract's 2.5–37% efficiency range does not match Table 7, where margins over the fastest baselines are ~1–2% and LightGCN is faster on MovieLens 1M. The defensible claim is lowest variance in every column.</li>
  <li>The bipartite projection that makes the whole method work is described in one sentence with no equations.</li>
</ul>
</div>

## References

- Purificato, A., Cassarà, G., Siciliano, F., Liò, P., & Silvestri, F. (2024). [Sheaf4Rec: Sheaf Neural Networks for Graph-based Recommender Systems](https://arxiv.org/abs/2304.09097). *arXiv:2304.09097*.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 TAG-ML Workshop*.
- Duta, I., Cassarà, G., Silvestri, F., & Liò, P. (2023). [Sheaf Hypergraph Networks](https://arxiv.org/abs/2309.17116). *NeurIPS 2023*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Rendle, S., Freudenthaler, C., Gantner, Z., & Schmidt-Thieme, L. (2012). [BPR: Bayesian Personalized Ranking from Implicit Feedback](https://arxiv.org/abs/1205.2618). *arXiv:1205.2618*.
- Wang, X., He, X., Wang, M., Feng, F., & Chua, T.-S. (2019). [Neural Graph Collaborative Filtering](https://arxiv.org/abs/1905.08108). *SIGIR 2019*.
- He, X., Deng, K., Wang, X., Li, Y., Zhang, Y., & Wang, M. (2020). LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation. *SIGIR 2020*.
- Mao, K., Zhu, J., Xiao, X., Lu, B., Wang, Z., & He, X. (2023). [UltraGCN: Ultra Simplification of Graph Convolutional Networks for Recommendation](https://arxiv.org/abs/2110.15114). *arXiv:2110.15114*.
- Mancino, A. C. M., Ferrara, A., Bufi, S., Malitesta, D., Di Noia, T., & Di Sciascio, E. (2023). KGTORe: Tailored Recommendations through Knowledge-Aware GNN Models. *RecSys 2023*, 576–587.
- Oono, K., & Suzuki, T. (2019). [Graph Neural Networks Exponentially Lose Expressive Power for Node Classification](https://arxiv.org/abs/1905.10947). *arXiv:1905.10947*.
