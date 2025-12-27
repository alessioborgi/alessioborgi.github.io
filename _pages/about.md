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
I’m a PhD student in **Graph Neural Networks and Generative AI**, under the supervision of [Prof. Pietro Liò](https://www.cst.cam.ac.uk/people/pl219) (University of Cambridge) and co-supervised by [Prof. Fabrizio Silvestri](https://sites.google.com/diag.uniroma1.it/fabriziosilvestri) (Sapienza University of Rome). I have obtained my Master of Engineering in *Artificial Intelligence & Robotics* and my Bachelor of Engineering in *Applied Computer Science and Artificial Intelligence* at Sapienza University of Rome, both with the highest marks. My research sits at the intersection of *Graph Neural Networks*, *Geometric Deep Learning*, *Topological Deep Learning* and *Diffusion Models*, with applications to *Robotics*, *Vision*, and *Biomedical AI*.

<!-- ====================== -->
<!--  At-a-glance Stats     -->
<!-- ====================== -->

<!-- {% assign pubs = site.publications | size | default: 0 %}
{% assign talks = site.talks | size | default: 0 %}
{% assign posts = site.posts | size | default: 0 %}
{% assign projects = site.projects | size | default: 0 %} -->


---
## Places I've Been
{% assign places = site.data.map_places | default: [] %}
<style>
  #world-map { height: 480px; border-radius: 12px; overflow: hidden; border: 1px solid #d5dfee; margin-top: 0.5rem; }
  .map-legend { display: inline-flex; align-items: center; gap: 0.7rem; margin-top: 0.5rem; flex-wrap: wrap; }
  .map-legend .dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; margin-right: 0.3rem; border: 1px solid rgba(0,0,0,0.12); }
</style>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<div id="world-map"></div>
<div class="map-legend">
  <span><span class="dot" style="background:#0d9488;"></span>Home</span>
  <span><span class="dot" style="background:#0a66c2;"></span>Study</span>
  <span><span class="dot" style="background:#f59e0b;"></span>Holiday</span>
