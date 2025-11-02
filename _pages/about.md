---
permalink: /
title: "Alessio Borgi - About"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<div class="notice--primary">
  <h3>🚀 I’m always open to collaborate, exchange ideas or just talk about anything!</h3>
  <p><strong>I’m eager to work with anyone who has great ideas, wants to learn more and more and also share their experience to others.</strong> Don’t hesitate to write me if you’d like to propose your help or ask for mine on a project, research, paper-idea, or a moonshot you’re cooking up.</p>
  <p>👉 <a href="mailto:alessio.borgi@uniroma1.it" class="btn btn--primary">Email Me ✉️</a></p>
</div>

---

## Hi, I’m Alessio 👋
I’m a PhD student in **Graph Neural Networks and Generative AI**, under the supervision of [Prof. Pietro Liò](https://www.cst.cam.ac.uk/people/pl219) (University of Cambridge) and [Prof. Fabrizio Silvestri](https://sites.google.com/diag.uniroma1.it/fabriziosilvestri) (Sapienza University of Rome). I have obtained my Master of Science in *Artificial Intelligence & Robotics* and my Bachelor of Science in *Applied Computer Science and Artificial Intelligence* at Sapienza University of Rome, both with the highest marks. My research sits at the intersection of *Graph Neural Networks*, *Geometric Deep Learning*, and *Diffusion Models*, with applications to *Robotics*, *Vision*, and *Biomedical AI*.

<!-- ====================== -->
<!--  At-a-glance Stats     -->
<!-- ====================== -->

{% assign pubs = site.publications | size | default: 0 %}
{% assign talks = site.talks | size | default: 0 %}
{% assign posts = site.posts | size | default: 0 %}
{% assign projects = site.projects | size | default: 0 %}

<style>
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin:1.25rem 0}
.stat-card{border:1px solid var(--mm-grey-300,#e6e6e6);border-radius:12px;padding:1rem;background:var(--mm-bg,#fff);box-shadow:0 1px 0 rgba(0,0,0,.03)}
.stat-num{font-size:2rem;line-height:1.1;font-weight:800;margin:0}
.stat-lab{opacity:.8;margin-top:.25rem}
.badges{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem}
.focus-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
.focus-card{border:1px solid var(--mm-grey-300,#e6e6e6);border-radius:12px;padding:1rem;background:var(--mm-bg,#fff)}
.chips{display:flex;flex-wrap:wrap;gap:.5rem}
.chip{border:1px solid var(--mm-grey-300,#ddd);border-radius:999px;padding:.2rem .65rem;font-size:.85rem;text-decoration:none}
.chip:hover{border-color:currentColor;text-decoration:none}
.featured{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1rem}
.card{border:1px solid var(--mm-grey-300,#e6e6e6);border-radius:12px;padding:1rem;background:var(--mm-bg,#fff)}
.card h4{margin-top:0}
</style>

### At a glance
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-num">{{ pubs }}</div>
    <div class="stat-lab">Publications</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">{{ talks }}</div>
    <div class="stat-lab">Talks & Workshops</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">{{ projects }}</div>
    <div class="stat-lab">Projects (site collection)</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">{{ posts }}</div>
    <div class="stat-lab">Blog Posts</div>
    <div class="badges">
      <img src="https://img.shields.io/github/followers/alessioborgi?label=GitHub%20followers&style=flat" alt="GitHub followers badge">
    </div>
  </div>
</div>

---

## What I’m into right now
<div class="focus-grid">
  <div class="focus-card">
    <h4>🧮 Equivariant Sheaf NNs</h4>
    Fiber-aware transports, E(n)-equivariance, and **polynomial/sheaf diffusion** for controllable generation.
    <div class="chips" style="margin-top:.5rem">
      <span class="chip">Equivariance</span><span class="chip">Sheaf Theory</span><span class="chip">Spectral Filters</span>
    </div>
  </div>
  <div class="focus-card">
    <h4>🎨 Diffusion Models</h4>
    Multi-style conditioning, **latent manipulation**, and stable **zero-shot style alignment**.
    <div class="chips" style="margin-top:.5rem">
      <span class="chip">Latent Space</span><span class="chip">Style Alignment</span><span class="chip">Zero-shot</span>
    </div>
  </div>
  <div class="focus-card">
    <h4>🧠 Graphs everywhere</h4>
    Protein/structure generation, heterophily benchmarks, EEG/brain graphs & interpretability.
    <div class="chips" style="margin-top:.5rem">
      <span class="chip">GNNs</span><span class="chip">BioAI</span><span class="chip">Heterophily</span>
    </div>
  </div>
  <div class="focus-card">
    <h4>🤖 Robotics</h4>
    Kinematics & dynamics, planning, simulation-to-real pipelines, and control under constraints.
    <div class="chips" style="margin-top:.5rem">
      <span class="chip">Planning</span><span class="chip">Control</span><span class="chip">SLAM</span>
    </div>
  </div>
</div>

---

## Recent publications
<ul>
{% for pub in site.publications reversed limit:3 %}
  {% include archive-single.html %}
{% endfor %}
</ul>

<p><a class="btn" href="/publications/">View all publications →</a></p>

---

## Open-source spotlights
<div class="featured">
  <div class="card">
    <h4>Z-SASLM</h4>
    Zero-shot, fine-tuning-free **style alignment** via SLI latent blending.
    <p>
      <a href="https://alessioborgi.github.io/Z-SASLM.github.io/">Project</a> ·
      <a href="https://openaccess.thecvf.com/content/CVPR2025W/CVEU/papers/Borgi_Z-SASLM_Zero-Shot_Style-Aligned_SLI_Blending_Latent_Manipulation_CVPRW_2025_paper.pdf">Paper</a>
    </p>
  </div>
  <div class="card">
    <h4>CareConnect</h4>
    Chat + graphs to orchestrate environment/hospital data and **robotic actions**.
    <p>
      <a href="https://github.com/alessioborgi/CareConnect">GitHub</a>
      <img src="https://img.shields.io/github/stars/alessioborgi/CareConnect?style=social" alt="CareConnect stars">
    </p>
  </div>
  <div class="card">
    <h4>MoonBot Navigation</h4>
    Autonomous lunar navigation & interaction; planning + onboard vision.
    <p>
      <a href="https://github.com/alessioborgi/MoonBot-Navigation">GitHub</a>
      <img src="https://img.shields.io/github/stars/alessioborgi/MoonBot-Navigation?style=social" alt="MoonBot stars">
    </p>
  </div>
  <div class="card">
    <h4>XGNN GraphGenRL</h4>
    Policy-based **model-level explanations** via graph generation.
    <p>
      <a href="https://github.com/alessioborgi/XGNN_GraphGenRL">GitHub</a>
      <img src="https://img.shields.io/github/stars/alessioborgi/XGNN_GraphGenRL?style=social" alt="XGNN GraphGenRL stars">
    </p>
  </div>
</div>

<p style="margin-top:.5rem">
  More code: <a href="https://github.com/alessioborgi">github.com/alessioborgi</a>
</p>

---

## How I like to collaborate
- **Clear goals, fast iterations** — short sprints, public ablations, reproducible seeds.  
- **Transparent repos** — tidy READMEs, configs, and **W&B** (or similar) logs.  
- **Strong baselines** — fair comparisons, stats tests, and error analysis over cherry-picked plots.  
- **Write it as we build** — draft notes, figures, and bib entries early; keep LaTeX in sync with code.

If that resonates, let’s build something together →  
**<a href="mailto:borgialessio01@gmail.com">borgialessio01@gmail.com</a> · <a href="https://github.com/alessioborgi">GitHub</a> · <a href="https://scholar.google.com/citations?user=Ds4ktdkAAAAJ&hl=it">Google Scholar</a>**

---

## A few things I’m exploring next
<div class="chips">
  <span class="chip">Equivariant Sheaf Diffusion</span>
  <span class="chip">Protein/Graph Generation</span>
  <span class="chip">Sheaf-aware EEG Pipelines</span>
  <span class="chip">Robotics + GenAI bridges</span>
  <span class="chip">Mechanistic interpretability for GNNs</span>
</div>

---

### Quick links
- 📄 **CV** — <a href="/assets/Alessio_Borgi_CV_Short.pdf">download</a>  
- 🧪 **Publications** — <a href="/publications/">browse</a>  
- 🧱 **Projects** — <a href="/projects/">code & demos</a>  
- 🎤 **Participation & Talks** — <a href="/participation-talks/">events & slides</a>  

<!-- Optional JSON-LD to strengthen SEO; harmless if jekyll-seo-tag is already present -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Alessio Borgi",
  "url": "https://alessioborgi.github.io/",
  "sameAs": [
    "https://github.com/alessioborgi",
    "https://scholar.google.com/citations?user=Ds4ktdkAAAAJ"
  ],
  "email": "mailto:borgialessio01@gmail.com",
  "jobTitle": "AI & Robotics Researcher",
  "affiliation": "Sapienza University of Rome"
}
</script>