---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

<style>
/* ── Design tokens ── */
:root {
  --cv-navy:   #0d1340;
  --cv-teal:   #38c1b7;
  --cv-blue:   #0a66c2;
  --cv-border: rgba(19,56,68,.10);
  --cv-shadow: 0 4px 20px rgba(19,56,68,.10);
  --cv-radius: 16px;
  --cv-text:   #133844;
  --cv-muted:  rgba(19,56,68,.58);
}

/* ── Section card ── */
.cv-section {
  background: #fff;
  border-radius: var(--cv-radius);
  overflow: hidden;
  box-shadow: var(--cv-shadow);
  border: 1px solid var(--cv-border);
  margin-bottom: 1.4rem;
}
.cv-section__hd {
  background: linear-gradient(135deg, var(--cv-navy) 0%, #151e55 100%);
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.cv-section__hd-icon { font-size: 1.15rem; }
.cv-section__hd-title {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.cv-section__body { padding: 1.4rem 1.6rem; }

/* ── Timeline ── */
.cv-tl { margin: 0; padding: 0; }
.cv-tl-item {
  position: relative;
  padding-left: 1.6rem;
  padding-bottom: 1.5rem;
  border-left: 2px solid rgba(56,193,183,.22);
  margin-left: 0.5rem;
}
.cv-tl-item:last-child { border-left-color: transparent; padding-bottom: 0; }
.cv-tl-item::before {
  content: '';
  position: absolute;
  left: -5px; top: 7px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--cv-teal);
  box-shadow: 0 0 0 3px rgba(56,193,183,.22);
}
.cv-tl-period {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cv-teal);
  margin-bottom: 0.2rem;
}
.cv-tl-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--cv-text);
  margin: 0 0 0.1rem;
  line-height: 1.3;
}
.cv-tl-org {
  font-size: 0.88rem;
  color: var(--cv-muted);
  margin-bottom: 0.55rem;
}
.cv-tl-body {
  font-size: 0.89rem;
  color: var(--cv-text);
  line-height: 1.7;
}
.cv-tl-body p  { margin: 0.2rem 0; }
.cv-tl-body ul { margin: 0.3rem 0 0.4rem 1.1rem; padding: 0; }
.cv-tl-body li { margin-bottom: 0.18rem; }

/* ── Badges ── */
.cv-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  background: rgba(56,193,183,.12);
  border: 1px solid rgba(56,193,183,.32);
  color: #0a7a72;
  border-radius: 999px;
  padding: 0.18rem 0.65rem;
  font-size: 0.74rem;
  font-weight: 700;
  margin: 0.3rem 0.3rem 0 0;
}
.cv-badge--gold  { background: rgba(182,134,44,.10); border-color: rgba(182,134,44,.35); color: #8a5c00; }
.cv-badge--blue  { background: rgba(10,102,194,.10); border-color: rgba(10,102,194,.30); color: #0a66c2; }

/* ── Skill chips ── */
.cv-skill-group { margin-bottom: 0.9rem; }
.cv-skill-group:last-child { margin-bottom: 0; }
.cv-skill-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--cv-muted);
  margin-bottom: 0.4rem;
}
.cv-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.cv-chip {
  background: rgba(13,19,64,.05);
  border: 1px solid rgba(13,19,64,.11);
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.79rem;
  font-weight: 600;
  color: var(--cv-text);
}

/* ── Award rows ── */
.cv-award {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--cv-border);
}
.cv-award:last-child { border-bottom: none; padding-bottom: 0; }
.cv-award__icon { font-size: 1.4rem; flex-shrink: 0; line-height: 1; }
.cv-award__title { font-weight: 700; font-size: 0.93rem; color: var(--cv-text); }
.cv-award__meta  { font-size: 0.82rem; color: var(--cv-muted); margin-top: 0.1rem; }

/* ── Contact grid ── */
.cv-contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.65rem;
}
.cv-contact-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.88rem;
  color: var(--cv-text);
}
.cv-contact-item i { color: var(--cv-teal); width: 18px; text-align: center; flex-shrink: 0; }
.cv-contact-item a { color: var(--cv-blue); text-decoration: none; }
.cv-contact-item a:hover { text-decoration: underline; }

/* ── Pub list ── */
.cv-pub-item {
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--cv-border);
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--cv-text);
}
.cv-pub-item:last-child { border-bottom: none; padding-bottom: 0; }
.cv-pub-item a { color: var(--cv-blue); text-decoration: none; }
.cv-pub-item a:hover { text-decoration: underline; }

