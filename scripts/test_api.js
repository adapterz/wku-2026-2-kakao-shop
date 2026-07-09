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

    // Create a gift from User A to User B
    const resOrderGift = await request('POST', '/api/orders', {
      productId: 76,
      message: "Here is a gift for you!",
      isSelfGift: false,
      receiverId: userB_Id
    }, cookieA);
    const giftId = resOrderGift.body.data.giftId;

    // 1. 정상 흐름: 선물 상세 조회 (unused) -> 사용 -> 상세 조회 (used)
    console.log("\n[Test 1.1] GET /api/gifts/:id - before use");
    const resGiftDetailBefore = await request('GET', `/api/gifts/${giftId}`, null, cookieB);
    console.log("Gift Detail (Before) Status & Body:", resGiftDetailBefore.status, JSON.stringify(resGiftDetailBefore.body, null, 2));

    console.log("\n[Test 1.2] PATCH /api/gifts/:id/use");
    const resGiftUse = await request('PATCH', `/api/gifts/${giftId}/use`, null, cookieB);
    console.log("Gift Use Status & Body:", resGiftUse.status, JSON.stringify(resGiftUse.body, null, 2));

    console.log("\n[Test 1.3] GET /api/gifts/:id - after use");
    const resGiftDetailAfter = await request('GET', `/api/gifts/${giftId}`, null, cookieB);
    console.log("Gift Detail (After) Status & Body:", resGiftDetailAfter.status, JSON.stringify(resGiftDetailAfter.body, null, 2));

    // 2. 이미 사용한 선물 다시 사용 요청 (409)
    console.log("\n[Test 2] PATCH /api/gifts/:id/use - Already used");
    const resGiftUseAgain = await request('PATCH', `/api/gifts/${giftId}/use`, null, cookieB);
    console.log("Gift Use Again Status & Body:", resGiftUseAgain.status, JSON.stringify(resGiftUseAgain.body, null, 2));

    // 3. 존재하지 않는 giftId
    const invalidGiftId = 99999;
    console.log("\n[Test 3.1] GET /api/gifts/:id - Not found");
    const resNotFoundGet = await request('GET', `/api/gifts/${invalidGiftId}`, null, cookieB);
    console.log("Not Found GET Status & Body:", resNotFoundGet.status, JSON.stringify(resNotFoundGet.body, null, 2));
    
    console.log("\n[Test 3.2] PATCH /api/gifts/:id/use - Not found");
    const resNotFoundPatch = await request('PATCH', `/api/gifts/${invalidGiftId}/use`, null, cookieB);
    console.log("Not Found PATCH Status & Body:", resNotFoundPatch.status, JSON.stringify(resNotFoundPatch.body, null, 2));

    // 4. 다른 유저의 선물 접근 (User A trying to access User B's gift)
    console.log("\n[Test 4.1] GET /api/gifts/:id - Forbidden (Not owner)");
    const resForbiddenGet = await request('GET', `/api/gifts/${giftId}`, null, cookieA);
    console.log("Forbidden GET Status & Body:", resForbiddenGet.status, JSON.stringify(resForbiddenGet.body, null, 2));

    console.log("\n[Test 4.2] PATCH /api/gifts/:id/use - Forbidden (Not owner)");
    const resForbiddenPatch = await request('PATCH', `/api/gifts/${giftId}/use`, null, cookieA);
    console.log("Forbidden PATCH Status & Body:", resForbiddenPatch.status, JSON.stringify(resForbiddenPatch.body, null, 2));

    // 5. 로그인 안 한 상태
    console.log("\n[Test 5.1] GET /api/gifts/:id - Unauthorized (No login)");
    const resNoLoginGet = await request('GET', `/api/gifts/${giftId}`, null, null);
    console.log("No Login GET Status & Body:", resNoLoginGet.status, JSON.stringify(resNoLoginGet.body, null, 2));

    console.log("\n[Test 5.2] PATCH /api/gifts/:id/use - Unauthorized (No login)");
    const resNoLoginPatch = await request('PATCH', `/api/gifts/${giftId}/use`, null, null);
    console.log("No Login PATCH Status & Body:", resNoLoginPatch.status, JSON.stringify(resNoLoginPatch.body, null, 2));

  } catch(e) {
    console.error(e);
  }
  console.log("\n=== API Test End ===");
};

run();
