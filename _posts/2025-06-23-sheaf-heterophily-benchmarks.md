---
layout: single
title: "Sheaf GNNs for Heterophilic Node Classification: Benchmarks and Results"
date: 2025-06-23
categories: [sheaf]
book: sheaf
subsection: applications
tags: [heterophily, benchmark, Chameleon, Squirrel, Cornell, Texas, node-classification, empirical]
excerpt: "A systematic comparison of sheaf GNNs against baselines on standard heterophilic node classification benchmarks. Which datasets benefit most from sheaf structure? How does stalk dimension d affect performance? When do sheaves win — and when don't they?"
author_profile: true
read_time: true
is_overview: false
icon: "📊"
read_mins: 6
permalink: /blog/sheaf/heterophily-benchmarks/
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
<strong>TL;DR:</strong> NSD and PNSD achieve state-of-the-art on all major heterophilic benchmarks (Cornell, Texas, Wisconsin, Chameleon, Squirrel, Actor) as of 2022–2024. The gains are largest on datasets with low homophily ratio (Cornell h=0.11, Texas h=0.11) and smallest on datasets where high-pass filtering alone is sufficient (Actor h=0.22). Stalk dimension d=2 is optimal on most datasets; d>5 rarely helps and increases overfitting.
</div>

## The Heterophilic Benchmark Suite

The standard heterophilic node classification benchmarks (from Pei et al., 2020 and Lim et al., 2021):

| Dataset | Nodes | Edges | Classes | Homophily h | Notes |
|---|---|---|---|---|---|
| Cornell | 183 | 295 | 5 | 0.11 | WebKB university pages |
| Texas | 183 | 309 | 5 | 0.11 | WebKB university pages |
| Wisconsin | 251 | 499 | 5 | 0.20 | WebKB university pages |
| Actor | 7,600 | 30,019 | 5 | 0.22 | Film actor co-occurrence |
| Chameleon | 2,277 | 36,101 | 5 | 0.23 | Wikipedia chameleon pages |
| Squirrel | 5,201 | 217,073 | 5 | 0.22 | Wikipedia squirrel pages |
| Roman-Empire | 22,662 | 65,854 | 18 | 0.05 | Wikipedia Roman Empire article |
| Amazon-Ratings | 24,492 | 186,100 | 5 | 0.38 | Amazon product ratings |

Homophily ratio h = |{(u,v): y_u=y_v}| / |E| — lower means more heterophilic.

## Comprehensive Results: All Methods on All Datasets

Results from NSD (Bodnar et al., 2022) and PNSD (Zaghen et al., 2024):

**Cornell (h=0.11):**
| Model | Accuracy |
|---|---|
| GCN | 57.0 ± 4.7 |
| GraphSAGE | 67.3 ± 7.8 |
| GAT | 54.3 ± 7.2 |
| APPNP | 73.5 ± 6.4 |
| GPRGNN | 80.3 ± 8.1 |
| FAGCN | 79.2 ± 9.8 |
| H2GCN | 82.7 ± 5.3 |
| NSD-diag | 83.6 ± 4.2 |
| NSD-orth | 85.0 ± 4.8 |
| **PNSD-orth** | **87.8 ± 3.9** |

**Squirrel (h=0.22):**
| Model | Accuracy |
|---|---|
| GCN | 36.9 ± 1.3 |
| GAT | 40.7 ± 1.6 |
| GPRGNN | 50.4 ± 1.5 |
| FAGCN | 43.8 ± 1.4 |
| NSD-diag | 56.5 ± 1.2 |
| NSD-orth | 57.1 ± 1.3 |
| **PNSD-orth** | **60.8 ± 1.1** |

## What Drives the Performance Gains?

**1. Null space adaptation:** NSD learns maps that make the task-optimal features lie in ker(Δ_F). For Cornell and Texas (h=0.11), this requires strong anti-alignment maps (F_{v▷e} ≈ −I) for heterophilic edges — the model learns these automatically.

**2. Spectral flexibility (PNSD):** On Chameleon and Squirrel, PNSD learns high-pass filters — amplifying the high-frequency components that differentiate between classes. This cannot be achieved by NSD's fixed (I−Δ_F) filter.

**3. Stalk dimension:** Larger d → richer null space → better representations. But d>5 often overfits on small datasets (Cornell has only 183 nodes).

## Stalk Dimension Ablation

On Cornell, varying stalk dimension d:

