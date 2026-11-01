import { CrossIcon, QuestionIcon } from "@/components/icons";
import buttonStyles from "@/components/Button.module.css";
import { ERROR_MESSAGES, canRetry, isTopicProblem } from "@/lib/questions/errorMessages";
import type { ErrorCode } from "@/lib/questions/schema";
import styles from "./ErrorCard.module.css";

type ErrorCardProps = {
  code: ErrorCode;
  onRetry: () => void;
};

// A blocked or empty topic isn't a failure, so it gets a softer card without "נסו שוב".
export default function ErrorCard({ code, onRetry }: ErrorCardProps) {
  const topicProblem = isTopicProblem(code);

  return (
    <div role="alert" className={`${styles.card} ${topicProblem ? styles.topic : ""}`}>
      <div className={styles.message}>
        <span className={styles.icon} aria-hidden="true">
          {topicProblem ? <QuestionIcon size={20} /> : <CrossIcon size={18} />}
        </span>
        <p>{ERROR_MESSAGES[code]}</p>
      </div>
      {canRetry(code) && (
        <button type="button" className={`${buttonStyles.secondary} ${styles.retry}`} onClick={onRetry}>
          נסו שוב
        </button>
      )}
    </div>
  );
}
