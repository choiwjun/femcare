# FemCare 온보딩2 화면

## 1. 화면 목적
- AI 생리대 분석 기능 소개
- 건강 모니터링의 편리함 강조
- 온보딩 진행 2/3 단계

## 2. 상단 UI 구성

### 네비게이션 바
- **높이**: 56px
- **배경**: 투명
- **좌측 버튼**: 뒤로가기 아이콘
- **우측 버튼**: "건너뛰기"

```
┌─────────────────────────────┐
│  ←                 건너뛰기  │
└─────────────────────────────┘
```

## 3. 중단 UI 구성

### 인디케이터
```
┌─────────────────────────────┐
│       ○ ● ○                 │ (2/3)
└─────────────────────────────┘
```

### 일러스트레이션
```
┌─────────────────────────────┐
│                             │
│    [AI 분석 일러스트]        │
│    - 스마트폰 + AI 아이콘    │
│    - 생리대 + 그래프         │
│    - Coral Pink 강조         │
│                             │
└─────────────────────────────┘
```
- **크기**: 280x280px
- **스타일**: AI, 분석, 스마트 느낌

### 제목 및 설명
```
┌─────────────────────────────┐
│                             │
│     AI가 분석하는 건강       │
│                             │
│   생리대를 촬영하면 AI가     │
│   출혈량과 건강상태를 분석해요│
│                             │
└─────────────────────────────┘
```

#### 제목
- **텍스트**: "AI가 분석하는 건강"
- **폰트**: Pretendard Bold 24px
- **색상**: Rose Brown (#8C6762)

#### 설명
- **텍스트**: "생리대를 촬영하면 AI가\n출혈량과 건강상태를 분석해요"
- **폰트**: Pretendard Regular 16px
- **색상**: Gray (#5A5A5A)

### 기능 포인트 (3개)
```
┌─────────────────────────────┐
│                             │
│  📸  간편한 촬영             │
│  🤖  정확한 AI 분석          │
│  📊  건강 추이 관리          │
│                             │
└─────────────────────────────┘
```

각 포인트:
- **아이콘**: 24x24px, Coral Pink
- **텍스트**: Pretendard Medium 14px, Rose Brown
- **간격**: 16px

## 4. 하단 UI 구성

### 버튼 그룹
```
┌─────────────────────────────┐
│                             │
│      [    다음    ]          │
│                             │
└─────────────────────────────┘
```

## 5. UI 컴포넌트 구조

```jsx
<OnboardingScreen2>
  <Container background="#F5EEE8">
    {/* 상단 네비게이션 */}
    <NavBar>
      <BackButton onPress={handleBack} />
      <SkipButton text="건너뛰기" onPress={handleSkip} />
    </NavBar>

    {/* 인디케이터 */}
    <PageIndicator total={3} current={1} />

    {/* 콘텐츠 */}
    <ContentArea>
      <Illustration
        source="onboarding_ai.svg"
        width={280}
        height={280}
      />

      <Title text="AI가 분석하는 건강" />

      <Description
        text="생리대를 촬영하면 AI가\n출혈량과 건강상태를 분석해요"
      />

      {/* 기능 포인트 */}
      <FeaturePoints>
        <FeatureItem
          icon="camera"
          text="간편한 촬영"
        />
        <FeatureItem
          icon="ai"
          text="정확한 AI 분석"
        />
        <FeatureItem
          icon="chart"
          text="건강 추이 관리"
        />
      </FeaturePoints>
    </ContentArea>

    {/* 하단 버튼 */}
    <BottomArea>
      <PrimaryButton
        text="다음"
        onPress={handleNext}
      />
    </BottomArea>
  </Container>
</OnboardingScreen2>
```

## 6. 기능 로직 (FRD 기반)

### 화면 진입
1. 좌측에서 Slide in (300ms)
2. 일러스트 Fade in (400ms, delay 100ms)
3. 기능 포인트 순차 Fade in (각 100ms delay)

### 버튼 액션

#### 다음 버튼
```javascript
const handleNext = () => {
  navigation.navigate('Onboarding3');
  logEvent('onboarding_step_2_completed');
};
```

#### 뒤로가기 버튼
```javascript
const handleBack = () => {
  navigation.goBack();
};
```

### 스와이프 제스처
- **좌측 스와이프**: Onboarding3으로 이동
- **우측 스와이프**: Onboarding1으로 돌아가기

## 7. Validation 규칙

- 애니메이션 완료 전 버튼 비활성화
- 중복 클릭 방지 (300ms debounce)

## 8. API 목록

### POST /api/v1/analytics/event
온보딩 진행 이벤트 로깅

## 9. 스타일 속성 (Lanove 규칙 적용)

### FeaturePoints
```css
display: flex;
flex-direction: column;
gap: 16px;
margin-top: 32px;
padding: 0 40px;
```

### FeatureItem
```css
display: flex;
align-items: center;
gap: 12px;
```

### FeatureIcon
```css
width: 24px;
height: 24px;
color: #F7C8C0;
stroke-width: 2px;
border-radius: 2px;
```

### FeatureText
```css
font-family: 'Pretendard';
font-size: 14px;
font-weight: 500;
color: #8C6762;
```

### BackButton
```css
width: 40px;
height: 40px;
background-color: transparent;
border: none;
```

### BackIcon
```css
width: 24px;
height: 24px;
color: #8C6762;
stroke-width: 2px;
```

---

## 추가 고려사항

### 일러스트레이션 요소
- 스마트폰 화면에 생리대 이미지
- AI 분석 인디케이터 (점선, 하이라이트)
- 그래프 요소 (간단한 차트)
- Coral Pink 강조 포인트

### 애니메이션 타이밍
```javascript
const animations = {
  slideIn: { duration: 300, easing: 'ease-out' },
  illustration: { duration: 400, delay: 100 },
  feature1: { duration: 300, delay: 200 },
  feature2: { duration: 300, delay: 300 },
  feature3: { duration: 300, delay: 400 }
};
```
