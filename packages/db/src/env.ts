function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not defined in environment variables`);
  }
  return value;
}

export const env = {
  POSTGRES_URL: required("POSTGRES_URL", process.env.POSTGRES_URL),
};
