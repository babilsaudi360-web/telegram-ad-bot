const TelegramBot = require("node-telegram-bot-api");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer");
const fs = require("fs");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

// ═══════════════════════════════════════════════
// HTML TEMPLATES
// ═══════════════════════════════════════════════

function templateLight(data) {
  const serviceItems = data.services.map((s, i) => {
    const full = (i === data.services.length - 1 && data.services.length % 2 !== 0) ? ' style="grid-column:1/-1"' : '';
    return `<div class="service-item"${full}><div class="check">✓</div>${s}</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:800px;min-height:900px;font-family:'Cairo',sans-serif;background:#fff;}
.header{background:#fff;padding:22px 32px 14px;display:flex;align-items:center;gap:14px;border-bottom:2px solid #e8d48b;}
.logo{width:52px;height:52px;background:#1a3a5c;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#d4a827;font-size:22px;font-weight:900;}
.brand{font-size:15px;font-weight:700;color:#1a3a5c;line-height:1.4;}
.hero{padding:26px 32px 18px;background:linear-gradient(135deg,#f8f4e8 0%,#fff 60%);}
.hero-title{font-size:36px;font-weight:900;color:#1a3a5c;line-height:1.25;margin-bottom:6px;}
.hero-title span{color:#d4a827;}
.hero-sub{font-size:16px;color:#555;font-weight:600;}
.divider{height:2px;background:linear-gradient(90deg,transparent,#d4a827,transparent);margin:4px 32px;}
.diamond{text-align:center;color:#d4a827;font-size:18px;margin:6px 0;}
.section{padding:14px 32px;}
.sec-title{font-size:19px;font-weight:800;color:#1a3a5c;margin-bottom:4px;}
.sec-sub{font-size:13px;color:#777;margin-bottom:14px;}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:6px;}
.card{border:1.5px solid #e8d48b;border-radius:10px;padding:13px;text-align:center;}
.card .icon{font-size:22px;margin-bottom:5px;}
.card .lbl{font-size:12px;color:#999;margin-bottom:3px;}
.card .val{font-size:14px;font-weight:700;color:#1a3a5c;}
.services-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.service-item{border:1.5px solid #e0e0e0;border-radius:8px;padding:9px 13px;display:flex;align-items:center;gap:10px;font-size:14px;color:#333;font-weight:600;}
.check{width:22px;height:22px;border-radius:50%;background:#d4a827;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:900;}
.cta{display:block;background:linear-gradient(135deg,#d4a827,#f0c940);color:#1a3a5c;text-align:center;padding:15px;border-radius:12px;font-size:19px;font-weight:900;margin:18px 32px 8px;}
.footer{background:#f5f5f5;padding:13px 32px;display:flex;align-items:center;justify-content:space-between;border-top:2px solid #e8d48b;}
.foot-brand{font-size:14px;font-weight:700;color:#1a3a5c;}
.foot-phone{font-size:14px;font-weight:700;color:#1a3a5c;}
</style></head><body>
<div class="header"><div class="logo">ب</div><div class="brand">${data.officeName}</div></div>
<div class="hero">
  <div class="hero-title">${data.headline1}<br><span>${data.headline2}</span><br>${data.headline3}</div>
  <div class="hero-sub">${data.tagline}</div>
</div>
<div class="divider"></div><div class="diamond">◆</div><div class="divider"></div>
<div class="section">
  <div class="sec-title">الخدمات:</div>
  <div class="sec-sub">${data.sectionSubtitle}</div>
  <div class="cards">
    <div class="card"><div class="icon">📋</div><div class="lbl">نوع الخدمة</div><div class="val">${data.serviceType}</div></div>
    <div class="card"><div class="icon">💼</div><div class="lbl">مجال العمل</div><div class="val">${data.workField}</div></div>
    <div class="card"><div class="icon">📞</div><div class="lbl">التواصل</div><div class="val">${data.phone}</div></div>
  </div>
</div>
<div class="divider"></div><div class="diamond">◆</div><div class="divider"></div>
<div class="section">
  <div class="sec-title">قائمة الخدمات:</div>
  <div style="height:10px"></div>
  <div class="services-grid">${serviceItems}</div>
</div>
<div class="cta">تواصل معنا الآن</div>
<div class="footer">
  <div class="foot-brand">${data.officeName}</div>
  <div class="foot-phone">📞 ${data.phone} | 📱 واتساب</div>
</div>
</body></html>`;
}

function templateDark(data) {
  const serviceItems = data.services.map((s, i) => {
    const full = (i === data.services.length - 1 && data.services.length % 2 !== 0) ? ' style="grid-column:1/-1"' : '';
    return `<div class="service-item"${full}><div class="check">✓</div>${s}</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:800px;min-height:900px;font-family:'Cairo',sans-serif;background:#0d1b2e;color:#fff;}
.header{padding:22px 32px 14px;display:flex;align-items:center;gap:14px;border-bottom:1px solid rgba(212,168,39,0.3);}
.logo{width:52px;height:52px;background:#d4a827;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#0d1b2e;font-size:22px;font-weight:900;}
.brand{font-size:15px;font-weight:700;color:#d4a827;line-height:1.4;}
.hero{padding:26px 32px 18px;}
.hero-title{font-size:36px;font-weight:900;color:#fff;line-height:1.25;margin-bottom:6px;}
.hero-title span{color:#d4a827;}
.hero-sub{font-size:16px;color:#aaa;font-weight:600;}
.divider{height:1px;background:linear-gradient(90deg,transparent,#d4a827,transparent);margin:4px 32px;}
.diamond{text-align:center;color:#d4a827;font-size:18px;margin:6px 0;}
.section{padding:14px 32px;}
.sec-title{font-size:19px;font-weight:800;color:#d4a827;margin-bottom:4px;}
.sec-sub{font-size:13px;color:#777;margin-bottom:14px;}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.card{background:#162032;border:1px solid rgba(212,168,39,0.25);border-radius:10px;padding:13px;text-align:center;}
.card .icon{font-size:22px;margin-bottom:5px;}
.card .lbl{font-size:12px;color:#888;margin-bottom:3px;}
.card .val{font-size:14px;font-weight:700;color:#fff;}
.services-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.service-item{background:#162032;border:1px solid rgba(212,168,39,0.2);border-radius:8px;padding:9px 13px;display:flex;align-items:center;gap:10px;font-size:14px;color:#ddd;font-weight:600;}
.check{width:22px;height:22px;border-radius:50%;border:2px solid #d4a827;color:#d4a827;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;font-weight:900;}
.cta{display:block;background:linear-gradient(135deg,#1a7fc4,#2196d4);color:#fff;text-align:center;padding:15px;border-radius:12px;font-size:19px;font-weight:900;margin:18px 32px 8px;}
.footer{background:#08111e;padding:13px 32px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(212,168,39,0.3);}
.foot-brand{font-size:14px;font-weight:700;color:#d4a827;}
.foot-phone{font-size:14px;font-weight:700;color:#fff;}
</style></head><body>
<div class="header"><div class="logo">ب</div><div class="brand">${data.officeName}</div></div>
<div class="hero">
  <div class="hero-title">${data.headline1}<br><span>${data.headline2}</span><br>${data.headline3}</div>
  <div class="hero-sub">${data.tagline}</div>
</div>
<div class="divider"></div><div class="diamond">◆</div><div class="divider"></div>
<div class="section">
  <div class="sec-title">الخدمات:</div>
  <div class="sec-sub">${data.sectionSubtitle}</div>
  <div class="cards">
    <div class="card"><div class="icon">📋</div><div class="lbl">نوع الخدمة</div><div class="val">${data.serviceType}</div></div>
    <div class="card"><div class="icon">💼</div><div class="lbl">مجال العمل</div><div class="val">${data.workField}</div></div>
    <div class="card"><div class="icon">📞</div><div class="lbl">التواصل</div><div class="val">${data.phone}</div></div>
  </div>
</div>
<div class="divider"></div><div class="diamond">◆</div><div class="divider"></div>
<div class="section">
  <div class="sec-title">قائمة الخدمات:</div>
  <div style="height:10px"></div>
  <div class="services-grid">${serviceItems}</div>
</div>
<div class="cta">تواصل معنا الآن</div>
<div class="footer">
  <div class="foot-brand">${data.officeName}</div>
  <div class="foot-phone">📞 ${data.phone} | 📱 واتساب</div>
</div>
</body></html>`;
}

function templateGold(data) {
  const serviceRows = data.services.map(s =>
    `<div class="row"><div class="chk">✓</div>${s}</div>`
  ).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{width:800px;min-height:900px;font-family:'Cairo',sans-serif;background:#080c18;color:#fff;}
.top-title{text-align:center;font-size:70px;font-weight:900;padding:28px 32px 4px;
  background:linear-gradient(180deg,#f5d060,#c8922a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.list{padding:16px 36px;}
.row{background:linear-gradient(90deg,#161b2e,#0f1320);border:1px solid rgba(212,168,39,0.35);
  border-radius:10px;padding:13px 18px;margin-bottom:9px;display:flex;align-items:center;gap:16px;
  font-size:16px;font-weight:600;color:#e8e8e8;}
.chk{width:30px;height:30px;flex-shrink:0;background:linear-gradient(135deg,#f0c940,#c8952a);
  border-radius:50%;display:flex;align-items:center;justify-content:center;
  color:#080c18;font-size:15px;font-weight:900;}
.footer{background:#06090f;padding:18px 36px;display:flex;align-items:center;
  justify-content:space-between;border-top:1px solid rgba(212,168,39,0.35);}
.phone-wrap{display:flex;align-items:center;gap:12px;}
.phone-icon{width:46px;height:46px;background:linear-gradient(135deg,#f0c940,#c8952a);
  border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;}
.phone-num{font-size:20px;font-weight:900;color:#fff;}
.phone-lbl{font-size:12px;color:#f0c940;font-weight:600;}
.brand-wrap{display:flex;align-items:center;gap:10px;}
.brand-icon{width:42px;height:42px;background:linear-gradient(135deg,#f0c940,#c8952a);
  border-radius:50%;display:flex;align-items:center;justify-content:center;color:#080c18;font-size:18px;font-weight:900;}
.brand-name{font-size:16px;font-weight:800;color:#f0c940;}
.brand-sub{font-size:11px;color:#888;}
</style></head><body>
<div class="top-title">خدماتنا</div>
<div class="list">${serviceRows}</div>
<div class="footer">
  <div class="phone-wrap">
    <div class="phone-icon">📞</div>
    <div><div class="phone-num">${data.phone}</div><div class="phone-lbl">اتصال وواتس</div></div>
  </div>
  <div class="brand-wrap">
    <div class="brand-icon">ب</div>
    <div><div class="brand-name">${data.officeName}</div><div class="brand-sub">للخدمات العامة</div></div>
  </div>
</div>
</body></html>`;
}

// ═══════════════════════════════════════════════
// AI: Parse user message → structured data (Gemini)
// ═══════════════════════════════════════════════
async function parseAdRequest(userMessage) {
  const prompt = `أنت مساعد لتوليد بيانات إعلانات. استخرج المعلومات من رسالة المستخدم وأرجع JSON فقط بدون أي نص آخر ولا backticks.

رسالة المستخدم: "${userMessage}"

أرجع JSON بهذا الشكل بالضبط:
{"template":"light","officeName":"اسم المكتب","headline1":"السطر الأول","headline2":"السطر الثاني","headline3":"السطر الثالث","tagline":"الشعار الفرعي","sectionSubtitle":"خدمات حكومية متكاملة لإنجاز معاملاتك بسهولة وأمان","serviceType":"خدمات حكومية","workField":"معاملات رسمية","phone":"0500000000","services":["خدمة 1","خدمة 2"]}

قواعد:
- إذا طلب المستخدم "ذهبي" أو "فاخر" أو "gold" → template: "gold"
- إذا طلب "داكن" أو "كحلي" أو "dark" → template: "dark"
- غير ذلك → template: "light"
- استخرج الخدمات كقائمة، كل خدمة كعنصر منفصل
- أرجع JSON فقط، لا كلام آخر إطلاقاً`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

// ═══════════════════════════════════════════════
// Generate PNG from HTML
// ═══════════════════════════════════════════════
async function generateImage(html) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    headless: "new"
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1500));
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 800, height: bodyHeight, deviceScaleFactor: 2 });
  const imgPath = `/tmp/ad_${Date.now()}.png`;
  await page.screenshot({ path: imgPath, fullPage: true });
  await browser.close();
  return imgPath;
}

// ═══════════════════════════════════════════════
// BOT COMMANDS
// ═══════════════════════════════════════════════
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`مرحباً! أنا بوت توليد الإعلانات 🎨

أرسل لي وصف الإعلان، مثلاً:

📌 *مثال:*
اسم المكتب: مكتب بابل للخدمات العامة
الهاتف: 0559219918
النمط: ذهبي
الخدمات: معاملات حكومية، تأمين طبي، قوى عاملة، جوازات، ضمان اجتماعي

📌 *أو بشكل حر:*
"عايز إعلان لمكتب بابل بنمط داكن رقم 0559219918 خدمات التأمين والجوازات"

🎨 *الأنماط:* فاتح | داكن | ذهبي`,
    { parse_mode: "Markdown" }
  );
});

// ═══════════════════════════════════════════════
// MAIN MESSAGE HANDLER
// ═══════════════════════════════════════════════
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;
  const chatId = msg.chat.id;

  const statusMsg = await bot.sendMessage(chatId, "⏳ جاري معالجة طلبك...");

  try {
    await bot.editMessageText("🧠 Gemini يفهم طلبك...", { chat_id: chatId, message_id: statusMsg.message_id });
    const data = await parseAdRequest(msg.text);

    await bot.editMessageText("🎨 جاري تصميم الإعلان...", { chat_id: chatId, message_id: statusMsg.message_id });
    let html;
    if (data.template === "gold") html = templateGold(data);
    else if (data.template === "dark") html = templateDark(data);
    else html = templateLight(data);

    await bot.editMessageText("📸 جاري تحويل التصميم لصورة...", { chat_id: chatId, message_id: statusMsg.message_id });
    const imgPath = await generateImage(html);

    await bot.deleteMessage(chatId, statusMsg.message_id);
    const templateName = data.template === "gold" ? "ذهبي ✨" : data.template === "dark" ? "داكن 🌙" : "فاتح ☀️";
    await bot.sendPhoto(chatId, fs.createReadStream(imgPath), {
      caption: `✅ *${data.officeName}*\nالنمط: ${templateName}\n\nأرسل طلباً جديداً لإعلان آخر 🎨`,
      parse_mode: "Markdown"
    });

    fs.unlinkSync(imgPath);
  } catch (err) {
    console.error(err);
    await bot.editMessageText(
      "❌ حدث خطأ. تأكد من وصف الطلب بوضوح وحاول مرة أخرى.",
      { chat_id: chatId, message_id: statusMsg.message_id }
    );
  }
});

console.log("🤖 Ad Bot running with Gemini AI...");
