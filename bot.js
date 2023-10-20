const { Telegraf, Markup } = require('telegraf');
const { getMyPlants, getMyReminders, addPlant, help, deletePlant, editPlant } = require('./handlers');
const {telegramToken}= require('./config.js');
const Plant = require("./models/Plant");

const bot = new Telegraf(telegramToken);

bot.start((ctx) => {
    ctx.reply('Вітаємо у боті для керування рослинами!', Markup.keyboard(['Мої рослини', 'Мої нагадування', 'Додати рослину', 'Допомога']).resize());
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
    ctx.reply('Для додавання нової рослини введіть наступну інформацію в форматі:\n\nНазва: ...\nБіологічна назва: ...\nЧастота поливань (в днях): ...\nУмови росту: ...\nКоротка інформація: ...\nКартинка рослини (емоджі): ...');
});

// Обробник тексту, який надсилається для додавання нової рослини
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('Назва:')) {
        // Передаємо у відповідну функцію для додавання рослини
        await addPlant(ctx);
    }
});

// Обробник "Допомога"
bot.command('help', help);

bot.on('text', async (ctx) => {
    // Перевірте, чи користувач редагує рослину
    if (ctx.session.editingPlantId) {
        try {
            // Отримайте _id рослини для редагування
            const plantIdToEdit = ctx.session.editingPlantId;

            // Отримайте введені користувачем дані
            const newData = ctx.message.text;

            // Розділіть введені дані за символом нового рядка
            const dataLines = newData.split('\n');

            // Отримайте назву поля та значення для кожного рядка
            const updatedData = {};
            for (const line of dataLines) {
                const [fieldName, value] = line.split(': ');
                updatedData[fieldName] = value;
            }

            // Оновіть рослину в базі даних з новими даними
            await Plant.findByIdAndUpdate(plantIdToEdit, updatedData);

            // Очистіть контекст
            delete ctx.session.editingPlantId;

            ctx.reply('Рослину відредаговано.');
        } catch (error) {
            console.error('Помилка при редагуванні рослини: ', error);
            ctx.reply('Сталася помилка при редагуванні рослини.');
        }
    }
});

// Додамо обробники для редагування та видалення рослин
bot.action(/^deletePlant_.+$/, deletePlant);
// Обробник "Редагувати рослину"
bot.action(/^editPlant_.+$/, async (ctx) => {
    const plantIdToEdit = ctx.match[0].split('_')[1];
    ctx.session.editingPlantId = plantIdToEdit;
    ctx.reply(
        'Ви редагуєте рослину. Введіть нові дані в наступному форматі:\n\n' +
        'Назва: ...\nБіологічна назва: ...\nЧастота поливань: ...\n' +
        'Умови росту: ...\nКоротка інформація: ...\nКартинка рослини: ...'
    );
});


module.exports = bot;

