"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { fetchQuestion } from "@/lib/questions/fetchQuestion";
import {
  MAX_RECENT_QUESTION_LENGTH,
  MAX_RECENT_QUESTIONS,
  type ErrorCode,
  type QuestionResponse,
} from "@/lib/questions/schema";

// Game state lives in the shared layout so it survives navigation between screens.
// A page refresh resets it (no persistence by design).

export type TriviaQuestion = QuestionResponse & { id: string };

type SessionState = {
  draftTopic: string;
  activeTopic: string | null;
  currentQuestion: TriviaQuestion | null;
  selectedIndex: number | null;
  seenQuestions: string[];
  status: "idle" | "loading" | "error";
  errorCode: ErrorCode | null;
};

type Action =
  | { type: "setDraftTopic"; topic: string }
  | { type: "requestStarted" }
  | { type: "requestSucceeded"; question: TriviaQuestion }
  | { type: "requestFailed"; code: ErrorCode }
  | { type: "answerSelected"; index: number };

const initialState: SessionState = {
  draftTopic: "",
  activeTopic: null,
  currentQuestion: null,
  selectedIndex: null,
  seenQuestions: [],
  status: "idle",
  errorCode: null,
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "setDraftTopic":
      return { ...state, draftTopic: action.topic };
    case "requestStarted":
      return { ...state, status: "loading", errorCode: null };
    case "requestSucceeded":
      return {
        ...state,
        status: "idle",
        activeTopic: action.question.topic,
        currentQuestion: action.question,
        selectedIndex: null,
        // Skipped questions are remembered too, so the AI is asked not to repeat them.
        seenQuestions: [...state.seenQuestions, action.question.question].slice(
          -MAX_RECENT_QUESTIONS,
        ),
      };
    case "requestFailed":
      return { ...state, status: "error", errorCode: action.code };
    case "answerSelected":
      if (!state.currentQuestion || state.selectedIndex !== null || state.status === "loading") {
        return state;
      }
      return { ...state, selectedIndex: action.index };
  }
}

type TriviaSession = Omit<SessionState, "seenQuestions"> & {
  setDraftTopic: (topic: string) => void;
  requestQuestion: () => Promise<void>;
  selectAnswer: (index: number) => void;
};

const TriviaSessionContext = createContext<TriviaSession | null>(null);

export function TriviaSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Latest state for async callbacks, so a request always uses the current topic.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const loadingRef = useRef(false);

  const setDraftTopic = useCallback((topic: string) => {
    dispatch({ type: "setDraftTopic", topic });
  }, []);

  const requestQuestion = useCallback(async () => {
    const topic = stateRef.current.draftTopic.trim();
    if (!topic || loadingRef.current) return;

    loadingRef.current = true;
    dispatch({ type: "requestStarted" });
    const result = await fetchQuestion({
      topic,
      recentQuestions: stateRef.current.seenQuestions.map((q) =>
        q.slice(0, MAX_RECENT_QUESTION_LENGTH),
      ),
    });
    loadingRef.current = false;

    if (result.ok) {
      dispatch({
        type: "requestSucceeded",
        question: { ...result.question, id: crypto.randomUUID() },
      });
    } else {
      dispatch({ type: "requestFailed", code: result.code });
    }
  }, []);

  const selectAnswer = useCallback((index: number) => {
    dispatch({ type: "answerSelected", index });
  }, []);

  const value = useMemo<TriviaSession>(
    () => ({
      draftTopic: state.draftTopic,
      activeTopic: state.activeTopic,
      currentQuestion: state.currentQuestion,
      selectedIndex: state.selectedIndex,
      status: state.status,
      errorCode: state.errorCode,
      setDraftTopic,
      requestQuestion,
      selectAnswer,
    }),
    [state, setDraftTopic, requestQuestion, selectAnswer],
  );

  return <TriviaSessionContext.Provider value={value}>{children}</TriviaSessionContext.Provider>;
}

export function useTriviaSession(): TriviaSession {
  const session = useContext(TriviaSessionContext);
  if (!session) {
    throw new Error("useTriviaSession must be used inside TriviaSessionProvider");
  }
  return session;
}
