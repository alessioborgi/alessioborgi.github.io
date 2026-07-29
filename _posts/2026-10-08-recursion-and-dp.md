---
layout: single
title: "Recursion and Dynamic Programming: Two Conditions, One Filled Table"
date: 2026-10-08
categories: [cs-basics]
book: cs-basics
subsection: algorithms
tags: [recursion, dynamic-programming, memoisation, edit-distance]
excerpt: "Dynamic programming is not a trick, it is a diagnosis: if a problem has optimal substructure and overlapping subproblems, exhaustive recursion is doing the same work exponentially often and a table fixes it. Here is the diagnosis, and edit distance worked out cell by cell."
author_profile: true
read_time: true
is_overview: false
icon: "♻️"
read_mins: 7
permalink: /blog/cs-basics/recursion-and-dp/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A recursive call costs a stack frame, so recursion depth is space and Python raises <code>RecursionError</code> at a default depth of 1000. Dynamic programming applies when two conditions hold: <em>optimal substructure</em> (an optimal solution is built from optimal solutions of subproblems) and <em>overlapping subproblems</em> (the same subproblem recurs). Memoisation is the top-down fix, tabulation the bottom-up one; they have the same asymptotics, and tabulation avoids the stack and allows space compression. Edit distance is \(\Theta(mn)\) time and \(\Theta(\min(m,n))\) space.
</div>

## Recursion is a stack you did not declare

Every call pushes a frame holding arguments, locals and the return address. Depth $$d$$ therefore costs $$\Theta(d)$$ memory, and that memory is the [call stack](/blog/cs-basics/memory-and-concurrency/) — a fixed-size region, not the heap.

A correct recursion needs base cases that are *reachable* (every call moves strictly towards one) and *complete* (they cover every way the recursion bottoms out). Miss either and Python raises `RecursionError` at its default limit of 1000 frames; raising that limit with `sys.setrecursionlimit` trades a clean exception for a possible hard crash of the C stack. CPython does no tail-call optimisation, so rewrite deep recursions iteratively.

## Where the exponential comes from

```python
def fib_naive(n):
    return n if n < 2 else fib_naive(n - 1) + fib_naive(n - 2)
```

The recurrence is $$T(n) = T(n-1) + T(n-2) + \Theta(1)$$, so the call count grows like the Fibonacci numbers themselves: $$\Theta(\varphi^{\,n})$$ with $$\varphi = (1+\sqrt5)/2 \approx 1.618$$. The waste is structural — `fib_naive(n-2)` is computed twice, `fib_naive(n-3)` three times — even though there are only $$n$$ distinct subproblems. That gap between *distinct* subproblems and *evaluated* subproblems is exactly what dynamic programming closes.

## Memoisation and tabulation

**Memoisation** keeps the recursion and caches results:

```python
from functools import cache

@cache                       # functools.cache, Python 3.9+; lru_cache(None) before that
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(50))               # 12586269025, from 51 distinct subproblems
```

Each of the $$n+1$$ distinct arguments is evaluated once, so the cost drops to $$\Theta(n)$$ time and $$\Theta(n)$$ space — but the recursion depth is still $$\Theta(n)$$, so `fib(5000)` would blow the stack.

**Tabulation** fills the same table bottom-up in an order where every dependency is already computed:

```python
def fib_table(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a                 # Theta(n) time, Theta(1) space
```

Same asymptotics, no stack, better constants, and — because the loop makes the dependency structure explicit — it is where space optimisation becomes visible: `fib_table` keeps two numbers instead of $$n$$.

| | Memoisation (top-down) | Tabulation (bottom-up) |
|---|---|---|
| Control flow | recursion + cache | loops |
| Computes | only reachable subproblems | all subproblems in the table |
| Stack depth | $$\Theta(\text{depth})$$ | $$\Theta(1)$$ |
| Space compression | hard | easy (keep the last row) |
| Best when | the state space is sparse | the table is dense, or the stack is a risk |

## The two conditions

DP applies exactly when:

1. **Optimal substructure.** An optimal solution contains optimal solutions to subproblems. Shortest paths have it: a prefix of a shortest path is a shortest path. *Longest simple* paths do not, which is why there is no DP for them.
2. **Overlapping subproblems.** The recursion revisits the same subproblem many times. Merge sort has optimal substructure but its subproblems are disjoint, so caching buys nothing — that is divide and conquer, not DP.

Both are needed. Condition 1 makes the recurrence correct; condition 2 makes the table worth building.

## Worked example: edit distance

The Levenshtein distance between strings $$s$$ and $$t$$ is the fewest single-character insertions, deletions and substitutions turning one into the other. Let $$D[i][j]$$ be the distance between the first $$i$$ characters of $$s$$ and the first $$j$$ of $$t$$:

<div class="formula-box">
\[
D[i][j] = \min\begin{cases}
D[i-1][j] + 1 & \text{delete } s_i,\\
D[i][j-1] + 1 & \text{insert } t_j,\\
D[i-1][j-1] + \mathbf{1}[s_i \ne t_j] & \text{match or substitute},
\end{cases}
\]
</div>

with $$D[i][0] = i$$ and $$D[0][j] = j$$ — turning a prefix into the empty string costs one deletion per character. Filled for $$s = $$ `kitten`, $$t = $$ `sitting`:

