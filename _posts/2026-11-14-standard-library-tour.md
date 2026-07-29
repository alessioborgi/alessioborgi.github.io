---
layout: single
title: "The Standard Library Modules Worth Knowing Before You `pip install`"
date: 2026-11-14
categories: [python-primer]
book: python-primer
subsection: tooling
tags: [collections, itertools, functools, logging, typing]
excerpt: "Python ships with a counter, a queue, a memoiser, a CLI parser, a test framework's smaller cousin, and a JSON-safe date library already installed — most of what people reach for a package to solve is one import away."
author_profile: true
read_time: true
is_overview: false
icon: "🔋"
read_mins: 5
permalink: /blog/python-primer/standard-library-tour/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Before adding a dependency, check whether the standard library already does it. <code>collections</code> gives you a counting dict, a two-ended queue and a dict with defaults built in; <code>itertools</code> and <code>functools</code> give you lazy iteration and memoisation without hand-rolled loops; <code>datetime</code>, <code>re</code>, <code>random</code>, <code>math</code>/<code>statistics</code> cover the everyday cases directly; <code>argparse</code> and <code>logging</code> replace hand-parsed <code>sys.argv</code> and scattered <code>print</code> calls; <code>pytest</code> (a near-universal third-party addition, not stdlib, but assume it) and <code>typing</code> round out the tools that make code checkable before it runs.
</div>

## Counting, queues, and dicts with defaults — `collections`

```python
from collections import Counter, defaultdict, deque

words = "the quick brown fox the lazy dog the fox".split()
counts = Counter(words)
print(counts.most_common(2))   # -> [('the', 3), ('fox', 2)]

groups = defaultdict(list)
for w in words:
    groups[len(w)].append(w)
print(groups[3])   # -> ['the', 'fox', 'the', 'dog', 'the', 'fox']

dq = deque(maxlen=3)          # a bounded ring buffer
for x in range(5):
    dq.append(x)
print(dq)   # -> deque([2, 3, 4], maxlen=3)
```

`Counter` is a `dict` subclass that never raises `KeyError` for a missing key — it returns `0` — and adds `most_common()`. `defaultdict` calls its factory (`list`, `int`, `set`, or any zero-argument callable) the first time a key is missing, which removes the `if key not in d:` boilerplate covered in [dicts and sets](/blog/python-primer/dicts-and-sets/). `deque` is a doubly linked queue with `O(1)` appends and pops from *either* end — a plain `list` is `O(n)` at the front — and `maxlen` turns it into a fixed-size sliding window for free.

## Iterating without writing the loop — `itertools` and `functools`

```python
from itertools import chain, groupby, islice
from functools import lru_cache, partial, reduce

print(list(chain([1, 2], [3, 4])))          # -> [1, 2, 3, 4]
print(list(islice(range(1_000_000), 3)))    # -> [0, 1, 2] — stops early, no full list built

data = sorted([1, 1, 2, 2, 2, 3])
for key, group in groupby(data):
    print(key, list(group))
# -> 1 [1, 1]
# -> 2 [2, 2, 2]
# -> 3 [3]

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(35))   # -> 9227465, instant on the second call, exponential-time recursion made linear

add_tax = partial(lambda price, rate: price * (1 + rate), rate=0.2)
print(add_tax(100))   # -> 120.0

print(reduce(lambda acc, x: acc * x, [1, 2, 3, 4], 1))   # -> 24
```

`itertools` functions return iterators, not lists — `islice` on a million-element range never materialises the million elements, echoing the laziness from [comprehensions and generators](/blog/python-primer/comprehensions-and-generators/). `groupby` only groups *consecutive* runs, so sort first if the groups are not already adjacent. `lru_cache` memoises a pure function's return value by its arguments, turning naive recursive Fibonacci from exponential into linear time by never recomputing a call it has already seen. `partial` fixes some arguments of a callable ahead of time; `reduce` folds a sequence down to one value — useful, but a plain loop or `sum`/`math.prod` is usually more readable for the common cases.

## Dates, text patterns, randomness, and numbers

```python
from datetime import date, datetime, timedelta

today = date(2026, 11, 14)
print(today + timedelta(days=30))   # -> 2026-12-14
print(datetime.now().isoformat())   # -> e.g. 2026-11-14T09:12:03.481920
```

```python
import re

m = re.search(r"(\d{4})-(\d{2})-(\d{2})", "seen on 2026-11-14")
print(m.group(0), m.group(1))   # -> 2026-11-14 2026
print(re.sub(r"\s+", " ", "too   many    spaces"))  # -> too many spaces
```

```python
import random, math, statistics

random.seed(0)
print(random.choice(["a", "b", "c"]))   # -> 'b' (fixed by the seed)
print(math.sqrt(2), math.gcd(48, 18))   # -> 1.4142135623730951 6
print(statistics.mean([1, 2, 3, 4]), statistics.median([1, 2, 3, 4]))  # -> 2.5 2.5
```

Reach for `re` for patterns, not for structured formats — an email address or a URL has enough edge cases that a dedicated parser beats a regex; `re` is right for "does this line start with a timestamp", not "is this a valid email". `random` is not cryptographically secure — use the `secrets` module for tokens or passwords. `statistics` is exact and pure Python, appropriate for small datasets; anything large belongs in NumPy.

## Talking to the system — `os` and `sys`

