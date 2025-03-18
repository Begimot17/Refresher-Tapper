let score = 0;
let coins = 0;
let level = 1;
let coin_for_level = 10;
let score_for_level = 100;
let xp = 0;
let multiplier = 1;
let autoClickerActive = false;
let multiplierCount = 0;
let autoClickerCount = 0;
let criticalHitCount = 0; // Уровень улучшения "Критический удар"
let coinBonusCount = 0;   // Уровень улучшения "Бонус монет"
let xpBoostCount = 0;
let selectedCharacter = null;
let touchStartX = 0;
let touchEndX = 0;


Telegram.WebApp.ready();
Telegram.WebApp.expand();

const tapCircle = document.getElementById('tap-circle');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const levelElement = document.getElementById('level');
const configCharacter = {
    characters: [
        {
            name: "Богдан",
            entryLevel: 1,
            image: 'images/bogdan.jpg',
            sound: 'sounds/bogdan.m4a',
            description: "Душа компании, любит Вейпы. Военный"
        },
        {
            name: "Глебаста",
            entryLevel: 5,
            image: 'images/glebasta.jpg',
            sound: 'sounds/default.mp3',
            description: "Душа компании, любит Короля и Шута. Моряк"
        },
        {
            name: "Любомир",
            entryLevel: 10,
            image: 'images/lubomir.jpg',
            sound: 'sounds/lubomir.mp3',
            description: "Душа компании, любит Серьёзного Сема. Ветеран"
        },
        {
            name: "Лёша",
            entryLevel: 20,
            image: 'images/lesha_dyachkov.jpg',
            sound: 'sounds/lesha_dyachkov.mp3',
            description: "Душа компании, любит Ланос. Электрик"
        },
        {
            name: "Дима",
            entryLevel: 50,
            image: 'images/dima_brusko.jpg',
            sound: 'sounds/dima_brusko.mp3',
            description: "Душа АЙТИ компании, любит Макбук. Программист"
        },
        {
            name: "Жека",
            entryLevel: 100,
            image: 'images/jeka_isaenko.jpg',
            sound: 'sounds/jeka_isaenko.mp3',
            description: "Душа компании, любит Подушки. Часовщик"
        },
        {
            name: "Саня",
            entryLevel: 200,
            image: 'images/sasha_isaenko.jpg',
            sound: 'sounds/sasha_isaenko.mp3',
            description: "Душа компании, любит CS GO. Камерщик"
        },
        {
            name: "Жума",
            entryLevel: 500,
            image: 'images/juma.jpg',
            sound: 'sounds/juma.mp3',
            description: "Душа компании, любит Lays. Асперанто-Лаборанто"
        },
    ],
    defaultImage: 'images/bogdan.jpg',
    defaultSound: 'sounds/bogdan.m4a',
};
const shopConfig = {
    upgrades: [
        {
            id: 'multiplier',
            name: 'Самогон',
            description: 'Увеличивает эффективность вашего клика. Чем больше самогона, тем больше очков и монет!',
            baseCost: 50,
            costIncrease: 50,
            effect: 'multiplier',
            maxLevel: 500,
            icon: '🍺',
        },
        {
            id: 'auto-click',
            name: 'Волга',
            description: 'Автоматически кликает за вас. Волга работает без устали, пока вы отдыхаете!',
            baseCost: 100,
            costIncrease: 100,
            effect: 'autoClicker',
            maxLevel: 500,
            icon: '🏎️',
        },
        {
            id: 'critical-hit',
            name: 'Подик',
            description: 'Шанс нанести мощный удар, который приносит в разы больше очков и монет. Подик — это сила!',
            baseCost: 500,
            costIncrease: 500,
            effect: 'criticalHit',
            maxLevel: 200,
            icon: '💥',
        },
        {
            id: 'coin-bonus',
            name: 'База',
            description: 'Увеличивает количество монет за клик. База — это надежный источник дохода!',
            baseCost: 10000,
            costIncrease: 2500,
            effect: 'coinBonus',
            maxLevel: 200,
            icon: '💰',
        },
        {
            id: 'xp-boost',
            name: 'Снюс',
            description: 'Увеличивает количество опыта за клик. Снюс заряжает энергией и помогает быстрее расти!',
            baseCost: 25000,
            costIncrease: 10000,
            effect: 'xpBoost',
            maxLevel: 100,
            icon: '📦',
        },
    ],
};
const tapSound = document.getElementById('tap-sound');
function handleTap(event) {
    tapSound.currentTime = 0;
    tapSound.play();
    createTapEffect(event.clientX, event.clientY);

    // Базовые значения
    let scoreEarned = multiplier;
    let coinsEarned = multiplier;
    let xpEarned = multiplier;

    // Критический удар
    const criticalHitChance = 0.1 + (criticalHitCount * 0.05);
    const criticalHitMultiplier = 2 + (criticalHitCount * 0.5);
    if (Math.random() < criticalHitChance) {
        scoreEarned *= criticalHitMultiplier;
        coinsEarned *= criticalHitMultiplier;
        xpEarned *= criticalHitMultiplier;
        createCriticalHitEffect(event.clientX, event.clientY);
    }

    // Бонус монет
    const coinBonusMultiplier = 1 + (coinBonusCount * 0.2);
    coinsEarned *= coinBonusMultiplier;

    // Ускорение опыта
    const xpBoostMultiplier = 1 + (xpBoostCount * 0.3);
    xpEarned *= xpBoostMultiplier;

    // Округляем значения до целых чисел
    coinsEarned = Math.round(coinsEarned); // Округляем до ближайшего целого
    xpEarned = Math.round(xpEarned); // Округляем до ближайшего целого

    // Обновляем значения
    updateScore(scoreEarned);
    updateCoins(coinsEarned);
    xp += xpEarned;

    checkLevelUp();
}

