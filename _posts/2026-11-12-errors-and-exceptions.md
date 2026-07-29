---
layout: single
title: "Errors and Exceptions: EAFP, the Hierarchy, and Reading a Traceback"
date: 2026-11-12
categories: [python-primer]
book: python-primer
subsection: tooling
tags: [exceptions, eafp, tracebacks, assertions]
excerpt: "Exceptions in Python are not exceptional. They are a normal control-flow mechanism that the language leans on so heavily that the idiomatic style is to try the operation and handle the failure, rather than check first — which is faster, shorter, and free of race conditions."
author_profile: true
read_time: true
is_overview: false
icon: "🚨"
read_mins: 7
permalink: /blog/python-primer/errors-and-exceptions/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Exceptions are ordinary control flow — <code>for</code> loops end on <code>StopIteration</code>. Catch the <em>narrowest</em> class that you can actually handle; never write bare <code>except:</code>, because it also swallows <code>KeyboardInterrupt</code> and <code>SystemExit</code>. <code>else</code> holds the code that should run only when nothing was raised, keeping the <code>try</code> block down to the one line that can fail; <code>finally</code> always runs. Re-raise with <code>raise NewError(...) from exc</code> so the original cause survives. Give your package one base exception class. Use <code>assert</code> for internal invariants only — <code>python -O</code> deletes every one of them.
</div>

## Exceptions are normal

Python does not treat raising as expensive or shameful. Iteration ends when the iterator raises `StopIteration`; `dict` lookup failures raise `KeyError`; a generator is shut down with `GeneratorExit`. Exceptions are the mechanism the language itself is built on, so using them in your own code costs nothing conceptual.

The consequence is a distinct style. **LBYL** (look before you leap) checks preconditions; **EAFP** (easier to ask forgiveness than permission) attempts the operation and handles the failure. Python prefers EAFP:

```python
config = {"host": "localhost"}

# LBYL: two lookups, and in a concurrent setting the key can vanish in between
if "timeout" in config:
    timeout = config["timeout"]
else:
    timeout = 30

# EAFP: one lookup, no window between check and use
try:
    timeout = config["timeout"]
except KeyError:
    timeout = 30

# and for this particular case, the built-in already does it
timeout = config.get("timeout", 30)   # -> 30
```

The EAFP version is not merely shorter — it is *correct* in cases the LBYL version is not. `os.path.exists(p)` followed by `open(p)` has a genuine time-of-check-to-time-of-use race; `try: open(p) except FileNotFoundError:` does not. The same argument applies to duck typing: rather than testing `isinstance(x, Iterable)`, call `iter(x)` and catch `TypeError`.

## `try` / `except` / `else` / `finally`

```python
def load_count(path):
    try:
        f = open(path)
    except FileNotFoundError:
        return 0                     # handle the one failure we expect
    else:
        with f:                      # runs only if open() succeeded
            return int(f.read())
    finally:
        print("load_count finished") # runs on every path, including returns
```

`else` exists to keep the `try` block minimal. Everything inside `try` is under suspicion; if you put the parsing there too, a `ValueError` from `int()` would be caught by an over-broad handler you did not intend it for. Move it to `else` and only `open` is guarded.

`finally` runs no matter how the block is left — normal exit, `return`, `break`, or a propagating exception — and it runs *before* the return value is delivered:

```python
def f():
    try:
        return "from try"
    finally:
        print("finally runs before the return completes")

print(f())
# -> finally runs before the return completes
# -> from try
```

That makes `finally` the place for releasing resources, though in practice a `with` statement is the better answer — see [files and context managers](/blog/python-primer/files-and-context-managers/).

## The hierarchy, and why bare `except` is wrong

Every exception class inherits from `BaseException`. Almost all of them inherit from `Exception`; the exceptions to that rule are exactly the ones you must not catch by accident.

```python
print(ZeroDivisionError.__mro__)
# -> (<class 'ZeroDivisionError'>, <class 'ArithmeticError'>,
#     <class 'Exception'>, <class 'BaseException'>, <class 'object'>)
print(KeyboardInterrupt.__mro__)
# -> (<class 'KeyboardInterrupt'>, <class 'BaseException'>, <class 'object'>)
```

`KeyboardInterrupt`, `SystemExit` and `GeneratorExit` deliberately sit outside `Exception` so that "catch all errors" does not mean "catch Ctrl-C and `sys.exit()`". Catching by superclass works — `except ArithmeticError` catches `ZeroDivisionError`, `OverflowError` and `FloatingPointError` — and `except` clauses are tested top to bottom, so the *most specific* handler must come first.

<div class="warning-box">
  <strong>Classic trap — bare <code>except:</code>.</strong> It catches <code>BaseException</code>, which means Ctrl-C, <code>sys.exit()</code>, and every typo in the block:

<pre><code class="language-python">while True:
    try:
        do_work()
    except:          # catches KeyboardInterrupt too
        continue     # the program can now only be killed with SIGKILL
</code></pre>

  It also hides bugs: a <code>NameError</code> or <code>AttributeError</code> from a misspelling is silently retried forever instead of crashing loudly. If you genuinely need a catch-all — a request handler or a worker loop that must survive — write <code>except Exception as exc:</code> <em>and log it</em>, ideally with <code>logging.exception(...)</code> so the traceback is preserved. Silent <code>except Exception: pass</code> is the same trap wearing a suit.
</div>

## Raising, and preserving the cause

`raise` takes an *instance* (or a class, which it will instantiate). A bare `raise` inside an `except` block re-raises the current exception with its original traceback intact — much better than `raise exc`, which truncates it.

