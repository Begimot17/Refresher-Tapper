let score = 0;
let coins = 0;
let level = 1;
let coin_for_level = 10;
let xp = 0;
let multiplier = 1;
let autoClickerActive = false;
let multiplierCount = 0;
let autoClickerCount = 0;
let criticalHitCount = 0; // Уровень улучшения "Критический удар"
let coinBonusCount = 0;   // Уровень улучшения "Бонус монет"
let xpBoostCount = 0;
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
            entryLevel: 114,
            image: 'images/glebasta.jpg',
            sound: 'sounds/default.mp3',
        },
        {
            name: "Любомир",
            entryLevel: 161,
            image: 'images/lubomir.jpg',
            sound: 'sounds/default.mp3',
        },
        {
            name: "Глебаста",
            entryLevel: 2000,
            image: 'images/glebasta.jpg',
            sound: 'sounds/default.mp3',
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

tapCircle.addEventListener('click', (event) => {
    tapSound.currentTime = 0;
    tapSound.play();

    const x = event.clientX;
    const y = event.clientY;

    createTapEffect(x, y);

    updateScore(multiplier);
    updateCoins(multiplier);
    xp += multiplier;
    checkLevelUp();
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
    const neededXP = level * 100;
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
    popup.textContent = `+${value}`;
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

function buyUpgrade(upgradeId) {
    const upgrade = shopConfig.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) {
        showError('Улучшение не найдено.');
        return;
    }

    const currentLevel = getUpgradeLevel(upgradeId);
    const cost = upgrade.baseCost + (currentLevel * upgrade.costIncrease);

    if (coins >= cost) {
        coins -= cost;
        increaseUpgradeLevel(upgradeId);

        applyUpgradeEffect(upgrade.effect);

        const rect = document.querySelector(`.upgrade[data-id="${upgradeId}"]`).getBoundingClientRect();
        createUpgradeEffect(`${upgrade.icon} ${upgrade.name} улучшен!`, rect.left + 50, rect.top);

        updateUI();
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

            checkLevelUp();
            updateUI();

        }, 1000);
        console.log('Автокликер активирован!');
    }
}

function applyCriticalHitEffect() {
    const criticalHitChance = 0.1 + (criticalHitCount * 0.05);
    const criticalHitMultiplier = 2 + (criticalHitCount * 0.5);

    // Переопределяем функцию обработки клика
    tapCircle.removeEventListener('click', handleTap);
    tapCircle.addEventListener('click', handleTap);

    function handleTap(event) {
        tapSound.currentTime = 0;
        tapSound.play();
        createTapEffect(event.clientX, event.clientY);
        if (Math.random() < criticalHitChance) {
            const criticalScore = multiplier * criticalHitMultiplier;
            const criticalCoins = multiplier * criticalHitMultiplier;
            const criticalXp = multiplier * criticalHitMultiplier;
            updateScore(criticalScore);
            updateCoins(criticalCoins);
            xp += criticalXp;
            createCriticalHitEffect(event.clientX, event.clientY);
        } else {
            updateScore(multiplier);
            updateCoins(multiplier);
            xp += multiplier;
        }

        checkLevelUp();
    }

    console.log(`Критический удар улучшен! Шанс: ${criticalHitChance * 100}%, Множитель: x${criticalHitMultiplier}`);
}

function applyCoinBonusEffect() {
    const coinBonusMultiplier = 1 + (coinBonusCount * 0.2); // +20% монет за каждый уровень
    tapCircle.removeEventListener('click', handleTap); // Удаляем старый обработчик
    tapCircle.addEventListener('click', handleTap); // Добавляем новый

    function handleTap(event) {
        tapSound.currentTime = 0;
        tapSound.play();
        createTapEffect(event.clientX, event.clientY);
        updateScore(multiplier);
        xp += multiplier;
        const coinsEarned = multiplier * coinBonusMultiplier;
        updateCoins(coinsEarned);

        checkLevelUp();
    }

    console.log(`Бонус монет улучшен! Множитель монет: x${coinBonusMultiplier}`);
}

