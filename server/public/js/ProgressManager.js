class ProgressManager {
  constructor(game) {
    this.game = game;
    this.lastSaveTime = 0;
    this.saveCooldown = 5000; // 5 seconds cooldown between saves
  }
  
  saveProgress() {
    // Check cooldown
    const now = Date.now();
    if (now - this.lastSaveTime < this.saveCooldown) {
      return;
    }
    this.lastSaveTime = now;

    // Проверяем доступность Telegram WebApp API
    let user = null;
    try {
      if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
        user = Telegram.WebApp.initDataUnsafe.user;
        console.log('Telegram user data for saving:', user);
      }
    } catch (error) {
      console.error('Error accessing Telegram WebApp API for saving:', error);
    }
    
    if (!user) {
      console.log('User not authenticated or Telegram WebApp API not available, saving only to localStorage');
      this.saveToLocalStorage();
      return;
    }
    
    const progress = {
      userId: user.id,
      username: user.username,
      score: this.game.score,
      coins: this.game.coins,
      diamonds: this.game.diamonds,
      level: this.game.level,
      xp: this.game.xp,
      multiplier: this.game.multiplier,
      multiplierCount: this.game.multiplierCount,
      autoClickerCount: this.game.autoClickerCount,
      criticalHitCount: this.game.criticalHitCount,
      coinBonusCount: this.game.coinBonusCount,
      xpBoostCount: this.game.xpBoostCount,
      selectedCharacterId: this.game.selectedCharacter ? this.game.selectedCharacter.id : null,
      totalClicks: this.game.totalClicks,
      achievements: this.game.achievementManager.achievements.map(achievement => ({
        id: achievement.id,
        unlocked: achievement.unlocked
      }))
    };
    
    // Save to localStorage as backup
    this.saveToLocalStorage();
    
    $.ajax({
      url: '/api/save',
      method: 'POST',
      data: JSON.stringify(progress),
      contentType: 'application/json',
      headers: {
        'X-Telegram-Init-Data': Telegram.WebApp.initData
      },
      success: (response) => {
        console.log('Progress saved successfully:', response);
      },
      error: (error) => {
        console.error('Error saving progress:', error);
        // Only show error if it's not a network error
        if (error.status !== 0) {
          this.game.uiManager.showError('Ошибка сохранения. Прогресс сохранен локально.');
        }
      }
    });
  }
  
  saveToLocalStorage() {
    try {
      const progress = {
        score: this.game.score,
        coins: this.game.coins,
        diamonds: this.game.diamonds,
        level: this.game.level,
        xp: this.game.xp,
        multiplier: this.game.multiplier,
        multiplierCount: this.game.multiplierCount,
        autoClickerCount: this.game.autoClickerCount,
        criticalHitCount: this.game.criticalHitCount,
        coinBonusCount: this.game.coinBonusCount,
        xpBoostCount: this.game.xpBoostCount,
        selectedCharacterId: this.game.selectedCharacter ? this.game.selectedCharacter.id : null,
        totalClicks: this.game.totalClicks,
        achievements: this.game.achievementManager.achievements.map(achievement => ({
          id: achievement.id,
          unlocked: achievement.unlocked
        }))
      };
      
      localStorage.setItem('gameData', JSON.stringify(progress));
      localStorage.setItem('lastSaveTime', Date.now().toString());
      console.log('Progress saved to localStorage');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
  
  loadProgress() {
    console.log('Starting to load progress...');
    
    // Проверяем доступность Telegram WebApp API
    let user = null;
    try {
      if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
        user = Telegram.WebApp.initDataUnsafe.user;
        console.log('Telegram user data:', user);
      }
    } catch (error) {
      console.error('Error accessing Telegram WebApp API:', error);
    }
    
    if (!user) {
      console.log('User not authenticated or Telegram WebApp API not available');
      console.log('Attempting to load from localStorage as fallback');
      this.loadFromLocalStorage(); // Try loading from localStorage if not authenticated
      return;
    }
    
    console.log('User authenticated, attempting to load from server');
    $.ajax({
      url: '/api/load',
      method: 'GET',
      data: { userId: user.id },
      dataType: 'json',
      headers: {
        'X-Telegram-Init-Data': Telegram.WebApp.initData
      },
      success: (data) => {
        console.log('Server response received:', data);
        if (data) {
          console.log('Progress loaded from server:', data);
          
          // Загружаем базовые данные игры
          this.game.score = data.score || 0;
          this.game.coins = data.coins || 0;
          this.game.diamonds = data.diamonds || 0;
          this.game.level = data.level || 1;
          this.game.xp = data.xp || 0;
          this.game.multiplier = data.multiplier || 1;
          this.game.multiplierCount = data.multiplierCount || 0;
          this.game.autoClickerCount = data.autoClickerCount || 0;
          this.game.criticalHitCount = data.criticalHitCount || 0;
          this.game.coinBonusCount = data.coinBonusCount || 0;
          this.game.xpBoostCount = data.xpBoostCount || 0;
          this.game.totalClicks = data.totalClicks || 0;
          
          // Загружаем выбранного персонажа
          if (data.selectedCharacterId) {
            const character = this.game.characterManager.getCharacterById(data.selectedCharacterId);
            if (character && this.game.level >= character.entryLevel) {
              // Если персонаж существует и уровень игрока достаточен, используем его
              this.game.selectedCharacter = character;
              console.log(`Loaded character from server: ${character.name} (ID: ${character.id})`);
            } else {
              // Иначе выбираем персонажа, соответствующего текущему уровню
              this.game.selectedCharacter = this.game.characterManager.getCharacterForLevel(this.game.level);
              console.log(`Character ${data.selectedCharacterId} not available for level ${this.game.level}, using ${this.game.selectedCharacter.name}`);
            }
          } else {
            // Если персонаж не был сохранен, выбираем персонажа, соответствующего текущему уровню
            this.game.selectedCharacter = this.game.characterManager.getCharacterForLevel(this.game.level);
            console.log(`No saved character in server data, using ${this.game.selectedCharacter.name} for level ${this.game.level}`);
          }
          
          // Загружаем достижения
          if (data.achievements && Array.isArray(data.achievements)) {
            console.log('Loading achievements from server data:', data.achievements);
            data.achievements.forEach(savedAchievement => {
              const achievement = this.game.achievementManager.getAchievementById(savedAchievement.id);
              if (achievement) {
                achievement.unlocked = savedAchievement.unlocked;
                console.log(`Achievement ${achievement.id} loaded: unlocked = ${achievement.unlocked}`);
              } else {
                console.warn(`Achievement with ID ${savedAchievement.id} not found in achievement manager`);
              }
            });
          } else {
            console.log('No achievements data in server response or it is not an array');
          }
          
          // Обновляем UI
          this.game.uiManager.updateUI();
          this.game.uiManager.updateImage();
          
          // Применяем эффекты авто-кликера, если он активен
          if (this.game.autoClickerCount > 0) {
            this.game.upgradeManager.applyAutoClickerEffect();
          }
          
          console.log('Progress loaded from server successfully');
        } else {
          console.log('No saved data on server, trying localStorage');
          this.loadFromLocalStorage();
        }
      },
      error: (error) => {
        console.error('Error loading progress from server:', error);
        console.log('Trying to load from localStorage');
        this.loadFromLocalStorage();
      }
    });
  }
  
  loadFromLocalStorage() {
    console.log('Attempting to load progress from localStorage');
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
      try {
        const gameData = JSON.parse(savedData);
        console.log('Found saved data in localStorage:', gameData);
        
        // Загружаем базовые данные игры
        this.game.score = gameData.score || 0;
        this.game.coins = gameData.coins || 0;
        this.game.diamonds = gameData.diamonds || 0;
        this.game.level = gameData.level || 1;
        this.game.xp = gameData.xp || 0;
        this.game.multiplier = gameData.multiplier || 1;
        this.game.multiplierCount = gameData.multiplierCount || 0;
        this.game.autoClickerCount = gameData.autoClickerCount || 0;
        this.game.criticalHitCount = gameData.criticalHitCount || 0;
        this.game.coinBonusCount = gameData.coinBonusCount || 0;
        this.game.xpBoostCount = gameData.xpBoostCount || 0;
        this.game.totalClicks = gameData.totalClicks || 0;
        
        // Загружаем выбранного персонажа
        if (gameData.selectedCharacterId) {
          const character = this.game.characterManager.getCharacterById(gameData.selectedCharacterId);
          if (character && this.game.level >= character.entryLevel) {
            // Если персонаж существует и уровень игрока достаточен, используем его
            this.game.selectedCharacter = character;
            console.log(`Loaded character from localStorage: ${character.name} (ID: ${character.id})`);
          } else {
            // Иначе выбираем персонажа, соответствующего текущему уровню
            this.game.selectedCharacter = this.game.characterManager.getCharacterForLevel(this.game.level);
            console.log(`Character ${gameData.selectedCharacterId} not available for level ${this.game.level}, using ${this.game.selectedCharacter.name}`);
          }
        } else {
          // Если персонаж не был сохранен, выбираем персонажа, соответствующего текущему уровню
          this.game.selectedCharacter = this.game.characterManager.getCharacterForLevel(this.game.level);
          console.log(`No saved character in localStorage, using ${this.game.selectedCharacter.name} for level ${this.game.level}`);
        }
        
        // Загружаем достижения
        if (gameData.achievements && Array.isArray(gameData.achievements)) {
          console.log('Loading achievements from localStorage data:', gameData.achievements);
          gameData.achievements.forEach(savedAchievement => {
            const achievement = this.game.achievementManager.getAchievementById(savedAchievement.id);
            if (achievement) {
              achievement.unlocked = savedAchievement.unlocked;
              console.log(`Achievement ${achievement.id} loaded: unlocked = ${achievement.unlocked}`);
            } else {
              console.warn(`Achievement with ID ${savedAchievement.id} not found in achievement manager`);
            }
          });
        } else {
          console.log('No achievements data in localStorage or it is not an array');
        }
        
        // Обновляем UI
        this.game.uiManager.updateUI();
        this.game.uiManager.updateImage();
        
        // Применяем эффекты авто-кликера, если он активен
        if (this.game.autoClickerCount > 0) {
          this.game.upgradeManager.applyAutoClickerEffect();
        }
        
        console.log('Progress loaded from localStorage successfully');
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
        this.game.uiManager.showError('Ошибка загрузки данных. Начинаем новую игру.');
      }
    } else {
      console.log('No saved data in localStorage');
      this.game.uiManager.showError('Нет сохраненных данных. Начинаем новую игру.');
    }
  }
} 