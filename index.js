const TelegramBot = require('node-telegram-bot-api');

// Telegram bot API tokenini o'zingiz bilan almashtiring
const token = '6410203976:AAF_Mfn13IoVhfS7SR-M0Zj65kcD1b9PA6g';
const bot = new TelegramBot(token, {polling: true});
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

bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const userFullName = msg.from.first_name + ' ' + msg.from.last_name;
  const phoneNumber = msg.contact.phone_number;

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
bot.onText(/Xodim/, (msg) => {
  const chatId = msg.chat.id;
  const userRole = msg.text.toLowerCase();

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
    bot.sendMessage(
      chatId,
      `Iltimos, Lavozimingiz kiriting (masalan: Muxandis dasturchi):`,
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    );

    bot.once('message', (msg) => {
      const userGroup = msg.text;
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
       if (msg.text) {
          // Fayl matn shaklida bo'lsa
          bot.sendMessage(chatId, `Rasm korinishda yuboring, iltimos.`);
        }
        else if (msg.photo) {
          // Fayl photo formatda bo'lsa
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
      
      
    });
  });
});

bot.onText(/O\'ituvchi/, (msg) => {
  const chatId = msg.chat.id;
  const userRole = msg.text.toLowerCase();

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
    bot.sendMessage(
      chatId,
      `Iltimos, Bo'limingizni kiriting (masalan: RTTM):`,
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    );

    bot.once('message', (msg) => {
      const userGroup = msg.text;
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
          // Fayl photo formatda bo'lsa
          bot.sendMessage(
            chatId,
            `Sizga login va parol yuboriladi`,
            {
              reply_markup: {
                remove_keyboard: true
              }
            }
          );
        } else if (msg.text) {
          // Fayl matn shaklida bo'lsa
          bot.sendMessage(chatId, `Rasm korinishda yuboring, iltimos.`);
        }
      });
      
      
    });
  });
});

bot.onText(/Talaba/, (msg) => {
  const chatId = msg.chat.id;
  const userRole = msg.text.toLowerCase();

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
    bot.sendMessage(
      chatId,
      `Iltimos, Guruxingizni kiriting (masalan: 103-BH):`,
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    );

    bot.once('message', (msg) => {
      const userGroup = msg.text;
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
          // Fayl photo formatda bo'lsa
          bot.sendMessage(
            chatId,
            `Sizga login va parol yuboriladi`,
            {
              reply_markup: {
                remove_keyboard: true
              }
            }
          );
        } else if (msg.text) {
          // Fayl matn shaklida bo'lsa
          bot.sendMessage(chatId, `Rasm korinishda yuboring, iltimos.`);
        }
      });
      
      
    });
  });
});

// "Loginni tiklash
bot.onText(/🔐 Login va parolni tiklash/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    'Iltimos, ism va familyangizni kiriting (masalan: Azizbek Avalov):',
    {
      reply_markup: {
        resize_keyboard: true
      }
    }
  );
  bot.once('message', (msg) => {
    const userGroup = msg.text;
    bot.sendMessage(
      chatId,
      `Tez orada login parol tiklab sizga habar yuboriladi`,
      {
        reply_markup: {
          remove_keyboard: true,
          resize_keyboard: true
        }
      }
    )
  });
});
