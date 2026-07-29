---
layout: single
title: "Strings and f-strings: Immutability, Formatting, and the Quadratic Loop"
date: 2026-11-06
categories: [python-primer]
book: python-primer
subsection: data-structures
tags: [python, strings, f-strings, unicode, encoding]
excerpt: "Strings cannot be modified, so every method that looks like it edits one actually builds another. That single fact explains the whole `str` API — and why growing a string inside a loop can quietly become quadratic."
author_profile: true
read_time: true
is_overview: false
icon: "✍️"
read_mins: 9
permalink: /blog/python-primer/strings-and-formatting/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A <code>str</code> is an immutable sequence of Unicode code points. Every "modifying" method returns a new string, so <code>s.replace(...)</code> without assigning it does nothing. f-strings (3.6+) are the formatting tool to use: <code>f"{value!r:&gt;10.3f}"</code> packs conversion, alignment and precision into one expression, and <code>f"{x=}"</code> prints the expression alongside its value. Build strings by collecting pieces in a list and calling <code>"".join(parts)</code> — repeated <code>+=</code> is quadratic whenever CPython's in-place optimisation does not apply.
</div>

## An immutable sequence

Strings index, slice and iterate exactly like [lists](/blog/python-primer/lists-and-tuples/) — but nothing can be assigned:

```python
s = "hello"
print(s[0], s[-1], s[1:4], len(s))   # -> h o ell 5

s[0] = "H"
# TypeError: 'str' object does not support item assignment
```

So `s.upper()` returns a new string and leaves `s` alone. Forgetting to bind the result — writing `s.strip()` on a line by itself and wondering why the whitespace survived — is the single most common string bug.

Iterating a string yields one-character strings; there is no separate character type. Concatenation is `+`, repetition is `*`, and membership is a substring test: `"ell" in "hello"` is `True`.

## The methods worth knowing

| Method | Effect | Returns |
|---|---|---|
| `s.split(sep=None, maxsplit=-1)` | split on `sep`; with no argument, split on runs of whitespace and drop empties | `list[str]` |
| `s.splitlines()` | split on line boundaries | `list[str]` |
| `sep.join(iterable)` | concatenate an iterable of strings with `sep` between | `str` |
| `s.strip(chars=None)` | remove leading and trailing whitespace, or any of `chars` | `str` |
| `s.lstrip` / `s.rstrip` | one side only | `str` |
| `s.replace(old, new, count=-1)` | replace occurrences, optionally at most `count` | `str` |
| `s.find(sub)` | index of first occurrence, or `-1` | `int` |
| `s.index(sub)` | same, but raises `ValueError` if absent | `int` |
| `s.startswith(p)` / `s.endswith(p)` | prefix / suffix test; `p` may be a tuple | `bool` |
| `s.count(sub)` | non-overlapping occurrences | `int` |
| `s.upper` / `.lower` / `.title` / `.capitalize` | case conversion | `str` |
| `s.zfill(w)` / `.ljust(w,c)` / `.rjust` / `.center` | pad to width `w` | `str` |
| `s.isdigit` / `.isalpha` / `.isspace` | character-class tests | `bool` |

All are $$O(n)$$ or better, and none mutate — there is nothing to mutate.

```python
line = "  name, age , city  "
print(line.split(","))                            # -> ['  name', ' age ', ' city  ']
print([p.strip() for p in line.strip().split(",")])   # -> ['name', 'age', 'city']
print("a-b-c".split("-", 1))                      # -> ['a', 'b-c']
print("-".join(["a", "b", "c"]))                  # -> a-b-c
```

Two details that catch people. `split()` with no argument is *not* the same as `split(" ")`: the former collapses runs of whitespace and drops empty fields, the latter does neither. And `strip("xy")` removes any leading or trailing character *in the set* `{x, y}` — it is not a prefix removal. For that, Python 3.9 added `removeprefix` and `removesuffix`.

