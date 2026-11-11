const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'), secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
app.get('/', (req, res) => res.send('Server is running.'));
app.post('/webhook/order', async (req, res) => {
  try {
    const o = req.body;
    console.log('Received order:', o.name);
    await transporter.sendMail({ from: process.env.SMTP_USER, to: process.env.SMTP_USER, subject: 'Order Notification', text: 'New order received from Shopify!' });
    res.status(200).send('OK');
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});
app.listen(process.env.PORT || 3000);
