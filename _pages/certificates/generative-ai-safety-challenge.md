---
layout: single
title: "Generative AI Safety Challenge"
permalink: /awards/generative-ai-safety-challenge-2025/
author_profile: true
---

<style>
  :root {
    --safe-navy: #0d2f4e;
    --safe-ink: #16354d;
    --safe-red: #dd5e5e;
    --safe-amber: #f2b84b;
    --safe-mint: #7de0c4;
    --safe-panel: #f8fbfd;
    --safe-border: rgba(13, 47, 78, 0.12);
    --safe-shadow: 0 18px 40px rgba(8, 28, 49, 0.12);
  }
  .safe-wrap {
    display: grid;
    gap: 1.5rem;
  }
  .safe-hero {
    position: relative;
    overflow: hidden;
    padding: 2rem;
    border-radius: 24px;
    color: #fff;
    background:
      radial-gradient(circle at top right, rgba(242, 184, 75, 0.2), transparent 32%),
      radial-gradient(circle at bottom left, rgba(125, 224, 196, 0.18), transparent 28%),
      linear-gradient(135deg, #0a243a 0%, var(--safe-navy) 52%, #16537f 100%);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 22px 52px rgba(5, 22, 39, 0.22);
  }
  .safe-eyebrow {
    margin: 0 0 0.45rem;
    color: var(--safe-mint);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.76rem;
    font-weight: 800;
  }
  .safe-hero h1 {
    margin: 0 0 0.85rem;
    font-size: clamp(2rem, 4vw, 2.8rem);
    line-height: 1.05;
    color: #fff;
  }
  .safe-sub {
    margin: 0 0 1rem;
    color: rgba(255,255,255,0.8);
    font-weight: 700;
  }
  .safe-lead {
    margin: 0;
    max-width: 940px;
    font-size: 1.04rem;
    line-height: 1.75;
    color: rgba(255,255,255,0.92);
  }
  .safe-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 1.15rem;
  }
  .safe-pill {
    padding: 0.52rem 0.92rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    color: #fff;
    font-size: 0.86rem;
    font-weight: 700;
  }
  .safe-section {
    background: linear-gradient(180deg, #ffffff 0%, var(--safe-panel) 100%);
    border: 1px solid var(--safe-border);
    border-radius: 20px;
    padding: 1.55rem;
    box-shadow: var(--safe-shadow);
  }
  .safe-section h2 {
    margin: 0 0 0.55rem;
    color: var(--safe-navy);
    font-size: 1.4rem;
  }
  .safe-section p {
    margin: 0.35rem 0 0.9rem;
    line-height: 1.72;
    color: var(--safe-ink);
  }
  .safe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.95rem;
    margin-top: 1rem;
  }
  .safe-card {
    border-radius: 18px;
    padding: 1.1rem 1.05rem;
    border: 1px solid var(--safe-border);
    background: linear-gradient(155deg, #fbfdff 0%, #eef6fb 100%);
  }
  .safe-card__kicker {
    margin: 0 0 0.3rem;
    color: rgba(22,53,77,0.62);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
    font-weight: 800;
  }
  .safe-card__title {
    margin: 0 0 0.4rem;
    color: var(--safe-navy);
    font-size: 1.02rem;
    font-weight: 800;
    line-height: 1.35;
  }
  .safe-card__body {
    margin: 0;
    color: var(--safe-ink);
    line-height: 1.62;
    font-size: 0.95rem;
  }
  .safe-note {
    padding: 1rem 1.1rem;
    border-radius: 16px;
    border: 1px solid rgba(221, 94, 94, 0.18);
    background: linear-gradient(145deg, #fff9f7 0%, #fff0ed 100%);
    color: #6f2f2f;
  }
  .safe-list {
    margin: 0.2rem 0 0;
    padding-left: 1.15rem;
    display: grid;
    gap: 0.55rem;
    color: var(--safe-ink);
    line-height: 1.65;
  }
  @media (max-width: 720px) {
    .safe-hero, .safe-section {
      padding: 1.2rem;
    }
    .safe-hero h1 {
      font-size: 1.95rem;
    }
  }
</style>

<div class="safe-wrap">
  <section class="safe-hero">
    <p class="safe-eyebrow">Award & Achievement</p>
    <h1>Generative AI Safety Challenge</h1>
    <p class="safe-sub">Sapienza University of Rome · 2025</p>
    <p class="safe-lead">
      Recognition received during the <strong>Generative AI Safety Challenge</strong> for work across two distinct tracks: <strong>Privacy Violation Detection</strong> in the individual setting and <strong>Attack on Data</strong> in the team setting. The challenge focused on stress-testing generative AI systems under realistic misuse and failure scenarios, with attention to privacy, robustness, and security-oriented reasoning.
    </p>
    <div class="safe-pills">
      <span class="safe-pill">AI Safety</span>
      <span class="safe-pill">Privacy Risk Analysis</span>
      <span class="safe-pill">Adversarial Evaluation</span>
      <span class="safe-pill">Generative Models</span>
    </div>
  </section>

  <section class="safe-section">
    <h2>Challenge Focus</h2>
    <p>
      The challenge was centered on a practical question: how do generative AI systems fail when they are pushed outside their ideal operating assumptions? Rather than evaluating only raw model quality, the competition emphasized harmful edge cases, unsafe outputs, privacy leakage, and adversarial pressure on the data pipeline.
    </p>
    <div class="safe-grid">
      <div class="safe-card">
        <p class="safe-card__kicker">Individual Track</p>
        <h3 class="safe-card__title">Privacy Violation Detection</h3>
        <p class="safe-card__body">
          Focused on identifying and reasoning about privacy-critical behaviour in generative AI systems, including when outputs or system behaviour may reveal, reconstruct, or expose sensitive information.
        </p>
      </div>
      <div class="safe-card">
        <p class="safe-card__kicker">Team Track</p>
        <h3 class="safe-card__title">Attack on Data</h3>
        <p class="safe-card__body">
          Focused on attacking the reliability of the data channel itself, studying how corrupted, manipulated, or adversarially designed data can degrade, mislead, or destabilize downstream model behaviour.
        </p>
      </div>
    </div>
  </section>

  <section class="safe-section">
    <h2>Why It Matters</h2>
    <p>
      This challenge fits directly with a broader research mindset: strong AI systems are not only systems that perform well on average, but systems that remain understandable and reliable when confronted with harmful or misleading inputs. Safety-oriented evaluation forces a shift from “can the model do the task?” to “what breaks, why does it break, and how do we detect it early?”
    </p>
    <div class="safe-note">
      The interesting part of this achievement is the combination of two perspectives:
      privacy-centric failure analysis on one side, and adversarial pressure on the data pipeline on the other. Together they cover two of the most important practical failure modes in modern generative AI deployment.
    </div>
  </section>

  <section class="safe-section">
    <h2>Key Takeaways</h2>
    <ul class="safe-list">
      <li>Work was recognised in both an <strong>individual</strong> and a <strong>team</strong> challenge format, spanning privacy and adversarial-data perspectives.</li>
      <li>The award reflects practical experience with <strong>AI safety evaluation</strong>, not only standard model-building.</li>
      <li>The themes are tightly aligned with modern concerns around <strong>privacy leakage</strong>, <strong>unsafe model behaviour</strong>, and <strong>robustness under attack</strong>.</li>
    </ul>
  </section>
</div>
