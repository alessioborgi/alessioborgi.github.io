---
layout: single
title: "Dunder Methods: How Python's Protocols Replace Interfaces"
date: 2026-11-10
categories: [python-primer]
book: python-primer
subsection: oop
tags: [dunder, data-model, protocols, operator-overloading]
excerpt: "Python has almost no interfaces to implement and no operators to declare. Instead, every piece of syntax — len(x), x[i], for y in x, a + b, with r as f — is a documented call to a method with a double-underscore name. Learn the mapping and your own types stop being second-class citizens."
author_profile: true
read_time: true
is_overview: false
icon: "🪄"
read_mins: 6
permalink: /blog/python-primer/dunder-methods/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Every operator and built-in in Python delegates to a method named <code>__like_this__</code> — the <em>data model</em>. There is nothing to inherit from and nothing to register: implement the methods and the syntax works. Define <code>__repr__</code> before <code>__str__</code>; define <code>__hash__</code> whenever you define <code>__eq__</code>, or your objects become unhashable. <code>__len__</code>/<code>__getitem__</code>/<code>__iter__</code>/<code>__contains__</code> make a container, <code>__add__</code>/<code>__lt__</code> make operators work, <code>__call__</code> makes an instance behave like a function, and <code>__enter__</code>/<code>__exit__</code> make it usable in a <code>with</code> statement.
</div>

## Protocols, not interfaces

In a language with interfaces you declare `class Deck implements Iterable` and a compiler checks you. Python does the opposite: the interpreter looks for the method when it needs it, and if the method is there, the syntax works. `len(x)` calls `type(x).__len__(x)`. `a + b` calls `type(a).__add__(a, b)`. `for y in x` calls `type(x).__iter__(x)`. This is duck typing made concrete — a *protocol* is nothing but an agreed set of dunder names.

Two consequences matter in practice. First, you can make a class fit a protocol without touching, or even having access to, any base class. Second, the lookup goes through the *type*, not the instance: assigning `x.__len__ = ...` on an instance has no effect on `len(x)`. Implicit dunder lookups always bypass the instance dictionary.

## `__repr__` before `__str__`

`repr()` is for developers, `str()` for end users. The rule to remember: **implement `__repr__` first**, because `str()` falls back to it when `__str__` is missing, but never the other way round.

```python
class Money:
    def __init__(self, amount, currency="EUR"):
        self.amount = amount
        self.currency = currency

    def __repr__(self):
        return f"Money({self.amount!r}, {self.currency!r})"

    def __str__(self):
        return f"{self.amount:.2f} {self.currency}"

m = Money(3.5)
print(m)         # -> 3.50 EUR
print(repr(m))   # -> Money(3.5, 'EUR')
print([m])       # -> [Money(3.5, 'EUR')]
print(f"{m} / {m!r}")   # -> 3.50 EUR / Money(3.5, 'EUR')
```

Note the third line: containers print their elements with `repr`, never `str`, so a class with only `__str__` shows up as `<__main__.Money object at 0x…>` inside any list you debug. The convention for `__repr__` is to return something that would reconstruct the object — hence the `!r` conversions, which quote the string properly. See [strings and formatting](/blog/python-primer/strings-and-formatting/) for `!r` and the format mini-language.

## `__eq__` and `__hash__` travel together

By default, objects compare by identity and hash by identity. Defining `__eq__` changes the first — and Python then *removes* the second, because keeping an identity hash alongside a value equality would break the hash invariant.

```python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)

print(Point(1, 2) == Point(1, 2))   # -> True
print({Point(1, 2)})
# -> TypeError: unhashable type: 'Point'
```

Returning `NotImplemented` (the singleton, not the `NotImplementedError` exception) rather than `False` when the other operand is a foreign type is the polite move: Python then tries the reflected operation, `other.__eq__(self)`, and only falls back to identity comparison if that also declines.

