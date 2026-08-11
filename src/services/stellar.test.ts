import * as StellarSdk from "stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import {
  buildPaymentTx,
  minimumReserve,
  signAndSubmitTx,
  toSdkAsset,
} from "@/services/stellar";
import { XLM } from "@/constants";

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
const TO = "GDCYQATDNK4S6DC4W2GZTNMSXERGTP3VGKTQVJI5Y4XRRWOVAEQRALQL";
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

function parse(xdr: string): StellarSdk.Transaction {
  return StellarSdk.TransactionBuilder.fromXDR(
    xdr,
    StellarSdk.Networks.TESTNET
  ) as StellarSdk.Transaction;
}

beforeEach(() => {
  jest.clearAllMocks();
  // A fresh Account per test: building a transaction bumps its sequence number.
  getMocks().loadAccount.mockResolvedValue(new StellarSdk.Account(FROM, "100"));
  getMocks().submitTransaction.mockResolvedValue({ hash: "abcdef1234567890" });
});

describe("toSdkAsset", () => {
  it("maps an empty issuer to the native asset", () => {
    expect(toSdkAsset(XLM).isNative()).toBe(true);
  });

  it("maps an issued asset to a credit asset", () => {
    const asset = toSdkAsset({ code: "USDC", issuer: USDC_ISSUER });
    expect(asset.getCode()).toBe("USDC");
    expect(asset.getIssuer()).toBe(USDC_ISSUER);
  });
});

describe("buildPaymentTx", () => {
  it("builds a payment operation", async () => {
    const tx = parse(await buildPaymentTx({ from: FROM, to: TO, amount: "10" }));
    expect(tx.operations[0].type).toBe("payment");
  });

  it("sets the destination and amount", async () => {
    const tx = parse(await buildPaymentTx({ from: FROM, to: TO, amount: "10" }));
    const op = tx.operations[0] as StellarSdk.Operation.Payment;
    expect(op.destination).toBe(TO);
    // The XDR round trip normalises amounts to seven decimal places.
    expect(op.amount).toBe("10.0000000");
  });

  it("defaults to a native payment", async () => {
    const tx = parse(await buildPaymentTx({ from: FROM, to: TO, amount: "10" }));
    const op = tx.operations[0] as StellarSdk.Operation.Payment;
    expect(op.asset.isNative()).toBe(true);
  });

  it("carries an issued asset through", async () => {
    const tx = parse(
      await buildPaymentTx({
        from: FROM,
        to: TO,
        amount: "10",
        asset: new StellarSdk.Asset("USDC", USDC_ISSUER),
      })
    );
    const op = tx.operations[0] as StellarSdk.Operation.Payment;
    expect(op.asset.getCode()).toBe("USDC");
  });

  it("attaches a text memo when one is given", async () => {
    const tx = parse(await buildPaymentTx({ from: FROM, to: TO, amount: "10", memo: "thanks" }));
    expect(tx.memo.type).toBe("text");
    expect(tx.memo.value?.toString()).toBe("thanks");
  });

  it("omits the memo when it is empty", async () => {
    const tx = parse(await buildPaymentTx({ from: FROM, to: TO, amount: "10", memo: "" }));
    expect(tx.memo.type).toBe("none");
  });

  it("reloads the account so the sequence number stays current", async () => {
    await buildPaymentTx({ from: FROM, to: TO, amount: "10" });
    await buildPaymentTx({ from: FROM, to: TO, amount: "10" });
    expect(getMocks().loadAccount).toHaveBeenCalledTimes(2);
  });

  it("propagates a Horizon failure", async () => {
    getMocks().loadAccount.mockRejectedValue(new Error("Not found"));
    await expect(buildPaymentTx({ from: FROM, to: TO, amount: "10" })).rejects.toThrow("Not found");
  });
});

describe("signAndSubmitTx", () => {
  it("returns the transaction hash", async () => {
    const xdr = await buildPaymentTx({ from: FROM, to: TO, amount: "10" });
    await expect(signAndSubmitTx(xdr)).resolves.toBe("abcdef1234567890");
  });

  it("signs with the configured network passphrase", async () => {
    const xdr = await buildPaymentTx({ from: FROM, to: TO, amount: "10" });
    await signAndSubmitTx(xdr);
    expect(signTransaction).toHaveBeenCalledWith(xdr, {
      networkPassphrase: StellarSdk.Networks.TESTNET,
    });
  });

  it("throws when the network returns no hash", async () => {
    getMocks().submitTransaction.mockResolvedValue({});
    const xdr = await buildPaymentTx({ from: FROM, to: TO, amount: "10" });
    await expect(signAndSubmitTx(xdr)).rejects.toThrow("returned no hash");
  });

  it("propagates a submission failure", async () => {
    getMocks().submitTransaction.mockRejectedValue(new Error("tx_failed"));
    const xdr = await buildPaymentTx({ from: FROM, to: TO, amount: "10" });
    await expect(signAndSubmitTx(xdr)).rejects.toThrow("tx_failed");
  });
});

describe("minimumReserve", () => {
  it("is 1 XLM for an account with no subentries", () => {
    expect(minimumReserve(0)).toBe(1);
  });

  it("adds half an XLM per subentry", () => {
    expect(minimumReserve(2)).toBe(2);
  });
});
