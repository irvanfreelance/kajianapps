/**
 * Returns the correct base URL for internal API fetches.
 * - In Vercel production: uses VERCEL_URL (auto-set by Vercel)
 * - In local dev: uses localhost:3000 or NEXT_PUBLIC_BASE_URL
 */
export function getBaseUrl(): string {
  // Vercel auto-sets VERCEL_URL (without https://)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Custom override (e.g. for preview deployments)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Local dev fallback
  return 'http://localhost:3000';
}