function applyXpBoostEffect() {
    const xpBoostMultiplier = 1 + (xpBoostCount * 0.3); // +30% опыта за каждый уровень

    tapCircle.removeEventListener('click', handleTap); // Удаляем старый обработчик
    tapCircle.addEventListener('click', handleTap); // Добавляем новый

    function handleTap(event) {
        tapSound.currentTime = 0;
        tapSound.play();
        createTapEffect(event.clientX, event.clientY);
        updateScore(multiplier);
        updateCoins(multiplier);

        const xpEarned = multiplier * xpBoostMultiplier;
        xp += xpEarned;

        checkLevelUp();
    }

    console.log(`Ускорение опыта улучшено! Множитель опыта: x${xpBoostMultiplier}`);
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
    const upgradesList = document.getElementById('upgrades-list');
    upgradesList.innerHTML = '';

    shopConfig.upgrades.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade';
        upgradeElement.setAttribute('data-id', upgrade.id);
        upgradeElement.onclick = () => buyUpgrade(upgrade.id);

        const currentLevel = getUpgradeLevel(upgrade.id);
        const cost = upgrade.baseCost + (currentLevel * upgrade.costIncrease);

        upgradeElement.innerHTML = `
            <div class="upgrade-header">
                ${upgrade.icon} ${upgrade.name}
                <button class="btn buy-btn">Купить</button>
            </div>
            <div class="upgrade-details">
                Цена: <span class="upgrade-cost">${formatNumber(cost)}</span> 🪙
                <br>
                Уровень: <span class="upgrade-level">${currentLevel}</span> / ${upgrade.maxLevel}
                <br>
                <small>${upgrade.description}</small>
            </div>
        `;

        upgradesList.appendChild(upgradeElement);
    });
}

function openShop() {
    renderShop();
    document.getElementById('shop-modal').style.display = 'block'; // Показываем модальное окно
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

                    usernameLink.href = `https://t.me/${player.username}`;
                    usernameLink.textContent = `@${player.username || 'unknown'}`;
                    usernameLink.style.textDecoration = 'none';
                    usernameLink.style.color = '#007BFF';
                    usernameLink.style.cursor = 'pointer';
                    usernameLink.target = '_blank'; // Открывать ссылку в новой вкладке

                    const placeNumber = document.createElement('span');
                    placeNumber.textContent = `${index + 1}. `;
                    li.appendChild(placeNumber);

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
                    li.appendChild(document.createTextNode(`: ${formatNumber(player.score)}`));
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

    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, ...gameData}), // Отправляем username на сервер
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
            criticalHitCount = data.criticalHitCount || 0;
            coinBonusCount = data.coinBonusCount || 0;
            xpBoostCount = data.xpBoostCount || 0;
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
                    criticalHitCount = data.criticalHitCount || criticalHitCount;
                    coinBonusCount = data.coinBonusCount || coinBonusCount;
                    xpBoostCount = data.xpBoostCount || xpBoostCount;
                    updateUI();
                }
            })
            .catch(error => console.error('Ошибка загрузки с сервера:', error));
    }

    updateImage();
}


function formatNumber(number) {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(2) + 'M'; // Миллионы
    } else if (number >= 1000) {
        return (number / 1000).toFixed(2) + 'K'; // Тысячи
    } else {
        return number.toString(); // Меньше 1000
    }
}

function updateUI() {
    scoreElement.textContent = formatNumber(score);
    coinsElement.textContent = formatNumber(coins);
    levelElement.textContent = formatNumber(level);

    shopConfig.upgrades.forEach(upgrade => {
        const currentLevel = getUpgradeLevel(upgrade.id);
        const cost = upgrade.baseCost + (currentLevel * upgrade.costIncrease);

        const upgradeElement = document.querySelector(`.upgrade[data-id="${upgrade.id}"]`);
        if (upgradeElement) {
            upgradeElement.querySelector('.upgrade-cost').textContent = formatNumber(cost);
            upgradeElement.querySelector('.upgrade-level').textContent = currentLevel;
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
    const character = getCurrentCharacter(); // Получаем текущего персонажа
    const tapImage = document.getElementById('tap-image');
    const tapSound = document.getElementById('tap-sound');

    // Плавное изменение изображения
    tapImage.src = character.image

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
}


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

    const shareText = `
🎮 *Мой прогресс в Refresher Tapper*:
🔥 Счет: *${score}*
🪙 Монеты: *${coins}*
📈 Уровень: *${level}*

💪 Попробуй побить мой рекорд!
👉 Перейди в бота: @bogdan_tapper_bot
    `.trim();

    copyToClipboard(shareText);
}

function openCharacterModal() {
    const characterList = document.getElementById('character-list');
    characterList.innerHTML = '';

    const nextUnlockLevel = config.characters
        .map(character => character.entryLevel)
        .filter(lvl => lvl > level)
        .sort((a, b) => a - b)[0];

    config.characters.forEach(character => {
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
    saveProgress(); // Сохраняем прогресс, включая selectedCharacterId
}

loadProgress();
updateImage();