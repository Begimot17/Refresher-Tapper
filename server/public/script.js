let score = 0
let coins = 0
let level = 1
let coin_for_level = 10
let score_for_level = 100
let xp = 0
let multiplier = 1
let autoClickerActive = false
let multiplierCount = 0
let autoClickerCount = 0
let criticalHitCount = 0 // Уровень улучшения "Критический удар"
let coinBonusCount = 0 // Уровень улучшения "Бонус монет"
let xpBoostCount = 0
let touchStartX = 0
let touchEndX = 0
let selectedCharacter = null

Telegram.WebApp.ready()
Telegram.WebApp.expand()

const tapCircle = document.getElementById('tap-circle')
const configCharacter = {
  characters: [
    {
      id: 1,
      name: 'Существо',
      entryLevel: 1,
      image: 'images/anything.gif',
      sound: 'sounds/default.mp3'
    },
    {
      id: 2,
      name: 'Максим',
      entryLevel: 5,
      image: 'images/maksim.gif',
      sound: 'sounds/maksim.m4a',
      description: 'Любит играть, не любит ходить за хлебом '
    },
    {
      id: 3,
      name: 'Рома',
      entryLevel: 10,
      image: 'images/roma.gif',
      sound: 'sounds/roma.m4a',
      description: 'Черничный пёс'
    },
    {
      id: 4,
      name: 'Глебаста',
      entryLevel: 15,
      image: 'images/glebasta.jpg',
      sound: 'sounds/default.mp3',
      description: 'Душа компании, любит Короля и Шута. Моряк'
    },
    {
      id: 5,
      name: 'Любомир',
      entryLevel: 20,
      image: 'images/lubomir.jpg',
      sound: 'sounds/lubomir.mp3',
      description: 'Душа компании, любит Серьёзного Сема. Ветеран'
    },
    {
      id: 6,
      name: 'Лёша',
      entryLevel: 25,
      image: 'images/lesha_dyachkov.jpg',
      sound: 'sounds/lesha_dyachkov.mp3',
      description: 'Душа компании, любит Ланос. Электрик'
    },
    {
      id: 7,
      name: 'Дима',
      entryLevel: 35,
      image: 'images/dima_brusko.jpg',
      sound: 'sounds/dima_brusko.mp3',
      description: 'Душа АЙТИ компании, любит Макбук. Программист'
    },
    {
      id: 8,
      name: 'Жека',
      entryLevel: 50,
      image: 'images/evgeniy.gif',
      sound: 'sounds/jeka_isaenko.mp3',
      animationDuration: 1500,
      description: 'Душа компании, любит Подушки. Часовщик'
    },
    {
      id: 9,
      name: 'Саня',
      entryLevel: 75,
      image: 'images/sasha_isaenko.jpg',
      sound: 'sounds/sasha_isaenko.mp3',
      description: 'Душа компании, любит CS GO. Камерщик'
    },
    {
      id: 10,
      name: 'Жума',
      entryLevel: 100,
      image: 'images/juma.jpg',
      sound: 'sounds/juma.mp3',
      description: 'Душа компании, любит Lays. Асперанто-Лаборанто'
    },
    {
      id: 11,
      name: 'Никита',
      entryLevel: 150,
      image: 'images/nikita.jpg',
      sound: 'sounds/nikita.mp3',
      description: 'Бог'
    },
    {
      id: 12,
      name: 'Дуля',
      entryLevel: 999,
      image: 'images/dula.jpg',
      sound: 'sounds/dula.mp3',
      description: '😜'
    }
  ],
  defaultImage: 'images/bogdan.jpg',
  defaultSound: 'sounds/bogdan.m4a'
}
const shopConfig = {
  upgrades: [
    {
      id: 'multiplier',
      name: 'Самогон',
      description:
        'Увеличивает эффективность вашего клика. Чем больше самогона, тем больше очков и монет!',
      baseCost: 50,
      costIncrease: 50,
      effect: 'multiplier',
      maxLevel: 2500,
      icon: '🍺'
    },
    {
      id: 'auto-click',
      name: 'Волга',
      description: 'Автоматически кликает за вас. Волга работает без устали, пока вы отдыхаете!',
      baseCost: 100,
      costIncrease: 100,
      effect: 'autoClicker',
      maxLevel: 1000,
      icon: '🏎️'
    },
    {
      id: 'critical-hit',
      name: 'Подик',
      description:
        'Шанс нанести мощный удар, который приносит в разы больше очков и монет. Подик — это сила!',
      baseCost: 500,
      costIncrease: 500,
      effect: 'criticalHit',
      maxLevel: 500,
      icon: '💥'
    },
    {
      id: 'coin-bonus',
      name: 'База',
      description: 'Увеличивает количество монет за клик. База — это надежный источник дохода!',
      baseCost: 10000,
      costIncrease: 2500,
      effect: 'coinBonus',
      maxLevel: 250,
      icon: '💰'
    },
    {
      id: 'xp-boost',
      name: 'Снюс',
      description:
        'Увеличивает количество опыта за клик. Снюс заряжает энергией и помогает быстрее расти!',
      baseCost: 25000,
      costIncrease: 10000,
      effect: 'xpBoost',
      maxLevel: 250,
      icon: '📦'
    }
  ]
}
const $tapSound = $('#tap-sound')[0]
const baseCriticalHitChance = 0.1
const baseCriticalHitMultiplier = 2
const baseCoinBonusMultiplier = 1
function handleTap(event) {
  $tapSound.currentTime = 0
  $tapSound.play()
  createTapEffect(event.clientX, event.clientY)

  let scoreEarned = multiplier
  let coinsEarned = multiplier

  // Критический удар
  if (Math.random() < baseCriticalHitChance + criticalHitCount * 0.002) {
    const criticalMultiplier = baseCriticalHitMultiplier + criticalHitCount * 0.02
    scoreEarned *= criticalMultiplier
    coinsEarned *= criticalMultiplier
    createCriticalHitEffect(event.clientX, event.clientY)
  }

  // Бонус монет и XP
  coinsEarned *= baseCoinBonusMultiplier + coinBonusCount * 0.02

  // Округление и обновление
  updateScore(Math.round(scoreEarned))
  updateCoins(Math.round(coinsEarned))

  checkLevelUp()
}