/* ── Language row ── */
.cv-lang-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--cv-border);
}
.cv-lang-row:last-child { border-bottom: none; }
.cv-lang-name  { min-width: 90px; font-weight: 700; font-size: 0.9rem; color: var(--cv-text); }
.cv-lang-level {
  background: rgba(56,193,183,.12);
  border: 1px solid rgba(56,193,183,.28);
  color: #0a7a72;
  border-radius: 999px;
  padding: 0.15rem 0.65rem;
  font-size: 0.74rem;
  font-weight: 700;
}
.cv-lang-desc { font-size: 0.83rem; color: var(--cv-muted); }

/* ── Cert list ── */
.cv-cert-item {
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--cv-border);
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--cv-text);
}
.cv-cert-item:last-child { border-bottom: none; }
</style>


<!-- ════════════════════════════════════
     EDUCATION
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">🎓</span>
    <h2 class="cv-section__hd-title">Education</h2>
  </div>
  <div class="cv-section__body">
    <div class="cv-tl">

      <div class="cv-tl-item">
        <div class="cv-tl-period">2025 – 2028</div>
        <div class="cv-tl-title">Ph.D. — Engineering in Computer Science · Artificial Intelligence</div>
        <div class="cv-tl-org">🇮🇹 Sapienza University of Rome &nbsp;·&nbsp; 🇬🇧 University of Cambridge</div>
        <div class="cv-tl-body">
          <p><strong>Supervisor:</strong> <a href="https://www.cst.cam.ac.uk/people/pl219">Prof. Pietro Liò</a> (Cambridge) &nbsp;·&nbsp; <strong>Co-Supervisor:</strong> <a href="https://sites.google.com/diag.uniroma1.it/fabriziosilvestri">Prof. Fabrizio Silvestri</a> (Sapienza)</p>
          <p><strong>Focus:</strong> Graph Neural Networks &amp; Generative AI</p>
          <p><strong>Teaching Assistant:</strong> Supervising 7 MPhil students — Geometric Deep Learning, University of Cambridge</p>
        </div>
      </div>

      <div class="cv-tl-item">
        <div class="cv-tl-period">2023 – 2025</div>
        <div class="cv-tl-title">M.Sc. — Artificial Intelligence &amp; Robotics</div>
        <div class="cv-tl-org">🇮🇹 Sapienza University of Rome</div>
        <div class="cv-tl-body">
          <p><strong>Final mark:</strong> 110 / 110 &nbsp;<span class="cv-badge">🏅 Top marks</span></p>
          <p><strong>Thesis:</strong> <a href="https://arxiv.org/abs/2512.00242"><em>Polynomial Sheaf Diffusion and Equivariant Sheaf Neural Networks</em></a></p>
          <p><strong>Memberships:</strong> <a href="https://alcorlab.diag.uniroma1.it/">ALCOR Lab</a> · <a href="https://sites.google.com/uniroma1.it/ispamm/">ISPAMM Lab</a></p>
          <p><strong>Courses:</strong> AI, Machine Learning, Neural Networks, Robot Programming, Robotics I &amp; II, NeuroEngineering, Computer Vision, Medical Robotics, Reinforcement Learning, Autonomous &amp; Mobile Robotics, Deep Learning, Advanced ML, Generative AI Safety, HRI, Robot Benchmarking &amp; Competitions, Multilingual NLP.</p>
        </div>
      </div>

      <div class="cv-tl-item">
        <div class="cv-tl-period">2020 – 2023</div>
        <div class="cv-tl-title">B.Sc. — Applied Computer Science &amp; Artificial Intelligence</div>
        <div class="cv-tl-org">🇮🇹 Sapienza University of Rome</div>
        <div class="cv-tl-body">
          <p><strong>Final mark:</strong> 110 / 110 with Honours &nbsp;<span class="cv-badge">🏅 Summa cum laude</span></p>
          <p><strong>Thesis:</strong> <em>Building Real-Time Multivariate Anomaly Detection Systems in Industry's 5G Networks</em> — <a href="https://github.com/alessioborgi/Bachelor-s-Thesis">GitHub</a></p>
          <p><strong>Membership:</strong> <a href="https://omnai.di.uniroma1.it/undergrad/">OmniAI Lab</a></p>
          <p><strong>Courses:</strong> Deep Learning, AI Lab &amp; Computer Vision, ML, AI, Web &amp; Software Architecture, Cybersecurity, Programming I/II, Databases, HCI, Networking, OS, Algorithms, Statistics, Startup &amp; Management, Computer Architecture, Calculus I/II/III, Linear Algebra, Physics, Probability, Foundations of CS.</p>
        </div>
      </div>

      <div class="cv-tl-item">
        <div class="cv-tl-period">2015 – 2020</div>
        <div class="cv-tl-title">Secondary School — Information Technology</div>
        <div class="cv-tl-org">🇮🇹 I.I.S. Guglielmo Marconi, Civitavecchia (Rome)</div>
        <div class="cv-tl-body">
          <p><strong>Final mark:</strong> 100 / 100</p>
          <p><strong>Project:</strong> <em>Electric Company: Ticketing System</em> — <a href="https://github.com/alessioborgi/ElectricCompany-TicketingSystem">GitHub</a></p>
        </div>
      </div>

    </div>
  </div>
