const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.post('/webhook/order', (req, res) => {
  console.log('Webhook received:', req.body);
  return res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

module.exports = app;
