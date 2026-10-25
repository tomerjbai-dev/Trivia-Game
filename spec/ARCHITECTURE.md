# ARCHITECTURE – חכמולוגים

> תאריך מחקר: 25 באוקטובר 2026  
> מסמך מקור: `PRD.md`  
> עיקרון מנחה: מערכת Web קטנה עם Backend מאובטח ל-AI, ללא Database וללא Authentication.

## 1. Technology Stack שנבחר

| רכיב | בחירה | תפקיד |
|---|---|---|
| Frontend | React + Next.js App Router + TypeScript | שלושה מסכים, אינטראקציות ו-RTL |
| עיצוב | CSS Modules + CSS רגיל | Responsive Mobile-first ללא תלות בספריית UI |
| Backend | Next.js Route Handler ב-Node.js runtime | API מאובטח ליצירת שאלות וסינון תוכן |
| אימות נתונים | Zod | בדיקת בקשות ותשובות בזמן ריצה |
| AI | OpenAI Responses API, מודל `gpt-6-luna` | יצירת שאלה אחת בעברית במבנה מוגדר |
| סינון תוכן | OpenAI Moderation API (`omni-moderation-latest`) + הנחיות בטיחות במודל | חסימת תוכן לא מתאים לפני ואחרי יצירה |
| PWA | Web App Manifest ואייקונים; Service Worker מינימלי רק אם נדרש להתקנה בדפדפני היעד | התקנה מהדפדפן, ללא תמיכת Offline |
| Hosting | Vercel | פריסת Frontend ו-Backend באותו פרויקט, HTTPS ו-Preview |
| ניהול גרסאות | Git + GitHub | מקור אמת לקוד ופריסה אוטומטית |
| בדיקות | Vitest + React Testing Library; Playwright לבדיקות זרימה | בדיקת התנהגות ומניעת רגרסיות |
| Database / Auth / Object Storage | **לא נדרשים** | אין חשבונות, שמירת התקדמות או תוכן דינמי מתמשך |

### החלטות ונימוקים

- **Next.js לעומת Vite+React או SvelteKit:** שלוש החלופות מתאימות ל-UI. נבחר Next.js בשל שילוב טבעי של React ו-API Routes באותו Repository, תיעוד PWA רשמי, אינטגרציה ישירה ל-Vercel וקהילת פיתוח גדולה. אין צורך ב-SSR דינמי; אפשר לרנדר את המסכים כ-Static UI, כאשר ה-API הוא Serverless.
- **Vercel לעומת Netlify או Cloudflare Workers:** שלושתן מספקות פריסה מ-Git; Vercel מפשטת במיוחד את פריסת Next.js עם Route Handlers ו-Preview deployments. GitHub Pages אינו מתאים לבדו משום שאסור לחשוף את מפתח OpenAI בדפדפן.
- **OpenAI לעומת Gemini API או Anthropic API:** שלושתן מסוגלות לייצר טריוויה. נבחר OpenAI בזכות Structured Outputs, Moderation API ייעודי ותיעוד TypeScript. המודל `gpt-6-luna` מיועד למשימות קצרות בעלות נמוכה יחסית; יש לוודא את זמינותו ואת התאמת Structured Outputs לחשבון בפועל לפני שימוש חי. מודל ה-AI מוגדר דרך משתנה סביבה כדי לאפשר החלפה ללא שינוי ב-UI.
- **CSS Modules לעומת Tailwind או ספריית רכיבים:** שלושה מסכים אינם מצדיקים שכבת עיצוב נוספת; CSS Modules נותן בידוד סגנונות ללא תלויות כבדות.
- **ללא Database:** שמירת היסטוריית השאלות בזיכרון הדפדפן במהלך השימוש הנוכחי בלבד; אין שמירת התקדמות מתמשכת. לכן Supabase, Migrations ופרויקטי Database נפרדים אינם רלוונטיים.
- **Zod:** גם Structured Outputs אינו תחליף לבדיקת קלט ופלט בשרת.

### סיכונים, עלויות ומגבלות

