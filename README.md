# wku-2026-2-kakao-shop

카카오 선물하기 클론 코딩 프로젝트 (익산 지역상생 테마)

## 배포 (EC2)

이 문서는 배포된 EC2 서버를 재시작·재배포할 때 필요한 절차를 담고 있습니다.
실제 접속 정보(IP, 계정, 비밀번호, `.pem` 키)는 보안상 이 문서에 적지 않고, 팀 내부 채널로만 공유합니다.

### 1. EC2 접속

```bash
ssh -i "키파일경로/키파일이름.pem" ubuntu@<EC2 퍼블릭 IP>
```

- `.pem` 키 파일은 배포 담당만 보관합니다.
- 최초 접속 시 "Are you sure you want to continue connecting?"이 뜨면 `yes` 입력합니다.

### 2. 코드 배치

최초 1회만 clone하고, 이후에는 pull만 하면 됩니다.

```bash
# 최초 1회
git clone https://github.com/adapterz/wku-2026-2-kakao-shop.git
cd wku-2026-2-kakao-shop
git switch develop

# 이후 코드 업데이트 시
git pull origin develop
```

### 3. 패키지 설치

`package.json`이 바뀌었을 때만 필요하지만, 매번 실행해도 무해합니다.

```bash
npm install
```

### 4. `.env` 파일 준비

`.env`는 git으로 관리하지 않으므로(`.gitignore`), EC2 서버 안에서 직접 생성해야 합니다.
아래는 필요한 항목 이름만 안내한 것이며, **실제 비밀번호·시크릿 값은 여기에 적지 않습니다.**

```
PORT=3000

DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=

SESSION_SECRET=
```

실제 값은 `.env.example`을 참고해 팀 내부 채널로 공유받은 값으로 채웁니다.

```bash
cp .env.example .env
nano .env   # 실제 값 입력 후 Ctrl+O(저장) → Enter → Ctrl+X(종료)
```

### 5. pm2로 서버 실행

```bash
pm2 start ecosystem.config.js
pm2 status        # online 상태인지 확인
pm2 logs --nostream   # 에러 없는지 확인
```

코드가 업데이트된 뒤 재시작할 때는:

```bash
pm2 restart ecosystem.config.js
```

### 6. 재부팅 시 자동 실행 설정 (최초 1회)

```bash
pm2 save
pm2 startup   # 출력된 명령어를 그대로 한 번 더 실행
```

이 설정을 해두면 EC2가 재부팅되어도 서버가 자동으로 다시 살아납니다.

### 7. 배포 확인

브라우저에서 아래 주소로 접속해 홈 화면과 상품 목록이 정상적으로 보이는지 확인합니다.

```
http://<EC2 퍼블릭 IP>:3000
```

정상적으로 보이면 배포가 완료된 것입니다.
