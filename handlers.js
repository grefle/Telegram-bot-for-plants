const Plant = require('./models/Plant');
const { Markup } = require('telegraf');

async function getMyPlants(ctx) {
    try {
        const userId = ctx.from.id;
        const plants = await Plant.find({ userId });

        for (const plant of plants) {
            const keyboard = [
                Markup.button.callback(`Видалити ${plant.name}`, `deletePlant_${plant._id.toString()}`),
                Markup.button.callback(`Редагувати ${plant.name}`, `editPlant_${plant._id.toString()}`)
            ];

            const message = `Рослина: ${plant.name}\nБіологічна назва: ${plant.scientificName}\nЧастота поливу: ${plant.wateringFrequency} днів`;

            await ctx.reply(message, Markup.inlineKeyboard([keyboard]));
        }
    } catch (error) {
        console.error('Помилка при отриманні рослин: ', error);
        ctx.reply('Сталася помилка при отриманні рослин.');
    }
}

async function getMyReminders(ctx) {
    try {
        const userId = ctx.from.id; // Отримуємо ID користувача

        // Отримуємо дані про рослини користувача з бази даних
        const plants = await Plant.find({ userId });

        const today = new Date();
        let remindersMessage = 'Графік поливань на найближчий тиждень:\n';

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const day = date.toLocaleDateString('uk-UA', { weekday: 'long' });
            const formattedDate = date.toLocaleDateString('uk-UA');

            // Для кожної рослини перевіряємо, чи потрібно поливати сьогодні
            for (const plant of plants) {
                const lastWateringDate = plant.lastWatering ? new Date(plant.lastWatering) : null;
                const wateringFrequency = plant.wateringFrequency;

                // Якщо дата останнього поливу ще не встановлена або це перший полив
                // то призначаємо наступну дату поливу на сьогодні
                let nextWateringDate = lastWateringDate ? new Date(lastWateringDate) : new Date();
                nextWateringDate.setDate(nextWateringDate.getDate() + wateringFrequency);

                // Якщо сьогодні день поливу, додаємо рослину до повідомлення
                if (date.toDateString() === nextWateringDate.toDateString()) {
                    remindersMessage += `${day} (${formattedDate}): Полив для рослини ${plant.name}\n`;
                }
            }
        }

        ctx.reply(remindersMessage);
    } catch (error) {
        console.error('Помилка при отриманні нагадувань: ', error);
        ctx.reply('Сталася помилка при отриманні нагадувань.');
    }
}

async function addPlant(ctx) {
    try {
        const userId = ctx.from.id; // Отримуємо ID користувача
        let plantInfo = ctx.message.text;

        // Перевіряємо, чи дані є вже розбиті
        if (!Array.isArray(plantInfo)) {
            // Якщо дані не розбиті, розбиваємо текст повідомлення
            plantInfo = plantInfo.split('\n');
        }

        const name = plantInfo[0] ? plantInfo[0].split(': ')[1].trim() : '';
        const scientificName = plantInfo[1] ? plantInfo[1].split(': ')[1].trim() : '';
        const wateringFrequency = plantInfo[2] ? parseInt(plantInfo[2].split(': ')[1].trim()) : 0;
        const growthConditions = plantInfo[3] ? plantInfo[3].split(': ')[1].trim() : '';
        const shortInfo = plantInfo[4] ? plantInfo[4].split(': ')[1].trim() : '';
        const plantImage = plantInfo[5] ? plantInfo[5].split(': ')[1].trim() : '';

        const plantData = {
            name,
            scientificName,
            wateringFrequency,
            growthConditions,
            shortInfo,
            plantImage,
            userId,
        };

        const newPlant = await Plant.create(plantData);
        ctx.reply(`Рослину ${newPlant.name} успішно додано.`);
    } catch (error) {
        console.error('Помилка при додаванні рослини: ', error);
        ctx.reply('Сталася помилка при додаванні рослини.');
    }
}

// Функція для видалення рослини
async function deletePlant(ctx) {
    try {
        // Отримайте _id рослини з callback-даних
        const plantIdToDelete = ctx.callbackQuery.data.split('_')[1];
        // Реалізуйте видалення рослини за _id
        const deletedPlant = await Plant.findByIdAndDelete(plantIdToDelete);

        if (deletedPlant) {
            ctx.answerCbQuery(`Рослину з ID ${plantIdToDelete} видалено.`);
        } else {
            ctx.answerCbQuery(`Не вдалося знайти рослину з ID ${plantIdToDelete}.`);
        }
    } catch (error) {
        console.error('Помилка при видаленні рослини: ', error);
        ctx.reply('Сталася помилка при видаленні рослини.');
    }
}

// Функція для редагування рослини
async function editPlant(ctx) {
    try {
        // Отримайте _id рослини з callback-даних
        const plantIdToEdit = ctx.callbackQuery.data.split('_')[1];
        // Питайте користувача ввести нові дані для редагування
        ctx.reply(
            'Введіть нові дані для редагування рослини в форматі:\n\n' +
            'Назва: ...\nБіологічна назва: ...\nЧастота поливань: ...\n' +
            'Умови росту: ...\nКоротка інформація: ...\nКартинка рослини: ...'
        );

        // Зберігайте _id рослини в контексті для подальшого використання
        ctx.session.editingPlantId = plantIdToEdit;
    } catch (error) {
        console.error('Помилка при редагуванні рослини: ', error);
        ctx.reply('Сталася помилка при редагуванні рослини.');
    }
}

function help(ctx) {
    const helpMessage = `Допомога:
  /start - Почати спілкування з ботом
  Мої рослини - Переглянути свої рослини
  Мої нагадування - Переглянути графік поливань на тиждень
  Додати рослину - Додати нову рослину до списку
  `;
    ctx.reply(helpMessage);
}

module.exports = {
  getMyPlants,
  getMyReminders,
  addPlant,
  help,
  deletePlant,
  editPlant
};
