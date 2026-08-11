import {
  assetKey,
  formatAmount,
  formatAssetAmount,
  formatAssetLabel,
  formatDate,
  formatDateTime,
  formatFiat,
  formatRelativeTime,
  isSameAsset,
  pluralize,
  truncateHash,
} from "@/utils/format";
import { XLM } from "@/constants";

const USDC = {
  code: "USDC",
  issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
};

describe("formatAmount", () => {
  it("formats an integer string", () => {
    expect(formatAmount("10")).toBe("10");
  });

  it("groups thousands", () => {
    expect(formatAmount(1234567)).toBe("1,234,567");
  });

  it("trims trailing zeros", () => {
    expect(formatAmount("1.5000000")).toBe("1.5");
  });

  it("falls back to zero for junk input", () => {
    expect(formatAmount("not-a-number")).toBe("0");
  });
});

describe("formatAssetAmount", () => {
  it("appends the asset code", () => {
    expect(formatAssetAmount("2.5", XLM)).toBe("2.5 XLM");
    expect(formatAssetAmount("2.5", USDC)).toBe("2.5 USDC");
  });
});

describe("formatAssetLabel", () => {
  it("shows the bare code for the native asset", () => {
    expect(formatAssetLabel(XLM)).toBe("XLM");
  });

  it("shows a truncated issuer for other assets", () => {
    expect(formatAssetLabel(USDC)).toBe("USDC:GA5Z…");
  });
});

describe("assetKey / isSameAsset", () => {
  it("builds a stable key", () => {
    expect(assetKey(XLM)).toBe("XLM:");
    expect(assetKey(USDC)).toBe(`USDC:${USDC.issuer}`);
  });

  it("compares code and issuer together", () => {
    expect(isSameAsset(XLM, { code: "XLM", issuer: "" })).toBe(true);
    expect(isSameAsset(USDC, { ...USDC, issuer: "GOTHER" })).toBe(false);
  });
});

describe("date formatting", () => {
  it("returns a dash for an invalid timestamp", () => {
    expect(formatDateTime("nonsense")).toBe("—");
    expect(formatDate("nonsense")).toBe("—");
  });

  it("formats a valid timestamp", () => {
    expect(formatDate("2024-01-15T10:00:00Z")).not.toBe("—");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2024-06-01T12:00:00Z");

  it("handles seconds", () => {
    expect(formatRelativeTime("2024-06-01T11:59:30Z", now)).toContain("30");
  });

  it("handles hours", () => {
    expect(formatRelativeTime("2024-06-01T09:00:00Z", now)).toContain("3");
  });

  it("handles days", () => {
    expect(formatRelativeTime("2024-05-29T12:00:00Z", now)).toContain("3");
  });

  it("handles future timestamps", () => {
    expect(formatRelativeTime("2024-06-01T13:00:00Z", now)).not.toBe("—");
  });

  it("returns a dash for an invalid timestamp", () => {
    expect(formatRelativeTime("nonsense", now)).toBe("—");
  });
});

describe("truncateHash", () => {
  it("truncates a long hash", () => {
    expect(truncateHash("abcdefghijklmnopqrstuvwxyz")).toBe("abcdefgh…wxyz");
  });

  it("leaves a short hash alone", () => {
    expect(truncateHash("abcdef")).toBe("abcdef");
  });
});

describe("formatFiat", () => {
  it("formats a USD value", () => {
    expect(formatFiat(12.5)).toContain("12.5");
  });

  it("returns a dash for a non-finite value", () => {
    expect(formatFiat(Number.NaN)).toBe("—");
  });
});

describe("pluralize", () => {
  it("uses the singular for one", () => {
    expect(pluralize(1, "tip")).toBe("1 tip");
  });

  it("uses the plural otherwise", () => {
    expect(pluralize(0, "tip")).toBe("0 tips");
    expect(pluralize(2, "tip")).toBe("2 tips");
  });

  it("accepts an irregular plural", () => {
    expect(pluralize(2, "entry", "entries")).toBe("2 entries");
  });
});
