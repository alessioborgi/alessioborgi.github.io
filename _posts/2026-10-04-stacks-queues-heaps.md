---
layout: single
title: "Stacks, Queues and Heaps: Three Restrictions That Buy You Speed"
date: 2026-10-04
categories: [cs-basics]
book: cs-basics
subsection: data-structures
tags: [stacks, queues, heaps, priority-queue]
excerpt: "A heap is a tree with no pointers — just an array and two index formulas — and building one from n items takes O(n), not O(n log n). The sum that proves it is the most quotable derivation in this book."
author_profile: true
read_time: true
is_overview: false
icon: "🥞"
read_mins: 6
permalink: /blog/cs-basics/stacks-queues-heaps/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A stack is LIFO, a queue is FIFO, and swapping one for the other turns depth-first search into breadth-first search — that is the entire difference between the two traversals. A binary heap is a complete binary tree flattened into an array, where the children of \(i\) live at \(2i+1\) and \(2i+2\), giving \(O(\log n)\) worst-case push and pop and \(O(1)\) access to the minimum. Heapifying \(n\) items in place is \(\Theta(n)\), not \(\Theta(n\log n)\), because almost all nodes sit near the bottom and barely move.
</div>

## Stacks: last in, first out

Push and pop at one end only. Both are $$\Theta(1)$$ amortised on a dynamic array, since they touch the end where [appending is cheap](/blog/cs-basics/arrays-and-hashing/).

The restriction is the point: LIFO is exactly the order in which nested things must be undone. Function calls unwind in reverse, which is why the *call stack* is a stack; matching brackets, undo history, and the iterative form of DFS are all the same shape.

```python
def is_balanced(s):
    """Theta(n) time, Theta(n) worst-case space."""
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

print(is_balanced("a[b(c)d]{e}"))   # True
print(is_balanced("([)]"))          # False
```

In Python, use a plain `list`: `append` and `pop()` are the stack operations.

## Queues: first in, first out

Enqueue at the back, dequeue at the front. FIFO processes things in arrival order, which is what you want for level-by-level exploration — [BFS](/blog/cs-basics/graphs-and-traversal/) visits vertices in non-decreasing distance from the source precisely because its frontier is a queue — and for producer/consumer pipelines such as a data loader's task queue.

Do not use a `list` as a queue. `pop(0)` shifts every remaining element and is $$\Theta(n)$$, turning an $$O(V+E)$$ BFS into $$O(V^2)$$. Use `collections.deque`, a double-ended queue implemented as a doubly linked list of fixed-size blocks: `append`, `appendleft`, `pop` and `popleft` are all $$\Theta(1)$$ worst case, at the price of $$\Theta(n)$$ indexing in the middle.

A deque subsumes both structures — and gives you sliding-window maxima, monotonic queues, and ring buffers via `deque(maxlen=k)`.

## Heaps: a tree with no pointers

A **binary heap** is a complete binary tree — every level full except possibly the last, which fills left to right — satisfying the heap property: every node is $$\le$$ both of its children (min-heap). Completeness means it can be stored in an array with no pointers at all:

