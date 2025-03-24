const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD // Your Gmail app password
  }
});

const sendOrderReceipt = async (orderDetails) => {
  const {
    email,
    orderNumber,
    items,
    totalAmount,
    shippingAddress,
    orderDate
  } = orderDetails;

  // Create email HTML content
  const itemsList = items.map(item => 
    `<li>${item.productName} - Quantity: ${item.quantity} - $${item.price.toFixed(2)}</li>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Receipt - ${orderNumber}`,
    html: `
      <h2>Order Receipt</h2>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
      <h3>Items:</h3>
      <ul>
        ${itemsList}
      </ul>
      <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
      <h3>Shipping Address:</h3>
      <p>
        ${shippingAddress.street}<br>
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}
      </p>
      <p>Thank you for your order!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email receipt');
  }
};

module.exports = {
  sendOrderReceipt
}; 