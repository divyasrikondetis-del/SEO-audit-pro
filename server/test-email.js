const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Testing email configuration...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Host:', process.env.EMAIL_HOST);
console.log('Email Port:', process.env.EMAIL_PORT);
console.log('Password length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'Not set');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed:', error);
    console.log('\n🔧 Possible fixes:');
    console.log('1. Make sure 2FA is enabled on your Google account');
    console.log('2. Generate a new App Password (no spaces)');
    console.log('3. Check that EMAIL_PASS has no spaces');
    console.log('4. Make sure EMAIL_USER is correct');
  } else {
    console.log('✅ Connection successful!');
    
    // Send test email
    transporter.sendMail({
      from: `"SEO Audit Pro" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Test Email - SEO Audit Pro',
      html: `
        <h1 style="color: #3b82f6;">🎉 Email is Working!</h1>
        <p>Your email configuration is correct.</p>
        <p>You can now use the Forgot Password feature.</p>
        <hr>
        <p style="color: #6b7280; font-size: 12px;">SEO Audit Pro</p>
      `,
    })
    .then(() => {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Check your inbox at: ${process.env.EMAIL_USER}`);
    })
    .catch(err => {
      console.error('❌ Send failed:', err);
      console.log('\n🔧 Possible fixes:');
      console.log('1. Check your internet connection');
      console.log('2. Try a different EMAIL_HOST or EMAIL_PORT');
    });
  }
});