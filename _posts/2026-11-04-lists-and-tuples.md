---
layout: single
title: "Lists and Tuples: Slicing, Mutation, and the Cost of Every Method"
date: 2026-11-04
categories: [python-primer]
book: python-primer
subsection: data-structures
tags: [python, lists, tuples, slicing, complexity]
excerpt: "A Python list is a growable array of pointers, and that one implementation fact predicts every complexity in its API: appending is cheap, inserting at the front is not, and `in` costs a full scan."
author_profile: true
read_time: true
is_overview: false
icon: "📋"
read_mins: 9
permalink: /blog/python-primer/lists-and-tuples/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A list is a dynamic array of references — index and <code>append</code> are \(O(1)\), <code>insert(0, x)</code> and <code>remove</code> are \(O(n)\), and membership is a linear scan. Slicing always builds a new list, which makes <code>xs[:]</code> the shallow-copy idiom and <code>xs[::-1]</code> the reverse idiom. <code>sort()</code> mutates and returns <code>None</code>; <code>sorted()</code> returns a new list and accepts any iterable. Tuples are the immutable sibling, which is exactly why they can be dictionary keys.
</div>

## What a list actually is

CPython implements `list` as a contiguous array of pointers to objects, plus a length and a capacity. Elements are not stored inline, so a list can hold objects of different types and any element can be any size. When the array fills up, CPython allocates a larger one — with geometric over-allocation, so `append` is $$O(1)$$ *amortised*, not $$O(1)$$ in the worst case.

Everything else follows. Indexing is pointer arithmetic, so it is constant time. Inserting or deleting at position `i` must shift the $$n - i$$ pointers after it, so it is $$O(n - i)$$ — free at the end, expensive at the front. Searching has no index to exploit, so `x in xs` is $$O(n)$$.

## Indexing and slicing

Indices start at 0. Negative indices count back from the end, with `-1` the last element.

```python
xs = ["a", "b", "c", "d", "e"]
print(xs[0], xs[-1], xs[-2])   # -> a e d
```

A slice `xs[start:stop:step]` returns a **new list** containing `start` up to but not including `stop`. Every part is optional.

```python
print(xs[1:4])    # -> ['b', 'c', 'd']
print(xs[:3])     # -> ['a', 'b', 'c']
print(xs[3:])     # -> ['d', 'e']
print(xs[::2])    # -> ['a', 'c', 'e']
print(xs[::-1])   # -> ['e', 'd', 'c', 'b', 'a']
print(xs[1:5:2])  # -> ['b', 'd']
```

Two idioms worth memorising: `xs[:]` is a shallow copy, and `xs[::-1]` is a reversed copy. Both are $$O(n)$$ in time and space.

Slices never raise `IndexError` — out-of-range bounds are clamped, so `xs[10:20]` gives `[]` while `xs[10]` raises. That leniency is convenient and occasionally hides a bug.

Slices are also assignable, which lets you splice in place:

```python
ys = [1, 2, 3, 4, 5]
ys[1:3] = ["x", "y", "z"]     # replacement need not be the same length
print(ys)                     # -> [1, 'x', 'y', 'z', 4, 5]
del ys[0:2]
print(ys)                     # -> ['y', 'z', 4, 5]
```

## Every method, and what it costs

| Method | Effect | Mutates? | Complexity |
|---|---|---|---|
| `xs.append(v)` | add `v` at the end | yes | $$O(1)$$ amortised |
| `xs.extend(it)` | append every item of an iterable | yes | $$O(k)$$ for $$k$$ new items |
| `xs.insert(i, v)` | insert `v` before index `i` | yes | $$O(n)$$ |
| `xs.remove(v)` | delete the **first** `v`; `ValueError` if absent | yes | $$O(n)$$ |
| `xs.pop()` | remove and return the last item | yes | $$O(1)$$ |
| `xs.pop(i)` | remove and return item `i` | yes | $$O(n - i)$$ |
| `xs.clear()` | empty the list | yes | $$O(n)$$ |
| `xs.sort()` | sort in place, returns `None` | yes | $$O(n \log n)$$ |
| `xs.reverse()` | reverse in place, returns `None` | yes | $$O(n)$$ |
| `xs.index(v)` | position of the first `v`; `ValueError` if absent | no | $$O(n)$$ |
| `xs.count(v)` | how many equal `v` | no | $$O(n)$$ |
| `xs.copy()` | shallow copy, same as `xs[:]` | no | $$O(n)$$ |
| `v in xs` | membership test | no | $$O(n)$$ |
| `len(xs)` | length | no | $$O(1)$$ |

