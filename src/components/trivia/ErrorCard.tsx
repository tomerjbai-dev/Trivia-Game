import { CrossIcon } from "@/components/icons";
import styles from "./ErrorCard.module.css";

// Milestone 2 shows one generic message; per-code messages and "נסו שוב" come in Milestone 3.
export default function ErrorCard() {
  return (
    <div role="alert" className={styles.card}>
      <span className={styles.icon} aria-hidden="true">
        <CrossIcon size={18} />
      </span>
      <p>אופס! לא הצלחנו להכין שאלה הפעם.</p>
    </div>
  );
}
