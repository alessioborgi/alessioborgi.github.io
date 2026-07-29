---
layout: single
title: "Arrays, Dynamic Arrays and Hash Tables: Where O(1) Comes From and What It Costs"
date: 2026-10-03
categories: [cs-basics]
book: cs-basics
subsection: data-structures
tags: [arrays, hash-tables, amortised, python-internals]
excerpt: "A linked list has O(1) insertion and loses to an array anyway. Appending is O(1) but a single append can copy a million elements. Hash lookup is O(1) until every key lands in one bucket. All three claims are true — with the qualifier that got dropped."
author_profile: true
read_time: true
is_overview: false
icon: "🗂️"
read_mins: 7
permalink: /blog/cs-basics/arrays-and-hashing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Arrays are contiguous, so indexing is one address computation and scanning is prefetcher-friendly; linked lists win only when you already hold the node you want to splice. Dynamic arrays append in amortised \(O(1)\) because geometric growth makes the total copy work \(O(n)\) — worst case for one append is still \(O(n)\). Hash tables give \(O(1)\) expected lookup, \(O(n)\) worst case, and the load factor is the single knob controlling the gap. Python's <code>dict</code> and <code>set</code> are open-addressed tables with randomised string hashing.
</div>

## Contiguity is the whole argument

An array stores $$n$$ elements in one block. Element $$i$$ lives at `base + i * width`, so indexing is arithmetic — $$\Theta(1)$$ worst case, no traversal. A linked list stores each element with a pointer to the next, anywhere in memory.

The textbook comparison says the list wins on insertion. In practice it usually does not, for a reason big-O cannot see: hardware moves memory in cache lines (64 bytes on x86-64), so scanning an array fetches many elements per miss. Chasing pointers pays a fresh, unpredictable miss per node. And the list's celebrated $$\Theta(1)$$ insertion assumes you *already have* the node; finding it costs $$\Theta(n)$$ first.

| Operation | Array | Linked list |
|---|---|---|
| Index $$i$$ | $$\Theta(1)$$ worst | $$\Theta(n)$$ worst |
| Insert/delete at a held position | $$\Theta(n)$$ worst (shift) | $$\Theta(1)$$ worst |
| Insert/delete found by value | $$\Theta(n)$$ | $$\Theta(n)$$ |
| Append at end | $$\Theta(1)$$ amortised | $$\Theta(1)$$ with a tail pointer |
| Memory per element | payload only | payload + pointer(s) |
| Sequential scan | cache-friendly | one miss per node |

Lists still earn their place when you hold interior positions and splice often — an LRU cache pairing a hash table with a doubly linked list is the standard example.

## Why appending is amortised O(1)

A dynamic array keeps spare capacity. When it fills, allocate a bigger block, copy everything, free the old one. That copy is $$\Theta(n)$$, so how is append $$O(1)$$?

Grow by a constant factor. Doubling from capacity 1, resizes happen at sizes $$1, 2, 4, \dots, 2^k \le n$$, and the total number of elements ever copied over $$n$$ appends is

<div class="formula-box">
\[
1 + 2 + 4 + \cdots + 2^{k} \;=\; 2^{k+1} - 1 \;<\; 2n .
\]
</div>

So $$n$$ appends cost less than $$3n$$ elementary operations in total — $$O(n)$$ for the whole sequence, hence $$O(1)$$ **amortised** per append. Any growth factor $$c>1$$ works: the copies sum to $$\tfrac{c}{c-1}n$$. CPython over-allocates by roughly one-eighth, $$c \approx 1.125$$, giving about $$9n$$ copies in total — still linear, and it wastes far less memory than doubling.

Additive growth does not work: growing by a fixed 10 slots gives resizes at $$10, 20, 30, \dots$$ and copies summing to $$\Theta(n^2/10)$$. The geometric factor is load-bearing.

Note what amortised does *not* say: nothing about an individual append, one of which copies the whole array — the [worst-versus-amortised distinction](/blog/cs-basics/complexity-and-big-o/) exactly.

## Hash tables

A hash table stores key–value pairs in $$m$$ slots, placing key $$k$$ at index $$h(k) \bmod m$$ for a hash function $$h$$. If $$h$$ scattered keys perfectly and no two collided, lookup would be one array index. Two keys will collide — with $$n$$ keys in $$m$$ slots and $$n>m$$ it is forced, and long before that the birthday bound makes it near-certain — so the design is entirely about collision handling and about the **load factor** $$\alpha = n/m$$.

**Chaining** puts colliding keys in a per-slot linked list (or small array). Under the simple uniform hashing assumption, an unsuccessful search examines $$1 + \alpha$$ slots on average, so as long as $$\alpha$$ is held below a constant by resizing, lookup is $$\Theta(1)$$ expected. It degrades gracefully and tolerates $$\alpha > 1$$.

**Open addressing** stores everything in the table itself: on collision, probe a deterministic sequence of alternative slots. It needs $$\alpha < 1$$ and is more cache-friendly, since probes stay inside one array. Under uniform hashing the expected number of probes for an unsuccessful search is at most $$1/(1-\alpha)$$:

