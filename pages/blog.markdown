---
layout: page
title: Blog Posts
permalink: /blog/
---

{% for post in site.posts %}

[{{post.title}}]({{post.url}})
> {{post.excerpt}}

{% endfor %}
