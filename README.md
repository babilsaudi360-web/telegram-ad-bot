# 🤖 بوت توليد الإعلانات - مجاني بالكامل مع Gemini AI

بوت تيليجرام يولد إعلانات سوشيال ميديا عربية تلقائياً — **مجاني 100%**

---

## 🚀 خطوات النشر على Railway (مجاني)

### 1. احصل على Telegram Bot Token
1. افتح تيليجرام → ابحث عن `@BotFather`
2. أرسل `/newbot` واتبع التعليمات
3. احفظ الـ **Token**

### 2. احصل على Gemini API Key (مجاني)
1. افتح [aistudio.google.com](https://aistudio.google.com)
2. اضغط **Get API Key** → **Create API key**
3. احفظ الـ **Key**

### 3. ارفع على GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/telegram-ad-bot.git
git push -u origin main
```

### 4. انشر على Railway
1. افتح [railway.app](https://railway.app) وسجل بـ GitHub
2. اضغط **New Project** → **Deploy from GitHub repo**
3. اختر الـ repository
4. اضغط **Variables** وأضف:
```
TELEGRAM_BOT_TOKEN = توكن البوت
GEMINI_API_KEY     = مفتاح Gemini
```
5. اضغط **Deploy** ✅

---

## 💬 طريقة الاستخدام

أرسل للبوت مثلاً:
```
اسم المكتب: مكتب بابل للخدمات العامة
الهاتف: 0559219918
النمط: ذهبي
الخدمات: معاملات حكومية، تأمين طبي، قوى عاملة، جوازات، ضمان اجتماعي
```

أو بشكل حر:
```
عايز إعلان لمكتب بابل بنمط داكن رقم 0559219918 خدمات التأمين والجوازات
```

---

## 🎨 الأنماط المتاحة

| الكلمة | الوصف |
|--------|-------|
| `فاتح` / `light` | خلفية بيضاء، ذهبي وكحلي |
| `داكن` / `dark` | خلفية كحلية، تفاصيل ذهبية |
| `ذهبي` / `gold` | خلفية سوداء، فاخر ذهبي |

---

## 💰 التكلفة

- **Gemini API**: مجاني تماماً (حد يومي سخي)
- **Railway**: مجاني (500 ساعة/شهر)
- **المجموع: $0** 🎉

---

## 🔧 متغيرات البيئة

| المتغير | المصدر |
|---------|--------|
| `TELEGRAM_BOT_TOKEN` | @BotFather في تيليجرام |
| `GEMINI_API_KEY` | aistudio.google.com |
