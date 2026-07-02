export const AUTH_COOKIE = "sw_auth";

/**
 * Derives the cookie value from the password so the shared secret is never
 * stored client-side in plaintext. Uses Web Crypto so it runs both in the
 * Edge middleware and in Node server actions.
 */
export async function passwordToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`sw:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
