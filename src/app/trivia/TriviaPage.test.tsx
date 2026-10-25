import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TriviaSessionProvider } from "@/state/TriviaSessionContext";
import AboutPage from "@/app/about/page";
import TriviaPage from "./page";

type MockQuestion = { question: string; options: string[]; correctIndex: number };

const cows: MockQuestion = {
  question: "מה אוכלות פרות?",
  options: ["עשב", "דגים", "אבנים", "שוקולד"],
  correctIndex: 0,
};

function questionNumber(n: number): MockQuestion {
  return { question: `שאלה מספר ${n}?`, options: ["א", "ב", "ג", "ד"], correctIndex: 1 };
}

const fetchMock = vi.fn();

function respondWith(question: MockQuestion) {
  fetchMock.mockImplementationOnce(async (_url: string, init: RequestInit) => {
    const { topic } = JSON.parse(init.body as string);
    return Response.json({ ...question, topic });
  });
}

// A request that stays pending until resolve() is called.
function respondLater(question: MockQuestion) {
  let resolve = () => {};
  fetchMock.mockImplementationOnce(
    (_url: string, init: RequestInit) =>
      new Promise((done) => {
        const { topic } = JSON.parse(init.body as string);
        resolve = () => done(Response.json({ ...question, topic }));
      }),
  );
  return () => act(async () => resolve());
}

function sentBody(call: number) {
  return JSON.parse(fetchMock.mock.calls[call][1].body);
}

function renderPage() {
  render(
    <TriviaSessionProvider>
      <TriviaPage />
    </TriviaSessionProvider>,
  );
  return {
    input: screen.getByLabelText("איזה נושא מעניין אתכם?"),
    button: () => screen.getAllByRole("button", { name: "שאלה חדשה" })[0],
  };
}

