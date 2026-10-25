import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TriviaSessionProvider } from "@/state/TriviaSessionContext";
import TriviaPage from "./page";

function renderPage() {
  render(
    <TriviaSessionProvider>
      <TriviaPage />
    </TriviaSessionProvider>,
  );
  return {
    input: screen.getByLabelText("איזה נושא מעניין אתכם?"),
    button: screen.getByRole("button", { name: "שאלה חדשה" }),
  };
}

describe("TriviaPage", () => {
  it("disables the new question button while the topic is empty", () => {
    const { button } = renderPage();
    expect(button).toBeDisabled();
  });

  it("keeps the button disabled for whitespace only", async () => {
    const { input, button } = renderPage();
    await userEvent.type(input, "   ");
    expect(button).toBeDisabled();
  });

  it("enables the button once a topic is typed", async () => {
    const { input, button } = renderPage();
    await userEvent.type(input, "חלל");
    expect(button).toBeEnabled();
  });
});
