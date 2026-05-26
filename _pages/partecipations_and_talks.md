---
layout: archive
title: "Participations & Talks"
permalink: /partecipations_and_talks/
author_profile: true
---

{% include base_path %}

<style>
  /* ── Design tokens ── */
  :root {
    --pt-navy:   #003E74;
    --pt-teal:   #38c1b7;
    --pt-blue:   #0a66c2;
    --pt-amber:  #d97706;
    --pt-purple: #7c3aed;
    --pt-border: rgba(0,62,116,0.14);
    --pt-shadow: 0 4px 18px rgba(0,62,116,0.11);
  }

  /* ── Section block ── */
  .pt-section { margin-bottom: 2.5rem; }

  .pt-section__hd {
    background: var(--pt-navy);
    color: #fff;
    padding: 0.6rem 1.1rem;
    border-radius: 10px 10px 0 0;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }
  .pt-section__hd .pt-bar {
    display: inline-block;
    width: 4px;
    height: 1.1em;
    border-radius: 2px;
    background: var(--pt-teal);
    flex-shrink: 0;
  }
  .pt-section__body {
    background: #fff;
    border: 1px solid var(--pt-border);
    border-top: none;
    border-radius: 0 0 12px 12px;
    padding: 0;
    box-shadow: var(--pt-shadow);
    overflow: hidden;
  }

  /* ── Timeline ── */
  .pt-timeline { position: relative; padding: 1.4rem 1.6rem; }
  .pt-timeline::before {
    content: "";
    position: absolute;
    left: 2.35rem;
    top: 1.4rem;
    bottom: 1.4rem;
    width: 2px;
    background: linear-gradient(to bottom, var(--pt-teal), rgba(56,193,183,0.15));
    border-radius: 1px;
  }

  .pt-item {
    display: grid;
    grid-template-columns: 3.2rem 1fr;
    gap: 0 1.1rem;
    position: relative;
    margin-bottom: 1.8rem;
  }
  .pt-item:last-child { margin-bottom: 0; }

  /* Dot */
  .pt-dot {
    position: relative;
    display: flex;
    justify-content: center;
    padding-top: 0.22rem;
    z-index: 1;
  }
  .pt-dot span {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: var(--pt-teal);
    box-shadow: 0 0 0 3px rgba(56,193,183,0.22);
    flex-shrink: 0;
    display: block;
    margin-top: 0.18rem;
  }
  .pt-dot--blue span  { background: var(--pt-blue);   box-shadow: 0 0 0 3px rgba(10,102,194,0.22); }
  .pt-dot--amber span { background: var(--pt-amber);  box-shadow: 0 0 0 3px rgba(217,119,6,0.22); }
  .pt-dot--purple span{ background: var(--pt-purple); box-shadow: 0 0 0 3px rgba(124,58,237,0.22); }

  /* Content */
  .pt-content {}
  .pt-period {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--pt-teal);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.15rem;
  }
  .pt-period--blue   { color: var(--pt-blue); }
  .pt-period--amber  { color: var(--pt-amber); }
  .pt-period--purple { color: var(--pt-purple); }

  .pt-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--pt-navy);
    margin: 0 0 0.15rem;
    line-height: 1.3;
  }
  .pt-org {
    font-size: 0.93rem;
    color: #4b5563;
    margin-bottom: 0.45rem;
    font-style: italic;
  }
  .pt-body {
    font-size: 0.94rem;
    color: #374151;
    line-height: 1.6;
    margin: 0;
  }
  .pt-body p { margin: 0 0 0.35rem; }
  .pt-body p:last-child { margin-bottom: 0; }
  .pt-body ul {
    margin: 0.3rem 0 0 1rem;
    padding: 0;
  }
  .pt-body li { margin-bottom: 0.25rem; }

  /* ── Badge pills ── */
  .pt-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.55rem;
  }
  .pt-badge {
    display: inline-block;
    padding: 0.22rem 0.65rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
    background: rgba(56,193,183,0.12);
    border: 1px solid rgba(56,193,183,0.30);
    color: #0d6e6a;
  }
  .pt-badge--gold {
    background: rgba(217,119,6,0.10);
    border-color: rgba(217,119,6,0.30);
    color: #92400e;
  }
  .pt-badge--blue {
    background: rgba(10,102,194,0.10);
    border-color: rgba(10,102,194,0.28);
    color: #1e40af;
  }
  .pt-badge--purple {
    background: rgba(124,58,237,0.10);
    border-color: rgba(124,58,237,0.28);
    color: #5b21b6;
  }
  .pt-badge--red {
    background: rgba(220,38,38,0.10);
    border-color: rgba(220,38,38,0.25);
    color: #991b1b;
  }