</div>


<!-- ════════════════════════════════════
     VISITING RESEARCH
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">🌍</span>
    <h2 class="cv-section__hd-title">Visiting Research</h2>
  </div>
  <div class="cv-section__body">
    <div class="cv-tl">

      <div class="cv-tl-item">
        <div class="cv-tl-period">June – July 2025</div>
        <div class="cv-tl-title">Space Robotics — Tohoku University, Space Robotics Lab</div>
        <div class="cv-tl-org">🇯🇵 Sendai, Japan</div>
        <div class="cv-tl-body">
          <p><strong>Supervisor:</strong> <a href="https://astro.mech.tohoku.ac.jp/e/">Prof. Kazuya Yoshida</a></p>
          <p><strong>Project:</strong> <a href="https://github.com/alessioborgi/MoonBot-Navigation"><em>MoonBot Navigation</em></a> — Autonomous lunar robot with Dijkstra-based path planning, visual object detection, custom gripper control.</p>
          <p><span class="cv-badge cv-badge--gold">🏆 Won TESP 2025 Competition</span> <span class="cv-badge">📜 Certificate of Research Excellence</span></p>
        </div>
      </div>

      <div class="cv-tl-item">
        <div class="cv-tl-period">Aug – Sept 2024</div>
        <div class="cv-tl-title">AI &amp; Robotics in Healthcare — Johannes Kepler Universität (JKU)</div>
        <div class="cv-tl-org">🇦🇹 Linz, Austria</div>
        <div class="cv-tl-body">
          <p><strong>Supervisor:</strong> <a href="https://it-u.at/en/persons/team/alexander-steinmaurer/">Prof. Alexander Steinmaurer</a></p>
          <p><strong>Project:</strong> <a href="https://github.com/alessioborgi/CareConnect"><em>CareConnect</em></a> — AI-driven hospital system for environmental data querying, real-time graph generation, and robotic action triggering via LangChain.</p>
          <p><span class="cv-badge cv-badge--gold">🏅 Best Poster &amp; Project Award</span></p>
        </div>
      </div>

    </div>
  </div>
</div>


<!-- ════════════════════════════════════
     WORK EXPERIENCE
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">💼</span>
    <h2 class="cv-section__hd-title">Work Experience</h2>
  </div>
  <div class="cv-section__body">
    <div class="cv-tl">
      <div class="cv-tl-item">
        <div class="cv-tl-period">Mar 2023 – Aug 2023</div>
        <div class="cv-tl-title">AI &amp; ML Software Research Engineer (Intern)</div>
        <div class="cv-tl-org">Hewlett Packard Enterprise (HPE)</div>
        <div class="cv-tl-body">
          <ul>
            <li>Researched <strong>Multivariate Anomaly Detection</strong> over 5G time-series.</li>
            <li>Designed a customer-centered &amp; customer-agnostic workflow from network data integration to anomaly identification; validated with a major network customer.</li>
            <li>Reduced models to train/maintain and lowered design/inference costs while preserving metrics.</li>
          </ul>
          <span class="cv-badge cv-badge--gold">🏆 Best HPE 2023 Paper Award (team)</span>
          <span class="cv-badge">🏅 Honourable Mention — Internal Hackathon</span>
        </div>
      </div>
    </div>
  </div>
</div>


