# FemCare 홈 메인 화면 - 컴포넌트 설계서

## 1. 화면 레이아웃 (상/중/하단)

```
┌─────────────────────────────┐
│   Header (Organism)         │ ← 상단
├─────────────────────────────┤
│                             │
│   Content (Scroll)          │ ← 중단
│   - PeriodCard              │
│   - QuickActionsGrid        │
│   - TipBanner               │
│   - DonationProgress        │
│   - RecentAnalysis          │
│                             │
├─────────────────────────────┤
│   TabNavigation             │ ← 하단
└─────────────────────────────┘
```

---

## 2. UI 컴포넌트 리스트 (Atomic Design)

### 🔹 Atoms (기본 원자 컴포넌트)

#### A1. FMButton
**용도**: 기본 버튼
```typescript
interface FMButtonProps {
  variant: 'primary' | 'secondary' | 'text' | 'outline';
  size: 'small' | 'medium' | 'large';
  text: string;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  testID?: string;
}
```

#### A2. FMText
**용도**: 텍스트 컴포넌트
```typescript
interface FMTextProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption';
  color?: 'primary' | 'secondary' | 'gray' | 'white' | 'error';
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  children: ReactNode;
  numberOfLines?: number;
  style?: TextStyle;
}
```

#### A3. FMIcon
**용도**: 아이콘 컴포넌트
```typescript
interface FMIconProps {
  name: string;
  size: number;
  color: string;
  strokeWidth?: number;
}
```

#### A4. FMBadge
**용도**: 배지 (알림 개수 등)
```typescript
interface FMBadgeProps {
  count: number;
  max?: number;
  show?: boolean;
  size?: 'small' | 'medium';
}
```

#### A5. FMProgressBar
**용도**: 진행 바
```typescript
interface FMProgressBarProps {
  value: number; // 0-1
  height?: number;
  backgroundColor?: string;
  fillColor?: string | string[]; // gradient support
  animated?: boolean;
}
```

#### A6. FMAvatar
**용도**: 프로필 아바타
```typescript
interface FMAvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size: number;
  backgroundColor?: string;
}
```

---

### 🔸 Molecules (분자 컴포넌트)

#### M1. GreetingHeader
**용도**: 인사말 헤더
```typescript
interface GreetingHeaderProps {
  userName: string;
  unreadCount: number;
  onNotificationPress: () => void;
}

// 구성: FMText + FMIcon + FMBadge
// 내부 State: none
```

#### M2. CycleProgressIndicator
**용도**: 주기 진행 표시
```typescript
interface CycleProgressIndicatorProps {
  currentDay: number;
  totalDays: number;
  phases: Array<{
    name: string;
    startDay: number;
    endDay: number;
    color: string;
  }>;
}

// 구성: FMProgressBar + FMText
```

#### M3. QuickActionItem
**용도**: 빠른 기능 아이템
```typescript
interface QuickActionItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  testID?: string;
}

// 구성: FMIcon + FMText + (optional) FMBadge
```

#### M4. StatCard
**용도**: 통계 카드
```typescript
interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

// 구성: FMIcon + FMText
```

#### M5. InfoBox
**용도**: 정보 박스
```typescript
interface InfoBoxProps {
  variant: 'info' | 'warning' | 'success' | 'error';
  icon?: string;
  title?: string;
  message: string;
  onClose?: () => void;
}

// 구성: FMIcon + FMText + (optional) CloseButton
```

---

### 🔶 Organisms (유기체 컴포넌트)

#### O1. HomeHeader
**용도**: 홈 화면 상단 헤더
```typescript
interface HomeHeaderProps {
  userName: string;
  unreadNotifications: number;
  onNotificationPress: () => void;
}

// 구성: GreetingHeader
// 내부 State: none
```

**Component Structure**:
```jsx
<HomeHeader>
  <Container>
    <GreetingHeader
      userName={userName}
      unreadCount={unreadNotifications}
      onNotificationPress={onNotificationPress}
    />
  </Container>
</HomeHeader>
```

