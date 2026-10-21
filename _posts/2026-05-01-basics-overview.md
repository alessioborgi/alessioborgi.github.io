---
layout: single
title: "Machine Learning Before Transformers: A Working Foundation"
date: 2026-05-01
categories: [basics]
book: basics
subsection: foundations
tags: [overview, machine-learning, supervised, unsupervised, deep-learning]
published: true
is_overview: true
excerpt: "A detailed route through 42 ML chapters: learning and validation, classical prediction, trees and boosting, twelve clustering methods, PCA, dimensionality reduction and neural networks."
author_profile: true
read_time: true
icon: "🧭"
read_mins: 11
permalink: /blog/basics/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>What this book is for:</strong> the later books, Transformers, Graph Neural Networks, Sheaf models, Diffusion, all assume a working knowledge of losses, gradients, regularisation, and the pre-Transformer architectures. This book develops those foundations through 42 chapters, including dedicated treatments of classical predictors, twelve clustering methods, PCA and other representation methods. Each method is explained through its objective, mechanics, examples and evaluation.
</div>

## One thread runs through all of it

It is tempting to read the history of machine learning as a list of unrelated tricks. It reads better as a single question asked repeatedly:

> **How much structure do we build into the model, and how much do we let the data decide?**

Every method in this book is an answer to that. Linear regression builds in a great deal, it asserts the relationship *is* a straight line, and in exchange needs very little data and yields coefficients you can read. A Transformer builds in almost nothing about which positions should interact, and in exchange needs a great deal of data. Everything else sits between those poles.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 740 196" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="b0-title b0-desc" style="width:100%;max-width:740px;height:auto;font-family:sans-serif">
  <title id="b0-title">Model families ordered by how much structure they assume</title>
  <desc id="b0-desc">Six families from linear models to Transformers, each labelled with the prior it builds in, ordered left to right from most assumed structure to most learned from data.</desc>
  <rect width="740" height="196" fill="#f8fafc" rx="12"/>
  <text x="370" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Each family is a different answer to “how much do we assume?”</text>

  <rect x="10"  y="38" width="110" height="86" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
  <rect x="130" y="38" width="110" height="86" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
  <rect x="250" y="38" width="110" height="86" rx="8" fill="#cffafe" stroke="#0891b2" stroke-width="1.6"/>
  <rect x="370" y="38" width="110" height="86" rx="8" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.6"/>
  <rect x="490" y="38" width="110" height="86" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.6"/>
  <rect x="610" y="38" width="110" height="86" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.6"/>

  <text x="65"  y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#1d4ed8">Linear models</text>
  <text x="185" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#1d4ed8">Trees · kernels</text>
  <text x="305" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#0e7490">Unsupervised</text>
  <text x="425" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#0f766e">Neural nets</text>
  <text x="545" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#b45309">CNNs · RNNs</text>
  <text x="665" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#6d28d9">Transformers</text>

  <text x="65"  y="82" text-anchor="middle" font-size="8" fill="#334155">assumes the</text>
  <text x="65"  y="93" text-anchor="middle" font-size="8" fill="#334155">relationship is</text>
  <text x="65"  y="104" text-anchor="middle" font-size="8" fill="#334155">linear</text>

  <text x="185" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes similar</text>
  <text x="185" y="93" text-anchor="middle" font-size="8" fill="#334155">inputs give similar</text>
  <text x="185" y="104" text-anchor="middle" font-size="8" fill="#334155">outputs</text>

  <text x="305" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes there is</text>
  <text x="305" y="93" text-anchor="middle" font-size="8" fill="#334155">structure without</text>
  <text x="305" y="104" text-anchor="middle" font-size="8" fill="#334155">any labels</text>

  <text x="425" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes the</text>
  <text x="425" y="93" text-anchor="middle" font-size="8" fill="#334155">features themselves</text>
  <text x="425" y="104" text-anchor="middle" font-size="8" fill="#334155">can be learned</text>

  <text x="545" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes locality</text>
  <text x="545" y="93" text-anchor="middle" font-size="8" fill="#334155">(CNN) or sequential</text>
  <text x="545" y="104" text-anchor="middle" font-size="8" fill="#334155">order (RNN)</text>

  <text x="665" y="82" text-anchor="middle" font-size="8" fill="#334155">assumes almost</text>
  <text x="665" y="93" text-anchor="middle" font-size="8" fill="#334155">nothing, learns</text>
  <text x="665" y="104" text-anchor="middle" font-size="8" fill="#334155">what interacts</text>

  <path d="M14 150 L716 150" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="716,145 728,150 716,155" fill="#94a3b8"/>
  <text x="14"  y="171" font-size="9" fill="#475569">more structure assumed · less data needed · easier to interpret</text>
  <text x="716" y="171" text-anchor="end" font-size="9" fill="#475569">more learned from data · more data needed · harder to interpret</text>
  <text x="370" y="188" text-anchor="middle" font-size="8.5" fill="#64748b">Nothing here is obsolete: the left of this line is still the right answer for small, tabular, or interpretability-critical problems.</text>
