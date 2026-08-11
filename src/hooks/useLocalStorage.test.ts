import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("k", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("adopts a stored value after mount", () => {
    window.localStorage.setItem("k", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("k", "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("writes updates through to storage", () => {
    const { result } = renderHook(() => useLocalStorage("k", "default"));
    act(() => result.current[1]("next"));
    expect(result.current[0]).toBe("next");
    expect(window.localStorage.getItem("k")).toBe(JSON.stringify("next"));
  });

  it("round-trips objects", () => {
    const { result } = renderHook(() => useLocalStorage<{ a: number }>("k", { a: 0 }));
    act(() => result.current[1]({ a: 42 }));
    expect(JSON.parse(window.localStorage.getItem("k")!)).toEqual({ a: 42 });
  });

  it("resets to the initial value on remove", () => {
    const { result } = renderHook(() => useLocalStorage("k", "default"));
    act(() => result.current[1]("next"));
    act(() => result.current[2]());
    expect(result.current[0]).toBe("default");
    expect(window.localStorage.getItem("k")).toBeNull();
  });

  it("keeps the default when the stored entry is corrupt", () => {
    window.localStorage.setItem("k", "{not json");
    const { result } = renderHook(() => useLocalStorage("k", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("falls back to in-memory state when storage throws", () => {
    const setItem = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    const { result } = renderHook(() => useLocalStorage("k", "default"));
    act(() => result.current[1]("next"));

    expect(result.current[0]).toBe("next");
    setItem.mockRestore();
  });
});