Wrapping a low-level error in a domain-level one is standard, and `from` is what keeps the diagnosis:

```python
class ConfigError(Exception):
    pass

def parse_port(text):
    try:
        return int(text)
    except ValueError as exc:
        raise ConfigError(f"bad port: {text!r}") from exc

def load(settings):
    return parse_port(settings["port"])

load({"port": "eighty"})
```

```console
Traceback (most recent call last):
  File "app.py", line 7, in parse_port
    return int(text)
ValueError: invalid literal for int() with base 10: 'eighty'

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "app.py", line 16, in <module>
    load({"port": "eighty"})
    ~~~~^^^^^^^^^^^^^^^^^^^^
  File "app.py", line 13, in load
    return parse_port(settings["port"])
  File "app.py", line 9, in parse_port
    raise ConfigError(f"bad port: {text!r}") from exc
ConfigError: bad port: 'eighty'
```

Both stories are told: what the caller did wrong, and what actually broke. Raising *without* `from` inside an `except` block still chains the exceptions, but reports them as "During handling of the above exception, another exception occurred" — which reads as an accident. Use `from exc` when the wrapping is deliberate and `from None` to suppress a noisy internal cause on purpose.

## Reading a traceback

Read it **bottom-up first, then top-down**. The last line is the exception type and message — the actual failure. The frame directly above it is where it was raised. Working upward, each `File … line … in …` is the caller of the frame below, with the outermost call at the top; "most recent call last" is telling you that the interesting frame is at the bottom. In Python 3.11 and later the `~~~~^^^^` carets under a line pin the failure to the exact sub-expression, which is what finally makes a chained `a[i].b(c)` diagnosable.

The frames you care about are the ones in *your* files. A traceback that is twenty frames of library code with two of yours means the bug is almost certainly in the arguments you passed at your last frame.

## Custom exceptions

Give a package a single base class and derive from it. That way a caller can opt into "everything this library raises" with one handler.

```python
class AppError(Exception):
    """Base class for every error this package raises."""

class ConfigError(AppError):
    def __init__(self, key, value):
        super().__init__(f"invalid value {value!r} for {key!r}")
        self.key = key
        self.value = value

try:
    raise ConfigError("port", "eighty")
except AppError as exc:
    print(type(exc).__name__, "|", exc, "|", exc.key)
# -> ConfigError | invalid value 'eighty' for 'port' | port
```

Carrying the structured fields (`exc.key`) alongside the message lets callers react programmatically instead of parsing English. Inherit from a built-in only when your error genuinely *is* one — a bad argument is a `ValueError`, a missing key is a `KeyError` — and otherwise from `Exception`.

<div class="insight-box">
  <strong>Key Insight — <code>except</code> is a filter on type, not on cause.</strong> <code>except KeyError</code> around a five-line block catches the <code>KeyError</code> you anticipated <em>and</em> any unrelated one raised three calls deeper, converting a real bug into your fallback value. This is why the discipline is narrow blocks first, narrow classes second: shrink the <code>try</code> until it contains only the operation whose failure you are actually modelling, and push the rest into <code>else</code>.
</div>

## Assertions are not validation

`assert cond, msg` is shorthand for "raise `AssertionError(msg)` if `cond` is falsy" — and the compiler removes it entirely under `-O`:

```console
$ python -c "assert False, 'boom'"
AssertionError: boom

$ python -O -c "assert False, 'boom'"
$
```

So an `assert` is a statement about what you believe is *already* true — an internal invariant, a postcondition, a test — never a check on data from users, files, or the network. Validation that can vanish in production is not validation. Use an explicit `raise ValueError(...)` for that.

The related trap is the accidental tuple:

```python
x = -5
assert (x > 0, "x must be positive")   # passes! a non-empty tuple is always truthy
assert x > 0, "x must be positive"     # correct form: raises AssertionError
```

Python 3.12 and later emit `SyntaxWarning: assertion is always true, perhaps remove parentheses?`, but on older interpreters this silently disables the check. Write `assert x > 0, "x must be positive"`.

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>EAFP over LBYL: try the operation and catch the failure — shorter, and free of check-then-use races.</li>
    <li><code>else</code> keeps the <code>try</code> block to the single line that can fail; <code>finally</code> runs on every exit path, before the return value is delivered.</li>
    <li>Bare <code>except:</code> catches <code>KeyboardInterrupt</code> and <code>SystemExit</code> and hides typos. Use <code>except Exception as exc</code> at most, and log it.</li>
    <li><code>raise New(...) from exc</code> preserves the cause; a bare <code>raise</code> re-raises with the original traceback.</li>
    <li>Read tracebacks bottom-up; give each package one base exception class; never use <code>assert</code> for validation, because <code>-O</code> deletes it.</li>
  </ul>
</div>

Next: [files and context managers](/blog/python-primer/files-and-context-managers/), where `finally` gets replaced by something better.

## References

1. Python documentation. [Errors and Exceptions — the Python Tutorial, chapter 8](https://docs.python.org/3/tutorial/errors.html).
2. Python documentation. [Built-in Exceptions](https://docs.python.org/3/library/exceptions.html) — the full hierarchy.
3. Python documentation. [`assert` statement](https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement) and [command line option `-O`](https://docs.python.org/3/using/cmdline.html#cmdoption-O).
4. Yee, K.-P. [PEP 3134 — Exception Chaining and Embedded Tracebacks](https://peps.python.org/pep-3134/), 2005.
5. Galindo, P., Taskaya, B., & Askar, A. [PEP 657 — Include Fine-Grained Error Locations in Tracebacks](https://peps.python.org/pep-0657/), 2021.
