# Deployment Guide — Refresher Tapper

## Локальный запуск

### 1. Установить зависимости

```bash
cd server
npm install
```

Требуется Node.js 22+ (используется встроенный `node:sqlite`).

### 2. Создать `server/.env`

```env
PORT=3000
# DB_PATH=./data/game.db  # путь по умолчанию, можно не менять
```

SQLite-база создаётся **автоматически** при первом запуске в `server/data/game.db`.

### 3. Запустить

```bash
npm run dev    # с авто-перезапуском (nodemon)
# или
npm start      # просто node api.js
```

Открыть: `http://localhost:3000` — игра работает без Telegram.

---

## Подключить Telegram бота (опционально)

Telegram Mini App требует HTTPS. Для локальной разработки есть два бесплатных варианта.

### Вариант 1 — Cloudflare Tunnel (рекомендуется)

Не нужна регистрация. Работает на Windows/Mac/Linux.

```bash
# Установить
winget install Cloudflare.cloudflared

# Запустить туннель
cloudflared tunnel --url http://localhost:3000
# → выдаст https://xxxx.trycloudflare.com
```

### Вариант 2 — localhost.run через SSH

Ничего устанавливать не нужно, только SSH (есть на любой системе).

```bash
ssh -R 80:localhost:3000 localhost.run
# → выдаст https://xxxx.localhost.run
```

### После получения HTTPS URL

Добавить в `server/.env`:
```env
TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
WEB_APP_URL=https://xxxx.trycloudflare.com
```

Запустить бота:
```bash
cd bot
pip install -r requirements.txt
python bot.py
```

Написать боту `/start` → появится кнопка "Играть".

---

## Создать Telegram бота

1. Открыть [@BotFather](https://t.me/BotFather) → `/newbot`
2. Ввести имя и username бота
3. Скопировать полученный `TOKEN`
4. Прописать в `server/.env`

---

## Тесты

```bash
cd server
npm test          # запустить все тесты (Jest)
npm run test:watch  # режим наблюдения
```

Тесты используют SQLite `:memory:` — никакой настройки не требуется.

---

## Деплой на VPS (продакшн)

### Минимальные требования

- Node.js 22+
- 256 MB RAM (SQLite очень лёгкий)
- Публичный IP/домен для Telegram WebApp (HTTPS обязателен)

### HTTPS на сервере

```bash
# Nginx + Let's Encrypt
certbot --nginx -d yourdomain.com
```

Или использовать платформы с HTTPS из коробки: Railway, Render, Fly.io.

### Переменные окружения на сервере

Никогда не коммить `.env` файлы. Используй:
- VPS: `.env` файл вне репозитория, или `export` в systemd unit
- Railway/Render: переменные в дашборде платформы

### Данные SQLite

База хранится в `server/data/game.db`. При деплое на VPS:
- Файл создаётся автоматически при первом запуске
- Бэкап: просто скопировать `game.db` файл
- `server/data/` добавлен в `.gitignore` — случайно не закоммитить