1. **תוכן לילדים:** Moderation מספק אותות בטיחות, אך אינו מסווג באופן מושלם התאמה לגיל 6–9. הנחיות ה-AI חייבות להגביל תוכן, והשרת יחסום פלט מסומן או סירוב. בהתאם ל-PRD לא מבוצע אימות עובדתי נוסף; לכן עדיין ייתכנו שאלות שגויות או מטעות.
2. **גישה אנונימית ללא מכסת שאלות:** כל בקשה עשויה לעלות כסף. אין להטיל מכסת שאלות מוצרית, אך יש להפעיל Rate Limiting הגנתי נגד שימוש אוטומטי חריג, מגבלות תקציב והתראות אצל ספק ה-AI. מנגנוני הגנה אלה אינם מכסה יומית לילד, והם עלולים להשפיע על שימוש חריג.
3. **Vercel Hobby:** מיועדת לשימוש אישי ולא מסחרי בלבד; מוצר מסחרי מחייב תוכנית מתאימה. עלויות ותקרות שימוש עשויות להשתנות.
4. **Vercel Functions:** Serverless מתאים לבקשת AI קצרה. יש להגדיר timeout קצר וסביר (למשל 25 שניות לקריאת AI), ולהחזיר שגיאה ידידותית במקרה של timeout; אין צורך ב-Background Jobs.
5. **PWA Online-only:** התקנה אינה הופכת את האפליקציה לזמינה Offline. בעת ניתוק יש להציג הודעה מתאימה כאשר המסך עדיין פתוח; פתיחה חדשה ללא רשת עשויה להציג את שגיאת הדפדפן. אין ליצור Cache שמאפשר לשחק ללא רשת.
6. **מחירי OpenAI:** תמחור תלוי במספר Tokens ובמודל. לפי מחירון OpenAI שנבדק, `gpt-6-luna` מוצג בכ-$0.10 למיליון Input Tokens וכ-$0.50 למיליון Output Tokens בתמחור Standard קצר-הקשר; לדוגמה, 1,000 שאלות עם 500 Input ו-200 Output Tokens לבקשה יעלו בערך $0.15 עבור Tokens בלבד, לפני חריגות, ניסיונות חוזרים או תמחור אחר. זו המחשה ולא התחייבות למחיר או לכמות Tokens. Moderation API מפורסם כחינמי למשתמשי OpenAI API.

## 2. ארכיטקטורת המערכת

### 2.1 מבנה ורכיבים

```text
דפדפן / PWA (עברית, RTL)
  ├─ בית: שם, תמונה, "בואו נשחק!"
  ├─ טריוויה: נושא, טעינה, שאלה, בחירה, משוב
  └─ אודות: הסבר לילדים
           │ HTTPS POST /api/questions
           ▼
Next.js Route Handler על Vercel (Node.js)
  ├─ אימות בקשה וגבולות קלט
  ├─ סינון נושא באמצעות Moderation
  ├─ יצירת שאלה ב-OpenAI Responses API
  ├─ סינון תוכן הפלט
  └─ אימות מבנה השאלה והחזרת JSON
           │
           ▼
       OpenAI API
```

אין תקשורת ישירה בין הדפדפן ל-OpenAI; אין Database, Session Server או Object Storage.

### 2.2 חלוקה ל-Modules

- **App Shell / Navigation:** מבנה משותף, סרגל תחתון קבוע, כיווניות RTL, ניהול מעבר בין שלושת המסכים.
- **Home:** הצגת שם, תמונה סטטית וכפתור מעבר לטריוויה.
- **Trivia UI:** שדה נושא, כפתור יצירה, תצוגת שאלה ותשובות, נעילת תשובות לאחר בחירה, משוב ויצירה נוספת.
- **Trivia Session (Client memory):** נושא שהוקלד, נושא השאלה המוצגת, שאלה נוכחית, בחירה ותוצאתה, ורשימת שאלות שכבר הוצגו במהלך השימוש הנוכחי. אין שימוש ב-`localStorage` לשמירת התקדמות.
- **About:** הסבר סטטי לילדים.
- **Question API:** בדיקת קלט, קריאות AI, סינון, בדיקת מבנה ומיפוי שגיאות.
- **AI Adapter:** הגדרות מודל, Prompt בעברית, Schema מובנה וקריאות OpenAI; מופרד מלוגיקת ה-HTTP.
- **PWA Assets:** Manifest, אייקונים ותמונה סטטית מקומית למסך הבית.

