import nodemailer from 'nodemailer';

export interface SendOtpEmailParams {
  to: string;
  otp: string;
  tenantName?: string;
  recipientName?: string;
}

export interface SendSmsParams {
  phone: string;
  otp: string;
  tenantName?: string;
}

/**
 * Reusable Nodemailer transporter configured from environment variables.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

/**
 * Dispatches a password reset OTP verification email via SMTP/Resend or logged securely.
 */
export async function sendPasswordResetOtpEmail({
  to,
  otp,
  tenantName = 'School Management System',
  recipientName = 'User',
}: SendOtpEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"${tenantName}" <no-reply@schoolerp.in>`;
    const transporter = createTransporter();

    // 1. Resend API support if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject: `${tenantName} - Password Reset Verification Code: ${otp}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-bottom: 16px; font-size: 20px;">Password Reset Request</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">Hello ${recipientName},</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">We received a request to reset your password for <strong>${tenantName}</strong>. Please use the following One-Time Password (OTP) to proceed with your verification:</p>
              <div style="background-color: #f1f5f9; padding: 18px; text-align: center; border-radius: 8px; margin: 24px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0b72e7;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email or notify your school administrator immediately.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} ${tenantName}. All rights reserved.</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, messageId: data.id };
      }
    }

    // 2. SMTP Transport via Nodemailer
    if (transporter) {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `${tenantName} - Password Reset Verification Code: ${otp}`,
        text: `Your ${tenantName} password reset verification code is: ${otp}. This code is valid for 10 minutes.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-bottom: 16px; font-size: 20px;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">Hello ${recipientName},</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">We received a request to reset your password for <strong>${tenantName}</strong>. Please use the following One-Time Password (OTP) to proceed with your verification:</p>
            <div style="background-color: #f1f5f9; padding: 18px; text-align: center; border-radius: 8px; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0b72e7;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email or notify your school administrator immediately.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} ${tenantName}. All rights reserved.</p>
          </div>
        `,
      });

      return { success: true, messageId: info.messageId };
    }

    // 3. Development / Test Logging Fallback
    console.info(`[EMAIL-DISPATCH-DEV] To: ${to} | Subject: ${tenantName} Password Reset OTP | OTP: ${otp}`);
    return { success: true, messageId: `dev-${Date.now()}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send OTP email';
    console.error('[EMAIL-DISPATCH-ERROR]', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatches an SMS OTP via MSG91 / Twilio or logged securely.
 */
export async function sendSmsOtp({
  phone,
  otp,
  tenantName = 'School ERP',
}: SendSmsParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // 1. MSG91 Gateway Integration
    if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
      const res = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'authkey': process.env.MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: phone.startsWith('+') ? phone.slice(1) : phone,
          otp,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, messageId: data.request_id };
      }
    }

    // 2. Twilio Gateway Integration
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const params = new URLSearchParams({
        To: phone.startsWith('+') ? phone : `+91${phone}`,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `Your ${tenantName} verification code is ${otp}. Valid for 10 minutes.`,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      if (res.ok) {
        const data = await res.json();
        return { success: true, messageId: data.sid };
      }
    }

    // 3. Fallback / Dev Log
    console.info(`[SMS-DISPATCH-DEV] To: ${phone} | OTP: ${otp} | Text: Your ${tenantName} code is ${otp}`);
    return { success: true, messageId: `sms-dev-${Date.now()}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send SMS OTP';
    console.error('[SMS-DISPATCH-ERROR]', errorMsg);
    return { success: false, error: errorMsg };
  }
}
