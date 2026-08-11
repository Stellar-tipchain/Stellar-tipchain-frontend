import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TipForm from "@/components/TipForm";
import ToastProvider from "@/components/ToastProvider";
import { sendTip } from "@/services/tips";
import { XLM } from "@/constants";
import type { WalletContextValue } from "@/components/WalletProvider";

jest.mock("@/services/tips", () => ({
  sendTip: jest.fn(),
  tipStatusLabel: jest.requireActual("@/services/tips").tipStatusLabel,
}));

const wallet: { current: Partial<WalletContextValue> } = { current: {} };
jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => wallet.current,
}));

const TO = "GDCYQATDNK4S6DC4W2GZTNMSXERGTP3VGKTQVJI5Y4XRRWOVAEQRALQL";
const FROM = "GCUEBHEXPVGMVQSBIPXJ3UD2XQ57IMDKLQG6AGZLRRRI63YDT2MFEQJL";
const USDC = { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" };

function connected(overrides: Partial<WalletContextValue> = {}): Partial<WalletContextValue> {
  return {
    address: FROM,
    connected: true,
    connecting: false,
    networkMismatch: false,
    connect: jest.fn(),
    ...overrides,
  };
}

function renderForm(props: Partial<React.ComponentProps<typeof TipForm>> = {}) {
  return render(
    <ToastProvider>
      <TipForm destination={TO} username="alice" {...props} />
    </ToastProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  wallet.current = connected();
  (sendTip as jest.Mock).mockResolvedValue({
    hash: "abcdef1234567890",
    amount: "10",
    asset: XLM,
    destination: TO,
  });
});

describe("TipForm — disconnected", () => {
  it("prompts for a wallet instead of showing the form", () => {
    const connect = jest.fn();
    wallet.current = { address: null, connected: false, connecting: false, connect };
    renderForm();

    expect(screen.getByRole("button", { name: "Connect Wallet" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Amount/)).not.toBeInTheDocument();
  });

  it("starts the connection flow", async () => {
    const connect = jest.fn();
    wallet.current = { address: null, connected: false, connecting: false, connect };
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Connect Wallet" }));
    expect(connect).toHaveBeenCalled();
  });
});

describe("TipForm — sending", () => {
  it("sends with the entered amount and destination", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Send Tip" }));

    await waitFor(() =>
      expect(sendTip).toHaveBeenCalledWith(
        expect.objectContaining({ from: FROM, to: TO, amount: "10", username: "alice" })
      )
    );
  });

  it("passes a memo through when one is typed", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Message/), "thanks");
    await user.click(screen.getByRole("button", { name: "Send Tip" }));

    await waitFor(() =>
      expect(sendTip).toHaveBeenCalledWith(expect.objectContaining({ memo: "thanks" }))
    );
  });

  it("applies a preset amount", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "25 XLM" }));
    await user.click(screen.getByRole("button", { name: "Send Tip" }));

    await waitFor(() =>
      expect(sendTip).toHaveBeenCalledWith(expect.objectContaining({ amount: "25" }))
    );
  });

  it("sends in the selected asset", async () => {
    const user = userEvent.setup();
    renderForm({ assets: [XLM, USDC] });

    await user.selectOptions(screen.getByLabelText("Asset"), `USDC:${USDC.issuer}`);
    await user.click(screen.getByRole("button", { name: "Send Tip" }));

    await waitFor(() =>
      expect(sendTip).toHaveBeenCalledWith(expect.objectContaining({ asset: USDC }))
    );
  });

  it("confirms success and links the transaction", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Send Tip" }));

    expect(await screen.findByText("Tip of 10 XLM sent.")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      expect.stringContaining("abcdef1234567890")
    );
  });

  it("reports a failure as a toast rather than a crash", async () => {
    (sendTip as jest.Mock).mockRejectedValue(new Error("Network is down"));
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Send Tip" }));
    expect(await screen.findByText("Network is down")).toBeInTheDocument();
  });

  it("notifies the caller with the transaction hash", async () => {
    const onSent = jest.fn();
    const user = userEvent.setup();
    renderForm({ onSent });

    await user.click(screen.getByRole("button", { name: "Send Tip" }));
    await waitFor(() => expect(onSent).toHaveBeenCalledWith("abcdef1234567890"));
  });
});

describe("TipForm — validation", () => {
  it("blocks submission on an invalid amount", async () => {
    const user = userEvent.setup();
    renderForm();

    const amount = screen.getByLabelText(/Amount/);
    await user.clear(amount);
    await user.type(amount, "-5");

    expect(screen.getByRole("button", { name: "Send Tip" })).toBeDisabled();
    expect(sendTip).not.toHaveBeenCalled();
  });

  it("blocks submission on an over-long memo", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Message/), "x".repeat(29));

    expect(screen.getByRole("button", { name: "Send Tip" })).toBeDisabled();
  });
});

describe("TipForm — network mismatch", () => {
  it("warns when the wallet is on another network", () => {
    wallet.current = connected({ networkMismatch: true });
    renderForm();
    expect(screen.getByText(/Wrong network/)).toBeInTheDocument();
  });

  it("stays quiet when the networks agree", () => {
    renderForm();
    expect(screen.queryByText(/Wrong network/)).not.toBeInTheDocument();
  });
});