</svg>
<figcaption>The organising axis of this book. Moving right buys flexibility and costs data, compute, and interpretability, a trade, not an upgrade.</figcaption>
</figure>
</div>

<div class="warning-box">
<strong>The direction of that arrow is not a ranking.</strong> On a few hundred rows of tabular data, gradient-boosted trees routinely beat anything deeper, and a logistic regression you can explain to a regulator may be worth more than two points of accuracy you cannot. “Newer” is a statement about assumptions, not about quality.
</div>

## What you need before the later books

Each book on this site leans on a specific part of this one:

- **[Transformers](/blog/transformers/overview/)** assumes softmax, cross-entropy, gradient descent, residual connections, and, most of all, that you know what a convolution's fixed receptive field costs, because attention is the answer to that cost.
- **Graph Neural Networks** assume message passing is a generalisation of convolution, which only lands if convolution is solid first.
- **[Sheaf Neural Networks](/blog/sheaf/overview/)** assume the graph Laplacian, eigen-decomposition, and the idea of a diffusion operator.
- **Diffusion models** assume maximum likelihood, the Gaussian, and the ELBO.

## The complete reading map

The book now contains **42 chapters across seven sections**, plus this overview. Survey chapters introduce the families; dedicated chapters derive individual methods and explain their limits.

### Learning Foundations & Experimental Practice

- [Bias, Variance, and Regularisation](/blog/basics/bias-variance-and-regularisation/) — A model can fail for two opposite reasons: it is too rigid to represent the truth, or so flexible that it chases the noise. Squared error splits cleanly into exactly those two terms plus a floor you cannot beat.
- [Gradient Descent and Backpropagation](/blog/basics/gradient-descent-and-backprop/) — Training is one loop: measure the loss, ask backpropagation which way is downhill, take a small step. This chapter derives exactly how small that step has to be, why the answer is 2/a for a quadratic, and why reverse-mode differentiation gets you every gradient for roughly the price of one forward pass.
- [ML Preprocessing](/blog/basics/ml-preprocessing/) — Work through training-only scaling, distinguish missingness strategies, and build preprocessing decisions around the distance, loss and deployment information available.
- [Cross-Validation](/blog/basics/ml-cross-validation/) — Design random, grouped and temporal splits, compute an out-of-fold error correctly, and separate model selection from evaluation of the selection procedure.

### Linear, Local & Probabilistic Prediction

- [Linear Regression](/blog/basics/linear-regression/) — Fitting a line by least squares is not an optimisation trick, it is the orthogonal projection of the observation vector onto the column space of the design matrix, and once you see that, the normal equations, the failure modes, and the reason we solve by QR instead of inverting all follow from one picture.
- [Ridge Regression](/blog/basics/ridge-regression/) — Derive the regularised least-squares solution, inspect shrinkage in the SVD basis, and connect scaling, intercept handling and validation to the meaning of the penalty.
- [Lasso Regression](/blog/basics/lasso-regression/) — Derive the coordinate update from the L1 subgradient, calculate exact zeros, and explain when sparse selection becomes unstable or elastic net is preferable.
- [Logistic Regression](/blog/basics/logistic-regression/) — Logistic regression is not a squashed linear regression, it is a straight line drawn in log-odds space, which is why one coefficient means one multiplication of the odds, and why perfectly separable data drives that coefficient to infinity.
- [K-Nearest Neighbours](/blog/basics/nearest-neighbours/) — Compute classification and regression predictions, analyse the neighbourhood-size tradeoff, and understand why representation and search strategy dominate this simple estimator.
- [Naive Bayes](/blog/basics/naive-bayes/) — Derive the class score, calculate a smoothed text example, and distinguish Gaussian, multinomial and Bernoulli likelihoods and their failure modes.
- [Support Vector Machines](/blog/basics/svm-and-kernels/) — Among all the hyperplanes that separate two classes, one sits furthest from both. Finding it turns out to depend on the data only through inner products, and that single fact is what lets you work in a space you never build.

