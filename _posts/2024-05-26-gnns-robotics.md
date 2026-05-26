---
layout: single
title: "GNNs for Robotics: Planning, Manipulation, and Multi-Agent Systems"
categories: [gnn]
book: gnn
subsection: applications
tags: [robotics, planning, manipulation, multi-agent, simulation]
published: false
excerpt: "Robots interact with structured environments: objects have relationships, joints form kinematic chains, agents communicate through interaction graphs. GNNs encode these relational structures — enabling generalisation across object configurations, robot morphologies, and multi-agent scenarios."
author_profile: true
read_time: true
is_overview: false
icon: "🤖"
read_mins: 4
permalink: /blog/gnn/gnns-robotics/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Robotics problems are inherently relational: robot links form kinematic graphs, objects on a table have spatial proximity graphs, multiple robots form communication graphs. GNNs that process these graphs generalise across different numbers of objects, different robot morphologies, and different team sizes — enabling compositionality that flat neural networks cannot achieve.
</div>
{% include figure image_path="/images/blog/gnn/satorras2021_egnn.png" alt="Equivariant GNN for robotics" caption="Equivariant GNNs for 3D robot perception and manipulation (Satorras et al., 2021)" %}


## Why Graphs in Robotics

**Problem 1: Variable structure**
A robot arm picking up objects faces different numbers of objects each time. A flat neural network with fixed input size cannot handle this. A GNN operates on graphs of any size.

**Problem 2: Relational reasoning**
"Object A is above object B, which is supported by the table" — planning a stack requires reasoning about these relations. GNNs capture relational structure explicitly.

**Problem 3: Generalisation**
A policy trained on a 4-link robot should generalise to a 6-link robot. A GNN treating robot links as nodes generalises to different numbers of links — the same message passing applies regardless of graph size.

## Application 1: Robot Morphology (NerveNet)

**NerveNet (Wang et al., 2018):** model a robot's body as a graph where:
- Nodes = actuators/joints
- Edges = kinematic connections (joint → joint)
- Node features = joint state (angle, velocity)

GNN propagates information along the kinematic chain. The policy maps joint-level graph → actions. Crucially, the same GNN policy works for robots with different numbers of joints — tested on 2-link, 4-link, and 6-link robots from the same policy.

**Advantage:** policy generalises to robot variants not seen during training — e.g., train on 4 legs, test on 3 legs or 5 legs.

## Application 2: Object Manipulation

**Task-and-motion planning:** plan a sequence of robot actions to achieve a goal (e.g., build a tower from blocks).

**Scene graph GNN:** represent the scene as a graph:
- Nodes = objects (position, shape, type)
- Edges = spatial relations (on-top-of, adjacent-to, in-front-of)

GNN encodes the current state; planning algorithm searches over sequences of actions and predicted resulting states. The GNN's relational encoding enables compositional generalisation — solving 5-block towers after training on 3-block towers.

<div class="insight-box">
<strong>Compositional generalisation:</strong> A flat neural network trained on {A on B, B on C} learns specific patterns. A GNN trained on the same data learns general "on-top-of" propagation — it can immediately reason about {A on B, B on C, C on D} without additional training. This is the key advantage of relational inductive biases in robotics planning.
</div>

## Application 3: Multi-Robot Coordination

**Decentralised multi-robot planning:** N robots must coordinate without a central controller. Each robot observes local state and communicates with nearby robots.

**CommNet / GMMN:** model inter-robot communication as a GNN. At each step:
1. Each robot sends a message to nearby robots (edge to edge in proximity graph)
2. Each robot aggregates received messages
3. Each robot decides its action based on own state + aggregated messages

The GNN is the communication protocol. Training via multi-agent RL.

**Key results:**
- GNN-based communication outperforms no-communication baselines by 40%+ on cooperative navigation tasks
- Scales from N=5 to N=20 robots without retraining (variable graph size)

## Application 4: Physics Simulation and Model-Based RL

**Interaction networks (Battaglia et al., 2016):** model physical systems as graphs. Nodes = objects, edges = interactions. GNN predicts next state from current state.

Applications:
- Cloth simulation: nodes = vertices, edges = cloth edges
- Rigid body dynamics: nodes = objects, edges = contact constraints
- Particle systems: nodes = particles, edges = proximity

**Model-based RL with GNN dynamics model:** learn the physical model as a GNN, use it for planning (model-predictive control or model-based policy search). GNNs generalise to unseen object configurations because the dynamics are object-agnostic.

## Application 5: Point Cloud Processing for Perception

Lidar sensors produce 3D point clouds — unordered sets of 3D points. GNNs can process point clouds by constructing a graph (k-nearest neighbours) and running message passing:

**DGCNN (Wang et al., 2019):** dynamic graph CNN — rebuild the k-NN graph after each layer (in feature space, not just spatial). Achieves SOTA on ModelNet40 (3D object classification) and ShapeNet (part segmentation).

**Equivariant GNNs for point clouds (EGNN):** maintain SE(3) equivariance — rotation-equivariant detection, regardless of LiDAR orientation.

## Summary

| Application | Graph structure | Key challenge solved |
|-------------|----------------|---------------------|
| Robot morphology | Kinematic graph | Generalise to new robot designs |
| Object manipulation | Scene graph | Compositional planning |
| Multi-robot | Proximity/communication graph | Scalable coordination |
| Physics simulation | Particle/object interaction graph | Generalise to new configurations |
| Point cloud perception | k-NN graph | Unordered 3D data |

Robotics is one of the most natural application domains for GNNs — physical and relational structure is explicit and actionable. The field is rapidly adopting GNN-based representations for perception, dynamics modelling, planning, and multi-agent control.

## References

- Wang, T., Liao, R., Ba, J., & Fidler, S. (2018). [NerveNet: Learning Structured Policy with Graph Neural Networks](https://openreview.net/forum?id=S1sqHMZCb). *ICLR 2018* (NerveNet: kinematic graph GNNs for robot locomotion policies that generalise across morphologies).
- Battaglia, P., Pascanu, R., Lai, M., Rezende, D. J., & Kavukcuoglu, K. (2016). [Interaction Networks for Learning about Objects, Relations and Physics](https://arxiv.org/abs/1612.00222). *NeurIPS 2016* (Interaction Networks: object-relation graphs for physics simulation — foundational for GNN robotics applications).
- Tolstaya, E., Gama, F., Paulos, J., Pappas, G., Kumar, V., & Ribeiro, A. (2020). [Learning Decentralized Controllers for Robot Swarms with Graph Neural Networks](https://arxiv.org/abs/1903.10527). *CoRL 2020* (GNN-based decentralised multi-robot coordination that scales to large swarms without per-robot retraining).
