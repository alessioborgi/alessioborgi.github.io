---
layout: single
title: "Trees, Traversals and BSTs: Why Balance Is the Only Thing Standing Between You and a Linked List"
date: 2026-10-05
categories: [cs-basics]
book: cs-basics
subsection: data-structures
tags: [trees, bst, traversals, tries]
excerpt: "A binary search tree gives O(log n) search only if it is balanced, and inserting sorted keys — the most natural thing a caller ever does — makes it a linked list with extra pointers. Here is what each traversal is for, and what AVL and red-black trees actually guarantee."
author_profile: true
read_time: true
is_overview: false
icon: "🌳"
read_mins: 8
permalink: /blog/cs-basics/trees-and-bsts/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Every operation on a binary search tree costs \(\Theta(h)\) for tree height \(h\), and \(h\) ranges from \(\lfloor\log_2 n\rfloor\) to \(n-1\) — so the complexity you quote is a statement about balance, not about BSTs. Inserting keys in sorted order produces the degenerate case. Self-balancing trees (AVL, red-black) enforce \(h = O(\log n)\) as a worst-case guarantee. The four traversals are not interchangeable: in-order sorts a BST, post-order is the one that aggregates from children, level-order is BFS and finds the shallowest match.
</div>

## Heights, and why they are everything

A binary tree is nodes with up to two children. Its **height** $$h$$ is the longest root-to-leaf edge count. With $$n$$ nodes, $$h$$ can be anywhere in

<div class="formula-box">
\[
\lfloor \log_2 n \rfloor \;\le\; h \;\le\; n-1,
\]
</div>

the lower bound because a tree of height $$h$$ holds at most $$2^{h+1}-1$$ nodes, the upper bound achieved by a path. Every search, insert and delete on a search tree walks one root-to-leaf path, so all of them are $$\Theta(h)$$ — and which end of that range you are at is the entire question.

## The four traversals

All four visit every node once, so all are $$\Theta(n)$$ time. The depth-first three use $$\Theta(h)$$ stack space; level-order uses $$\Theta(w)$$ for the maximum level width $$w$$, which is $$\Theta(n)$$ in a balanced tree.

```python
from collections import deque

class Node:
    def __init__(self, key, left=None, right=None):
        self.key, self.left, self.right = key, left, right

def inorder(node, out):     # left, node, right
    if node:
        inorder(node.left, out); out.append(node.key); inorder(node.right, out)

def preorder(node, out):    # node, left, right
    if node:
        out.append(node.key); preorder(node.left, out); preorder(node.right, out)

def postorder(node, out):   # left, right, node
    if node:
        postorder(node.left, out); postorder(node.right, out); out.append(node.key)

def level_order(root):      # BFS, one queue
    out, q = [], deque([root] if root else [])
    while q:
        node = q.popleft()
        out.append(node.key)
        if node.left:  q.append(node.left)
        if node.right: q.append(node.right)
    return out

#        4
#      /   \
#     2     5
#    / \
#   1   3
root = Node(4, Node(2, Node(1), Node(3)), Node(5))

out = []; inorder(root, out);   print(out)   # [1, 2, 3, 4, 5]  -- sorted
out = []; preorder(root, out);  print(out)   # [4, 2, 1, 3, 5]
out = []; postorder(root, out); print(out)   # [1, 3, 2, 5, 4]
print(level_order(root))                     # [4, 2, 5, 1, 3]
```

Each has a job. **Pre-order** emits a parent before its children, so it is the serialisation order — replay it and you rebuild the same shape. **In-order** on a BST yields sorted keys, which is the cheapest correctness check you can run on one. **Post-order** finishes children first, so it is the traversal for anything computed *from* children: subtree sizes, heights, freeing memory, evaluating an expression tree. **Level-order** explores by depth, so it finds the shallowest node satisfying a predicate and gives you per-level output.

## The BST invariant

Every key in a node's left subtree is smaller than the node, every key in its right subtree is larger. The invariant is a contract about the *whole subtree*, not just the immediate children — checking only children is the classic wrong `is_valid_bst`.

The payoff: one comparison at a node discards an entire subtree. If the tree is balanced, that halves the candidates, giving $$\Theta(\log n)$$ search. Insert descends to a leaf and attaches there. Delete is the fiddly one: a node with two children is replaced by its in-order successor (leftmost node of the right subtree), which is then deleted from its old position.

