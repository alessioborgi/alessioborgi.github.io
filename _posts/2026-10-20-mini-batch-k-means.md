---
layout: "single"
title: "Mini-Batch K-means: Online Centroid Updates and the Cost of Approximation"
date: "2026-10-20 10:11:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "clustering"
tags: ["machine-learning", "clustering", "online-learning", "scalability"]
excerpt: "Derive the running-mean update, distinguish mini-batch optimisation from concept-drift tracking, and measure the speed–quality tradeoff on a fixed evaluation sample."
author_profile: true
read_time: true
is_overview: false
icon: "⚡"
read_mins: 3
permalink: "/blog/basics/mini-batch-k-means/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Mini-batch k-means updates centres using small samples instead of repeatedly scanning the whole dataset. The update behaves like a running mean of assigned observations. It reduces work per step, but full-data inertia need not decrease at every step and old assignment counts can make centres slow to adapt.
</div>

## Which part of k-means becomes expensive?

Ordinary [k-means](/blog/basics/k-means/) computes nearest-centre assignments for all n observations before updating the means. When the data contains millions of vectors, many observations provide nearly the same update direction. A smaller random batch can estimate where centres should move at much lower immediate cost.

The target is still squared-distance quantisation. Mini-batching does not add a new cluster shape or make Euclidean distance robust. It changes how the centres are estimated. This distinction matters when a faster training loop appears to fix a problem caused by a poor representation: speed and statistical suitability are separate properties.

## Derive the running-mean update

Suppose a centre has incorporated v assigned observations and currently equals their mean $$\mu$$. Incorporating another assigned vector x gives

<div class="formula-box">
\[
\mu_{\mathrm{new}}=\frac{v\mu+x}{v+1}
=\mu+\frac{1}{v+1}(x-\mu).
\]\n</div>

The learning rate is $$1/(v+1)$$. A batch implementation can aggregate several assigned points: add their count to v and their vector sum to the accumulated sum. Implementations differ in reassignment and stopping details, but the count-weighted mean is the central mechanism.

Assignments themselves change as centres move. Consequently this is a running mean of observations assigned along the optimisation trajectory, not necessarily the exact mean of the final partition. That is one reason a final full-data reassignment and evaluation is useful.

## A numerical update

Let a one-dimensional centre equal 10 after four assigned observations. The next assigned observation is 20. The new centre is $$10+(20-10)/5=12$$. If the next is 6, it becomes $$12+(6-12)/6=11$$.

```python
centre, count = 10.0, 4
for x in [20.0, 6.0]:
    count += 1
    centre += (x-centre)/count
assert count == 6 and abs(centre-11.0) < 1e-12
```

The count records effective contributions, not just iterations. If one centre receives a hundred points per batch and another receives one, their adaptation rates differ. Weighted observations require weighted counts and sums rather than pretending each contribution has equal mass.

## Why the full objective can increase

An exact Lloyd update minimises the loss of the complete currently assigned cluster. A mini-batch update minimises or estimates improvement for a small sample. Moving toward an unusually distant batch can make the full dataset worse even while fitting that batch better.

Monitor a fixed evaluation sample rather than treating the last batch loss as a comparable progress measure. Changing both centres and evaluation observations confounds optimisation with sampling noise. A smoothed training statistic helps detect gross failure, but it is not a monotonic certificate.

The batch should represent the intended population. Taking consecutive rows from data sorted by store, topic or date can create long runs of highly biased updates. Random sampling is appropriate for a static population; a chronological stream instead defines a different estimation problem that must be evaluated as such.

## Initialisation and neglected centres

Small batches may miss a rare but meaningful population. Use an initialisation sample large enough to represent important regions, consider several starts, and inspect how many observations reach each centre. A centre receiving no assignments cannot improve through its ordinary running-mean update.

Some implementations reinitialise low-count centres. That can prevent wasted capacity, but it can also remove a small legitimate group. Record the policy and test minority-region quantisation error. A good global average can conceal very poor coverage of a rare group.

## Streaming is not automatically drift adaptation

After a million assignments, one new observation receives weight approximately one millionth under the cumulative-mean rule. If the population changes abruptly, the centre responds slowly. Efficiently processing a stream is therefore different from tracking a moving distribution.

A forgetting factor or sliding window can increase responsiveness, but it changes the objective from fitting the full historical dataset to fitting recent observations. Specify that change explicitly. Evaluate delayed adaptation, not only total historical inertia, when drift is part of the task.

## A fair comparison with ordinary k-means

Fix the representation, k, initialisation budget and evaluation set. Compare held-out inertia, wall time, passes through the data, cluster sizes and variability across seeds. Reporting only the number of iterations is misleading because one full-data iteration and one mini-batch step process very different numbers of points.

Assignment work is approximately $$O(bkd)$$ per batch of size b. Total work depends on the number of batches and any full-data passes used for initialisation or final labels. Account for storage and data-loading cost when vectors do not fit in memory.

Mini-batch methods are attractive for a large static codebook, quick exploratory segmentation or repeated retraining. For a modest dataset where exact Lloyd passes are cheap, ordinary k-means may provide a simpler and more stable baseline. Neither method settles whether the groups correspond to the phenomenon being studied.

<div class="insight-box">
  <strong>Key Insight:</strong> The accumulated assignment count is also a learning-rate schedule. It explains why the method stabilises on a static dataset and why the same rule can adapt poorly to a changing stream.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Do not compare algorithms by iteration count or assume each mini-batch update decreases full-data inertia. Compare processed observations, runtime and a fixed evaluation objective.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Update centres with count-weighted means.</li>
    <li>Track sample coverage and centres receiving few assignments.</li>
    <li>Separate static approximation from explicit drift adaptation.</li>
    <li>Measure quality and work on the same dataset and representation.</li>
  </ul>
</div>

## References

1. Sculley. [Web-Scale K-Means Clustering](https://www.ra.ethz.ch/cdstore/www2010/www/p1177.pdf). WWW, 2010.
2. scikit-learn. [Clustering user guide](https://scikit-learn.org/stable/modules/clustering.html).
