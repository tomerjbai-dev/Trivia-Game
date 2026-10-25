"use client";

import type { FormEvent } from "react";
import { useTriviaSession } from "@/state/TriviaSessionContext";
import buttonStyles from "@/components/Button.module.css";
import styles from "./page.module.css";

export default function TriviaPage() {
  const { draftTopic, setDraftTopic } = useTriviaSession();
  const canRequest = draftTopic.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Question generation is connected to the AI in Milestone 2.
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <label htmlFor="topic" className={styles.label}>
        איזה נושא מעניין אתכם?
      </label>
      <input
        id="topic"
        type="text"
        className={styles.input}
        placeholder="לדוגמה: דינוזאורים, חלל, חיות"
        maxLength={100}
        autoComplete="off"
        value={draftTopic}
        onChange={(event) => setDraftTopic(event.target.value)}
      />
      <button type="submit" className={buttonStyles.primary} disabled={!canRequest}>
        שאלה חדשה
      </button>
    </form>
  );
}
