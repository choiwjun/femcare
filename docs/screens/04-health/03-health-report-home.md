# FemCare 건강 리포트 홈 화면

## 1. 화면 목적
종합 건강 데이터 요약 및 리포트 접근

## 2-3. UI 구성
### 기간 선택
```
┌─────────────────────────────┐
│  최근 3개월 ▼                │
└─────────────────────────────┘
```

### 요약 카드
```
┌─────────────────────────────┐
│  평균 주기    평균 기간      │
│    28일        5일           │
│                             │
│  규칙성       총 기록        │
│   양호        12회           │
└─────────────────────────────┘
```

### 리포트 메뉴
```
┌─────────────────────────────┐
│  ┌────────────────────────┐ │
│  │ 📊 출혈량 그래프        │ │
│  └────────────────────────┘ │
│                             │
│  ┌────────────────────────┐ │
│  │ 📈 PMS 그래프           │ │
│  └────────────────────────┘ │
│                             │
│  ┌────────────────────────┐ │
│  │ 😊 감정 변화 그래프     │ │
│  └────────────────────────┘ │
│                             │
│  ┌────────────────────────┐ │
│  │ 📄 PDF 다운로드         │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

## 4. 하단: 탭 네비게이션

## 5. UI 컴포넌트
```jsx
<HealthReportHomeScreen>
  <NavBar>
    <Title>건강 리포트</Title>
  </NavBar>

  <PeriodSelector
    value={selectedPeriod}
    onChange={setPeriod}
    options={['최근 1개월', '최근 3개월', '최근 6개월', '최근 1년']}
  />

  <SummaryCard>
    <SummaryItem label="평균 주기" value={`${avgCycle}일`} />
    <SummaryItem label="평균 기간" value={`${avgDuration}일`} />
    <SummaryItem label="규칙성" value={regularity} />
    <SummaryItem label="총 기록" value={`${recordCount}회`} />
  </SummaryCard>

  <ReportMenu>
    <MenuItem
      icon="📊"
      title="출혈량 그래프"
      onPress={() => navigate('BloodFlowGraph')}
    />
    <MenuItem
      icon="📈"
      title="PMS 그래프"
      onPress={() => navigate('PMSGraph')}
    />
    <MenuItem
      icon="😊"
      title="감정 변화 그래프"
      onPress={() => navigate('EmotionGraph')}
    />
    <MenuItem
      icon="📄"
      title="PDF 다운로드"
      onPress={handlePDFDownload}
    />
  </ReportMenu>

  <TabNavigation current="health" />
</HealthReportHomeScreen>
```

## 6. 기능 로직
```javascript
const loadReportData = async (period) => {
  const data = await api.get('/api/v1/health/report', {
    params: { period: period }
  });

  setReportData(data);
};
```

## 7. Validation
- 최소 3회 이상 기록 필요

## 8. API
### GET /api/v1/health/report

## 9. 스타일
```css
.summary-card {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  background: #FFFFFF;
  border-radius: 22px;
  padding: 24px;
  margin: 16px 20px;
}

.menu-item {
  background: #FFFFFF;
  border: 1px solid #F5EEE8;
  border-radius: 16px;
  padding: 20px;
  margin: 8px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
```
