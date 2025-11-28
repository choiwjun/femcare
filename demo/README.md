# FemCare 테스트 화면 (HTML 프로토타입)

FemCare 앱의 주요 화면을 브라우저에서 직접 확인할 수 있는 인터랙티브 프로토타입입니다.

## 📱 화면 목록

### 1. 홈 메인 화면 (`home-main.html`)
- **주요 기능**:
  - 다음 생리 예정일 카드 (그라데이션 배경)
  - 주기 진행률 바
  - 6개 빠른 액션 그리드 (AI 분석, 캘린더, 구독 등)
  - 오늘의 건강 팁 배너
  - 기부 프로젝트 카드
  - 하단 탭 네비게이션

### 2. AI 분석 결과 화면 (`analysis-result.html`)
- **주요 기능**:
  - 전체 상태 카드 (양호/주의/경고 그라데이션)
  - 출혈량 인디케이터 (1-5 레벨 점)
  - 색상 분석 (원형 색상 표시)
  - AI 건강 코멘트
  - 경고 박스 (조건부)
  - 하단 액션 버튼 (상세보기, 기록저장)

## 🚀 사용 방법

### 방법 1: 브라우저에서 직접 열기

1. 파일 탐색기에서 `demo` 폴더로 이동
2. `home-main.html` 파일을 더블클릭하여 브라우저에서 열기
3. 화면에서 "AI 분석" 버튼을 클릭하면 `analysis-result.html`로 이동

### 방법 2: 터미널에서 열기 (Mac/Linux)

```bash
# 홈 메인 화면 열기
open demo/home-main.html

# AI 분석 결과 화면 열기
open demo/analysis-result.html
```

### 방법 3: 간단한 웹 서버로 실행

```bash
# Python 3를 사용한 로컬 서버
cd demo
python3 -m http.server 8000

# 브라우저에서 접속
# http://localhost:8000/home-main.html
```

## 🎨 디자인 스타일

### Lanove 디자인 시스템 적용

- **Color Palette**:
  - Primary: `#F7C8C0` (Coral Pink)
  - Background: `#F5EEE8` (Warm Beige)
  - Text Primary: `#8C6762` (Rose Brown)
  - Text Secondary: `#5A5A5A` (Gray)

- **Typography**:
  - Font Family: Pretendard, Noto Sans KR
  - H1-H4, Body1-2, Caption 스타일 적용

- **Components**:
  - Card Radius: `22px`
  - Button Radius: `20px`
  - Shadows: Soft, minimal
  - Gradients: Linear gradient (135deg)

## ✨ 인터랙티브 기능

### 홈 메인 화면
- ✅ 알림 버튼 클릭 → Toast 메시지
- ✅ 기록하기 버튼 → Toast 알림
- ✅ 6개 빠른 액션 → 호버 애니메이션 + Toast
- ✅ 건강 팁 배너 → 호버 효과
- ✅ 기부 카드 → 진행률 애니메이션
- ✅ AI 분석 버튼 → 분석 결과 화면 이동
- ✅ 하단 탭 네비게이션 → Toast 알림

### AI 분석 결과 화면
- ✅ 뒤로가기 → 홈으로 이동
- ✅ 출혈량 인디케이터 → 순차 애니메이션
- ✅ 상세 분석 보기 → Toast 알림
- ✅ 기록 저장 → 로딩 스피너 → 홈으로 이동

## 📊 애니메이션

- **Fade In Up**: 섹션 등장 애니메이션
- **Fade In Scale**: 상태 카드 등장
- **Bounce**: 상태 아이콘 튕김 효과
- **Progress Bar**: 진행률 채워지는 효과
- **Hover Effects**: 버튼, 카드 호버 시 확대/이동
- **Toast**: 하단에서 올라오는 알림

## 🔧 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, Animations, Gradients
- **JavaScript (Vanilla)**: DOM 조작, 이벤트 핸들링

## 📝 참고사항

- **반응형**: 최대 너비 420px (모바일 화면)
- **브라우저 호환성**: Chrome, Safari, Firefox, Edge 최신 버전
- **실제 앱과의 차이**:
  - API 연동 없음 (더미 데이터)
  - 로컬 스토리지 미사용
  - 실제 네비게이션 대신 Toast 알림

## 🚀 다음 단계

1. **React Native 구현**: `docs/frontend/` 폴더의 명세서 참고
2. **백엔드 연동**: `docs/backend/` 폴더의 API 명세서 참고
3. **Figma 디자인**: 고해상도 목업 생성

---

**제작**: Claude + FemCare Team
**라이선스**: MIT
**버전**: v1.0.0
