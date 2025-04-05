class Game {
  constructor() {
    // Game state
    this.score = 0;
    this.coins = 0;
    this.diamonds = 0;
    this.level = 1;
    this.coinForLevel = 10;
    this.scoreForLevel = 100;
    this.xp = 0;
    this.multiplier = 1;
    this.totalClicks = 0;
    
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
    this.characterManager = new CharacterManager();
    this.upgradeManager = new UpgradeManager(this);
    this.uiManager = new UIManager(this);
    this.progressManager = new ProgressManager(this);
    this.chatManager = new ChatManager(this);
    this.achievementManager = new AchievementManager(this);
    
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
    // Get tap position relative to the tap circle
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Get tap circle position relative to viewport
    const circleRect = document.getElementById('tap-circle').getBoundingClientRect();
    
    // Calculate absolute position for the effect
    const effectX = circleRect.left + x;
    const effectY = circleRect.top + y;
    
    // Increment total clicks counter
    this.totalClicks++;
    
    // Calculate base points
    let points = 1 * this.multiplier;
    
    // Check for critical hit
    const criticalHitChance = this.baseCriticalHitChance + (this.criticalHitCount * 0.05);
    const isCriticalHit = Math.random() < criticalHitChance;
    
    if (isCriticalHit) {
      points *= this.baseCriticalHitMultiplier + (this.criticalHitCount * 0.5);
      this.uiManager.createCriticalHitEffect(effectX, effectY);
    } else {
      this.uiManager.createTapEffect(effectX, effectY);
    }
    
    // Update score
    this.updateScore(points);
    
    // Add coins
    const coinMultiplier = this.baseCoinBonusMultiplier + (this.coinBonusCount * 0.2);
    const coinsAdded = Math.floor(points * coinMultiplier);
    this.updateCoins(coinsAdded);
    
    // Add XP
    const xpBoost = 1 + (this.xpBoostCount * 0.1);
    const xpGained = Math.floor(points * xpBoost);
    this.xp += xpGained;
    
    // Check for level up
    this.checkLevelUp();
    
    // Play tap sound
    this.uiManager.playTapSound();
    
    // Check for achievements
    this.achievementManager.checkAchievements();
    
    // Update UI
    this.uiManager.updateUI();
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
  
  updateScore(points) {
    this.xp += points;
    this.score += points;
    this.uiManager.updateScoreDisplay();
    this.uiManager.showPopup('score-popup', points);
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
    const levelsGained = Math.floor(this.xp / (this.level * this.scoreForLevel));
    if (levelsGained > 0) {
      const totalXPNeeded = this.level * this.scoreForLevel * levelsGained;
      this.xp -= totalXPNeeded;
      this.coins += this.level * this.coinForLevel * levelsGained;
      
      // Award diamonds for leveling up
      this.diamonds += levelsGained;
      console.log('Diamonds awarded for level up:', levelsGained, 'New total:', this.diamonds);
      
      // Store the current level before updating
      const oldLevel = this.level;
      
      // Update the level
      this.updateLevel(levelsGained);
      
      // Check if we've reached a level that unlocks a new character
      const newLevel = this.level;
      const oldCharacter = this.characterManager.getCharacterForLevel(oldLevel);
      const newCharacter = this.characterManager.getCharacterForLevel(newLevel);
      
      // Only show the new character popup if we've unlocked a new character
      if (newCharacter && (!oldCharacter || newCharacter.id !== oldCharacter.id)) {
        this.uiManager.showNewCharacterPopup(newCharacter);
      }
      
      this.uiManager.showLevelUpPopup();
      this.uiManager.updateUI();
      
      // Save progress after level up
      this.progressManager.saveProgress();
    }
  }
  
  resetProgress() {
    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    // Reset all game state
    this.score = 0;
    this.coins = 0;
    this.diamonds = 0;
    this.level = 1;
    this.xp = 0;
    this.multiplier = 1;
    this.multiplierCount = 0;
    this.autoClickerCount = 0;
    this.criticalHitCount = 0;
    this.coinBonusCount = 0;
    this.xpBoostCount = 0;
    this.totalClicks = 0;
    
    // Reset character
    this.selectedCharacter = this.characterManager.getCharacterForLevel(1);
    
    // Reset achievements
    this.achievementManager.resetAchievements();
    
    // Update UI
    this.uiManager.updateUI();
    this.uiManager.updateImage();
    
    // Save reset progress
    this.progressManager.saveProgress();
    
    // Restart auto-save interval
    this.autoSaveInterval = setInterval(() => {
      this.progressManager.saveProgress();
      console.log('Auto-saving progress...');
    }, 5 * 60 * 1000);
    
    // Show confirmation message
    this.uiManager.showError('Прогресс успешно обнулен!');
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