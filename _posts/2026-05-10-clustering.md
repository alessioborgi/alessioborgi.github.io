---
layout: single
title: "Clustering: What Each Algorithm Assumes a Cluster Is"
date: 2026-05-10
categories: [basics]
book: basics
subsection: unsupervised
tags: [clustering, k-means, dbscan, hierarchical, gaussian-mixture]
published: true
is_overview: false
excerpt: "k-means says a cluster is a ball around a centroid, DBSCAN says it is a connected dense region, and a Gaussian mixture says it is a bump in a density — pick the algorithm and you have already picked the answer."
author_profile: true
read_time: true
icon: "🔍"
read_mins: 23
permalink: /blog/basics/clustering/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR.</strong> Clustering algorithms do not discover what a cluster is; each one is handed that definition in advance and merely locates the best examples of it. k-means defines a cluster as the set of points nearest a centroid, so it finds round, similarly sized blobs and nothing else. Hierarchical clustering defines it through a linkage rule and returns a whole nested family of partitions instead of one. DBSCAN defines it as a connected region of high density, so it finds rings and crescents and calls the leftovers noise. A Gaussian mixture defines it as one bump in a probability density, which buys soft memberships and elliptical shapes. Choosing the algorithm <em>is</em> choosing the assumption — so the first question is never "which algorithm is best?" but "what shape do I believe my clusters have?"
</div>

## The question nobody asks out loud

Supervised learning has an unambiguous scoreboard: there are labels, and you either predict them or you do not. Clustering has no such thing. You hand an algorithm a pile of unlabelled points, it hands back a partition, and no external fact says whether the partition is right.

That is not because clustering is vague. It is because the word "cluster" is doing an enormous amount of unstated work. Consider three perfectly reasonable definitions:

1. A cluster is a group of points that are all close to some common centre.
2. A cluster is a group of points you can walk between in small steps without leaving the group.
3. A cluster is a region where the data-generating density has a local maximum.

These sound like paraphrases. They are not. On two concentric rings, definition 1 says the two rings are one cluster (they share a centre); definitions 2 and 3 say they are two. On a long thin filament that nearly touches a dense blob, definition 2 fuses them and definition 1 does not.

Every clustering algorithm hard-codes one of these definitions. The algorithm's failure cases are not bugs; they are the definition being applied faithfully to data that disagrees with it.

<div class="insight-box">
<strong>The spine of this post.</strong> For each method, hold two things in your head: the objective it optimises, and the geometry that objective quietly presupposes. The second one is what breaks in practice, and it never appears in the pseudocode.
</div>

## k-means: a cluster is a ball around a centroid

### The objective

Fix the number of clusters $$k$$. A partition assigns each of the $$n$$ points $$x_1, \dots, x_n \in \mathbb{R}^d$$ to one of $$k$$ sets $$C_1, \dots, C_k$$, and each set gets a representative $$\mu_j \in \mathbb{R}^d$$. k-means minimises the **within-cluster sum of squares**:

<div class="formula-box">
\[
J(C, \mu) \;=\; \sum_{j=1}^{k} \; \sum_{x \in C_j} \lVert x - \mu_j \rVert_2^2 .
\]
</div>

Two things are already decided by this line. First, the distance is Euclidean and squared, so a point twice as far away is penalised four times as much: k-means is dragged around by outliers. Second, each cluster is summarised by a single point. Whatever a cluster is, k-means has committed to it being *the things near one location*.

### Lloyd's algorithm as alternating minimisation

$$J$$ depends on two arguments, and it is hard to optimise jointly — the exact problem is NP-hard for general $$k$$ and $$d$$. But each argument is trivial given the other, which is exactly the setting for alternating minimisation. Lloyd's algorithm just alternates the two easy problems:

**Assignment step** — fix the centroids, optimise the labels. With $$\mu$$ held fixed, $$J$$ decouples over points, so every point independently picks its nearest centroid:

<div class="formula-box">
\[
c(x) \;=\; \arg\min_{j \in \{1,\dots,k\}} \; \lVert x - \mu_j \rVert_2^2 .
\]
</div>

**Update step** — fix the labels, optimise the centroids. With $$C$$ held fixed, $$J$$ decouples over clusters, and $$\sum_{x \in C_j} \lVert x - \mu_j \rVert^2$$ is a convex quadratic in $$\mu_j$$ minimised at the mean:

