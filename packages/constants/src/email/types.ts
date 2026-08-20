export interface EmailTemplateParam {
  value: string;
  label: string;
  multiline: boolean;
}

export interface EmailTemplate {
  value: string;
  label: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  params: readonly EmailTemplateParam[];
}

export interface RenderedEmail {
  from: string;
  subject: string;
  html: string;
  text: string;
}
