function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not defined in environment variables`);
  }
  return value;
}

export const env = {
  PADDLE_API_KEY: required("PADDLE_API_KEY", process.env.PADDLE_API_KEY),
  PADDLE_WEBHOOK_SECRET: required(
    "PADDLE_WEBHOOK_SECRET",
    process.env.PADDLE_WEBHOOK_SECRET,
  ),
  PADDLE_STANDARD_PRICE_ID: required(
    "PADDLE_STANDARD_PRICE_ID",
    process.env.PADDLE_STANDARD_PRICE_ID,
  ),
  PADDLE_ENVIRONMENT: process.env.PADDLE_ENVIRONMENT,
};