<div class="formula-box">
\[
\mu_j \;=\; \frac{1}{\lvert C_j \rvert} \sum_{x \in C_j} x .
\]
</div>

That is the whole algorithm. The "means" in k-means is not a design choice; it is what falls out of minimising squared Euclidean distance. Swap the loss for absolute distance and the optimal representative becomes the componentwise median, which is a different algorithm (k-medians) with different failure modes.

### A worked iteration, by hand

Take six points in the plane:

$$p_1 = (1,1), \quad p_2 = (2,3), \quad p_3 = (3,2), \quad p_4 = (7,1), \quad p_5 = (8,3), \quad p_6 = (9,2).$$

Set $$k = 2$$ and initialise the centroids at two of the data points, $$\mu_1 = (1,1)$$ and $$\mu_2 = (9,2)$$. The assignment step needs squared distances, and because we only compare them we never take a square root:

| point | $$\lVert x - \mu_1 \rVert^2$$ | $$\lVert x - \mu_2 \rVert^2$$ | assigned to |
|---|---|---|---|
| $$p_1 = (1,1)$$ | $$0$$ | $$64 + 1 = 65$$ | $$C_1$$ |
| $$p_2 = (2,3)$$ | $$1 + 4 = 5$$ | $$49 + 1 = 50$$ | $$C_1$$ |
| $$p_3 = (3,2)$$ | $$4 + 1 = 5$$ | $$36 + 0 = 36$$ | $$C_1$$ |
| $$p_4 = (7,1)$$ | $$36 + 0 = 36$$ | $$4 + 1 = 5$$ | $$C_2$$ |
| $$p_5 = (8,3)$$ | $$49 + 4 = 53$$ | $$1 + 1 = 2$$ | $$C_2$$ |
| $$p_6 = (9,2)$$ | $$64 + 1 = 65$$ | $$0$$ | $$C_2$$ |

So $$C_1 = \{p_1, p_2, p_3\}$$ and $$C_2 = \{p_4, p_5, p_6\}$$, and the objective at this moment — still using the *old* centroids — is $$0 + 5 + 5 + 5 + 2 + 0 = 17$$.

Now the update step. Averaging coordinates:

<div class="formula-box">
\[
\mu_1 = \left( \tfrac{1+2+3}{3}, \; \tfrac{1+3+2}{3} \right) = (2, 2),
\qquad
\mu_2 = \left( \tfrac{7+8+9}{3}, \; \tfrac{1+3+2}{3} \right) = (8, 2).
\]
</div>

Recomputing the objective with the new centroids, cluster $$C_1$$ contributes $$(1{+}1) + (0{+}1) + (1{+}0) = 4$$ and $$C_2$$ contributes the same by symmetry, so $$J = 8$$. One iteration took the objective from $$17$$ to $$8$$. Running the assignment step again returns the identical labels, so the algorithm has converged after a single full sweep.

<div class="insight-box">
<strong>Numerically verified.</strong> Recomputed with NumPy on exactly these six points: the assignment is \( (0,0,0,1,1,1) \), the objective drops \( 17 \to 8 \) with per-cluster contributions \( 4 \) and \( 4 \), the updated centroids are \( (2,2) \) and \( (8,2) \), and the second assignment step reproduces the same labels — convergence in one iteration.
</div>

### It converges, but that is a weaker promise than it sounds

Both steps are exact minimisations of $$J$$ over their own argument, so $$J$$ never increases. There are finitely many partitions of $$n$$ points into $$k$$ groups, and each distinct partition that the algorithm visits has a strictly lower cost than the last, so no partition can repeat and the algorithm must halt in finitely many steps.

What it halts at is a local optimum, and "local" can be arbitrarily bad. Take four points at the corners of a $$10 \times 1$$ rectangle: $$(0,0), (0,1), (10,0), (10,1)$$, with $$k = 2$$. Splitting by the *long* side — pairing $$(0,0)$$ with $$(0,1)$$ and $$(10,0)$$ with $$(10,1)$$ — gives centroids $$(0, 0.5)$$ and $$(10, 0.5)$$ and cost $$J = 1$$. Splitting by the *short* side gives centroids $$(5, 0)$$ and $$(5, 1)$$ and cost $$J = 100$$. And that second, hundredfold-worse partition is a genuine fixed point: the point $$(0,0)$$ sits at squared distance $$25$$ from $$(5,0)$$ and $$26$$ from $$(5,1)$$, so it refuses to move. Lloyd's algorithm, started there, stops there forever.

