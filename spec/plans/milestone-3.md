# תוכנית – Milestone 3: סינון תוכן וטיפול במצבי קצה

> מקורות: `MILESTONES.md` (Milestone 3), `PRD.md` (FR-03, FR-05, Edge Cases), `ARCHITECTURE.md` (1 – סיכונים 1, 4; 2.4–2.6, 2.9), `DESIGN.md` (1.2 – טבלת המצבים, 1.4 – נוסחים, 2.3 – Secondary Button).
> מצב בתחילת העבודה: Milestones 1–2 אושרו (✅). קיימים `POST /api/questions` (Zod בסיסי, יצירה, ערבוב, מיפוי חלקי של שגיאות SDK), AI Adapter, `TriviaSessionProvider`, ו-`ErrorCard` עם הודעה כללית אחת וללא "נסו שוב".

## 1. גבולות ה-Milestone

**בתוך Milestone 3:**
- Moderation לנושא (במקביל ליצירה) ולפלט שנוצר, לפני ההחזרה לדפדפן. כשל או אי-זמינות של הסינון ⇐ התוכן לא מוצג.
- בדיקות קלט ופלט מחמירות בשרת (Content-Type, גודל גוף 8KB, ייחודיות תשובות, תשובות לא ריקות אחרי Trim).
- Timeout בשרת (30 שניות ליצירה) ובדפדפן (40 שניות), בלי ניסיונות חוזרים אוטומטיים (גם לא של ה-SDK).
- מיפוי כל קודי השגיאה להודעות מטבלת הנוסחים, כפתור **"נסו שוב"**, זיהוי "אין אינטרנט".
- לוגים מצומצמים (קוד שגיאה וזמן בלבד).

**לא בתוך Milestone 3:** רשימת נושאים חסומים, סיווג גיל, Rate Limiting, תקרת תקציב (החלטות המשתמש); גימור עיצוב ו-PWA (Milestone 4).

## 2. התנהגות לפי מצב (מתוך DESIGN 1.2 ו-1.4)

| קוד | הודעה (נוסח מחייב) | כפתור "נסו שוב" |
|---|---|---|
| `UNSAFE_TOPIC` | בואו נבחר נושא אחר 🙂 את הנושא הזה לא נוכל לשאול עליו. | לא (*) |
| `INVALID_TOPIC` | כתבו נושא כדי שנוכל להכין שאלה. | לא (*) |
| `GENERATION_FAILED`, `SERVICE_UNAVAILABLE` | אופס! לא הצלחנו להכין שאלה הפעם. | כן |
| `GENERATION_TIMEOUT`, `CLIENT_TIMEOUT` | השאלה התעכבה קצת יותר מדי. | כן |
| `TEMPORARILY_BUSY` | יש עכשיו הרבה שאלות בדרך. נחכה רגע? | כן |
| `NETWORK_ERROR` | נראה שאין חיבור לאינטרנט. בדקו את החיבור. | כן |

(*) לפי DESIGN, "נסו שוב" מופיע רק במצבי **תקלה**, ו"נסו שוב" שולח בדיוק את אותו נושא — בנושא שנחסם או ריק זה לא יעזור. במקום זאת הילד משנה נושא ולוחץ "שאלה חדשה" (שנשאר פעיל, כמו בטבלת המצבים).

בכל המצבים: הנושא נשאר בתיבה, השאלה הקודמת (אם הייתה) נשארת מוצגת במצב שבו הייתה, וכרטיס ההודעה מופיע מתחתיה.

## 3. קבצים חדשים ושינויים

### 3.1 משותף (שרת ו-Client)

- `src/lib/questions/schema.ts`:
  - `MAX_BODY_BYTES = 8 * 1024`.
  - `ValidQuestionSchema` — הרחבה של `GeneratedQuestionSchema` לבדיקה בשרת בלבד: `question` ו-4 ה-`options` לא ריקים אחרי Trim, ו-`options` ייחודיות (השוואה אחרי Trim). `GeneratedQuestionSchema` עצמו נשאר פשוט, כי הוא נשלח ל-OpenAI כ-Structured Output.
  - `ERROR_CODES` — מערך של כל הקודים, כדי שה-Client יזהה קוד לא מוכר.
  - `QuestionResponseSchema` — לאימות קל של תשובת 200 בדפדפן.
- `src/lib/questions/errorMessages.ts` (חדש): מפה מ-`ErrorCode` לנוסח מהטבלה, ופונקציה `canRetry(code)` לפי סעיף 2.

### 3.2 שרת

- `src/server/ai/openaiClient.ts` (חדש): יצירת לקוח OpenAI במקום אחד, עם `maxRetries: 0` (בלי ניסיונות חוזרים שגורמים לחיובים) ובדיקת `OPENAI_API_KEY` (`MissingApiKeyError` עובר לכאן).
- `src/server/ai/questionGenerator.ts`: שימוש בלקוח המשותף, `timeout: 30_000` לקריאת היצירה. סירוב של המודל (refusal) או פלט ריק ⇐ `GenerationError` (קיים).
- `src/server/ai/moderation.ts` (חדש): `isFlagged(text: string): Promise<boolean>` — קריאה ל-`omni-moderation-latest` עם `timeout: 5_000`. מחזיר `true` אם אחת התוצאות `flagged`. כל שגיאה נזרקת הלאה (לא "מעבירים בשקט").
  - ה-Timeout הקצר נבחר כדי שכל הבקשה תסתיים לפני ה-40 שניות של הדפדפן: יצירה (עד 30) במקביל לבדיקת נושא, ואז בדיקת פלט (עד 5) ⇐ עד כ-35 שניות.
