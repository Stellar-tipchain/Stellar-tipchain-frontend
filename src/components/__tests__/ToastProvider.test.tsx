import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToastProvider, { useToast } from "@/components/ToastProvider";
import { TOAST_DURATION_MS } from "@/constants";

function Raiser() {
  const { toast, success, error } = useToast();
  return (
    <>
      <button onClick={() => toast("a plain message")}>raise plain</button>
      <button onClick={() => success("it worked")}>raise success</button>
      <button onClick={() => error("it failed")}>raise error</button>
    </>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <Raiser />
    </ToastProvider>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  function setupUser() {
    return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  }

  it("shows a raised toast", async () => {
    const user = setupUser();
    renderWithProvider();
    await user.click(screen.getByRole("button", { name: "raise plain" }));
    expect(screen.getByText("a plain message")).toBeInTheDocument();
  });

  it("stacks several toasts instead of replacing them", async () => {
    const user = setupUser();
    renderWithProvider();
    await user.click(screen.getByRole("button", { name: "raise success" }));
    await user.click(screen.getByRole("button", { name: "raise error" }));

    expect(screen.getByText("it worked")).toBeInTheDocument();
    expect(screen.getByText("it failed")).toBeInTheDocument();
  });

  it("colours a toast by severity", async () => {
    const user = setupUser();
    renderWithProvider();
    await user.click(screen.getByRole("button", { name: "raise success" }));
    expect(screen.getByText("it worked").closest("div")).toHaveClass("bg-green-600");
  });

  it("auto-dismisses after the configured duration", async () => {
    const user = setupUser();
    renderWithProvider();
    await user.click(screen.getByRole("button", { name: "raise plain" }));

    act(() => {
      jest.advanceTimersByTime(TOAST_DURATION_MS);
    });

    expect(screen.queryByText("a plain message")).not.toBeInTheDocument();
  });

  it("dismisses on the close button", async () => {
    const user = setupUser();
    renderWithProvider();
    await user.click(screen.getByRole("button", { name: "raise plain" }));
    await user.click(screen.getByRole("button", { name: "Close notification" }));
    expect(screen.queryByText("a plain message")).not.toBeInTheDocument();
  });

  it("throws when used outside a provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Raiser />)).toThrow(/must be used inside a ToastProvider/);
    spy.mockRestore();
  });
});
