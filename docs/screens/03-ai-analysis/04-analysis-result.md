# FemCare 분석 결과 요약 화면

## 1. 화면 목적
AI 분석 결과 요약 표시 및 건강 상태 알림

## 2. 상단 UI
```
┌─────────────────────────────┐
│  ←      분석 결과         ⋯  │
└─────────────────────────────┘
```

## 3. 중단 UI
### 전체 상태 카드
```
┌─────────────────────────────┐
│         ✓ 양호              │
│                             │
│    전반적으로 정상입니다     │
│                             │
│    2025.11.28 오후 3:24     │
└─────────────────────────────┘
```

### 출혈량 분석
```
┌─────────────────────────────┐
│  출혈량                      │
│                             │
│      ●●●○○                  │
│       보통                   │
│                             │
│  이번 주기 평균과 비슷해요   │
└─────────────────────────────┘
```

### 색상 분석
```
┌─────────────────────────────┐
│  색상                        │
│                             │
│      ⬤ 정상 범위            │
│                             │
│  건강한 색상입니다           │
└─────────────────────────────┘
```

### AI 코멘트
```
┌─────────────────────────────┐
│  💡 AI 건강 코멘트           │
│                             │
│  정상적인 월경 상태입니다.   │
│  규칙적인 주기를 유지하고    │
│  있어요.                     │
└─────────────────────────────┘
```

### 주의사항 (조건부)
```
┌─────────────────────────────┐
│  ⚠️ 확인이 필요해요          │
│                             │
│  출혈량이 평소보다 많습니다. │
│  전문가 상담을 권장합니다.   │
│                             │
│  [  상담 예약하기  ]         │
└─────────────────────────────┘
```

## 4. 하단 UI
```
┌─────────────────────────────┐
│  [ 상세 분석 보기 ]          │
│  [   기록 저장   ]           │
└─────────────────────────────┘
```

## 5. UI 컴포넌트
```jsx
<AnalysisResultScreen>
  <NavBar>
    <BackButton />
    <Title>분석 결과</Title>
    <MenuButton />
  </NavBar>

  <ScrollView>
    <StatusCard status={analysisData.overallStatus}>
      <StatusIcon status={status} />
      <StatusText>{statusText}</StatusText>
      <Timestamp>{timestamp}</Timestamp>
    </StatusCard>

    <Section>
      <SectionTitle>출혈량</SectionTitle>
      <BloodFlowIndicator level={bloodFlow} />
      <Comment>{bloodFlowComment}</Comment>
    </Section>

    <Section>
      <SectionTitle>색상</SectionTitle>
      <ColorIndicator color={color} />
      <Comment>{colorComment}</Comment>
    </Section>

    <AICommentBox>
      <Icon>💡</Icon>
      <Title>AI 건강 코멘트</Title>
      <Text>{aiComment}</Text>
    </AICommentBox>

    {hasWarning && (
      <WarningBox>
        <Icon>⚠️</Icon>
        <Title>확인이 필요해요</Title>
        <Text>{warningMessage}</Text>
        <CTAButton text="상담 예약하기" />
      </WarningBox>
    )}
  </ScrollView>

  <BottomActions>
    <SecondaryButton
      text="상세 분석 보기"
      onPress={handleDetailView}
    />
    <PrimaryButton
      text="기록 저장"
      onPress={handleSave}
    />
  </BottomActions>
</AnalysisResultScreen>
```

## 6. 기능 로직
```javascript
const handleSave = async () => {
  try {
    await api.post('/api/v1/health/record', {
      analysisId: analysisData.id,
      date: new Date().toISOString(),
      bloodFlow: analysisData.bloodFlow,
      color: analysisData.color,
      notes: userNotes
    });

    showToast('기록이 저장되었습니다');
    navigation.navigate('Home');
  } catch (error) {
    showError('저장에 실패했습니다');
  }
};

const handleDetailView = () => {
  navigation.navigate('AnalysisDetail', {
    analysisId: analysisData.id
  });
};
```

## 7. Validation
- 분석 데이터 필수
- 상태값: normal, caution, warning

## 8. API
### GET /api/v1/analysis/{id}
분석 결과 조회

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "timestamp": "2025-11-28T15:24:00Z",
    "overallStatus": "normal",
    "bloodFlow": {
      "level": 3,
      "text": "보통",
      "comment": "이번 주기 평균과 비슷해요"
    },
    "color": {
      "status": "normal",
      "text": "정상 범위",
      "comment": "건강한 색상입니다"
    },
    "aiComment": "정상적인 월경 상태입니다...",
    "warning": null
  }
}
```

### POST /api/v1/health/record
분석 결과 기록

## 9. 스타일
```css
.status-card {
  background: linear-gradient(135deg, #F7C8C0, #F5A97F);
  border-radius: 22px;
  padding: 32px;
  text-align: center;
  color: #FFFFFF;
}

.status-card.caution {
  background: linear-gradient(135deg, #F5A97F, #F7C8C0);
}

.status-card.warning {
  background: linear-gradient(135deg, #E89B9B, #F5A97F);
}

.blood-flow-indicator {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #F7C8C0; /* filled */
  background: #E5E5E5; /* empty */
}
```
