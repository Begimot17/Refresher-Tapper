const {DatabaseSync} = require('node:sqlite')
const path = require('path')
const fs = require('fs')

function createDb(dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), {recursive: true})
  }

  const db = new DatabaseSync(dbPath)

  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY,
      username TEXT,
      score INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 0,
      diamonds INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      multiplier INTEGER DEFAULT 1,
      multiplierCount INTEGER DEFAULT 0,
      autoClickerCount INTEGER DEFAULT 0,
      criticalHitCount INTEGER DEFAULT 0,
      coinBonusCount INTEGER DEFAULT 0,
      xpBoostCount INTEGER DEFAULT 0,
      selectedCharacterId INTEGER,
      totalClicks INTEGER DEFAULT 0,
      purchasedPremiumCharacters TEXT DEFAULT '[]',
      achievements TEXT DEFAULT '[]',
      lastLoginDate TEXT,
      lastUpdated TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      username TEXT,
      message TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    );
  `)

  return db
}

module.exports = {createDb}
