---
layout: single
title: "NLP Experimental Design: Paired Tests, Ablations and Behavioural Checks"
date: 2026-10-19 09:36:00 +0100
categories: [nlp]
book: nlp
subsection: evaluation
tags: ["nlp", "experiments", "bootstrap", "ablations"]
excerpt: "Design comparisons that isolate a change, quantify uncertainty on shared examples, and detect linguistic shortcuts that a benchmark average conceals."
author_profile: true
read_time: true
is_overview: false
icon: "🧪"
read_mins: 5
permalink: /blog/nlp/experimental-design/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A credible experiment states a hypothesis, controls the comparison and measures uncertainty at the independent sampling unit. Paired evaluation uses the fact that systems see the same examples. Ablations and behavioural tests explain where a change helps and which shortcuts remain.
</div>

## State the claim before choosing the metric

“Character features improve robustness to misspellings without harming clean-text classification” is testable. “The new model is better” leaves the task, population and tradeoff unspecified. Choose a main metric and relevant slices before inspecting the final test results.

Use training data to fit parameters and validation data to select features, thresholds and hyperparameters. Keep the final test for a fixed comparison. Repeatedly selecting the best system on the test set converts that set into another validation resource.

## Pair the comparison

Systems A and B usually predict the same evaluation examples. Their errors are therefore related. For accuracy, define an example-level difference $$d_i=\mathbf1[B_i\text{ correct}]-\mathbf1[A_i\text{ correct}]$$. The mean difference estimates the improvement on that sample.

Suppose B fixes 12 examples that A gets wrong but breaks five that A gets right. On 100 examples, the accuracy gain is seven percentage points. The 83 cases where the systems agree contribute zero to the paired difference. A comparison of two isolated headline scores hides this useful structure.

For non-additive metrics such as corpus BLEU or entity F1, do not average arbitrary example-level differences and assume the result equals the corpus-metric difference. Recompute the full metric on each sampled set.

## Paired bootstrap

A paired bootstrap resamples evaluation units with replacement and evaluates both systems on exactly the same sampled units. For each replicate $$b$$, compute

<div class="formula-box">
\[
\Delta^{(b)}=M(B;I_b)-M(A;I_b),
\]
</div>

where $$I_b$$ is the resampled index set and $$M$$ the metric. Quantiles of the replicate distribution provide a bootstrap interval under the method's assumptions. A confidence interval and a hypothesis-test p-value are related but not interchangeable outputs; state the procedure actually used.

If examples are messages inside conversations, resample conversations when those are the independent units. Sampling individual messages can underestimate uncertainty by pretending correlated observations are independent. Similarly, use query-level units for retrieval and document-level units for document tasks where appropriate.

## Training randomness is another source of variation

A bootstrap over test examples holds the trained models fixed. It does not measure variability from random initialisation, data order or stochastic optimisation. Evaluate multiple training runs when that variation is material, and report the run-selection policy.

Do not choose the best seed on the test set and compare it with a baseline's arbitrary seed. Report an appropriate summary across matched runs or explain the computational constraints limiting the comparison. A small mean gain with large run-to-run variation deserves a different interpretation from a stable gain.

## Ablations isolate mechanisms

If a new system changes tokenisation, model size and training data simultaneously, the final score cannot tell which change helped. An ablation removes or changes one component while keeping the rest as comparable as possible.

Some components interact, so one-at-a-time ablations do not capture every effect. For two changes A and B, a small factorial comparison—baseline, A, B, A+B—can reveal whether the combination adds more or less than their separate gains. Report resource differences too: an improvement from twice the training compute is a different result from an architectural improvement at equal budget.

## Behavioural tests target language capabilities

Construct minimal tests for negation, role reversal, entity substitution and reference. An invariance test might change a person's name while preserving the expected label. A directional test might add a negation that should change an inference result. A minimum-functionality test checks an elementary construction the system should handle.

Validate the expected labels. Replacing a name can alter gender agreement or world knowledge; adding `not` can change scope in unexpected ways. A generated test is not automatically a valid linguistic test.

## Report effect size and limits

A statistically detectable gain may be too small to justify additional latency or annotation cost. Conversely, a useful improvement on a rare but important failure may not dominate an aggregate metric. Report the size, uncertainty and distribution of the effect.

Keep data versions, splits, preprocessing, decoding and evaluation code together. Reproducibility is not only the random seed: another reader must know which task and measurement procedure produced the number.

<div class="insight-box">
  <strong>Key Insight:</strong> Paired tests exploit shared examples, while ablations isolate changed components. They answer different parts of the question “did this help, and why?”.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Resampling test examples does not account for training-seed variation. Also, a non-significant result does not prove the systems are equivalent; equivalence requires a specified tolerance and suitable analysis.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Define the hypothesis, metric and target population before final evaluation.</li>
    <li>Resample paired predictions at the independent unit.</li>
    <li>Distinguish test-sampling uncertainty from training randomness.</li>
    <li>Use ablations and validated behavioural tests to explain aggregate changes.</li>
  </ul>
</div>

## References

1. Koehn, P. [Statistical Significance Tests for Machine Translation Evaluation](https://aclanthology.org/W04-3250/). EMNLP, 2004.
2. Dror et al. [The Hitchhiker’s Guide to Testing Statistical Significance in Natural Language Processing](https://aclanthology.org/P18-1128/). ACL, 2018.
3. Ribeiro et al. [Beyond Accuracy: Behavioral Testing of NLP Models with CheckList](https://aclanthology.org/2020.acl-main.442/). ACL, 2020.
