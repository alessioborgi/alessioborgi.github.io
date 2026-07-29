---
layout: single
title: "Big-O Precisely: What O, Ω and Θ Each Claim, and When the Faster Algorithm Loses"
date: 2026-10-02
categories: [cs-basics]
book: cs-basics
subsection: foundations
tags: [complexity, big-o, master-theorem, amortised]
excerpt: "Big-O is an upper bound on growth, not a running time, and saying an algorithm is O(n²) is compatible with it being O(n). Here is what each symbol actually claims, how to read a cost off loops and recursions, and why the asymptotically better algorithm sometimes loses on real hardware."
author_profile: true
read_time: true
is_overview: false
icon: "📈"
read_mins: 7
permalink: /blog/cs-basics/complexity-and-big-o/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> \(O\) is an upper bound, \(\Omega\) a lower bound, \(\Theta\) both at once — and only \(\Theta\) pins the growth down. Attach a case to every claim: worst is a guarantee, average is over an input distribution, amortised is a guarantee over a <em>sequence</em> of operations with no probability involved. Nested loops multiply; recursion is read with the Master theorem. Asymptotics describe the limit, so for the \(n\) you actually have, constants, memory locality and branch behaviour can and do reverse the ranking.
</div>

## The three symbols, stated properly

All three compare growth rates as $$n \to \infty$$, discarding constants. For non-negative $$f$$ and $$g$$:

<div class="formula-box">
\[
\begin{aligned}
f = O(g) &\iff \exists\, c>0,\, n_0 : f(n) \le c\,g(n) \ \ \forall n \ge n_0,\\
f = \Omega(g) &\iff \exists\, c>0,\, n_0 : f(n) \ge c\,g(n) \ \ \forall n \ge n_0,\\
f = \Theta(g) &\iff f = O(g) \ \text{and}\ f = \Omega(g).
\end{aligned}
\]
</div>

Read them as claims. $$O$$ says "grows no faster than"; $$\Omega$$ says "grows no slower than"; $$\Theta$$ says "grows at the same rate as". Three consequences people trip over:

- $$O$$ is an upper bound, so a linear algorithm *is* $$O(n^2)$$ — the statement is true and useless. When you say an algorithm "is $$O(n^2)$$" you are conventionally asserting the tight bound, which is really a $$\Theta$$ claim. Say $$\Theta$$ when you mean it.
- The bound is on the *function*, not the algorithm. "Quicksort is $$O(n \log n)$$" is meaningless until you say which function: its expected running time, or its worst case? Those differ.
- $$\Omega$$ belongs to problems more than to code. "Comparison sorting is $$\Omega(n\log n)$$" says no comparison algorithm can do better — a statement about every possible algorithm, proved in the [sorting post](/blog/cs-basics/sorting-and-searching/).

## Worst, average, amortised

These are three different quantifiers over the input, and confusing them is the most common way to be wrong while sounding right.

**Worst case** maximises over inputs of size $$n$$. It is a guarantee: nothing can be slower. **Average case** takes an expectation over an assumed distribution of inputs, and that assumption is part of the claim — quicksort's $$\Theta(n\log n)$$ average assumes a uniformly random permutation, which your already-sorted log file is not.

**Amortised** is different in kind. It is still worst case, but over a *sequence*: if any sequence of $$m$$ operations costs $$O(m \cdot T)$$ in total, each operation is amortised $$O(T)$$, even though individual ones may be much dearer. No randomness is involved, so an adversary cannot break it. Appending to a dynamic array is amortised $$O(1)$$ with worst-case $$O(n)$$ on the resize step; the [arrays post](/blog/cs-basics/arrays-and-hashing/) derives it from a geometric series.

## Reading a cost off loops

Sequential blocks add and take the max; nested loops multiply — but only when the inner bound does not depend on the outer index.

```python
def count_close_pairs(xs, eps):
    n = len(xs)
    total = 0
    for i in range(n):              # n iterations
        for j in range(i + 1, n):   # n - 1 - i iterations
            if abs(xs[i] - xs[j]) < eps:
                total += 1
    return total
```

The inner loop runs $$n-1-i$$ times, so the total is $$\sum_{i=0}^{n-1}(n-1-i) = n(n-1)/2$$, which is $$\Theta(n^2)$$: the triangular shape halves the constant but not the growth. A loop that doubles its counter, `while i < n: i *= 2`, runs $$\lfloor \log_2 n\rfloor + 1$$ times, which is where every $$\log$$ in this book comes from — repeated halving or doubling.

The trap is a hidden loop: `if x in some_list` is $$\Theta(n)$$, so wrapping it in a loop is $$\Theta(n^2)$$, and `s += chunk` in a loop copies the whole string each time. Both look like one line.

## Reading a cost off recursion

For a recursion that splits into $$a$$ subproblems of size $$n/b$$ plus $$f(n)$$ work to divide and combine,

<div class="formula-box">
\[
T(n) = a\,T(n/b) + f(n), \qquad a \ge 1,\ b > 1,
\]
</div>

the **Master theorem** compares $$f(n)$$ with $$n^{\log_b a}$$, the total cost of the leaves:

1. If $$f(n) = O(n^{\log_b a - \varepsilon})$$ for some $$\varepsilon > 0$$, the leaves dominate: $$T(n) = \Theta(n^{\log_b a})$$.
2. If $$f(n) = \Theta(n^{\log_b a}\log^k n)$$ with $$k \ge 0$$, every level costs the same: $$T(n) = \Theta(n^{\log_b a}\log^{k+1} n)$$.
3. If $$f(n) = \Omega(n^{\log_b a + \varepsilon})$$ and $$a f(n/b) \le c f(n)$$ for some $$c<1$$ and large $$n$$, the root dominates: $$T(n) = \Theta(f(n))$$.

