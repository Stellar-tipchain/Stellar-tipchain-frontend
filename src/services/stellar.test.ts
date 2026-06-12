import * as StellarSdk from "stellar-sdk";
import { buildPaymentTx, signAndSubmitTx } from "@/services/stellar";

jest.mock("@stellar/freighter-api", () => ({
  signTransaction: jest.fn().mockImplementation((xdr: string) => Promise.resolve(xdr)),
}));

jest.mock("stellar-sdk", () => {
  const actual = jest.requireActual<typeof StellarSdk>("stellar-sdk");
  const loadAccount = jest.fn();
  const submitTransaction = jest.fn();
  return {
    ...actual,
    __mocks: { loadAccount, submitTransaction },
    Horizon: {
      ...actual.Horizon,
      Server: jest.fn().mockImplementation(() => ({ loadAccount, submitTransaction })),
    },
  };
});

function getMocks() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (StellarSdk as any).__mocks as {
    loadAccount: jest.Mock;
    submitTransaction: jest.Mock;
  };
}

const FROM = "GCUEBHEXPVGMVQSBIPXJ3UD2XQ57IMDKLQG6AGZLRRRI63YDT2MFEQJL";
const TO   = "GDCYQATDNK4S6DC4W2GZTNMSXERGTP3VGKTQVJI5Y4XRRWOVAEQRALQL";
const fakeAccount = new StellarSdk.Account(FROM, "100");

beforeEach(() => {
  jest.clearAllMocks();
  getMocks().loadAccount.mockResolvedValue(fakeAccount);
  getMocks().submitTransaction.mockResolvedValue({ hash: "abcdef1234567890" });
});

describe("buildPaymentTx", () => {
  it("builds a valid XDR string for an XLM payment", async () => {
    const xdr = await buildPaymentTx(FROM, TO, "10");
    expect(typeof xdr).toBe("string");
    expect(xdr.length).toBeGreaterThan(0);
    const tx = StellarSdk.TransactionBuilder.fromXDR(xdr, StellarSdk.Networks.TESTNET) as StellarSdk.Transaction;
    expect(tx.operations[0].type).toBe("payment");
  });

  it("throws when Horizon loadAccount fails", async () => {
    getMocks().loadAccount.mockRejectedValue(new Error("Not found"));
    await expect(buildPaymentTx(FROM, TO, "10")).rejects.toThrow("Not found");
  });
});

describe("signAndSubmitTx", () => {
  it("returns the transaction hash on success", async () => {
    const xdr = await buildPaymentTx(FROM, TO, "10");
    const hash = await signAndSubmitTx(xdr);
    expect(hash).toBe("abcdef1234567890");
  });
});