$('#tap-circle').on('click', handleTap)

// Устанавливаем обработчик клика
tapCircle.addEventListener('click', handleTap)
const scoreItems = document.querySelectorAll('.score-item')

scoreItems.forEach(item => {
  item.addEventListener('click', () => {
    const tooltip = item.querySelector('.tooltip')
    tooltip.style.visibility = 'visible'
    tooltip.style.opacity = 1

    // Скрываем подсказку через 2 секунды
    setTimeout(() => {
      tooltip.style.visibility = 'hidden'
      tooltip.style.opacity = 0
    }, 2000)
  })
})
function closeShop() {
  $('#shop-modal').hide()
}

function getCurrentCharacter() {
  if (selectedCharacter) {
    return selectedCharacter
  }
  return getCharacterForLevel(level)
}

function checkLevelUp() {
  const levelsGained = Math.floor(xp / (level * score_for_level))
  if (levelsGained > 0) {
    const totalXPNeeded = level * score_for_level * levelsGained
    xp -= totalXPNeeded
    coins += level * coin_for_level * levelsGained

    const newLevel = level + levelsGained
    const newCharacter = configCharacter.characters.find(
      character => character.entryLevel === newLevel
    )
    if (newCharacter) {
      showNewCharacterPopup(newCharacter)
    }

    updateLevel(levelsGained)
    showLevelUpPopup()
    updateUI()
  }
}

function showPopup(elementId, value) {
  const $popup = $(`#${elementId}`)
  $popup
    .text(`+${formatNumber(value)}`)
    .addClass('show')
    .delay(2000)
    .queue(() => $popup.removeClass('show').dequeue())
}

function updateScore(points) {
  xp += points
  score += points
  $('#score').text(formatNumber(score))
  showPopup('score-popup', points)
}

function updateCoins(coinsAdded) {
  coins += coinsAdded
  $('#coins').text(formatNumber(coins))
  showPopup('coins-popup', coinsAdded)
}

function updateLevel(levelsGained) {
  level += levelsGained
  $('#level').text(formatNumber(level))
  showPopup('level-popup', levelsGained)
}
tapCircle.addEventListener('touchstart', event => {
  touchStartX = event.touches[0].clientX
})

