import { renderHook, act } from "@testing-library/react";
import { useWallet } from "@/hooks/useWallet";

const mockIsConnected = jest.fn();
const mockSetAllowed = jest.fn();
const mockGetPublicKey = jest.fn();

jest.mock("@stellar/freighter-api", () => ({
  isConnected: (...args: unknown[]) => mockIsConnected(...args),
  setAllowed: (...args: unknown[]) => mockSetAllowed(...args),
  getPublicKey: (...args: unknown[]) => mockGetPublicKey(...args),
}));

beforeEach(() => jest.clearAllMocks());

describe("useWallet", () => {
  it("connect success: returns public key", async () => {
    mockIsConnected.mockResolvedValue(true);
    mockSetAllowed.mockResolvedValue(undefined);
    mockGetPublicKey.mockResolvedValue("GABCD...WXYZ");

    const { result } = renderHook(() => useWallet());
    await act(() => result.current.connect());

    expect(result.current.address).toBe("GABCD...WXYZ");
    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("connect failure when Freighter not installed: sets error state", async () => {
    mockIsConnected.mockResolvedValue(false);

    const { result } = renderHook(() => useWallet());
    await act(() => result.current.connect());

    expect(result.current.address).toBeNull();
    expect(result.current.connected).toBe(false);
    expect(result.current.error).toMatch(/Freighter/);
  });

  it("disconnect: clears address", async () => {
    mockIsConnected.mockResolvedValue(true);
    mockSetAllowed.mockResolvedValue(undefined);
    mockGetPublicKey.mockResolvedValue("GABCD...WXYZ");

    const { result } = renderHook(() => useWallet());
    await act(() => result.current.connect());
    expect(result.current.connected).toBe(true);

    act(() => result.current.disconnect());
    expect(result.current.address).toBeNull();
    expect(result.current.connected).toBe(false);
  });
});