<div class="warning-box">
  <strong>Classic trap — defining <code>__eq__</code> without <code>__hash__</code>.</strong> Python sets <code>__hash__ = None</code> in any class that defines <code>__eq__</code>, so instances can no longer go in a <code>set</code> or be used as <code>dict</code> keys. The failure surfaces far from the class definition, usually as <code>TypeError: unhashable type</code> deep inside someone else's code. Fix it by hashing exactly the fields you compare:

<pre><code class="language-python">    def __hash__(self):
        return hash((self.x, self.y))   # same fields as __eq__
</code></pre>

  The invariant to preserve is one-directional: <em>equal objects must have equal hashes</em>; unequal objects may collide. Hash only immutable state — if <code>x</code> can be reassigned after the object goes into a set, it will be filed under the old hash and become unfindable. A <code>@dataclass(frozen=True)</code> generates a correct pair for you.
</div>

## The container protocols

```python
class Deck:
    def __init__(self, cards):
        self._cards = list(cards)

    def __len__(self):
        return len(self._cards)

    def __getitem__(self, index):
        return self._cards[index]

d = Deck(["A", "K", "Q", "J"])
print(len(d))            # -> 4
print(d[0], d[-1])       # -> A J
print(d[1:3])            # -> ['K', 'Q']
print("Q" in d)          # -> True
print(list(reversed(d))) # -> ['J', 'Q', 'K', 'A']
for card in d:
    pass                 # iteration works too
```

Only two methods, and the object already slices, iterates, supports `in`, and works with `reversed`, `random.choice` and `sorted`. That is the legacy sequence protocol: absent `__iter__`, Python falls back to calling `__getitem__` with 0, 1, 2, … until `IndexError`. Absent `__contains__`, `in` iterates and compares.

The fallbacks are correct but linear. Define the specific methods when you can do better:

```python
class Interval:
    def __init__(self, lo, hi):
        self.lo, self.hi = lo, hi

    def __contains__(self, x):       # O(1) instead of scanning
        return self.lo <= x <= self.hi

    def __iter__(self):
        return iter(range(self.lo, self.hi + 1))

i = Interval(1, 1_000_000)
print(500 in i, 0 in i)   # -> True False
print(sum(Interval(1, 100)))   # -> 5050
```

`__iter__` must return an *iterator*; a [generator function](/blog/python-primer/comprehensions-and-generators/) is the easiest way to write one, and `iter(...)` of an existing iterable is the second easiest. Note also that `__len__` is what `bool(x)` consults when `__bool__` is absent — which is why an empty custom container is falsy for free.

| Syntax | Method called |
|---|---|
| `len(x)` | `__len__` |
| `x[k]`, `x[k] = v`, `del x[k]` | `__getitem__`, `__setitem__`, `__delitem__` |
| `for i in x`, `iter(x)` | `__iter__` (falls back to `__getitem__`) |
| `v in x` | `__contains__` (falls back to iteration) |
| `a + b`, `a * b`, `-a` | `__add__`, `__mul__`, `__neg__` |
| `a < b`, `a == b` | `__lt__`, `__eq__` |
| `x(...)` | `__call__` |
| `with x:` | `__enter__`, `__exit__` |
| `str(x)`, `repr(x)`, `f"{x:.2f}"` | `__str__`, `__repr__`, `__format__` |

## Operators and ordering

```python
from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, *parts):
        self.parts = parts

    def __repr__(self):
        return "Version" + repr(self.parts)

    def __eq__(self, other):
        return self.parts == other.parts

    def __lt__(self, other):
        return self.parts < other.parts

print(Version(1, 9) < Version(1, 10))                  # -> True
print(sorted([Version(2, 0), Version(1, 10), Version(1, 9)]))
# -> [Version(1, 9), Version(1, 10), Version(2, 0)]
print(Version(2, 0) >= Version(1, 10))                 # -> True
```