// Обработка окончания касания
tapCircle.addEventListener('touchend', event => {
  touchEndX = event.changedTouches[0].clientX
  handleSwipe()
})

// Обработка клика для возврата в исходное состояние
tapCircle.addEventListener('click', () => {
  if (tapCircle.classList.contains('flipped')) {
    tapCircle.classList.remove('flipped')
  }
})
function handleSwipe() {
  const swipeDistance = touchEndX - touchStartX
  const swipeThreshold = 150 // Минимальное расстояние для свайпа

  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      // Свайп вправо
      tapCircle.classList.add('flipped')
    } else {
      // Свайп влево
      tapCircle.classList.add('flipped')
    }
    updateCharacterDescription() // Обновляем описание при перевороте
  }
}

function updateCharacterDescription() {
  const character = getCurrentCharacter()
  const descriptionElement = document.getElementById('character-description')
  if (character && descriptionElement) {
    const descriptionText = `${character.name}\n${character.description || 'Описание отсутствует.'}`
    descriptionElement.innerHTML = descriptionText.replace(/\n/g, '<br>') // Заменяем \n на <br>
  }
}
function buyUpgrade(upgradeId) {
  const upgrade = shopConfig.upgrades.find(u => u.id === upgradeId)
  if (!upgrade) {
    showError('Улучшение не найдено.')
    return
  }

  const currentLevel = getUpgradeLevel(upgradeId)

  // Проверяем, достигнут ли максимальный уровень
  if (currentLevel >= upgrade.maxLevel) {
    showError('Максимальный уровень улучшения уже достигнут.')
    return
  }

  const cost = upgrade.baseCost + currentLevel * upgrade.costIncrease

  // Проверяем, достаточно ли монет
  if (coins >= cost) {
    coins -= cost
    increaseUpgradeLevel(upgradeId) // Увеличиваем уровень улучшения
    applyUpgradeEffect(upgrade.effect) // Применяем эффект улучшения
    updateUI() // Обновляем интерфейс
  } else {
    showError('Недостаточно монет для покупки улучшения.')
  }
}

function getUpgradeLevel(upgradeId) {
  switch (upgradeId) {
    case 'multiplier':
      return multiplierCount || 0
    case 'auto-click':
      return autoClickerCount || 0
    case 'critical-hit':
      return criticalHitCount || 0
    case 'coin-bonus':
      return coinBonusCount || 0
    case 'xp-boost':
      return xpBoostCount || 0
    default:
      return 0
  }
}

function increaseUpgradeLevel(upgradeId) {
  // Увеличивает уровень улучшения
  switch (upgradeId) {
    case 'multiplier':
      multiplier += 1
      multiplierCount += 1
      break
    case 'auto-click':
      autoClickerCount += 1
      break
    case 'critical-hit':
      criticalHitCount += 1
      break
    case 'coin-bonus':
      coinBonusCount += 1
      break
    case 'xp-boost':
      xpBoostCount += 1
      break
  }
}

function applyUpgradeEffect(effectType) {
  switch (effectType) {
    case 'multiplier':
      break
    case 'autoClicker':
      applyAutoClickerEffect()
      break
    case 'criticalHit':
      break
    case 'coinBonus':
      break
    case 'xpBoost':
      break
    default:
      console.error('Неизвестный тип улучшения:', effectType)
  }
}

function applyAutoClickerEffect() {
  if (!autoClickerActive) {
    autoClickerActive = true
    setInterval(() => {
      updateScore(multiplier + autoClickerCount)
      updateCoins(multiplier + autoClickerCount)
      checkLevelUp()
      updateUI()
    }, 1000)
  }
}
function createCriticalHitEffect(x, y) {
  const $effect = $('<div>')
    .addClass('critical-hit-effect')
    .text('💥 Критический удар!')
    .css({left: `${x}px`, top: `${y}px`})
  $('body').append($effect)
  setTimeout(() => $effect.remove(), 1000)
}

