const http = require('http');

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
    const userAInfo = { email: `usera_${timestamp}@test.com`, password: 'password123', nickname: `userA_${timestamp}` };
    const resA_signup = await request('POST', '/api/auth/signup', userAInfo);
    const resA_login = await request('POST', '/api/auth/login', { email: userAInfo.email, password: userAInfo.password });
    const cookieA = resA_login.cookie;
    const userA_Id = resA_login.body.data.userId;

    // User B Signup & Login
    const userBInfo = { email: `userb_${timestamp}@test.com`, password: 'password123', nickname: `userB_${timestamp}` };
    const resB_signup = await request('POST', '/api/auth/signup', userBInfo);
    const resB_login = await request('POST', '/api/auth/login', { email: userBInfo.email, password: userBInfo.password });
    const cookieB = resB_login.cookie;
    const userB_Id = resB_login.body.data.userId;

    // 0. isSelfGift: true 케이스
    console.log("\n[Test 0] Create Order with isSelfGift: true (User A -> User A)");
    const resOrderSelf = await request('POST', '/api/orders', {
      productId: 76,
      message: "For me!",
      isSelfGift: true
    }, cookieA);
    console.log("Create Order (Self) Status & Body:", resOrderSelf.status, JSON.stringify(resOrderSelf.body, null, 2));

    const orderIdSelf = resOrderSelf.body.data.orderId;
    console.log("\n[Test 0.1] Get Details of Order with isSelfGift: true");
    const resOrderSelfDetail = await request('GET', `/api/orders/${orderIdSelf}`, null, cookieA);
    console.log("Order Detail (Self) Status & Body:", resOrderSelfDetail.status, JSON.stringify(resOrderSelfDetail.body, null, 2));

    // 1. isSelfGift: false 케이스
    console.log("\n[Test 1] Create Order with isSelfGift: false (User A -> User B)");
    const resOrderGift = await request('POST', '/api/orders', {
      productId: 76,
      message: "Here is a gift for you!",
      isSelfGift: false,
      receiverId: userB_Id
    }, cookieA);
    console.log("Create Order Status & Body:", resOrderGift.status, JSON.stringify(resOrderGift.body, null, 2));

    const orderIdGift = resOrderGift.body.data.orderId;
    console.log("\n[Test 1.1] Get Details of Order with isSelfGift: false");
    const resOrderGiftDetail = await request('GET', `/api/orders/${orderIdGift}`, null, cookieA);
    console.log("Order Detail Status & Body:", resOrderGiftDetail.status, JSON.stringify(resOrderGiftDetail.body, null, 2));

    // 2. 존재하지 않는 productId로 요청
    console.log("\n[Test 2] Create Order with non-existent productId");
    const resInvalidProduct = await request('POST', '/api/orders', {
      productId: 9999,
      message: "Hello",
      isSelfGift: true
    }, cookieA);
    console.log("Create Order (Invalid Product) Status & Body:", resInvalidProduct.status, JSON.stringify(resInvalidProduct.body, null, 2));

    // 3. 존재하지 않는 receiverId로 요청
    console.log("\n[Test 3] Create Order with non-existent receiverId");
    const resInvalidReceiver = await request('POST', '/api/orders', {
      productId: 76,
      message: "Gift for ghosts",
      isSelfGift: false,
      receiverId: 9999
    }, cookieA);
    console.log("Create Order (Invalid Receiver) Status & Body:", resInvalidReceiver.status, JSON.stringify(resInvalidReceiver.body, null, 2));

    // 4. 타인 주문 조회 시도
    console.log("\n[Test 4] Get Order Details created by another user (User B trying to access User A's order)");
    const resAccessForbidden = await request('GET', `/api/orders/${orderIdGift}`, null, cookieB);
    console.log("Access Order Detail (Forbidden) Status & Body:", resAccessForbidden.status, JSON.stringify(resAccessForbidden.body, null, 2));

  } catch(e) {
    console.error(e);
  }
  console.log("\n=== API Test End ===");
};

run();
