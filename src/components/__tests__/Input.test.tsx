import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "@/components/Input";

describe("Input", () => {
  it("associates the label with the field", () => {
    render(<Input label="Amount" />);
    expect(screen.getByLabelText(/Amount/)).toBeInTheDocument();
  });

  it("marks the field invalid and links the error message", () => {
    render(<Input label="Amount" error="Too small" />);
    const field = screen.getByLabelText(/Amount/);
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Too small");
  });

  it("links a hint when there is no error", () => {
    render(<Input label="Memo" hint="Optional note" />);
    expect(screen.getByLabelText(/Memo/)).toHaveAccessibleDescription("Optional note");
  });

  it("hides the hint once an error is shown", () => {
    render(<Input label="Memo" hint="Optional note" error="Too long" />);
    expect(screen.queryByText("Optional note")).not.toBeInTheDocument();
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("renders a suffix", () => {
    render(<Input label="Amount" suffix="XLM" />);
    expect(screen.getByText("XLM")).toBeInTheDocument();
  });

  it("forwards typing to the change handler", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Input label="Amount" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText(/Amount/), "5");
    expect(onChange).toHaveBeenCalled();
  });

  it("respects the disabled attribute", () => {
    render(<Input label="Amount" disabled />);
    expect(screen.getByLabelText(/Amount/)).toBeDisabled();
  });
});
