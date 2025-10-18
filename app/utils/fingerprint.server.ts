import { createCookie } from "react-router";

export const fingerprintCookie = createCookie("user-fingerprint", {
  maxAge: 60 * 60 * 24 * 365, // 1 year
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

/**
 * Generate a server-side fingerprint from request headers
 */
export function makeServerFingerprint(request: Request): string {
  const ua = request.headers.get("user-agent") || "";
  const lang = request.headers.get("accept-language")?.split(",")[0] || "";
  const ip = request.headers.get("cf-connecting-ip") || "";

  try {
    // Create a stable hash from server-side data
    const data = `${ua}|${lang}|${ip}`;
    return Buffer.from(data).toString("base64").slice(0, 64);
  } catch {
    return "unknown";
  }
}

/**
 * Get or create a fingerprint from cookie + server data
 */
export async function getFingerprint(
  request: Request,
): Promise<{ fingerprint: string; setCookie?: string }> {
  const cookieHeader = request.headers.get("Cookie");
  const existingFingerprint = await fingerprintCookie.parse(cookieHeader);

  if (existingFingerprint) {
    return { fingerprint: existingFingerprint };
  }

  // Generate new server-side fingerprint
  const serverFingerprint = makeServerFingerprint(request);

  // Set cookie for future requests
  const setCookie = await fingerprintCookie.serialize(serverFingerprint);

  return { fingerprint: serverFingerprint, setCookie };
}
