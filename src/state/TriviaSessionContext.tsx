"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Game state lives in the shared layout so it survives navigation between screens.
// A page refresh resets it (no persistence by design).
type TriviaSession = {
  draftTopic: string;
  setDraftTopic: (topic: string) => void;
};

const TriviaSessionContext = createContext<TriviaSession | null>(null);

export function TriviaSessionProvider({ children }: { children: ReactNode }) {
  const [draftTopic, setDraftTopic] = useState("");

  return (
    <TriviaSessionContext.Provider value={{ draftTopic, setDraftTopic }}>
      {children}
    </TriviaSessionContext.Provider>
  );
}

export function useTriviaSession(): TriviaSession {
  const session = useContext(TriviaSessionContext);
  if (!session) {
    throw new Error("useTriviaSession must be used inside TriviaSessionProvider");
  }
  return session;
}