In one runnable sequence:

```python
ys = [3, 1, 2]
ys.append(4)          # [3, 1, 2, 4]
ys.extend([5, 6])     # [3, 1, 2, 4, 5, 6]
ys.insert(1, 99)      # [3, 99, 1, 2, 4, 5, 6]
ys.remove(99)         # [3, 1, 2, 4, 5, 6]
print(ys.pop())       # -> 6      ys is now [3, 1, 2, 4, 5]
print(ys.pop(0))      # -> 3      ys is now [1, 2, 4, 5]
ys.reverse()          # [5, 4, 2, 1]
ys.sort()             # [1, 2, 4, 5]
print(ys.index(4), ys.count(2))   # -> 2 1
ys.clear()
print(ys)             # -> []
```

Note the asymmetry between `append`/`extend`: `xs.append([1, 2])` adds one element that happens to be a list, while `xs.extend([1, 2])` adds two. And if you find yourself calling `insert(0, v)` or `pop(0)` in a loop, you want `collections.deque`, which does both ends in $$O(1)$$.

<div class="warning-box">
  <strong>The classic trap — <code>[[0] * 3] * 3</code> does not build a grid.</strong> The outer <code>* 3</code> repeats the <em>reference</em>, so all three rows are the same list object:
  <pre><code>grid = [[0] * 3] * 3
grid[0][0] = 1
print(grid)   # -> [[1, 0, 0], [1, 0, 0], [1, 0, 0]]</code></pre>
  Build the rows separately with a comprehension, which evaluates <code>[0] * 3</code> afresh each time:
  <pre><code>grid = [[0] * 3 for _ in range(3)]
grid[0][0] = 1
print(grid)   # -> [[1, 0, 0], [0, 0, 0], [0, 0, 0]]</code></pre>
  The same aliasing bites <code>copy.copy</code> and <code>xs[:]</code> on nested lists; only <code>copy.deepcopy</code> duplicates the inner objects.
</div>

## `sort` against `sorted`, and the `key` argument

`xs.sort()` sorts the list in place and returns `None`. `sorted(iterable)` leaves its input alone, accepts *any* iterable, and returns a new list. Both use Timsort, which is $$O(n \log n)$$ worst case and close to $$O(n)$$ on data that is already partially ordered.

```python
words = ["banana", "kiwi", "apple", "fig"]
print(sorted(words))                     # -> ['apple', 'banana', 'fig', 'kiwi']
print(words.sort())                      # -> None      <- the trap
print(words)                             # -> ['apple', 'banana', 'fig', 'kiwi']
```

`x = xs.sort()` is one of the most common beginner bugs; it silently binds `None`.

`key` takes a function applied to each element, whose result is compared instead of the element. It is called exactly once per element, so it is cheap even when the function is not.

```python
words = ["banana", "kiwi", "apple", "fig"]
print(sorted(words, key=len))                 # -> ['fig', 'kiwi', 'apple', 'banana']
print(sorted(words, key=len, reverse=True))   # -> ['banana', 'apple', 'kiwi', 'fig']
```

Return a tuple from `key` to sort by several fields at once. Timsort is **stable** — equal keys keep their original relative order — so descending by score then ascending by name is one call:

```python
pairs = [("bob", 3), ("ann", 5), ("cid", 3)]
print(sorted(pairs, key=lambda p: (-p[1], p[0])))
# -> [('ann', 5), ('bob', 3), ('cid', 3)]
```

The `-p[1]` trick only works for numbers; for a descending string field, sort twice and let stability do the work, or use `functools.cmp_to_key`.

## Tuples

A tuple is an immutable sequence. It supports indexing, slicing, `in`, `len`, `count` and `index` — everything a list does except the mutating half of the API.

```python
t = (1, 2, 3)
t[0] = 9
# TypeError: 'tuple' object does not support item assignment
```

