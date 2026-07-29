---
layout: single
title: "Names, Not Boxes: Python Syntax, Variables and the Built-in Types"
date: 2026-11-02
categories: [python-primer]
book: python-primer
subsection: foundations
tags: [python, variables, types, floats]
excerpt: "A Python variable is not a container that holds a value — it is a label stuck onto an object that lives somewhere else. Almost every early surprise, from shared lists to `0.1 + 0.2`, follows from taking that sentence literally."
author_profile: true
read_time: true
is_overview: false
icon: "🏷️"
read_mins: 9
permalink: /blog/python-primer/syntax-and-variables/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Indentation is syntax, not style. Assignment binds a <em>name</em> to an <em>object</em>; <code>b = a</code> copies the label, never the object, which you can verify with <code>id()</code>. Types belong to objects, not to names, so a name can be rebound to anything. The five types you meet first are <code>int</code> (arbitrary precision), <code>float</code> (binary, and therefore lossy — <code>0.1 + 0.2 != 0.3</code>), <code>bool</code> (a subclass of <code>int</code>), <code>str</code> and <code>None</code>.
</div>

## Whitespace is the grammar

Most languages use braces to delimit a block and indentation to hint at it. Python uses indentation for both, so getting it wrong is a syntax error rather than a style complaint:

```python
def classify(n):
    if n < 0:
        return "negative"
    elif n == 0:
        return "zero"
    return "positive"

print(classify(-4))   # -> negative
print(classify(0))    # -> zero
```

