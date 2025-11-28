# FemCare 촬영 가이드 화면

## 1. 화면 목적
정확한 AI 분석을 위한 촬영 가이드 제공

## 2. 상단 UI
```
┌─────────────────────────────┐
│  ←      촬영 가이드       ✕  │
└─────────────────────────────┘
```

## 3. 중단 UI
### 가이드 일러스트
```
┌─────────────────────────────┐
│   [생리대 촬영 예시 이미지]   │
│   - 평평한 곳에 배치         │
│   - 자연광 권장              │
│   - 전체가 보이도록          │
└─────────────────────────────┘
```

### 촬영 팁 (3개)
```
┌─────────────────────────────┐
│ ✓ 밝은 곳에서 촬영해주세요   │
│ ✓ 생리대 전체가 보이도록     │
│ ✓ 평평한 곳에 놓고 촬영      │
└─────────────────────────────┘
```

### 주의사항
```
┌─────────────────────────────┐
│ ⚠️ 촬영 시 주의사항          │
│ • 개인정보는 자동 삭제됩니다 │
│ • 분석 후 즉시 삭제 가능     │
│ • 암호화되어 안전하게 처리   │
└─────────────────────────────┘
```

## 4. 하단 UI
```
┌─────────────────────────────┐
│   [    촬영 시작하기    ]    │
│   [ ] 다음부터 보지 않기     │
└─────────────────────────────┘
```

## 5. UI 컴포넌트 구조
```jsx
<CameraGuideScreen>
  <NavBar>
    <BackButton />
    <Title>촬영 가이드</Title>
    <CloseButton />
  </NavBar>

  <ScrollView>
    <GuideIllustration source="camera_guide.svg" />

    <TipSection>
      {tips.map(tip => (
        <TipItem icon="check" text={tip} />
      ))}
    </TipSection>

    <WarningBox>
      <Icon>⚠️</Icon>
      <Title>촬영 시 주의사항</Title>
      <List>
        {warnings.map(warning => (
          <ListItem text={warning} />
        ))}
      </List>
    </WarningBox>
  </ScrollView>

  <BottomArea>
    <PrimaryButton
      text="촬영 시작하기"
      onPress={handleStartCamera}
    />
    <Checkbox
      label="다음부터 보지 않기"
      value={skipGuide}
      onChange={setSkipGuide}
    />
  </BottomArea>
</CameraGuideScreen>
```

## 6. 기능 로직
```javascript
const handleStartCamera = async () => {
  // 가이드 스킵 설정 저장
  if (skipGuide) {
    await AsyncStorage.setItem('skip_camera_guide', 'true');
  }

  // 카메라 권한 확인
  const permission = await requestCameraPermission();
  if (!permission) {
    showError('카메라 권한이 필요합니다');
    return;
  }

  // 촬영 화면으로 이동
  navigation.navigate('Camera');
};
```

## 7. Validation
- 카메라 권한 필수
- 권한 거부 시 설정 앱 안내

## 8. API
없음 (로컬 설정만)

## 9. 스타일
```css
.guide-illustration {
  width: 280px;
  height: 280px;
  margin: 32px auto;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
  color: #5A5A5A;
}

.warning-box {
  background: rgba(232, 155, 155, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
}
```
