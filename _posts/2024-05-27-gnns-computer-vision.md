---
layout: single
title: "GNNs for Computer Vision: Scene Graphs and Beyond"
categories: [gnn]
book: gnn
subsection: applications
tags: [scene-graph, visual-question-answering, object-detection, skeleton, point-cloud]
published: true
excerpt: "Computer vision tasks increasingly require relational reasoning — understanding how objects relate to each other, not just what they are. Scene graph generation, visual question answering, action recognition from skeletons, and 3D point cloud processing all benefit from GNN-based relational modelling."
author_profile: true
read_time: true
is_overview: false
icon: "👁️"
read_mins: 9
permalink: /blog/gnn/gnns-computer-vision/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Vision tasks require relational understanding: "the cat is sitting on the mat," "the person is holding a cup," "joint 3 moves because joint 1 moved." Scene graph generation, VQA, skeleton action recognition, and 3D point cloud analysis all build an explicit graph over entities — objects, joints, points — and use message passing to make each entity's representation depend on the others. That is information a per-region CNN feature does not carry.
</div>
{% include figure image_path="/images/blog/gnn/xu2019_gin.png" alt="Message-passing aggregation and its discriminative power" caption="How the choice of neighbourhood aggregator determines which graph structures a GNN can tell apart (Xu et al., 2019). The same expressiveness question governs whether a scene-graph model can distinguish two images with identical objects but different relations." %}


## Vision Is Relational

**Intuition First:** A CNN classifying cats sees pixels and textures — it answers "is there a cat-shaped pattern here?" A scene graph GNN answers "is the cat sitting *on* the mat, or *next to* it, or *under* it?" These are different questions entirely. The relation matters for image captioning, for VQA ("Is there anything on the mat?"), and for robotics ("pick up the object on top of the red box"). CNNs process each object in isolation; GNNs pass messages between objects so each object's representation is informed by its relational context.

A single-object CNN classifier answers "what is in this image?" A relational vision system answers "how do the objects relate?" The latter is required for:

- **Image captioning:** "a person riding a bicycle on a road" — requires knowing the person-bicycle relation
- **Visual question answering:** "Is the cup to the left of the plate?" — spatial relation query
- **Action recognition:** "throwing" vs "catching" — involves interaction between multiple body parts
- **3D scene understanding:** robot navigation requires knowing object spatial relations

GNNs are the natural tool for encoding and reasoning over these relational structures.

## Application 1: Scene Graph Generation

A **scene graph** represents an image as a graph where:
- Nodes = detected objects (person, dog, cup, table)
- Edges = predicate relations (holding, sitting-on, next-to)
- Node features = visual features from bounding boxes

**Task:** given an image, predict the scene graph.

**GNN approach:**
1. Detect objects with a detector (Faster R-CNN) → bounding boxes and region features
2. Build a graph over the detected objects — fully connected, or pruned to plausible pairs
3. Run message passing between object nodes
4. Predict a predicate label for each edge, e.g. (person, walking, dog) or (person, holding, cup)

Formally, this is edge-level prediction on top of node embeddings:

<div class="formula-box">
\[
h_v^{(k)} = \mathrm{UPDATE}\!\left( h_v^{(k-1)},\, \mathrm{AGG}\!\left( \{\, h_u^{(k-1)} : u \in \mathcal{N}(v) \,\} \right) \right),
\qquad
\hat{y}_{uv} = \mathrm{softmax}\!\left( f\!\left( h_u^{(K)},\, h_v^{(K)} \right) \right),
\]
</div>

with $$\hat{y}_{uv}$$ ranging over the predicate vocabulary plus a "no relation" class. The GNN refines object representations using context from other objects — a bounding box sitting on a desk beside a monitor is more likely a keyboard than the same box would be in isolation — and the refined pair of embeddings is what the predicate classifier sees.

## Application 2: Visual Question Answering (VQA)

**Task:** given image + question text → answer.

"How many objects are to the left of the red cube?"

**Relation networks / GNN approach:**
1. Extract object-level features (not just global image feature)
2. Build a scene graph (or dense pairwise graph)
3. GNN propagates information between object nodes
4. Answer predicted from aggregated graph embedding + question encoding

On CLEVR — the diagnostic benchmark for spatial and compositional reasoning — models that reason over explicit object representations substantially outperform architectures that reduce the image to a single global feature vector before answering. The reason is structural rather than a matter of capacity: comparing two objects requires a computation that takes both as input, and a global feature vector has already destroyed the separation between them.

<div class="insight-box">
<strong>CLEVR benchmark:</strong> CLEVR tests compositional visual reasoning with questions like "Is there any rubber thing that is the same size as the green sphere and to the right of the cyan cylinder?" Answering requires tracking several objects and evaluating relations between specific pairs. Models built around explicit object-level representations and pairwise reasoning — relation networks, scene-graph GNNs, and neuro-symbolic approaches — reach very high accuracy here, while global-feature CNN+LSTM baselines lag far behind. CLEVR is a diagnostic dataset with synthetic images and templated questions, so it isolates the relational-reasoning gap cleanly, but strong CLEVR numbers do not transfer automatically to natural-image VQA.
</div>

