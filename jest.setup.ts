import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

// jsdom does not provide TextEncoder/TextDecoder, but browsers do — and code
// under test (memo byte counting, stellar-sdk) relies on them. Bridge them in
// from Node so the test environment matches the runtime one.
Object.assign(globalThis, {
  TextEncoder: globalThis.TextEncoder ?? TextEncoder,
  TextDecoder: globalThis.TextDecoder ?? TextDecoder,
});
