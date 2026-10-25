import { CheckIcon, CrossIcon } from "@/components/icons";
import styles from "./FeedbackCard.module.css";

export default function FeedbackCard({ correct }: { correct: boolean }) {
  return (
    <div role="status" className={`${styles.card} ${correct ? styles.success : styles.error}`}>
      <span className={styles.icon} aria-hidden="true">
        {correct ? <CheckIcon size={22} /> : <CrossIcon size={22} />}
      </span>
      <p className={styles.message}>
        {correct ? "כל הכבוד! תשובה נכונה" : "לא נורא! התשובה הנכונה מסומנת בירוק"}
      </p>
    </div>
  );
}
