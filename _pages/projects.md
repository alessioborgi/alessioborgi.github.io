---
layout: archive
title: "Projects"
permalink: /projects/
author_profile: true
---

{% include base_path %}

<div class="notice--primary">
  <h3>Selected Projects</h3>
  <p>A snapshot of hands-on builds, research prototypes, and demos.</p>
</div>

{% assign items = site.projects | sort: 'title' %}
{% if items and items.size > 0 %}
  {% for post in items %}
    {% include archive-single.html %}
  {% endfor %}
{% else %}
  <p>No projects published yet.</p>
{% endif %}