### 2.3 Data Model ומצב אפליקציה

אין ישויות הנשמרות במסד נתונים. המבנים הבאים חיים בזיכרון בלבד:

| מבנה | שדות מרכזיים | מיקום |
|---|---|---|
| `TriviaQuestion` | `id` (מקומי), `topic`, `question`, `options` (ארבע מחרוזות), `correctIndex` (0–3) | תגובת שרת / זיכרון Client |
| `TriviaSession` | `draftTopic`, `activeTopic`, `currentQuestion`, `selectedIndex` או `null`, `seenQuestions` (מחרוזות/מזהים בזיכרון), `status`, `errorCode` | React State |

- `seenQuestions` משמש להעברת דוגמאות מוגבלות של שאלות קודמות לשרת, כדי **לנסות** להימנע מחזרות. יש לשלוח לכל היותר 10 נוסחי שאלות אחרונות, באורך מוגבל; אין הבטחה למניעת כפילויות מלאה.
- `id` נוצר מקומית להצגה ולניהול React State; אינו מזהה משתמש.
- תשובה נכונה מוחזרת ל-Client כחלק מהשאלה כדי לאפשר משוב מקומי מיידי; זה משחק לימודי, לא בחינה מאובטחת.
- מעבר מסך אינו חייב למחוק מצב כל עוד האפליקציה פתוחה. רענון או סגירה יכולים לאפס את מצב המשחק; אין התחייבות לשחזור.

### 2.4 API פנימי

**`POST /api/questions`** (ללא Authentication)

בקשת JSON:

```json
{
  "topic": "דינוזאורים",
  "recentQuestions": ["איזה דינוזאור היה בעל שלוש קרניים?"]
}
```

תשובת הצלחה `200`:

```json
{
  "question": "מה אכלו רוב הטריצרטופסים?",
  "options": ["צמחים", "דגים", "חרקים", "בשר בלבד"],
  "correctIndex": 0,
  "topic": "דינוזאורים"
}
```

שגיאות צפויות:

| HTTP | `code` | התנהגות UI |
|---|---|---|
| 400 | `INVALID_TOPIC` | בקשה להקליד נושא תקין |
| 422 | `UNSAFE_TOPIC` | בקשה ידידותית לבחור נושא אחר |
| 502 | `GENERATION_FAILED` | הודעה ידידותית ו-"נסו שוב" |
| 503 | `SERVICE_UNAVAILABLE` | הודעה ידידותית ו-"נסו שוב" |
| 504 | `GENERATION_TIMEOUT` | הודעה ידידותית ו-"נסו שוב" |
| 429 | `TEMPORARILY_BUSY` | הודעה ידידותית על עומס ואפשרות לנסות שוב מאוחר יותר |

כל הודעות ה-UI בעברית; `code` הוא מזהה פנימי. אין להציג הודעות SDK או פרטי ספק לילד.

**בדיקת בקשה:** `Content-Type: application/json`, גוף בקשה קטן (למשל עד 8KB), נושא שאינו ריק לאחר Trim, עד 100 תווים, עד 10 שאלות קודמות שכל אחת עד 200 תווים. הנתונים מהדפדפן נחשבים בלתי מהימנים; אין להכניסם כהוראות מערכת.

**בדיקת תשובת AI:** באמצעות Structured Outputs ו-Zod: אובייקט יחיד עם `question` לא ריק, `options` מערך של ארבע מחרוזות לא ריקות וייחודיות, ו-`correctIndex` שלם בטווח 0–3. לא מתבצע אימות עובדתי או דירוג איכות נוסף. אם המבנה שגוי, יש להחזיר `GENERATION_FAILED` עם אפשרות לניסיון ידני חוזר; אין צורך במנגנון תיקון רב-שלבי.

### 2.5 Data Flow

