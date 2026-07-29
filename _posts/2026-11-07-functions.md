---
layout: single
title: "Functions: Arguments, Scope, Closures — and the Default That Remembers"
date: 2026-11-07
categories: [python-primer]
book: python-primer
subsection: functions
tags: [python, functions, closures, scope, type-hints]
excerpt: "A `def` is executed, not declared: it builds a function object once, evaluating the default arguments there and then. Everything odd about mutable defaults and late-binding closures follows from taking that seriously."
author_profile: true
read_time: true
is_overview: false
icon: "🧩"
read_mins: 6
permalink: /blog/python-primer/functions/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> <code>def</code> is a statement that runs, binding a name to a function object and evaluating the defaults <em>once</em>, at definition time — which is why a mutable default is shared across every call. Arguments can be positional, keyword, variadic (<code>*args</code>, <code>**kwargs</code>), positional-only (before <code>/</code>) or keyword-only (after <code>*</code>). Name lookup follows LEGB: local, enclosing, global, built-in. Functions are ordinary objects, so they can be passed, returned, and can capture their enclosing scope — by reference, not by value.
</div>

## Defining and calling

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Ada"))                        # -> Hello, Ada!
print(greet("Ada", "Hi"))                  # -> Hi, Ada!
print(greet(greeting="Hi", name="Bo"))     # -> Hi, Bo!
```

The names in the `def` line are **parameters**; the values supplied at the call site are **arguments**. Keyword arguments may be given in any order, and mixing is allowed as long as positional ones come first.

A function with no `return`, or with a bare `return`, yields `None`:

```python
def noret():
    pass

print(noret())   # -> None
```

## The mutable default argument trap

Defaults are evaluated **once**, when the `def` statement executes — not on each call. For an immutable default such as `"Hello"` that is invisible. For a list it is not:

```python
def bad(item, basket=[]):
    basket.append(item)
    return basket

