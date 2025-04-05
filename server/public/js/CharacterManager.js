class CharacterManager {
  constructor() {
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
    return this.characters.find(character => character.id === id);
  }
  
  getNextUnlockLevel(currentLevel) {
    return this.characters
      .filter(c => c.entryLevel > currentLevel)
      .sort((a, b) => a.entryLevel - b.entryLevel)[0]?.entryLevel;
  }
} 