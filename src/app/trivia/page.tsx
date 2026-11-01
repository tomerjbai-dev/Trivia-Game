"use client";

import type { FormEvent } from "react";
import { useTriviaSession } from "@/state/TriviaSessionContext";
import buttonStyles from "@/components/Button.module.css";
import { PencilIcon } from "@/components/icons";
import ErrorCard from "@/components/trivia/ErrorCard";
import FeedbackCard from "@/components/trivia/FeedbackCard";
import LoadingIndicator from "@/components/trivia/LoadingIndicator";
import QuestionCard from "@/components/trivia/QuestionCard";
import styles from "./page.module.css";

export default function TriviaPage() {
  const {
    draftTopic,
    setDraftTopic,
    currentQuestion,
    selectedIndex,
    status,
    errorCode,
    requestQuestion,
    retry,
    selectAnswer,
  } = useTriviaSession();
  const loading = status === "loading";
  const canRequest = draftTopic.trim().length > 0 && !loading;
  const answered = currentQuestion !== null && selectedIndex !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canRequest) void requestQuestion();
  }

  return (
    <div className={styles.screen}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <label htmlFor="topic" className={styles.label}>
          איזה נושא מעניין אתכם?
        </label>
        <div className={styles.inputWrap}>
          <input
            id="topic"
            type="text"
            className={styles.input}
            placeholder="לדוגמה: דינוזאורים, חלל, חיות"
            maxLength={100}
            autoComplete="off"
            enterKeyHint="go"
            value={draftTopic}
            onChange={(event) => setDraftTopic(event.target.value)}
          />
          <span className={styles.inputIcon} aria-hidden="true">
            <PencilIcon />
          </span>
        </div>
        <button type="submit" className={buttonStyles.primary} disabled={!canRequest}>
          שאלה חדשה
        </button>
      </form>

      {loading && <LoadingIndicator />}

      {currentQuestion && (
        <QuestionCard
          key={currentQuestion.id}
          id={currentQuestion.id}
          question={currentQuestion.question}
          options={currentQuestion.options}
          correctIndex={currentQuestion.correctIndex}
          selectedIndex={selectedIndex}
          locked={loading}
          onSelect={selectAnswer}
        />
      )}

      {status === "error" && errorCode && (
        <ErrorCard code={errorCode} onRetry={() => void retry()} />
      )}

      {answered && (
        <>
          <FeedbackCard correct={selectedIndex === currentQuestion.correctIndex} />
          {/* Same action as the top button, so phones don't need to scroll up (DESIGN 1.2) */}
          <button
            type="button"
            className={buttonStyles.primary}
            disabled={!canRequest}
            onClick={() => void requestQuestion()}
          >
            שאלה חדשה
          </button>
        </>
      )}
    </div>
  );
}
