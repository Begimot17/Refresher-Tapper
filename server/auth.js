import TelegramLogin from 'telegram-login-button';

// Инициализация
const telegramLogin = new TelegramLogin({
    bot_id: 'ВАШ_BOT_ID',
    request_access: true
});

// Обработка входа
telegramLogin.onAuth(async user => {
    const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(user)
    });
    localStorage.setItem('user', JSON.stringify(user));
});