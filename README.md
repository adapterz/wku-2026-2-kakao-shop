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

### 8. 재배포 간편화 (`deploy.sh`)

코드가 업데이트될 때마다 반복하는 "코드 받기 → 패키지 설치 → 재시작"(2·3·5단계) 과정을
매번 따로 입력하지 않도록 `deploy.sh` 스크립트로 묶어두었습니다. 전체 내용은 아래와 같습니다.

```bash
#!/bin/bash
# 목적: EC2 재배포 시 반복되는 명령을 한 번에 실행
# 왜: git pull + npm install + pm2 restart를 매번 따로 입력하는 번거로움을 줄이기 위함, 실제 배포는 main 브랜치만 사용하기로 함
# 무엇: 어디서 실행하든 이 스크립트가 있는 프로젝트 폴더로 이동해 main으로 전환·최신화 후 재시작
# 사용법: ./deploy.sh

set -e   # 중간에 어느 명령이든 실패하면 즉시 중단 (예: git pull이 conflict로 실패했는데 옛 코드로 pm2가 재시작되는 것 방지)

cd "$(dirname "$0")"
git switch main
git pull origin main
npm install
pm2 restart ecosystem.config.js
```

`set -e`가 있어서, `git switch`나 `git pull`, `npm install`이 실패하면 그 즉시 스크립트가 멈추고
다음 줄(특히 `pm2 restart`)은 실행되지 않습니다. 실패했는데도 옛 코드로 재시작해버려서
"배포된 줄 착각하는" 상황을 방지합니다.

`git switch main`이 있어서, EC2가 이전에 어떤 브랜치를 체크아웃하고 있었든 항상 `main`으로
전환한 뒤 최신화됩니다. **실제 배포는 `main` 브랜치 기준으로만 진행**하며, `develop`은 기능
통합·검증용으로만 사용합니다.

어느 위치에서 실행하든 스크립트가 있는 프로젝트 폴더로 자동 이동한 뒤 실행되도록
`cd "$(dirname "$0")"`가 들어있습니다. 최초 1회만 실행 권한을 부여합니다.

```bash
chmod +x deploy.sh   # 최초 1회만
```

이후 재배포할 때는 아래 한 줄이면 됩니다.

```bash
./deploy.sh
```

CI/CD처럼 자동으로 트리거되는 것은 아니며, 여전히 EC2에 SSH로 접속해 직접 실행해야 합니다.
다만 매번 4줄을 따로 입력하는 번거로움을 줄여줍니다.

## 도메인 연결 (`iksan.store`, HTTPS)

기존에는 `http://<EC2 퍼블릭 IP>:3000`처럼 IP·포트로만 접속했는데, 이제 `https://iksan.store`로
바로 접속할 수 있도록 도메인과 SSL 인증서를 연결했습니다. 실제 IP·API 토큰 등 민감정보는
이 문서에 적지 않고 팀 내부 채널로만 공유합니다.

### 전체 구조

```
사용자 브라우저
     │  https://iksan.store
     ▼
DNS(Cloudflare) → EC2 퍼블릭 IP로 안내
     ▼
Nginx (443 포트, SSL 인증서 적용)
     │  내부적으로 전달
     ▼
Node 앱 (localhost:3000, pm2로 실행 중)
```

### 1. 도메인 · DNS 준비

- 가비아에서 `iksan.store` 도메인 구매
- 네임서버를 가비아 기본 네임서버 → **Cloudflare 네임서버**로 변경 (가비아 관리 화면에서 등록)
- Cloudflare에 A 레코드 등록 (Cloudflare 대시보드 또는 API로 설정)

| 타입 | 이름 | 값 |
| --- | --- | --- |
| A | `iksan.store` | EC2 퍼블릭 IP |
| A | `www.iksan.store` | EC2 퍼블릭 IP |

`Proxied`(주황 구름)는 끄고 **DNS only**로 설정했습니다. Cloudflare를 거치지 않고 도메인이
EC2로 직접 연결되어야, 아래에서 발급받은 인증서를 그대로 쓸 수 있기 때문입니다.

### 2. SSL 인증서 발급 (Cloudflare DNS-01 방식)