function renderShop() {
  const $upgradesList = $('#upgrades-list')
  $upgradesList.empty()

  shopConfig.upgrades.forEach(upgrade => {
    const currentLevel = getUpgradeLevel(upgrade.id)
    const cost = upgrade.baseCost + currentLevel * upgrade.costIncrease
    const isMaxLevel = currentLevel >= upgrade.maxLevel

    const $upgradeElement = $('<div>')
      .addClass('upgrade')
      .attr('data-id', upgrade.id)
      .click(() => buyUpgrade(upgrade.id))

    $upgradeElement.html(`
      <div class="upgrade-header">
        ${upgrade.icon} ${upgrade.name}
      </div>
      <div class="upgrade-details">
        Цена: <span class="upgrade-cost">${isMaxLevel ? '—' : formatNumber(cost)}</span> 🪙
        <br>
        Уровень: <span class="upgrade-level">${currentLevel}</span> / ${upgrade.maxLevel}
        <br>
        <small>${upgrade.description}</small>
      </div>
    `)

    $upgradesList.append($upgradeElement)
  })
}

function openShop() {
  renderShop()
  $('#shop-modal').show()
}

function showLeaderboard() {
  saveProgress()
  const currentUser = Telegram.WebApp.initDataUnsafe.user
  const currentUsername = currentUser?.username || 'unknown'

  $.ajax({
    url: '/api/leaderboard',
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      const $leaderboardList = $('#leaderboard-list').empty()

      if (data.length === 0) {
        $leaderboardList.append('<li>Рекорды пока отсутствуют.</li>')
      } else {
        data.forEach((player, index) => {
          const $li = $('<li>')
          const playerUsername = player.username || 'unknown'

          const $usernameLink = $('<a>', {
            href: `https://t.me/${playerUsername}`,
            text: `@${playerUsername}`,
            css: {
              textDecoration: 'none',
              color: '#007BFF',
              cursor: 'pointer'
            },
            target: '_blank'
          })

          const $placeNumber = $('<span>').text(`${index + 1}. `)
          $li.append($placeNumber)

          if (index === 0) {
            $li.append($('<span>').text('🥇 '))
          } else if (index === 1) {
            $li.append($('<span>').text('🥈 '))
          } else if (index === 2) {
            $li.append($('<span>').text('🥉 '))
          }

          $li.append($usernameLink)
          $li.append(`: ${formatNumber(player.score)}`)

          if (playerUsername === currentUsername) {
            $li.css({
              backgroundColor: '#2c3e50',
              fontWeight: 'bold'
            })
          }

          $leaderboardList.append($li)
        })
      }

      $('#leaderboard-modal').show()
    },
    error: function (error) {
      console.error('Ошибка загрузки таблицы рекордов:', error)
      $('#leaderboard-list').html('<li>Не удалось загрузить рекорды.</li>')
      $('#leaderboard-modal').show()
    }
  })
}

function closeLeaderboard() {
  $('#leaderboard-modal').hide()
}

window.onclick = event => {
  const leaderboardModal = document.getElementById('leaderboard-modal')
  if (event.target === leaderboardModal) {
    leaderboardModal.style.display = 'none'
  }
}

function saveProgress() {
  const userId = Telegram.WebApp.initDataUnsafe.user?.id || 1
  const username = Telegram.WebApp.initDataUnsafe.user?.username || 'unknown'
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
    xpBoostCount,
    selectedCharacter: selectedCharacter ? selectedCharacter.id : null
  }

  localStorage.setItem('gameData', JSON.stringify(gameData))

  $.ajax({
    url: '/api/save',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({userId, ...gameData}),
    success: function (response) {
      console.log('Данные успешно сохранены:', response)
    },
    error: function (error) {
      console.error('Ошибка сохранения:', error)
    }
  })
}

