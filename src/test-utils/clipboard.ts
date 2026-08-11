/**
 * Clipboard stubs for tests.
 *
 * jsdom exposes `navigator.clipboard` as a getter with no setter, so
 * `Object.assign` throws on the second write. `defineProperty` replaces it
 * cleanly and lets a test remove it again to exercise the unsupported path.
 */

/** Install a clipboard stub and return the `writeText` mock. */
export function stubClipboard(
  writeText: jest.Mock = jest.fn().mockResolvedValue(undefined)
): jest.Mock {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  return writeText;
}

/** Remove the clipboard stub, simulating a browser without the API. */
export function removeClipboard(): void {
  Object.defineProperty(navigator, "clipboard", {
    value: undefined,
    configurable: true,
    writable: true,
  });
}
