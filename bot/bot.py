import os
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Получаем токен и URL из переменных окружения
TOKEN = os.getenv("TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Добро пожаловать в Tap Attack!",
        reply_markup={
            "inline_keyboard": [[{
                "text": "🎮 Начать игру",
                "web_app": {"url": WEB_APP_URL}
            }]]
        }
    )

def main():
    # Проверяем, что переменные окружения заданы
    if not TOKEN or not WEB_APP_URL:
        raise ValueError("TOKEN и WEB_APP_URL должны быть заданы в переменных окружения")

    application = Application.builder().token(TOKEN).build()
    application.add_handler(CommandHandler('start', start))
    application.run_polling()

if __name__ == '__main__':
    main()