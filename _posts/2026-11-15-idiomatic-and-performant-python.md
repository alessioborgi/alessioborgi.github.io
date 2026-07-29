---
layout: single
title: "Idiomatic and Performant Python: Writing It Well, Then Measuring Before You Optimise"
date: 2026-11-15
categories: [python-primer]
book: python-primer
subsection: practice
tags: [idiomatic, performance, profiling, numpy]
excerpt: "Pythonic code and fast code are usually the same code — iterating over objects instead of indices is both clearer and quicker — but the two goals diverge exactly at the point where people start guessing instead of profiling."
author_profile: true
read_time: true
is_overview: false
icon: "⚡"
read_mins: 7
permalink: /blog/python-primer/idiomatic-and-performant-python/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> "Pythonic" means working with the language's iteration protocol directly — <code>for item in seq</code>, <code>enumerate</code>, <code>zip</code>, unpacking — rather than simulating C-style index loops. It usually happens to be the fast version too, because it avoids repeated indexing overhead. Beyond that, the real performance model is: every interpreted operation carries overhead a compiled one does not, string concatenation in a loop is quadratic, local variable lookup beats global, and vectorised NumPy replaces a Python-level loop with a C-level one. None of this is worth guessing about — profile with <code>timeit</code> or <code>cProfile</code> first, and only then change the code.
</div>

## Iterate over the thing, not its indices

```python
names = ["ada", "grace", "alan"]

# not idiomatic — simulates a C loop
for i in range(len(names)):
    print(i, names[i].title())

# idiomatic — the loop variable is the useful thing itself
for i, name in enumerate(names):
    print(i, name.title())
```

`enumerate` produces `(index, value)` pairs lazily, without a separate `len()` call or a manual counter. The same shift applies to iterating two sequences together:

```python
scores = [98, 95, 88]

# not idiomatic
for i in range(len(names)):
    print(names[i], scores[i])

# idiomatic
for name, score in zip(names, scores):
    print(name, score)
```

`zip` stops at the shorter input rather than raising, which is usually what you want; `itertools.zip_longest` is there for the other case. Unpacking replaces manual indexing again when a function returns a fixed-size tuple:

```python
def min_max(xs):
    return min(xs), max(xs)

lo, hi = min_max(scores)   # not: result = min_max(scores); lo = result[0]; hi = result[1]
print(lo, hi)   # -> 88 98

first, *rest = names
print(first, rest)   # -> ada ['grace', 'alan']
```

## Truthiness and `with`

```python
items = []

if len(items) == 0:      # works, but says more than necessary
    print("empty")

if not items:             # idiomatic — an empty container is already falsy
    print("empty")
```

`bool()` of `None`, `0`, `0.0`, `""`, `[]`, `{}`, `set()`, and any object whose `__len__` returns `0` is `False`; everything else, including a list containing only `False`, is truthy. This is what makes `while queue:` a correct loop condition and `if response:` a correct way to check a non-empty string, without a `len()` or an explicit `is not None`. `with`, covered in [files and context managers](/blog/python-primer/files-and-context-managers/), is idiomatic for the same reason: it says "acquire, use, release" directly instead of a `try`/`finally` that says the same thing in more words.

## The performance model: why loops are slow

A CPython `for` loop executes bytecode one instruction at a time, and each `BINARY_OP` re-checks the runtime types of its operands before deciding what `+` even means for them — there is no compile-time specialisation the way there is in C. That per-iteration overhead is fixed regardless of what the loop body computes, which is why the fix for a slow loop is usually to run fewer, larger operations rather than to hand-optimise the loop body.

```python
# quadratic: each += allocates a new, longer string and copies the old one in
result = ""
for word in ["a"] * 10_000:
    result += word + " "

# linear: join allocates once, having measured the total length up front
result = " ".join(["a"] * 10_000)
```

`str` is immutable, so `result += word` does not extend the existing string — it builds an entirely new one and copies everything before it, every single time. Over $$n$$ iterations that is $$O(n^2)$$ total copying. `str.join` computes the final length once and allocates once.

```python
import time

def local_lookup():
    total = 0
    x = 5              # local: stored in a fast array slot on the frame
    for _ in range(5_000_000):
        total += x
    return total

x = 5   # global: looked up by name in a dict each time

def global_lookup():
    total = 0
    for _ in range(5_000_000):
        total += x
    return total
```

`local_lookup` is reliably faster than `global_lookup` on CPython — a local variable is a slot in an array indexed by position, resolved at compile time; a global is a dictionary lookup by name, resolved every time the line runs. This is also why a tight loop inside a function is faster than the same loop at module level, and why `def f(x, n=len)` binding a global as a default argument is a real, if minor, optimisation you will see in hot code.

## When NumPy replaces the loop entirely

```python
import numpy as np

xs = list(range(1_000_000))
ys = [v * 2 + 1 for v in xs]        # a Python-level loop, one BINARY_OP pair per element

arr = np.arange(1_000_000)
arr2 = arr * 2 + 1                  # one C-level loop over contiguous memory, no per-element bytecode
```

