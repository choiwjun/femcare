# FemCare Mobile App

FemCare React Native 모바일 애플리케이션

## 🚀 시작하기

### 필수 요구사항

- Node.js >= 18
- React Native CLI
- iOS: Xcode, CocoaPods
- Android: Android Studio, JDK 11+

### 설치

```bash
# 의존성 설치
npm install

# iOS
cd ios && pod install && cd ..

# Android는 별도 설치 불필요
```

### 실행

```bash
# 개발 서버 시작
npm start

# iOS 실행
npm run ios

# Android 실행
npm run android
```

## 📱 구현된 화면

### 1. 홈 메인 화면 (`HomeMainScreen.tsx`)
- 다음 생리 예정일 카드
- 주기 진행률 표시
- 6개 빠른 액션 그리드 (AI 분석, 캘린더, 구독, 리포트, 상담, 커뮤니티)
- 오늘의 건강 팁 배너
- 기부 프로젝트 진행률 카드
- 하단 탭 네비게이션

### 2. AI 분석 결과 화면 (`AnalysisResultScreen.tsx`)
- 전체 상태 카드 (양호/주의/경고 그라데이션)
- 출혈량 인디케이터 (1-5 레벨)
- 색상 분석 (원형 색상 표시)
- AI 건강 코멘트
- 하단 액션 버튼 (상세 분석, 기록 저장)

## 🎨 디자인 시스템

### Lanove 디자인 토큰

- **Primary Color**: `#F7C8C0` (Coral Pink)
- **Background**: `#F5EEE8` (Warm Beige)
- **Text Primary**: `#8C6762` (Rose Brown)
- **Card Radius**: `22px`
- **Button Radius**: `20px`

모든 색상, 타이포그래피, 간격, 그림자는 `src/styles/tokens.ts`에서 관리

## 📁 프로젝트 구조

```
mobile/
├── src/
│   ├── components/
│   │   ├── atoms/           # 기본 컴포넌트 (FMText, FMButton)
│   │   └── molecules/       # 복합 컴포넌트 (LoadingView, ErrorView)
│   ├── screens/
│   │   ├── home/            # 홈 화면
│   │   └── analysis/        # AI 분석 화면
│   ├── services/
│   │   └── api/             # API 연동 (Axios, Analysis API)
│   ├── types/               # TypeScript 타입 정의
│   ├── styles/              # 디자인 토큰
│   └── utils/               # 유틸리티 함수
├── App.tsx                  # 루트 컴포넌트 + Navigation
├── index.js                 # 엔트리 포인트
└── package.json
```

## 🔌 API 연동

백엔드 API 서버: `http://localhost:3001/api/v1`

- Axios 인스턴스 설정: `src/services/api/axiosConfig.ts`
- JWT 토큰 자동 갱신
- 에러 핸들링 및 재시도

### 주요 API

- `GET /analysis/:id` - 분석 결과 조회
- `POST /analysis/:id/save` - 분석 결과 저장
- `GET /analysis` - 분석 히스토리

## 🛠️ 기술 스택

- **Framework**: React Native 0.73
- **Navigation**: React Navigation 6.x
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Type Safety**: TypeScript
- **UI Components**: Custom components (Lanove style)

## 🔧 개발 도구

```bash
# TypeScript 타입 체크
npm run typecheck

# 린트
npm run lint

# 테스트
npm run test
```

## 📝 TODO (향후 구현)

- [ ] 나머지 화면 구현 (52개)
- [ ] 실제 API 연동 완성
- [ ] 이미지 촬영 기능
- [ ] 푸시 알림
- [ ] 오프라인 지원
- [ ] 앱 아이콘 및 스플래시 화면

## 🔗 백엔드 연동

백엔드 서버를 먼저 실행해야 합니다:

```bash
cd ../backend
npm install
npm run start:dev
```

## 📄 라이선스

MIT

---

**제작**: FemCare Team
**버전**: 1.0.0
