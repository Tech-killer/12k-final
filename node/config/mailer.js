/**
 * ==============================================================================
 * Hostinger SMTP Email Service Adapter
 * ==============================================================================
 * Primary: Official Hostinger Authenticated SMTP (smtp.hostinger.com:465)
 * Fallback 1: Hostinger PHP Mail Dispatcher (send_otp_mail.php)
 * Fallback 2: Gmail SMTP (Optional)
 * ==============================================================================
 */

const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer SMTP Transporter using official Hostinger SMTP (smtp.hostinger.com:465)
 */
function getHostingerSmtpTransporter() {
  const host = process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.HOSTINGER_SMTP_PORT || '465');
  const user = (process.env.HOSTINGER_SMTP_USER || 'noreply@transporter.solutions').trim();
  const pass = (process.env.HOSTINGER_SMTP_PASS || '').trim();

  if (!pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Creates a Nodemailer SMTP Transporter using Gmail App Password
 */
function getSmtpTransporter() {
  const user = process.env.SMTP_USER || 'harsh.jsharma0304@gmail.com';
  const pass = (process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');

  // Ignore empty or example placeholder passwords
  if (!pass || pass === 'xvqyklmnabcdwxyz' || pass === 'your_16_digit_app_password') return null;

  return nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user,
      pass
    }
  });
}

/**
 * Dispatches a one-time verification password (OTP) to the specified email address.
 * 
 * @param {string} toEmail - Recipient administrator email address
 * @param {string} otp - 6-digit verification code
 * @returns {Promise<{success: boolean, id?: string, provider?: string, isSandboxRestriction?: boolean, error?: string}>}
 */
