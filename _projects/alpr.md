---
title: "ALPR: Automatic License Plate Recognition System"
collection: projects
layout: single
permalink: /projects/alpr/
excerpt: "End-to-end real-time license plate detection and OCR pipeline with dual GUIs — one for security managers, one for drivers — built with PyTorch and Streamlit."
author_profile: true
github: "https://github.com/alessioborgi/ALPR-Automatic-License-Plate-Recognition"
tags:
  - Computer Vision
  - OCR
  - Object Detection
  - PyTorch
  - Streamlit
---

ALPR (Automatic License Plate Recognition) is a comprehensive real-time system for detecting vehicle license plates in images or video streams and extracting the plate text via OCR. The project includes dual user interfaces tailored to two distinct roles.

## Pipeline

1. **Detection:** a fine-tuned object detection model (YOLO-family or Faster R-CNN) localises license plate bounding boxes in the input frame.
2. **Crop & Preprocess:** detected regions are cropped, perspective-corrected, and contrast-enhanced for better OCR accuracy.
3. **OCR:** an optical character recognition engine (Tesseract / custom CNN) reads the plate characters.
4. **Database lookup:** recognised plates are matched against a PostgreSQL database of registered vehicles.
5. **Action:** flag unknown plates, log recognised entries, and trigger alerts.

## Dual GUI

- **Security Manager interface:** real-time video feed with overlaid detections, plate text readout, match history, and alert management.
- **Car User interface:** a simpler view showing recognition status, entry logs, and personal vehicle records.

Both interfaces built with Streamlit for rapid deployment without a custom frontend.

## Technology

Python, PyTorch, OpenCV, Tesseract OCR, PostgreSQL, Streamlit.
