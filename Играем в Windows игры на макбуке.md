---
layout: base.njk
title: Играем в Windows игры на макбуке
description:
section: product
---
{% include "section-backlink.njk" %}

# Играем в Windows игры на макбуке

Порой мне хочется поиграть в игры. Но из оборужования у меня только мак. Меня подмывает купить компик на винде пару раз в год, но я не так много играю, чтобы инвестировать в это серьезно, особенно сейчас, когда цены на комплектующие улетели в космос из-за очередного нейробума.

Но благодаря нейробуму, я смог сделать утилиту, которая решает мою проблему

## Устанавливаем окружение
1. Открываем терминал
2. Ставим homebrew 
   `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
   
3. Устанавливаем консольный стим. Обычно его используют для удаленного обновления игр на серверах. Нам нужен функционал стим 
   `brew install steamcmd`
4. Ставим Whisky
   `brew install --cask whisky`
## Настраиваем Whisky
5. Скачиваем стим для винды
   https://cdn.fastly.steamstatic.com/client/installer/SteamSetup.exe
6. Открываем виски
7. Создаем бутылку → Add new bottle
8. 