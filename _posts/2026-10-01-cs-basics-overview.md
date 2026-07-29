---
layout: single
title: "Computer Science Basics for ML Engineers: What the Interview Actually Tests"
date: 2026-10-01
categories: [cs-basics]
book: cs-basics
subsection: foundations
tags: [interviews, complexity, data-structures, algorithms]
excerpt: "An ML interview that asks you to invert a binary tree is not testing your tree knowledge — it is testing whether you can state a cost, defend it, and write a loop whose boundaries are right the first time. Here is the eight-post map of what that requires."
author_profile: true
read_time: true
is_overview: true
icon: "🧠"
read_mins: 7
permalink: /blog/cs-basics/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Four things are actually being graded in a CS round: can you state the cost of what you wrote and say whether that cost is worst case, average or amortised; do you reach for the right container without thinking; can you write a boundary-heavy loop correctly the first time; and do you know what the runtime is doing underneath you. This book is eight posts: complexity, the container families, the algorithm families, and the memory-and-concurrency model behind your data loader.
</div>

## Why an ML role asks these questions at all

Because the job is mostly not modelling. The slow thing is almost never the matrix multiply — it is the Python loop that rebuilds a list every step, the `in` check against a list instead of a set, the tokeniser that concatenates strings quadratically. Those are complexity bugs wearing an ML costume.

And cost has to be predicted, not measured: a six-hour run on eight GPUs cannot be profiled casually. You are expected to see a nested loop over a dataset and say "that is quadratic, it will not finish" *before* launching it.

## What is being graded

Interviewers are not checking whether you memorised heapsort, but four separable things:

1. **Cost reasoning.** You say "expected $$O(n \log n)$$", not just "$$n \log n$$". Being precise about *which* case you are quoting is the clearest signal of someone who has done this for real.
2. **Container instinct.** The problem says "have I seen this before", and your hand types a `set` without deliberation. Most interview problems are one data-structure choice away from trivial.
3. **Boundary correctness.** Binary search, sliding windows, two pointers, tree recursion — short and unforgiving; a correct one written calmly beats a clever one that is off by one.
4. **Runtime awareness.** Why threads do not speed up a CPU-bound Python loop, why a default argument mutated across calls, why appending is cheap and inserting at the front is not.

<div class="insight-box">
  <strong>Key Insight — the derivation is the answer:</strong> stating that build-heap is \(O(n)\) earns almost nothing on its own, because it is a memorisable fact. Showing that most nodes sit near the bottom and cost almost nothing to sift down, so the total is \(n\sum_{h\ge 0} h/2^{h}\,/2 = n\), earns everything — it demonstrates the machinery you would use on a problem you have not seen. Every post here derives its complexity claims rather than asserting them.
</div>

## The eight posts

| Post | The question it answers |
|---|---|
| [Complexity and big-O](/blog/cs-basics/complexity-and-big-o/) | What does $$O$$ actually claim, how do you read a cost off nested loops and off recursion, and when does the asymptotically better algorithm lose? |
| [Arrays and hashing](/blog/cs-basics/arrays-and-hashing/) | Why contiguity beats pointer-chasing, why appending is amortised $$O(1)$$, and why "hash tables are $$O(1)$$" is three qualifications short of true. |
| [Stacks, queues, heaps](/blog/cs-basics/stacks-queues-heaps/) | LIFO and FIFO and what they buy you; the array-as-tree trick that makes a heap; why building one is linear. |
| [Trees and BSTs](/blog/cs-basics/trees-and-bsts/) | The four traversals and what each is *for*; why an unbalanced BST is a linked list with extra steps; what balancing guarantees. |
| [Graphs and traversal](/blog/cs-basics/graphs-and-traversal/) | List versus matrix; BFS versus DFS; topological order; Dijkstra and the assumption it silently makes; union-find. |
| [Sorting and searching](/blog/cs-basics/sorting-and-searching/) | Binary search without off-by-one errors; the three $$n\log n$$ sorts and their different failure modes; why $$\Omega(n \log n)$$ is a theorem, and how to beat it legally. |
| [Recursion and DP](/blog/cs-basics/recursion-and-dp/) | Base cases and the call stack; memoisation versus tabulation; the two conditions that make DP apply, and a fully filled edit-distance table. |
| [Memory and concurrency](/blog/cs-basics/memory-and-concurrency/) | Stack versus heap; reference semantics in Python; reference counting and cycles; threads, the GIL, and why data loaders fork processes. |

