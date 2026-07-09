const http = require('http');
const pool = require('../db/pool');

const request = (method, path, body, cookie = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (cookie) options.headers['Cookie'] = cookie;
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let setCookie = res.headers['set-cookie'];
        let cookieHeader = setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : null;
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch(e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          cookie: cookieHeader,
          body: parsed
        });
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const run = async () => {
  console.log("=== API Test Start ===");
  try {
    const timestamp = Date.now();
    // User A Signup & Login
    const userAInfo = { email: `sender_${timestamp}@test.com`, password: 'password123', nickname: `SenderA_${timestamp}` };
    const resA_signup = await request('POST', '/api/auth/signup', userAInfo);
    const resA_login = await request('POST', '/api/auth/login', { email: userAInfo.email, password: userAInfo.password });
    const cookieA = resA_login.cookie;
    const userA_Id = resA_login.body.data.userId;

    // User B Signup & Login
    const userBInfo = { email: `receiver_${timestamp}@test.com`, password: 'password123', nickname: `ReceiverB_${timestamp}` };
    const resB_signup = await request('POST', '/api/auth/signup', userBInfo);
    const resB_login = await request('POST', '/api/auth/login', { email: userBInfo.email, password: userBInfo.password });
    const cookieB = resB_login.cookie;
    const userB_Id = resB_login.body.data.userId;

    // Create a self gift for User B
    const resOrderSelf = await request('POST', '/api/orders', {
      productId: 76,
      message: "Self gift message",
      isSelfGift: true
    }, cookieB);
    const orderIdSelf = resOrderSelf.body.data.orderId;
    
    // Create a gift from User A to User B
    const resOrderGift = await request('POST', '/api/orders', {
      productId: 76,
      message: "Here is a gift for you!",
      isSelfGift: false,
      receiverId: userB_Id
    }, cookieA);
    const orderIdGift = resOrderGift.body.data.orderId;

    // 수동으로 DB 변경: Self gift를 'used' 상태로 변경
    await pool.query('UPDATE gifts SET status = "used" WHERE order_id = ?', [orderIdSelf]);
    console.log(`\n[DB Update] Set gift status to 'used' for orderId: ${orderIdSelf} (Self gift)`);

    // 1. 로그인 상태에서 GET /api/gifts?status=unused -> unused 상태 필터링
    console.log("\n[Test 1] Get Unused Gifts (User B)");
    const resGiftsUnused = await request('GET', '/api/gifts?status=unused', null, cookieB);
    console.log("Unused Gifts Status & Body:", resGiftsUnused.status, JSON.stringify(resGiftsUnused.body, null, 2));

    // 2. 로그인 상태에서 GET /api/gifts?status=used -> used 상태 필터링
    console.log("\n[Test 2] Get Used Gifts (User B)");
    const resGiftsUsed = await request('GET', '/api/gifts?status=used', null, cookieB);
    console.log("Used Gifts Status & Body:", resGiftsUsed.status, JSON.stringify(resGiftsUsed.body, null, 2));

    // Cleanup pool connection so script exits
    await pool.end();

  } catch(e) {
    console.error(e);
  }
  console.log("\n=== API Test End ===");
};

run();
