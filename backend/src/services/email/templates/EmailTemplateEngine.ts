import { buildEventEmailTemplate } from '../emailTemplates';
import { EmailEventType } from '../../../types/emailTypes';

export class EmailTemplateEngine {
  build(eventType: EmailEventType, payload: any): { subject: string; html: string } {
    return buildEventEmailTemplate(eventType, payload);
  }
}