Nothing in the insert rule maintains balance, and that is the problem.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="bst-title bst-desc" viewBox="0 0 640 300" style="max-width:640px;width:100%;height:auto">
  <title id="bst-title">The same five keys as a degenerate BST and as a balanced one</title>
  <desc id="bst-desc">On the left, keys 1 to 5 inserted in ascending order form a right-leaning path: 1 at the root, then 2, 3, 4, 5 each as the right child of the previous, giving height 4 and requiring 5 comparisons to find key 5. On the right, the same keys arranged with 3 at the root, 2 and 4 as its children, and 1 and 5 as leaves, giving height 2 and requiring 3 comparisons to find key 5.</desc>
  <rect x="1" y="1" width="638" height="298" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="165" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#c2410c">inserted 1,2,3,4,5 in order — height 4</text>
  <text x="480" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#0e7490">the same keys, balanced — height 2</text>

  <g stroke="#475569" stroke-width="1.6">
    <line x1="105" y1="62" x2="140" y2="98"/><line x1="155" y1="112" x2="190" y2="148"/>
    <line x1="205" y1="162" x2="240" y2="198"/><line x1="255" y1="212" x2="290" y2="248"/>
  </g>
  <g fill="#ffffff" stroke="#c2410c" stroke-width="2">
    <circle cx="90" cy="50" r="17"/><circle cx="140" cy="110" r="17"/><circle cx="190" cy="160" r="17"/>
    <circle cx="240" cy="210" r="17"/><circle cx="290" cy="260" r="17"/>
  </g>
  <g font-size="13" font-weight="700" fill="#334155" text-anchor="middle">
    <text x="90" y="55">1</text><text x="140" y="115">2</text><text x="190" y="165">3</text>
    <text x="240" y="215">4</text><text x="290" y="265">5</text>
  </g>
  <text x="318" y="240" font-size="9.5" fill="#c2410c">5 comparisons</text>
  <text x="318" y="254" font-size="9.5" fill="#c2410c">to reach key 5</text>

  <line x1="330" y1="40" x2="330" y2="280" stroke="#cbd5e1" stroke-width="1"/>

  <g stroke="#475569" stroke-width="1.6">
    <line x1="468" y1="62" x2="432" y2="98"/><line x1="492" y1="62" x2="528" y2="98"/>
    <line x1="408" y1="122" x2="392" y2="148"/><line x1="552" y1="122" x2="568" y2="148"/>
  </g>
  <g fill="#ffffff" stroke="#0e7490" stroke-width="2">
    <circle cx="480" cy="50" r="17"/><circle cx="420" cy="110" r="17"/><circle cx="540" cy="110" r="17"/>
    <circle cx="380" cy="160" r="17"/><circle cx="580" cy="160" r="17"/>
  </g>
  <g font-size="13" font-weight="700" fill="#334155" text-anchor="middle">
    <text x="480" y="55">3</text><text x="420" y="115">2</text><text x="540" y="115">4</text>
    <text x="380" y="165">1</text><text x="580" y="165">5</text>
  </g>
  <text x="480" y="205" text-anchor="middle" font-size="9.5" fill="#0e7490">3 comparisons to reach key 5</text>
  <text x="480" y="232" text-anchor="middle" font-size="9.5" fill="#334155">in-order gives 1,2,3,4,5 for both trees</text>
</svg>
<figcaption>Notice that both trees satisfy the BST invariant and both produce the same sorted in-order output — the invariant says nothing about shape. Only the right one supports the \(O(\log n)\) claim; the left one is a linked list carrying two pointers per node.</figcaption>
</figure>
</div>

## Self-balancing, stated as guarantees

You do not need the rotation cases in an interview; you need the contracts.

| Structure | Balance condition | Height bound | Search / insert / delete |
|---|---|---|---|
| Plain BST | none | $$n-1$$ worst | $$\Theta(n)$$ worst |
| AVL | subtree heights differ by $$\le 1$$ at every node | $$\approx 1.44 \log_2 n$$ | $$\Theta(\log n)$$ worst |
| Red-black | no root-leaf path more than twice another | $$\le 2\log_2(n+1)$$ | $$\Theta(\log n)$$ worst |
| B-tree (order $$m$$) | all leaves at equal depth | $$O(\log_m n)$$ | $$O(\log n)$$ worst, few disk reads |

