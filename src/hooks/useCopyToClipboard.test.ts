import { act, renderHook } from "@testing-library/react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { removeClipboard, stubClipboard } from "@/test-utils/clipboard";

const mockClipboard = stubClipboard;

describe("useCopyToClipboard", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    removeClipboard();
  });

  it("starts in an idle state", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("writes the value and flags success", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy("hello"));

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);
  });

  it("clears the success flag after the reset delay", async () => {
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    const { result } = renderHook(() => useCopyToClipboard(1000));

    await act(() => result.current.copy("hello"));
    act(() => jest.advanceTimersByTime(1000));

    expect(result.current.copied).toBe(false);
  });

  it("reports an error when the clipboard API is missing", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy("hello");
    });

    expect(ok).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toMatch(/unavailable/i);
  });

  it("reports an error when the write is rejected", async () => {
    mockClipboard(jest.fn().mockRejectedValue(new Error("Denied")));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(() => result.current.copy("hello"));

    expect(result.current.error).toBe("Denied");
  });
});