<!-- ════════════════════════════════════
     AWARDS
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">🏆</span>
    <h2 class="cv-section__hd-title">Awards &amp; Achievements</h2>
  </div>
  <div class="cv-section__body">

    <div class="cv-award">
      <div class="cv-award__icon">🏅</div>
      <div>
        <div class="cv-award__title"><a href="https://www.gresearch.com/news/g-research-november-2025-grant-winners/">G-Research Early Career Award</a></div>
        <div class="cv-award__meta">Scholarship for promising young researchers · November 2025</div>
      </div>
    </div>

    <div class="cv-award">
      <div class="cv-award__icon">🚀</div>
      <div>
        <div class="cv-award__title"><a href="/visiting-research/tohoku-2025/">Research Certificate of Excellence — TESP 2025 Winner</a></div>
        <div class="cv-award__meta">Selected as top-1 student for the exchange period · Tohoku University, Japan 2025</div>
      </div>
    </div>

    <div class="cv-award">
      <div class="cv-award__icon">🔐</div>
      <div>
        <div class="cv-award__title">Generative AI Safety Challenge</div>
        <div class="cv-award__meta">Privacy Violation Detection (Individual) &amp; Attack on Data (Team) · Sapienza, 2025</div>
      </div>
    </div>

    <div class="cv-award">
      <div class="cv-award__icon">🧠</div>
      <div>
        <div class="cv-award__title"><a href="https://www.m2lschool.org/past-editions/m2l-2024-italy/posters-2024">Best Poster Award — M2L Summer School</a></div>
        <div class="cv-award__meta">Mediterranean Machine Learning Summer School · Milan, Italy 2024</div>
      </div>
    </div>

    <div class="cv-award">
      <div class="cv-award__icon">📄</div>
      <div>
        <div class="cv-award__title">Best Paper Award (team)</div>
        <div class="cv-award__meta">Hewlett Packard Enterprise PathFinder Team Recognition · 2023</div>
      </div>
    </div>

    <div class="cv-award">
      <div class="cv-award__icon">💡</div>
      <div>
        <div class="cv-award__title">Honourable Mention — HPE Internal Hackathon</div>
        <div class="cv-award__meta">Hewlett Packard Enterprise · 2023</div>
      </div>
    </div>

  </div>
</div>


<!-- ════════════════════════════════════
     SKILLS
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">⚙️</span>
    <h2 class="cv-section__hd-title">Skills</h2>
  </div>
  <div class="cv-section__body">

    <div class="cv-skill-group">
      <div class="cv-skill-label">Programming Languages</div>
      <div class="cv-chips">
        <span class="cv-chip">Python</span><span class="cv-chip">Java</span><span class="cv-chip">C++</span>
        <span class="cv-chip">Matlab</span><span class="cv-chip">RISC-V</span><span class="cv-chip">Go</span>
        <span class="cv-chip">JavaScript</span><span class="cv-chip">VueJS</span><span class="cv-chip">CSS</span>
        <span class="cv-chip">HTML</span><span class="cv-chip">SQL</span><span class="cv-chip">PHP</span>
        <span class="cv-chip">Flutter</span><span class="cv-chip">OpenAPI</span>
      </div>
    </div>

    <div class="cv-skill-group">
      <div class="cv-skill-label">ML / Graph / AI</div>
      <div class="cv-chips">
        <span class="cv-chip">PyTorch</span><span class="cv-chip">TensorFlow</span>
        <span class="cv-chip">Diffusers</span><span class="cv-chip">Transformers (HF)</span>
        <span class="cv-chip">W&amp;B</span><span class="cv-chip">NumPy</span>
        <span class="cv-chip">PySpark</span><span class="cv-chip">Pandas</span><span class="cv-chip">OpenCV</span>
      </div>
    </div>

    <div class="cv-skill-group">
      <div class="cv-skill-label">Robotics &amp; Systems</div>
      <div class="cv-chips">
        <span class="cv-chip">ROS</span><span class="cv-chip">RViz</span>
        <span class="cv-chip">WeBots</span><span class="cv-chip">GMapping</span>
      </div>
    </div>

    <div class="cv-skill-group">
      <div class="cv-skill-label">Tooling &amp; Infrastructure</div>
      <div class="cv-chips">
        <span class="cv-chip">CUDA</span><span class="cv-chip">Git</span><span class="cv-chip">Linux</span>
        <span class="cv-chip">Docker</span><span class="cv-chip">LaTeX</span><span class="cv-chip">Hydra/YAML</span>
        <span class="cv-chip">Streamlit</span><span class="cv-chip">Figma</span><span class="cv-chip">Arduino</span>
        <span class="cv-chip">Raspberry Pi</span><span class="cv-chip">WordPress</span>
      </div>
    </div>

  </div>
