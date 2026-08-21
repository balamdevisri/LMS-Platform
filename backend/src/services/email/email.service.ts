/**
 * Re-export the centralized EmailService singleton to prevent duplicate transporter creation
 */
export { EmailService, emailService, SendEmailOptions, CourseEnrollmentEmailOptions } from './EmailService';
import { emailService } from './EmailService';
export default emailService;
