---
layout: single
title: "Files and Context Managers: Why `with` Is Not Optional"
date: 2026-11-13
categories: [python-primer]
book: python-primer
subsection: tooling
tags: [files, pathlib, json, context-managers]
excerpt: "A file object that falls out of scope without with does get closed eventually — but 'eventually' means whenever the garbage collector gets around to it, which is not a promise any program handling more than a handful of files can live with."
author_profile: true
read_time: true
is_overview: false
icon: "📂"
read_mins: 7
permalink: /blog/python-primer/files-and-context-managers/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Always open files with <code>with open(...) as f:</code> — it guarantees the file descriptor is released the instant the block ends, even on an exception, instead of whenever the garbage collector happens to run. Always pass <code>encoding="utf-8"</code> explicitly for text files; the platform default is not guaranteed. Read large files line by line, never with a single <code>read()</code>. Prefer <code>pathlib.Path</code> over <code>os.path</code> string juggling, and reach for <code>json</code> and <code>csv</code> from the standard library before hand-rolling a parser. Writing your own context manager takes one class with <code>__enter__</code>/<code>__exit__</code>, or one generator function wrapped in <code>@contextlib.contextmanager</code>.
</div>

## Opening a file, and the modes that matter

`open()` takes a path and a mode string built from a handful of characters:

| character | meaning |
|---|---|
| `r` | read (default); the file must already exist |
| `w` | write; truncates the file to zero length, or creates it |
| `x` | exclusive create; raises `FileExistsError` if the file is already there |
| `a` | append; writes go to the end, the file is not truncated |
| `b` | binary suffix — `rb`, `wb` — no text decoding |
| `t` | text suffix (the default; rarely written explicitly) |
| `+` | update suffix — `r+`, `w+` — adds the other of read/write |

```python
f = open("notes.txt", "w", encoding="utf-8")
f.write("first line\n")
f.close()   # easy to forget, and never runs if write() raises
```

If `write()` raises partway through, `f.close()` is skipped and the descriptor leaks for the rest of the process. `with` fixes this structurally:

```python
with open("notes.txt", "a", encoding="utf-8") as f:
    f.write("second line\n")
    raise RuntimeError("boom")
# f.close() has already run by the time this line would print
```

`open()` returns an object whose type implements the context manager protocol, so `with` calls `f.close()` on the way out of the block regardless of how it exits — normal completion, `return`, `break`, or an exception propagating through, the same mechanism behind `finally` from [errors and exceptions](/blog/python-primer/errors-and-exceptions/).

<div class="warning-box">
  <strong>Classic trap — "it gets closed anyway".</strong> In CPython, an unreferenced file object is usually collected almost immediately because CPython uses reference counting — so <code>f = open(...); f.write(...)</code> with no <code>close()</code> often <em>appears</em> to work in a short script. Three things break that illusion: a long-running process where the object stays reachable for a while, a loop that opens thousands of files and hits the OS's open-file-descriptor limit first, and PyPy or Jython, which do not use reference counting and can leave a file open indefinitely. Buffered writes not yet flushed are also lost if the process crashes first. There is no version of "don't bother with <code>with</code>" that is actually safe.
</div>

## Text mode, binary mode, and encoding

Text mode decodes bytes to `str` on read and encodes `str` to bytes on write, using a codec. Binary mode moves raw `bytes` with no decoding at all:

```python
with open("photo.jpg", "rb") as f:
    header = f.read(4)
    print(header)   # -> b'\xff\xd8\xff\xe0'  (a JPEG magic number)
```

