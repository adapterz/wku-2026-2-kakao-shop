const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          cookies,
          body: data ? JSON.parse(data) : null
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  const email1 = `tester1_${Date.now()}@example.com`;
  const email2 = `tester2_${Date.now()}@example.com`;
  const password = 'password123';
  const nickname1 = `Tester1_${Date.now()}`;
  const nickname2 = `Tester2_${Date.now()}`;

  console.log('1. Signing up Tester 1 & 2...');
  await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: email1, password, nickname: nickname1 });
  
  await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: email2, password, nickname: nickname2 });

  console.log('2. Logging in...');
  const login1 = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: email1, password });
  const cookie1 = login1.cookies.map(c => c.split(';')[0]).join('; ');

  const login2 = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: email2, password });
  const cookie2 = login2.cookies.map(c => c.split(';')[0]).join('; ');
  const user2Id = login2.body.data.userId;

  console.log('3. Getting a product...');
  const productsRes = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/products',
    method: 'GET'
  });
  const productId = productsRes.body.data[0].id;

  console.log('4. Creating self gift (Tester 1 to Tester 1)...');
  const selfOrder = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie1 }
  }, { productId, isSelfGift: true, message: 'Self gift test' });
  const selfGiftId = selfOrder.body.data.giftId;

  console.log('5. Creating other gift (Tester 1 to Tester 2)...');
  const otherOrder = await request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie1 }
  }, { productId, isSelfGift: false, receiverId: user2Id, message: 'Gift to other test' });
  const otherGiftId = otherOrder.body.data.giftId;

  console.log('6. Fetching self gift detail (GET /api/gifts/:id)...');
  const selfGiftDetail = await request({
    hostname: 'localhost',
    port: 3005,
    path: `/api/gifts/${selfGiftId}`,
    method: 'GET',
    headers: { 'Cookie': cookie1 }
  });
  console.log('Self Gift Response:', JSON.stringify(selfGiftDetail.body, null, 2));

  console.log('7. Fetching other gift detail (GET /api/gifts/:id)...');
  const otherGiftDetail = await request({
    hostname: 'localhost',
    port: 3005,
    path: `/api/gifts/${otherGiftId}`,
    method: 'GET',
    headers: { 'Cookie': cookie2 }
  });
  console.log('Other Gift Response:', JSON.stringify(otherGiftDetail.body, null, 2));
}

run().catch(console.error);
