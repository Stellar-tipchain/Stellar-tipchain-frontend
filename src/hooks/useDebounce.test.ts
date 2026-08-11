import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("a", 300));
    expect(result.current).toBe("a");
  });

  it("holds the old value until the delay elapses", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "a" },
    });

    rerender({ v: "b" });
    expect(result.current).toBe("a");

    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe("b");
  });

  it("only settles on the last value in a burst of changes", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: "a" },
    });

    rerender({ v: "b" });
    act(() => jest.advanceTimersByTime(200));
    rerender({ v: "c" });
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe("a");

    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe("c");
  });

  it("respects a custom delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 1000), {
      initialProps: { v: "a" },
    });

    rerender({ v: "b" });
    act(() => jest.advanceTimersByTime(999));
    expect(result.current).toBe("a");

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe("b");
  });
});
