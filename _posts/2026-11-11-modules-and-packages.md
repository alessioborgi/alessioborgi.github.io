---
layout: single
title: "Modules, Packages, and How Python Actually Finds Your Code"
date: 2026-11-11
categories: [python-primer]
book: python-primer
subsection: tooling
tags: [modules, packages, imports, virtualenv]
excerpt: "An import is not a textual include — it executes a file once, caches the result, and binds a name. Almost every confusing import error, from circular imports to 'attempted relative import with no known parent package', follows directly from that one sentence."
author_profile: true
read_time: true
is_overview: false
icon: "📦"
read_mins: 7
permalink: /blog/python-primer/modules-and-packages/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A module is a <code>.py</code> file; importing it runs it top to bottom <em>once</em> and stores the result in <code>sys.modules</code>. <code>import x</code> binds the module object, <code>from x import y</code> binds a snapshot of one of its attributes. A package is a directory whose modules are found through it, usually with an <code>__init__.py</code>. Python searches <code>sys.path</code> in order: the script's directory, then <code>PYTHONPATH</code>, then site-packages. Guard executable code with <code>if __name__ == "__main__":</code>, prefer explicit relative imports inside a package and absolute ones across packages, work inside a virtual environment, and declare dependencies in <code>pyproject.toml</code>.
</div>

## A module is a file that runs once

```python
# greet.py
print("greet.py is being executed")
NAME = "world"

def hello():
    return f"hello, {NAME}"
```

```python
import greet    # -> greet.py is being executed
import greet    # (nothing: already in sys.modules)
print(greet.hello())   # -> hello, world
```

The first import compiles the file (caching the bytecode in `__pycache__`), creates a module object, executes the body in that module's namespace, and inserts it into `sys.modules`. Every later import of the same name is a dictionary lookup. That is why module-level code is effectively an initialiser you get exactly once per process — and why putting slow work or side effects at module level is a design decision, not a formatting one.

## What each import form binds

```python
import math                 # binds the name `math`
import numpy as np          # binds `np` only — `numpy` is NOT bound
from math import pi, tau    # binds `pi` and `tau`; math is still fully executed
from math import *          # binds every public name; avoid
import os.path              # binds `os`; reach the submodule as os.path
```

`from x import *` is the one to avoid: it makes the set of names in your file depend on someone else's file, defeats linters, and silently shadows built-ins. The `__all__` list in a module controls what `*` exports, which is really the only reason to define it.

The crucial difference is that `from` binds the *object*, not a live link to the attribute:

```python
from greet import NAME
import greet

greet.NAME = "python"
print(NAME)         # -> world     (still the old string)
print(greet.NAME)   # -> python
print(greet.hello())# -> hello, python
```

`NAME` is a separate binding in your namespace pointing at the original string; rebinding `greet.NAME` does not follow. This is exactly the [names-and-objects](/blog/python-primer/syntax-and-variables/) rule applied to modules, and it is why `import config` then `config.DEBUG` beats `from config import DEBUG` for anything that can change.

## `if __name__ == "__main__":`

Every module has a `__name__`. It equals the module's dotted name when imported and the literal `"__main__"` when the file is the entry point.

```python
# tool.py
def main():
    print("running as a script")

print("__name__ is", __name__)

if __name__ == "__main__":
    main()
```

```console
$ python tool.py
__name__ is __main__
running as a script

$ python -c "import tool"
__name__ is tool
```

Without the guard, importing `tool` for one helper function would run the whole program. With it, the file is both a reusable library and a runnable script.

## Packages and `__init__.py`

A package is a directory Python treats as a module namespace. `__init__.py` is the code that runs when the package itself is imported, and it is where you decide the public surface:

```
src/mypkg/
├── __init__.py
├── core.py
└── cli.py
```

```python
# src/mypkg/__init__.py
"""mypkg: a tiny example package."""
from mypkg.core import add

__all__ = ["add"]
__version__ = "0.1.0"
```

```python
import mypkg
print(mypkg.__version__, mypkg.add(2, 3))   # -> 0.1.0 5
```

Callers now write `mypkg.add` and never need to know that it lives in `core.py`. Since Python 3.3 a directory *without* `__init__.py` still imports, as a **namespace package** — useful for splitting one package across several distributions, and a common accident otherwise, because a typo'd directory name imports successfully and then has nothing in it. Keep the file.

## Absolute versus relative imports

```python
# src/mypkg/cli.py
from .core import add           # relative: resolved against mypkg
# from mypkg.core import add    # absolute: equivalent here, and clearer across packages

def main():
    print(add(2, 3))

if __name__ == "__main__":
    main()
```

Relative imports use leading dots — `.` for the current package, `..` for the parent — and are resolved from `__package__`, never from the filesystem. They keep a package renameable and are the right choice for intra-package references. Implicit relative imports (plain `import core`) were removed in Python 3.

The practical consequence trips up everyone once:

```console
$ python -m mypkg.cli
5

$ python src/mypkg/cli.py
ImportError: attempted relative import with no known parent package
```

Run as a script, the file *is* `__main__` and has no package, so `.core` has nothing to resolve against. Run with `-m`, Python imports the package first and then executes the submodule, so relative imports work. **Use `python -m` for anything inside a package.**

## How `sys.path` decides

