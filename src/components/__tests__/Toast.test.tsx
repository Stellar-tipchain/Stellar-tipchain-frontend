import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toast from "@/components/Toast";

describe("Toast", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it.each([
    ["success", "bg-green-600"],
    ["error", "bg-red-600"],
    ["info", "bg-blue-600"],
  ] as const)("renders with correct colour for type=%s", (type, cls) => {
    render(<Toast message="test" type={type} onClose={() => {}} />);
    expect(screen.getByText("test").closest("div")).toHaveClass(cls);
  });

  it("auto-dismisses after 4s", () => {
    const onClose = jest.fn();
    render(<Toast message="bye" onClose={onClose} />);
    act(() => jest.advanceTimersByTime(4000));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("close button calls onClose", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onClose = jest.fn();
    render(<Toast message="hi" onClose={onClose} />);
    await user.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
