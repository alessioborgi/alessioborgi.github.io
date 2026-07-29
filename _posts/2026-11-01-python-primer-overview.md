---
layout: single
title: "Python from the Ground Up: What Actually Happens When You Run a Script"
date: 2026-11-01
categories: [python-primer]
book: python-primer
subsection: foundations
tags: [python, cpython, virtualenv, pip]
excerpt: "Python is not interpreted line by line, and `python` is not the language. Knowing what CPython compiles your file into — and where it puts the packages you install — explains most of the confusion beginners hit in their first week."
author_profile: true
read_time: true
is_overview: true
icon: "🐍"
read_mins: 8
permalink: /blog/python-primer/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Python is a language specification; CPython is the program most people mean when they type <code>python</code>. It compiles your source to <em>bytecode</em> — a compact instruction stream cached in <code>__pycache__</code> — and then a loop in C executes those instructions. Two habits make everything downstream easier: run code as a file rather than pasting into the REPL once it exceeds a few lines, and give every project its own virtual environment so <code>pip install</code> can never damage another project.
</div>

## Language, implementation, and the thing on your PATH

"Python" names three different things that beginners routinely conflate. There is the *language*: a grammar and a set of semantics, defined by the reference manual and amended by PEPs (Python Enhancement Proposals). There is an *implementation*: a program that reads that language and does what it says — CPython, but also PyPy (JIT-compiled, much faster on hot loops), MicroPython, and GraalPy. And there is the *executable* on your machine, which is one particular build of one implementation at one version.

```python
import sys
print(sys.implementation.name)   # -> cpython
print(sys.version_info[:3])      # -> (3, 13, 12)
```

Version matters more in Python than in most languages, because the language keeps growing: f-strings arrived in 3.6, ordered dicts became a guarantee in 3.7, the walrus operator in 3.8, dict merging with `|` in 3.9, `match` in 3.10. Code written against 3.12 will often fail on 3.9 with a bare `SyntaxError` and no helpful explanation. Throughout this book I flag anything newer than 3.8.

## It compiles, then it interprets

The common description — "Python is interpreted, C is compiled" — is wrong in a way that matters. CPython *always* compiles. It parses your source into an abstract syntax tree, then compiles that tree into bytecode: a linear sequence of instructions for a stack machine. Only then does a loop written in C step through those instructions.

You can see the result directly with the `dis` module:

```python
import dis

def add(a, b):
    return a + b

dis.dis(add)
```

On CPython 3.13 that prints:

```text
  3           RESUME                   0

  4           LOAD_FAST_LOAD_FAST      1 (a, b)
              BINARY_OP                0 (+)
              RETURN_VALUE
```

Four instructions. `LOAD_FAST_LOAD_FAST` pushes both local variables onto an internal stack, `BINARY_OP` pops them and pushes the sum, `RETURN_VALUE` hands it back. The exact opcodes are an implementation detail and change between versions — this is why bytecode caches are version-tagged.

That caching is the `__pycache__` directory that appears next to any module you import. It holds files like `helpers.cpython-313.pyc`: the compiled bytecode, so the next import can skip parsing. It is safe to delete and it should never go into version control. Note that CPython only caches *imported* modules, not the script you run directly — the top-level script is recompiled every time, which is why import-heavy programs start faster on the second run.

<div class="insight-box">
  <strong>Key Insight — the cost is in the loop, not the compile:</strong> compiling a module happens once. What makes Python slow relative to C is that every single <code>BINARY_OP</code> must inspect the runtime types of both operands, look up the right <code>__add__</code>, and allocate a new object for the result. A C compiler resolves all of that once, at compile time. This is also the reason numerical Python pushes loops down into NumPy: you are not making Python faster, you are running fewer bytecode instructions.
</div>

## Two ways to run code

The **REPL** — read, evaluate, print, loop — starts when you type `python3` with no arguments. It echoes the value of every expression you type, which is why the examples in this book sometimes appear as a transcript:

```text
>>> 2 ** 10
1024
>>> xs = [1, 2, 3]
>>> xs
[1, 2, 3]
```

Note that `xs = [1, 2, 3]` printed nothing. Assignment is a *statement*, and statements have no value to echo. That distinction is worth internalising early; the [next post](/blog/python-primer/syntax-and-variables/) makes it precise.

The REPL is for probing: checking what a method returns, reading a `help()` page, confirming a type. It is a poor place to build anything, because nothing you type is saved. For that, write a file:

```python
# greet.py
def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("world"))
```

