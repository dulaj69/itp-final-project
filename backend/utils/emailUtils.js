const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using SMTP with more detailed error logging
const createTransporter = () => {
  // Check if environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('EMAIL_USER or EMAIL_APP_PASSWORD environment variables are not set!');
    console.error('Current environment variables:', {
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
      EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set'
    });
    throw new Error('Email credentials not configured properly in environment variables');
  }

  console.log('Creating email transporter with configured credentials');
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: process.env.NODE_ENV === 'development'
  });
};

// Only create the transporter when needed
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

const sendOrderReceipt = async (orderDetails) => {
  const {
    email,
    orderNumber,
    items,
    totalAmount,
    shippingAddress,
    orderDate
  } = orderDetails;

  // Validate input data
  if (!email || !orderNumber || !items || !totalAmount || !shippingAddress) {
    console.error('Missing required order details:', { 
      hasEmail: !!email,
      hasOrderNumber: !!orderNumber,
      hasItems: !!items,
      hasTotalAmount: !!totalAmount,
      hasShippingAddress: !!shippingAddress
    });
    throw new Error('Incomplete order details for email receipt');
  }

  console.log('Preparing to send email receipt to:', email);
  console.log('Using email credentials:', {
    user: process.env.EMAIL_USER,
    passConfigured: !!process.env.EMAIL_APP_PASSWORD
  });

  // Create email HTML content with better styling
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Receipt - #${orderNumber}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Order Receipt</h1>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #34495e; margin-bottom: 10px;">Order Details</h2>
              <p style="color: #7f8c8d; margin: 5px 0;">Order Number: <strong>#${orderNumber}</strong></p>
              <p style="color: #7f8c8d; margin: 5px 0;">Date: <strong>${new Date(orderDate).toLocaleDateString()}</strong></p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; color: #2ecc71;">$${totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <h3 style="color: #34495e; margin-bottom: 10px;">Shipping Address</h3>
              <p style="color: #7f8c8d; margin: 5px 0;">${shippingAddress.street}</p>
              <p style="color: #7f8c8d; margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</p>
              <p style="color: #7f8c8d; margin: 5px 0;">${shippingAddress.country}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d;">Thank you for your order!</p>
            <p style="color: #95a5a6; font-size: 12px;">If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    const emailTransporter = getTransporter();

    // Verify connection configuration
    await emailTransporter.verify();
    console.log('SMTP connection verified');

    // Send email
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    
    // More detailed error logging
    if (error.code === 'EAUTH') {
      console.error('Authentication error - check your email credentials');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error - check your network connection or firewall settings');
    }
    
    throw new Error(`Failed to send email receipt: ${error.message}`);
  }
};

module.exports = { sendOrderReceipt }; 