---
title: "RealTime-VLM: Real-Time Vision-Language Model Inference in the Browser"
collection: projects
layout: single
permalink: /projects/realtime-vlm/
excerpt: "Browser-based real-time VLM inference — continuously captures webcam frames and feeds them to any OpenAI-compatible vision API with sub-second latency."
author_profile: true
github: "https://github.com/alessioborgi/RealTime-VLM"
tags:
  - Vision-Language Models
  - Real-Time Inference
  - Computer Vision
  - JavaScript
---

RealTime-VLM brings real-time vision-language model inference directly to the browser. It continuously captures webcam frames, encodes them, and sends an image+text prompt to any OpenAI-compatible API endpoint — displaying model responses with sub-second latency. No server-side relay is needed: the browser communicates with the VLM endpoint directly.

## Features

- **Continuous webcam capture:** frames are grabbed at a configurable rate and sent as base-64 encoded images.
- **OpenAI-compatible API:** works out of the box with hosted APIs (GPT-4o, Gemini) and local VLMs served via Ollama, LM Studio, or vLLM.
- **Sub-second feedback loop:** streaming responses are displayed as they arrive, giving a live "describe what you see" experience.
- **Zero dependencies on a custom backend:** the entire pipeline runs in a single HTML+JS file.

## Use Cases

- Real-time scene description for accessibility tools.
- Interactive vision demos and classroom experiments.
- Rapid prototyping of vision-aware chat interfaces.
- Local VLM benchmarking with live visual input.

## Technical Details

The app uses the browser's `MediaDevices.getUserMedia` API to capture frames, converts them to JPEG via a `<canvas>` element, and base-64 encodes the result before attaching it to the `messages` payload. Responses are streamed back using the standard SSE/streaming mode of the OpenAI chat completions endpoint.
