import React from "react";
import { render } from "@testing-library/react";
import Avatar, { avatarColor } from "@/components/Avatar";

describe("avatarColor", () => {
  it("is stable for the same name", () => {
    expect(avatarColor("alice")).toBe(avatarColor("alice"));
  });

  it("always returns a palette class", () => {
    expect(avatarColor("someone")).toMatch(/^bg-[a-z]+-600$/);
  });

  it("handles an empty name", () => {
    expect(avatarColor("")).toMatch(/^bg-/);
  });
});

describe("Avatar", () => {
  it("shows the first letter uppercased", () => {
    const { container } = render(<Avatar name="alice" />);
    expect(container.textContent).toBe("A");
  });

  it("falls back to a question mark for an empty name", () => {
    const { container } = render(<Avatar name="" />);
    expect(container.textContent).toBe("?");
  });

  it("is hidden from assistive tech, since the username is shown alongside", () => {
    const { container } = render(<Avatar name="alice" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the requested size", () => {
    const { container } = render(<Avatar name="alice" size="lg" />);
    expect(container.firstChild).toHaveClass("w-20");
  });
});