function answers() {
  return within(screen.getByRole("group")).getAllByRole("button");
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TriviaPage – topic form", () => {
  it("disables the new question button while the topic is empty", () => {
    const { button } = renderPage();
    expect(button()).toBeDisabled();
  });

  it("keeps the button disabled for whitespace only", async () => {
    const { input, button } = renderPage();
    await userEvent.type(input, "   ");
    expect(button()).toBeDisabled();
  });

  it("enables the button once a topic is typed, without sending a request", async () => {
    const { input, button } = renderPage();
    await userEvent.type(input, "חלל");
    expect(button()).toBeEnabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("TriviaPage – playing", () => {
  it("requests a question on Enter and shows the loading state", async () => {
    const resolve = respondLater(cows);
    const { input, button } = renderPage();

    await userEvent.type(input, "פרות{Enter}");

    expect(screen.getByText("מכינים לך שאלה מעניינת...")).toBeInTheDocument();
    expect(button()).toBeDisabled();
    expect(sentBody(0)).toEqual({ topic: "פרות", recentQuestions: [] });

    await resolve();
    expect(screen.getByRole("heading", { name: cows.question })).toBeInTheDocument();
    expect(answers()).toHaveLength(4);
    expect(screen.queryByText("מכינים לך שאלה מעניינת...")).not.toBeInTheDocument();
  });

  it("does not send a second request while loading", async () => {
    const resolve = respondLater(cows);
    const { input, button } = renderPage();

    await userEvent.type(input, "פרות");
    await userEvent.click(button());
    await userEvent.type(input, "{Enter}");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    await resolve();
  });

  it("shows success feedback for a correct answer and locks the answers", async () => {
    respondWith(cows);
    const { input } = renderPage();
    await userEvent.type(input, "פרות{Enter}");

    await userEvent.click(await screen.findByRole("button", { name: "עשב" }));

    expect(screen.getByRole("status")).toHaveTextContent("כל הכבוד! תשובה נכונה");
    answers().forEach((answer) => expect(answer).toBeDisabled());
    expect(screen.getAllByRole("button", { name: "שאלה חדשה" })).toHaveLength(2);
  });

  it("shows friendly feedback for a wrong answer and highlights the correct one", async () => {
    respondWith(cows);
    const { input } = renderPage();
    await userEvent.type(input, "פרות{Enter}");

    await userEvent.click(await screen.findByRole("button", { name: "דגים" }));

    expect(screen.getByRole("status")).toHaveTextContent("לא נורא! התשובה הנכונה מסומנת בירוק");
    expect(screen.getByRole("button", { name: /עשב/ })).toHaveClass("correct");
    expect(screen.getByRole("button", { name: /דגים/ })).toHaveClass("wrong");
    expect(screen.queryByText("נסו שוב")).not.toBeInTheDocument();
  });

  it("ignores a second answer to the same question", async () => {
    respondWith(cows);
    const { input } = renderPage();
    await userEvent.type(input, "פרות{Enter}");

    await userEvent.click(await screen.findByRole("button", { name: "דגים" }));
    await userEvent.click(screen.getByRole("button", { name: /עשב/ }));

    expect(screen.getByRole("status")).toHaveTextContent("לא נורא!");
    expect(screen.getByRole("button", { name: /דגים/ })).toHaveClass("wrong");
  });

  it("keeps the question when the topic is edited, and uses the new topic on request", async () => {
    respondWith(cows);
    respondWith(questionNumber(2));
    const { input, button } = renderPage();
    await userEvent.type(input, "פרות{Enter}");
    await screen.findByRole("heading", { name: cows.question });

    await userEvent.clear(input);
    await userEvent.type(input, "חלל");
    expect(screen.getByRole("heading", { name: cows.question })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await userEvent.click(button());
    expect(await screen.findByRole("heading", { name: "שאלה מספר 2?" })).toBeInTheDocument();
    expect(sentBody(1).topic).toBe("חלל");
  });

  it("allows skipping a question and sends skipped questions as recent", async () => {
    respondWith(cows);
    respondWith(questionNumber(2));
    const { input, button } = renderPage();
    await userEvent.type(input, "פרות{Enter}");
    await screen.findByRole("heading", { name: cows.question });

    await userEvent.click(button());

    expect(await screen.findByRole("heading", { name: "שאלה מספר 2?" })).toBeInTheDocument();
    expect(sentBody(1)).toEqual({ topic: "פרות", recentQuestions: [cows.question] });
  });

  it("sends at most the 10 most recent questions", async () => {
    for (let n = 1; n <= 12; n++) respondWith(questionNumber(n));
    const { input, button } = renderPage();
    await userEvent.type(input, "חלל");

    for (let n = 1; n <= 12; n++) {
      await userEvent.click(button());
      await screen.findByRole("heading", { name: `שאלה מספר ${n}?` });
    }

    const recent = sentBody(11).recentQuestions;
    expect(recent).toHaveLength(10);
    expect(recent[0]).toBe("שאלה מספר 2?");
    expect(recent[9]).toBe("שאלה מספר 11?");
  });

  it("keeps the previous question and topic when a request fails", async () => {
    respondWith(cows);
    fetchMock.mockResolvedValueOnce(Response.json({ code: "GENERATION_FAILED" }, { status: 502 }));
    const { input, button } = renderPage();
    await userEvent.type(input, "פרות{Enter}");
    await screen.findByRole("heading", { name: cows.question });

    await userEvent.click(button());

    expect(await screen.findByRole("alert")).toHaveTextContent("אופס! לא הצלחנו להכין שאלה הפעם.");
    expect(screen.getByRole("heading", { name: cows.question })).toBeInTheDocument();
    expect(input).toHaveValue("פרות");
    expect(button()).toBeEnabled();
  });

  it("shows the error when the network is down", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { input } = renderPage();
    await userEvent.type(input, "פרות{Enter}");
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

describe("TriviaPage – navigation", () => {
  // Simulates moving between screens under the shared layout provider.
  function Screens() {
    const [screenName, setScreenName] = useState<"trivia" | "about">("trivia");
    return (
      <>
        <button type="button" onClick={() => setScreenName(screenName === "trivia" ? "about" : "trivia")}>
          switch
        </button>
        {screenName === "trivia" ? <TriviaPage /> : <AboutPage />}
      </>
    );
  }

  it("keeps the topic, question and selected answer after visiting About", async () => {
    respondWith(cows);
    render(
      <TriviaSessionProvider>
        <Screens />
      </TriviaSessionProvider>,
    );
    await userEvent.type(screen.getByLabelText("איזה נושא מעניין אתכם?"), "פרות{Enter}");
    await userEvent.click(await screen.findByRole("button", { name: "דגים" }));

    await userEvent.click(screen.getByRole("button", { name: "switch" }));
    expect(screen.queryByRole("heading", { name: cows.question })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "switch" }));

    expect(screen.getByLabelText("איזה נושא מעניין אתכם?")).toHaveValue("פרות");
    expect(screen.getByRole("heading", { name: cows.question })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /דגים/ })).toHaveClass("wrong");
    expect(screen.getByRole("status")).toHaveTextContent("לא נורא!");
  });
});
