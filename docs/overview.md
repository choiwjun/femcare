# FemCare - 한국형 FemTech 앱

## 프로젝트 개요

FemCare는 여성 건강을 위한 종합 FemTech 플랫폼으로, AI 기반 생리대 분석, 월경 주기 관리, 정기구독, 자동 기부, 전문 상담, 커뮤니티 기능을 제공합니다.

## 주요 기능

### 1. AI 생리대 분석
- 생리대 촬영 및 AI 기반 출혈량 분석
- 건강 상태 평가 및 이상 징후 감지
- 분석 이력 저장 및 추이 관리

### 2. 월경 캘린더 & 건강 관리
- 월경 주기 예측 및 기록
- PMS 증상 추적
- 감정 변화 기록
- 건강 리포트 생성 및 PDF 다운로드

### 3. 생리대 정기구독
- 맞춤형 생리대 추천
- 유연한 배송 주기 설정
- 간편 결제 및 구독 관리
- 배송 추적 및 알림

### 4. 자동 기부 시스템
- 구독 금액의 1% 자동 적립
- 여성 건강 관련 캠페인 지원
- 기부 내역 및 임팩트 리포트
- 기부 배지 시스템

### 5. 전문 상담
- 텍스트 채팅 상담
- 영상 상담 (1:1)
- 병원 예약 및 연계
- 상담 이력 관리

### 6. 커뮤니티
- 사용자 게시판
- 전문가 칼럼
- 경험 공유 및 Q&A
- 댓글 및 공감 기능

### 7. 마이페이지
- 개인정보 관리
- 알림 설정
- 구독/결제 내역
- 설정 및 약관

## 화면 구성 (총 54개)

### 온보딩/가입 (8개)
1. Splash 화면
2. 온보딩 1 - 소개
3. 온보딩 2 - AI 분석
4. 온보딩 3 - 구독/기부
5. 가입 선택 화면
6. 본인인증 화면
7. 건강정보 입력 화면
8. 온보딩 완료 화면

### 홈 (4개)
1. 홈 메인 화면
2. AI 분석 CTA 화면
3. 구독 현황 화면
4. 기부 배너 화면

### AI 분석 (6개)
1. 촬영 가이드 화면
2. 촬영 화면
3. 분석 로딩 화면
4. 분석 결과 요약 화면
5. 분석 상세 그래프 화면
6. 상담 권유 화면

### 건강 (7개)
1. 월경 캘린더 화면
2. 주기 상세 화면
3. 건강 리포트 홈 화면
4. 출혈량 그래프 화면
5. PMS 그래프 화면
6. 감정 변화 그래프 화면
7. PDF 다운로드 화면

### 정기구독 (9개)
1. 구독 메인 화면
2. 상품 상세 화면
3. 옵션 선택 화면
4. 배송 주기 선택 화면
5. 결제수단 선택 화면
6. 결제 완료 화면
7. 구독 관리 화면
8. 배송 조회 화면
9. 배송 상세 타임라인 화면

### 기부 (5개)
1. 기부 메인 화면
2. 기부 적립 내역 화면
3. 기부 캠페인 상세 화면
4. 기부 그래프 화면
5. 기부 배지 화면

### 상담 (8개)
1. 상담 메인 화면
2. 텍스트 상담 홈 화면
3. 텍스트 상담 채팅 화면
4. 상담사 프로필 화면
5. 영상 상담 대기 화면
6. 영상 상담 화면
7. 병원 리스트 화면
8. 병원 예약 상세 화면

### 커뮤니티 (4개)
1. 커뮤니티 메인 화면
2. 게시글 상세 화면
3. 전문가 칼럼 리스트 화면
4. 칼럼 상세 화면

### 마이페이지 (3개)
1. 마이페이지 메인 화면
2. 개인정보/약관 화면
3. 알림 설정 화면

## 기술 스택 (권장)

### Frontend
- React Native / Flutter
- State Management: Redux / MobX / Zustand
- UI Library: Custom components (Lanove style)

### Backend
- Node.js / Python (FastAPI)
- Database: PostgreSQL / MongoDB
- Cache: Redis

### AI/ML
- TensorFlow / PyTorch
- Computer Vision: OpenCV
- Cloud: AWS SageMaker / Google Cloud AI

### Infrastructure
- Cloud: AWS / GCP
- CDN: CloudFront / CloudFlare
- Storage: S3

## API 구조

### Authentication
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/verify
- POST /api/auth/refresh

### User
- GET /api/user/profile
- PUT /api/user/profile
- GET /api/user/health-info
- PUT /api/user/health-info

### AI Analysis
- POST /api/analysis/upload
- GET /api/analysis/{id}
- GET /api/analysis/history

### Health
- GET /api/health/calendar
- POST /api/health/cycle
- GET /api/health/report
- GET /api/health/report/pdf

### Subscription
- GET /api/subscription/products
- POST /api/subscription/subscribe
- GET /api/subscription/orders
- PUT /api/subscription/manage

### Donation
- GET /api/donation/balance
- GET /api/donation/history
- POST /api/donation/donate
- GET /api/donation/campaigns

### Consultation
- GET /api/consultation/counselors
- POST /api/consultation/text/request
- POST /api/consultation/video/request
- GET /api/consultation/hospitals

### Community
- GET /api/community/posts
- POST /api/community/posts
- GET /api/community/posts/{id}
- GET /api/community/columns

## 디자인 시스템

자세한 내용은 [디자인 시스템 문서](./design-system/design-system.md) 참조

## 화면 스펙

각 화면의 상세 스펙은 `docs/screens/` 폴더 참조
