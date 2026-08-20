import CloudflareApi from "cloudflare";

import { env } from "./env";

export const emailClient = new CloudflareApi({
  apiToken: env.CLOUDFLARE_API_TOKEN,
});
