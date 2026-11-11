const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const partnerEmailMap = {
  'homecare10': 'partner-email@example.com',
};

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.post('/webhook/order', async (req, res) => {
  try {
    const order = req.body;
    const orderName = order.name || 'Test Order';
    const totalPrice = order.total_price || '0.00';
    const currency = order.currency || 'USD';
    const discountCodes = order.discount_codes || [];

    for (const dc of discountCodes) {
      const codeKey = (dc.code || '').toLowerCase();
      if (partnerEmailMap[codeKey]) {
        const partnerEmail = partnerEmailMap[codeKey];
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: partnerEmail,
          subject:  + '' + Commission Sale Notification: Code  + '' + ,
          text:  + '' + Hello,\n\nA sale was generated using your company discount code ().\n\nOrder Name: \nOrder Total:   + '' + ,
        });
        console.log( + '' + Email sent to partner:  + '' + );
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

app.listen(process.env.PORT || 3000);
