import {
  MAX_AMOUNT_DECIMALS,
  MAX_BIO_LENGTH,
  MAX_MEMO_BYTES,
  MIN_TIP_AMOUNT,
  PUBLIC_KEY_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "@/constants";

/** Result of a validation check: valid, or invalid with a display message. */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const VALID = Object.freeze<ValidationResult>({ valid: true });

function invalid(error: string): ValidationResult {
  return { valid: false, error };
}

/** Base32 alphabet used by Stellar's strkey encoding — no 0, 1, 8 or lowercase. */
const BASE32 = /^[A-Z2-7]+$/;

/**
 * Shape check for a Stellar public key. This validates the strkey *format*
 * only; it does not verify the checksum, so a typo in the middle of an address
 * still passes. Horizon rejects those at submission time.
 */
export function isValidStellarAddress(address: string): boolean {
  if (address.length !== PUBLIC_KEY_LENGTH) return false;
  if (!address.startsWith("G")) return false;
  return BASE32.test(address);
}

/** Validate a Stellar address with a message suitable for a form field. */
export function validateAddress(address: string): ValidationResult {
  if (!address) return invalid("Address is required");
  if (!isValidStellarAddress(address)) {
    return invalid("Enter a valid Stellar public key (starts with G, 56 characters)");
  }
  return VALID;
}

/** Validate a creator username against the shared username rules. */
export function validateUsername(username: string): ValidationResult {
  if (!username) return invalid("Username is required");
  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return invalid(
      `Username must be ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters`
    );
  }
  if (!USERNAME_PATTERN.test(username)) {
    return invalid("Use lowercase letters, numbers and hyphens only");
  }
  return VALID;
}

/** Validate a tip amount, optionally against the sender's available balance. */
export function validateAmount(amount: string, available?: string): ValidationResult {
  if (!amount.trim()) return invalid("Amount is required");

  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return invalid("Amount must be a number");
  if (parsed <= 0) return invalid("Amount must be greater than zero");
  if (parsed < MIN_TIP_AMOUNT) return invalid(`Amount must be at least ${MIN_TIP_AMOUNT}`);

  const decimals = amount.split(".")[1]?.length ?? 0;
  if (decimals > MAX_AMOUNT_DECIMALS) {
    return invalid(`At most ${MAX_AMOUNT_DECIMALS} decimal places`);
  }

  if (available !== undefined && parsed > Number(available)) {
    return invalid("Amount exceeds your available balance");
  }

  return VALID;
}

/** Validate a creator bio. Bios are optional, so an empty string passes. */
export function validateBio(bio: string): ValidationResult {
  if (bio.length > MAX_BIO_LENGTH) {
    return invalid(`Bio must be ${MAX_BIO_LENGTH} characters or less`);
  }
  return VALID;
}

/**
 * Validate a transaction memo. The 28-byte cap applies to the UTF-8 encoding,
 * not the character count, so an emoji costs four of those bytes.
 */
export function validateMemo(memo: string): ValidationResult {
  if (!memo) return VALID;
  const bytes = new TextEncoder().encode(memo).length;
  if (bytes > MAX_MEMO_BYTES) {
    return invalid(`Memo must be ${MAX_MEMO_BYTES} bytes or less (currently ${bytes})`);
  }
  return VALID;
}

/** Collapse several results into the first failure, or a pass if all succeed. */
export function firstError(...results: ValidationResult[]): string | undefined {
  return results.find((r) => !r.valid)?.error;
}