function loadProgress() {
  const userId = Telegram.WebApp.initDataUnsafe.user?.id
  if (userId) {
    $.ajax({
      url: '/api/load',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({userId}),
      dataType: 'json',
      success: function (data) {
        if (data && data.user) {
          const userData = data.user
          score = userData.score || 0
          coins = userData.coins || 0
          level = userData.level || 1
          xp = userData.xp || 0
          multiplier = userData.multiplier || 1
          multiplierCount = userData.multiplierCount || 0
          autoClickerCount = userData.autoClickerCount || 0
          criticalHitCount = userData.criticalHitCount || 0
          coinBonusCount = userData.coinBonusCount || 0
          xpBoostCount = userData.xpBoostCount || 0

          if (userData.selectedCharacter) {
            selectedCharacter = configCharacter.characters.find(
              char => char.id === userData.selectedCharacter
            )
            selectCharacter(selectedCharacter)
          }

          updateUI()

          if (autoClickerCount > 0) {
            applyAutoClickerEffect()
          }
        }
      },
      error: function (error) {
        console.error('Ошибка загрузки с сервера:', error)
      }
    })
  } else {
    const savedData = localStorage.getItem('gameData')
    if (savedData) {
      const gameData = JSON.parse(savedData)
      score = gameData.score || 0
      coins = gameData.coins || 0
      level = gameData.level || 1
      xp = gameData.xp || 0
      multiplier = gameData.multiplier || 1
      multiplierCount = gameData.multiplierCount || 0
      autoClickerCount = gameData.autoClickerCount || 0
      criticalHitCount = gameData.criticalHitCount || 0
      coinBonusCount = gameData.coinBonusCount || 0
      xpBoostCount = gameData.xpBoostCount || 0

      if (gameData.selectedCharacter) {
        selectedCharacter = configCharacter.characters.find(
          char => char.id === gameData.selectedCharacter
        )
        selectCharacter(selectedCharacter)
      }

      updateUI()

      if (autoClickerCount > 0) {
        applyAutoClickerEffect()
      }
    }
  }
  updateImage()
}

function formatNumber(number) {
  const absNumber = Math.abs(number)
  if (absNumber >= 1e12) return `${(number / 1e12).toFixed(2)}T`
  if (absNumber >= 1e9) return `${(number / 1e9).toFixed(2)}B`
  if (absNumber >= 1e6) return `${(number / 1e6).toFixed(2)}M`
  if (absNumber >= 1e3) return `${(number / 1e3).toFixed(2)}K`
  return number.toString()
}
function updateUI() {
  $('#score').text(formatNumber(score))
  $('#coins').text(formatNumber(coins))
  $('#level').text(formatNumber(level))

  shopConfig.upgrades.forEach(upgrade => {
    const currentLevel = getUpgradeLevel(upgrade.id)
    const cost = upgrade.baseCost + currentLevel * upgrade.costIncrease

    const upgradeElement = $(`.upgrade[data-id="${upgrade.id}"]`)
    if (upgradeElement.length) {
      upgradeElement.find('.upgrade-cost').text(formatNumber(cost))
      upgradeElement.find('.upgrade-level').text(currentLevel)

      if (currentLevel >= upgrade.maxLevel) {
        upgradeElement.addClass('max-level').off('click')
      }
    }
  })
}

function createTapEffect(x, y) {
  const $effect = $('<div>')
    .addClass('tap-effect')
    .css({left: `${x}px`, top: `${y}px`})
  $('body').append($effect)
  setTimeout(() => $effect.remove(), 1000)
}

function updateImage() {
  const character = getCurrentCharacter()
  $('#tap-image').attr('src', character.image)
  $('#tap-sound').attr('src', character.sound)
  if ($('#tap-circle').hasClass('flipped')) updateCharacterDescription()
}

function showNewCharacterPopup(character) {
  $('<div>')
    .addClass('new-character-popup')
    .html(`<h2>🎉 Новый персонаж!</h2><p>${character.name}!</p>`)
    .appendTo('body')
    .delay(3000)
    .fadeOut(() => $(this).remove())
}

function getCharacterForLevel(currentLevel) {
  let unlockedCharacter = null
  for (const character of configCharacter.characters) {
    if (currentLevel >= character.entryLevel) {
      unlockedCharacter = character
    } else {
      break // Прерываем цикл, так как персонажи отсортированы по уровню
    }
  }
  return unlockedCharacter
}

function showLevelUpPopup() {
  const $popup = $('<div>').addClass('level-up-popup').html(`
    <h2>🎉 Уровень ${level}!</h2>
    <p>+${formatNumber(level * coin_for_level)} монет</p>
  `)
  $('body').append($popup)
  setTimeout(() => $popup.remove(), 1000)
}

function showError(message) {
  const $errorElement = $('#error-message')
  if ($errorElement.length) {
    $errorElement.text(message).show()
    setTimeout(() => $errorElement.hide(), 1500)
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showError('Прогресс скопирован! Вставьте его в Telegram и отправьте.')
    })
    .catch(() => {
      showError('Ошибка: Не удалось скопировать прогресс.')
    })
}

