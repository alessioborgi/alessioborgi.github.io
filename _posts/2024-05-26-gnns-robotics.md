---
layout: single
title: "GNNs for Robotics: Planning, Manipulation, and Multi-Agent Systems"
categories: [gnn]
book: gnn
subsection: applications
tags: [robotics, planning, manipulation, multi-agent, simulation]
published: true
excerpt: "Robots interact with structured environments: objects have relationships, joints form kinematic chains, agents communicate through interaction graphs. GNNs encode these relational structures — enabling generalisation across object configurations, robot morphologies, and multi-agent scenarios."
author_profile: true
read_time: true
is_overview: false
icon: "🤖"
read_mins: 9
permalink: /blog/gnn/gnns-robotics/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Robotics problems are inherently relational: robot links form kinematic graphs, objects on a table form spatial proximity graphs, multiple robots form communication graphs. Because message passing is defined per node and per edge, a GNN policy trained on one graph size transfers to another — different numbers of objects, different robot morphologies, different team sizes. That is the compositionality a fixed-input-size network structurally cannot have.
</div>
{% include figure image_path="/images/blog/gnn/satorras2021_egnn.png" alt="E(n)-equivariant graph neural network" caption="E(n)-equivariant graph neural networks: message passing on geometric graphs, the basis for equivariant 3D perception and dynamics models (Satorras et al., 2021)" %}


## Why Graphs in Robotics

**Intuition First:** A robot arm is a kinematic chain: each joint's position depends on every upstream joint. A flat neural network that takes all joint angles as a concatenated vector has no built-in knowledge of this chain structure — it must learn it from scratch. A GNN where each joint is a node connected to its upstream and downstream joints encodes the chain structure directly: messages flow along the kinematic graph, so joint 5's state naturally influences joint 6 and vice versa, without the model having to discover this from data.

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

Messages propagate along the kinematic chain, and a per-node output head turns each joint's final embedding into that joint's action. Because both the message function and the output head are shared across nodes, the parameter count does not depend on the number of joints — which is exactly what makes a single policy applicable to bodies of different sizes.

**Advantage:** the paper evaluates this on MuJoCo agents whose morphology can be varied systematically — centipede bodies with more or fewer segments, snakes of different lengths — and transfers a policy learned on one size to bodies with a different number of limbs. A flat MLP policy cannot even be *applied* to such a body, since its input dimension no longer matches.

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

**Learned communication as message passing (CommNet; Tolstaya et al., 2020):** model the swarm as a proximity graph, with an edge between two robots when they are close enough to communicate. At each control step:
1. Each robot sends a message along its edges — a learned function of its local state
2. Each robot aggregates the messages it received, with a permutation-invariant operator
3. Each robot picks its action from its own state plus that aggregate

The GNN *is* the communication protocol: the message function and the aggregator are learned end to end rather than hand-designed, so the network discovers what is worth transmitting.

**Why this matters structurally:** each robot only ever reads its own local aggregate, so the controller is genuinely decentralised — no robot needs global state. And because the same message and update functions run at every node, a policy trained on a small team can be executed by a larger one; the graph simply has more nodes. That is the property the centralised alternative lacks, since a joint controller over $$N$$ robots has an action space that grows with $$N$$.

## Application 4: Physics Simulation and Model-Based RL

**Interaction networks (Battaglia et al., 2016):** model a physical system as a graph — nodes are objects, edges are the interactions between them — and learn to predict the next state from the current one:

<div class="formula-box">
\[
m_{uv} = f_{\text{rel}}\!\left( h_u,\, h_v,\, e_{uv} \right),
\qquad
h_v' = f_{\text{obj}}\!\left( h_v,\, \sum_{u \in \mathcal{N}(v)} m_{uv} \right).
\]
</div>

The split is the whole idea: $$f_{\text{rel}}$$ is a single learned model of *how any pair interacts* (a spring, a collision, gravity), and $$f_{\text{obj}}$$ a single model of how an object responds to the forces on it. Neither is indexed by which object it is, so a system with more objects needs no new parameters — you just sum over more messages.

