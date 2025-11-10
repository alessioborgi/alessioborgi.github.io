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
I’m a PhD student in **Graph Neural Networks and Generative AI**, under the supervision of [Prof. Pietro Liò](https://www.cst.cam.ac.uk/people/pl219) (University of Cambridge). I am also co-supervised by [Prof. Fabrizio Silvestri](https://sites.google.com/diag.uniroma1.it/fabriziosilvestri) (Sapienza University of Rome). I have obtained my Master of Science in *Artificial Intelligence & Robotics* and my Bachelor of Science in *Applied Computer Science and Artificial Intelligence* at Sapienza University of Rome, both with the highest marks. My research sits at the intersection of *Graph Neural Networks*, *Geometric Deep Learning*, *Topological Deep Learning* and *Diffusion Models*, with applications to *Robotics*, *Vision*, and *Biomedical AI*.

<!-- ====================== -->
<!--  At-a-glance Stats     -->
<!-- ====================== -->

<!-- {% assign pubs = site.publications | size | default: 0 %}
{% assign talks = site.talks | size | default: 0 %}
{% assign posts = site.posts | size | default: 0 %}
{% assign projects = site.projects | size | default: 0 %} -->

<!-- ====================== -->
<!--  At-a-glance Stats     -->
<!-- ====================== -->

{% assign gh = site.data.github %}

<section id="gh-stats">
  <style>
    #gh-stats{margin:1.25rem 0}
    #gh-stats .grid{display:grid;gap:1rem}
    #gh-stats .grid.cols-4{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
    #gh-stats .card{border:1px solid var(--mm-grey-300,#e6e6e6);border-radius:14px;background:var(--mm-bg,#fff);
      box-shadow:0 1px 0 rgba(0,0,0,.04)}
    #gh-stats .pad{padding:1rem}
    #gh-stats h3{margin:.35rem 0 .75rem 0}
    #gh-stats .stat{display:flex;align-items:baseline;gap:.5rem}
    #gh-stats .num{font-size:2.1rem;font-weight:800;line-height:1}
    #gh-stats .lab{opacity:.8}
    /* chips */
    #gh-stats .chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem}
    #gh-stats .chip{border:1px solid var(--mm-grey-300,#ddd);border-radius:999px;padding:.18rem .6rem;font-size:.8rem;text-decoration:none}
    #gh-stats .chip:hover{border-color:currentColor;text-decoration:none}
    /* repo grid */
    #gh-stats .repos{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}
    #gh-stats .repo h4{margin:0 0 .4rem 0;font-size:1.05rem}
    #gh-stats .repo p{margin:.2rem 0 .6rem 0}
    #gh-stats .meta{display:flex;gap:.75rem;flex-wrap:wrap;opacity:.85}
    /* heatmap */
    #gh-stats .heatmap img{max-width:100%;height:auto;border-radius:8px;border:1px solid var(--mm-grey-300,#e6e6e6)}
    @media (prefers-color-scheme: dark){
      #gh-stats .heatmap img{filter: invert(1) hue-rotate(180deg) contrast(1.1)}
    }
  </style>

  <!-- KPI Cards -->
  <div class="grid cols-4">
    <div class="card">
      <div class="pad">
        <div class="lab">Total Stars</div>
        <div class="stat">
          <div class="num">
            {% if gh and gh.total_stars %}{{ gh.total_stars }}{% else %}—{% endif %}
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="pad">
        <div class="lab">Total Forks</div>
        <div class="stat">
          <div class="num">
            {% if gh and gh.total_forks %}{{ gh.total_forks }}{% else %}—{% endif %}
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="pad">
        <div class="lab">Public Repos</div>
        <div class="stat">
          <div class="num">
            {% if gh and gh.public_repos %}{{ gh.public_repos }}{% else %}—{% endif %}
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="pad">
        <div class="lab">Followers</div>
        <div class="stat">
          <div class="num">
            {% if gh and gh.followers %}{{ gh.followers }}{% else %}—{% endif %}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Top Languages + Heatmap -->
  <div class="grid" style="margin-top:1rem">
    <div class="card">
      <div class="pad">
        <h3>Top Languages</h3>
        <p class="lab" style="margin-bottom:0">
          {% if gh and gh.top_languages %}
            <!-- if later you make your action dump languages, render them here -->
            {% for lang in gh.top_languages %}
              <span class="chip">{{ lang.name }} ({{ lang.percent }}%)</span>
            {% endfor %}
          {% else %}
            Not available (build step didn’t export languages).
          {% endif %}
        </p>
      </div>
    </div>

    <div class="card">
      <div class="pad heatmap">
        <h3>Contribution Heatmap</h3>
        <img id="gh-heatmap" alt="GitHub contribution heatmap"
             src="https://github-readme-activity-graph.vercel.app/graph?username=alessioborgi&hide_border=true&radius=8&area=true&theme=github-light"/>
        <div class="lab" style="margin-top:.4rem">Source: GitHub contributions (last 1y)</div>
      </div>
    </div>
  </div>

  <!-- Popular Repositories -->
  <div class="card" style="margin-top:1rem">
    <div class="pad">
      <h3>Popular Repositories</h3>
      <p class="lab">
        {% if gh and gh.popular_repos %}
          <!-- if your action writes them -->
          <div class="repos">
            {% for repo in gh.popular_repos %}
              <div class="repo card">
                <div class="pad">
                  <h4><a href="{{ repo.html_url }}" target="_blank" rel="noopener">{{ repo.name }}</a></h4>
                  <p>{{ repo.description }}</p>
                  <div class="meta">
                    <span>⭐ {{ repo.stars }}</span>
                    <span>🍴 {{ repo.forks }}</span>
                  </div>
                </div>
              </div>
            {% endfor %}
          </div>
        {% else %}
          You can make the GitHub Action also dump a list of repos to <code>_data/github.json</code> and it will show here.
        {% endif %}
      </p>
    </div>
  </div>

  <script>
    // keep just the light/dark swap for the external SVG
    (function() {
      const heat = document.getElementById('gh-heatmap');
      if (!heat) return;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      const update = () => {
        const theme = prefersDark.matches ? 'github-dark' : 'github-light';
        heat.src = `https://github-readme-activity-graph.vercel.app/graph?username=alessioborgi&hide_border=true&radius=8&area=true&theme=${theme}`;
      };
      update();
      prefersDark && prefersDark.addEventListener('change', update);
    })();
  </script>
</section>

<!-- ====== /GITHUB STATS ====== -->

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