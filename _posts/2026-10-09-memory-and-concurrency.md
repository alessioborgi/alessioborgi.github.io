---
layout: single
title: "Memory and Concurrency in Python: References, the GIL, and Why Data Loaders Fork"
date: 2026-10-09
categories: [cs-basics]
book: cs-basics
subsection: systems
tags: [memory, gil, threads, processes]
excerpt: "Python names are references, so passing a list to a function hands over the original. Python threads hold one interpreter lock, so two CPU-bound threads take as long as one after the other. Both facts explain bugs you have already had."
author_profile: true
read_time: true
is_overview: false
icon: "🧵"
read_mins: 8
permalink: /blog/cs-basics/memory-and-concurrency/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The stack holds call frames and dies automatically in LIFO order; the heap holds objects with arbitrary lifetimes. In Python every value is a heap object and every name is a reference, so assignment never copies and mutating an argument is visible to the caller. CPython frees by reference counting, with a generational collector for cycles. Threads share memory and the GIL, so CPU-bound Python threads do not run in parallel — I/O-bound ones do fine, because blocking calls release it. Hence PyTorch's <code>DataLoader</code> spawns worker <em>processes</em>.
</div>

## Stack and heap

The **stack** stores one frame per active call: arguments, locals, return address. It grows and shrinks in LIFO order, allocation is one pointer bump, and space is reclaimed the instant a function returns. It is also small — a few megabytes by default — which is why unbounded [recursion](/blog/cs-basics/recursion-and-dp/) crashes rather than swaps. The **heap** stores objects whose lifetime is not tied to a call: anything returned, stored in a container, or shared.

| | Stack | Heap |
|---|---|---|
| Lifetime | until the function returns | until nothing references it |
| Allocation | pointer bump, $$\Theta(1)$$ | allocator work, may fragment |
| Size | small, fixed per thread | large, grows on demand |
| Freed by | the runtime, automatically | refcounting or a GC |

## Everything is a reference

In Python a name is a binding to a heap object; assignment binds a name, it never copies. Passing an argument binds the parameter to the *same* object, so whether the caller sees a change depends on whether the callee **mutates** the object or **rebinds** the name.

```python
def mutate(xs):
    xs.append(4)        # mutates the caller's list

def rebind(xs):
    xs = [9, 9, 9]      # rebinds a local name; caller unaffected

a = [1, 2, 3]
mutate(a); print(a)     # [1, 2, 3, 4]
rebind(a); print(a)     # [1, 2, 3, 4]  -- unchanged

b = a                   # NOT a copy: two names, one object
b.append(5); print(a)   # [1, 2, 3, 4, 5]
print(a is b)           # True   -- same object
c = a[:]                # shallow copy
print(a is c, a == c)   # False True

grid = [[0] * 2] * 3    # three references to ONE inner list
grid[0][0] = 1
print(grid)             # [[1, 0], [1, 0], [1, 0]]
grid = [[0] * 2 for _ in range(3)]   # three distinct lists
```

The `[[0]*2]*3` case is the same defect as a [mutable default argument](/blog/cs-basics/recursion-and-dp/): one object reached through several names. Use `copy.deepcopy` when nesting matters.

## How objects are freed

CPython counts references. Binding a name increments an object's count, rebinding or leaving scope decrements it, and at zero the object is freed immediately — which is why `del` frees a large tensor promptly.

Reference counting cannot free **cycles**: if `a.ref = b` and `b.ref = a`, both counts stay at one after the last external reference disappears. CPython therefore also runs a generational cyclic collector over container objects, collecting young generations more often on the observation that most objects die young; the `gc` module exposes it. Runtimes without refcounting (the JVM, Go) trace only, so destruction there is not prompt.

## Processes and threads

A **process** has its own address space: isolation by default, crashes contained, communication only through pipes, sockets or shared memory, expensive start-up. A **thread** lives inside a process and shares its heap: cheap to create and to communicate with, and every shared mutable object is now a hazard.

In CPython, threads carry an extra constraint. The **global interpreter lock** allows only one thread to execute Python bytecode at a time. A thread releases it when it blocks on I/O, and C extensions may release it around long computations — NumPy, PyTorch and BLAS do. So:

