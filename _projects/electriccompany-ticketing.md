---
title: "ElectricCompany-TicketingSystem: IT Infrastructure & Ticketing for an Electric Consultancy"
collection: projects
layout: single
permalink: /projects/electriccompany-ticketing/
excerpt: "End-to-end analysis and implementation of IT infrastructure (disaster recovery, smart working, fleet management) and a full ticketing system for an electric consultancy firm."
author_profile: true
github: "https://github.com/alessioborgi/ElectricCompany-TicketingSystem"
tags:
  - PHP
  - SQL
  - Networking
  - IT Infrastructure
  - Disaster Recovery
---

This project delivers both an **IT infrastructure design** and a **ticketing system** for a fictional electric consultancy company. It covers the full lifecycle of enterprise IT: network topology, disaster recovery planning, GDPR compliance, remote working setup, and a purpose-built issue tracking application.

## IT Infrastructure

- **Network design:** LAN/WAN topology with segmentation for offices, field teams, and remote workers.
- **Disaster recovery:** Guacamole-based remote access, backup strategies, and failover procedures to ensure business continuity.
- **Smart working:** VPN configuration and security policies for distributed teams.
- **Fleet management:** tracking and lifecycle management of company devices.
- **GDPR compliance:** data classification, access controls, and retention policies aligned with EU regulations.

## Ticketing System

A web-based application for logging, assigning, and resolving internal IT incidents:

- **Ticket submission:** employees report issues via a web form; category and priority are captured at submission.
- **Assignment workflow:** IT staff pick up tickets from a shared queue with status tracking.
- **History and audit:** all state transitions logged for accountability.
- **Admin reporting:** dashboards showing open tickets, resolution times, and recurring issue patterns.

## Technology

PHP backend, SQL database (MySQL/PostgreSQL), JavaScript + CSS frontend, Guacamole for remote desktop, network configuration files.
