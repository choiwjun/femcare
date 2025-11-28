# FemCare 온보딩3 화면

## 1. 화면 목적
- 정기구독 및 자동 기부 기능 소개
- 사회적 가치 전달
- 온보딩 진행 3/3 단계 (마지막)

## 2. 상단 UI 구성

### 네비게이션 바
```
┌─────────────────────────────┐
│  ←                 건너뛰기  │
└─────────────────────────────┘
```

## 3. 중단 UI 구성

### 인디케이터
```
┌─────────────────────────────┐
│       ○ ○ ●                 │ (3/3)
└─────────────────────────────┘
```

### 일러스트레이션
```
┌─────────────────────────────┐
│                             │
│    [기부 & 구독 일러스트]    │
│    - 박스 + 하트             │
│    - 연결된 사람들           │
│    - Coral Pink 하트         │
│                             │
└─────────────────────────────┘
```
- **크기**: 280x280px
- **테마**: 나눔, 연결, 배려

### 제목 및 설명
```
┌─────────────────────────────┐
│                             │
│   함께 나누는 건강한 내일    │
│                             │
│  정기구독으로 편리하게 받고   │
│  자동 기부로 함께 성장해요   │
│                             │
└─────────────────────────────┘
```

#### 제목
- **텍스트**: "함께 나누는 건강한 내일"
- **폰트**: Pretendard Bold 24px
- **색상**: Rose Brown (#8C6762)

#### 설명
- **텍스트**: "정기구독으로 편리하게 받고\n자동 기부로 함께 성장해요"
- **폰트**: Pretendard Regular 16px
- **색상**: Gray (#5A5A5A)

### 기능 포인트
```
┌─────────────────────────────┐
│                             │
│  📦  맞춤형 정기배송         │
│  💝  구독금액 1% 자동기부    │
│  🌱  여성 건강 캠페인 지원   │
│                             │
└─────────────────────────────┘
```

## 4. 하단 UI 구성

### 버튼
```
┌─────────────────────────────┐
│                             │
│      [   시작하기   ]        │
│                             │
└─────────────────────────────┘
```
- **텍스트**: "시작하기" (마지막 단계이므로 CTA 변경)

## 5. UI 컴포넌트 구조

```jsx
<OnboardingScreen3>
  <Container background="#F5EEE8">
    <NavBar>
      <BackButton onPress={handleBack} />
      <SkipButton text="건너뛰기" onPress={handleSkip} />
    </NavBar>

    <PageIndicator total={3} current={2} />

    <ContentArea>
      <Illustration
        source="onboarding_donation.svg"
        width={280}
        height={280}
      />

      <Title text="함께 나누는 건강한 내일" />

      <Description
        text="정기구독으로 편리하게 받고\n자동 기부로 함께 성장해요"
      />

      <FeaturePoints>
        <FeatureItem icon="box" text="맞춤형 정기배송" />
        <FeatureItem icon="heart" text="구독금액 1% 자동기부" />
        <FeatureItem icon="plant" text="여성 건강 캠페인 지원" />
      </FeaturePoints>
    </ContentArea>

    <BottomArea>
      <PrimaryButton
        text="시작하기"
        onPress={handleStart}
      />
    </BottomArea>
  </Container>
</OnboardingScreen3>
```

## 6. 기능 로직 (FRD 기반)

### 시작하기 버튼
```javascript
const handleStart = async () => {
  // 온보딩 완료 플래그 저장
  await AsyncStorage.setItem('onboarding_completed', 'true');
  await AsyncStorage.setItem('onboarding_completed_at', new Date().toISOString());

  // 이벤트 로깅
  logEvent('onboarding_completed');

  // 가입 선택 화면으로 이동
  navigation.navigate('SignupSelection');
};
```

### 화면 전환 애니메이션
- Slide in from right (300ms)
- 일러스트 Zoom in (400ms)

## 7. Validation 규칙

- 온보딩 완료 상태 저장 확인
- 다음 화면 이동 전 저장 완료 대기

## 8. API 목록

### POST /api/v1/analytics/event
```json
{
  "eventName": "onboarding_completed",
  "eventData": {
    "completedAt": "2025-11-28T10:35:00Z",
    "totalDuration": 45000
  }
}
```

## 9. 스타일 속성 (Lanove 규칙 적용)

### 동일 스타일 유지
- 이전 화면들과 일관된 스타일 적용
- 시작하기 버튼은 Primary Button 스타일

---

## 추가 고려사항

### 일러스트레이션
- **테마**: 나눔, 연결, 성장
- **요소**: 배송 박스, 하트, 식물, 연결된 사람들
- **컬러**: Coral Pink 하트, Warm Beige 배경

### 완료 후 라우팅
```javascript
const routes = {
  onboardingCompleted: true,
  hasAccount: false,
  nextScreen: 'SignupSelection'
};
```
