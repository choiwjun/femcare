# FemCare 월경 캘린더 화면 - 컴포넌트 설계서

## 1. 화면 레이아웃

```
┌─────────────────────────────┐
│   NavBar + MonthSelector    │ ← 상단
├─────────────────────────────┤
│   CalendarGrid              │
│   (주 단위 렌더링)           │ ← 중단
│   ─────────────────         │
│   Legend                    │
│   TodayInfoCard             │
├─────────────────────────────┤
│   TabNavigation             │ ← 하단
└─────────────────────────────┘
```

## 2. UI 컴포넌트 리스트

### 🔹 Atoms

#### A1. CalendarDay
```typescript
interface CalendarDayProps {
  date: Date;
  isPeriod: boolean;
  isOvulation: boolean;
  isPredicted: boolean;
  hasRecord: boolean;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
  onPress: (date: Date) => void;
}
```

**Component Structure**:
```jsx
<CalendarDay>
  <Pressable onPress={() => onPress(date)}>
    <DayContainer
      isPeriod={isPeriod}
      isOvulation={isOvulation}
      isToday={isToday}
      isSelected={isSelected}
    >
      <DayNumber
        isOtherMonth={isOtherMonth}
        isToday={isToday}
      >
        {date.getDate()}
      </DayNumber>

      {hasRecord && (
        <RecordIndicator>
          <FMIcon name="check" size={10} color="#F7C8C0" />
        </RecordIndicator>
      )}

      {isPredicted && (
        <PredictedIndicator />
      )}
    </DayContainer>
  </Pressable>
</CalendarDay>
```

**Styles**:
```typescript
const styles = StyleSheet.create({
  dayContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  dayContainerPeriod: {
    backgroundColor: '#F7C8C0',
  },

  dayContainerOvulation: {
    borderWidth: 2,
    borderColor: '#F7C8C0',
  },

  dayContainerToday: {
    borderWidth: 2,
    borderColor: '#8C6762',
  },

  dayContainerSelected: {
    backgroundColor: 'rgba(247, 200, 192, 0.2)',
  },

  dayNumber: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    color: '#5A5A5A',
  },

  dayNumberOtherMonth: {
    color: '#D0D0D0',
  },

  dayNumberToday: {
    color: '#8C6762',
    fontWeight: '700',
  },

  dayNumberPeriod: {
    color: '#FFFFFF',
  },

  recordIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F7C8C0',
  },

  predictedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(247, 200, 192, 0.5)',
  },
});
```

#### A2. LegendItem
```typescript
interface LegendItemProps {
  icon: ReactNode;
  label: string;
}
```

### 🔸 Molecules

#### M1. MonthSelector
```typescript
interface MonthSelectorProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthPress: () => void;
}
```

**Component Structure**:
```jsx
<MonthSelector>
  <SelectorContainer>
    <IconButton
      icon="chevron-left"
      onPress={onPrevMonth}
      size={24}
      color="#8C6762"
    />

    <MonthButton onPress={onMonthPress}>
      <FMText variant="h4">
        {formatMonth(currentMonth)}
      </FMText>
    </MonthButton>

    <IconButton
      icon="chevron-right"
      onPress={onNextMonth}
      size={24}
      color="#8C6762"
    />
  </SelectorContainer>
</MonthSelector>
```

#### M2. WeekHeader
```typescript
interface WeekHeaderProps {
  weekdays: string[];
}
```

**Component Structure**:
```jsx
<WeekHeader>
  <WeekRow>
    {weekdays.map(day => (
      <WeekDayText key={day}>{day}</WeekDayText>
    ))}
  </WeekRow>
</WeekHeader>
```

#### M3. CalendarLegend
```typescript
interface CalendarLegendProps {
  items: Array<{
    id: string;
    icon: ReactNode;
    label: string;
  }>;
}
```

**Component Structure**:
```jsx
<CalendarLegend>
  <LegendRow>
    {items.map(item => (
      <LegendItem
        key={item.id}
        icon={item.icon}
        label={item.label}
      />
    ))}
  </LegendRow>
</CalendarLegend>
```

### 🔶 Organisms

#### O1. CalendarGrid
```typescript
interface CalendarGridProps {
  month: Date;
  periodDays: Date[];
  ovulationDay: Date | null;
  predictedPeriodDays: Date[];
  recordedDays: Date[];
  selectedDate: Date | null;
  onDayPress: (date: Date) => void;
}

// State:
const [weeks, setWeeks] = useState<Date[][]>([]);
```

