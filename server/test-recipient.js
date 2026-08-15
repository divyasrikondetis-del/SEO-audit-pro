const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: `"SEO Audit Pro" <${process.env.EMAIL_USER}>`,
  to: 'tubelight.k19@gmail.com',
  subject: '✅ SEO Audit Pro - Test Email',
  html: `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; color: #111827;">
      <h1 style="color: #2563eb; text-align: center;">🎉 Test Email Working!</h1>
      <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
        This is a test email to confirm your inbox is receiving emails from SEO Audit Pro.
      </p>
      <p style="color: #6b7280; font-size: 13px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        If you received this, password reset emails should work too!
      </p>
    </div>
  `,
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Failed to send test email:', error.message);
  } else {
    console.log('✅ Test email sent successfully to tubelight.k19@gmail.com');
    console.log('📧 Message ID:', info.messageId);
    console.log('\n👉 Check tubelight.k19@gmail.com inbox (including Spam/Promotions folders)');
  }
});
