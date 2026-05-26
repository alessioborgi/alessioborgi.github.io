---
layout: single
title: "Path Planning: A*, RRT, and Learned Planners"
date: 2025-09-06
categories: [robotics]
book: robotics
subsection: planning
tags: [path-planning, A-star, RRT, sampling-based, motion-planning]
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
