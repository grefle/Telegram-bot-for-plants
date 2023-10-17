const { Telegraf, Markup } = require('telegraf');
const { getMyPlants, getMyReminders, addPlant, help, deletePlant, editPlant } = require('./handlers');
const {telegramToken}= require('./config.js');

const bot = new Telegraf(telegramToken);

bot.start((ctx) => {
    ctx.reply('Вітаємо у боті для керування рослинами!', Markup.keyboard(['Мої рослини', 'Мої нагадування', 'Додати рослину', 'Допомога']).resize());
});

// Обробник "Мої рослини"
bot.hears('Мої рослини', getMyPlants);

// Обробник "Мої нагадування"
bot.hears('Мої нагадування', getMyReminders);

// Обробник "Додати рослину"
bot.hears('Додати рослину', (ctx) => {
    ctx.reply('Для додавання нової рослини введіть наступну інформацію в форматі:\n\nНазва: ...\nБіологічна назва: ...\nЧастота поливань: ...\nУмови росту: ...\nКоротка інформація: ...\nКартинка рослини: ...');
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

// Додамо обробники для редагування та видалення рослин
bot.hears('Видалити рослину', deletePlant);
bot.hears('Редагувати рослину', editPlant);

module.exports = bot;