</div>


<!-- ════════════════════════════════════
     CERTIFICATIONS
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">📜</span>
    <h2 class="cv-section__hd-title">Certifications</h2>
  </div>
  <div class="cv-section__body">
    <div class="cv-cert-item"><strong>Cambridge Assessment International Education</strong> — First Certificate (B2) &nbsp;<span class="cv-badge cv-badge--blue">ID: B3329535</span></div>
    <div class="cv-cert-item"><strong>Instituto Cervantes</strong> — DELE A1 &nbsp;<span class="cv-badge cv-badge--blue">ID: S6516DL9BAHUJHY248TJ4V4KJ2</span></div>
    <div class="cv-cert-item"><strong>DeepLearning.AI &amp; AWS</strong> — Generative AI with Large Language Models (Coursera) &nbsp;<span class="cv-badge cv-badge--blue">ID: VHCBD26QZP7W</span></div>
    <div class="cv-cert-item"><strong>AWS</strong> — AI &amp; ML Scholarship Program</div>
    <div class="cv-cert-item"><strong>COMAU</strong> — "Use and Programming" Robotic License &nbsp;<span class="cv-badge cv-badge--blue">ID: kDHqAdhwAT</span></div>
    <div class="cv-cert-item"><strong>IBM</strong> — Cloud Core Certification</div>
    <div class="cv-cert-item"><strong>IBM</strong> — Blockchain Essentials Certification</div>
  </div>
</div>


<!-- ════════════════════════════════════
     LANGUAGES
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">🌐</span>
    <h2 class="cv-section__hd-title">Languages</h2>
  </div>
  <div class="cv-section__body">
    <div class="cv-lang-row">
      <span class="cv-lang-name">🇮🇹 Italian</span>
      <span class="cv-lang-level">C2</span>
      <span class="cv-lang-desc">Mother tongue</span>
    </div>
    <div class="cv-lang-row">
      <span class="cv-lang-name">🇬🇧 English</span>
      <span class="cv-lang-level">C1</span>
      <span class="cv-lang-desc">Cambridge First Certificate</span>
    </div>
    <div class="cv-lang-row">
      <span class="cv-lang-name">🇪🇸 Spanish</span>
      <span class="cv-lang-level">A1</span>
      <span class="cv-lang-desc">DELE A1 — Instituto Cervantes</span>
    </div>
  </div>
</div>


<!-- ════════════════════════════════════
     PUBLICATIONS
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">📄</span>
    <h2 class="cv-section__hd-title">Publications</h2>
  </div>
  <div class="cv-section__body">
    <ul style="list-style:none;padding:0;margin:0;">
      {% assign pubs = site.publications | sort: "date" | reverse %}
      {% for post in pubs %}
        {% include archive-single-cv.html %}
      {% endfor %}
    </ul>
  </div>
</div>


<!-- ════════════════════════════════════
     CONTACT
     ════════════════════════════════════ -->
<div class="cv-section">
  <div class="cv-section__hd">
    <span class="cv-section__hd-icon">📬</span>
    <h2 class="cv-section__hd-title">Contact</h2>
  </div>
  <div class="cv-section__body">
    <div class="cv-contact-grid">
      <div class="cv-contact-item">
        <i class="fas fa-envelope"></i>
        <a href="mailto:alessio.borgi@uniroma1.it">alessio.borgi@uniroma1.it</a>
      </div>
      <div class="cv-contact-item">
        <i class="fas fa-envelope"></i>
        <a href="mailto:borgialessio01@gmail.com">borgialessio01@gmail.com</a>
      </div>
      <div class="cv-contact-item">
        <i class="fas fa-envelope"></i>
        <a href="mailto:ab3352@cam.ac.uk">ab3352@cam.ac.uk</a>
      </div>
      <div class="cv-contact-item">
        <i class="fab fa-github"></i>
        <a href="https://github.com/alessioborgi" target="_blank" rel="noopener">alessioborgi</a>
      </div>
      <div class="cv-contact-item">
        <i class="ai ai-google-scholar"></i>
        <a href="https://scholar.google.com/citations?user=Ds4ktdkAAAAJ&hl=it" target="_blank" rel="noopener">Google Scholar</a>
      </div>
      <div class="cv-contact-item">
        <i class="ai ai-orcid"></i>
        <a href="https://orcid.org/0009-0007-1979-0857" target="_blank" rel="noopener">0009-0007-1979-0857</a>
      </div>
    </div>
  </div>
</div>