// Устанавливаем обработчик клика
tapCircle.addEventListener('click', handleTap);
const scoreItems = document.querySelectorAll('.score-item');

scoreItems.forEach(item => {
    item.addEventListener('click', () => {
        const tooltip = item.querySelector('.tooltip');
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = 1;

        // Скрываем подсказку через 2 секунды
        setTimeout(() => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = 0;
        }, 2000);
    });
});
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
    const neededXP = level * score_for_level;
    if (xp >= neededXP) {
        updateLevel()
        xp -= neededXP;
        coins += coin_for_level;
        showLevelUpPopup()
        updateUI();
        createLevelUpEffect();
    }
}

function showPopup(elementId, value) {
    const popup = document.getElementById(elementId);
    popup.textContent = `+${formatNumber(value)}`;
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 1000);
}

function updateScore(points) {
    score += points;
    scoreElement.textContent = formatNumber(score);
    showPopup('score-popup', points);
}

function updateCoins(coinsAdded) {
    coins += coinsAdded;
    coinsElement.textContent = formatNumber(coins);
    showPopup('coins-popup', coinsAdded);
}

function updateLevel() {
    level++;
    levelElement.textContent = formatNumber(level);
    showPopup('level-popup', 1);
}
tapCircle.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
});

// Обработка окончания касания
tapCircle.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].clientX;
    handleSwipe();
});

// Обработка клика для возврата в исходное состояние
tapCircle.addEventListener('click', () => {
    if (tapCircle.classList.contains('flipped')) {
        tapCircle.classList.remove('flipped');
    }
});
function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    const swipeThreshold = 150; // Минимальное расстояние для свайпа

    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Свайп вправо
            tapCircle.classList.add('flipped');
        } else {
            // Свайп влево
            tapCircle.classList.add('flipped');
        }
        updateCharacterDescription(); // Обновляем описание при перевороте
    }
}

function updateCharacterDescription() {
    const character = getCurrentCharacter();
    const descriptionElement = document.getElementById('character-description');
    if (character && descriptionElement) {
        const descriptionText = `${character.name}\n${character.description || 'Описание отсутствует.'}`;
        descriptionElement.innerHTML = descriptionText.replace(/\n/g, '<br>'); // Заменяем \n на <br>
    }
}
function buyUpgrade(upgradeId) {
    const upgrade = shopConfig.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) {
        showError('Улучшение не найдено.');
        return;
    }

    const currentLevel = getUpgradeLevel(upgradeId);

    // Проверяем, достигнут ли максимальный уровень
    if (currentLevel >= upgrade.maxLevel) {
        showError('Максимальный уровень улучшения уже достигнут.');
        return;
    }

    const cost = upgrade.baseCost + (currentLevel * upgrade.costIncrease);

    // Проверяем, достаточно ли монет
    if (coins >= cost) {
        coins -= cost;
        increaseUpgradeLevel(upgradeId); // Увеличиваем уровень улучшения
        applyUpgradeEffect(upgrade.effect); // Применяем эффект улучшения
        updateUI(); // Обновляем интерфейс
    } else {
        showError('Недостаточно монет для покупки улучшения.');
    }
}