### k-means++: spend a little to initialise well

Because the destination depends entirely on the start, initialisation matters more than any other detail. k-means++ picks the first centre uniformly at random, then picks each subsequent centre from the data with probability proportional to the squared distance to the nearest centre already chosen:

<div class="formula-box">
\[
\Pr(\text{choose } x) \;=\; \frac{D(x)^2}{\sum_{x' } D(x')^2},
\qquad
D(x) \;=\; \min_{\mu \text{ chosen}} \lVert x - \mu \rVert_2 .
\]
</div>

The effect is to spread the initial centres out — far-away points are exponentially more likely to be picked than near ones, because of the squaring — while remaining random enough not to latch onto a lone outlier every time. Arthur and Vassilvitskii proved that this seeding alone, before a single Lloyd iteration, gives an expected cost within a factor of $$O(\log k)$$ of the optimum. In practice you still run it several times with different seeds and keep the lowest $$J$$; that is not a workaround, it is the standard recipe.

### What k-means assumes, and what breaks

The assignment rule compares $$\lVert x - \mu_j \rVert$$ across $$j$$, so the boundary between two clusters is the perpendicular bisector of their centroids. Every k-means cluster is therefore an intersection of half-spaces: a **convex** Voronoi cell. That single fact generates the whole list of failure cases.

- **Clusters must be roughly spherical.** An elongated, diagonal cloud has points at its two ends that are further from each other than they are from a neighbouring cluster's centroid, so k-means slices it crosswise.
- **Clusters must be roughly the same size and spread.** The objective sums squared distances over *all* points, so a large, diffuse cluster contributes far more cost than a small tight one. k-means buys cost reductions by carving up the big cluster and donating its edges to the small one.
- **Clusters must be convex.** Two moons, two concentric rings, an S-shape: none of these is a Voronoi cell, so none of them is reachable.
- **$$k$$ must be supplied.** k-means will happily return seventeen clusters from data with three.
- **Every point gets a label.** There is no "none of the above". A single distant outlier either drags a centroid towards it or forms a singleton cluster, and either way it costs you.

The concentric-rings case is the cleanest demonstration, because it fails for a reason you can state in one line rather than observe empirically.

<div class="blog-figure">
<svg viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ringsTitle ringsDesc" style="width:100%;height:auto;max-width:720px;">
  <title id="ringsTitle">The same 24 points clustered by k-means and by DBSCAN</title>
  <desc id="ringsDesc">Twenty-four points lie on two concentric rings. Left: k-means with k equal to 2 cuts the picture along a straight line, so each of its two clusters contains points from both rings. Right: DBSCAN with eps 2.2 and minPts 3 recovers the inner ring and the outer ring exactly.</desc>

  <text x="180" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">k-means, k = 2 &#8212; wrong</text>
  <text x="540" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">DBSCAN, eps = 2.2 &#8212; right</text>

  <line x1="135.0" y1="62.2" x2="224.4" y2="338.1" stroke="#94a3b8" stroke-width="2" stroke-dasharray="7 5"/>
  <text x="230" y="352" font-size="12" fill="#94a3b8">decision boundary</text>

  <circle cx="232.8" cy="200.0" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="218.5" cy="161.5" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="180.0" cy="146.3" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="139.1" y="159.1" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="123.9" y="194.7" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="136.3" y="233.1" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="174.7" y="243.6" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="218.2" cy="238.2" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="311.7" cy="186.8" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="294.3" cy="138.6" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="261.3" cy="100.5" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="217.0" cy="77.2" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="167.2" cy="72.5" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="113.4" y="80.5" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="74.0" y="112.4" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="49.8" y="157.1" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="41.5" y="208.1" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="58.1" y="257.3" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="91.8" y="296.1" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="136.1" y="322.8" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="187.5" y="321.8" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="240.2" cy="312.2" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="281.3" cy="282.8" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="301.1" cy="236.5" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>

  <circle cx="592.8" cy="200.0" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="578.5" cy="161.5" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="540.0" cy="146.3" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="504.4" cy="164.4" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="489.2" cy="200.0" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="501.6" cy="238.4" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="540.0" cy="248.9" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="578.2" cy="238.2" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="666.4" y="181.5" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="649.0" y="133.3" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="616.0" y="95.2" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="571.7" y="71.9" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="521.9" y="67.2" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="473.4" y="80.5" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="434.0" y="112.4" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="409.8" y="157.1" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="401.5" y="208.1" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="418.1" y="257.3" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="451.8" y="296.1" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="496.1" y="322.8" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="547.5" y="321.8" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="594.9" y="306.9" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="636.0" y="277.5" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="655.8" y="231.2" width="10.6" height="10.6" rx="1.5" fill="#ea580c" stroke="#ffffff" stroke-width="1.5"/>

  <text x="180" y="378" text-anchor="middle" font-size="12.5" fill="currentColor" opacity="0.85">one centroid for both rings</text>
  <text x="540" y="378" text-anchor="middle" font-size="12.5" fill="currentColor" opacity="0.85">density connects each ring</text>
