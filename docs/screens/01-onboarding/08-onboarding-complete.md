# FemCare 온보딩 완료 화면

## 1. 화면 목적
- 회원가입 완료 축하
- 주요 기능 안내 및 첫 액션 유도
- 홈 화면으로의 자연스러운 전환

## 2. 상단 UI 구성

### 상태바
- **배경**: 투명
- **아이콘**: Rose Brown

## 3. 중단 UI 구성

### 축하 일러스트
```
┌─────────────────────────────┐
│                             │
│                             │
│     [축하 일러스트]          │
│   - 꽃가루/별/하트 효과      │
│   - 따뜻한 분위기            │
│                             │
│                             │
└─────────────────────────────┘
```
- **크기**: 240x240px
- **위치**: 상단에서 100px
- **애니메이션**: Scale in + 꽃가루 떨어지는 효과

### 축하 메시지
```
┌─────────────────────────────┐
│                             │
│      환영합니다! 🎉          │
│                             │
│    FemCare와 함께            │
│    건강한 내일을 시작해요     │
│                             │
└─────────────────────────────┘
```

#### 제목
- **텍스트**: "환영합니다! 🎉"
- **폰트**: Pretendard Bold 28px
- **색상**: Rose Brown (#8C6762)
- **정렬**: Center

#### 부제목
- **텍스트**: "FemCare와 함께\n건강한 내일을 시작해요"
- **폰트**: Pretendard Regular 16px
- **색상**: Gray (#5A5A5A)
- **Line Height**: 1.6

### 혜택 카드
```
┌─────────────────────────────┐
│                             │
│  ┌───────────────────────┐  │
│  │ 🎁 신규 가입 혜택      │  │
│  │                       │  │
│  │ • 첫 AI 분석 무료     │  │
│  │ • 구독 첫 달 10% 할인 │  │
│  │ • 기부 포인트 1,000원 │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

#### 카드 스타일
- **배경**: White
- **테두리**: 1px #F5EEE8
- **둥글기**: 22px
- **패딩**: 24px
- **그림자**: 0 4px 16px rgba(0,0,0,0.06)

#### 혜택 목록
- **아이콘**: 16x16px, Coral Pink
- **텍스트**: Pretendard Medium 14px
- **간격**: 12px

## 4. 하단 UI 구성

### CTA 버튼 그룹
```
┌─────────────────────────────┐
│                             │
│   [   AI 분석 시작하기   ]   │
│                             │
│      건너뛰고 둘러보기       │
│                             │
└─────────────────────────────┘
```

#### 주 버튼
- **텍스트**: "AI 분석 시작하기"
- **스타일**: Primary Button
- **액션**: AI 촬영 가이드 화면으로

#### 부 버튼
- **텍스트**: "건너뛰고 둘러보기"
- **스타일**: Text Button
- **액션**: 홈 화면으로

## 5. UI 컴포넌트 구조

```jsx
<OnboardingCompleteScreen>
  <Container background="#F5EEE8">
    {/* 배경 효과 */}
    <ConfettiAnimation />

    <Content>
      {/* 일러스트 */}
      <Illustration
        source="celebration.svg"
        width={240}
        height={240}
        animation="scaleIn"
      />

      {/* 축하 메시지 */}
      <Title>환영합니다! 🎉</Title>
      <Subtitle>
        FemCare와 함께{'\n'}
        건강한 내일을 시작해요
      </Subtitle>

      {/* 혜택 카드 */}
      <BenefitCard>
        <CardTitle>
          <Icon>🎁</Icon>
          <Text>신규 가입 혜택</Text>
        </CardTitle>

        <BenefitList>
          <BenefitItem
            icon="check"
            text="첫 AI 분석 무료"
          />
          <BenefitItem
            icon="check"
            text="구독 첫 달 10% 할인"
          />
          <BenefitItem
            icon="check"
            text="기부 포인트 1,000원"
          />
        </BenefitList>
      </BenefitCard>
    </Content>

    {/* 하단 버튼 */}
    <BottomArea>
      <PrimaryButton
        text="AI 분석 시작하기"
        onPress={handleStartAnalysis}
      />

      <TextButton
        text="건너뛰고 둘러보기"
        onPress={handleSkip}
      />
    </BottomArea>
  </Container>
</OnboardingCompleteScreen>
```

## 6. 기능 로직 (FRD 기반)

### 화면 진입 애니메이션
```javascript
useEffect(() => {
  // 1. 배경 Fade in (300ms)
  Animated.timing(backgroundOpacity, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true
  }).start();

  // 2. 일러스트 Scale in (500ms, delay 200ms)
  setTimeout(() => {
    Animated.spring(illustrationScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true
    }).start();
  }, 200);

  // 3. Confetti 효과 (delay 400ms)
  setTimeout(() => {
    startConfetti();
  }, 400);

  // 4. 텍스트 Fade in (300ms, delay 600ms)
  setTimeout(() => {
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, 600);

  // 5. 카드 Slide up (400ms, delay 800ms)
  setTimeout(() => {
    Animated.timing(cardPosition, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true
    }).start();
  }, 800);
}, []);
```

### Confetti 애니메이션
```javascript
const startConfetti = () => {
  // 색상 배열
  const colors = ['#F7C8C0', '#F5EEE8', '#8C6762'];

  // 20개의 confetti 생성
  for (let i = 0; i < 20; i++) {
    const confetti = {
      x: Math.random() * screenWidth,
      y: -50,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      speed: 2 + Math.random() * 3
    };

    confettiArray.push(confetti);
  }

  animateConfetti();
};
```

### AI 분석 시작
```javascript
const handleStartAnalysis = () => {
  // 이벤트 로깅
  logEvent('onboarding_complete_start_analysis');

  // AI 촬영 가이드로 이동
  navigation.navigate('CameraGuide', {
    fromOnboarding: true
  });
};
```

### 건너뛰기
```javascript
const handleSkip = () => {
  // 이벤트 로깅
  logEvent('onboarding_complete_skip');

  // 홈 화면으로 이동
  navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }]
  });
};
```

### 혜택 자동 적용
```javascript
useEffect(() => {
  const applyBenefits = async () => {
    try {
      await api.post('/api/v1/user/benefits/apply', {
        benefitType: 'NEW_USER'
      });
    } catch (error) {
      console.error('Failed to apply benefits:', error);
    }
  };

  applyBenefits();
}, []);
```

## 7. Validation 규칙

### 화면 진입 조건
- 회원가입 완료 상태 확인
- 토큰 저장 확인

### 혜택 적용
- 중복 적용 방지
- 서버에서 검증

## 8. API 목록

### POST /api/v1/user/benefits/apply
**목적**: 신규 가입 혜택 적용

**Request Body**:
```json
{
  "benefitType": "NEW_USER"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "benefits": [
      {
        "type": "FREE_ANALYSIS",
        "count": 1,
        "expiresAt": "2025-12-28T00:00:00Z"
      },
      {
        "type": "SUBSCRIPTION_DISCOUNT",
        "value": 10,
        "unit": "percent",
        "expiresAt": "2025-12-28T00:00:00Z"
      },
      {
        "type": "DONATION_POINTS",
        "value": 1000,
        "unit": "KRW"
      }
    ]
  }
}
```

### POST /api/v1/analytics/event
이벤트 로깅

## 9. 스타일 속성 (Lanove 규칙 적용)

### Container
```css
background-color: #F5EEE8;
width: 100%;
height: 100%;
display: flex;
flex-direction: column;
align-items: center;
justify-content: space-between;
padding: 0 20px;
```

### Illustration
```css
width: 240px;
height: 240px;
margin-top: 100px;
transform: scale(0); /* initial */

