# FemCare 온보딩 Splash 화면

## 1. 화면 목적
- 앱 진입 시 브랜드 아이덴티티를 전달하고 초기 로딩 처리
- 자동 로그인 여부 확인 및 적절한 화면으로 라우팅
- 앱 버전 및 초기 설정 로드

## 2. 상단 UI 구성
- **상태바**: 투명 배경, 아이콘 Rose Brown (#8C6762)
- **여백**: 상단 Safe Area 확보

## 3. 중단 UI 구성

### 중앙 로고 영역
```
┌─────────────────────────────┐
│                             │
│                             │
│        [FemCare Logo]       │
│     (Coral Pink + Icon)     │
│                             │
│      "나를 위한 건강"         │
│                             │
│                             │
└─────────────────────────────┘
```

#### 로고
- **위치**: 화면 중앙 (vertical center)
- **크기**: 120x120px
- **디자인**: FemCare 로고타입 + 아이콘
- **색상**: Coral Pink (#F7C8C0)

#### 태그라인
- **텍스트**: "나를 위한 건강"
- **위치**: 로고 하단 16px 간격
- **폰트**: Pretendard SemiBold 18px
- **색상**: Rose Brown (#8C6762)
- **정렬**: Center

## 4. 하단 UI 구성

### 버전 정보
- **위치**: 하단에서 40px 위
- **텍스트**: "v1.0.0"
- **폰트**: Pretendard Regular 12px
- **색상**: Gray (#5A5A5A)
- **정렬**: Center

### 로딩 인디케이터
- **위치**: 버전 정보 상단 24px
- **스타일**: Circular spinner
- **색상**: Coral Pink (#F7C8C0)
- **크기**: 32x32px

## 5. UI 컴포넌트 구조

```jsx
<SplashScreen>
  <Container background="#F5EEE8">
    {/* 중앙 영역 */}
    <CenterContent>
      <Logo
        source="femcare_logo.svg"
        size={120}
        tintColor="#F7C8C0"
      />
      <Tagline
        text="나를 위한 건강"
        fontSize={18}
        fontWeight="semibold"
        color="#8C6762"
        marginTop={16}
      />
    </CenterContent>

    {/* 하단 영역 */}
    <BottomContent>
      <LoadingSpinner
        size={32}
        color="#F7C8C0"
      />
      <VersionText
        text="v1.0.0"
        fontSize={12}
        color="#5A5A5A"
        marginTop={24}
      />
    </BottomContent>
  </Container>
</SplashScreen>
```

## 6. 기능 로직 (FRD 기반)

### 초기화 프로세스
1. **앱 시작** (0ms)
   - Splash 화면 표시
   - 배경색: Warm Beige (#F5EEE8)

2. **설정 로드** (0-500ms)
   - AsyncStorage에서 사용자 설정 불러오기
   - 언어 설정 (기본: 한국어)
   - 테마 설정 (기본: Lanove)

3. **인증 확인** (500-1000ms)
   - 저장된 액세스 토큰 확인
   - 토큰 유효성 검증 (API 호출)
   - 리프레시 토큰으로 갱신 시도

4. **라우팅 결정** (1000-1500ms)
   - **케이스 A**: 유효한 토큰 존재 → 홈 화면으로 이동
   - **케이스 B**: 토큰 없음 + 온보딩 완료 → 로그인 화면으로 이동
   - **케이스 C**: 첫 실행 → 온보딩1 화면으로 이동

5. **화면 전환** (1500ms)
   - Fade out 애니메이션 (300ms)
   - 다음 화면으로 네비게이션

### 에러 처리
- **네트워크 에러**: 오프라인 모드로 진입 → 온보딩 화면
- **API 에러**: 로그아웃 처리 → 온보딩 화면
- **설정 로드 실패**: 기본값 사용

### 타이밍 제어
```javascript
const MINIMUM_SPLASH_DURATION = 1500; // 최소 1.5초 표시
const MAXIMUM_SPLASH_DURATION = 3000; // 최대 3초 초과 시 타임아웃

const splashTimer = setTimeout(() => {
  navigateToNextScreen();
}, MINIMUM_SPLASH_DURATION);
```

## 7. Validation 규칙

### 토큰 검증
- **액세스 토큰**: JWT 형식 검증, 만료 시간 확인
- **리프레시 토큰**: 유효기간 30일 이내

### 버전 체크
- **최소 지원 버전**: API 응답으로 확인
- **강제 업데이트**: 최소 버전 미만 시 스토어로 이동

### 데이터 무결성
- **로컬 데이터**: 손상된 경우 초기화
- **캐시 데이터**: 30일 이상 오래된 경우 삭제

## 8. API 목록

### GET /api/v1/auth/verify
**목적**: 토큰 유효성 검증

**Request Headers**:
```json
{
  "Authorization": "Bearer {access_token}"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "isActive": true
  }
}
```

**Response 401** (토큰 만료):
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "액세스 토큰이 만료되었습니다"
  }
}
```

### POST /api/v1/auth/refresh
**목적**: 액세스 토큰 갱신

**Request Body**:
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

### GET /api/v1/app/config
**목적**: 앱 설정 및 버전 정보 확인

**Response 200**:
```json
{
  "success": true,
  "data": {
    "minVersion": "1.0.0",
    "latestVersion": "1.0.0",
    "forceUpdate": false,
    "maintenanceMode": false,
    "features": {
      "aiAnalysis": true,
      "subscription": true,
      "donation": true
    }
  }
}
```

## 9. 스타일 속성 (Lanove 규칙 적용)

### Container
```css
background-color: #F5EEE8; /* Warm Beige */
width: 100%;
height: 100%;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
```

### Logo
```css
width: 120px;
height: 120px;
tint-color: #F7C8C0; /* Coral Pink */
```

### Tagline
```css
font-family: 'Pretendard';
font-size: 18px;
font-weight: 600; /* SemiBold */
color: #8C6762; /* Rose Brown */
text-align: center;
margin-top: 16px;
letter-spacing: -0.3px;
```

### LoadingSpinner
```css
width: 32px;
height: 32px;
color: #F7C8C0; /* Coral Pink */
```

### VersionText
```css
font-family: 'Pretendard';
font-size: 12px;
font-weight: 400; /* Regular */
color: #5A5A5A; /* Gray */
text-align: center;
margin-top: 24px;
position: absolute;
bottom: 40px;
```

### Animations
```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Fade Out */
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Apply */
.splash-container {
  animation: fadeIn 0.3s ease-in;
}

.splash-container.exit {
  animation: fadeOut 0.3s ease-out;
}
```

### Safe Area
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

## 추가 고려사항

### 성능 최적화
- 로고 이미지 사전 로드
- 필수 폰트만 로드 (Pretendard)
- 불필요한 라이브러리 지연 로드

### 접근성
- VoiceOver/TalkBack: "펨케어 로딩 중"
- 시각적 피드백: 로딩 스피너

### 다크모드 대응 (추후)
- 배경: #1A1A1A
- 로고: #F7C8C0 (동일)
- 텍스트: #E5E5E5