</svg>
<figcaption>The same 24 points, clustered twice. Eight points sit on a ring of radius \( 2 \) and sixteen on a ring of radius \( 5 \), with small random jitter. Left: the best k-means solution found over 500 random initialisations cuts along a straight line — the perpendicular bisector of its two centroids — so both of its clusters contain a mixture of inner-ring and outer-ring points, agreeing with the true rings on exactly 50% of points, which is what a coin would manage. Right: DBSCAN with \( \varepsilon = 2.2 \) and \( \text{minPts} = 3 \) recovers both rings exactly, with zero points labelled noise. Colour and marker shape both encode the cluster.</figcaption>
</div>

Why is k-means guaranteed to lose here? Because both rings are centred on the origin, their means are essentially the same point — in the data above they are $$0.056$$ apart, against ring radii of $$2$$ and $$5$$. The correct partition is not merely a bad local optimum of $$J$$; it is not a fixed point of Lloyd's algorithm at all, because with two coincident centroids the assignment step cannot reproduce it. No amount of restarting, no cleverer initialisation, and no better optimiser will find it. **The right answer is outside the model's vocabulary.**

## Hierarchical clustering: a cluster is whatever the linkage rule fuses

### Agglomerative merging

Agglomerative clustering starts with $$n$$ singleton clusters and repeatedly merges the two closest, until one cluster remains. The only thing you have to specify is what "closest" means for two *sets* of points, and that choice — the **linkage** — is the entire algorithm.

Let $$A$$ and $$B$$ be clusters and $$d(a,b)$$ the distance between points.

<div class="formula-box">
\[
\begin{aligned}
\text{single:} \quad & D(A,B) = \min_{a \in A, \, b \in B} d(a,b) \\
\text{complete:} \quad & D(A,B) = \max_{a \in A, \, b \in B} d(a,b) \\
\text{average:} \quad & D(A,B) = \frac{1}{\lvert A \rvert \lvert B \rvert} \sum_{a \in A} \sum_{b \in B} d(a,b) \\
\text{Ward:} \quad & D(A,B) = \frac{\lvert A \rvert \, \lvert B \rvert}{\lvert A \rvert + \lvert B \rvert} \, \lVert \bar{a} - \bar{b} \rVert_2^2
\end{aligned}
\]
</div>

These are four different beliefs about what makes a cluster coherent. **Single linkage** believes in connectivity: two groups belong together if any two of their members are close, so it can trace out long, thin, curved shapes. **Complete linkage** believes in compactness: a merge is only allowed if it keeps the worst-case diameter small, so it produces tight, round groups and refuses to string things out. **Average linkage** splits the difference. **Ward** is the odd one out — its criterion is exactly the increase in within-cluster sum of squares caused by the merge, which makes it a greedy hierarchical version of the k-means objective. That is why Ward's dendrograms look so much like k-means solutions, and why they inherit the same spherical bias.

### The output is a dendrogram, not a partition

