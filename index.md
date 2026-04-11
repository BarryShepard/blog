---
layout: base.njk
title: Дима Овчаренко
description: Делай то, что нравится
---
{% set items = collections.entries %}
{% set emptyMessage = "Пока здесь еще нет опубликованных материалов, но каркас уже готов." %}
{% include "entry-list.njk" %}
