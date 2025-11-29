# FemCare 월경 캘린더 화면

## 1. 화면 목적
월경 주기 시각화 및 기록 관리

## 2. 상단 UI
```
┌─────────────────────────────┐
│  ←   2025년 11월        +   │
└─────────────────────────────┘
```

## 3. 중단 UI
### 캘린더
```
┌─────────────────────────────┐
│  일 월 화 수 목 금 토         │
│                  1  2        │
│  3  4  5  6  7  8  9        │
│ 10 11 12 13 14 15 16        │
│ 17 18 19 20 21 22 23        │
│ 24 ●● ●● ●● ●● 29 30        │
│                             │
│ ● 생리일  ○ 예상일           │
│ ◆ 배란일  ✓ 기록완료         │
└─────────────────────────────┘
```

### 오늘 정보
```
┌─────────────────────────────┐
│  오늘 (11월 28일)            │
│                             │
│  주기 25일차                 │
│  다음 생리까지 3일           │
│  배란기 종료                 │
│                             │
│  [  증상 기록하기  ]         │
└─────────────────────────────┘
```

## 4. 하단: 탭 네비게이션

## 5. UI 컴포넌트
```jsx
<CalendarScreen>
  <NavBar>
    <BackButton />
    <MonthSelector value={currentMonth} onChange={setMonth} />
    <AddButton onPress={handleAddRecord} />
  </NavBar>

  <CalendarView
    month={currentMonth}
    periodDays={periodDays}
    ovulationDay={ovulationDay}
    recordedDays={recordedDays}
    onDayPress={handleDayPress}
  />

  <TodayInfoCard>
    <Title>오늘 ({today})</Title>
    <CycleDay>주기 {cycleDay}일차</CycleDay>
    <NextPeriod>다음 생리까지 {daysUntil}일</NextPeriod>
    <Phase>{currentPhase}</Phase>
    <RecordButton onPress={handleRecord} />
  </TodayInfoCard>

  <TabNavigation current="health" />
</CalendarScreen>
```

## 6. 기능 로직
```javascript
const handleDayPress = (day) => {
  navigation.navigate('CycleDetail', { date: day });
};

const handleAddRecord = () => {
  navigation.navigate('SymptomRecord', { date: today });
};

// 주기 계산
const calculateCycleData = (lastPeriod, cycleLength) => {
  const today = new Date();
  const lastDate = new Date(lastPeriod);
  const diff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

  return {
    cycleDay: (diff % cycleLength) + 1,
    daysUntilNext: cycleLength - (diff % cycleLength),
    ovulationDay: Math.floor(cycleLength / 2),
    phase: getCurrentPhase(diff % cycleLength, cycleLength)
  };
};
```

## 7. Validation
- 날짜 범위: 과거 1년 ~ 미래 3개월

## 8. API
### GET /api/v1/health/calendar
```json
{
  "month": "2025-11",
  "periodDays": ["2025-11-25", "2025-11-26"],
  "ovulationDay": "2025-11-12",
  "records": []
}
```

## 9. 스타일
```css
.calendar-day {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day.period {
  background: #F7C8C0;
  color: #FFFFFF;
}

.calendar-day.ovulation {
  border: 2px solid #F7C8C0;
}

.calendar-day.recorded::after {
  content: '✓';
  position: absolute;
  bottom: 2px;
  font-size: 10px;
  color: #F7C8C0;
}
```
