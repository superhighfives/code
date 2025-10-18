/**
 * Client-side fingerprint utilities
 */

const CLIENT_ID_KEY = "kudos_client_id";

/**
 * Inline script to set client ID cookie early
 */
export function getClientIdCheckScript() {
  return `
(function() {
  const KEY = '${CLIENT_ID_KEY}';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  // Set as cookie for server access
  document.cookie = 'client-id=' + id + '; path=/; max-age=31536000; samesite=lax';
})();
`.trim();
}

/**
 * Component to check and set client ID
 */
export function ClientIdCheck({ nonce }: { nonce: string }) {
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: required for client ID setup
      dangerouslySetInnerHTML={{
        __html: getClientIdCheckScript(),
      }}
    />
  );
}
