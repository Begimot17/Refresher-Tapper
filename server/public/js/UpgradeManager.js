class UpgradeManager {
  constructor(game) {
    this.game = game;
    
    this.upgrades = [
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
    ];
  }
  
  getUpgradeLevel(upgradeId) {
    switch (upgradeId) {
      case 'multiplier':
        return this.game.multiplierCount || 0;
      case 'auto-click':
        return this.game.autoClickerCount || 0;
      case 'critical-hit':
        return this.game.criticalHitCount || 0;
      case 'coin-bonus':
        return this.game.coinBonusCount || 0;
      case 'xp-boost':
        return this.game.xpBoostCount || 0;
      default:
        return 0;
    }
  }
  
  increaseUpgradeLevel(upgradeId) {
    switch (upgradeId) {
      case 'multiplier':
        this.game.multiplier += 1;
        this.game.multiplierCount += 1;
        break;
      case 'auto-click':
        this.game.autoClickerCount += 1;
        break;
      case 'critical-hit':
        this.game.criticalHitCount += 1;
        break;
      case 'coin-bonus':
        this.game.coinBonusCount += 1;
        break;
      case 'xp-boost':
        this.game.xpBoostCount += 1;
        break;
    }
  }
  
  applyUpgradeEffect(effectType) {
    switch (effectType) {
      case 'multiplier':
        break;
      case 'autoClicker':
        this.applyAutoClickerEffect();
        break;
      case 'criticalHit':
        break;
      case 'coinBonus':
        break;
      case 'xpBoost':
        break;
      default:
        console.error('Неизвестный тип улучшения:', effectType);
    }
  }
  
  applyAutoClickerEffect() {
    if (!this.game.autoClickerActive) {
      this.game.autoClickerActive = true;
      this.game.autoClickerInterval = setInterval(() => {
        this.game.updateScore(this.game.multiplier + this.game.autoClickerCount);
        this.game.updateCoins(this.game.multiplier + this.game.autoClickerCount);
        this.game.checkLevelUp();
        this.game.uiManager.updateUI();
      }, 1000);
    }
  }
  
  buyUpgrade(upgradeId) {
    const upgrade = this.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) {
      this.game.uiManager.showError('Улучшение не найдено.');
      return;
    }
    
    const currentLevel = this.getUpgradeLevel(upgradeId);
    
    // Проверяем, достигнут ли максимальный уровень
    if (currentLevel >= upgrade.maxLevel) {
      this.game.uiManager.showError('Максимальный уровень улучшения уже достигнут.');
      return;
    }
    
    const cost = upgrade.baseCost + currentLevel * upgrade.costIncrease;
    
    // Проверяем, достаточно ли монет
    if (this.game.coins >= cost) {
      this.game.coins -= cost;
      this.increaseUpgradeLevel(upgradeId); // Увеличиваем уровень улучшения
      this.applyUpgradeEffect(upgrade.effect); // Применяем эффект улучшения
      this.game.uiManager.updateUI(); // Обновляем интерфейс
    } else {
      this.game.uiManager.showError('Недостаточно монет для покупки улучшения.');
    }
  }
  
  renderShop() {
    const $upgradesList = $('#upgrades-list');
    $upgradesList.empty();
    
    this.upgrades.forEach(upgrade => {
      const currentLevel = this.getUpgradeLevel(upgrade.id);
      const cost = upgrade.baseCost + currentLevel * upgrade.costIncrease;
      const isMaxLevel = currentLevel >= upgrade.maxLevel;
      
      const $upgradeElement = $('<div>')
        .addClass('upgrade')
        .attr('data-id', upgrade.id)
        .click(() => this.buyUpgrade(upgrade.id));
      
      $upgradeElement.html(`
        <div class="upgrade-header">
          ${upgrade.icon} ${upgrade.name}
        </div>
        <div class="upgrade-details">
          Цена: <span class="upgrade-cost">${isMaxLevel ? '—' : this.game.formatNumber(cost)}</span> 🪙
          <br>
          Уровень: <span class="upgrade-level">${currentLevel}</span> / ${upgrade.maxLevel}
          <br>
          <small>${upgrade.description}</small>
        </div>
      `);
      
      $upgradesList.append($upgradeElement);
    });
  }
} 