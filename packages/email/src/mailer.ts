import type { EmailTemplate } from "@acme/constants";
import { renderEmail, VERIFICATION_TEMPLATE } from "@acme/constants";

import { emailClient } from "./emailClient";
import { env } from "./env";

export interface EmailRecipient {
  to: string;
  userName: string;
}

export interface VerificationEmail extends EmailRecipient {
  otp: string;
}

// The one provider call. Each method below names its own template, so no caller
// selects a template by string.
async function send(
  template: EmailTemplate,
  recipient: EmailRecipient,
  params: Record<string, string>,
): Promise<void> {
  const mail = renderEmail(template, recipient.userName, params);

  await emailClient.emailSending.send({
    account_id: env.CLOUDFLARE_ACCOUNT_ID,
    from: mail.from,
    to: recipient.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
}

export const mailer = {
  async sendVerification(input: VerificationEmail): Promise<void> {
    await send(VERIFICATION_TEMPLATE, input, { OTP: input.otp });
  },
};
