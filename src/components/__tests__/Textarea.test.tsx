import React from "react";
import { render, screen } from "@testing-library/react";
import Textarea from "@/components/Textarea";

describe("Textarea", () => {
  it("associates the label with the field", () => {
    render(<Textarea label="Bio" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
  });

  it("shows a character counter when a limit is given", () => {
    render(<Textarea label="Bio" maxLength={160} value="hello" onChange={() => {}} />);
    expect(screen.getByText("5/160")).toBeInTheDocument();
  });

  it("omits the counter when there is no limit", () => {
    render(<Textarea label="Bio" value="hello" onChange={() => {}} />);
    expect(screen.queryByText(/\/\d+$/)).not.toBeInTheDocument();
  });

  it("flags the counter once the limit is passed", () => {
    render(<Textarea label="Bio" maxLength={3} value="hello" onChange={() => {}} />);
    expect(screen.getByText("5/3")).toHaveClass("text-red-400");
  });

  it("links the error to the field", () => {
    render(<Textarea label="Bio" error="Too long" value="" onChange={() => {}} />);
    const field = screen.getByLabelText("Bio");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Too long");
  });
});