function shareProgress() {
  const user = Telegram.WebApp.initDataUnsafe?.user
  if (!user) {
    showError('Ошибка: Пользователь не авторизован.')
    return
  }

  const shareText = `
🎮 *Мой прогресс в Refresher Tapper*:
🔥 Счет: *${formatNumber(score)}*
🪙 Монеты: *${formatNumber(coins)}*
📈 Уровень: *${level}*

💪 Попробуй побить мой рекорд!
👉 Перейди в бота: @RefresherTapperBot
    `.trim()

  copyToClipboard(shareText)
}

function openCharacterModal() {
  const nextUnlockLevel = configCharacter.characters
    .filter(c => c.entryLevel > level)
    .sort((a, b) => a.entryLevel - b.entryLevel)[0]?.entryLevel

  const $characterList = $('#character-list').empty()

  configCharacter.characters.forEach(character => {
    const $characterItem = $('<div>')
      .addClass('character-item')
      .toggleClass('locked', character.entryLevel > level)
      .html(
        character.entryLevel <= level
          ? `<img src="${character.image}" alt="${character.name}"><span>${character.name}</span>`
          : `<div class="locked-character"></div><span>???</span><small>Откроется на уровне ${character.entryLevel}</small>`
      )
      .on('click', () => character.entryLevel <= level && selectCharacter(character))

    $characterList.append($characterItem)
  })

  $('#next-unlock-info').text(
    nextUnlockLevel
      ? `Следующий персонаж откроется на уровне ${nextUnlockLevel}`
      : 'Все персонажи открыты'
  )

  $('#character-modal').show()
}

function closeCharacterModal() {
  $('#character-modal').hide()
}

function selectCharacter(character) {
  selectedCharacter = character
  updateImage()
  closeCharacterModal()
  saveProgress()
}
$(document).ready(function () {
  // Открываем модальное окно меню
  $('#menu-button').on('click', function () {
    $('#menu-modal').show()
  })

  // Закрываем модальное окно меню
  $('.close').on('click', function () {
    $('#menu-modal').hide()
  })

  // Закрываем модальное окно при клике вне его
  $(window).on('click', function (event) {
    if ($(event.target).hasClass('modal')) {
      $('#menu-modal').hide()
    }
  })
})
// Функция для открытия кастомного confirm
function confirmResetProgress() {
  const customConfirmModal = document.getElementById('custom-confirm-modal')
  customConfirmModal.style.display = 'flex' // Показываем модальное окно
}

// Функция для закрытия кастомного confirm
function closeCustomConfirmModal() {
  const customConfirmModal = document.getElementById('custom-confirm-modal')
  customConfirmModal.style.display = 'none' // Скрываем модальное окно
}

// Обработчик для кнопки "Да, обнулить"
document.getElementById('confirm-reset').addEventListener('click', function () {
  resetProgress() // Выполняем сброс прогресса
  closeCustomConfirmModal() // Закрываем модальное окно
})

// Обработчик для кнопки "Отмена"
document.getElementById('cancel-reset').addEventListener('click', function () {
  closeCustomConfirmModal() // Закрываем модальное окно без действий
})

// Функция сброса прогресса
function resetProgress() {
  score = 0
  coins = 0
  level = 1
  xp = 0
  multiplier = 1
  multiplierCount = 0
  autoClickerCount = 0
  criticalHitCount = 0
  coinBonusCount = 0
  xpBoostCount = 0
  selectedCharacter = configCharacter.characters.find(char => char.id === 1)
  autoClickerActive = false
  localStorage.removeItem('gameData')

  saveProgress()
  updateUI()
  updateImage()

  showError('Прогресс успешно обнулен!')
}
window.addEventListener('click', function (event) {
  const customConfirmModal = document.getElementById('custom-confirm-modal')
  if (event.target === customConfirmModal) {
    closeCustomConfirmModal()
  }
})
function openChatModal() {
  const chatModal = document.getElementById('chat-modal')
  chatModal.style.display = 'flex'
}

// Функция для закрытия модального окна чата
function closeChatModal() {
  const chatModal = document.getElementById('chat-modal')
  chatModal.style.display = 'none'
}

// Закрытие модального окна при клике вне его
window.addEventListener('click', event => {
  const chatModal = document.getElementById('chat-modal')
  if (event.target === chatModal) {
    closeChatModal()
  }
})
loadProgress()
updateImage()