- `src/app/api/questions/route.ts` — סדר העבודה:
  1. `Content-Type` שאינו `application/json` ⇐ `400 INVALID_TOPIC`.
  2. קריאת הגוף כטקסט; מעל `MAX_BODY_BYTES` (גם לפי `Content-Length` אם קיים) ⇐ `400 INVALID_TOPIC`. JSON שבור / Zod נכשל ⇐ `400 INVALID_TOPIC`.
  3. `Promise.allSettled` של `isFlagged(topic)` ו-`generateQuestion(...)` במקביל.
  4. נושא מסומן ⇐ `422 UNSAFE_TOPIC` (השאלה שנוצרה נזרקת). בדיקת הנושא נכשלה ⇐ קוד לפי מיפוי השגיאות, ושום תוכן לא מוחזר.
  5. היצירה נכשלה ⇐ קוד לפי מיפוי השגיאות.
  6. `ValidQuestionSchema` נכשל ⇐ `502 GENERATION_FAILED`.
  7. `isFlagged` על השאלה וארבע התשובות יחד (טקסט אחד). מסומן ⇐ `502 GENERATION_FAILED` (הילד רואה "אופס..." עם "נסו שוב"); הבדיקה נכשלה ⇐ קוד לפי מיפוי השגיאות.
  8. ערבוב והחזרה, `Cache-Control: no-store` בכל תשובה (גם שגיאות, כמו היום).
- מיפוי שגיאות (`mapAiError`) — הרחבה:
  - `APIConnectionTimeoutError` ⇐ `504 GENERATION_TIMEOUT` (חייב להיבדק **לפני** `APIConnectionError`, כי הוא יורש ממנו).
  - `RateLimitError` ⇐ `429 TEMPORARILY_BUSY`.
  - `MissingApiKeyError`, `APIConnectionError`, `InternalServerError` ⇐ `503 SERVICE_UNAVAILABLE`.
  - כל השאר ⇐ `502 GENERATION_FAILED`.
- לוגים: שורה אחת לכל שגיאה בפורמט `[questions] <CODE> <stage> (<ms>ms)` כאשר `stage` הוא `input` / `topic-moderation` / `generation` / `output-moderation` / `validation`. לעולם לא הנושא, השאלה או הודעת ה-SDK.
- אין כותרות CORS (ברירת המחדל: אותו Origin בלבד). המפתח נקרא רק ב-`openaiClient.ts`.

### 3.3 Client

- `src/lib/questions/fetchQuestion.ts`:
  - לפני השליחה: `navigator.onLine === false` ⇐ `NETWORK_ERROR` מיד.
  - `signal: AbortSignal.timeout(40_000)`; `TimeoutError` ⇐ `CLIENT_TIMEOUT`; כל כשל `fetch` אחר ⇐ `NETWORK_ERROR`.
  - תשובה שאינה 200: קוד מתוך הגוף רק אם הוא ב-`ERROR_CODES`; אחרת לפי סטטוס (`429` ⇐ `TEMPORARILY_BUSY`, `504` ⇐ `GENERATION_TIMEOUT`, `503` ⇐ `SERVICE_UNAVAILABLE`, כל השאר ⇐ `GENERATION_FAILED`). זה מכסה דף שגיאה של Vercel שאינו JSON.
  - תשובת 200 שלא עוברת `QuestionResponseSchema` ⇐ `GENERATION_FAILED`.
- `src/state/TriviaSessionContext.tsx`:
  - שדה חדש `lastRequestTopic` — הנושא של הבקשה האחרונה שנשלחה.
  - פעולה חדשה `retry()` — שולחת שוב את `lastRequestTopic` (גם אם בינתיים נערכה התיבה), עם אותה הגנה מפני בקשה כפולה (`loadingRef`). `requestQuestion` ו-`retry` חולקים פונקציה פנימית אחת.
- `src/components/trivia/ErrorCard.tsx`: מקבל `code` ו-`onRetry`; מציג את הנוסח מ-`errorMessages.ts` ואייקון. כפתור **"נסו שוב"** (Secondary Button) מוצג רק כש-`canRetry(code)`.
  - עבור `UNSAFE_TOPIC` / `INVALID_TOPIC` הכרטיס ידידותי יותר (רקע `Secondary` צהוב בהיר ואייקון סימן שאלה במקום ✗ אדום), כי זה לא "טעות" של הילד.
