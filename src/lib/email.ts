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

/**
 * Generic email dispatcher reusing configured Resend API or SMTP Transporter with dev fallback
 */
async function sendBrandedEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Alpha Edu Hub" <no-reply@alphaeduhub.in>';
    const transporter = createTransporter();

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
          subject,
          html,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, messageId: data.id };
      }
    }

    if (transporter) {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text,
        html,
      });
      return { success: true, messageId: info.messageId };
    }

    console.info(`[EMAIL-DISPATCH-DEV] To: ${to} | Subject: ${subject}`);
    return { success: true, messageId: `dev-mail-${Date.now()}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to dispatch email';
    console.error('[EMAIL-DISPATCH-ERROR]', errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function sendRegistrationReceivedEmail({
  to,
  recipientName,
  institutionName,
  applicationNumber,
}: {
  to: string;
  recipientName: string;
  institutionName: string;
  applicationNumber: string;
}) {
  const subject = `Application Received: ${institutionName} (${applicationNumber}) — Alpha Edu Hub`;
  const text = `Hello ${recipientName},\n\nThank you for submitting your application to onboard ${institutionName} onto Alpha Edu Hub. Your application number is ${applicationNumber}.\n\nOur platform team will review your application and contact you soon.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0b72e7; margin: 0; font-size: 24px; font-weight: 800;">Alpha Edu Hub</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Next-Gen Multi-Tenant School & College ERP</p>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Application Received</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${recipientName}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for registering <strong>${institutionName}</strong> with Alpha Edu Hub. Your institution onboarding application has been successfully logged.</p>
        <div style="background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 14px; text-align: center; margin: 16px 0;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">Application Reference Number</span>
          <span style="font-family: monospace; font-size: 22px; font-weight: 700; color: #0b72e7; letter-spacing: 2px;">${applicationNumber}</span>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Our platform verification team is currently reviewing your application. Once approved, you will receive an invitation link to set your administrator credentials and access your dashboard.</p>
      </div>
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Edu Hub. All rights reserved.</p>
    </div>
  `;

  return sendBrandedEmail({ to, subject, html, text });
}

export async function sendApplicationApprovedEmail({
  to,
  recipientName,
  institutionName,
  activationLink,
}: {
  to: string;
  recipientName: string;
  institutionName: string;
  activationLink: string;
}) {
  const subject = `Your Institution Has Been Approved! Activate Your Administrator Account — Alpha Edu Hub`;
  const text = `Hello ${recipientName},\n\nGreat news! Your application for ${institutionName} has been approved.\n\nPlease activate your administrator account by visiting the link below:\n${activationLink}\n\nThis activation link is valid for 7 days.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0b72e7; margin: 0; font-size: 24px; font-weight: 800;">Alpha Edu Hub</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Next-Gen Multi-Tenant School & College ERP</p>
      </div>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #166534; margin-top: 0; font-size: 18px;">Institution Approved</h3>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">Hello <strong>${recipientName}</strong>,</p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">Congratulations! Your institution application for <strong>${institutionName}</strong> has been reviewed and approved by the Super Admin team.</p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">Your multi-tenant workspace is ready. To complete setup and activate your Institution Administrator account, click the button below:</p>
        <div style="text-align: center; margin: 26px 0;">
          <a href="${activationLink}" style="display: inline-block; background-color: #0b72e7; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(11, 114, 231, 0.35);">
            Activate Administrator Account &rarr;
          </a>
        </div>
        <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin-top: 20px;">Or copy and paste this URL into your browser:<br/><a href="${activationLink}" style="color: #0b72e7; word-break: break-all;">${activationLink}</a></p>
        <p style="color: #9ca3af; font-size: 11px; margin-top: 14px;">This activation link is securely signed and will expire in 7 days.</p>
      </div>
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Edu Hub. All rights reserved.</p>
    </div>
  `;

  return sendBrandedEmail({ to, subject, html, text });
}

export async function sendApplicationRejectedEmail({
  to,
  recipientName,
  institutionName,
  reason,
}: {
  to: string;
  recipientName: string;
  institutionName: string;
  reason?: string;
}) {
  const subject = `Update Regarding Your Application for ${institutionName} — Alpha Edu Hub`;
  const text = `Hello ${recipientName},\n\nThank you for your interest in Alpha Edu Hub. After careful review, we are unable to approve your application for ${institutionName} at this time.\n\nReason: ${reason || 'Details could not be verified'}\n\nIf you have questions, please contact support@alphaeduhub.in.`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0b72e7; margin: 0; font-size: 24px; font-weight: 800;">Alpha Edu Hub</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Next-Gen Multi-Tenant School & College ERP</p>
      </div>
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #991b1b; margin-top: 0; font-size: 18px;">Application Status Update</h3>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">Hello <strong>${recipientName}</strong>,</p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">Thank you for your interest in onboarding <strong>${institutionName}</strong> onto Alpha Edu Hub. After review, we are unable to approve your application at this time.</p>
        ${
          reason
            ? `<div style="background-color: #ffffff; border: 1px solid #f87171; border-radius: 8px; padding: 14px; margin: 16px 0;">
                <strong style="color: #991b1b; font-size: 13px; display: block; margin-bottom: 4px;">Reason provided:</strong>
                <p style="color: #4b5563; font-size: 13px; margin: 0; line-height: 1.5;">${reason}</p>
              </div>`
            : ''
        }
        <p style="color: #4b5563; font-size: 13px; line-height: 1.6;">If you believe this decision was made in error or wish to submit updated documentation, please contact our onboarding support team at <a href="mailto:support@alphaeduhub.in" style="color: #0b72e7;">support@alphaeduhub.in</a>.</p>
      </div>
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Edu Hub. All rights reserved.</p>
    </div>
  `;

  return sendBrandedEmail({ to, subject, html, text });
}

