require('dotenv').config();
const nodemailer = require('nodemailer');

const verifyEmailConfig = async () => {
  console.log('Verifying email configuration...');
  console.log('Environment variables:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✓' : 'NOT SET ✗');
  console.log('- EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set ✓' : 'NOT SET ✗');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Attempting to verify SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    console.log('Email configuration is correct');
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

verifyEmailConfig(); 