import React from "react";
import { render, screen } from "@testing-library/react";
import TxLink from "@/components/TxLink";

const HASH = "9d5f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7";

describe("TxLink", () => {
  it("links to the explorer for the hash", () => {
    render(<TxLink hash={HASH} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", expect.stringContaining(HASH));
  });

  it("opens in a new tab without leaking the opener", () => {
    render(<TxLink hash={HASH} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows a truncated hash", () => {
    render(<TxLink hash={HASH} />);
    expect(screen.getByText("9d5f1a2b…d6e7")).toBeInTheDocument();
  });

  it("warns screen reader users that the link leaves the app", () => {
    render(<TxLink hash={HASH} />);
    expect(screen.getByRole("link")).toHaveAccessibleName(expect.stringContaining("new tab"));
  });
});
