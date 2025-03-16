let score = 0;
let coins = 0;
let level = 1;
let xp = 0;
let multiplier = 1;
let autoClickerActive = false;
let multiplierCount = 0;
let autoClickerCount = 0;
let selectedCharacter = null;
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
            entryLevel: 1,
            image: 'images/bogdan.jpg',
            sound: 'sounds/bogdan.m4a',
        },
        {
            name: "Глебаста",
            entryLevel: 5,
            image: 'images/glebasta.jpg',
            sound: 'sounds/default.mp3',
        },
        {
            name: "Любомир",
            entryLevel: 10,
            image: 'images/lubomir.jpg',
            sound: 'sounds/default.mp3',
        },
        {
            name: "Глебаста",
            entryLevel:114,
            image: 'images/glebasta.jpg',
            sound: 'sounds/default.mp3',
        },
        {
            name: "Любомир",
            entryLevel: 146,
            image: 'images/lubomir.jpg',
            sound: 'sounds/default.mp3',
        },
        {
            name: "Глебаста",
            entryLevel:2000,
            image: 'images/glebasta.jpg',
            sound: 'sounds/default.mp3',
        },
    ],
    defaultImage: 'images/bogdan.jpg',
    defaultSound: 'sounds/bogdan.m4a',
};
const tapSound = document.getElementById('tap-sound');

tapCircle.addEventListener('click', (event) => {
    tapSound.currentTime = 0;
    tapSound.play();

    // Получаем координаты клика относительно окна браузера
    const x = event.clientX;
    const y = event.clientY;

    // Создаем эффект клика
    createTapEffect(x, y);

    // Обновляем счет
    updateScore(multiplier); // Используем новую функцию
    updateCoins(multiplier); // Используем новую функцию
    xp += multiplier;
    checkLevelUp();
    saveProgress();
});
function openShop() {
    document.getElementById('shop-modal').style.display = 'block';
}

function closeShop() {
    document.getElementById('shop-modal').style.display = 'none';
}

function getCurrentCharacter() {
    if (selectedCharacter) {
        return selectedCharacter;
    }
    return getCharacterForLevel(level);
}

function checkLevelUp() {
    const neededXP = level * 100;
    if (xp >= neededXP) {
        level++; // Увеличиваем уровень
        xp -= neededXP;
        coins += 10;

        // Обновляем интерфейс
        updateUI(); // Добавлено здесь

        // Создаем эффект уровня
        createLevelUpEffect();

        // Проверяем, разблокирован ли новый персонаж
        const newCharacter = getCharacterForLevel(level);
        if (newCharacter && (!selectedCharacter || newCharacter.entryLevel > selectedCharacter.entryLevel)) {
            console.log(`Новый персонаж разблокирован: ${newCharacter.name}`);
            showNewCharacterPopup(newCharacter);
            selectedCharacter = newCharacter; // Автоматически выбираем нового персонажа
            updateImage(); // Меняем изображение
        }

        saveProgress();
    }
}
function showPopup(elementId, value) {
    const popup = document.getElementById(elementId);
    popup.textContent = `+${value}`; // Показываем значение
    popup.classList.add('show'); // Добавляем класс для анимации

    // Убираем сообщение через 1 секунду
    setTimeout(() => {
        popup.classList.remove('show');
    }, 1000);
}
function updateScore(points) {
    score += points;
    scoreElement.textContent = formatNumber(score);
    showPopup('score-popup', points); // Показываем всплывающее сообщение
}
function updateCoins(coinsAdded) {
    coins += coinsAdded;
    coinsElement.textContent = formatNumber(coins);
    showPopup('coins-popup', coinsAdded); // Показываем всплывающее сообщение
}
function updateLevel() {
    level++;
    levelElement.textContent = formatNumber(level);
    showPopup('level-popup', 1); // Показываем всплывающее сообщение
}
function buyUpgrade(type) {
    let cost;

    if (type === 'multiplier') {
        cost = 50 + (multiplierCount * 50);
        if (coins >= cost) {
            coins -= cost;
            multiplier += 1;
            multiplierCount += 1;

            // Создаем эффект улучшения
            const rect = document.querySelector('.upgrade').getBoundingClientRect();
            createUpgradeEffect('×2 Множитель!', rect.left + 50, rect.top);

            updateUI();
            saveProgress();
        } else {
            showError('Недостаточно монет для покупки множителя.');
        }
    }

    if (type === 'auto-click') {
        cost = 100 + (autoClickerCount * 100);
        if (coins >= cost) {
            coins -= cost;
            autoClickerCount += 1;

            // Создаем эффект улучшения
            const rect = document.querySelector('.upgrade').getBoundingClientRect();
            createUpgradeEffect('Автоклик!', rect.left + 50, rect.top);

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
        } else {
            showError('Недостаточно монет для покупки автокликера.');
        }
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

                    // Добавляем номер места
                    const placeNumber = document.createElement('span');
                    placeNumber.textContent = `${index + 1}. `;
                    li.appendChild(placeNumber);

                    // Добавляем эмодзи для первых трех мест
                    if (index === 0) {
                        const goldMedal = document.createElement('span');
                        goldMedal.textContent = '🥇 ';
                        li.appendChild(goldMedal);
                    } else if (index === 1) {
                        const silverMedal = document.createElement('span');
                        silverMedal.textContent = '🥈 ';
                        li.appendChild(silverMedal);
                    } else if (index === 2) {
                        const bronzeMedal = document.createElement('span');
                        bronzeMedal.textContent = '🥉 ';
                        li.appendChild(bronzeMedal);
                    }

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
    const gameData = { score, coins, level, xp, multiplier, username, multiplierCount, autoClickerCount }; // Добавляем username в данные

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

    // Устанавливаем персонажа по умолчанию
    updateImage();
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

function formatNumber(number) {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M'; // Миллионы
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K'; // Тысячи
    } else {
        return number.toString(); // Меньше 1000
    }
}

function updateUI() {
    scoreElement.textContent = formatNumber(score);
    coinsElement.textContent = formatNumber(coins);
    levelElement.textContent = formatNumber(level);

    // Обновляем стоимость и количество улучшений
    document.getElementById('multiplier-cost').textContent = formatNumber(50 + (multiplierCount * 50));
    document.getElementById('multiplier-count').textContent = formatNumber(multiplierCount);
    document.getElementById('auto-click-cost').textContent = formatNumber(100 + (autoClickerCount * 100));
    document.getElementById('auto-click-count').textContent = formatNumber(autoClickerCount);
}
function createTapEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'tap-effect';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 500);
}