**Component Structure**:
```jsx
<CalendarGrid>
  <GridContainer>
    <WeekHeader weekdays={['일', '월', '화', '수', '목', '금', '토']} />

    {weeks.map((week, weekIndex) => (
      <WeekRow key={weekIndex}>
        {week.map((day, dayIndex) => {
          const isPeriod = periodDays.some(d => isSameDay(d, day));
          const isOvulation = ovulationDay && isSameDay(ovulationDay, day);
          const isPredicted = predictedPeriodDays.some(d => isSameDay(d, day));
          const hasRecord = recordedDays.some(d => isSameDay(d, day));
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(selectedDate, day);
          const isOtherMonth = day.getMonth() !== month.getMonth();

          return (
            <CalendarDay
              key={dayIndex}
              date={day}
              isPeriod={isPeriod}
              isOvulation={isOvulation}
              isPredicted={isPredicted}
              hasRecord={hasRecord}
              isToday={isToday}
              isSelected={isSelected}
              isOtherMonth={isOtherMonth}
              onPress={onDayPress}
            />
          );
        })}
      </WeekRow>
    ))}
  </GridContainer>
</CalendarGrid>
```

**로직**:
```typescript
// 주 단위로 날짜 생성
const generateWeeks = (month: Date): Date[][] => {
  const weeks: Date[][] = [];
  const firstDay = startOfMonth(month);
  const lastDay = endOfMonth(month);

  let currentWeek: Date[] = [];
  let currentDate = startOfWeek(firstDay);

  while (currentDate <= endOfWeek(lastDay)) {
    currentWeek.push(new Date(currentDate));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate = addDays(currentDate, 1);
  }

  return weeks;
};

useEffect(() => {
  setWeeks(generateWeeks(month));
}, [month]);
```

#### O2. TodayInfoCard
```typescript
interface TodayInfoCardProps {
  cycleDay: number;
  daysUntilNext: number;
  currentPhase: string;
  onRecordPress: () => void;
}
```

**Component Structure**:
```jsx
<TodayInfoCard>
  <CardContainer>
    <Header>
      <FMText variant="h4">오늘 ({formatDate(new Date())})</FMText>
    </Header>

    <InfoGrid>
      <InfoItem>
        <InfoLabel>주기</InfoLabel>
        <InfoValue>{cycleDay}일차</InfoValue>
      </InfoItem>

      <Divider />

      <InfoItem>
        <InfoLabel>다음 생리까지</InfoLabel>
        <InfoValue>{daysUntilNext}일</InfoValue>
      </InfoItem>
    </InfoGrid>

    <PhaseTag phase={currentPhase}>
      <FMText variant="body2">{getPhaseText(currentPhase)}</FMText>
    </PhaseTag>

    <FMButton
      variant="primary"
      text="증상 기록하기"
      onPress={onRecordPress}
      icon={<FMIcon name="edit" size={20} />}
    />
  </CardContainer>
</TodayInfoCard>
```

**Styles**:
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F5EEE8',
    padding: 24,
    marginHorizontal: 20,
    marginTop: 16,
  },

  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 20,
  },

  infoItem: {
    alignItems: 'center',
  },

  infoLabel: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    color: '#9B9B9B',
    marginBottom: 4,
  },

  infoValue: {
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '700',
    color: '#F7C8C0',
  },

  phaseTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(247, 200, 192, 0.1)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
});
```

## 3. 컴포넌트 Props/State

### CalendarScreen

```typescript
interface CalendarScreenState {
  // 현재 표시 월
  currentMonth: Date;

  // 선택된 날짜
  selectedDate: Date | null;

  // 월경일
  periodDays: Date[];

  // 배란일
  ovulationDay: Date | null;

  // 예상 월경일
  predictedPeriodDays: Date[];

  // 기록된 날짜
  recordedDays: Date[];

  // 오늘 정보
  todayInfo: {
    cycleDay: number;
    daysUntilNext: number;
    currentPhase: string;
  };

  // 로딩 & 에러
  loading: boolean;
  error: Error | null;
}
```

## 4. 이벤트 핸들러

```typescript
// 월 변경
const handlePrevMonth = () => {
  const newMonth = subMonths(currentMonth, 1);
  setCurrentMonth(newMonth);
  loadCalendarData(newMonth);
  analytics.logEvent('calendar_prev_month');
};