1. הילד מזין נושא ולוחץ על כפתור יצירת שאלה. שינוי שדה הנושא בלבד אינו שולח בקשה ואינו מחליף שאלה.
2. ה-Client מציג אנימציית טעינה קטנה וטקסט **"מכינים לך שאלה מעניינת..."**, ומונע שליחה כפולה במהלך בקשה פעילה.
3. ה-Client שולח `topic` ואת השאלות האחרונות בזיכרון ל-`POST /api/questions`.
4. השרת מאמת קלט ומבצע Moderation לנושא. נושא מסומן/לא מתאים נחסם, ללא יצירת שאלה.
5. השרת שולח ל-OpenAI הנחיות יצירת שאלה אחת בעברית לגילאי 6–9, ללא תוכן מפחיד/מיני/אלים או מסוכן, עם ארבע אפשרויות ותשובה נכונה אחת; השאלות הקודמות משמשות להימנעות מחזרות ככל האפשר.
6. השרת בודק את תוכן הפלט ב-Moderation, מאמת Schema ומחזיר שאלה אחת. אם הסינון נכשל או אינו זמין, אין להציג את הפלט.
7. ה-Client מציג את השאלה ומאפשר בחירה אחת בלבד. בחירה נכונה מסומנת בירוק עם הודעה מעודדת; שגויה באדום, עם הדגשת התשובה הנכונה. התשובות ננעלות.
8. לחיצה נוספת על יצירת שאלה יוצרת בקשה חדשה לפי הערך הנוכחי של תיבת הנושא. השאלה הישנה מוחלפת רק כשהבקשה החדשה הצליחה; במקרה כשל הנושא נשמר והמשתמש יכול לנסות שוב.

### 2.6 אבטחה ופרטיות

- **אין Authentication או Authorization של משתמשים**, בהתאם ל-PRD. ה-API ציבורי; לכן נדרשת הגנה בסיסית מפני ניצול ולא ניתן להבטיח מניעת שימוש לרעה ללא זהות משתמש.
- `OPENAI_API_KEY` נשמר **בצד השרת בלבד** במשתני סביבה של Vercel; לעולם לא בשם `NEXT_PUBLIC_*`, בקוד מקור או ב-GitHub. בסביבת פיתוח הוא נמצא בקובץ `.env.local` שאינו נכלל ב-Git.
- יש להשתמש ב-HTTPS, להימנע מ-CORS פתוח שלא לצורך, להגביל גודל בקשות, ולהחיל הגנת קצב בסיסית ב-Hosting/WAF אם זמינה. לא להסתמך על בדיקת `Origin` כהגנת שימוש יחידה.
- אין לשמור פרטים אישיים, היסטוריית נושאים או תוכן שאלות ב-Database או ב-Analytics. יש לצמצם לוגים כך שלא יכילו את הנושאים שהקלידו ילדים או את תשובות ה-AI; לוגים תפעוליים יתמקדו בקודי שגיאה, זמן תגובה ושימוש מצטבר.
- קריאות OpenAI יישלחו עם `store: false` כאשר האפשרות נתמכת. הדבר אינו מבטל בהכרח לוגי Abuse Monitoring של הספק; יש לבדוק את מדיניות שמירת הנתונים ואת תנאי השימוש לפני השקה לילדים.
- Prompt Injection: יש להתייחס לנושא כנתון בלבד, לא כהוראות; הנחיות הבטיחות וה-Schema מוגדרים בצד השרת. Moderation אינו מבטיח חסימה מושלמת.
- מפתחות וסודות שונים ל-Development ול-Production, עם תקציב ומעקב נפרדים ככל שהחשבון מאפשר.

### 2.7 PWA, נגישות והתאמה למכשירים

- `manifest` עם `name: "חכמולוגים"`, `short_name: "חכמולוגים"`, `lang: "he"`, `dir: "rtl"`, `display: "standalone"`, `start_url: "/"`, צבעי Theme ואייקונים תקינים בגודלי 192 ו-512 פיקסלים (כולל Maskable לפי הצורך).
- מסכי האפליקציה יוגדרו `lang="he" dir="rtl"`; תמיכה במקלדת, Focus גלוי, Labels לשדות, כפתורי מגע גדולים והודעות משוב עם טקסט ואייקון נוסף על צבע.
- תמונת מסך הבית היא Asset סטטי; אין צורך באחסון קבצים חיצוני.
- אין Offline Cache של שאלות, ואין דרישה לפעילות Offline. אם Service Worker נחוץ לדרישות התקנה בפלטפורמות יעד, עליו להיות מינימלי ולא להציע חוויית Offline; יש להימנע מהחזרת תוכן מיושן בעת ניתוק.
- התקנה מתבצעת דרך הדפדפן בלבד, ללא כפתור התקנה ייעודי באפליקציה. זמינות פקודת ההתקנה תלויה בדפדפן ובמערכת ההפעלה.

