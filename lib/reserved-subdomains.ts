/**
 * Subdomains that can never be claimed by a tenant site.
 * Enforced in three layers: signup validation (server action),
 * the proxy host rewrite, and seeded into the DB check.
 */
export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "mail",
  "smtp",
  "imap",
  "blog",
  "docs",
  "status",
  "support",
  "help",
  "cdn",
  "assets",
  "static",
  "img",
  "images",
  "media",
  "staging",
  "dev",
  "test",
  "demo",
  "preview",
  "beta",
  "auth",
  "login",
  "signup",
  "billing",
  "stripe",
  "webhooks",
  "ftp",
  "ns1",
  "ns2",
]);

export const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/;

export function isValidSubdomain(value: string): boolean {
  const v = value.toLowerCase();
  return SUBDOMAIN_REGEX.test(v) && !RESERVED_SUBDOMAINS.has(v);
}
