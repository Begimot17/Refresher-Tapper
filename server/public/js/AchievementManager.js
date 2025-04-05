class AchievementManager {
  constructor(game) {
    this.game = game;
    this.achievements = [
      {
        id: 'clicks_1000',
        name: 'Кликер-новичок на минималках',
        description: 'Сделайте 1,000 кликов',
        icon: '👆',
        requirement: 1000,
        type: 'clicks',
        reward: 1,
        unlocked: false
      },
      {
        id: 'clicks_10000',
        name: 'Палец-машина 3000',
        description: 'Сделайте 10,000 кликов',
        icon: '👆',
        requirement: 10000,
        type: 'clicks',
        reward: 3,
        unlocked: false
      },
      {
        id: 'clicks_100000',
        name: 'Безумный кликомен',
        description: 'Сделайте 100,000 кликов',
        icon: '👆',
        requirement: 100000,
        type: 'clicks',
        reward: 5,
        unlocked: false
      },
      {
        id: 'consecutive_clicks_10',
        name: 'Ниндзя-кликер',
        description: 'Нажмите 10 раз подряд на логотип "Refresher Tapper"',
        icon: '⚡',
        requirement: 10,
        type: 'consecutive_clicks',
        reward: 25,
        unlocked: false
      },
      {
        id: 'coins_1000',
        name: 'Начинающий Скрудж Макдак',
        description: 'Накопите 1,000 монет',
        icon: '🪙',
        requirement: 1000,
        type: 'coins',
        reward: 1,
        unlocked: false
      },
      {
        id: 'coins_10000',
        name: 'Монетный дождь',
        description: 'Накопите 10,000 монет',
        icon: '🪙',
        requirement: 10000,
        type: 'coins',
        reward: 3,
        unlocked: false
      },
      {
        id: 'coins_100000',
        name: 'Повелитель золотых кругляшей',
        description: 'Накопите 100,000 монет',
        icon: '🪙',
        requirement: 100000,
        type: 'coins',
        reward: 10,
        unlocked: false
      },
      {
        id: 'level_10',
        name: 'Подающий надежды тапер',
        description: 'Достигните 10 уровня',
        icon: '📈',
        requirement: 10,
        type: 'level',
        reward: 5,
        unlocked: false
      },
      {
        id: 'level_50',
        name: 'Тап-мастер 5000',
        description: 'Достигните 50 уровня',
        icon: '📈',
        requirement: 50,
        type: 'level',
        reward: 8,
        unlocked: false
      },
      {
        id: 'level_100',
        name: 'Босс финального тапа',
        description: 'Достигните 100 уровня',
        icon: '📈',
        requirement: 100,
        type: 'level',
        reward: 15,
        unlocked: false
      },
      {
        id: 'all_characters',
        name: 'Собиратель всея персонажей',
        description: 'Разблокируйте всех персонажей',
        icon: '🎭',
        requirement: 1,
        type: 'characters',
        reward: 10,
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
          case 'consecutive_clicks':
            requirementMet = this.game.consecutiveClicks >= achievement.requirement;
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