| Recurrence | $$n^{\log_b a}$$ | Case | Result |
|---|---|---|---|
| Merge sort: $$2T(n/2) + \Theta(n)$$ | $$n^1$$ | 2, $$k=0$$ | $$\Theta(n\log n)$$ |
| Binary search: $$T(n/2) + \Theta(1)$$ | $$n^0 = 1$$ | 2, $$k=0$$ | $$\Theta(\log n)$$ |
| Strassen: $$7T(n/2) + \Theta(n^2)$$ | $$n^{\log_2 7} \approx n^{2.807}$$ | 1 | $$\Theta(n^{\log_2 7})$$ |
| Naive matrix multiply, blocked: $$8T(n/2)+\Theta(n^2)$$ | $$n^3$$ | 1 | $$\Theta(n^3)$$ |

Strassen is the interesting row: it does seven multiplications where the blocked algorithm does eight, and that single saved subproblem is what drops the exponent from $$3$$ to $$2.807$$.

## Space complexity

Count everything that lives simultaneously, including the call stack. Merge sort needs $$\Theta(n)$$ auxiliary space for the merge buffer; quicksort partitions in place but its recursion depth is $$\Theta(\log n)$$ expected and $$\Theta(n)$$ worst case, which is why real implementations recurse on the smaller side. A recursive tree traversal costs $$\Theta(h)$$ stack space for tree height $$h$$ — fine at $$h = 20$$, a crash at $$h = 10^6$$, as the [recursion post](/blog/cs-basics/recursion-and-dp/) shows.

<div class="insight-box">
  <strong>Key Insight — asymptotics are a statement about the limit, and you are not in the limit.</strong> \(f = O(g)\) only promises something beyond an unspecified \(n_0\). Insertion sort is \(\Theta(n^2)\) and merge sort \(\Theta(n\log n)\), yet insertion sort wins on short arrays because its constant is tiny and it touches memory in one direction. This is not folklore: CPython's list sort splits the input into runs and sorts short ones with binary insertion sort rather than merging, precisely for this reason.
</div>

## Why the better algorithm sometimes loses

Two forces. First, constants: a $$\Theta(n\log n)$$ algorithm with a large constant loses to a $$\Theta(n^2)$$ one until $$n$$ is large enough, and "large enough" is sometimes past any $$n$$ you will see.

Second, memory. The model behind big-O charges $$1$$ per memory access, and real hardware does not. A cache line is fetched as a block — 64 bytes on x86-64 — so a sequential scan of an array amortises one fetch over many elements, while pointer-chasing through a linked list pays a fresh miss per node. Two algorithms with identical asymptotics can differ substantially on this alone, which is why array-backed structures dominate in practice.

<div class="warning-box">
  <strong>Interview trap — an unqualified complexity is not an answer.</strong> "Quicksort is \(O(n\log n)\)" is <em>expected</em>, not worst case; the worst case is \(\Theta(n^2)\). "Hash lookup is \(O(1)\)" is <em>average</em>; worst case is \(\Theta(n)\). "Append is \(O(1)\)" is <em>amortised</em>; a single append can be \(\Theta(n)\). Also: \(O(2n)\), \(O(n + 100)\) and \(O(n/2)\) are all just \(O(n)\) — writing the constant signals you have not taken the limit — and \(\log\) bases vanish into the constant, so \(\log_2\) and \(\ln\) are the same \(O(\log n)\).
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>\(O\) upper-bounds growth, \(\Omega\) lower-bounds it, \(\Theta\) does both; only \(\Theta\) is a tight claim, and "is \(O(\cdot)\)" in conversation usually means \(\Theta\).</li>
    <li>Worst case maximises over inputs, average takes an expectation over a distribution you must state, amortised is a worst-case guarantee spread over a sequence — no probability involved.</li>
    <li>Nested loops multiply only when independent; \(\sum_{i<n}(n-i) = n(n-1)/2 = \Theta(n^2)\), and every logarithm comes from halving or doubling.</li>
    <li>Master theorem: compare \(f(n)\) with \(n^{\log_b a}\). Merge sort is case 2 giving \(\Theta(n\log n)\); Strassen is case 1 giving \(\Theta(n^{2.807})\).</li>
    <li>Space includes the call stack, and asymptotics ignore both constants and cache behaviour — which is why short arrays get insertion-sorted inside industrial sort routines.</li>
  </ul>
</div>

## References

1. Knuth, D. E. Big Omicron and big Omega and big Theta. *ACM SIGACT News* 8(2), 18–24, 1976.
2. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. [*Introduction to Algorithms*, 4th ed.](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) MIT Press, 2022 — ch. 3–4 for asymptotics, the Master theorem and amortised analysis.
3. Bentley, J. L., Haken, D., & Saxe, J. B. A general method for solving divide-and-conquer recurrences. *ACM SIGACT News* 12(3), 36–44, 1980.
4. Strassen, V. Gaussian elimination is not optimal. *Numerische Mathematik* 13, 354–356, 1969.
5. Peters, T. [listsort.txt](https://github.com/python/cpython/blob/main/Objects/listsort.txt) — CPython's description of Timsort, including the binary-insertion cutover for short runs.
6. Drepper, U. [What Every Programmer Should Know About Memory](https://www.akkadia.org/drepper/cpumemory.pdf). 2007.
