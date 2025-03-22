const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
  userId: Number,
  score: Number,
  coins: Number,
  level: Number
})

const User = mongoose.model('User', userSchema)

module.exports = User
