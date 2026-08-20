import type { EmailTemplate } from "./types";
import { VERIFICATION_TEMPLATE } from "./verification";

export const EMAIL_TEMPLATES = [
  VERIFICATION_TEMPLATE,
] as const satisfies readonly EmailTemplate[];

export type EmailTemplateKey = (typeof EMAIL_TEMPLATES)[number]["value"];

export function findEmailTemplate(key: string): EmailTemplate | null {
  return EMAIL_TEMPLATES.find((template) => template.value === key) ?? null;
}

export { renderEmail } from "./render";
export {
  VERIFICATION_CODE_EXPIRY_MINUTES,
  VERIFICATION_TEMPLATE,
} from "./verification";
export type { EmailTemplate, EmailTemplateParam, RenderedEmail } from "./types";
