#!/bin/bash
# 목적: EC2 재배포 시 반복되는 명령을 한 번에 실행
# 왜: 앱이 Docker(app+nginx 컨테이너)로 전환됨에 따라 pm2 방식을 대체. GitHub Actions가 미리 빌드해
#     ghcr.io에 올려둔 이미지를 받아오기만 하면 되므로, EC2에서는 빌드하지 않고 pull만 함
# 무엇: 어디서 실행하든 이 스크립트가 있는 프로젝트 폴더로 이동해 main으로 전환·최신화 후 이미지 pull·재시작
# 사용법: ./deploy.sh

set -e   # 중간에 어느 명령이든 실패하면 즉시 중단 (예: git pull이 conflict로 실패했는데 옛 컨테이너로 재시작되는 것 방지)

cd "$(dirname "$0")"
git switch main
git pull origin main
docker compose pull
docker compose up -d
