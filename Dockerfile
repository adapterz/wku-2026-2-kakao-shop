# 목적: Node 앱(FE 정적파일 + BE API)을 컨테이너 하나로 실행하기 위한 이미지 정의
# 왜: EC2에 Node를 직접 설치하지 않고도 동일한 환경을 어디서든 재현하기 위함
# 무엇: package.json 기준으로 의존성 설치 후 app.js를 실행

FROM node:24

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