## Application 3: Skeleton Action Recognition

Human skeletons are natural graphs: joints (wrists, elbows, shoulders) are nodes; bones are edges. Action recognition from skeleton data (motion capture, Kinect, pose estimation) is a spatio-temporal GNN problem.

**ST-GCN (Yan et al., 2018):** spatio-temporal GCN on skeleton graphs. At each timestep it runs a GCN over the joint graph — 18 joints for the OpenPose skeletons used on Kinetics, 25 for the NTU-RGB+D captures — and a temporal convolution across timesteps captures the motion dynamics. The spatial edges are the bones; ST-GCN adds temporal edges linking each joint to itself in adjacent frames, so a single graph spans the whole clip.

**Applications:** action recognition (running, jumping, waving), fall detection, sports analysis, rehabilitation monitoring.

**Advantage:** unlike CNN on RGB video, skeleton GNNs are:
- View-invariant (joints are 3D positions, not pixel patterns)
- Background-invariant (ignores visual clutter)
- Interpretable (which joint contributed to which prediction?)

## Application 4: 3D Point Cloud Processing

**Point clouds** from LiDAR/depth sensors are unordered sets of 3D points — no natural grid structure. GNNs handle this naturally: construct a graph (k-nearest neighbours in 3D space), run message passing.

**PointNet++ and DGCNN:** process point clouds with local neighbourhood aggregation — PointNet++ over hierarchically sampled ball neighbourhoods, DGCNN over a $$k$$-NN graph recomputed in feature space at every layer. Applications:
- Autonomous driving: 3D object detection (cars, pedestrians, cyclists)
- Indoor mapping: furniture segmentation
- Medical: 3D organ segmentation from CT/MRI

**Equivariant GNNs (EGNN):** point cloud processing that is SE(3)-equivariant — predictions are consistent regardless of sensor orientation. Critical for robotics where the sensor is mounted in various orientations.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> CLEVR makes the advantage of relational models concrete. A question like "Is the large metallic cube to the left of the small rubber sphere?" requires identifying two specific objects and evaluating a relation <em>between them</em>. A model that pools the image into one global vector before the question is applied has already thrown away the object boundaries that the comparison needs — no amount of extra capacity in the classifier recovers them. A GNN over an explicit object graph keeps the objects separate and makes the pairwise computation available as an edge. The lesson generalises beyond VQA: when a task's answer depends on a relation between two entities, that relation has to survive into the representation, not be averaged out of it.</div>

## Application 5: Object Detection with Region-Relation Reasoning

**Relation networks for object detection (Hu et al., 2018):** detect objects, then refine each detection using context from the others. A box that looks marginally like a car is more plausible next to a road than in the middle of a forest.

**GNN over detected regions:**
- Nodes = detected bounding boxes
- Edges = spatial proximity or appearance similarity
- Message passing → refined detection scores

The module attends over pairs of regions using both appearance and relative geometry, and the same mechanism can replace non-maximum suppression with a learned duplicate-removal step — which is the part that makes the pipeline end-to-end rather than merely more accurate. Hu et al. report consistent mAP improvements on COCO from adding it to standard detectors.

## Summary

| Application | Graph structure | GNN role |
|-------------|----------------|---------|
| Scene graph generation | Object-relation graph | Encode context for relation prediction |
| Visual QA | Scene graph + question | Relational reasoning over objects |
| Skeleton action | Joint-bone kinematic graph | Spatio-temporal action recognition |
| Point cloud | k-NN in 3D space | Unordered 3D processing |
| Object detection | Spatial proximity graph | Context-aware refinement |

GNNs bring relational reasoning to computer vision — moving beyond "what objects are present" to "how do objects relate." This shift is enabling vision systems that answer compositional questions, understand actions, and reason about 3D spatial structure — capabilities that are increasingly central to real-world visual intelligence.

## References

- Yan, S., Xiong, Y., & Lin, D. (2018). [Spatial Temporal Graph Convolutional Networks for Skeleton-Based Action Recognition](https://arxiv.org/abs/1801.07455). *AAAI 2018* (ST-GCN: spatio-temporal GNN on human skeleton joint graphs for action recognition from pose sequences).
- Wang, Y., Sun, Y., Liu, Z., Sarma, S. E., Bronstein, M. M., & Solomon, J. M. (2019). [Dynamic Graph CNN for Learning on Point Clouds](https://arxiv.org/abs/1801.07829). *ACM Transactions on Graphics 2019* (DGCNN: EdgeConv on dynamically recomputed k-NN graphs in feature space for 3D point cloud classification).
- Yang, J., Lu, J., Lee, S., Batra, D., & Parikh, D. (2018). [Graph R-CNN for Scene Graph Generation](https://arxiv.org/abs/1808.00191). *ECCV 2018* (Graph R-CNN: end-to-end scene graph generation using GNNs to reason over detected object relations).
- Hu, H., Gu, J., Zhang, Z., Dai, J., & Wei, Y. (2018). [Relation Networks for Object Detection](https://arxiv.org/abs/1711.11575). *CVPR 2018* (attention over pairs of detected regions using appearance and relative geometry, including a learned replacement for non-maximum suppression).
