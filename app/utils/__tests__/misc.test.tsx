import { describe, it, expect } from "vitest";
import { getDomainUrl } from "../misc";

describe("getDomainUrl", () => {
  it("should use X-Forwarded-Host header when available", () => {
    const request = new Request("http://example.com", {
      headers: {
        "X-Forwarded-Host": "forwarded-host.com",
        "X-Forwarded-Proto": "https"
      }
    });

    const result = getDomainUrl(request);

    expect(result).toBe("https://forwarded-host.com");
  });

  it("should fall back to URL host when no headers available", () => {
    const request = new Request("http://fallback-host.com/path");

    const result = getDomainUrl(request);

    expect(result).toBe("http://fallback-host.com");
  });

  it("should return a valid URL string", () => {
    const request = new Request("http://test.com");

    const result = getDomainUrl(request);

    // Should be a valid URL format
    expect(result).toMatch(/^https?:\/\/.+/);
    expect(() => new URL(result)).not.toThrow();
  });

  it("should handle path in URL", () => {
    const request = new Request("http://example.com/some/path?query=param");

    const result = getDomainUrl(request);

    // Should extract just the origin (protocol + host)
    expect(result).toMatch(/^https?:\/\/[^\/]+$/);
  });

  it("should respect X-Forwarded-Proto for protocol", () => {
    const request = new Request("http://example.com", {
      headers: {
        "X-Forwarded-Proto": "https"
      }
    });

    const result = getDomainUrl(request);

    expect(result).toMatch(/^https:/);
  });
});
