import { BulbIcon } from "@/components/icons";
import styles from "./page.module.css";

const STEPS = [
  "כתבו נושא שאתם אוהבים, למשל חיות, חלל או כדורגל.",
  'לחצו על "שאלה חדשה" וחכו רגע.',
  "בחרו תשובה אחת מתוך ארבע.",
  "ירוק? צדקתם! אדום? לא נורא, התשובה הנכונה תסומן בירוק.",
  'רוצים עוד? לחצו שוב על "שאלה חדשה", באותו נושא או בנושא חדש.',
];

export default function AboutPage() {
  return (
    <article className={styles.card}>
      <h2>אודות</h2>
      <div className={styles.intro}>
        <BulbIcon size={36} />
        <div>
          <h3>מה זה חכמולוגים?</h3>
          <p>משחק שאלות על כל מה שמעניין אתכם!</p>
        </div>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step) => (
          <li key={step} className={styles.step}>
            {step}
          </li>
        ))}
      </ol>
      <p className={styles.note}>
        את השאלות כותב מחשב חכם, ולפעמים גם הוא טועה. אם משהו נראה לכם מוזר, שאלו מבוגר 🙂
      </p>
    </article>
  );
}