The codec for text mode is not fixed. Historically it defaulted to `locale.getpreferredencoding(False)`, which is UTF-8 on most Linux and macOS setups but was frequently `cp1252` on Windows — so the same script silently mangled accented characters on one machine and not another. [PEP 686](https://peps.python.org/pep-0686/) makes UTF-8 the default everywhere from Python 3.15 onward, but relying on the version is fragile. Pass `encoding="utf-8"` explicitly, on every platform, in every version:

```python
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()
```

## Reading big files: line by line, not all at once

`f.read()` returns the entire file as one string. For a 200 KB config file that is fine; for a 40 GB log file it means allocating 40 GB before you have looked at a single line. Iterating over the file object instead reads one line at a time, buffered internally, with the process's memory use staying flat regardless of file size:

```python
total = 0
with open("access.log", encoding="utf-8") as f:
    for line in f:          # -> one line per iteration, trailing \n included
        if "ERROR" in line:
            total += 1
print(total)
```

`f.readlines()` should be avoided for the same reason as `read()` — it also materialises the whole file, just split into a list of strings. For binary data too large to fit in memory, `f.read(65536)` in a loop reads fixed-size chunks instead.

<div class="warning-box">
  <strong>Classic trap — <code>read()</code> on a file of unknown size.</strong> <code>data = open(path, encoding="utf-8").read()</code> is a habit carried over from small config files, and it silently stops scaling the day someone points it at a real log or dataset. If a size limit is knowable, pass it to <code>read(size)</code>; if the file is processed sequentially, iterate over lines; if it must be indexed randomly, memory-map it with <code>mmap</code> rather than loading it whole.
</div>

## `pathlib` instead of `os.path`

`pathlib.Path` replaces string-based path manipulation with an object that overloads `/` for joining and exposes the common operations as methods:

```python
from pathlib import Path

data_dir = Path("data") / "raw"
csv_path = data_dir / "sample.csv"

print(csv_path)            # -> data/raw/sample.csv
print(csv_path.suffix)     # -> .csv
print(csv_path.stem)       # -> sample
print(csv_path.parent)     # -> data/raw
print(csv_path.exists())   # -> False (probably, on a fresh checkout)

data_dir.mkdir(parents=True, exist_ok=True)
csv_path.write_text("a,b\n1,2\n", encoding="utf-8")
print(csv_path.read_text(encoding="utf-8"))
# -> a,b
#    1,2

for p in Path(".").glob("*.md"):
    print(p.name)
```

`read_text`/`write_text` open, handle the encoding, do the operation, and close, all in one call, for the common case of a whole small file. The `os.path` equivalents (`os.path.join`, `os.path.splitext`, `os.makedirs`) still work and appear in older code, but they operate on plain strings and leave Windows-versus-POSIX separator differences to you; `Path` handles them.

## JSON and CSV without a third-party library

Both formats are common enough to have direct standard-library support.

```python
import json

record = {"name": "Ada", "langs": ["python", "ml"], "active": True}

with open("record.json", "w", encoding="utf-8") as f:
    json.dump(record, f, indent=2)

with open("record.json", encoding="utf-8") as f:
    loaded = json.load(f)

print(loaded == record)   # -> True
print(json.dumps({"x": 1}, separators=(",", ":")))  # -> {"x":1}
```

`json.dumps`/`json.loads` work on strings already in memory; `json.dump`/`json.load` work directly on an open file. JSON's type system is smaller than Python's: tuples become lists, and dict keys are always strings on the way out, so a dict keyed by integers round-trips with string keys.

```python
import csv

rows = [{"name": "Ada", "score": 98}, {"name": "Grace", "score": 95}]

with open("scores.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerows(rows)

with open("scores.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], row["score"])
# -> Ada 98
# -> Grace 95
```

`newline=""` on the write side is not decoration — the `csv` module handles line endings itself, and without it Windows adds an extra `\r`, producing blank rows on read. `csv.DictReader` yields `dict` per row keyed by the header; plain `csv.reader` yields a `list` per row when there is no header to name the columns.

## Writing your own context manager

Any object implementing `__enter__` and `__exit__` works with `with`. `__enter__` runs first and its return value is what `as` binds; `__exit__` always runs on the way out and receives the exception, if any:

```python
import time

class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.elapsed = time.perf_counter() - self.start
        return False   # False/None: propagate any exception; True: swallow it

with Timer() as t:
    sum(range(1_000_000))
print(f"{t.elapsed:.4f}s")   # -> e.g. 0.0123s
```

`__exit__` receiving `False` is what lets an exception raised inside the block keep propagating — returning `True` there is how a context manager can deliberately suppress one, which is exactly what `contextlib.suppress` does internally.

For a one-off, a class is more machinery than the logic deserves. `contextlib.contextmanager` turns a single generator function into the same protocol — the code before `yield` is `__enter__`, the code after is `__exit__`, and `try`/`finally` around the `yield` makes cleanup run even on an exception:

```python
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"elapsed: {time.perf_counter() - start:.4f}s")

with timer():
    sum(range(1_000_000))
# -> elapsed: 0.0119s
```

Use the class form when the manager needs to expose state through `as` beyond what a single `yield` value covers (like `Timer.elapsed` after the block); use `@contextmanager` for everything else — it is almost always less code.

<div class="insight-box">
  <strong>Key Insight — <code>with</code> is <code>try</code>/<code>finally</code> with the boilerplate removed.</strong> Every <code>with expr as name:</code> desugars to calling <code>expr.__enter__()</code>, binding the result to <code>name</code>, running the block inside a <code>try</code>, and calling <code>expr.__exit__(*sys.exc_info())</code> in a <code>finally</code>. Nothing about file handling is special-cased by the language — <code>open()</code> just happens to return an object that plays the protocol, and any class or generator can do the same for locks, database transactions, temporary directories, or a stopwatch.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <p>The five habits above — <code>with</code> for closing, explicit <code>encoding="utf-8"</code>, line-by-line reads for large files, <code>pathlib</code> over <code>os.path</code>, and a context manager sized to the job — are the difference between code that works on your machine today and code that still works in production next year.</p>
</div>

Next: [standard library tour](/blog/python-primer/standard-library-tour/), the other modules worth knowing before reaching for a third-party package.

## References

1. Python documentation. [Reading and Writing Files — the Python Tutorial, chapter 7](https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files).
2. Python documentation. [`open()` built-in function](https://docs.python.org/3/library/functions.html#open) — the full mode table.
3. Python documentation. [`pathlib` — Object-oriented filesystem paths](https://docs.python.org/3/library/pathlib.html).
4. Python documentation. [`json` — JSON encoder and decoder](https://docs.python.org/3/library/json.html) and [`csv` — CSV File Reading and Writing](https://docs.python.org/3/library/csv.html).
5. Python documentation. [`contextlib` — Utilities for `with`-statement contexts](https://docs.python.org/3/library/contextlib.html) and [the `with` statement, language reference](https://docs.python.org/3/reference/compound_stmts.html#the-with-statement).
6. Warsaw, B., & Adler, J. [PEP 686 — Make UTF-8 mode default](https://peps.python.org/pep-0686/), 2022.
