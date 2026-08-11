import { accountUrl, assetUrl, txUrl } from "@/utils/explorer";
import { XLM } from "@/constants";

const ADDRESS = "GCUEBHEXPVGMVQSBIPXJ3UD2XQ57IMDKLQG6AGZLRRRI63YDT2MFEQJL";
const USDC = { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" };

describe("explorer links", () => {
  it("points at the testnet explorer by default", () => {
    expect(txUrl("abc")).toContain("/explorer/testnet/");
  });

  it("builds a transaction link", () => {
    expect(txUrl("abc123")).toContain("/tx/abc123");
  });

  it("builds an account link", () => {
    expect(accountUrl(ADDRESS)).toContain(`/account/${ADDRESS}`);
  });

  it("builds a native asset link without an issuer", () => {
    expect(assetUrl(XLM)).toMatch(/\/asset\/XLM$/);
  });

  it("builds an issued asset link with code and issuer", () => {
    expect(assetUrl(USDC)).toContain(`/asset/USDC-${USDC.issuer}`);
  });
});
