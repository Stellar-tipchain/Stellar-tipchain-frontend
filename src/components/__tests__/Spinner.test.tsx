import React from "react";
import { render, screen } from "@testing-library/react";
import Spinner from "@/components/Spinner";

describe("Spinner", () => {
  it("exposes a status role so loading is announced", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses a default label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveAccessibleName("Loading");
  });

  it("accepts a custom label", () => {
    render(<Spinner label="Submitting tip" />);
    expect(screen.getByRole("status")).toHaveAccessibleName("Submitting tip");
  });

  it("applies the requested size", () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole("status")).toHaveClass("w-10");
  });
});
