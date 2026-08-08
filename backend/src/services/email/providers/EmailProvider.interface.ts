export interface SendEmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailProvider {
  send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
