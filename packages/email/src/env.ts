function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not defined in environment variables`);
  }
  return value;
}

export const env = {
  CLOUDFLARE_API_TOKEN: required(
    "CLOUDFLARE_API_TOKEN",
    process.env.CLOUDFLARE_API_TOKEN,
  ),
  CLOUDFLARE_ACCOUNT_ID: required(
    "CLOUDFLARE_ACCOUNT_ID",
    process.env.CLOUDFLARE_ACCOUNT_ID,
  ),
};
