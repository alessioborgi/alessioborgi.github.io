---
title: "EmailSpamDetector: Spam Detection with Bidirectional LSTMs"
collection: projects
layout: single
permalink: /projects/emailspamdetector/
excerpt: "Classifies spam and ham emails using a Bidirectional LSTM — capturing both forward and backward temporal context in email text for high-accuracy filtering."
author_profile: true
github: "https://github.com/alessioborgi/EmailSpamDetector"
tags:
  - Deep Learning
  - NLP
  - LSTM
  - Text Classification
  - Keras
---

EmailSpamDetector uses a **Bidirectional LSTM** network to classify emails as spam or legitimate (ham). By processing email text in both forward and backward directions simultaneously, the model captures richer contextual signals than a unidirectional LSTM — improving detection of obfuscated spam patterns.

## Why Bidirectional LSTMs?

Spam emails often insert legitimate-looking words at the start or end to fool unidirectional models. A Bi-LSTM processes the entire sequence from both ends, so a suspicious phrase in the middle of a message is still informed by both preceding and following context.

## Pipeline

1. **Preprocessing:** tokenise email text, remove stop words, apply padding/truncation to a fixed sequence length.
2. **Embedding:** word embeddings (trainable or pre-trained GloVe) map tokens to dense vectors.
3. **Bi-LSTM:** two LSTM layers (forward + backward) whose outputs are concatenated.
4. **Classification:** dense layer with sigmoid activation for binary spam/ham prediction.

## Results

Evaluated on public email spam datasets (SpamAssassin, Enron). The Bi-LSTM achieves high precision and recall, with strong resistance to adversarial word-order manipulation common in spam.

## Technology

Python, Keras (TensorFlow), Jupyter Notebooks. Pre-processing with NLTK.
