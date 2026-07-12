const ALLOWED_SCHEMES = ["https:", "http:", "ipfs:", "ar:"];
const IMAGE_SCHEMES = ["https:", "http:", "ipfs:", "ar:"];

export function isValidUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    return ALLOWED_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}

export function isValidImageUri(uri: string): boolean {
  const lower = uri.toLowerCase();
  if (lower.includes("javascript:") || lower.includes("<script")) return false;
  if (!uri.includes(":")) return true;
  try {
    const url = new URL(uri);
    return IMAGE_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}
