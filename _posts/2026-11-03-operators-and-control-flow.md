---
layout: single
title: "Operators and Control Flow: `is` Is Not `==`, and `for` Has an `else`"
date: 2026-11-03
categories: [python-primer]
book: python-primer
subsection: foundations
tags: [python, control-flow, operators, match]
excerpt: "`==` asks whether two objects are equal; `is` asks whether they are the same object. CPython's caching of small integers makes the two agree just often enough to teach you the wrong lesson."
author_profile: true
read_time: true
is_overview: false
icon: "🔀"
read_mins: 10
permalink: /blog/python-primer/operators-and-control-flow/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> <code>==</code> compares values, <code>is</code> compares identity, and you should use <code>is</code> only for <code>None</code>, <code>True</code>, <code>False</code> and sentinels. <code>and</code> and <code>or</code> short-circuit and return one of their <em>operands</em>, not a bool. Every container is falsy when empty, which is why <code>if xs:</code> beats <code>if len(xs) > 0:</code>. Loops carry an <code>else</code> clause that runs only when no <code>break</code> fired, and Python 3.10 added structural pattern matching with <code>match</code>.
</div>

## Arithmetic and comparison

The arithmetic operators are `+ - * / // % **`, with the [division subtleties](/blog/python-primer/syntax-and-variables/) covered previously. Every one has an augmented form (`+=`, `//=`, `**=`) that rebinds the name; for mutable objects such as lists, `+=` mutates in place, which is a distinction worth remembering.

The bitwise operators work on integers: `&` and, `|` or, `^` xor, `<<` and `>>` shifts, `~` bitwise not.

```python
print(5 & 3, 5 | 3, 5 ^ 3)     # -> 1 7 6
print(5 << 1, 5 >> 1, ~5)      # -> 10 2 -6
```

Comparisons are `== != < <= > >=`, and they **chain** — a genuine convenience most languages lack:

```python
print(3 < 5 < 10)      # -> True
```

This is not `(3 < 5) < 10`; Python evaluates `3 < 5 and 5 < 10`, with the middle operand computed only once. So `lo <= x <= hi` reads exactly as it does on paper.

## `==` against `is`

`x == y` calls `x.__eq__(y)` and asks *do these represent the same value*. `x is y` asks *are these literally the same object in memory*, which is `id(x) == id(y)`. Different questions:

```python
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)   # -> True   equal contents
print(a is b)   # -> False  two distinct list objects
```

The reason this trips people is that CPython caches small immutable objects, so identity and equality often coincide by accident. Integers from $$-5$$ to $$256$$ inclusive are pre-allocated once at startup and reused. In the REPL, where each statement is compiled separately:

```text
>>> a = 256
>>> b = 256
>>> a is b
True
>>> a = 257
>>> b = 257
>>> a is b
False
```

Same code, different answer, decided entirely by an implementation detail you were never promised. Inside a single compiled block the compiler also folds duplicate constants, so putting those four lines in a script gives `True` in *both* cases. Neither result is something to rely on. Construct the integers at runtime and the illusion disappears:

```python
print(int("1000") == int("1000"))   # -> True
print(int("1000") is int("1000"))   # -> False
```

Short strings behave the same way — identifier-like literals are interned, arbitrary ones are not. The rule is simple: **use `is` only for `None`, `True`, `False`, and sentinel objects you created yourself.** For everything else, `==`.

<div class="warning-box">
  <strong>The classic trap — <code>if x is 0:</code> or <code>if s is "yes":</code>.</strong> These work on your machine, pass your tests, and then fail on a value that happens to fall outside the small-integer cache or the string-interning rules. CPython 3.8 and later emit a <code>SyntaxWarning: "is" with 'int' literal. Did you mean "=="?</code>, which you should treat as an error. The one comparison where <code>is</code> is not merely acceptable but <em>correct</em> is <code>x is None</code>: <code>None</code> is a singleton, and <code>x == None</code> can be subverted by a class that overrides <code>__eq__</code>.
