const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tap-game', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    userId: Number,
    score: Number,
    coins: Number,
    level: Number
});

const User = mongoose.model('User', userSchema);

module.exports = User;