</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  (function() {
    if (!document.getElementById('world-map')) return;
    if (!window.L) {
      console.warn('Leaflet failed to load. Check network/extension blocks.');
      return;
    }
    var places = [
      {% for p in places %}
      {
        name: {{ p.name | jsonify }},
        subtitle: {{ p.subtitle | default: "" | jsonify }},
        type: {{ p.type | default: "study" | jsonify }},
        lat: {{ p.lat | default: 0 }},
        lng: {{ p.lng | default: 0 }},
        note: {{ p.note | default: "" | jsonify }},
        date: {{ p.date | default: "" | jsonify }},
        radius: {{ p.radius | default: "null" | jsonify }},
        zoom_min: {{ p.zoom_min | default: "null" | jsonify }}
      }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ];

    var typeColors = { home: '#0d9488', study: '#0a66c2', holiday: '#f59e0b' };
    var map = L.map('world-map', { zoomControl: true, scrollWheelZoom: false }).setView([20, 5], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var markers = [];
    function num(val, fallback) {
      var n = Number(val);
      return isNaN(n) ? fallback : n;
    }
    places.forEach(function(p) {
      if (!p.lat || !p.lng) return;
      var color = typeColors[p.type] || typeColors.study;
      var radius = p.radius ? num(p.radius, (p.type === 'home' ? 9 : 8)) : (p.type === 'home' ? 9 : 8);
      var minZoom = (p.zoom_min || p.zoom_min === 0) ? num(p.zoom_min, 2) : 2;
      var marker = L.circleMarker([p.lat, p.lng], {
        radius: radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2
      }).addTo(map);
      marker._lpMeta = {
        baseStyle: { radius: radius, color: color, fillColor: color, fillOpacity: 0.9, weight: 2, opacity: 1 },
        hiddenStyle: { radius: radius, color: color, fillColor: color, fillOpacity: 0, opacity: 0 },
        minZoom: minZoom
      };
      var lines = [];
      if (p.name) lines.push('<strong>' + p.name + '</strong>');
      if (p.subtitle) lines.push(p.subtitle);
      if (p.note) lines.push(p.note);
      if (p.date) lines.push('Years: ' + p.date);
      marker.bindTooltip(lines.join('<br>'), { direction: 'top', sticky: true, className: 'map-tooltip' });
      markers.push(marker);
    });

    function updateVisibility() {
      var z = map.getZoom();
      markers.forEach(function(m) {
        var meta = m._lpMeta || {};
        var visible = z >= (meta.minZoom || 2);
        m.setStyle(visible ? meta.baseStyle : meta.hiddenStyle);
      });
    }
    map.on('zoomend', updateVisibility);
    updateVisibility();
    console.log('Map pins loaded:', markers.length);
  })();
</script>

---
## Recent publications
{% assign z_pub = site.publications | where: "slug", "z-saslm" | first %}
{% assign recent_pubs = site.publications | sort: "date" | reverse %}
<ul>
  {% if z_pub %}
    {% include archive-single.html post=z_pub %}
  {% endif %}
  {% for pub in recent_pubs %}
    {% if z_pub and pub.slug == z_pub.slug %}
      {% continue %}
    {% endif %}
    {% include archive-single.html post=pub %}
    {% if forloop.index == 3 %}{% break %}{% endif %}
  {% endfor %}
</ul>

<p><a class="btn" href="/publications/">View all publications →</a></p>

---
## Latest Blog Post
{% assign latest_lp = site.data.linkedin_posts | first %}
<style>
  .home-linkedin-card {
    border: 1px solid #c7d4f2;
    border-radius: 14px;
    padding: 1.1rem 1.3rem;
    box-shadow: 0 6px 16px rgba(19, 56, 68, 0.1);
    background: linear-gradient(145deg, #e8fbfb 0%, #b0b9f1 100%);
    margin-bottom: 0.75rem;
  }
  .home-linkedin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.65rem;
  }
  .home-linkedin-title {
    font-weight: 800;
    font-size: 1.1rem;
    margin: 0;
  }
  .home-linkedin-subtitle {
    margin: 0.1rem 0 0;
    font-size: 0.98rem;
    font-weight: 600;
    color: #123147;
  }
  .home-linkedin-meta {
    margin-top: 0.15rem;
  }
  .home-linkedin-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.65rem 1rem;
    background: linear-gradient(135deg, #0a66c2, #0f7ddf);
    color: #fff;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 800;
    letter-spacing: 0.02em;
    box-shadow: 0 6px 16px rgba(10, 102, 194, 0.3);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .home-linkedin-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(10, 102, 194, 0.35);
  }
  .home-linkedin-embed {
    width: 100%;
    border: none;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }
</style>
{% if latest_lp %}
  <div class="home-linkedin-card">
    <div class="home-linkedin-header">
      <div>
        {% if latest_lp.title %}<div class="home-linkedin-title">{{ latest_lp.title }}</div>{% endif %}
        {% if latest_lp.subtitle %}<div class="home-linkedin-subtitle">{{ latest_lp.subtitle }}</div>{% endif %}
        {% if latest_lp.date or latest_lp.place %}
          <div class="page__meta home-linkedin-meta">
            {% if latest_lp.date %}{{ latest_lp.date }}{% endif %}
            {% if latest_lp.date and latest_lp.place %} • {% endif %}
            {% if latest_lp.place %}{{ latest_lp.place }}{% endif %}
          </div>
        {% endif %}
      </div>
      {% if latest_lp.url %}
        <a class="home-linkedin-btn" href="{{ latest_lp.url }}" target="_blank" rel="noopener">
          <i class="fab fa-linkedin" aria-hidden="true"></i>
          <span>See on LinkedIn</span>
        </a>
      {% endif %}
    </div>
    {% if latest_lp.embed_url %}
      {% assign embed_height = latest_lp.height | default: '1300px' %}
      <iframe class="home-linkedin-embed" src="{{ latest_lp.embed_url }}" style="height: {{ embed_height }};" height="{{ embed_height }}" frameborder="0" allowfullscreen title="{{ latest_lp.title | default: 'LinkedIn post' }}"></iframe>
    {% else %}
      <a href="{{ latest_lp.url }}" target="_blank" rel="noopener">{{ latest_lp.title | default: latest_lp.url }}</a>
    {% endif %}
  </div>
{% else %}
  <p>No blog posts yet.</p>
{% endif %}

<p style="text-align: center; margin: 1rem 0;">
  <a class="btn" style="font-size: 1.05rem; padding: 0.75rem 1.25rem;" href="/blog/">View all Blog Posts →</a>
</p>

---
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
    /* languages */
    #gh-stats .langs{display:flex;flex-direction:column;gap:.65rem}
    #gh-stats .lang-row{display:flex;align-items:center;gap:.75rem}
    #gh-stats .lang-name{min-width:120px;font-weight:600}
    #gh-stats .lang-bar{flex:1;height:10px;border-radius:999px;background:var(--mm-grey-200,#e9ecf0);position:relative;overflow:hidden}
    #gh-stats .lang-bar span{display:block;height:100%;background:#00bdb6;}
    #gh-stats .lang-percent{min-width:40px;text-align:right;font-variant-numeric:tabular-nums}
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
        <h3>Top Languages <img src="{{ '/images/github.png' | relative_url }}" alt="GitHub" style="height:18px;vertical-align:middle;margin-left:6px;"></h3>
        {% if gh and gh.top_languages %}
          <div class="langs">
            {% for lang in gh.top_languages %}
              <div class="lang-row">
                <div class="lang-name">{{ lang.name }}</div>
                <div class="lang-bar"><span style="width: {{ lang.percent }}%"></span></div>
                <div class="lang-percent">{{ lang.percent }}%</div>
              </div>
            {% endfor %}
          </div>
        {% else %}
          <div class="lab" style="margin-bottom:0">
            <a href="https://github.com/alessioborgi" target="_blank" rel="noopener">
              <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=alessioborgi&layout=donut-vertical&hide_border=true&title_color=133844&text_color=133844&bg_color=f5f7fb&langs_count=8" alt="Top languages chart for alessioborgi" style="width:100%;max-width:420px;border-radius:8px;">
            </a>
          </div>
        {% endif %}
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
      <h3>Popular Repositories <img src="{{ '/images/github.png' | relative_url }}" alt="GitHub" style="height:18px;vertical-align:middle;margin-left:6px;"></h3>
      <p class="lab">
        {% if gh and gh.popular_repos %}
          <!-- if your action writes them -->
          <div class="repos">
            {% for repo in gh.popular_repos limit:12 %}
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


<!-- ## A few things I’m exploring next
<div class="chips">
  <span class="chip">Equivariant Sheaf Diffusion</span>
  <span class="chip">Protein/Graph Generation</span>
  <span class="chip">Sheaf-aware EEG Pipelines</span>
  <span class="chip">Robotics + GenAI bridges</span>
  <span class="chip">Mechanistic interpretability for GNNs</span>
</div>

--- -->
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
