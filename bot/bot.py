import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Настройка логирования
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Получаем токен и URL из переменных окружения
TOKEN = os.getenv("TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        # Отправляем сообщение с кнопкой
        await update.message.reply_text(
            "Добро пожаловать в Refresher Tapper!",
            reply_markup={
                "inline_keyboard": [[{
                    "text": "🎮 Начать игру",
                    "web_app": {"url": WEB_APP_URL}
                }]]
            }
        )
        logger.info(f"Пользователь {update.message.from_user.username} начал игру.")
    except Exception as e:
        logger.error(f"Ошибка при обработке команды /start: {e}")
        await update.message.reply_text("Произошла ошибка. Пожалуйста, попробуйте позже.")

def main():
    # Проверяем, что переменные окружения заданы
    if not TOKEN:
        raise ValueError("Токен бота (TOKEN) не задан в переменных окружения")
    if not WEB_APP_URL:
        raise ValueError("URL веб-приложения (WEB_APP_URL) не задан в переменных окружения")

    # Создаем приложение и добавляем обработчики
    application = Application.builder().token(TOKEN).build()
    application.add_handler(CommandHandler('start', start))

    # Запускаем бота
    logger.info("Бот запущен...")
    application.run_polling()

if __name__ == '__main__':
    main()