This is the genuinely different thing about hierarchical clustering, and it is easy to miss because the library call returns labels. The algorithm's actual product is the **dendrogram**: a binary tree recording every merge and the distance at which it happened. Cutting the tree at a height gives a partition; cutting at a different height gives a different, strictly nested one. You get the family of all of them at once.

That is a real advantage when the structure genuinely is nested — taxonomies, document topics, gene expression — because you can choose the level that matters for your question after seeing the hierarchy rather than before. You never have to commit to $$k$$ up front. You do still have to commit *eventually*, and the dendrogram will not tell you where to cut; it only lays out the options with their merge heights, so a big vertical gap between successive merges hints that the structure below it is more stable than the structure above.

### What hierarchical clustering does not buy you

<div class="warning-box">
<strong>Single-linkage chaining.</strong> Because single linkage only needs <em>one</em> short bridge to merge two groups, a thin trail of intermediate points between two well-separated clouds will fuse them. Add points one at a time along a line from cluster A to cluster B and, at some spacing, single linkage stops seeing two clusters and starts seeing one long snake. The same flexibility that lets it trace a crescent is what lets a handful of stragglers destroy the partition. Complete and Ward linkage are immune to chaining, at the cost of being unable to find non-convex shapes at all — you cannot have both from this family.
</div>

Three more limitations worth stating plainly. Merges are **greedy and irreversible**: a bad early merge, made when the algorithm has seen almost no structure, is never revisited. The naive implementation needs the full pairwise distance matrix, so **memory is $$O(n^2)$$** and time is $$O(n^3)$$ (or $$O(n^2 \log n)$$ with a heap; single linkage can be done in $$O(n^2)$$), which puts hierarchical clustering out of reach for large $$n$$ without approximation. And there is **no notion of noise** — every point ends up somewhere in the tree, so outliers appear as singleton branches that merge in very late.

## DBSCAN: a cluster is a connected dense region

### Density instead of distance-to-centre

DBSCAN throws away the centroid entirely. It asks a local question of each point: *are there enough other points nearby?* Two parameters set the meaning of "nearby" and "enough":

- $$\varepsilon$$ — the radius of the neighbourhood.
- $$\text{minPts}$$ — how many points must lie inside that radius (counting the point itself) for the neighbourhood to count as dense.

A point with at least $$\text{minPts}$$ neighbours within $$\varepsilon$$ is a **core point**. A point that is not core but lies within $$\varepsilon$$ of a core point is a **border point**. Everything else is **noise**.

The clusters are then the connected components of the core points: two core points are in the same cluster if you can hop from one to the other in steps of length at most $$\varepsilon$$, always landing on core points. Border points join whichever cluster reached them.

<div class="insight-box">
<strong>Why this finds rings.</strong> DBSCAN never compares a point to a cluster summary, only to its immediate neighbours. Shape is therefore irrelevant to it — it only cares whether the chain of dense neighbourhoods is unbroken. In the figure above, the largest gap between consecutive points along the outer ring is about \( 1.99 \) and along the inner ring about \( 1.58 \), while the closest any inner point comes to any outer point is \( 2.86 \). Choosing \( \varepsilon = 2.2 \) sits in that window, so each ring is internally connected and the two are mutually unreachable. The parameter is doing precisely one job: setting the scale at which a gap counts as a gap.
</div>

### What DBSCAN buys, and what it costs

Two capabilities here are genuinely unavailable from k-means. First, **arbitrary shapes**: rings, crescents, spirals, anything density-connected. Second, **explicit noise**: points in sparse regions are labelled as noise rather than being forced into a cluster, which means one distant outlier no longer distorts anything. The number of clusters is also an output rather than an input — you specify a density scale and DBSCAN reports how many components exist at that scale.

The bill comes due in three places.

- **Varying density is the fundamental weakness.** A single global $$\varepsilon$$ sets one density threshold for the whole dataset. If one cluster is tight and another is diffuse, no $$\varepsilon$$ works: small values shatter the diffuse cluster into fragments and label most of it noise, large values merge the tight cluster with its neighbours. This is the mirror image of the rings problem — a case where the definition of "cluster" is wrong for the data. HDBSCAN exists precisely to relax this by considering all density scales at once.
- **The parameters are not intuitive** in more than two or three dimensions, because $$\varepsilon$$ is an absolute distance and you rarely have a feel for absolute distances in high-dimensional feature space. The usual diagnostic is a $$k$$-distance plot: sort every point by its distance to its $$\text{minPts}$$-th nearest neighbour, plot the sorted curve, and look for the knee. It is a heuristic, and it is the same kind of eyeballing as the elbow method below.
- **High dimensions degrade it**, as they degrade every distance-based method. When distances concentrate, the ratio between the nearest and farthest neighbour of a point approaches one, and the notion of an $$\varepsilon$$-ball that is "dense but not everything" evaporates.