<div class="formula-box">
\[
\text{left}(i) = 2i+1, \qquad \text{right}(i) = 2i+2, \qquad \text{parent}(i) = \left\lfloor \tfrac{i-1}{2} \right\rfloor .
\]
</div>

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="hp-title hp-desc" viewBox="0 0 640 350" style="max-width:640px;width:100%;height:auto">
  <title id="hp-title">A six-element min-heap shown as a tree and as the array that stores it</title>
  <desc id="hp-desc">A complete binary tree with root value 1 at index 0; its children are 3 at index 1 and 6 at index 2; the children of 3 are 5 at index 3 and 9 at index 4; the single child of 6 is 8 at index 5. Below, the same heap as a flat array reading 1, 3, 6, 5, 9, 8 in index order 0 to 5. Indices 3, 4 and 5 form the bottom row and are highlighted as leaves, which is half of the six nodes.</desc>
  <rect x="1" y="1" width="638" height="348" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="320" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">the same min-heap, twice: as a tree and as the array that is actually stored</text>

  <g stroke="#475569" stroke-width="1.6">
    <line x1="320" y1="68" x2="205" y2="122"/>
    <line x1="320" y1="68" x2="435" y2="122"/>
    <line x1="200" y1="148" x2="145" y2="192"/>
    <line x1="200" y1="148" x2="255" y2="192"/>
    <line x1="440" y1="148" x2="385" y2="192"/>
  </g>

  <g fill="#ffffff" stroke="#0e7490" stroke-width="2">
    <circle cx="320" cy="50" r="18"/>
    <circle cx="200" cy="135" r="18"/>
    <circle cx="440" cy="135" r="18"/>
  </g>
  <g fill="#ffffff" stroke="#c2410c" stroke-width="2">
    <circle cx="140" cy="210" r="18"/>
    <circle cx="260" cy="210" r="18"/>
    <circle cx="380" cy="210" r="18"/>
  </g>
  <g font-size="13" font-weight="700" fill="#334155" text-anchor="middle">
    <text x="320" y="55">1</text><text x="200" y="140">3</text><text x="440" y="140">6</text>
    <text x="140" y="215">5</text><text x="260" y="215">9</text><text x="380" y="215">8</text>
  </g>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="349" y="42">i=0</text><text x="171" y="127">i=1</text><text x="469" y="127">i=2</text>
    <text x="140" y="243">i=3</text><text x="260" y="243">i=4</text><text x="380" y="243">i=5</text>
  </g>
  <text x="545" y="212" text-anchor="middle" font-size="9.5" fill="#c2410c">leaves: height 0,</text>
  <text x="545" y="226" text-anchor="middle" font-size="9.5" fill="#c2410c">no work to sift</text>

  <g stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3">
    <line x1="320" y1="68" x2="182" y2="272"/>
    <line x1="140" y1="228" x2="347" y2="272"/>
  </g>

  <g fill="#ffffff" stroke="#334155" stroke-width="1.5">
    <rect x="155" y="275" width="55" height="32"/><rect x="210" y="275" width="55" height="32"/>
    <rect x="265" y="275" width="55" height="32"/><rect x="320" y="275" width="55" height="32"/>
    <rect x="375" y="275" width="55" height="32"/><rect x="430" y="275" width="55" height="32"/>
  </g>
  <g font-size="13" font-weight="700" fill="#334155" text-anchor="middle">
    <text x="182" y="296">1</text><text x="237" y="296">3</text><text x="292" y="296">6</text>
    <text x="347" y="296">5</text><text x="402" y="296">9</text><text x="457" y="296">8</text>
  </g>
  <g font-size="9.5" fill="#475569" text-anchor="middle">
    <text x="182" y="322">0</text><text x="237" y="322">1</text><text x="292" y="322">2</text>
    <text x="347" y="322">3</text><text x="402" y="322">4</text><text x="457" y="322">5</text>
  </g>
  <text x="320" y="340" text-anchor="middle" font-size="9.5" fill="#0c4a6e">children of index i are at 2i+1 and 2i+2 — no pointers stored</text>
</svg>
<figcaption>Notice that the tree edges are not stored anywhere: they are recomputed by arithmetic. Notice also that three of the six nodes are leaves — in general about half — and a leaf costs nothing to sift down, which is the whole reason build-heap is linear.</figcaption>
</figure>
</div>

**Push** appends at the end and *sifts up*: swap with the parent while it is smaller. **Pop-min** returns index 0, moves the last element to the root and *sifts down*: swap with the smaller child while it is larger. Both walk one root-to-leaf path, so both are $$\Theta(\log n)$$ worst case. Reading the minimum is $$\Theta(1)$$.

## Why build-heap is Θ(n)

Heapifying an arbitrary array by pushing $$n$$ items one at a time costs $$O(n \log n)$$. Doing it bottom-up — sift down every node from the last internal node backwards — costs only $$\Theta(n)$$.

The argument is a counting one. In a heap of $$n$$ nodes there are at most $$\lceil n/2^{h+1}\rceil$$ nodes of height $$h$$, and sifting a node of height $$h$$ costs $$O(h)$$. So the total is

<div class="formula-box">
\[
\sum_{h=0}^{\lfloor \log_2 n\rfloor} \left\lceil \frac{n}{2^{h+1}} \right\rceil O(h)
\;=\; O\!\left(n \sum_{h=0}^{\infty} \frac{h}{2^{h}}\right)
\;=\; O(2n) \;=\; O(n),
\]
</div>