function getUpgradeLevel(upgradeId) {
    switch (upgradeId) {
        case 'multiplier':
            return multiplierCount || 0;
        case 'auto-click':
            return autoClickerCount || 0;
        case 'critical-hit':
            return criticalHitCount || 0;
        case 'coin-bonus':
            return coinBonusCount || 0;
        case 'xp-boost':
            return xpBoostCount || 0;
        default:
            return 0;
    }
}

function increaseUpgradeLevel(upgradeId) {
    // Увеличивает уровень улучшения
    switch (upgradeId) {
        case 'multiplier':
            multiplierCount += 1;
            break;
        case 'auto-click':
            autoClickerCount += 1;
            break;
        case 'critical-hit':
            criticalHitCount += 1;
            break;
        case 'coin-bonus':
            coinBonusCount += 1;
            break;
        case 'xp-boost':
            xpBoostCount += 1;
            break;
    }
}

function applyUpgradeEffect(effectType) {
    switch (effectType) {
        case 'multiplier':
            applyMultiplierEffect();
            break;
        case 'autoClicker':
            applyAutoClickerEffect();
            break;
        case 'criticalHit':
            applyCriticalHitEffect();
            break;
        case 'coinBonus':
            applyCoinBonusEffect();
            break;
        case 'xpBoost':
            applyXpBoostEffect();
            break;
        default:
            console.error('Неизвестный тип улучшения:', effectType);
    }
}

function applyMultiplierEffect() {
    multiplier += 1; // Увеличиваем множитель на 1
    console.log(`Множитель увеличен! Текущий множитель: ${multiplier}`);
}

function applyAutoClickerEffect() {
    if (!autoClickerActive) {
        autoClickerActive = true;
        setInterval(() => {
            score += multiplier;
            coins += multiplier;
            xp += multiplier;

            updateScore(multiplier);
            updateCoins(multiplier);
            checkLevelUp();
            updateUI();

        }, 1000);
        console.log('Автокликер активирован!');
    }
}

function applyCriticalHitEffect() {
    console.log(`Критический удар улучшен! Шанс: ${(0.1 + (criticalHitCount * 0.05)) * 100}%, Множитель: x${2 + (criticalHitCount * 0.5)}`);
}

function applyCoinBonusEffect() {
    console.log(`Бонус монет улучшен! Множитель монет: x${1 + (coinBonusCount * 0.2)}`);
}

function applyXpBoostEffect() {
    console.log(`Ускорение опыта улучшено! Множитель опыта: x${1 + (xpBoostCount * 0.3)}`);
}

function createCriticalHitEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'critical-hit-effect';
    effect.textContent = '💥 Критический удар!';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

function renderShop() {
    const upgradesList = $('#upgrades-list');
    upgradesList.empty(); // Очищаем список улучшений

    shopConfig.upgrades.forEach(upgrade => {
        const currentLevel = getUpgradeLevel(upgrade.id);
        const cost = upgrade.baseCost + (currentLevel * upgrade.costIncrease);

        // Проверяем, достигнут ли максимальный уровень
        const isMaxLevel = currentLevel >= upgrade.maxLevel;

        // Создаем элемент улучшения
        const upgradeElement = $('<div>', {
            class: 'upgrade',
            'data-id': upgrade.id,
            click: () => buyUpgrade(upgrade.id) // Обработчик клика
        });

        // Заполняем содержимое элемента
        upgradeElement.html(`
            <div class="upgrade-header">
                ${upgrade.icon} ${upgrade.name}
                ${isMaxLevel ? '<span class="max-level">MAX</span>' : '<button class="btn buy-btn">Купить</button>'}
            </div>
            <div class="upgrade-details">
                Цена: <span class="upgrade-cost">${isMaxLevel ? '—' : formatNumber(cost)}</span> 🪙
                <br>
                Уровень: <span class="upgrade-level">${currentLevel}</span> / ${upgrade.maxLevel}
                <br>
                <small>${upgrade.description}</small>
            </div>
        `);

        // Добавляем элемент в список
        upgradesList.append(upgradeElement);
    });
}

