const mongoose = require('mongoose');
const {mongoUri}= require('./config.js');
require('dotenv').config(); // Завантаження змінних середовища з файлу .env

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
};

module.exports = connectDB;