### Decision Trees & Ensembles

- [Trees, Forests, and Boosting](/blog/basics/trees-forests-boosting/) — A decision tree chops feature space into axis-aligned boxes and predicts one number per box, which explains why it needs no feature scaling, why it approximates a diagonal boundary as a staircase, and why it cannot extrapolate a single step beyond the training range.
- [Decision Trees](/blog/basics/decision-trees/) — Calculate Gini and regression split improvements, understand greedy axis-aligned partitions, and connect leaf size and pruning to prediction stability.
- [Random Forests](/blog/basics/random-forests/) — Derive the variance of correlated averages, calculate the out-of-bag fraction, and explain why random feature subsets and diagnostic choices matter.
- [AdaBoost](/blog/basics/adaboost/) — Derive binary AdaBoost’s learner weight, compute a complete reweighting step, and explain how exponential loss connects the algorithm to margins and label-noise sensitivity.
- [Gradient Boosting](/blog/basics/gradient-boosting/) — Derive residual fitting from the loss gradient, work through a regression update, and extend the mechanism to logistic and second-order tree boosting.

### Clustering: One Method at a Time

- [Clustering](/blog/basics/clustering/) — k-means says a cluster is a ball around a centroid, DBSCAN says it is a connected dense region, and a Gaussian mixture says it is a bump in a density, pick the algorithm and you have already picked the answer.
- [K-means](/blog/basics/k-means/) — Derive the assignment and centroid updates, run a complete example, understand k-means++ seeding, and separate a good objective value from a useful clustering.
- [Mini-Batch K-means](/blog/basics/mini-batch-k-means/) — Derive the running-mean update, distinguish mini-batch optimisation from concept-drift tracking, and measure the speed–quality tradeoff on a fixed evaluation sample.
- [K-medoids](/blog/basics/k-medoids/) — Build a clustering around actual observations, calculate medoid costs, and understand the robustness and computational tradeoffs of partitioning around medoids.
- [Agglomerative Clustering](/blog/basics/agglomerative-clustering/) — Compute competing linkage decisions, derive Ward’s merge cost, and read a dendrogram without confusing a greedy hierarchy with a unique natural taxonomy.
- [DBSCAN](/blog/basics/dbscan/) — Trace density-connected components by hand, distinguish core and border observations, and understand why one neighbourhood scale can fail on varying densities.
- [OPTICS](/blog/basics/optics/) — Compute core and reachability distances, interpret valleys in the ordering, and distinguish the OPTICS representation from the rule used to extract a partition.
- [HDBSCAN](/blog/basics/hdbscan/) — Build the density hierarchy from mutual reachability, explain cluster persistence and minimum-size pruning, and interpret membership strengths without calling them class probabilities.
- [Gaussian Mixture Models](/blog/basics/gaussian-mixtures/) — Derive expectation–maximisation updates, calculate a soft assignment, and diagnose likelihood singularities, covariance assumptions and model-selection errors.
- [Spectral Clustering](/blog/basics/spectral-clustering/) — Derive the graph-smoothness objective, connect eigenvectors to disconnected components, and explain why affinity construction often matters more than the final k-means step.
- [Mean Shift](/blog/basics/mean-shift/) — Derive the weighted-mean movement behind mode seeking, follow a local update, and explain why bandwidth and mode merging determine the final clustering.
- [BIRCH](/blog/basics/birch/) — Derive the additive clustering-feature summary, calculate a subcluster radius, and understand what a CF tree preserves and loses before global clustering.
- [Fuzzy C-means](/blog/basics/fuzzy-c-means/) — Derive the membership and centre updates, calculate a two-centre assignment, and distinguish fuzzy membership from a probabilistic mixture posterior.
- [Evaluating Clustering](/blog/basics/clustering-evaluation/) — Calculate silhouette and pair agreement, diagnose misleading cluster-count criteria, and design evaluations that match the purpose of an unsupervised analysis.