function openShop() {
    renderShop();
    document.getElementById('shop-modal').style.display = 'block'; // Показываем модальное окно
}

function showLeaderboard() {
    saveProgress(); // Сохраняем прогресс, включая selectedCharacterId
    const currentUser = Telegram.WebApp.initDataUnsafe.user; // Получаем данные текущего пользователя
    const currentUsername = currentUser?.username || 'unknown'; // Используем username из Telegram

    $.ajax({
        url: '/api/leaderboard',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const leaderboardList = $('#leaderboard-list');
            leaderboardList.empty();

            if (data.length === 0) {
                leaderboardList.append('<li>Рекорды пока отсутствуют.</li>');
            } else {
                data.forEach((player, index) => {
                    const li = $('<li>');
                    const playerUsername = player.username || 'unknown'; // Используем username из данных или 'unknown'

                    const usernameLink = $('<a>', {
                        href: `https://t.me/${playerUsername}`,
                        text: `@${playerUsername}`,
                        css: {
                            textDecoration: 'none',
                            color: '#007BFF',
                            cursor: 'pointer'
                        },
                        target: '_blank' // Открывать ссылку в новой вкладке
                    });

                    const placeNumber = $('<span>').text(`${index + 1}. `);
                    li.append(placeNumber);

                    // Добавляем медали для первых трёх мест
                    if (index === 0) {
                        li.append($('<span>').text('🥇 '));
                    } else if (index === 1) {
                        li.append($('<span>').text('🥈 '));
                    } else if (index === 2) {
                        li.append($('<span>').text('🥉 '));
                    }

                    li.append(usernameLink);
                    li.append(`: ${formatNumber(player.score)}`);

                    // Подсвечиваем текущего пользователя
                    if (playerUsername === currentUsername) {
                        li.css({
                            backgroundColor: '#2c3e50', // Светло-голубой фон
                            fontWeight: 'bold' // Жирный шрифт
                        });
                    }

                    leaderboardList.append(li);
                });
            }

            $('#leaderboard-modal').show();
        },
        error: function(error) {
            console.error('Ошибка загрузки таблицы рекордов:', error);
            $('#leaderboard-list').html('<li>Не удалось загрузить рекорды.</li>');
            $('#leaderboard-modal').show();
        }
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
    const gameData = {
        score,
        coins,
        level,
        xp,
        multiplier,
        username,
        multiplierCount,
        autoClickerCount,
        criticalHitCount,
        coinBonusCount,
        xpBoostCount
    };

    localStorage.setItem('gameData', JSON.stringify(gameData));

    $.ajax({
        url: '/api/save',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ userId, ...gameData }),
        success: function(response) {
            console.log('Данные успешно сохранены:', response);
        },
        error: function(error) {
            console.error('Ошибка сохранения:', error);
        }
    });
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
            criticalHitCount = data.criticalHitCount || 0;
            coinBonusCount = data.coinBonusCount || 0;
            xpBoostCount = data.xpBoostCount || 0;
            updateUI(); // Обновляем интерфейс
        } catch (e) {
            console.error('Ошибка загрузки из localStorage:', e);
        }
    }

    const userId = Telegram.WebApp.initDataUnsafe.user?.id;
    if (userId) {
        $.ajax({
            url: `/api/load?userId=${userId}`,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data) {
                    score = data.score || score;
                    coins = data.coins || coins;
                    level = data.level || level;
                    xp = data.xp || xp;
                    multiplier = data.multiplier || multiplier;
                    multiplierCount = data.multiplierCount || multiplierCount;
                    autoClickerCount = data.autoClickerCount || autoClickerCount;
                    criticalHitCount = data.criticalHitCount || criticalHitCount;
                    coinBonusCount = data.coinBonusCount || coinBonusCount;
                    xpBoostCount = data.xpBoostCount || xpBoostCount;
                    updateUI(); // Обновляем интерфейс
                }
            },
            error: function(error) {
                console.error('Ошибка загрузки с сервера:', error);
            }
        });
    }

    updateImage(); // Обновляем изображение
}