</div>

## Truthiness

Every object has a truth value, obtained by calling `__bool__` or, failing that, `__len__`. The falsy objects are: `False`, `None`, zero of any numeric type, and every empty container.

```python
print(bool([]), bool({}), bool(""), bool(0.0), bool(None))   # -> False False False False False
print(bool([0]), bool(" "))                                  # -> True True
```

`[0]` is truthy because it has one element, and `" "` is truthy because a space is a character. So write `if xs:` rather than `if len(xs) > 0:`; it is idiomatic and works for any container.

`and` and `or` short-circuit, and — unlike in C — they return **one of the operands**, not a boolean:

```python
print("a" or "b")     # -> a      first truthy operand
print("" or "b")      # -> b
print(1 and 3)        # -> 3      last operand, since 1 is truthy
print(None and 3)     # -> None   stops at the first falsy one
```

`name = user_input or "anonymous"` is a common idiom that follows directly. Be careful when `0` or `""` is a legitimate value, though: `count = supplied or 10` silently replaces a supplied `0` with `10`. Use `if supplied is None` when zero is meaningful.

## Conditionals

```python
def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    else:
        return "F"

print(grade(85))   # -> B
```

Branches are tested in order and the first match wins, so ordering the conditions from most to least restrictive matters. There is also a conditional *expression*, useful where a statement will not fit:

```python
xs = []
label = "empty" if not xs else "non-empty"
print(label)   # -> empty
```

## Loops

`for` iterates over an **iterable** — a list, string, dict, file, generator, anything implementing the [iterator protocol](/blog/python-primer/comprehensions-and-generators/). There is no C-style three-clause `for`.

```python
for ch in "abc":
    print(ch, end=" ")     # -> a b c
```

`range(stop)`, `range(start, stop)` and `range(start, stop, step)` produce arithmetic sequences, with `stop` excluded. `range` is a lazy sequence object, not a list: `range(10**6)` costs a constant amount of memory and still supports `len`, indexing and `in`.

```python
print(list(range(5)))          # -> [0, 1, 2, 3, 4]
print(list(range(2, 10, 3)))   # -> [2, 5, 8]
print(list(range(5, 0, -1)))   # -> [5, 4, 3, 2, 1]
print(len(range(10**6)))       # -> 1000000
```

When you need the index alongside the value, use `enumerate`; to walk two sequences together, `zip`. Writing `for i in range(len(xs))` is almost always a sign that one of those two is what you wanted.

```python
for i, name in enumerate(["ann", "bob"], start=1):
    print(i, name)
# -> 1 ann
# -> 2 bob
```

`while` repeats until its condition goes falsy. Use it when the number of iterations is not known up front — reading until end of input, converging an iteration, retrying a request.

`break` leaves the innermost loop immediately; `continue` skips to the next iteration. Neither affects an enclosing loop, so breaking out of nested loops needs a flag, a `return`, or an exception.

## The `for...else` clause

Both loops accept an `else` block, and it does not mean what the keyword suggests. It runs when the loop finished **without executing `break`**:

```python
def find(xs, target):
    for x in xs:
        if x == target:
            print("found", x)
            break
    else:
        print("not found")

find([1, 2, 3], 2)   # -> found 2
find([1, 2, 3], 9)   # -> not found
```

Read it as "no break". It removes the `found = False` flag that search loops otherwise need. `while...else` works identically, running when the condition becomes false rather than when a `break` fires. The clause is rare enough in real code that a comment is polite, but it appears often in interview questions precisely because so few people know it.

## `match`: structural pattern matching

