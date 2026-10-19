---
layout: single
title: "Spelling Correction: Edit Distance and the Noisy Channel"
date: 2026-10-19 09:05:00 +0100
categories: [nlp]
book: nlp
subsection: foundations
tags: ["nlp", "edit-distance", "spelling", "dynamic-programming"]
excerpt: "Derive the edit-distance recurrence, compute a correction by hand, and combine typo likelihood with language context without erasing unfamiliar names."
author_profile: true
read_time: true
is_overview: false
icon: "✍️"
read_mins: 4
permalink: /blog/nlp/spelling-and-edit-distance/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Edit distance finds the cheapest sequence of string edits. Spelling correction also needs a model of plausible intended words and the errors that produce the observed text. Candidate generation, ranking and the decision to leave text unchanged are separate steps.
</div>

## Align prefixes instead of enumerating edits

For strings $$x_1\ldots x_m$$ and $$y_1\ldots y_n$$, let $$D(i,j)$$ be the minimum cost of changing the first $$i$$ characters of $$x$$ into the first $$j$$ characters of $$y$$. With unit insertion, deletion and substitution costs,

<div class="formula-box">
\[
D(i,j)=\min\begin{cases}
D(i-1,j)+1 & \text{delete }x_i,\\
D(i,j-1)+1 & \text{insert }y_j,\\
D(i-1,j-1)+[x_i\ne y_j] & \text{match or substitute}.
\end{cases}
\]
</div>

Initialise $$D(i,0)=i$$ and $$D(0,j)=j$$. Each optimal edit sequence ends in one of these three cases, so the recurrence covers all possibilities without enumerating complete sequences. Filling the table costs $$O(mn)$$ time. Two rows suffice for the distance alone; reconstructing an alignment needs backpointers or another reconstruction strategy.

## A small table

Change `cat` into `cut`:

| Source / target | empty | c | u | t |
|---|---:|---:|---:|---:|
| empty | 0 | 1 | 2 | 3 |
| c | 1 | 0 | 1 | 2 |
| a | 2 | 1 | 1 | 2 |
| t | 3 | 2 | 2 | 1 |

The bottom-right entry is one: substitute `a` with `u`. A path through the table also tells us which characters aligned. Adjacent transposition is not a primitive operation in ordinary Levenshtein distance; variants that add it have different recurrences and sometimes different restrictions.

```python
def edit_distance(source, target):
    previous = list(range(len(target) + 1))
    for i, a in enumerate(source, 1):
        current = [i]
        for j, b in enumerate(target, 1):
            current.append(min(
                previous[j] + 1,
                current[j - 1] + 1,
                previous[j - 1] + (a != b),
            ))
        previous = current
    return previous[-1]

assert edit_distance("cat", "cut") == 1
assert edit_distance("", "robot") == 5
assert edit_distance("robot", "robot") == 0
```

The implementation operates on Python string elements, not user-perceived grapheme clusters. Normalisation and the choice of string units therefore belong in the input contract.

## Correction needs a probability model

Let $$x$$ be the observed typo and $$w$$ the intended word. The noisy-channel decision is

<div class="formula-box">
\[
\hat w=\arg\max_w P(x\mid w)P(w\mid c),
\]
</div>

where $$c$$ denotes surrounding context. This form assumes the error process is conditionally independent of that context given the intended word. A richer error model can relax the assumption.

For observed `form` in “complete the ___”, both `form` and `from` are dictionary words. Distance alone prefers doing nothing. Context can distinguish them. Conversely, automatically replacing an unfamiliar product code with a common word may be a serious mistake even when it improves language-model probability.

Suppose two candidates have language priors 0.1 and 0.01, but typo likelihoods 0.001 and 0.1. Their unnormalised posterior scores are 0.0001 and 0.001. The less common candidate wins because its error explanation is much stronger.

## Generate, rank, decide

Candidate generation can use a bounded edit search, a trie, or a character model. Ranking uses context and error likelihood. A final decision rule should include the unchanged input and may require a minimum improvement before making an automatic edit.

Evaluate correction separately from detection: identifying a suspicious token is easier than replacing it correctly. Include real-word errors, rare names, accents and already-correct inputs. The false-correction rate on clean text is especially informative because a system can appear useful on a typo-only test set while damaging normal writing.

<div class="insight-box">
  <strong>Key Insight:</strong> Dynamic programming gives an optimal alignment under the chosen costs. Whether that alignment represents a likely human typo is a separate modelling question.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Unit edit cost treats keyboard neighbours, missing accents and arbitrary substitutions equally. If the task requires an error model, learn or specify those costs rather than interpreting raw distance as a probability.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>The edit-distance state represents a pair of prefixes.</li>
    <li>Levenshtein distance uses insertion, deletion and substitution.</li>
    <li>Noisy-channel ranking combines error likelihood with contextual plausibility.</li>
    <li>Always evaluate the option of leaving correct text unchanged.</li>
  </ul>
</div>

## References

1. Wagner and Fischer. *The String-to-String Correction Problem*. Journal of the ACM, 1974.
2. Kernighan, Church and Gale. [A Spelling Correction Program Based on a Noisy Channel Model](https://aclanthology.org/C90-2036/). COLING, 1990.
