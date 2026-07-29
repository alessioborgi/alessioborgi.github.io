---
layout: single
title: "Graphs: Representations, BFS vs DFS, and the Assumption Dijkstra Makes Silently"
date: 2026-10-06
categories: [cs-basics]
book: cs-basics
subsection: algorithms
tags: [graphs, bfs, dfs, dijkstra, union-find]
excerpt: "Dijkstra is greedy: it finalises the closest unvisited vertex and never revisits it. That is valid only because every edge adds weight — put one negative edge in the graph and the algorithm returns a wrong answer without complaining."
author_profile: true
read_time: true
is_overview: false
icon: "🕸️"
read_mins: 7
permalink: /blog/cs-basics/graphs-and-traversal/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Store sparse graphs as adjacency lists (\(\Theta(V+E)\) space); use a matrix only when the graph is dense or you need \(O(1)\) edge tests or linear algebra on it. BFS and DFS are the same algorithm with a queue instead of a stack, both \(\Theta(V+E)\): BFS gives fewest-edge paths and layers, DFS gives cycle detection, topological order and strongly connected components. Dijkstra is \(\Theta((V+E)\log V)\) with a binary heap and is <em>wrong</em> on negative edges. Union-find answers connectivity in near-constant amortised time.
</div>

## Two representations

An **adjacency list** stores, per vertex, the list of its neighbours: $$\Theta(V+E)$$ space, iterating a vertex's neighbours costs $$\Theta(\deg(u))$$, and testing whether a specific edge exists costs $$\Theta(\deg(u))$$. An **adjacency matrix** stores a $$V \times V$$ array: $$\Theta(V^2)$$ space, $$O(1)$$ edge test, but $$\Theta(V)$$ to walk one vertex's neighbours — even if it has two.

| | Adjacency list | Adjacency matrix |
|---|---|---|
| Space | $$\Theta(V+E)$$ | $$\Theta(V^2)$$ |
| Is $$(u,v)$$ an edge? | $$\Theta(\deg u)$$ | $$\Theta(1)$$ |
| Iterate neighbours of $$u$$ | $$\Theta(\deg u)$$ | $$\Theta(V)$$ |
| Full traversal | $$\Theta(V+E)$$ | $$\Theta(V^2)$$ |

Real graphs — social networks, road networks, citation graphs, molecules — are sparse, with $$E = O(V)$$ rather than $$\Theta(V^2)$$, so lists win by a wide margin: a million vertices in a matrix is $$10^{12}$$ entries. The matrix earns its place when the graph is genuinely dense, when the inner loop is repeated edge queries, or when you want to do spectral work on it — eigenvectors of the [graph Laplacian](/blog/gnn/graph-laplacian/), and the message-passing layers built on them in the [graph neural network book](/blog/gnn/overview/), operate on the matrix form (usually sparse-encoded).

## BFS and DFS

Both visit every reachable vertex once and scan every incident edge once, so both are $$\Theta(V+E)$$ with adjacency lists. The only structural difference is the frontier: a [queue gives BFS, a stack gives DFS](/blog/cs-basics/stacks-queues-heaps/).

BFS dequeues vertices in non-decreasing distance from the source, which is exactly why it solves unweighted shortest paths. It also gives connected components, bipartiteness testing, and level-by-level structure.

```python
from collections import deque

def bfs_shortest(adj, src, dst):
    """Fewest-edges path in an unweighted graph. Theta(V + E)."""
    if src == dst:
        return [src]
    prev = {src: None}
    q = deque([src])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if v not in prev:            # mark on ENQUEUE, never on dequeue
                prev[v] = u
                if v == dst:
                    path = [dst]
                    while prev[path[-1]] is not None:
                        path.append(prev[path[-1]])
                    return path[::-1]
                q.append(v)
    return None

adj = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": ["e"], "e": []}
print(bfs_shortest(adj, "a", "e"))   # ['a', 'b', 'd', 'e']
```

Marking a vertex when it is *enqueued* rather than when it is dequeued is not a detail: mark late and a vertex with several discovered predecessors enters the queue several times, and the cost stops being linear.

