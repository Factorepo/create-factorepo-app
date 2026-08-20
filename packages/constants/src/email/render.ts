import type { EmailTemplate, RenderedEmail } from "./types";
import { USER_NAME_PLACEHOLDER } from "./layout";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
} as const;

const UNFILLED_PLACEHOLDER = /\{\{[A-Z_]+\}\}/g;

function escapeHtml(value: string): string {
  return value
    .replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character)
    .replaceAll("\n", "<br>");
}

function keepAsWritten(value: string): string {
  return value;
}

function fill(
  markup: string,
  userName: string,
  params: Record<string, string>,
  escape: (value: string) => string,
): string {
  let filled = markup.replaceAll(USER_NAME_PLACEHOLDER, escape(userName));

  for (const [key, value] of Object.entries(params)) {
    filled = filled.replaceAll(`{{${key}}}`, escape(value));
  }

  return filled.replace(UNFILLED_PLACEHOLDER, "");
}

// The HTML side escapes every supplied value, because a parameter can carry
// text a person wrote by hand.
export function renderEmail(
  template: EmailTemplate,
  userName: string,
  params: Record<string, string>,
): RenderedEmail {
  return {
    from: template.from,
    subject: fill(template.subject, userName, params, keepAsWritten),
    html: fill(template.html, userName, params, escapeHtml),
    text: fill(template.text, userName, params, keepAsWritten),
  };
}
