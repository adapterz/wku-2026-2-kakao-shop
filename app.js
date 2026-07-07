const express = require('express');
const path = require('path');

const productsRouter = require('./routes/products');

const app = express();
const PORT = 3000;

// JSON 요청 본문 파싱 미들웨어
app.use(express.json());

// 1. public/ 폴더 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, 'public')));

// 2. GET /api/health 라우터 설정
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/products', productsRouter);

// 3. 3000번 포트로 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
