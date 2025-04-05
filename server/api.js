const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

require('dotenv').config()

const app = express()

console.log('Запуск сервера...')

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const MONGO_URI = process.env.MONGO_URI

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Успешное подключение к MongoDB'))
  .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err))

mongoose.connection.on('error', err => {
  console.error('❌ Ошибка соединения с MongoDB:', err)
})

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB отключен. Повторное подключение...')
})

const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  username: { type: String },
  score: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  diamonds: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1 },
  multiplierCount: { type: Number, default: 0 },
  autoClickerCount: { type: Number, default: 0 },
  criticalHitCount: { type: Number, default: 0 },
  coinBonusCount: { type: Number, default: 0 },
  xpBoostCount: { type: Number, default: 0 },
  selectedCharacterId: { type: Number, default: null },
  totalClicks: { type: Number, default: 0 },
  achievements: [{
    id: { type: String, required: true },
    unlocked: { type: Boolean, default: false }
  }],
  lastUpdated: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.post('/api/save', async (req, res) => {
  try {
    const { userId, username } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const userData = {
      userId,
      username,
      score: req.body.score,
      coins: req.body.coins,
      diamonds: req.body.diamonds,
      level: req.body.level,
      xp: req.body.xp,
      multiplier: req.body.multiplier,
      multiplierCount: req.body.multiplierCount,
      autoClickerCount: req.body.autoClickerCount,
      criticalHitCount: req.body.criticalHitCount,
      coinBonusCount: req.body.coinBonusCount,
      xpBoostCount: req.body.xpBoostCount,
      selectedCharacterId: req.body.selectedCharacterId,
      totalClicks: req.body.totalClicks,
      achievements: req.body.achievements,
      lastUpdated: new Date()
    };
    
    await User.findOneAndUpdate(
      { userId },
      userData,
      { upsert: true, new: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

app.get('/api/load', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.json(null);
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
      achievements: user.achievements
    });
  } catch (error) {
    console.error('Error loading user data:', error);
    res.status(500).json({ error: 'Failed to load user data' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find().sort({score: -1}).select('username score')
    res.json(leaderboard)
  } catch (error) {
    console.error('Ошибка получения таблицы рекордов:', error)
    res.status(500).json({message: 'Ошибка сервера'})
  }
})
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`)
})
// Модель для сообщений чата
const chatMessageSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// API для чата
app.post('/api/chat/send', async (req, res) => {
  try {
    const { userId, username, message } = req.body;
    console.log('Received chat message request:', { userId, username, message });

    if (!message || !username) {
      console.log('Missing message or username');
      return res.status(400).json({ error: 'Требуется сообщение и имя пользователя' });
    }

    // Проверяем, есть ли у пользователя достаточно алмазов
    const user = await User.findOne({ userId });
    console.log('Found user:', user ? { userId: user.userId, diamonds: user.diamonds } : 'User not found');
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ error: 'Пользователь не найден' });
    }
    
    if (user.diamonds < 10) {
      console.log('Not enough diamonds:', user.diamonds);
      return res.status(400).json({ error: 'Недостаточно алмазов для отправки сообщения' });
    }

    // Уменьшаем количество алмазов на 10
    user.diamonds -= 10;
    await user.save();
    console.log('Diamonds updated:', user.diamonds);

    // Сохраняем сообщение
    const newMessage = new ChatMessage({
      userId,
      username,
      message: message.substring(0, 200) // Ограничиваем длину
    });

    await newMessage.save();
    console.log('Message saved');

    res.status(200).json({ success: true, diamonds: user.diamonds });
  } catch (error) {
    console.error('Ошибка сохранения сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/chat/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Переворачиваем, чтобы новые были внизу
    res.json(messages.reverse());
  } catch (error) {
    console.error('Ошибка загрузки сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
console.log('🛠 Окружение:', process.env)
