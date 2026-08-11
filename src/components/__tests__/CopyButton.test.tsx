import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyButton from "@/components/CopyButton";
import { removeClipboard, stubClipboard } from "@/test-utils/clipboard";

const ADDRESS = "GCUEBHEXPVGMVQSBIPXJ3UD2XQ57IMDKLQG6AGZLRRRI63YDT2MFEQJL";

describe("CopyButton", () => {
  afterEach(removeClipboard);

  it("shows the value when no children are given", () => {
    stubClipboard();
    render(<CopyButton value={ADDRESS} />);
    expect(screen.getByText(ADDRESS)).toBeInTheDocument();
  });

  it("renders children in place of the raw value", () => {
    stubClipboard();
    render(<CopyButton value={ADDRESS}>GCUE…EQJL</CopyButton>);
    expect(screen.getByText("GCUE…EQJL")).toBeInTheDocument();
  });

  it("writes the full value to the clipboard, not the truncated label", async () => {
    // userEvent.setup() installs its own clipboard stub, so ours goes in after.
    const user = userEvent.setup();
    const writeText = stubClipboard();
    render(<CopyButton value={ADDRESS}>GCUE…EQJL</CopyButton>);
    await user.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith(ADDRESS);
  });

  it("confirms the copy in its accessible name", async () => {
    const user = userEvent.setup();
    stubClipboard();
    render(<CopyButton value={ADDRESS} label="Stellar address" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAccessibleName("Stellar address copied");
  });

  it("stays usable when the clipboard API is unavailable", async () => {
    const user = userEvent.setup();
    removeClipboard();
    render(<CopyButton value={ADDRESS} label="Stellar address" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAccessibleName("Copy Stellar address");
  });
});
