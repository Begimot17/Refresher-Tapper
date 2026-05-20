# API Reference — Refresher Tapper

Base URL: `http://localhost:3000` (локально) или ваш HTTPS-домен в проде.

Rate limits: `/api/save` — 30 req/min, `/api/chat/send` — 10 req/min.

---

## POST /api/save

Сохраняет прогресс пользователя (upsert по userId).

**Тело запроса** (application/json):

```json
{
  "userId": 123456789,
  "username": "player_name",
  "score": 1500,
  "coins": 800,
  "diamonds": 3,
  "level": 7,
  "xp": 45,
  "multiplier": 3,
  "multiplierCount": 2,
  "autoClickerCount": 1,
  "criticalHitCount": 0,
  "coinBonusCount": 0,
  "xpBoostCount": 0,
  "selectedCharacterId": 1,
  "totalClicks": 2340,
  "purchasedPremiumCharacters": [101, 102],
  "achievements": [
    { "id": "clicks-1000", "unlocked": true }
  ]
}
```

**Ответ 200**:
```json
{ "success": true }
```

**Ответ 400** (нет userId):
```json
{ "error": "User ID is required" }
```

---

## GET /api/load

Загружает прогресс пользователя. Начисляет ежедневный алмаз если пользователь не заходил сегодня.

**Параметры**: `?userId=123456789`

**Ответ 200** (пользователь найден):
```json
{
  "score": 1500,
  "coins": 800,
  "diamonds": 3,
  "level": 7,
  "xp": 45,
  "multiplier": 3,
  "multiplierCount": 2,
  "autoClickerCount": 1,
  "criticalHitCount": 0,
  "coinBonusCount": 0,
  "xpBoostCount": 0,
  "selectedCharacterId": 1,
  "totalClicks": 2340,
  "purchasedPremiumCharacters": [101],
  "achievements": [{ "id": "clicks-1000", "unlocked": true }],
  "dailyRewardAwarded": false
}
```

`dailyRewardAwarded: true` — если сегодня первый вход (алмаз уже добавлен в `diamonds`).

**Ответ 200** (пользователь не найден):
```json
null
```

---

## GET /api/leaderboard

Все игроки, отсортированные по score убыванию.

**Ответ 200**:
```json
[
  { "username": "player1", "score": 999999 },
  { "username": "player2", "score": 500000 }
]
```

---

## POST /api/chat/send

Отправляет сообщение в чат. Стоит 1 💎. Атомарная операция (транзакция).

**Тело запроса**:
```json
{
  "userId": 123456789,
  "username": "player_name",
  "message": "Привет всем!"
}
```

**Ограничения**: сообщение не длиннее 32 символов.

**Ответ 200**:
```json
{ "success": true, "diamonds": 2 }
```

`diamonds` — остаток алмазов после отправки.

**Ответ 400**:
```json
{ "error": "Недостаточно алмазов для отправки сообщения" }
{ "error": "Пользователь не найден" }
{ "error": "Сообщение не может быть длиннее 32 символов" }
```

---

## GET /api/chat/messages

Последние 50 сообщений, отсортированные от старых к новым.

**Ответ 200**:
```json
[
  {
    "id": 1,
    "userId": 123456789,
    "username": "player_name",
    "message": "Привет!",
    "timestamp": "2026-05-20T12:00:00.000"
  }
]
```

---

## Схема SQLite

### Таблица `users`

| Поле | Тип | Default | Описание |
|------|-----|---------|---------|
| `userId` | INTEGER PK | required | Telegram user ID |
| `username` | TEXT | null | Имя пользователя |
| `score` | INTEGER | 0 | Всего набрано очков |
| `coins` | INTEGER | 0 | Текущие монеты |
| `diamonds` | INTEGER | 0 | Текущие алмазы |
| `level` | INTEGER | 1 | Текущий уровень |
| `xp` | INTEGER | 0 | Текущий опыт |
| `multiplier` | INTEGER | 1 | Множитель клика |
| `multiplierCount` | INTEGER | 0 | Уровень апгрейда «Самогон» |
| `autoClickerCount` | INTEGER | 0 | Уровень апгрейда «Волга» |
| `criticalHitCount` | INTEGER | 0 | Уровень апгрейда «Подик» |
| `coinBonusCount` | INTEGER | 0 | Уровень апгрейда «База» |
| `xpBoostCount` | INTEGER | 0 | Уровень апгрейда «Снюс» |
| `selectedCharacterId` | INTEGER | null | ID выбранного персонажа |
| `totalClicks` | INTEGER | 0 | Всего кликов за всё время |
| `purchasedPremiumCharacters` | TEXT | `'[]'` | JSON-массив IDs купленных премиум персонажей |
| `achievements` | TEXT | `'[]'` | JSON-массив `{id, unlocked}` |
| `lastLoginDate` | TEXT | null | ISO-дата последнего входа (для ежедневного алмаза) |
| `lastUpdated` | TEXT | `datetime('now')` | ISO-дата последнего сохранения |

### Таблица `chat_messages`

| Поле | Тип | Default |
|------|-----|---------|
| `id` | INTEGER PK AUTOINCREMENT | — |
| `userId` | INTEGER | — |
| `username` | TEXT | — |
| `message` | TEXT | — |
| `timestamp` | TEXT | `datetime('now')` |
