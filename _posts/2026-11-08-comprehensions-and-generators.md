---
layout: single
title: "Comprehensions and Generators: Building Sequences Without Building Them"
date: 2026-11-08
categories: [python-primer]
book: python-primer
subsection: functions
tags: [python, comprehensions, generators, iterators, itertools]
excerpt: "A comprehension builds the whole result before you touch any of it. Change one pair of brackets to parentheses and nothing is built at all until you ask — the difference, on a million elements, is 40 MB against 432 bytes."
author_profile: true
read_time: true
is_overview: false
icon: "🌀"
read_mins: 10
permalink: /blog/python-primer/comprehensions-and-generators/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A comprehension is a compact <code>for</code> loop that produces a list, dict or set — filtering with a trailing <code>if</code>, choosing values with a leading conditional expression. Swapping the brackets for parentheses gives a <em>generator expression</em>, which computes nothing until iterated and holds only one item at a time. A function containing <code>yield</code> becomes a generator function: calling it returns a paused generator rather than running the body. Both implement the iterator protocol, <code>__iter__</code> plus <code>__next__</code>, which is what <code>for</code> actually talks to.
</div>

## The comprehension forms

```python
print([x * x for x in range(6)])                      # -> [0, 1, 4, 9, 16, 25]
print([x * x for x in range(10) if x % 2 == 0])       # -> [0, 4, 16, 36, 64]
```

The trailing `if` filters. To choose *between* values rather than drop them, use a conditional expression at the front — a different construct in a different position:

```python
print([x if x % 2 else -x for x in range(5)])   # -> [0, 1, -2, 3, -4]
```

Dict and set comprehensions use braces, distinguished by the presence of a colon:

```python
print({x: x * x for x in range(4)})                  # -> {0: 0, 1: 1, 2: 4, 3: 9}
print(sorted({c for c in "mississippi"}))            # -> ['i', 'm', 'p', 's']
print({v: k for k, v in {"a": 1, "b": 2}.items()})   # -> {1: 'a', 2: 'b'}
```

Nesting has two distinct shapes and they are easy to confuse. Multiple `for` clauses read left to right like nested loops and produce a **flat** result; a comprehension *inside* a comprehension produces a nested one:

```python
print([(r, c) for r in range(2) for c in range(3)])
# -> [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]

print([[r * c for c in range(3)] for r in range(2)])
# -> [[0, 0, 0], [0, 1, 2]]
```

Flattening is the most useful case of the first shape:

```python
print([y for row in [[1, 2], [3, 4]] for y in row])   # -> [1, 2, 3, 4]
```

Comprehensions have their own scope, so the loop variable does not leak into the enclosing function — one of the changes Python 3 made over Python 2.

**When they hurt.** A comprehension earns its place when it maps and filters. It stops earning it when the expression needs a comment, when there are three or more `for` clauses, when the body has side effects (a comprehension executed only for its side effects is a loop written badly), or when you find yourself using the walrus operator to smuggle in a temporary. The test is whether a reader can state what the result contains after one pass. If not, write the loop.

## Generator expressions

Replace the brackets with parentheses and you get a lazy object. Nothing runs until something asks for an item:

```python
g = (x * x for x in range(5))
print(g)                    # -> <generator object <genexpr> at 0x...>
print(next(g), next(g))     # -> 0 1
print(list(g))              # -> [4, 9, 16]     the first two are already consumed
```

A generator is **single-pass**: once exhausted it is finished, and iterating it again yields nothing. That is the price of not storing the results.

When a generator expression is the only argument to a function, the parentheses can be omitted:

```python
print(sum(x * x for x in range(5)))              # -> 30
print(any(x > 3 for x in range(5)))              # -> True
print(next((l for l in ["a", "", "b"] if l), None))   # -> a
```

The last line is a useful idiom: find the first match, or `None`, without scanning the rest.

## The memory difference, measured

One million elements, allocation tracked with `tracemalloc` on CPython 3.13:

```python
import tracemalloc

tracemalloc.start()
base = tracemalloc.get_traced_memory()[0]
lst = [x * 2 for x in range(1_000_000)]
print(tracemalloc.get_traced_memory()[0] - base)   # -> about 40_400_000
```

| Expression | Allocated | Why |
|---|---|---|
| `[x * 2 for x in range(1_000_000)]` | 40.4 MB | 8.4 MB of pointers, plus a million separate `int` objects |
| `(x * 2 for x in range(1_000_000))` | 432 bytes | one generator object holding a paused frame |

Roughly a factor of $$10^5$$, and it is a factor of $$n$$ in general: the list is $$O(n)$$ in memory, the generator $$O(1)$$. Total *work* is identical if you consume everything — laziness saves memory, not instructions, and it saves time only when you stop early.

So: use a list when you need indexing, `len`, or more than one pass. Use a generator for a single streaming pass, for data too large to hold, or for a sequence with no end.

## `yield` and generator functions

Any `def` whose body contains `yield` becomes a generator function. Calling it does **not** run the body; it returns a generator. Each `next()` runs to the following `yield`, hands back that value, and freezes the frame — locals, instruction pointer and all — until the next request.

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1
    return "done"

print(list(countdown(3)))   # -> [3, 2, 1]

c = countdown(3)
print(next(c), next(c), next(c))   # -> 3 2 1
next(c)
# StopIteration: 'done'
```

`return` inside a generator does not produce a value to the caller; it stops iteration, and its argument is attached to the `StopIteration` exception (`e.value`), which is mostly of interest when delegating with `yield from`.

Because state is preserved rather than accumulated, a generator can be infinite:

```python
import itertools

def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(itertools.islice(fib(), 10)))
# -> [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

