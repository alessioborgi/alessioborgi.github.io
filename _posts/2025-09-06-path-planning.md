---
layout: single
title: "Path Planning: A*, RRT, and Learned Planners"
categories: [robotics]
book: robotics
subsection: planning
tags: [path-planning, A-star, RRT, sampling-based, motion-planning]
published: false
excerpt: "A survey of classical and modern path planning algorithms: from A* search and Dijkstra to sampling-based RRT/RRT* and learned planners like MPNet."
author_profile: true
read_time: true
is_overview: false
icon: "🗺️"
read_mins: 5
permalink: /blog/robotics/path-planning/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Path planning finds collision-free routes from a start to a goal configuration. Classical graph-search methods like A* guarantee optimality on discrete graphs; sampling-based planners like RRT and RRT* scale to high-dimensional configuration spaces; and learned planners like MPNet amortise planning cost through neural networks.</div>
{% include figure image_path="/images/blog/robotics/ahn2022_saycan.png" alt="Path planning for robot tasks" caption="Language-guided robot path planning (Ahn et al., 2022)" %}


## The Path Planning Problem

**Intuition first.** Path planning is the robot equivalent of finding your way through a maze. The maze walls are obstacles; the free corridors are C-space free. A* is like exploring the maze with a compass — always trying the passage that points most directly toward the exit. RRT is like randomly throwing a rope into the maze and growing it outward until a strand happens to touch the exit.

