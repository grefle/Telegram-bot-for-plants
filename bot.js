const { Telegraf, Markup } = require('telegraf');
const { getMyPlants, getMyReminders, addPlant, help, deletePlant, editPlant } = require('./handlers');
const {telegramToken}= require('./config');
const Plant = require("./models/Plant");
const { mapField } = require("./fields-mapping");

const bot = new Telegraf(telegramToken);

let editingPlantId = undefined;

bot.start((ctx) => {
    ctx.reply('🍀Вітаю у боті для керування рослинами!🍀', Markup.keyboard(['Мої рослини', 'Мої нагадування', 'Додати рослину', 'Допомога']).resize());
});

bot.use((ctx, next) => {
    // Перевірте, чи сесія вже існує
    if (!ctx.session) {
        ctx.session = {};
    }

    return next();
});

// Обробник "Мої рослини"
bot.hears('Мої рослини', getMyPlants);

// Обробник "Мої нагадування"
bot.hears('Мої нагадування', getMyReminders);

// Обробник "Додати рослину"
bot.hears('Додати рослину', (ctx) => {
    ctx.reply('Для додавання нової рослини введіть наступну інформацію в форматі:\n\nНазва: ...\nБіологічна назва: ...\nЧастота поливань: ...\nУмови росту: ...\nКоротка інформація: ...\nКартинка рослини: ...');
});

// Обробник "Допомога"
bot.hears('Допомога', help);

// Обробник текстового повідомлення від користувача
bot.on('text', async (ctx) => {
    // Перевірте, чи користувач редагує рослину
    if (editingPlantId) {
        try {
            // Отримайте _id рослини для редагування
            const plantIdToEdit = editingPlantId;

            // Отримайте введені користувачем дані
            const newData = ctx.message.text;

            // Розділіть введені дані за символом нового рядка
            const dataLines = newData.split('\n');

            // Отримайте назву поля та значення для кожного рядка
            const updatedData = {};
            for (const line of dataLines) {
                const [fieldName, value] = line.split(': ');
                updatedData[mapField(fieldName)] = value;
            }

            // Оновіть рослину в базі даних з новими даними
            await Plant.findByIdAndUpdate(plantIdToEdit, updatedData);

            // Очистіть контекст
            editingPlantId = undefined;
            // delete ctx.session.editingPlantId;

            ctx.reply('Рослину відредаговано.');
        } catch (error) {
            console.error('Помилка при редагуванні рослини: ', error);
            ctx.reply('Сталася помилка при редагуванні рослини.');
        }
    } else {
        // Якщо користувач не редагує рослину, це може бути додаванням нової рослини
        const text = ctx.message.text;
        if (text.startsWith('Назва:')) {
            // Передаємо у відповідну функцію для додавання рослини
            await addPlant(ctx);
        }
    }
});

// Обробник "Видалити рослину"
bot.action(/^deletePlant_.+$/, deletePlant);

// Обробник "Редагувати рослину"
bot.action(/^editPlant_.+$/, (ctx) => {
    ctx.reply('Редагуйте рослину увівши відповідні поля...');
    editingPlantId = ctx.callbackQuery.data.split('_')[1];
});

bot.on('sticker', (ctx) => ctx.reply('🌵'));

module.exports = bot;

