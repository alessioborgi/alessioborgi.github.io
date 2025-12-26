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
