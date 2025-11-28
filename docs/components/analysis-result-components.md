# FemCare AI 분석 결과 화면 - 컴포넌트 설계서

## 1. 화면 레이아웃

```
┌─────────────────────────────┐
│   NavBar                    │ ← 상단
├─────────────────────────────┤
│   StatusCard (Hero)         │
│   ─────────────────         │
│   BloodFlowSection          │ ← 중단
│   ColorAnalysisSection      │
│   AICommentBox              │
│   WarningBox (조건부)        │
├─────────────────────────────┤
│   ActionButtons             │ ← 하단
└─────────────────────────────┘
```

## 2. UI 컴포넌트 리스트

### 🔹 Atoms

#### A1. StatusIcon
```typescript
interface StatusIconProps {
  status: 'normal' | 'caution' | 'warning';
  size: number;
}
// ✓ / ⚠ / ⚠️ 아이콘 + 색상
```

#### A2. LevelDot
```typescript
interface LevelDotProps {
  filled: boolean;
  active?: boolean;
  size?: number;
}
// 출혈량 레벨 표시 점
```

#### A3. ColorIndicator
```typescript
interface ColorIndicatorProps {
  color: string;
  size: number;
  label?: string;
}
// 색상 원형 인디케이터
```

### 🔸 Molecules

#### M1. BloodFlowIndicator
```typescript
interface BloodFlowIndicatorProps {
  level: number; // 1-5
  text: string;
  maxLevel?: number;
}

// 구성: LevelDot[] + FMText
```

**Component Structure**:
```jsx
<BloodFlowIndicator>
  <DotsRow>
    {Array.from({ length: maxLevel }).map((_, i) => (
      <LevelDot
        key={i}
        filled={i < level}
        active={i === level - 1}
      />
    ))}
  </DotsRow>
  <LevelText>{text}</LevelText>
</BloodFlowIndicator>
```

#### M2. ComparisonBadge
```typescript
interface ComparisonBadgeProps {
  text: string;
  trend: 'similar' | 'higher' | 'lower';
}

// 예: "이번 주기 평균과 비슷해요"
```

#### M3. CommentCard
```typescript
interface CommentCardProps {
  icon: string;
  title: string;
  message: string;
  variant?: 'default' | 'info' | 'warning';
}
```

### 🔶 Organisms

#### O1. AnalysisStatusCard
```typescript
interface AnalysisStatusCardProps {
  status: 'normal' | 'caution' | 'warning';
  statusText: string;
  timestamp: string;
}

// State:
const [expanded, setExpanded] = useState(false);
```

**Component Structure**:
```jsx
<AnalysisStatusCard>
  <GradientCard status={status}>
    <StatusIcon status={status} size={64} />

    <StatusText variant="h2">{statusText}</StatusText>

    <TimestampText>{formatTimestamp(timestamp)}</TimestampText>
  </GradientCard>
</AnalysisStatusCard>
```

**Styles**:
```typescript
const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
  },

  cardNormal: {
    background: 'linear-gradient(135deg, #F7C8C0 0%, #F5A97F 100%)',
  },

  cardCaution: {
    background: 'linear-gradient(135deg, #F5A97F 0%, #F7C8C0 100%)',
  },

  cardWarning: {
    background: 'linear-gradient(135deg, #E89B9B 0%, #F5A97F 100%)',
  },

  statusText: {
    fontFamily: 'Pretendard',
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },

  timestamp: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
});
```

#### O2. BloodFlowSection
```typescript
interface BloodFlowSectionProps {
  level: number;
  text: string;
  comparisonText: string;
}
```

**Component Structure**:
```jsx
<BloodFlowSection>
  <SectionCard>
    <SectionHeader>
      <FMText variant="h4">출혈량</FMText>
    </SectionHeader>

    <BloodFlowIndicator
      level={level}
      text={text}
      maxLevel={5}
    />

    <ComparisonBadge
      text={comparisonText}
      trend="similar"
    />
  </SectionCard>
</BloodFlowSection>
```

#### O3. ColorAnalysisSection
```typescript
interface ColorAnalysisSectionProps {
  color: string;
  colorName: string;
  status: 'normal' | 'caution';
  comment: string;
}
```

**Component Structure**:
```jsx
<ColorAnalysisSection>
  <SectionCard>
    <SectionHeader>
      <FMText variant="h4">색상</FMText>
    </SectionHeader>

    <ColorDisplay>
      <ColorIndicator
        color={color}
        size={48}
      />
      <ColorInfo>
        <FMText variant="h4">{colorName}</FMText>
        <StatusBadge status={status}>
          <FMText variant="body2">
            {status === 'normal' ? '정상 범위' : '확인 필요'}
          </FMText>
        </StatusBadge>
      </ColorInfo>
    </ColorDisplay>

    <CommentText>{comment}</CommentText>
  </SectionCard>
</ColorAnalysisSection>
```

