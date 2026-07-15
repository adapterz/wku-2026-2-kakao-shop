const http = require('http');
const { execSync } = require('child_process');

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
  const email = `tester_curl_${Date.now()}@example.com`;
  const password = 'password123';
  const nickname = `TesterCurl_${Date.now()}`;

  console.log('1. Signing up user on port 3000...');
  await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password, nickname });

  console.log('2. Logging in...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });
  const cookie = loginRes.cookies.map(c => c.split(';')[0]).join('; ');

  console.log('3. Getting a product...');
  const productsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'GET'
  });
  const productId = productsRes.body.data[0].id;

  console.log('4. Creating self gift...');
  const orderRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie }
  }, { productId, isSelfGift: true, message: 'Self gift curl test' });
  const giftId = orderRes.body.data.giftId;
  console.log('Gift ID created:', giftId);

  console.log(`\n5. Running curl: curl -H "Cookie: ${cookie}" http://localhost:3000/api/gifts/${giftId}`);
  try {
    const curlOutput = execSync(`curl -s -H "Cookie: ${cookie}" http://localhost:3000/api/gifts/${giftId}`, { encoding: 'utf8' });
    console.log('\n--- CURL OUTPUT ---');
    console.log(JSON.stringify(JSON.parse(curlOutput), null, 2));
  } catch (err) {
    console.error('Curl execution failed:', err);
  }
}

run().catch(console.error);
