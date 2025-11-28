# FemCare 홈 메인 화면

## 1. 화면 목적
- 앱의 중심 허브 역할
- 주요 기능 빠른 접근
- 개인화된 건강 정보 대시보드
- 다음 예상 생리일 표시

## 2. 상단 UI 구성

### 헤더
```
┌─────────────────────────────┐
│  안녕하세요, 지연님 👋    🔔 │
└─────────────────────────────┘
```
- **인사말**: "안녕하세요, {이름}님"
- **우측 아이콘**: 알림 벨 (Badge 표시)

## 3. 중단 UI 구성

### 월경 주기 카드 (Hero Card)
```
┌─────────────────────────────┐
│                             │
│   다음 생리 예정일           │
│                             │
│      12월 15일 (D-3)        │
│                             │
│   ●━━━━━━━━━━━━━━○━━○       │
│   생리기 │ 배란기 │ 생리전기 │
│                             │
│   [    기록하기    ]         │
│                             │
└─────────────────────────────┘
```

#### 요소
- **제목**: "다음 생리 예정일"
- **날짜**: 큰 폰트, 강조
- **D-day**: 작은 폰트
- **주기 바**: 진행 표시 (Progress Bar)
- **버튼**: "기록하기" (증상/감정 기록)

### 빠른 기능 그리드
```
┌─────────────────────────────┐
│                             │
│  ┌────┐  ┌────┐  ┌────┐    │
│  │ AI │  │캘린│  │구독│    │
│  │분석│  │더  │  │관리│    │
│  └────┘  └────┘  └────┘    │
│                             │
│  ┌────┐  ┌────┐  ┌────┐    │
│  │건강│  │상담│  │커뮤│    │
│  │리포│  │예약│  │니티│    │
│  └────┘  └────┘  └────┘    │
│                             │
└─────────────────────────────┘
```

각 카드:
- **크기**: 106x106px
- **간격**: 8px
- **아이콘**: 32x32px, Coral Pink
- **텍스트**: 14px

### 오늘의 팁 배너
```
┌─────────────────────────────┐
│                             │
│  💡 오늘의 건강 팁           │
│                             │
│  배란기에는 충분한 수분 섭취가│
│  중요해요                    │
│                             │
│             자세히 보기 →    │
│                             │
└─────────────────────────────┘
```

### 기부 진행 상황
```
┌─────────────────────────────┐
│                             │
│  💝 이번 달 기부 적립금      │
│                             │
│  1,250원                    │
│  ━━━━━━━━━━━━━ 50%          │
│  목표: 2,500원               │
│                             │
└─────────────────────────────┘
```

### 최근 분석 결과 (조건부)
```
┌─────────────────────────────┐
│                             │
│  📊 최근 AI 분석             │
│                             │
│  11월 26일 분석 결과         │
│  출혈량: 보통 | 상태: 양호   │
│                             │
│             자세히 보기 →    │
│                             │
└─────────────────────────────┘
```

## 4. 하단 UI 구성

### 탭 네비게이션
```
┌─────────────────────────────┐
│                             │
│  홈   건강   구독   상담  MY │
│  ●    ○     ○     ○    ○   │
│                             │
└─────────────────────────────┘
```

- **활성**: Coral Pink
- **비활성**: Gray
- **아이콘**: 24x24px

## 5. UI 컴포넌트 구조