#### O4. AICommentBox
```typescript
interface AICommentBoxProps {
  comment: string;
  recommendations?: string[];
}
```

**Component Structure**:
```jsx
<AICommentBox>
  <CommentCard variant="info">
    <Header>
      <FMIcon name="cpu" size={24} color="#F7C8C0" />
      <FMText variant="h4">AI 건강 코멘트</FMText>
    </Header>

    <CommentText>{comment}</CommentText>

    {recommendations && recommendations.length > 0 && (
      <RecommendationList>
        {recommendations.map((rec, index) => (
          <RecommendationItem key={index}>
            <BulletPoint />
            <FMText variant="body2">{rec}</FMText>
          </RecommendationItem>
        ))}
      </RecommendationList>
    )}
  </CommentCard>
</AICommentBox>
```

#### O5. WarningBox
```typescript
interface WarningBoxProps {
  title: string;
  message: string;
  severity: 'warning' | 'urgent';
  onConsultationPress: () => void;
  show: boolean;
}
```

**Component Structure**:
```jsx
<WarningBox>
  {show && (
    <WarningCard severity={severity}>
      <Header>
        <FMIcon
          name="alert-triangle"
          size={24}
          color={severity === 'urgent' ? '#E89B9B' : '#F5A97F'}
        />
        <FMText variant="h4">{title}</FMText>
      </Header>

      <MessageText>{message}</MessageText>

      <FMButton
        variant="primary"
        text="상담 예약하기"
        onPress={onConsultationPress}
      />
    </WarningCard>
  )}
</WarningBox>
```

#### O6. AnalysisActionButtons
```typescript
interface AnalysisActionButtonsProps {
  onDetailPress: () => void;
  onSavePress: () => void;
  saveLoading?: boolean;
}
```

**Component Structure**:
```jsx
<AnalysisActionButtons>
  <ButtonRow>
    <FMButton
      variant="secondary"
      text="상세 분석 보기"
      onPress={onDetailPress}
      style={{ flex: 1 }}
    />

    <Spacing width={12} />

    <FMButton
      variant="primary"
      text="기록 저장"
      onPress={onSavePress}
      loading={saveLoading}
      style={{ flex: 1 }}
    />
  </ButtonRow>
</AnalysisActionButtons>
```

## 3. 컴포넌트 Props/State

### AnalysisResultScreen

```typescript
interface AnalysisResultScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any, 'AnalysisResult'>;
}

interface AnalysisResultScreenState {
  analysisData: {
    id: string;
    timestamp: string;
    overallStatus: 'normal' | 'caution' | 'warning';
    bloodFlow: {
      level: number;
      text: string;
      comment: string;
    };
    color: {
      value: string;
      name: string;
      status: 'normal' | 'caution';
      comment: string;
    };
    aiComment: string;
    recommendations: string[];
    warning?: {
      title: string;
      message: string;
      severity: 'warning' | 'urgent';
    };
  } | null;

  loading: boolean;
  saveLoading: boolean;
  error: Error | null;
}
```

## 4. 이벤트 핸들러

```typescript
// 데이터 로드
const loadAnalysisData = async (analysisId: string) => {
  try {
    setLoading(true);
    const data = await analysisAPI.getAnalysisResult(analysisId);
    setAnalysisData(data);
    analytics.logEvent('analysis_result_viewed', { analysisId });
  } catch (err) {
    setError(err);
    showToast('분석 결과를 불러오는데 실패했습니다', 'error');
  } finally {
    setLoading(false);
  }
};

// 기록 저장
const handleSave = async () => {
  try {
    setSaveLoading(true);

    await healthAPI.saveAnalysisRecord({
      analysisId: analysisData.id,
      date: new Date().toISOString(),
      bloodFlow: analysisData.bloodFlow.level,
      color: analysisData.color.value,
    });

    showToast('기록이 저장되었습니다', 'success');
    analytics.logEvent('analysis_saved');

    navigation.navigate('Home');
  } catch (err) {
    showToast('저장에 실패했습니다', 'error');
  } finally {
    setSaveLoading(false);
  }
};

// 상세 보기
const handleDetailPress = () => {
  navigation.navigate('AnalysisDetail', {
    analysisId: analysisData.id,
  });
  analytics.logEvent('analysis_detail_pressed');
};

// 상담 예약
const handleConsultationPress = () => {
  navigation.navigate('ConsultationSuggest', {
    fromAnalysis: true,
    analysisId: analysisData.id,
  });
  analytics.logEvent('consultation_from_analysis');
};

// 공유
const handleShare = async () => {
  try {
    await Share.share({
      message: `FemCare AI 분석 결과\n${analysisData.timestamp}\n상태: ${getStatusText(analysisData.overallStatus)}`,
    });
    analytics.logEvent('analysis_shared');
  } catch (err) {
    console.error('Share failed:', err);
  }
};
```

