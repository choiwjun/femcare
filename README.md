# FemCare - 한국형 FemTech 앱

> 여성 건강을 위한 종합 FemTech 플랫폼
> AI 기반 생리대 분석, 월경 주기 관리, 정기구독, 자동 기부, 전문 상담, 커뮤니티

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Design](https://img.shields.io/badge/design-Lanove-coral)

---

## 📚 프로젝트 개요

FemCare는 여성 건강 관리를 위한 올인원 모바일 애플리케이션입니다. AI 기술을 활용한 건강 분석부터 정기구독, 사회 기부까지 통합된 서비스를 제공합니다.

### 주요 기능

- 🤖 **AI 생리대 분석**: 출혈량 및 건강 상태 자동 분석
- 📅 **월경 캘린더**: 주기 예측 및 건강 기록 관리
- 📦 **정기구독**: 맞춤형 생리용품 정기 배송
- 💝 **자동 기부**: 구독 금액 1% 자동 적립 및 기부
- 💬 **전문 상담**: 텍스트/영상 상담 및 병원 예약
- 👥 **커뮤니티**: 경험 공유 및 전문가 칼럼

---

## 📂 프로젝트 구조

```
femcare/
├── README.md                           # 프로젝트 소개
│
├── docs/
│   ├── overview.md                     # 프로젝트 전체 개요
│   │
│   ├── design-system/
│   │   └── design-system.md            # Lanove 디자인 시스템
│   │
│   ├── screens/                        # 화면 스펙 (54개)
│   │   ├── 01-onboarding/              # 온보딩/가입 (8개)
│   │   ├── 02-home/                    # 홈 (4개)
│   │   ├── 03-ai-analysis/             # AI 분석 (6개)
│   │   ├── 04-health/                  # 건강 (7개)
│   │   ├── 05-subscription/            # 정기구독 (9개)
│   │   ├── 06-donation/                # 기부 (5개)
│   │   ├── 07-consultation/            # 상담 (8개)
│   │   ├── 08-community/               # 커뮤니티 (4개)
│   │   └── 09-mypage/                  # 마이페이지 (3개)
│   │
│   └── components/                     # 컴포넌트 설계 (Atomic Design)
│       ├── home-main-components.md
│       ├── analysis-result-components.md
│       └── calendar-components.md
│
└── (구현 코드는 추후 추가 예정)
```

---

## 🎨 디자인 시스템 (Lanove 스타일)

### 컬러 팔레트

| 용도 | 컬러 | Hex Code |
|------|------|----------|
| Primary | Coral Pink | `#F7C8C0` |
| Background | Warm Beige | `#F5EEE8` |
| Text Primary | Rose Brown | `#8C6762` |
| Text Secondary | Gray | `#5A5A5A` |
| Surface | White | `#FFFFFF` |
| Border | Light Beige | `#E5E5E5` |

### 타이포그래피

- **Font Family**: Pretendard, Noto Sans KR
- **Font Sizes**: H1(28px) ~ Caption(12px)
- **Font Weights**: Regular(400), Medium(500), SemiBold(600), Bold(700)

### UI 컴포넌트

- **Card**: Border-radius 22px, Border 1px #F5EEE8
- **Button**: Border-radius 20px, Coral Pink 배경
- **Icon**: 2px rounded stroke, 24x24px

### UI 톤 & 필

✨ 따뜻함 · 미니멀 · 부드러움 · 플랫

자세한 내용은 [`docs/design-system/design-system.md`](docs/design-system/design-system.md) 참조

---

## 📱 화면 스펙 구조

각 화면 스펙 문서는 다음 9가지 항목을 포함합니다:

1. **화면 목적** - 화면의 역할과 사용자 목표
2. **상단 UI 구성** - 네비게이션 바, 헤더
3. **중단 UI 구성** - 메인 콘텐츠 영역
4. **하단 UI 구성** - 버튼, 탭 네비게이션
5. **UI 컴포넌트 구조** - JSX 구조 및 계층
6. **기능 로직 (FRD 기반)** - 비즈니스 로직 및 JavaScript 코드
7. **Validation 규칙** - 입력 검증 및 에러 처리
8. **API 목록** - Endpoint, Request/Response 예시
9. **스타일 속성** - Lanove 스타일 적용 CSS

---

## 🧩 컴포넌트 설계 (Atomic Design)

### 설계 원칙

- **Atomic Design Pattern** 적용
- Atoms → Molecules → Organisms → Templates → Pages
- **재사용성** 최대화
- **TypeScript** strict mode 준수
- **Props drilling** 최소화

### 컴포넌트 계층 예시

```
HomeMainScreen (Page)
├── HomeHeader (Organism)
│   └── GreetingHeader (Molecule)
│       ├── FMText (Atom)
│       ├── FMIcon (Atom)
│       └── FMBadge (Atom)
├── PeriodCard (Organism)
│   ├── FMText (Atom) × 3
│   ├── CycleProgressIndicator (Molecule)
│   └── FMButton (Atom)
└── TabNavigation (Organism)
```

자세한 내용은 [`docs/components/`](docs/components/) 참조

---

## 📊 주요 API 엔드포인트

### 인증 (Authentication)

- `POST /api/v1/auth/signup` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/verify` - 토큰 검증
- `POST /api/v1/auth/refresh` - 토큰 갱신

### AI 분석 (Analysis)

- `POST /api/v1/analysis/upload` - 이미지 업로드 및 분석 요청
- `GET /api/v1/analysis/{id}` - 분석 결과 조회
- `GET /api/v1/analysis/history` - 분석 이력 조회

### 건강 (Health)

- `GET /api/v1/health/calendar` - 월경 캘린더 데이터
- `POST /api/v1/health/cycle` - 주기 기록
- `GET /api/v1/health/report` - 건강 리포트
- `GET /api/v1/health/report/pdf` - PDF 다운로드

### 정기구독 (Subscription)

- `GET /api/v1/subscription/products` - 상품 목록
- `POST /api/v1/subscription/subscribe` - 구독 신청
- `GET /api/v1/subscription/orders` - 주문 내역
- `PUT /api/v1/subscription/manage` - 구독 관리

### 기부 (Donation)

- `GET /api/v1/donation/balance` - 기부 잔액
- `POST /api/v1/donation/donate` - 기부하기
- `GET /api/v1/donation/campaigns` - 캠페인 목록

### 상담 (Consultation)

- `GET /api/v1/consultation/counselors` - 상담사 목록
- `POST /api/v1/consultation/text/request` - 텍스트 상담 요청
- `POST /api/v1/consultation/video/request` - 영상 상담 예약
- `GET /api/v1/consultation/hospitals` - 병원 목록

### 커뮤니티 (Community)

- `GET /api/v1/community/posts` - 게시글 목록
- `POST /api/v1/community/posts` - 게시글 작성
- `GET /api/v1/community/columns` - 전문가 칼럼

---

## 🚀 시작하기

### 1. 문서 확인

```bash
# 프로젝트 개요
cat docs/overview.md

# 디자인 시스템
cat docs/design-system/design-system.md

# 특정 화면 스펙
cat docs/screens/02-home/01-home-main.md

# 컴포넌트 설계
cat docs/components/home-main-components.md
```

### 2. 화면 목록 (총 54개)

#### 온보딩/가입 (8개)
1. Splash 화면
2-4. 온보딩 1-3
5. 가입 선택
6. 본인인증
7. 건강정보 입력
8. 온보딩 완료

#### 홈 (4개)
1. 홈 메인
2. AI 분석 CTA
3. 구독 현황
4. 기부 배너

#### AI 분석 (6개)
1. 촬영 가이드
2. 촬영
3. 분석 로딩
4. 분석 결과 요약
5. 분석 상세 그래프
6. 상담 권유

#### 건강 (7개)
1. 월경 캘린더
2. 주기 상세
3. 건강 리포트 홈
4. 출혈량 그래프
5. PMS 그래프
6. 감정 변화 그래프
7. PDF 다운로드

#### 정기구독 (9개)
1. 구독 메인
2. 상품 상세
3. 옵션 선택
4. 배송 주기 선택
5. 결제수단 선택
6. 결제 완료
7. 구독 관리
8. 배송 조회
9. 배송 상세 타임라인

#### 기부 (5개)
1. 기부 메인
2. 기부 적립 내역
3. 기부 캠페인 상세
4. 기부 그래프
5. 기부 배지

#### 상담 (8개)
1. 상담 메인
2. 텍스트 상담 홈
3. 텍스트 상담 채팅
4. 상담사 프로필
5. 영상 상담 대기
6. 영상 상담
7. 병원 리스트
8. 병원 예약 상세

#### 커뮤니티 (4개)
1. 커뮤니티 메인
2. 게시글 상세
3. 전문가 칼럼 리스트
4. 칼럼 상세

#### 마이페이지 (3개)
1. 마이페이지 메인
2. 개인정보/약관
3. 알림 설정

---

## 📈 진행 상황

### ✅ 완료

- [x] 프로젝트 구조 설계
- [x] 디자인 시스템 정의 (Lanove 스타일)
- [x] 54개 화면 스펙 작성
- [x] 주요 화면 컴포넌트 설계 (홈, AI 분석, 캘린더)

### 🚧 진행 중

- [ ] 컴포넌트 구현 (Atoms → Molecules → Organisms)
- [ ] 화면 구현 (온보딩 → 홈 → 코어 기능)
- [ ] API 서버 개발
- [ ] AI 모델 학습 및 배포

### 📅 예정

- [ ] 사용자 테스트 (Alpha)
- [ ] 성능 최적화
- [ ] 앱스토어 배포 준비
- [ ] 마케팅 자료 제작

---

## 🛠️ 기술 스택 (권장)

### Frontend

- **Framework**: React Native / Flutter
- **Language**: TypeScript
- **State Management**: Redux Toolkit / Zustand
- **Navigation**: React Navigation
- **Styling**: Styled Components / NativeWind

### Backend

- **Runtime**: Node.js / Python (FastAPI)
- **Database**: PostgreSQL, MongoDB
- **Cache**: Redis
- **Authentication**: JWT

### AI/ML

- **Framework**: TensorFlow / PyTorch
- **Vision**: OpenCV
- **Cloud**: AWS SageMaker / Google Cloud AI

### Infrastructure

- **Cloud**: AWS / GCP
- **CDN**: CloudFront / CloudFlare
- **Storage**: S3
- **CI/CD**: GitHub Actions

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

- **GitHub Issues**: [https://github.com/choiwjun/femcare/issues](https://github.com/choiwjun/femcare/issues)

---

**Made with ❤️ for Women's Health**
