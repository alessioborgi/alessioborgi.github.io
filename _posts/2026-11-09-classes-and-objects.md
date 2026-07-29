---
layout: single
title: "Classes and Objects: self, Attributes, and When Inheritance Is the Wrong Tool"
date: 2026-11-09
categories: [python-primer]
book: python-primer
subsection: oop
tags: [classes, oop, dataclasses, inheritance]
excerpt: "A Python class is a factory for namespaces, not a sealed blueprint. Once you see where an attribute actually lives — on the instance or on the class — the mutable-default trap, the point of self, and the reason composition usually beats inheritance all fall out of the same rule."
author_profile: true
read_time: true
is_overview: false
icon: "🧱"
read_mins: 6
permalink: /blog/python-primer/classes-and-objects/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A class bundles data and the functions that operate on it. <code>__init__</code> is not a constructor, it is an initialiser that decorates an already-created object. <code>self</code> is explicit because a method <em>is</em> an ordinary function that happens to live in a class namespace. Attribute lookup checks the instance first and then the class, which is why a mutable class attribute silently becomes shared state. Use <code>@property</code> to add behaviour to attribute access without changing the call site, <code>@classmethod</code> for alternative constructors, and <code>@dataclass</code> whenever the class is mostly fields. Reach for composition first; inheritance only when the subclass genuinely <em>is</em> the parent.
</div>

## A class is a factory for namespaces