## 5. 데이터/API 매핑

### API Service

```typescript
// services/analysisAPI.ts

export class AnalysisAPI {
  async getAnalysisResult(analysisId: string): Promise<AnalysisResult> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analysis/${analysisId}`,
      {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch analysis result');
    }

    const data = await response.json();
    return mapAnalysisResult(data.data);
  }
}

// Mapper
const mapAnalysisResult = (apiData: any): AnalysisResult => {
  return {
    id: apiData.id,
    timestamp: apiData.timestamp,
    overallStatus: apiData.overallStatus,
    bloodFlow: {
      level: apiData.bloodFlow.level,
      text: apiData.bloodFlow.text,
      comment: apiData.bloodFlow.comment,
    },
    color: {
      value: apiData.color.hex,
      name: apiData.color.name,
      status: apiData.color.status,
      comment: apiData.color.comment,
    },
    aiComment: apiData.aiComment,
    recommendations: apiData.recommendations || [],
    warning: apiData.warning ? {
      title: apiData.warning.title,
      message: apiData.warning.message,
      severity: apiData.warning.severity,
    } : undefined,
  };
};
```

### API Response

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
      "hex": "#C41E3A",
      "name": "선홍색",
      "status": "normal",
      "comment": "건강한 색상입니다"
    },
    "aiComment": "정상적인 월경 상태입니다. 규칙적인 주기를 유지하고 있어요.",
    "recommendations": [
      "충분한 수분 섭취를 권장합니다",
      "규칙적인 운동이 도움이 됩니다"
    ],
    "warning": null
  }
}
```

## 6. Validation

```typescript
// 분석 데이터 검증
const validateAnalysisData = (data: any): boolean => {
  if (!data) return false;

  // 필수 필드 확인
  if (!data.id || !data.timestamp || !data.overallStatus) {
    return false;
  }

  // 출혈량 레벨 검증
  if (
    !data.bloodFlow ||
    !Number.isInteger(data.bloodFlow.level) ||
    data.bloodFlow.level < 1 ||
    data.bloodFlow.level > 5
  ) {
    return false;
  }

  // 색상 검증
  if (!data.color || !data.color.hex || !data.color.name) {
    return false;
  }

  return true;
};

// 사용
useEffect(() => {
  if (analysisData && !validateAnalysisData(analysisData)) {
    setError(new Error('유효하지 않은 분석 데이터'));
    analytics.logError('invalid_analysis_data', analysisData);
  }
}, [analysisData]);
```

## 7. 전체 화면 구성

```tsx
export const AnalysisResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { analysisId } = route.params;

  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadAnalysisData(analysisId);
  }, [analysisId]);

  if (loading) {
    return <LoadingView />;
  }

  if (!analysisData) {
    return <ErrorView onRetry={() => loadAnalysisData(analysisId)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavBar
        title="분석 결과"
        onBackPress={() => navigation.goBack()}
        rightButton={
          <IconButton
            icon="share"
            onPress={handleShare}
          />
        }
      />

      <ScrollView>
        <AnalysisStatusCard
          status={analysisData.overallStatus}
          statusText={getStatusText(analysisData.overallStatus)}
          timestamp={analysisData.timestamp}
        />

        <BloodFlowSection
          level={analysisData.bloodFlow.level}
          text={analysisData.bloodFlow.text}
          comparisonText={analysisData.bloodFlow.comment}
        />

        <ColorAnalysisSection
          color={analysisData.color.value}
          colorName={analysisData.color.name}
          status={analysisData.color.status}
          comment={analysisData.color.comment}
        />

        <AICommentBox
          comment={analysisData.aiComment}
          recommendations={analysisData.recommendations}
        />

        {analysisData.warning && (
          <WarningBox
            show={true}
            title={analysisData.warning.title}
            message={analysisData.warning.message}
            severity={analysisData.warning.severity}
            onConsultationPress={handleConsultationPress}
          />
        )}

        <Spacing height={24} />
      </ScrollView>

      <AnalysisActionButtons
        onDetailPress={handleDetailPress}
        onSavePress={handleSave}
        saveLoading={saveLoading}
      />
    </SafeAreaView>
  );
};
```
