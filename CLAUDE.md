# Refresher Tapper — CLAUDE.md

## Что это

Telegram Mini App кликер-игра. Игрок тапает круг, зарабатывает монеты и очки, прокачивает
улучшения и разблокирует персонажей. Запускается через Telegram-бота.

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | Vanilla JS (ES6 классы), jQuery 3.6.0, CSS3, HTML5 |
| Backend | Node.js 24, Express 4, SQLite (node:sqlite встроенный) |
| Bot | Python 3.9, python-telegram-bot (опционально) |
| Infra | Без Docker — запуск `node api.js` напрямую |

## Структура проекта

```
Refresher-Tapper/
├── server/
│   ├── api.js                  # Express-сервер + все API-роуты
│   ├── auth.js                 # Заглушка Telegram-аутентификации (не реализована)
│   ├── db.js                   # SQLite инициализация (node:sqlite встроенный)
│   ├── package.json
│   ├── Dockerfile
│   └── public/
│       ├── index.html          # SPA — весь UI игры
│       ├── css/style.css       # 1466 строк стилей
│       └── js/
│           ├── main.js         # Точка входа: new Game().init()
│           ├── Game.js         # Ядро игры: состояние, клики, уровни
│           ├── UpgradeManager.js # Магазин, расчёт стоимостей, автокликер
│           ├── CharacterManager.js # 12 обычных + 5 премиум персонажей
│           ├── UIManager.js    # Рендер DOM, модалки, анимации
│           ├── ProgressManager.js  # Save/load через API и localStorage
│           ├── ChatManager.js  # Чат (1 💎 за сообщение)
│           └── AchievementManager.js # Ачивки и выдача алмазов
├── bot/
│   ├── bot.py                  # /start → WebApp кнопка
│   ├── requirements.txt
│   └── Dockerfile
├── docs/                       # Документация (гейм-дизайн, API, деплой, баланс)
├── .claude/agents/             # Специализированные агенты команды
├── docker-compose.yml
└── CLAUDE.md                   # Этот файл
```

## Запуск

```bash
cd server
npm install
npm run dev      # с авто-перезапуском (nodemon)
# или
npm start        # просто node api.js
```

Игра доступна на `http://localhost:3000`. SQLite-база создаётся автоматически в `server/data/game.db`.

### Telegram-бот (опционально)

Без бота игра работает в браузере. Для запуска в Telegram нужен HTTPS-URL:

```bash
# Вариант 1 — Cloudflare Tunnel (ничего регистрировать не нужно):
winget install Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:3000
# → получишь https://xxxx.trycloudflare.com

# Вариант 2 — через SSH (ничего устанавливать не нужно):
ssh -R 80:localhost:3000 localhost.run
# → получишь https://xxxx.localhost.run
```

Затем в `server/.env` прописать `TOKEN` и `WEB_APP_URL` и запустить бота:

```bash
cd bot && pip install -r requirements.txt && python bot.py
```

## Переменные окружения

Файл `server/.env`:

| Переменная | По умолчанию | Описание |
|-----------|-------------|---------|
| `PORT` | `3000` | Порт сервера |
| `DB_PATH` | `./data/game.db` | Путь к SQLite-файлу |
| `TOKEN` | — | Telegram Bot API токен (только для бота) |
| `WEB_APP_URL` | — | HTTPS-URL фронтенда для кнопки в боте |

## API эндпоинты

| Метод | Путь | Описание |
|-------|------|---------|
| POST | `/api/save` | Сохранить прогресс пользователя |
| GET | `/api/load?userId=` | Загрузить прогресс |
| GET | `/api/leaderboard` | Топ игроков по счёту |
| POST | `/api/chat/send` | Отправить сообщение (−1 💎) |
| GET | `/api/chat/messages` | Получить последние 50 сообщений |

Подробнее: `docs/API.md`

## Ключевые механики (краткий справочник)

- **Монеты** = счёт = зарабатываются тапами, тратятся на апгрейды
- **Алмазы** — премиум-валюта. Источники: ачивки, каждый 5-й уровень (+1)
- **XP** — каждые 100 × 1.08^level очков → +1 уровень
- **Критический удар** — шанс = `criticalHitCount × 0.05`, урон ×2, капается на 80%
- **Автокликер** — интервал `max(1000 − level×30, 300)` мс; уровни 25+ дают только boost-бонус

Подробнее: `docs/GAME_DESIGN.md`, `docs/BALANCE_FIXES.md`

## Команда агентов

В `.claude/agents/` находятся специализированные агенты:

| Файл | Область ответственности |
|------|------------------------|
| `gameplay-balancer.md` | Баланс, кривая прогрессии, экономика |
| `test-writer.md` | Тесты (Jest для сервера, Vitest для клиента) |
| `ui-designer.md` | CSS, анимации, адаптивность, UX |
| `security-reviewer.md` | Безопасность API, валидация, rate limiting |
| `feature-planner.md` | Tech specs новых фич |

## Форматирование

```bash
npm run format   # prettier --write на весь проект
```

## Известные проблемы

- `auth.js` — заглушка, Telegram auth не реализован; `/api/save` принимает любой userId
- Нет клиентских тестов (только серверные через Jest + supertest)
- Socket.io в зависимостях root, но не используется в коде (чат работает через polling)