### PCA, Factorisation & Neighbourhood Embeddings

- [PCA](/blog/basics/pca-and-dimensionality-reduction/) — PCA can be derived by asking for the directions of greatest spread, or by asking for the subspace that loses the least when you project onto it. The two questions look unrelated and have the same answer, which is the most useful thing to understand about it.
- [Kernel PCA](/blog/basics/kernel-pca/) — Derive kernel centring and feature-space coordinates, project new observations correctly, and distinguish nonlinear representation from reconstruction in the original space.
- [Independent Component Analysis](/blog/basics/independent-component-analysis/) — Explain the linear mixing model, why decorrelation is insufficient, and how non-Gaussian contrasts identify sources only under explicit assumptions and ambiguities.
- [Nonnegative Matrix Factorisation](/blog/basics/nonnegative-matrix-factorisation/) — Derive nonnegative low-rank reconstruction, inspect multiplicative updates and scale ambiguity, and separate useful additive factors from guaranteed semantic parts.
- [Random Projections](/blog/basics/random-projections/) — Derive expected squared-distance preservation, interpret finite-set concentration bounds, and compare random embeddings with PCA and neighbourhood-based methods.
- [t-SNE](/blog/basics/t-sne/) — Derive high- and low-dimensional affinities, explain the asymmetric KL objective, and identify which distances and apparent clusters a t-SNE plot does not establish.
- [UMAP](/blog/basics/umap/) — Explain local distance normalisation, fuzzy graph combination and attractive–repulsive layout, then connect neighbour count and minimum distance to practical interpretation.

### Neural Networks

- [Convolutions and CNNs](/blog/basics/convolutions-and-cnns/) — A dense layer from a 224-by-224 colour image to 1000 units holds 150.5 million weights; a 3-by-3, 64-filter convolution holds 1,792, and the two constraints that buy that factor of 84,000 are exactly the prior that makes it work on images.
- [RNNs, LSTMs, and GRUs](/blog/basics/rnns-lstms-grus/) — A recurrent network shares weights across time exactly as a convolution shares them across space. The trouble is that gradients then travel through a product of Jacobians, and a product of a hundred numbers slightly below one is zero.

### Activation Functions

- [Activation Functions in Neural Networks](/blog/basics/activation-functions/) — Activation functions are the reason neural networks can model curved decision boundaries instead of collapsing into one giant linear map. This chapter builds the intuition first, then walks through the classical functions that shaped deep learning.
- [Modern Activation Functions](/blog/basics/modern-activation-functions/) — Once ReLU became the default, researchers started asking a better question: can we keep the easy optimization while making the activation smoother, softer, and more expressive? This chapter covers the modern answers.
- [Output and Gated Activations](/blog/basics/output-gated-and-special-activations/) — The last activation in your network is not a modelling preference, it is a contract with your loss function. Break it and training stops meaning anything. Here is the contract, and what changes when the activation itself becomes learned.

## How to read it

If you are here to unblock a later book, read only what that book needs, the list above tells you which chapters those are. For a broader foundation, begin with learning, preprocessing and validation, then follow the method family that matches the problem. Use the dedicated clustering evaluation chapter to compare partitions, and the PCA chapter before its nonlinear alternatives.

Every chapter follows the same shape: the intuition first, then the mathematics, then a worked example small enough to check by hand, then an honest section on what the method does *not* do. That last part is the one worth reading twice.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>The book develops classical ML in depth and supplies the foundation for the later research books.</li>
  <li>The through-line is how much structure a model assumes versus how much it learns, that single axis orders everything from least squares to attention.</li>
  <li>Moving along that axis is a trade against data, compute, and interpretability. It is not a ranking, and the classical end is still the correct choice for a great many real problems.</li>
  <li>Follow the common foundations, then choose a supervised, clustering or representation-learning route. Different methods require different optimisation procedures.</li>
</ul>
</div>