DFS goes deep first, and its recursion fits anything defined recursively on subgraphs: cycle detection (a back edge to a vertex still on the recursion stack), topological ordering, Tarjan's strongly connected components, articulation points. Its depth is $$\Theta(V)$$ worst case, so in Python a long path exhausts the [call stack](/blog/cs-basics/recursion-and-dp/) — write it iteratively for large graphs.

## Topological sort

A topological order lists the vertices of a directed graph so that every edge points forwards. It exists **if and only if the graph is a DAG**. Kahn's algorithm computes one in $$\Theta(V+E)$$: compute in-degrees, seed a queue with the zero-in-degree vertices, and each time you emit a vertex decrement its successors' in-degrees, enqueueing any that reach zero. If fewer than $$V$$ vertices come out, the remainder contain a cycle — so the algorithm doubles as a cycle detector. This is how build systems order compilation, how spreadsheets order recalculation, and how an autograd engine orders the backward pass over its computation graph.

## Shortest paths

**Unweighted:** BFS, $$\Theta(V+E)$$. Do not reach for Dijkstra here; with unit weights BFS gives the same answer with no priority queue.

**Non-negative weights:** Dijkstra. Keep tentative distances in a [priority queue](/blog/cs-basics/stacks-queues-heaps/); repeatedly extract the closest unfinalised vertex, declare its distance final, and relax its outgoing edges. With a binary heap and lazy deletion this is $$\Theta((V+E)\log V)$$; a Fibonacci heap gives $$O(E + V\log V)$$ in theory but loses on constants in practice.

The correctness argument is one sentence, and it contains the assumption: when $$u$$ is extracted with the smallest tentative distance, no undiscovered route can beat it, *because every remaining edge only adds weight*. Delete that clause and the proof collapses.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="dij-title dij-desc" viewBox="0 0 640 280" style="max-width:640px;width:100%;height:auto">
  <title id="dij-title">A three-vertex graph on which Dijkstra returns the wrong distance</title>
  <desc id="dij-desc">Vertices A, B and C. Directed edges: A to B with weight 2, A to C with weight 3, and C to B with weight negative 2. Dijkstra starting at A sets tentative distances B equal to 2 and C equal to 3, extracts B first because 2 is smaller, and finalises distance to B as 2. The true shortest path is A to C to B costing 3 minus 2, which equals 1. Dijkstra therefore reports 2 where the correct answer is 1.</desc>
  <rect x="1" y="1" width="638" height="278" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="320" y="24" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">one negative edge is enough to break the greedy argument</text>

  <defs>
    <marker id="dijA" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#475569"/></marker>
    <marker id="dijB" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#c2410c"/></marker>
  </defs>

  <line x1="147" y1="196" x2="463" y2="196" stroke="#475569" stroke-width="2" marker-end="url(#dijA)"/>
  <line x1="140" y1="177" x2="272" y2="99" stroke="#475569" stroke-width="2" marker-end="url(#dijA)"/>
  <line x1="352" y1="99" x2="470" y2="177" stroke="#c2410c" stroke-width="2.4" marker-end="url(#dijB)"/>

  <g fill="#ffffff" stroke="#0e7490" stroke-width="2.2">
    <circle cx="120" cy="196" r="24"/><circle cx="490" cy="196" r="24"/><circle cx="312" cy="84" r="24"/>
  </g>
  <g font-size="15" font-weight="700" fill="#334155" text-anchor="middle">
    <text x="120" y="202">A</text><text x="490" y="202">B</text><text x="312" y="90">C</text>
  </g>

  <text x="305" y="188" text-anchor="middle" font-size="11" font-weight="700" fill="#475569">2</text>
  <text x="196" y="126" text-anchor="middle" font-size="11" font-weight="700" fill="#475569">3</text>
  <text x="424" y="122" text-anchor="middle" font-size="11" font-weight="700" fill="#c2410c">−2</text>

  <text x="120" y="240" text-anchor="middle" font-size="9.5" fill="#334155">source</text>
  <text x="490" y="240" text-anchor="middle" font-size="9.5" fill="#c2410c">Dijkstra finalises 2</text>
  <text x="490" y="254" text-anchor="middle" font-size="9.5" fill="#0e7490">true distance is 1</text>
  <text x="320" y="268" text-anchor="middle" font-size="9.5" fill="#475569">B is extracted first (2 &lt; 3) and never reconsidered, so A→C→B = 3 − 2 = 1 is missed</text>
