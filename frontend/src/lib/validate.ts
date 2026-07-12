const ALLOWED_SCHEMES = ["https:", "http:", "ipfs:", "ar:"];
const IMAGE_SCHEMES = ["https:", "ipfs:"];

export function isValidUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    return ALLOWED_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}

export function isValidImageUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    return IMAGE_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}
