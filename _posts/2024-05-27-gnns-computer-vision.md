---
layout: single
title: "GNNs for Computer Vision: Scene Graphs and Beyond"
categories: [gnn]
book: gnn
subsection: applications
tags: [scene-graph, visual-question-answering, object-detection, skeleton, point-cloud]
published: false
excerpt: "Computer vision tasks increasingly require relational reasoning — understanding how objects relate to each other, not just what they are. Scene graph generation, visual question answering, action recognition from skeletons, and 3D point cloud processing all benefit from GNN-based relational modelling."
author_profile: true
read_time: true
is_overview: false
icon: "👁️"
read_mins: 4
permalink: /blog/gnn/gnns-computer-vision/
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
<strong>TL;DR:</strong> Vision tasks require relational understanding: "the cat is sitting on the mat," "the person is holding a cup," "joint 3 moves because joint 1 moved." Scene graph generation, VQA, skeleton action recognition, and 3D point cloud analysis all use GNNs to encode these relations — going beyond the pixel-level features that CNNs provide.
</div>
{% include figure image_path="/images/blog/gnn/xu2019_gin.png" alt="GNNs for computer vision" caption="GNNs for scene graph generation and visual reasoning (Xu et al., 2019)" %}


## Vision Is Relational

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
1. Detect objects with a detector (Faster R-CNN) → bounding boxes + features
2. Build a fully connected graph over detected objects
3. Run GNN (message passing between object nodes)
4. Predict relation label for each edge: (person, dog, walking) vs (person, cup, holding)

The GNN refines object representations by incorporating context from other objects — "a bounding box near a computer on a desk is more likely a keyboard than a random rectangle."

## Application 2: Visual Question Answering (VQA)

**Task:** given image + question text → answer.

"How many objects are to the left of the red cube?"

**Relation networks / GNN approach:**
1. Extract object-level features (not just global image feature)
2. Build a scene graph (or dense pairwise graph)
3. GNN propagates information between object nodes
4. Answer predicted from aggregated graph embedding + question encoding

GNN-based VQA outperforms global feature + LSTM by 8-15% on CLEVR (spatial/compositional reasoning benchmark) — because relational reasoning requires explicit object-to-object information flow.

<div class="insight-box">
<strong>CLEVR benchmark:</strong> CLEVR tests compositional visual reasoning: "Is there any rubber thing that is the same size as the green sphere and to the right of the cyan cylinder?" Solving this requires tracking multiple objects and their spatial relations — impossible for models that process images globally. GNNs that construct and query explicit object graphs achieve near-perfect performance on CLEVR.
</div>

## Application 3: Skeleton Action Recognition

Human skeletons are natural graphs: joints (wrists, elbows, shoulders) are nodes; bones are edges. Action recognition from skeleton data (motion capture, Kinect, pose estimation) is a spatio-temporal GNN problem.

**ST-GCN (Yan et al., 2018):** spatio-temporal GCN on skeleton graphs. At each timestep, runs GCN over 18 joints. Temporal convolution across timesteps captures motion dynamics.

**Applications:** action recognition (running, jumping, waving), fall detection, sports analysis, rehabilitation monitoring.

**Advantage:** unlike CNN on RGB video, skeleton GNNs are:
- View-invariant (joints are 3D positions, not pixel patterns)
- Background-invariant (ignores visual clutter)
- Interpretable (which joint contributed to which prediction?)

## Application 4: 3D Point Cloud Processing

**Point clouds** from LiDAR/depth sensors are unordered sets of 3D points — no natural grid structure. GNNs handle this naturally: construct a graph (k-nearest neighbours in 3D space), run message passing.

**PointNet++ and DGCNN:** process point clouds as graphs. Applications:
- Autonomous driving: 3D object detection (cars, pedestrians, cyclists)
- Indoor mapping: furniture segmentation
- Medical: 3D organ segmentation from CT/MRI

**Equivariant GNNs (EGNN):** point cloud processing that is SE(3)-equivariant — predictions are consistent regardless of sensor orientation. Critical for robotics where the sensor is mounted in various orientations.

## Application 5: Object Detection with Region-Relation Reasoning

**Relation networks for object detection (Hu et al., 2018):** detect objects and then refine detection scores by aggregating context from nearby objects. A car near a road is more likely a car than the same bounding box in a forest.

**GNN over detected regions:**
- Nodes = detected bounding boxes
- Edges = spatial proximity or semantic similarity
- Message passing → refined detection scores

This post-detection relation module improves mAP by 2-3% on COCO — a significant gain.

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