`yield from iterable` delegates to another iterable, forwarding each of its items — the clean way to compose generators or recurse over a tree:

```python
def gen():
    yield from [1, 2]
    yield 3

print(list(gen()))   # -> [1, 2, 3]
```

## The iterator protocol

`for` is sugar over two calls. An **iterable** implements `__iter__`, which returns an **iterator**; an iterator implements `__next__`, returning the next item or raising `StopIteration`. An iterator must also implement `__iter__` returning itself, so that it can be used in a `for` loop directly.

```python
class Countdown:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

print(list(Countdown(3)))   # -> [3, 2, 1]
```

The distinction is exactly why a list can be looped over repeatedly and a generator cannot: `iter(xs)` on a list returns a *fresh* iterator every time, whereas a generator is its own iterator and hands back itself.

```python
xs = [1, 2, 3]
print(iter(xs) is iter(xs))   # -> False   two independent cursors
i1 = iter(xs)
print(iter(i1) is i1)         # -> True    an iterator returns itself
```

Generator functions are simply a far shorter way to write that class: the `yield` statement generates the `__next__` machinery, the paused frame *is* the state, and falling off the end raises `StopIteration` for you.

## `itertools` highlights

Every one of these returns a lazy iterator, so they compose without materialising intermediates.

| Function | Result |
|---|---|
| `chain(a, b)` | `[1, 2, 3]` from `[1, 2]` and `[3]` — concatenate iterables |
| `islice(it, n)` | first `n` items; the only safe way to truncate an infinite generator |
| `count(10, 5)` | `10, 15, 20, ...` unbounded arithmetic sequence |
| `cycle(it)` | repeat an iterable forever |
| `product([1, 2], "ab")` | `[(1,'a'), (1,'b'), (2,'a'), (2,'b')]` — the nested loop |
| `combinations([1,2,3], 2)` | `[(1,2), (1,3), (2,3)]` |
| `permutations([1,2,3], 2)` | `[(1,2), (1,3), (2,1), (2,3), (3,1), (3,2)]` |
| `accumulate([1,2,3,4])` | `[1, 3, 6, 10]` — running totals |
| `groupby("aaabbc")` | `[('a', [...]), ('b', [...]), ('c', [...])]` |
| `zip_longest([1,2,3], "ab", fillvalue="-")` | `[(1,'a'), (2,'b'), (3,'-')]` |
| `pairwise([1,2,3,4])` | `[(1,2), (2,3), (3,4)]` — 3.10+ |

<div class="insight-box">
  <strong>Key Insight — <code>groupby</code> only groups <em>adjacent</em> equal keys:</strong> it is a run-length encoder, not SQL's <code>GROUP BY</code>. On unsorted input it silently produces one group per run, so <code>groupby("aba")</code> yields three groups rather than two. Sort by the same key first, or use a <a href="/blog/python-primer/dicts-and-sets/"><code>defaultdict(list)</code></a>, which is \(O(n)\) rather than \(O(n \log n)\) and does not care about order. The second hazard is that each group is a lazy view into the same underlying iterator: advance to the next group and the previous one is empty, so materialise with <code>list(g)</code> before moving on.
</div>

<div class="warning-box">
  <strong>The classic trap — a generator is consumed exactly once.</strong> The bug looks like this:
  <pre><code>results = (x * 2 for x in range(5))
print(sum(results))    # -> 20
print(max(results))    # ValueError: max() iterable argument is empty</code></pre>
  The first call exhausted it; the second sees nothing. Symptoms include a second loop that never executes, <code>len()</code> raising <code>TypeError</code> because generators have no length, and a function that quietly returns an empty result the second time it is called. If you need the data more than once, materialise it with <code>list(...)</code> — and if you cannot afford to, you needed two generators.
</div>

That closes the first half of this book. Return to the [overview](/blog/python-primer/overview/) for the map of what comes next.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Comprehensions filter with a trailing <code>if</code> and select with a leading conditional expression; multiple <code>for</code> clauses flatten, nested brackets do not.</li>
    <li>Parentheses give a generator expression: lazy, single-pass, \(O(1)\) memory — 432 bytes against 40.4 MB for a million elements.</li>
    <li>A <code>def</code> containing <code>yield</code> returns a paused generator; each <code>next()</code> resumes to the next <code>yield</code>, and <code>return</code> ends iteration.</li>
    <li>The protocol is <code>__iter__</code> returning an iterator plus <code>__next__</code> raising <code>StopIteration</code>; an iterator's <code>__iter__</code> returns itself, which is why generators cannot be replayed.</li>
    <li><code>itertools</code> composes lazily; <code>islice</code> is how you truncate an infinite generator, and <code>groupby</code> only groups adjacent runs.</li>
    <li>Laziness buys memory and early exit, never fewer instructions on a full pass.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [List Comprehensions](https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions).
2. Python Software Foundation. [Functional Programming HOWTO — iterators and generators](https://docs.python.org/3/howto/functional.html).
3. Python Software Foundation. [`itertools` — functions creating iterators for efficient looping](https://docs.python.org/3/library/itertools.html).
4. Python Software Foundation. [Glossary: iterator, iterable, generator](https://docs.python.org/3/glossary.html#term-iterator).
5. Schemenauer, N., Peters, T., & Hetland, M. L. [PEP 255 — Simple Generators](https://peps.python.org/pep-0255/).
6. Hettinger, R. [PEP 289 — Generator Expressions](https://peps.python.org/pep-0289/).
7. van Rossum, G., & Eby, P. J. [PEP 380 — Syntax for Delegating to a Subgenerator](https://peps.python.org/pep-0380/).
