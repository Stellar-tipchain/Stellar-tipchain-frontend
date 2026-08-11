import {
  firstError,
  isValidStellarAddress,
  validateAddress,
  validateAmount,
  validateBio,
  validateMemo,
  validateUsername,
} from "@/utils/validation";

const VALID_ADDRESS = "GCUEBHEXPVGMVQSBIPXJ3UD2XQ57IMDKLQG6AGZLRRRI63YDT2MFEQJL";

describe("isValidStellarAddress", () => {
  it("accepts a well-formed public key", () => {
    expect(isValidStellarAddress(VALID_ADDRESS)).toBe(true);
  });

  it("rejects a key of the wrong length", () => {
    expect(isValidStellarAddress(VALID_ADDRESS.slice(0, 55))).toBe(false);
  });

  it("rejects a secret key", () => {
    expect(isValidStellarAddress(`S${VALID_ADDRESS.slice(1)}`)).toBe(false);
  });

  it("rejects characters outside the base32 alphabet", () => {
    expect(isValidStellarAddress(`${VALID_ADDRESS.slice(0, 55)}0`)).toBe(false);
    expect(isValidStellarAddress(`${VALID_ADDRESS.slice(0, 55)}a`)).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidStellarAddress("")).toBe(false);
  });
});

describe("validateAddress", () => {
  it("passes a valid address", () => {
    expect(validateAddress(VALID_ADDRESS)).toEqual({ valid: true });
  });

  it("reports a missing address", () => {
    expect(validateAddress("").error).toBe("Address is required");
  });

  it("reports a malformed address", () => {
    expect(validateAddress("not-an-address").valid).toBe(false);
  });
});

describe("validateUsername", () => {
  it("accepts a valid username", () => {
    expect(validateUsername("alice-99").valid).toBe(true);
  });

  it("rejects an empty username", () => {
    expect(validateUsername("").error).toBe("Username is required");
  });

  it("rejects a username that is too short", () => {
    expect(validateUsername("ab").valid).toBe(false);
  });

  it("rejects a username that is too long", () => {
    expect(validateUsername("a".repeat(21)).valid).toBe(false);
  });

  it("rejects uppercase and punctuation", () => {
    expect(validateUsername("Alice").valid).toBe(false);
    expect(validateUsername("alice_99").valid).toBe(false);
  });
});

describe("validateAmount", () => {
  it("accepts a plain amount", () => {
    expect(validateAmount("10").valid).toBe(true);
  });

  it("accepts seven decimal places", () => {
    expect(validateAmount("0.1234567").valid).toBe(true);
  });

  it("rejects eight decimal places", () => {
    expect(validateAmount("0.12345678").valid).toBe(false);
  });

  it("rejects zero and negative amounts", () => {
    expect(validateAmount("0").valid).toBe(false);
    expect(validateAmount("-5").valid).toBe(false);
  });

  it("rejects non-numeric input", () => {
    expect(validateAmount("abc").error).toBe("Amount must be a number");
  });

  it("rejects an empty amount", () => {
    expect(validateAmount("   ").error).toBe("Amount is required");
  });

  it("rejects an amount above the available balance", () => {
    expect(validateAmount("100", "50").error).toBe("Amount exceeds your available balance");
  });

  it("accepts an amount equal to the available balance", () => {
    expect(validateAmount("50", "50").valid).toBe(true);
  });
});

describe("validateBio", () => {
  it("accepts an empty bio", () => {
    expect(validateBio("").valid).toBe(true);
  });

  it("accepts a bio at the limit", () => {
    expect(validateBio("x".repeat(160)).valid).toBe(true);
  });

  it("rejects a bio over the limit", () => {
    expect(validateBio("x".repeat(161)).valid).toBe(false);
  });
});

describe("validateMemo", () => {
  it("accepts an empty memo", () => {
    expect(validateMemo("").valid).toBe(true);
  });

  it("accepts 28 ASCII characters", () => {
    expect(validateMemo("x".repeat(28)).valid).toBe(true);
  });

  it("rejects 29 ASCII characters", () => {
    expect(validateMemo("x".repeat(29)).valid).toBe(false);
  });

  it("counts bytes rather than characters", () => {
    // Each emoji is four UTF-8 bytes, so eight of them exceed the 28-byte cap.
    expect(validateMemo("🚀".repeat(8)).valid).toBe(false);
  });
});

describe("firstError", () => {
  it("returns undefined when everything passes", () => {
    expect(firstError(validateAmount("1"), validateBio(""))).toBeUndefined();
  });

  it("returns the first failure in order", () => {
    expect(firstError(validateAmount("1"), validateUsername(""))).toBe("Username is required");
  });
});
