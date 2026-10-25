import type { GeneratedQuestion } from "./schema";

// Language models tend to put the correct answer in the same slot,
// so the server shuffles the options (Fisher–Yates) and tracks the correct one.
export function shuffleOptions(
  question: GeneratedQuestion,
  random: () => number = Math.random,
): GeneratedQuestion {
  const order = question.options.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    question: question.question,
    options: order.map((index) => question.options[index]),
    correctIndex: order.indexOf(question.correctIndex),
  };
}
