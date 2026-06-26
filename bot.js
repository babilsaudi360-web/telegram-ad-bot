const TelegramBot = require("node-telegram-bot-api");
const Groq = require("groq-sdk");
const puppeteer = require("puppeteer");
const fs = require("fs");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: {
    autoStart: true,
    params: { timeout: 10 }
  }
});

process.once('SIGINT', () => bot.stopPolling());
process.once('SIGTERM', () => bot.stopPolling());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ═══════════════════════════════════════════════
// Groq يولد HTML كامل
// ═══════════════════════════════════════════════
async function generateAdHTML(userMessage) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4000,
    messages: [
      {
        role: "system",
        content: `أنت مصمم جرافيك محترف متخصص في الإعلانات العربية لسوشيال ميديا.
مهمتك: توليد HTML كامل لإعلان احترافي.

القواعد الصارمة:
1. أرجع HTML فقط — بدون أي كلام قبله أو بعده، بدون backticks
2. العرض ثابت: width: 800px
3. الخط الإلزامي: @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap')
4. الاتجاه: dir="rtl" lang="ar" — RTL كامل
5. التصميم: احترافي فاخر يناسب السوشيال ميديا السعودية
6. استخرج من رسالة المستخدم: اسم المكتب، الهاتف، الخدمات، النمط
7. لو المستخدم وصف نمطاً — نفّذه بإبداع وتميز
8. لو ما وصف نمطاً — اختر تصميماً فاخراً مناسباً

عناصر الإعلان الإلزامية:
- اسم المكتب بارز في الأعلى
- قائمة الخدمات مع checkmarks جميلة
- رقم الهاتف واضح وكبير
- زر "تواصل معنا الآن" بألوان جذابة
- تذييل بالاسم والهاتف

أرجع HTML فقط، لا كلام آخر إطلاقاً.`
      },
      {
        role: "user",
        content: userMessage
      }
    ]
  });

  let html = completion.choices[0].message.content.trim();
  html = html.replace(/^```html\n?/i, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  return html;
}

// ═══════════════════════════════════════════════
// تحويل HTML إلى PNG
// ═══════════════════════════════════════════════
async function generateImage(html) {
  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
    headless: "new"
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 800, height: Math.max(bodyHeight, 400), deviceScaleFactor: 2 });

  const imgPath = `/tmp/ad_${Date.now()}.png`;
  await page.screenshot({ path: imgPath, fullPage: true });
  await browser.close();
  return imgPath;
}

// ═══════════════════════════════════════════════
// أوامر البوت
// ═══════════════════════════════════════════════
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`مرحباً! أنا بوت توليد الإعلانات 🎨✨

*أنماط لا نهائية — كل إعلان فريد!*

📌 *أمثلة:*

_بسيط:_
اسم المكتب: مكتب بابل
الهاتف: 0559219918
الخدمات: معاملات حكومية، تأمين، جوازات

_مع تحديد النمط:_
مكتب بابل - 0559219918
نمط: ذهبي فاخر على خلفية سوداء
الخدمات: معاملات حكومية، تأمين طبي، قوى عاملة

_إبداعي:_
مكتب بابل للخدمات العامة
نمط: أخضر زمردي مع تأثيرات مضيئة
هاتف: 0559219918
خدمات: جوازات، ضمان اجتماعي، رخص بلدي

💡 جرّب أنماطاً مختلفة في كل مرة!`,
    { parse_mode: "Markdown" }
  );
});

// ═══════════════════════════════════════════════
// المعالج الرئيسي
// ═══════════════════════════════════════════════
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;
  const chatId = msg.chat.id;

  const statusMsg = await bot.sendMessage(chatId, "⏳ جاري معالجة طلبك...");

  try {
    await bot.editMessageText("🧠 يتم تصميم إعلانك...", { chat_id: chatId, message_id: statusMsg.message_id });
    const html = await generateAdHTML(msg.text);

    await bot.editMessageText("📸 جاري تحويل التصميم لصورة...", { chat_id: chatId, message_id: statusMsg.message_id });
    const imgPath = await generateImage(html);

    await bot.deleteMessage(chatId, statusMsg.message_id);
    await bot.sendPhoto(chatId, fs.createReadStream(imgPath), {
      caption: `✅ إعلانك جاهز!\nأرسل طلباً جديداً لتصميم آخر 🎨`,
    });

    fs.unlinkSync(imgPath);

  } catch (err) {
    console.error("Error:", err.message);
    try {
      await bot.editMessageText("❌ حدث خطأ. حاول مرة أخرى.", { chat_id: chatId, message_id: statusMsg.message_id });
    } catch {
      await bot.sendMessage(chatId, "❌ حدث خطأ. حاول مرة أخرى.");
    }
  }
});

console.log("🤖 Ad Bot running with Groq AI — Unlimited Styles!");
