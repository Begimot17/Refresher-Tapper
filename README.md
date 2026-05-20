# Refresher Tapper

Telegram Mini App кликер-игра с персонажами, апгрейдами, ачивками и живым чатом.

## Геймплей

- Тапай круг → зарабатывай монеты и очки
- Прокачивай 5 апгрейдов (автокликер, множитель урона, крит, монеты, XP)
- Разблокируй 12 персонажей по уровням и 5 премиум-персонажей за алмазы
- Выполняй ачивки → получай алмазы
- Соревнуйся в таблице рекордов

## Быстрый старт

### Docker

```bash
cp .env.example .env   # заполни TOKEN и WEB_APP_URL
docker-compose up --build
```

### Вручную

```bash
cd server && npm install
MONGO_URI=mongodb://localhost:27017/refresher node api.js
```

Открыть: `http://localhost:3000`

## Стек

- **Frontend**: Vanilla JS, jQuery, CSS3 animations
- **Backend**: Node.js, Express, MongoDB
- **Bot**: Python, python-telegram-bot
- **Infra**: Docker Compose

## Структура монетизации

| Валюта | Источник | Использование |
|--------|---------|--------------|
| 🪙 Монеты | Тапы | Апгрейды в магазине |
| 💎 Алмазы | Ачивки, каждый 5-й уровень | Премиум персонажи, чат |

## Персонажи

**Обычные** (разблокируются по уровню): Существо → Максим → Рома → Глебаста →
Любомир → Лёша → Дима → Жека → Саня → Жума → Никита → Дуля (lvl 999)

**Премиум** (за алмазы): Дракон 5💎, Робот 10💎, Волшебник 15💎, Космонавт 20💎, Динозавр 25💎

## Документация

- [Гейм-дизайн и механики](docs/GAME_DESIGN.md)
- [Баланс и известные фиксы](docs/BALANCE_FIXES.md)
- [API Reference](docs/API.md)
- [Деплой](docs/DEPLOYMENT.md)

## Разработка

```bash
npm run format          # prettier
cd server && npm test   # тесты (после настройки Jest)
```

Смотри [CLAUDE.md](CLAUDE.md) для инструкций агентам Claude Code.
