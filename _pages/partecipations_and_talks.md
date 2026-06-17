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
  .pt-dot--gold span  { background: var(--pt-amber);  box-shadow: 0 0 0 3px rgba(217,119,6,0.22); }

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
  .pt-title a {
    color: inherit;
    text-decoration: none;
  }
  .pt-title a:hover {
    text-decoration: underline;
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
  .pt-badge--amber {
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

  .pt-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.82rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #0f2a36 0%, #164e63 100%);
    border: 1px solid rgba(56,193,183,0.28);
    color: #ecfeff !important;
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 700;
    box-shadow: 0 8px 18px rgba(15,42,54,0.14);
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  }
  .pt-link-btn:hover {
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: 0 12px 22px rgba(15,42,54,0.18);
    filter: saturate(1.05);
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

      <!-- LoG Italian Meetup 2026 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--purple"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--purple">June 2026</div>
          <div class="pt-title"><a href="https://log-meetup.github.io/" target="_blank" rel="noopener">LoG Italian Meetup 2026 — Learning on Graphs</a></div>
          <div class="pt-org">🇮🇹 Pisa, Italy &nbsp;·&nbsp; University of Pisa</div>
          <div class="pt-body">
            <p>Participated in the LoG Italian Meetup 2026, held on <strong>June 9-11, 2026</strong> at the University of Pisa, presenting work on Polynomial Neural Sheaf Diffusion.</p>
          </div>
          <div class="pt-badges">
            <a class="pt-link-btn" href="/files/LoG_2026/PolyNSD_Poster_LoG.pdf" target="_blank" rel="noopener">🪧 View Poster</a>
            <span class="pt-badge--purple pt-badge">LoG Meetup 2026</span>
            <span class="pt-badge">Poster Presentation</span>
            <span class="pt-badge--blue pt-badge">Graph Learning</span>
          </div>
        </div>
      </div>

      <!-- NEUREASON 2026 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--blue"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--blue">March 2026</div>
          <div class="pt-title"><a href="https://neurmad.github.io/" target="_blank" rel="noopener">NEUREASON'26 — Neural Reasoning for Scientific and Mathematical Discovery</a></div>
          <div class="pt-org">🇬🇧 Cambridge, United Kingdom &nbsp;·&nbsp; Department of Computer Science and Technology, University of Cambridge</div>
          <div class="pt-body">
            <p>Participated in the 2026 workshop on neural reasoning for scientific and mathematical discovery, held on <strong>March 23-24, 2026</strong> at the University of Cambridge.</p>
          </div>
          <div class="pt-badges">
            <a class="pt-link-btn" href="/files/NEUREASON_2026/PolyNSD_Poster_Cambridge.pdf" target="_blank" rel="noopener">🪧 View Poster</a>
            <span class="pt-badge--blue pt-badge">NEUREASON'26</span>
            <span class="pt-badge">Neural Reasoning</span>
            <span class="pt-badge--blue pt-badge">Scientific Discovery</span>
          </div>
        </div>
      </div>

      <!-- SEIO School -->
      <div class="pt-item">
        <div class="pt-dot"><span></span></div>
        <div class="pt-content">
          <div class="pt-period">December 2025</div>
          <div class="pt-title"><a href="https://seio-transporte.github.io/workshop-2025-en/" target="_blank" rel="noopener">SEIO Workshop and PhD School 2025</a></div>
          <div class="pt-org">🇪🇸 Barcelona, Spain &nbsp;·&nbsp; SEIO / Universitat Pompeu Fabra</div>
          <div class="pt-body">
            <p>Participated in the SEIO Workshop and PhD School 2025 focused on <strong>exact methods for vehicle routing and logistics optimisation</strong>, hosted with support from SEIO and Universitat Pompeu Fabra.</p>
            <p>Presented the talk <strong>From Graphs to Sheaves: Modeling Spatial Heterophily in Transportation Networks</strong> during the workshop session on <strong>December 2, 2025</strong>.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge">Transportation Networks</span>
            <span class="pt-badge--blue pt-badge">Workshop Talk</span>
            <span class="pt-badge">Optimisation</span>
          </div>
        </div>
      </div>

      <!-- MMLW 2025 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--purple"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--purple">November 2025</div>
          <div class="pt-title"><a href="https://workshops.eeml.eu/" target="_blank" rel="noopener">MMLW 2025 — Montenegrin Machine Learning Workshop</a></div>
          <div class="pt-org">🇲🇪 Podgorica, Montenegro &nbsp;·&nbsp; EEML Workshops / MAIA</div>
          <div class="pt-body">
            <p>Participated in the one-day Montenegrin Machine Learning Workshop, a satellite event of the EEML summer school series focused on bringing top-tier AI talks and community building to Eastern Europe.</p>
          </div>
          <div class="pt-badges">
            <a class="pt-link-btn" href="/files/MMLW_2025/PolySD_ESNN_EEML_Poster.pdf" target="_blank" rel="noopener">🪧 View Poster</a>
            <span class="pt-badge--purple pt-badge">EEML Workshop</span>
            <span class="pt-badge--blue pt-badge">ML Community</span>
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

      <!-- TESP 2025 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--amber"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--amber">July 2025</div>
          <div class="pt-title"><a href="https://ivy-raisin-5ba.notion.site/TESP-2025-1845e564ed5580c0b197d35fc598a591" target="_blank" rel="noopener">TESP 2025 — Tohoku Engineering Summer Program</a></div>
          <div class="pt-org">🇯🇵 Sendai, Japan &nbsp;·&nbsp; Tohoku University</div>
          <div class="pt-body">
            <p>Participated in the 16-day international summer program at Tohoku University, following the Robotics Course through lectures, laboratory activities, cultural events, and an oral presentation component equivalent to 4 ECTS.</p>
            <p>Built on this experience during the robotics track and later received recognition as <strong>TESP 2025 Winner</strong>.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--gold pt-badge">TESP 2025 Winner</span>
            <span class="pt-badge--amber pt-badge">Robotics Course</span>
            <span class="pt-badge">4 ECTS</span>
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

      <!-- M2L 2024 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--gold"><span></span></div>
        <div class="pt-content">
          <div class="pt-period">September 2024</div>
          <div class="pt-title"><a href="https://www.m2lschool.org/past-editions/m2l-2024-italy" target="_blank" rel="noopener">M2L 2024 — Mediterranean Machine Learning Summer School</a></div>
          <div class="pt-org">🇮🇹 Milan, Italy &nbsp;·&nbsp; Universita di Milano-Bicocca</div>
          <div class="pt-body">
            <p>Participated in the 9-13 September 2024 edition of M2L, covering current machine learning topics through lectures, poster sessions, and interactions with researchers across the Mediterranean ML community.</p>
            <p>Received the <strong>Best Poster Award</strong> for the poster <a href="https://www.m2lschool.org/past-editions/m2l-2024-italy/posters-2024" target="_blank" rel="noopener">A Multi-Reference Style and Multi-Modal Context-Awareness Zero-Shot Style Alignment in Image Generation</a>.</p>
          </div>
          <div class="pt-badges">
            <a class="pt-link-btn" href="/files/M2L_2024/Poster_M2L.pdf" target="_blank" rel="noopener">🪧 View Poster</a>
            <span class="pt-badge--gold pt-badge">Best Poster Award</span>
            <span class="pt-badge">Machine Learning</span>
            <span class="pt-badge--blue pt-badge">Poster Session</span>
          </div>
        </div>
      </div>

      <!-- IT:U Summer School 2024 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--purple"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--purple">August – September 2024</div>
          <div class="pt-title"><a href="https://it-u.at/en/programs/summer-school-2024/projects/care-connect/" target="_blank" rel="noopener">IT:U Summer School 2024 — Care Connect</a></div>
          <div class="pt-org">🇦🇹 Linz, Austria &nbsp;·&nbsp; Interdisciplinary Transformation University Austria</div>
          <div class="pt-body">
            <p>Selected for IT:U’s two-week Summer School 2024 and contributed to <strong>Care Connect</strong>, an AI-powered assistant platform for hospital staff that monitors environmental variables such as air quality, temperature, and humidity through a database-informed LLM and an interactive robotic component.</p>
          </div>
          <div class="pt-badges">
            <span class="pt-badge--purple pt-badge">Care Connect</span>
            <span class="pt-badge">LLM Application</span>
            <span class="pt-badge--blue pt-badge">Human-Centered AI</span>
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
     CONFERENCES
     ═══════════════════════════════════════════════════════ -->
<div class="pt-section">
  <div class="pt-section__hd">
    <span class="pt-bar"></span>
    Conferences Attended
  </div>
  <div class="pt-section__body">
    <div class="pt-timeline">

      <!-- CVPR 2025 -->
      <div class="pt-item">
        <div class="pt-dot pt-dot--purple"><span></span></div>
        <div class="pt-content">
          <div class="pt-period pt-period--purple">June 2025</div>
          <div class="pt-title"><a href="https://cvpr.thecvf.com/Conferences/2025" target="_blank" rel="noopener">CVPR 2025 — IEEE/CVF Conference on Computer Vision and Pattern Recognition</a></div>
          <div class="pt-org">🇺🇸 Nashville, Tennessee, United States &nbsp;·&nbsp; Music City Center</div>
          <div class="pt-body">
            <p>Attended <strong>CVPR 2025</strong>, one of the leading international conferences in computer vision and machine learning.</p>
            <p>Presented the paper <strong>Z-SASLM: Zero-Shot Style-Aligned SLI Blending Latent Manipulation</strong> at the <strong>CVEU Workshop</strong> held in conjunction with CVPR 2025.</p>
          </div>
          <div class="pt-badges">
            <a class="pt-link-btn" href="/files/CVPR_2025/Z-SASLM_Poster.pdf" target="_blank" rel="noopener">🪧 View Poster</a>
            <a class="pt-link-btn" href="/blog/research/zsaslm-paper/">📘 Read the ML Blog Companion</a>
            <span class="pt-badge--purple pt-badge">CVPR 2025</span>
            <span class="pt-badge--blue pt-badge">CVEU Workshop</span>
            <span class="pt-badge">Paper Presentation</span>
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
