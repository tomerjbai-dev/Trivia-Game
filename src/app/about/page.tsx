import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <article className={styles.card}>
      <h2>אודות</h2>
      <h3 className={styles.subheading}>מה זה חכמולוגים?</h3>
      <p>משחק שאלות על כל מה שמעניין אתכם!</p>
      <ol className={styles.steps}>
        <li>כתבו נושא שאתם אוהבים, למשל חיות, חלל או כדורגל.</li>
        <li>לחצו על &quot;שאלה חדשה&quot; וחכו רגע.</li>
        <li>בחרו תשובה אחת מתוך ארבע.</li>
        <li>ירוק? צדקתם! אדום? לא נורא, התשובה הנכונה תסומן בירוק.</li>
        <li>רוצים עוד? לחצו שוב על &quot;שאלה חדשה&quot;, באותו נושא או בנושא חדש.</li>
      </ol>
      <p className={styles.note}>
        את השאלות כותב מחשב חכם, ולפעמים גם הוא טועה. אם משהו נראה לכם מוזר, שאלו מבוגר 🙂
      </p>
    </article>
  );
}
