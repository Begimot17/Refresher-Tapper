class CharacterManager {
  constructor(game) {
    this.game = game;
    this.purchasedPremiumCharacters = [];
    
    this.characters = [
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
        description: 'Мастер кликов, но хлеб за ним всё равно придётся идти самому'
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
        description: 'Морской волк'
      },
      {
        id: 5,
        name: 'Любомир',
        entryLevel: 20,
        image: 'images/lubomir.jpg',
        sound: 'sounds/lubomir.mp3',
        description: 'Ветеран кликов, его пальцы помнят каждое нажатие, фанат Серьёзного Сема'
      },
      {
        id: 6,
        name: 'Лёша',
        entryLevel: 25,
        image: 'images/lesha_dyachkov.jpg',
        sound: 'sounds/lesha_dyachkov.mp3',
        description: 'Электрик по кликам, заряжает энергией каждое нажатие, болеет за Ланос'
      },
      {
        id: 7,
        name: 'Дима',
        entryLevel: 35,
        image: 'images/dima_brusko.jpg',
        sound: 'sounds/dima_brusko.mp3',
        description: 'Программист кликов, пишет код нажатиями, не расстаётся с Макбуком'
      },
      {
        id: 8,
        name: 'Жека',
        entryLevel: 50,
        image: 'images/evgeniy.gif',
        sound: 'sounds/jeka_isaenko.mp3',
        animationDuration: 1500,
        description: 'Часовщик кликов, каждое нажатие точно как механизм, коллекционер подушек'
      },
      {
        id: 9,
        name: 'Саня',
        entryLevel: 75,
        image: 'images/sasha_isaenko.jpg',
        sound: 'sounds/sasha_isaenko.mp3',
        description: 'Камерщик кликов, снимает каждое нажатие, фанат CS GO'
      },
      {
        id: 10,
        name: 'Жума',
        entryLevel: 100,
        image: 'images/juma.jpg',
        sound: 'sounds/juma.mp3',
        description: 'Аспирант-лаборант кликов, исследует каждое нажатие, не может без Lays'
      },
      {
        id: 11,
        name: 'Никита',
        entryLevel: 150,
        image: 'images/nikita.jpg',
        sound: 'sounds/nikita.mp3',
        description: 'Бог кликов, его нажатия творят чудеса'
      },
      {
        id: 12,
        name: 'Дуля',
        entryLevel: 999,
        image: 'images/dula.jpg',
        sound: 'sounds/dula.mp3',
        description: '😜 Легенда кликов, его нажатия окутаны тайной'
      }
    ];
    
    // Премиум-персонажи, доступные за алмазы
    this.premiumCharacters = [
      {
        id: 101,
        name: 'Дракон',
        price: 5,
        image: 'images/dragon.png',
        sound: 'sounds/dula.mp3',
        description: '🔥 Мифическое существо, чьи клики сжигают всё на своём пути',
        bonus: '+5%'
      },
      {
        id: 102,
        name: 'Робот',
        price: 10,
        image: 'images/robot.jpg',
        sound: 'sounds/dula.mp3',
        description: '🤖 Механический кликер с точностью до миллисекунды',
        bonus: '+10%'
      },
      {
        id: 103,
        name: 'Волшебник',
        price: 15,
        image: 'images/magic.png',
        sound: 'sounds/dula.mp3',
        description: '🧙‍♂️ Мастер магии, чьи клики превращают монеты в алмазы',
        bonus: '+15%'
      },
      {
        id: 104,
        name: 'Космонавт',
        price: 20,
        image: 'images/cosmo.jpg',
        sound: 'sounds/dula.mp3',
        description: '🚀 Исследователь космоса, чьи клики достигают звёзд',
        bonus: '+20%'
      },
      {
        id: 105,
        name: 'Динозавр',
        price: 25,
        image: 'images/dino.jpg',
        sound: 'sounds/dula.mp3',
        description: '🦖 Древнее существо с невероятной силой кликов',
        bonus: '+25%'
      }
    ];
    
    this.defaultImage = 'images/bogdan.jpg';
    this.defaultSound = 'sounds/bogdan.m4a';
  }
  
  getCharacterForLevel(currentLevel) {
    // Находим персонажа, у которого entryLevel <= currentLevel и entryLevel максимальный
    let unlockedCharacter = null;
    let maxEntryLevel = 0;
    
    for (const character of this.characters) {
      if (currentLevel >= character.entryLevel && character.entryLevel > maxEntryLevel) {
        unlockedCharacter = character;
        maxEntryLevel = character.entryLevel;
      }
    }
    
    // Если ни один персонаж не разблокирован, возвращаем первого
    return unlockedCharacter || this.characters[0];
  }
  
  getCharacterById(id) {
    // Сначала ищем среди обычных персонажей
    const regularCharacter = this.characters.find(character => character.id === id);
    if (regularCharacter) return regularCharacter;
    
    // Затем ищем среди премиум-персонажей
    return this.premiumCharacters.find(character => character.id === id);
  }
  
  getNextUnlockLevel(currentLevel) {
    // Если уровень не передан, используем текущий уровень игры
    if (currentLevel === undefined) {
      currentLevel = this.game ? this.game.level : 1;
    }
    
    return this.characters
      .filter(c => c.entryLevel > currentLevel)
      .sort((a, b) => a.entryLevel - b.entryLevel)[0]?.entryLevel;
  }
  
  // Получить все премиум-персонажи
  getAllPremiumCharacters() {
    return this.premiumCharacters;
  }
  
  // Проверить, куплен ли премиум-персонаж
  isPremiumCharacterPurchased(characterId) {
    // Проверяем, есть ли персонаж в списке купленных
    const isPurchased = Array.isArray(this.purchasedPremiumCharacters) && this.purchasedPremiumCharacters.includes(characterId);
    console.log(`Checking if character ${characterId} is purchased:`, isPurchased);
    console.log('Current purchased characters:', this.purchasedPremiumCharacters);
    return isPurchased;
  }
  
  // Добавить премиум-персонажа в список купленных
  addPurchasedPremiumCharacter(characterId) {
    console.log('Adding premium character to purchased list:', characterId);
    console.log('Current purchased characters:', this.purchasedPremiumCharacters);
    
    // Проверяем, что персонаж существует в списке премиум-персонажей
    const premiumCharacter = this.premiumCharacters.find(character => character.id === characterId);
    if (!premiumCharacter) {
      console.warn('Attempted to add non-existent premium character:', characterId);
      return;
    }
    console.log('Found premium character:', premiumCharacter);
    
    // Инициализируем массив, если он не существует или не является массивом
    if (!Array.isArray(this.purchasedPremiumCharacters)) {
      console.log('Initializing purchasedPremiumCharacters as empty array');
      this.purchasedPremiumCharacters = [];
    }
    
    // Добавляем персонажа, если его еще нет в списке
    if (!this.purchasedPremiumCharacters.includes(characterId)) {
      this.purchasedPremiumCharacters.push(characterId);
      console.log('Premium character added successfully. Current list:', this.purchasedPremiumCharacters);
    } else {
      console.log('Premium character already in purchased list:', characterId);
    }
  }
  
  // Загрузить список купленных премиум-персонажей
  loadPurchasedPremiumCharacters(purchasedCharacters) {
    console.log('Loading purchased premium characters:', purchasedCharacters);
    console.log('Current purchased characters before loading:', this.purchasedPremiumCharacters);
    
    // Проверяем, что purchasedCharacters - это массив
    if (Array.isArray(purchasedCharacters)) {
      console.log('purchasedCharacters is an array with length:', purchasedCharacters.length);
      
      // Фильтруем массив, оставляя только существующие ID премиум-персонажей
      const validCharacterIds = purchasedCharacters.filter(id => {
        const exists = this.premiumCharacters.some(character => character.id === id);
        if (!exists) {
          console.warn(`Character ID ${id} not found in premium characters list`);
        }
        return exists;
      });
      
      console.log('Valid premium character IDs:', validCharacterIds);
      console.log('Premium characters list for reference:', this.premiumCharacters);
      
      // Сохраняем отфильтрованные ID
      this.purchasedPremiumCharacters = validCharacterIds;
      console.log('Updated purchasedPremiumCharacters:', this.purchasedPremiumCharacters);
      
      // Проверяем, что все премиум-персонажи правильно загружены
      this.premiumCharacters.forEach(character => {
        const isPurchased = this.isPremiumCharacterPurchased(character.id);
        console.log(`Premium character ${character.name} (ID: ${character.id}) is purchased:`, isPurchased);
      });
    } else {
      console.warn('Invalid purchasedPremiumCharacters data:', purchasedCharacters);
      console.warn('Type of purchasedCharacters:', typeof purchasedCharacters);
      this.purchasedPremiumCharacters = [];
    }
    console.log('Final purchased characters after loading:', this.purchasedPremiumCharacters);
  }
  
  // Получить список купленных премиум-персонажей
  getPurchasedPremiumCharacters() {
    console.log('Getting purchased premium characters. Current state:', this.purchasedPremiumCharacters);
    
    // Убедимся, что this.purchasedPremiumCharacters - это массив
    if (!Array.isArray(this.purchasedPremiumCharacters)) {
      console.warn('purchasedPremiumCharacters is not an array, initializing as empty array');
      this.purchasedPremiumCharacters = [];
    }
    
    // Фильтруем массив, оставляя только существующие ID премиум-персонажей
    const validCharacterIds = this.purchasedPremiumCharacters.filter(id => {
      const exists = this.premiumCharacters.some(character => character.id === id);
      if (!exists) {
        console.warn(`Character ID ${id} not found in premium characters list`);
      }
      return exists;
    });
    
    console.log('Valid purchased premium characters:', validCharacterIds);
    
    // Проверяем, что все премиум-персонажи правильно загружены
    this.premiumCharacters.forEach(character => {
      const isPurchased = this.isPremiumCharacterPurchased(character.id);
      console.log(`Premium character ${character.name} (ID: ${character.id}) is purchased:`, isPurchased);
    });
    
    return validCharacterIds;
  }
  
  isPremiumCharacter(characterId) {
    // Проверяем, есть ли персонаж в списке премиум-персонажей
    return this.premiumCharacters.some(character => character.id === characterId);
  }
  
  // Получить доступных персонажей для текущего уровня
  getAvailableCharacters() {
    const currentLevel = this.game ? this.game.level : 1;
    return this.characters.filter(character => character.entryLevel <= currentLevel);
  }
} 