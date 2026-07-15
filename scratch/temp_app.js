const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const productsRouter = require('../routes/products');
const authRouter = require('../routes/auth');
const usersRouter = require('../routes/users');
const ordersRouter = require('../routes/orders');
const giftsRouter = require('../routes/gifts');

const app = express();
const PORT = 3005;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true
  }
}));

app.use(express.static(path.join(__dirname, '../public')));
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/gifts', giftsRouter);

app.listen(PORT, () => {
  console.log(`Temp Server is running on http://localhost:${PORT}`);
});
