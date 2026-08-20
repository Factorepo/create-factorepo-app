function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not defined in environment variables`);
  }
  return value;
}

const STORAGE_URL = required("STORAGE_URL", process.env.STORAGE_URL);

export const env = {
  STORAGE_URL,
  // Only used to sign URLs the browser hits directly, so its host must be
  // browser-reachable. Falls back to the internal endpoint when unset.
  STORAGE_PUBLIC_URL: process.env.STORAGE_PUBLIC_URL ?? STORAGE_URL,
};
