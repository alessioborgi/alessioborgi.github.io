---
title: "SkinMe: Deep Learning for Skin Disease Detection"
collection: projects
layout: single
permalink: /projects/skinme/
excerpt: "A deep learning application that classifies skin conditions from dermoscopic images using CNNs and LSTMs, supporting early diagnosis assistance."
author_profile: true
github: "https://github.com/alessioborgi/SkinMe"
tags:
  - Deep Learning
  - Medical AI
  - Computer Vision
  - CNN
  - LSTM
---

SkinMe is a deep learning-based application for skin disease detection and classification. Given a dermoscopic image, the model identifies the most likely skin condition from a set of clinically relevant categories, providing a ranked confidence output to assist diagnosis.

## Problem

Dermatological conditions affect a large proportion of the population, yet access to specialist dermatologists is limited. Early detection of conditions like melanoma, basal cell carcinoma, and psoriasis significantly improves outcomes. SkinMe explores whether deep learning can assist this screening process.

## Model Architecture

- **CNN backbone:** a convolutional neural network (VGG / ResNet-style) trained on dermoscopic image datasets to extract spatial features from skin lesion images.
- **LSTM component:** sequential modelling over image patches for capturing spatial dependencies at a higher level of abstraction.
- **Classification head:** softmax output over the target disease classes.

## Dataset

Trained and evaluated on the HAM10000 (Human Against Machine) dataset — 10,000+ dermoscopic images across 7 diagnostic categories (melanoma, melanocytic nevus, basal cell carcinoma, actinic keratosis, benign keratosis, dermatofibroma, vascular lesion).

## Technology

Python, Keras (TensorFlow backend), Jupyter Notebooks. Data augmentation (rotation, flipping, colour jitter) applied to address class imbalance.
