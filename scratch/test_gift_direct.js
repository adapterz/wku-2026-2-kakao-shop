const express = require('express');
const router = require('../routes/gifts');
const pool = require('../db/pool');

// Mock pool.query to return a mock gift
const mockGiftSelf = {
  gift_id: 999,
  product_name: "Mock Coffee",
  thumbnail_url: "mock.jpg",
  barcode: "123456789012",
  status: "unused",
  used_at: null,
  message: "Congrats!",
  receiver_id: 1,
  is_self_gift: 1,
  sender_id: 1,
  sender_nickname: "MyNickname"
};

const mockGiftOther = {
  gift_id: 888,
  product_name: "Mock Tea",
  thumbnail_url: "mock_tea.jpg",
  barcode: "987654321098",
  status: "unused",
  used_at: null,
  message: "For you!",
  receiver_id: 2,
  is_self_gift: 0,
  sender_id: 1,
  sender_nickname: "SenderNickname"
};

// Create a minimal express app
const app = express();
app.use((req, res, next) => {
  req.session = { userId: req.headers['x-user-id'] === '2' ? 2 : 1 };
  next();
});
app.use('/api/gifts', router);

async function test() {
  const originalQuery = pool.query;

  // Test 1: Self Gift
  pool.query = async (sql, params) => {
    return [[mockGiftSelf]];
  };

  const resSelf = await new Promise((resolve) => {
    let responseBody = null;
    const res = {
      status: (code) => res,
      json: (body) => {
        responseBody = body;
        resolve(body);
      }
    };
    app._router.handle({ method: 'GET', url: '/api/gifts/999', headers: { 'x-user-id': '1' } }, res, () => {});
  });

  console.log('--- TEST 1: Self Gift Detail Response ---');
  console.log(JSON.stringify(resSelf, null, 2));

  // Test 2: Other Gift
  pool.query = async (sql, params) => {
    return [[mockGiftOther]];
  };

  const resOther = await new Promise((resolve) => {
    let responseBody = null;
    const res = {
      status: (code) => res,
      json: (body) => {
        responseBody = body;
        resolve(body);
      }
    };
    app._router.handle({ method: 'GET', url: '/api/gifts/888', headers: { 'x-user-id': '2' } }, res, () => {});
  });

  console.log('--- TEST 2: Other Gift Detail Response ---');
  console.log(JSON.stringify(resOther, null, 2));

  pool.query = originalQuery;
}

test().catch(console.error);
