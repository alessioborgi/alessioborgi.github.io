---
layout: single
title: "Dicts and Sets: Hashing, Defaults, and What Makes a Key Legal"
date: 2026-11-05
categories: [python-primer]
book: python-primer
subsection: data-structures
tags: [python, dictionaries, sets, hashing, collections]
excerpt: "A dict trades memory for the ability to skip the search entirely. Everything that follows — why keys must be hashable, why lists cannot be keys, and why `1`, `1.0` and `True` collide — comes from that single trade."
author_profile: true
read_time: true
is_overview: false
icon: "🗝️"
read_mins: 9
permalink: /blog/python-primer/dicts-and-sets/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A dict maps hashable keys to arbitrary values in \(O(1)\) average time; a set is the same machinery with the values thrown away. Reach for <code>get</code> when a missing key is normal, <code>setdefault</code> or <code>collections.defaultdict</code> when you are accumulating, and <code>Counter</code> when you are tallying. Insertion order has been guaranteed since Python 3.7. An object is hashable when it has a <code>__hash__</code> that stays constant for its lifetime and agrees with its <code>__eq__</code> — which mutable built-ins deliberately do not.
</div>

## Why a dict is fast

Looking something up in a list means comparing against every element: $$O(n)$$. A dict instead computes `hash(key)`, uses the low bits of that integer to pick a slot in an internal table, and looks there. One hash, one or two comparisons, done — independent of how many entries the dict holds.

The cost is memory (the table is deliberately kept sparse, so collisions stay rare) and a restriction on keys, which the last section makes precise.

## Creating and reading

```python
d = {"a": 1, "b": 2}
print(dict(a=1, b=2))                    # -> {'a': 1, 'b': 2}
print(dict([("a", 1), ("b", 2)]))        # -> {'a': 1, 'b': 2}
```

`d[key]` raises `KeyError` if the key is absent. `d.get(key)` returns `None` instead, and `d.get(key, default)` returns whatever you nominate:

```python
print(d["a"])            # -> 1
print(d.get("z"))        # -> None
print(d.get("z", 0))     # -> 0
d["z"]                   # KeyError: 'z'
```

`get` never inserts. `setdefault` does: it returns the existing value if the key is present and otherwise inserts your default and returns *that*.

```python
print(d.setdefault("c", 3))   # -> 3     key was absent, now d has 'c'
print(d.setdefault("a", 99))  # -> 1     key was present, 99 discarded
print(d)                      # -> {'a': 1, 'b': 2, 'c': 3}
```

`in` tests **keys**, not values, and is $$O(1)$$:

```python
print("a" in d, 1 in d)   # -> True False
```

## Views, iteration and merging

`keys()`, `values()` and `items()` return *views* — live windows onto the dict, not copies. Iterating a dict directly iterates its keys, so `for k in d:` and `for k in d.keys():` are the same thing; use `items()` when you want both halves.

```python
for k, v in d.items():
    print(k, v)
# -> a 1
# -> b 2
# -> c 3
```

Since **Python 3.7** insertion order is a language guarantee rather than a CPython implementation detail — it was an accident of the 3.6 dict rewrite, then blessed in the 3.7 release notes. Keys come back in the order they were first inserted; re-assigning an existing key does not move it.

```python
order = {}
for k in "zebra":
    order[k] = order.get(k, 0) + 1
print(order)   # -> {'z': 1, 'e': 1, 'b': 1, 'r': 1, 'a': 1}
```

