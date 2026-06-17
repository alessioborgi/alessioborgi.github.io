---
layout: single
title: "The Boundary Matrix and Reduction Algorithm"
categories: [persistent-homology]
book: persistent-homology
subsection: computation
tags: [boundary-matrix, reduction-algorithm, persistence-pairs, left-to-right-reduction, Gaussian-elimination]
published: false
excerpt: "Persistent homology computation reduces to column operations on the boundary matrix ∂ — a sparse binary matrix encoding which simplices bound which. The standard reduction algorithm applies left-to-right column elimination (analogous to Gaussian elimination over GF(2)) to reveal all persistence pairs. This post explains the algorithm step by step with a worked example."
author_profile: true
read_time: true
is_overview: false
icon: "🧮"
read_mins: 5
permalink: /blog/persistent-homology/boundary-matrix/
---
{% include figure image_path="/images/blog/tdl/gabrielsson2020_gfl.png" alt="Boundary matrix computation" caption="Simplicial complex structure for boundary computation (Gabrielsson et al., 2020)" %}

## Intuition First

Think of the boundary matrix as a checklist: for each "higher-dimensional piece" (a triangle, tetrahedron, …) of your simplicial complex, it records which "lower-dimensional pieces" (edges, triangles, …) form its boundary.

Reducing this matrix is like performing Gaussian elimination, but over **GF(2)** (arithmetic mod 2, so $1 + 1 = 0$). Each column that cannot be fully eliminated creates a **cycle** that lives forever (a generator of homology). Each column that does get eliminated by an earlier column creates a **persistence pair**: the earlier column "kills" the cycle that the later column "created."

Reading off birth–death pairs from the reduced matrix gives you the complete persistence diagram — no geometry needed beyond the order in which simplices enter the filtration.

---

## The Boundary Matrix

Let $K$ be a simplicial complex with $m$ simplices, ordered compatibly with the filtration: $\sigma_1 \prec \sigma_2 \prec \cdots \prec \sigma_m$. The **boundary matrix** $\partial \in \{0,1\}^{m \times m}$ is defined by

$$\partial[i,j] = \begin{cases} 1 & \text{if } \sigma_i \text{ is a codimension-1 face of } \sigma_j \\ 0 & \text{otherwise.} \end{cases}$$

Because a face of $\sigma_j$ must precede $\sigma_j$ in any filtration ordering, $\partial$ is strictly upper triangular.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The boundary matrix is strictly upper-triangular by construction, because every face of a simplex must appear earlier in the filtration. This means column $j$ can only have 1-entries in rows $i < j$. The entire reduction algorithm exploits this structure to run efficiently.</div>

---

## The Reduction Algorithm

Define **pivot** of a column as the index of its lowest (largest-row-index) nonzero entry. A column with no nonzero entries has no pivot.

```
R = copy of ∂          # R will become the reduced matrix
V = identity matrix    # tracks column operations: ∂ = R·V⁻¹

for j = 1 to m:
    while ∃ j' < j with pivot(R[j']) == pivot(R[j]):
        R[j] += R[j']   # add column j' to column j  (mod 2)
        V[j] += V[j']
```

After termination:
- If column $j$ of $R$ is **zero**, simplex $\sigma_j$ **creates** a homology class (birth at filtration value $f(\sigma_j)$).
- If column $j$ of $R$ is **nonzero** with pivot row $i$, then $(\sigma_i, \sigma_j)$ is a **persistence pair** (birth at $f(\sigma_i)$, death at $f(\sigma_j)$).

The decomposition $\partial = R V^{-1}$ (equivalently $\partial V = R$) is called the **$R = DV$ decomposition** in the literature.

---

## Worked Example: A Triangle Filtration

Consider a filtered simplicial complex built by adding simplices in this order:

| Index | Simplex | Dimension | Filtration value |
|-------|---------|-----------|-----------------|
| 1 | $v_0$ | 0 | 0 |
| 2 | $v_1$ | 0 | 1 |
| 3 | $v_2$ | 0 | 2 |
| 4 | $e_{01}$ | 1 | 3 |
| 5 | $e_{12}$ | 1 | 4 |
| 6 | $e_{02}$ | 1 | 5 |
| 7 | $T_{012}$ | 2 | 6 |

The boundary matrix $\partial$ (rows = simplices 1–7, columns = simplices 1–7):

$$\partial = \begin{pmatrix} 0&0&0&1&0&1&0\\ 0&0&0&1&1&0&0\\ 0&0&0&0&1&1&0\\ 0&0&0&0&0&0&1\\ 0&0&0&0&0&0&1\\ 0&0&0&0&0&0&1\\ 0&0&0&0&0&0&0 \end{pmatrix}$$

