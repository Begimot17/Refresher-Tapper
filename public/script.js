let score = 0;
let coins = 0;
let level = 1;
let xp = 0;
let multiplier = 1;
let autoClickerActive = false;
let multiplierCount = 0; // Количество купленных множителей
let autoClickerCount = 0; // Количество купленных автокликеров
Telegram.WebApp.ready();
Telegram.WebApp.expand();

const tapCircle = document.getElementById('tap-circle');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const levelElement = document.getElementById('level');
const config = {
    characters: [
        {
            name: "Богдан",
            levels: [1, 2, 3, 4],
            image: 'images/bogdan.jpg',
            sound: 'sounds/bogdan.m4a',
        },
        {
            name: "Глебаста",
            levels: [5, 6, 7, 8, 9],
            image: 'images/glebasta.jpg',
            sound: 'sounds/default.mp3',
        },
        {
            name: "Любомир",
            levels: [10, 11, 12, 13, 14],
            image: 'images/lubomir.jpg',
            sound: 'sounds/default.mp3',
        },
    ],
    defaultImage: 'images/bogdan.jpg',
    defaultSound: 'sounds/bogdan.m4a',
};
const tapSound = document.getElementById('tap-sound');

tapCircle.addEventListener('click', () => {
    tapSound.currentTime = 0;
    tapSound.play();
    score += multiplier;
    coins += multiplier;
    xp += multiplier;
    checkLevelUp();
    updateUI();
    saveProgress();
});

function openShop() {
    document.getElementById('shop-modal').style.display = 'block';
}

function closeShop() {
    document.getElementById('shop-modal').style.display = 'none';
}

function getCurrentCharacter() {
    return config.characters.find(character => character.levels.includes(level)) || {
        name: "Default",
        image: config.defaultImage,
        sound: config.defaultSound,
    };
}

function checkLevelUp() {
    const neededXP = level * 100;
    if (xp >= neededXP) {
        level++;
        xp -= neededXP;
        coins += 10;
        updateImage();
        showLevelUpPopup();
        saveProgress();
    }
}

function buyUpgrade(type) {
    if (type === 'multiplier' && coins >= 50) {
        coins -= 50;
        multiplier += 1;
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
        }, 1000);
    }
}

function showLeaderboard() {
    fetch('/api/leaderboard')
        .then(response => response.json())
        .then(data => {
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = '';

            if (data.length === 0) {
                leaderboardList.innerHTML = '<li>Рекорды пока отсутствуют.</li>';
            } else {
                data.forEach((player, index) => {
                    const li = document.createElement('li');
                    const usernameLink = document.createElement('a');

                    // Формируем ссылку на профиль Telegram
                    usernameLink.href = `https://t.me/${player.username}`;
                    usernameLink.textContent = `@${player.username || 'unknown'}`;
                    usernameLink.style.textDecoration = 'none';
                    usernameLink.style.color = '#007BFF';
                    usernameLink.style.cursor = 'pointer';
                    usernameLink.target = '_blank'; // Открывать ссылку в новой вкладке

                    li.textContent = `${index + 1}. `;
                    li.appendChild(usernameLink);
                    li.appendChild(document.createTextNode(`: ${player.score}`));
                    leaderboardList.appendChild(li);
                });
            }

            const modal = document.getElementById('leaderboard-modal');
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Ошибка загрузки таблицы рекордов:', error);
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = '<li>Не удалось загрузить рекорды.</li>';
            const modal = document.getElementById('leaderboard-modal');
            modal.style.display = 'block';
        });
}

function closeLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    modal.style.display = 'none';
}

window.onclick = (event) => {
    const leaderboardModal = document.getElementById('leaderboard-modal');
    if (event.target === leaderboardModal) {
        leaderboardModal.style.display = 'none';
    }
};

function saveProgress() {
    const userId = Telegram.WebApp.initDataUnsafe.user?.id || 1;
    const username = Telegram.WebApp.initDataUnsafe.user?.username || 'unknown'; // Получаем username
    const gameData = { score, coins, level, xp, multiplier, username }; // Добавляем username в данные

    localStorage.setItem('gameData', JSON.stringify(gameData));

    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...gameData }), // Отправляем username на сервер
    }).catch(error => console.error('Ошибка сохранения:', error));
}

