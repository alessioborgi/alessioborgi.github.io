---
layout: single
title: "Topic Models: LDA, Mixed Membership and Interpretable Word Groups"
date: 2026-10-19 09:16:00 +0100
categories: [nlp]
book: nlp
subsection: classification
tags: ["nlp", "topic-models", "lda", "latent-variables"]
excerpt: "Derive the document–topic mixture, work through a token-assignment update, and separate predictive fit from human interpretability."
author_profile: true
read_time: true
is_overview: false
icon: "🗂️"
read_mins: 4
permalink: /blog/nlp/topic-models/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> LDA represents each document as a mixture of topics and each topic as a distribution over words. Each token receives a latent topic assignment. The model discovers statistical groupings under bag-of-words assumptions; topic names and usefulness require separate interpretation and evaluation.
</div>

## A document can contain several subjects

A support ticket can discuss delivery and battery life in the same paragraph. Assigning it to one cluster forces a single membership; a topic mixture allows both subjects to contribute. The topics themselves are distributions over vocabulary entries, not human-authored labels.

For $$K$$ topics, let $$\theta_d$$ be document $$d$$'s topic mixture and $$\phi_k$$ topic $$k$$'s word distribution. LDA places Dirichlet priors on those distributions, then draws a topic $$z_{dn}$$ and word $$w_{dn}$$ for each token:

<div class="formula-box">
\[
\theta_d\sim\operatorname{Dir}(\alpha),\quad
\phi_k\sim\operatorname{Dir}(\beta),\quad
z_{dn}\sim\operatorname{Cat}(\theta_d),\quad
w_{dn}\sim\operatorname{Cat}(\phi_{z_{dn}}).
\]
</div>

The topic assigned to one token need not be the topic assigned to the next. That token-level mixed membership is what allows a document to combine subjects.

## Marginalise the hidden topic

Conditional on the mixtures and topic distributions,

<div class="formula-box">
\[
P(w\mid d)=\sum_{k=1}^{K}\theta_{dk}\phi_{kw}.
\]
</div>

Suppose a ticket is 0.75 hardware and 0.25 shipping. If `battery` has probability 0.20 under hardware and 0.01 under shipping, its probability in the document is $$0.75(0.20)+0.25(0.01)=0.1525$$. This is a mixture of word distributions, not a claim that 75% of the characters describe hardware.

A word can have substantial probability in several topics. Very common words can dominate unless vocabulary choices and priors are handled carefully. Removing words indiscriminately can also discard useful distinctions, so inspect the resulting topics rather than relying on a generic stop list.

## Priors control concentration

For a symmetric document prior with parameter $$\alpha$$ per topic, values below one tend to favour mixtures near the simplex boundaries, while larger values favour more even mixtures. The total concentration is $$K\alpha$$. Keeping $$\alpha$$ fixed while changing $$K$$ therefore also changes the prior's total concentration.

The topic–word prior similarly controls how probability is distributed across the vocabulary. These are preferences over distributions, not hard limits on how many topics a document may use or how many words a topic may contain.

## One collapsed Gibbs update

A common inference approach integrates out $$\theta$$ and $$\phi$$ and samples token assignments. Excluding the token currently being updated,

<div class="formula-box">
\[
P(z_{dn}=k\mid z_{-dn},w)\propto
(n_{dk}^{-dn}+\alpha_k)
\frac{n_{kw}^{-dn}+\beta_w}{n_{k*}^{-dn}+\sum_v\beta_v}.
\]
</div>

The first factor prefers topics already used in the document. The second prefers topics that already use the observed word. Normalise these weights across topics before sampling.

For two topics, suppose document counts are 3 and 1, word counts are 4 and 0, topic totals are both ten, $$\alpha=1$$ and $$\beta=1$$ over a five-word vocabulary. The weights are $$4(5/15)=4/3$$ and $$2(1/15)=2/15$$. Their normalised probabilities are $$10/11$$ and $$1/11$$. The current token must be removed before computing those counts; otherwise its previous assignment reinforces itself incorrectly.

## Interpretability is not likelihood

A topic's top words may look coherent while the document assignments are poor. Conversely, a model can improve held-out likelihood by capturing frequent statistical patterns that humans find unhelpful. Evaluate predictive fit, stability across runs and usefulness for the intended exploration task separately.

Topic labels are permutation-invariant: “topic 2” in one run need not correspond to “topic 2” in another. Align topics by their distributions before comparing them. Also inspect representative documents, not only the ten largest word probabilities.

Bag-of-words topic models discard order. “The robot damaged the parcel” and “the parcel damaged the robot” have the same counts and therefore the same document evidence under that representation. For event roles, move to [semantic role labelling](/blog/nlp/semantic-role-labelling/) rather than asking topics to recover information they never received.

<div class="insight-box">
  <strong>Key Insight:</strong> LDA separates document-level mixture weights from token-level assignments. This explains both its ability to model mixed subjects and its inability to recover word order from a bag of counts.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> A topic is not automatically a real-world category. Naming it after reading its top words is an interpretation that should be checked against documents, stability and the intended use.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Documents mix topics; topics distribute probability over words.</li>
    <li>Dirichlet concentration affects sparsity preferences.</li>
    <li>Collapsed assignment updates balance document usage and topic–word evidence.</li>
    <li>Likelihood, coherence, stability and task usefulness are different evaluation targets.</li>
  </ul>
</div>

## References

1. Blei, Ng and Jordan. [Latent Dirichlet Allocation](https://jmlr.org/papers/v3/blei03a.html). JMLR, 2003.
2. Chang et al. *Reading Tea Leaves: How Humans Interpret Topic Models*. NeurIPS, 2009.