| Load factor $$\alpha$$ | Expected probes, unsuccessful search |
|---|---|
| $$0.5$$ | $$2$$ |
| $$0.75$$ | $$4$$ |
| $$0.9$$ | $$10$$ |
| $$0.99$$ | $$100$$ |

That table is the whole design argument: cost is flat until $$\alpha$$ approaches 1, then explodes. Implementations therefore resize at a fixed threshold — and deletion cannot simply blank a slot, because that would break probe chains; it writes a tombstone instead.

**Worst case is $$\Theta(n)$$ either way.** If every key hashes to the same slot, lookup is a linear scan. Not hypothetical: it was a real denial-of-service vector against web frameworks, where an attacker sent form fields chosen to collide.

## What Python actually gives you

`dict` and `set` are open-addressed tables. Since 3.6 `dict` keeps a compact array of entries in insertion order with a separate index array — order preservation became a language guarantee in 3.7 — and it resizes when the used entries exceed two-thirds of the allocated slots. Since 3.3, string and bytes hashing is randomised per process with a seed (SipHash, PEP 456), which is why iteration order of a `set` of strings can change between runs and why the collision attack is defused.

Three practical consequences:

```python
xs = list(range(1_000_000))
9_999 in xs                 # Theta(n) scan of a list

seen = set(xs)
9_999 in seen               # Theta(1) expected

# keys must be hashable: hashable roughly means immutable
d = {}
d[(1, 2)] = "ok"            # tuple of hashables: fine
try:
    d[[1, 2]] = "boom"      # list is mutable and unhashable
except TypeError as e:
    print(e)                # unhashable type: 'list'

# the canonical use: turn a nested loop into one pass
def two_sum(nums, target):
    """Indices of the first pair summing to target. Theta(n) expected."""
    seen_at = {}
    for i, x in enumerate(nums):
        if target - x in seen_at:
            return seen_at[target - x], i
        seen_at[x] = i
    return None

print(two_sum([2, 7, 11, 15], 26))   # (2, 3), since 11 + 15 = 26
```

Membership in a `list` is $$\Theta(n)$$ and in a `set` is $$\Theta(1)$$ expected — this single substitution fixes more accidentally quadratic ML data pipelines than any other change.

<div class="insight-box">
  <strong>Key Insight — the load factor buys the constant, and you pay in memory.</strong> A hash table is not fast because hashing is clever; it is fast because it deliberately keeps a third to a half of its slots empty so that probe chains stay short. \(O(1)\) is purchased with wasted space, and the resize that maintains it is exactly what forces the amortised qualifier onto insertion. Space and the constant in \(O(1)\) are the same dial viewed from two ends.
</div>

<div class="warning-box">
  <strong>Interview trap — "hash tables are \(O(1)\)" needs two qualifiers.</strong> It is <em>average</em> (over hash outcomes, not over inputs — a fixed adversarial key set makes it \(\Theta(n)\)) and <em>amortised</em> (a single insert can trigger a full rehash costing \(\Theta(n)\)). Two more that catch people: mutating an object after using it as a key corrupts the table, because its slot was chosen from the old hash; and <code>list.pop(0)</code> or <code>list.insert(0, x)</code> are \(\Theta(n)\), not \(\Theta(1)\) — use a <a href="/blog/cs-basics/stacks-queues-heaps/">deque</a>.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Arrays index in \(\Theta(1)\) and scan cache-efficiently; linked lists only win when you already hold the node to splice.</li>
    <li>Geometric growth makes append amortised \(O(1)\): doubling copies fewer than \(2n\) elements over \(n\) appends, while additive growth would be \(\Theta(n^2)\).</li>
    <li>Chaining costs \(1+\alpha\) expected probes and tolerates \(\alpha>1\); open addressing costs about \(1/(1-\alpha)\) and needs \(\alpha<1\) plus tombstones on delete.</li>
    <li>Hash-table worst case is \(\Theta(n)\) when all keys collide — a real attack surface, which is why CPython randomises string hashes.</li>
    <li>Python: <code>dict</code> preserves insertion order (guaranteed since 3.7), resizes past two-thirds full, and requires hashable — effectively immutable — keys.</li>
  </ul>
</div>

## References

1. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. [*Introduction to Algorithms*, 4th ed.](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) MIT Press, 2022 — ch. 11 for hashing, ch. 16 for amortised analysis.
2. Knuth, D. E. *The Art of Computer Programming, Vol. 3: Sorting and Searching*, 2nd ed., §6.4. Addison-Wesley, 1998.
3. CPython source. [Objects/listobject.c](https://github.com/python/cpython/blob/main/Objects/listobject.c) (over-allocation in `list_resize`) and [Objects/dictobject.c](https://github.com/python/cpython/blob/main/Objects/dictobject.c).
4. Python Software Foundation. [PEP 456 — Secure and Interchangeable Hash Algorithm](https://peps.python.org/pep-0456/).
5. Python Software Foundation. [TimeComplexity — Python Wiki](https://wiki.python.org/moin/TimeComplexity).
6. Aumasson, J.-P., & Bernstein, D. J. [SipHash: A Fast Short-Input PRF](https://doi.org/10.1007/978-3-642-34931-7_28). *INDOCRYPT 2012*.
