/**
 * Brevo HTTP API Transactional Email Provider (HTTPS v3 API)
 * Replaces raw SMTP/Nodemailer to avoid blocked SMTP ports on Render Free.
 */

import { IEmailProvider } from '../IEmailProvider';
import { env } from '../../../config/env';
import logger from '../../../config/logger';

export class BrevoHttpProvider implements IEmailProvider {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private apiUrl: string = 'https://api.brevo.com/v3/smtp/email';

  constructor() {
    // Read API key with backwards-compatible fallbacks (never logged)
    this.apiKey = (
      process.env.BREVO_API_KEY ||
      env.BREVO_API_KEY ||
      process.env.SMTP_PASSWORD ||
      process.env.SMTP_PASS ||
      ''
    ).trim();

    this.fromEmail = (
      process.env.BREVO_FROM_EMAIL ||
      env.BREVO_FROM_EMAIL ||
      process.env.SMTP_FROM_EMAIL ||
      'no-reply@kaizenq.in'
    ).trim();

    this.fromName = (
      process.env.BREVO_FROM_NAME ||
      env.BREVO_FROM_NAME ||
      process.env.SMTP_FROM_NAME ||
      'KaizenQ'
    ).trim();
  }

  /**
   * Safely sanitize error messages so no API keys or credentials are leaked in logs
   */
  private sanitize(val: any): string {
    if (val === undefined || val === null) return 'undefined';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (this.apiKey) {
      str = str.split(this.apiKey).join('[REDACTED_API_KEY]');
    }
    str = str.replace(/xsmtpsib-[a-zA-Z0-9_-]+/gi, '[REDACTED_KEY]');
    return str;
  }

  /**
   * Initial provider verification & handshake check
   */
  public async verify(): Promise<boolean> {
    console.log('[BREVO] Initializing HTTP API provider...');
    if (!this.apiKey) {
      console.warn('[BREVO] Notice: BREVO_API_KEY is not configured in environment variables.');
      return false;
    }
    console.log('[BREVO] Email service ready.');
    return true;
  }

  /**
   * Primary HTTP API Transactional Email Dispatcher over HTTPS
   */
  public async send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: any;
      contentType?: string;
    }>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, subject, html, text, attachments } = options;

    if (!this.apiKey) {
      const err = 'BREVO_API_KEY is missing. Please set BREVO_API_KEY in environment variables.';
      logger.error(`[BREVO] ${err}`);
      return { success: false, error: err };
    }

    // Format Brevo v3 JSON payload
    const payload: any = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to.trim(),
        },
      ],
      subject: subject.trim(),
      htmlContent: html,
      textContent: text || html.replace(/<[^>]*>?/gm, '').trim(),
    };

    // Attachments formatting (Base64)
    if (attachments && attachments.length > 0) {
      payload.attachment = attachments.map((att) => {
        let contentBase64 = '';
        if (Buffer.isBuffer(att.content)) {
          contentBase64 = att.content.toString('base64');
        } else if (typeof att.content === 'string') {
          contentBase64 = att.content;
        } else {
          contentBase64 = Buffer.from(String(att.content)).toString('base64');
        }

        return {
          name: att.filename,
          content: contentBase64,
        };
      });
    }

    const MAX_RETRIES = 2;
    let attempt = 0;

    console.log('[BREVO] Email request started');

    while (attempt <= MAX_RETRIES) {
      attempt++;
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const status = response.status;
        const responseText = await response.text();

        let responseJson: any = null;
        try {
          responseJson = responseText ? JSON.parse(responseText) : {};
        } catch {
          responseJson = { raw: responseText };
        }

        if (response.ok) {
          const messageId = responseJson?.messageId || responseJson?.id || `brevo_${Date.now()}`;
          console.log('[BREVO] Email sent successfully.');
          return {
            success: true,
            messageId,
          };
        }

        const errorCode = responseJson?.code || `HTTP_${status}`;
        const errorMsg = responseJson?.message || responseText || 'Unknown Brevo API error';

        console.error(
          `[BREVO] Email dispatch error\nstatusCode=${status}\nerrorCode=${this.sanitize(errorCode)}\nmessage=${this.sanitize(errorMsg)}`
        );

        // Retry only on 429 (Rate Limit) or 5xx (Server Error)
        const isTemporary = status === 429 || status >= 500;
        if (isTemporary && attempt <= MAX_RETRIES) {
          const backoffDelay = attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          continue;
        }

        return {
          success: false,
          error: `Brevo API HTTP ${status}: ${this.sanitize(errorMsg)}`,
        };
      } catch (networkError: any) {
        const msg = this.sanitize(networkError?.message || String(networkError));
        console.error(`[BREVO] Email network request failed\nmessage=${msg}`);

        if (attempt <= MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          continue;
        }

        return {
          success: false,
          error: `Brevo network error: ${msg}`,
        };
      }
    }

    return {
      success: false,
      error: 'Brevo email dispatch failed after max retries',
    };
  }
}
export default BrevoHttpProvider;
