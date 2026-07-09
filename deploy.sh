#!/bin/bash
# 목적: EC2 재배포 시 반복되는 명령을 한 번에 실행
# 왜: git pull + npm install + pm2 restart를 매번 따로 입력하는 번거로움을 줄이기 위함
# 무엇: 어디서 실행하든 이 스크립트가 있는 프로젝트 폴더로 이동한 뒤 최신 코드 반영·재시작
# 사용법: ./deploy.sh

set -e   # 중간에 어느 명령이든 실패하면 즉시 중단 (예: git pull이 conflict로 실패했는데 옛 코드로 pm2가 재시작되는 것 방지)

cd "$(dirname "$0")"
git pull origin develop
npm install
pm2 restart ecosystem.config.js