Merging has three spellings. `|` is the newest ([PEP 584](https://peps.python.org/pep-0584/), Python 3.9+) and reads best; in every case the **right-hand side wins** on conflicts.

```python
m1 = {"a": 1, "b": 2}
m2 = {"b": 20, "c": 3}
print(m1 | m2)          # -> {'a': 1, 'b': 20, 'c': 3}
print({**m1, **m2})     # -> {'a': 1, 'b': 20, 'c': 3}
m1 |= m2                # in-place, same as m1.update(m2)
```

| Method | Effect | Mutates? | Complexity |
|---|---|---|---|
| `d[k]` / `d[k] = v` | get / set | set does | $$O(1)$$ average |
| `d.get(k, default)` | read, never inserts | no | $$O(1)$$ |
| `d.setdefault(k, v)` | read, inserting `v` if absent | maybe | $$O(1)$$ |
| `d.pop(k)` / `d.pop(k, default)` | remove and return | yes | $$O(1)$$ |
| `d.popitem()` | remove and return the **last** pair | yes | $$O(1)$$ |
| `d.update(other)` | merge `other` in | yes | $$O(k)$$ |
| `d.keys()` / `.values()` / `.items()` | live views | no | $$O(1)$$ to create |
| `k in d` | key membership | no | $$O(1)$$ average |
| `d.copy()` | shallow copy | no | $$O(n)$$ |

Nesting is just values that happen to be dicts. Reaching into one safely means chaining `get`, since `cfg["db"]["port"]` explodes if either level is missing:

```python
cfg = {"db": {"host": "localhost", "port": 5432}}
print(cfg["db"]["port"])                     # -> 5432
print(cfg.get("cache", {}).get("ttl", 60))   # -> 60
```

## `collections`: defaultdict, Counter, OrderedDict

`defaultdict(factory)` calls `factory()` to manufacture a value the first time a missing key is *read*. Grouping becomes one line instead of four:

```python
from collections import defaultdict

groups = defaultdict(list)
for word in ["apple", "avocado", "banana", "blueberry"]:
    groups[word[0]].append(word)
print(dict(groups))
# -> {'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry']}
```

`defaultdict(int)` gives a counter, `defaultdict(set)` a multimap without duplicates. The one surprise is that merely *looking* creates the entry — `groups["z"]` returns `[]` and leaves `'z': []` behind — so use `.get` or `in` for read-only probing.

`Counter` is a dict subclass built for tallying. Missing keys read as `0` without inserting, and it supports arithmetic:

```python
from collections import Counter

c = Counter("mississippi")
print(c)                 # -> Counter({'i': 4, 's': 4, 'p': 2, 'm': 1})
print(c.most_common(2))  # -> [('i', 4), ('s', 4)]
print(c["z"])            # -> 0     no KeyError, no insertion
print(Counter("aab") + Counter("abc"))
# -> Counter({'a': 3, 'b': 2, 'c': 1})
```

`OrderedDict` predates the 3.7 ordering guarantee and is now rarely needed, but it is not redundant. Its `==` is order-sensitive, and it offers `move_to_end`, which is what LRU caches are built from:

```python
from collections import OrderedDict

od = OrderedDict([("a", 1), ("b", 2)])
print(od == OrderedDict([("b", 2), ("a", 1)]))   # -> False  order counts
print({"a": 1, "b": 2} == {"b": 2, "a": 1})      # -> True   plain dicts ignore it
od.move_to_end("a")
print(list(od))                                  # -> ['b', 'a']
```

## Sets

A set is an unordered collection of distinct hashable objects — a dict without values. Membership is $$O(1)$$, which is the whole reason to convert a list before testing against it repeatedly.

```python
s = {1, 2, 3}
t = {3, 4}
print(s | t)   # -> {1, 2, 3, 4}   union
print(s & t)   # -> {3}            intersection
print(s - t)   # -> {1, 2}         difference
print(s ^ t)   # -> {1, 2, 4}      symmetric difference
```

Each operator has a named method (`union`, `intersection`, `difference`, `symmetric_difference`) that additionally accepts any iterable, not just another set. `issubset`, `issuperset` and `isdisjoint` answer the relational questions.

| Operation | Method | Complexity |
|---|---|---|
| `x in s` | — | $$O(1)$$ average |
| `s.add(x)` | — | $$O(1)$$ |
| `s.discard(x)` | never raises | $$O(1)$$ |
| `s.remove(x)` | `KeyError` if absent | $$O(1)$$ |
| `s \| t` | `union` | $$O(\lvert s\rvert + \lvert t\rvert)$$ |
| `s & t` | `intersection` | $$O(\min(\lvert s\rvert, \lvert t\rvert))$$ |
| `s - t` | `difference` | $$O(\lvert s\rvert)$$ |

`{}` is an empty **dict**; the empty set is `set()`. There is no literal for it.

`frozenset` is the immutable version, and therefore itself hashable — so it can be a set element or a dict key, which is how you index things by an unordered group:

```python
fs = frozenset([1, 2])
print({fs: "ok"}[frozenset([2, 1])])   # -> ok
```

## What makes an object hashable

Three conditions. The object implements `__hash__`; that hash never changes during the object's lifetime; and objects that compare equal have equal hashes. The last one is a contract, not a check — break it and lookups silently fail.

Mutable built-ins deliberately set `__hash__ = None`, because a key whose hash changed after insertion would be stranded in the wrong slot forever:

```python
hash([1, 2])   # TypeError: unhashable type: 'list'
```

Hashable out of the box: `int`, `float`, `str`, `bytes`, `bool`, `None`, `frozenset`, and tuples whose every element is hashable. Not hashable: `list`, `dict`, `set`. Your own classes are hashable by default (identity-based), but **defining `__eq__` sets `__hash__` to `None`** unless you define `__hash__` too — Python removes it rather than let you violate the contract by accident.

<div class="insight-box">
  <strong>Key Insight — equal keys are the <em>same</em> key, across types:</strong> because <code>1 == 1.0 == True</code> and their hashes agree, a dict cannot tell them apart. So <code>{1: "int", 1.0: "float", True: "bool"}</code> collapses to <code>{1: 'bool'}</code> — one entry, the <em>first</em> key object retained, the <em>last</em> value written. This regularly corrupts dictionaries keyed by mixed numeric types, and it is why a set of <code>{0, False, 0.0}</code> has exactly one element.
</div>

<div class="warning-box">
  <strong>The classic trap — mutating a key, or resizing during iteration.</strong> Two failures with one cause. First, a custom object used as a key and then mutated in a way that changes its hash becomes unreachable: <code>k in d</code> returns <code>False</code> even though <code>d</code> still holds it. Second, adding or deleting entries while looping raises <code>RuntimeError: dictionary changed size during iteration</code>, because views are live. Iterate over a snapshot instead — <code>for k in list(d):</code> — or build a new dict with a comprehension. Note that <em>re-assigning</em> an existing key mid-loop is fine; only changing the size is not.
</div>

Next: [strings and formatting](/blog/python-primer/strings-and-formatting/), where immutability turns into a performance question.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Dicts and sets hash the key to jump straight to a slot: \(O(1)\) average lookup, insertion and deletion, paid for in memory.</li>
    <li><code>get</code> reads without inserting, <code>setdefault</code> reads and inserts, <code>defaultdict</code> manufactures on first read — including on a read you only meant as a probe.</li>
    <li>Insertion order is guaranteed from Python 3.7; <code>OrderedDict</code> survives for its order-sensitive <code>==</code> and <code>move_to_end</code>.</li>
    <li><code>|</code> merges dicts (3.9+) with the right-hand side winning; <code>{}</code> is an empty dict and <code>set()</code> the empty set.</li>
    <li>Hashable means a stable <code>__hash__</code> consistent with <code>__eq__</code>; lists and dicts are excluded, tuples qualify only if their contents do.</li>
    <li><code>1</code>, <code>1.0</code> and <code>True</code> are one key, and <code>Counter</code> beats a hand-rolled tally loop.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [Mapping Types — dict](https://docs.python.org/3/library/stdtypes.html#mapping-types-dict).
2. Python Software Foundation. [Set Types — set, frozenset](https://docs.python.org/3/library/stdtypes.html#set-types-set-frozenset).
3. Python Software Foundation. [`collections` — container datatypes](https://docs.python.org/3/library/collections.html).
4. Python Software Foundation. [Glossary: hashable](https://docs.python.org/3/glossary.html#term-hashable).
5. Vandevoorde, B., & Boddu, S. [PEP 584 — Add Union Operators To `dict`](https://peps.python.org/pep-0584/).
6. Python Software Foundation. [What's New in Python 3.7 — dict order is now guaranteed](https://docs.python.org/3/whatsnew/3.7.html).
7. Python Wiki. [TimeComplexity — dict and set operations](https://wiki.python.org/moin/TimeComplexity).