**Column 4** ($e_{01}$): pivot = row 2. No earlier column has pivot 2. Leave as is.

**Column 5** ($e_{12}$): pivot = row 3. No earlier column has pivot 3. Leave as is.

**Column 6** ($e_{02}$): pivot = row 3. Column 5 also has pivot 3. Add column 5 to column 6:

$$R[6] \leftarrow R[6] + R[5] = (1,0,1,0,0,0,0)^T + (0,1,1,0,0,0,0)^T = (1,1,0,0,0,0,0)^T$$

New pivot of column 6 = row 2. Column 4 has pivot 2. Add column 4 to column 6:

$$R[6] \leftarrow (1,1,0,\ldots) + (1,1,0,\ldots) = (0,0,0,\ldots)$$

Column 6 becomes zero! So $e_{02}$ **creates** a 1-cycle. But wait — we now check column 7 ($T_{012}$), which has pivot = row 6. No other column has pivot 6, so column 7 stays. The pair $(e_{02}, T_{012})$ gives birth=5, death=6.

**Reading off the diagram:**
- $(v_0)$: birth=0, never dies → $(0, \infty)$ in $H_0$
- $(v_1, e_{01})$: birth=1, death=3 → bar $(1,3)$ in $H_0$
- $(v_2, e_{12})$: birth=2, death=4 → bar $(2,4)$ in $H_0$
- $(e_{02}, T_{012})$: birth=5, death=6 → bar $(5,6)$ in $H_1$

---

## Animated Column Reduction