### 2.8 GitHub, סביבות ו-Deployment

- **Repository אחד ב-GitHub**, עם ענף `main` כענף Production וענפי Feature / Pull Requests לשינויים. `package-lock.json` יישמר לנעילת תלויות. סודות וקובצי `.env*` מקומיים מוחרגים מ-Git, למעט `.env.example` ללא ערכים סודיים.
- **Vercel Project אחד** המחובר ל-GitHub: כל Push ל-Feature Branch או Pull Request יוצר Preview Deployment; Merge ל-`main` יוצר Production Deployment אוטומטי.
- הגדרת Vercel Environment Variables נפרדת עבור Preview ו-Production: `OPENAI_API_KEY`, `OPENAI_MODEL` (ערך התחלתי `gpt-6-luna`) וכל הגדרת ספק/אבטחה נדרשת. אפשר להשתמש בפרויקטי OpenAI נפרדים לפיתוח ולייצור לצורך בידוד שימוש ועלויות.
- סביבת פיתוח מקומית (`npm run dev`) משתמשת רק במפתח Development מתוך `.env.local`. אין להעתיק מפתח Production למחשב המקומי. Preview משתמש במפתח Development, ו-Production במפתח Production.
- לפני Merge יש להריץ TypeScript typecheck, lint, unit tests ו-build. בדיקות E2E בסיסיות ב-Preview מאמתות את שלושת המסכים ואת זרימת השאלה; בדיקות AI אוטומטיות משתמשות ב-Mock כדי לא לצרוך כסף או לייצר תוכן בלתי יציב בכל Build.
- פריסה אוטומטית לא דורשת הפעלת פקודת Deploy ידנית. במקרה תקלה ניתן לבצע Rollback ב-Vercel.
- אין Database ולכן אין Migrations, אין Supabase ואין צורך בשני פרויקטי Supabase.

### 2.9 החלטות תפעוליות נוספות

- להציב Timeout מוגבל לקריאות OpenAI ולהחזיר קוד שגיאה עקבי; לא לבצע ניסיונות חוזרים אוטומטיים מרובים שיוצרים חיובים בלתי צפויים.
- להגדיר Budget Alerts ו-Limits אצל ספק AI ו-Hosting, ולבחון מדדי שגיאה וזמני תגובה ללא שמירת תוכן ילדים.
- לא להוסיף Queue, Redis, Cron, Storage או Microservices לגרסה זו.
- ה-API יחזיר `Cache-Control: no-store` לתשובות שאלות כדי שלא ליצור מאגר מתמשך דרך HTTP Caching.

## 3. מקורות ותיעוד רשמי

המקורות נבדקו ב-25.10.2026. יש לבדוק מחירים, זמינות מודלים ומגבלות שירות שוב לפני פריסה חיה.

1. Next.js – [Progressive Web Apps](https://nextjs.org/docs/app/guides/progressive-web-apps)
2. Vercel – [Git deployments](https://vercel.com/docs/git) ו-[Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)
3. Vercel – [Functions limits](https://vercel.com/docs/functions/limitations) ו-[Function duration](https://vercel.com/docs/functions/configuring-functions/duration)
4. Vercel – [Hobby plan](https://vercel.com/docs/plans/hobby) ו-[Commercial fair use](https://vercel.com/docs/limits/fair-use-guidelines)
5. OpenAI – [Model catalog](https://developers.openai.com/api/docs/models) ו-[API pricing](https://developers.openai.com/api/docs/pricing)
6. OpenAI – [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
7. OpenAI – [Moderation](https://developers.openai.com/api/docs/guides/moderation) ו-[Moderation pricing FAQ](https://help.openai.com/en/articles/4936833-is-the-moderation-endpoint-free-to-use)
8. OpenAI – [Data controls](https://developers.openai.com/api/docs/guides/your-data)
9. Cloudflare – [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) (חלופת Hosting שנבחנה)