#### O2. PeriodCard
**용도**: 월경 주기 카드 (Hero Card)
```typescript
interface PeriodCardProps {
  nextPeriodDate: string;
  dDay: number;
  currentDay: number;
  cycleLength: number;
  currentPhase: string;
  onRecordPress: () => void;
}

// 구성:
// - FMText (title, date, d-day)
// - CycleProgressIndicator
// - FMButton (기록하기)

// 내부 State:
const [expanded, setExpanded] = useState(false);
```

**Component Structure**:
```jsx
<PeriodCard>
  <CardContainer gradient>
    <FMText variant="h4" color="white">다음 생리 예정일</FMText>

    <DateSection>
      <FMText variant="h2" weight="bold">{nextPeriodDate}</FMText>
      <FMText variant="body2">(D-{dDay})</FMText>
    </DateSection>

    <CycleProgressIndicator
      currentDay={currentDay}
      totalDays={cycleLength}
      phases={phases}
    />

    <PhaseLabels>
      <FMText variant="caption">생리기</FMText>
      <FMText variant="caption">배란기</FMText>
      <FMText variant="caption">생리전기</FMText>
    </PhaseLabels>

    <FMButton
      variant="secondary"
      text="기록하기"
      onPress={onRecordPress}
    />
  </CardContainer>
</PeriodCard>
```

#### O3. QuickActionsGrid
**용도**: 빠른 기능 그리드
```typescript
interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  onActionPress: (route: string) => void;
}

// 구성: QuickActionItem[]
// 내부 State: none
```

**Component Structure**:
```jsx
<QuickActionsGrid>
  <GridContainer columns={3}>
    {actions.map(action => (
      <QuickActionItem
        key={action.id}
        icon={action.icon}
        label={action.label}
        badge={action.badge}
        onPress={() => onActionPress(action.route)}
      />
    ))}
  </GridContainer>
</QuickActionsGrid>
```

#### O4. TipBanner
**용도**: 오늘의 건강 팁 배너
```typescript
interface TipBannerProps {
  icon: string;
  title: string;
  message: string;
  onPress: () => void;
  onDismiss?: () => void;
}

// 구성: FMIcon + FMText + FMButton
// 내부 State:
const [dismissed, setDismissed] = useState(false);
```

**Component Structure**:
```jsx
<TipBanner>
  {!dismissed && (
    <BannerContainer>
      <ContentSection>
        <FMIcon name="lightbulb" size={24} color="#F7C8C0" />
        <TextSection>
          <FMText variant="h4">{title}</FMText>
          <FMText variant="body2">{message}</FMText>
        </TextSection>
      </ContentSection>

      <ActionSection>
        <FMButton
          variant="text"
          text="자세히 보기"
          icon={<FMIcon name="arrow-right" />}
          onPress={onPress}
        />
        {onDismiss && (
          <CloseButton onPress={() => setDismissed(true)}>
            <FMIcon name="close" size={20} />
          </CloseButton>
        )}
      </ActionSection>
    </BannerContainer>
  )}
</TipBanner>
```

#### O5. DonationProgressCard
**용도**: 기부 진행 상황 카드
```typescript
interface DonationProgressCardProps {
  currentAmount: number;
  goalAmount: number;
  participantCount: number;
  onDonatePress: () => void;
  onDetailPress: () => void;
}

// 구성:
// - FMText
// - FMProgressBar
// - FMButton

// 내부 State: none
```

**Component Structure**:
```jsx
<DonationProgressCard>
  <CardContainer>
    <Header>
      <FMIcon name="heart" size={24} color="#F7C8C0" />
      <FMText variant="h4">함께 만드는 변화</FMText>
    </Header>

    <AmountSection>
      <FMText variant="body2">이번 달 기부 적립금</FMText>
      <FMText variant="h3" weight="bold">
        {currentAmount.toLocaleString()}원
      </FMText>
    </AmountSection>

    <FMProgressBar
      value={currentAmount / goalAmount}
      fillColor={['#F7C8C0', '#F5A97F']}
      height={8}
      animated
    />

    <StatsRow>
      <FMText variant="caption">
        {participantCount}명이 함께하고 있어요
      </FMText>
    </StatsRow>

    <ActionButtons>
      <FMButton
        variant="text"
        text="기부하기"
        onPress={onDonatePress}
      />
      <FMButton
        variant="text"
        text="자세히 보기"
        onPress={onDetailPress}
      />
    </ActionButtons>
  </CardContainer>
</DonationProgressCard>
```

