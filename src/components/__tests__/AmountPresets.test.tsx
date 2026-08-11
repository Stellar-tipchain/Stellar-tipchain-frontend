import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AmountPresets from "@/components/AmountPresets";
import { TIP_PRESETS } from "@/constants";

describe("AmountPresets", () => {
  it("renders one button per preset", () => {
    render(<AmountPresets value="" onSelect={() => {}} assetCode="XLM" />);
    expect(screen.getAllByRole("button")).toHaveLength(TIP_PRESETS.length);
  });

  it("labels each button with the asset code", () => {
    render(<AmountPresets value="" onSelect={() => {}} assetCode="USDC" />);
    expect(screen.getByRole("button", { name: "10 USDC" })).toBeInTheDocument();
  });

  it("reports the chosen amount", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<AmountPresets value="" onSelect={onSelect} assetCode="XLM" />);
    await user.click(screen.getByRole("button", { name: "25 XLM" }));
    expect(onSelect).toHaveBeenCalledWith("25");
  });

  it("marks the matching preset as pressed", () => {
    render(<AmountPresets value="5" onSelect={() => {}} assetCode="XLM" />);
    expect(screen.getByRole("button", { name: "5 XLM" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "10 XLM" })).toHaveAttribute("aria-pressed", "false");
  });

  it("disables every preset when asked", () => {
    render(<AmountPresets value="" onSelect={() => {}} assetCode="XLM" disabled />);
    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
  });
});