async function sendOtpEmail(toEmail, otp) {
  const subject = `PIPL Admin Portal: Your Login OTP is ${otp}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PIPL Portal Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #050e1f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050e1f; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 540px; background-color: #08152e; border: 1px solid #1e3a68; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0" border="0">
              <!-- Header Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb, #4f46e5, #06b6d4); padding: 24px 32px; text-align: left;">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                        PIPL Admin Portal
                      </td>
                      <td align="right">
                        <span style="background: rgba(255,255,255,0.2); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.3);">
                          Super Admin OTP
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 32px 20px 32px;">
                  <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 18px; font-weight: 700;">
                    Administrator Identity Verification
                  </h2>
                  <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                    A sign-in request was initiated for your administrator account (<strong style="color: #38bdf8;">${toEmail}</strong>). Please use the single-use verification code below to authorize your session:
                  </p>

                  <!-- OTP Display Box -->
                  <div style="background-color: #050e1f; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #38bdf8; font-family: 'Courier New', Courier, monospace; display: inline-block;">
                      ${otp}
                    </span>
                    <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                      ⏱️ Valid for 10 minutes • Single-use only
                    </div>
                  </div>

                  <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                    Enter this 6-digit OTP into the verification window on your screen to complete instant authentication.
                  </p>

                  <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #fbbf24; font-size: 12px; line-height: 1.4;">
                      <strong>Security Tip:</strong> Never share this code with anyone. PIPL Support will never request your OTP.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #040a17; padding: 20px 32px; border-top: 1px solid #162a4d; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                    Pandharkars Infotech Private Limited • Enterprise Asset & Invoicing Hub
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #475569;">
                    Automated notification service. If you did not request this code, please disregard.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `PIPL Admin Portal: Your Login OTP is: ${otp}\n\nThis verification code is valid for 10 minutes. Use it to sign in to your administrator portal account (${toEmail}).\n\nIf you did not request this code, please ignore this email.`;

  // ============================================================================
  // STRATEGY 1: Official Hostinger SMTP via Nodemailer (smtp.hostinger.com:465)
  // ============================================================================
  const hostingerSmtp = getHostingerSmtpTransporter();
  if (hostingerSmtp) {
    try {
      const senderEmail = process.env.HOSTINGER_SMTP_USER || 'noreply@transporter.solutions';
      console.log(`📤 [Hostinger SMTP] Dispatching OTP email via smtp.hostinger.com:465 to ${toEmail}...`);

      const info = await hostingerSmtp.sendMail({
        from: `"PIPL Admin Portal" <${senderEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
        text: textContent
      });

      console.log(`✅ [Hostinger SMTP] OTP successfully delivered to ${toEmail}. Message ID: ${info.messageId}`);
      return {
        success: true,
        id: info.messageId,
        provider: 'hostinger_official_smtp'
      };
    } catch (hSmtpErr) {
      console.warn(`⚠️ [Hostinger SMTP] Authentication/Socket notice: ${hSmtpErr.message}. Trying PHP dispatcher...`);
    }
  }

  // ============================================================================
  // STRATEGY 2: Hostinger PHP Mail Dispatcher (send_otp_mail.php)
  // ============================================================================
  const hostingerUrl = process.env.HOSTINGER_MAIL_URL || 'https://transporter.solutions/12k/mongo/send_otp_mail.php';
  const hostingerSecret = process.env.HOSTINGER_MAIL_SECRET || 'pipl_hostinger_secret_2026';

  if (hostingerUrl) {
    try {
      console.log(`📤 [Hostinger Mailer] Dispatching OTP via transporter.solutions (${hostingerUrl}) to ${toEmail}...`);
      const response = await fetch(hostingerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PIPL-SECRET': hostingerSecret
        },
        body: JSON.stringify({
          email: toEmail,
          otp: otp,
          secret: hostingerSecret
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const json = await response.json().catch(() => null);
        if (json && json.success) {
          console.log(`✅ [Hostinger Mailer] OTP email successfully dispatched from noreply@transporter.solutions to ${toEmail}!`);
          return {
            success: true,
            id: json.data?.timestamp || 'transporter_' + Date.now(),
            provider: 'transporter.solutions'
          };
        } else {
          console.warn(`⚠️ [Hostinger Mailer] Notice: ${json?.message || 'Unknown response'}`);
        }
      } else {
        console.warn(`⚠️ [Hostinger Mailer] HTTP ${response.status} from ${hostingerUrl}`);
      }
    } catch (hErr) {
      console.warn(`⚠️ [Hostinger Mailer] Connection error: ${hErr.message}`);
    }
  }

  // ============================================================================
  // STRATEGY 2: Gmail SMTP via Nodemailer (Fallback only if Hostinger fails)
  // ============================================================================
  const smtpTransporter = getSmtpTransporter();

  if (smtpTransporter) {
    try {
      const senderEmail = process.env.SMTP_USER || 'bapujii.great@gmail.com';
      console.log(`📤 [Gmail SMTP] Dispatching OTP email from ${senderEmail} to ${toEmail}...`);

      const info = await smtpTransporter.sendMail({
        from: `"PIPL Admin Portal" <${senderEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
        text: textContent
      });

      console.log(`✅ [Gmail SMTP] OTP delivered to ${toEmail}. Message ID: ${info.messageId}`);
      return {
        success: true,
        id: info.messageId,
        provider: 'gmail_smtp'
      };
    } catch (smtpErr) {
      console.warn(`⚠️ [Gmail SMTP] Notice: ${smtpErr.message}`);
    }
  }

  return {
    success: false,
    error: 'Failed to dispatch email via transporter.solutions mailer. Please check Hostinger server connection.'
  };
}

/**
 * Dispatches an official GST Tax Invoice and direct online payment link to the client.
 * 
 * @param {Object} params
 * @param {string} params.toEmail - Client email address
 * @param {string} params.clientName - Client / Company Name
 * @param {string} params.assetName - Domain / Server / Digital Asset Name
 * @param {string} params.assetType - Service Category
 * @param {string} params.invoiceNumber - Unique tax invoice number
 * @param {number} params.subtotal - Subtotal amount before GST
 * @param {number} params.tax - 18% GST amount
 * @param {number} params.total - Grand total amount payable
 * @param {string} params.expiryDate - Scheduled expiry / due date
 * @param {string} params.paymentLink - Direct URL for instant online payment
 * @returns {Promise<{success: boolean, id?: string, provider?: string, error?: string}>}
 */
async function sendInvoicePaymentEmail({
  toEmail,
  clientName = 'Valued Client',
  assetName = 'Digital Asset',
  assetType = 'IT Cloud Infrastructure',
  invoiceNumber = '',
  subtotal = 0,
  tax = 0,
  total = 0,
  expiryDate = '',
  paymentLink = ''
}) {
  const formattedSubtotal = Number(subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const halfTax = ((Number(tax) || 0) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedTotal = Number(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const subject = `PIPL Tax Invoice & Online Payment Link: ${assetName} (Inv: ${invoiceNumber})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PIPL Tax Invoice & Payment Link</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06);" cellspacing="0" cellpadding="0" border="0">
              <!-- Header Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #1d4ed8, #4338ca, #0284c7); padding: 26px 32px; text-align: left;">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <div style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                          Pandharkars Infotech Pvt Ltd
                        </div>
                        <div style="color: #cffafe; font-size: 11px; margin-top: 2px;">
                          Enterprise Asset &amp; Cloud Infrastructure Billing
                        </div>
                      </td>
                      <td align="right">
                        <span style="background: rgba(255,255,255,0.25); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.4);">
                          Payment Due
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Greeting & Asset Overview -->
              <tr>
                <td style="padding: 28px 32px 16px 32px;">
                  <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                    Hello ${escapeHtml(clientName)},
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                    A digital asset has been registered under your account on the <strong>PIPL Asset Radar</strong>. Please find your proforma GST tax invoice details below. You can complete payment instantly via credit/debit card, UPI, or NetBanking.
                  </p>

                  <!-- Asset Info Card -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 22px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="color: #64748b; padding-bottom: 8px;">Asset Name:</td>
                        <td style="color: #0284c7; font-weight: 700; text-align: right; padding-bottom: 8px;">${escapeHtml(assetName)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding-bottom: 8px;">Service Type:</td>
                        <td style="color: #0f172a; font-weight: 600; text-align: right; padding-bottom: 8px;">${escapeHtml(assetType)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding-bottom: 8px;">Invoice Number:</td>
                        <td style="color: #0f172a; font-family: monospace; font-weight: 700; text-align: right; padding-bottom: 8px;">${escapeHtml(invoiceNumber)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b;">Scheduled Term:</td>
                        <td style="color: #059669; font-weight: 600; text-align: right;">Valid until ${escapeHtml(expiryDate)}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Amount Due Box -->
                  <div style="background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 12px; color: #1e40af; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px;">
                      Total Payable Amount
                    </div>
                    <div style="font-size: 32px; font-weight: 900; color: #0f172a; font-family: -apple-system, sans-serif;">
                      &#8377;${formattedTotal}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                      Base Fee: &#8377;${formattedSubtotal} &bull; CGST (9%): &#8377;${halfTax} &bull; SGST (9%): &#8377;${halfTax}
                    </div>
                  </div>

                  <!-- Prominent CTA Button -->
                  <div style="text-align: center; margin-bottom: 8px;">
                    <a href="${paymentLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(5,150,105,0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                      &#128179; Pay Invoice Online (Instant Activation) &rarr;
                    </a>
                  </div>
                  <div style="text-align: center; font-size: 11px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 20px;">
                    &#128274; Single-use payment link &bull; Auto-expires immediately once payment is done
                  </div>

                  <!-- Fallback URL notice -->
                  <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12px; line-height: 1.5; text-align: center;">
                    If the button does not open, copy and paste this link into your browser:<br>
                    <a href="${paymentLink}" style="color: #2563eb; word-break: break-all; font-family: monospace;">${paymentLink}</a>
                  </p>

                  <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
                    <p style="margin: 0; color: #065f46; font-size: 12px; line-height: 1.4;">
                      <strong>Instant Settlement:</strong> Supported payment methods include UPI (Google Pay, PhonePe, Paytm), All Major Debit/Credit Cards (Visa, Mastercard, RuPay), and NetBanking.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                    Pandharkars Infotech Private Limited &bull; GSTIN: 27AAACR9821Q1Z4
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                    Baner Tech Park, Pune, Maharashtra - 411045. Automated Hostinger delivery.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
Pandharkars Infotech Private Limited
Official Tax Invoice & Online Payment Link
--------------------------------------------------
Invoice Number : ${invoiceNumber}
Asset Name     : ${assetName}
Service Type   : ${assetType}
Client Company : ${clientName}
Valid Until    : ${expiryDate}

Subtotal       : INR ${formattedSubtotal}
CGST (9%)      : INR ${halfTax}
SGST (9%)      : INR ${halfTax}
TOTAL PAYABLE  : INR ${formattedTotal}

Click here to complete payment online:
${paymentLink}

Supported: UPI, Debit/Credit Cards, NetBanking.
--------------------------------------------------
  `.trim();

  // Strategy 1: Official Hostinger Authenticated SMTP
  const hostingerSmtp = getHostingerSmtpTransporter();
  if (hostingerSmtp) {
    try {
      const senderEmail = process.env.HOSTINGER_SMTP_USER || 'noreply@transporter.solutions';
      console.log(`📤 [Hostinger SMTP] Dispatching payment link invoice to ${toEmail}...`);

      const info = await hostingerSmtp.sendMail({
        from: `"PIPL Billing & Invoicing" <${senderEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
        text: textContent
      });

      console.log(`✅ [Hostinger SMTP] Invoice & Payment link successfully delivered to ${toEmail}. Message ID: ${info.messageId}`);
      return {
        success: true,
        id: info.messageId,
        provider: 'hostinger_official_smtp'
      };
    } catch (hErr) {
      console.warn(`⚠️ [Hostinger SMTP] Notice: ${hErr.message}`);
    }
  }

  // Strategy 2: Hostinger PHP Mail Dispatcher (send_asset_mail.php / Hostinger Remote Endpoint)
  const hostingerUrl = process.env.HOSTINGER_ASSET_MAIL_URL || 'https://transporter.solutions/12k/mongo/send_asset_mail.php';
  const hostingerSecret = process.env.HOSTINGER_MAIL_SECRET || 'pipl_hostinger_secret_2026';

  if (hostingerUrl) {
    try {
      console.log(`📤 [Hostinger PHP Mailer] Dispatching invoice via ${hostingerUrl} to ${toEmail}...`);
      const response = await fetch(hostingerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PIPL-SECRET': hostingerSecret
        },
        body: JSON.stringify({
          email: toEmail,
          client_name: clientName,
          clientName,
          asset_name: assetName,
          assetName,
          asset_type: assetType,
          assetType,
          invoice_number: invoiceNumber,
          invoiceNumber,
          subtotal,
          tax,
          total,
          expiry_date: expiryDate,
          expiryDate,
          payment_link: paymentLink,
          paymentLink,
          secret: hostingerSecret
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const json = await response.json().catch(() => null);
        if (json && json.success) {
          console.log(`✅ [Hostinger PHP Mailer] Invoice email successfully dispatched to ${toEmail}!`);
          return {
            success: true,
            id: json.data?.timestamp || 'transporter_asset_' + Date.now(),
            provider: 'transporter.solutions.asset_mailer'
          };
        } else {
          console.warn(`⚠️ [Hostinger PHP Mailer] Notice: ${json?.message || json?.error || 'Unknown response'}`);
        }
      } else {
        console.warn(`⚠️ [Hostinger PHP Mailer] HTTP ${response.status} from ${hostingerUrl}`);
      }
    } catch (hErr) {
      console.warn(`⚠️ [Hostinger PHP Mailer] Notice: ${hErr.message}`);
    }
  }

  // Strategy 3: Gmail SMTP Fallback
  const smtpTransporter = getSmtpTransporter();
  if (smtpTransporter) {
    try {
      const senderEmail = process.env.SMTP_USER || 'bapujii.great@gmail.com';
      console.log(`📤 [Gmail SMTP] Dispatching payment link invoice from ${senderEmail} to ${toEmail}...`);

      const info = await smtpTransporter.sendMail({
        from: `"PIPL Billing & Invoicing" <${senderEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
        text: textContent
      });

      console.log(`✅ [Gmail SMTP] Invoice delivered to ${toEmail}. Message ID: ${info.messageId}`);
      return {
        success: true,
        id: info.messageId,
        provider: 'gmail_smtp'
      };
    } catch (smtpErr) {
      console.warn(`⚠️ [Gmail SMTP] Notice: ${smtpErr.message}`);
    }
  }

  return {
    success: false,
    error: 'Failed to dispatch invoice payment email. Check Hostinger SMTP / PHP mailer credentials.'
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Dispatches a 15-day subscription renewal reminder email with online payment link to the client.
 * 
 * @param {Object} params
 * @param {string} params.toEmail - Client email address
 * @param {string} params.clientName - Client Company / Representative Name
 * @param {string} params.assetName - Digital Asset / Domain Name
 * @param {string} params.assetType - Service Category
 * @param {string} params.invoiceNumber - Tax Invoice Number
 * @param {number} params.subtotal - Subtotal amount before GST
 * @param {number} params.tax - 18% GST amount
 * @param {number} params.total - Grand total amount payable
 * @param {string} params.expiryDate - Scheduled Expiry Date
 * @param {number} params.daysLeft - Days remaining until expiration
 * @param {number} params.planDuration - Plan duration count
 * @param {string} params.planUnit - Plan unit ('days' or 'months')
 * @param {string} params.paymentLink - Direct URL for online payment
 * @returns {Promise<{success: boolean, id?: string, provider?: string, error?: string}>}
 */
async function sendRenewalReminderEmail({
  toEmail,
  clientName = 'Valued Client',
  assetName = 'Digital Asset',
  assetType = 'Cloud & Domain Service',
  invoiceNumber = '',
  subtotal = 0,
  tax = 0,
  total = 0,
  expiryDate = '',
  daysLeft = 3,
  planDuration = 1,
  planUnit = 'days',
  paymentLink = ''
}) {
  const formattedSubtotal = Number(subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const halfTax = ((Number(tax) || 0) / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedTotal = Number(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const extensionTerm = `+${planDuration} ${planUnit === 'days' ? (planDuration === 1 ? 'day' : 'days') : (planDuration === 1 ? 'month' : 'months')}`;

  const subject = `[URGENT RENEWAL] Your service ${assetName} expires in ${daysLeft} days`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);" cellspacing="0" cellpadding="0" border="0">
              <!-- Branded Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e40af, #3b82f6, #06b6d4); padding: 26px 32px; text-align: left;">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <div style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">
                          PANDHARKARS INFOTECH PRIVATE LIMITED
                        </div>
                        <div style="color: #dbeafe; font-size: 11px; font-style: italic; margin-top: 3px;">
                          "We Manage, Control &amp; Grow Your Business!"
                        </div>
                        <div style="color: #bfdbfe; font-size: 9.5px; font-family: monospace; margin-top: 4px;">
                          CIN: U72900MH2021PTC366004 | GSTIN: 27AAMCP2248L1ZY
                        </div>
                      </td>
                      <td align="right" valign="top">
                        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.35); border-radius: 12px; color: #ffffff; font-weight: 900; font-size: 14px; text-align: center; line-height: 40px;">
                          PI
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Message Body -->
              <tr>
                <td style="padding: 30px 32px 16px 32px;">
                  <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 800;">
                    Dear ${escapeHtml(clientName)},
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                    This is an automated system notification from <strong>Pandharkars Infotech Customer Renewal Engine</strong>. Our monitoring systems have flagged that the following digital asset will expire within <strong>15 days</strong>:
                  </p>

                  <!-- Asset Highlight Box -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 22px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                            Service Description
                          </div>
                          <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                            ${escapeHtml(assetName)}
                          </div>
                          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                            ${escapeHtml(assetType)}
                          </div>
                        </td>
                        <td align="right" valign="top">
                          <span style="display: inline-block; padding: 5px 12px; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 20px; font-size: 11px; font-weight: 800;">
                            ${daysLeft} Days Left
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top: 1px solid #e2e8f0; margin-top: 14px; padding-top: 14px;">
                          <table width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                            <tr>
                              <td style="color: #475569; font-weight: 600;">Scheduled Expiry:</td>
                              <td align="right" style="color: #0f172a; font-weight: 700;">${escapeHtml(expiryDate)}</td>
                            </tr>
                            <tr>
                              <td style="color: #475569; font-weight: 600; padding-top: 6px;">Annual Renewal Fee:</td>
                              <td align="right" style="color: #047857; font-weight: 800; font-family: monospace; font-size: 14px; padding-top: 6px;">
                                &#8377;${formattedSubtotal} + 18% GST
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Attached Tax Invoice Pill -->
                  <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                    <div style="font-size: 13px; font-weight: 700; color: #1e3a8a;">
                      &#128206; Attached Tax Invoice: ${escapeHtml(invoiceNumber)}
                    </div>
                    <div style="font-size: 11px; color: #475569; margin-top: 2px;">
                      Official GST Compliant Proforma Invoice (PDF) &bull; Total: &#8377;${formattedTotal}
                    </div>
                  </div>

                  <!-- Pay Online CTA Button -->
                  <div style="text-align: center; margin-bottom: 12px;">
                    <a href="${paymentLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 16px rgba(5,150,105,0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                      &#128179; Click to Pay Online Securely (Instant Auto-Reconciliation) &rarr;
                    </a>
                  </div>

                  <div style="text-align: center; font-size: 11.5px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
                    Payments made via UPI, NetBanking, or Cards are automatically reconciled with renewal extended <strong>${escapeHtml(extensionTerm)}</strong>.
                  </div>

                  <!-- Fallback Direct Link -->
                  <div style="background-color: #f1f5f9; border-radius: 10px; padding: 12px 14px; font-size: 11px; color: #475569; word-break: break-all; margin-bottom: 18px;">
                    <strong>Direct Payment Link:</strong><br>
                    <a href="${paymentLink}" style="color: #2563eb; text-decoration: underline;">${paymentLink}</a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                    Pandharkars Infotech Private Limited &bull; GSTIN: 27AAMCP2248L1ZY
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                    Automated 15-day subscription expiration notice dispatched via Hostinger SMTP.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
PANDHARKARS INFOTECH PRIVATE LIMITED
[URGENT RENEWAL] Service Expiration Notice
--------------------------------------------------
Dear ${clientName},

Your service ${assetName} (${assetType}) expires in ${daysLeft} days on ${expiryDate}.
Renewal Fee: INR ${formattedSubtotal} + 18% GST (Total: INR ${formattedTotal})
Proforma Invoice: ${invoiceNumber}

Click here to complete payment online securely and extend your subscription:
${paymentLink}

Payments made via UPI, NetBanking, or Cards are automatically reconciled with renewal extended ${extensionTerm}.
--------------------------------------------------
  `.trim();

  // Strategy 1: Official Hostinger Authenticated SMTP
  const hostingerSmtp = getHostingerSmtpTransporter();
  if (hostingerSmtp) {
    try {
      const senderEmail = process.env.HOSTINGER_SMTP_USER || 'noreply@transporter.solutions';
      console.log(`📤 [Hostinger SMTP] Dispatching renewal reminder to ${toEmail}...`);

      const info = await hostingerSmtp.sendMail({
        from: `"Pandharkars Infotech" <${senderEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
        text: textContent
      });

      console.log(`✅ [Hostinger SMTP] Renewal reminder delivered to ${toEmail}. Message ID: ${info.messageId}`);
      return {
        success: true,
        id: info.messageId,
        provider: 'hostinger_official_smtp'
      };
    } catch (hErr) {
      console.warn(`⚠️ [Hostinger SMTP] Notice: ${hErr.message}`);
    }
  }

  // Strategy 2: Hostinger PHP Mail Dispatcher (send_renewal_mail.php)
  const hostingerUrl = process.env.HOSTINGER_RENEWAL_MAIL_URL || 'https://transporter.solutions/12k/mongo/send_renewal_mail.php';
  const hostingerSecret = process.env.HOSTINGER_MAIL_SECRET || 'pipl_hostinger_secret_2026';

  if (hostingerUrl) {
    try {
      console.log(`📤 [Hostinger PHP Mailer] Dispatching renewal via ${hostingerUrl} to ${toEmail}...`);
      const response = await fetch(hostingerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PIPL-SECRET': hostingerSecret
        },
        body: JSON.stringify({
          email: toEmail,
          client_name: clientName,
          clientName,
          asset_name: assetName,
          assetName,
          asset_type: assetType,
          assetType,
          invoice_number: invoiceNumber,
          invoiceNumber,
          subtotal,
          tax,
          total,
          expiry_date: expiryDate,
          expiryDate,
          days_left: daysLeft,
          daysLeft,
          plan_duration: planDuration,
          planDuration,
          plan_unit: planUnit,
          planUnit,
          extension_term: extensionTerm,
          payment_link: paymentLink,
          paymentLink,
          secret: hostingerSecret
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const json = await response.json().catch(() => null);
        if (json && json.success) {
          console.log(`✅ [Hostinger PHP Mailer] Renewal email successfully dispatched to ${toEmail}!`);
          return {
            success: true,
            id: json.data?.timestamp || 'transporter_renewal_' + Date.now(),
            provider: 'transporter.solutions.renewal_mailer'
          };
        }
      }
    } catch (hErr) {
      console.warn(`⚠️ [Hostinger PHP Mailer] Notice: ${hErr.message}`);
    }
  }

  // Strategy 3: Gmail SMTP Fallback
  const smtpTransporter = getSmtpTransporter();
  if (smtpTransporter) {
    try {
      const senderEmail = process.env.SMTP_USER || 'bapujii.great@gmail.com';
      console.log(`📤 [Gmail SMTP] Dispatching renewal reminder from ${senderEmail} to ${toEmail}...`);

      const info = await smtpTransporter.sendMail({
        from: `"Pandharkars Infotech" <${senderEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
        text: textContent
      });

      console.log(`✅ [Gmail SMTP] Renewal delivered to ${toEmail}. Message ID: ${info.messageId}`);
      return {
        success: true,
        id: info.messageId,
        provider: 'gmail_smtp'
      };
    } catch (smtpErr) {
      console.warn(`⚠️ [Gmail SMTP] Notice: ${smtpErr.message}`);
    }
  }

  return {
    success: false,
    error: 'Failed to dispatch subscription renewal reminder email.'
  };
}

module.exports = {
  sendOtpEmail,
  sendInvoicePaymentEmail,
  sendRenewalReminderEmail
};

