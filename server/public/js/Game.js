class Game {
  constructor() {
    // Game state
    this.score = 0;
    this.coins = 0;
    this.diamonds = 0;
    this.level = 1;
    this.coinForLevel = 25;
    this.scoreForLevel = 150;
    this.xp = 0;
    this.xpForLevel = 100;
    this.multiplier = 1;
    this.totalClicks = 0;
    this.consecutiveClicks = 0; // Track consecutive clicks
    
    // Upgrades
    this.multiplierCount = 0;
    this.autoClickerCount = 0;
    this.criticalHitCount = 0;
    this.coinBonusCount = 0;
    this.xpBoostCount = 0;
    
    // Character
    this.selectedCharacter = null;
    
    // Auto clicker
    this.autoClickerActive = false;
    this.autoClickerInterval = null;
    
    // Constants
    this.baseCriticalHitChance = 0.1;
    this.baseCriticalHitMultiplier = 2;
    this.baseCoinBonusMultiplier = 1;
    
    // Initialize
    this.characterManager = new CharacterManager(this);
    this.upgradeManager = new UpgradeManager(this);
    this.uiManager = new UIManager(this);
    this.progressManager = new ProgressManager(this);
    this.chatManager = new ChatManager(this);
    this.achievementManager = new AchievementManager(this);
    
    // Initialize auto-clicker
    this.upgradeManager.applyAutoClickerEffect();
    
    // Initialize Telegram WebApp
    try {
      if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        console.log('Telegram WebApp API detected');
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
      } else {
        console.warn('Telegram WebApp API not detected, running in standalone mode');
      }
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
    }
  }
  
  init() {
    console.log('Initializing game...');
    
    // Загружаем прогресс
    console.log('Loading progress...');
    this.progressManager.loadProgress();
    
    // Устанавливаем выбранного персонажа или персонажа для текущего уровня
    console.log('Setting up character...');
    this.selectedCharacter = this.selectedCharacter || this.characterManager.getCharacterForLevel(this.level);
    console.log('Selected character:', this.selectedCharacter ? this.selectedCharacter.name : 'None');
    
    // Обновляем изображение
    console.log('Updating UI...');
    this.uiManager.updateImage();
    this.uiManager.updateUI();
    
    // Инициализируем автокликер, если он куплен
    if (this.autoClickerCount > 0) {
      console.log('Initializing auto-clicker...');
      this.upgradeManager.applyAutoClickerEffect();
    }
    
    // Устанавливаем обработчики событий
    console.log('Setting up event listeners...');
    this.setupEventListeners();
    
    // Устанавливаем интервал автосохранения (каждые 5 минут)
    console.log('Setting up auto-save interval...');
    this.autoSaveInterval = setInterval(() => {
      this.progressManager.saveProgress();
      console.log('Auto-saving progress...');
    }, 5 * 60 * 1000); // 5 минут в миллисекундах
    
    console.log('Game initialization complete');
  }
  
  setupEventListeners() {
    // Tap circle event listeners
    const tapCircle = document.getElementById('tap-circle');
    tapCircle.addEventListener('click', this.handleTap.bind(this));
    tapCircle.addEventListener('touchstart', this.handleTouchStart.bind(this));
    tapCircle.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Add double-tap event listener to flip the circle back
    let lastTapTime = 0;
    tapCircle.addEventListener('click', (event) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;
      
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        if (tapCircle.classList.contains('flipped')) {
          tapCircle.classList.remove('flipped');
          this.uiManager.updateCharacterDescription();
        }
      }
      
      lastTapTime = currentTime;
    });
    
    // Add double-tap for touch devices
    let lastTouchTime = 0;
    tapCircle.addEventListener('touchend', (event) => {
      const currentTime = new Date().getTime();
      const touchLength = currentTime - lastTouchTime;
      
      if (touchLength < 300 && touchLength > 0) {
        // Double tap detected
        if (tapCircle.classList.contains('flipped')) {
          tapCircle.classList.remove('flipped');
          this.uiManager.updateCharacterDescription();
        }
      }
      
      lastTouchTime = currentTime;
    });
    
    // Logo click event listener for consecutive clicks achievement
    const logo = document.getElementById('main-title');
    logo.addEventListener('click', this.handleLogoClick.bind(this));
    
    // Chat event listeners
    $('#chat-send').on('click', () => this.chatManager.sendMessage());
    $('#chat-input').on('keypress', (e) => {
      if (e.which === 13) { // Enter
        this.chatManager.sendMessage();
      }
    });
    
    // Reset progress event listeners
    document.getElementById('confirm-reset').addEventListener('click', () => {
      this.resetProgress();
      this.uiManager.closeCustomConfirmModal();
    });
    
    document.getElementById('cancel-reset').addEventListener('click', () => {
      this.uiManager.closeCustomConfirmModal();
    });
    
    window.addEventListener('click', (event) => {
      const customConfirmModal = document.getElementById('custom-confirm-modal');
      if (event.target === customConfirmModal) {
        this.uiManager.closeCustomConfirmModal();
      }
    });
  }
  
  handleTap(event) {
    // Получаем координаты клика
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Создаем эффект клика
    this.uiManager.createTapEffect(x, y);
    
    // Воспроизводим звук
    this.uiManager.playTapSound();
    
    // Увеличиваем счетчик кликов
    this.totalClicks++;
    
    // Рассчитываем базовые очки
    let points = this.multiplier;
    
    // Проверяем критический удар
    const criticalChance = this.upgradeManager.getUpgradeLevel('Подик') * 0.05; // 5% шанс за уровень
    const isCritical = Math.random() < criticalChance;
    
    if (isCritical) {
      // Критический удар
      points *= 2;
      this.uiManager.createCriticalHitEffect(x, y);
    }
    
    // Обновляем счет и монеты
    this.updateScore(points);
    
    // Добавляем опыт
    const xpBoost = 1 + (this.upgradeManager.getUpgradeLevel('Снюс') * 0.15); // 15% за уровень
    const levelScaling = 1 + (this.level * 0.03); // 3% больше опыта за каждый уровень
    const xpGained = Math.max(1, Math.floor(0.15 * levelScaling * xpBoost)); // Гарантируем минимум 1 очко опыта
    
    this.xp += xpGained;
    
    // Проверяем повышение уровня
    this.checkLevelUp();
    
    // Применяем эффект авто-кликера
    this.upgradeManager.applyAutoClickerEffect();
  }
  
  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
  }
  
  handleTouchEnd(event) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }
  
  handleSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    const swipeThreshold = 150; // Minimum swipe distance
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      const tapCircle = document.getElementById('tap-circle');
      tapCircle.classList.add('flipped');
      this.uiManager.updateCharacterDescription();
    }
  }
  
  handleLogoClick(event) {
    // Increment consecutive clicks counter
    this.consecutiveClicks++;
    
    // Check for achievements
    this.achievementManager.checkAchievements();
    
    // Update UI
    this.uiManager.updateUI();
  }
  
  updateScore(points) {
    // Обновляем счет
    this.score += Math.max(1, Math.floor(points));
    
    // Обновляем монеты
    this.coins += Math.max(1, Math.floor(points));
    
    // Обновляем интерфейс
    this.uiManager.updateUI();
  }
  
  updateCoins(coinsAdded) {
    this.coins += coinsAdded;
    this.uiManager.updateCoinsDisplay();
    this.uiManager.showPopup('coins-popup', coinsAdded);
  }
  
  updateLevel(levelsGained) {
    this.level += levelsGained;
    this.uiManager.updateLevelDisplay();
    this.uiManager.showPopup('level-popup', levelsGained);
  }
  
  checkLevelUp() {
    // Проверяем, достаточно ли опыта для повышения уровня
    if (this.xp >= this.xpForLevel) {
      // Повышаем уровень
      this.level++;
      
      // Сбрасываем опыт и увеличиваем требования для следующего уровня
      this.xp = 0;
      this.xpForLevel = Math.floor(this.xpForLevel * 1.1); // Уменьшаем увеличение требуемого опыта с 15% до 10%
      
      // Начисляем монеты за уровень
      const coinsEarned = this.coinForLevel;
      this.coins += coinsEarned;
      
      // Начисляем алмазы только за каждый 5-й уровень
      let diamondsEarned = 0;
      if (this.level % 5 === 0) {
        diamondsEarned = 1;
        this.diamonds += diamondsEarned;
      }
      
      // Показываем уведомление о повышении уровня
      this.uiManager.showLevelUpNotification(this.level, coinsEarned, diamondsEarned);
      
      // Обновляем изображение персонажа
      this.uiManager.updateImage();
      
      // Проверяем достижения
      this.achievementManager.checkAchievements();
      
      // Обновляем интерфейс
      this.uiManager.updateUI();
      
      // Сохраняем прогресс
      this.progressManager.saveProgress();
    }
  }
  
  resetProgress() {
    // Очищаем интервал автокликера
    if (this.upgradeManager.autoClickerInterval) {
      clearInterval(this.upgradeManager.autoClickerInterval);
      this.upgradeManager.autoClickerInterval = null;
    }
    
    // Сбрасываем все значения
    this.score = 0;
    this.coins = 0;
    this.diamonds = 0;
    this.level = 1;
    this.coinForLevel = 25;
    this.scoreForLevel = 150;
    this.xp = 0;
    this.xpForLevel = 100;
    this.multiplier = 1;
    this.totalClicks = 0;
    
    // Сбрасываем улучшения
    this.multiplierCount = 0;
    this.autoClickerCount = 0;
    this.criticalHitCount = 0;
    this.coinBonusCount = 0;
    this.xpBoostCount = 0;
    
    // Обновляем интерфейс
    this.uiManager.updateUI();
    
    // Сохраняем прогресс
    this.progressManager.saveProgress();
    
    // Показываем уведомление
    this.uiManager.showError('Прогресс успешно сброшен!');
  }
  
  formatNumber(number) {
    const absNumber = Math.abs(number);
    if (absNumber >= 1e12) return `${(number / 1e12).toFixed(2)}T`;
    if (absNumber >= 1e9) return `${(number / 1e9).toFixed(2)}B`;
    if (absNumber >= 1e6) return `${(number / 1e6).toFixed(2)}M`;
    if (absNumber >= 1e3) return `${(number / 1e3).toFixed(2)}K`;
    return number.toString();
  }
} 