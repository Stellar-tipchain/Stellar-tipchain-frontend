import { truncateAddress, formatXLM } from "@/utils";

describe("truncateAddress", () => {
  it("truncates a normal address", () => {
    expect(truncateAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe("GABC…WXYZ");
  });

  it("returns the address unchanged when shorter than threshold", () => {
    expect(truncateAddress("GABC")).toBe("GABC");
  });

  it("respects custom chars param", () => {
    expect(truncateAddress("GABCDEFGHIJ", 2)).toBe("GA…IJ");
  });
});

describe("formatXLM", () => {
  it("formats an integer", () => {
    expect(formatXLM(10)).toBe("10 XLM");
  });

  it("formats a decimal", () => {
    expect(formatXLM(1.5)).toBe("1.5 XLM");
  });

  it("formats a large number", () => {
    expect(formatXLM(1000000)).toBe("1,000,000 XLM");
  });
});
