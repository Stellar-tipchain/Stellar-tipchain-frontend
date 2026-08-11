import React from "react";
import { render, screen } from "@testing-library/react";
import Alert from "@/components/Alert";

describe("Alert", () => {
  it("renders its content", () => {
    render(<Alert>Heads up</Alert>);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
  });

  it("renders an optional title", () => {
    render(<Alert title="Network">Testnet only</Alert>);
    expect(screen.getByText("Network")).toBeInTheDocument();
  });

  it("uses the alert role for errors so it interrupts", () => {
    render(<Alert severity="error">Broken</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses the status role for non-errors", () => {
    render(<Alert severity="info">FYI</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("applies the severity styling", () => {
    render(<Alert severity="warning">Careful</Alert>);
    expect(screen.getByRole("status")).toHaveClass("bg-amber-950");
  });
});
