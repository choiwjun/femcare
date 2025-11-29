#!/bin/bash

echo "🚀 FemCare 프로젝트 시작"
echo "========================"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 백엔드 시작 함수
start_backend() {
  echo -e "${GREEN}📦 백엔드 서버 시작...${NC}"
  echo ""

  cd backend

  # 의존성 설치 확인
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}의존성 설치 중...${NC}"
    npm install
  fi

  # .env 파일 확인
  if [ ! -f ".env" ]; then
    echo -e "${RED}.env 파일이 없습니다!${NC}"
    echo -e "${YELLOW}.env.example을 참고하여 .env 파일을 생성하세요.${NC}"
    exit 1
  fi

  # Prisma 클라이언트 생성
  echo -e "${YELLOW}Prisma 클라이언트 생성 중...${NC}"
  npm run prisma:generate

  # 개발 서버 시작
  echo -e "${GREEN}백엔드 서버 실행 (http://localhost:3001)${NC}"
  npm run start:dev
}

# 모바일 앱 시작 함수
start_mobile() {
  echo -e "${GREEN}📱 모바일 앱 시작...${NC}"
  echo ""

  cd mobile

  # 의존성 설치 확인
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}의존성 설치 중...${NC}"
    npm install
  fi

  # Metro 번들러 시작
  echo -e "${GREEN}Metro 번들러 실행${NC}"
  npm start
}

# HTML 프로토타입 시작 함수
start_demo() {
  echo -e "${GREEN}🎨 HTML 프로토타입 시작...${NC}"
  echo ""

  cd demo

  echo -e "${GREEN}웹 서버 실행 (http://localhost:8000)${NC}"
  python3 -m http.server 8000
}

# 메뉴 선택
echo "실행할 항목을 선택하세요:"
echo "1) 백엔드 서버"
echo "2) 모바일 앱"
echo "3) HTML 프로토타입"
echo "4) 종료"
echo ""
read -p "선택 (1-4): " choice

case $choice in
  1)
    start_backend
    ;;
  2)
    start_mobile
    ;;
  3)
    start_demo
    ;;
  4)
    echo "종료합니다."
    exit 0
    ;;
  *)
    echo -e "${RED}잘못된 선택입니다.${NC}"
    exit 1
    ;;
esac
