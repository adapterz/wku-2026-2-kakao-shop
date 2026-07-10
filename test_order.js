async function run() {
  await fetch("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "testuser99@example.com", password: "password", nickname: "tester99" })
  });

  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "testuser99@example.com", password: "password" })
  });
  const cookie = loginRes.headers.get("set-cookie");
  console.log("Login Res:", await loginRes.json());
  
  const orderRes = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookie
    },
    body: JSON.stringify({
      productId: 76,
      message: "Test message",
      isSelfGift: true,
      totalPrice: 9999999 // The malicious payload
    })
  });
  const orderData = await orderRes.json();
  console.log("Order Res:", orderData);
  
  if (orderData.data && orderData.data.orderId) {
    const detailRes = await fetch("http://localhost:3000/api/orders/" + orderData.data.orderId, {
      headers: { "Cookie": cookie }
    });
    console.log("Order Detail:", JSON.stringify(await detailRes.json(), null, 2));
  }
}
run();
