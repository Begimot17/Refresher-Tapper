class UIManager {
  constructor(game) {
    this.game = game;
    this.$tapSound = $('#tap-sound')[0];
    this.setupChatUI();
    this.setupEventListeners();
  }
  
  setupChatUI() {
    // Create chat UI elements if they don't exist
    if (!$('#chat-container').length) {
      const chatHTML = `
        <div id="chat-container">
          <div id="chat-messages"></div>
          <div id="chat-input-container">
            <input type="text" id="chat-input" placeholder="Введите сообщение...">
            <button id="send-message-btn">
              <span class="button-text">Отправить 💎 (1 алмаз)</span>
              <span class="diamond-count"></span>
            </button>
          </div>
        </div>
      `;
      $('body').append(chatHTML);
      
      // Add event listener for sending messages
      $('#send-message-btn').on('click', () => this.sendChatMessage());
      $('#chat-input').on('keypress', (e) => {
        if (e.which === 13) { // Enter key
          this.sendChatMessage();
        }
      });
      
      // Update button text with current diamond count
      this.updateSendButtonText();
    }
    
    // Also set up the chat modal button
    $('#chat-modal #send-message-btn').on('click', () => this.sendChatMessage());
    $('#chat-modal #chat-input').on('keypress', (e) => {
      if (e.which === 13) { // Enter key
        this.sendChatMessage();
      }
    });
  }
  
  updateSendButtonText() {
    // Update only the diamond count part of the button
    $('.diamond-count').text(` - У вас: ${this.game.diamonds}`);
    
    // Also update the button in the chat modal
    $('#chat-modal #send-message-btn .diamond-count').text(` - У вас: ${this.game.diamonds}`);
    
    // Check if user has enough diamonds and update button state
    const hasEnoughDiamonds = this.game.diamonds >= this.game.chatManager.MESSAGE_COST;
    
    // Update button state in both places
    $('#send-message-btn').toggleClass('inactive', !hasEnoughDiamonds);
    $('#chat-modal #send-message-btn').toggleClass('inactive', !hasEnoughDiamonds);
    
    // Log the current diamond count for debugging
    console.log('Current diamond count in UI:', this.game.diamonds);
  }
  
  sendChatMessage() {
    // Get the message from either the chat container or the chat modal
    const messageText = $('#chat-input').val().trim() || $('#chat-modal #chat-input').val().trim();
    
    // Check if message text is empty
    if (!messageText) {
      alert('Пожалуйста, введите текст сообщения!');
      return;
    }
    
    // Check if button is inactive (not enough diamonds)
    if ($('#send-message-btn').hasClass('inactive')) {
      alert(`Недостаточно алмазов! Нужно ${this.game.chatManager.MESSAGE_COST} алмаз для отправки сообщения.`);
      return;
    }
    
    // Send message to chat
    this.game.chatManager.sendMessage(messageText);
    
    // Clear input in both places
    $('#chat-input').val('');
    $('#chat-modal #chat-input').val('');
    
    // Update UI
    this.updateUI();
    this.updateSendButtonText();
  }
  
  updateUI() {
    $('#score').text(this.game.formatNumber(this.game.score));
    $('#coins').text(this.game.formatNumber(this.game.coins));
    $('#level').text(this.game.formatNumber(this.game.level));
    $('#diamonds').text(this.game.formatNumber(this.game.diamonds));
    
    // Update send button text
    this.updateSendButtonText();
    
    this.game.upgradeManager.upgrades.forEach(upgrade => {
      const currentLevel = this.game.upgradeManager.getUpgradeLevel(upgrade.id);
      const cost = upgrade.baseCost + currentLevel * upgrade.costIncrease;
      
      const upgradeElement = $(`.upgrade[data-id="${upgrade.id}"]`);
      if (upgradeElement.length) {
        upgradeElement.find('.upgrade-cost').text(this.game.formatNumber(cost));
        upgradeElement.find('.upgrade-level').text(currentLevel);
        
        if (currentLevel >= upgrade.maxLevel) {
          upgradeElement.addClass('max-level').off('click');
        }
      }
    });
  }
  
  updateScoreDisplay() {
    $('#score').text(this.game.formatNumber(this.game.score));
  }
  
  updateCoinsDisplay() {
    $('#coins').text(this.game.formatNumber(this.game.coins));
  }
  
  updateLevelDisplay() {
    $('#level').text(this.game.formatNumber(this.game.level));
  }
  
  updateImage() {
    const character = this.game.selectedCharacter || this.game.characterManager.getCharacterForLevel(this.game.level);
    $('#tap-image').attr('src', character.image);
    $('#tap-sound').attr('src', character.sound);
    if ($('#tap-circle').hasClass('flipped')) this.updateCharacterDescription();
  }
  
  updateCharacterDescription() {
    const character = this.game.selectedCharacter || this.game.characterManager.getCharacterForLevel(this.game.level);
    const descriptionElement = document.getElementById('character-description');
    if (character && descriptionElement) {
      const descriptionText = `${character.name}\n${character.description || 'Описание отсутствует.'}`;
      descriptionElement.innerHTML = descriptionText.replace(/\n/g, '<br>'); // Заменяем \n на <br>
    }
  }
  
  playTapSound() {
    this.$tapSound.currentTime = 0;
    this.$tapSound.play();
  }
  
  createTapEffect(x, y) {
    const $effect = $('<div>')
      .addClass('tap-effect')
      .css({left: `${x}px`, top: `${y}px`});
    $('body').append($effect);
    setTimeout(() => $effect.remove(), 1000);
  }
  
  createCriticalHitEffect(x, y) {
    const $effect = $('<div>')
      .addClass('critical-hit-effect')
      .text('💥 Критический удар!')
      .css({left: `${x}px`, top: `${y}px`});
    $('body').append($effect);
    setTimeout(() => $effect.remove(), 1000);
  }
  
  showPopup(elementId, value) {
    const $popup = $(`#${elementId}`);
    $popup
      .text(`+${this.game.formatNumber(value)}`)
      .addClass('show')
      .delay(2000)
      .queue(() => $popup.removeClass('show').dequeue());
  }
  
  showNewCharacterPopup(character) {
    $('<div>')
      .addClass('new-character-popup')
      .html(`<h2>🎉 Новый персонаж!</h2><p>${character.name}!</p>`)
      .appendTo('body')
      .delay(3000)
      .fadeOut(() => $(this).remove());
  }
  
  showLevelUpPopup() {
    const $popup = $('<div>').addClass('level-up-popup').html(`
      <h2>🎉 Уровень ${this.game.level}!</h2>
      <p>+${this.game.formatNumber(this.game.level * this.game.coinForLevel)} монет</p>
    `);
    $('body').append($popup);
    setTimeout(() => $popup.remove(), 1000);
  }
  
  showError(message) {
    const $errorElement = $('#error-message');
    if ($errorElement.length) {
      $errorElement.text(message).show();
      setTimeout(() => $errorElement.hide(), 1500);
    }
  }
  
  openShop() {
    this.game.upgradeManager.renderShop();
    $('#shop-modal').show();
  }
  
  closeShop() {
    $('#shop-modal').hide();
  }
  
  openCharacterModal() {
    this.closeAllModals();
    const nextUnlockLevel = this.game.characterManager.getNextUnlockLevel(this.game.level);
    
    const $characterList = $('#character-list').empty();
    
    this.game.characterManager.characters.forEach(character => {
      const $characterItem = $('<div>')
        .addClass('character-item')
        .toggleClass('locked', character.entryLevel > this.game.level)
        .html(
          character.entryLevel <= this.game.level
            ? `<img src="${character.image}" alt="${character.name}"><span>${character.name}</span>`
            : `<div class="locked-character"></div><span>???</span><small>Откроется на уровне ${character.entryLevel}</small>`
        )
        .on('click', () => character.entryLevel <= this.game.level && this.selectCharacter(character));
      
      $characterList.append($characterItem);
    });
    
    $('#next-unlock-info').text(
      nextUnlockLevel
        ? `Следующий персонаж откроется на уровне ${nextUnlockLevel}`
        : 'Все персонажи открыты'
    );
    
    $('#character-modal').show();
  }
  
  closeCharacterModal() {
    $('#character-modal').hide();
  }
  
  selectCharacter(character) {
    this.game.selectedCharacter = character;
    this.updateImage();
    this.updateCharacterDescription();
    this.closeCharacterModal();
    this.game.progressManager.saveProgress();
  }
  
  openLeaderboard() {
    const currentUser = Telegram.WebApp.initDataUnsafe.user;
    const currentUsername = currentUser?.username || 'unknown';
    
    $.ajax({
      url: '/api/leaderboard',
      method: 'GET',
      dataType: 'json',
      success: (data) => {
        const $leaderboardList = $('#leaderboard-list').empty();
        
        if (data.length === 0) {
          $leaderboardList.append('<li>Рекорды пока отсутствуют.</li>');
        } else {
          data.forEach((player, index) => {
            const $li = $('<li>');
            const playerUsername = player.username || 'unknown';
            
            const $usernameLink = $('<a>', {
              href: `https://t.me/${playerUsername}`,
              text: `@${playerUsername}`,
              css: {
                textDecoration: 'none',
                color: '#007BFF',
                cursor: 'pointer'
              },
              target: '_blank'
            });
            
            const $placeNumber = $('<span>').text(`${index + 1}. `);
            $li.append($placeNumber);
            
            if (index === 0) {
              $li.append($('<span>').text('🥇 '));
            } else if (index === 1) {
              $li.append($('<span>').text('🥈 '));
            } else if (index === 2) {
              $li.append($('<span>').text('🥉 '));
            }
            
            $li.append($usernameLink);
            $li.append(`: ${this.game.formatNumber(player.score)}`);
            
            if (playerUsername === currentUsername) {
              $li.css({
                backgroundColor: '#2c3e50',
                fontWeight: 'bold'
              });
            }
            
            $leaderboardList.append($li);
          });
        }
        
        $('#leaderboard-modal').show();
      },
      error: (error) => {
        console.error('Ошибка загрузки таблицы рекордов:', error);
        $('#leaderboard-list').html('<li>Не удалось загрузить рекорды.</li>');
        $('#leaderboard-modal').show();
      }
    });
  }
  
  closeLeaderboard() {
    $('#leaderboard-modal').hide();
  }
  
  openChatModal() {
    this.closeAllModals();
    $('#chat-modal').show();
    
    // Update send button text with current diamond count
    this.updateSendButtonText();
    
    // Load chat messages
    if (this.game.chatManager) {
      this.game.chatManager.loadMessages();
      
      // Set up refresh interval if not already set
      if (!this.game.chatManager.chatRefreshInterval) {
        this.game.chatManager.chatRefreshInterval = setInterval(() => {
          this.game.chatManager.loadMessages();
        }, 5000);
      }
    }
  }
  
  closeChatModal() {
    $('#chat-modal').hide();
    clearInterval(this.game.chatManager.chatRefreshInterval);
  }
  
  confirmResetProgress() {
    this.closeAllModals();
    $('#custom-confirm-modal').show();
  }
  
  closeCustomConfirmModal() {
    const customConfirmModal = document.getElementById('custom-confirm-modal');
    customConfirmModal.style.display = 'none'; // Скрываем модальное окно
  }
  
  copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showError('Прогресс скопирован! Вставьте его в Telegram и отправьте.');
      })
      .catch(() => {
        this.showError('Ошибка: Не удалось скопировать прогресс.');
      });
  }
  
  shareProgress() {
    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (!user) {
      this.showError('Ошибка: Пользователь не авторизован.');
      return;
    }
    
    const shareText = `
🎮 *Мой прогресс в Refresher Tapper*:
🔥 Счет: *${this.game.formatNumber(this.game.score)}*
🪙 Монеты: *${this.game.formatNumber(this.game.coins)}*
📈 Уровень: *${this.game.level}*
👆 Клики: *${this.game.formatNumber(this.game.totalClicks)}*

💪 Попробуй побить мой рекорд!
👉 Перейди в бота: @RefresherTapperBot
    `.trim();
    
    this.copyToClipboard(shareText);
  }
  
  setupEventListeners() {
    // Shop button
    $('#shop-button').on('click', () => {
      this.showShopModal();
    });
    
    // Character button
    $('#character-button').on('click', () => {
      this.showCharacterModal();
    });
    
    // Leaderboard button
    $('#leaderboard-button').on('click', () => {
      this.showLeaderboardModal();
    });
    
    // Menu button
    $('#menu-button').on('click', () => {
      this.showMenuModal();
    });
    
    // Profile button
    $('#profile-button').on('click', () => {
      this.showProfileModal();
    });
    
    // Achievements button
    $('#achievements-button').on('click', () => {
      this.showAchievementsModal();
    });
    
    // Chat button
    $('#chat-button').on('click', () => {
      this.openChatModal();
    });
    
    // Save button
    $('#save-button').on('click', () => {
      this.game.progressManager.saveProgress();
      this.showError('Прогресс успешно сохранен! 💾');
    });
    
    // Reset button
    $('#reset-button').on('click', () => {
      this.confirmResetProgress();
    });
    
    // Share button
    $('#share-button').on('click', () => {
      this.shareProgress();
    });
    
    // Confirm reset button
    $('#confirm-reset').on('click', () => {
      this.game.resetProgress();
      this.closeCustomConfirmModal();
    });
    
    // Cancel reset button
    $('#cancel-reset').on('click', () => {
      this.closeCustomConfirmModal();
    });
    
    // Close buttons
    $('.close').on('click', () => {
      this.closeAllModals();
    });
    
    // Close modals when clicking outside
    $(window).on('click', (event) => {
      if ($(event.target).hasClass('modal')) {
        this.closeAllModals();
      }
    });
    
    // Обработка tooltip
    $('.score-item').each(function() {
      const tooltip = $(this).data('tooltip');
      if (tooltip) {
        $(this).append(`<div class="tooltip">${tooltip}</div>`);
      }
    });
  }
  
  showProfileModal() {
    this.closeAllModals();
    $('#profile-modal').show();
    
    // Update profile information
    const username = Telegram.WebApp.initDataUnsafe.user?.username || 'Гость';
    $('#profile-username').text(username);
    $('#profile-level').text(`Уровень: ${this.game.level}`);
    $('#profile-score').text(this.game.formatNumber(this.game.score));
    $('#profile-coins').text(this.game.formatNumber(this.game.coins));
    $('#profile-diamonds').text(this.game.formatNumber(this.game.diamonds));
    $('#profile-clicks').text(this.game.formatNumber(this.game.totalClicks));
    
    // Force update UI to ensure all values are displayed correctly
    this.updateUI();
  }
  
  closeAllModals() {
    $('.modal').hide();
  }
  
  showShopModal() {
    this.closeAllModals();
    this.game.upgradeManager.renderShop();
    $('#shop-modal').show();
  }
  
  showLeaderboardModal() {
    this.closeAllModals();
    this.game.progressManager.saveProgress();
    const currentUser = Telegram.WebApp.initDataUnsafe.user;
    const currentUsername = currentUser?.username || 'unknown';
    
    $.ajax({
      url: '/api/leaderboard',
      method: 'GET',
      dataType: 'json',
      success: (data) => {
        const $leaderboardList = $('#leaderboard-list').empty();
        
        if (data.length === 0) {
          $leaderboardList.append('<li>Рекорды пока отсутствуют.</li>');
        } else {
          data.forEach((player, index) => {
            const $li = $('<li>');
            const playerUsername = player.username || 'unknown';
            
            const $usernameLink = $('<a>', {
              href: `https://t.me/${playerUsername}`,
              text: `@${playerUsername}`,
              css: {
                textDecoration: 'none',
                color: '#007BFF',
                cursor: 'pointer'
              },
              target: '_blank'
            });
            
            const $placeNumber = $('<span>').text(`${index + 1}. `);
            $li.append($placeNumber);
            
            if (index === 0) {
              $li.append($('<span>').text('🥇 '));
            } else if (index === 1) {
              $li.append($('<span>').text('🥈 '));
            } else if (index === 2) {
              $li.append($('<span>').text('🥉 '));
            }
            
            $li.append($usernameLink);
            $li.append(`: ${this.game.formatNumber(player.score)}`);
            
            if (playerUsername === currentUsername) {
              $li.css({
                backgroundColor: '#2c3e50',
                fontWeight: 'bold'
              });
            }
            
            $leaderboardList.append($li);
          });
        }
        
        $('#leaderboard-modal').show();
      },
      error: (error) => {
        console.error('Ошибка загрузки таблицы рекордов:', error);
        $('#leaderboard-list').html('<li>Не удалось загрузить рекорды.</li>');
        $('#leaderboard-modal').show();
      }
    });
  }
  
  showMenuModal() {
    this.closeAllModals();
    $('#menu-modal').show();
  }
  
  showCharacterModal() {
    this.closeAllModals();
    const nextUnlockLevel = this.game.characterManager.getNextUnlockLevel(this.game.level);
    
    const $characterList = $('#character-list').empty();
    
    this.game.characterManager.characters.forEach(character => {
      const $characterItem = $('<div>')
        .addClass('character-item')
        .toggleClass('locked', character.entryLevel > this.game.level)
        .html(
          character.entryLevel <= this.game.level
            ? `<img src="${character.image}" alt="${character.name}"><span>${character.name}</span>`
            : `<div class="locked-character"></div><span>???</span><small>Откроется на уровне ${character.entryLevel}</small>`
        )
        .on('click', () => character.entryLevel <= this.game.level && this.selectCharacter(character));
      
      $characterList.append($characterItem);
    });
    
    $('#next-unlock-info').text(
      nextUnlockLevel
        ? `Следующий персонаж откроется на уровне ${nextUnlockLevel}`
        : 'Все персонажи открыты'
    );
    
    $('#character-modal').show();
  }
  
  showAchievementsModal() {
    this.closeAllModals();
    $('#achievements-modal').show();
    
    const $achievementsList = $('#achievements-list').empty();
    
    // Get only unlocked achievements
    const unlockedAchievements = this.game.achievementManager.getUnlockedAchievements();
    
    // Render each unlocked achievement
    unlockedAchievements.forEach(achievement => {
      const $achievementItem = $('<div>')
        .addClass('achievement-item');
      
      // Create achievement content
      const $achievementContent = $('<div>').addClass('achievement-content');
      
      const $achievementIcon = $('<div>')
        .addClass('achievement-icon')
        .text(achievement.icon);
      
      const $achievementInfo = $('<div>').addClass('achievement-info');
      
      const $achievementName = $('<div>')
        .addClass('achievement-name')
        .text(achievement.name);
      
      const $achievementDescription = $('<div>')
        .addClass('achievement-description')
        .text(achievement.description);
      
      const $achievementReward = $('<div>')
        .addClass('achievement-reward')
        .text(`Награда: ${achievement.reward} 💎`);
      
      // Add content to the achievement info
      $achievementInfo.append(
        $achievementName,
        $achievementDescription,
        $achievementReward
      );
      
      // Add content to the achievement item
      $achievementContent.append(
        $achievementIcon,
        $achievementInfo
      );
      
      $achievementItem.append($achievementContent);
      
      // Add click handler to prevent default behavior
      $achievementItem.on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      
      $achievementsList.append($achievementItem);
    });
    
    // Force update UI to ensure all values are displayed correctly
    this.updateUI();
  }
  
  showAchievementPopup(achievement) {
    // Get the achievement popup element
    const $popup = $('#achievement-popup');
    
    // Set the achievement details
    $popup.find('.achievement-popup-icon').text(achievement.icon);
    $popup.find('.achievement-popup-name').text(achievement.name);
    $popup.find('.achievement-popup-description').text(achievement.description);
    $popup.find('.achievement-popup-reward').text(`Награда: ${achievement.reward} 💎`);
    
    // Show the popup with a fade-in animation
    $popup.fadeIn();
    
    // Close popup when clicking the close button
    $popup.find('.achievement-popup-close').one('click', () => {
      $popup.fadeOut();
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      $popup.fadeOut();
    }, 5000);
  }
} 