</style>

<!-- ═══════════════════════════════════════════════════════
     SCHOOLS & COURSES
     ═══════════════════════════════════════════════════════ -->
<div class="pt-section">
  <div class="pt-section__hd">
    <span class="pt-bar"></span>
    Summer Schools
  </div>
  <div class="pt-section__body">
    <div class="pt-timeline">

      <!-- SEIO School -->
      <div class="pt-item">
        <div class="pt-dot"><span></span></div>
        <div class="pt-content">
          <div class="pt-period">June 2025</div>
          <div class="pt-title">SEIO Summer School — Statistical Learning &amp; AI</div>
          <div class="pt-org">🇪🇸 Barcelona, Spain &nbsp;·&nbsp; Sociedad Española de Investigación Operativa</div>
          <div class="pt-body">
            <p>Intensive school covering statistical learning theory, probabilistic graphical models, and AI methods with applications to operations research and decision making.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge">Statistical Learning</span>
            <span class="pt-badge--blue pt-badge">Graphical Models</span>
          </div>
        </div>
      </div>

      <!-- OxML Summer School -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--purple"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--purple">Summer 2025</div>
          <div class="pt-title">OxML Summer School — Oxford Machine Learning</div>
          <div class="pt-org">🇬🇧 London / Oxford, United Kingdom &nbsp;·&nbsp; AI for Global Goals</div>
          <div class="pt-body">
            <p>Selective programme covering deep learning theory, geometric deep learning, probabilistic ML, NLP, computer vision, and ML for social impact.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--purple pt-badge">Geometric Deep Learning</span>
            <span class="pt-badge--blue pt-badge">Probabilistic ML</span>
            <span class="pt-badge">NLP &amp; Vision</span>
          </div>
        </div>
      </div>

      <!-- DL2025 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--amber"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--amber">Spring 2025</div>
          <div class="pt-title">DL 2025 — Deep Learning School</div>
          <div class="pt-org">🇮🇹 Rome, Italy</div>
          <div class="pt-body">
            <p>Intensive deep learning school covering modern architectures, optimisation theory, generative models, and applications in vision and language.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--amber pt-badge">Deep Learning</span>
            <span class="pt-badge">Generative Models</span>
          </div>
        </div>
      </div>

      <!-- Google BUCA -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--blue"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--blue">Summer 2023</div>
          <div class="pt-title">Google BUCA Summer School — ML &amp; Cloud</div>
          <div class="pt-org">🇮🇹 Como, Italy &nbsp;·&nbsp; Google</div>
          <div class="pt-body">
            <p>Google-hosted summer school focused on machine learning at scale, cloud infrastructure (Google Cloud Platform), and responsible AI principles. Covered topics including distributed training, MLOps, and production ML pipelines.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--blue pt-badge">Google Cloud</span>
            <span class="pt-badge">MLOps</span>
            <span class="pt-badge--blue pt-badge">Responsible AI</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     VISITING RESEARCH
     ═══════════════════════════════════════════════════════ -->