- **I/O-bound work** (HTTP requests, file and socket reads, database calls): threads help, because the lock is free while a thread waits.
- **CPU-bound pure-Python work** (parsing, tokenising, augmentation in Python loops): threads do not help. The work serialises and you pay switching overhead on top.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="gil-title gil-desc" viewBox="0 0 640 300" style="max-width:640px;width:100%;height:auto">
  <title id="gil-title">Schematic: two CPU-bound threads interleave under the GIL, while two processes run at once</title>
  <desc id="gil-desc">Schematic timeline, not measured. Top: two CPU-bound Python threads share one lane because only one may hold the global interpreter lock; the lane alternates between thread A and thread B slices and the work finishes at the far right of the time axis. Bottom: the same work split across two processes occupies two independent lanes running simultaneously, each finishing at the halfway mark of the time axis. The conclusion drawn is that threads serialise CPU-bound Python work while processes do not.</desc>
  <rect x="1" y="1" width="638" height="298" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="320" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">schematic: the same CPU-bound work, two ways</text>

  <text x="20" y="58" font-size="10.5" font-weight="700" fill="#334155">2 threads, 1 GIL</text>
  <g>
    <rect x="150" y="45" width="47" height="26" fill="#0e7490"/><rect x="197" y="45" width="47" height="26" fill="#c2410c"/>
    <rect x="244" y="45" width="47" height="26" fill="#0e7490"/><rect x="291" y="45" width="47" height="26" fill="#c2410c"/>
    <rect x="338" y="45" width="47" height="26" fill="#0e7490"/><rect x="385" y="45" width="47" height="26" fill="#c2410c"/>
    <rect x="432" y="45" width="47" height="26" fill="#0e7490"/><rect x="479" y="45" width="47" height="26" fill="#c2410c"/>
  </g>
  <rect x="150" y="45" width="376" height="26" fill="none" stroke="#334155" stroke-width="1.2"/>
  <text x="150" y="90" font-size="9.5" fill="#475569">alternating slices: only one thread holds the lock at any instant</text>
  <text x="536" y="63" font-size="9.5" fill="#c2410c">done</text>

  <text x="20" y="150" font-size="10.5" font-weight="700" fill="#334155">2 processes</text>
  <rect x="150" y="135" width="188" height="26" fill="#0e7490"/>
  <rect x="150" y="170" width="188" height="26" fill="#c2410c"/>
  <rect x="150" y="135" width="188" height="26" fill="none" stroke="#334155" stroke-width="1.2"/>
  <rect x="150" y="170" width="188" height="26" fill="none" stroke="#334155" stroke-width="1.2"/>
  <text x="348" y="153" font-size="9.5" fill="#0e7490">done</text>
  <text x="348" y="188" font-size="9.5" fill="#c2410c">done</text>
  <text x="150" y="216" font-size="9.5" fill="#475569">separate interpreters, separate locks, genuinely simultaneous</text>

  <line x1="150" y1="245" x2="560" y2="245" stroke="#334155" stroke-width="1.4"/>
  <line x1="338" y1="240" x2="338" y2="250" stroke="#334155" stroke-width="1.4"/>
  <line x1="526" y1="240" x2="526" y2="250" stroke="#334155" stroke-width="1.4"/>
  <text x="338" y="264" text-anchor="middle" font-size="9.5" fill="#334155">half the wall time</text>
  <text x="526" y="264" text-anchor="middle" font-size="9.5" fill="#334155">full wall time</text>
  <text x="355" y="284" text-anchor="middle" font-size="9.5" fill="#0c4a6e">time →   (the cost of the threaded version is the switching, not the parallelism it never had)</text>
</svg>
<figcaption>Notice that the top lane is <em>full</em> — the CPU is busy the whole time — yet it takes twice as long. Threads do not idle here; they simply cannot overlap, so adding them buys context switches and nothing else.</figcaption>
</figure>
</div>

Python 3.13 ships an optional free-threaded build (PEP 703) that removes the GIL, but it is opt-in and extensions must be adapted, so the reasoning above still governs ordinary deployments.
## Races, locks, deadlock

