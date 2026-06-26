const TelegramBot = require("node-telegram-bot-api");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer");
const fs = require("fs");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: {
    autoStart: true,
    params: { timeout: 10 }
  }
});

// إيقاف أي instance قديم
process.once('SIGINT', () => bot.stopPolling());
process.once('SIGTERM', () => bot.stopPolling());

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

// ═══════════════════════════════════════════════
// Gemini يولد HTML كامل بناءً على وصف المستخدم
// ═══════════════════════════════════════════════
async function generateAdHTML(userMessage) {
  const prompt = `أنت مصمم جرافيك محترف متخصص في الإعلانات العربية. 
مهمتك: توليد HTML كامل لإعلان سوشيال ميديا عربي احترافي.

طلب المستخدم: "${userMessage}"

القواعد الصارمة:
1. أرجع HTML فقط — بدون أي كلام قبله أو بعده، بدون backticks
2. العرض ثابت: width: 800px
3. الخط الإلزامي: Cairo من Google Fonts
4. الاتجاه: RTL عربي كامل
5. التصميم: احترافي فاخر يناسب السوشيال ميديا السعودية
6. استخرج من رسالة المستخدم: اسم المكتب، الهاتف، الخدمات، النمط المطلوب
7. لو المستخدم وصف نمطاً معيناً (ذهبي، أخضر، نيون، رياضي، إلخ) — نفّذه بإبداع
8. لو ما وصف نمطاً — اختر تصميماً فاخراً مناسباً

عناصر الإعلان الإلزامية:
- اسم المكتب / الشركة بارز
- قائمة الخدمات مع أيقونات أو checkmarks
- رقم الهاتف واضح
- زر "تواصل معنا الآن"
- تذييل بالاسم والهاتف

أرجع HTML فقط الآن:`;

  const result = await geminiModel.generateContent(prompt);
  let html = result.response.text().trim();
  
  // تنظيف أي backticks
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
  await new Promise(r => setTimeout(r, 2000)); // انتظر الخطوط
  
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

الميزة الجديدة: *أنماط لا نهائية!*
Gemini يصمم لك إعلاناً فريداً بناءً على وصفك 🔥

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
خدمات: جوازات، ضمان اجتماعي، رخص بلدي، تأمين سيارات

💡 *كل إعلان فريد ومختلف!*`,
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
`*نصائح للحصول على أفضل تصميم:*

🎨 *وصف النمط:*
• ذهبي فاخر، أسود وذهبي
• أخضر زمردي، تأثيرات نيون
• كحلي رسمي، أبيض وأزرق
• أحمر وأسود، تصميم عصري
• بنفسجي مع تدرجات

📋 *البيانات المهمة:*
• اسم المكتب / الشركة
• رقم الهاتف
• قائمة الخدمات (كلما كانت أوضح كلما كان التصميم أفضل)

⚡ *الأوامر:*
/start - الصفحة الرئيسية
/help - المساعدة`,
    { parse_mode: "Markdown" }
  );
});

// ═══════════════════════════════════════════════
// المعالج الرئيسي للرسائل
// ═══════════════════════════════════════════════
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;
  const chatId = msg.chat.id;

  const statusMsg = await bot.sendMessage(chatId, "⏳ جاري معالجة طلبك...");

  try {
    // المرحلة 1: Gemini يولد HTML
    await bot.editMessageText(
      "🧠 Gemini يصمم إعلانك...",
      { chat_id: chatId, message_id: statusMsg.message_id }
    );
    const html = await generateAdHTML(msg.text);

    // المرحلة 2: تحويل HTML لصورة
    await bot.editMessageText(
      "📸 جاري تحويل التصميم لصورة...",
      { chat_id: chatId, message_id: statusMsg.message_id }
    );
    const imgPath = await generateImage(html);

    // المرحلة 3: إرسال الصورة
    await bot.deleteMessage(chatId, statusMsg.message_id);
    await bot.sendPhoto(chatId, fs.createReadStream(imgPath), {
      caption: `✅ إعلانك جاهز!\n\nأرسل طلباً جديداً لتصميم آخر 🎨\nجرّب نمطاً مختلفاً في كل مرة!`,
    });

    fs.unlinkSync(imgPath);

  } catch (err) {
    console.error("Error:", err.message);
    
    let errorMsg = "❌ حدث خطأ. حاول مرة أخرى.";
    if (err.message?.includes("GEMINI") || err.message?.includes("API")) {
      errorMsg = "❌ خطأ في Gemini API. تأكد من صحة الـ GEMINI_API_KEY.";
    } else if (err.message?.includes("puppeteer") || err.message?.includes("Browser")) {
      errorMsg = "❌ خطأ في توليد الصورة. حاول مرة أخرى.";
    }
    
    try {
      await bot.editMessageText(errorMsg, { chat_id: chatId, message_id: statusMsg.message_id });
    } catch {
      await bot.sendMessage(chatId, errorMsg);
    }
  }
});

console.log("🤖 Ad Bot running with Gemini AI — Unlimited Styles!");
