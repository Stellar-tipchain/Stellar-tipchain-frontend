import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssetSelect from "@/components/AssetSelect";
import { XLM } from "@/constants";

const USDC = {
  code: "USDC",
  issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
};

describe("AssetSelect", () => {
  it("lists every asset", () => {
    render(<AssetSelect assets={[XLM, USDC]} value={XLM} onChange={() => {}} />);
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("reports the selected asset back on change", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<AssetSelect assets={[XLM, USDC]} value={XLM} onChange={onChange} />);
    await user.selectOptions(screen.getByRole("combobox"), `USDC:${USDC.issuer}`);
    expect(onChange).toHaveBeenCalledWith(USDC);
  });

  it("disables itself when there is only one asset to pick", () => {
    render(<AssetSelect assets={[XLM]} value={XLM} onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("shows a truncated issuer for issued assets", () => {
    render(<AssetSelect assets={[XLM, USDC]} value={XLM} onChange={() => {}} />);
    expect(screen.getByRole("option", { name: "USDC:GA5Z…" })).toBeInTheDocument();
  });
});