An object in Python is, at bottom, a dictionary of attributes plus a pointer to its class. The class supplies the shared parts — the methods — and the instance supplies what varies.

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def norm(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

v = Vector(3, 4)
print(v.norm())     # -> 5.0
print(v.__dict__)   # -> {'x': 3, 'y': 4}
```

`Vector(3, 4)` does two things: it calls `Vector.__new__` to allocate a blank object, then calls `__init__` on it to populate the fields. That is why `__init__` returns `None` — the object already exists by the time it runs. You never call `__init__` yourself.

## Why `self` is explicit

`v.norm()` is sugar for `Vector.norm(v)`. Both work, and both are the same call:

```python
print(Vector.norm(v))   # -> 5.0
print(v.norm)           # -> <bound method Vector.norm of <...Vector object at 0x...>>
```

Looking up `v.norm` finds a plain function on the class and wraps it in a *bound method* that remembers `v`. Calling it inserts `v` as the first positional argument. Nothing magical happens; there is no implicit `this` scope. The cost is one extra parameter in every signature, and the benefit is that you can always tell an attribute (`x`) from a local (`x`) by eye — which matters far more than the keystrokes. The name `self` is a convention, not a keyword, but breaking it will make every reader distrust your code.

## Instance attributes versus class attributes

Attribute lookup on an instance checks `instance.__dict__` first, then the class, then its bases. Assignment through `self`, by contrast, *always* writes to the instance.

```python
class Counter:
    count = 0                # one object, shared by the class

    def bump(self):
        self.count += 1      # read from class, write to instance

a, b = Counter(), Counter()
a.bump()
print(a.count, b.count, Counter.count)   # -> 1 0 0
print(a.__dict__)                        # -> {'count': 1}
```

The first `a.bump()` reads `Counter.count` (0), adds one, and *creates* `a.count = 1`, shadowing the class attribute. `b` never touched it, so `b.count` still resolves upward to the class. Class attributes are therefore fine for genuine constants and defaults, and a trap the moment they are mutable.

<div class="warning-box">
  <strong>Classic trap — a mutable class attribute is shared by every instance.</strong> Rebinding (<code>self.count += 1</code>) writes to the instance, but <em>mutating</em> (<code>self.items.append(...)</code>) does not: it reaches the one shared object through the class and modifies it in place. Every instance, past and future, sees the change.

<pre><code class="language-python">class Basket:
    items = []                  # WRONG: one list for the whole class

    def add(self, thing):
        self.items.append(thing)

a, b = Basket(), Basket()
a.add("apple")
print(b.items)              # -> ['apple']
print(a.items is b.items)   # -> True
</code></pre>

  The fix is to create the mutable object per instance, in <code>__init__</code>: <code>self.items = []</code>. This is the same aliasing rule that makes <a href="/blog/python-primer/functions/">mutable default arguments</a> dangerous, wearing a different hat.
</div>

## The three method decorators

An ordinary method takes the instance. The three decorators change what the first argument is, or remove it.

```python
class Temperature:
    def __init__(self, kelvin):
        self._kelvin = kelvin

    @property
    def celsius(self):                 # computed, but accessed like a field
        return self._kelvin - 273.15

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("below absolute zero")
        self._kelvin = value + 273.15

    @classmethod
    def from_celsius(cls, c):          # alternative constructor
        return cls(c + 273.15)

    @staticmethod
    def is_physical(kelvin):           # namespaced helper, no instance needed
        return kelvin >= 0

t = Temperature.from_celsius(25)
print(t._kelvin, t.celsius)          # -> 298.15 25.0
t.celsius = 100
print(t._kelvin)                     # -> 373.15
print(Temperature.is_physical(-5))   # -> False
```

`@property` is the reason Python has no culture of writing `get_x()`/`set_x()`: start with a public attribute, and if you later need validation or a computed value, convert it to a property and *no caller changes*. `@classmethod` receives the class rather than the instance, so `cls(...)` still does the right thing in a subclass — that is what makes it the correct way to write `from_json`, `from_csv`, `zeros`, and friends. `@staticmethod` receives nothing and is simply a function you have chosen to file under a class.

## Inheritance, `super()`, and the MRO

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def describe(self):
        return f"{self.name} says {self.speak()}"

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)     # run the parent's initialiser first
        self.breed = breed

    def speak(self):
        return "woof"

d = Dog("Rex", "collie")
print(d.describe())            # -> Rex says woof
print(isinstance(d, Animal))   # -> True
```

`describe` is defined on `Animal` but calls `self.speak()`, which resolves to `Dog.speak` — that dispatch is the whole point of inheritance. `super()` does *not* mean "my parent"; it means "the next class after me in the method resolution order", which is why it composes correctly under multiple inheritance.

The **MRO** is the fixed, linear order in which Python searches classes for an attribute. It is computed once per class by the C3 algorithm, and you can simply read it:

```python
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass

print([cls.__name__ for cls in D.__mro__])
# -> ['D', 'B', 'C', 'A', 'object']
```

Note that `A` comes after *both* `B` and `C`: a class always appears before its bases, and left-to-right order is preserved. If no such consistent order exists, the `class` statement itself raises `TypeError` at definition time.

<div class="insight-box">
  <strong>Key Insight — inheritance is coupling, not reuse:</strong> a subclass depends on which methods its parent calls internally, so a harmless-looking refactor of the parent can break it silently. Reserve inheritance for genuine <em>is-a</em> substitutability (a <code>Dog</code> can be used anywhere an <code>Animal</code> is expected) and use composition — holding an object and delegating to it — for everything else.
</div>

```python
class Engine:
    def start(self):
        return "vroom"

class Car:                       # a Car HAS an engine; it is not an engine
    def __init__(self, engine):
        self.engine = engine

    def start(self):
        return self.engine.start()

print(Car(Engine()).start())     # -> vroom
```

Composition also makes testing trivial: pass a fake `Engine` and nothing else changes.

## `dataclasses` for classes that are mostly data

Writing `__init__`, `__repr__` and `__eq__` by hand for a record type is pure noise. `@dataclass` generates them from annotations.

```python
from dataclasses import dataclass, field

@dataclass(frozen=True)
class Point:
    x: float
    y: float
    label: str = ""

p = Point(1.0, 2.0)
print(p)                       # -> Point(x=1.0, y=2.0, label='')
print(p == Point(1.0, 2.0))    # -> True
print(hash(p) == hash(Point(1.0, 2.0)))   # -> True
```

`frozen=True` makes instances immutable and hashable, so they can go in a `set` or serve as `dict` keys — see [dicts and sets](/blog/python-primer/dicts-and-sets/) for why hashability requires immutability. The class also refuses to repeat the shared-mutable mistake:

```python
@dataclass
class Cart:
    items: list = field(default_factory=list)   # a fresh list per instance
```

Writing `items: list = []` instead raises `ValueError` at class-definition time — the dataclass machinery checks for exactly the trap above. Annotations are not enforced at runtime; they document intent and feed [type checkers](/blog/python-primer/standard-library-tour/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li><code>__init__</code> initialises an object that <code>__new__</code> already created; <code>self</code> is explicit because <code>v.m()</code> is literally <code>C.m(v)</code>.</li>
    <li>Lookup goes instance → class → bases, but assignment through <code>self</code> always writes to the instance. Mutable class attributes are shared; create them in <code>__init__</code>.</li>
    <li><code>@property</code> lets a plain attribute grow behaviour without breaking callers; <code>@classmethod</code> gives subclass-correct alternative constructors; <code>@staticmethod</code> is just a namespaced function.</li>
    <li><code>super()</code> follows the MRO, not the parent; read the order with <code>Cls.__mro__</code>.</li>
    <li>Prefer composition; use <code>@dataclass</code> (with <code>field(default_factory=...)</code>) for record types.</li>
  </ul>
</div>

Next: [dunder methods](/blog/python-primer/dunder-methods/), the protocols that let your classes behave like built-in types.

## References

1. Python documentation. [Classes — the Python Tutorial, chapter 9](https://docs.python.org/3/tutorial/classes.html).
2. Python documentation. [`dataclasses` — Data Classes](https://docs.python.org/3/library/dataclasses.html).
3. Simionato, M. [The Python 2.3 Method Resolution Order](https://docs.python.org/3/howto/mro.html) — the C3 linearisation, still the algorithm in use.
4. Smith, E. V. [PEP 557 — Data Classes](https://peps.python.org/pep-0557/), 2017.
5. Python documentation. [Built-in functions: `super()`](https://docs.python.org/3/library/functions.html#super) and [`property()`](https://docs.python.org/3/library/functions.html#property).
