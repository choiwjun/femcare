# FemCare Backend API

FemCare AI Analysis Backend - NestJS + Prisma + PostgreSQL

## 📋 기술 스택

- **Framework**: NestJS 10.x (TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (Passport)
- **Storage**: AWS S3
- **Image Processing**: Sharp
- **Documentation**: Swagger/OpenAPI
- **Architecture**: RESTful API

## 🚀 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 실제 값으로 수정
```

### 2. 데이터베이스 설정

```bash
# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate

# Prisma Studio 실행 (DB GUI)
npm run prisma:studio
```

### 3. 개발 서버 실행

```bash
# 개발 모드 (Watch mode)
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

## 📚 API 문서

서버 실행 후 Swagger UI에서 확인:
```
http://localhost:3001/api/docs
```

## 🗂️ 프로젝트 구조

```
backend/
├── src/
│   ├── modules/
│   │   ├── analysis/          # AI 분석 모듈
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── services/       # 비즈니스 로직
│   │   │   ├── guards/         # 권한 검증
│   │   │   ├── exceptions/     # 커스텀 예외
│   │   │   ├── analysis.controller.ts
│   │   │   └── analysis.module.ts
│   │   ├── ai/                 # AI 서버 연동
│   │   │   ├── ai.service.ts
│   │   │   └── ai.module.ts
│   │   └── storage/            # S3 스토리지
│   │       ├── s3.service.ts
│   │       └── storage.module.ts
│   ├── common/                 # 공통 모듈
│   │   ├── decorators/         # 커스텀 데코레이터
│   │   ├── filters/            # 예외 필터
│   │   └── guards/             # 인증 가드
│   ├── prisma/                 # Prisma 서비스
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts           # 루트 모듈
│   └── main.ts                 # 엔트리 포인트
├── prisma/
│   └── schema.prisma           # 데이터베이스 스키마
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔑 주요 API 엔드포인트

### 분석 (Analysis)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analysis/upload` | 이미지 업로드 및 분석 시작 |
| GET | `/api/v1/analysis/:id` | 분석 결과 조회 |
| GET | `/api/v1/analysis/status/:id` | 분석 처리 상태 조회 |
| GET | `/api/v1/analysis` | 분석 히스토리 조회 (페이지네이션) |
| DELETE | `/api/v1/analysis/:id` | 분석 결과 삭제 |
| POST | `/api/v1/analysis/:id/save` | 건강 기록 저장 |
| POST | `/api/v1/analysis/:id/share` | 공유 토큰 생성 |

## 📊 데이터베이스 스키마

### User (사용자)
- 구독 정보 (FREE: 3회/월, PREMIUM: 무제한)
- 월별 분석 횟수 추적

### Analysis (분석 결과)
- 이미지 정보 (S3 URL, 키, 크기)
- 처리 상태 (PROCESSING, COMPLETED, FAILED)
- 출혈량 분석 (레벨 1-5, 신뢰도, 트렌드)
- 색상 분석 (RGB, HEX, 상태)
- AI 코멘트 및 경고
- 메타데이터 (모델 버전, 처리 시간, 이미지 품질)

### HealthRecord (건강 기록)
- Analysis와 1:1 관계
- 저장된 분석 결과

### AnalysisLog (분석 로그)
- 단계별 처리 로그
- 에러 추적

## 🔐 인증 및 권한

- JWT Bearer 토큰 인증
- `JwtAuthGuard`: 모든 API 엔드포인트 보호
- `AnalysisOwnerGuard`: 본인 리소스만 접근 가능

## 🎯 구독 시스템

- **FREE 티어**: 월 3회 분석
- **PREMIUM 티어**: 무제한 분석
- 매월 자동 리셋 (Cron Job)

## 🛠️ 개발 도구

```bash
# 린트
npm run lint

# 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:cov
```

## 📝 환경 변수

필수 환경 변수는 `.env.example` 참고:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키
- `AWS_*`: AWS S3 설정
- `AI_SERVER_URL`: AI 분석 서버 URL

## 🚨 에러 처리

모든 예외는 `AllExceptionsFilter`에서 처리:
- HTTP 상태 코드
- 타임스탬프
- 요청 경로
- 에러 메시지
- 상세 정보

## 📦 배포

```bash
# 프로덕션 빌드
npm run build

# PM2로 실행
pm2 start dist/main.js --name femcare-backend
```

## 📄 라이선스

MIT

---

**제작**: FemCare Team
**버전**: 1.0.0