```python
import os, sys

print(os.environ.get("HOME"))       # -> /Users/you  (or None if unset)
print(sys.argv)                     # -> ['script.py', 'arg1'] when run as `python script.py arg1`
print(sys.version_info[:2])         # -> (3, 13)
sys.exit(1)                         # exits the process with status 1
```

`os` covers the environment and process-level operations that `pathlib` does not (environment variables, process IDs, `os.cpu_count()`); `sys` covers the interpreter itself — arguments, the module search path, and exit codes that shells and CI systems check.

## Parsing arguments and logging properly

```python
import argparse

parser = argparse.ArgumentParser(description="Greet someone")
parser.add_argument("name")
parser.add_argument("--shout", action="store_true")
args = parser.parse_args(["ada", "--shout"])
greeting = f"hello, {args.name}"
print(greeting.upper() if args.shout else greeting)   # -> HELLO, ADA
```

Hand-parsing `sys.argv` with slicing breaks the moment a flag is optional or reordered; `argparse` generates `--help`, type-checks (`type=int`), and reports usage errors with the right exit code — all from a declarative spec.

```python
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)
log.info("starting job")
log.warning("retrying, attempt %d", 2)   # lazy formatting: only built if WARNING is enabled
```

`logging` beats `print` for anything beyond a throwaway script: it has severity levels you can filter by without editing call sites, timestamps and module names for free, and routes to a file or a log aggregator with the same call sites that write to the console today. `print` debugging has to be found and deleted; a `logging.debug` call can just be left there, silent, until the level is turned up.

## Testing and types

```python
# test_math_utils.py
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0
```

`pytest test_math_utils.py` discovers any function named `test_*` with no boilerplate class or registration — a plain `assert` is the whole API, and a failure prints the actual values on both sides of the comparison automatically.

```python
from typing import Optional

def greet(name: str, times: int = 1) -> list[str]:
    return [f"hello, {name}"] * times

def find(items: list[int], target: int) -> Optional[int]:
    return items.index(target) if target in items else None
```

Type hints are not enforced at runtime — `greet(5)` runs without complaint — but a checker like `mypy` or `pyright` catches the mismatch before the code ships, and the annotations double as documentation that cannot silently drift out of date the way a comment can.

<div class="warning-box">
  <strong>Classic trap — reaching for a package before checking the standard library.</strong> A counting dict, a memoised function, and a CLI parser are each one import away, with no dependency to pin, audit, or update. The reverse trap also happens: treating <code>re</code> or hand-rolled datetime maths as sufficient for genuinely hard problems like timezone-aware scheduling or RFC-822 email parsing, where a battle-tested third-party library earns its place. The standard library is the first stop, not the only one.
</div>

<div class="insight-box">
  <strong>Key Insight — most of these modules exist to replace a loop with a name.</strong> <code>Counter</code> replaces a manual <code>for</code> loop plus a <code>defaultdict(int)</code>; <code>groupby</code> replaces a hand-written accumulator; <code>lru_cache</code> replaces a manual memoisation dict; <code>reduce</code> replaces an accumulator loop. None of them compute anything a loop could not — they just name the pattern, which makes the intent visible at the call site instead of buried in five lines of bookkeeping.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li><code>collections</code>: <code>Counter</code> for tallies, <code>defaultdict</code> for grouping, <code>deque</code> for <code>O(1)</code> operations at either end.</li>
    <li><code>itertools</code> and <code>functools</code> replace loops with named, often lazy, patterns — <code>lru_cache</code> alone turns exponential recursion into linear time.</li>
    <li><code>datetime</code>, <code>re</code>, <code>random</code>, <code>math</code>/<code>statistics</code> cover everyday needs; use <code>secrets</code> instead of <code>random</code> for anything security-sensitive.</li>
    <li><code>argparse</code> beats hand-parsing <code>sys.argv</code>; <code>logging</code> beats <code>print</code> because it has levels, timestamps, and routable output.</li>
    <li>Type hints are unchecked at runtime — they only help through an external checker like <code>mypy</code>, but they never silently rot the way a stale comment does.</li>
  </ul>
</div>

Next: [idiomatic and performant Python](/blog/python-primer/idiomatic-and-performant-python/), where these building blocks get put to work at speed.

## References

1. Python documentation. [`collections` — Container datatypes](https://docs.python.org/3/library/collections.html).
2. Python documentation. [`itertools` — Functions creating iterators for efficient looping](https://docs.python.org/3/library/itertools.html) and [`functools` — Higher-order functions](https://docs.python.org/3/library/functools.html).
3. Python documentation. [`datetime`](https://docs.python.org/3/library/datetime.html), [`re`](https://docs.python.org/3/library/re.html), [`random`](https://docs.python.org/3/library/random.html), [`statistics`](https://docs.python.org/3/library/statistics.html).
4. Python documentation. [`argparse` — Parser for command-line options](https://docs.python.org/3/library/argparse.html) and [`logging` — Logging facility for Python](https://docs.python.org/3/library/logging.html).
5. Python documentation. [`typing` — Support for type hints](https://docs.python.org/3/library/typing.html).
6. pytest documentation. [Get Started](https://docs.pytest.org/en/stable/getting-started.html).
7. van Rossum, G., Lehtosalo, J., & Langa, Ł. [PEP 484 — Type Hints](https://peps.python.org/pep-0484/), 2014.
