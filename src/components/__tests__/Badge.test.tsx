import React from "react";
import { render, screen } from "@testing-library/react";
import Badge from "@/components/Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Sent</Badge>);
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });

  it("defaults to the neutral tone", () => {
    render(<Badge>Sent</Badge>);
    expect(screen.getByText("Sent")).toHaveClass("bg-gray-700");
  });

  it.each([
    ["success", "bg-green-900"],
    ["error", "bg-red-900"],
    ["info", "bg-blue-900"],
    ["warning", "bg-amber-900"],
  ] as const)("applies the %s tone", (tone, cls) => {
    render(<Badge tone={tone}>Label</Badge>);
    expect(screen.getByText("Label")).toHaveClass(cls);
  });

  it("merges an extra class name", () => {
    render(<Badge className="ml-2">Label</Badge>);
    expect(screen.getByText("Label")).toHaveClass("ml-2");
  });
});
