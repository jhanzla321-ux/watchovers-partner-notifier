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
    console.log('Webhook body received:', JSON.stringify(req.body));
    const order = req.body || {};
    const discountCodes = order.discount_codes || [];

    if (Array.isArray(discountCodes)) {
      for (const dc of discountCodes) {
        const code = dc && (dc.code || dc.title);
        if (code) {
          const codeKey = code.toLowerCase();
          if (partnerEmailMap[codeKey]) {
            const partnerEmail = partnerEmailMap[codeKey];
            await transporter.sendMail({
              from: process.env.SMTP_USER,
              to: partnerEmail,
              subject:  + '' + Commission Sale Notification: Code  + '' + ,
              text:  + '' + Hello,\n\nA sale was generated using your discount code (). + '' + ,
            });
            console.log( + '' + Email sent to partner:  + '' + );
          }
        }

      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

app.listen(process.env.PORT || 3000);
