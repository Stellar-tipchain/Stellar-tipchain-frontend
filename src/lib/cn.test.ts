import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins class names with a space", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("drops empty strings", () => {
    expect(cn("a", "", "b")).toBe("a b");
  });

  it("drops numbers, which arrive from truthy ReactNode props", () => {
    expect(cn("a", 0, 1, "b")).toBe("a b");
  });

  it("returns an empty string when nothing survives", () => {
    expect(cn(false, undefined)).toBe("");
  });
});
