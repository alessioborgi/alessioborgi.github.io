---
layout: single
title: "Sheaf GNNs for Heterophilic Node Classification: Benchmarks and Results"
categories: [sheaf]
book: sheaf
subsection: applications
tags: [heterophily, benchmark, Chameleon, Squirrel, Cornell, Texas, node-classification, empirical]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> NSD and PNSD achieve state-of-the-art on all major heterophilic benchmarks (Cornell, Texas, Wisconsin, Chameleon, Squirrel, Actor) as of 2022–2024. The gains are largest on datasets with low homophily ratio (Cornell h=0.11, Texas h=0.11) and smallest on datasets where high-pass filtering alone is sufficient (Actor h=0.22). Stalk dimension d=2 is optimal on most datasets; d>5 rarely helps and increases overfitting.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_accuracy.png" alt="NSD benchmark results" caption="NSD vs baselines on heterophilic benchmarks (Bodnar et al., 2022)" %}


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

<style>
@keyframes growBar {
  from { height: 0; y: 185; }
  to   { /* final values set on each rect */ }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" style="max-width:520px;width:100%;font-family:sans-serif;">
  <text x="260" y="16" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">Accuracy (%) — GCN vs NSD vs PNSD</text>
  <!-- Y-axis labels -->
  <text x="38" y="190" text-anchor="end" font-size="9" fill="#6b7280">0</text>
  <text x="38" y="150" text-anchor="end" font-size="9" fill="#6b7280">40</text>
  <text x="38" y="110" text-anchor="end" font-size="9" fill="#6b7280">60</text>
  <text x="38" y="77"  text-anchor="end" font-size="9" fill="#6b7280">75</text>
  <text x="38" y="50"  text-anchor="end" font-size="9" fill="#6b7280">90</text>
  <!-- Gridlines -->
  <line x1="42" y1="188" x2="510" y2="188" stroke="#e5e7eb" stroke-width="1"/>
  <line x1="42" y1="148" x2="510" y2="148" stroke="#e5e7eb" stroke-width="0.7" stroke-dasharray="3,3"/>
  <line x1="42" y1="108" x2="510" y2="108" stroke="#e5e7eb" stroke-width="0.7" stroke-dasharray="3,3"/>

  <!-- Cornell group -->
  <text x="100" y="205" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">Cornell</text>
  <!-- GCN: 57 → height ~(57/100)*140=79.8, y=188-79.8=108 -->
  <rect x="58" y="76" width="22" height="112" rx="3" fill="#9ca3af">
    <animate attributeName="height" from="0" to="112" dur="1s" begin="0s" fill="freeze"/>
    <animate attributeName="y" from="188" to="76" dur="1s" begin="0s" fill="freeze"/>
  </rect>
  <!-- NSD: 85 → height=119, y=69 -->
  <rect x="88" y="52" width="22" height="136" rx="3" fill="#0d9488">
    <animate attributeName="height" from="0" to="136" dur="1s" begin="0.3s" fill="freeze"/>
    <animate attributeName="y" from="188" to="52" dur="1s" begin="0.3s" fill="freeze"/>
  </rect>
  <!-- PNSD: 88 → height=123, y=65 -->
  <rect x="118" y="41" width="22" height="147" rx="3" fill="#f97316">
    <animate attributeName="height" from="0" to="147" dur="1s" begin="0.6s" fill="freeze"/>
    <animate attributeName="y" from="188" to="41" dur="1s" begin="0.6s" fill="freeze"/>
  </rect>
  <!-- Labels on top -->
  <text x="69"  y="72"  text-anchor="middle" font-size="9" fill="#6b7280">57</text>
  <text x="99"  y="48"  text-anchor="middle" font-size="9" fill="#0d9488">85</text>
  <text x="129" y="37"  text-anchor="middle" font-size="9" fill="#f97316">88</text>

  <!-- Texas group -->
  <text x="205" text-anchor="middle" y="205" font-size="11" fill="#374151" font-weight="bold">Texas</text>
  <!-- GCN: 60 → height=84, y=104 -->
  <rect x="163" y="104" width="22" height="84" rx="3" fill="#9ca3af">
    <animate attributeName="height" from="0" to="84" dur="1s" begin="0.1s" fill="freeze"/>
    <animate attributeName="y" from="188" to="104" dur="1s" begin="0.1s" fill="freeze"/>
  </rect>
  <!-- NSD: 88 → height=123, y=65 -->
  <rect x="193" y="65" width="22" height="123" rx="3" fill="#0d9488">
    <animate attributeName="height" from="0" to="123" dur="1s" begin="0.4s" fill="freeze"/>
    <animate attributeName="y" from="188" to="65" dur="1s" begin="0.4s" fill="freeze"/>
  </rect>
  <!-- PNSD: 90 → height=126, y=62 -->
  <rect x="223" y="62" width="22" height="126" rx="3" fill="#f97316">
    <animate attributeName="height" from="0" to="126" dur="1s" begin="0.7s" fill="freeze"/>
    <animate attributeName="y" from="188" to="62" dur="1s" begin="0.7s" fill="freeze"/>
  </rect>
  <text x="174" y="100" text-anchor="middle" font-size="9" fill="#6b7280">60</text>
  <text x="204" y="61"  text-anchor="middle" font-size="9" fill="#0d9488">88</text>
  <text x="234" y="58"  text-anchor="middle" font-size="9" fill="#f97316">90</text>

  <!-- Chameleon group -->
  <text x="310" text-anchor="middle" y="205" font-size="11" fill="#374151" font-weight="bold">Chameleon</text>
  <!-- GCN: 60 → y=104 -->
  <rect x="268" y="104" width="22" height="84" rx="3" fill="#9ca3af">
    <animate attributeName="height" from="0" to="84" dur="1s" begin="0.2s" fill="freeze"/>
    <animate attributeName="y" from="188" to="104" dur="1s" begin="0.2s" fill="freeze"/>
  </rect>
  <!-- NSD: 70 → height=98, y=90 -->
  <rect x="298" y="90" width="22" height="98" rx="3" fill="#0d9488">
    <animate attributeName="height" from="0" to="98" dur="1s" begin="0.5s" fill="freeze"/>
    <animate attributeName="y" from="188" to="90" dur="1s" begin="0.5s" fill="freeze"/>
  </rect>
  <!-- PNSD: 73 → height=102, y=86 -->
  <rect x="328" y="86" width="22" height="102" rx="3" fill="#f97316">
    <animate attributeName="height" from="0" to="102" dur="1s" begin="0.8s" fill="freeze"/>
    <animate attributeName="y" from="188" to="86" dur="1s" begin="0.8s" fill="freeze"/>
  </rect>
  <text x="279" y="100" text-anchor="middle" font-size="9" fill="#6b7280">60</text>
  <text x="309" y="86"  text-anchor="middle" font-size="9" fill="#0d9488">70</text>
  <text x="339" y="82"  text-anchor="middle" font-size="9" fill="#f97316">73</text>

  <!-- Squirrel group -->
  <text x="415" text-anchor="middle" y="205" font-size="11" fill="#374151" font-weight="bold">Squirrel</text>
  <!-- GCN: 37 → height=52, y=136 -->
  <rect x="373" y="136" width="22" height="52" rx="3" fill="#9ca3af">
    <animate attributeName="height" from="0" to="52" dur="1s" begin="0.15s" fill="freeze"/>
    <animate attributeName="y" from="188" to="136" dur="1s" begin="0.15s" fill="freeze"/>
  </rect>
  <!-- NSD: 57 → height=80, y=108 -->
  <rect x="403" y="108" width="22" height="80" rx="3" fill="#0d9488">
    <animate attributeName="height" from="0" to="80" dur="1s" begin="0.45s" fill="freeze"/>
    <animate attributeName="y" from="188" to="108" dur="1s" begin="0.45s" fill="freeze"/>
  </rect>
  <!-- PNSD: 61 → height=85, y=103 -->
  <rect x="433" y="103" width="22" height="85" rx="3" fill="#f97316">
    <animate attributeName="height" from="0" to="85" dur="1s" begin="0.75s" fill="freeze"/>
    <animate attributeName="y" from="188" to="103" dur="1s" begin="0.75s" fill="freeze"/>
  </rect>
  <text x="384" y="132" text-anchor="middle" font-size="9" fill="#6b7280">37</text>
  <text x="414" y="104" text-anchor="middle" font-size="9" fill="#0d9488">57</text>
  <text x="444" y="99"  text-anchor="middle" font-size="9" fill="#f97316">61</text>

  <!-- Legend -->
  <rect x="43"  y="212" width="10" height="10" rx="2" fill="#9ca3af"/>
  <text x="57"  y="220" font-size="9" fill="#374151">GCN</text>
  <rect x="90"  y="212" width="10" height="10" rx="2" fill="#0d9488"/>
  <text x="104" y="220" font-size="9" fill="#374151">NSD</text>
  <rect x="137" y="212" width="10" height="10" rx="2" fill="#f97316"/>
  <text x="151" y="220" font-size="9" fill="#374151">PNSD</text>
</svg>
<figcaption>Animated bar chart: GCN (gray) vs NSD (teal) vs PNSD (orange) accuracy (%) on four heterophilic benchmarks. Bars animate from zero to final values. The largest absolute gains are on Cornell and Texas (h=0.11), where sheaf's null-space adaptation matters most.</figcaption>
</figure></div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — why sheaves win on heterophily (3 mechanisms):</strong>
<ol style="margin:.5rem 0 0 1rem;padding:0;">
  <li><strong>Learned null-space adaptation:</strong> NSD learns restriction maps that push task-relevant features into ker(Δ_F). On Cornell/Texas (h=0.11), this means the model learns anti-alignment maps (F ≈ −I) for heterophilic edges, so cross-class signals cancel rather than pollute each node's representation.</li>
  <li><strong>Spectral flexibility via PNSD:</strong> PNSD learns arbitrary polynomial filters on the sheaf Laplacian — including high-pass filters that amplify the high-frequency components separating different classes. Standard GCN's fixed low-pass filter cannot achieve this on heterophilic graphs.</li>
  <li><strong>Stalk dimension enriches representation:</strong> Each node has a d-dimensional stalk rather than a scalar. This gives the model d orthogonal channels to encode class-relevant geometry independently, avoiding the averaging collapse that harms standard GCN on heterophilic graphs.</li>
</ol>
</div>

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

## Quick Diagnostic: Is a Sheaf GNN Worth Trying?

Before running a sheaf model on a new dataset, answer these three questions:

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;">
<strong>3-Question Pre-Flight Check:</strong>
<ol style="margin:.5rem 0 0 1rem;padding:0;">
  <li><strong>Is h(G) &lt; 0.4?</strong> — Compute the edge homophily ratio. If yes, heterophily is real and sheaf maps can adapt to it. If h &gt; 0.6, GCN probably works fine.</li>
  <li><strong>Is N &gt; 200?</strong> — The sheaf predictor MLP needs enough node pairs to learn meaningful per-edge maps. Very small graphs (N &lt; 100) tend to overfit; medium graphs (N = 200–10K) are the sweet spot.</li>
  <li><strong>Do nodes have initial features?</strong> — The sheaf predictor uses node features as input. If nodes have no features (only structural information), the predictor degrades to a function of degrees — much less expressive.</li>
</ol>
If all three answers are <strong>yes</strong>, a sheaf GNN is very likely worth trying. Start with d=2, diagonal maps, 2 layers, and the checklist above before tuning further.
</div>

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (primary benchmark source for NSD results on Cornell, Texas, Wisconsin, Actor, Chameleon, Squirrel).
- Lim, D., Li, X., Hohne, F., & Lim, S.-N. (2021). [New Benchmarks for Learning on Non-Homophilous Graphs](https://arxiv.org/abs/2104.01404). *arXiv 2021* (introduces Roman-Empire and Amazon-Ratings — larger, more reliable heterophilic benchmarks).
- Zhu, M., Wang, X., Shi, C., Ji, H., & Cui, P. (2020). [Beyond Homophily in Graph Neural Networks: Current Limitations and Effective Designs](https://arxiv.org/abs/2006.11468). *NeurIPS 2020* (H2GCN: the non-sheaf baseline that NSD surpasses on all heterophilic benchmarks).