/* Animated */
animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Title
```css
font-family: 'Pretendard';
font-size: 28px;
font-weight: 700;
color: #8C6762;
text-align: center;
margin-top: 32px;
letter-spacing: -0.5px;
```

### Subtitle
```css
font-family: 'Pretendard';
font-size: 16px;
font-weight: 400;
color: #5A5A5A;
text-align: center;
line-height: 1.6;
margin-top: 12px;
```

### BenefitCard
```css
background-color: #FFFFFF;
border: 1px solid #F5EEE8;
border-radius: 22px;
padding: 24px;
margin-top: 40px;
width: 100%;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
transform: translateY(20px); /* initial */

/* Animated */
animation: slideUp 0.4s ease-out forwards;
```

### CardTitle
```css
display: flex;
align-items: center;
gap: 8px;
font-family: 'Pretendard';
font-size: 16px;
font-weight: 600;
color: #8C6762;
margin-bottom: 16px;
```

### BenefitList
```css
display: flex;
flex-direction: column;
gap: 12px;
```

### BenefitItem
```css
display: flex;
align-items: center;
gap: 8px;
font-family: 'Pretendard';
font-size: 14px;
font-weight: 500;
color: #5A5A5A;

/* Icon */
.icon {
  width: 16px;
  height: 16px;
  color: #F7C8C0;
}
```

### ConfettiParticle
```css
position: absolute;
width: 8px;
height: 8px;
border-radius: 50%;
opacity: 0.8;

/* Animation */
animation: fall 3s linear infinite;

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
```

---

## 추가 고려사항

### 일러스트레이션
- **테마**: 축하, 환영, 시작
- **요소**: 꽃, 별, 하트, 리본
- **컬러**: Coral Pink, Warm Beige

### 애니메이션 타이밍
```javascript
const timings = {
  background: { delay: 0, duration: 300 },
  illustration: { delay: 200, duration: 500 },
  confetti: { delay: 400 },
  text: { delay: 600, duration: 300 },
  card: { delay: 800, duration: 400 }
};
```

### 혜택 표시
- 실시간으로 서버에서 혜택 목록 가져오기
- 로딩 실패 시 기본 혜택 표시

### 접근성
- VoiceOver: "회원가입이 완료되었습니다"
- 버튼: "AI 분석 시작하기", "건너뛰고 둘러보기"