Both AVL and red-black restore their invariant with $$O(1)$$ rotations per update, found on the way back up the insertion path. AVL is more strictly balanced, so lookups are marginally shorter; red-black does less restructuring work per update, which is why it backs most standard-library ordered maps (`std::map`, Java's `TreeMap`) and the Linux kernel's schedulers. B-trees widen the node so that one disk or page read covers many keys — the reason every relational database index is one.

Python ships no balanced tree. For ordered data use `bisect` on a sorted list ($$\Theta(\log n)$$ search, $$\Theta(n)$$ insert), or the third-party `sortedcontainers`. Most of the time a `dict` is the right answer, because you did not actually need order.

## Tries

A trie keys on the *path*, not on comparisons: each edge is one character, so a word of length $$m$$ costs $$\Theta(m)$$ to look up regardless of how many words are stored. That is its selling point over a hash table, which also gives $$\Theta(m)$$ to hash the string but cannot answer "all keys with this prefix" — a trie enumerates a prefix's subtree directly. The cost is memory: a node per character per distinct prefix. Autocomplete, IP routing tables and subword tokeniser vocabularies are the usual applications.

<div class="insight-box">
  <strong>Key Insight — the invariant buys the search, balance buys the logarithm.</strong> These are two separate contracts, and conflating them is the standard error. The BST invariant alone guarantees only that one comparison eliminates one subtree; it says nothing about how big that subtree is. \(\log_2 n\) appears only when each step discards roughly half, which is a claim about <em>shape</em>. Self-balancing trees exist purely to make the shape claim true no matter what order the caller inserts in.
</div>

<div class="warning-box">
  <strong>Interview trap — "a BST is \(O(\log n)\)" is false as stated.</strong> It is \(\Theta(h)\), and \(h = \Theta(n)\) for sorted insertions — the single most likely real-world input. Say "\(O(\log n)\) if balanced, \(O(n)\) worst case for a plain BST". Two adjacent traps: validating a BST by comparing each node only with its immediate children accepts invalid trees, because the constraint is on entire subtrees and must be carried down as a range; and deleting a two-child node requires promoting its in-order successor, not just splicing it out.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>All BST operations are \(\Theta(h)\), with \(\lfloor\log_2 n\rfloor \le h \le n-1\); quoting \(O(\log n)\) is a claim about balance.</li>
    <li>Pre-order serialises, in-order sorts a BST, post-order aggregates from children, level-order is BFS and finds the shallowest match. All \(\Theta(n)\) time; DFS uses \(\Theta(h)\) stack.</li>
    <li>AVL keeps height near \(1.44\log_2 n\), red-black within \(2\log_2(n+1)\); both give \(\Theta(\log n)\) worst-case operations with \(O(1)\) rotations per update.</li>
    <li>B-trees flatten the tree so one page read covers many keys — the structure behind database indexes.</li>
    <li>A trie costs \(\Theta(m)\) in key length rather than \(\Theta(\log n)\) in dictionary size, and is the structure that can answer prefix queries.</li>
  </ul>
</div>

## References

1. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. [*Introduction to Algorithms*, 4th ed.](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/) MIT Press, 2022 — ch. 12 (BSTs) and 13 (red-black trees).
2. Adelson-Velsky, G. M., & Landis, E. M. An algorithm for the organization of information. *Doklady Akademii Nauk SSSR* 146, 263–266, 1962 — AVL trees.
3. Guibas, L. J., & Sedgewick, R. A dichromatic framework for balanced trees. *19th Annual Symposium on Foundations of Computer Science (FOCS)*, 8–21, 1978.
4. Bayer, R., & McCreight, E. Organization and maintenance of large ordered indices. *Acta Informatica* 1(3), 173–189, 1972 — B-trees.
5. Fredkin, E. Trie memory. *Communications of the ACM* 3(9), 490–499, 1960.
6. Python Software Foundation. [bisect — Array bisection algorithm](https://docs.python.org/3/library/bisect.html).
7. Jenks, G. [sortedcontainers](https://grantjenks.com/docs/sortedcontainers/) — pure-Python sorted list, dict and set.