<style>
@keyframes highlightCol {
  0%   { opacity: 0.2; }
  40%  { opacity: 1; }
  100% { opacity: 1; }
}
@keyframes xorFlash {
  0%   { fill: #fef9c3; }
  50%  { fill: #fde68a; }
  100% { fill: #dcfce7; }
}
.col-anim { animation: highlightCol 0.6s ease forwards; }
.xor-cell { animation: xorFlash 0.8s ease forwards; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;display:block;margin:auto;">
  <!-- Title -->
  <text x="230" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b">Column Reduction — Step: add col 5 into col 6</text>

  <!-- Column headers -->
  <text x="80"  y="38" text-anchor="middle" font-size="10" fill="#64748b">col 4</text>
  <text x="130" y="38" text-anchor="middle" font-size="10" fill="#64748b">col 5</text>
  <text x="200" y="38" text-anchor="middle" font-size="10" fill="#f97316" font-weight="bold">col 6 (before)</text>
  <text x="320" y="38" text-anchor="middle" font-size="10" fill="#10b981" font-weight="bold">col 6 (after)</text>

  <!-- Row labels -->
  <text x="30" y="60"  text-anchor="end" font-size="10" fill="#64748b">row 1 (v₀)</text>
  <text x="30" y="80"  text-anchor="end" font-size="10" fill="#64748b">row 2 (v₁)</text>
  <text x="30" y="100" text-anchor="end" font-size="10" fill="#64748b">row 3 (v₂)</text>
  <text x="30" y="120" text-anchor="end" font-size="10" fill="#64748b">row 4 (e₀₁)</text>
  <text x="30" y="140" text-anchor="end" font-size="10" fill="#64748b">row 5 (e₁₂)</text>
  <text x="30" y="160" text-anchor="end" font-size="10" fill="#64748b">row 6 (e₀₂)</text>
  <text x="30" y="180" text-anchor="end" font-size="10" fill="#64748b">row 7 (T)</text>

  <!-- Col 4 -->
  <rect x="55" y="47" width="50" height="20" fill="#f1f5f9" rx="3"/>
  <text x="80" y="61"  text-anchor="middle" font-size="11" fill="#1e293b">1</text>
  <rect x="55" y="67" width="50" height="20" fill="#dbeafe" rx="3"/>
  <text x="80" y="81"  text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">1</text>
  <rect x="55" y="87" width="50" height="20" fill="#f1f5f9" rx="3"/>
  <text x="80" y="101" text-anchor="middle" font-size="11" fill="#94a3b8">0</text>
  <rect x="55" y="107" width="50" height="80" fill="#f1f5f9" rx="3"/>
  <text x="80" y="151" text-anchor="middle" font-size="11" fill="#94a3b8">0…</text>

  <!-- Col 5 -->
  <rect x="105" y="47" width="50" height="20" fill="#f1f5f9" rx="3" class="col-anim" style="animation-delay:0.3s"/>
  <text x="130" y="61"  text-anchor="middle" font-size="11" fill="#94a3b8">0</text>
  <rect x="105" y="67" width="50" height="20" fill="#f1f5f9" rx="3" class="col-anim" style="animation-delay:0.4s"/>
  <text x="130" y="81"  text-anchor="middle" font-size="11" fill="#94a3b8">1</text>
  <rect x="105" y="87" width="50" height="20" fill="#dbeafe" rx="3" class="col-anim" style="animation-delay:0.5s"/>
  <text x="130" y="101" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">1</text>
  <rect x="105" y="107" width="50" height="80" fill="#f1f5f9" rx="3"/>
  <text x="130" y="151" text-anchor="middle" font-size="11" fill="#94a3b8">0…</text>

  <!-- Col 6 before -->
  <rect x="175" y="47" width="50" height="20" fill="#fef9c3" rx="3"/>
  <text x="200" y="61"  text-anchor="middle" font-size="11" fill="#92400e">1</text>
  <rect x="175" y="67" width="50" height="20" fill="#fef9c3" rx="3"/>
  <text x="200" y="81"  text-anchor="middle" font-size="11" fill="#92400e">0</text>
  <rect x="175" y="87" width="50" height="20" fill="#fef9c3" rx="3"/>
  <text x="200" y="101" text-anchor="middle" font-size="11" fill="#92400e">1</text>
  <rect x="175" y="107" width="50" height="80" fill="#fef9c3" rx="3"/>
  <text x="200" y="151" text-anchor="middle" font-size="11" fill="#92400e">0…</text>

  <!-- Arrow -->
  <text x="240" y="105" text-anchor="middle" font-size="18" fill="#64748b">→</text>
  <text x="240" y="120" text-anchor="middle" font-size="9"  fill="#64748b">+col5</text>
  <text x="240" y="132" text-anchor="middle" font-size="9"  fill="#64748b">mod 2</text>

  <!-- Col 6 after -->
  <rect x="295" y="47" width="50" height="20" fill="#dcfce7" rx="3" class="xor-cell" style="animation-delay:0.9s"/>
  <text x="320" y="61"  text-anchor="middle" font-size="11" fill="#166534" font-weight="bold">1</text>
  <rect x="295" y="67" width="50" height="20" fill="#dcfce7" rx="3" class="xor-cell" style="animation-delay:1.0s"/>
  <text x="320" y="81"  text-anchor="middle" font-size="11" fill="#166534" font-weight="bold">1</text>
  <rect x="295" y="87" width="50" height="20" fill="#dcfce7" rx="3" class="xor-cell" style="animation-delay:1.1s"/>
  <text x="320" y="101" text-anchor="middle" font-size="11" fill="#166534" font-weight="bold">0</text>
  <rect x="295" y="107" width="50" height="80" fill="#dcfce7" rx="3"/>
  <text x="320" y="151" text-anchor="middle" font-size="11" fill="#166534">0…</text>

  <!-- Pivot annotation -->
  <text x="360" y="82" font-size="10" fill="#7c3aed">← new pivot = row 2</text>
  <line x1="350" y1="79" x2="348" y2="79" stroke="#7c3aed" stroke-width="1"/>
</svg>
<figcaption>GF(2) column addition: adding col 5 into col 6 flips the pivot from row 3 to row 2, enabling a further reduction step.</figcaption>
</figure>
</div>

---

## Complexity and Optimisations

The naive algorithm runs in $O(m^3)$ over GF(2). Several improvements exist:

| Technique | Idea | Speedup |
|-----------|------|---------|
| **Clearing lemma** | If $\sigma_j$ pairs with $\sigma_i$, all faces of $\sigma_j$ can be cleared | Major in practice |
| **Cohomological** | Transpose the matrix; cohomological pairs are dual | Used in Ripser |
| **Apparent pairs** | Simplex/coface pairs computable in $O(1)$ — no column ops needed | Dominant in Rips |
| **Sparse representation** | Store only nonzero entries | Memory savings |

The clearing lemma alone reduces the number of columns requiring reduction by often more than 90% on real datasets.

---

## References

- Edelsbrunner, H., Letscher, D., & Zomorodian, A. (2002). *Topological persistence and simplification.* Discrete & Computational Geometry.
- Zomorodian, A., & Carlsson, G. (2005). *Computing persistent homology.* Discrete & Computational Geometry.
- Cohen-Steiner, D., Edelsbrunner, H., & Morozov, D. (2006). *Vines and vineyards by updating persistence in linear time.* SCG.
