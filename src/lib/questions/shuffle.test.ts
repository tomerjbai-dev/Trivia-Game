import { describe, expect, it } from "vitest";
import { shuffleOptions } from "./shuffle";

const question = {
  question: "מה אוכלות פרות?",
  options: ["עשב", "דגים", "אבנים", "שוקולד"],
  correctIndex: 0,
};

// Deterministic random source cycling through the given values.
function sequence(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("shuffleOptions", () => {
  it("keeps the same four options and points to the correct one", () => {
    for (let run = 0; run < 50; run++) {
      const result = shuffleOptions(question);
      expect([...result.options].sort()).toEqual([...question.options].sort());
      expect(result.options[result.correctIndex]).toBe("עשב");
    }
  });

  it("moves the correct answer to different positions", () => {
    const positions = new Set(
      [[0.99, 0.99, 0.99], [0, 0, 0], [0.5, 0.1, 0.9], [0.1, 0.9, 0.5], [0.3, 0.7, 0.2]].map(
        (values) => shuffleOptions(question, sequence(values)).correctIndex,
      ),
    );
    expect(positions.size).toBeGreaterThan(1);
  });

  it("does not modify the original question", () => {
    shuffleOptions(question, sequence([0, 0, 0]));
    expect(question.options).toEqual(["עשב", "דגים", "אבנים", "שוקולד"]);
  });
});