Shared mutable state plus concurrency gives **race conditions**: an outcome that depends on scheduling. `counter += 1` is not atomic — it loads, adds and stores, and a switch between load and store loses an update. The GIL does not protect you: it serialises *bytecodes*, not your logical operations, and CPython switches threads periodically (`sys.setswitchinterval`).

A `Lock` makes a critical section mutually exclusive. Two locks acquired in different orders give **deadlock**, which needs four conditions at once (Coffman): mutual exclusion, hold-and-wait, no pre-emption, circular wait. Break the last with a global lock ordering, or avoid sharing.

## Why data loaders use processes

Loading and augmenting data is CPU-bound Python: decoding JPEGs, tokenising text, building tensors. Under the GIL that would serialise against the training loop, so PyTorch's `DataLoader` with `num_workers > 0` starts worker *processes*, each with its own interpreter and lock, shipping batches back through shared memory rather than copying tensors over a pipe.

The costs are the ones processes always have. Workers start with `fork` (copy-on-write, unsafe alongside threads) or `spawn` (a fresh interpreter that re-imports your module — hence the `if __name__ == "__main__"` guard). Copy-on-write saves less than expected, because touching an object's reference count writes to its page and forces a copy; keep bulk data in arrays or tensors rather than lists of Python objects.

<div class="insight-box">
  <strong>Key Insight — the GIL is a lock on the interpreter, not on your data.</strong> It gets conflated in both directions. It is strong enough that CPU-bound threads cannot run in parallel, so people conclude threads are useless — yet I/O-bound threads scale well, because a blocking read releases it. And it is weak enough that <code>counter += 1</code> can still lose updates, so people conclude their code is thread-safe by default — it is not, because the lock is released between bytecodes. Both mistakes dissolve once you ask what it protects: the interpreter's internal state, and nothing of yours.
</div>

<div class="warning-box">
  <strong>Interview trap — "use threads to speed it up".</strong> For CPU-bound Python that is wrong: use <code>multiprocessing</code> or a library that releases the GIL. Threads (or <code>asyncio</code>) are right for I/O-bound work. Related traps: <code>b = a</code> is not a copy and <code>[[0]*n]*m</code> shares one inner list; <code>counter += 1</code> is not atomic despite the GIL; refcounting alone never frees cycles; and with <code>spawn</code>, module-level code runs again in every worker unless guarded by <code>if __name__ == "__main__"</code>.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Stack: call frames, LIFO, automatic, small. Heap: objects with arbitrary lifetime, freed by reference counting or a collector.</li>
    <li>Python names are references; assignment never copies, so mutating an argument is visible to the caller while rebinding it is not.</li>
    <li>CPython frees at refcount zero and runs a generational cyclic collector for reference cycles.</li>
    <li>Threads share memory and the GIL: good for I/O-bound work, useless for CPU-bound pure Python. Processes have separate interpreters and genuinely parallelise.</li>
    <li>The GIL does not make operations atomic — <code>x += 1</code> still races — and data loaders use worker processes precisely because decoding and augmentation are CPU-bound Python.</li>
  </ul>
</div>

## References

1. Python Software Foundation. [Global Interpreter Lock](https://docs.python.org/3/glossary.html#term-global-interpreter-lock) and [threading](https://docs.python.org/3/library/threading.html).
2. Python Software Foundation. [PEP 703 — Making the Global Interpreter Lock Optional in CPython](https://peps.python.org/pep-0703/).
3. Python Software Foundation. [gc — Garbage Collector interface](https://docs.python.org/3/library/gc.html) and [multiprocessing](https://docs.python.org/3/library/multiprocessing.html) (start methods: fork, spawn, forkserver).
4. PyTorch. [torch.utils.data — DataLoader and multi-process data loading](https://pytorch.org/docs/stable/data.html).
5. Coffman, E. G., Elphick, M., & Shoshani, A. System deadlocks. *ACM Computing Surveys* 3(2), 67–78, 1971.
6. Jones, R., Hosking, A., & Moss, E. *The Garbage Collection Handbook*, 2nd ed. CRC Press, 2023.
