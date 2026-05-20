import asyncio
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = os.getenv("TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = InlineKeyboardMarkup([[
        InlineKeyboardButton("🎮 Начать игру", web_app=WebAppInfo(url=WEB_APP_URL))
    ]])
    await update.message.reply_text("Добро пожаловать в Refresher Tapper!", reply_markup=keyboard)


def main():
    if not TOKEN:
        raise ValueError("TOKEN не задан. Получи его у @BotFather и добавь в server/.env")
    if not WEB_APP_URL:
        raise ValueError(
            "WEB_APP_URL не задан. Запусти туннель:\n"
            "  Cloudflare: cloudflared tunnel --url http://localhost:3000\n"
            "  SSH: ssh -R 80:localhost:3000 localhost.run\n"
            "Затем добавь полученный URL в server/.env"
        )

    asyncio.set_event_loop(asyncio.new_event_loop())
    application = Application.builder().token(TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.run_polling()


if __name__ == "__main__":
    main()
