const nodemailer = require('nodemailer');

const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = Number(process.env.EMAIL_PORT || 587);
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const verifyTransporter = async () => {
  if (!emailUser || !emailPass) {
    throw new Error('Missing SMTP credentials: EMAIL_USER and EMAIL_PASS are not configured.');
  }

  await transporter.verify();
};

const sendPasswordResetEmail = async ({ email, name, tempPassword }) => {
  try {
    if (!email || !tempPassword) {
      throw new Error('Email address and temporary password are required to send a reset email.');
    }

    const recipientName = name || 'there';
    const fromAddress = process.env.EMAIL_FROM || `"SEO Audit Pro" <${emailUser}>`;
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: 'Your SEO Audit Pro temporary password',
      text: `Hello ${recipientName},\n\nYou requested a password reset for your SEO Audit Pro account. Your temporary password is: ${tempPassword}\n\nPlease sign in and change your password immediately. If you did not request this, you can ignore this email. For support, contact support@seoauditpro.com.\n\nSEO Audit Pro Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; color: #111827;">
          <div style="text-align: center; padding-bottom: 18px; border-bottom: 1px solid #e5e7eb;">
            <h1 style="margin: 0; color: #2563eb; font-size: 28px;">SEO Audit Pro</h1>
            <p style="margin: 6px 0 0; color: #4b5563; font-size: 14px; letter-spacing: 0.04em;">Password reset</p>
          </div>

          <div style="padding-top: 24px;">
            <p style="margin: 0 0 12px; font-size: 16px;">Hello ${recipientName},</p>
            <p style="margin: 0 0 18px; color: #374151; line-height: 1.6;">
              You requested a password reset for your SEO Audit Pro account. Your temporary password is:
            </p>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px; text-align: center; margin: 0 0 18px;">
              <code style="font-size: 28px; font-weight: 700; color: #1d4ed8; letter-spacing: 2px;">${tempPassword}</code>
            </div>

            <p style="margin: 0 0 18px; color: #374151; line-height: 1.6;">
              Please sign in with this temporary password and change it immediately. This temporary password is valid for 24 hours.
            </p>

            <div style="margin: 24px 0; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Go to Login</a>
            </div>

            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 16px;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
              Need help? Contact the SEO Audit Pro support team.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message || error);
    return false;
  }
};

module.exports = { verifyTransporter, sendPasswordResetEmail };