<div class="pt-section">
  <div class="pt-section__hd">
    <span class="pt-bar"></span>
    Visiting Research
  </div>
  <div class="pt-section__body">
    <div class="pt-timeline">

      <!-- Tohoku University -->
      <div class="pt-item">
        <div class="pt-dot"><span></span></div>
        <div class="pt-content">
          <div class="pt-period">June – July 2025</div>
          <div class="pt-title">Visiting Researcher — Tohoku University</div>
          <div class="pt-org">🇯🇵 Sendai, Japan &nbsp;·&nbsp; Prof. Masayuki Numao &amp; Prof. Ken-ichi Fukui</div>
          <div class="pt-body">
            <p>Conducted research on <strong>Sheaf Neural Networks</strong> and their application to neuroscience data, collaborating with the AI Lab at Tohoku University.</p>
            <p>Selected winner of the <strong>TESP 2025 (Tohoku Engineering Summer Program)</strong>.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--gold pt-badge">TESP 2025 Winner</span>
            <span class="pt-badge">Sheaf Neural Networks</span>
            <span class="pt-badge--blue pt-badge">Neuroscience × AI</span>
          </div>
        </div>
      </div>

      <!-- JKU Linz -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--blue"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--blue">August – September 2024</div>
          <div class="pt-title">Visiting Researcher — Johannes Kepler University Linz</div>
          <div class="pt-org">🇦🇹 Linz, Austria &nbsp;·&nbsp; Prof. Sepp Hochreiter</div>
          <div class="pt-body">
            <p>Research stay focused on <strong>xLSTM architectures</strong> and modern sequence modelling under the supervision of Prof. Sepp Hochreiter (inventor of LSTM).</p>
            <p>Awarded <strong>Best Poster Award</strong> at the JKU AI Research Symposium.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--gold pt-badge">Best Poster Award</span>
            <span class="pt-badge--blue pt-badge">xLSTM</span>
            <span class="pt-badge--blue pt-badge">Sequence Modelling</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     MAKER FAIRE
     ═══════════════════════════════════════════════════════ -->
<div class="pt-section">
  <div class="pt-section__hd">
    <span class="pt-bar"></span>
    Participations
  </div>
  <div class="pt-section__body">
    <div class="pt-timeline">

      <!-- 2019 -->
      <div class="pt-item">
        <div class="pt-dot"><span></span></div>
        <div class="pt-content">
          <div class="pt-period">October 2019</div>
          <div class="pt-title">Maker Faire Rome — The European Edition</div>
          <div class="pt-org">🇮🇹 Rome, Italy &nbsp;·&nbsp; Maker Faire Rome</div>
          <div class="pt-body">
            <p>Exhibited a hardware robotics project at one of Europe's largest innovation fairs, showcasing maker culture and open-source engineering to a broad public audience.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge">Robotics</span>
            <span class="pt-badge--blue pt-badge">Open Source</span>
          </div>
        </div>
      </div>

      <!-- 2018 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--amber"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--amber">October 2018</div>
          <div class="pt-title">Maker Faire Rome — The European Edition</div>
          <div class="pt-org">🇮🇹 Rome, Italy &nbsp;·&nbsp; Maker Faire Rome</div>
          <div class="pt-body">
            <p>Returned as exhibitor with an updated project iteration, engaging with the international maker community and receiving feedback from engineers and innovators.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--amber pt-badge">Hardware</span>
            <span class="pt-badge">Innovation</span>
          </div>
        </div>
      </div>

      <!-- 2017 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--purple"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--purple">October 2017</div>
          <div class="pt-title">Maker Faire Rome — The European Edition</div>
          <div class="pt-org">🇮🇹 Rome, Italy &nbsp;·&nbsp; Maker Faire Rome</div>
          <div class="pt-body">
            <p>First participation as a young maker, presenting an electronics and embedded systems project and sparking a long-standing passion for building things.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--purple pt-badge">Electronics</span>
            <span class="pt-badge">Embedded Systems</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
