---
title: "Java-CategoryTheory: A Category Theory Library in Java"
collection: projects
layout: single
permalink: /projects/java-categorytheory/
excerpt: "A Java library that models core Category Theory constructs — categories, functors, natural transformations — and demonstrates their practical role in software design."
author_profile: true
github: "https://github.com/alessioborgi/Java-CategoryTheory"
tags:
  - Category Theory
  - Java
  - Functional Programming
  - Mathematics
---

Java-CategoryTheory is a library and educational project that translates core Category Theory concepts into working Java code. It bridges the gap between abstract mathematics and software engineering, showing how categorical thinking applies directly to type systems, design patterns, and data transformations.

## What is Category Theory?

Category Theory is the study of mathematical structures and their relationships via *objects* (types) and *morphisms* (functions/transformations). It underpins Haskell's type class hierarchy, Scala's functional idioms, and modern functional programming in general.

## Library Contents

- **Categories:** Modelled as a set of objects and composable morphisms satisfying identity and associativity laws.
- **Functors:** Structure-preserving maps between categories — the mathematical foundation of `map` operations.
- **Natural Transformations:** Morphisms between functors, generalising polymorphic functions.
- **Monads:** Defined categorically, with concrete implementations for common patterns (Option, Result).
- **Limits & Colimits:** Products, coproducts, and pushouts as universal constructions.

## Technology

Built with Java + JavaFX for interactive visualisation of categorical diagrams, with Swing fallback for simpler displays. The project includes runnable examples that connect each concept to a practical Java design pattern.
