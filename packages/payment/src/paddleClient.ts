import { Environment, Paddle } from "@paddle/paddle-node-sdk";

import { env } from "./env";

export const paddleClient = new Paddle(env.PADDLE_API_KEY, {
  environment:
    env.PADDLE_ENVIRONMENT === "production"
      ? Environment.production
      : Environment.sandbox,
});