| | ε | s | i | t | t | i | n | g |
|---|---|---|---|---|---|---|---|---|
| **ε** | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| **k** | 1 | **1** | 2 | 3 | 4 | 5 | 6 | 7 |
| **i** | 2 | 2 | **1** | 2 | 3 | 4 | 5 | 6 |
| **t** | 3 | 3 | 2 | **1** | 2 | 3 | 4 | 5 |
| **t** | 4 | 4 | 3 | 2 | **1** | 2 | 3 | 4 |
| **e** | 5 | 5 | 4 | 3 | 2 | **2** | 3 | 4 |
| **n** | 6 | 6 | 5 | 4 | 3 | 3 | **2** | **3** |

The answer is the bottom-right cell: **3**. Read the bold diagonal backwards and you recover the operations — substitute k→s, keep itt, substitute e→i, keep n, insert g — which is `kitten → sitten → sittin → sitting`.

Each cell is $$O(1)$$ work and there are $$(m+1)(n+1)$$ of them, so the algorithm is $$\Theta(mn)$$ time. Each row depends only on the previous one, so space compresses from $$\Theta(mn)$$ to $$\Theta(\min(m,n))$$:

```python
def edit_distance(s, t):
    """Levenshtein distance. Theta(m*n) time, Theta(min(m,n)) space."""
    if len(s) < len(t):
        s, t = t, s                        # keep the shorter string as the row
    prev = list(range(len(t) + 1))         # row 0: distance from "" to t[:j]
    for i, cs in enumerate(s, start=1):
        cur = [i] + [0] * len(t)
        for j, ct in enumerate(t, start=1):
            cur[j] = min(prev[j] + 1,              # delete cs
                         cur[j - 1] + 1,           # insert ct
                         prev[j - 1] + (cs != ct)) # match / substitute
        prev = cur
    return prev[-1]

print(edit_distance("kitten", "sitting"))   # 3
print(edit_distance("", "abc"))             # 3
print(edit_distance("abc", "abc"))          # 0
```

Note that recovering the *path* needs the full table (or a re-run), so the space compression costs you the reconstruction — a trade the interviewer will often ask about.

## Spotting a DP problem

Four signals, and if three fire, build a table: the question asks for a count, minimum or maximum over exponentially many configurations; those configurations are built by a sequence of local decisions; the brute-force recursion revisits states; and the state is describable by a handful of indices.

Then work in a fixed order: **state** (what does $$D[\cdot]$$ mean — say it in words), **recurrence**, **base cases**, **evaluation order**, **where the answer sits**. Writing the state in English first is what prevents a subtly wrong recurrence, and it is what an interviewer is listening for.

<div class="insight-box">
  <strong>Key Insight — DP is brute force with the repetition removed.</strong> The exponential recursion and the polynomial table compute the same values by the same recurrence; the only difference is that one recomputes and the other remembers. So the complexity of a DP is not something to derive from scratch: it is <em>number of distinct states</em> × <em>cost per state</em>. Edit distance has \(mn\) states at \(O(1)\) each, hence \(\Theta(mn)\). Get the state space right and the complexity falls out.
</div>

<div class="warning-box">
  <strong>Interview trap — the mutable default argument.</strong> Writing <code>def solve(n, memo={})</code> creates that dict <em>once</em>, when the function is defined, and every call shares it — so results leak between independent inputs and the "cache" silently returns answers to another problem.

  <pre><code>def collect(x, acc=[]):   # evaluated once, at definition time
    acc.append(x)
    return acc

collect(1)   # [1]
collect(2)   # [1, 2]  -- not [2]</code></pre>

  Use <code>memo=None</code> and build the dict inside, or decorate with <code>functools.cache</code>. Two more: memoised recursion still carries \(\Theta(\text{depth})\) stack, so deep chains need tabulation; and greedy is not DP — it needs a separate exchange argument, and "it worked on the examples" is not one.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Recursion depth is memory: \(\Theta(d)\) stack frames, with CPython raising <code>RecursionError</code> near depth 1000 and performing no tail-call optimisation.</li>
    <li>Naive Fibonacci is \(\Theta(\varphi^{\,n})\) despite having only \(n\) distinct subproblems — the gap between distinct and evaluated subproblems is what DP removes.</li>
    <li>DP needs both optimal substructure and overlapping subproblems; merge sort has the first without the second, so it is divide and conquer.</li>
    <li>Complexity of a DP = number of states × cost per state. Edit distance: \(\Theta(mn)\) time, \(\Theta(\min(m,n))\) space once rows are rolled, but path reconstruction needs the full table.</li>
    <li>Never use a mutable default argument as a cache; it is created once at definition and shared across all calls.</li>
  </ul>
</div>

## References

1. Bellman, R. *Dynamic Programming*. Princeton University Press, 1957.
2. Wagner, R. A., & Fischer, M. J. The string-to-string correction problem. *Journal of the ACM* 21(1), 168–173, 1974.
3. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. [*Introduction to Algorithms*, 4th ed.](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) MIT Press, 2022 — ch. 14 on dynamic programming.
4. Python Software Foundation. [functools.cache and lru_cache](https://docs.python.org/3/library/functools.html#functools.cache).
5. Python Software Foundation. [sys.setrecursionlimit](https://docs.python.org/3/library/sys.html#sys.setrecursionlimit).
6. Python Software Foundation. [Default argument values](https://docs.python.org/3/tutorial/controlflow.html#default-argument-values) — the tutorial's own warning about mutable defaults.
