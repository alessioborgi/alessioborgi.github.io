---
title: "QRCodeGenerator: Custom Static QR Code Generator"
collection: projects
layout: single
permalink: /projects/qrcodegenerator/
excerpt: "Generate static, unlimited-use QR codes with custom styles, embedded icons, and optional captions — entirely in Python."
author_profile: true
github: "https://github.com/alessioborgi/QRCodeGenerator"
tags:
  - Python
  - QR Codes
  - Utility
  - Image Processing
---

QRCodeGenerator (QRStaticCode) is a Python tool for generating static QR codes with full visual customisation. Unlike many online generators that impose scan limits or require accounts, QRStaticCode produces locally-generated codes that are unlimited-use and privately stored.

## Features

- **Custom colour schemes:** foreground and background colours configurable per-code.
- **Embedded icons:** insert a logo or icon at the centre of the QR code for branded outputs.
- **Optional captions:** add a text label below the code for human-readable context.
- **Error correction levels:** configurable from L (7%) to H (30%) to accommodate icon occlusion.
- **Batch generation:** produce multiple codes from a list of URLs or payloads in one run.

## Use Cases

- Event ticketing and attendance tracking.
- Product labels with embedded brand logos.
- Personal business cards with deep links.
- Generating QR codes for offline environments without third-party services.

## Technology

Built with the `qrcode` and `Pillow` Python libraries. No external API calls — everything runs locally, keeping your data private.
