const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Middleware для обработки JSON-данных
app.use(express.json());

// Обслуживаем статические файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB
//mongoose.connect('mongodb://mongo:27017/tap-game')
//    .then(() => console.log('Подключено к MongoDB'))
//    .catch(err => console.error('Ошибка подключения к MongoDB:', err));
//
//// Модель пользователя
//const userSchema = new mongoose.Schema({
//    userId: { type: Number, required: true, unique: true },
//    score: { type: Number, default: 0 },
//    coins: { type: Number, default: 0 },
//    level: { type: Number, default: 1 },
//});
//
//const User = mongoose.model('User', userSchema);
//
//// Маршрут для сохранения данных пользователя
//app.post('/api/save', async (req, res) => {
//    const { userId, score, coins, level } = req.body;
//
//    if (!userId || score === undefined || coins === undefined || level === undefined) {
//        return res.status(400).json({ message: 'Недостаточно данных' });
//    }
//
//    try {
//        const user = await User.findOneAndUpdate(
//            { userId },
//            { score, coins, level },
//            { upsert: true, new: true }
//        );
//
//        res.status(200).json({ message: 'Данные сохранены', user });
//    } catch (error) {
//        console.error('Ошибка при сохранении данных:', error);
//        res.status(500).json({ message: 'Ошибка сервера' });
//    }
//});
//
//// Маршрут для получения таблицы рекордов
//app.get('/api/leaderboard', async (req, res) => {
//    try {
//        const leaderboard = await User.find()
//            .sort({ score: -1 })
//            .limit(10)
//            .select('userId score');
//
//        res.status(200).json(leaderboard);
//    } catch (error) {
//        console.error('Ошибка при получении таблицы рекордов:', error);
//        res.status(500).json({ message: 'Ошибка сервера' });
//    }
//});

// Маршрут для корневого пути
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});