function createUpgradeEffect(text, x, y) {
    const effect = document.createElement('div');
    effect.className = 'upgrade-effect';
    effect.textContent = text;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

function createLevelUpEffect() {
    const effect = document.createElement('div');
    effect.className = 'level-up-effect';
    effect.textContent = '🎉 Уровень UP!';
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}
function updateImage() {
    const character = getCurrentCharacter(); // Получаем текущего персонажа
    const tapImage = document.getElementById('tap-image');
    const tapSound = document.getElementById('tap-sound');

    // Плавное изменение изображения
    tapImage.style.opacity = 0; // Сначала скрываем изображение
    setTimeout(() => {
        tapImage.src = character.image; // Меняем изображение
        tapImage.style.opacity = 1; // Плавно показываем новое изображение
    }, 200); // Задержка для плавного перехода

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

function getCharacterForLevel(currentLevel) {
    let unlockedCharacter = null;
    for (const character of config.characters) {
        if (currentLevel >= character.entryLevel) {
            unlockedCharacter = character;
        } else {
            break; // Прерываем цикл, так как персонажи отсортированы по уровню
        }
    }
    return unlockedCharacter;
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

    // Форматированный текст для шаринга
    const shareText = `
🎮 *Мой прогресс в Refresher Tapper*:
🔥 Счет: *${score}*
🪙 Монеты: *${coins}*
📈 Уровень: *${level}*

💪 Попробуй побить мой рекорд!
👉 Перейди в бота: @bogdan_tapper_bot
    `.trim(); // Убираем лишние пробелы

    // Копируем текст в буфер обмена
    copyToClipboard(shareText);
}

// Открытие модального окна для выбора персонажа
function openCharacterModal() {
    const characterList = document.getElementById('character-list');
    characterList.innerHTML = '';

    // Определяем минимальный уровень, при котором откроется следующий персонаж
    const nextUnlockLevel = config.characters
        .map(character => character.entryLevel)
        .filter(lvl => lvl > level)
        .sort((a, b) => a - b)[0]; // Берем минимальный из доступных уровней

    config.characters.forEach(character => {
        const characterItem = document.createElement('div');
        characterItem.className = 'character-item';

        if (character.entryLevel <= level) {
            // Открытые персонажи
            characterItem.innerHTML = `
                <img src="${character.image}" alt="${character.name}">
                <span>${character.name}</span>
            `;
            characterItem.onclick = () => selectCharacter(character);
        } else {
            // Заблокированные персонажи
            characterItem.innerHTML = `
                <div class="locked-character"></div>
                <span>???</span>
                <small>Откроется на уровне ${character.entryLevel}</small>
            `;
        }

        characterList.appendChild(characterItem);
    });

    // Проверяем, есть ли блок с информацией о следующем уровне, если нет — создаем
    let nextUnlockInfo = document.getElementById('next-unlock-info');
    if (!nextUnlockInfo) {
        nextUnlockInfo = document.createElement('div');
        nextUnlockInfo.id = 'next-unlock-info';
        nextUnlockInfo.className = 'next-unlock';
        document.getElementById('character-modal').appendChild(nextUnlockInfo);
    }

    // Показываем информацию о следующем уровне для открытия персонажа
    nextUnlockInfo.textContent = nextUnlockLevel
        ? `Следующий персонаж откроется на уровне ${nextUnlockLevel}`
        : 'Все персонажи открыты';

    document.getElementById('character-modal').style.display = 'block';
}





// Закрытие модального окна
function closeCharacterModal() {
    document.getElementById('character-modal').style.display = 'none';
}

// Выбор персонажа
function selectCharacter(character) {
    selectedCharacter = character; // Устанавливаем выбранного персонажа
    updateImage(); // Обновляем изображение
    closeCharacterModal(); // Закрываем модальное окно
}
loadProgress();
updateImage();