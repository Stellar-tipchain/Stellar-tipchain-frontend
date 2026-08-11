import { api, apiRequest } from "@/services/api";
import { ApiError, TimeoutError } from "@/lib/errors";

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => fetchMock.mockReset());

describe("apiRequest", () => {
  it("returns the parsed body", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    await expect(apiRequest("/thing")).resolves.toEqual({ ok: true });
  });

  it("sends JSON bodies with the right content type", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    await apiRequest("/thing", { method: "POST", body: { a: 1 } });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("omits the body when there is none", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    await apiRequest("/thing");
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });

  it("throws an ApiError carrying the status", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 404));
    await expect(apiRequest("/thing")).rejects.toBeInstanceOf(ApiError);
    await expect(apiRequest("/thing")).rejects.toMatchObject({ status: 404 });
  });

  it("prefers the server's error message", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Username taken" }, 409));
    await expect(apiRequest("/thing")).rejects.toThrow("Username taken");
  });

  it("falls back to a generated message when the body is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    await expect(apiRequest("/thing")).rejects.toThrow("API error 500 for /thing");
  });

  it("returns undefined for a 204", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204, json: async () => ({}) } as Response);
    await expect(apiRequest("/thing")).resolves.toBeUndefined();
  });

  it("raises a TimeoutError when the request is aborted by the timeout", async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new Error("Aborted")));
      });
    });

    await expect(apiRequest("/thing", { timeoutMs: 10 })).rejects.toBeInstanceOf(TimeoutError);
  });

  it("propagates a caller's cancellation rather than calling it a timeout", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new Error("Aborted")));
      });
    });

    const pending = apiRequest("/thing", { signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toThrow("Aborted");
  });
});

describe("api endpoints", () => {
  beforeEach(() => fetchMock.mockResolvedValue(jsonResponse([])));

  it("lists creators", async () => {
    await api.getCreators();
    expect(fetchMock.mock.calls[0][0]).toContain("/creators");
  });

  it("escapes a username in the path", async () => {
    await api.getCreator("a b/c");
    expect(fetchMock.mock.calls[0][0]).toContain("/creators/a%20b%2Fc");
  });

  it("posts a registration", async () => {
    await api.registerCreator("alice", "hi", "GABC");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/creators");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      username: "alice",
      bio: "hi",
      stellarAddress: "GABC",
    });
  });

  it("posts a settled tip for bookkeeping", async () => {
    await api.recordTip({ to: "alice", amount: "10", assetCode: "XLM", txHash: "abc" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/tips");
    expect(JSON.parse(init.body).txHash).toBe("abc");
  });

  it("fetches the leaderboard", async () => {
    await api.getLeaderboard();
    expect(fetchMock.mock.calls[0][0]).toContain("/creators/leaderboard");
  });
});
