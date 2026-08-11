import {
  ApiError,
  TimeoutError,
  TransactionError,
  extractResultCodes,
  isHorizonError,
  toUserMessage,
} from "@/lib/errors";

function horizonError(codes: { transaction?: string; operations?: string[] }) {
  return { response: { data: { extras: { result_codes: codes } } } };
}

describe("ApiError", () => {
  it("builds a default message from the status and path", () => {
    expect(new ApiError(500, "/creators").message).toBe("API error 500 for /creators");
  });

  it("classifies not-found and server errors", () => {
    expect(new ApiError(404, "/x").isNotFound).toBe(true);
    expect(new ApiError(404, "/x").isServerError).toBe(false);
    expect(new ApiError(503, "/x").isServerError).toBe(true);
  });
});

describe("extractResultCodes", () => {
  it("returns an empty array for a plain error", () => {
    expect(extractResultCodes(new Error("boom"))).toEqual([]);
  });

  it("collects transaction and operation codes", () => {
    const err = horizonError({ transaction: "tx_failed", operations: ["op_underfunded"] });
    expect(extractResultCodes(err)).toEqual(["tx_failed", "op_underfunded"]);
  });

  it("drops empty entries", () => {
    const err = horizonError({ operations: ["op_no_trust"] });
    expect(extractResultCodes(err)).toEqual(["op_no_trust"]);
  });
});

describe("isHorizonError", () => {
  it("is true only when result codes are present", () => {
    expect(isHorizonError(horizonError({ transaction: "tx_failed" }))).toBe(true);
    expect(isHorizonError(new Error("boom"))).toBe(false);
  });
});

describe("toUserMessage", () => {
  it("maps a known operation code", () => {
    const err = horizonError({ transaction: "tx_failed", operations: ["op_underfunded"] });
    expect(toUserMessage(err)).toBe("Your balance is too low to send this amount.");
  });

  it("maps a missing destination account", () => {
    const err = horizonError({ operations: ["op_no_destination"] });
    expect(toUserMessage(err)).toContain("does not exist");
  });

  it("falls back to the raw code when it is unrecognised", () => {
    const err = horizonError({ transaction: "tx_something_new" });
    expect(toUserMessage(err)).toContain("tx_something_new");
  });

  it("explains a timeout", () => {
    expect(toUserMessage(new TimeoutError("/creators", 15000))).toContain("took too long");
  });

  it("explains a 409 as a name clash", () => {
    expect(toUserMessage(new ApiError(409, "/creators"))).toBe("That name is already taken.");
  });

  it("explains a 404", () => {
    expect(toUserMessage(new ApiError(404, "/creators/x"))).toContain("could not find");
  });

  it("explains a server error", () => {
    expect(toUserMessage(new ApiError(500, "/creators"))).toContain("having trouble");
  });

  it("passes through a transaction error message", () => {
    expect(toUserMessage(new TransactionError("Nope"))).toBe("Nope");
  });

  it("recognises a wallet rejection", () => {
    expect(toUserMessage(new Error("User declined access"))).toBe(
      "You cancelled the request in your wallet."
    );
  });

  it("uses the fallback for a non-error value", () => {
    expect(toUserMessage("just a string", "fallback")).toBe("fallback");
  });
});
