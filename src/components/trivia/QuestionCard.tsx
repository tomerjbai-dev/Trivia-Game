import AnswerOption, { type AnswerState } from "./AnswerOption";
import styles from "./QuestionCard.module.css";

type Props = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
  locked: boolean;
  onSelect: (index: number) => void;
};

function answerState(index: number, correctIndex: number, selectedIndex: number | null): AnswerState {
  if (selectedIndex === null) return "default";
  if (index === correctIndex) return "correct";
  if (index === selectedIndex) return "wrong";
  return "dimmed";
}

export default function QuestionCard({
  id,
  question,
  options,
  correctIndex,
  selectedIndex,
  locked,
  onSelect,
}: Props) {
  const headingId = `question-${id}`;
  const answered = selectedIndex !== null;

  return (
    <section className={`${styles.card} ${locked ? styles.locked : ""}`} aria-busy={locked}>
      <h2 id={headingId} className={styles.question}>
        {question}
      </h2>
      <div role="group" aria-labelledby={headingId} className={styles.options}>
        {options.map((option, index) => (
          <AnswerOption
            key={index}
            text={option}
            state={answerState(index, correctIndex, selectedIndex)}
            disabled={answered || locked}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
    </section>
  );
}
