# FemCare 출혈량 그래프 화면

## 1. 화면 목적
출혈량 변화 추이 시각화

## 2. 상단 UI
```
┌─────────────────────────────┐
│  ←   출혈량 그래프       공유 │
└─────────────────────────────┘
```

## 3. 중단 UI
### 그래프
```
┌─────────────────────────────┐
│  출혈량 변화 (최근 6개월)    │
│                             │
│  5 │        ●               │
│  4 │    ●       ●           │
│  3 │  ●           ●    ●   │
│  2 │                        │
│  1 │                        │
│    ─┴─┴─┴─┴─┴─             │
│    6월 7월 8월 9월 10월 11월│
└─────────────────────────────┘
```

### 통계
```
┌─────────────────────────────┐
│  평균: 3.2                   │
│  최고: 5 (8월)              │
│  최저: 2 (6월)              │
│  표준편차: 0.8              │
└─────────────────────────────┘
```

### 인사이트
```
┌─────────────────────────────┐
│  💡 AI 인사이트              │
│                             │
│  출혈량이 규칙적으로 유지되고│
│  있어요. 건강한 주기입니다.  │
└─────────────────────────────┘
```

## 4. 하단 UI
- 탭 네비게이션

## 5. UI 컴포넌트
```jsx
<BloodFlowGraphScreen>
  <NavBar>
    <BackButton />
    <Title>출혈량 그래프</Title>
    <ShareButton onPress={handleShare} />
  </NavBar>

  <LineChart
    data={bloodFlowData}
    width={screenWidth - 40}
    height={220}
    chartConfig={chartConfig}
    bezier
  />

  <Statistics>
    <StatItem label="평균" value={stats.average} />
    <StatItem label="최고" value={`${stats.max} (${stats.maxMonth})`} />
    <StatItem label="최저" value={`${stats.min} (${stats.minMonth})`} />
    <StatItem label="표준편차" value={stats.stdDev} />
  </Statistics>

  <InsightCard>
    <Icon>💡</Icon>
    <Title>AI 인사이트</Title>
    <Text>{aiInsight}</Text>
  </InsightCard>
</BloodFlowGraphScreen>
```

## 6. 기능 로직
```javascript
const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(247, 200, 192, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  decimalPlaces: 1,
};

const handleShare = async () => {
  const uri = await captureRef(chartRef, {
    format: 'png',
    quality: 0.9
  });

  await Share.share({
    url: uri,
    message: '내 출혈량 그래프'
  });
};
```

## 7. Validation
- 최소 3개월 데이터 필요

## 8. API
### GET /api/v1/health/blood-flow/graph

## 9. 스타일
```css
.chart-container {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  margin: 16px 20px;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 20px;
}
```
