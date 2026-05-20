const request = require('supertest')

// Use in-memory SQLite so tests never touch the real DB file
process.env.DB_PATH = ':memory:'

const {app, db} = require('../api.js')

afterEach(() => {
  db.exec('DELETE FROM users; DELETE FROM chat_messages')
})

const baseUser = (overrides = {}) => ({
  userId: 12345,
  username: 'testuser',
  score: 100,
  coins: 50,
  diamonds: 3,
  level: 2,
  xp: 20,
  multiplier: 1,
  multiplierCount: 0,
  autoClickerCount: 0,
  criticalHitCount: 0,
  coinBonusCount: 0,
  xpBoostCount: 0,
  selectedCharacterId: 1,
  totalClicks: 200,
  purchasedPremiumCharacters: [],
  achievements: [],
  ...overrides
})

// ─── POST /api/save ──────────────────────────────────────────────────────────

describe('POST /api/save', () => {
  test('создаёт нового пользователя', async () => {
    const res = await request(app).post('/api/save').send(baseUser())
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  test('обновляет существующего пользователя', async () => {
    await request(app).post('/api/save').send(baseUser())
    await request(app).post('/api/save').send(baseUser({score: 999}))
    const load = await request(app).get('/api/load').query({userId: 12345})
    expect(load.body.score).toBe(999)
  })

  test('возвращает 400 без userId', async () => {
    const res = await request(app).post('/api/save').send({score: 100})
    expect(res.status).toBe(400)
  })
})

// ─── GET /api/load ───────────────────────────────────────────────────────────

describe('GET /api/load', () => {
  beforeEach(async () => {
    await request(app).post('/api/save').send(baseUser({userId: 42, diamonds: 5}))
  })

  test('возвращает данные существующего пользователя', async () => {
    const res = await request(app).get('/api/load').query({userId: 42})
    expect(res.status).toBe(200)
    expect(res.body.score).toBe(100)
  })

  test('возвращает null для несуществующего userId', async () => {
    const res = await request(app).get('/api/load').query({userId: 9999})
    expect(res.status).toBe(200)
    expect(res.body).toBeNull()
  })

  test('возвращает 400 без userId', async () => {
    const res = await request(app).get('/api/load')
    expect(res.status).toBe(400)
  })

  test('начисляет ежедневную награду при первом входе', async () => {
    const res = await request(app).get('/api/load').query({userId: 42})
    expect(res.body.dailyRewardAwarded).toBe(true)
    expect(res.body.diamonds).toBe(6)
  })

  test('не начисляет ежедневную награду повторно в тот же день', async () => {
    await request(app).get('/api/load').query({userId: 42})
    const res = await request(app).get('/api/load').query({userId: 42})
    expect(res.body.dailyRewardAwarded).toBe(false)
    expect(res.body.diamonds).toBe(6)
  })
})

// ─── GET /api/leaderboard ────────────────────────────────────────────────────

describe('GET /api/leaderboard', () => {
  beforeEach(async () => {
    const users = [
      baseUser({userId: 1, username: 'alice', score: 1000}),
      baseUser({userId: 2, username: 'bob', score: 500}),
      baseUser({userId: 3, username: 'charlie', score: 2000})
    ]
    for (const u of users) await request(app).post('/api/save').send(u)
  })

  test('возвращает игроков отсортированных по score убыванию', async () => {
    const res = await request(app).get('/api/leaderboard')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].score).toBe(2000)
    expect(res.body[1].score).toBe(1000)
    expect(res.body[2].score).toBe(500)
  })
})

// ─── POST /api/chat/send ─────────────────────────────────────────────────────

describe('POST /api/chat/send', () => {
  beforeEach(async () => {
    await request(app).post('/api/save').send(baseUser({userId: 7, username: 'chatter', diamonds: 5}))
  })

  test('успешно отправляет сообщение при наличии алмазов', async () => {
    const res = await request(app).post('/api/chat/send').send({userId: 7, username: 'chatter', message: 'Привет!'})
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.diamonds).toBe(4)
  })

  test('возвращает 400 при diamonds = 0', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/chat/send').send({userId: 7, username: 'chatter', message: `msg${i}`})
    }
    const res = await request(app).post('/api/chat/send').send({userId: 7, username: 'chatter', message: 'broke'})
    expect(res.status).toBe(400)
  })

  test('возвращает 400 при message длиннее 32 символов', async () => {
    const res = await request(app).post('/api/chat/send').send({userId: 7, username: 'chatter', message: 'а'.repeat(33)})
    expect(res.status).toBe(400)
  })

  test('возвращает 400 при отсутствии message', async () => {
    const res = await request(app).post('/api/chat/send').send({userId: 7, username: 'chatter'})
    expect(res.status).toBe(400)
  })
})
