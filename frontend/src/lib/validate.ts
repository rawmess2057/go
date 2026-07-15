const ALLOWED_SCHEMES = ["https:", "ipfs:", "ar:"];
const IMAGE_SCHEMES = ["https:", "http:", "ipfs:", "ar:"];
const MAX_URI_LENGTH = 200;

const DANGEROUS_PATTERNS = [
  /javascript:/i,
  /<script/i,
  /data:/i,
  /vbscript:/i,
  /file:/i,
];

const SOLANA_PUBKEY_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const BLOCKED_HOSTNAMES = [
  "localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1",
];

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /^\[?::1\]?$/i,
  /^\[?f[cd]/i,
];

const VALID_HOSTNAME_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const HOSTNAME_INVALID_CHARS = /[,\s_]/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

function isValidHostname(hostname: string): boolean {
  if (!hostname) return false;
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(lower)) return false;
  if (PRIVATE_IP_PATTERNS.some((p) => p.test(lower))) return false;
  if (HOSTNAME_INVALID_CHARS.test(hostname)) return false;
  return VALID_HOSTNAME_REGEX.test(hostname);
}

export function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return SOLANA_PUBKEY_REGEX.test(address.trim());
}

export function isValidUri(uri: string): boolean {
  if (!uri || typeof uri !== "string") return false;
  if (uri.length > MAX_URI_LENGTH) return false;
  if (DANGEROUS_PATTERNS.some((p) => p.test(uri))) return false;
  try {
    const url = new URL(uri);
    return ALLOWED_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateSubmissionUri(uri: string): ValidationResult {
  if (!uri) return { valid: false, error: "URI is required" };
  const trimmed = uri.trim();
  if (trimmed !== uri) return { valid: false, error: "URI must not have leading or trailing whitespace" };
  if (uri.length > MAX_URI_LENGTH) return { valid: false, error: `URI must be ${MAX_URI_LENGTH} characters or fewer` };
  if (DANGEROUS_PATTERNS.some((p) => p.test(uri))) return { valid: false, error: "URI contains forbidden characters or patterns" };

  try {
    const url = new URL(uri);
    if (!ALLOWED_SCHEMES.includes(url.protocol)) return { valid: false, error: "Only https://, ipfs://, and ar:// links are allowed" };
    if (url.protocol === "https:" && !isValidHostname(url.hostname)) return { valid: false, error: "Invalid, blocked, or private hostname" };
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URI format — check for typos or missing parts" };
  }
}

export function isValidSubmissionUri(uri: string): boolean {
  return validateSubmissionUri(uri).valid;
}

export function isValidImageUri(uri: string): boolean {
  if (!uri || typeof uri !== "string") return false;
  const lower = uri.toLowerCase();
  if (DANGEROUS_PATTERNS.some((p) => p.test(lower))) return false;
  if (!uri.includes(":")) return true;
  try {
    const url = new URL(uri);
    return IMAGE_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const MAGIC_BYTES: [number[], string][] = [
  [[0xff, 0xd8, 0xff], "image/jpeg"],
  [[0x89, 0x50, 0x4e, 0x47], "image/png"],
  [[0x52, 0x49, 0x46, 0x46], "image/webp"],
  [[0x47, 0x49, 0x46, 0x38], "image/gif"],
  [[0x00, 0x00, 0x00], "image/avif"],
  [[0x3c, 0x73, 0x76, 0x67], "image/svg+xml"],
];

export function isValidImageFile(
  buffer: ArrayBuffer,
  size: number
): { valid: boolean; error?: string } {
  if (size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `File too large (${(size / 1024 / 1024).toFixed(1)}MB). Max: 5MB` };
  }
  if (size === 0) {
    return { valid: false, error: "File is empty" };
  }

  const bytes = new Uint8Array(buffer.slice(0, 8));

  const validMagic = MAGIC_BYTES.some(([magic]) =>
    magic.every((byte, i) => bytes[i] === byte)
  );

  if (!validMagic) {
    return { valid: false, error: "File does not appear to be a valid image" };
  }

  return { valid: true };
}