function loadProgress() {
    const localData = localStorage.getItem('gameData');
    if (localData) {
        try {
            const data = JSON.parse(localData);
            score = data.score || 0;
            coins = data.coins || 0;
            level = data.level || 1;
            xp = data.xp || 0;
            multiplier = data.multiplier || 1;
            multiplierCount = data.multiplierCount || 0;
            autoClickerCount = data.autoClickerCount || 0;
            updateUI();
        } catch (e) {
            console.error('Ошибка загрузки из localStorage:', e);
        }
    }

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
                    multiplierCount = data.multiplierCount || multiplierCount;
                    autoClickerCount = data.autoClickerCount || autoClickerCount;
                    updateUI();
                }
            })
            .catch(error => console.error('Ошибка загрузки с сервера:', error));
    }
}

function buyUpgrade(type) {
    let cost;

    if (type === 'multiplier') {
        cost = 50 + (multiplierCount * 50); // Базовая стоимость + 50 за каждый уровень
        if (coins >= cost) {
            coins -= cost;
            multiplier += 1;
            multiplierCount += 1;
            updateUI();
            saveProgress();
        } else {
            showError('Недостаточно монет для покупки множителя.');
        }
    }

    if (type === 'auto-click') {
        cost = 100 + (autoClickerCount * 100); // Базовая стоимость + 100 за каждый уровень
        if (coins >= cost) {
            coins -= cost;
            autoClickerCount += 1;
            if (!autoClickerActive) {
                autoClickerActive = true;
                setInterval(() => {
                    score += multiplier;
                    coins += multiplier;
                    xp += multiplier;
                    checkLevelUp();
                    updateUI();
                    saveProgress();
                }, 1000);
            }
            updateUI();
            saveProgress();
        } else {
            showError('Недостаточно монет для покупки автокликера.');
        }
    }
}

function updateUI() {
    scoreElement.textContent = score;
    coinsElement.textContent = coins;
    levelElement.textContent = level;

    // Обновляем стоимость и количество улучшений
    document.getElementById('multiplier-cost').textContent = 50 + (multiplierCount * 50);
    document.getElementById('multiplier-count').textContent = multiplierCount;
    document.getElementById('auto-click-cost').textContent = 100 + (autoClickerCount * 100);
    document.getElementById('auto-click-count').textContent = autoClickerCount;
}

function updateImage() {
    const character = getCurrentCharacter();
    const tapImage = document.getElementById('tap-image');
    const tapSound = document.getElementById('tap-sound');

    tapImage.src = character.image;
    tapSound.src = character.sound;
}

function showNewCharacterPopup(character) {
    const popup = document.createElement('div');
    popup.className = 'level-up-popup';
    popup.innerHTML = `
        <h2>🎉 Новый персонаж!</h2>
        <p>Теперь вы играете за ${character.name}!</p>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

let previousCharacter = null;

function checkLevelUp() {
    const neededXP = level * 100;
    if (xp >= neededXP) {
        level++;
        xp -= neededXP;
        coins += 10;

        const currentCharacter = getCurrentCharacter();

        if (previousCharacter !== currentCharacter.name) {
            showNewCharacterPopup(currentCharacter);
            previousCharacter = currentCharacter.name;
        }

        updateImage();
        showLevelUpPopup();
        saveProgress();
    }
}

function showLevelUpPopup() {
    const popup = document.createElement('div');
    popup.className = 'level-up-popup';
    popup.innerHTML = `
        <h2>🎉 Уровень ${level}!</h2>
        <p>+10 монет</p>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showError('Прогресс скопирован! Вставьте его в Telegram и отправьте.');
        })
        .catch(() => {
            showError('Ошибка: Не удалось скопировать прогресс.');
        });
}

function shareProgress() {
    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (!user) {
        showError('Ошибка: Пользователь не авторизован.');
        return;
    }

    const userId = user.id;
    const username = user.username || 'unknown';

    const shareText = `Мой счет в Refresher Tapper: ${score}! Попробуй побить! Мой ID: ${userId}, @${username}`;
    const url = window.location.href;
    const fullText = `${shareText} ${url}`;

    copyToClipboard(fullText);
}

loadProgress();
updateImage();