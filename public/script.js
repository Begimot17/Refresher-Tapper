// Инициализация переменных
let score = 0;
let coins = 0;
let level = 1;
let xp = 0;
let multiplier = 1;
let autoClickerActive = false;

// Инициализация WebApp
Telegram.WebApp.ready();
Telegram.WebApp.expand();

// Элементы интерфейса
const tapCircle = document.getElementById('tap-circle');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const levelElement = document.getElementById('level');
const config = {
    images: {
        1: 'images/bogdan.jpg', // Путь к изображению для уровня 1
        2: 'images/glebasta.jpg', // Путь к изображению для уровня 2
        3: 'images/lubomir.jpg', // Путь к изображению для уровня 3
        // Добавьте пути для других уровней
    },
    defaultImage: 'images/bogdan.jpg', // Изображение по умолчанию
};
const tapSound = document.getElementById('tap-sound');

// Обработчик тапа
tapCircle.addEventListener('click', () => {
    // Воспроизведение звука
    tapSound.currentTime = 0;
    tapSound.play();
    score += multiplier;
    coins += multiplier;
    xp += multiplier;
    checkLevelUp();
    updateUI();
    saveProgress();
});

// Магазин
function openShop() {
    document.getElementById('shop-modal').style.display = 'block';
}

function closeShop() {
    document.getElementById('shop-modal').style.display = 'none';
}

// Покупка улучшений
function buyUpgrade(type) {
    if (type === 'multiplier' && coins >= 50) {
        coins -= 50;
        multiplier += 1; // Увеличиваем множитель
        updateUI();
        saveProgress();
    }

    if (type === 'auto-click' && coins >= 100 && !autoClickerActive) {
        coins -= 100;
        autoClickerActive = true;
        setInterval(() => {
            score += multiplier;
            coins += multiplier;
            xp += multiplier;
            checkLevelUp();
            updateUI();
            saveProgress();
        }, 1000); // Автокликер срабатывает каждую секунду
    }
}

// Таблица рекордов
function showLeaderboard() {
    Telegram.WebApp.showAlert("Топ игроков:\n1. User1: 1000\n2. User2: 800");
}

// Сохранение прогресса
function saveProgress() {
    const userId = Telegram.WebApp.initDataUnsafe.user?.id || 1; // Используем ID пользователя из Telegram
    const gameData = { score, coins, level, xp, multiplier }; // Собираем все данные игры

    // Сохраняем в localStorage для последующих сессий
    localStorage.setItem('gameData', JSON.stringify(gameData));

    // Отправляем на сервер (если есть API)
    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...gameData }), // Отправляем все параметры
    }).catch(error => console.error('Ошибка сохранения:', error));
}

// Загрузка прогресса
function loadProgress() {
    // Сначала пробуем загрузить из localStorage
    const localData = localStorage.getItem('gameData');
    if (localData) {
        try {
            const data = JSON.parse(localData);
            score = data.score || 0;
            coins = data.coins || 0;
            level = data.level || 1;
            xp = data.xp || 0;
            multiplier = data.multiplier || 1;
            updateUI();
        } catch (e) {
            console.error('Ошибка загрузки из localStorage:', e);
        }
    }

    // Затем пробуем загрузить с сервера (если есть API)
    const userId = Telegram.WebApp.initDataUnsafe.user?.id;
    if (userId) {
        fetch(`/api/load?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    score = data.score || score;
                    coins = data.coins || coins;
                    level = data.level || level;
                    xp = data.xp || xp;
                    multiplier = data.multiplier || multiplier;
                    updateUI();
                }
            })
            .catch(error => console.error('Ошибка загрузки с сервера:', error));
    }
}

// Обновление интерфейса
function updateUI() {
    console.log(`Обновление UI: score=${score}, coins=${coins}, level=${level}`);
    scoreElement.textContent = score;
    coinsElement.textContent = coins;
    levelElement.textContent = level;
}

function updateImage() {
    const imagePath = config.images[level] || config.defaultImage; // Получаем путь к изображению для текущего уровня
    tapImage.src = imagePath; // Обновляем src изображения
}

// Проверка уровня
function checkLevelUp() {
    const neededXP = level * 100; // Опыт для следующего уровня
    if (xp >= neededXP) {
        level++;
        xp = xp - neededXP; // Сохраняем остаток XP
        coins += 10; // Добавляем бонусные монеты
        updateImage(); // Обновляем изображение
        showLevelUpPopup();
        saveProgress();
    }
}
// Всплывающее окно уровня
function showLevelUpPopup() {
    const popup = document.createElement('div');
    popup.className = 'level-up-popup';
    popup.innerHTML = `
        <h2>🎉 Уровень ${level}!</h2>
        <p>+10 монет</p>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000); // Убираем попап через 3 секунды
}

// Поделиться прогрессом
function shareProgress() {
    Telegram.WebApp.share({
        text: `Мой счет в Tap Attack: ${score}! Попробуй побить!`,
        url: window.location.href
    });
}

// Запуск игры
loadProgress();
updateImage();