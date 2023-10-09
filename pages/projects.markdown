---
layout: page
title: Project Demo
permalink: /projects/
---

For this demo-repo-portfolio thing I can use github topics tag, and select them here.

[Accéder au portfolio](./Portfolio/index.html)


{% for repo in site.github.public_repositories %}


{% if repo.fork == false and repo.topics.size > 0 %}

## [{{ repo.name }}]({{ repo.html_url }})

{{ repo.description }}

Topics: {{ repo.topics | array_to_sentence_string }}

Last updated: {{ repo.updated_at | date_to_string }}

{% endif %}

{% endfor %}