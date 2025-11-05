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
I’m a PhD student in **Graph Neural Networks and Generative AI**, under the supervision of [Prof. Pietro Liò](https://www.cst.cam.ac.uk/people/pl219) (University of Cambridge). I am also co-supervised by [Prof. Fabrizio Silvestri](https://sites.google.com/diag.uniroma1.it/fabriziosilvestri) (Sapienza University of Rome). I have obtained my Master of Science in *Artificial Intelligence & Robotics* and my Bachelor of Science in *Applied Computer Science and Artificial Intelligence* at Sapienza University of Rome, both with the highest marks. My research sits at the intersection of *Graph Neural Networks*, *Geometric Deep Learning*, and *Diffusion Models*, with applications to *Robotics*, *Vision*, and *Biomedical AI*.

<!-- ====================== -->
<!--  At-a-glance Stats     -->
<!-- ====================== -->

<!-- {% assign pubs = site.publications | size | default: 0 %}
{% assign talks = site.talks | size | default: 0 %}
{% assign posts = site.posts | size | default: 0 %}
{% assign projects = site.projects | size | default: 0 %} -->

<section id="gh-stats" data-username="alessioborgi" data-token="">
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
    /* skeleton */
    #gh-stats .skeleton{position:relative;overflow:hidden;background:linear-gradient(90deg,rgba(0,0,0,.06),rgba(0,0,0,.03),rgba(0,0,0,.06));min-height:24px;border-radius:8px}
    #gh-stats .skeleton::after{content:"";position:absolute;inset:0;animation:shine 1.2s infinite;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)}
    @keyframes shine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
    /* chips */
    #gh-stats .chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem}
    #gh-stats .chip{border:1px solid var(--mm-grey-300,#ddd);border-radius:999px;padding:.18rem .6rem;font-size:.8rem;text-decoration:none}
    #gh-stats .chip:hover{border-color:currentColor;text-decoration:none}
    /* repo grid */
    #gh-stats .repos{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}
    #gh-stats .repo h4{margin:0 0 .4rem 0;font-size:1.05rem}
    #gh-stats .repo p{margin:.2rem 0 .6rem 0}
    #gh-stats .meta{display:flex;gap:.75rem;flex-wrap:wrap;opacity:.85}
    #gh-stats .meta .dot{width:.6rem;height:.6rem;border-radius:50%;display:inline-block;margin-right:.35rem;vertical-align:middle}
    /* language bars */
    #gh-stats .lang-row{display:flex;align-items:center;gap:.5rem;margin:.35rem 0}
    #gh-stats .lang-name{min-width:120px;font-size:.9rem}
    #gh-stats .bar{flex:1;height:.65rem;border-radius:999px;background:var(--mm-grey-200,#eee);overflow:hidden}
    #gh-stats .bar > span{display:block;height:100%}
    /* heatmap */
    #gh-stats .heatmap img{max-width:100%;height:auto;border-radius:8px;border:1px solid var(--mm-grey-300,#e6e6e6)}
    @media (prefers-color-scheme: dark){
      #gh-stats .heatmap img{filter: invert(1) hue-rotate(180deg) contrast(1.1)}
    }
  </style>

  <!-- KPI Cards -->
  <div class="grid cols-4">
    <div class="card"><div class="pad"><div class="lab">Total Stars</div><div class="stat"><div class="num" id="gh-stars">—</div></div></div></div>
    <div class="card"><div class="pad"><div class="lab">Total Forks</div><div class="stat"><div class="num" id="gh-forks">—</div></div></div></div>
    <div class="card"><div class="pad"><div class="lab">Public Repos</div><div class="stat"><div class="num" id="gh-repos">—</div></div></div></div>
    <div class="card"><div class="pad"><div class="lab">Followers</div><div class="stat"><div class="num" id="gh-followers">—</div></div></div></div>
  </div>

  <!-- Top Languages + Heatmap -->
  <div class="grid" style="margin-top:1rem">
    <div class="card"><div class="pad">
      <h3>Top Languages</h3>
      <div id="gh-langs"><div class="skeleton" style="height:120px"></div></div>
      <div class="chips" id="gh-lang-chips"></div>
    </div></div>

    <div class="card"><div class="pad heatmap">
      <h3>Contribution Heatmap</h3>
      <!-- robust, auto-updating SVG -->
      <img id="gh-heatmap" alt="GitHub contribution heatmap"
           src="https://github-readme-activity-graph.vercel.app/graph?username=alessioborgi&hide_border=true&radius=8&area=true&theme=github-light"/>
      <div class="lab" style="margin-top:.4rem">Source: GitHub contributions (last 1y)</div>
    </div></div>
  </div>

  <!-- Popular Repositories (auto, like pinned) -->
  <div class="card" style="margin-top:1rem"><div class="pad">
    <h3>Popular Repositories</h3>
    <div class="repos" id="gh-repos-grid">
      <div class="skeleton" style="height:140px"></div>
      <div class="skeleton" style="height:140px"></div>
      <div class="skeleton" style="height:140px"></div>
    </div>
  </div></div>

  <script>
    (function(){
      const root = document.getElementById('gh-stats');
      if(!root) return;
      const u = root.dataset.username || 'alessioborgi';
      const token = (root.dataset.token || '').trim(); // optional PAT for reliability

      const el = sel => root.querySelector(sel);
      const fmt = n => (typeof n === 'number') ? n.toLocaleString(undefined) : '—';

      // ---- API helpers (avoid preflight; only safe headers) ----
      const baseHeaders = token ? { 'Accept':'application/vnd.github+json', 'Authorization':'Bearer '+token } 
                                : { 'Accept':'application/vnd.github+json' };

      const gh = (url) => fetch(url, { headers: baseHeaders, mode:'cors', cache:'no-store' })
        .then(r=>{
          if(!r.ok) throw new Error(r.status+': '+r.statusText);
          return r.json().then(data=>({data,headers:r.headers}));
        });

      // paginate through all repos
      const fetchAllRepos = async () => {
        let page=1, out=[];
        while(true){
          const {data,headers} = await gh(`https://api.github.com/users/${u}/repos?per_page=100&type=owner&sort=updated&page=${page}`);
          out = out.concat(data);
          // stop if <100 or no Link: next
          const link = headers.get('Link') || '';
          if(data.length < 100 || !/rel="next"/.test(link)) break;
          page++;
          if(page>10) break; // safety cap
        }
        return out;
      };

      // small language palette
      const langColor = name => ({
        "Python":"#3572A5","Jupyter Notebook":"#DA5B0B","MATLAB":"#e16737","C++":"#f34b7d","C":"#555555",
        "JavaScript":"#f1e05a","TypeScript":"#3178c6","HTML":"#e34c26","CSS":"#563d7c","Shell":"#89e051",
        "Go":"#00ADD8","Rust":"#dea584","Scala":"#c22d40","Julia":"#a270ba","TeX":"#3D6117","R":"#198CE7"
      })[name] || "#6a9fb5";

      // main
      Promise.all([
        gh(`https://api.github.com/users/${u}`),
        fetchAllRepos()
      ]).then(([userResp, repos])=>{
        const user = userResp.data || {};

        // KPIs
        const stars = repos.reduce((a,r)=>a+(r.stargazers_count||0),0);
        const forks = repos.reduce((a,r)=>a+(r.forks_count||0),0);
        el('#gh-stars').textContent     = fmt(stars);
        el('#gh-forks').textContent     = fmt(forks);
        el('#gh-repos').textContent     = fmt(user.public_repos || repos.length || 0);
        el('#gh-followers').textContent = fmt(user.followers || 0);

        // Popular repos (top by stars, originals only)
        const top = repos.filter(r=>!r.fork)
                         .sort((a,b)=>(b.stargazers_count||0)-(a.stargazers_count||0))
                         .slice(0,6);
        const grid = el('#gh-repos-grid');
        grid.innerHTML = '';
        top.forEach(r=>{
          const lang = r.language || '—';
          const card = document.createElement('div');
          card.className = 'repo card';
          card.innerHTML = `
            <div class="pad">
              <h4><a href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a></h4>
              <p>${(r.description||'').replace(/</g,'&lt;')}</p>
              <div class="meta">
                <span><span class="dot" style="background:${langColor(lang)}"></span>${lang}</span>
                <span>⭐ ${fmt(r.stargazers_count||0)}</span>
                <span>🍴 ${fmt(r.forks_count||0)}</span>
                <span>🕒 ${new Date(r.pushed_at).toLocaleDateString()}</span>
              </div>
            </div>`;
          grid.appendChild(card);
        });

        // Top languages (weighted by stars across all repos)
        const weights = {};
        repos.forEach(r=>{
          const l = r.language || 'Other';
          const w = Math.max(1, r.stargazers_count||0);
          weights[l] = (weights[l]||0) + w;
        });
        const entries = Object.entries(weights).filter(([k,v])=>v>0);
        const totalW = entries.reduce((a,[_l,v])=>a+v,0) || 1;
        const topLangs = entries.sort((a,b)=>b[1]-a[1]).slice(0,6);

        const wrap = el('#gh-langs');
        wrap.innerHTML = '';
        topLangs.forEach(([name,val])=>{
          const pct = Math.round((val/totalW)*100);
          const row = document.createElement('div');
          row.className = 'lang-row';
          row.innerHTML = `
            <div class="lang-name">${name}</div>
            <div class="bar"><span style="width:${pct}%;background:${langColor(name)}"></span></div>
            <div class="lab">${pct}%</div>`;
          wrap.appendChild(row);
        });

        const chips = el('#gh-lang-chips');
        chips.innerHTML = '';
        topLangs.forEach(([name])=>{
          const span = document.createElement('span');
          span.className = 'chip';
          span.textContent = name;
          chips.appendChild(span);
        });
      }).catch(err=>{
        console.error('GitHub stats error:', err);
        el('#gh-repos-grid').innerHTML = `<p class="lab">Couldn’t load live GitHub stats (rate limit or network). Try again later.</p>`;
      });

      // Dark/light heatmap theme swap (optional)
      const heat = document.getElementById('gh-heatmap');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      const setHeat = () => {
        const theme = prefersDark.matches ? 'github-dark' : 'github-light';
        heat.src = `https://github-readme-activity-graph.vercel.app/graph?username=${u}&hide_border=true&radius=8&area=true&theme=${theme}`;
      };
      setHeat(); prefersDark && prefersDark.addEventListener('change', setHeat);
    })();
  </script>
</section>
<!-- ====== /GITHUB STATS ====== -->
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