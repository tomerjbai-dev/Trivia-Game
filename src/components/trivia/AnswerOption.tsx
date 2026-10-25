import { CheckIcon, CrossIcon } from "@/components/icons";
import styles from "./AnswerOption.module.css";

export type AnswerState = "default" | "correct" | "wrong" | "dimmed";

type Props = {
  text: string;
  state: AnswerState;
  disabled: boolean;
  onSelect: () => void;
};

export default function AnswerOption({ text, state, disabled, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`${styles.option} ${styles[state]}`}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className={styles.marker} aria-hidden="true">
        {state === "correct" && <CheckIcon size={18} />}
        {state === "wrong" && <CrossIcon size={18} />}
      </span>
      <span className={styles.text}>{text}</span>
      {state === "correct" && <span className={styles.srOnly}> (תשובה נכונה)</span>}
      {state === "wrong" && <span className={styles.srOnly}> (התשובה שבחרתם)</span>}
    </button>
  );
}