The rules: a colon opens a block, everything in that block is indented by the same amount, and dedenting closes it. Four spaces per level is the convention from [PEP 8](https://peps.python.org/pep-0008/); never mix tabs and spaces in one file, because Python 3 rejects the mixture outright with `TabError`. Blank lines and comments are ignored for indentation purposes.

Comments start with `#` and run to the end of the line. There is no block-comment syntax — a triple-quoted string that is not assigned to anything is sometimes abused as one, but it is really just a string expression that gets built and discarded.

## Statements against expressions

An **expression** produces a value: `2 + 2`, `len(xs)`, `f(x)`, `[i for i in range(3)]`. A **statement** does something: `x = 1`, `if ...:`, `return`, `import os`. Every expression can be used as a statement (its value is thrown away), but a statement cannot be used where a value is expected — which is why `if x = 5:` is a syntax error rather than the silent bug it is in C.

The one deliberate crossover is the walrus operator `:=` ([PEP 572](https://peps.python.org/pep-0572/), Python 3.8+), an assignment that *is* an expression:

```python
if (n := len("hello")) > 3:
    print(n)          # -> 5
```

## Variables are names bound to objects

This is the sentence to take literally. `x = 42` does not put 42 into a box called `x`. It creates (or reuses) an integer object and makes the name `x` refer to it. `id()` returns an object's identity — in CPython, its memory address — so you can watch bindings directly:

```python
a = [1, 2, 3]
b = a
print(id(a) == id(b))   # -> True   same object, two names
b.append(4)
print(a)                # -> [1, 2, 3, 4]   'a' sees it too

b = a[:]                # slice makes a new list
print(id(a) == id(b))   # -> False
```

That second line is the source of an enormous share of beginner bugs: nothing was copied, so mutating through one name is visible through the other. Compare what happens with an integer:

```python
x = 1000
y = x
print(id(x) == id(y))   # -> True
y += 1
print(x, y)             # -> 1000 1001
print(id(x) == id(y))   # -> False
```

Nothing contradictory is happening. `y += 1` cannot modify the integer 1000, because integers are **immutable**; it computes a new object, 1001, and rebinds `y` to it. `x` still labels the original. Lists are **mutable**, so `b.append(4)` changes the object itself and every name pointing at it sees the change. Immutable: `int`, `float`, `bool`, `str`, `tuple`, `frozenset`, `bytes`. Mutable: `list`, `dict`, `set`, and most objects you define yourself.

## Dynamic typing

Types attach to objects, not to names, and are checked when an operation runs rather than ahead of time:

```python
n = 42
print(type(n).__name__)   # -> int
n = "now a string"
print(type(n).__name__)   # -> str
```

This is *dynamic* typing, and it is quite different from *weak* typing. Python is strongly typed: it will not quietly coerce across unrelated types, so `"3" + 4` raises `TypeError: can only concatenate str (not "int") to str` rather than producing `"34"` or `7`.

To ask about a type, prefer `isinstance(obj, T)` over `type(obj) is T`, because `isinstance` respects subclasses and accepts a tuple of candidates:

```python
print(isinstance(3, int))              # -> True
print(isinstance(3, (int, float)))     # -> True
print(isinstance(True, int))           # -> True  (!)
```

## The five types you meet first

| Type | Literal | Mutable? | Notes |
|---|---|---|---|
| `int` | `42`, `-7`, `1_000_000` | no | arbitrary precision, no overflow |
| `float` | `3.14`, `1e-9` | no | IEEE-754 double, 53 bits of mantissa |
| `bool` | `True`, `False` | no | subclass of `int`; `True == 1` |
| `str` | `"hi"`, `'hi'` | no | sequence of Unicode code points |
| `NoneType` | `None` | no | the single "no value" object |

`bool` really is a subclass of `int`, which is occasionally useful and occasionally a trap:

```python
print(True + True)          # -> 2
print(sum([True, False, True]))   # -> 2   handy for counting
```

`None` is a singleton — there is exactly one of it — so test for it with `is`, never `==`. A function with no `return` statement returns it implicitly.

## Numbers behave in two surprising ways

**Integers never overflow.** They grow to whatever size is needed, limited only by memory:

```python
print(2 ** 100)             # -> 1267650600228229401496703205376

import math
print(len(str(math.factorial(100))))   # -> 158
```

**Division splits into three operators.** `/` is *true* division and always returns a `float`, even when the result is exact. `//` is *floor* division, and `%` is the remainder that matches it:

```python
print(7 / 2)      # -> 3.5
print(7 // 2)     # -> 3
print(7 % 2)      # -> 1
print(7.0 // 2)   # -> 3.0   float in, float out
```

The important detail is what these do with negatives. Python floors *towards negative infinity*, unlike C and Java, which truncate towards zero:

```python
print(-7 // 2)          # -> -4     not -3
print(-7 % 2)           # -> 1      not -1
print(divmod(-7, 2))    # -> (-4, 1)
```

The invariant `a == (a // b) * b + (a % b)` holds in every case, and the sign of `a % b` follows the sign of `b`. This is genuinely convenient: `i % n` is always a valid index into a length-`n` sequence, whatever the sign of `i`.

**Floats are binary, so most decimals are inexact.** `0.1` cannot be written exactly in base 2, any more than $$1/3$$ can be written exactly in base 10. What you get is the nearest representable double:

```python
print(f"{0.1:.20f}")      # -> 0.10000000000000000555
print(0.1 + 0.2)          # -> 0.30000000000000004
print(0.1 + 0.2 == 0.3)   # -> False
```

There are two fixes, and which you want depends on the problem. For measurement-like quantities, compare with a tolerance:

```python
import math
print(math.isclose(0.1 + 0.2, 0.3))   # -> True
```

For money and anything else where the decimal digits are the ground truth, use `decimal.Decimal` — constructed from a *string*, since `Decimal(0.1)` would faithfully copy the error you were trying to avoid:

```python
from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))   # -> 0.3
```

<div class="insight-box">
  <strong>Key Insight — <code>round</code> does not round half up:</strong> Python uses banker's rounding (round-half-to-even) as specified by IEEE-754, so <code>round(2.5)</code> is <code>2</code> while <code>round(3.5)</code> is <code>4</code>, and <code>round(-0.5)</code> is <code>0</code>. This is not a bug; rounding halves consistently upwards introduces a positive bias when you sum many rounded values, and going to the nearest even value cancels it. If you need the school rule, be explicit about it with <code>math.floor(x + 0.5)</code> or a <code>Decimal</code> with an explicit rounding mode.
</div>

<div class="warning-box">
  <strong>The classic trap — assignment never copies.</strong> <code>b = a</code> gives you a second name for one object, so <code>b.append(4)</code> mutates what <code>a</code> sees. The same applies when you pass a list to a function or store it in two places in a data structure. If you want an independent object, say so: <code>b = a[:]</code> or <code>b = list(a)</code> for a <em>shallow</em> copy, and <code>copy.deepcopy(a)</code> when the elements are themselves mutable. Shallow copies are the subtler hazard: <code>b = a[:]</code> on a list of lists gives a new outer list whose elements are still the <em>same</em> inner lists.
</div>

The next post takes these building blocks and combines them: [operators and control flow](/blog/python-primer/operators-and-control-flow/), where `==` and `is` part company for good.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Indentation delimits blocks; a colon opens one; four spaces per level, never mixed with tabs.</li>
    <li>Expressions have values, statements do not; <code>:=</code> is the deliberate exception.</li>
    <li><code>b = a</code> binds a second name to one object. Mutating through either name is visible through both; rebinding is not.</li>
    <li>Immutable: <code>int</code>, <code>float</code>, <code>bool</code>, <code>str</code>, <code>tuple</code>, <code>frozenset</code>. Mutable: <code>list</code>, <code>dict</code>, <code>set</code>.</li>
    <li><code>/</code> always gives a float; <code>//</code> floors towards negative infinity so <code>-7 // 2 == -4</code> and <code>-7 % 2 == 1</code>.</li>
    <li>Integers are arbitrary precision; floats are IEEE-754 doubles, so compare with <code>math.isclose</code> and use <code>Decimal("0.1")</code> for exact decimals.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [The Python Tutorial: an informal introduction](https://docs.python.org/3/tutorial/introduction.html).
2. Python Software Foundation. [Built-in Types](https://docs.python.org/3/library/stdtypes.html).
3. Python Software Foundation. [Floating-Point Arithmetic: Issues and Limitations](https://docs.python.org/3/tutorial/floatingpoint.html).
4. Python Software Foundation. [`decimal` — Decimal fixed-point and floating-point arithmetic](https://docs.python.org/3/library/decimal.html).
5. van Rossum, G., Warsaw, B., & Coghlan, N. [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/).
6. Angelico, C., Peters, T., & van Rossum, G. [PEP 572 — Assignment Expressions](https://peps.python.org/pep-0572/).
7. Goldberg, D. [What Every Computer Scientist Should Know About Floating-Point Arithmetic](https://doi.org/10.1145/103162.103163). *ACM Computing Surveys* 23(1), 5–48, 1991.
