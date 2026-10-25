import styles from "./LoadingIndicator.module.css";

export default function LoadingIndicator() {
  return (
    <div role="status" className={styles.loading}>
      <span className={styles.dots} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </span>
      <span>מכינים לך שאלה מעניינת...</span>
    </div>
  );
}
