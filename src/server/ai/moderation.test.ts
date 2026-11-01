import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
vi.mock("openai", () => ({
  default: vi.fn(function () {
    return { moderations: { create } };
  }),
}));

import { MissingApiKeyError } from "./openaiClient";
import { isFlagged } from "./moderation";

describe("isFlagged", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    create.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the omni moderation model with a short timeout", async () => {
    create.mockResolvedValue({ results: [{ flagged: false }] });

    expect(await isFlagged("חלל")).toBe(false);
    expect(create).toHaveBeenCalledWith(
      { model: "omni-moderation-latest", input: "חלל" },
      { timeout: 5_000 },
    );
  });

  it("returns true when any result is flagged", async () => {
    create.mockResolvedValue({ results: [{ flagged: false }, { flagged: true }] });
    expect(await isFlagged("משהו")).toBe(true);
  });

  it("throws instead of treating a failed check as safe", async () => {
    create.mockRejectedValue(new Error("down"));
    await expect(isFlagged("חלל")).rejects.toThrow("down");
  });

  it("throws when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(isFlagged("חלל")).rejects.toBeInstanceOf(MissingApiKeyError);
    expect(create).not.toHaveBeenCalled();
  });
});