They are ordered as a path: complexity is the vocabulary, the data-structure posts are the nouns, the algorithm posts are the verbs, and the last post is the machine everything runs on. Under time pressure, read the complexity post properly and skim the rest — every other post states its claims in that language.

## The one table to have memorised

Average case unless marked. $$n$$ is the number of elements held.

| Operation | Dynamic array | Hash table | Balanced BST | Binary heap |
|---|---|---|---|---|
| Lookup by key | — | $$O(1)$$, $$O(n)$$ worst | $$O(\log n)$$ worst | — |
| Lookup by index | $$O(1)$$ worst | — | — | — |
| Insert | $$O(1)$$ amortised at the end, $$O(n)$$ in the middle | $$O(1)$$ amortised | $$O(\log n)$$ worst | $$O(\log n)$$ worst |
| Delete | $$O(n)$$ | $$O(1)$$ amortised | $$O(\log n)$$ worst | $$O(\log n)$$ worst (min only) |
| Min | $$O(n)$$ | $$O(n)$$ | $$O(\log n)$$ worst | $$O(1)$$ worst |
| Ordered iteration | sort first | not available | $$O(n)$$ worst | sort first |

No column wins everywhere: the hash table gives up order, the heap gives up everything except the minimum, the array gives up cheap insertion in the middle. Interview problems are usually built so that exactly one column fits.

<div class="warning-box">
  <strong>Interview traps, all four in one place.</strong> Each gets a full treatment in its own post, but they recur enough to list up front: (1) "hash tables are \(O(1)\)" — that is <em>average</em>, and the amortised qualifier is needed too, because resizes copy everything; worst case is \(O(n)\). (2) "quicksort is \(O(n\log n)\)" — <em>expected</em>; the worst case is \(O(n^2)\) and a naive pivot hits it on already-sorted input. (3) Binary search written with <code>while lo &lt;= hi</code> but updated with <code>hi = mid</code> loops forever. (4) A mutable default argument such as <code>def f(x, seen=[])</code> is created once at function definition and shared by every call.
</div>

## How to use this book

Read for the derivations, not the facts. Every complexity claim is labelled worst, average or amortised, and short derivations are given in full. Code is Python throughout, because that is what you will be asked to write and because several sharp edges — reference semantics, the GIL, `list.pop(0)` — are Python-specific. Related maths lives in the [maths basics book](/blog/math-basics/overview/), and the graph post connects to the [graph neural network book](/blog/gnn/overview/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Four things are graded: precise cost claims, container instinct, boundary correctness, runtime awareness. Everything else is decoration.</li>
    <li>Always attach a case to a complexity: worst, average, or amortised. "\(O(1)\)" alone is not a complete answer for a hash table or a dynamic array.</li>
    <li>No container dominates. Hash tables trade away order, heaps trade away everything but the extremum, arrays trade away cheap middle insertion — pick against the operation mix.</li>
    <li>Predicting cost matters more than measuring it, because ML jobs are too expensive to profile by launching them.</li>
    <li>Three derivations cover most whiteboard proofs: the geometric series for amortised append, \(\log_2(n!) = \Theta(n\log n)\) for the sorting bound, and \(\sum_h h/2^h = 2\) for linear build-heap.</li>
  </ul>
</div>

## References

1. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. [*Introduction to Algorithms*, 4th ed.](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) MIT Press, 2022.
2. Sedgewick, R., & Wayne, K. [*Algorithms*, 4th ed.](https://algs4.cs.princeton.edu/home/) Addison-Wesley, 2011.
3. Knuth, D. E. *The Art of Computer Programming, Vol. 3: Sorting and Searching*, 2nd ed. Addison-Wesley, 1998.
4. Python Software Foundation. [TimeComplexity — Python Wiki](https://wiki.python.org/moin/TimeComplexity).
5. Python Software Foundation. [The Python Standard Library](https://docs.python.org/3/library/index.html).
