# FemCare 분석 상세 그래프 화면

## 1. 화면 목적
AI 분석 결과의 상세 데이터 및 추이 그래프 제공

## 2. 상단 UI
```
┌─────────────────────────────┐
│  ←      상세 분석            │
└─────────────────────────────┘
```

## 3. 중단 UI
### 탭 메뉴
```
┌─────────────────────────────┐
│  출혈량  │  색상  │  추이    │
│    ●        ○       ○        │
└─────────────────────────────┘
```

### 출혈량 탭
```
┌─────────────────────────────┐
│  현재 출혈량                 │
│                             │
│      ●●●○○                  │
│      3 / 5                   │
│                             │
│  [   그래프   ]              │
│  최근 3개월 출혈량 추이       │
│                             │
│  평균: 3.2                   │
│  최고: 4                     │
│  최저: 2                     │
└─────────────────────────────┘
```

### 색상 탭
```
┌─────────────────────────────┐
│  색상 분석                   │
│                             │
│      ⬤ 선홍색               │
│      정상 범위               │
│                             │
│  색상별 의미                 │
│  • 선홍색: 정상적인 월경혈   │
│  • 암적색: 오래된 혈액       │
│  • 밝은색: 초기 또는 후기    │
└─────────────────────────────┘
```

### 추이 탭
```
┌─────────────────────────────┐
│  출혈량 변화 추이            │
│                             │
│  [   꺾은선 그래프   ]       │
│                             │
│  • 주기별 비교               │
│  • 평균 대비                 │
│  • 패턴 분석                 │
└─────────────────────────────┘
```

## 4. 하단 UI
```
┌─────────────────────────────┐
│  [  PDF로 저장  ]            │
└─────────────────────────────┘
```

## 5. UI 컴포넌트
```jsx
<AnalysisDetailScreen>
  <NavBar>
    <BackButton />
    <Title>상세 분석</Title>
  </NavBar>

  <TabBar>
    <Tab active={activeTab === 0} onPress={() => setActiveTab(0)}>
      출혈량
    </Tab>
    <Tab active={activeTab === 1} onPress={() => setActiveTab(1)}>
      색상
    </Tab>
    <Tab active={activeTab === 2} onPress={() => setActiveTab(2)}>
      추이
    </Tab>
  </TabBar>

  <TabContent>
    {activeTab === 0 && <BloodFlowTab data={analysisData} />}
    {activeTab === 1 && <ColorTab data={analysisData} />}
    {activeTab === 2 && <TrendTab data={historyData} />}
  </TabContent>

  <BottomArea>
    <SecondaryButton
      text="PDF로 저장"
      onPress={handleExportPDF}
    />
  </BottomArea>
</AnalysisDetailScreen>
```

## 6. 기능 로직
```javascript
const loadDetailData = async () => {
  const [current, history] = await Promise.all([
    api.get(`/api/v1/analysis/${analysisId}/detail`),
    api.get('/api/v1/analysis/history', {
      params: { limit: 12 }
    })
  ]);

  setAnalysisData(current.data);
  setHistoryData(history.data);
};

const handleExportPDF = async () => {
  try {
    setLoading(true);
    const pdfUrl = await api.post('/api/v1/analysis/export-pdf', {
      analysisId: analysisId
    });

    await FileSystem.downloadAsync(
      pdfUrl.data.url,
      FileSystem.documentDirectory + 'analysis.pdf'
    );

    showToast('PDF가 저장되었습니다');
  } catch (error) {
    showError('PDF 저장에 실패했습니다');
  } finally {
    setLoading(false);
  }
};
```

## 7. Validation
- 최소 1개 이상의 분석 결과 필요

## 8. API
### GET /api/v1/analysis/{id}/detail
### GET /api/v1/analysis/history
### POST /api/v1/analysis/export-pdf

## 9. 스타일
```css
.tab-bar {
  display: flex;
  border-bottom: 1px solid #E5E5E5;
  padding: 0 20px;
}

.tab {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #9B9B9B;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab.active {
  color: #F7C8C0;
  border-bottom-color: #F7C8C0;
}

.chart {
  width: 100%;
  height: 200px;
  margin: 24px 0;
}
```
