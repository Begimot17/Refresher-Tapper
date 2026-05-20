class UpgradeManager {
  constructor(game) {
    this.game = game;
    
    this.upgrades = [
      {
        id: 'multiplier',
        name: 'Самогон',
        description: 'Увеличивает количество очков за клик. Чем больше самогона, тем крепче удар! 🍺',
        icon: '🍺',
        baseCost: 25,
        costIncrease: 35,
        effect: 'multiplier',
        maxLevel: 3000
      },
      {
        id: 'auto-click',
        name: 'Волга',
        description: 'Автоматически кликает и дает +15% к очкам за каждый уровень. Каждый уровень делает клики на 3% быстрее! Волга работает, пока ты отдыхаешь! 🏎️',
        icon: '🏎️',
        baseCost: 75,
        costIncrease: 75,
        effect: 'autoClicker',
        maxLevel: 1500
      },
      {
        id: 'critical-hit',
        name: 'Подик',
        description: 'Увеличивает шанс и силу критического удара. Подик — это не просто удар, это искусство! 💥',
        icon: '💥',
        baseCost: 250,
        costIncrease: 250,
        effect: 'criticalHit',
        maxLevel: 750
      },
      {
        id: 'coin-bonus',
        name: 'База',
        description: 'Увеличивает количество монет за клик. База — это надежный источник дохода, как в реальной жизни! 💰',
        icon: '💰',
        baseCost: 5000,
        costIncrease: 1500,
        effect: 'coinBonus',
        maxLevel: 400
      },
      {
        id: 'xp-boost',
        name: 'Снюс',
        description: 'Увеличивает количество опыта за клик на 15% за каждый уровень. Снюс заряжает энергией и помогает быстрее расти! 📦',
        icon: '📦',
        baseCost: 10000,
        costIncrease: 5000,
        effect: 'xpBoost',
        maxLevel: 400
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
        this.game.multiplierCount += 1;
        this.game.multiplier += 1;
        break;
      case 'auto-click':
        this.game.autoClickerCount += 1;
        this.applyAutoClickerEffect();
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
    // Clear any existing interval to prevent multiple auto-clickers
    if (this.autoClickerInterval) {
      clearInterval(this.autoClickerInterval);
      this.autoClickerInterval = null;
    }
    
    // Get auto-clicker level
    const autoClickerLevel = this.getUpgradeLevel('auto-click');
    
    // Only set up interval if auto-clicker level is greater than 0
    if (autoClickerLevel > 0) {
      // Set up interval based on auto-clicker level (faster with higher levels)
      // Each level makes the auto-clicker 3% faster, with a minimum of 300ms
      const intervalTime = Math.max(1000 - (autoClickerLevel * 30), 300);
      
      this.autoClickerInterval = setInterval(() => {
        // Calculate base points with multiplier
        const basePoints = Math.floor(this.game.multiplier);
        
        // Check for critical hit
        const criticalChance = Math.min(this.getUpgradeLevel('critical-hit') * 0.05, 0.80);
        const isCritical = Math.random() < criticalChance;
        const criticalMultiplier = isCritical ? 2 : 1;
        
        // Get the tap circle element
        const circle = document.getElementById('tap-circle');
        const circleRect = circle.getBoundingClientRect();
        
        // Calculate random position within the circle
        const centerX = circleRect.width / 2;
        const centerY = circleRect.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8; // 80% of radius to keep within circle
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Add auto-clicker bonus based on level
        // Each level gives a 15% boost to points
        const autoClickerBoost = 1 + (autoClickerLevel * 0.15);
        
        // Calculate final points with all multipliers
        const finalPoints = Math.floor(basePoints * criticalMultiplier * autoClickerBoost);
        
        // Create visual effect
        if (isCritical) {
          this.game.uiManager.createCriticalHitEffect(x, y);
        } else {
          this.game.uiManager.createTapEffect(x, y);
        }
        
        // Update score and coins
        this.game.updateScore(finalPoints);
        
        // Add experience points
        const xpBoost = 1 + (this.getUpgradeLevel('xp-boost') * 0.15); // 15% за уровень
        const levelScaling = 1 + (this.game.level * 0.03); // 3% больше опыта за каждый уровень
        const xpGained = Math.max(1, Math.floor(0.15 * levelScaling * xpBoost)); // Гарантируем минимум 1 очко опыта
        
        this.game.xp += xpGained;
        
        // Check for level up
        this.game.checkLevelUp();
        
        // Increment total clicks counter
        this.game.totalClicks++;
        
        // Check for achievements
        this.game.achievementManager.checkAchievements();
        
        // Update UI
        this.game.uiManager.updateUI();
      }, intervalTime);
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
      
      // Применяем эффект улучшения
      if (upgradeId === 'auto-click') {
        // Для автокликера сразу применяем эффект
        this.applyAutoClickerEffect();
      } else {
        this.applyUpgradeEffect(upgrade.effect);
      }
      
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