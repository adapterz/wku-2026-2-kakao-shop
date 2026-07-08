// 목적: EC2에서 pm2로 서버를 상시 실행하기 위한 설정
// 왜: SSH 세션이 끊겨도 서버가 죽지 않고, 크래시 시 자동 재시작되게 하기 위함
// 무엇: app.js를 pm2 프로세스로 등록 (프로세스명: wku-2026-2-kakao-shop)
// 사용법: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'wku-2026-2-kakao-shop',
      script: './app.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
