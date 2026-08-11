/**
 * Error types and message mapping.
 *
 * Horizon and Freighter both fail with structured but unfriendly payloads.
 * Everything user-facing goes through `toUserMessage` so pages never surface a
 * raw result code such as `op_underfunded`.
 */

/** An error carrying an HTTP status from the backend API. */
export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string, message?: string) {
    super(message ?? `API error ${status} for ${path}`);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }

  /** True when the resource simply does not exist, which callers often expect. */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** True when the failure is a server fault and a retry may succeed. */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/** Raised when a request exceeds its timeout budget. */
export class TimeoutError extends Error {
  constructor(path: string, ms: number) {
    super(`Request to ${path} timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

/** Raised when a transaction cannot be built, signed or submitted. */
export class TransactionError extends Error {
  readonly codes: string[];

  constructor(message: string, codes: string[] = []) {
    super(message);
    this.name = "TransactionError";
    this.codes = codes;
  }
}

/** Horizon result codes, keyed to the message shown to the user. */
const RESULT_CODE_MESSAGES: Record<string, string> = {
  tx_insufficient_balance: "Your balance is too low to cover the tip and network fee.",
  tx_bad_auth: "The transaction signature was rejected. Try connecting your wallet again.",
  tx_too_late: "The transaction expired before it reached the network. Please try again.",
  tx_bad_seq: "Your account sequence is out of date. Refresh the page and try again.",
  op_underfunded: "Your balance is too low to send this amount.",
  op_no_destination: "The recipient account does not exist on this network yet.",
  op_no_trust: "The recipient has not opted in to this asset.",
  op_line_full: "The recipient cannot hold any more of this asset.",
  op_malformed: "The payment details are invalid.",
};

interface HorizonErrorShape {
  response?: { data?: { extras?: { result_codes?: { transaction?: string; operations?: string[] } } } };
}

/** Pull Horizon's result codes out of a thrown error, if it carries any. */
export function extractResultCodes(err: unknown): string[] {
  const extras = (err as HorizonErrorShape)?.response?.data?.extras?.result_codes;
  if (!extras) return [];
  return [extras.transaction, ...(extras.operations ?? [])].filter(
    (code): code is string => typeof code === "string" && code.length > 0
  );
}

/** True when the error carries a Horizon result-code payload. */
export function isHorizonError(err: unknown): boolean {
  return extractResultCodes(err).length > 0;
}

/** Translate any thrown value into a message that is safe to show a user. */
export function toUserMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const codes = extractResultCodes(err);
  for (const code of codes) {
    const message = RESULT_CODE_MESSAGES[code];
    if (message) return message;
  }
  if (codes.length > 0) return `Transaction rejected by the network (${codes[0]}).`;

  if (err instanceof TimeoutError) return "The request took too long. Check your connection and try again.";
  if (err instanceof ApiError) {
    if (err.isNotFound) return "We could not find what you were looking for.";
    if (err.status === 409) return "That name is already taken.";
    if (err.isServerError) return "The server is having trouble. Please try again shortly.";
    return err.message;
  }
  if (err instanceof TransactionError) return err.message;

  if (err instanceof Error) {
    // Freighter rejects with a plain Error when the user dismisses the popup.
    if (/user (declined|rejected)/i.test(err.message)) return "You cancelled the request in your wallet.";
    return err.message || fallback;
  }

  return fallback;
}
