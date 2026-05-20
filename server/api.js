const express = require('express')
const path = require('path')
const rateLimit = require('express-rate-limit')
const {createDb} = require('./db')

require('dotenv').config()

const app = express()

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'game.db')
const db = createDb(DB_PATH)

console.log(`🗄️  SQLite: ${DB_PATH}`)

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const saveLimiter = rateLimit({windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false})
const chatLimiter = rateLimit({windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false})

app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ─── Prepared statements ─────────────────────────────────────────────────────

const getUser = db.prepare('SELECT * FROM users WHERE userId = ?')

const upsertUser = db.prepare(`
  INSERT INTO users (
    userId, username, score, coins, diamonds, level, xp, multiplier,
    multiplierCount, autoClickerCount, criticalHitCount, coinBonusCount,
    xpBoostCount, selectedCharacterId, totalClicks,
    purchasedPremiumCharacters, achievements, lastUpdated
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(userId) DO UPDATE SET
    username = excluded.username,
    score = excluded.score,
    coins = excluded.coins,
    diamonds = excluded.diamonds,
    level = excluded.level,
    xp = excluded.xp,
    multiplier = excluded.multiplier,
    multiplierCount = excluded.multiplierCount,
    autoClickerCount = excluded.autoClickerCount,
    criticalHitCount = excluded.criticalHitCount,
    coinBonusCount = excluded.coinBonusCount,
    xpBoostCount = excluded.xpBoostCount,
    selectedCharacterId = excluded.selectedCharacterId,
    totalClicks = excluded.totalClicks,
    purchasedPremiumCharacters = excluded.purchasedPremiumCharacters,
    achievements = excluded.achievements,
    lastUpdated = datetime('now')
`)

const updateDailyReward = db.prepare(
  'UPDATE users SET diamonds = diamonds + 1, lastLoginDate = ? WHERE userId = ?'
)

const getLeaderboard = db.prepare(
  'SELECT username, score FROM users ORDER BY score DESC'
)

const updateDiamonds = db.prepare('UPDATE users SET diamonds = ? WHERE userId = ?')

const insertMessage = db.prepare(
  'INSERT INTO chat_messages (userId, username, message) VALUES (?, ?, ?)'
)

const getMessages = db.prepare(
  'SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 50'
)

// ─── Routes ──────────────────────────────────────────────────────────────────

app.post('/api/save', saveLimiter, (req, res) => {
  const {userId} = req.body
  if (!userId) return res.status(400).json({error: 'User ID is required'})

  try {
    upsertUser.run(
      userId,
      req.body.username || null,
      req.body.score || 0,
      req.body.coins || 0,
      req.body.diamonds || 0,
      req.body.level || 1,
      req.body.xp || 0,
      req.body.multiplier || 1,
      req.body.multiplierCount || 0,
      req.body.autoClickerCount || 0,
      req.body.criticalHitCount || 0,
      req.body.coinBonusCount || 0,
      req.body.xpBoostCount || 0,
      req.body.selectedCharacterId || null,
      req.body.totalClicks || 0,
      JSON.stringify(req.body.purchasedPremiumCharacters || []),
      JSON.stringify(req.body.achievements || [])
    )
    res.json({success: true})
  } catch (err) {
    console.error('Error saving user data:', err)
    res.status(500).json({error: 'Failed to save user data'})
  }
})

app.get('/api/load', (req, res) => {
  const {userId} = req.query
  if (!userId) return res.status(400).json({error: 'User ID is required'})

  try {
    const user = getUser.get(Number(userId))
    if (!user) return res.json(null)

    // Daily login reward
    const today = new Date().toDateString()
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null
    let dailyRewardAwarded = false
    if (lastLogin !== today) {
      updateDailyReward.run(new Date().toISOString(), user.userId)
      user.diamonds += 1
      dailyRewardAwarded = true
    }

    res.json({
      score: user.score,
      coins: user.coins,
      diamonds: user.diamonds,
      level: user.level,
      xp: user.xp,
      multiplier: user.multiplier,
      multiplierCount: user.multiplierCount,
      autoClickerCount: user.autoClickerCount,
      criticalHitCount: user.criticalHitCount,
      coinBonusCount: user.coinBonusCount,
      xpBoostCount: user.xpBoostCount,
      selectedCharacterId: user.selectedCharacterId,
      totalClicks: user.totalClicks,
      purchasedPremiumCharacters: JSON.parse(user.purchasedPremiumCharacters || '[]'),
      achievements: JSON.parse(user.achievements || '[]'),
      dailyRewardAwarded
    })
  } catch (err) {
    console.error('Error loading user data:', err)
    res.status(500).json({error: 'Failed to load user data'})
  }
})

app.get('/api/leaderboard', (req, res) => {
  try {
    res.json(getLeaderboard.all())
  } catch (err) {
    console.error('Ошибка получения таблицы рекордов:', err)
    res.status(500).json({message: 'Ошибка сервера'})
  }
})

app.post('/api/chat/send', chatLimiter, (req, res) => {
  const {userId, username, message} = req.body

  if (!message || !username) {
    return res.status(400).json({error: 'Требуется сообщение и имя пользователя'})
  }
  if (message.length > 32) {
    return res.status(400).json({error: 'Сообщение не может быть длиннее 32 символов'})
  }

  try {
    db.exec('BEGIN')
    const user = getUser.get(Number(userId))
    if (!user) {
      db.exec('ROLLBACK')
      return res.status(400).json({error: 'Пользователь не найден'})
    }
    if (user.diamonds < 1) {
      db.exec('ROLLBACK')
      return res.status(400).json({error: 'Недостаточно алмазов для отправки сообщения'})
    }
    updateDiamonds.run(user.diamonds - 1, user.userId)
    insertMessage.run(user.userId, username, message)
    db.exec('COMMIT')
    res.json({success: true, diamonds: user.diamonds - 1})
  } catch (err) {
    db.exec('ROLLBACK')
    console.error('Ошибка отправки сообщения:', err)
    res.status(500).json({error: 'Ошибка сервера'})
  }
})

app.get('/api/chat/messages', (req, res) => {
  try {
    res.json(getMessages.all().reverse())
  } catch (err) {
    console.error('Ошибка загрузки сообщений:', err)
    res.status(500).json({error: 'Ошибка сервера'})
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`)
  })
}

module.exports = {app, db}
