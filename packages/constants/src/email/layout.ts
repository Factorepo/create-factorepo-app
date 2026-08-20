// An e-mail client is not a browser: Outlook ignores flexbox, and several
// clients strip a style block. Every layout decision is made twice for that
// reason, once in the class and once on the element.

export const USER_NAME_PLACEHOLDER = "{{USER_NAME}}";

const BRAND_NAME = "Acme";

const EMAIL_STYLES = `
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      background-color: #eef1f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      outline: none;
      display: block;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #eef1f5;
      padding: 40px 0;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #dfe3ea;
    }
    .accent-bar {
      height: 4px;
      background-color: #0f2440;
      font-size: 0;
      line-height: 0;
    }
    .header {
      padding: 22px 32px;
      border-bottom: 1px solid #e6e9ef;
    }
    .wordmark {
      vertical-align: middle;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #0f2440;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .content {
      padding: 32px 32px 28px 32px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #0f2440;
      margin-top: 0;
      margin-bottom: 18px;
      line-height: 1.35;
    }
    .salutation {
      font-size: 15px;
      color: #3c4658;
      line-height: 1.6;
      margin-top: 0;
      margin-bottom: 18px;
    }
    .text {
      font-size: 15px;
      color: #3c4658;
      line-height: 1.65;
      margin-top: 0;
      margin-bottom: 22px;
    }
    .otp-container {
      background-color: #f6f8fa;
      border: 1px solid #dfe3ea;
      border-radius: 4px;
      padding: 20px;
      text-align: center;
      margin: 26px 0;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 30px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #0f2440;
      /* Balances the trailing letter-spacing of the last character. */
      padding-left: 8px;
    }
    .notice {
      font-size: 13px;
      color: #6b7686;
      line-height: 1.6;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .footer {
      background-color: #f6f8fa;
      padding: 22px 32px;
      border-top: 1px solid #e6e9ef;
      text-align: center;
    }
    .footer-name {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.5px;
      color: #6b7686;
      text-transform: uppercase;
      margin: 0 0 8px 0;
    }
    .footer-text {
      font-size: 12px;
      color: #8b95a4;
      line-height: 1.6;
      margin: 0;
    }`;

const EMAIL_HEADER_HTML = `        <td class="header">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="wordmark">${BRAND_NAME}</td>
            </tr>
          </table>
        </td>`;

const EMAIL_FOOTER_HTML = `        <td class="footer">
          <p class="footer-name">${BRAND_NAME}</p>
          <p class="footer-text">
            This e-mail was sent automatically. Please do not reply to this address.
          </p>
        </td>`;

const EMAIL_FOOTER_TEXT = `--
${BRAND_NAME}

This e-mail was sent automatically. Please do not reply to this address.`;

export function buildEmailHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${EMAIL_STYLES}
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="container" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td class="accent-bar">&nbsp;</td>
      </tr>
      <tr>
${EMAIL_HEADER_HTML}
      </tr>
      <tr>
        <td class="content">
          <h1 class="title">${title}</h1>
          <p class="salutation">Hello ${USER_NAME_PLACEHOLDER},</p>
${bodyHtml}
        </td>
      </tr>
      <tr>
${EMAIL_FOOTER_HTML}
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export function buildEmailText(title: string, bodyText: string): string {
  return `${BRAND_NAME.toUpperCase()}
${title}

Hello ${USER_NAME_PLACEHOLDER},

${bodyText}

${EMAIL_FOOTER_TEXT}`;
}
