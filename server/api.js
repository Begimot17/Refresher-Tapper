const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const app = express();

console.log('Запуск сервера...');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Успешное подключение к MongoDB'))
    .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

mongoose.connection.on('error', (err) => {
    console.error('❌ Ошибка соединения с MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB отключен. Повторное подключение...');
});

const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    score: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
});

const User = mongoose.model('User', userSchema);

app.use((req, res, next) => {
    console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.post('/api/save', async (req, res) => {
    const { userId, username, score, coins, level } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { username, score, coins, level },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'Данные сохранены', user });
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await User.find()
            .sort({ score: -1 })
            .limit(10)
            .select('username score');
        res.json(leaderboard);
    } catch (error) {
        console.error('Ошибка получения таблицы рекордов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});

console.log('🛠 Окружение:', process.env);
