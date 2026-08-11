import {
  accountExists,
  availableBalance,
  getBalances,
  getPaymentHistory,
} from "@/services/horizon";
import { PAGE_SIZE, XLM } from "@/constants";

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

const ME = "GCUEBHEXPVGMVQSBIPXJ3UD2XQ57IMDKLQG6AGZLRRRI63YDT2MFEQJL";
const THEM = "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37";
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

function ok(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response;
}
const notFound = { ok: false, status: 404, json: async () => ({}) } as Response;

function payment(overrides: Record<string, unknown> = {}) {
  return {
    type: "payment",
    created_at: "2024-01-01T00:00:00Z",
    amount: "10",
    from: THEM,
    to: ME,
    paging_token: "1",
    transaction_hash: "hash1",
    asset_type: "native",
    ...overrides,
  };
}

beforeEach(() => fetchMock.mockReset());

describe("getPaymentHistory", () => {
  it("returns an empty page for an unfunded account", async () => {
    fetchMock.mockResolvedValue(notFound);
    await expect(getPaymentHistory(ME)).resolves.toEqual({ records: [], nextCursor: null });
  });

  it("throws on a non-404 Horizon failure", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as Response);
    await expect(getPaymentHistory(ME)).rejects.toThrow("Horizon error 500");
  });

  it("marks incoming and outgoing payments", async () => {
    fetchMock.mockResolvedValue(
      ok({ _embedded: { records: [payment(), payment({ to: THEM, from: ME, paging_token: "2" })] } })
    );

    const { records } = await getPaymentHistory(ME);
    expect(records[0].direction).toBe("received");
    expect(records[0].counterpart).toBe(THEM);
    expect(records[1].direction).toBe("sent");
    expect(records[1].counterpart).toBe(THEM);
  });

  it("keeps issued-asset payments, not only XLM", async () => {
    fetchMock.mockResolvedValue(
      ok({
        _embedded: {
          records: [
            payment(),
            payment({
              paging_token: "2",
              asset_type: "credit_alphanum4",
              asset_code: "USDC",
              asset_issuer: USDC_ISSUER,
            }),
          ],
        },
      })
    );

    const { records } = await getPaymentHistory(ME);
    expect(records).toHaveLength(2);
    expect(records[1].asset).toEqual({ code: "USDC", issuer: USDC_ISSUER });
  });

  it("drops non-payment operations such as account creation", async () => {
    fetchMock.mockResolvedValue(
      ok({ _embedded: { records: [payment(), { type: "create_account", paging_token: "2" }] } })
    );
    expect((await getPaymentHistory(ME)).records).toHaveLength(1);
  });

  it("stops paging when a partial page comes back", async () => {
    fetchMock.mockResolvedValue(ok({ _embedded: { records: [payment()] } }));
    expect((await getPaymentHistory(ME)).nextCursor).toBeNull();
  });

  it("offers a cursor when the page is full", async () => {
    const records = Array.from({ length: PAGE_SIZE }, (_, i) =>
      payment({ paging_token: String(i + 1) })
    );
    fetchMock.mockResolvedValue(ok({ _embedded: { records } }));
    expect((await getPaymentHistory(ME)).nextCursor).toBe(String(PAGE_SIZE));
  });

  it("passes the cursor through to Horizon", async () => {
    fetchMock.mockResolvedValue(ok({ _embedded: { records: [] } }));
    await getPaymentHistory(ME, "abc");
    expect(fetchMock.mock.calls[0][0]).toContain("cursor=abc");
  });
});

describe("getBalances", () => {
  it("returns an empty list for an unfunded account", async () => {
    fetchMock.mockResolvedValue(notFound);
    await expect(getBalances(ME)).resolves.toEqual([]);
  });

  it("maps native and issued balances", async () => {
    fetchMock.mockResolvedValue(
      ok({
        balances: [
          { asset_type: "native", balance: "100.5" },
          {
            asset_type: "credit_alphanum4",
            asset_code: "USDC",
            asset_issuer: USDC_ISSUER,
            balance: "20",
          },
        ],
      })
    );

    const balances = await getBalances(ME);
    expect(balances[0]).toEqual({ asset: XLM, balance: "100.5", locked: undefined });
    expect(balances[1].asset.code).toBe("USDC");
  });

  it("ignores liquidity pool shares, which cannot be tipped", async () => {
    fetchMock.mockResolvedValue(
      ok({ balances: [{ asset_type: "liquidity_pool_shares", balance: "5" }] })
    );
    await expect(getBalances(ME)).resolves.toEqual([]);
  });
});

describe("availableBalance", () => {
  const balances = [
    { asset: XLM, balance: "100", locked: "40" },
    { asset: { code: "USDC", issuer: USDC_ISSUER }, balance: "20" },
  ];

  it("subtracts selling liabilities", () => {
    expect(availableBalance(balances, XLM)).toBe("60");
  });

  it("returns the full balance when nothing is locked", () => {
    expect(availableBalance(balances, { code: "USDC", issuer: USDC_ISSUER })).toBe("20");
  });

  it("returns zero for an asset the account does not hold", () => {
    expect(availableBalance(balances, { code: "EURC", issuer: "GXYZ" })).toBe("0");
  });

  it("never returns a negative balance", () => {
    expect(availableBalance([{ asset: XLM, balance: "10", locked: "50" }], XLM)).toBe("0");
  });
});

describe("accountExists", () => {
  it("is false for a 404", async () => {
    fetchMock.mockResolvedValue(notFound);
    await expect(accountExists(ME)).resolves.toBe(false);
  });

  it("is true when Horizon returns the account", async () => {
    fetchMock.mockResolvedValue(ok({ balances: [] }));
    await expect(accountExists(ME)).resolves.toBe(true);
  });
});