const handleNextMonth = () => {
  const newMonth = addMonths(currentMonth, 1);
  setCurrentMonth(newMonth);
  loadCalendarData(newMonth);
  analytics.logEvent('calendar_next_month');
};

// 월 선택 모달
const handleMonthPress = () => {
  setMonthPickerVisible(true);
};

// 날짜 선택
const handleDayPress = (date: Date) => {
  setSelectedDate(date);
  navigation.navigate('CycleDetail', {
    date: date.toISOString(),
  });
  analytics.logEvent('calendar_day_pressed', {
    date: formatDate(date),
  });
};

// 기록하기
const handleRecordPress = () => {
  navigation.navigate('SymptomRecord', {
    date: new Date().toISOString(),
  });
  analytics.logEvent('calendar_record_pressed');
};

// 데이터 로드
const loadCalendarData = async (month: Date) => {
  try {
    setLoading(true);

    const data = await calendarAPI.getCalendarData({
      year: month.getFullYear(),
      month: month.getMonth() + 1,
    });

    setPeriodDays(data.periodDays.map(d => new Date(d)));
    setOvulationDay(data.ovulationDay ? new Date(data.ovulationDay) : null);
    setPredictedPeriodDays(data.predictedDays.map(d => new Date(d)));
    setRecordedDays(data.recordedDays.map(d => new Date(d)));
    setTodayInfo(data.todayInfo);
  } catch (err) {
    setError(err);
    showToast('캘린더 데이터를 불러오는데 실패했습니다', 'error');
  } finally {
    setLoading(false);
  }
};
```

## 5. 데이터/API 매핑

### API Service

```typescript
export class CalendarAPI {
  async getCalendarData(params: {
    year: number;
    month: number;
  }): Promise<CalendarData> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/health/calendar?year=${params.year}&month=${params.month}`,
      {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch calendar data');
    }

    const data = await response.json();
    return data.data;
  }
}
```

### API Response

```json
{
  "success": true,
  "data": {
    "month": "2025-11",
    "periodDays": [
      "2025-11-25",
      "2025-11-26",
      "2025-11-27",
      "2025-11-28",
      "2025-11-29"
    ],
    "ovulationDay": "2025-11-12",
    "predictedDays": [
      "2025-12-23",
      "2025-12-24",
      "2025-12-25",
      "2025-12-26",
      "2025-12-27"
    ],
    "recordedDays": [
      "2025-11-15",
      "2025-11-20",
      "2025-11-25"
    ],
    "todayInfo": {
      "cycleDay": 25,
      "daysUntilNext": 3,
      "currentPhase": "luteal"
    }
  }
}
```

## 6. 최적화

### Memoization

```typescript
// 주 생성 메모이제이션
const weeks = useMemo(() => {
  return generateWeeks(currentMonth);
}, [currentMonth]);

// 날짜 상태 계산 메모이제이션
const getDayStatus = useCallback((day: Date) => {
  return {
    isPeriod: periodDays.some(d => isSameDay(d, day)),
    isOvulation: ovulationDay && isSameDay(ovulationDay, day),
    isPredicted: predictedPeriodDays.some(d => isSameDay(d, day)),
    hasRecord: recordedDays.some(d => isSameDay(d, day)),
    isToday: isSameDay(day, new Date()),
    isSelected: selectedDate && isSameDay(selectedDate, day),
  };
}, [periodDays, ovulationDay, predictedPeriodDays, recordedDays, selectedDate]);
```

### Virtual Rendering (옵션)

```typescript
// 큰 캘린더의 경우 react-native-calendar-strip 등 사용
import CalendarStrip from 'react-native-calendar-strip';

<CalendarStrip
  scrollable
  calendarAnimation={{ type: 'sequence', duration: 30 }}
  daySelectionAnimation={{
    type: 'border',
    duration: 200,
    borderWidth: 1,
    borderHighlightColor: '#F7C8C0',
  }}
  style={{ height: 100, paddingTop: 20, paddingBottom: 10 }}
  calendarHeaderStyle={{ color: '#8C6762' }}
  calendarColor={'#F5EEE8'}
  dateNumberStyle={{ color: '#5A5A5A' }}
  dateNameStyle={{ color: '#9B9B9B' }}
  highlightDateNumberStyle={{ color: '#FFFFFF' }}
  highlightDateNameStyle={{ color: '#FFFFFF' }}
  markedDates={markedDates}
  onDateSelected={handleDayPress}
/>
```