function formatNumber(number) {
    if (number >= 1e12) { // Триллионы
        return (number / 1e12).toFixed(3) + 'T';
    } else if (number >= 1e9) { // Миллиарды
        return (number / 1e9).toFixed(3) + 'B';
    } else if (number >= 1e6) { // Миллионы
        return (number / 1e6).toFixed(3) + 'M';
    } else if (number >= 1e3) { // Тысячи
        return (number / 1e3).toFixed(3) + 'K';
    } else {
        return number.toString(); // Меньше 1000
    }
}
function updateUI() {
    $('#score').text(formatNumber(score));
    $('#coins').text(formatNumber(coins));
    $('#level').text(formatNumber(level));

    // Проверяем, нужно ли активировать автокликер


    // Обновляем магазин
    shopConfig.upgrades.forEach(upgrade => {
        const currentLevel = getUpgradeLevel(upgrade.id);
        const cost = upgrade.baseCost + (currentLevel * upgrade.costIncrease);

        const upgradeElement = $(`.upgrade[data-id="${upgrade.id}"]`);
        if (upgradeElement.length) {
            upgradeElement.find('.upgrade-cost').text(formatNumber(cost));
            upgradeElement.find('.upgrade-level').text(currentLevel);
        }
    });
}

function createTapEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'tap-effect';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
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
    const character = getCurrentCharacter();
    const tapImage = document.getElementById('tap-image');
    const tapSound = document.getElementById('tap-sound');

    tapImage.src = character.image;
    tapSound.src = character.sound;

    // Обновляем описание, если кружок перевернут
    if (tapCircle.classList.contains('flipped')) {
        updateCharacterDescription();
    }
}

function showNewCharacterPopup(character) {
    const popup = document.createElement('div');
    popup.className = 'level-up-popup';
    popup.innerHTML = `
        <h2>🎉 Новый персонаж!</h2>
        <p>${character.name}!</p>
    `;
    document.body.appendChild(popup);
}


function getCharacterForLevel(currentLevel) {
    let unlockedCharacter = null;
    for (const character of configCharacter.characters) {
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

    const shareText = `
🎮 *Мой прогресс в Refresher Tapper*:
🔥 Счет: *${score}*
🪙 Монеты: *${coins}*
📈 Уровень: *${level}*

💪 Попробуй побить мой рекорд!
👉 Перейди в бота: @RefresherTapperBot
    `.trim();

    copyToClipboard(shareText);
}

function openCharacterModal() {
    const characterList = document.getElementById('character-list');
    characterList.innerHTML = '';

    const nextUnlockLevel = configCharacter.characters
        .map(character => character.entryLevel)
        .filter(lvl => lvl > level)
        .sort((a, b) => a - b)[0];

    configCharacter.characters.forEach(character => {
        const characterItem = document.createElement('div');
        characterItem.className = 'character-item';

        if (character.entryLevel <= level) {
            characterItem.innerHTML = `
                <img src="${character.image}" alt="${character.name}">
                <span>${character.name}</span>
            `;
            characterItem.onclick = () => selectCharacter(character);
        } else {
            characterItem.innerHTML = `
                <div class="locked-character"></div>
                <span>???</span>
                <small>Откроется на уровне ${character.entryLevel}</small>
            `;
        }

        characterList.appendChild(characterItem);
    });

    let nextUnlockInfo = document.getElementById('next-unlock-info');
    if (!nextUnlockInfo) {
        nextUnlockInfo = document.createElement('div');
        nextUnlockInfo.id = 'next-unlock-info';
        nextUnlockInfo.className = 'next-unlock';
        document.getElementById('character-modal').appendChild(nextUnlockInfo);
    }

    nextUnlockInfo.textContent = nextUnlockLevel
        ? `Следующий персонаж откроется на уровне ${nextUnlockLevel}`
        : 'Все персонажи открыты';

    document.getElementById('character-modal').style.display = 'block';
}


function closeCharacterModal() {
    document.getElementById('character-modal').style.display = 'none';
}

function selectCharacter(character) {
    selectedCharacter = character; // Устанавливаем выбранного персонажа
    updateImage(); // Обновляем изображение
    closeCharacterModal(); // Закрываем модальное окно
}

loadProgress();
updateImage();