The commas make the tuple, not the parentheses, which produces the notorious one-element case:

```python
print(type(("x",)).__name__)   # -> tuple
print(type(("x")).__name__)    # -> str    just a parenthesised string
```

A trailing comma is required for a singleton. The empty tuple is `()`.

**Unpacking** works on any iterable and is the reason tuples appear everywhere:

```python
a, b, c = (1, 2, 3)
print(a, b, c)        # -> 1 2 3

a, b = b, a           # swap, no temporary needed
```

Starred unpacking ([PEP 3132](https://peps.python.org/pep-3132/)) absorbs a variable number of items into a list. Exactly one star is allowed:

```python
first, *rest = [1, 2, 3, 4]
print(first, rest)      # -> 1 [2, 3, 4]

*init, last = [1, 2, 3, 4]
print(init, last)       # -> [1, 2, 3] 4

a, *mid, z = [1, 2, 3, 4, 5]
print(a, mid, z)        # -> 1 [2, 3, 4] 5
```

## When the immutability matters

Tuples are hashable when their contents are, so they can be dictionary keys and set members — a list cannot:

```python
d = {(0, 0): "origin"}
print(d[(0, 0)])      # -> origin

{[0, 0]: "x"}
# TypeError: unhashable type: 'list'
```

That is the main practical reason to reach for a tuple: coordinates, `(row, col)` cells, `(year, month)` buckets, memoisation keys. Multiple return values are also tuples — `return x, y` builds one, and the caller unpacks it. Beyond that, a tuple documents that a collection is a fixed record of heterogeneous fields rather than a homogeneous sequence you will iterate over. When the fields deserve names, `collections.namedtuple` or `typing.NamedTuple` gives you a tuple with attribute access at no extra memory cost.

<div class="insight-box">
  <strong>Key Insight — immutable does not mean unchangeable all the way down:</strong> a tuple freezes its <em>references</em>, not the objects they point at. So <code>t = ([1, 2], 3)</code> allows <code>t[0].append(9)</code>, giving <code>([1, 2, 9], 3)</code>, and <code>hash(t)</code> still fails with <code>TypeError: unhashable type: 'list'</code>. Hashability is recursive, immutability of the container is not — which is precisely why a tuple containing a list cannot be a dictionary key.
</div>

Next up: [dicts and sets](/blog/python-primer/dicts-and-sets/), where hashing buys back the $$O(1)$$ membership test that lists cannot offer.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>A list is a dynamic array of references: index and <code>append</code> are \(O(1)\); <code>insert(0, v)</code>, <code>pop(0)</code>, <code>remove</code> and <code>in</code> are \(O(n)\). Use <code>collections.deque</code> for a queue.</li>
    <li>Slicing copies; <code>xs[:]</code> is the shallow-copy idiom, <code>xs[::-1]</code> the reverse. Out-of-range slice bounds clamp instead of raising.</li>
    <li><code>xs.sort()</code> mutates and returns <code>None</code>; <code>sorted(it)</code> returns a new list. Both are stable Timsort, and <code>key</code> is called once per element.</li>
    <li><code>[[0] * 3] * 3</code> aliases one row three times — use a comprehension.</li>
    <li>Commas make tuples; a one-element tuple needs the trailing comma. Starred unpacking takes at most one star.</li>
    <li>Tuples are hashable only if every element is, which is what qualifies them as dict keys.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [Data Structures: more on lists](https://docs.python.org/3/tutorial/datastructures.html).
2. Python Software Foundation. [Sequence Types — list, tuple, range](https://docs.python.org/3/library/stdtypes.html#sequence-types-list-tuple-range).
3. Python Software Foundation. [Sorting Techniques (the HOWTO)](https://docs.python.org/3/howto/sorting.html).
4. Python Wiki. [TimeComplexity — costs of the built-in container operations](https://wiki.python.org/moin/TimeComplexity).
5. Hettinger, R. [PEP 3132 — Extended Iterable Unpacking](https://peps.python.org/pep-3132/).
6. Peters, T. [listsort.txt — the design notes for Timsort](https://github.com/python/cpython/blob/main/Objects/listsort.txt).
