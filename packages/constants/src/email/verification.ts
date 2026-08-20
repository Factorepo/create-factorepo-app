import type { EmailTemplate } from "./types";
import { buildEmailHtml, buildEmailText } from "./layout";

export const VERIFICATION_CODE_EXPIRY_MINUTES = 15;

const TITLE = "Your verification code";

const BODY_HTML = `          <p class="text">
            Enter the one-time code below to verify your e-mail address.
          </p>
          <div class="otp-container">
            <span class="otp-code">{{OTP}}</span>
          </div>
          <p class="notice">
            The code is valid for <strong>${VERIFICATION_CODE_EXPIRY_MINUTES} minutes</strong>.
          </p>
          <p class="notice" style="margin-bottom: 0;">
            If you did not make this request, ignore this e-mail.
          </p>`;

const BODY_TEXT = `Enter this one-time code to verify your e-mail address: {{OTP}}

The code is valid for ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes.

If you did not make this request, ignore this e-mail.`;

export const VERIFICATION_TEMPLATE = {
  value: "verification",
  label: "E-mail verification code",
  from: "verify@acme.com",
  subject: "Your Acme verification code",
  html: buildEmailHtml(TITLE, BODY_HTML),
  text: buildEmailText(TITLE, BODY_TEXT),
  params: [{ value: "OTP", label: "Verification code", multiline: false }],
} as const satisfies EmailTemplate;
