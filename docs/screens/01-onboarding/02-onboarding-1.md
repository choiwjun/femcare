# FemCare 온보딩1 화면

## 1. 화면 목적
- FemCare 앱의 핵심 가치 소개
- 사용자에게 앱의 주요 기능 안내
- 온보딩 진행 상황 표시

## 2. 상단 UI 구성

### 네비게이션 바
- **높이**: 56px
- **배경**: 투명
- **우측 버튼**: "건너뛰기" (TextButton)

```
┌─────────────────────────────┐
│                    건너뛰기  │
└─────────────────────────────┘
```

## 3. 중단 UI 구성

### 인디케이터
```
┌─────────────────────────────┐
│       ● ○ ○                 │ (1/3)
└─────────────────────────────┘
```
- **위치**: 상단 네비게이션 하단 16px
- **스타일**: Dot indicators
- **색상**: 활성 - Coral Pink (#F7C8C0), 비활성 - Beige (#F5EEE8)
- **크기**: 8px, 간격 8px

### 일러스트레이션
```
┌─────────────────────────────┐
│                             │
│    [여성 건강 일러스트]       │
│    - 따뜻한 느낌             │
│    - 미니멀 스타일           │
│    - Coral Pink 포인트       │
│                             │
└─────────────────────────────┘
```
- **크기**: 280x280px
- **위치**: 중앙 상단
- **스타일**: 플랫 일러스트, 2px 라운드 stroke

### 제목 및 설명
```
┌─────────────────────────────┐
│                             │
│     나를 위한 건강 관리      │
│                             │
│  월경 주기부터 건강 상태까지 │
│   AI가 분석하고 관리해요     │
│                             │
└─────────────────────────────┘
```

#### 제목
- **텍스트**: "나를 위한 건강 관리"
- **폰트**: Pretendard Bold 24px
- **색상**: Rose Brown (#8C6762)
- **정렬**: Center
- **위치**: 일러스트 하단 32px

#### 설명
- **텍스트**: "월경 주기부터 건강 상태까지\nAI가 분석하고 관리해요"
- **폰트**: Pretendard Regular 16px
- **색상**: Gray (#5A5A5A)
- **정렬**: Center
- **Line height**: 1.6
- **위치**: 제목 하단 16px

## 4. 하단 UI 구성

### 다음 버튼
```
┌─────────────────────────────┐
│                             │
│      [    다음    ]          │
│                             │
└─────────────────────────────┘
```
- **위치**: 하단에서 40px 위 (Safe Area 고려)
- **폭**: 화면 너비 - 40px (좌우 20px 여백)
- **높이**: 52px
- **스타일**: Primary Button (Coral Pink)
- **텍스트**: "다음"

## 5. UI 컴포넌트 구조

```jsx
<OnboardingScreen1>
  <Container background="#F5EEE8">
    {/* 상단 네비게이션 */}
    <NavBar transparent>
      <SkipButton
        text="건너뛰기"
        onPress={handleSkip}
        color="#8C6762"
      />
    </NavBar>

    {/* 인디케이터 */}
    <PageIndicator
      total={3}
      current={0}
      activeColor="#F7C8C0"
      inactiveColor="#E5E5E5"
      marginTop={16}
    />

    {/* 콘텐츠 영역 */}
    <ContentArea>
      <Illustration
        source="onboarding_health.svg"
        width={280}
        height={280}
        marginTop={48}
      />

      <Title
        text="나를 위한 건강 관리"
        fontSize={24}
        fontWeight="bold"
        color="#8C6762"
        textAlign="center"
        marginTop={32}
      />

      <Description
        text="월경 주기부터 건강 상태까지\nAI가 분석하고 관리해요"
        fontSize={16}
        color="#5A5A5A"
        textAlign="center"
        lineHeight={1.6}
        marginTop={16}
      />
    </ContentArea>

    {/* 하단 버튼 */}
    <BottomArea>
      <PrimaryButton
        text="다음"
        onPress={handleNext}
        backgroundColor="#F7C8C0"
        width="100%"
        height={52}
      />
    </BottomArea>
  </Container>
</OnboardingScreen1>
```

## 6. 기능 로직 (FRD 기반)

### 화면 진입
1. Fade in 애니메이션 (300ms)
2. 일러스트레이션 Slide up 애니메이션 (400ms, delay 100ms)
3. 제목/설명 Fade in 애니메이션 (300ms, delay 200ms)

### 버튼 액션

#### 다음 버튼
```javascript
const handleNext = () => {
  // 애니메이션
  fadeOut(300);

  // 네비게이션
  navigation.navigate('Onboarding2');

  // 이벤트 로깅
  logEvent('onboarding_step_1_completed');
};
```

#### 건너뛰기 버튼
```javascript
const handleSkip = () => {
  // 확인 알림 (선택적)
  Alert.confirm({
    title: '온보딩을 건너뛰시겠어요?',
    message: '나중에 설정에서 다시 볼 수 있어요',
    confirmText: '건너뛰기',
    cancelText: '취소',
    onConfirm: () => {
      // 온보딩 완료 플래그 저장
      AsyncStorage.setItem('onboarding_completed', 'true');

      // 가입 선택 화면으로 이동
      navigation.navigate('SignupSelection');

      // 이벤트 로깅
      logEvent('onboarding_skipped', { step: 1 });
    }
  });
};
```

### 스와이프 제스처
- **좌측 스와이프**: 다음 화면으로 이동 (Onboarding2)
- **우측 스와이프**: 이전 화면으로 이동 (비활성화 - 첫 화면)

### 진행 상태 저장
```javascript
useEffect(() => {
  AsyncStorage.setItem('onboarding_current_step', '1');
}, []);
```

## 7. Validation 규칙

### 애니메이션 완료 확인
- 화면 진입 애니메이션이 완료되기 전 버튼 비활성화
- 최소 300ms 대기

### 중복 클릭 방지
- 버튼 클릭 후 300ms 동안 재클릭 방지
- Debounce 적용

### 건너뛰기 제한
- 특정 케이스에서는 건너뛰기 버튼 숨김 (예: 필수 약관 동의 필요 시)

## 8. API 목록

### POST /api/v1/analytics/event
**목적**: 사용자 행동 이벤트 로깅

**Request Body**:
```json
{
  "eventName": "onboarding_step_1_completed",
  "eventData": {
    "timestamp": "2025-11-28T10:30:00Z",
    "deviceType": "mobile",
    "osVersion": "iOS 17.0"
  },
  "userId": null
}
```

**Response 200**:
```json
{
  "success": true
}
```

## 9. 스타일 속성 (Lanove 규칙 적용)

### Container
```css
background-color: #F5EEE8;
width: 100%;
height: 100%;
padding: 0 20px;
display: flex;
flex-direction: column;
```

### NavBar
```css
height: 56px;
background-color: transparent;
display: flex;
justify-content: flex-end;
align-items: center;
padding: 0 20px;
```

### SkipButton
```css
background-color: transparent;
border: none;
padding: 8px 12px;
font-family: 'Pretendard';
font-size: 14px;
font-weight: 500;
color: #8C6762;
```

### PageIndicator
```css
display: flex;
justify-content: center;
gap: 8px;
margin-top: 16px;
```

### PageIndicatorDot
```css
width: 8px;
height: 8px;
border-radius: 4px;
transition: all 0.3s ease;

/* Active */
background-color: #F7C8C0;
width: 24px; /* elongated */

/* Inactive */
background-color: #E5E5E5;
```

### Illustration
```css
width: 280px;
height: 280px;
margin: 48px auto 0;
```

### Title
```css
font-family: 'Pretendard';
font-size: 24px;
font-weight: 700; /* Bold */
color: #8C6762;
text-align: center;
margin-top: 32px;
letter-spacing: -0.5px;
```

### Description
```css
font-family: 'Pretendard';
font-size: 16px;
font-weight: 400; /* Regular */
color: #5A5A5A;
text-align: center;
line-height: 1.6;
margin-top: 16px;
letter-spacing: -0.3px;
```

### PrimaryButton
```css
background-color: #F7C8C0;
color: #FFFFFF;
border-radius: 20px;
padding: 16px 24px;
height: 52px;
width: 100%;
font-family: 'Pretendard';
font-size: 16px;
font-weight: 600;
border: none;
box-shadow: 0 4px 12px rgba(247, 200, 192, 0.3);
transition: all 0.3s ease;

/* Active State */
transform: scale(0.98);
box-shadow: 0 2px 8px rgba(247, 200, 192, 0.2);
```

### BottomArea
```css
position: absolute;
bottom: 0;
left: 0;
right: 0;
padding: 20px;
padding-bottom: calc(40px + env(safe-area-inset-bottom));
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

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply */
.onboarding-container {
  animation: fadeIn 0.3s ease-in;
}

.illustration {
  animation: slideUp 0.4s ease-out 0.1s backwards;
}

.title {
  animation: fadeIn 0.3s ease-in 0.2s backwards;
}

.description {
  animation: fadeIn 0.3s ease-in 0.3s backwards;
}
```

---

## 추가 고려사항

### 일러스트레이션 가이드
- **테마**: 여성 건강, 따뜻함, 케어
- **컬러**: Coral Pink (#F7C8C0), Rose Brown (#8C6762), Warm Beige (#F5EEE8)
- **스타일**: 미니멀, 플랫, 2px 라운드 stroke
- **요소**: 달력, 하트, 건강 아이콘, 여성 실루엣

### 접근성
- **VoiceOver**: "온보딩 첫 번째 단계. 나를 위한 건강 관리"
- **다음 버튼**: "다음 단계로 이동"
- **건너뛰기 버튼**: "온보딩 건너뛰기"

### 다국어 지원
- 텍스트는 i18n 키로 관리
- 일러스트레이션은 언어 독립적
