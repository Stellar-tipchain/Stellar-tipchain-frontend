import React from "react";
import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="No creators yet" />);
    expect(screen.getByText("No creators yet")).toBeInTheDocument();
  });

  it("renders an optional description", () => {
    render(<EmptyState title="Nothing here" description="Try another search." />);
    expect(screen.getByText("Try another search.")).toBeInTheDocument();
  });

  it("renders an optional action", () => {
    render(<EmptyState title="Nothing here" action={<button>Reset</button>} />);
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });
});