<style>
@keyframes frontier-pulse { 0%,100%{opacity:.3;r:5} 50%{opacity:1;r:7} }
@keyframes path-draw { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
.frontier-cell { animation: frontier-pulse 1.2s ease-in-out infinite; }
.astar-path    { stroke-dasharray:300; animation: path-draw 2.5s ease forwards; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:300px;display:block;margin:auto;">
  <!-- Grid 8×7, each cell 32px -->
  <!-- Obstacles (dark) -->
  <rect x="64"  y="32"  width="32" height="32" fill="#374151" rx="2"/>
  <rect x="64"  y="64"  width="32" height="32" fill="#374151" rx="2"/>
  <rect x="64"  y="96"  width="32" height="32" fill="#374151" rx="2"/>
  <rect x="128" y="64"  width="32" height="32" fill="#374151" rx="2"/>
  <rect x="128" y="96"  width="32" height="32" fill="#374151" rx="2"/>
  <rect x="128" y="128" width="32" height="32" fill="#374151" rx="2"/>
  <rect x="192" y="32"  width="32" height="32" fill="#374151" rx="2"/>
  <!-- Explored cells (light blue) -->
  <rect x="32"  y="32"  width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <rect x="32"  y="64"  width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <rect x="32"  y="96"  width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <rect x="32"  y="128" width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <rect x="96"  y="128" width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <rect x="160" y="128" width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <rect x="160" y="96"  width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <rect x="160" y="64"  width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <rect x="160" y="32"  width="32" height="32" fill="#bfdbfe" rx="2" opacity="0.8"/>
  <!-- Frontier cells (pulsing circles) -->
  <circle cx="240" cy="48"  r="5" fill="#f97316" class="frontier-cell"/>
  <circle cx="240" cy="80"  r="5" fill="#f97316" class="frontier-cell" style="animation-delay:.3s"/>
  <circle cx="240" cy="112" r="5" fill="#f97316" class="frontier-cell" style="animation-delay:.6s"/>
  <circle cx="208" cy="144" r="5" fill="#f97316" class="frontier-cell" style="animation-delay:.9s"/>
  <!-- Optimal path (animated draw) -->
  <polyline points="48,144 48,128 48,112 48,96 48,80 48,48 112,48 176,48 208,48 208,80 208,112 208,160 208,176"
            fill="none" stroke="#0d9488" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="astar-path"/>
  <!-- Start -->
  <circle cx="48" cy="160" r="9" fill="#16a34a"/>
  <text x="48" y="164" text-anchor="middle" fill="white" font-size="9" font-weight="bold">S</text>
  <!-- Goal -->
  <circle cx="208" cy="176" r="9" fill="#dc2626"/>
  <text x="208" y="180" text-anchor="middle" fill="white" font-size="9" font-weight="bold">G</text>
  <!-- Grid lines -->
  <g stroke="#e5e7eb" stroke-width="0.5" opacity="0.6">
    <line x1="32" y1="32"  x2="256" y2="32"/>  <line x1="32" y1="64"  x2="256" y2="64"/>
    <line x1="32" y1="96"  x2="256" y2="96"/>  <line x1="32" y1="128" x2="256" y2="128"/>
    <line x1="32" y1="160" x2="256" y2="160"/> <line x1="32" y1="192" x2="256" y2="192"/>
    <line x1="32"  y1="32" x2="32"  y2="192"/> <line x1="64"  y1="32" x2="64"  y2="192"/>
    <line x1="96"  y1="32" x2="96"  y2="192"/> <line x1="128" y1="32" x2="128" y2="192"/>
    <line x1="160" y1="32" x2="160" y2="192"/> <line x1="192" y1="32" x2="192" y2="192"/>
    <line x1="224" y1="32" x2="224" y2="192"/> <line x1="256" y1="32" x2="256" y2="192"/>
  </g>
  <!-- Legend -->
  <rect x="32" y="200" width="10" height="10" fill="#374151" rx="1"/>
  <text x="46" y="209" fill="#374151" font-size="8">obstacle</text>
  <rect x="90" y="200" width="10" height="10" fill="#bfdbfe" rx="1"/>
  <text x="104" y="209" fill="#374151" font-size="8">explored</text>
  <circle cx="163" cy="205" r="4" fill="#f97316"/>
  <text x="172" y="209" fill="#374151" font-size="8">frontier</text>
  <line x1="208" y1="205" x2="220" y2="205" stroke="#0d9488" stroke-width="2"/>
  <text x="224" y="209" fill="#0d9488" font-size="8">path</text>
</svg>
<figcaption>A* on an 8×7 grid. Blue cells are already explored. Orange pulsing dots are the current frontier. The teal path animates from Start (green) to Goal (red), navigating around wall obstacles.</figcaption>
</figure></div>

A robot must navigate from an initial configuration $$q_{\text{start}}$$ to a goal $$q_{\text{goal}}$$ without colliding with obstacles. The space of all valid robot configurations is the **configuration space** (C-space). Obstacles in workspace map to forbidden regions in C-space, and the planner must find a path through the free region $$\mathcal{C}_{\text{free}}$$.

The challenge scales dramatically with dimensionality. A mobile robot in 2D has a 3D C-space (x, y, heading), but a robot arm with 7 joints lives in a 7D C-space, making exhaustive search intractable.

## Dijkstra and A* Graph Search

**Dijkstra's algorithm** explores a weighted graph by always expanding the node with the smallest accumulated cost from the start. It is complete and optimal but explores in all directions equally, making it slow in large graphs.

**A\*** improves on Dijkstra by adding a heuristic $$h(n)$$ that estimates the remaining cost to the goal. The node priority is:

<div class="math-box">
f(n) = g(n) + h(n)
</div>

where $$g(n)$$ is the true cost from start to node $$n$$ and $$h(n)$$ is the heuristic estimate to the goal. When $$h$$ is **admissible** (never overestimates the true remaining cost), A* is guaranteed to find the optimal path. The Euclidean distance to goal is a common admissible heuristic for geometric planning.

A* remains the workhorse of discrete path planning — it underlies navigation stacks in autonomous vehicles and robot operating systems alike. Its limitation is the need to discretise the C-space into a graph, which becomes memory-intensive in high dimensions.

## Sampling-Based Planning: RRT and RRT*

Sampling-based planners avoid explicit graph discretisation by randomly sampling configurations and incrementally building a tree rooted at $$q_{\text{start}}$$.

**Rapidly-exploring Random Trees (RRT)**, introduced by LaValle (1998), works as follows: at each iteration, a random configuration $$q_{\text{rand}}$$ is sampled, the nearest tree node $$q_{\text{near}}$$ is found, and a new node $$q_{\text{new}}$$ is created by stepping from $$q_{\text{near}}$$ toward $$q_{\text{rand}}$$ by a fixed step size $$\delta$$. If the edge is collision-free, it is added to the tree.

<div class="math-box">
q_new = q_near + δ · (q_rand − q_near) / ‖q_rand − q_near‖
</div>

RRT is probabilistically complete — it will eventually find a path if one exists — but paths are rarely optimal and tend to be jagged.

**RRT\*** (Karaman & Frazzoli 2011) adds two key operations: **rewiring** the tree to connect new nodes via lower-cost parents, and **steering** existing nodes through the new node if it reduces their cost. RRT* is asymptotically optimal: as the number of samples grows, the solution converges to the optimal path.

**Probabilistic Roadmaps (PRM)** take a different approach: first build a roadmap by connecting many randomly sampled collision-free configurations into a graph, then query this graph with standard search (e.g., A*). PRM excels in multi-query settings where the same environment is queried repeatedly.

<div class="insight-box"><strong>Key Insight:</strong> RRT explores space rapidly and uniformly, making it ideal for high-DOF robot arms where grid-based methods fail due to the curse of dimensionality. RRT* trades some speed for asymptotic optimality by continuously rewiring the tree.</div>

## Learned Planners: MPNet

Classical planners recompute from scratch for each new query. **MPNet** (Motion Planning Networks, Qureshi et al. 2019) trains a neural network to predict near-optimal paths directly, then uses lazy collision checking to repair invalid segments.

MPNet encodes the obstacle point cloud into a latent representation and conditions a path-generation network on this embedding plus the start and goal. At inference, it runs in milliseconds rather than seconds, with classical replanning used as a fallback for hard cases.

Learned planners shine in scenarios with repetitive structure — manipulation tasks in similar kitchen layouts, for example — where amortising planning cost over many queries is worthwhile.

## Practical Considerations

Choosing a planner depends on the problem structure:

- **A\***: discrete/grid environments, 2D navigation, guaranteed optimality needed.
- **RRT/RRT\***: high-DOF arms, kinodynamic constraints, continuous spaces.
- **PRM**: multi-query planning in a fixed environment.
- **MPNet / learned**: repetitive environments, latency-critical deployment.

Real systems often combine approaches: a high-level planner finds waypoints (A*), a mid-level planner computes smooth joint trajectories (RRT*), and a low-level controller tracks the trajectory (MPC).

## References

- Hart, P. E., Nilsson, N. J., & Raphael, B. (1968). A formal basis for the heuristic determination of minimum cost paths. *IEEE Transactions on Systems Science and Cybernetics*, 4(2), 100–107.
- LaValle, S. M. (1998). Rapidly-exploring random trees: A new tool for path planning. *Technical Report, Iowa State University*.
- LaValle, S. M. (2006). *Planning Algorithms*. Cambridge University Press.
- Karaman, S., & Frazzoli, E. (2011). Sampling-based algorithms for optimal motion planning. *IJRR*, 30(7), 846–894.
- Kavraki, L. E., et al. (1996). Probabilistic roadmaps for path planning in high-dimensional configuration spaces. *IEEE TRO*, 12(4), 566–580.
- Qureshi, A. H., et al. (2019). Motion planning networks. *ICRA 2019*.