Border points also make DBSCAN mildly **order-dependent**: a border point reachable from two clusters is assigned to whichever is processed first. It is a small effect, but it means the output is not a deterministic function of the data alone.

## Gaussian mixtures: a cluster is a bump in a density

### The generative story

The methods so far are procedures. A Gaussian mixture model (GMM) is instead a *model of how the data were produced*: pick a component $$j$$ with probability $$\pi_j$$, then draw a point from $$\mathcal{N}(\mu_j, \Sigma_j)$$. The density is

<div class="formula-box">
\[
p(x) \;=\; \sum_{j=1}^{k} \pi_j \, \mathcal{N}(x \mid \mu_j, \Sigma_j),
\qquad \pi_j \ge 0, \quad \sum_{j=1}^{k} \pi_j = 1 .
\]
</div>

Because it is a probability model, it answers questions the others cannot: how likely is this new point under the fitted structure, how confident is this assignment, what happens if I generate fresh samples. Instead of a hard label, each point gets a vector of **responsibilities** — the posterior probability of each component given the point:

<div class="formula-box">
\[
\gamma_{ij} \;=\; \Pr(z_i = j \mid x_i) \;=\; \frac{\pi_j \, \mathcal{N}(x_i \mid \mu_j, \Sigma_j)}{\sum_{l=1}^{k} \pi_l \, \mathcal{N}(x_i \mid \mu_l, \Sigma_l)} .
\]
</div>

A point squarely inside one component gets responsibilities near $$(1, 0, \dots)$$; a point in the overlap gets something like $$(0.55, 0.45, \dots)$$ — honest information about ambiguity that a hard partition throws away.

### EM is the same alternating trick

Maximising the log-likelihood directly is awkward because of the sum inside the logarithm. Expectation–Maximisation alternates, exactly as Lloyd's algorithm does:

- **E step** — compute the responsibilities $$\gamma_{ij}$$ from the current parameters, using the formula above.
- **M step** — refit each component using the responsibilities as soft counts. Writing $$N_j = \sum_i \gamma_{ij}$$ for the effective number of points in component $$j$$:

<div class="formula-box">
\[
\pi_j = \frac{N_j}{n},
\qquad
\mu_j = \frac{1}{N_j}\sum_{i=1}^{n} \gamma_{ij} \, x_i,
\qquad
\Sigma_j = \frac{1}{N_j}\sum_{i=1}^{n} \gamma_{ij} \, (x_i - \mu_j)(x_i - \mu_j)^{\top} .
\]
</div>

Each round is guaranteed not to decrease the log-likelihood, which — as with k-means — buys convergence to a stationary point and nothing about its quality. Multiple restarts are again standard, and k-means is the usual way to initialise a GMM.

### How it generalises k-means

Put the three restrictions on a GMM at once: force every covariance to be $$\Sigma_j = \sigma^2 I$$ (spherical, equal across components), fix all mixing weights equal, and let $$\sigma^2 \to 0$$. As the components become infinitely tight, the responsibility of the nearest component tends to $$1$$ and all others to $$0$$ — the E step hardens into "assign to nearest centroid". The M step, with responsibilities that are $$0$$ or $$1$$, reduces to "average the assigned points". That is Lloyd's algorithm exactly. **k-means is the hard-assignment, equal-spherical-covariance limit of EM for a Gaussian mixture.**

Reading that in the other direction tells you what each relaxation buys:

- Letting $$\Sigma_j$$ be **full** lets a component be an ellipse at any orientation, so elongated diagonal clusters — one of k-means' clean failures — are handled natively.
- Letting $$\Sigma_j$$ **differ between components** handles clusters of different sizes and spreads.
- Keeping responsibilities **soft** stops points in the overlap from being arbitrarily forced one way, and gives you a calibrated measure of that ambiguity.
- Having a **likelihood** gives you a principled model-selection criterion for $$k$$, which no other method here has.