일반적인 인증(HTTP-01)은 도메인이 이미 웹서버를 가리키고 있어야 발급이 가능한데,
**DNS-01 방식은 DNS에 특정 값을 등록할 수 있는지만으로 소유권을 증명**하기 때문에
Nginx 설정 전에 먼저 발급받을 수 있었습니다.

```bash
# certbot과 Cloudflare 연동 플러그인 설치
sudo apt-get install -y certbot python3-certbot-dns-cloudflare

# Cloudflare API 토큰을 파일로 저장 (root만 읽기 가능하도록 권한 제한)
sudo mkdir -p /root/.secrets
echo "dns_cloudflare_api_token = <토큰 값>" | sudo tee /root/.secrets/cloudflare.ini
sudo chmod 600 /root/.secrets/cloudflare.ini

# 인증서 발급
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/cloudflare.ini \
  -d iksan.store -d www.iksan.store \
  --non-interactive --agree-tos -m <이메일>
```

성공하면 아래 경로에 인증서가 저장됩니다.

```
/etc/letsencrypt/live/iksan.store/fullchain.pem   (인증서)
/etc/letsencrypt/live/iksan.store/privkey.pem     (개인키)
```

**자동 갱신**: Let's Encrypt 인증서는 유효기간이 90일이라, certbot 설치 시 시스템에
자동 갱신 타이머(`certbot.timer`)가 함께 등록됩니다. 만료 30일 이내가 되면 하루 두 번
자동으로 갱신을 시도하며, 저장해둔 Cloudflare 토큰을 그대로 재사용합니다. 사람이 따로
할 일은 없습니다. 다만 갱신 후 Nginx가 새 인증서를 자동으로 다시 읽지는 않으므로,
`sudo systemctl reload nginx`가 필요하다는 점은 참고해주세요 (추후 `--deploy-hook`으로
자동화 예정).

### 3. Nginx 리버스 프록시 설정

Node 앱은 3000번 포트에서만 응답하므로, 443번(HTTPS)·80번(HTTP) 포트로 들어온 요청을
3000번으로 전달해주는 Nginx를 앞단에 세웠습니다.

```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
```

`/etc/nginx/sites-available/iksan.store` 작성:

```nginx
server {
    listen 80;
    server_name iksan.store www.iksan.store;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name iksan.store www.iksan.store;

    ssl_certificate /etc/letsencrypt/live/iksan.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iksan.store/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- 80번(HTTP)으로 들어오면 무조건 443번(HTTPS)으로 리다이렉트
- 443번(HTTPS)은 인증서를 적용한 뒤 `localhost:3000`(우리 앱)으로 요청을 그대로 전달
- `X-Real-IP`, `X-Forwarded-For` 등은 "원래 접속자가 누구인지" 정보를 앱에도 전달하기 위한 설정

적용:

```bash
sudo ln -sf /etc/nginx/sites-available/iksan.store /etc/nginx/sites-enabled/iksan.store
sudo rm -f /etc/nginx/sites-enabled/default   # 기본 설정과 충돌 방지
sudo nginx -t                                  # 문법 검사
sudo systemctl reload nginx                    # 무중단 적용
```

### 4. 확인

```
https://iksan.store
```

브라우저 주소창에 자물쇠 아이콘이 뜨면 정상입니다.

### ⚠️ 알아두면 좋은 점 — DNS 전파 지연

네임서버 자체를 바꾼 직후에는(가비아 → Cloudflare), 접속하는 네트워크(특히 학교망·회사망처럼
자체 DNS 서버를 쓰는 곳)에 따라 **한동안 접속이 안 될 수 있습니다.** 이건 서버 설정 문제가
아니라, 그 네트워크의 DNS 서버가 아직 옛 정보를 캐싱하고 있어서 생기는 정상적인 지연입니다.

- 보통 몇 시간 내로 자동 해결되며, 드물게 최대 24~48시간 걸릴 수 있습니다
- 급하게 확인해야 하면, 개인 핫스팟(모바일 데이터)으로 접속하거나, 컴퓨터의 DNS 서버를
  `1.1.1.1`/`8.8.8.8`로 수동 설정하면 우회해서 먼저 확인할 수 있습니다
