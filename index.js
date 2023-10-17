const bot = require('./bot');
const connectDB = require('./db');
const dotenv = require('dotenv');
dotenv.config(); // Завантаження змінних середовища з файлу .env

// Підключення до MongoDB
connectDB();

// Запуск бота
bot.launch().then(() => {
    console.log('Bot started');
});
