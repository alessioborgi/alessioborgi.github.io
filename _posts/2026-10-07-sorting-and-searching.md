---
layout: single
title: "Sorting and Searching: The n log n Lower Bound, and How to Beat It Legally"
date: 2026-10-07
categories: [cs-basics]
book: cs-basics
subsection: algorithms
tags: [sorting, binary-search, quicksort, lower-bounds]
excerpt: "No comparison sort can beat n log n — that is a theorem with a two-line counting proof, not a limit of current cleverness. Counting sort beats it anyway, because it never compares two elements. Also: how to write a binary search whose boundaries are right."
author_profile: true
read_time: true
is_overview: false
icon: "🔢"
read_mins: 7
permalink: /blog/cs-basics/sorting-and-searching/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Write binary search over a half-open interval \([lo, hi)\) and maintain one invariant — the answer is always inside it — and the off-by-ones disappear. Merge sort is \(\Theta(n\log n)\) worst case and stable but needs \(\Theta(n)\) extra space; quicksort is <em>expected</em> \(\Theta(n\log n)\) with a \(\Theta(n^2)\) worst case that random pivots make improbable rather than impossible; heapsort is \(\Theta(n\log n)\) worst case in place but unstable and cache-hostile. \(\Omega(n\log n)\) is a proved lower bound for comparison sorting; counting and radix sorts escape it by not comparing.
</div>

## Binary search, written so it terminates

Nearly every bug here is the same bug: the loop condition and the update disagree about whether the endpoint is inside the search space. Fix a convention — half-open $$[lo, hi)$$, so $$hi$$ is one past the last candidate — and state the invariant: *the answer, if it exists, is in $$[lo, hi)$$.*

```python
def lower_bound(a, target):
    """Leftmost index i with a[i] >= target, for sorted a. Theta(log n).
    Invariant: the answer always lies in the half-open interval [lo, hi)."""
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2       # lo <= mid < hi, so the interval always shrinks
        if a[mid] < target:
            lo = mid + 1           # a[mid] is excluded: it is too small
        else:
            hi = mid               # a[mid] is still a candidate, hence hi = mid
    return lo                      # lo == hi: the interval is empty

a = [1, 3, 3, 5, 8]
print(lower_bound(a, 3))   # 1  -- leftmost of the two 3s
print(lower_bound(a, 4))   # 3  -- insertion point
print(lower_bound(a, 9))   # 5  -- past the end
```

Three things make it correct. `mid` satisfies $$lo \le mid < hi$$, so every branch strictly shrinks the interval and the loop must terminate. The `hi = mid` branch keeps `mid` as a candidate — pairing it with `while lo <= hi` would spin forever. And returning `lo` makes the function total: it answers "where would it go" for absent targets. Flip one comparison to `a[mid] <= target` for the rightmost occurrence; in production use `bisect.bisect_left` / `bisect_right`, which are this code in C.

One historical note: `mid = (lo + hi) // 2` can overflow in fixed-width integer languages — the bug found in the JDK's `binarySearch` after years in the library — so write `lo + (hi - lo) // 2` there. Python's integers are arbitrary precision, so it cannot happen here.

## The three comparison sorts worth knowing

**Merge sort** splits in half, sorts each half, and merges. The recurrence $$T(n) = 2T(n/2) + \Theta(n)$$ gives $$\Theta(n\log n)$$ in *all* cases by the [Master theorem](/blog/cs-basics/complexity-and-big-o/). It is stable, needs $$\Theta(n)$$ auxiliary space, and because it streams sequentially it is the algorithm for linked lists and for external sorting.

**Quicksort** partitions around a pivot and recurses on both sides. A balanced split gives the same recurrence and $$\Theta(n\log n)$$; a maximally unbalanced split gives $$T(n) = T(n-1) + \Theta(n) = \Theta(n^2)$$. With a fixed pivot (first or last element) the worst case is triggered by *sorted* input — the most common real input there is. Choosing the pivot uniformly at random makes the expected time $$\Theta(n\log n)$$ **for every input**, because the randomness now lives in the algorithm rather than in an assumption about the data; the $$\Theta(n^2)$$ case survives but no adversary can force it. It sorts in place with $$\Theta(\log n)$$ expected stack depth, and its constant is small enough that it beats merge sort in practice.

**Heapsort** builds a heap in $$\Theta(n)$$ and extracts the maximum $$n$$ times: $$\Theta(n\log n)$$ worst case, in place, unstable, and cache-hostile. Its real use is as a safety net — introsort runs quicksort but switches to heapsort once recursion depth exceeds $$\approx 2\log_2 n$$, keeping quicksort's average speed with a hard $$O(n\log n)$$ bound.

| Sort | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Merge | $$\Theta(n\log n)$$ | $$\Theta(n\log n)$$ | $$\Theta(n\log n)$$ | $$\Theta(n)$$ | yes |
| Quick (random pivot) | $$\Theta(n\log n)$$ | $$\Theta(n\log n)$$ | $$\Theta(n^2)$$ | $$\Theta(\log n)$$ expected | no |
| Heap | $$\Theta(n\log n)$$ | $$\Theta(n\log n)$$ | $$\Theta(n\log n)$$ | $$\Theta(1)$$ | no |
| Insertion | $$\Theta(n)$$ | $$\Theta(n^2)$$ | $$\Theta(n^2)$$ | $$\Theta(1)$$ | yes |
| Counting | $$\Theta(n+k)$$ | $$\Theta(n+k)$$ | $$\Theta(n+k)$$ | $$\Theta(n+k)$$ | yes |

## Why Ω(n log n) is a theorem

