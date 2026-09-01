import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { authAdapter } from "@acme/db";

export function initAuth(options: {
  baseUrl: string;
  secret: string | undefined;

  discordClientId: string;
  discordClientSecret: string;
}) {
  const config = {
    database: authAdapter,
    baseURL: options.baseUrl,
    secret: options.secret,
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
    plugins: [expo(), nextCookies()],
    socialProviders: {
      discord: {
        clientId: options.discordClientId,
        clientSecret: options.discordClientSecret,
        redirectURI: `${options.baseUrl}/api/auth/callback/discord`,
      },
    },
    trustedOrigins: ["expo://"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
