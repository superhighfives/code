import * as cookie from "cookie";

const KUDOS_COOKIE_PREFIX = "kudos_";

/**
 * Set a cookie for tracking user's kudos count for a specific slug
 */
export function setKudosCookie(slug: string, you: number) {
  const cookieName = `${KUDOS_COOKIE_PREFIX}${slug}`;
  return cookie.serialize(cookieName, String(you), {
    path: "/",
    maxAge: 31536000, // 1 year
    httpOnly: false, // Allow client-side access for progressive enhancement
    sameSite: "lax",
  });
}

/**
 * Get user's kudos count for a specific slug from cookie
 */
export function getKudosCookie(request: Request, slug: string): number {
  const cookieHeader = request.headers.get("cookie");
  const cookieName = `${KUDOS_COOKIE_PREFIX}${slug}`;
  const parsed = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : null;
  if (parsed) {
    const count = Number.parseInt(parsed, 10);
    if (!Number.isNaN(count)) return count;
  }
  return 0;
}

/**
 * Generate a server-side fingerprint from request headers and cookies
 */
export function generateFingerprint(request: Request): string {
  // Get or create client ID from cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...v] = c.split("=");
      return [key, v.join("=")];
    }),
  );

  let clientId = cookies.kudos_client_id;
  if (!clientId) {
    // Generate a new client ID (will be set as cookie by the action)
    clientId = crypto.randomUUID();
  }

  // Create weak fingerprint from available server-side data
  const ua = request.headers.get("User-Agent") || "";
  const lang = request.headers.get("Accept-Language")?.split(",")[0] || "";
  // Timezone is not available server-side, so we'll use a placeholder
  // The client will send the full fingerprint on form submission

  try {
    return btoa(`${clientId}:${ua}|${lang}|server`).slice(0, 64);
  } catch {
    return clientId;
  }
}

export async function getKudosCount(
  slug: string,
  request: Request,
  env: Env,
): Promise<number> {
  try {
    const id = env.KUDOS_DO.idFromName(`kudos:${slug}`);
    const stub = env.KUDOS_DO.get(id);
    const url = new URL(request.url);
    const response = await stub.fetch(new URL("/count", url.origin));
    const data: { total?: number } = await response.json();
    return data.total ?? 0;
  } catch {
    // If kudos fetch fails, return 0
    return 0;
  }
}

export async function getUserKudosData(
  slug: string,
  request: Request,
  env: Env,
): Promise<{ total: number; you: number }> {
  try {
    const id = env.KUDOS_DO.idFromName(`kudos:${slug}`);
    const stub = env.KUDOS_DO.get(id);
    const url = new URL(request.url);
    const fingerprint = generateFingerprint(request);

    // Get total count
    const response = await stub.fetch(new URL("/count", url.origin));
    const data: { total?: number } = await response.json();

    // Check how many this fingerprint has used
    // We need to add a new endpoint to the DO for this
    const userResponse = await stub.fetch(new URL("/user-count", url.origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fingerprint }),
    });
    const userData: { you?: number } = await userResponse.json();

    return {
      total: data.total ?? 0,
      you: userData.you ?? 0,
    };
  } catch {
    return { total: 0, you: 0 };
  }
}
