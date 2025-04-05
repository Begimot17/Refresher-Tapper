class AchievementManager {
  constructor(game) {
    this.game = game;
    this.achievements = [
      {
        id: 'clicks_1000',
        name: 'Начинающий кликер',
        description: 'Сделайте 1,000 кликов',
        icon: '👆',
        requirement: 1000,
        type: 'clicks',
        reward: 1,
        unlocked: false
      },
      {
        id: 'clicks_10000',
        name: 'Опытный кликер',
        description: 'Сделайте 10,000 кликов',
        icon: '👆',
        requirement: 10000,
        type: 'clicks',
        reward: 3,
        unlocked: false
      },
      {
        id: 'clicks_100000',
        name: 'Мастер кликер',
        description: 'Сделайте 100,000 кликов',
        icon: '👆',
        requirement: 100000,
        type: 'clicks',
        reward: 5,
        unlocked: false
      },
      {
        id: 'coins_1000',
        name: 'Мелкий торговец',
        description: 'Накопите 1,000 монет',
        icon: '🪙',
        requirement: 1000,
        type: 'coins',
        reward: 1,
        unlocked: false
      },
      {
        id: 'coins_10000',
        name: 'Крупный торговец',
        description: 'Накопите 10,000 монет',
        icon: '🪙',
        requirement: 10000,
        type: 'coins',
        reward: 3,
        unlocked: false
      },
      {
        id: 'coins_100000',
        name: 'Монетный магнат',
        description: 'Накопите 100,000 монет',
        icon: '🪙',
        requirement: 100000,
        type: 'coins',
        reward: 5,
        unlocked: false
      },
      {
        id: 'level_10',
        name: 'Новичок',
        description: 'Достигните 10 уровня',
        icon: '📈',
        requirement: 10,
        type: 'level',
        reward: 2,
        unlocked: false
      },
      {
        id: 'level_50',
        name: 'Опытный игрок',
        description: 'Достигните 50 уровня',
        icon: '📈',
        requirement: 50,
        type: 'level',
        reward: 4,
        unlocked: false
      },
      {
        id: 'level_100',
        name: 'Легенда',
        description: 'Достигните 100 уровня',
        icon: '📈',
        requirement: 100,
        type: 'level',
        reward: 10,
        unlocked: false
      },
      {
        id: 'all_characters',
        name: 'Коллекционер',
        description: 'Разблокируйте всех персонажей',
        icon: '🎭',
        requirement: 1,
        type: 'characters',
        reward: 5,
        unlocked: false
      }
    ];
  }

  checkAchievements() {
    let newAchievementsUnlocked = false;
    
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let requirementMet = false;
        
        switch (achievement.type) {
          case 'clicks':
            requirementMet = this.game.totalClicks >= achievement.requirement;
            break;
          case 'coins':
            requirementMet = this.game.coins >= achievement.requirement;
            break;
          case 'level':
            requirementMet = this.game.level >= achievement.requirement;
            break;
          case 'characters':
            const allCharactersUnlocked = this.game.characterManager.characters.every(
              character => character.entryLevel <= this.game.level
            );
            requirementMet = allCharactersUnlocked;
            break;
        }
        
        if (requirementMet) {
          achievement.unlocked = true;
          this.game.diamonds += achievement.reward;
          this.game.uiManager.showAchievementPopup(achievement);
          newAchievementsUnlocked = true;
        }
      }
    });
    
    if (newAchievementsUnlocked) {
      this.game.progressManager.saveProgress();
    }
  }

  getAchievementById(id) {
    return this.achievements.find(achievement => achievement.id === id);
  }

  getUnlockedAchievements() {
    return this.achievements.filter(achievement => achievement.unlocked);
  }

  getLockedAchievements() {
    return this.achievements.filter(achievement => !achievement.unlocked);
  }

  getAchievementProgress(achievement) {
    let current = 0;
    
    switch (achievement.type) {
      case 'clicks':
        current = this.game.totalClicks;
        break;
      case 'coins':
        current = this.game.coins;
        break;
      case 'level':
        current = this.game.level;
        break;
      case 'characters':
        const unlockedCharacters = this.game.characterManager.characters.filter(
          character => character.entryLevel <= this.game.level
        ).length;
        current = unlockedCharacters;
        break;
    }
    
    return {
      current,
      required: achievement.requirement,
      percentage: Math.min(100, Math.floor((current / achievement.requirement) * 100))
    };
  }

  resetAchievements() {
    console.log('Resetting all achievements');
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
    });
    console.log('All achievements reset successfully');
  }
} 