print(bad("a"))   # -> ['a']
print(bad("b"))   # -> ['a', 'b']     the same list, still there
print(bad("c"))   # -> ['a', 'b', 'c']
```

There is one list, created when the module was imported, and it accumulates forever. You can inspect it directly — `bad.__defaults__` is `(['a', 'b', 'c'],)` after those three calls, since the defaults live on the function object.

The fix is a `None` sentinel and a fresh object inside the body:

```python
def good(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(good("a"))   # -> ['a']
print(good("b"))   # -> ['b']
```

<div class="warning-box">
  <strong>The classic trap — never use a mutable default.</strong> <code>def f(x, acc=[])</code>, <code>def f(x, cache={})</code> and <code>def f(t=datetime.now())</code> are all the same bug: the default object is built once at definition time and shared by every call for the lifetime of the process. It is also worth knowing the deliberate exception — <code>def f(x, _cache={})</code> is an old idiom for a memoisation table, where the sharing is the point. Use <code>functools.lru_cache</code> instead and let the reader off. Linters flag this as B006 (flake8-bugbear); leave that rule on.
</div>

## `*args` and `**kwargs`

A parameter prefixed with `*` collects surplus positional arguments into a **tuple**; one prefixed `**` collects surplus keyword arguments into a **dict**.

```python
def show(*args, **kwargs):
    print(args, kwargs)

show(1, 2, x=3)   # -> (1, 2) {'x': 3}
show()            # -> () {}
```

The same symbols at a *call* site do the reverse — unpacking a sequence into positional arguments and a mapping into keyword arguments:

```python
def f(a, b, c, sep=","):
    return sep.join(map(str, (a, b, c)))

nums = [1, 2, 3]
opts = {"sep": "-"}
print(f(*nums, **opts))   # -> 1-2-3
```

The names `args` and `kwargs` are pure convention; the stars carry the meaning.

## Positional-only `/` and keyword-only `*`

The full parameter grammar is `def f(pos_only, /, standard, *, kw_only)`. Everything before `/` ([PEP 570](https://peps.python.org/pep-0570/), Python 3.8+) can only be passed positionally; everything after a bare `*` can only be passed by keyword.

```python
def div(a, b, /, *, precision=2):
    return round(a / b, precision)

print(div(7, 3))                 # -> 2.33
print(div(7, 3, precision=4))    # -> 2.3333

div(a=7, b=3)
# TypeError: div() got some positional-only arguments passed as keyword arguments: 'a, b'
div(7, 3, 4)
# TypeError: div() takes 2 positional arguments but 3 were given
```

Both markers exist to make an API's contract explicit. `/` frees you to rename `a` and `b` later without breaking callers; `*` forces call sites to spell out flags, so nobody writes `resize(img, True, False)` and leaves the reader guessing.

## Scope: the LEGB rule

A bare name is resolved by searching four scopes in order: **L**ocal (this function), **E**nclosing (any surrounding function), **G**lobal (module level), **B**uilt-in.

```python
x = "global"

def outer():
    x = "enclosing"
    def inner():
        print(x)      # not local -> found in the enclosing scope
    inner()

outer()   # -> enclosing
```

Assignment is what makes a name local, and it does so for the *whole* function body, from the first line. So reading a global and then assigning it in the same function raises `UnboundLocalError`, not a fallback to the global value. Two keywords override this:

```python
x = "global"

def rebind():
    global x          # assignments here hit the module-level name
    x = "changed"

rebind()
print(x)   # -> changed
```

`nonlocal` does the same for the nearest *enclosing function* scope, which is how a closure keeps mutable state:

```python
def counter():
    n = 0
    def inc():
        nonlocal n
        n += 1
        return n
    return inc

c = counter()
print(c(), c(), c())   # -> 1 2 3
```

Note that `global` at module level does nothing useful, and neither keyword creates a variable — they redirect where assignment writes.

## First-class functions, closures and `lambda`

Functions are objects: you can bind them to names, put them in lists, pass them as arguments and return them. Passing one as an argument is what `sorted(key=...)`, `map` and `filter` all rely on.

```python
print(sorted(["bb", "a", "ccc"], key=len))   # -> ['a', 'bb', 'ccc']
print(list(map(lambda x: x * 2, [1, 2])))    # -> [2, 4]
print(list(filter(None, [0, 1, 2, None, 3])))  # -> [1, 2, 3]
```

A **closure** is a function that captures names from an enclosing scope and keeps them alive after that scope has returned:

```python
def make_adder(k):
    return lambda x: x + k

add5 = make_adder(5)
print(add5(3))                            # -> 8
print(add5.__closure__[0].cell_contents)  # -> 5
```

The captured value lives in a *cell* attached to the function object, which is why `add5` still works long after `make_adder` returned.

`lambda` builds a small anonymous function limited to a single expression — no statements, no annotations, no docstring. Use it for a throwaway `key` or callback. [PEP 8](https://peps.python.org/pep-0008/) explicitly discourages `f = lambda x: ...`, because a `def` gives the same thing plus a useful `__name__` in tracebacks.

<div class="insight-box">
  <strong>Key Insight — closures capture the variable, not its value:</strong> the body is not evaluated until the function is called, and the name is looked up <em>then</em>. So a loop that builds functions captures the loop variable itself:
  <pre><code>fs = [lambda: i for i in range(3)]
print([f() for f in fs])   # -> [2, 2, 2]   not [0, 1, 2]</code></pre>
  All three closures share one <code>i</code>, which finished at 2. Force early binding with a default argument, which <em>is</em> evaluated at definition time — the very behaviour that causes the mutable-default bug, used here on purpose:
  <pre><code>gs = [lambda i=i: i for i in range(3)]
print([g() for g in gs])   # -> [0, 1, 2]</code></pre>
  <code>functools.partial(operator.add, i)</code> does the same job more explicitly.
</div>

## Type hints and docstrings

Annotations ([PEP 484](https://peps.python.org/pep-0484/)) record the intended types. Python **does not enforce them** — they are metadata for readers, editors and static checkers such as mypy or pyright:

```python
def area(w: float, h: float = 1.0) -> float:
    return w * h

print(area("ab", 3))          # -> ababab   no error; str * int is legal
print(area.__annotations__)
# -> {'w': <class 'float'>, 'h': <class 'float'>, 'return': <class 'float'>}
```

Useful vocabulary: `list[int]`, `dict[str, int]` and `tuple[int, ...]` for containers (built-in generics since 3.9), `int | None` for optionals (3.10+, previously `Optional[int]`), `Callable[[int], str]` for a function parameter, and `Any` when you genuinely do not know.

A docstring is a string literal as the first statement in the body. It becomes `__doc__` and is what `help()` prints:

```python
def area(w: float, h: float = 1.0) -> float:
    """Return the area of a rectangle.

    Args:
        w: width in metres.
        h: height in metres, defaults to 1.0.

    Returns:
        The area in square metres.
    """
    return w * h

print(area.__doc__.splitlines()[0])   # -> Return the area of a rectangle.
```

[PEP 257](https://peps.python.org/pep-0257/) sets the conventions: a one-line imperative summary, a blank line, then detail. With type hints present, the docstring should explain *meaning* and units rather than repeat the types.

Next: [comprehensions and generators](/blog/python-primer/comprehensions-and-generators/), where functions learn to pause.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li><code>def</code> executes: it builds a function object and evaluates defaults once. Mutable defaults are therefore shared across calls — use a <code>None</code> sentinel.</li>
    <li><code>*args</code> collects positional arguments into a tuple, <code>**kwargs</code> keyword ones into a dict; the same stars unpack at a call site.</li>
    <li><code>/</code> makes preceding parameters positional-only; a bare <code>*</code> makes following ones keyword-only.</li>
    <li>Names resolve L→E→G→B; assigning anywhere in a body makes the name local throughout it, and <code>global</code>/<code>nonlocal</code> redirect that.</li>
    <li>Closures capture variables by reference and resolve them at call time, so loop-built lambdas all see the final value.</li>
    <li>Type hints are unenforced metadata for readers and static checkers; docstrings follow PEP 257 and explain meaning, not types.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [Defining Functions](https://docs.python.org/3/tutorial/controlflow.html#defining-functions).
2. Python Software Foundation. [Function definitions — language reference](https://docs.python.org/3/reference/compound_stmts.html#function-definitions).
3. Python Software Foundation. [Execution model: naming and binding](https://docs.python.org/3/reference/executionmodel.html#naming-and-binding).
4. Hettinger, R., & Storchaka, S. [PEP 570 — Python Positional-Only Parameters](https://peps.python.org/pep-0570/).
5. van Rossum, G., Lehtosalo, J., & Langa, Ł. [PEP 484 — Type Hints](https://peps.python.org/pep-0484/).
6. Goodger, D., & van Rossum, G. [PEP 257 — Docstring Conventions](https://peps.python.org/pep-0257/).
7. Python Software Foundation. [`functools` — higher-order functions](https://docs.python.org/3/library/functools.html).
