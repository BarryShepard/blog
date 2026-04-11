---
layout: base.njk
title: Делаю
description:
eleventyExcludeFromCollections: true
---
{% set items = collections.products %}
{% set emptyMessage = "Пока опубликованных продуктов нет." %}
{% include "entry-list.njk" %}