#### O6. RecentAnalysisCard
**용도**: 최근 AI 분석 결과 카드
```typescript
interface RecentAnalysisCardProps {
  date: string;
  bloodFlow: string;
  status: 'normal' | 'caution' | 'warning';
  onPress: () => void;
}

// 구성: FMIcon + FMText + FMButton
// 내부 State: none
```

**Component Structure**:
```jsx
<RecentAnalysisCard>
  <CardContainer>
    <Header>
      <FMIcon name="chart" size={24} color="#F7C8C0" />
      <FMText variant="h4">최근 AI 분석</FMText>
    </Header>

    <AnalysisInfo>
      <FMText variant="body2">{date} 분석 결과</FMText>
      <StatsRow>
        <StatItem>
          <FMText variant="caption">출혈량</FMText>
          <FMText variant="body1" weight="semibold">{bloodFlow}</FMText>
        </StatItem>
        <Divider />
        <StatItem>
          <FMText variant="caption">상태</FMText>
          <StatusBadge status={status}>
            <FMText variant="body1" weight="semibold">
              {status === 'normal' ? '양호' : '확인 필요'}
            </FMText>
          </StatusBadge>
        </StatItem>
      </StatsRow>
    </AnalysisInfo>

    <FMButton
      variant="text"
      text="자세히 보기"
      icon={<FMIcon name="arrow-right" />}
      onPress={onPress}
    />
  </CardContainer>
</RecentAnalysisCard>
```

#### O7. TabNavigation
**용도**: 하단 탭 네비게이션
```typescript
interface Tab {
  id: string;
  icon: string;
  label: string;
  route: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  currentRoute: string;
  onTabPress: (route: string) => void;
}

// 구성: FMIcon + FMText
// 내부 State: none
```

**Component Structure**:
```jsx
<TabNavigation>
  <TabContainer>
    {tabs.map(tab => {
      const isActive = currentRoute === tab.route;
      return (
        <TabItem
          key={tab.id}
          active={isActive}
          onPress={() => onTabPress(tab.route)}
        >
          <FMIcon
            name={tab.icon}
            size={24}
            color={isActive ? '#F7C8C0' : '#9B9B9B'}
          />
          <FMText
            variant="caption"
            color={isActive ? 'primary' : 'gray'}
          >
            {tab.label}
          </FMText>
        </TabItem>
      );
    })}
  </TabContainer>
</TabNavigation>
```

---

## 3. 컴포넌트 Props/State

### HomeMainScreen (Page)

```typescript
interface HomeMainScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

interface HomeMainScreenState {
  // 사용자 정보
  userName: string;
  unreadNotifications: number;

  // 월경 주기 데이터
  nextPeriodDate: string;
  dDay: number;
  currentDay: number;
  cycleLength: number;
  currentPhase: string;

  // 빠른 기능
  quickActions: QuickAction[];

  // 팁
  dailyTip: {
    icon: string;
    title: string;
    message: string;
  };

  // 기부
  donationData: {
    currentAmount: number;
    goalAmount: number;
    participantCount: number;
  };

  // AI 분석
  recentAnalysis?: {
    date: string;
    bloodFlow: string;
    status: 'normal' | 'caution' | 'warning';
  };

  // 로딩 & 에러
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
}
```

---

## 4. 이벤트 핸들러

### HomeMainScreen 이벤트 핸들러