| d | NSD-diag | NSD-orth |
|---|---|---|
| 1 | 78.9 | 79.2 |
| 2 | 83.6 | 85.0 |
| 3 | 83.9 | 85.3 |
| 4 | 83.4 | 84.7 |
| 8 | 82.1 | 83.8 |

Peak at d=2 or d=3 — larger d brings diminishing returns and higher overfitting risk for small graphs.

**On larger datasets (Chameleon, Squirrel):** Peak d is higher (d=4 or d=5) because the larger training set supports higher-capacity models.

<div class="insight-box">
<strong>Practical recommendation:</strong> Start with d=2. Try d=3 and d=4. Use cross-validation on the validation set to select d. Do not exceed d=5 without explicit regularisation (L2 on maps, dropout on stalks).
</div>

## Map Type Ablation

On heterophilic benchmarks, comparing map types:

| Map type | Cornell | Chameleon | Squirrel |
|---|---|---|---|
| Scalar (sign only) | 80.2 | 63.5 | 50.1 |
| Diagonal | 83.6 | 69.4 | 56.5 |
| Symmetric | 84.1 | 70.1 | 57.0 |
| Orthogonal | 85.0 | 70.2 | 57.1 |
| General (d²) | 84.4 | 69.8 | 56.9 |

Orthogonal maps achieve the best results, likely because gauge equivariance prevents degenerate maps and stabilises training. General maps can sometimes overfit (especially on small graphs like Cornell).

## When Do Sheaves Win Decisively?

Sheaf GNNs outperform all non-sheaf methods when:
1. **Low homophily (h < 0.25):** heterophily is the dominant challenge
2. **Many edges per node:** the sheaf has enough information to learn meaningful restriction maps
3. **Moderate graph size (100–10K nodes):** enough data for map learning, small enough to keep cost manageable

## When Do Sheaves Not Help?

Sheaf GNNs offer small or no benefit when:
1. **High homophily (h > 0.6):** Cora, Citeseer, Pubmed — standard GCN already works well
2. **Very small graphs (N < 100):** insufficient training data for map learning
3. **Very large graphs (N > 100K):** sheaf map prediction over all edges is expensive; approximate methods needed
4. **No edge features or node features:** the sheaf predictor MLP needs input features to learn meaningful maps

## New Benchmarks: Roman-Empire and Amazon-Ratings

Lim et al. (2021) introduced more reliable heterophilic benchmarks:

**Roman-Empire (h=0.05):** 22,662 nodes, 65,854 edges, Wikipedia text data. Very low homophily. NSD achieves 73.5% vs GCN's 59.4%.

**Amazon-Ratings (h=0.38):** 24,492 nodes, 186,100 edges. Moderately heterophilic. NSD achieves 48.7% vs GCN's 42.3%.

These larger, more realistic benchmarks confirm that sheaf GNNs provide consistent gains on heterophilic data, even at scales where the original WebKB datasets (Cornell, Texas, Wisconsin) were too small to draw reliable conclusions.

## Practical Implementation Checklist

For a new heterophilic dataset:

1. Compute homophily ratio h. If h > 0.6: use standard GCN first.
2. Choose d=2 initially, map type = diagonal.
3. Use 2–3 sheaf layers (deeper is rarely better with sheaves).
4. Add a skip connection: H ← (1−α)(I−Δ_F^{norm})HW + αX₀W' (residual to initial features).
5. Regularise: L2 on map norms (λ=1e-4), dropout on stalk features (p=0.5).
6. If performance saturates: try orthogonal maps, d=3, or PNSD with K=5 polynomial filter.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (primary benchmark source for NSD results on Cornell, Texas, Wisconsin, Actor, Chameleon, Squirrel).
- Lim, D., Li, X., Hohne, F., & Lim, S.-N. (2021). [New Benchmarks for Learning on Non-Homophilous Graphs](https://arxiv.org/abs/2104.01404). *arXiv 2021* (introduces Roman-Empire and Amazon-Ratings — larger, more reliable heterophilic benchmarks).
- Zhu, M., Wang, X., Shi, C., Ji, H., & Cui, P. (2020). [Beyond Homophily in Graph Neural Networks: Current Limitations and Effective Designs](https://arxiv.org/abs/2006.11468). *NeurIPS 2020* (H2GCN: the non-sheaf baseline that NSD surpasses on all heterophilic benchmarks).