Any algorithm that only *compares* elements is a decision tree: internal nodes are comparisons, each with two outcomes, and each leaf is one permutation the algorithm can output. To sort correctly it must be able to produce all $$n!$$ orderings, so the tree has at least $$n!$$ leaves. A binary tree of height $$h$$ has at most $$2^h$$ leaves, so $$2^h \ge n!$$ and

<div class="formula-box">
\[
h \;\ge\; \log_2 (n!) \;\ge\; \log_2\!\left(\left(\tfrac{n}{2}\right)^{n/2}\right) \;=\; \tfrac{n}{2}\log_2 \tfrac{n}{2} \;=\; \Omega(n\log n),
\]
</div>

using that the top half of the factors in $$n!$$ are each at least $$n/2$$. The height is the worst-case number of comparisons, so **no** comparison sort can do better. This is a statement about all possible algorithms, which is why it is $$\Omega$$ and not $$O$$.

## Stability, and when it matters

A stable sort preserves the relative order of equal keys. This is what lets you sort by several keys with repeated passes: sort by the *secondary* key first, then by the primary, and the earlier order survives inside ties.

```python
rows = [("bob", 2), ("amy", 1), ("cal", 2), ("dee", 1)]
rows.sort(key=lambda r: r[0])          # secondary key: name
rows.sort(key=lambda r: r[1])          # primary key: group
print(rows)   # [('amy', 1), ('dee', 1), ('bob', 2), ('cal', 2)]
```

Python's `list.sort` and `sorted` are stable, guaranteed by the language reference; they run Timsort, which exploits pre-existing runs and is $$\Theta(n)$$ on already-sorted input. `numpy.sort` defaults to an introsort-style quicksort, which is **not** stable — pass `kind="stable"` if you rely on it.

## Beating the bound legally

The lower bound applies only to comparison-based algorithms. Sorts that read the keys' structure instead escape it, at the cost of a precondition:

- **Counting sort:** integer keys in a known range $$[0, k)$$. $$\Theta(n+k)$$ time and space, stable. Useless when $$k \gg n$$ — sorting 64-bit integers this way needs $$2^{64}$$ counters.
- **Radix sort:** fixed-width keys sorted digit by digit with a stable counting sort per digit, $$\Theta(d(n+k))$$ for $$d$$ digits. Stability per pass is what makes it correct.
- **Bucket sort:** distribute into buckets, sort each. Linear *expected* time under the assumption that keys are uniformly distributed — an assumption about your data, not a guarantee.

<div class="insight-box">
  <strong>Key Insight — randomisation moves the uncertainty from the input to the coin.</strong> Quicksort with a first-element pivot has an average-case bound that quietly assumes your inputs are uniformly random permutations; sorted or nearly-sorted data violates that and you get \(\Theta(n^2)\). Randomising the pivot changes nothing about the algorithm's worst case, but it makes the running-time distribution identical for <em>every</em> input, so no adversary and no unlucky data source can systematically trigger the bad case. This is the same trick as hash randomisation in Python's <a href="/blog/cs-basics/arrays-and-hashing/">dictionaries</a>.
</div>

<div class="warning-box">
  <strong>Interview trap — "quicksort is \(O(n\log n)\)" is an expectation, not a guarantee.</strong> The worst case is \(\Theta(n^2)\), and with a naive pivot it fires on sorted input. Say "expected \(\Theta(n\log n)\) with a random pivot, \(\Theta(n^2)\) worst case". Adjacent traps: binary search with <code>while lo &lt;= hi</code> and <code>hi = mid</code> never terminates; merge sort's \(\Theta(n)\) auxiliary space is often forgotten when the question asks for in-place; and counting sort is \(\Theta(n+k)\), which is only linear when \(k = O(n)\).
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Binary search on \([lo, hi)\) with the invariant "the answer is inside" terminates because \(lo \le mid < hi\) forces the interval to shrink; return \(lo\) to get an insertion point.</li>
    <li>Merge \(\Theta(n\log n)\) always, stable, \(\Theta(n)\) space; quicksort expected \(\Theta(n\log n)\), \(\Theta(n^2)\) worst, in place; heapsort \(\Theta(n\log n)\) worst, in place, unstable.</li>
    <li>The decision-tree argument: \(n!\) leaves, \(2^h\) leaves available, so \(h \ge \log_2 n! = \Omega(n\log n)\) for any comparison sort.</li>
    <li>Stability lets multi-key sorting work by repeated passes, primary key last; Python's sort is stable, <code>numpy.sort</code> is not by default.</li>
    <li>Counting, radix and bucket sorts beat the bound only by not comparing, and each carries a precondition on the keys.</li>
  </ul>
</div>

## References

1. Hoare, C. A. R. [Quicksort](https://doi.org/10.1093/comjnl/5.1.10). *The Computer Journal* 5(1), 10–16, 1962.
2. Knuth, D. E. *The Art of Computer Programming, Vol. 3: Sorting and Searching*, 2nd ed. Addison-Wesley, 1998 — §5.3.1 for the comparison lower bound, §6.2.1 for binary search.
3. Musser, D. R. Introspective sorting and selection algorithms. *Software: Practice and Experience* 27(8), 983–993, 1997 — introsort.
4. Bentley, J. L., & McIlroy, M. D. Engineering a sort function. *Software: Practice and Experience* 23(11), 1249–1265, 1993.
5. Peters, T. [listsort.txt](https://github.com/python/cpython/blob/main/Objects/listsort.txt) — Timsort, as implemented in CPython.
6. Python Software Foundation. [Sorting Techniques](https://docs.python.org/3/howto/sorting.html) and [bisect](https://docs.python.org/3/library/bisect.html).
7. NumPy developers. [numpy.sort](https://numpy.org/doc/stable/reference/generated/numpy.sort.html) — sort kinds and their stability.
