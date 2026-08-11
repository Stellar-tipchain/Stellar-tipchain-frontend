import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WalletProvider from "@/components/WalletProvider";
import { useWallet } from "@/hooks/useWallet";
import { STORAGE_KEYS } from "@/constants";

const mockIsConnected = jest.fn();
const mockIsAllowed = jest.fn();
const mockSetAllowed = jest.fn();
const mockGetPublicKey = jest.fn();
const mockGetNetwork = jest.fn();

jest.mock("@stellar/freighter-api", () => ({
  isConnected: (...args: unknown[]) => mockIsConnected(...args),
  isAllowed: (...args: unknown[]) => mockIsAllowed(...args),
  setAllowed: (...args: unknown[]) => mockSetAllowed(...args),
  getPublicKey: (...args: unknown[]) => mockGetPublicKey(...args),
  getNetwork: (...args: unknown[]) => mockGetNetwork(...args),
}));

const ADDRESS = "GCUEBHEXPVGMVQSBIPXJ3UD2XQ57IMDKLQG6AGZLRRRI63YDT2MFEQJL";

function Probe() {
  const { address, connected, error, networkMismatch, connect, disconnect } = useWallet();
  return (
    <>
      <span data-testid="address">{address ?? "none"}</span>
      <span data-testid="connected">{String(connected)}</span>
      <span data-testid="error">{error ?? "none"}</span>
      <span data-testid="mismatch">{String(networkMismatch)}</span>
      <button onClick={connect}>connect</button>
      <button onClick={disconnect}>disconnect</button>
    </>
  );
}

function renderWallet() {
  return render(
    <WalletProvider>
      <Probe />
    </WalletProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  mockGetNetwork.mockResolvedValue("TESTNET");
});

describe("WalletProvider — connecting", () => {
  it("stores the public key on a successful connect", async () => {
    mockIsConnected.mockResolvedValue(true);
    mockSetAllowed.mockResolvedValue(undefined);
    mockGetPublicKey.mockResolvedValue(ADDRESS);

    const user = userEvent.setup();
    renderWallet();
    await user.click(screen.getByRole("button", { name: "connect" }));

    await waitFor(() => expect(screen.getByTestId("connected")).toHaveTextContent("true"));
    expect(screen.getByTestId("address")).toHaveTextContent(ADDRESS);
  });

  it("persists the address so the session survives a reload", async () => {
    mockIsConnected.mockResolvedValue(true);
    mockSetAllowed.mockResolvedValue(undefined);
    mockGetPublicKey.mockResolvedValue(ADDRESS);

    const user = userEvent.setup();
    renderWallet();
    await user.click(screen.getByRole("button", { name: "connect" }));

    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEYS.wallet)).toBe(ADDRESS)
    );
  });

  it("reports a missing extension", async () => {
    mockIsConnected.mockResolvedValue(false);

    const user = userEvent.setup();
    renderWallet();
    await user.click(screen.getByRole("button", { name: "connect" }));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent(/Freighter extension not found/)
    );
    expect(screen.getByTestId("connected")).toHaveTextContent("false");
  });

  it("explains a rejection from the wallet popup", async () => {
    mockIsConnected.mockResolvedValue(true);
    mockSetAllowed.mockRejectedValue(new Error("User declined access"));

    const user = userEvent.setup();
    renderWallet();
    await user.click(screen.getByRole("button", { name: "connect" }));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent(/cancelled the request/)
    );
  });
});

describe("WalletProvider — disconnecting", () => {
  it("clears state and stored address", async () => {
    mockIsConnected.mockResolvedValue(true);
    mockSetAllowed.mockResolvedValue(undefined);
    mockGetPublicKey.mockResolvedValue(ADDRESS);

    const user = userEvent.setup();
    renderWallet();
    await user.click(screen.getByRole("button", { name: "connect" }));
    await waitFor(() => expect(screen.getByTestId("connected")).toHaveTextContent("true"));

    await user.click(screen.getByRole("button", { name: "disconnect" }));

    expect(screen.getByTestId("connected")).toHaveTextContent("false");
    expect(window.localStorage.getItem(STORAGE_KEYS.wallet)).toBeNull();
  });
});

describe("WalletProvider — session restore", () => {
  it("reconnects silently when access is still granted", async () => {
    window.localStorage.setItem(STORAGE_KEYS.wallet, ADDRESS);
    mockIsConnected.mockResolvedValue(true);
    mockIsAllowed.mockResolvedValue(true);
    mockGetPublicKey.mockResolvedValue(ADDRESS);

    renderWallet();

    await waitFor(() => expect(screen.getByTestId("address")).toHaveTextContent(ADDRESS));
    // Restoring must not re-prompt the user.
    expect(mockSetAllowed).not.toHaveBeenCalled();
  });

  it("forgets the address when access has been revoked", async () => {
    window.localStorage.setItem(STORAGE_KEYS.wallet, ADDRESS);
    mockIsConnected.mockResolvedValue(true);
    mockIsAllowed.mockResolvedValue(false);

    renderWallet();

    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEYS.wallet)).toBeNull()
    );
    expect(screen.getByTestId("connected")).toHaveTextContent("false");
  });

  it("does nothing when there is no stored address", async () => {
    renderWallet();
    await waitFor(() => expect(screen.getByTestId("connected")).toHaveTextContent("false"));
    expect(mockIsAllowed).not.toHaveBeenCalled();
  });
});

describe("WalletProvider — network check", () => {
  it("accepts a wallet on the configured network", async () => {
    mockIsConnected.mockResolvedValue(true);
    mockSetAllowed.mockResolvedValue(undefined);
    mockGetPublicKey.mockResolvedValue(ADDRESS);
    mockGetNetwork.mockResolvedValue("TESTNET");

    const user = userEvent.setup();
    renderWallet();
    await user.click(screen.getByRole("button", { name: "connect" }));

    await waitFor(() => expect(screen.getByTestId("mismatch")).toHaveTextContent("false"));
  });

  it("flags a wallet pointed at the wrong network", async () => {
    mockIsConnected.mockResolvedValue(true);
    mockSetAllowed.mockResolvedValue(undefined);
    mockGetPublicKey.mockResolvedValue(ADDRESS);
    mockGetNetwork.mockResolvedValue("PUBLIC");

    const user = userEvent.setup();
    renderWallet();
    await user.click(screen.getByRole("button", { name: "connect" }));

    await waitFor(() => expect(screen.getByTestId("mismatch")).toHaveTextContent("true"));
  });
});

describe("useWallet", () => {
  it("throws when used outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/must be used inside a WalletProvider/);
    spy.mockRestore();
  });
});