```python
t = "hello world"
print(t.replace("o", "0"))       # -> hell0 w0rld
print(t.replace("o", "0", 1))    # -> hell0 world
print(t.find("world"), t.find("zzz"))   # -> 6 -1
print(t.endswith(("x", "ld")))          # -> True
```

## f-strings

An f-string evaluates the expressions inside its braces at runtime and formats each with the mini-language after the colon. It is faster than `str.format` (the interpolation is compiled in, not parsed at call time) and far easier to read.

```python
name, n, pi = "ada", 7, 3.14159
print(f"{name} has {n} items")   # -> ada has 7 items
```

The `=` suffix ([Python 3.8+](https://docs.python.org/3/whatsnew/3.8.html)) prints the source text of the expression together with its value — a debugging shortcut worth using constantly:

```python
print(f"{n=}, {pi=}")     # -> n=7, pi=3.14159
```

The format spec is `[[fill]align][sign][#][0][width][,][.precision][type]`:

```python
print(f"{pi:.2f}")           # -> 3.14
print(f"|{pi:10.3f}|")       # -> |     3.142|   width 10, numbers right-align
print(f"|{pi:<10.3f}|")      # -> |3.142     |
print(f"{n:03d}")            # -> 007
print(f"{n:+d}")             # -> +7
print(f"{1234567:,}")        # -> 1,234,567
print(f"{0.256:.1%}")        # -> 25.6%
print(f"{1234.5678:e}")      # -> 1.234568e+03
```

Alignment uses `<` left, `>` right, `^` centre, with an optional fill character in front:

```python
print(f"|{name:>10}|")   # -> |       ada|
print(f"|{name:<10}|")   # -> |ada       |
print(f"|{name:^10}|")   # -> |   ada    |
print(f"|{name:*^11}|")  # -> |****ada****|
```

Integers can be rendered in other bases with `b`, `o`, `x`, `X`, and `#` adds the prefix:

```python
print(f"{255:b} {255:o} {255:x} {255:#x}")    # -> 11111111 377 ff 0xff
```

Two more pieces. `!r` applies `repr()` instead of `str()`, which is what you want in log messages because it shows the quotes:

```python
print(f"{'quoted'!r}")    # -> 'quoted'
```

And the spec itself can be computed, by nesting braces:

```python
w = 8
print(f"|{pi:{w}.3f}|")   # -> |   3.142|
```

The older mechanisms still appear in code you will read: `"{} and {}".format(a, b)` with positional or named fields, and the C-style `"%s is %d" % (a, b)`. Both work; neither is a reason to write new code that way.

## Raw strings

A raw string literal, prefixed `r`, turns off backslash escape processing:

```python
print(repr("C:\\path\\n"))   # -> 'C:\\path\\n'
print(repr(r"C:\path\n"))    # -> 'C:\\path\\n'
```

Both lines produce the *same* string — `r` changes how the literal is read, not what type you get. It matters most for regular expressions, where the pattern language has its own backslashes:

```python
import re
print(re.findall(r"\d+", "a1b22"))   # -> ['1', '22']
```

Without the `r`, you would be writing `"\\d+"` and hoping you counted correctly. One restriction: a raw string cannot end in an odd number of backslashes.

## `str` is not `bytes`

A `str` is a sequence of Unicode **code points** — abstract characters. A `bytes` object is a sequence of integers in $$[0, 255]$$. Converting between them requires naming an encoding, and there is no default that is safe to assume:

```python
b = "café".encode("utf-8")
print(b, len(b), len("café"))   # -> b'caf\xc3\xa9' 5 4
print(b.decode("utf-8"))        # -> café
```

Four characters, five bytes: `é` needs two in UTF-8. So `len` on encoded data does not count characters, and slicing bytes can split a character in half.

The two types never mix implicitly:

```python
b + "x"
# TypeError: can't concat str to bytes

"café".encode("ascii")
# UnicodeEncodeError: 'ascii' codec can't encode character '\xe9' in position 3
```

Indexing a `bytes` gives an `int`, not a one-byte `bytes` — `b[0]` is `99`, the code for `c`. The practical rule is to decode at the boundary of your program, work in `str` throughout, and encode again on the way out. Always pass `encoding="utf-8"` explicitly to `open()`, because the default is platform-dependent.

## Why `+=` in a loop is the wrong tool

Since strings are immutable, `s += piece` must in principle allocate a new string of length $$\lvert s\rvert + \lvert p\rvert$$ and copy everything. Do that $$n$$ times and you copy $$1 + 2 + \dots + n = O(n^2)$$ characters.

CPython partly hides this: when the target is a simple local name and the string has exactly **one** reference, it resizes the buffer in place instead. The optimisation is real but fragile — store the string anywhere else, and the quadratic cost comes straight back. Measured on CPython 3.13, appending `"abc"` $$n$$ times while a second name also refers to the result:

| $$n$$ | `+=` with an alias | `"".join(parts)` |
|---|---|---|
| 25,000 | 11.2 ms | 0.060 ms |
| 50,000 | 65.1 ms | 0.126 ms |
| 100,000 | 226.8 ms | 0.243 ms |
| 200,000 | 834.0 ms | 0.503 ms |

Doubling $$n$$ roughly quadruples the left column and doubles the right — quadratic against linear, and a factor of about 1,660 at the bottom row. `join` wins because it walks the iterable once to total the lengths, allocates exactly one buffer, and copies each piece exactly once.

```python
# don't
s = ""
for p in parts:
    s += p

# do
s = "".join(parts)
```

<div class="insight-box">
  <strong>Key Insight — never rely on the optimisation you cannot see:</strong> the in-place resize is a CPython implementation detail with no guarantee behind it. It is defeated by anything that takes a second reference to the string, by appending to a list element or attribute instead of a local, and by other interpreters. Writing <code>"".join(parts)</code> costs nothing extra to type and is linear on every implementation, which is why the standard library and every style guide prefer it.
</div>

<div class="warning-box">
  <strong>The classic trap — string methods return, they do not modify.</strong> <code>s.strip()</code>, <code>s.replace(a, b)</code> and <code>s.upper()</code> all leave <code>s</code> untouched; you must write <code>s = s.strip()</code>. This is the mirror image of the list trap, where <code>xs.sort()</code> modifies in place and returns <code>None</code>. Learn the pair together: <em>mutable containers mutate and return <code>None</code>; immutable ones return a new object and change nothing.</em>
</div>

Next, the [functions](/blog/python-primer/functions/) chapter, where mutability produces its most notorious surprise of all.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li><code>str</code> is an immutable sequence of Unicode code points; every method returns a new string, so bind the result.</li>
    <li><code>split()</code> with no argument collapses whitespace runs; <code>strip(chars)</code> removes a character <em>set</em>, not a prefix — use <code>removeprefix</code> for that.</li>
    <li>f-strings: <code>{expr!r:fill align width,.precision type}</code>, with <code>{x=}</code> for debugging and nested braces for a computed width.</li>
    <li>Raw strings change how a literal is parsed, not its type; use them for regular expressions.</li>
    <li><code>str</code> and <code>bytes</code> never mix implicitly — decode on input, encode on output, and pass <code>encoding="utf-8"</code> explicitly.</li>
    <li>Accumulate pieces in a list and <code>"".join</code> them; repeated <code>+=</code> is quadratic whenever CPython's in-place resize does not apply.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [Text Sequence Type — str](https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str).
2. Python Software Foundation. [Format Specification Mini-Language](https://docs.python.org/3/library/string.html#format-specification-mini-language).
3. Python Software Foundation. [Unicode HOWTO](https://docs.python.org/3/howto/unicode.html).
4. Smith, E. V. [PEP 498 — Literal String Interpolation](https://peps.python.org/pep-0498/).
5. Talin. [PEP 3101 — Advanced String Formatting](https://peps.python.org/pep-3101/).
6. Python Software Foundation. [What's New in Python 3.8 — f-string `=` specifier](https://docs.python.org/3/whatsnew/3.8.html).
7. Python Software Foundation. [`re` — Regular expression operations](https://docs.python.org/3/library/re.html).
