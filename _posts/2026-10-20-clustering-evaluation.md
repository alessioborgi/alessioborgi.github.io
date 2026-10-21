---
layout: "single"
title: "Evaluating Clustering: Silhouettes, Stability, External Labels and Useful Partitions"
date: "2026-10-20 10:22:00 +0100"
categories: ["basics"]
book: "basics"
subsection: clustering
tags: ["machine-learning", "clustering", "evaluation", "stability"]
excerpt: "Calculate silhouette and pair agreement, diagnose misleading cluster-count criteria, and design evaluations that match the purpose of an unsupervised analysis."
author_profile: true
read_time: true
is_overview: false
icon: "🧪"
read_mins: 5
permalink: "/blog/basics/clustering-evaluation/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> There is no universal clustering score because algorithms encode different definitions of a group. Internal scores measure geometry, external scores compare with supplied labels, and stability measures sensitivity to data or procedure. A convincing result combines these with the actual use of the partition.
</div>

## Begin with the intended claim

Clustering can compress vectors, identify operating regimes, organise documents or suggest biological populations. Success differs across these tasks. A partition that minimises squared reconstruction error may be excellent compression and poor evidence for distinct populations.

Write down what a useful result would enable before examining a coloured plot. Specify the representation, distance, treatment of noise and whether every observation must be assigned. If external labels exist, decide whether they represent the desired grouping or merely one convenient annotation.

## Why training inertia cannot choose k

For k-means, adding centres cannot worsen the globally optimal training objective. At k=n, every observation can have its own centre and zero error. Therefore the smallest training inertia is not a useful selection rule by itself.

An elbow searches for diminishing returns, but a smooth continuum may have no natural kink. Separate local optimisation runs can also produce an irregular curve because some runs find poorer minima. Use restarts and distinguish optimisation variation from genuine changes in representational capacity.

Held-out quantisation error measures how well a codebook compresses new observations. It is valuable when compression is the goal, but still does not prove that its cells are natural populations.

## Calculate a silhouette

For an observation i, let a(i) be mean distance to other members of its own cluster and b(i) the smallest mean distance to another cluster. Then

<div class="formula-box">
\[
s(i)=\frac{b(i)-a(i)}{\max\{a(i),b(i)\}}.
\]
</div>

Take clusters $$A=\{0,1\}$$ and $$B=\{5,6\}$$ on the number line. For point 1, a=1 and b=4.5, so $$s=3.5/4.5\approx0.778$$. It is much closer on average to its own group.

Singleton clusters need a stated convention; common implementations assign silhouette zero. A partition with only one cluster has no alternative group for b. Noise requires a policy too: treating all noise as one cluster and excluding it answer different questions.

Silhouette rewards compact separated groups under the selected distance. It can penalise valid curved density-connected groups because distant points on the same curve inflate a. The score is therefore not a neutral judge between [k-means](/blog/basics/k-means/) and [DBSCAN](/blog/basics/dbscan/).

## External agreement must ignore label names

Cluster numbers are arbitrary. Predictions labelled 0,0,1,1 and 7,7,3,3 describe the same partition. A naive classification accuracy can therefore be meaningless unless labels are aligned, and alignment itself can conceal split or merge errors.

Pair-based measures ask whether two observations are together in both partitions or separate in both. Adjusted Rand index corrects agreement relative to a random-partition baseline with fixed cluster sizes. With contingency counts $$n_{ij}$$, row totals $$a_i$$ and column totals $$b_j$$, define $$A=\sum_{ij}\binom{n_{ij}}2$$, $$B=\sum_i\binom{a_i}2$$, $$C=\sum_j\binom{b_j}2$$ and $$T=\binom n2$$:

<div class="formula-box">
\[
\operatorname{ARI}=\frac{A-BC/T}{(B+C)/2-BC/T}.
\]
</div>

For truth $$\{1,2\},\{3,4\}$$ and prediction $$\{1,3\},\{2,4\}$$, every contingency cell is 1. Thus A=0, B=C=2, T=6, and ARI=−0.5. Below-zero values are possible; chance adjustment is not a transformation forcing every result into [0,1]. Degenerate partitions need explicit conventions.

## Stability tests sensitivity

Resample observations, perturb plausible measurement noise, change initialisation and vary reasonable preprocessing choices. Compare partitions on a shared set using a permutation-invariant measure. If separately fitted models support prediction, evaluate them on the same held-out observations; otherwise define overlap and correspondence carefully.

Stability is informative but insufficient. A single-cluster method can be very stable. So can an algorithm consistently splitting on an irrelevant feature. Distinguish stability across seeds from stability across new data, because the first probes optimisation and the second probes sampling uncertainty.

For hierarchical methods, compare meaningful cuts or branch relationships. For density methods, report changes in the assigned population as well as agreement among the points both runs retained. Dropping difficult noise points can artificially improve a score.

## Visualisation is a diagnostic, not a verdict

A t-SNE or UMAP plot can help locate examples for inspection. The embedding itself changes neighbourhoods, density and distances, so islands on the plot are not independent validation of clusters fitted on that same plot.

Inspect original-feature summaries, representative observations and boundary cases. Check whether duplicates, batch effects, missingness or source identifiers explain the groups. A visually strong separation caused by acquisition equipment may be real geometry and still irrelevant to the scientific question.

## Report a comparison that can be reproduced

Keep the same preprocessing and evaluation population when comparing algorithms, or state the differences. Report parameter search, computational budget, noise fraction, cluster sizes, several seeds and relevant uncertainty. Selecting the best of many configurations on one score can overfit that evaluation criterion.

A useful report includes a compactness measure where appropriate, an external or application-based assessment when available, stability results and qualitative inspection. Explain disagreements among these signals rather than compressing them into one unsupported ranking of algorithms.

<div class="insight-box">
  <strong>Key Insight:</strong> A clustering metric embeds a definition of a good group. Comparing methods responsibly means checking whether that definition matches the method and the intended application.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A high internal score, stable partition or attractive embedding can each occur without meaningful populations. Agreement among independent forms of evidence matters more than a single number.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Use inertia for quantisation and silhouette for its stated geometry.</li>
    <li>Compare external labels with permutation-invariant criteria.</li>
    <li>Separate optimisation stability from sampling stability.</li>
    <li>Report noise, parameter search and domain usefulness explicitly.</li>
  </ul>
</div>

## References

1. scikit-learn. [Clustering performance evaluation](https://scikit-learn.org/stable/modules/clustering.html#clustering-performance-evaluation).
2. James, Witten, Hastie, Tibshirani and Taylor. [An Introduction to Statistical Learning with Applications in Python](https://www.statlearning.com/). Springer, 2023.