Python 3.10 added `match` ([PEP 634](https://peps.python.org/pep-0634/)). It is not a switch statement — the cases are *patterns* that destructure the subject, not just constants to compare against.

```python
def http(status):
    match status:
        case 200 | 201:
            return "ok"
        case 404:
            return "not found"
        case int() as code if code >= 500:
            return f"server error {code}"
        case _:
            return "other"

print(http(200), http(404), http(503), http(302))
# -> ok not found server error 503 other
```

`|` is an or-pattern, `case int() as code` matches on type and binds the value, the trailing `if` is a guard, and `_` is the wildcard. Destructuring is where it earns its place:

```python
def where(point):
    match point:
        case (0, 0):
            return "origin"
        case (x, 0):
            return f"on x-axis at {x}"
        case (0, y):
            return f"on y-axis at {y}"
        case (x, y):
            return f"at {x}, {y}"
        case _:
            return "not a point"

print(where((0, 0)), where((3, 0)), where((1, 2)))
# -> origin on x-axis at 3 at 1, 2
```

<div class="insight-box">
  <strong>Key Insight — a bare name in a <code>case</code> always binds, never compares:</strong> <code>case ORIGIN:</code> does not test whether the subject equals a constant named <code>ORIGIN</code>; it matches anything and rebinds <code>ORIGIN</code> to it, shadowing your constant and swallowing every later case. To compare against a named constant you must use a dotted name — <code>case Colours.RED:</code> — or a literal. This is the one rule that makes <code>match</code> behave unlike every switch you have used before.
</div>

<div class="warning-box">
  <strong>The other classic trap — mutating a list while iterating it.</strong> The <code>for</code> loop walks the list by an internal index. Removing an element shifts everything after it down by one, so the loop skips the next item:
  <pre><code>xs = [1, 2, 2, 3, 4]
for x in xs:
    if x % 2 == 0:
        xs.remove(x)
print(xs)   # -> [1, 2, 3]   one 2 survived</code></pre>
  Build a new list instead — <code>[y for y in xs if y % 2]</code> gives the correct <code>[1, 3]</code> — or iterate over a copy with <code>for x in xs[:]</code>. Dictionaries and sets are stricter: changing their size mid-loop raises <code>RuntimeError: dictionary changed size during iteration</code> rather than silently skipping.
</div>

Next: [lists and tuples](/blog/python-primer/lists-and-tuples/), the sequences you will spend most of your Python life iterating over.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li><code>==</code> compares values, <code>is</code> compares identity; reserve <code>is</code> for <code>None</code>, <code>True</code>, <code>False</code> and sentinels. Small-integer caching makes <code>is</code> lie convincingly.</li>
    <li>Comparisons chain: <code>lo &lt;= x &lt;= hi</code> evaluates <code>x</code> once.</li>
    <li>Empty containers, zeros and <code>None</code> are falsy; <code>and</code>/<code>or</code> short-circuit and return an operand rather than a bool.</li>
    <li><code>range</code> is lazy and excludes its stop value; use <code>enumerate</code> and <code>zip</code> instead of <code>range(len(xs))</code>.</li>
    <li><code>for...else</code> runs its <code>else</code> only when no <code>break</code> executed — read it as "no break".</li>
    <li><code>match</code> (3.10+) destructures rather than compares, and a bare name in a case pattern binds instead of matching.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [More Control Flow Tools](https://docs.python.org/3/tutorial/controlflow.html).
2. Python Software Foundation. [Expressions: comparisons and boolean operations](https://docs.python.org/3/reference/expressions.html#comparisons).
3. Python Software Foundation. [Truth Value Testing](https://docs.python.org/3/library/stdtypes.html#truth-value-testing).
4. Bucher, B., van Rossum, G., et al. [PEP 634 — Structural Pattern Matching: Specification](https://peps.python.org/pep-0634/).
5. Kohn, T., van Rossum, G., et al. [PEP 636 — Structural Pattern Matching: Tutorial](https://peps.python.org/pep-0636/).
6. Python Software Foundation. [`match` statement reference](https://docs.python.org/3/reference/compound_stmts.html#the-match-statement).