```typescript
// 데이터 로딩
const loadHomeData = async () => {
  try {
    setLoading(true);
    setError(null);

    const [userData, periodData, donationData, analysisData] = await Promise.all([
      homeAPI.getUserProfile(),
      homeAPI.getPeriodInfo(),
      homeAPI.getDonationProgress(),
      homeAPI.getRecentAnalysis(),
    ]);

    setUserName(userData.name);
    setUnreadNotifications(userData.unreadCount);
    setNextPeriodDate(periodData.nextDate);
    setDDay(periodData.dDay);
    setCurrentDay(periodData.currentDay);
    setCycleLength(periodData.cycleLength);
    setCurrentPhase(periodData.phase);
    setDonationData(donationData);
    setRecentAnalysis(analysisData);
  } catch (err) {
    setError(err);
    showToast('데이터를 불러오는데 실패했습니다', 'error');
  } finally {
    setLoading(false);
  }
};

// Pull to Refresh
const handleRefresh = async () => {
  setRefreshing(true);
  await loadHomeData();
  setRefreshing(false);
};

// 알림 버튼
const handleNotificationPress = () => {
  navigation.navigate('Notifications');
  analytics.logEvent('home_notification_pressed');
};

// 기록하기
const handleRecordPress = () => {
  navigation.navigate('SymptomRecord', {
    date: new Date().toISOString(),
  });
  analytics.logEvent('home_record_pressed');
};

// 빠른 기능 클릭
const handleQuickActionPress = (route: string) => {
  navigation.navigate(route);
  analytics.logEvent('home_quick_action_pressed', { route });
};

// 팁 상세
const handleTipPress = () => {
  navigation.navigate('HealthTipDetail', {
    tipId: dailyTip.id,
  });
};

// 기부
const handleDonatePress = () => {
  navigation.navigate('DonationMain');
  analytics.logEvent('home_donate_pressed');
};

const handleDonationDetailPress = () => {
  navigation.navigate('DonationProgress');
};

// AI 분석 상세
const handleAnalysisDetailPress = () => {
  if (recentAnalysis) {
    navigation.navigate('AnalysisResult', {
      analysisId: recentAnalysis.id,
    });
  }
};

// 탭 전환
const handleTabPress = (route: string) => {
  navigation.navigate(route);
  analytics.logEvent('tab_pressed', { route });
};

// 에러 재시도
const handleRetry = () => {
  loadHomeData();
};
```

---

## 5. 화면 간 인터랙션

### Navigation Flow

```typescript
// HomeMainScreen → 다른 화면

// 1. 알림 화면
handleNotificationPress() → Navigate('Notifications')

// 2. 증상 기록
handleRecordPress() → Navigate('SymptomRecord', { date })

// 3. AI 분석
handleQuickActionPress('AIAnalysis') → Navigate('CameraGuide')

// 4. 캘린더
handleQuickActionPress('Calendar') → Navigate('Calendar')

// 5. 구독 관리
handleQuickActionPress('Subscription') → Navigate('SubscriptionMain')

// 6. 건강 리포트
handleQuickActionPress('HealthReport') → Navigate('HealthReportHome')

// 7. 상담
handleQuickActionPress('Consultation') → Navigate('ConsultationMain')

// 8. 커뮤니티
handleQuickActionPress('Community') → Navigate('CommunityMain')

// 9. 기부
handleDonatePress() → Navigate('DonationMain')

// 10. AI 분석 상세
handleAnalysisDetailPress() → Navigate('AnalysisResult', { analysisId })

// 11. 탭 전환
handleTabPress('Health') → Navigate('Calendar')
handleTabPress('Subscription') → Navigate('SubscriptionMain')
handleTabPress('Consultation') → Navigate('ConsultationMain')
handleTabPress('MyPage') → Navigate('MyPageMain')
```

### Data Flow

```typescript
// API → State → Props → Components

// 1. 초기 로딩
useEffect(() => {
  loadHomeData();
}, []);

// 2. 포커스 시 새로고침
useFocusEffect(
  useCallback(() => {
    loadHomeData();
  }, [])
);

// 3. Pull to Refresh
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor="#F7C8C0"
    />
  }
>
```

---

## 6. Lanove 스타일 적용 규칙

### 컴포넌트별 스타일 가이드

#### PeriodCard
```typescript
const styles = StyleSheet.create({
  container: {
    background: 'linear-gradient(135deg, #F7C8C0 0%, #F5EEE8 100%)',
    borderRadius: 22,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  title: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  dateText: {
    fontFamily: 'Pretendard',
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  dDayText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },

  recordButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },

  recordButtonText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: '#F7C8C0',
  },
});
```

#### QuickActionsGrid
```typescript
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 8,
  },

  actionItem: {
    width: '31.3%', // (100% - 2*8px) / 3
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5EEE8',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIcon: {
    marginBottom: 8,
  },

  actionLabel: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '500',
    color: '#8C6762',
    textAlign: 'center',
  },
});
```

