# FemCare 상담 권유 화면

## 1. 화면 목적
AI 분석 결과 이상 징후 발견 시 전문가 상담 권유

## 2-3. UI 구성
```
┌─────────────────────────────┐
│                             │
│      [주의 아이콘]           │
│                             │
│   전문가 확인이 필요해요     │
│                             │
│  AI 분석 결과, 다음 사항이   │
│  확인되었습니다:             │
│                             │
│  • 출혈량이 평소보다 많음    │
│  • 색상 이상 징후            │
│                             │
│  전문가 상담을 권장합니다    │
│                             │
└─────────────────────────────┘
```

### 상담 옵션
```
┌─────────────────────────────┐
│  ┌────────────────────────┐ │
│  │ 💬 텍스트 상담          │ │
│  │ 채팅으로 편하게         │ │
│  └────────────────────────┘ │
│                             │
│  ┌────────────────────────┐ │
│  │ 📹 영상 상담            │ │
│  │ 1:1 화상 상담           │ │
│  └────────────────────────┘ │
│                             │
│  ┌────────────────────────┐ │
│  │ 🏥 병원 예약            │ │
│  │ 근처 병원 찾기          │ │
│  └────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

## 4. 하단 UI
```
┌─────────────────────────────┐
│       나중에 하기            │
└─────────────────────────────┘
```

## 5. UI 컴포넌트
```jsx
<ConsultationSuggestScreen>
  <Container>
    <WarningIcon>⚠️</WarningIcon>

    <Title>전문가 확인이 필요해요</Title>

    <Description>
      AI 분석 결과, 다음 사항이 확인되었습니다:
    </Description>

    <IssueList>
      {issues.map(issue => (
        <IssueItem key={issue.id}>
          <Bullet>•</Bullet>
          <Text>{issue.text}</Text>
        </IssueItem>
      ))}
    </IssueList>

    <Recommendation>
      전문가 상담을 권장합니다
    </Recommendation>

    <ConsultationOptions>
      <OptionCard onPress={() => navigate('TextConsultation')}>
        <Icon>💬</Icon>
        <Title>텍스트 상담</Title>
        <Subtitle>채팅으로 편하게</Subtitle>
      </OptionCard>

      <OptionCard onPress={() => navigate('VideoConsultation')}>
        <Icon>📹</Icon>
        <Title>영상 상담</Title>
        <Subtitle>1:1 화상 상담</Subtitle>
      </OptionCard>

      <OptionCard onPress={() => navigate('HospitalList')}>
        <Icon>🏥</Icon>
        <Title>병원 예약</Title>
        <Subtitle>근처 병원 찾기</Subtitle>
      </OptionCard>
    </ConsultationOptions>

    <LaterButton onPress={handleLater}>
      나중에 하기
    </LaterButton>
  </Container>
</ConsultationSuggestScreen>
```

## 6. 기능 로직
```javascript
const handleLater = async () => {
  // 나중에 알림 설정
  await api.post('/api/v1/user/reminders', {
    type: 'CONSULTATION_SUGGESTED',
    analysisId: analysisId,
    remindAt: addDays(new Date(), 3) // 3일 후
  });

  showToast('3일 후 다시 알려드릴게요');
  navigation.goBack();
};
```

## 7. Validation
- 심각도에 따라 "나중에 하기" 버튼 숨김 가능

## 8. API
### POST /api/v1/user/reminders
상담 알림 예약

## 9. 스타일
```css
.warning-icon {
  font-size: 64px;
  text-align: center;
  margin: 32px 0;
}

.option-card {
  background: #FFFFFF;
  border: 1px solid #F5EEE8;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.option-card:active {
  transform: scale(0.98);
  border-color: #F7C8C0;
}
```