The list comprehension is still a Python loop — faster than the explicit `for` form because the append is implicit and the loop body is one bytecode-level construct, but it still pays per-element interpreter overhead. `arr * 2 + 1` does the entire operation inside NumPy's C implementation over a contiguous block of memory, with no per-element Python bytecode at all. The rule of thumb: once you are doing uniform numeric work over more than a few thousand elements, express it as array operations rather than a Python loop, and let NumPy own the loop.

## Profile before you optimise

```python
import timeit

t1 = timeit.timeit('"".join(str(i) for i in range(1000))', number=1000)
t2 = timeit.timeit('"-".join(map(str, range(1000)))', number=1000)
print(t1, t2)   # -> two float seconds; compare them, don't guess which is faster
```

`timeit` isolates one expression and runs it many times, which is right for comparing two small alternatives. For "where is the actual time going in my program", `cProfile` is the tool:

```console
$ python -m cProfile -s cumulative slow_script.py
```

That prints every function called, how many times, and how much time it and its callees consumed — usually pointing at one function responsible for most of the runtime, which is where effort belongs. Optimising a function that consumes 2% of total runtime, however cleverly, cannot move the total by more than 2%.

<div class="warning-box">
  <strong>Classic trap — optimising without profiling.</strong> Intuition about which line is "the slow part" is wrong more often than it is right, because interpreter overhead, memory allocation patterns, and cache behaviour do not match how the code reads. A rewritten "optimisation" that turns out to change nothing, or makes things worse, is the single most common outcome of skipping <code>cProfile</code>. Measure first; the 20 minutes it costs is cheaper than debugging a "faster" version that is not.
</div>

<div class="insight-box">
  <strong>Key Insight — idiomatic and fast converge because both avoid fighting the interpreter.</strong> <code>enumerate</code>, <code>zip</code>, and unpacking are fast for the same reason they are readable: they use C-implemented iteration machinery instead of a Python-level index-and-lookup on every pass. The two goals only pull apart at the point where correctness-preserving idiom (a comprehension, a generator) is not enough and the real fix is to leave Python's per-element loop entirely, which is what NumPy is for.
</div>

## Common mistakes and their fixes

| mistake | fix |
|---|---|
| `for i in range(len(xs)): xs[i]` | `for x in xs:` (or `enumerate(xs)` if the index is needed) |
| `result = ""` then `result += x` in a loop | `"".join(parts)` |
| `def f(x, cache=[]):` | `def f(x, cache=None): cache = cache if cache is not None else []` |
| checking `if len(xs) == 0:` | `if not xs:` |
| a Python loop over a large numeric array | vectorise with NumPy |
| "optimising" without measuring | `cProfile` first, change the hottest function, measure again |

The mutable-default-argument row deserves its own emphasis: a default value is evaluated **once**, when the `def` statement runs, and the same object is reused on every call that does not supply that argument.

```python
def add_item(item, basket=[]):   # the list literal runs once, not per call
    basket.append(item)
    return basket

print(add_item("apple"))   # -> ['apple']
print(add_item("bread"))   # -> ['apple', 'bread']   — the SAME list, carried over
```

The second call did not start from an empty basket — it kept appending to the list created when `add_item` was defined. The fix in the table (`None` as the sentinel, a fresh list built inside the function) is the standard idiom, and it applies to any mutable default: lists, dicts, sets, and custom mutable objects alike.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Iterate over objects, not indices: <code>for x in xs</code>, <code>enumerate</code>, <code>zip</code>, and unpacking replace manual index bookkeeping and are faster for the same reason they read better.</li>
    <li>Empty containers, <code>0</code>, and <code>None</code> are falsy — write <code>if not xs:</code> rather than <code>if len(xs) == 0:</code>.</li>
    <li><code>str.join</code> is linear; <code>+=</code> on a string in a loop is quadratic, because strings are immutable and each <code>+=</code> copies everything before it.</li>
    <li>Local variable lookup is an array-slot access; global lookup is a dictionary lookup by name — locals win in hot loops.</li>
    <li>Vectorise uniform numeric work with NumPy once the Python-level loop overhead dominates; always profile with <code>timeit</code>/<code>cProfile</code> before changing anything, and never use a mutable literal as a default argument.</li>
  </ul>
</div>

This closes the book. Start from the [overview](/blog/python-primer/overview/) if you arrived here mid-way, or revisit [errors and exceptions](/blog/python-primer/errors-and-exceptions/) and [files and context managers](/blog/python-primer/files-and-context-managers/) for the two topics every real program touches first.

## References

1. Python documentation. [Performance Tips — Python Wiki](https://wiki.python.org/moin/PythonSpeed/PerformanceTips).
2. Python documentation. [`timeit` — Measure execution time of small code snippets](https://docs.python.org/3/library/timeit.html).
3. Python documentation. [`profile` and `cProfile` — Python profilers](https://docs.python.org/3/library/profile.html).
4. Python documentation. [`numpy.ndarray` operations](https://numpy.org/doc/stable/reference/arrays.ndarray.html) — NumPy project documentation.
5. Python documentation. [Truth Value Testing](https://docs.python.org/3/library/stdtypes.html#truth-value-testing) and [`zip`](https://docs.python.org/3/library/functions.html#zip), [`enumerate`](https://docs.python.org/3/library/functions.html#enumerate) built-ins.
6. van Rossum, G., Warsaw, B., & Coghlan, N. [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/), 2001.
