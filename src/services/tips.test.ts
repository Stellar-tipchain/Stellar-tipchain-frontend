import { sendTip, tipStatusLabel } from "@/services/tips";
import { buildPaymentTx, signAndSubmitTx } from "@/services/stellar";
import { getBalances } from "@/services/horizon";
import { api } from "@/services/api";
import { XLM } from "@/constants";
import type { TipStatus } from "@/types";

jest.mock("@/services/stellar", () => ({
  buildPaymentTx: jest.fn().mockResolvedValue("XDR"),
  signAndSubmitTx: jest.fn().mockResolvedValue("txhash"),
  toSdkAsset: jest.fn((asset: unknown) => asset),
}));

jest.mock("@/services/horizon", () => ({
  getBalances: jest.fn(),
  availableBalance: jest.requireActual("@/services/horizon").availableBalance,
}));

jest.mock("@/services/api", () => ({
  api: { recordTip: jest.fn().mockResolvedValue({ id: "1" }) },
}));

const FROM = "GCUEBHEXPVGMVQSBIPXJ3UD2XQ57IMDKLQG6AGZLRRRI63YDT2MFEQJL";
const TO = "GDCYQATDNK4S6DC4W2GZTNMSXERGTP3VGKTQVJI5Y4XRRWOVAEQRALQL";

const funded = [{ asset: XLM, balance: "100" }];

function params(overrides: Partial<Parameters<typeof sendTip>[0]> = {}) {
  return { from: FROM, to: TO, amount: "10", asset: XLM, ...overrides };
}

beforeEach(() => {
  jest.clearAllMocks();
  (getBalances as jest.Mock).mockResolvedValue(funded);
  (signAndSubmitTx as jest.Mock).mockResolvedValue("txhash");
  (buildPaymentTx as jest.Mock).mockResolvedValue("XDR");
});

describe("sendTip", () => {
  it("returns a receipt for a successful tip", async () => {
    await expect(sendTip(params())).resolves.toEqual({
      hash: "txhash",
      amount: "10",
      asset: XLM,
      destination: TO,
    });
  });

  it("rejects an invalid amount before touching the network", async () => {
    await expect(sendTip(params({ amount: "0" }))).rejects.toThrow(/greater than zero/);
    expect(getBalances).not.toHaveBeenCalled();
  });

  it("rejects an over-long memo before touching the network", async () => {
    await expect(sendTip(params({ memo: "x".repeat(29) }))).rejects.toThrow(/28 bytes/);
    expect(getBalances).not.toHaveBeenCalled();
  });

  it("refuses to open the wallet when the balance is too low", async () => {
    (getBalances as jest.Mock).mockResolvedValue([{ asset: XLM, balance: "1" }]);
    await expect(sendTip(params())).rejects.toThrow(/less than 10/);
    expect(signAndSubmitTx).not.toHaveBeenCalled();
  });

  it("checks the balance of the selected asset, not just XLM", async () => {
    const usdc = { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" };
    (getBalances as jest.Mock).mockResolvedValue([{ asset: XLM, balance: "1000" }]);
    await expect(sendTip(params({ asset: usdc }))).rejects.toThrow(/USDC balance is 0/);
  });

  it("forwards the memo to the transaction builder", async () => {
    await sendTip(params({ memo: "thanks" }));
    expect(buildPaymentTx).toHaveBeenCalledWith(expect.objectContaining({ memo: "thanks" }));
  });

  it("reports each stage in order", async () => {
    const seen: TipStatus[] = [];
    await sendTip(params({ onStatus: (s) => seen.push(s) }));
    expect(seen).toEqual(["building", "signing", "submitting", "success"]);
  });

  it("records the tip against the creator once it settles", async () => {
    await sendTip(params({ username: "alice" }));
    expect(api.recordTip).toHaveBeenCalledWith({
      to: "alice",
      amount: "10",
      assetCode: "XLM",
      txHash: "txhash",
    });
  });

  it("skips bookkeeping when no username is known", async () => {
    await sendTip(params());
    expect(api.recordTip).not.toHaveBeenCalled();
  });

  it("still succeeds when bookkeeping fails, since the payment is already final", async () => {
    (api.recordTip as jest.Mock).mockRejectedValue(new Error("backend down"));
    await expect(sendTip(params({ username: "alice" }))).resolves.toMatchObject({
      hash: "txhash",
    });
  });

  it("propagates a submission failure", async () => {
    (signAndSubmitTx as jest.Mock).mockRejectedValue(new Error("tx_failed"));
    await expect(sendTip(params())).rejects.toThrow("tx_failed");
  });
});

describe("tipStatusLabel", () => {
  it("describes each in-flight stage", () => {
    expect(tipStatusLabel("building")).toMatch(/Preparing/);
    expect(tipStatusLabel("signing")).toMatch(/wallet/);
    expect(tipStatusLabel("submitting")).toMatch(/network/);
  });

  it("is empty when idle", () => {
    expect(tipStatusLabel("idle")).toBe("");
  });
});