#### TipBanner
```typescript
const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(247, 200, 192, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F7C8C0',
  },

  contentSection: {
    flexDirection: 'row',
    gap: 12,
  },

  textSection: {
    flex: 1,
  },

  title: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    color: '#8C6762',
    marginBottom: 4,
  },

  message: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '400',
    color: '#5A5A5A',
    lineHeight: 22,
  },
});
```

#### DonationProgressCard
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  currentAmount: {
    fontFamily: 'Pretendard',
    fontSize: 24,
    fontWeight: '700',
    color: '#F7C8C0',
  },

  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 16,
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #F7C8C0 0%, #F5A97F 100%)',
    borderRadius: 4,
  },
});
```

#### TabNavigation
```typescript
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5EEE8',
    paddingBottom: Platform.select({
      ios: 20,
      android: 8,
    }),
    paddingTop: 8,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  tabLabel: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  tabLabelActive: {
    color: '#F7C8C0',
  },

  tabLabelInactive: {
    color: '#9B9B9B',
  },
});
```

### 공통 스타일 토큰

```typescript
// styles/tokens.ts
export const Colors = {
  primary: '#F7C8C0',
  primaryDark: '#F5A97F',
  background: '#F5EEE8',
  surface: '#FFFFFF',
  textPrimary: '#8C6762',
  textSecondary: '#5A5A5A',
  textLight: '#9B9B9B',
  border: '#E5E5E5',
  borderLight: '#F5EEE8',
  error: '#E89B9B',
  success: '#7BC9A6',
  warning: '#F5A97F',
};

export const Typography = {
  fontFamily: 'Pretendard',
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 1.4 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 1.4 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 1.5 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 1.5 },
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 1.6 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 1.6 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 1.5 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 22,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

---

## 7. Validation 요소

### 데이터 검증

```typescript
// utils/validation.ts

// 날짜 유효성 검증
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// D-day 유효성 검증
export const validateDDay = (dDay: number): boolean => {
  return Number.isInteger(dDay) && dDay >= -7 && dDay <= 60;
};

// 주기 유효성 검증
export const validateCycle = (cycleLength: number): boolean => {
  return Number.isInteger(cycleLength) && cycleLength >= 21 && cycleLength <= 35;
};

// 현재 날짜 유효성 검증
export const validateCurrentDay = (currentDay: number, cycleLength: number): boolean => {
  return Number.isInteger(currentDay) && currentDay >= 1 && currentDay <= cycleLength;
};

// 기부 금액 검증
export const validateDonationAmount = (amount: number): boolean => {
  return Number.isFinite(amount) && amount >= 0;
};

// HomeMainScreen에서 사용
useEffect(() => {
  if (!validateDate(nextPeriodDate)) {
    console.error('Invalid next period date');
    setError(new Error('유효하지 않은 날짜입니다'));
  }

  if (!validateDDay(dDay)) {
    console.error('Invalid D-day');
  }

  if (!validateCycle(cycleLength)) {
    console.error('Invalid cycle length');
  }
}, [nextPeriodDate, dDay, cycleLength]);
```

### UI 검증

```typescript
// 컴포넌트 PropTypes 검증
import PropTypes from 'prop-types';

PeriodCard.propTypes = {
  nextPeriodDate: PropTypes.string.isRequired,
  dDay: PropTypes.number.isRequired,
  currentDay: PropTypes.number.isRequired,
  cycleLength: PropTypes.number.isRequired,
  currentPhase: PropTypes.string.isRequired,
  onRecordPress: PropTypes.func.isRequired,
};

QuickActionsGrid.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      route: PropTypes.string.isRequired,
      badge: PropTypes.number,
    })
  ).isRequired,
  onActionPress: PropTypes.func.isRequired,
};
```

### 에러 바운더리

```typescript
// components/ErrorBoundary.tsx
class HomeErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    analytics.logError('home_screen_error', {
      error: error.message,
      stack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorView>
          <FMIcon name="alert-circle" size={64} color="#E89B9B" />
          <FMText variant="h3">오류가 발생했습니다</FMText>
          <FMText variant="body2">앱을 다시 시작해주세요</FMText>
          <FMButton
            variant="primary"
            text="재시도"
            onPress={() => this.setState({ hasError: false })}
          />
        </ErrorView>
      );
    }

    return this.props.children;
  }
}
```

---

## 8. 데이터/API 매핑

### API Service Layer

