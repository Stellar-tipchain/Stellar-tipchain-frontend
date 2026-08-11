import { act, renderHook, waitFor } from "@testing-library/react";
import { useAsync } from "@/hooks/useAsync";
import { ApiError } from "@/lib/errors";

describe("useAsync", () => {
  it("starts in a loading state", () => {
    const { result } = renderHook(() => useAsync(() => new Promise(() => {})));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it("stores the resolved value", async () => {
    const { result } = renderHook(() => useAsync(async () => "done"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe("done");
    expect(result.current.error).toBeNull();
  });

  it("maps a rejection to a user-facing message", async () => {
    const { result } = renderHook(() =>
      useAsync(async () => {
        throw new ApiError(404, "/creators/x");
      })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain("could not find");
  });

  it("does not run when disabled", () => {
    const task = jest.fn().mockResolvedValue("x");
    const { result } = renderHook(() => useAsync(task, [], { enabled: false }));
    expect(task).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("re-runs when a dependency changes", async () => {
    const task = jest.fn().mockResolvedValue("x");
    const { rerender } = renderHook(({ id }) => useAsync(() => task(id), [id]), {
      initialProps: { id: 1 },
    });

    await waitFor(() => expect(task).toHaveBeenCalledTimes(1));
    rerender({ id: 2 });
    await waitFor(() => expect(task).toHaveBeenCalledTimes(2));
    expect(task).toHaveBeenLastCalledWith(2);
  });

  it("re-runs on reload", async () => {
    const task = jest.fn().mockResolvedValue("x");
    const { result } = renderHook(() => useAsync(task));

    await waitFor(() => expect(task).toHaveBeenCalledTimes(1));
    act(() => result.current.reload());
    await waitFor(() => expect(task).toHaveBeenCalledTimes(2));
  });

  it("ignores a stale result that resolves after a newer run", async () => {
    const resolvers: ((value: string) => void)[] = [];
    const task = () => new Promise<string>((resolve) => resolvers.push(resolve));

    const { result, rerender } = renderHook(({ id }) => useAsync(task, [id]), {
      initialProps: { id: 1 },
    });

    rerender({ id: 2 });
    await waitFor(() => expect(resolvers).toHaveLength(2));

    // The second (current) run settles first, then the stale first run does.
    await act(async () => {
      resolvers[1]("fresh");
      resolvers[0]("stale");
    });

    expect(result.current.data).toBe("fresh");
  });

  it("clears a previous error when a re-run succeeds", async () => {
    let shouldFail = true;
    const { result } = renderHook(() =>
      useAsync(async () => {
        if (shouldFail) throw new Error("boom");
        return "ok";
      })
    );

    await waitFor(() => expect(result.current.error).toBe("boom"));
    shouldFail = false;
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toBe("ok"));
    expect(result.current.error).toBeNull();
  });
});
