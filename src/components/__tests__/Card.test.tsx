import React from "react";
import { render, screen } from "@testing-library/react";
import Card from "@/components/Card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Panel body</Card>);
    expect(screen.getByText("Panel body")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    const { container } = render(<Card>x</Card>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders as the requested element", () => {
    const { container } = render(<Card as="article">x</Card>);
    expect(container.firstChild?.nodeName).toBe("ARTICLE");
  });

  it("adds a hover state only when interactive", () => {
    const { container, rerender } = render(<Card>x</Card>);
    expect(container.firstChild).not.toHaveClass("hover:bg-gray-700");
    rerender(<Card interactive>x</Card>);
    expect(container.firstChild).toHaveClass("hover:bg-gray-700");
  });
});
