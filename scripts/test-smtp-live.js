const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const nodemailer = require('nodemailer');

const port = parseInt(process.env.SMTP_PORT || '465', 10);
const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
const user = (process.env.SMTP_USER || process.env.SMTP_EMAIL || 'kaizenqlms@gmail.com').trim();
const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || 'gmjv leoa tadp vdyg').trim().replace(/\s+/g, '');
const from = process.env.SMTP_FROM || 'KaizenQ <no-reply@kaizenq.in>';

console.log('[TEST SETUP] Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
console.log('[TEST SETUP] Port:', port, '| Secure:', isSecure);
console.log('[TEST SETUP] User:', user);
console.log('[TEST SETUP] From:', from);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: port,
  secure: isSecure,
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});

async function runTests() {
  console.log('\n--- 1. SMTP Transporter Verification ---');
  await transporter.verify();
  console.log('✅ [EMAIL] SMTP connection successful');

  console.log('\n--- 2. Direct SMTP Test Email Dispatch ---');
  const targetEmail = 'kaizenqlms@gmail.com';
  const mailOptions = {
    from: 'KaizenQ <no-reply@kaizenq.in>',
    to: targetEmail,
    subject: 'KaizenQ Production SMTP Test - DIRECT NODEMAILER',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
        <h2 style="color: #2563eb; margin-top: 0;">KaizenQ Enterprise AI LMS</h2>
        <p style="color: #334155;">This email confirms that <strong>Direct SMTP Email Architecture</strong> is 100% active and operational on <strong>kaizenq.in</strong>.</p>
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px; border-radius: 6px; font-size: 13px; color: #1e40af;">
          <strong>Sender:</strong> no-reply@kaizenq.in<br/>
          <strong>Delivery Provider:</strong> Nodemailer Direct SMTP<br/>
          <strong>Firebase Email Status:</strong> Disabled & Bypassed
        </div>
      </div>
    `,
    text: 'KaizenQ Enterprise AI LMS - Direct SMTP Email Architecture is active and operational on kaizenq.in.'
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✅ [EMAIL] SMTP Test Email Dispatched Successfully!');
  console.log('📬 MessageID:', info.messageId);
  console.log('📬 Accepted:', info.accepted);
  console.log('📬 Response:', info.response);
}

runTests().catch(err => {
  console.error('❌ [EMAIL] SMTP Test Failed:', err);
  process.exit(1);
});