- `src/components/Button.module.css`: הוספת `.secondary` לפי DESIGN 2.3 (מילוי `Secondary`, טקסט כהה, פינות 16px, גובה מגע 48px לפחות, מצב מושבת ו-Focus גלוי).
- `src/app/trivia/page.tsx`: העברת `errorCode` ו-`retry` ל-`ErrorCard`. כל שאר ההתנהגות (נעילה בזמן טעינה, כפתור מושבת בזמן טעינה) קיימת.

### 3.4 ARCHITECTURE.md

הוספת ADR-4: "Timeout לסינון ובלי ניסיונות חוזרים של ה-SDK" — `maxRetries: 0`, Timeout של 5 שניות ל-Moderation כדי שכל הבקשה תסתיים לפני ה-Timeout של הדפדפן, ופלט שסומן ממופה ל-`GENERATION_FAILED`.

## 4. בדיקות אוטומטיות (Vitest, Mock בלבד)

**`route.test.ts`** (Mock ל-`generateQuestion` ול-`isFlagged`):
- נושא מסומן ⇐ `422 UNSAFE_TOPIC`, גם כשהיצירה הצליחה; שתי הקריאות התחילו במקביל.
- פלט מסומן ⇐ `502 GENERATION_FAILED`.
- בדיקת סינון (נושא או פלט) נכשלה ⇐ שום שאלה לא מוחזרת; קוד לפי המיפוי.
- תשובות כפולות / תשובה ריקה אחרי Trim / `correctIndex` מחוץ לטווח ⇐ `502 GENERATION_FAILED`.
- Content-Type שגוי, גוף מעל 8KB, יותר מ-10 שאלות קודמות, נושא מעל 100 תווים ⇐ `400 INVALID_TOPIC`, בלי קריאה ל-AI.
- `APIConnectionTimeoutError` ⇐ `504`; `APIConnectionError` ⇐ `503`; `RateLimitError` ⇐ `429`.
- גוף השגיאה הוא `{ code }` בלבד (בלי הודעת SDK); `Cache-Control: no-store` בכל התשובות; ה-Log לא מכיל את הנושא.

**`moderation.test.ts`** (חדש, Mock ל-SDK): מודל `omni-moderation-latest`, `flagged` true/false, שגיאה נזרקת הלאה.

**`questionGenerator.test.ts`**: `maxRetries: 0`, `timeout: 30_000`.

**`fetchQuestion.test.ts`** (חדש, Mock ל-`fetch`): offline, `TypeError`, `TimeoutError`, קוד לא מוכר, תשובה שאינה JSON עם 504/429, תשובת 200 פגומה.

**`TriviaPage.test.tsx`**:
- כל קוד שגיאה מציג את הנוסח הנכון; "נסו שוב" מופיע רק בקודים הנכונים.
- "נסו שוב" שולח את אותו נושא גם אחרי עריכת התיבה, ומציג את השאלה החדשה.
- בזמן טעינה: לחיצות כפולות על "שאלה חדשה"/"נסו שוב"/Enter שולחות בקשה אחת בלבד.
- אחרי שגיאה: הנושא בתיבה, השאלה הקודמת והתשובה שנבחרה נשארים.

## 5. בדיקה עצמית לפני סימון 🟡

1. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — כולם עוברים.
2. הרצת `npm run dev` ובדיקה בדפדפן המובנה מול ה-AI האמיתי: נושא רגיל ⇐ שאלה מוצגת; נושא פוגעני מובהק ⇐ כרטיס "בואו נבחר נושא אחר" ושאלה לא מוצגת.
3. בדיקה בדפדפן של מצב "אין אינטרנט" (סימולציה דרך `navigator.onLine` / חסימת הבקשה) ⇐ ההודעה הנכונה ו"נסו שוב" שעובד אחרי החזרה.
4. בדיקה ב-Network שהתשובה מכילה `Cache-Control: no-store`, ושאין הודעות SDK או מפתח בתשובות ובקוד ה-Client.
5. סגירת ההרצה בסיום.

ניתוק אמיתי של האינטרנט במחשב — המשתמש בודק בעצמו בשלב "הרץ כדי שאבדוק".

## 6. Definition of Done – מיפוי לבדיקות

| תנאי | איך נבדק |
|---|---|
| נושא מסומן נדחה, לא מוצגת שאלה, בקשה ידידותית לנושא אחר | בדיקת Route + בדיקת UI + בדיקה ידנית מול OpenAI |
| פלט לא תקין או לא בטוח לא מוצג; הודעה עם "נסו שוב" | בדיקות Route (Schema, Moderation של פלט) + בדיקת UI |
| Timeout, שגיאת API, אין אינטרנט, עומס, נושא ריק, לחיצות כפולות — ב-Mocks; בלי קריסה, הנושא והשאלה הקודמת נשמרים | `route.test.ts`, `fetchQuestion.test.ts`, `TriviaPage.test.tsx` |
| ניתוק אמיתי מציג "נראה שאין חיבור לאינטרנט" | בדיקה עצמית בסימולציה + בדיקה ידנית של המשתמש |
| אין חשיפת שגיאות SDK או סודות; `Cache-Control: no-store` | בדיקות Route + בדיקת Network בדפדפן |