using $$\sum_{h\ge0} h/2^h = 2$$. The intuition the sum formalises: half the nodes are leaves and move zero steps, a quarter move at most one, an eighth at most two. The expensive nodes are the rare ones. Only the root can travel the full $$\log_2 n$$.

## Priority queues

A priority queue serves the smallest key next, and a heap is its standard implementation: $$\Theta(\log n)$$ insert and extract-min worst case, $$\Theta(1)$$ peek. This is what [Dijkstra](/blog/cs-basics/graphs-and-traversal/) runs on, what schedulers use, and how you keep the top $$k$$ of a stream in $$\Theta(n \log k)$$ time and $$\Theta(k)$$ space.

```python
import heapq

def top_k(stream, k):
    """k largest items, Theta(n log k) time, Theta(k) space."""
    heap = []                      # a MIN-heap of the k largest so far
    for x in stream:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:          # heap[0] is the smallest kept item
            heapq.heapreplace(heap, x)   # pop the smallest, push x
    return sorted(heap, reverse=True)

print(top_k([5, 1, 9, 3, 7, 2], 3))   # [9, 7, 5]

data = [5, 1, 9, 3, 7, 2]
heapq.heapify(data)                    # Theta(n), in place
print(data[0])                         # 1  -- the minimum
print(data)                            # a valid heap, NOT a sorted list
```

`heapq` gives a **min-heap** only; for a max-heap, push negated keys. It has no decrease-key, so the usual pattern is to push a new entry and skip stale ones when popped ("lazy deletion").

<div class="insight-box">
  <strong>Key Insight — the restriction is what makes it fast.</strong> A sorted array also gives \(O(1)\) access to the minimum, but pays \(\Theta(n)\) per insertion to stay sorted. A heap maintains a far weaker invariant — each node beats its own children, and nothing is claimed about siblings or cousins — and that weakness is exactly what lets a repair touch only one root-to-leaf path. Partial order costs \(\log n\) to maintain; total order costs \(n\).
</div>

<div class="warning-box">
  <strong>Interview trap — a heap is not sorted.</strong> <code>heap[0]</code> is the minimum, but <code>heap[1]</code> and <code>heap[2]</code> are in no particular order relative to the rest, and the array is not ascending. Finding the <em>maximum</em> of a min-heap is \(\Theta(n)\); getting sorted output costs \(n\) pops at \(\Theta(\log n)\) each. Two more: <code>heapq</code> functions assume the list is already a valid heap, so <code>heapify</code> first or the results are silently wrong; and <code>list.pop(0)</code> as a dequeue is \(\Theta(n)\), which quietly makes BFS quadratic.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Stack = LIFO, queue = FIFO; swapping the frontier structure is the only difference between DFS and BFS.</li>
    <li>Use <code>list</code> for a stack and <code>collections.deque</code> for a queue: <code>popleft</code> is \(\Theta(1)\) while <code>list.pop(0)</code> is \(\Theta(n)\).</li>
    <li>A binary heap is a complete tree in an array: children of \(i\) at \(2i+1\), \(2i+2\); push and pop are \(\Theta(\log n)\) worst case, peek-min \(\Theta(1)\).</li>
    <li>Bottom-up build-heap is \(\Theta(n)\) because at most \(\lceil n/2^{h+1}\rceil\) nodes have height \(h\) and \(\sum_h h/2^h = 2\).</li>
    <li><code>heapq</code> is a min-heap with no decrease-key: negate for max-heaps, use lazy deletion for priority updates, and keep the top \(k\) of a stream in \(\Theta(n\log k)\).</li>
  </ul>
</div>

## References

1. Williams, J. W. J. Algorithm 232: Heapsort. *Communications of the ACM* 7(6), 347–348, 1964.
2. Floyd, R. W. Algorithm 245: Treesort 3. *Communications of the ACM* 7(12), 701, 1964 — the linear bottom-up construction.
3. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. [*Introduction to Algorithms*, 4th ed.](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) MIT Press, 2022 — ch. 6.
4. Python Software Foundation. [heapq — Heap queue algorithm](https://docs.python.org/3/library/heapq.html) and [collections.deque](https://docs.python.org/3/library/collections.html#collections.deque).
5. CPython source. [Modules/_collectionsmodule.c](https://github.com/python/cpython/blob/main/Modules/_collectionsmodule.c) — the block-linked-list deque.