### What a GMM does not buy you

<div class="warning-box">
<strong>The likelihood is unbounded, so "maximum likelihood" is a lie you tolerate.</strong> Let one component collapse onto a single data point and shrink its covariance towards zero: the density at that point diverges, and so does the likelihood. EM will occasionally walk into one of these singularities, producing a component with a near-singular covariance matrix and a nonsense fit. Every real implementation defends against it with a small ridge added to the diagonal (<code>reg_covar</code> in scikit-learn), by restricting the covariance family, or by placing a prior on \( \Sigma \) and maximising the posterior instead.
</div>

Beyond that: a GMM still assumes **each cluster is Gaussian**, so it fails on the two rings just as k-means does — a ring is not an ellipse-shaped bump, and a mixture of two Gaussians centred at the origin cannot represent one. A full covariance matrix costs $$d(d+1)/2$$ parameters per component, so in high dimensions you run out of data and are pushed back to diagonal or spherical covariances, which is a return to k-means-like assumptions. And $$k$$ must still be chosen, though at least here there is a criterion rather than a squint.

## The comparison, in one table

| Algorithm | What a cluster *is* | Shapes it can find | Needs $$k$$? | Handles noise? |
|---|---|---|---|---|
| **k-means** | the points nearest one centroid | convex, roughly spherical, similar size | yes, up front | no — every point is labelled, and outliers pull centroids |
| **Hierarchical (single)** | a group connected by short hops | elongated, curved, arbitrary | no, but you must cut the tree | no — outliers become late-merging singletons |
| **Hierarchical (Ward/complete)** | a group with small internal spread | compact, roughly spherical | no, but you must cut the tree | no |
| **DBSCAN** | a connected region above a density threshold | arbitrary, provided density is uniform within a cluster | no — it is an output | yes — sparse points are labelled noise explicitly |
| **Gaussian mixture** | one bump of a probability density | elliptical, any orientation, with soft edges | yes, but BIC gives a criterion | partly — low-likelihood points are flagged, not excluded |

## Choosing $$k$$, honestly

"Number of clusters" is not a property of the data. It is a property of the data *plus* a definition of cluster *plus* a scale of interest. A satellite image has two clusters (land, sea), or nine (terrain types), or thousands (individual fields), and all three are correct answers to different questions. The tools below narrow the range; they do not settle it.

**The elbow method.** Plot the k-means objective $$J$$ against $$k$$. It decreases monotonically — more centroids can never fit worse — so you are looking for the kink where the marginal improvement flattens. If the data really has $$k^{\star}$$ well-separated spherical clusters, adding the $$k^{\star}$$-th centroid removes a large chunk of cost and the next one removes little, so the kink is real. On data that is merely a continuum of density, the curve is a smooth arc with no kink at all, and you will find yourself squinting at a plot in order to justify a decision you have already made.

**Silhouette.** For each point $$i$$, let $$a(i)$$ be its mean distance to the other points in its own cluster and $$b(i)$$ the mean distance to the points of the nearest *other* cluster. Then

<div class="formula-box">
\[
s(i) \;=\; \frac{b(i) - a(i)}{\max\{a(i),\, b(i)\}} \;\in\; [-1, 1],
\]
</div>

and the score for a clustering is the mean of $$s(i)$$ over all points. Near $$1$$ means points sit much closer to their own cluster than to any other; near $$0$$ means they sit on a boundary; negative means they would be better off elsewhere. Unlike the elbow, silhouette does not decrease automatically with $$k$$, so its maximum is a defensible choice. But note what $$a$$ and $$b$$ measure: mean distances, which is a compactness-and-separation criterion. Silhouette is therefore biased towards exactly the round, well-separated clusters that k-means likes, and will score a correct DBSCAN partition of two rings poorly. Per-point silhouettes beat the average — they show *which* points are badly placed.

**BIC, for models with a likelihood.** A GMM has a likelihood, so you can penalise complexity honestly. With $$\hat{L}$$ the maximised likelihood, $$p$$ the number of free parameters and $$n$$ the sample size:

<div class="formula-box">
\[
\mathrm{BIC} \;=\; -2 \ln \hat{L} + p \ln n ,
\]
</div>

and you pick the $$k$$ minimising it. The $$p \ln n$$ term makes extra components pay for themselves, which is why BIC has an interior minimum where raw likelihood does not. This is the most principled of the three — and it still assumes the model class is right. Fit a GMM to two rings and BIC will confidently select some number of Gaussians that tile the rings; it is answering "how many Gaussians?", which was never your question.

<div class="summary-box">
<strong>A workable procedure.</strong> Run two or three methods that encode <em>different</em> assumptions — say Ward and DBSCAN — over a range of settings. Where their partitions agree, the structure is probably in the data rather than in the algorithm. Where they disagree, the disagreement itself is the finding, and it tells you which assumption your data violates. Then check that the clusters correspond to something you can name; a partition you cannot describe in words is rarely worth shipping.
</div>

## Which one to reach for

- **Large $$n$$, features already scaled, you expect compact blobs, and you need speed:** k-means with k-means++ and several restarts. It is $$O(nkd)$$ per iteration and hard to beat on throughput.
- **You suspect nested structure, or $$n$$ is small enough to hold a distance matrix, or you want to see the whole hierarchy before committing:** agglomerative clustering. Ward if you expect compact groups, single linkage if you expect filaments and are willing to risk chaining.
- **Clusters may be oddly shaped, and there is real junk in the data you want excluded:** DBSCAN, provided density is broadly uniform within each cluster. If it is not, reach for HDBSCAN.
- **You want probabilities, calibrated uncertainty, elliptical clusters, or a criterion for $$k$$:** a Gaussian mixture. It is the right default when clusters overlap and you need to say *how much*.

One practical note that outranks all of the above: **every method here except the hierarchical ones with a custom metric depends on the scale of your features.** A feature measured in metres and one measured in millimetres are not comparable under Euclidean distance, and the second will dominate every distance in the dataset. Standardise first, or decide deliberately not to and be able to say why.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
<li><strong>The algorithm is the assumption.</strong> k-means assumes a cluster is a ball around a centre, single linkage assumes it is a chain of near neighbours, DBSCAN assumes it is a connected dense region, and a GMM assumes it is a Gaussian bump. There is no neutral choice.</li>
<li><strong>k-means minimises \( \sum_j \sum_{x \in C_j} \lVert x - \mu_j \rVert^2 \) by alternating minimisation.</strong> Both steps are exact, so the cost falls monotonically and the algorithm terminates — but only at a local optimum. Four points on a \( 10 \times 1 \) rectangle have a stable k-means solution costing \( 100 \) when the optimum costs \( 1 \).</li>
<li><strong>Initialisation is the largest single lever on k-means quality.</strong> k-means++ seeds centres with probability proportional to \( D(x)^2 \), spreading them out; run it several times and keep the lowest objective.</li>
<li><strong>Some failures are not fixable by better optimisation.</strong> Two concentric rings share a centroid, so the correct partition is not even a fixed point of Lloyd's algorithm. The answer is outside the model's vocabulary, not merely hard to reach.</li>
<li><strong>Hierarchical clustering returns a dendrogram, not a partition</strong> — a nested family of clusterings you can cut anywhere. Linkage choice dominates the result: Ward behaves like a greedy k-means, while single linkage traces curved shapes and pays for it with chaining across thin bridges.</li>
<li><strong>DBSCAN buys arbitrary shapes and an explicit noise label</strong>, and charges for them with a single global density scale. Varying density between clusters is its structural weakness, exactly as non-convexity is k-means'.</li>
<li><strong>A Gaussian mixture generalises k-means</strong>: k-means is the hard-assignment, equal-spherical-covariance, vanishing-variance limit of EM. Relaxing towards full per-component covariances buys elliptical clusters, soft memberships, and a likelihood — at the price of more parameters and a genuinely unbounded objective that needs regularising.</li>
<li><strong>Elbow, silhouette, and BIC are heuristics, not answers.</strong> They narrow the range; they cannot tell you the number of clusters, because that number depends on a definition and a scale that live outside the data. Agreement between methods with different assumptions is stronger evidence than any single score.</li>
</ul>
</div>