```typescript
// services/homeAPI.ts

export class HomeAPI {
  private baseURL = API_BASE_URL;

  // 사용자 프로필
  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch(`${this.baseURL}/api/v1/user/profile`, {
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  // 월경 주기 정보
  async getPeriodInfo(): Promise<PeriodInfo> {
    const response = await fetch(`${this.baseURL}/api/v1/health/period/next`, {
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch period info');
    }

    const data = await response.json();

    return {
      nextDate: data.data.nextDate,
      dDay: data.data.dDay,
      currentDay: data.data.currentDay,
      cycleLength: data.data.cycleLength,
      phase: data.data.phase,
    };
  }

  // 기부 진행 상황
  async getDonationProgress(): Promise<DonationProgress> {
    const response = await fetch(`${this.baseURL}/api/v1/donation/progress`, {
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch donation progress');
    }

    const data = await response.json();

    return {
      currentAmount: data.data.currentAmount,
      goalAmount: data.data.goalAmount,
      participantCount: data.data.participantCount,
    };
  }

  // 최근 AI 분석
  async getRecentAnalysis(): Promise<RecentAnalysis | null> {
    const response = await fetch(`${this.baseURL}/api/v1/analysis/recent`, {
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
      },
    });

    if (!response.ok) {
      return null; // 분석 기록이 없을 수 있음
    }

    const data = await response.json();

    if (!data.data) {
      return null;
    }

    return {
      id: data.data.id,
      date: data.data.date,
      bloodFlow: data.data.bloodFlow.text,
      status: data.data.overallStatus,
    };
  }

  // 오늘의 팁
  async getDailyTip(): Promise<DailyTip> {
    const response = await fetch(`${this.baseURL}/api/v1/health/tips/daily`, {
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
      },
    });

    if (!response.ok) {
      // Fallback to default tip
      return {
        id: 'default',
        icon: 'lightbulb',
        title: '오늘의 건강 팁',
        message: '규칙적인 생활 습관이 건강한 월경 주기를 유지하는 데 도움이 됩니다.',
      };
    }

    const data = await response.json();
    return data.data;
  }
}

export const homeAPI = new HomeAPI();
```

### Data Models

```typescript
// models/home.ts

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  unreadCount: number;
}

export interface PeriodInfo {
  nextDate: string; // ISO 8601 format
  dDay: number;
  currentDay: number;
  cycleLength: number;
  phase: 'period' | 'follicular' | 'ovulation' | 'luteal';
}

export interface DonationProgress {
  currentAmount: number;
  goalAmount: number;
  participantCount: number;
}

export interface RecentAnalysis {
  id: string;
  date: string;
  bloodFlow: string;
  status: 'normal' | 'caution' | 'warning';
}

export interface DailyTip {
  id: string;
  icon: string;
  title: string;
  message: string;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route: string;
  badge?: number;
}
```

### Redux State (Optional)

```typescript
// store/slices/homeSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { homeAPI } from '@/services/homeAPI';

export const fetchHomeData = createAsyncThunk(
  'home/fetchData',
  async () => {
    const [userProfile, periodInfo, donationProgress, recentAnalysis, dailyTip] =
      await Promise.all([
        homeAPI.getUserProfile(),
        homeAPI.getPeriodInfo(),
        homeAPI.getDonationProgress(),
        homeAPI.getRecentAnalysis(),
        homeAPI.getDailyTip(),
      ]);

    return {
      userProfile,
      periodInfo,
      donationProgress,
      recentAnalysis,
      dailyTip,
    };
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    userProfile: null,
    periodInfo: null,
    donationProgress: null,
    recentAnalysis: null,
    dailyTip: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload.userProfile;
        state.periodInfo = action.payload.periodInfo;
        state.donationProgress = action.payload.donationProgress;
        state.recentAnalysis = action.payload.recentAnalysis;
        state.dailyTip = action.payload.dailyTip;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = homeSlice.actions;
export default homeSlice.reducer;
```

### API Response Mapping