`sys.path` is an ordinary list of directories, searched in order:

1. the directory of the script being run (or the current directory for `-c` and `-m`);
2. everything in the `PYTHONPATH` environment variable;
3. the standard library, then the environment's `site-packages`.

```python
import importlib.util
print(importlib.util.find_spec("json").origin)
# -> /.../lib/python3.13/json/__init__.py
```

Because the script's own directory comes *first*, a file called `random.py` or `json.py` in your project shadows the standard library for the whole process, and the resulting error is never the one you would guess. Same for a stray `string.py` in the folder you happened to run from.

<div class="insight-box">
  <strong>Key Insight — <code>sys.modules</code> is the cache, and it caches partial results.</strong> A module is inserted into <code>sys.modules</code> <em>before</em> its body finishes executing, precisely so that a circular reference terminates instead of recursing forever. That is also why circular imports fail with a strange message rather than hanging: the second import finds a real, but half-built, module object.
</div>

## Circular imports and how to break them

```python
# shop/order.py
from shop.customer import Customer
class Order: ...

# shop/customer.py
from shop.order import Order
class Customer: ...
```

```console
$ python -c "import shop.order"
ImportError: cannot import name 'Order' from partially initialized module
'shop.order' (most likely due to a circular import)
```

`shop.order` starts running, immediately imports `shop.customer`, which asks for the name `Order` — which the first module has not defined yet. Three fixes, in order of preference:

1. **Extract the shared piece** into a third module both can import. A cycle is usually a missing abstraction.
2. **Import the module, not the name.** `import shop.order` then `shop.order.Order` at *call* time works, because the attribute lookup happens after both modules are fully loaded.
3. **Defer the import into the function body.** Legitimate, occasionally necessary (notably for type-checking-only imports, which belong under `if TYPE_CHECKING:`), but a smell if it spreads.

## Environments and dependencies

Never install into the system interpreter. One virtual environment per project:

```console
$ python -m venv .venv
$ source .venv/bin/activate      # Windows: .venv\Scripts\activate
$ python -m pip install requests
```

`python -m pip` rather than bare `pip` guarantees you are installing into the interpreter you think you are. Then two different files, for two different jobs:

- **`requirements.txt`** — a flat, usually fully pinned list for *reproducing an environment* (`pip freeze > requirements.txt`, `pip install -r requirements.txt`). Right for applications and deployments.
- **`pyproject.toml`** — the standard project metadata file for *describing a distributable package*: its name, version, and the loose version ranges it is compatible with.

```toml
[project]
name = "mypkg"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = ["requests>=2.31"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"
```

Install your own project in editable mode with `python -m pip install -e .` and imports work from anywhere without any `sys.path` manipulation.

<div class="warning-box">
  <strong>Classic trap — patching <code>sys.path</code> instead of installing the package.</strong> The lines
  <code>sys.path.append("..")</code> or <code>sys.path.insert(0, os.path.dirname(__file__) + "/../src")</code>
  at the top of a script are a symptom, not a solution. They work only when the script is launched from one particular directory, break under <code>pytest</code>, break in CI, and hide the real problem — that the project was never installed. The <code>src/</code> layout plus <code>pip install -e .</code> removes the need entirely, and additionally guarantees your tests import the <em>installed</em> package rather than the source directory that happens to be adjacent.
</div>

A layout that avoids all of the above:

```
myproject/
├── pyproject.toml
├── README.md
├── src/
│   └── mypkg/
│       ├── __init__.py
│       ├── core.py
│       └── cli.py
└── tests/
    └── test_core.py
```

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Import = execute once, cache in <code>sys.modules</code>, bind a name. <code>import x</code> binds the module; <code>from x import y</code> binds a snapshot of <code>y</code>.</li>
    <li><code>__name__</code> is <code>"__main__"</code> only for the entry point — guard scripts with it, and run package code with <code>python -m pkg.module</code>.</li>
    <li><code>__init__.py</code> defines the package's public surface; omitting it silently creates a namespace package.</li>
    <li><code>sys.path</code> starts with the script's own directory, so a local <code>json.py</code> shadows the standard library.</li>
    <li>Break cycles by extracting a shared module or importing the module rather than the name; use a venv, and <code>pip install -e .</code> instead of touching <code>sys.path</code>.</li>
  </ul>
</div>

Next: [errors and exceptions](/blog/python-primer/errors-and-exceptions/) — including how to read the traceback that all of this produces.

## References

1. Python documentation. [Modules — the Python Tutorial, chapter 6](https://docs.python.org/3/tutorial/modules.html).
2. Python documentation. [The import system](https://docs.python.org/3/reference/import.html) — finders, loaders and `sys.modules`.
3. Python Packaging Authority. [Packaging Python Projects](https://packaging.python.org/en/latest/tutorials/packaging-projects/) and [`pyproject.toml` specification](https://packaging.python.org/en/latest/specifications/pyproject-toml/).
4. Smith, E. V. [PEP 420 — Implicit Namespace Packages](https://peps.python.org/pep-0420/), 2012.
5. Cannon, B., Smith, N. J., & Stufft, D. [PEP 518 — Specifying Minimum Build System Requirements](https://peps.python.org/pep-0518/), 2016; and [PEP 621 — Storing project metadata in pyproject.toml](https://peps.python.org/pep-0621/), 2020.
