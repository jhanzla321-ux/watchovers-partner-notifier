require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const PARTNER_MAP = {
  'homecare10': 'partner@homecare.ie',
};

app.post('/webhooks/orders/create', async (req, res) => {
  try {
    const order = req.body;
    const discountCodes = order.discount_codes || [];

    for (const discount of discountCodes) {
      const code = discount.code.toLowerCase();
      const partnerEmail = PARTNER_MAP[code];

      if (partnerEmail) {
        const mailOptions = {
          from: `"WatchOvers Order Alert" <${process.env.SMTP_USER}>`,
          to: partnerEmail,
          subject: `New Order Notification - Discount Code: ${discount.code}`,
          html: `
            <h3>New Sale Alert</h3>
            <p>A new order was placed using your discount code <strong>${discount.code}</strong>.</p>
            <ul>
              <li><strong>Order Reference:</strong> ${order.name}</li>
              <li><strong>Order Total:</strong> ${order.total_price} ${order.currency}</li>
              <li><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</li>
            </ul>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to ${partnerEmail} for code: ${discount.code}`);
      }
    }

    res.status(200).send('Webhook Processed');
  } catch (err) {
    console.error('Webhook Processing Error:', err);
    res.status(500).send('Webhook Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
