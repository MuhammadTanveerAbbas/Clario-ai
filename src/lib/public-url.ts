import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const PUBLIC_URL_ERROR =
  "This URL is not public. Use a public HTTP or HTTPS page.";

export interface PublicAddress {
  address: string;
  family: number;
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "");
}

function isBlockedIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function mappedIpv4(value: string): string | null {
  const dotted = value.match(/^(?:::ffff:)?(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return dotted[1];

  const hex = value.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!hex) return null;

  const high = parseInt(hex[1], 16);
  const low = parseInt(hex[2], 16);
  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}

function isBlockedIpv6(hostname: string): boolean {
  const value = normalizeHostname(hostname);
  const mapped = mappedIpv4(value);
  if (mapped) return isBlockedIpv4(mapped);
  if (value === "::" || value === "::1") return true;
  if (/^f[cd]/.test(value)) return true;
  if (/^fe[89ab]/.test(value)) return true;
  return false;
}

export function isBlockedAddress(address: string): boolean {
  const value = normalizeHostname(address);
  const version = isIP(value);
  if (version === 4) return isBlockedIpv4(value);
  if (version === 6) return isBlockedIpv6(value);
  return true;
}

export function parsePublicHttpUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let candidate = trimmed;
  if (trimmed.startsWith("//")) {
    candidate = `https:${trimmed}`;
  } else if (!/^[a-z][a-z\d+.-]*:/i.test(trimmed)) {
    candidate = `https://${trimmed}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const hostname = normalizeHostname(url.hostname);
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    return null;
  }

  const version = isIP(hostname);
  if (version && isBlockedAddress(hostname)) return null;

  return url;
}

export async function resolvePublicAddresses(url: URL): Promise<PublicAddress[]> {
  const hostname = normalizeHostname(url.hostname);
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error(PUBLIC_URL_ERROR);
  }

  const version = isIP(hostname);
  if (version) {
    if (isBlockedAddress(hostname)) throw new Error(PUBLIC_URL_ERROR);
    return [{ address: hostname, family: version }];
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isBlockedAddress(record.address))) {
    throw new Error(PUBLIC_URL_ERROR);
  }

  return records.map((record) => ({ address: record.address, family: record.family }));
}