```typescript
// utils/mappers/homeMapper.ts

export const mapPeriodResponse = (apiData: any): PeriodInfo => {
  return {
    nextDate: apiData.nextDate,
    dDay: apiData.dDay,
    currentDay: apiData.currentDay,
    cycleLength: apiData.cycleLength,
    phase: mapPhase(apiData.phase),
  };
};

const mapPhase = (phase: string): PeriodInfo['phase'] => {
  const phaseMap: Record<string, PeriodInfo['phase']> = {
    '생리기': 'period',
    '난포기': 'follicular',
    '배란기': 'ovulation',
    '생리전기': 'luteal',
  };

  return phaseMap[phase] || 'follicular';
};

export const mapDonationResponse = (apiData: any): DonationProgress => {
  return {
    currentAmount: apiData.currentAmount || 0,
    goalAmount: apiData.goalAmount || 2500,
    participantCount: apiData.participantCount || 0,
  };
};

export const mapAnalysisResponse = (apiData: any): RecentAnalysis | null => {
  if (!apiData) return null;

  return {
    id: apiData.id,
    date: formatDate(apiData.timestamp),
    bloodFlow: apiData.bloodFlow?.text || '정보 없음',
    status: apiData.overallStatus || 'normal',
  };
};
```

---

## 9. 전체 컴포넌트 트리

```
HomeMainScreen (Page)
├── SafeAreaView
│   ├── HomeHeader (Organism)
│   │   └── GreetingHeader (Molecule)
│   │       ├── FMText (Atom)
│   │       ├── FMIcon (Atom)
│   │       └── FMBadge (Atom)
│   │
│   ├── ScrollView
│   │   ├── PeriodCard (Organism)
│   │   │   ├── FMText (Atom) × 3
│   │   │   ├── CycleProgressIndicator (Molecule)
│   │   │   │   ├── FMProgressBar (Atom)
│   │   │   │   └── FMText (Atom) × 3
│   │   │   └── FMButton (Atom)
│   │   │
│   │   ├── QuickActionsGrid (Organism)
│   │   │   └── QuickActionItem (Molecule) × 6
│   │   │       ├── FMIcon (Atom)
│   │   │       ├── FMText (Atom)
│   │   │       └── FMBadge? (Atom)
│   │   │
│   │   ├── TipBanner (Organism)
│   │   │   ├── FMIcon (Atom)
│   │   │   ├── FMText (Atom) × 2
│   │   │   └── FMButton (Atom)
│   │   │
│   │   ├── DonationProgressCard (Organism)
│   │   │   ├── FMIcon (Atom)
│   │   │   ├── FMText (Atom) × 4
│   │   │   ├── FMProgressBar (Atom)
│   │   │   └── FMButton (Atom) × 2
│   │   │
│   │   └── RecentAnalysisCard? (Organism)
│   │       ├── FMIcon (Atom)
│   │       ├── FMText (Atom) × 5
│   │       └── FMButton (Atom)
│   │
│   └── TabNavigation (Organism)
│       └── TabItem × 5
│           ├── FMIcon (Atom)
│           └── FMText (Atom)
```

---

## 10. 사용 예시 (HomeMainScreen.tsx)

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, ScrollView, RefreshControl, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HomeHeader } from '@/components/organisms/HomeHeader';
import { PeriodCard } from '@/components/organisms/PeriodCard';
import { QuickActionsGrid } from '@/components/organisms/QuickActionsGrid';
import { TipBanner } from '@/components/organisms/TipBanner';
import { DonationProgressCard } from '@/components/organisms/DonationProgressCard';
import { RecentAnalysisCard } from '@/components/organisms/RecentAnalysisCard';
import { TabNavigation } from '@/components/organisms/TabNavigation';
import { homeAPI } from '@/services/homeAPI';
import { analytics } from '@/utils/analytics';
import { showToast } from '@/utils/toast';

