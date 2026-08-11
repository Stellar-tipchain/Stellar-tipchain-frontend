import React from "react";
import { render, screen } from "@testing-library/react";
import StatCard from "@/components/StatCard";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Tips received" value="42" />);
    expect(screen.getByText("Tips received")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders a sublabel", () => {
    render(<StatCard label="Balance" value="10 XLM" sublabel="≈ $1.20" />);
    expect(screen.getByText("≈ $1.20")).toBeInTheDocument();
  });

  it("swaps the value for a skeleton while loading", () => {
    render(<StatCard label="Balance" value="10 XLM" loading />);
    expect(screen.queryByText("10 XLM")).not.toBeInTheDocument();
  });

  it("hides the sublabel while loading", () => {
    render(<StatCard label="Balance" value="10" sublabel="≈ $1.20" loading />);
    expect(screen.queryByText("≈ $1.20")).not.toBeInTheDocument();
  });
});