</svg>
<figcaption>Notice that the graph has no negative cycle and no ambiguity — the shortest path is well defined at 1. Dijkstra still fails, because it finalises B before ever looking at C. The error is silent: nothing raises, the answer is simply wrong.</figcaption>
</figure>
</div>

**Negative weights:** Bellman–Ford, $$\Theta(VE)$$, which relaxes all edges $$V-1$$ times and reports a negative cycle if a $$V$$-th pass still improves something.

## Union-find

Disjoint-set union maintains a partition under two operations: `find(x)` returns the representative of $$x$$'s set, `union(a, b)` merges two sets. With **union by size** (hang the smaller tree under the larger) and **path compression** (re-point nodes at the root during `find`), $$m$$ operations on $$n$$ elements cost $$O(m\,\alpha(n))$$ amortised, where $$\alpha$$ is the inverse Ackermann function — below 5 for any $$n$$ that fits in the universe.

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                                   # already together
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True

d = DSU(5)
d.union(0, 1); d.union(3, 4)
print(d.find(0) == d.find(1))   # True
print(d.find(0) == d.find(3))   # False
```

Use it for Kruskal's minimum spanning tree, for streaming connected components, and for near-duplicate clustering — anywhere edges arrive online and you only ever ask "same component?". It cannot un-merge, and it cannot give you a path.

<div class="insight-box">
  <strong>Key Insight — BFS, DFS and Dijkstra are one algorithm with three frontier structures.</strong> Take a frontier of discovered-but-unfinished vertices; repeatedly remove one, finalise it, and add its undiscovered neighbours. Make the frontier a FIFO queue and you get BFS; a LIFO stack and you get DFS; a min-priority queue keyed by tentative distance and you get Dijkstra. That is why Dijkstra on unit weights is BFS with unnecessary overhead — and it locates the exact place the negative-weight assumption enters, namely the claim that removing the minimum means finalising it.
</div>

<div class="warning-box">
  <strong>Interview trap — Dijkstra and negative edges.</strong> It does not just get slow, it returns a wrong answer with no error, as the figure shows. Use Bellman–Ford (\(\Theta(VE)\)), or Johnson's reweighting for all-pairs. Related traps: BFS gives shortest paths only when edges are unweighted (or all equal); the visited set must be updated on enqueue, or the queue fills with duplicates; and a topological order exists only for a DAG — if Kahn's algorithm emits fewer than \(V\) vertices, you have found a cycle, not a bug.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Adjacency list: \(\Theta(V+E)\) space, the default for sparse graphs. Matrix: \(\Theta(V^2)\) space, \(O(1)\) edge tests, needed for spectral methods.</li>
    <li>BFS and DFS are both \(\Theta(V+E)\); BFS gives fewest-edge paths and layers, DFS gives cycles, topological order and SCCs.</li>
    <li>Kahn's topological sort is \(\Theta(V+E)\) and detects cycles by emitting fewer than \(V\) vertices; the order exists only for DAGs.</li>
    <li>Dijkstra is \(\Theta((V+E)\log V)\) with a binary heap and requires non-negative weights; Bellman–Ford handles negatives at \(\Theta(VE)\).</li>
    <li>Union-find with union by size and path compression is \(O(\alpha(n))\) amortised per operation — effectively constant, but merge-only.</li>
  </ul>
</div>

## References

1. Dijkstra, E. W. [A note on two problems in connexion with graphs](https://doi.org/10.1007/BF01386390). *Numerische Mathematik* 1, 269–271, 1959.
2. Kahn, A. B. Topological sorting of large networks. *Communications of the ACM* 5(11), 558–562, 1962.
3. Tarjan, R. E. Efficiency of a good but not linear set union algorithm. *Journal of the ACM* 22(2), 215–225, 1975.
4. Fredman, M. L., & Tarjan, R. E. Fibonacci heaps and their uses in improved network optimization algorithms. *Journal of the ACM* 34(3), 596–615, 1987.
5. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. [*Introduction to Algorithms*, 4th ed.](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) MIT Press, 2022 — part VI on graph algorithms.
6. Sedgewick, R., & Wayne, K. [*Algorithms*, 4th ed.](https://algs4.cs.princeton.edu/40graphs/) — graph chapter with runnable code.
