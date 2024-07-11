const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Telegram bot API tokenini environment variables orqali oling
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Har bir foydalanuvchi uchun holatni saqlash
const userStates = {};

// Foydalanuvchi holatini o'zgartirish uchun yordamchi funksiya
const updateUserState = (chatId, state) => {
  if (!userStates[chatId]) {
    userStates[chatId] = {};
  }
  userStates[chatId] = { ...userStates[chatId], ...state };
};

bot.setMyCommands([
  {
    command: '/start',
    description: "Bot haqida ma'lumot",
  },
  {
    command: '/info',
    description: "O'zingiz haqingizda ma'lumot",
  },
]);

bot.on('message', async msg => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (text === '/info') {
    return bot.sendMessage(
      chatId,
      `Bu bot Samarqand Iqtisodiyot va Servis Institutining Raqamli Ta'lim Texnalogiyalari Markazi tamonidan ishlab chiqilgan bo'lib asosiy vazifasi masofadan turib institut xududidagi wi-fi tarmoqlaridan foydalanish uchun login parol olish va olingan login parolni tiklash uchun xizmat qiladi.

      Siz botni ishga tushirib kerakli ma'lumotlarni tanlashingiz va shaxsingizni tasdiqlash uchun pasport rasmini yuklashingiz kerak. Institut ishchi xodimlar tamonidan 24 soat ichida sizga login parol beriladi, login parolni institut xududidagi wi-fi tarmog'iga ulanishingiz va internet browser https://172.17.0.22:4080 terishingiz kerak chiqqan oynaga esa sizga taqdim etilgan login parolni joylashtirsangiz internetingiz ishlashni boshlaydi.`
    );
  }
});

// "/start" buyrug'iga javob berish
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userFullName = msg.from.first_name + ' ' + msg.from.last_name;

  bot.sendMessage(
    chatId,
    `Assalomu alaykum xurmatli ${userFullName}! Samarqand Iqtisodiyot va Servis Institutining RTTM bilan aloqa botiga xush kelibsiz.\n\n` +
    'Kantaktlaringizni yuborish uchun "📞 Telefon raqamni yuborish" tugmasini bosing.',
    {
      reply_markup: {
        keyboard: [['📞 Telefon raqamni yuborish']],
        request_contact: true,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    }
  );
});

// Foydalanuvchi kontaktini qabul qilish
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const userFullName = msg.from.first_name + ' ' + msg.from.last_name;
  const phoneNumber = msg.contact.phone_number;

  updateUserState(chatId, { phoneNumber });

  bot.sendMessage(chatId, `Assalomu alaykum xurmatli ${userFullName}!\nSizning telefon raqamingiz: ${phoneNumber}\nLogin parolni yuboring.`);
});

// "📞 Telefon raqamni yuborish" tugmasi uchun javob berish
bot.onText(/📞 Telefon raqamni yuborish/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    'Raqam qabul qilindi davom etish uchun quyidagilardan birini tanlang',
    {
      reply_markup: {
        keyboard: [['📝 Login va parol olish', '🔐 Login va parolni tiklash']],
        resize_keyboard: true,
        request_contact: true
      }
    }
  );
});

// "📝 Login va parol olish" tugmasi uchun javob berish
bot.onText(/📝 Login va parol olish/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    'Sizining mavqeyingizdagi qaysi tugmaga tog\'ri keladi',
    {
      reply_markup: {
        keyboard: [['Xodim', 'Talaba', 'O\'ituvchi']],
        resize_keyboard: true
      }
    }
  );
});

// "Xodim", "Talaba" yoki "O\'ituvchi" tanlanda javob berish
const handleRoleSelection = (role, msg) => {
  const chatId = msg.chat.id;

  updateUserState(chatId, { role });

  bot.sendMessage(
    chatId,
    `Iltimos, ism va familyangizni kiriting (masalan: Azizbek Avalov):`,
    {
      reply_markup: {
        remove_keyboard: true
      }
    }
  );

  bot.once('message', (msg) => {
    const userFullName = msg.text;
    updateUserState(chatId, { fullName: userFullName });

    let prompt;
    if (role === 'xodim') {
      prompt = 'Iltimos, Lavozimingizni kiriting (masalan: Muxandis dasturchi):';
    } else if (role === 'o\'ituvchi') {
      prompt = 'Iltimos, Bo\'limingizni kiriting (masalan: RTTM):';
    } else if (role === 'talaba') {
      prompt = 'Iltimos, Guruxingizni kiriting (masalan: 103-BH):';
    }

    bot.sendMessage(
      chatId,
      prompt,
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    );

    bot.once('message', (msg) => {
      const userGroup = msg.text;
      updateUserState(chatId, { group: userGroup });

      bot.sendMessage(
        chatId,
        `Pasport rasmingizni tashlang`,
        {
          reply_markup: {
            remove_keyboard: true
          }
        }
      );

      bot.once('message', (msg) => {
        if (msg.photo) {
          updateUserState(chatId, { passportPhoto: msg.photo });
          bot.sendMessage(
            chatId,
            `Sizga login va parol tez orada yuboriladi`,
            {
              reply_markup: {
                remove_keyboard: true
              }
            }
          );
        } else {
          bot.sendMessage(chatId, `Rasm korinishda yuboring, iltimos.`);
        }
      });
    });
  });
};

bot.onText(/Xodim/, (msg) => handleRoleSelection('xodim', msg));
bot.onText(/O\'ituvchi/, (msg) => handleRoleSelection('o\'ituvchi', msg));
bot.onText(/Talaba/, (msg) => handleRoleSelection('talaba', msg));

// "🔐 Login va parolni tiklash" tugmasi uchun javob berish
bot.onText(/🔐 Login va parolni tiklash/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    'Login parolni tiklash uchun pasport rasmini yuklang'
  );
});

// Pasport rasmini yuklaganda javob berish
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (msg.photo && userStates[chatId] && userStates[chatId].phoneNumber) {
    updateUserState(chatId, { passportPhoto: msg.photo });
    bot.sendMessage(
      chatId,
      `Sizga login va parol tez orada yuboriladi`,
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    );
  }
});