`functools.total_ordering` fills in `<=`, `>` and `>=` from `__lt__` and `__eq__`. `sorted`, `min`, `max` and `heapq` need nothing else — they are all defined in terms of `<`.

Arithmetic follows the same shape, with `NotImplemented` as the "I decline, ask the other operand" signal:

```python
class Money:
    def __init__(self, amount, currency="EUR"):
        self.amount, self.currency = amount, currency

    def __repr__(self):
        return f"Money({self.amount!r}, {self.currency!r})"

    def __add__(self, other):
        if isinstance(other, Money) and other.currency == self.currency:
            return Money(self.amount + other.amount, self.currency)
        return NotImplemented

print(Money(2) + Money(3))   # -> Money(5, 'EUR')
print(Money(2) + 3)
# -> TypeError: unsupported operand type(s) for +: 'Money' and 'int'
```

Declining produces a clear `TypeError` from the interpreter. Returning `False` or raising something ad hoc would not.

## `__call__` and `with`

An instance with `__call__` is a function that owns state — a closure you can inspect:

```python
class Accumulator:
    def __init__(self):
        self.total = 0

    def __call__(self, x):
        self.total += x
        return self.total

acc = Accumulator()
print(acc(3), acc(4), acc(10))   # -> 3 7 17
print(callable(acc), acc.total)  # -> True 17
```

And `__enter__`/`__exit__` are the whole of the context-manager protocol. `__exit__` receives the exception triple — all three `None` if the block finished normally — and its return value decides whether the exception propagates:

```python
class Suppress:
    def __init__(self, *exceptions):
        self.exceptions = exceptions

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return exc_type is not None and issubclass(exc_type, self.exceptions)

with Suppress(ZeroDivisionError):
    1 / 0
print("still running")   # -> still running
```

<div class="insight-box">
  <strong>Key Insight — a truthy <code>__exit__</code> swallows the exception:</strong> returning anything truthy tells the interpreter "handled, do not re-raise". This is the single most common bug in hand-written context managers, because a method that ends without an explicit <code>return</code> yields <code>None</code>, which is correctly falsy — but a stray <code>return True</code> added while debugging silently eats every error in the block. Default to no <code>return</code> at all unless suppression is the point (as in <code>contextlib.suppress</code>, which is the above, already written for you).
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Protocols are name-based: implement the dunder and the syntax works. Implicit dunder lookup goes through the type, skipping the instance.</li>
    <li><code>__repr__</code> is the one to write first — <code>str()</code> falls back to it, and containers always display elements with it.</li>
    <li>Defining <code>__eq__</code> sets <code>__hash__ = None</code>. Define both, over the same immutable fields, or use <code>@dataclass(frozen=True)</code>.</li>
    <li><code>__len__</code> + <code>__getitem__</code> already give slicing, iteration, <code>in</code> and <code>reversed</code>; add <code>__iter__</code>/<code>__contains__</code> when you can beat the linear fallback.</li>
    <li>Binary operators return <code>NotImplemented</code> (not <code>False</code>) for unsupported operands; <code>__exit__</code> returning truthy suppresses the exception.</li>
  </ul>
</div>

Next: [modules and packages](/blog/python-primer/modules-and-packages/) — how code you write becomes code you can import.

## References

1. Python documentation. [The Python Data Model](https://docs.python.org/3/reference/datamodel.html) — the authoritative list of special methods.
2. Python documentation. [`functools.total_ordering`](https://docs.python.org/3/library/functools.html#functools.total_ordering) and [`contextlib`](https://docs.python.org/3/library/contextlib.html).
3. Python documentation. [`object.__hash__` and the hash/eq invariant](https://docs.python.org/3/reference/datamodel.html#object.__hash__).
4. Levkivskyi, I., et al. [PEP 544 — Protocols: Structural subtyping (static duck typing)](https://peps.python.org/pep-0544/), 2017.
5. Ramalho, L. *Fluent Python*, 2nd ed., ch. 1 and 16. O'Reilly, 2022.