```jsx
<HomeScreen>
  <Container>
    {/* 헤더 */}
    <Header>
      <Greeting>안녕하세요, {userName}님 👋</Greeting>
      <NotificationButton
        onPress={handleNotification}
        badge={unreadCount}
      />
    </Header>

    <ScrollView>
      {/* 월경 주기 카드 */}
      <PeriodCard>
        <CardTitle>다음 생리 예정일</CardTitle>
        <NextPeriodDate>
          <DateText>{nextPeriodDate}</DateText>
          <DDayText>(D-{dDay})</DDayText>
        </NextPeriodDate>

        <CycleProgress
          current={currentDay}
          total={cycleLength}
          phases={['생리기', '배란기', '생리전기']}
        />

        <RecordButton
          text="기록하기"
          onPress={handleRecord}
        />
      </PeriodCard>

      {/* 빠른 기능 */}
      <QuickActions>
        <ActionCard
          icon="ai"
          label="AI 분석"
          onPress={() => navigate('AIAnalysis')}
        />
        <ActionCard
          icon="calendar"
          label="캘린더"
          onPress={() => navigate('Calendar')}
        />
        <ActionCard
          icon="subscription"
          label="구독 관리"
          onPress={() => navigate('Subscription')}
        />
        <ActionCard
          icon="health"
          label="건강 리포트"
          onPress={() => navigate('HealthReport')}
        />
        <ActionCard
          icon="consultation"
          label="상담 예약"
          onPress={() => navigate('Consultation')}
        />
        <ActionCard
          icon="community"
          label="커뮤니티"
          onPress={() => navigate('Community')}
        />
      </QuickActions>

      {/* 오늘의 팁 */}
      <TipBanner
        tip={dailyTip}
        onPress={handleTipDetail}
      />

      {/* 기부 현황 */}
      <DonationProgress
        current={donationAmount}
        goal={donationGoal}
      />

      {/* 최근 분석 */}
      {hasRecentAnalysis && (
        <RecentAnalysis
          data={analysisData}
          onPress={handleAnalysisDetail}
        />
      )}
    </ScrollView>

    {/* 탭 네비게이션 */}
    <TabNavigation current="home" />
  </Container>
</HomeScreen>
```

## 6. 기능 로직 (FRD 기반)

### 데이터 로드
```javascript
useEffect(() => {
  loadHomeData();
}, []);

const loadHomeData = async () => {
  try {
    const [userData, periodData, donationData, analysisData] = await Promise.all([
      api.get('/api/v1/user/profile'),
      api.get('/api/v1/health/period/next'),
      api.get('/api/v1/donation/progress'),
      api.get('/api/v1/analysis/recent')
    ]);

    setUserName(userData.name);
    setNextPeriodDate(periodData.nextDate);
    setDDay(periodData.dDay);
    setDonationAmount(donationData.amount);
    setAnalysisData(analysisData.data);
  } catch (error) {
    showError('데이터를 불러오는데 실패했습니다');
  }
};
```

### D-day 계산
```javascript
const calculateDDay = (targetDate) => {
  const today = new Date();
  const target = new Date(targetDate);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};
```

### 주기 단계 계산
```javascript
const getCurrentPhase = (currentDay, cycleLength) => {
  if (currentDay <= 5) return '생리기';
  if (currentDay >= 12 && currentDay <= 16) return '배란기';
  if (currentDay >= cycleLength - 7) return '생리전기';
  return '난포기';
};
```

### 기록하기
```javascript
const handleRecord = () => {
  navigation.navigate('SymptomRecord', {
    date: new Date().toISOString()
  });
};
```

## 7. Validation 규칙

### 데이터 표시
- 다음 생리일 없음: "건강정보를 입력해주세요" 표시
- 기부 없음: 카드 숨김
- 분석 없음: 카드 숨김

## 8. API 목록

### GET /api/v1/user/profile
사용자 프로필

### GET /api/v1/health/period/next
다음 생리 예정일

**Response**:
```json
{
  "success": true,
  "data": {
    "nextDate": "2025-12-15",
    "dDay": 3,
    "currentDay": 25,
    "cycleLength": 28,
    "phase": "생리전기"
  }
}
```

### GET /api/v1/donation/progress
기부 진행 상황

### GET /api/v1/analysis/recent
최근 분석 결과

## 9. 스타일 속성 (Lanove 규칙 적용)

### PeriodCard
```css
background: linear-gradient(135deg, #F7C8C0 0%, #F5EEE8 100%);
border-radius: 22px;
padding: 24px;
margin: 16px 20px;
box-shadow: 0 4px 12px rgba(247, 200, 192, 0.2);
```

### QuickActions
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 8px;
padding: 0 20px;
margin-top: 24px;
```

### ActionCard
```css
background-color: #FFFFFF;
border: 1px solid #F5EEE8;
border-radius: 16px;
padding: 20px 12px;
display: flex;
flex-direction: column;
align-items: center;
gap: 8px;
```

### CycleProgress
```css
width: 100%;
height: 8px;
background-color: #E5E5E5;
border-radius: 4px;
position: relative;
margin: 16px 0;

/* Fill */
.fill {
  height: 100%;
  background: linear-gradient(90deg, #F7C8C0 0%, #F5A97F 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}
```
