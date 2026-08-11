import React from "react";
import { render, screen } from "@testing-library/react";
import PageHeader from "@/components/PageHeader";

describe("PageHeader", () => {
  it("renders the title as a level-one heading", () => {
    render(<PageHeader title="Explore Creators" />);
    expect(screen.getByRole("heading", { level: 1, name: "Explore Creators" })).toBeInTheDocument();
  });

  it("renders an optional description", () => {
    render(<PageHeader title="Explore" description="Find someone to support." />);
    expect(screen.getByText("Find someone to support.")).toBeInTheDocument();
  });

  it("renders an optional action", () => {
    render(<PageHeader title="Explore" action={<button>New</button>} />);
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });
});