Applications:
- Cloth simulation: nodes = vertices, edges = cloth edges
- Rigid body dynamics: nodes = objects, edges = contact constraints
- Particle systems: nodes = particles, edges = proximity

**Model-based RL with GNN dynamics model:** learn the physical model as a GNN, use it for planning (model-predictive control or model-based policy search). GNNs generalise to unseen object configurations because the dynamics are object-agnostic.

## Application 5: Point Cloud Processing for Perception

Lidar sensors produce 3D point clouds — unordered sets of 3D points. GNNs can process point clouds by constructing a graph (k-nearest neighbours) and running message passing:

**DGCNN (Wang et al., 2019):** dynamic graph CNN — recompute the $$k$$-NN graph after every layer, in the *current feature space* rather than in 3D space. Points that are far apart physically but semantically alike (two wingtips of an aircraft) become neighbours in later layers, so the receptive field stops being purely geometric. The paper reports strong results on ModelNet40 classification and ShapeNet part segmentation.

**Equivariant GNNs (EGNN, Satorras et al., 2021):** keep node coordinates as a separate channel updated only through relative displacements, which makes the layer equivariant to rotations and translations by construction. A rotated point cloud produces a correspondingly rotated output rather than an unrelated one — so the model does not have to learn rotation invariance from augmented data, which matters when the sensor's orientation varies.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The unifying theme across all robotics GNN applications is <em>compositionality</em> — the ability to apply learned rules to new combinations of known parts. A flat neural network trained on a 4-joint arm must be retrained for a 6-joint arm. A GNN trained on the same 4-joint arm can immediately handle 6 joints, because message passing is defined per-node and per-edge, not per-configuration. This compositionality is what makes GNN-based robotics policies genuinely transferable across hardware variants, scene configurations, and team sizes.</div>

## Summary

| Application | Graph structure | Key challenge solved |
|-------------|----------------|---------------------|
| Robot morphology | Kinematic graph | Generalise to new robot designs |
| Object manipulation | Scene graph | Compositional planning |
| Multi-robot | Proximity/communication graph | Scalable coordination |
| Physics simulation | Particle/object interaction graph | Generalise to new configurations |
| Point cloud perception | k-NN graph | Unordered 3D data |

Robotics is one of the most natural application domains for GNNs, because the relational structure is not a modelling convenience — it is physically there. Joints really are connected in a chain, objects really do rest on one another, robots really can only talk to those in range. Encoding that graph directly, and sharing one message function across all of it, is what buys transfer across hardware variants, scene configurations, and team sizes.

## References

- Wang, T., Liao, R., Ba, J., & Fidler, S. (2018). [NerveNet: Learning Structured Policy with Graph Neural Networks](https://openreview.net/forum?id=S1sqHMZCb). *ICLR 2018* (NerveNet: kinematic graph GNNs for robot locomotion policies that generalise across morphologies).
- Battaglia, P., Pascanu, R., Lai, M., Rezende, D. J., & Kavukcuoglu, K. (2016). [Interaction Networks for Learning about Objects, Relations and Physics](https://arxiv.org/abs/1612.00222). *NeurIPS 2016* (Interaction Networks: object-relation graphs for physics simulation — foundational for GNN robotics applications).
- Tolstaya, E., Gama, F., Paulos, J., Pappas, G., Kumar, V., & Ribeiro, A. (2020). [Learning Decentralized Controllers for Robot Swarms with Graph Neural Networks](https://arxiv.org/abs/1903.10527). *CoRL 2020* (GNN-based decentralised multi-robot coordination, with the communication graph as the message-passing graph).
- Satorras, V. G., Hoogeboom, E., & Welling, M. (2021). [E(n) Equivariant Graph Neural Networks](https://arxiv.org/abs/2102.09844). *ICML 2021* (EGNN: message passing on geometric graphs that is equivariant to rotations, translations and reflections by construction).
