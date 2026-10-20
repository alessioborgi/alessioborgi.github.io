---
layout: "single"
title: "Mean Shift: Kernel Density Modes, Bandwidth and Attraction Basins"
date: "2026-10-20 10:19:00 +0100"
categories: ["basics"]
book: "basics"
subsection: "clustering"
tags: ["machine-learning", "clustering", "density-estimation", "mode-seeking"]
excerpt: "Derive the weighted-mean movement behind mode seeking, follow a local update, and explain why bandwidth and mode merging determine the final clustering."
author_profile: true
read_time: true
is_overview: false
icon: "🏔️"
read_mins: 5
permalink: "/blog/basics/mean-shift/"
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Mean shift moves candidate locations toward modes of a kernel density estimate. Observations whose trajectories reach the same retained mode can be grouped together. The number of modes emerges from the bandwidth and data; it is not a parameter-free discovery of the true number of populations.
</div>

## Cluster around peaks of estimated density

Imagine placing a smooth bump over every observed location and adding the bumps. Dense regions create peaks. Mean shift follows a local direction toward such peaks and uses the resulting attraction basins to organise observations.

This definition differs from nearest-centre quantisation and from density connectivity. Two regions connected above a low density threshold can still have separate modes. Conversely, overlapping populations can produce only one mode. The number of density peaks is not generally equal to the number of generating populations.

## Write the kernel density estimate

For bandwidth h in d dimensions, a radial estimate has the form

<div class="formula-box">
\[
\hat f(x)=\frac{c}{nh^d}\sum_i k\!\left(\frac{\|x-x_i\|^2}{h^2}\right),
\]\n</div>

where c supplies normalisation and k is a kernel profile. Differentiation leads to a movement direction based on a weighted local mean. With $$g(t)=-k'(t)$$, the mean-shift vector is

<div class="formula-box">
\[
m(x)=\frac{\sum_i g(\|x-x_i\|^2/h^2)x_i}{\sum_i g(\|x-x_i\|^2/h^2)}-x.
\]\n</div>

An update sets the candidate to $$x+m(x)$$. The weights are related to the derivative of the kernel profile; one should not assume any arbitrarily chosen averaging weights perform gradient ascent for a claimed density estimate.

For a Gaussian profile, the relevant weights decay smoothly with squared distance. A flat neighbourhood mean can be associated with an appropriate compact-support profile. Different kernels and stopping rules can produce different practical trajectories.

## Follow a local mean by hand

Take observations $$0,1,2,8,9$$. For a flat-window update with radius 2, a candidate at 1 sees 0, 1 and 2, whose mean is 1, so it stays. A candidate at 8 sees 8 and 9 and moves to 8.5. At 8.5 the same neighbours keep it there.

A candidate at 3 sees only 1 and 2 under the closed-radius convention and moves to 1.5. At that location it sees 0, 1 and 2 and moves to 1. Its trajectory joins the left attraction basin. These are local updates for the stated window, not proof that all kernels produce exactly these modes.

With a radius large enough to include every point at every relevant update, the procedure collapses toward the global mean 4. A tiny radius instead leaves many observations as separate candidate peaks. Bandwidth controls resolution directly.

## Modes are not labels until postprocessing

Practical implementations initialise candidate trajectories from observations or selected seeds, iterate to convergence or a limit, and merge candidate modes that are sufficiently close. They then assign observations to retained modes under an explicit rule.

Seeding only dense bins can reduce computation but miss small or isolated modes. Mode merging can combine nearby peaks that the iteration found separately. Some implementations optionally leave distant observations unassigned. Report these choices together with the bandwidth.

A stopping tolerance should be interpreted relative to feature units and bandwidth. An absolute movement threshold meaningful in metres may be nonsensical after rescaling to millimetres. A fixed iteration cap can also leave slowly converging candidates unfinished.

## Bandwidth defines the question

Small bandwidths reveal fine sample detail, including fluctuations caused by noise. Large bandwidths smooth nearby peaks into one. The tradeoff resembles density estimation bias and variance, but clustering adds sensitivity to whether peaks appear, disappear or merge.

Use domain resolution, held-out density considerations where appropriate, and stability across a plausible bandwidth range. An automatic bandwidth heuristic still encodes assumptions and can be expensive because it needs distance information. There is no general guarantee that one selected bandwidth matches the application’s population structure.

Scaling can be represented as a bandwidth matrix rather than one isotropic radius. That allows different feature directions to have different resolutions, but requires more choices and estimation. Arbitrary unit differences should not silently become anisotropic density assumptions.

## Cost and dimensionality

If every observation seeds a trajectory and every update scans all n observations, T updates cost roughly $$O(Tn^2d)$$. Neighbour searches, seed subsampling and binning can improve practical performance. High dimensionality can make density estimation difficult long before runtime becomes the only problem.

A density peak in a low-dimensional projection may be absent in the full representation. If dimensionality reduction precedes mean shift, evaluate whether it preserves the neighbourhood relationships relevant to the task rather than trusting an attractive scatter plot.

## When to use it

Mean shift is useful when modes and their attraction basins are meaningful, for example in spatial or appearance-based analysis at a chosen resolution. It can produce a variable number of clusters without specifying k, but it replaces k with bandwidth and postprocessing choices.

Compare with [DBSCAN](/blog/basics/dbscan/) for connectivity-based groups and [Gaussian mixtures](/blog/basics/gaussian-mixtures/) for an explicit parametric density with posterior responsibilities. Record fitted modes, assignments and representative trajectories so the result can be explained beyond its final colours.

<div class="insight-box">
  <strong>Key Insight:</strong> Mean shift searches the modes of a smoothed empirical density. Changing the smoothing scale changes the density itself, so a different cluster count can be the intended result rather than an optimisation failure.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> “No need to choose k” does not mean “no model selection”. Bandwidth, seeds, stopping and mode-merging rules all influence the partition.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Connect the weighted mean to a kernel-density gradient.</li>
    <li>Distinguish mode seeking from the later label assignment.</li>
    <li>Inspect bandwidth sensitivity and feature units.</li>
    <li>Budget for repeated neighbourhood searches and high-dimensional density limitations.</li>
  </ul>
</div>

## References

1. Comaniciu and Meer. [Mean Shift: A Robust Approach Toward Feature Space Analysis](https://cs.brown.edu/people/pfelzens/engn1610/PAMIMeanshift.pdf). IEEE TPAMI, 2002.
2. scikit-learn. [Clustering user guide](https://scikit-learn.org/stable/modules/clustering.html).
