/**
 * ═══════════════════════════════════════════════════════════
 * Dhruvkumar Dobariya — Email Notification Module
 * ═══════════════════════════════════════════════════════════
 * Sends email notifications via SMTP (Gmail App Password).
 * Non-blocking: failures are logged, never crash the server.
 * Credentials sourced exclusively from environment variables.
 */
const nodemailer = require('nodemailer');
const logger = require('./logger');

// ─── Configuration (from env) ───
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const NOTIFY_TO = process.env.NOTIFY_EMAIL || 'dhruvkumardobariya641@gmail.com';
const NOTIFY_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@dhruvkumar.tech';

// ─── Transporter (lazy-created, reused) ───
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_USER || !SMTP_PASS) {
    logger.warn('SMTP credentials not configured — email notifications disabled');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

// ─── Sanitize string (prevent header injection) ───
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\r\n]/g, ' ').trim();
}

/**
 * Send a contact-form notification email.
 * Fire-and-forget: resolves even on failure.
 * @param {{ name: string, email: string, subject?: string, message: string, ip?: string }} data
 */
async function sendContactNotification(data) {
  const transport = getTransporter();
  if (!transport) return; // SMTP not configured — skip silently

  const timestamp = new Date().toISOString();
  const senderName = sanitize(data.name);
  const senderEmail = sanitize(data.email);
  const project = sanitize(data.subject || 'Not specified');
  const ip = sanitize(data.ip || 'Unknown');

  // Plain-text body
  const textBody = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  NEW CONTACT MESSAGE — dhruvkumar.tech',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `Name:        ${senderName}`,
    `Email:       ${senderEmail}`,
    `Project:     ${project}`,
    `Timestamp:   ${timestamp}`,
    `IP Address:  ${ip}`,
    '',
    '── Message ──────────────────────────────',
    '',
    data.message,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ].join('\n');

  // HTML body
  const htmlBody = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0B0F19;color:#CCD6F6;border-radius:12px;overflow:hidden;border:1px solid #1E293B">
      <div style="background:linear-gradient(135deg,#00F5FF,#7B61FF);padding:20px 24px">
        <h2 style="margin:0;color:#0B0F19;font-size:18px;font-weight:700">📩 New Contact Message</h2>
        <p style="margin:4px 0 0;color:rgba(11,15,25,0.7);font-size:13px">dhruvkumar.tech</p>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#8892B0;width:110px">Name</td><td style="padding:8px 0;color:#fff;font-weight:600">${escapeHtml(senderName)}</td></tr>
          <tr><td style="padding:8px 0;color:#8892B0">Email</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(senderEmail)}" style="color:#00F5FF;text-decoration:none">${escapeHtml(senderEmail)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#8892B0">Project</td><td style="padding:8px 0;color:#CCD6F6">${escapeHtml(project)}</td></tr>
          <tr><td style="padding:8px 0;color:#8892B0">Timestamp</td><td style="padding:8px 0;color:#CCD6F6">${timestamp}</td></tr>
          <tr><td style="padding:8px 0;color:#8892B0">IP Address</td><td style="padding:8px 0;color:#CCD6F6;font-family:monospace">${escapeHtml(ip)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #1E293B;margin:16px 0">
        <h3 style="margin:0 0 8px;color:#fff;font-size:14px">Message</h3>
        <p style="margin:0;color:#CCD6F6;line-height:1.7;white-space:pre-wrap">${escapeHtml(data.message)}</p>
      </div>
      <div style="padding:12px 24px;background:#0D1117;text-align:center;font-size:11px;color:#4A5568">
        Sent from the contact form at dhruvkumar.tech
      </div>
    </div>`;

  try {
    await transport.sendMail({
      from: `"dhruvkumar.tech" <${sanitize(NOTIFY_FROM)}>`,
      to: NOTIFY_TO,
      subject: `New Contact Message from dhruvkumar.tech — ${senderName}`,
      text: textBody,
      html: htmlBody,
    });
    logger.info('Contact notification email sent', { to: NOTIFY_TO, sender: senderEmail });
  } catch (err) {
    logger.error('Failed to send contact notification email', {
      error: err.message,
      code: err.code,
      sender: senderEmail,
    });
    // Intentionally swallowed — message is already saved in DB
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendContactNotification };
