import { env } from "./env";
import { paddleClient } from "./paddleClient";

export const paymentRepository = {
  standardPriceId: env.PADDLE_STANDARD_PRICE_ID,

  createCheckout() {
    return { priceId: env.PADDLE_STANDARD_PRICE_ID };
  },

  async cancelPaddleSubscription(subscriptionId: string) {
    return await paddleClient.subscriptions.cancel(subscriptionId, {
      effectiveFrom: "next_billing_period",
    });
  },

  async unmarshalWebhook(body: string, signature: string) {
    return await paddleClient.webhooks.unmarshal(
      body,
      env.PADDLE_WEBHOOK_SECRET,
      signature,
    );
  },
};
