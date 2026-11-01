import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchQuestion } from "./fetchQuestion";

const fetchMock = vi.fn();
const request = { topic: "חלל", recentQuestions: [] };
const question = {
  question: "איזה כוכב הכי קרוב לשמש?",
  options: ["חמה", "נוגה", "מאדים", "צדק"],
  correctIndex: 0,
  topic: "חלל",
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchQuestion", () => {
  it("returns the question on success, with a 40 second timeout signal", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    fetchMock.mockResolvedValue(Response.json(question));

    expect(await fetchQuestion(request)).toEqual({ ok: true, question });
    expect(timeout).toHaveBeenCalledWith(40_000);
  });

  it("reports NETWORK_ERROR without sending when the browser is offline", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(await fetchQuestion(request)).toEqual({ ok: false, code: "NETWORK_ERROR" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports NETWORK_ERROR when the request cannot reach the server", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await fetchQuestion(request)).toEqual({ ok: false, code: "NETWORK_ERROR" });
  });

  it("reports CLIENT_TIMEOUT when the browser timeout fires", async () => {
    fetchMock.mockRejectedValue(new DOMException("timed out", "TimeoutError"));
    expect(await fetchQuestion(request)).toEqual({ ok: false, code: "CLIENT_TIMEOUT" });
  });

  it("passes on a known error code from the server", async () => {
    fetchMock.mockResolvedValue(Response.json({ code: "UNSAFE_TOPIC" }, { status: 422 }));
    expect(await fetchQuestion(request)).toEqual({ ok: false, code: "UNSAFE_TOPIC" });
  });

  it.each([
    [429, "TEMPORARILY_BUSY"],
    [503, "SERVICE_UNAVAILABLE"],
    [504, "GENERATION_TIMEOUT"],
    [500, "GENERATION_FAILED"],
  ])("maps a non-JSON %i page to %s", async (status, code) => {
    fetchMock.mockResolvedValue(new Response("<html>error</html>", { status }));
    expect(await fetchQuestion(request)).toEqual({ ok: false, code });
  });

  it("ignores an unknown error code and falls back to the status", async () => {
    fetchMock.mockResolvedValue(Response.json({ code: "SOMETHING_ELSE" }, { status: 502 }));
    expect(await fetchQuestion(request)).toEqual({ ok: false, code: "GENERATION_FAILED" });
  });

  it("rejects a malformed success response", async () => {
    fetchMock.mockResolvedValue(Response.json({ ...question, options: ["א"] }));
    expect(await fetchQuestion(request)).toEqual({ ok: false, code: "GENERATION_FAILED" });
  });
});