export const HomeMainScreen: React.FC<HomeMainScreenProps> = ({ navigation }) => {
  // State
  const [userName, setUserName] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [periodInfo, setPeriodInfo] = useState<PeriodInfo | null>(null);
  const [donationData, setDonationData] = useState<DonationProgress | null>(null);
  const [recentAnalysis, setRecentAnalysis] = useState<RecentAnalysis | null>(null);
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Quick Actions
  const quickActions: QuickAction[] = [
    { id: '1', icon: 'camera', label: 'AI 분석', route: 'AIAnalysis' },
    { id: '2', icon: 'calendar', label: '캘린더', route: 'Calendar' },
    { id: '3', icon: 'box', label: '구독 관리', route: 'Subscription' },
    { id: '4', icon: 'chart', label: '건강 리포트', route: 'HealthReport' },
    { id: '5', icon: 'message-circle', label: '상담 예약', route: 'Consultation' },
    { id: '6', icon: 'users', label: '커뮤니티', route: 'Community' },
  ];

  // Tabs
  const tabs = [
    { id: 'home', icon: 'home', label: '홈', route: 'Home' },
    { id: 'health', icon: 'heart', label: '건강', route: 'Calendar' },
    { id: 'subscription', icon: 'box', label: '구독', route: 'SubscriptionMain' },
    { id: 'consultation', icon: 'message-circle', label: '상담', route: 'ConsultationMain' },
    { id: 'mypage', icon: 'user', label: 'MY', route: 'MyPageMain' },
  ];

  // Load data
  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userData, periodData, donationData, analysisData, tipData] =
        await Promise.all([
          homeAPI.getUserProfile(),
          homeAPI.getPeriodInfo(),
          homeAPI.getDonationProgress(),
          homeAPI.getRecentAnalysis(),
          homeAPI.getDailyTip(),
        ]);

      setUserName(userData.name);
      setUnreadNotifications(userData.unreadCount);
      setPeriodInfo(periodData);
      setDonationData(donationData);
      setRecentAnalysis(analysisData);
      setDailyTip(tipData);

      analytics.logEvent('home_loaded');
    } catch (err) {
      setError(err as Error);
      showToast('데이터를 불러오는데 실패했습니다', 'error');
      analytics.logError('home_load_failed', err);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadHomeData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // 화면 포커스 시 데이터 새로고침
      loadHomeData();
    }, [])
  );

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
    analytics.logEvent('home_notification_pressed');
  };

  const handleRecordPress = () => {
    navigation.navigate('SymptomRecord', {
      date: new Date().toISOString(),
    });
    analytics.logEvent('home_record_pressed');
  };

  const handleQuickActionPress = (route: string) => {
    navigation.navigate(route);
    analytics.logEvent('home_quick_action_pressed', { route });
  };

  const handleTabPress = (route: string) => {
    if (route !== 'Home') {
      navigation.navigate(route);
      analytics.logEvent('tab_pressed', { route });
    }
  };

  // Render
  if (loading && !refreshing) {
    return <LoadingView />;
  }

  if (error && !periodInfo) {
    return <ErrorView onRetry={loadHomeData} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader
        userName={userName}
        unreadNotifications={unreadNotifications}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F7C8C0"
          />
        }
      >
        {periodInfo && (
          <PeriodCard
            nextPeriodDate={periodInfo.nextDate}
            dDay={periodInfo.dDay}
            currentDay={periodInfo.currentDay}
            cycleLength={periodInfo.cycleLength}
            currentPhase={periodInfo.phase}
            onRecordPress={handleRecordPress}
          />
        )}

        <QuickActionsGrid
          actions={quickActions}
          onActionPress={handleQuickActionPress}
        />

        {dailyTip && (
          <TipBanner
            icon={dailyTip.icon}
            title={dailyTip.title}
            message={dailyTip.message}
            onPress={() => navigation.navigate('HealthTipDetail', { tipId: dailyTip.id })}
          />
        )}

        {donationData && (
          <DonationProgressCard
            currentAmount={donationData.currentAmount}
            goalAmount={donationData.goalAmount}
            participantCount={donationData.participantCount}
            onDonatePress={() => navigation.navigate('DonationMain')}
            onDetailPress={() => navigation.navigate('DonationProgress')}
          />
        )}

        {recentAnalysis && (
          <RecentAnalysisCard
            date={recentAnalysis.date}
            bloodFlow={recentAnalysis.bloodFlow}
            status={recentAnalysis.status}
            onPress={() => navigation.navigate('AnalysisResult', { analysisId: recentAnalysis.id })}
          />
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <TabNavigation
        tabs={tabs}
        currentRoute="Home"
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EEE8',
  },
});
```

---

이 문서는 FemCare 홈 메인 화면의 완전한 컴포넌트 설계를 담고 있습니다. 다른 화면도 동일한 방식으로 설계하실 수 있습니다.