Run it with `python3 greet.py`, which prints `Hello, world!`. The `if __name__ == "__main__":` guard is the standard idiom: when a file is executed directly, Python sets its `__name__` to `"__main__"`; when the same file is *imported* by another module, `__name__` becomes `"greet"` instead and the guarded block is skipped. Without the guard, importing `greet` to reuse its function would also run its demo output.

## Virtual environments and pip

`pip install requests` downloads a package from PyPI and drops it into the interpreter's `site-packages` directory. Do that against your system Python and every project on the machine now shares one global pool of libraries — so a project needing `pandas 1.5` and one needing `pandas 2.2` cannot both work, and a bad install can break tooling that ships with the OS.

A **virtual environment** is the fix, and it is much less magical than it sounds: a directory containing a link to a base interpreter plus its own empty `site-packages`. Activating it just puts that directory's `bin` first on your `PATH`.

```bash
python3 -m venv .venv          # create; .venv/ is the conventional name
source .venv/bin/activate      # macOS / Linux
# .venv\Scripts\activate       # Windows PowerShell

python -m pip install --upgrade pip
python -m pip install requests
python -m pip freeze > requirements.txt   # exact versions, for reproducing
deactivate
```

Two conventions worth adopting now. Add `.venv/` and `__pycache__/` to `.gitignore` — you commit the *list* of dependencies, never the installed bytes. And prefer `python -m pip install` over bare `pip install`: it guarantees you are installing into the interpreter you think you are, which bare `pip` does not, because `pip` may be a stale script pointing at a different Python.

<div class="warning-box">
  <strong>The classic trap — <code>pip</code> and <code>python</code> disagreeing.</strong> The single most common beginner failure is <code>pip install X</code> reporting success, followed immediately by <code>ModuleNotFoundError: No module named 'X'</code>. Almost always the two commands resolve to different interpreters. Diagnose it with <code>python -c "import sys; print(sys.executable)"</code> and <code>pip --version</code> (which prints the Python it belongs to); if the paths differ, you have found the bug. Using <code>python -m pip</code> inside an activated virtual environment makes the mismatch impossible.
</div>

## The map of this book

**Foundations.** [Syntax and variables](/blog/python-primer/syntax-and-variables/) — significant whitespace, names as bindings rather than boxes, and the numeric behaviour that surprises people (`//`, `%`, `0.1 + 0.2`). [Operators and control flow](/blog/python-primer/operators-and-control-flow/) — `==` against `is`, truthiness, loops, and the `for...else` clause almost nobody knows.

**Data structures.** [Lists and tuples](/blog/python-primer/lists-and-tuples/) — slicing, every mutating method with its complexity, and unpacking. [Dicts and sets](/blog/python-primer/dicts-and-sets/) — hashing, `defaultdict` and `Counter`, and what makes an object usable as a key. [Strings and formatting](/blog/python-primer/strings-and-formatting/) — f-strings in depth, `str` against `bytes`, and why building a string with `+=` in a loop is quadratic.

**Functions.** [Functions](/blog/python-primer/functions/) — arguments in all their forms, the mutable default trap, LEGB scope, closures and type hints. [Comprehensions and generators](/blog/python-primer/comprehensions-and-generators/) — laziness, `yield`, the iterator protocol, and the memory difference between a list and a generator.

Read them in order if you are learning; jump around if you are revising. Every post is self-contained, every code block is runnable, and every one ends with the trap that catches people.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Python is a language; CPython is the usual implementation; the version on your PATH determines which syntax is legal.</li>
    <li>CPython compiles source to bytecode first, caches it in <code>__pycache__</code> for imported modules, and then executes it in a C loop.</li>
    <li>The REPL echoes expression values but not statements; put anything longer than a few lines in a file and guard the entry point with <code>if __name__ == "__main__":</code>.</li>
    <li>One virtual environment per project, created with <code>python3 -m venv .venv</code>; install with <code>python -m pip</code> so the interpreter and the installer cannot diverge.</li>
    <li>Commit <code>requirements.txt</code>, never <code>.venv/</code> or <code>__pycache__/</code>.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [The Python Language Reference](https://docs.python.org/3/reference/index.html).
2. Python Software Foundation. [`dis` — Disassembler for Python bytecode](https://docs.python.org/3/library/dis.html).
3. Python Software Foundation. [`venv` — Creation of virtual environments](https://docs.python.org/3/library/venv.html).
4. Python Packaging Authority. [Python Packaging User Guide: installing packages](https://packaging.python.org/en/latest/tutorials/installing-packages/).
5. van Rossum, G., Warsaw, B., & Coghlan, N. [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/).
6. Kuchling, A., & Warsaw, B. [PEP 3147 — PYC Repository Directories](https://peps.python.org/pep-3147/).
